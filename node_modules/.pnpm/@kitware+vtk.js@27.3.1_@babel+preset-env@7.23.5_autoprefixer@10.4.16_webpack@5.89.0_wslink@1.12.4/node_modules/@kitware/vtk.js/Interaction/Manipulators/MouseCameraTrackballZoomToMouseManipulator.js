import macro from '../../macros.js';
import vtkInteractorStyleManipulator from '../Style/InteractorStyleManipulator.js';
import vtkMouseCameraTrackballZoomManipulator from './MouseCameraTrackballZoomManipulator.js';

// vtkMouseCameraTrackballZoomToMouseManipulator methods
// ----------------------------------------------------------------------------

function vtkMouseCameraTrackballZoomToMouseManipulator(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkMouseCameraTrackballZoomToMouseManipulator');
  var superOnButtonDown = publicAPI.onButtonDown;

  publicAPI.onButtonDown = function (interactor, renderer, position) {
    superOnButtonDown(interactor, renderer, position);
    model.zoomPosition = position;
  };

  publicAPI.onMouseMove = function (interactor, renderer, position) {
    if (!position) {
      return;
    }

    var dy = model.previousPosition.y - position.y;
    var k = dy * model.zoomScale;
    vtkInteractorStyleManipulator.dollyToPosition(1.0 - k, model.zoomPosition, renderer, interactor);

    if (interactor.getLightFollowCamera()) {
      renderer.updateLightsGeometryToFollowCamera();
    }

    model.previousPosition = position;
  };

  publicAPI.onScroll = function (interactor, renderer, delta, position) {
    if (!delta || !position) {
      return;
    }

    var dyf = 1 - delta * 0.1;
    vtkInteractorStyleManipulator.dollyToPosition(dyf, position, renderer, interactor);

    if (interactor.getLightFollowCamera()) {
      renderer.updateLightsGeometryToFollowCamera();
    }
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  zoomPosition: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  vtkMouseCameraTrackballZoomManipulator.extend(publicAPI, model, initialValues); // Object specific methods

  vtkMouseCameraTrackballZoomToMouseManipulator(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkMouseCameraTrackballZoomToMouseManipulator'); // ----------------------------------------------------------------------------

var vtkMouseCameraTrackballZoomToMouseManipulator$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkMouseCameraTrackballZoomToMouseManipulator$1 as default, extend, newInstance };
