import vtkAbstractRepresentationProxy from './Core/AbstractRepresentationProxy.js';
import vtkLookupTableProxy from './Core/LookupTableProxy.js';
import vtkPiecewiseFunctionProxy from './Core/PiecewiseFunctionProxy.js';
import vtkProxyManager from './Core/ProxyManager.js';
import vtkSourceProxy from './Core/SourceProxy.js';
import vtkView2DProxy from './Core/View2DProxy.js';
import vtkViewProxy from './Core/ViewProxy.js';

var Core = {
  vtkAbstractRepresentationProxy: vtkAbstractRepresentationProxy,
  vtkLookupTableProxy: vtkLookupTableProxy,
  vtkPiecewiseFunctionProxy: vtkPiecewiseFunctionProxy,
  vtkProxyManager: vtkProxyManager,
  vtkSourceProxy: vtkSourceProxy,
  vtkView2DProxy: vtkView2DProxy,
  vtkViewProxy: vtkViewProxy
};

export { Core as default };
