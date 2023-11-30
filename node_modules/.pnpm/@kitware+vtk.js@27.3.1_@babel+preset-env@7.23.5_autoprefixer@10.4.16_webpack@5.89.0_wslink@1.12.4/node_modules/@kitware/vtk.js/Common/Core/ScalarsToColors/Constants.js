var VectorMode = {
  MAGNITUDE: 0,
  COMPONENT: 1,
  RGBCOLORS: 2
};
var ScalarMappingTarget = {
  LUMINANCE: 1,
  LUMINANCE_ALPHA: 2,
  RGB: 3,
  RGBA: 4
};
var vtkScalarsToColors = {
  VectorMode: VectorMode,
  ScalarMappingTarget: ScalarMappingTarget
};

export { ScalarMappingTarget, VectorMode, vtkScalarsToColors as default };
