import macro from '../../macros.js';

var vtkErrorMacro = macro.vtkErrorMacro; // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// TODO:
// - Support image stack
// - Support slice orientation (see stack?)
// - may need some data conversion
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ----------------------------------------------------------------------------
// vtkImageDataToCornerstoneImage methods
// ----------------------------------------------------------------------------

function vtkImageDataToCornerstoneImage(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkImageDataToCornerstoneImage');

  publicAPI.requestData = function (inData, outData) {
    // implement requestData
    var input = inData[0];

    if (!input) {
      vtkErrorMacro('Invalid or missing input');
      return;
    } // Retrieve output and volume data
    // const origin = input.getOrigin();


    var spacing = input.getSpacing();
    var dims = input.getDimensions();
    var scalars = input.getPointData().getScalars();
    var dataRange = scalars.getRange(0);
    var rawData = scalars.getData(); // FIXME probably need to expand to RGBA

    var pixelData = null;

    if (dims[2] === 1) {
      pixelData = !scalars.data ? rawData : scalars.data;
    } else {
      var offset = model.sliceIndex * dims[0] * dims[1] * rawData.BYTES_PER_ELEMENT;
      pixelData = macro.newTypedArray(scalars.getDataType(), rawData.buffer, offset, dims[0] * dims[1]);
    }

    var cornerstoneImage = {
      imageId: model.imageId,
      color: scalars.getNumberOfComponents() > 1,
      columnPixelSpacing: spacing[0],
      columns: dims[0],
      width: dims[0],
      rowPixelSpacing: spacing[1],
      rows: dims[1],
      height: dims[1],
      intercept: 0,
      invert: false,
      minPixelValue: dataRange[0],
      maxPixelValue: dataRange[1],
      sizeInBytes: pixelData.length * pixelData.BYTES_PER_ELEMENT,
      slope: 1,
      windowCenter: Math.round((dataRange[0] + dataRange[1]) / 2),
      windowWidth: dataRange[1] - dataRange[0],
      decodeTimeInMS: 0,
      getPixelData: function getPixelData() {
        return pixelData;
      }
    };
    outData[0] = cornerstoneImage;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  imageId: 'default-image-id',
  sliceIndex: 0
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Make this a VTK object

  macro.obj(publicAPI, model); // Also make it an algorithm with one input and one output

  macro.algo(publicAPI, model, 1, 1);
  macro.setGet(publicAPI, model, ['imageId', 'sliceIndex']); // Object specific methods

  macro.algo(publicAPI, model, 1, 1);
  vtkImageDataToCornerstoneImage(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkImageDataToCornerstoneImage'); // ----------------------------------------------------------------------------

var vtkImageDataToCornerstoneImage$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkImageDataToCornerstoneImage$1 as default, extend, newInstance };
