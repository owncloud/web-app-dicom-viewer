import macro from '../../macros.js';
import { r as radiansFromDegrees } from '../Core/Math/index.js';

// Global methods
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Static API
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// vtkCone methods
// ----------------------------------------------------------------------------

function vtkCone(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkCone');

  publicAPI.evaluateFunction = function (x) {
    var tanTheta = Math.tan(radiansFromDegrees(model.angle));
    var retVal = x[1] * x[1] + x[2] * x[2] - x[0] * x[0] * tanTheta * tanTheta;
    return retVal;
  };

  publicAPI.evaluateGradient = function (x) {
    var tanTheta = Math.tan(radiansFromDegrees(model.angle));
    var retVal = [-2.0 * x[0] * tanTheta * tanTheta, 2.0 * x[1], 2.0 * x[2]];
    return retVal;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  angle: 15.0
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Object methods

  macro.obj(publicAPI, model);
  macro.setGet(publicAPI, model, ['angle']);
  vtkCone(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkCone'); // ----------------------------------------------------------------------------

var vtkCone$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkCone$1 as default, extend, newInstance };
