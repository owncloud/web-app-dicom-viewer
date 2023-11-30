import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import macro from '../../macros.js';
import vtkActor from '../../Rendering/Core/Actor.js';
import vtkContextRepresentation from './ContextRepresentation.js';
import vtkMapper from '../../Rendering/Core/Mapper.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';
import vtkBoundingBox from '../../Common/DataModel/BoundingBox.js';
import { LINE_ARRAY, BOUNDS_MAP } from '../../Filters/General/OutlineFilter.js';

// vtkOutlineContextRepresentation methods
// ----------------------------------------------------------------------------
// Represents a box outline given 8 points as corners.
// Does not work with an arbitrary set of points. An oriented bounding box
// algorithm may be implemented in the future.

function vtkOutlineContextRepresentation(publicAPI, model) {
  var _model$actor$getPrope;

  // Set our className
  model.classHierarchy.push('vtkOutlineContextRepresentation'); // internal bounding box

  model.bbox = _toConsumableArray(vtkBoundingBox.INIT_BOUNDS); // --------------------------------------------------------------------------
  // Internal polydata dataset
  // --------------------------------------------------------------------------

  model.internalPolyData = vtkPolyData.newInstance({
    mtime: 0
  });
  model.points = new Float32Array(8 * 3);
  model.internalPolyData.getPoints().setData(model.points, 3);
  model.internalPolyData.getLines().setData(Uint16Array.from(LINE_ARRAY)); // --------------------------------------------------------------------------
  // Generic rendering pipeline
  // --------------------------------------------------------------------------

  model.mapper = vtkMapper.newInstance({
    scalarVisibility: false
  });
  model.actor = vtkActor.newInstance({
    parentProp: publicAPI
  });

  (_model$actor$getPrope = model.actor.getProperty()).setEdgeColor.apply(_model$actor$getPrope, _toConsumableArray(model.edgeColor));

  model.mapper.setInputConnection(publicAPI.getOutputPort());
  model.actor.setMapper(model.mapper);
  publicAPI.addActor(model.actor); // --------------------------------------------------------------------------

  publicAPI.requestData = function (inData, outData) {
    var list = publicAPI.getRepresentationStates(inData[0]).filter(function (state) {
      return state.getOrigin && state.getOrigin();
    });
    vtkBoundingBox.reset(model.bbox);

    for (var i = 0; i < list.length; i++) {
      var pt = list[i].getOrigin();

      if (pt) {
        vtkBoundingBox.addPoint.apply(vtkBoundingBox, [model.bbox].concat(_toConsumableArray(pt)));
      }
    } // BOUNDS_MAP.length should equal model.points.length


    for (var _i = 0; _i < BOUNDS_MAP.length; _i++) {
      model.points[_i] = model.bbox[BOUNDS_MAP[_i]];
    }

    model.internalPolyData.getPoints().modified();
    model.internalPolyData.modified();
    outData[0] = model.internalPolyData;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  edgeColor: [1, 1, 1]
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  vtkContextRepresentation.extend(publicAPI, model, initialValues);
  macro.setGetArray(publicAPI, model, ['edgeColor'], 3);
  macro.get(publicAPI, model, ['mapper', 'actor']); // Object specific methods

  vtkOutlineContextRepresentation(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkOutlineContextRepresentation'); // ----------------------------------------------------------------------------

var vtkOutlineContextRepresentation$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkOutlineContextRepresentation$1 as default, extend, newInstance };
