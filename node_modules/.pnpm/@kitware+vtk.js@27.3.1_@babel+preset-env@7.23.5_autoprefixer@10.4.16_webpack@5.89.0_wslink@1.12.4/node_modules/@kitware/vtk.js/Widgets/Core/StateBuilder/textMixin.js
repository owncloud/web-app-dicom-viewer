import macro from '../../../macros.js';

var DEFAULT_VALUES = {
  text: 'DefaultText'
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.setGet(publicAPI, model, ['text']);
} // ----------------------------------------------------------------------------

var text = {
  extend: extend
};

export { text as default, extend };
