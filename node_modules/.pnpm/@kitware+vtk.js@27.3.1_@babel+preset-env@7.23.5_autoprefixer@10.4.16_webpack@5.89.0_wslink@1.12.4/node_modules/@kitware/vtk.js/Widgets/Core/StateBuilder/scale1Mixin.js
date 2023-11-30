import macro from '../../../macros.js';

var DEFAULT_VALUES = {
  scale1: 0.5
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.setGet(publicAPI, model, ['scale1']);
} // ----------------------------------------------------------------------------

var scale1 = {
  extend: extend
};

export { scale1 as default, extend };
