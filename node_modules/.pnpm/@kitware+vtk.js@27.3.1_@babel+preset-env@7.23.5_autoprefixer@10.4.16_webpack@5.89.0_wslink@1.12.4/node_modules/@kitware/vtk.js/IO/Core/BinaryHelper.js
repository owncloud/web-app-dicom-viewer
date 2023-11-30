/**
 * Converts a binary buffer in an ArrayBuffer to a string.
 *
 * Note this does not take encoding into consideration, so don't
 * expect proper Unicode or any other encoding.
 */
function arrayBufferToString(arrayBuffer) {
  var decoder = new TextDecoder('latin1');
  return decoder.decode(arrayBuffer);
}
/**
 * Extracts binary data out of a file ArrayBuffer given a prefix/suffix.
 */


function extractBinary(arrayBuffer, prefixRegex) {
  var suffixRegex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var str = arrayBufferToString(arrayBuffer);
  var prefixMatch = prefixRegex.exec(str);

  if (!prefixMatch) {
    return {
      text: str
    };
  }

  var dataStartIndex = prefixMatch.index + prefixMatch[0].length;
  var strFirstHalf = str.substring(0, dataStartIndex);
  var retVal = null;
  var suffixMatch = suffixRegex ? suffixRegex.exec(str) : null;

  if (suffixMatch) {
    var strSecondHalf = str.substr(suffixMatch.index);
    retVal = {
      text: strFirstHalf + strSecondHalf,
      binaryBuffer: arrayBuffer.slice(dataStartIndex, suffixMatch.index)
    };
  } else {
    // no suffix, so just take all the data starting from dataStartIndex
    retVal = {
      text: strFirstHalf,
      binaryBuffer: arrayBuffer.slice(dataStartIndex)
    };
  }

  return retVal;
}

var BinaryHelper = {
  arrayBufferToString: arrayBufferToString,
  extractBinary: extractBinary
};

export { BinaryHelper as default };
