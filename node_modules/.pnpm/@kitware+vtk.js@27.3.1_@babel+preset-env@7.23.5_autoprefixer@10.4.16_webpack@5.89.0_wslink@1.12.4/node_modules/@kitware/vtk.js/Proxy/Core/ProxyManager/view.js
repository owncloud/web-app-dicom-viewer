import macro from '../../../macros.js';

function addViewHandlingAPI(publicAPI, model) {
  publicAPI.create3DView = function (options) {
    return publicAPI.createProxy('Views', 'View3D', options);
  }; // --------------------------------------------------------------------------


  publicAPI.create2DView = function (options) {
    return publicAPI.createProxy('Views', 'View2D', options);
  }; // --------------------------------------------------------------------------


  publicAPI.render = function (view) {
    var viewToRender = view || publicAPI.getActiveView();

    if (viewToRender) {
      viewToRender.renderLater();
    }
  }; // --------------------------------------------------------------------------


  publicAPI.renderAllViews = function () {
    var blocking = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var allViews = publicAPI.getViews();

    for (var i = 0; i < allViews.length; i++) {
      allViews[i].render(blocking);
    }
  }; // --------------------------------------------------------------------------


  publicAPI.setAnimationOnAllViews = function () {
    var enable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var allViews = publicAPI.getViews().filter(function (v) {
      return !enable || v.getContainer();
    });

    for (var i = 0; i < allViews.length; i++) {
      allViews[i].setAnimation(enable, publicAPI);
    }
  }; // --------------------------------------------------------------------------


  function clearAnimations() {
    model.animating = false;
    var allViews = publicAPI.getViews();

    for (var i = 0; i < allViews.length; i++) {
      allViews[i].setAnimation(false, publicAPI);
    }
  } // --------------------------------------------------------------------------


  publicAPI.autoAnimateViews = function () {
    var debouceTimout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 250;

    if (!model.animating) {
      model.animating = true;
      var allViews = publicAPI.getViews().filter(function (v) {
        return v.getContainer();
      });

      for (var i = 0; i < allViews.length; i++) {
        allViews[i].setAnimation(true, publicAPI);
      }

      model.clearAnimations = macro.debounce(clearAnimations, debouceTimout);
    }

    model.clearAnimations();
  }; // --------------------------------------------------------------------------


  publicAPI.resizeAllViews = function () {
    var allViews = publicAPI.getViews();

    for (var i = 0; i < allViews.length; i++) {
      allViews[i].resize();
    }
  }; // --------------------------------------------------------------------------


  publicAPI.resetCamera = function (view) {
    var viewToRender = view || publicAPI.getActiveView();

    if (viewToRender && viewToRender.resetCamera) {
      viewToRender.resetCamera();
    }
  }; // --------------------------------------------------------------------------


  publicAPI.createRepresentationInAllViews = function (source) {
    var allViews = publicAPI.getViews();

    for (var i = 0; i < allViews.length; i++) {
      publicAPI.getRepresentation(source, allViews[i]);
    }
  }; // --------------------------------------------------------------------------


  publicAPI.resetCameraInAllViews = function () {
    var allViews = publicAPI.getViews();

    for (var i = 0; i < allViews.length; i++) {
      allViews[i].resetCamera();
    }
  };
}

export { addViewHandlingAPI as default };
