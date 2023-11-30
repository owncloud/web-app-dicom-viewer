import _slicedToArray from '@babel/runtime/helpers/slicedToArray';

function identity(i) {
  return i;
}

function toNativeType(str) {
  if (str === null || str === 'null') {
    return null;
  }

  if (str === 'true') {
    return true;
  }

  if (str === 'false') {
    return false;
  }

  if (str === undefined || str === 'undefined') {
    return undefined;
  }

  if (str[0] === '[' && str[str.length - 1] === ']') {
    return str.substring(1, str.length - 1).split(',').map(function (s) {
      return toNativeType(s.trim());
    });
  }

  if (str === '' || Number.isNaN(Number(str))) {
    return str;
  }

  return Number(str);
}

function extractURLParameters() {
  var castToNativeType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window.location.search;
  var summary = {};
  var convert = castToNativeType ? toNativeType : identity;
  var queryTokens = (query || '').replace(/#.*/, '') // remove hash query
  .replace('?', '') // Remove ? from the head
  .split('&'); // extract token pair

  queryTokens.forEach(function (token) {
    var _token$split$map = token.split('=').map(function (s) {
      return decodeURIComponent(s);
    }),
        _token$split$map2 = _slicedToArray(_token$split$map, 2),
        key = _token$split$map2[0],
        value = _token$split$map2[1];

    if (key) {
      summary[key] = value ? convert(value) : true;
    }
  });
  return summary;
}

var vtkURLExtract = {
  toNativeType: toNativeType,
  extractURLParameters: extractURLParameters
};

export { vtkURLExtract as default };
