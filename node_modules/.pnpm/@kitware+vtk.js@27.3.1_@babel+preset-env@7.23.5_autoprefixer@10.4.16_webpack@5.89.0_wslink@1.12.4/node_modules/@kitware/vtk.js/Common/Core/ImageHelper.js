import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import vtkImageData from '../DataModel/ImageData.js';
import vtkDataArray from './DataArray.js';

/**
 * Takes a canvas and converts it to a vtkImageData.
 *
 * Optionally supply a bounding box to get a particular subset of the canvas.
 *
 * @param canvas       The HTML canvas to convert
 * @param boundingBox  A bounding box of type [top, left, width, height]
 */

function canvasToImageData(canvas) {
  var boundingBox = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0, 0];

  var _boundingBox = _slicedToArray(boundingBox, 4),
      top = _boundingBox[0],
      left = _boundingBox[1],
      width = _boundingBox[2],
      height = _boundingBox[3];

  var ctxt = canvas.getContext('2d');
  var idata = ctxt.getImageData(top, left, width || canvas.width, height || canvas.height);
  var imageData = vtkImageData.newInstance({
    type: 'vtkImageData'
  });
  imageData.setOrigin(0, 0, 0);
  imageData.setSpacing(1, 1, 1);
  imageData.setExtent(0, (width || canvas.width) - 1, 0, (height || canvas.height) - 1, 0, 0);
  var scalars = vtkDataArray.newInstance({
    numberOfComponents: 4,
    values: new Uint8Array(idata.data.buffer)
  });
  scalars.setName('scalars');
  imageData.getPointData().setScalars(scalars);
  return imageData;
}
/**
 * Converts an Image object to a vtkImageData.
 */


function imageToImageData(image) {
  var transform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    flipX: false,
    flipY: false,
    rotate: 0
  };
  var canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  var ctx = canvas.getContext('2d');
  var flipX = transform.flipX,
      flipY = transform.flipY,
      rotate = transform.rotate;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.rotate(rotate * Math.PI / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  return canvasToImageData(canvas);
}

var ImageHelper = {
  canvasToImageData: canvasToImageData,
  imageToImageData: imageToImageData
};

export { ImageHelper as default };
