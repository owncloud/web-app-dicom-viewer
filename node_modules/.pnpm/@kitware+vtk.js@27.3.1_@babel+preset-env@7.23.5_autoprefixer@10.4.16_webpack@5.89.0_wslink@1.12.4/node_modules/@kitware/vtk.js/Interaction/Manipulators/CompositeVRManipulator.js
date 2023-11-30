import macro from '../../macros.js';
import { Device, Input } from '../../Rendering/Core/RenderWindowInteractor/Constants.js';

// vtkCompositeVRManipulator methods
// ----------------------------------------------------------------------------

function vtkCompositeVRManipulator(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkCompositeVRManipulator');

  publicAPI.onButton3D = function (interactor, renderer, state, device, input, pressed) {};

  publicAPI.onMove3D = function (interactor, renderer, state, device, input, pressed) {};
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {// device: null, // Device.RightController
  // input: null, // Input.TrackPad
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Create get-set macros

  macro.setGet(publicAPI, model, ['device', 'input']); // Object specific methods

  vtkCompositeVRManipulator(publicAPI, model);
} // ----------------------------------------------------------------------------

var vtkCompositeVRManipulator$1 = {
  extend: extend,
  Device: Device,
  Input: Input
};

export { vtkCompositeVRManipulator$1 as default, extend };
