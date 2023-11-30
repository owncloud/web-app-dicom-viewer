import macro from '../../macros.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';
import DataAccessHelper from '../Core/DataAccessHelper.js';
import '../Core/DataAccessHelper/LiteHttpDataAccessHelper.js';

// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper'; // HTTP + gz
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HtmlDataAccessHelper'; // html + base64 + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/JSZipDataAccessHelper'; // zip
// ----------------------------------------------------------------------------
// vtkElevationReader methods
// ----------------------------------------------------------------------------

function vtkJSONNucleoReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkJSONNucleoReader'); // Create default dataAccessHelper if not available

  if (!model.dataAccessHelper) {
    model.dataAccessHelper = DataAccessHelper.get('http');
  } // Internal method to fetch Array


  function fetchText(url, options) {
    return model.dataAccessHelper.fetchText(publicAPI, url, options);
  } // Set DataSet url


  publicAPI.setUrl = function (url, options) {
    model.url = url; // Fetch metadata

    return publicAPI.loadData(options);
  }; // Fetch the actual data arrays


  publicAPI.loadData = function (options) {
    return fetchText(model.url, options).then(function (csv) {
      publicAPI.parseAsText(csv);
      return true;
    });
  };

  publicAPI.parseAsText = function (jsonAsTxt) {
    var _JSON$parse = JSON.parse(jsonAsTxt),
        vertices = _JSON$parse.vertices,
        indices = _JSON$parse.indices;

    var nbIndices = indices.length;
    var nbTriangles = nbIndices / 3;
    var nbCellsValues = nbTriangles + nbIndices;
    model.points = Float32Array.from(vertices);
    model.polys = nbCellsValues < 65535 ? new Uint16Array(nbCellsValues) : new Uint32Array(nbCellsValues);
    var srcOffset = 0;
    var destOffset = 0;

    while (destOffset < model.polys.length) {
      model.polys[destOffset++] = 3;
      model.polys[destOffset++] = indices[srcOffset++];
      model.polys[destOffset++] = indices[srcOffset++];
      model.polys[destOffset++] = indices[srcOffset++];
    }

    publicAPI.modified();
  };

  publicAPI.requestData = function (inData, outData) {
    var polydata = vtkPolyData.newInstance();
    polydata.getPoints().setData(model.points, 3);
    polydata.getPolys().setData(model.polys);
    model.output[0] = polydata;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {// dataAccessHelper: null,
  // url: null,
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['url']);
  macro.setGet(publicAPI, model, ['dataAccessHelper']);
  macro.algo(publicAPI, model, 0, 1); // Object methods

  vtkJSONNucleoReader(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkJSONNucleoReader'); // ----------------------------------------------------------------------------

var vtkJSONNucleoReader$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkJSONNucleoReader$1 as default, extend, newInstance };
