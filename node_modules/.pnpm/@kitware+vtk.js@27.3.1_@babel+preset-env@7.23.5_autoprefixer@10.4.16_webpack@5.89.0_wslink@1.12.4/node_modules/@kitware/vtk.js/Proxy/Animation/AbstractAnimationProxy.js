import macro from '../../macros.js';

// vtkAbstractAnimationProxy methods
// ----------------------------------------------------------------------------

function vtkAbstractAnimationProxy(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkAbstractAnimationProxy'); // Initialization ------------------------------------------------------------

  publicAPI.setTime = function (time) {};

  publicAPI.getFrames = function () {
    return [];
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.obj(publicAPI, model); // Object specific methods

  vtkAbstractAnimationProxy(publicAPI, model); // Proxy handling

  macro.proxy(publicAPI, model);
} // ----------------------------------------------------------------------------


var newInstance = macro.newInstance(extend, 'vtkAbstractAnimationProxy'); // ----------------------------------------------------------------------------

var index = {
  newInstance: newInstance,
  extend: extend
};

export { index as default, newInstance };
