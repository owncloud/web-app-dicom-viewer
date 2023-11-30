var VaryRadius = {
  VARY_RADIUS_OFF: 0,
  // default
  VARY_RADIUS_BY_SCALAR: 1,
  VARY_RADIUS_BY_VECTOR: 2,
  VARY_RADIUS_BY_ABSOLUTE_SCALAR: 3
};
var GenerateTCoords = {
  TCOORDS_OFF: 0,
  // default
  TCOORDS_FROM_NORMALIZED_LENGTH: 1,
  TCOORDS_FROM_LENGTH: 2,
  TCOORDS_FROM_SCALARS: 3
};
var Constants = {
  VaryRadius: VaryRadius,
  GenerateTCoords: GenerateTCoords
};

export { GenerateTCoords, VaryRadius, Constants as default };
