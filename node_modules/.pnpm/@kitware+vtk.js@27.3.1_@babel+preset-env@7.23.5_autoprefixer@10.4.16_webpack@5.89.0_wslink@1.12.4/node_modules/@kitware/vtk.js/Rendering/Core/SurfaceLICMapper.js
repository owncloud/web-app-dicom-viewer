import macro from '../../macros.js';
import vtkMapper from './Mapper.js';
import vtkSurfaceLICInterface from './SurfaceLICInterface.js';

// vtkSurfaceLICMapper methods
// ----------------------------------------------------------------------------

function vtkSurfaceLICMapper(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkSurfaceLICMapper');

  publicAPI.getLicInterface = function () {
    if (!model.licInterface) {
      model.licInterface = vtkSurfaceLICInterface.newInstance();
    }

    return model.licInterface;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  licInterface: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  vtkMapper.extend(publicAPI, model, initialValues);
  macro.set(publicAPI, model, ['licInterface']); // Object methods

  vtkSurfaceLICMapper(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkSurfaceLICMapper'); // ----------------------------------------------------------------------------

var index = {
  newInstance: newInstance,
  extend: extend
};

export { index as default, extend, newInstance };
