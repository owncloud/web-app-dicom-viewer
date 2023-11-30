import macro from '../../../macros.js';
import vtkDataArray from '../../../Common/Core/DataArray.js';
import vtkCellArray from '../../../Common/Core/CellArray.js';
import vtkPoints from '../../../Common/Core/Points.js';

var FACTORY = {
  vtkDataArray: vtkDataArray,
  vtkCellArray: vtkCellArray,
  vtkPoints: vtkPoints
};

function createDefaultTypedArrayHandler() {
  var arrays = [];

  function write(array) {
    var id = arrays.length;
    arrays.push(array);
    return id;
  }

  function read(arrayId) {
    return arrays[arrayId];
  }

  return {
    write: write,
    read: read,
    arrays: arrays
  };
}

function vtkArraySerializer(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkArraySerializer');

  if (!model.typedArrayHandler) {
    model.typedArrayHandler = createDefaultTypedArrayHandler();
  }

  publicAPI.serialize = function (obj) {
    var name = obj.getName();
    var numberOfTuples = obj.getNumberOfTuples();
    var vtkClass = obj.getClassName();
    var rawData = obj.getData();
    return {
      id: model.typedArrayHandler.write(rawData),
      name: name,
      numberOfTuples: numberOfTuples,
      vtkClass: vtkClass
    };
  };

  publicAPI.deserialize = function (obj) {
    var values = model.typedArrayHandler.read(obj.id);
    var name = obj.name,
        numberOfTuples = obj.numberOfTuples;
    return FACTORY[obj.vtkClass].newInstance({
      name: name,
      numberOfTuples: numberOfTuples,
      values: values
    });
  };
} // ----------------------------------------------------------------------------


function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, initialValues);
  macro.obj(publicAPI, model);
  macro.setGet(publicAPI, model, ['typedArrayHandler']); // Object specific methods

  vtkArraySerializer(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkArraySerializer'); // ----------------------------------------------------------------------------

var vtkArraySerializer$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkArraySerializer$1 as default, extend, newInstance };
