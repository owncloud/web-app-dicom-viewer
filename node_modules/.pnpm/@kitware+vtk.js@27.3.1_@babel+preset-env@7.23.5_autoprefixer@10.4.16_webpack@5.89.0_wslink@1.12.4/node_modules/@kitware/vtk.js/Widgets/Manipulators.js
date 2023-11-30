import vtkLineManipulator from './Manipulators/LineManipulator.js';
import vtkPlanePointManipulator from './Manipulators/PlaneManipulator.js';
import vtkTrackballManipulator from './Manipulators/TrackballManipulator.js';

var Manipulators = {
  vtkLineManipulator: vtkLineManipulator,
  vtkPlaneManipulator: vtkPlanePointManipulator,
  vtkTrackballManipulator: vtkTrackballManipulator
};

export { Manipulators as default };
