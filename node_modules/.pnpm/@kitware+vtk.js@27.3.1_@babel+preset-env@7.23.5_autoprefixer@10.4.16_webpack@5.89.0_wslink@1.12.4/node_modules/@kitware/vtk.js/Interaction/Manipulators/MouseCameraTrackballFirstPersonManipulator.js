import macro from '../../macros.js';
import vtkCompositeCameraManipulator from './CompositeCameraManipulator.js';
import vtkCompositeMouseManipulator from './CompositeMouseManipulator.js';

var ANIMATION_REQUESTER = 'vtkMouseCameraTrackballFirstPersonManipulator'; // ----------------------------------------------------------------------------
// vtkMouseCameraTrackballFirstPersonManipulator methods
// ----------------------------------------------------------------------------

function vtkMouseCameraTrackballFirstPersonManipulator(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkMouseCameraTrackballFirstPersonManipulator');
  var internal = {
    interactor: null,
    renderer: null,
    previousPosition: null
  }; //--------------------------------------------------------------------------

  publicAPI.onButtonDown = function (interactor, renderer, position) {
    internal.previousPosition = position;

    if (model.usePointerLock && !interactor.isPointerLocked()) {
      Object.assign(internal, {
        interactor: interactor,
        renderer: renderer
      });
      interactor.requestPointerLock();
      publicAPI.startPointerLockInteraction();
    }
  }; //--------------------------------------------------------------------------


  publicAPI.startPointerLockInteraction = function () {
    var interactor = internal.interactor; // TODO: at some point, this should perhaps be done in
    // RenderWindowInteractor instead of here.
    // We need to hook into mousemove directly for two reasons:
    // 1. We need to keep receiving mouse move events after the mouse button
    //    is released. This is currently not possible with
    //    vtkInteractorStyleManipulator.
    // 2. Since the mouse is stationary in pointer lock mode, we need the
    //    event.movementX and event.movementY info, which are not currently
    //    passed via interactor.onMouseMove.

    document.addEventListener('mousemove', publicAPI.onPointerLockMove);
    var subscription = null;

    var endInteraction = function endInteraction() {
      document.removeEventListener('mousemove', publicAPI.onPointerLockMove);
      subscription.unsubscribe();
    };

    subscription = interactor.onEndPointerLock(endInteraction);
  }; //--------------------------------------------------------------------------


  publicAPI.onPointerLockMove = function (e) {
    var sensitivity = model.sensitivity;
    var yaw = -1 * e.movementX * sensitivity;
    var pitch = -1 * e.movementY * sensitivity;
    publicAPI.moveCamera(yaw, pitch);
  }; //--------------------------------------------------------------------------


  publicAPI.onMouseMove = function (interactor, renderer, position) {
    // This is currently only being called for non pointer lock mode
    if (!position) {
      return;
    }

    var previousPosition = internal.previousPosition;
    var sensitivity = model.sensitivity;
    var yaw = (previousPosition.x - position.x) * sensitivity;
    var pitch = (position.y - previousPosition.y) * sensitivity;
    Object.assign(internal, {
      interactor: interactor,
      renderer: renderer
    });
    publicAPI.moveCamera(yaw, pitch);
    internal.previousPosition = position;
  }; //--------------------------------------------------------------------------


  publicAPI.moveCamera = function (yaw, pitch) {
    var renderer = internal.renderer,
        interactor = internal.interactor;
    var camera = renderer.getActiveCamera(); // We need to pick a number of steps here that is not too few
    // (or the camera will be jittery) and not too many (or the
    // animations will take too long).
    // Perhaps this should be calculated?

    var numSteps = model.numAnimationSteps;
    var yawStep = yaw / numSteps;
    var pitchStep = pitch / numSteps;
    var now = performance.now().toString();
    var animationRequester = "".concat(ANIMATION_REQUESTER, ".").concat(now);
    var curStep = 0;
    var animationSub = null;

    var performStep = function performStep() {
      camera.yaw(yawStep);
      camera.pitch(pitchStep);
      camera.orthogonalizeViewUp();
      curStep += 1;

      if (curStep === numSteps) {
        animationSub.unsubscribe();
        renderer.resetCameraClippingRange();

        if (interactor.getLightFollowCamera()) {
          renderer.updateLightsGeometryToFollowCamera();
        } // This needs to be posted to the event loop so it isn't called
        // in the `handleAnimation` stack, or else the animation will
        // not be canceled.


        var cancelRequest = function cancelRequest() {
          internal.interactor.cancelAnimation(animationRequester);
        };

        setTimeout(cancelRequest, 0);
      }
    };

    interactor.requestAnimation(animationRequester);
    animationSub = interactor.onAnimation(function () {
      return performStep();
    });
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  numAnimationSteps: 5,
  sensitivity: 0.05,
  usePointerLock: true
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  macro.obj(publicAPI, model);
  vtkCompositeCameraManipulator.extend(publicAPI, model, initialValues);
  vtkCompositeMouseManipulator.extend(publicAPI, model, initialValues); // Create get-set macros

  macro.setGet(publicAPI, model, ['numAnimationSteps', 'sensitivity', 'usePointerLock']); // Object specific methods

  vtkMouseCameraTrackballFirstPersonManipulator(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkMouseCameraTrackballFirstPersonManipulator'); // ----------------------------------------------------------------------------

var vtkMouseCameraTrackballFirstPersonManipulator$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkMouseCameraTrackballFirstPersonManipulator$1 as default, extend, newInstance };
