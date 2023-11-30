var ColorMode = {
  DEFAULT: 0,
  MAP_SCALARS: 1,
  DIRECT_SCALARS: 2
};
var ScalarMode = {
  DEFAULT: 0,
  USE_POINT_DATA: 1,
  USE_CELL_DATA: 2,
  USE_POINT_FIELD_DATA: 3,
  USE_CELL_FIELD_DATA: 4,
  USE_FIELD_DATA: 5
};
var GetArray = {
  BY_ID: 0,
  BY_NAME: 1
};
var Constants = {
  ColorMode: ColorMode,
  GetArray: GetArray,
  ScalarMode: ScalarMode
};

export { ColorMode, GetArray, ScalarMode, Constants as default };
