import macro from '../../macros.js';
import vtkViewNode from '../SceneGraph/ViewNode.js';
import { registerOverride } from './ViewNodeFactory.js';

// vtkWebGPUPixelSpaceCallbackMapper methods
// ----------------------------------------------------------------------------

function vtkWebGPUPixelSpaceCallbackMapper(publicAPI, model) {
  model.classHierarchy.push('vtkWebGPUPixelSpaceCallbackMapper');

  publicAPI.opaquePass = function (prepass, renderPass) {
    model.WebGPURenderer = publicAPI.getFirstAncestorOfType('vtkWebGPURenderer');
    model.WebGPURenderWindow = model.WebGPURenderer.getParent();
    var aspectRatio = model.WebGPURenderer.getAspectRatio();
    var camera = model.WebGPURenderer ? model.WebGPURenderer.getRenderable().getActiveCamera() : null;
    var tsize = model.WebGPURenderer.getTiledSizeAndOrigin();
    var texels = null;

    if (model.renderable.getUseZValues()) ;

    model.renderable.invokeCallback(model.renderable.getInputData(), camera, aspectRatio, tsize, texels);
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  vtkViewNode.extend(publicAPI, model, initialValues); // Object methods

  vtkWebGPUPixelSpaceCallbackMapper(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkWebGPUPixelSpaceCallbackMapper'); // ----------------------------------------------------------------------------

var index = {
  newInstance: newInstance,
  extend: extend
}; // Register ourself to WebGPU backend if imported

registerOverride('vtkPixelSpaceCallbackMapper', newInstance);

export { index as default, extend, newInstance };
