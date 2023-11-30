import vtkInteractorStyleImage from './Style/InteractorStyleImage.js';
import vtkInteractorStyleManipulator from './Style/InteractorStyleManipulator.js';
import vtkInteractorStyleMPRSlice from './Style/InteractorStyleMPRSlice.js';
import vtkInteractorStyleRemoteMouse from './Style/InteractorStyleRemoteMouse.js';
import vtkInteractorStyleTrackballCamera from './Style/InteractorStyleTrackballCamera.js';

var Style = {
  vtkInteractorStyleImage: vtkInteractorStyleImage,
  vtkInteractorStyleManipulator: vtkInteractorStyleManipulator,
  vtkInteractorStyleMPRSlice: vtkInteractorStyleMPRSlice,
  vtkInteractorStyleRemoteMouse: vtkInteractorStyleRemoteMouse,
  vtkInteractorStyleTrackballCamera: vtkInteractorStyleTrackballCamera
};

export { Style as default };
