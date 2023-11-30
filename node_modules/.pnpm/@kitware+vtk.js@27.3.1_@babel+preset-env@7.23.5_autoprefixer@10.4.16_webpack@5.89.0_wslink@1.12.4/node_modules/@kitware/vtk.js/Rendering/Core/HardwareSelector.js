import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import macro from '../../macros.js';
import vtkDataSet from '../../Common/DataModel/DataSet.js';

var FieldAssociations = vtkDataSet.FieldAssociations; // ----------------------------------------------------------------------------
// vtkHardwareSelector methods
// ----------------------------------------------------------------------------

function vtkHardwareSelector(publicAPI, model) {
  model.classHierarchy.push('vtkHardwareSelector'); // get the source data that is used for generating a selection. This
  // must be called at least once before calling generateSelection. In
  // raster based backends this method will capture the buffers. You can
  // call this once and then make multiple calls to generateSelection.

  publicAPI.getSourceDataAsync = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(renderer, fx1, fy1, fx2, fy2) {
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2, _x3, _x4, _x5) {
      return _ref.apply(this, arguments);
    };
  }();

  publicAPI.selectAsync = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(renderer, fx1, fy1, fx2, fy2) {
      var srcData;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return publicAPI.getSourceDataAsync(renderer, fx1, fy1, fx2, fy2);

            case 2:
              srcData = _context2.sent;

              if (!srcData) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt("return", srcData.generateSelection(fx1, fy1, fx2, fy2));

            case 5:
              return _context2.abrupt("return", []);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x6, _x7, _x8, _x9, _x10) {
      return _ref2.apply(this, arguments);
    };
  }();
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  fieldAssociation: FieldAssociations.FIELD_ASSOCIATION_CELLS,
  captureZValues: false
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  macro.obj(publicAPI, model);
  macro.setGet(publicAPI, model, ['fieldAssociation', 'captureZValues']); // Object methods

  vtkHardwareSelector(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkHardwareSelector'); // ----------------------------------------------------------------------------

var vtkHardwareSelector$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkHardwareSelector$1 as default, extend, newInstance };
