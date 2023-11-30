// ----------------------------------------------------------------------------
// vtkCompositeKeyboardManipulator methods
// ----------------------------------------------------------------------------
function vtkCompositeKeyboardManipulator(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkCompositeKeyboardManipulator');

  publicAPI.onKeyPress = function (interactor, renderer, key) {};

  publicAPI.onKeyDown = function (interactor, renderer, key) {};

  publicAPI.onKeyUp = function (interactor, renderer, key) {};
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Object specific methods

  vtkCompositeKeyboardManipulator(publicAPI, model);
} // ----------------------------------------------------------------------------

var vtkCompositeKeyboardManipulator$1 = {
  extend: extend
};

export { vtkCompositeKeyboardManipulator$1 as default, extend };
