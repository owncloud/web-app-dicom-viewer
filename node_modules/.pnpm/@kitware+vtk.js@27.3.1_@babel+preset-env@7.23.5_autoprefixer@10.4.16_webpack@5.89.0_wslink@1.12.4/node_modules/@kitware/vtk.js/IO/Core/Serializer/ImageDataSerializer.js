import vtkImageData from '../../../Common/DataModel/ImageData.js';
import vtkFieldDataSerializer from './FieldDataSerializer.js';

var CLASS_NAME = 'vtkImageData';

function canSerialize(obj) {
  return obj && obj.isA && obj.isA(CLASS_NAME);
}

function canDeserialize(obj) {
  return obj && obj.vtkClass && obj.vtkClass === CLASS_NAME;
}

function serialize(obj, arrayHandler) {
  var output = Object.assign(obj.get('direction', 'spacing', 'origin', 'extent'), {
    vtkClass: CLASS_NAME
  }); // Handle fields

  output.pointData = vtkFieldDataSerializer.serialize(obj.getPointData(), arrayHandler);
  output.cellData = vtkFieldDataSerializer.serialize(obj.getCellData(), arrayHandler);
  output.fieldData = vtkFieldDataSerializer.serialize(obj.getFieldData(), arrayHandler);
  return output;
}

function deserialize(obj, arrayHandler) {
  var direction = obj.direction,
      spacing = obj.spacing,
      origin = obj.origin,
      extent = obj.extent;
  var ds = vtkImageData.newInstance({
    direction: direction,
    spacing: spacing,
    origin: origin,
    extent: extent
  }); // Handle fields

  ds.setPointData(vtkFieldDataSerializer.deserialize(obj.pointData, arrayHandler));
  ds.setCellData(vtkFieldDataSerializer.deserialize(obj.cellData, arrayHandler));
  ds.setFieldData(vtkFieldDataSerializer.deserialize(obj.fieldData, arrayHandler));
  return ds;
}

var vtkImageDataSerializer = {
  canSerialize: canSerialize,
  serialize: serialize,
  canDeserialize: canDeserialize,
  deserialize: deserialize
};

export { vtkImageDataSerializer as default };
