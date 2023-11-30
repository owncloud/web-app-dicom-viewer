import { mat4, vec3 } from 'gl-matrix';
import macro from '../../macros.js';
import vtkBoundingBox from '../../Common/DataModel/BoundingBox.js';
import vtkProp3D from './Prop3D.js';
import vtkImageProperty from './ImageProperty.js';

var vtkDebugMacro = macro.vtkDebugMacro; // ----------------------------------------------------------------------------
// vtkImageSlice methods
// ----------------------------------------------------------------------------

function vtkImageSlice(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkImageSlice');

  publicAPI.getActors = function () {
    return publicAPI;
  };

  publicAPI.getImages = function () {
    return publicAPI;
  };

  publicAPI.getIsOpaque = function () {
    if (model.forceOpaque) {
      return true;
    }

    if (model.forceTranslucent) {
      return false;
    } // make sure we have a property


    if (!model.property) {
      // force creation of a property
      publicAPI.getProperty();
    }

    var isOpaque = model.property.getOpacity() >= 1.0; // are we using an opaque scalar array, if any?

    isOpaque = isOpaque && (!model.mapper || model.mapper.getIsOpaque());
    return isOpaque;
  }; // Always render during opaque pass, to keep the behavior
  // predictable and because depth-peeling kills alpha-blending.
  // In the future, the Renderer should render images in layers,
  // i.e. where each image will have a layer number assigned to it,
  // and the Renderer will do the images in their own pass.


  publicAPI.hasTranslucentPolygonalGeometry = function () {
    return false;
  };

  publicAPI.makeProperty = vtkImageProperty.newInstance;

  publicAPI.getProperty = function () {
    if (model.property === null) {
      model.property = publicAPI.makeProperty();
    }

    return model.property;
  };

  publicAPI.getBounds = function () {
    if (model.mapper === null) {
      return model.bounds;
    } // Check for the special case when the mapper's bounds are unknown


    var bds = model.mapper.getBounds();

    if (!bds || bds.length !== 6) {
      return bds;
    } // Check for the special case when the actor is empty.


    if (bds[0] > bds[1]) {
      model.mapperBounds = bds.concat(); // copy the mapper's bounds

      model.bounds = [1, -1, 1, -1, 1, -1];
      model.boundsMTime.modified();
      return bds;
    } // Check if we have cached values for these bounds - we cache the
    // values returned by model.mapper.getBounds() and we store the time
    // of caching. If the values returned this time are different, or
    // the modified time of this class is newer than the cached time,
    // then we need to rebuild.


    var zip = function zip(rows) {
      return rows[0].map(function (_, c) {
        return rows.map(function (row) {
          return row[c];
        });
      });
    };

    if (!model.mapperBounds || !zip([bds, model.mapperBounds]).reduce(function (a, b) {
      return a && b[0] === b[1];
    }, true) || publicAPI.getMTime() > model.boundsMTime.getMTime()) {
      vtkDebugMacro('Recomputing bounds...');
      model.mapperBounds = bds.map(function (x) {
        return x;
      });
      var bbox = [];
      vtkBoundingBox.getCorners(bds, bbox);
      publicAPI.computeMatrix();
      var tmp4 = new Float64Array(16);
      mat4.transpose(tmp4, model.matrix);
      bbox.forEach(function (pt) {
        return vec3.transformMat4(pt, pt, tmp4);
      });
      /* eslint-disable no-multi-assign */

      model.bounds[0] = model.bounds[2] = model.bounds[4] = Number.MAX_VALUE;
      model.bounds[1] = model.bounds[3] = model.bounds[5] = -Number.MAX_VALUE;
      /* eslint-enable no-multi-assign */

      model.bounds = model.bounds.map(function (d, i) {
        return i % 2 === 0 ? bbox.reduce(function (a, b) {
          return a > b[i / 2] ? b[i / 2] : a;
        }, d) : bbox.reduce(function (a, b) {
          return a < b[(i - 1) / 2] ? b[(i - 1) / 2] : a;
        }, d);
      });
      model.boundsMTime.modified();
    }

    return model.bounds;
  };

  publicAPI.getBoundsForSlice = function (slice) {
    var thickness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    // Check for the special case when the mapper's bounds are unknown
    var bds = model.mapper.getBoundsForSlice(slice, thickness);

    if (!bds || bds.length !== 6) {
      return bds;
    } // Check for the special case when the actor is empty.


    if (bds[0] > bds[1]) {
      return bds;
    }

    var bbox = [];
    vtkBoundingBox.getCorners(bds, bbox);
    publicAPI.computeMatrix();
    var tmp4 = new Float64Array(16);
    mat4.transpose(tmp4, model.matrix);
    bbox.forEach(function (pt) {
      return vec3.transformMat4(pt, pt, tmp4);
    });
    var newBounds = [Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE];
    newBounds = newBounds.map(function (d, i) {
      return i % 2 === 0 ? bbox.reduce(function (a, b) {
        return a > b[i / 2] ? b[i / 2] : a;
      }, d) : bbox.reduce(function (a, b) {
        return a < b[(i - 1) / 2] ? b[(i - 1) / 2] : a;
      }, d);
    });
    return newBounds;
  }; //----------------------------------------------------------------------------
  // Get the minimum X bound


  publicAPI.getMinXBound = function () {
    publicAPI.getBounds();
    return model.bounds[0];
  }; // Get the maximum X bound


  publicAPI.getMaxXBound = function () {
    publicAPI.getBounds();
    return model.bounds[1];
  }; // Get the minimum Y bound


  publicAPI.getMinYBound = function () {
    publicAPI.getBounds();
    return model.bounds[2];
  }; // Get the maximum Y bound


  publicAPI.getMaxYBound = function () {
    publicAPI.getBounds();
    return model.bounds[3];
  }; // Get the minimum Z bound


  publicAPI.getMinZBound = function () {
    publicAPI.getBounds();
    return model.bounds[4];
  }; // Get the maximum Z bound


  publicAPI.getMaxZBound = function () {
    publicAPI.getBounds();
    return model.bounds[5];
  };

  publicAPI.getMTime = function () {
    var mt = model.mtime;

    if (model.property !== null) {
      var time = model.property.getMTime();
      mt = time > mt ? time : mt;
    }

    return mt;
  };

  publicAPI.getRedrawMTime = function () {
    var mt = model.mtime;

    if (model.mapper !== null) {
      var time = model.mapper.getMTime();
      mt = time > mt ? time : mt;

      if (model.mapper.getInput() !== null) {
        // FIXME !!! getInputAlgorithm / getInput
        model.mapper.getInputAlgorithm().update();
        time = model.mapper.getInput().getMTime();
        mt = time > mt ? time : mt;
      }
    }

    if (model.property !== null) {
      var _time = model.property.getMTime();

      mt = _time > mt ? _time : mt;

      if (model.property.getRGBTransferFunction() !== null) {
        _time = model.property.getRGBTransferFunction().getMTime();
        mt = _time > mt ? _time : mt;
      }
    }

    return mt;
  };

  publicAPI.getSupportsSelection = function () {
    return model.mapper ? model.mapper.getSupportsSelection() : false;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  mapper: null,
  property: null,
  bounds: [1, -1, 1, -1, 1, -1]
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  vtkProp3D.extend(publicAPI, model, initialValues); // vtkTimeStamp

  model.boundsMTime = {};
  macro.obj(model.boundsMTime); // Build VTK API

  macro.set(publicAPI, model, ['property']);
  macro.setGet(publicAPI, model, ['mapper']);
  macro.getArray(publicAPI, model, ['bounds'], 6); // Object methods

  vtkImageSlice(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkImageSlice'); // ----------------------------------------------------------------------------

var vtkImageSlice$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkImageSlice$1 as default, extend, newInstance };
