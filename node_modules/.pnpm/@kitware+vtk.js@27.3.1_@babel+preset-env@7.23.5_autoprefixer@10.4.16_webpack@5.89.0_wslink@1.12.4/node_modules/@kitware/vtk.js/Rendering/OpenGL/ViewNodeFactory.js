import macro from '../../macros.js';
import vtkViewNodeFactory$1 from '../SceneGraph/ViewNodeFactory.js';

var CLASS_MAPPING = Object.create(null);
function registerOverride(className, fn) {
  CLASS_MAPPING[className] = fn;
} // ----------------------------------------------------------------------------
// vtkOpenGLViewNodeFactory methods
// ----------------------------------------------------------------------------

function vtkOpenGLViewNodeFactory(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkOpenGLViewNodeFactory');
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Static class mapping shared across instances

  model.overrides = CLASS_MAPPING; // Inheritance

  vtkViewNodeFactory$1.extend(publicAPI, model, initialValues); // Object methods

  vtkOpenGLViewNodeFactory(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkOpenGLViewNodeFactory'); // ----------------------------------------------------------------------------

var vtkViewNodeFactory = {
  newInstance: newInstance,
  extend: extend
};

export { vtkViewNodeFactory as default, extend, newInstance, registerOverride };
