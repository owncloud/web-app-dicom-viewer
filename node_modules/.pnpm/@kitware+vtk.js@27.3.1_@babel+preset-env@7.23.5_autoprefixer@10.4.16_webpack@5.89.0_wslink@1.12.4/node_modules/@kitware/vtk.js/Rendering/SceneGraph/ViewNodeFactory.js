import macro from '../../macros.js';

// vtkViewNodeFactory methods
// ----------------------------------------------------------------------------

function vtkViewNodeFactory(publicAPI, model) {
  // Make sure our overrides is just for our instance not shared with everyone...
  if (!model.overrides) {
    model.overrides = {};
  } // Set our className


  model.classHierarchy.push('vtkViewNodeFactory');

  publicAPI.createNode = function (dataObject) {
    if (dataObject.isDeleted()) {
      return null;
    }

    var cpt = 0;
    var className = dataObject.getClassName(cpt++);
    var isObject = false;
    var keys = Object.keys(model.overrides);

    while (className && !isObject) {
      if (keys.indexOf(className) !== -1) {
        isObject = true;
      } else {
        className = dataObject.getClassName(cpt++);
      }
    }

    if (!isObject) {
      return null;
    }

    var vn = model.overrides[className]();
    vn.setMyFactory(publicAPI);
    return vn;
  };

  publicAPI.registerOverride = function (className, func) {
    model.overrides[className] = func;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {// overrides: {},
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model); // Object methods

  vtkViewNodeFactory(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkViewNodeFactory'); // ----------------------------------------------------------------------------

var vtkViewNodeFactory$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkViewNodeFactory$1 as default, extend, newInstance };
