import macro from '../../macros.js';

// vtkTimeStepBasedAnimationHandlerProxy methods
// ----------------------------------------------------------------------------

function vtkTimeStepBasedAnimationHandlerProxy(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkTimeStepBasedAnimationHandlerProxy'); // Initialization ------------------------------------------------------------

  publicAPI.setTime = function (time) {
    model.handler.setCurrentTimeStep(time);
  };

  publicAPI.getFrames = function () {
    if (!model.handler) {
      return [];
    }

    return model.handler.getTimeSteps();
  };

  publicAPI.setInputAnimationHandler = function (handler) {
    model.handler = handler;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  handler: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.obj(publicAPI, model);
  macro.setGet(publicAPI, model, ['handler']); // Object specific methods

  vtkTimeStepBasedAnimationHandlerProxy(publicAPI, model); // Proxy handling

  macro.proxy(publicAPI, model);
} // ----------------------------------------------------------------------------


var newInstance = macro.newInstance(extend, 'vtkTimeStepBasedAnimationHandlerProxy'); // ----------------------------------------------------------------------------

var index = {
  newInstance: newInstance,
  extend: extend
};

export { index as default, newInstance };
