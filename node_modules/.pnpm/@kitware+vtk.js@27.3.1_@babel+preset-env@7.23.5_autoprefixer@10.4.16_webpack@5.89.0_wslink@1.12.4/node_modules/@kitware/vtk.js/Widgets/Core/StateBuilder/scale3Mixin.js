import macro from '../../../macros.js';

var DEFAULT_VALUES = {
  scale3: [1, 1, 1]
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.setGetArray(publicAPI, model, ['scale3'], 3);
} // ----------------------------------------------------------------------------

var scale3 = {
  extend: extend
};

export { scale3 as default, extend };
