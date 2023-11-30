import macro from '../../macros.js';

// vtkCompositeMouseManipulator methods
// ----------------------------------------------------------------------------

function vtkCompositeMouseManipulator(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkCompositeMouseManipulator');

  publicAPI.startInteraction = function () {};

  publicAPI.endInteraction = function () {};

  publicAPI.onButtonDown = function (interactor, renderer, position) {};

  publicAPI.onButtonUp = function (interactor) {};

  publicAPI.onMouseMove = function (interactor, renderer, position) {};

  publicAPI.onStartScroll = function (interactor, renderer, delta) {};

  publicAPI.onScroll = function (interactor, renderer, delta) {};

  publicAPI.onEndScroll = function (interactor) {};

  publicAPI.isDragEnabled = function () {
    return model.dragEnabled;
  };

  publicAPI.isScrollEnabled = function () {
    return model.scrollEnabled;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  button: 1,
  shift: false,
  control: false,
  alt: false,
  dragEnabled: true,
  scrollEnabled: false
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Create get-set macros

  macro.setGet(publicAPI, model, ['button', 'shift', 'control', 'alt']);
  macro.set(publicAPI, model, ['dragEnabled', 'scrollEnabled']); // Object specific methods

  vtkCompositeMouseManipulator(publicAPI, model);
} // ----------------------------------------------------------------------------

var vtkCompositeMouseManipulator$1 = {
  extend: extend
};

export { vtkCompositeMouseManipulator$1 as default, extend };
