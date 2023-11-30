import vtkAbstractImageInterpolator from './Core/AbstractImageInterpolator.js';
import vtkImageInterpolator from './Core/ImageInterpolator.js';
import vtkImagePointDataIterator from './Core/ImagePointDataIterator.js';
import vtkImageReslice from './Core/ImageReslice.js';

var Core = {
  vtkAbstractImageInterpolator: vtkAbstractImageInterpolator,
  vtkImageInterpolator: vtkImageInterpolator,
  vtkImagePointDataIterator: vtkImagePointDataIterator,
  vtkImageReslice: vtkImageReslice
};

export { Core as default };
