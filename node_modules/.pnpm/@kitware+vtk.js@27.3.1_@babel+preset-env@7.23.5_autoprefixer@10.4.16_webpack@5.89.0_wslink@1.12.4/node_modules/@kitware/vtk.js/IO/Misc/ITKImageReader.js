import macro from '../../macros.js';
import ITKHelper from '../../Common/DataModel/ITKHelper.js';

var convertItkToVtkImage = ITKHelper.convertItkToVtkImage;
var readImageArrayBuffer = null;

var resultPreprocessor = function resultPreprocessor(result) {
  return result;
};

function getArrayName(filename) {
  var idx = filename.lastIndexOf('.');
  var name = idx > -1 ? filename.substring(0, idx) : filename;
  return "Scalars ".concat(name);
}

function setReadImageArrayBufferFromITK(fn) {
  readImageArrayBuffer = fn; // itk.js 9.0.0 introduced breaking changes, which can be detected
  // by an updated function signature.

  if (readImageArrayBuffer.length === 4) {
    // first arg is a webworker if reuse is desired.
    readImageArrayBuffer = function readImageArrayBuffer() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return fn.apply(void 0, [null].concat(args));
    }; // an object is now passed out which includes a webworker which we
    // should terminate


    resultPreprocessor = function resultPreprocessor(_ref) {
      var webWorker = _ref.webWorker,
          image = _ref.image;
      webWorker.terminate();
      return image;
    };
  }
} // ----------------------------------------------------------------------------
// vtkITKImageReader methods
// ----------------------------------------------------------------------------


function vtkITKImageReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkITKImageReader'); // Returns a promise to signal when image is ready

  publicAPI.parseAsArrayBuffer = function (arrayBuffer) {
    if (!arrayBuffer || arrayBuffer === model.rawDataBuffer) {
      return Promise.resolve();
    }

    model.rawDataBuffer = arrayBuffer;
    return readImageArrayBuffer(arrayBuffer, model.fileName).then(resultPreprocessor).then(function (itkImage) {
      var imageData = convertItkToVtkImage(itkImage, {
        scalarArrayName: model.arrayName || getArrayName(model.fileName)
      });
      model.output[0] = imageData;
      publicAPI.modified();
    });
  };

  publicAPI.requestData = function (inData, outData) {
    publicAPI.parseAsArrayBuffer(model.rawDataBuffer, model.fileName);
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  fileName: '',
  // If null/undefined a unique array will be generated
  arrayName: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  macro.algo(publicAPI, model, 0, 1);
  macro.setGet(publicAPI, model, ['fileName', 'arrayName']); // vtkITKImageReader methods

  vtkITKImageReader(publicAPI, model); // Check that ITK function has been injected

  if (!readImageArrayBuffer) {
    console.error("\n      // Dependency needs to be added inside your project\n      import readImageArrayBuffer from 'itk/readImageArrayBuffer';\n      vtkITKImageReader.setReadImageArrayBufferFromITK(readImageArrayBuffer);\n      ");
  }
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkITKImageReader'); // ----------------------------------------------------------------------------

var vtkITKImageReader$1 = {
  newInstance: newInstance,
  extend: extend,
  setReadImageArrayBufferFromITK: setReadImageArrayBufferFromITK
};

export { vtkITKImageReader$1 as default, extend, newInstance };
