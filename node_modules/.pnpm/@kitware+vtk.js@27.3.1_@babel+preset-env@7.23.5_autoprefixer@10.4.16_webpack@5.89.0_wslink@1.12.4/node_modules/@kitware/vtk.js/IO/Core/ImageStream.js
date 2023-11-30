import macro from '../../macros.js';
import createMethods from './ImageStream/DefaultProtocol.js';
import ViewStream from './ImageStream/ViewStream.js';

function vtkImageStream(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkImageStream'); // --------------------------------------------------------------------------
  // Internal private method
  // --------------------------------------------------------------------------

  function onImage(data) {
    var message = data[0];

    if (!message || !message.image) {
      return;
    }

    for (var i = 0; i < model.viewStreams.length; i++) {
      model.viewStreams[i].processMessage(message);
    }
  } // --------------------------------------------------------------------------
  // PublicAPI
  // --------------------------------------------------------------------------


  publicAPI.setServerAnimationFPS = function () {
    var maxFPS = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
    var changeDetected = false;

    if (model.serverAnimationFPS !== maxFPS) {
      model.serverAnimationFPS = maxFPS;
      changeDetected = true;
    }

    if (!model.protocol) {
      return Promise.resolve(true);
    }

    if (changeDetected) {
      publicAPI.modified();
    }

    return model.protocol.setServerAnimationFPS(maxFPS);
  }; // --------------------------------------------------------------------------


  publicAPI.connect = function (session) {
    var protocol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : createMethods;

    if (model.connected || !session || !protocol) {
      return;
    }

    model.protocol = protocol(session);
    model.protocol.subscribeToImageStream(onImage).promise // new API in wslink 1.0.5+
    .then(function (subscription) {
      model.renderTopicSubscription = subscription;
      model.connected = true;
    }).catch(function (e) {
      model.connected = false;
      console.error(e);
    });
  }; // --------------------------------------------------------------------------


  publicAPI.disconnect = function () {
    if (model.protocol && model.connected && model.renderTopicSubscription) {
      model.protocol.unsubscribeToImageStream(model.renderTopicSubscription);
      model.renderTopicSubscription = null;
    }

    model.connected = false;
  }; // --------------------------------------------------------------------------


  publicAPI.registerViewStream = function (view) {
    model.viewStreams.push(view);
  }; // --------------------------------------------------------------------------


  publicAPI.unregisterViewStream = function (view) {
    model.viewStreams = model.viewStreams.filter(function (v) {
      return v !== view;
    });
  }; // --------------------------------------------------------------------------


  publicAPI.createViewStream = function () {
    var viewId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '-1';
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [400, 400];
    var setServerAnimationFPS = publicAPI.setServerAnimationFPS,
        getServerAnimationFPS = publicAPI.getServerAnimationFPS,
        unregisterViewStream = publicAPI.unregisterViewStream;
    var viewStream = ViewStream.newInstance({
      protocol: model.protocol,
      unregisterViewStream: unregisterViewStream,
      sharedAPI: {
        setServerAnimationFPS: setServerAnimationFPS,
        getServerAnimationFPS: getServerAnimationFPS
      }
    });
    viewStream.setViewId(viewId);
    viewStream.setSize(size[0], size[1]);
    publicAPI.registerViewStream(viewStream);
    return viewStream;
  }; // --------------------------------------------------------------------------


  publicAPI.delete = macro.chain(function () {
    while (model.viewStreams.length) {
      model.viewStreams.pop().delete();
    }

    publicAPI.disconnect();
  }, publicAPI.delete);
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  // protocol: null,
  viewStreams: [],
  serverAnimationFPS: -1
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Object methods

  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['serverAnimationFPS', 'protocol']); // Object specific methods

  vtkImageStream(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkImageStream'); // ----------------------------------------------------------------------------

var vtkImageStream$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkImageStream$1 as default, extend, newInstance };
