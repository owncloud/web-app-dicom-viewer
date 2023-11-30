import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import registerWebworker from 'webworker-promise/lib/register';
import { SlicingMode } from '../../../Rendering/Core/ImageMapper/Constants.js';
import { vec3 } from 'gl-matrix';

var globals = {
  // single-component labelmap
  buffer: null,
  dimensions: [0, 0, 0],
  prevPoint: null,
  slicingMode: null // 2D or 3D painting

}; // --------------------------------------------------------------------------

function handlePaintRectangle(_ref) {
  var point1 = _ref.point1,
      point2 = _ref.point2;

  var _point = _slicedToArray(point1, 3),
      x1 = _point[0],
      y1 = _point[1],
      z1 = _point[2];

  var _point2 = _slicedToArray(point2, 3),
      x2 = _point2[0],
      y2 = _point2[1],
      z2 = _point2[2];

  var xstart = Math.max(Math.min(x1, x2), 0);
  var xend = Math.min(Math.max(x1, x2), globals.dimensions[0] - 1);

  if (xstart <= xend) {
    var ystart = Math.max(Math.min(y1, y2), 0);
    var yend = Math.min(Math.max(y1, y2), globals.dimensions[1] - 1);
    var zstart = Math.max(Math.min(z1, z2), 0);
    var zend = Math.min(Math.max(z1, z2), globals.dimensions[2] - 1);
    var jStride = globals.dimensions[0];
    var kStride = globals.dimensions[0] * globals.dimensions[1];

    for (var k = zstart; k <= zend; k++) {
      for (var j = ystart; j <= yend; j++) {
        var index = j * jStride + k * kStride;
        globals.buffer.fill(1, index + xstart, index + xend + 1);
      }
    }
  }
} // --------------------------------------------------------------------------
// center and scale3 are in IJK coordinates


function handlePaintEllipse(_ref2) {
  var center = _ref2.center,
      scale3 = _ref2.scale3;

  var radius3 = _toConsumableArray(scale3);

  var indexCenter = center.map(function (val) {
    return Math.round(val);
  });
  var sliceAxis = -1;

  if (globals.slicingMode != null && globals.slicingMode !== SlicingMode.NONE) {
    sliceAxis = globals.slicingMode % 3;
  }

  var yStride = globals.dimensions[0];
  var zStride = globals.dimensions[0] * globals.dimensions[1];

  var _indexCenter = _slicedToArray(indexCenter, 3),
      xmin = _indexCenter[0],
      ymin = _indexCenter[1],
      zmin = _indexCenter[2];

  var _indexCenter2 = _slicedToArray(indexCenter, 3),
      xmax = _indexCenter2[0],
      ymax = _indexCenter2[1],
      zmax = _indexCenter2[2];

  if (sliceAxis !== 2) {
    zmin = Math.round(Math.max(indexCenter[2] - radius3[2], 0));
    zmax = Math.round(Math.min(indexCenter[2] + radius3[2], globals.dimensions[2] - 1));
  }

  for (var z = zmin; z <= zmax; z++) {
    var dz = 0;

    if (sliceAxis !== 2) {
      dz = (indexCenter[2] - z) / radius3[2];
    }

    var dzSquared = dz * dz;

    if (dzSquared <= 1) {
      var ay = radius3[1] * Math.sqrt(1 - dzSquared);

      if (sliceAxis !== 1) {
        ymin = Math.round(Math.max(indexCenter[1] - ay, 0));
        ymax = Math.round(Math.min(indexCenter[1] + ay, globals.dimensions[1] - 1));
      }

      for (var y = ymin; y <= ymax; y++) {
        var dy = 0;

        if (sliceAxis !== 1) {
          dy = (indexCenter[1] - y) / radius3[1];
        }

        var dySquared = dy * dy;

        if (dySquared + dzSquared <= 1) {
          if (sliceAxis !== 0) {
            var ax = radius3[0] * Math.sqrt(1 - dySquared - dzSquared);
            xmin = Math.round(Math.max(indexCenter[0] - ax, 0));
            xmax = Math.round(Math.min(indexCenter[0] + ax, globals.dimensions[0] - 1));
          }

          if (xmin <= xmax) {
            var index = y * yStride + z * zStride;
            globals.buffer.fill(1, index + xmin, index + xmax + 1);
          }
        }
      }
    }
  }
} // --------------------------------------------------------------------------


function handlePaint(_ref3) {
  var point = _ref3.point,
      radius = _ref3.radius;

  if (!globals.prevPoint) {
    globals.prevPoint = point;
  } // DDA params


  var delta = [point[0] - globals.prevPoint[0], point[1] - globals.prevPoint[1], point[2] - globals.prevPoint[2]];
  var inc = [1, 1, 1];

  for (var i = 0; i < 3; i++) {
    if (delta[i] < 0) {
      delta[i] = -delta[i];
      inc[i] = -1;
    }
  }

  var step = Math.max.apply(Math, delta); // DDA

  var thresh = [step, step, step];

  var pt = _toConsumableArray(globals.prevPoint);

  for (var s = 0; s <= step; s++) {
    handlePaintEllipse({
      center: pt,
      scale3: radius
    });

    for (var ii = 0; ii < 3; ii++) {
      thresh[ii] -= delta[ii];

      if (thresh[ii] <= 0) {
        thresh[ii] += step;
        pt[ii] += inc[ii];
      }
    }
  }

  globals.prevPoint = point;
} // --------------------------------------------------------------------------


function handlePaintTriangles(_ref4) {
  var triangleList = _ref4.triangleList;
  // debugger;
  var triangleCount = Math.floor(triangleList.length / 9);

  for (var i = 0; i < triangleCount; i++) {
    var point0 = triangleList.subarray(9 * i + 0, 9 * i + 3);
    var point1 = triangleList.subarray(9 * i + 3, 9 * i + 6);
    var point2 = triangleList.subarray(9 * i + 6, 9 * i + 9);
    var v1 = [0, 0, 0];
    var v2 = [0, 0, 0];
    vec3.subtract(v1, point1, point0);
    vec3.subtract(v2, point2, point0);
    var step1 = [0, 0, 0];
    var numStep1 = 2 * Math.max(Math.abs(v1[0]), Math.abs(v1[1]), Math.abs(v1[2]));
    vec3.scale(step1, v1, 1 / numStep1);
    var step2 = [0, 0, 0];
    var numStep2 = 2 * Math.max(Math.abs(v2[0]), Math.abs(v2[1]), Math.abs(v2[2]));
    vec3.scale(step2, v2, 1 / numStep2);
    var jStride = globals.dimensions[0];
    var kStride = globals.dimensions[0] * globals.dimensions[1];

    for (var u = 0; u <= numStep1 + 1; u++) {
      var maxV = numStep2 - u * (numStep2 / numStep1);

      for (var v = 0; v <= maxV + 1; v++) {
        var point = _toConsumableArray(point0);

        vec3.scaleAndAdd(point, point, step1, u);
        vec3.scaleAndAdd(point, point, step2, v);
        point[0] = Math.round(point[0]);
        point[1] = Math.round(point[1]);
        point[2] = Math.round(point[2]);

        if (point[0] >= 0 && point[0] < globals.dimensions[0] && point[1] >= 0 && point[1] < globals.dimensions[1] && point[2] >= 0 && point[2] < globals.dimensions[2]) {
          globals.buffer[point[0] + jStride * point[1] + kStride * point[2]] = 1;
        }
      }
    }
  }
} // --------------------------------------------------------------------------


registerWebworker().operation('start', function (_ref5) {
  var bufferType = _ref5.bufferType,
      dimensions = _ref5.dimensions,
      slicingMode = _ref5.slicingMode;

  if (!globals.buffer) {
    var bufferSize = dimensions[0] * dimensions[1] * dimensions[2];
    /* eslint-disable-next-line */

    globals.buffer = new self[bufferType](bufferSize);
    globals.dimensions = dimensions;
    globals.prevPoint = null;
    globals.slicingMode = slicingMode;
  }
}).operation('paint', handlePaint).operation('paintRectangle', handlePaintRectangle).operation('paintEllipse', handlePaintEllipse).operation('paintTriangles', handlePaintTriangles).operation('end', function () {
  var response = new registerWebworker.TransferableResponse(globals.buffer.buffer, [globals.buffer.buffer]);
  globals.buffer = null;
  return response;
});
