import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import macro from '../../macros.js';
import vtkCellArray from '../../Common/Core/CellArray.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';

var vtkErrorMacro = macro.vtkErrorMacro;

var SegmentAgregator = /*#__PURE__*/function () {
  function SegmentAgregator() {
    _classCallCheck(this, SegmentAgregator);

    this.segmentMapping = {};
    this.segments = [null]; // to force first id to be 1

    this.faces = [];
  }

  _createClass(SegmentAgregator, [{
    key: "addSegment",
    value: function addSegment(segment) {
      var first = segment[0];
      var last = segment[segment.length - 1];

      if (first === last || segment.length < 2) {
        return;
      }

      var mappingFirst = this.segmentMapping[first];
      var mappingLast = this.segmentMapping[last];

      if (mappingFirst !== undefined && mappingLast !== undefined) {
        if (Math.abs(mappingFirst) === Math.abs(mappingLast)) {
          // This make a closing loop
          var idx = mappingFirst < mappingLast ? mappingLast : mappingFirst;
          var seg = this.segments[idx];

          if (mappingFirst > 0) {
            for (var i = 1; i < segment.length - 1; i++) {
              seg.push(segment[i]);
            }
          } else {
            for (var _i = 1; _i < segment.length - 1; _i++) {
              seg.unshift(segment[segment.length - 1 - _i]);
            }
          }

          this.faces.push(seg);
          this.segments[idx] = null;
          this.segmentMapping[first] = undefined;
          this.segmentMapping[last] = undefined;
        } else {
          // we need to merge segments
          // strategie:
          // => remove and add them again in special order to induce merge
          var idxHead = Math.abs(mappingFirst);
          var idxTail = Math.abs(mappingLast);
          var segHead = this.segments[idxHead];
          var segTail = this.segments[idxTail];
          this.segments[idxHead] = null;
          this.segments[idxTail] = null;
          this.segmentMapping[segHead[0]] = undefined;
          this.segmentMapping[segTail[0]] = undefined;
          this.segmentMapping[segHead[segHead.length - 1]] = undefined;
          this.segmentMapping[segTail[segTail.length - 1]] = undefined; // This will lead to a single segment

          this.addSegment(segment);
          this.addSegment(segHead);
          this.addSegment(segTail);
        }
      } else if (mappingFirst !== undefined) {
        if (mappingFirst > 0) {
          // The head of our segment match the tail of the existing one
          var _seg = this.segments[mappingFirst];

          for (var _i2 = 1; _i2 < segment.length; _i2++) {
            _seg.push(segment[_i2]);
          } // record new tail


          this.segmentMapping[last] = mappingFirst;
        } else {
          // our segment should be reverted and put on the front of the existing one
          var _seg2 = this.segments[-mappingFirst]; // record new head

          this.segmentMapping[last] = mappingFirst;

          for (var _i3 = 1; _i3 < segment.length; _i3++) {
            _seg2.unshift(segment[_i3]);
          }
        } // Erase used connection


        this.segmentMapping[first] = undefined;
      } else if (mappingLast !== undefined) {
        if (mappingLast > 0) {
          // The tail of our segment match the tail of the existing one
          var _seg3 = this.segments[mappingLast];

          for (var _i4 = 1; _i4 < segment.length; _i4++) {
            _seg3.push(segment[segment.length - 1 - _i4]);
          } // record new tail


          this.segmentMapping[first] = mappingLast;
        } else {
          // our segment should be reverted and put on the front of the existing one
          var _seg4 = this.segments[-mappingLast]; // record new head

          this.segmentMapping[first] = mappingLast;

          for (var _i5 = 1; _i5 < segment.length; _i5++) {
            _seg4.unshift(segment[segment.length - _i5 - 1]);
          }
        } // Erase used connection


        this.segmentMapping[last] = undefined;
      } else {
        // store segment for now
        var id = this.segments.length;
        this.segments.push(segment);
        this.segmentMapping[first] = -id;
        this.segmentMapping[last] = id;
      }
    }
  }]);

  return SegmentAgregator;
}(); // ----------------------------------------------------------------------------
// vtkClosedPolyLineToSurfaceFilter methods
// ----------------------------------------------------------------------------


function vtkClosedPolyLineToSurfaceFilter(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkClosedPolyLineToSurfaceFilter'); // --------------------------------------------------------------------------

  publicAPI.requestData = function (inData, outData) {
    // implement requestData
    var input = inData[0];

    if (!input) {
      vtkErrorMacro('Invalid or missing input');
      return;
    }

    var output = vtkPolyData.newInstance();
    output.shallowCopy(input); // Extract faces

    var agregator = new SegmentAgregator();
    var lines = input.getLines().getData();
    var offset = 0;

    while (offset < lines.length) {
      var lineSize = lines[offset++];
      var lineSegment = [];

      for (var i = 0; i < lineSize; i++) {
        lineSegment.push(lines[offset + i]);
      }

      agregator.addSegment(lineSegment);
      offset += lineSize;
    } // Create CellArray for polys


    var faces = agregator.faces;
    var cellArraySize = faces.length;

    for (var _i6 = 0; _i6 < faces.length; _i6++) {
      cellArraySize += faces[_i6].length;
    }

    var cellArray = new Uint16Array(cellArraySize);
    offset = 0;

    for (var _i7 = 0; _i7 < faces.length; _i7++) {
      var face = faces[_i7];
      cellArray[offset++] = face.length;

      for (var j = 0; j < face.length; j++) {
        cellArray[offset++] = face[j];
      }
    }

    output.setPolys(vtkCellArray.newInstance({
      values: cellArray,
      name: 'faces'
    }));
    outData[0] = output;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Make this a VTK object

  macro.obj(publicAPI, model); // Also make it an algorithm with one input and one output

  macro.algo(publicAPI, model, 1, 1); // Object specific methods

  vtkClosedPolyLineToSurfaceFilter(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkClosedPolyLineToSurfaceFilter'); // ----------------------------------------------------------------------------

var vtkClosedPolyLineToSurfaceFilter$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkClosedPolyLineToSurfaceFilter$1 as default, extend, newInstance };
