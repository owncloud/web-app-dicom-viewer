import macro from '../../macros.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';

// vtkLineFilter methods
// ----------------------------------------------------------------------------

function vtkLineFilter(publicAPI, model) {
  // Set our classname
  model.classHierarchy.push('vtkLineFilter');

  publicAPI.requestData = function (inData, outData) {
    var dataset = vtkPolyData.newInstance();
    dataset.getPoints().setData(inData[0].getPoints().getData());
    dataset.getLines().setData(inData[0].getLines().getData());
    outData[0] = dataset;
  };
} // ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.setGet(publicAPI, model, []); // Make this a VTK object

  macro.obj(publicAPI, model); // Also make it an algorithm with one input and one output

  macro.algo(publicAPI, model, 1, 1); // Object specific methods

  vtkLineFilter(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkLineFilter'); // ----------------------------------------------------------------------------

var vtkLineFilter$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkLineFilter$1 as default, extend, newInstance };
