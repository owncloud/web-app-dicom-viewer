import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import macro from '../../macros.js';
import vtkImageData from '../../Common/DataModel/ImageData.js';
import vtkDataArray from '../../Common/Core/DataArray.js';

var vtkErrorMacro = macro.vtkErrorMacro; // ----------------------------------------------------------------------------
// vtkImageCropFilter methods
// ----------------------------------------------------------------------------

function vtkImageCropFilter(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkImageCropFilter'); // --------------------------------------------------------------------------

  publicAPI.reset = function () {
    var data = publicAPI.getInputData();

    if (data) {
      publicAPI.setCroppingPlanes.apply(publicAPI, _toConsumableArray(data.getExtent()));
    }
  }; // --------------------------------------------------------------------------


  publicAPI.requestData = function (inData, outData) {
    // implement requestData
    var input = inData[0];

    if (!input) {
      vtkErrorMacro('Invalid or missing input');
      return;
    }

    var scalars = input.getPointData().getScalars();

    if (!scalars) {
      vtkErrorMacro('No scalars from input');
      return;
    }

    var extent = input.getExtent();
    var cropped = model.croppingPlanes && model.croppingPlanes.length === 6 ? extent.map(function (e, i) {
      if (i % 2 === 0) {
        // min plane
        return Math.max(e, Math.round(model.croppingPlanes[i]));
      } // max plane


      return Math.min(e, Math.round(model.croppingPlanes[i]));
    }) : extent.slice();

    if (cropped[0] === extent[0] && cropped[1] === extent[1] && cropped[2] === extent[2] && cropped[3] === extent[3] && cropped[4] === extent[4] && cropped[5] === extent[5]) {
      var sameAsInput = vtkImageData.newInstance();
      sameAsInput.shallowCopy(input); // Force new mtime

      outData[0] = sameAsInput;
      return;
    } // reorder if needed


    for (var i = 0; i < 3; ++i) {
      if (cropped[i * 2] > cropped[i * 2 + 1]) {
        var _ref = [cropped[i * 2 + 1], cropped[i * 2]];
        cropped[i * 2] = _ref[0];
        cropped[i * 2 + 1] = _ref[1];
      }
    } // restrict crop bounds based on extent bounds


    for (var _i = 0; _i < 6; _i += 2) {
      // min case
      cropped[_i] = Math.max(cropped[_i], extent[_i]); // max case

      cropped[_i + 1] = Math.min(cropped[_i + 1], extent[_i + 1]);
    }

    var numberOfComponents = scalars.getNumberOfComponents();
    var componentSize = (cropped[1] - cropped[0] + 1) * (cropped[3] - cropped[2] + 1) * (cropped[5] - cropped[4] + 1) * numberOfComponents;
    var scalarsData = scalars.getData();
    var dims = input.getDimensions();
    var jStride = numberOfComponents * dims[0];
    var kStride = numberOfComponents * dims[0] * dims[1];
    var beginOffset = (cropped[0] - extent[0]) * numberOfComponents;
    var stripSize = (cropped[1] - cropped[0] + 1) * numberOfComponents; // +1 because subarray end is exclusive
    // crop image

    var croppedArray = new scalarsData.constructor(componentSize);
    var index = 0;

    for (var k = cropped[4]; k <= cropped[5]; ++k) {
      for (var j = cropped[2]; j <= cropped[3]; ++j) {
        var begin = beginOffset + (j - extent[2]) * jStride + (k - extent[4]) * kStride;
        var end = begin + stripSize;
        var slice = scalarsData.subarray(begin, end);
        croppedArray.set(slice, index);
        index += slice.length;
      }
    }

    var outImage = vtkImageData.newInstance({
      extent: cropped,
      origin: input.getOrigin(),
      direction: input.getDirection(),
      spacing: input.getSpacing()
    });
    var croppedScalars = vtkDataArray.newInstance({
      name: scalars.getName(),
      numberOfComponents: numberOfComponents,
      values: croppedArray
    });
    outImage.getPointData().setScalars(croppedScalars);
    outData[0] = outImage;
  };

  publicAPI.isResetAvailable = function () {
    if (model.croppingPlanes == null || model.croppingPlanes.length === 0) {
      return false;
    }

    var data = publicAPI.getInputData();

    if (data) {
      var originalExtent = data.getExtent();
      var findDifference = originalExtent.find(function (v, i) {
        return Math.abs(model.croppingPlanes[i] - v) > Number.EPSILON;
      });
      return findDifference !== undefined;
    }

    return false;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {// croppingPlanes: null,
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Make this a VTK object

  macro.obj(publicAPI, model); // Also make it an algorithm with one input and one output

  macro.algo(publicAPI, model, 1, 1); // no orientation support yet

  macro.setGetArray(publicAPI, model, ['croppingPlanes'], 6); // Object specific methods

  vtkImageCropFilter(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkImageCropFilter'); // ----------------------------------------------------------------------------

var vtkImageCropFilter$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkImageCropFilter$1 as default, extend, newInstance };
