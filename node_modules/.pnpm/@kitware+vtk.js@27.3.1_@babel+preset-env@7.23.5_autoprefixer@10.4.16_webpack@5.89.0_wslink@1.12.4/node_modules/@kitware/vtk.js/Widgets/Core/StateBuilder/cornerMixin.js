import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import macro from '../../../macros.js';

function vtkCornerMixin(publicAPI, model) {
  publicAPI.translate = function (dx, dy, dz) {
    var _publicAPI$getCornerB = publicAPI.getCornerByReference(),
        _publicAPI$getCornerB2 = _slicedToArray(_publicAPI$getCornerB, 3),
        x = _publicAPI$getCornerB2[0],
        y = _publicAPI$getCornerB2[1],
        z = _publicAPI$getCornerB2[2];

    publicAPI.setCorner(x + dx, y + dy, z + dz);
  };
} // ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  corner: [0, 0, 0]
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.setGetArray(publicAPI, model, ['corner'], 3);
  vtkCornerMixin(publicAPI);
} // ----------------------------------------------------------------------------

var corner = {
  extend: extend
};

export { corner as default, extend };
