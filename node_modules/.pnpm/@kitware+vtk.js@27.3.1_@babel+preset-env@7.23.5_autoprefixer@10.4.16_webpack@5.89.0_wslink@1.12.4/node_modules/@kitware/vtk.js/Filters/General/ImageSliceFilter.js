import macro from '../../macros.js';
import vtkImageData from '../../Common/DataModel/ImageData.js';
import vtkDataArray from '../../Common/Core/DataArray.js';

var vtkErrorMacro = macro.vtkErrorMacro; // ----------------------------------------------------------------------------
// vtkImageSliceFilter methods
// ----------------------------------------------------------------------------

function vtkImageSliceFilter(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkImageSliceFilter');

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

    var datasetDefinition = input.get('extent', 'spacing', 'origin');
    datasetDefinition.extent[4] = model.sliceIndex;
    datasetDefinition.extent[5] = datasetDefinition.extent[4];
    var numberOfComponents = scalars.getNumberOfComponents();
    var sliceSize = (datasetDefinition.extent[1] - datasetDefinition.extent[0] + 1) * (datasetDefinition.extent[3] - datasetDefinition.extent[2] + 1) * numberOfComponents;
    var offset = sliceSize * model.sliceIndex;
    var sliceRawArray = scalars.getData().slice(offset, offset + sliceSize);
    var sliceArray = vtkDataArray.newInstance({
      name: scalars.getName(),
      numberOfComponents: numberOfComponents,
      values: sliceRawArray
    });
    var output = vtkImageData.newInstance(datasetDefinition);
    output.getPointData().setScalars(sliceArray);
    outData[0] = output;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  sliceIndex: 0
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Make this a VTK object

  macro.obj(publicAPI, model); // Also make it an algorithm with one input and one output

  macro.algo(publicAPI, model, 1, 1);
  macro.setGet(publicAPI, model, ['sliceIndex', 'orientation']); // Object specific methods

  vtkImageSliceFilter(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkImageSliceFilter'); // ----------------------------------------------------------------------------

var vtkImageSliceFilter$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkImageSliceFilter$1 as default, extend, newInstance };
