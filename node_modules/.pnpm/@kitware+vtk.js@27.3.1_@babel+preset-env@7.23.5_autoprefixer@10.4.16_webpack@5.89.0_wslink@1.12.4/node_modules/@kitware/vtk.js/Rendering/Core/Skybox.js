import macro from '../../macros.js';
import vtkActor from './Actor.js';

// vtkSkybox methods
// ----------------------------------------------------------------------------

function vtkSkybox(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkSkybox');

  publicAPI.getIsOpaque = function () {
    return true;
  };

  publicAPI.hasTranslucentPolygonalGeometry = function () {
    return false;
  };

  publicAPI.getSupportsSelection = function () {
    return false;
  };
} // ----------------------------------------------------------------------------
// Object fSkyboxy
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  format: 'box'
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  vtkActor.extend(publicAPI, model, initialValues); // Build VTK API

  macro.setGet(publicAPI, model, ['format' // can be box or background, in the future sphere, floor as well
  ]); // Object methods

  vtkSkybox(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkSkybox'); // ----------------------------------------------------------------------------

var vtkSkybox$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkSkybox$1 as default, extend, newInstance };
