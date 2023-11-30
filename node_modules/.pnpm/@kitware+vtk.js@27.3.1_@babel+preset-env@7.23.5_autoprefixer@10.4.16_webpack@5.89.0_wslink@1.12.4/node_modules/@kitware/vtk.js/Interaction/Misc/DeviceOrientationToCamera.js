var listeners = [];
var orientation = {
  device: {},
  screen: window.orientation || 0,
  supported: !!window.DeviceMotionEvent,
  update: false
};
var SCREEN_ORIENTATION_MAP = {
  'landscape-primary': 90,
  'landscape-secondary': -90,
  'portrait-secondary': 180,
  'portrait-primary': 0
};

function isEventValid(evt) {
  return Number.isFinite(evt.alpha);
}

function onDeviceOrientationChangeEvent(evt) {
  orientation.device = evt;

  if (!Number.isFinite(evt.alpha)) {
    orientation.supported = false;
  }
}

function onScreenOrientationChangeEvent() {
  orientation.screen = SCREEN_ORIENTATION_MAP[window.screen.orientation || window.screen.mozOrientation] || window.orientation || 0;
}

function addWindowListeners() {
  window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
  window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
  orientation.update = true;
  listeners.filter(function (i) {
    return !!i;
  }).forEach(function (i) {
    return i.renderWindowInteractor.requestAnimation(i);
  });
}

function removeWindowListeners() {
  window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
  window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
  orientation.update = false;
  listeners.filter(function (i) {
    return !!i;
  }).forEach(function (i) {
    return i.renderWindowInteractor.cancelAnimation(i);
  });
}

function addCameraToSynchronize(renderWindowInteractor, camera, onCameraUpdate) {
  function onAnimation() {
    if (orientation.update && isEventValid(orientation.device)) {
      var _orientation$device = orientation.device,
          alpha = _orientation$device.alpha,
          beta = _orientation$device.beta,
          gamma = _orientation$device.gamma;
      var screen = orientation.screen;
      camera.setDeviceAngles(alpha, beta, gamma, screen);

      if (onCameraUpdate) {
        onCameraUpdate();
      }
    }
  }

  var subscription = renderWindowInteractor.onAnimation(onAnimation);
  var listener = {
    subscription: subscription,
    renderWindowInteractor: renderWindowInteractor
  };
  var listenerId = listeners.length;
  listeners.push(listener);

  if (orientation.update) {
    listener.renderWindowInteractor.requestAnimation(listener);
  }

  return listenerId;
}

function removeCameraToSynchronize(id) {
  var cancelAnimation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var listener = listeners[id];

  if (listener) {
    listener.subscription.unsubscribe();

    if (cancelAnimation) {
      listener.renderWindowInteractor.cancelAnimation(listener);
    }
  }

  listeners[id] = null;
}

function isDeviceOrientationSupported() {
  return orientation.supported;
}

var vtkDeviceOrientationToCamera = {
  addCameraToSynchronize: addCameraToSynchronize,
  addWindowListeners: addWindowListeners,
  isDeviceOrientationSupported: isDeviceOrientationSupported,
  removeCameraToSynchronize: removeCameraToSynchronize,
  removeWindowListeners: removeWindowListeners
};

export { vtkDeviceOrientationToCamera as default };
