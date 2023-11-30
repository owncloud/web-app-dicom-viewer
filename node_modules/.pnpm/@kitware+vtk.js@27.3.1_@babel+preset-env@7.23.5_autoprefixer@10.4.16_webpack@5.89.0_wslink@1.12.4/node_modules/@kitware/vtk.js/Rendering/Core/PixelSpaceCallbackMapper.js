import { mat4, vec3 } from 'gl-matrix';
import macro from '../../macros.js';
import vtkMapper from './Mapper.js';

// vtkPixelSpaceCallbackMapper methods
// ----------------------------------------------------------------------------

function vtkPixelSpaceCallbackMapper(publicAPI, model) {
  model.classHierarchy.push('vtkPixelSpaceCallbackMapper');

  if (!model.callback) {
    model.callback = function () {};
  }

  publicAPI.invokeCallback = function (dataset, camera, aspect, windowSize, depthValues) {
    if (!model.callback) {
      return;
    }

    var matrix = camera.getCompositeProjectionMatrix(aspect, -1, 1);
    mat4.transpose(matrix, matrix);
    var dataPoints = dataset.getPoints();
    var result = new Float64Array(3);
    var width = windowSize.usize;
    var height = windowSize.vsize;
    var hw = width / 2;
    var hh = height / 2;
    var coords = [];

    for (var pidx = 0; pidx < dataPoints.getNumberOfPoints(); pidx += 1) {
      var point = dataPoints.getPoint(pidx);
      vec3.transformMat4(result, point, matrix);
      var coord = [result[0] * hw + hw, result[1] * hh + hh, result[2], 0];

      if (depthValues) {
        var linIdx = Math.floor(coord[1]) * width + Math.floor(coord[0]);
        var idx = linIdx * 4;
        var r = depthValues[idx] / 255;
        var g = depthValues[idx + 1] / 255;
        var z = (r * 256 + g) / 257;
        coord[3] = z * 2 - 1;
      }

      coords.push(coord);
    }

    model.callback(coords, camera, aspect, depthValues, [width, height]);
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  callback: null,
  useZValues: false
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  vtkMapper.extend(publicAPI, model, initialValues);
  macro.setGet(publicAPI, model, ['callback', 'useZValues']); // Object methods

  vtkPixelSpaceCallbackMapper(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkPixelSpaceCallbackMapper'); // ----------------------------------------------------------------------------

var vtkPixelSpaceCallbackMapper$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkPixelSpaceCallbackMapper$1 as default, extend, newInstance };
