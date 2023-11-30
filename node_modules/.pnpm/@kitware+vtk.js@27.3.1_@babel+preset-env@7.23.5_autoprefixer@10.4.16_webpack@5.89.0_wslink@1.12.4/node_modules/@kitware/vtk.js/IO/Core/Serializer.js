import vtkArraySerializer from './Serializer/ArraySerializer.js';
import vtkFieldDataSerializer from './Serializer/FieldDataSerializer.js';
import vtkImageDataSerializer from './Serializer/ImageDataSerializer.js';
import vtkPolyDataSerializer from './Serializer/PolyDataSerializer.js';

var LIST = [vtkFieldDataSerializer, vtkImageDataSerializer, vtkPolyDataSerializer];

function getSerializer(obj) {
  return LIST.find(function (s) {
    return s.canSerialize(obj);
  });
}

function getDeserializer(obj) {
  return LIST.find(function (s) {
    return s.canDeserialize(obj);
  });
}

var vtkSerializer = {
  vtkArraySerializer: vtkArraySerializer,
  getSerializer: getSerializer,
  getDeserializer: getDeserializer
};

export { vtkSerializer as default };
