import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import { vec3, quat, mat4 } from 'gl-matrix';

var AXES = ['-', '=', '+']; // ----------------------------------------------------------------------------

function transformVec3(ain, transform) {
  var vout = new Float64Array(3);
  vec3.transformMat4(vout, ain, transform);
  return vout;
} // ----------------------------------------------------------------------------

function rotateVec3(vec, transform) {
  // transform is a mat4
  var out = vec3.create();
  var q = quat.create();
  mat4.getRotation(q, transform);
  vec3.transformQuat(out, vec, q);
  return out;
} // ----------------------------------------------------------------------------

function handleTypeFromName(name) {
  var _name$split$map = name.split('').map(function (l) {
    return AXES.indexOf(l) - 1;
  }),
      _name$split$map2 = _slicedToArray(_name$split$map, 3),
      i = _name$split$map2[0],
      j = _name$split$map2[1],
      k = _name$split$map2[2];

  if (i * j * k !== 0) {
    return 'corners';
  }

  if (i * j !== 0 || j * k !== 0 || k * i !== 0) {
    return 'edges';
  }

  return 'faces';
}

export { AXES, handleTypeFromName, rotateVec3, transformVec3 };
