import _defineProperty from '@babel/runtime/helpers/defineProperty';

var _ShapeBehavior;

var BehaviorCategory = {
  POINTS: 'POINTS',
  PLACEMENT: 'PLACEMENT',
  RATIO: 'RATIO'
};
var ShapeBehavior = (_ShapeBehavior = {}, _defineProperty(_ShapeBehavior, BehaviorCategory.POINTS, {
  CORNER_TO_CORNER: 0,
  CENTER_TO_CORNER: 1,
  RADIUS: 2,
  DIAMETER: 3
}), _defineProperty(_ShapeBehavior, BehaviorCategory.PLACEMENT, {
  CLICK: 0,
  DRAG: 1,
  CLICK_AND_DRAG: 2
}), _defineProperty(_ShapeBehavior, BehaviorCategory.RATIO, {
  FIXED: 0,
  FREE: 1
}), _ShapeBehavior);
var TextPosition = {
  MIN: 'MIN',
  CENTER: 'CENTER',
  MAX: 'MAX'
};

export { BehaviorCategory, ShapeBehavior, TextPosition, ShapeBehavior as default };
