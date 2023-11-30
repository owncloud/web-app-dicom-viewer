import macro from '../../macros.js';
import vtkDataArray from '../../Common/Core/DataArray.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';
import vtkCellArray from '../../Common/Core/CellArray.js';
import DataAccessHelper from '../Core/DataAccessHelper.js';
import '../Core/DataAccessHelper/LiteHttpDataAccessHelper.js';

// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper'; // HTTP + gz
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HtmlDataAccessHelper'; // html + base64 + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/JSZipDataAccessHelper'; // zip
// ----------------------------------------------------------------------------
// vtkElevationReader methods
// ----------------------------------------------------------------------------

function vtkElevationReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkElevationReader'); // Create default dataAccessHelper if not available

  if (!model.dataAccessHelper) {
    model.dataAccessHelper = DataAccessHelper.get('http');
  } // Internal method to fetch Array


  function fetchCSV(url, options) {
    return model.dataAccessHelper.fetchText(publicAPI, url, options);
  } // Set DataSet url


  publicAPI.setUrl = function (url, options) {
    model.url = url; // Fetch metadata

    return publicAPI.loadData(options);
  }; // Fetch the actual data arrays


  publicAPI.loadData = function (options) {
    return fetchCSV(model.url, options).then(function (csv) {
      publicAPI.parseAsText(csv);
      return true;
    });
  };

  publicAPI.parseAsText = function (csv) {
    model.csv = csv;
    model.elevation = []; // Parse data

    var lines = model.csv.split('\n');
    lines.forEach(function (line, lineIdx) {
      model.elevation.push(line.split(',').map(function (str) {
        return Number(str);
      }));
    });
    publicAPI.modified();
  };

  publicAPI.requestData = function (inData, outData) {
    var polydata = vtkPolyData.newInstance();
    polydata.getPoints().setData(new Float32Array(0, 0, 0, 1, 1, 1), 3);

    if (model.elevation) {
      var jSize = model.elevation.length;
      var iSize = model.elevation[0].length; // Handle points and polys

      var points = polydata.getPoints();
      points.setNumberOfPoints(iSize * jSize, 3);
      var pointValues = points.getData();
      var polys = vtkCellArray.newInstance({
        size: 5 * (iSize - 1) * (jSize - 1)
      });
      polydata.setPolys(polys);
      var polysValues = polys.getData();
      var cellOffset = 0; // Texture coords

      var tcData = new Float32Array(iSize * jSize * 2);
      var tcoords = vtkDataArray.newInstance({
        numberOfComponents: 2,
        values: tcData,
        name: 'TextureCoordinates'
      });
      polydata.getPointData().setTCoords(tcoords);

      for (var j = 0; j < jSize; j++) {
        for (var i = 0; i < iSize; i++) {
          var offsetIdx = j * iSize + i;
          var offsetPt = 3 * offsetIdx; // Fill points coordinates

          pointValues[offsetPt + 0] = model.origin[0] + i * model.xSpacing * model.xDirection;
          pointValues[offsetPt + 1] = model.origin[1] + j * model.ySpacing * model.yDirection;
          pointValues[offsetPt + 2] = model.origin[2] + model.elevation[j][i] * model.zScaling; // fill in tcoords

          tcData[offsetIdx * 2] = i / (iSize - 1.0);
          tcData[offsetIdx * 2 + 1] = 1.0 - j / (jSize - 1.0); // Fill polys

          if (i > 0 && j > 0) {
            polysValues[cellOffset++] = 4;
            polysValues[cellOffset++] = offsetIdx;
            polysValues[cellOffset++] = offsetIdx - 1;
            polysValues[cellOffset++] = offsetIdx - 1 - iSize;
            polysValues[cellOffset++] = offsetIdx - iSize;
          }
        }
      }
    }

    model.output[0] = polydata;
  }; // return Busy state


  publicAPI.isBusy = function () {
    return !!model.requestCount;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  origin: [0, 0, 0],
  xSpacing: 1,
  ySpacing: 1,
  zScaling: 1,
  xDirection: 1,
  yDirection: -1,
  requestCount: 0 // dataAccessHelper: null,
  // url: null,

}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['url']);
  macro.setGet(publicAPI, model, ['dataAccessHelper', 'xSpacing', 'ySpacing', 'zScaling', 'xDirection', 'yDirection']);
  macro.algo(publicAPI, model, 0, 1);
  macro.event(publicAPI, model, 'busy'); // Object methods

  vtkElevationReader(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkElevationReader'); // ----------------------------------------------------------------------------

var vtkElevationReader$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkElevationReader$1 as default, extend, newInstance };
