import { mat4 } from 'gl-matrix';
import macro from '../../macros.js';
import vtkViewNode from '../SceneGraph/ViewNode.js';
import { registerOverride } from './ViewNodeFactory.js';

// vtkWebGPUCamera methods
// ----------------------------------------------------------------------------

function vtkWebGPUCamera(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkWebGPUCamera');

  publicAPI.getProjectionMatrix = function (outMat, aspect, cRange, windowCenter) {
    mat4.identity(outMat);

    if (model.renderable.getParallelProjection()) {
      // set up a rectangular parallelipiped
      var parallelScale = model.renderable.getParallelScale();
      var width = parallelScale * aspect;
      var height = parallelScale;
      var xmin = (windowCenter[0] - 1.0) * width;
      var xmax = (windowCenter[0] + 1.0) * width;
      var ymin = (windowCenter[1] - 1.0) * height;
      var ymax = (windowCenter[1] + 1.0) * height;
      var xr = 1.0 / (xmax - xmin);
      var yr = 1.0 / (ymax - ymin);
      outMat[0] = 2.0 * xr;
      outMat[5] = 2.0 * yr;
      outMat[10] = 1.0 / (cRange[1] - cRange[0]);
      outMat[12] = (xmax + xmin) * xr;
      outMat[13] = (ymax + ymin) * yr;
      outMat[14] = cRange[1] / (cRange[1] - cRange[0]);
    } else {
      var tmp = Math.tan(Math.PI * model.renderable.getViewAngle() / 360.0);

      var _width;

      var _height;

      if (model.renderable.getUseHorizontalViewAngle() === true) {
        _width = cRange[0] * tmp;
        _height = cRange[0] * tmp / aspect;
      } else {
        _width = cRange[0] * tmp * aspect;
        _height = cRange[0] * tmp;
      }

      var _xmin = (windowCenter[0] - 1.0) * _width;

      var _xmax = (windowCenter[0] + 1.0) * _width;

      var _ymin = (windowCenter[1] - 1.0) * _height;

      var _ymax = (windowCenter[1] + 1.0) * _height;

      outMat[0] = 2.0 * cRange[0] / (_xmax - _xmin);
      outMat[5] = 2.0 * cRange[0] / (_ymax - _ymin);
      outMat[12] = (_xmin + _xmax) / (_xmax - _xmin);
      outMat[13] = (_ymin + _ymax) / (_ymax - _ymin);
      outMat[10] = 0.0;
      outMat[14] = cRange[0];
      outMat[11] = -1.0;
      outMat[15] = 0.0;
    }
  };

  publicAPI.convertToOpenGLDepth = function (val) {
    if (model.renderable.getParallelProjection()) {
      return 1.0 - val;
    }

    var cRange = model.renderable.getClippingRangeByReference();
    var zval = -cRange[0] / val;
    zval = (cRange[0] + cRange[1]) / (cRange[1] - cRange[0]) + 2.0 * cRange[0] * cRange[1] / (zval * (cRange[1] - cRange[0]));
    return 0.5 * zval + 0.5;
  };

  publicAPI.getKeyMatrices = function (webGPURenderer) {
    // has the camera changed?
    var ren = webGPURenderer.getRenderable();
    var webGPURenderWindow = webGPURenderer.getParent();

    if (Math.max(webGPURenderWindow.getMTime(), publicAPI.getMTime(), ren.getMTime(), model.renderable.getMTime(), webGPURenderer.getStabilizedTime()) > model.keyMatrixTime.getMTime()) {
      var wcvc = model.renderable.getViewMatrix();
      mat4.copy(model.keyMatrices.normalMatrix, wcvc); // zero out translation

      model.keyMatrices.normalMatrix[3] = 0.0;
      model.keyMatrices.normalMatrix[7] = 0.0;
      model.keyMatrices.normalMatrix[11] = 0.0;
      mat4.invert(model.keyMatrices.normalMatrix, model.keyMatrices.normalMatrix);
      mat4.transpose(model.keyMatrices.wcvc, wcvc);
      var center = webGPURenderer.getStabilizedCenterByReference();
      mat4.translate(model.keyMatrices.scvc, model.keyMatrices.wcvc, center);
      var aspectRatio = webGPURenderer.getAspectRatio();
      var cRange = model.renderable.getClippingRangeByReference();
      publicAPI.getProjectionMatrix(model.keyMatrices.vcpc, aspectRatio, cRange, model.renderable.getWindowCenterByReference());
      mat4.multiply(model.keyMatrices.scpc, model.keyMatrices.vcpc, model.keyMatrices.scvc);
      mat4.invert(model.keyMatrices.pcsc, model.keyMatrices.scpc);
      model.keyMatrixTime.modified();
    }

    return model.keyMatrices;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  keyMatrixTime: null,
  keyMatrices: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  vtkViewNode.extend(publicAPI, model, initialValues);
  model.keyMatrixTime = {};
  macro.obj(model.keyMatrixTime); // values always get set by the get method

  model.keyMatrices = {
    normalMatrix: new Float64Array(16),
    vcpc: new Float64Array(16),
    pcsc: new Float64Array(16),
    wcvc: new Float64Array(16),
    scpc: new Float64Array(16),
    scvc: new Float64Array(16)
  }; // Build VTK API

  macro.setGet(publicAPI, model, ['keyMatrixTime']); // Object methods

  vtkWebGPUCamera(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend); // ----------------------------------------------------------------------------

var index = {
  newInstance: newInstance,
  extend: extend
}; // Register ourself to WebGPU backend if imported

registerOverride('vtkCamera', newInstance);

export { index as default, extend, newInstance };
