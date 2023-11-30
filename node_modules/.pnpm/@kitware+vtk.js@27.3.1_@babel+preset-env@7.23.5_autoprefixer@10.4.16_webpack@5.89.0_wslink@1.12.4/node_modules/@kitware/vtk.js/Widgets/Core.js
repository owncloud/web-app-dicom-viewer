import vtkAbstractWidget from './Core/AbstractWidget.js';
import vtkAbstractWidgetFactory from './Core/AbstractWidgetFactory.js';
import vtkStateBuilder from './Core/StateBuilder.js';
import vtkWidgetManager from './Core/WidgetManager.js';
import vtkWidgetState from './Core/WidgetState.js';

var Core = {
  vtkAbstractWidget: vtkAbstractWidget,
  vtkAbstractWidgetFactory: vtkAbstractWidgetFactory,
  vtkStateBuilder: vtkStateBuilder,
  vtkWidgetManager: vtkWidgetManager,
  vtkWidgetState: vtkWidgetState
};

export { Core as default };
