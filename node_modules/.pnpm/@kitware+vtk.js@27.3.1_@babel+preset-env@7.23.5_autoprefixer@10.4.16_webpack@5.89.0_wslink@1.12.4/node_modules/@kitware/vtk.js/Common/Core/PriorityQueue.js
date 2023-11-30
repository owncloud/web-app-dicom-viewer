import macro from '../../macros.js';

// vtkPriorityQueue methods
// ----------------------------------------------------------------------------

function vtkPriorityQueue(publicAPI, model) {
  // Set our classname
  model.classHierarchy.push('vtkPriorityQueue');

  publicAPI.push = function (priority, element) {
    // naive algo
    var i = model.elements.findIndex(function (e) {
      return e.priority > priority;
    });
    model.elements.splice(i, 0, {
      priority: priority,
      element: element
    });
  };

  publicAPI.pop = function () {
    if (model.elements.length > 0) {
      return model.elements.shift().element;
    }

    return null;
  };

  publicAPI.deleteById = function (id) {
    model.elements = model.elements.filter(function (_ref) {
      var element = _ref.element;
      return element.id !== id;
    });
  };

  publicAPI.length = function () {
    return model.elements.length;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  elements: []
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  vtkPriorityQueue(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkPriorityQueue'); // ----------------------------------------------------------------------------

var vtkPriorityQueue$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkPriorityQueue$1 as default, extend, newInstance };
