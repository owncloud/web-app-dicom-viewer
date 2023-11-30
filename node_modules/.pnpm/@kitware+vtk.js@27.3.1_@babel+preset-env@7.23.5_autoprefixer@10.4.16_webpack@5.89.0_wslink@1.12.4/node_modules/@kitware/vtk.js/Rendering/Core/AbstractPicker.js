import macro from '../../macros.js';

// vtkAbstractPicker methods
// ----------------------------------------------------------------------------

function vtkAbstractPicker(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkAbstractPicker');

  publicAPI.initialize = function () {
    model.renderer = null;
    model.selectionPoint[0] = 0.0;
    model.selectionPoint[1] = 0.0;
    model.selectionPoint[2] = 0.0;
    model.pickPosition[0] = 0.0;
    model.pickPosition[1] = 0.0;
    model.pickPosition[2] = 0.0;
  };

  publicAPI.initializePickList = function () {
    model.pickList = [];
  };

  publicAPI.addPickList = function (actor) {
    model.pickList.push(actor);
  };

  publicAPI.deletePickList = function (actor) {
    var i = model.pickList.indexOf(actor);

    if (i !== -1) {
      model.pickList.splice(i, 1);
    }
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  renderer: null,
  selectionPoint: [0.0, 0.0, 0.0],
  pickPosition: [0.0, 0.0, 0.0],
  pickFromList: 0,
  pickList: []
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['renderer']);
  macro.getArray(publicAPI, model, ['selectionPoint', 'pickPosition']);
  macro.setGet(publicAPI, model, ['pickFromList', 'pickList']);
  vtkAbstractPicker(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkAbstractPicker'); // ----------------------------------------------------------------------------

var vtkAbstractPicker$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkAbstractPicker$1 as default, extend, newInstance };
