import macro from '../../macros.js';
import vtkCanvasView from './CanvasView.js';
import vtkImageStream from '../../IO/Core/ImageStream.js';
import vtkInteractorStyleRemoteMouse from '../../Interaction/Style/InteractorStyleRemoteMouse.js';
import vtkRenderWindowInteractor from '../Core/RenderWindowInteractor.js';

var SHARED_IMAGE_STREAM = vtkImageStream.newInstance();
var connectImageStream = SHARED_IMAGE_STREAM.connect;
var disconnectImageStream = SHARED_IMAGE_STREAM.disconnect; // ----------------------------------------------------------------------------
// vtkRemoteView methods
// ----------------------------------------------------------------------------

function vtkRemoteView(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkRemoteView'); // Constructor

  model.canvasView = vtkCanvasView.newInstance();
  model.interactorStyle = vtkInteractorStyleRemoteMouse.newInstance();
  model.interactor = vtkRenderWindowInteractor.newInstance();
  model.interactor.setView(model.canvasView);
  model.interactor.initialize();
  model.interactor.setInteractorStyle(model.interactorStyle); // Mouse

  model.interactorStyle.onRemoteMouseEvent(function (e) {
    if (model.session && model.rpcMouseEvent) {
      model.session.call(model.rpcMouseEvent, [e]);
    }
  }); // Wheel

  model.interactorStyle.onRemoteWheelEvent(function (e) {
    if (model.session && model.rpcWheelEvent) {
      model.session.call(model.rpcWheelEvent, [e]);
    }
  }); // Gesture

  model.interactorStyle.onRemoteGestureEvent(function (e) {
    if (model.session && model.rpcGestureEvent) {
      model.session.call(model.rpcGestureEvent, [e]);
    }
  }); // --------------------------------------------------------------------------
  // API
  // --------------------------------------------------------------------------

  publicAPI.delete = macro.chain(function () {
    model.session = null;

    if (model.canvasView) {
      model.canvasView.setViewStream(null);
      model.canvasView.delete();
    }

    if (model.interactor) {
      model.interactor.delete();
    }

    if (model.viewStream) {
      model.viewStream.delete();
    }
  }, publicAPI.delete); // --------------------------------------------------------------------------
  // remote handing
  // --------------------------------------------------------------------------

  publicAPI.setViewStream = function (viewStream) {
    model.viewStream = viewStream;
    model.canvasView.setViewStream(model.viewStream); // Configure image quality

    model.viewStream.setStillQuality(model.stillQuality);
    model.viewStream.setStillRatio(model.stillRatio);
    model.viewStream.setInteractiveQuality(model.interactiveQuality);
    model.viewStream.setInteractiveRatio(model.interactiveRatio); // Link user interactions

    model.interactor.onStartAnimation(model.viewStream.startInteraction);
    model.interactor.onEndAnimation(model.viewStream.endInteraction);
    publicAPI.setViewId(viewStream.getViewId());
  };

  publicAPI.setViewId = function (id) {
    if (!model.viewStream) {
      publicAPI.setViewStream(SHARED_IMAGE_STREAM.createViewStream(id));
    }

    model.viewStream.setViewId(id);
    model.interactorStyle.setRemoteEventAddOn({
      view: id
    });
    publicAPI.modified();
  }; // --------------------------------------------------------------------------
  // DOM handling
  // --------------------------------------------------------------------------


  publicAPI.setContainer = function (container) {
    if (model.container) {
      model.interactor.unbindEvents(container);
    } // Capture container


    model.container = container;
    model.canvasView.setContainer(model.container); // Attach listeners

    if (container) {
      model.interactor.bindEvents(container);
      publicAPI.resize();
    }
  }; // --------------------------------------------------------------------------


  publicAPI.resize = function () {
    if (model.container && model.canvasView) {
      var _model$container$getB = model.container.getBoundingClientRect(),
          width = _model$container$getB.width,
          height = _model$container$getB.height;

      model.canvasView.setSize(width, height);
      publicAPI.render();
    }
  }; // --------------------------------------------------------------------------


  publicAPI.render = function () {
    if (model.viewStream) {
      model.viewStream.render();
    }
  }; // --------------------------------------------------------------------------


  publicAPI.resetCamera = function () {
    if (model.viewStream) {
      model.viewStream.resetCamera();
    }
  }; // --------------------------------------------------------------------------
  // viewStream setters
  // --------------------------------------------------------------------------


  var internal = {
    modified: publicAPI.modified
  };
  macro.set(internal, model, ['interactiveQuality', 'interactiveRatio', 'stillQuality', 'stillRatio']);

  publicAPI.setInteractiveQuality = function (q) {
    var changeDetected = internal.setInteractiveQuality(q);

    if (model.viewStream && changeDetected) {
      model.viewStream.setInteractiveQuality(model.interactiveQuality);
    }

    return changeDetected;
  };

  publicAPI.setInteractiveRatio = function (r) {
    var changeDetected = internal.setInteractiveRatio(r);

    if (model.viewStream && changeDetected) {
      model.viewStream.setInteractiveRatio(model.interactiveRatio);
    }

    return changeDetected;
  };

  publicAPI.setStillQuality = function (q) {
    var changeDetected = internal.setStillQuality(q);

    if (model.viewStream && changeDetected) {
      model.viewStream.setStillQuality(model.stillQuality);
    }

    return changeDetected;
  };

  publicAPI.setStillRatio = function (r) {
    var changeDetected = internal.setStillRatio(r);

    if (model.viewStream && changeDetected) {
      model.viewStream.setStillRatio(model.stillRatio);
    }

    return changeDetected;
  }; // Initialize viewStream if available


  if (model.viewStream) {
    publicAPI.setViewStream(model.viewStream);
  }
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  viewId: '-1',
  interactiveQuality: 60,
  interactiveRatio: 1 / window.devicePixelRatio,
  stillQuality: 100,
  stillRatio: 1,
  rpcMouseEvent: 'viewport.mouse.interaction',
  rpcGestureEvent: null,
  rpcWheelEvent: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.obj(publicAPI, model, initialValues);
  macro.get(publicAPI, model, ['container', 'viewStream', 'canvasView', 'interactor', 'interactorStyle', 'interactiveQuality', 'interactiveRatio', 'stillQuality', 'stillRatio']);
  macro.setGet(publicAPI, model, ['session', 'rpcMouseEvent', 'rpcGestureEvent', 'rpcWheelEvent']); // Object methods

  vtkRemoteView(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkRemoteView'); // ----------------------------------------------------------------------------

var vtkRemoteView$1 = {
  newInstance: newInstance,
  extend: extend,
  SHARED_IMAGE_STREAM: SHARED_IMAGE_STREAM,
  connectImageStream: connectImageStream,
  disconnectImageStream: disconnectImageStream
};

export { connectImageStream, vtkRemoteView$1 as default, disconnectImageStream, extend, newInstance };
