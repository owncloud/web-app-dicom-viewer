import otherStaticMethods from './Static.js';
import macro from '../../../macros.js';

/* eslint-disable arrow-body-style */

function addCoincidentTopologyMethods(publicAPI, model, nameList) {
  nameList.forEach(function (item) {
    publicAPI["get".concat(item.method)] = function () {
      return model[item.key];
    };

    publicAPI["set".concat(item.method)] = function (factor, offset) {
      model[item.key] = {
        factor: factor,
        offset: offset
      };
    };
  });
}

var CATEGORIES = ['Polygon', 'Line', 'Point']; // CoincidentTopology static methods ------------------------------------------

var staticOffsetModel = {
  Polygon: {
    factor: 2,
    offset: 0
  },
  Line: {
    factor: 1,
    offset: -1
  },
  Point: {
    factor: 0,
    offset: -2
  }
};
var staticOffsetAPI = {};
addCoincidentTopologyMethods(staticOffsetAPI, staticOffsetModel, CATEGORIES.map(function (key) {
  return {
    key: key,
    method: "ResolveCoincidentTopology".concat(key, "OffsetParameters")
  };
}));

function implementCoincidentTopologyMethods(publicAPI, model) {
  if (model.resolveCoincidentTopology === undefined) {
    model.resolveCoincidentTopology = false;
  }

  macro.setGet(publicAPI, model, ['resolveCoincidentTopology']); // Relative methods

  model.topologyOffset = {
    Polygon: {
      factor: 0,
      offset: 0
    },
    Line: {
      factor: 0,
      offset: 0
    },
    Point: {
      factor: 0,
      offset: 0
    }
  }; // Add Static methods to our instance

  Object.keys(otherStaticMethods).forEach(function (methodName) {
    publicAPI[methodName] = otherStaticMethods[methodName];
  });
  Object.keys(staticOffsetAPI).forEach(function (methodName) {
    publicAPI[methodName] = staticOffsetAPI[methodName];
  });
  addCoincidentTopologyMethods(publicAPI, model.topologyOffset, CATEGORIES.map(function (key) {
    return {
      key: key,
      method: "RelativeCoincidentTopology".concat(key, "OffsetParameters")
    };
  }));

  publicAPI.getCoincidentTopologyPolygonOffsetParameters = function () {
    var globalValue = staticOffsetAPI.getResolveCoincidentTopologyPolygonOffsetParameters();
    var localValue = publicAPI.getRelativeCoincidentTopologyPolygonOffsetParameters();
    return {
      factor: globalValue.factor + localValue.factor,
      offset: globalValue.offset + localValue.offset
    };
  };

  publicAPI.getCoincidentTopologyLineOffsetParameters = function () {
    var globalValue = staticOffsetAPI.getResolveCoincidentTopologyLineOffsetParameters();
    var localValue = publicAPI.getRelativeCoincidentTopologyLineOffsetParameters();
    return {
      factor: globalValue.factor + localValue.factor,
      offset: globalValue.offset + localValue.offset
    };
  };

  publicAPI.getCoincidentTopologyPointOffsetParameter = function () {
    var globalValue = staticOffsetAPI.getResolveCoincidentTopologyPointOffsetParameters();
    var localValue = publicAPI.getRelativeCoincidentTopologyPointOffsetParameters();
    return {
      factor: globalValue.factor + localValue.factor,
      offset: globalValue.offset + localValue.offset
    };
  };
}

var CoincidentTopologyHelper = {
  implementCoincidentTopologyMethods: implementCoincidentTopologyMethods,
  staticOffsetAPI: staticOffsetAPI,
  otherStaticMethods: otherStaticMethods,
  CATEGORIES: CATEGORIES
};

export { CATEGORIES, CoincidentTopologyHelper as default };
