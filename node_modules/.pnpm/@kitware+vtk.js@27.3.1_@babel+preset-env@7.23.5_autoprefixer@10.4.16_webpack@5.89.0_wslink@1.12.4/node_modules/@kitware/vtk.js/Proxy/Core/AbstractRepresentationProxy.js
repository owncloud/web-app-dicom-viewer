import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import { setGet, get, proxy, chain } from '../../macros.js';
import vtkProp from '../../Rendering/Core/Prop.js';
import vtkMapper from '../../Rendering/Core/Mapper.js';
import vtkScalarsToColors from '../../Common/Core/ScalarsToColors.js';
import vtkBoundingBox from '../../Common/DataModel/BoundingBox.js';

// vtkAbstractRepresentationProxy methods
// ----------------------------------------------------------------------------

function vtkAbstractRepresentationProxy(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkAbstractRepresentationProxy');

  function updateConnectivity() {
    if (model.input) {
      for (var i = 0; i < model.sourceDependencies.length; ++i) {
        model.sourceDependencies[i].setInputData(model.input.getDataset());
      }
    }
  }

  publicAPI.setInput = function (source) {
    if (model.sourceSubscription) {
      model.sourceSubscription.unsubscribe();
      model.sourceSubscription = null;
    }

    publicAPI.gcPropertyLinks('source');
    model.input = source;
    publicAPI.updateColorByDomain();

    if (model.input) {
      updateConnectivity();
      model.sourceSubscription = model.input.onDatasetChange(updateConnectivity);
    } // Allow dynamic registration of links at the source level


    if (model.links) {
      for (var i = 0; i < model.links.length; i++) {
        var _model$links$i = model.links[i],
            link = _model$links$i.link,
            property = _model$links$i.property,
            persistent = _model$links$i.persistent,
            updateOnBind = _model$links$i.updateOnBind,
            type = _model$links$i.type;

        if (type === undefined || type === 'source') {
          var sLink = source.getPropertyLink(link, persistent);
          publicAPI.registerPropertyLinkForGC(sLink, 'source');
          sLink.bind(publicAPI, property, updateOnBind);
        }
      }
    }
  };

  publicAPI.getInputDataSet = function () {
    return model.input ? model.input.getDataset() : null;
  };

  publicAPI.getDataArray = function (arrayName, arrayLocation) {
    var _publicAPI$getColorBy = publicAPI.getColorBy(),
        _publicAPI$getColorBy2 = _slicedToArray(_publicAPI$getColorBy, 2),
        selectedArray = _publicAPI$getColorBy2[0],
        selectedLocation = _publicAPI$getColorBy2[1];

    var ds = publicAPI.getInputDataSet();
    var fields = ds ? ds.getReferenceByName(arrayLocation || selectedLocation) : null;
    var array = fields ? fields.getArrayByName(arrayName || selectedArray) : null;
    return array;
  };

  publicAPI.getLookupTableProxy = function (arrayName) {
    var arrayNameToUse = arrayName || publicAPI.getColorBy()[0];

    if (arrayNameToUse) {
      return model.proxyManager.getLookupTable(arrayNameToUse);
    }

    return null;
  }; // In place edits, no need to re-assign it...


  publicAPI.setLookupTableProxy = function () {};

  publicAPI.getPiecewiseFunctionProxy = function (arrayName) {
    var arrayNameToUse = arrayName || publicAPI.getColorBy()[0];

    if (arrayNameToUse) {
      return model.proxyManager.getPiecewiseFunction(arrayNameToUse);
    }

    return null;
  }; // In place edits, no need to re-assign it...


  publicAPI.setPiecewiseFunctionProxy = function () {};

  publicAPI.rescaleTransferFunctionToDataRange = function (n, l) {
    var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
    var array = publicAPI.getDataArray(n, l);
    var dataRange = array.getRange(c);
    model.proxyManager.rescaleTransferFunctionToDataRange(n, dataRange);
  };

  publicAPI.isVisible = function () {
    if (model.actors.length) {
      return model.actors[0].getVisibility();
    }

    if (model.volumes.length) {
      return model.volumes[0].getVisibility();
    }

    return false;
  };

  publicAPI.setVisibility = function (visible) {
    var change = 0;
    var count = model.actors.length;

    while (count--) {
      change += model.actors[count].setVisibility(visible);
    }

    count = model.volumes.length;

    while (count--) {
      change += model.volumes[count].setVisibility(visible);
    }

    if (change) {
      publicAPI.modified();
    }
  };

  publicAPI.setColorBy = function (arrayName, arrayLocation) {
    var componentIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
    var colorMode = vtkMapper.ColorMode.DEFAULT;
    var scalarMode = vtkMapper.ScalarMode.DEFAULT;
    var colorByArrayName = arrayName;
    var activeArray = publicAPI.getDataArray(arrayName, arrayLocation);
    var scalarVisibility = !!activeArray;
    var lookupTable = arrayName ? publicAPI.getLookupTableProxy(arrayName).getLookupTable() : null;

    if (lookupTable) {
      if (componentIndex === -1) {
        lookupTable.setVectorModeToMagnitude();
      } else {
        lookupTable.setVectorModeToComponent();
        lookupTable.setVectorComponent(componentIndex);
      }
    }

    if (scalarVisibility) {
      colorMode = vtkMapper.ColorMode.MAP_SCALARS;
      scalarMode = arrayLocation === 'pointData' ? vtkMapper.ScalarMode.USE_POINT_FIELD_DATA : vtkMapper.ScalarMode.USE_CELL_FIELD_DATA;

      if (model.mapper.setLookupTable) {
        model.mapper.setLookupTable(lookupTable);
      }

      if (model.rescaleOnColorBy) {
        publicAPI.rescaleTransferFunctionToDataRange(arrayName, arrayLocation, componentIndex);
      }
    } // Not all mappers have those fields


    model.mapper.set({
      colorByArrayName: colorByArrayName,
      colorMode: colorMode,
      scalarMode: scalarMode,
      scalarVisibility: scalarVisibility
    }, true);
  };

  publicAPI.getColorBy = function () {
    if (!model.mapper.getColorByArrayName) {
      var ds = publicAPI.getInputDataSet();

      if (ds.getPointData().getScalars()) {
        return [ds.getPointData().getScalars().getName(), 'pointData', -1];
      }

      if (ds.getCellData().getScalars()) {
        return [ds.getCellData().getScalars().getName(), 'cellData', -1];
      }

      if (ds.getPointData().getNumberOfArrays()) {
        return [ds.getPointData().getArrayByIndex(0).getName(), 'pointData', -1];
      }

      if (ds.getCellData().getNumberOfArrays()) {
        return [ds.getCellData().getArrayByIndex(0).getName(), 'cellData', -1];
      }

      return [];
    }

    var result = [];

    var _model$mapper$get = model.mapper.get('colorByArrayName', 'colorMode', 'scalarMode', 'scalarVisibility'),
        colorByArrayName = _model$mapper$get.colorByArrayName,
        colorMode = _model$mapper$get.colorMode,
        scalarMode = _model$mapper$get.scalarMode,
        scalarVisibility = _model$mapper$get.scalarVisibility;

    if (scalarVisibility && colorByArrayName) {
      result.push(colorByArrayName);
      result.push(scalarMode === vtkMapper.ScalarMode.USE_POINT_FIELD_DATA ? 'pointData' : 'cellData');
    }

    if (colorMode === vtkMapper.ColorMode.MAP_SCALARS && colorByArrayName) {
      var lut = publicAPI.getLookupTableProxy(colorByArrayName).getLookupTable();
      var componentIndex = lut.getVectorMode() === vtkScalarsToColors.VectorMode.MAGNITUDE ? -1 : lut.getVectorComponent();
      result.push(componentIndex);
    }

    return result;
  };

  publicAPI.listDataArrays = function () {
    var arrayList = [];

    if (!model.input) {
      return arrayList;
    }

    var dataset = publicAPI.getInputDataSet(); // Point data

    var pointData = dataset.getPointData();
    var size = pointData.getNumberOfArrays();

    for (var idx = 0; idx < size; idx++) {
      var array = pointData.getArrayByIndex(idx);
      arrayList.push({
        name: array.getName(),
        location: 'pointData',
        numberOfComponents: array.getNumberOfComponents(),
        dataRange: array.getRange()
      });
    } // Cell data


    var cellData = dataset.getCellData();
    size = cellData.getNumberOfArrays();

    for (var _idx = 0; _idx < size; _idx++) {
      var _array = cellData.getArrayByIndex(_idx);

      arrayList.push({
        name: _array.getName(),
        location: 'cellData',
        numberOfComponents: _array.getNumberOfComponents(),
        dataRange: _array.getRange()
      });
    }

    return arrayList;
  };

  publicAPI.updateColorByDomain = function () {
    publicAPI.updateProxyProperty('colorBy', {
      domain: {
        arrays: publicAPI.listDataArrays(),
        solidColor: !model.disableSolidColor
      }
    });
  };

  publicAPI.delete = chain(function () {
    if (model.sourceSubscription) {
      model.sourceSubscription.unsubscribe();
      model.sourceSubscription = null;
    }
  }, publicAPI.delete); // Fast getter for rendering

  var nestedProps = [];

  var bbox = _toConsumableArray(vtkBoundingBox.INIT_BOUNDS);

  function handleProp(prop) {
    if (prop) {
      vtkBoundingBox.addBounds(bbox, prop.getBounds());
      nestedProps.push(prop);
    }
  }

  publicAPI.getNestedProps = function () {
    return nestedProps;
  };

  publicAPI.getBounds = function () {
    if (model.boundMTime < model.mtime) {
      model.boundMTime = model.mtime;
      vtkBoundingBox.reset(bbox);
      nestedProps.length = 0;
      model.actors.forEach(handleProp);
      model.volumes.forEach(handleProp);
    }

    return bbox;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  boundMTime: 0,
  actors: [],
  volumes: [],
  sourceDependencies: [],
  rescaleOnColorBy: true
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  vtkProp.extend(publicAPI, model, initialValues);
  setGet(publicAPI, model, ['rescaleOnColorBy']);
  get(publicAPI, model, ['input', 'mapper', 'actors', 'volumes']); // Object specific methods

  vtkAbstractRepresentationProxy(publicAPI, model);
  proxy(publicAPI, model);
}

var vtkAbstractRepresentationProxy$1 = {
  extend: extend
};

export { vtkAbstractRepresentationProxy$1 as default };
