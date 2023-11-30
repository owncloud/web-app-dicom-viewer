import macro from '../../macros.js';
import vtkInteractorStyleManipulator from './InteractorStyleManipulator.js';
import vtkMouseCameraUnicamManipulator from '../Manipulators/MouseCameraUnicamManipulator.js';

// vtkInteractorStyleUnicam methods
// ----------------------------------------------------------------------------

function vtkInteractorStyleUnicam(publicAPI, model) {
  model.classHierarchy.push('vtkInteractorStyleUnicam');
  model.unicamManipulator = vtkMouseCameraUnicamManipulator.newInstance({
    button: 1
  });
  publicAPI.addMouseManipulator(model.unicamManipulator);

  publicAPI.getUseWorldUpVec = function () {
    return model.unicamManipulator.getUseWorldUpVec();
  };

  publicAPI.setUseWorldUpVec = function (useWorldUpVec) {
    model.unicamManipulator.setUseWorldUpVec(useWorldUpVec);
  };

  publicAPI.getWorldUpVec = function () {
    return model.unicamManipulator.getWorldUpVec();
  };

  publicAPI.setWorldUpVec = function (x, y, z) {
    model.unicamManipulator.setWorldUpVec(x, y, z);
  };

  publicAPI.getUseHardwareSelector = function () {
    return model.unicamManipulator.getUseHardwareSelector();
  };

  publicAPI.setUseHardwareSelector = function (useHardwareSelector) {
    model.unicamManipulator.setUseHardwareSelector(useHardwareSelector);
  };

  publicAPI.getFocusSphereColor = function () {
    model.unicamManipulator.getFocusSphereColor();
  };

  publicAPI.setFocusSphereColor = function (r, g, b) {
    model.unicamManipulator.setFocusSphereColor(r, g, b);
  };

  publicAPI.getFocusSphereRadiusFactor = function () {
    return model.unicamManipulator.getFocusSphereRadiusFactor();
  };

  publicAPI.setFocusSphereRadiusFactor = function (focusSphereRadiusFactor) {
    model.unicamManipulator.setFocusSphereRadiusFactor(focusSphereRadiusFactor);
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  vtkInteractorStyleManipulator.extend(publicAPI, model, initialValues); // Object specific methods

  vtkInteractorStyleUnicam(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkInteractorStyleUnicam'); // ----------------------------------------------------------------------------

var index = {
  newInstance: newInstance,
  extend: extend
};

export { index as default, extend, newInstance };
