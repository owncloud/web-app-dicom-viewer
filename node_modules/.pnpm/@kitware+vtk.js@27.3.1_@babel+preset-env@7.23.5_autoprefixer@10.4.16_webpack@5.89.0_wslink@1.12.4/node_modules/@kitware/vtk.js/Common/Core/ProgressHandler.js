import macro from '../../macros.js';

// vtkProgressHandler methods
// ----------------------------------------------------------------------------

function vtkProgressHandler(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkProgressHandler');

  publicAPI.startWork = function () {
    model.workCount += 1;

    if (model.workCount === 1) {
      publicAPI.invokeChange(true);
    }
  };

  publicAPI.stopWork = function () {
    model.workCount -= 1;

    if (model.workCount === 0) {
      publicAPI.invokeChange(false);
    }
  };

  publicAPI.isWorking = function () {
    return !!model.workCount;
  };

  publicAPI.wrapPromise = function (promise) {
    publicAPI.startWork();
    return new Promise(function (resolve, reject) {
      promise.then(function () {
        publicAPI.stopWork();
        resolve.apply(void 0, arguments);
      }, function (rejectError) {
        publicAPI.stopWork();
        reject(rejectError);
      });
    });
  };

  publicAPI.wrapPromiseFunction = function (fn) {
    return function () {
      return publicAPI.wrapPromise(fn.apply(void 0, arguments));
    };
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  workCount: 0
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Object methods

  macro.obj(publicAPI, model);
  macro.event(publicAPI, model, 'change');
  macro.get(publicAPI, model, ['workCount']); // Object specific methods

  vtkProgressHandler(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkProgressHandler'); // ----------------------------------------------------------------------------

var vtkProgressHandler$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkProgressHandler$1 as default, extend, newInstance };
