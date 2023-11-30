import macro from '../../macros.js';
import vtk from '../../vtk.js';

var readPolyDataArrayBuffer = null;

var resultPreprocessor = function resultPreprocessor(result) {
  return result;
};

function setReadPolyDataArrayBufferFromITK(fn) {
  readPolyDataArrayBuffer = fn; // first arg is a webworker if reuse is desired.

  readPolyDataArrayBuffer = function readPolyDataArrayBuffer() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return fn.apply(void 0, [null].concat(args));
  }; // an object is now passed out which includes a webworker which we
  // should terminate


  resultPreprocessor = function resultPreprocessor(_ref) {
    var webWorker = _ref.webWorker,
        polyData = _ref.polyData;
    webWorker.terminate();
    return polyData;
  };
} // ----------------------------------------------------------------------------
// vtkITKPolyDataReader methods
// ----------------------------------------------------------------------------


function vtkITKPolyDataReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkITKPolyDataReader'); // Returns a promise to signal when polyData is ready

  publicAPI.parseAsArrayBuffer = function (arrayBuffer) {
    if (!arrayBuffer || arrayBuffer === model.rawDataBuffer) {
      return Promise.resolve();
    }

    model.rawDataBuffer = arrayBuffer;
    return readPolyDataArrayBuffer(arrayBuffer, model.fileName).then(resultPreprocessor).then(function (polyData) {
      model.output[0] = vtk(polyData);
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
  macro.setGet(publicAPI, model, ['fileName', 'arrayName']); // vtkITKPolyDataReader methods

  vtkITKPolyDataReader(publicAPI, model); // Check that ITK function has been injected

  if (!readPolyDataArrayBuffer) {
    console.error("\n      // Dependency needs to be added inside your project\n      import readPolyDataArrayBuffer from 'itk/readPolyDataArrayBuffer';\n      vtkITKPolyDataReader.setReadPolyDataArrayBufferFromITK(readPolyDataArrayBuffer);\n      ");
  }
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkITKPolyDataReader'); // ----------------------------------------------------------------------------

var vtkITKPolyDataReader$1 = {
  newInstance: newInstance,
  extend: extend,
  setReadPolyDataArrayBufferFromITK: setReadPolyDataArrayBufferFromITK
};

export { vtkITKPolyDataReader$1 as default, extend, newInstance };
