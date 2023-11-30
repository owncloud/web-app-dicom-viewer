import macro from '../../../macros.js';

var DEFAULT_VALUES = {
  shape: ''
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.setGet(publicAPI, model, ['shape']);
} // ----------------------------------------------------------------------------

var shape = {
  extend: extend
};

export { shape as default, extend };
