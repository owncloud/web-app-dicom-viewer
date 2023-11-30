import macro from '../../macros.js';
import vtkImageData from '../../Common/DataModel/ImageData.js';
import vtkDataArray from '../../Common/Core/DataArray.js';

var vtkErrorMacro = macro.vtkErrorMacro; // ----------------------------------------------------------------------------
// vtkScalarToRGBA methods
// ----------------------------------------------------------------------------

function vtkScalarToRGBA(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkScalarToRGBA');

  publicAPI.requestData = function (inData, outData) {
    // implement requestData
    var input = inData[0];

    if (!input) {
      vtkErrorMacro('Invalid or missing input');
      return;
    }

    var scalars = input.getPointData().getScalars();

    if (!scalars) {
      vtkErrorMacro('No scalars from input');
      return;
    }

    if (!model.lookupTable) {
      vtkErrorMacro('No lookupTable available');
      return;
    }

    if (!model.piecewiseFunction) {
      vtkErrorMacro('No piecewiseFunction available');
      return;
    }

    var rgba = [0, 0, 0, 0];
    var data = scalars.getData();
    var rgbaArray = new Uint8Array(data.length * 4);
    var offset = 0;

    for (var idx = 0; idx < data.length; idx++) {
      var x = data[idx];
      model.lookupTable.getColor(x, rgba);
      rgba[3] = model.piecewiseFunction.getValue(x);
      rgbaArray[offset++] = 255 * rgba[0];
      rgbaArray[offset++] = 255 * rgba[1];
      rgbaArray[offset++] = 255 * rgba[2];
      rgbaArray[offset++] = 255 * rgba[3];
    }

    var colorArray = vtkDataArray.newInstance({
      name: 'rgba',
      numberOfComponents: 4,
      values: rgbaArray
    });
    var datasetDefinition = input.get('extent', 'spacing', 'origin', 'direction');
    var output = vtkImageData.newInstance(datasetDefinition);
    output.getPointData().setScalars(colorArray);
    outData[0] = output;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Make this a VTK object

  macro.obj(publicAPI, model); // Also make it an algorithm with one input and one output

  macro.algo(publicAPI, model, 1, 1);
  macro.setGet(publicAPI, model, ['lookupTable', 'piecewiseFunction']); // Object specific methods

  vtkScalarToRGBA(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkScalarToRGBA'); // ----------------------------------------------------------------------------

var vtkScalarToRGBA$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkScalarToRGBA$1 as default, extend, newInstance };
