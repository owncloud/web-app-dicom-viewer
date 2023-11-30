import macro from '../../macros.js';
import vtkDataArray from '../../Common/Core/DataArray.js';
import vtkImageData from '../../Common/DataModel/ImageData.js';

var vtkErrorMacro = macro.vtkErrorMacro; // ----------------------------------------------------------------------------
// vtkImageOutlineFilter methods
// ----------------------------------------------------------------------------

function vtkImageOutlineFilter(publicAPI, model) {
  model.classHierarchy.push('vtkImageOutlineFilter');

  publicAPI.requestData = function (inData, outData) {
    // implement requestData
    var input = inData[0];

    if (!input || input.getClassName() !== 'vtkImageData') {
      vtkErrorMacro('Invalid or missing input');
      return;
    }

    var output = vtkImageData.newInstance(input.get('spacing', 'origin', 'direction'));

    var getIndex = function getIndex(point, dims) {
      return point[0] + point[1] * dims[0] + point[2] * dims[0] * dims[1];
    };

    var getIJK = function getIJK(index, dims) {
      var ijk = [0, 0, 0];
      ijk[0] = index % dims[0];
      ijk[1] = Math.floor(index / dims[0]) % dims[1];
      ijk[2] = Math.floor(index / (dims[0] * dims[1]));
      return ijk;
    };

    var dims = input.getDimensions();
    output.setDimensions(dims);
    output.computeTransforms();
    var values = new Uint8Array(input.getNumberOfPoints());
    var inputDataArray = input.getPointData().getScalars().getData();
    var kernelX = 0; // default K slicing mode

    var kernelY = 1;

    if (model.slicingMode === 1) {
      kernelX = 0;
      kernelY = 2;
    } else if (model.slicingMode === 0) {
      kernelX = 1;
      kernelY = 2;
    }

    inputDataArray.forEach(function (el, index) {
      if (el !== model.background) {
        var ijk = getIJK(index, dims);
        var isBorder = false;

        for (var x = -1; x <= 1 && !isBorder; x++) {
          for (var y = -1; y <= 1 && !isBorder; y++) {
            var dx = x;
            var dy = y;
            var dz = 0;

            if (model.slicingMode === 1) {
              dx = x;
              dy = 0;
              dz = y;
            } else if (model.slicingMode === 0) {
              dx = 0;
              dy = y;
              dz = x;
            }

            var evalX = ijk[kernelX] + dx;
            var evalY = ijk[kernelY] + dy; // check boundaries

            if (evalX >= 0 && evalX < dims[kernelX] && evalY >= 0 && evalY < dims[kernelY]) {
              var hoodValue = inputDataArray[getIndex([ijk[0] + dx, ijk[1] + dy, ijk[2] + dz], dims)];
              if (hoodValue !== el) isBorder = true;
            }
          }
        }

        if (isBorder) values[index] = el;else values[index] = model.background;
      } else {
        values[index] = model.background;
      }
    });
    var dataArray = vtkDataArray.newInstance({
      numberOfComponents: 1,
      values: values
    });
    output.getPointData().setScalars(dataArray);
    outData[0] = output;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  slicingMode: 2,
  background: 0
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Make this a VTK object

  macro.obj(publicAPI, model); // Also make it an algorithm with one input and one output

  macro.algo(publicAPI, model, 1, 1);
  macro.setGet(publicAPI, model, ['slicingMode', 'background']); // Object specific methods

  vtkImageOutlineFilter(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkImageOutlineFilter'); // ----------------------------------------------------------------------------

var vtkImageOutlineFilter$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkImageOutlineFilter$1 as default, extend, newInstance };
