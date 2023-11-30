import macro from '../../macros.js';

var vtkErrorMacro = macro.vtkErrorMacro; // ----------------------------------------------------------------------------
// vtkSpline1D methods
// ----------------------------------------------------------------------------

function vtkSpline1D(publicAPI, model) {
  // Set our classname
  model.classHierarchy.push('vtkSpline1D'); // --------------------------------------------------------------------------

  publicAPI.computeCloseCoefficients = function (size, work, x, y) {
    vtkErrorMacro("".concat(model.classHierarchy.slice(-1)[0], " should implement computeCloseCoefficients"));
  }; // --------------------------------------------------------------------------


  publicAPI.computeOpenCoefficients = function (size, work, x, y) {
    vtkErrorMacro("".concat(model.classHierarchy.slice(-1)[0], " should implement computeOpenCoefficients"));
  }; // --------------------------------------------------------------------------


  publicAPI.getValue = function (intervalIndex, t) {
    vtkErrorMacro("".concat(model.classHierarchy.slice(-1)[0], " should implement getValue"));
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  vtkSpline1D(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkSpline1D'); // ----------------------------------------------------------------------------

var vtkSpline1D$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkSpline1D$1 as default, extend, newInstance };
