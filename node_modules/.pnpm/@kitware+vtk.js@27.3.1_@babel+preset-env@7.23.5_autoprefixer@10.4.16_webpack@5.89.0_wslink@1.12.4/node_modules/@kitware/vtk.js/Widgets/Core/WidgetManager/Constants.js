var ViewTypes = {
  DEFAULT: 0,
  GEOMETRY: 1,
  SLICE: 2,
  VOLUME: 3,
  YZ_PLANE: 4,
  // Sagittal
  XZ_PLANE: 5,
  // Coronal
  XY_PLANE: 6 // Axial

};
var RenderingTypes = {
  PICKING_BUFFER: 0,
  FRONT_BUFFER: 1
};
var CaptureOn = {
  MOUSE_MOVE: 0,
  MOUSE_RELEASE: 1
};
var WidgetManagerConst = {
  ViewTypes: ViewTypes,
  RenderingTypes: RenderingTypes,
  CaptureOn: CaptureOn
};

export { CaptureOn, RenderingTypes, ViewTypes, WidgetManagerConst as default };
