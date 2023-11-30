import macro from '../../../macros.js';

var DEFAULT_VALUES = {
  visible: true
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.setGet(publicAPI, model, ['visible']);
  publicAPI.isVisible = publicAPI.getVisible;
} // ----------------------------------------------------------------------------

var visible = {
  extend: extend
};

export { visible as default, extend };
