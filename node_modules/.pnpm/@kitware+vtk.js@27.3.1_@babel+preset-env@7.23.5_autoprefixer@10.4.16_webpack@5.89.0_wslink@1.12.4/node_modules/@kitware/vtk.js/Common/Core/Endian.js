function getEndianness() {
  var a = new ArrayBuffer(4);
  var b = new Uint8Array(a);
  var c = new Uint32Array(a);
  b[0] = 0xa1;
  b[1] = 0xb2;
  b[2] = 0xc3;
  b[3] = 0xd4;
  if (c[0] === 0xd4c3b2a1) return 'LittleEndian';
  if (c[0] === 0xa1b2c3d4) return 'BigEndian';
  return null;
}
var ENDIANNESS = getEndianness();
function swapBytes(buffer, wordSize) {
  if (wordSize < 2) {
    return;
  }

  var bytes = new Int8Array(buffer);
  var size = bytes.length;
  var tempBuffer = [];

  for (var i = 0; i < size; i += wordSize) {
    for (var j = 0; j < wordSize; j++) {
      tempBuffer.push(bytes[i + j]);
    }

    for (var _j = 0; _j < wordSize; _j++) {
      bytes[i + _j] = tempBuffer.pop();
    }
  }
}
var Endian = {
  ENDIANNESS: ENDIANNESS,
  getEndianness: getEndianness,
  swapBytes: swapBytes
};

export { ENDIANNESS, Endian as default, getEndianness, swapBytes };
