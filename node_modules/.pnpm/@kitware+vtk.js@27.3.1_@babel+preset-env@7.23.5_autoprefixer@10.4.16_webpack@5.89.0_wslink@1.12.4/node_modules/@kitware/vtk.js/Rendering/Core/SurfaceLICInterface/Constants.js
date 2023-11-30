var ContrastEnhanceMode = {
  NONE: 0,
  LIC: 1,
  COLOR: 2,
  BOTH: 3
};
var NoiseType = {
  UNIFORM: 0,
  GAUSSIAN: 1
};
var ColorMode = {
  BLEND: 0,
  MULTIPLY: 1
};
var Constants = {
  ColorMode: ColorMode,
  ContrastEnhanceMode: ContrastEnhanceMode,
  NoiseType: NoiseType
};

export { ColorMode, ContrastEnhanceMode, NoiseType, Constants as default };
