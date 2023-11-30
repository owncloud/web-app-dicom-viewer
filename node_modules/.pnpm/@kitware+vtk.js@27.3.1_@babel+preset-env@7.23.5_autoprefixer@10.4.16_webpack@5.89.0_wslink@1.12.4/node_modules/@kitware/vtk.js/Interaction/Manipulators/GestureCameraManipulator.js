import macro from '../../macros.js';
import vtkCompositeCameraManipulator from './CompositeCameraManipulator.js';
import vtkCompositeGestureManipulator from './CompositeGestureManipulator.js';
import vtkInteractorStyleManipulator from '../Style/InteractorStyleManipulator.js';

// vtkGestureCameraManipulator methods
// ----------------------------------------------------------------------------

function vtkGestureCameraManipulator(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkGestureCameraManipulator'); //--------------------------------------------------------------------------

  publicAPI.onStartPinch = function (interactor, scale) {
    model.previousScale = scale;
  }; //---------------------------------------------------------------------------


  publicAPI.onStartRotate = function (interactor, rotation) {
    model.previousRotation = rotation;
  }; //---------------------------------------------------------------------------


  publicAPI.onStartPan = function (interactor, translation) {
    model.previousTranslation = translation;
  }; //---------------------------------------------------------------------------


  publicAPI.onPinch = function (interactor, renderer, scale) {
    vtkInteractorStyleManipulator.dollyByFactor(interactor, renderer, scale / model.previousScale);
    model.previousScale = scale;
  }; //---------------------------------------------------------------------------


  publicAPI.onPan = function (interactor, renderer, translation) {
    var camera = renderer.getActiveCamera();
    var style = interactor.getInteractorStyle(); // Calculate the focal depth since we'll be using it a lot

    var viewFocus = camera.getFocalPoint();
    viewFocus = style.computeWorldToDisplay(renderer, viewFocus[0], viewFocus[1], viewFocus[2]);
    var focalDepth = viewFocus[2];
    var trans = translation;
    var lastTrans = model.previousTranslation;
    var newPickPoint = style.computeDisplayToWorld(renderer, viewFocus[0] + trans[0] - lastTrans[0], viewFocus[1] + trans[1] - lastTrans[1], focalDepth); // Has to recalc old mouse point since the viewport has moved,
    // so can't move it outside the loop

    var oldPickPoint = style.computeDisplayToWorld(renderer, viewFocus[0], viewFocus[1], focalDepth); // Camera motion is reversed

    var motionVector = [];
    motionVector[0] = oldPickPoint[0] - newPickPoint[0];
    motionVector[1] = oldPickPoint[1] - newPickPoint[1];
    motionVector[2] = oldPickPoint[2] - newPickPoint[2];
    viewFocus = camera.getFocalPoint();
    var viewPoint = camera.getPosition();
    camera.setFocalPoint(motionVector[0] + viewFocus[0], motionVector[1] + viewFocus[1], motionVector[2] + viewFocus[2]);
    camera.setPosition(motionVector[0] + viewPoint[0], motionVector[1] + viewPoint[1], motionVector[2] + viewPoint[2]);

    if (interactor.getLightFollowCamera()) {
      renderer.updateLightsGeometryToFollowCamera();
    }

    camera.orthogonalizeViewUp();
    model.previousTranslation = translation;
  }; //---------------------------------------------------------------------------


  publicAPI.onRotate = function (interactor, renderer, rotation) {
    var camera = renderer.getActiveCamera();
    camera.roll(rotation - model.previousRotation);
    camera.orthogonalizeViewUp();
    model.previousRotation = rotation;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  macro.obj(publicAPI, model);
  vtkCompositeGestureManipulator.extend(publicAPI, model, initialValues);
  vtkCompositeCameraManipulator.extend(publicAPI, model, initialValues); // Object specific methods

  vtkGestureCameraManipulator(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkGestureCameraManipulator'); // ----------------------------------------------------------------------------

var vtkGestureCameraManipulator$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkGestureCameraManipulator$1 as default, extend, newInstance };
