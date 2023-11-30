import vtkDataSetAttributes from '../../../Common/DataModel/DataSetAttributes.js';

var CLASS_NAME = 'vtkDataSetAttributes';
var ARRAYS = ['Scalars', 'Vectors', 'Normals', 'TCoords', 'Tensors', 'GlobalIds', 'PedigreeIds'];

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
  var indexMapping = [];
  var arrays = obj.getArrays();

  for (var i = 0; i < arrays.length; i++) {
    indexMapping.push(arrayHandler.serialize(arrays[i]));
  }

  ARRAYS.forEach(function (attrType) {
    var arrayIdx = obj["getActive".concat(attrType)]();

    if (arrayIdx !== -1) {
      output[attrType] = indexMapping[arrayIdx];
    }
  }); // List all arrays

  output.arrays = indexMapping;
  return output;
}

function deserialize(obj, arrayHandler) {
  var ds = vtkDataSetAttributes.newInstance();

  for (var i = 0; i < obj.arrays.length; i++) {
    ds.addArray(arrayHandler.deserialize(obj.arrays[i]));
  }

  ARRAYS.forEach(function (attrType) {
    ds["set".concat(attrType)](arrayHandler.deserialize(obj[attrType]));
  });
  return ds;
}

var vtkFieldDataSerializer = {
  canSerialize: canSerialize,
  serialize: serialize,
  canDeserialize: canDeserialize,
  deserialize: deserialize
};

export { vtkFieldDataSerializer as default };
