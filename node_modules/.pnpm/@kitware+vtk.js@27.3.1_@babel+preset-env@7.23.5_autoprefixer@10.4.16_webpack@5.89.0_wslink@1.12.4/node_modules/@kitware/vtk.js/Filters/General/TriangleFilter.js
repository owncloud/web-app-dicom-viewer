import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import macro from '../../macros.js';
import vtkPolygon from '../../Common/DataModel/Polygon.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';

var vtkWarningMacro = macro.vtkWarningMacro; // ----------------------------------------------------------------------------
// vtkTriangleFilter methods
// ----------------------------------------------------------------------------

function vtkTriangleFilter(publicAPI, model) {
  // Set our classname
  model.classHierarchy.push('vtkTriangleFilter'); // requestData only supports polys for now.

  publicAPI.requestData = function (inData, outData) {
    var input = inData[0];
    var points = input.getPoints().getData();
    var polys = input.getPolys().getData();
    var cellsDataType = input.getPolys().getDataType();
    var pointsDataType = input.getPoints().getDataType(); // Todo: instantiate TypedArray of the final size

    var newCells = [];
    var newPoints = [];
    model.errorCount = 0;

    if (polys) {
      var npts = 0;
      var isLastPointDuplicated = false;

      for (var c = 0; c < polys.length; c += npts + 1) {
        npts = polys[c]; // If the first point is duplicated at the end of the cell, ignore it

        isLastPointDuplicated = polys[c + 1] === polys[c + npts];

        if (isLastPointDuplicated) {
          --npts;
        } // We can't use cell.map here, it doesn't seems to work properly with Uint32Arrays ...


        var cellPoints = [];
        cellPoints.length = npts;

        for (var i = 0; i < npts; i++) {
          var pointId = polys[c + i + 1];
          cellPoints[i] = [points[3 * pointId], points[3 * pointId + 1], points[3 * pointId + 2]];
        }

        if (npts === 3) {
          var newIdStart = newPoints.length / 3;
          newCells.push(3, newIdStart, newIdStart + 1, newIdStart + 2);
          newPoints.push.apply(newPoints, _toConsumableArray(cellPoints[0]).concat(_toConsumableArray(cellPoints[1]), _toConsumableArray(cellPoints[2])));
        } else if (npts > 3) {
          var polygon = vtkPolygon.newInstance();
          polygon.setPoints(cellPoints);

          if (!polygon.triangulate()) {
            vtkWarningMacro("Triangulation failed at cellOffset ".concat(c));
            ++model.errorCount;
          }

          var newCellPoints = polygon.getPointArray();
          var numSimplices = Math.floor(newCellPoints.length / 9);
          var triPts = [];
          triPts.length = 9;

          for (var _i = 0; _i < numSimplices; _i++) {
            for (var j = 0; j < 9; j++) {
              triPts[j] = newCellPoints[9 * _i + j];
            }

            var _newIdStart = newPoints.length / 3;

            newCells.push(3, _newIdStart, _newIdStart + 1, _newIdStart + 2);
            newPoints.push.apply(newPoints, triPts);
          }
        }

        if (isLastPointDuplicated) {
          ++npts;
        }
      }
    }

    var dataset = vtkPolyData.newInstance();
    dataset.getPoints().setData(macro.newTypedArrayFrom(pointsDataType, newPoints));
    dataset.getPolys().setData(macro.newTypedArrayFrom(cellsDataType, newCells));
    outData[0] = dataset;
  };
} // ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  errorCount: 0
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.setGet(publicAPI, model, []);
  macro.get(publicAPI, model, ['errorCount']); // Make this a VTK object

  macro.obj(publicAPI, model); // Also make it an algorithm with one input and one output

  macro.algo(publicAPI, model, 1, 1); // Object specific methods

  vtkTriangleFilter(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkTriangleFilter'); // ----------------------------------------------------------------------------

var vtkTriangleFilter$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkTriangleFilter$1 as default, extend, newInstance };
