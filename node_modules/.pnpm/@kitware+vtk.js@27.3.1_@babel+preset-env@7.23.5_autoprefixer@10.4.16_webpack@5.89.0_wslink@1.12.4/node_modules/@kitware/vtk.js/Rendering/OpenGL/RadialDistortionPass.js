import macro from '../../macros.js';
import vtkDataArray from '../../Common/Core/DataArray.js';
import vtkHelper from './Helper.js';
import vtkOpenGLFramebuffer from './Framebuffer.js';
import vtkRenderPass from '../SceneGraph/RenderPass.js';
import vtkVertexArrayObject from './VertexArrayObject.js';
import { Representation } from '../Core/Property/Constants.js';

var vtkErrorMacro = macro.vtkErrorMacro; // ----------------------------------------------------------------------------

function vtkRadialDistortionPass(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkRadialDistortionPass'); // handles radial distortion and calll delegate

  publicAPI.traverse = function (viewNode) {

    if (model.deleted) {
      return;
    } // if values are zero then we are a no-op


    if (model.k1 === 0.0 && model.k2 === 0.0) {
      model.delegates.forEach(function (val) {
        val.traverse(viewNode, publicAPI);
      });
      return;
    } // allocate framebuffer if needed and bind it


    if (model.framebuffer === null) {
      model.framebuffer = vtkOpenGLFramebuffer.newInstance();
    } // rebuild vbo if needed


    if (model.VBOBuildTime.getMTime() < publicAPI.getMTime()) {
      model.tris.setOpenGLRenderWindow(viewNode);
      publicAPI.buildVBO();
    }

    var size = viewNode.getSize();
    model.framebuffer.setOpenGLRenderWindow(viewNode);
    model.framebuffer.saveCurrentBindingsAndBuffers();
    var fbSize = model.framebuffer.getSize();
    var targetSize = [model.renderRatio * size[0], model.renderRatio * size[1]];

    if (fbSize === null || fbSize[0] !== targetSize[0] || fbSize[1] !== targetSize[1]) {
      model.framebuffer.create(targetSize[0], targetSize[1]);
      model.framebuffer.populateFramebuffer();
    }

    model.framebuffer.bind();
    model.delegates.forEach(function (val) {
      val.traverse(viewNode, publicAPI);
    }); // now draw the distorted values

    model.framebuffer.restorePreviousBindingsAndBuffers();
    var gl = viewNode.getContext();

    if (model.copyShader === null) {
      model.copyShader = viewNode.getShaderCache().readyShaderProgramArray(['//VTK::System::Dec', 'attribute vec4 vertexDC;', 'attribute vec2 tcoordTC;', 'varying vec2 tcoord;', 'void main() { tcoord = tcoordTC; gl_Position = vertexDC; }'].join('\n'), ['//VTK::System::Dec', '//VTK::Output::Dec', 'uniform sampler2D distTexture;', 'varying vec2 tcoord;', 'void main() { gl_FragData[0] = texture2D(distTexture,tcoord); }'].join('\n'), '');
      var program = model.copyShader;
      model.copyVAO = vtkVertexArrayObject.newInstance();
      model.copyVAO.setOpenGLRenderWindow(viewNode);
      model.tris.getCABO().bind();

      if (!model.copyVAO.addAttributeArray(program, model.tris.getCABO(), 'vertexDC', model.tris.getCABO().getVertexOffset(), model.tris.getCABO().getStride(), gl.FLOAT, 3, gl.FALSE)) {
        vtkErrorMacro('Error setting vertexDC in copy shader VAO.');
      }

      if (!model.copyVAO.addAttributeArray(program, model.tris.getCABO(), 'tcoordTC', model.tris.getCABO().getTCoordOffset(), model.tris.getCABO().getStride(), gl.FLOAT, 2, gl.FALSE)) {
        vtkErrorMacro('Error setting vertexDC in copy shader VAO.');
      }
    } else {
      viewNode.getShaderCache().readyShaderProgram(model.copyShader);
    }

    gl.viewport(0, 0, size[0], size[1]);
    gl.scissor(0, 0, size[0], size[1]); // activate texture

    var tex = model.framebuffer.getColorTexture();
    tex.activate();
    model.copyShader.setUniformi('distTexture', tex.getTextureUnit()); // render quad

    gl.drawArrays(gl.TRIANGLES, 0, model.tris.getCABO().getElementCount());
    tex.deactivate();
  };

  publicAPI.buildVBO = function () {
    var xdim = 20;
    var xtotal = xdim * 2;
    var ydim = 20;
    var ptsArray = new Float32Array(3 * xtotal * ydim);
    var tcoordArray = new Float32Array(2 * xtotal * ydim);
    var count = 0;
    model.renderRatio = 1.0 + model.k1 + model.k2;
    var shrink = 1.0 / model.renderRatio;

    for (var y = 0; y < ydim; ++y) {
      var yo = 2.0 * (y / (ydim - 1.0)) - 1.0;
      var ydo = yo - model.cameraCenterY;

      for (var x = 0; x < xdim; ++x) {
        ptsArray[count * 3] = x / (xdim - 1.0) - 1.0;
        ptsArray[count * 3 + 1] = yo;
        ptsArray[count * 3 + 2] = -1.0;
        var xo = 2.0 * (x / (xdim - 1.0)) - 1.0;
        var xdo = xo - model.cameraCenterX1;
        var ro = Math.sqrt(xdo * xdo + ydo * ydo);
        var rf = shrink * (1 + ro * ro * (model.k1 + ro * ro * model.k2));
        tcoordArray[count * 2] = 0.25 + 0.25 * (xdo * rf + model.cameraCenterX1);
        tcoordArray[count * 2 + 1] = 0.5 + 0.5 * (ydo * rf + model.cameraCenterY);
        count++;
      }

      for (var _x = 0; _x < xdim; ++_x) {
        ptsArray[count * 3] = _x / (xdim - 1.0);
        ptsArray[count * 3 + 1] = yo;
        ptsArray[count * 3 + 2] = -1.0;

        var _xo = 2.0 * (_x / (xdim - 1.0)) - 1.0;

        var _xdo = _xo - model.cameraCenterX2;

        var _ro = Math.sqrt(_xdo * _xdo + ydo * ydo);

        var _rf = shrink * (1 + _ro * _ro * (model.k1 + _ro * _ro * model.k2));

        tcoordArray[count * 2] = 0.75 + 0.25 * (_xdo * _rf + model.cameraCenterX2);
        tcoordArray[count * 2 + 1] = 0.5 + 0.5 * (ydo * _rf + model.cameraCenterY);
        count++;
      }
    }

    var cellArray = new Uint16Array((xtotal - 1) * (ydim - 1) * 2 * 4);
    count = 0;

    for (var _y = 0; _y < ydim - 1; ++_y) {
      for (var _x2 = 0; _x2 < xtotal - 1; ++_x2) {
        cellArray[count] = 3;
        cellArray[count + 1] = _x2 + _y * xtotal;
        cellArray[count + 2] = _x2 + _y * xtotal + 1;
        cellArray[count + 3] = _x2 + (_y + 1) * xtotal + 1;
        cellArray[count + 4] = 3;
        cellArray[count + 5] = _x2 + _y * xtotal;
        cellArray[count + 6] = _x2 + (_y + 1) * xtotal + 1;
        cellArray[count + 7] = _x2 + (_y + 1) * xtotal;
        count += 8;
      }
    }

    var points = vtkDataArray.newInstance({
      numberOfComponents: 3,
      values: ptsArray
    });
    points.setName('points');
    var tcoords = vtkDataArray.newInstance({
      numberOfComponents: 2,
      values: tcoordArray
    });
    tcoords.setName('tcoords');
    var cells = vtkDataArray.newInstance({
      numberOfComponents: 1,
      values: cellArray
    });
    model.tris.getCABO().createVBO(cells, 'polys', Representation.SURFACE, {
      points: points,
      tcoords: tcoords,
      cellOffset: 0
    });
    model.VBOBuildTime.modified();
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  copyShader: null,
  framebuffer: null,
  tris: null,
  k1: 0.0,
  k2: 0.0,
  cameraCenterX1: 0.0,
  cameraCenterX2: 0.0,
  cameraCenterY: 0.0,
  renderRatio: 2.0
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  vtkRenderPass.extend(publicAPI, model, initialValues);
  model.VBOBuildTime = {};
  macro.obj(model.VBOBuildTime, {
    mtime: 0
  });
  model.tris = vtkHelper.newInstance();
  macro.setGet(publicAPI, model, ['k1', 'k2', 'cameraCenterY', 'cameraCenterX1', 'cameraCenterX2']);
  macro.get(publicAPI, model, ['framebuffer']); // Object methods

  vtkRadialDistortionPass(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkRadialDistortionPass'); // ----------------------------------------------------------------------------

var index = {
  newInstance: newInstance,
  extend: extend
};

export { index as default, extend, newInstance };
