/* eslint-disable no-bitwise */
var floatView = new Float32Array(1);
var int32View = new Int32Array(floatView.buffer);
/* eslint-disable no-bitwise */

/* This method is faster than the OpenEXR implementation (very often
 * used, eg. in Ogre), with the additional benefit of rounding, inspired
 * by James Tursa?s half-precision code. */

function toHalf(val) {
  floatView[0] = val;
  var x = int32View[0];
  var bits = x >> 16 & 0x8000;
  /* Get the sign */

  var m = x >> 12 & 0x07ff;
  /* Keep one extra bit for rounding */

  var e = x >> 23 & 0xff;
  /* Using int is faster here */

  /* If zero, or denormal, or exponent underflows too much for a denormal
   * half, return signed zero. */

  if (e < 103) {
    return bits;
  }
  /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */


  if (e > 142) {
    bits |= 0x7c00;
    /* If exponent was 0xff and one mantissa bit was set, it means NaN,
     * not Inf, so make sure we set one mantissa bit too. */

    bits |= (e === 255 ? 0 : 1) && x & 0x007fffff;
    return bits;
  }
  /* If exponent underflows but not too much, return a denormal */


  if (e < 113) {
    m |= 0x0800;
    /* Extra rounding may overflow and set mantissa to 0 and exponent
     * to 1, which is OK. */

    bits |= (m >> 114 - e) + (m >> 113 - e & 1);
    return bits;
  }

  bits |= e - 112 << 10 | m >> 1;
  /* Extra rounding. An overflow will set mantissa to 0 and increment
   * the exponent, which is OK. */

  bits += m & 1;
  return bits;
}

function fromHalf(h) {
  var s = (h & 0x8000) >> 15;
  var e = (h & 0x7c00) >> 10;
  var f = h & 0x03ff;

  if (e === 0) {
    return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10));
  }

  if (e === 0x1f) {
    return f ? NaN : (s ? -1 : 1) * Infinity;
  }

  return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / Math.pow(2, 10));
}

var HalfFloat = {
  fromHalf: fromHalf,
  toHalf: toHalf
};

export { HalfFloat as default };
