import macro from '../../../macros.js';
import vtkPolyData from '../../../Common/DataModel/PolyData.js';
import vtkFieldDataSerializer from './FieldDataSerializer.js';

var CLASS_NAME = 'vtkPolyData';
var ARRAYS = ['points', 'verts', 'lines', 'polys', 'strips'];

function canSerialize(obj) {
  return obj && obj.isA && obj.isA(CLASS_NAME);
}

function canDeserialize(obj) {
  return obj && obj.vtkClass && obj.vtkClass === CLASS_NAME;
}

function serialize(obj, arrayHandler) {
  var output = {
    vtkClass: CLASS_NAME
  };
  ARRAYS.forEach(function (arrayName) {
    var array = obj["get".concat(macro.capitalize(arrayName))]();

    if (array && array.getNumberOfValues() > 0) {
      output[arrayName] = arrayHandler.serialize(array);
    }
  }); // Handle fields

  output.pointData = vtkFieldDataSerializer.serialize(obj.getPointData(), arrayHandler);
  output.cellData = vtkFieldDataSerializer.serialize(obj.getCellData(), arrayHandler);
  output.fieldData = vtkFieldDataSerializer.serialize(obj.getFieldData(), arrayHandler);
  return output;
}

function deserialize(obj, arrayHandler) {
  var ds = vtkPolyData.newInstance();
  ARRAYS.forEach(function (arrayName) {
    ds["set".concat(macro.capitalize(arrayName))](arrayHandler.deserialize(obj[arrayName]));
  }); // Handle fields

  ds.setPointData(vtkFieldDataSerializer.deserialize(obj.pointData, arrayHandler));
  ds.setCellData(vtkFieldDataSerializer.deserialize(obj.cellData, arrayHandler));
  ds.setFieldData(vtkFieldDataSerializer.deserialize(obj.fieldData, arrayHandler));
  return ds;
}

var vtkPolyDataSerializer = {
  canSerialize: canSerialize,
  serialize: serialize,
  canDeserialize: canDeserialize,
  deserialize: deserialize
};

export { vtkPolyDataSerializer as default };
