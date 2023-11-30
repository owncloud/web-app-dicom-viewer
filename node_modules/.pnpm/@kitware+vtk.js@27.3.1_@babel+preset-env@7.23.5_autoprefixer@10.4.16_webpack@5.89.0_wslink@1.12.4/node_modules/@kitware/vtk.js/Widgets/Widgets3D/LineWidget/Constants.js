var ShapeType = {
  // NONE is a sphere handle always invisible even on mouseover, which
  // prevents user from moving handle once it is placed
  NONE: 'voidSphere',
  // 3D handles
  SPHERE: 'sphere',
  CUBE: 'cube',
  CONE: 'cone',
  // 2D handles
  ARROWHEAD3: 'triangle',
  ARROWHEAD4: '4pointsArrowHead',
  ARROWHEAD6: '6pointsArrowHead',
  STAR: 'star',
  DISK: 'disk',
  CIRCLE: 'circle',
  VIEWFINDER: 'viewFinder'
};
var Shapes2D = [ShapeType.ARROWHEAD3, ShapeType.ARROWHEAD4, ShapeType.ARROWHEAD6, ShapeType.STAR, ShapeType.DISK, ShapeType.CIRCLE, ShapeType.VIEWFINDER];
var Shapes3D = [ShapeType.SPHERE, ShapeType.CUBE, ShapeType.CONE];
var ShapesOrientable = [ShapeType.CONE, ShapeType.ARROWHEAD3, ShapeType.ARROWHEAD4, ShapeType.ARROWHEAD6];
var Constants = {
  ShapeType: ShapeType,
  Shapes2D: Shapes2D,
  Shapes3D: Shapes3D,
  ShapesOrientable: ShapesOrientable
};

export { ShapeType, Shapes2D, Shapes3D, ShapesOrientable, Constants as default };
