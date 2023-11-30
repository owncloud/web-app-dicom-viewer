import vtkRenderPass from './SceneGraph/RenderPass.js';
import vtkRenderWindowViewNode from './SceneGraph/RenderWindowViewNode.js';
import vtkViewNode from './SceneGraph/ViewNode.js';
import vtkViewNodeFactory from './SceneGraph/ViewNodeFactory.js';

var SceneGraph = {
  vtkRenderPass: vtkRenderPass,
  vtkRenderWindowViewNode: vtkRenderWindowViewNode,
  vtkViewNode: vtkViewNode,
  vtkViewNodeFactory: vtkViewNodeFactory
};

export { SceneGraph as default };
