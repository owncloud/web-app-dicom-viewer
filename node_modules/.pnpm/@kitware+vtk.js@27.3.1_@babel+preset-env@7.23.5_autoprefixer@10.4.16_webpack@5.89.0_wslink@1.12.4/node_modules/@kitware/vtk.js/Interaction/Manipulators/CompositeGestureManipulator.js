import macro from '../../macros.js';

// vtkCompositeMouseManipulator methods
// ----------------------------------------------------------------------------

function vtkCompositeGestureManipulator(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkCompositeGestureManipulator');

  publicAPI.startInteraction = function () {};

  publicAPI.endInteraction = function () {};

  publicAPI.onStartPinch = function (interactor, scale) {};

  publicAPI.onStartRotate = function (interactor, rotation) {};

  publicAPI.onStartPan = function (interactor, translation) {};

  publicAPI.onPinch = function (interactor, renderer, scale) {};

  publicAPI.onRotate = function (interactor, renderer, rotation) {};

  publicAPI.onPan = function (interactor, renderer, translation) {};

  publicAPI.onEndPinch = function (interactor) {};

  publicAPI.onEndRotate = function (interactor) {};

  publicAPI.onEndPan = function (interactor) {};

  publicAPI.isPinchEnabled = function () {
    return model.pinchEnabled;
  };

  publicAPI.isPanEnabled = function () {
    return model.panEnabled;
  };

  publicAPI.isRotateEnabled = function () {
    return model.rotateEnabled;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  pinchEnabled: true,
  panEnabled: true,
  rotateEnabled: true
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Create get-set macros

  macro.set(publicAPI, model, ['pinchEnabled', 'panEnabled', 'rotateEnabled']);
  macro.setGet(publicAPI, model, ['interactorStyle']); // Object specific methods

  vtkCompositeGestureManipulator(publicAPI, model);
} // ----------------------------------------------------------------------------

var vtkCompositeGestureManipulator$1 = {
  extend: extend
};

export { vtkCompositeGestureManipulator$1 as default, extend };
