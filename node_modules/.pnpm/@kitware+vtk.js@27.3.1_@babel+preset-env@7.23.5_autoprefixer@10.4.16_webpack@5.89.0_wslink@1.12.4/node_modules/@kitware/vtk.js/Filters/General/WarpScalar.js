import vtk from '../../vtk.js';
import macro from '../../macros.js';
import vtkPoints from '../../Common/Core/Points.js';

var vtkDebugMacro = macro.vtkDebugMacro,
    vtkErrorMacro = macro.vtkErrorMacro; // ----------------------------------------------------------------------------
// vtkWarpScalar methods
// ----------------------------------------------------------------------------

function vtkWarpScalar(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkWarpScalar');

  publicAPI.requestData = function (inData, outData) {
    // implement requestData
    var input = inData[0];

    if (!input) {
      vtkErrorMacro('Invalid or missing input');
      return 1;
    } // First, copy the input to the output as a starting point
    // output->CopyStructure( input );


    var inPts = input.getPoints();
    var pd = input.getPointData();
    var inNormals = pd.getNormals();
    var inScalars = publicAPI.getInputArrayToProcess(0);

    if (!inPts || !inScalars) {
      vtkDebugMacro('No data to warp', !!inPts, !!inScalars);
      outData[0] = inData[0];
      return 1;
    }

    var numPts = inPts.getNumberOfPoints();
    var pointNormal = null;
    var normal = [0, 0, 1];

    if (inNormals && !model.useNormal) {
      pointNormal = function pointNormal(id, array) {
        return [array.getData()[id * 3], array.getData()[id * 3 + 1], array.getData()[id * 3 + 2]];
      };

      vtkDebugMacro('Using data normals');
    } else if (publicAPI.getXyPlane()) {
      pointNormal = function pointNormal(id, array) {
        return normal;
      };

      vtkDebugMacro('Using x-y plane normal');
    } else {
      pointNormal = function pointNormal(id, array) {
        return model.normal;
      };

      vtkDebugMacro('Using Normal instance variable');
    }

    var newPtsData = new Float32Array(numPts * 3);
    var inPoints = inPts.getData();
    var ptOffset = 0;
    var n = [0, 0, 1];
    var s = 1; // Loop over all points, adjusting locations

    var scalarDataArray = inScalars.getData();
    var nc = inScalars.getNumberOfComponents();

    for (var ptId = 0; ptId < numPts; ++ptId) {
      ptOffset = ptId * 3;
      n = pointNormal(ptId, inNormals);

      if (model.xyPlane) {
        s = inPoints[ptOffset + 2];
      } else {
        // Use component 0 of array if there are multiple components
        s = scalarDataArray[ptId * nc];
      }

      newPtsData[ptOffset] = inPoints[ptOffset] + model.scaleFactor * s * n[0];
      newPtsData[ptOffset + 1] = inPoints[ptOffset + 1] + model.scaleFactor * s * n[1];
      newPtsData[ptOffset + 2] = inPoints[ptOffset + 2] + model.scaleFactor * s * n[2];
    }

    var newDataSet = vtk({
      vtkClass: input.getClassName()
    });
    newDataSet.shallowCopy(input);
    var points = vtkPoints.newInstance();
    points.setData(newPtsData, 3);
    newDataSet.setPoints(points);
    outData[0] = newDataSet;
    return 1;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  scaleFactor: 1,
  useNormal: false,
  normal: [0, 0, 1],
  xyPlane: false
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Make this a VTK object

  macro.obj(publicAPI, model); // Also make it an algorithm with one input and one output

  macro.algo(publicAPI, model, 1, 1); // Generate macros for properties

  macro.setGet(publicAPI, model, ['scaleFactor', 'useNormal', 'xyPlane']);
  macro.setGetArray(publicAPI, model, ['normal'], 3); // Object specific methods

  vtkWarpScalar(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkWarpScalar'); // ----------------------------------------------------------------------------

var vtkWarpScalar$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkWarpScalar$1 as default, extend, newInstance };
