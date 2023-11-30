import macro from '../../macros.js';
import vtkCoordinate from './Coordinate.js';
import vtkProp from './Prop.js';
import vtkProperty2D from './Property2D.js';
import { Coordinate } from './Coordinate/Constants.js';

// vtkActor2D methods
// ----------------------------------------------------------------------------

function vtkActor2D(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkActor2D');

  publicAPI.getActors2D = function () {
    return publicAPI;
  };

  publicAPI.getIsOpaque = function () {
    // make sure we have a property
    if (!model.property) {
      // force creation of a property
      publicAPI.getProperty();
    }

    var isOpaque = model.property.getOpacity() >= 1.0; // are we using an opaque texture, if any?

    isOpaque = isOpaque && (!model.texture || !model.texture.isTranslucent());
    return isOpaque;
  };

  publicAPI.hasTranslucentPolygonalGeometry = function () {
    if (model.mapper === null) {
      return false;
    } // make sure we have a property


    if (model.property === null) {
      // force creation of a property
      publicAPI.setProperty(publicAPI.makeProperty());
    } // is this actor opaque ?


    return !publicAPI.getIsOpaque();
  };

  publicAPI.makeProperty = vtkProperty2D.newInstance;

  publicAPI.getProperty = function () {
    if (model.property === null) {
      model.property = publicAPI.makeProperty();
    }

    return model.property;
  }; //----------------------------------------------------------------------------
  // Set the Prop2D's position in display coordinates.


  publicAPI.setDisplayPosition = function (XPos, YPos) {
    model.positionCoordinate.setCoordinateSystem(Coordinate.DISPLAY);
    model.positionCoordinate.setValue(XPos, YPos, 0.0);
  }; //----------------------------------------------------------------------------


  publicAPI.setWidth = function (w) {
    var pos = model.position2Coordinate.getValue();
    model.position2Coordinate.setCoordinateSystemToNormalizedViewport();
    model.position2Coordinate.setValue(w, pos[1]);
  }; //----------------------------------------------------------------------------


  publicAPI.setHeight = function (w) {
    var pos = model.position2Coordinate.getValue();
    model.position2Coordinate.setCoordinateSystemToNormalizedViewport();
    model.position2Coordinate.setValue(pos[0], w);
  }; //----------------------------------------------------------------------------


  publicAPI.getWidth = function () {
    return model.position2Coordinate.getValue()[0];
  }; //----------------------------------------------------------------------------


  publicAPI.getHeight = function () {
    return model.position2Coordinate.getValue()[1];
  };

  publicAPI.getMTime = function () {
    var mt = model.mtime;

    if (model.property !== null) {
      var time = model.property.getMTime();
      mt = time > mt ? time : mt;
    }

    mt = model.positionCoordinate.getMTime() > mt ? model.positionCoordinate.getMTime() : mt;
    mt = model.positionCoordinate2.getMTime() > mt ? model.positionCoordinate2.getMTime() : mt; // TBD: Handle array of textures here.

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

    return mt;
  };

  publicAPI.getBounds = function () {
    // does our mapper support bounds
    if (typeof publicAPI.getMapper().getBounds === 'function') {
      model.useBounds = true;
      return publicAPI.getMapper().getBounds();
    }

    model.useBounds = false;
    return [];
  }; // Description:
  // Return the actual vtkCoordinate reference that the mapper should use
  // to position the actor. This is used internally by the mappers and should
  // be overridden in specialized subclasses and otherwise ignored.


  publicAPI.getActualPositionCoordinate = function () {
    return model.positionCoordinate;
  };

  publicAPI.getActualPositionCoordinate2 = function () {
    return model.positionCoordinate2;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  mapper: null,
  property: null,
  layerNumber: 0,
  positionCoordinate: null,
  positionCoordinate2: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Inheritance

  vtkProp.extend(publicAPI, model, initialValues);
  model.positionCoordinate = vtkCoordinate.newInstance();
  model.positionCoordinate.setCoordinateSystemToViewport();
  model.positionCoordinate2 = vtkCoordinate.newInstance();
  model.positionCoordinate2.setCoordinateSystemToNormalizedViewport();
  model.positionCoordinate2.setValue(0.5, 0.5);
  model.positionCoordinate2.setReferenceCoordinate(model.positionCoordinate); // Build VTK API

  macro.set(publicAPI, model, ['property']);
  macro.setGet(publicAPI, model, ['mapper']); // Object methods

  vtkActor2D(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkActor2D'); // ----------------------------------------------------------------------------

var vtkActor2D$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkActor2D$1 as default, extend, newInstance };
