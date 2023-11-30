import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import macro from '../../macros.js';

// vtkAnimationProxyManager methods
// ----------------------------------------------------------------------------

function vtkAnimationProxyManager(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkAnimationProxyManager'); // Initialization ------------------------------------------------------------

  publicAPI.addAnimation = function (animation) {
    if (!model.animations.includes(animation)) {
      model.animations.push(animation);
    }

    animation.onModified(publicAPI.updateFrames);
    publicAPI.updateFrames();
  };

  publicAPI.play = function () {
    var currentTime = model.frames[model.currentFrameIndex];
    var nextTime = model.frames[model.currentFrameIndex + 1];
    clearTimeout(model.timeOut);

    if (model.currentFrameIndex < model.frames.length - 1) {
      model.timeOut = setTimeout(function () {
        publicAPI.nextFrame();
        publicAPI.play();
      }, (nextTime - currentTime) * 1000);
    } else {
      publicAPI.invokeDonePlaying();
    }
  };

  publicAPI.pause = function () {
    clearTimeout(model.timeOut);
    model.timeOut = null;
  };

  publicAPI.nextFrame = function () {
    if (model.currentFrameIndex < model.frames.length - 1) {
      publicAPI.setFrameIndex(model.currentFrameIndex + 1);
    }
  };

  publicAPI.previousFrame = function () {
    if (model.currentFrameIndex > 0) {
      publicAPI.setFrameIndex(model.currentFrameIndex - 1);
    }
  };

  publicAPI.firstFrame = function () {
    publicAPI.setFrameIndex(0);
  };

  publicAPI.lastFrame = function () {
    publicAPI.setFrameIndex(model.frames.length - 1);
  };

  publicAPI.setFrameIndex = function (frameId) {
    model.currentFrameIndex = frameId;
    model.animations.forEach(function (animationProxy) {
      animationProxy.setTime(model.frames[model.currentFrameIndex]);
    });
    publicAPI.invokeCurrentFrameChanged();
  };

  publicAPI.updateFrames = function () {
    var frames = [];
    model.animations.forEach(function (animationProxy) {
      frames.push.apply(frames, _toConsumableArray(animationProxy.getFrames()));
    });
    model.frames = frames.sort(function (a, b) {
      return a - b;
    }).filter(function (val, index, array) {
      return array.indexOf(val) === index;
    }); // remove duplicates

    publicAPI.invokeFramesChanged(); // Reset animation as frames changed.

    publicAPI.setFrameIndex(0);
  };

  publicAPI.getCurrentFrame = function () {
    return model.frames[model.currentFrameIndex];
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  animations: [],
  currentFrameIndex: 0,
  frames: [],
  timeOut: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['frames', 'currentFrameIndex']); // Object specific methods

  vtkAnimationProxyManager(publicAPI, model); // Proxy handling

  macro.proxy(publicAPI, model);
  macro.event(publicAPI, model, 'currentFrameChanged');
  macro.event(publicAPI, model, 'framesChanged');
  macro.event(publicAPI, model, 'donePlaying');
} // ----------------------------------------------------------------------------


var newInstance = macro.newInstance(extend, 'vtkAnimationProxyManager'); // ----------------------------------------------------------------------------

var index = {
  newInstance: newInstance,
  extend: extend
};

export { index as default, newInstance };
