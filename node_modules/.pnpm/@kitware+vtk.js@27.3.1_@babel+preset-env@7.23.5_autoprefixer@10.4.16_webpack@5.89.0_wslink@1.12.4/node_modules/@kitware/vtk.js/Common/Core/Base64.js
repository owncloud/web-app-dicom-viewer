/* eslint-disable no-bitwise */
// ----------------------------------------------------------------------------
// Decoding infrastructure
// ----------------------------------------------------------------------------
var REVERSE_LOOKUP = [];
REVERSE_LOOKUP['-'.charCodeAt(0)] = 62;
REVERSE_LOOKUP['_'.charCodeAt(0)] = 63;
var BASE64_CODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

for (var i = 0; i < BASE64_CODE.length; i++) {
  REVERSE_LOOKUP[BASE64_CODE.charCodeAt(i)] = i;
} // ----------------------------------------------------------------------------
// Base64 analysis
// ----------------------------------------------------------------------------


function isValidChar(c) {
  return REVERSE_LOOKUP[c.charCodeAt(0)] !== undefined;
}

function extractChunks(b64Str) {
  var strSize = b64Str.length;
  var chunks = [];
  var currentChunk = null;

  for (var _i = 0; _i < strSize; _i++) {
    if (isValidChar(b64Str[_i])) {
      if (!currentChunk) {
        currentChunk = {
          start: _i,
          count: 0
        };
      }

      currentChunk.count++;
      currentChunk.end = _i;
    } else if (b64Str[_i] === '=' && currentChunk) {
      // End of chunk (found padding char)
      chunks.push(currentChunk);
      currentChunk = null;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function writeChunk(b64Str, chunk, dstOffset, uint8) {
  var start = chunk.start,
      count = chunk.count;
  var remain = count % 4;
  var fourCharProcessCount = Math.floor(count / 4);
  var charIdx = start;
  var tmp = null;
  var offset = dstOffset; // Handle 4=>3

  for (var _i2 = 0; _i2 < fourCharProcessCount; _i2++) {
    while (!isValidChar(b64Str[charIdx])) {
      charIdx++;
    }

    tmp = REVERSE_LOOKUP[b64Str.charCodeAt(charIdx++)] << 18;

    while (!isValidChar(b64Str[charIdx])) {
      charIdx++;
    }

    tmp |= REVERSE_LOOKUP[b64Str.charCodeAt(charIdx++)] << 12;

    while (!isValidChar(b64Str[charIdx])) {
      charIdx++;
    }

    tmp |= REVERSE_LOOKUP[b64Str.charCodeAt(charIdx++)] << 6;

    while (!isValidChar(b64Str[charIdx])) {
      charIdx++;
    }

    tmp |= REVERSE_LOOKUP[b64Str.charCodeAt(charIdx++)];
    uint8[offset++] = tmp >> 16 & 0xff;
    uint8[offset++] = tmp >> 8 & 0xff;
    uint8[offset++] = tmp & 0xff;
  } // Handle remain


  switch (remain) {
    case 3:
      while (!isValidChar(b64Str[charIdx])) {
        charIdx++;
      }

      tmp = REVERSE_LOOKUP[b64Str.charCodeAt(charIdx++)] << 10;

      while (!isValidChar(b64Str[charIdx])) {
        charIdx++;
      }

      tmp |= REVERSE_LOOKUP[b64Str.charCodeAt(charIdx++)] << 4;

      while (!isValidChar(b64Str[charIdx])) {
        charIdx++;
      }

      tmp |= REVERSE_LOOKUP[b64Str.charCodeAt(charIdx++)] >> 2;
      uint8[offset++] = tmp >> 8 & 0xff;
      uint8[offset++] = tmp & 0xff;
      break;

    case 2:
      while (!isValidChar(b64Str[charIdx])) {
        charIdx++;
      }

      tmp = REVERSE_LOOKUP[b64Str.charCodeAt(charIdx++)] << 2;

      while (!isValidChar(b64Str[charIdx])) {
        charIdx++;
      }

      tmp |= REVERSE_LOOKUP[b64Str.charCodeAt(charIdx++)] >> 4;
      uint8[offset++] = tmp & 0xff;
      break;

    case 1:
      throw new Error('BASE64: remain 1 should not happen');
  }

  return offset;
}

function toArrayBuffer(b64Str) {
  var chunks = extractChunks(b64Str);
  var totalEncodedLength = chunks[chunks.length - 1].end + 1;
  var padding = (4 - totalEncodedLength % 4) % 4; // -length mod 4
  // Any padding chars in the middle of b64Str is to be interpreted as \x00,
  // whereas the terminating padding chars are to be interpreted as literal padding.

  var totalSize = (totalEncodedLength + padding) * 3 / 4 - padding;
  var arrayBuffer = new ArrayBuffer(totalSize);
  var view = new Uint8Array(arrayBuffer);
  var dstOffset = 0;

  for (var _i3 = 0; _i3 < chunks.length; _i3++) {
    dstOffset += writeChunk(b64Str, chunks[_i3], dstOffset, view);
    dstOffset += (4 - chunks[_i3].count % 4) % 4;
  }

  return arrayBuffer;
}

function encodeTriplet(v1, v2, v3) {
  var triplet = (v1 << 16) + (v2 << 8) + v3;
  return BASE64_CODE[triplet >> 18] + BASE64_CODE[triplet >> 12 & 0x3f] + BASE64_CODE[triplet >> 6 & 0x3f] + BASE64_CODE[triplet & 0x3f];
}

function fromArrayBuffer(ab) {
  var uint8 = new Uint8Array(ab);
  var leftoverLength = ab.byteLength % 3;
  var maxTripletIndex = ab.byteLength - leftoverLength;
  var segments = Array(maxTripletIndex / 3);

  for (var _i4 = 0; _i4 < segments.length; _i4++) {
    var bufOffset = _i4 * 3;
    segments[_i4] = encodeTriplet(uint8[bufOffset], uint8[bufOffset + 1], uint8[bufOffset + 2]);
  }

  if (leftoverLength > 0) {
    var segment = encodeTriplet(uint8[maxTripletIndex], uint8[maxTripletIndex + 1] || 0, uint8[maxTripletIndex + 2] || 0);

    if (leftoverLength === 1) {
      segments.push("".concat(segment.substr(0, 2), "=="));
    } else if (leftoverLength === 2) {
      segments.push("".concat(segment.substr(0, 3), "="));
    }
  }

  return segments.join('');
}
var Base64 = {
  toArrayBuffer: toArrayBuffer,
  fromArrayBuffer: fromArrayBuffer
};

export { Base64 as default, fromArrayBuffer, toArrayBuffer };
