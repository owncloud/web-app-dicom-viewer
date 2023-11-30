import macro from '../../../macros.js';
import vtkMatrixBuilder from '../../../Common/Core/MatrixBuilder.js';

function vtkDirectionMixin(publicAPI, model) {
  var transform = model.angleUnit === 'degree' ? vtkMatrixBuilder.buildFromDegree() : vtkMatrixBuilder.buildFromRadian();

  publicAPI.rotateFromDirections = function (originDirection, targetDirection) {
    transform.identity().rotateFromDirections(originDirection, targetDirection).apply(model.direction);
    publicAPI.modified();
  };

  publicAPI.rotate = function (angle, axis) {
    transform.identity().rotate(angle, axis).apply(model.direction);
  };

  publicAPI.rotateX = function (angle) {
    transform.identity().rotateX(angle).apply(model.direction);
  };

  publicAPI.rotateY = function (angle) {
    transform.identity().rotateY(angle).apply(model.direction);
  };

  publicAPI.rotateZ = function (angle) {
    transform.identity().rotateZ(angle).apply(model.direction);
  };
} // ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  direction: [1, 0, 0]
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.setGetArray(publicAPI, model, ['direction'], 3);
  vtkDirectionMixin(publicAPI, model);
} // ----------------------------------------------------------------------------

var direction = {
  extend: extend
};

export { direction as default, extend };
