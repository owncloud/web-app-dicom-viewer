var TYPE_MAPPING = {};
function has(type) {
  return !!TYPE_MAPPING[type];
}
function get() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'http';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return TYPE_MAPPING[type](options);
}
function registerType(type, fn) {
  TYPE_MAPPING[type] = fn;
}
var DataAccessHelper = {
  get: get,
  has: has,
  registerType: registerType
};

export { DataAccessHelper as default, get, has, registerType };
