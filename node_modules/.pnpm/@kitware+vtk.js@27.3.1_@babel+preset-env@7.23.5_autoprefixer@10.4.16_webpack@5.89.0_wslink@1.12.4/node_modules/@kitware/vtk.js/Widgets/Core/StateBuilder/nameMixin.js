import macro from '../../../macros.js';

var DEFAULT_VALUES = {
  name: ''
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.setGet(publicAPI, model, ['name']);
} // ----------------------------------------------------------------------------

var name = {
  extend: extend
};

export { name as default, extend };
