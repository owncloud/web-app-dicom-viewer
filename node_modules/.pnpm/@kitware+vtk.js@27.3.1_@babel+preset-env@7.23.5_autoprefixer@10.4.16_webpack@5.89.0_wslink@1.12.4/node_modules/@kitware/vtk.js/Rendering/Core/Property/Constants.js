var Shading = {
  FLAT: 0,
  GOURAUD: 1,
  PHONG: 2
};
var Representation = {
  POINTS: 0,
  WIREFRAME: 1,
  SURFACE: 2
};
var Interpolation = Shading;
var PropertyConst = {
  Shading: Shading,
  Representation: Representation,
  Interpolation: Interpolation
};

export { Interpolation, Representation, Shading, PropertyConst as default };
