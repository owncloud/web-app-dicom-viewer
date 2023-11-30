import macro from '../../macros.js';
import vtkImageData from '../../Common/DataModel/ImageData.js';
import vtkDataArray from '../../Common/Core/DataArray.js';

// vtkImageGridSource methods
// ----------------------------------------------------------------------------

function vtkImageGridSource(publicAPI, model) {
  var _this = this;

  // Set our className
  model.classHierarchy.push('vtkImageGridSource');

  publicAPI.requestData = function (inData, outData) {
    if (model.deleted) {
      return;
    }

    var state = {};
    var dataset = {
      type: 'vtkImageData',
      mtime: model.mtime,
      metadata: {
        source: 'vtkImageGridSource',
        state: state
      }
    }; // Add parameter used to create dataset as metadata.state[*]

    ['gridSpacing', 'gridOrigin', 'dataSpacing', 'dataOrigin'].forEach(function (field) {
      state[field] = [].concat(model[field]);
    });
    var id = vtkImageData.newInstance(dataset);
    id.setOrigin(model.dataOrigin[0], model.dataOrigin[1], model.dataOrigin[2]);
    id.setSpacing(model.dataSpacing[0], model.dataSpacing[1], model.dataSpacing[2]);
    id.setExtent.apply(_this, model.dataExtent);
    id.setDirection(model.dataDirection);
    var dims = [0, 0, 0];
    dims = dims.map(function (_, i) {
      return model.dataExtent[i * 2 + 1] - model.dataExtent[i * 2] + 1;
    });
    var newArray = new Uint8Array(dims[0] * dims[1] * dims[2]);
    var xval = 0;
    var yval = 0;
    var zval = 0;
    var i = 0;

    for (var z = model.dataExtent[4]; z <= model.dataExtent[5]; z++) {
      if (model.gridSpacing[2]) {
        zval = z % model.gridSpacing[2] === model.gridOrigin[2];
      } else {
        zval = 0;
      }

      for (var y = model.dataExtent[2]; y <= model.dataExtent[3]; y++) {
        if (model.gridSpacing[1]) {
          yval = y % model.gridSpacing[1] === model.gridOrigin[1];
        } else {
          yval = 0;
        }

        for (var x = model.dataExtent[0]; x <= model.dataExtent[1]; x++) {
          if (model.gridSpacing[0]) {
            xval = x % model.gridSpacing[0] === model.gridOrigin[0];
          } else {
            xval = 0;
          }

          newArray[i] = zval || yval || xval ? model.lineValue : model.fillValue;
          i++;
        }
      }
    }

    var da = vtkDataArray.newInstance({
      numberOfComponents: 1,
      values: newArray
    });
    da.setName('scalars');
    var cpd = id.getPointData();
    cpd.setScalars(da); // Update output

    outData[0] = id;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  lineValue: 0,
  fillValue: 255,
  gridSpacing: [10, 10, 0],
  gridOrigin: [0, 0, 0],
  dataSpacing: [1.0, 1.0, 1.0],
  dataOrigin: [0.0, 0.0, 0.0],
  dataExtent: [0, 255, 0, 255, 0, 0],
  dataDirection: [1, 0, 0, 0, 1, 0, 0, 0, 1]
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  macro.setGet(publicAPI, model, ['lineValue', 'fillValue']);
  macro.setGetArray(publicAPI, model, ['gridOrigin', 'gridSpacing', 'dataOrigin', 'dataSpacing'], 3);
  macro.setGetArray(publicAPI, model, ['dataExtent'], 6);
  macro.setGetArray(publicAPI, model, ['dataDirection'], 9);
  macro.algo(publicAPI, model, 0, 1);
  vtkImageGridSource(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkImageGridSource'); // ----------------------------------------------------------------------------

var vtkImageGridSource$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkImageGridSource$1 as default, extend, newInstance };
