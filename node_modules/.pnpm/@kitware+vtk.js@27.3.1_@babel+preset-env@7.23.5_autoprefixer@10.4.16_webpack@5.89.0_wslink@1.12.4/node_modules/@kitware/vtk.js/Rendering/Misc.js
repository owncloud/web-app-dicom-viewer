import vtkCanvasView from './Misc/CanvasView.js';
import vtkFullScreenRenderWindow from './Misc/FullScreenRenderWindow.js';
import vtkGenericRenderWindow from './Misc/GenericRenderWindow.js';
import vtkRemoteView from './Misc/RemoteView.js';
import vtkRenderWindowWithControlBar from './Misc/RenderWindowWithControlBar.js';
import vtkSynchronizableRenderWindow from './Misc/SynchronizableRenderWindow.js';
import vtkTextureLODsDownloader from './Misc/TextureLODsDownloader.js';

var Misc = {
  vtkCanvasView: vtkCanvasView,
  vtkFullScreenRenderWindow: vtkFullScreenRenderWindow,
  vtkGenericRenderWindow: vtkGenericRenderWindow,
  vtkRemoteView: vtkRemoteView,
  vtkRenderWindowWithControlBar: vtkRenderWindowWithControlBar,
  vtkSynchronizableRenderWindow: vtkSynchronizableRenderWindow,
  vtkTextureLODsDownloader: vtkTextureLODsDownloader
};

export { Misc as default };
