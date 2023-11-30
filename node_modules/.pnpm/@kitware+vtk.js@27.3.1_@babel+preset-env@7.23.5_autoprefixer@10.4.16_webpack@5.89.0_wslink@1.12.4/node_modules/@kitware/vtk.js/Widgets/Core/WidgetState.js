import macro from '../../macros.js';

var DEFAULT_LABEL = 'default';

function removeObjectInArray(array, obj) {
  var idx = array.indexOf(obj);

  if (idx !== -1) {
    array.splice(idx, 1);
  }
} // ----------------------------------------------------------------------------


function vtkWidgetState(publicAPI, model) {
  model.classHierarchy.push('vtkWidgetState');
  var subscriptions = [];
  model.labels = {};
  model.nestedStates = []; // --------------------------------------------------------------------------
  // labels can be a string or an array of strings.
  // If nothing (or empty array) provided the default label will be used.
  // --------------------------------------------------------------------------

  publicAPI.bindState = function (nested) {
    var labels = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [DEFAULT_LABEL];
    model.nestedStates.push(nested);
    subscriptions.push(nested.onModified(publicAPI.modified));

    if (Array.isArray(labels) && labels.length) {
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];

        if (!model.labels[label]) {
          model.labels[label] = [];
        }

        model.labels[label].push(nested);
      }
    } else {
      // Need to bind to a label
      var labelToUse = Array.isArray(labels) ? DEFAULT_LABEL : labels || DEFAULT_LABEL;

      if (!model.labels[labelToUse]) {
        model.labels[labelToUse] = [];
      }

      model.labels[labelToUse].push(nested);
    }
  }; // --------------------------------------------------------------------------


  publicAPI.unbindState = function (nested) {
    while (subscriptions.length) {
      subscriptions.pop().unsubscribe();
    }

    removeObjectInArray(model.nestedStates, nested);

    for (var i = 0; i < model.nestedStates.length; i++) {
      subscriptions.push(model.nestedStates[i].onModified(publicAPI.modified));
    }

    Object.keys(model.labels).forEach(function (label) {
      var list = model.labels[label];
      removeObjectInArray(list, nested);
    });
  }; // --------------------------------------------------------------------------


  publicAPI.unbindAll = function () {
    while (subscriptions.length) {
      subscriptions.pop().unsubscribe();
    }

    model.nestedStates = [];
  }; // --------------------------------------------------------------------------
  // Active flag API
  // --------------------------------------------------------------------------


  publicAPI.activate = function () {
    return publicAPI.setActive(true);
  };

  publicAPI.deactivate = function (excludingState) {
    if (excludingState !== publicAPI) {
      publicAPI.setActive(false);
    }

    for (var i = 0; i < model.nestedStates.length; i++) {
      model.nestedStates[i].deactivate(excludingState);
    }
  };

  publicAPI.activateOnly = function (subState) {
    if (subState) {
      subState.setActive(true);
    } // deactivate current state, but exclude the sub-state


    publicAPI.deactivate(subState);
  }; // --------------------------------------------------------------------------
  // Nested state methods
  // --------------------------------------------------------------------------


  publicAPI.getStatesWithLabel = function (name) {
    return model.labels[name];
  };

  publicAPI.getAllNestedStates = function () {
    return model.nestedStates;
  }; // --------------------------------------------------------------------------
  // Clean on delete
  // --------------------------------------------------------------------------


  publicAPI.delete = macro.chain(publicAPI.unbindAll, publicAPI.delete);
} // ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  active: false
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.obj(publicAPI, model);
  macro.setGet(publicAPI, model, ['active']);
  vtkWidgetState(publicAPI, model);
} // ----------------------------------------------------------------------------

var vtkWidgetState$1 = {
  extend: extend
};

export { vtkWidgetState$1 as default, extend };
