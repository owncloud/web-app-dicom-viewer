import macro from '../../macros.js';

// vtkSourceProxy methods
// ----------------------------------------------------------------------------

function vtkSourceProxy(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkSourceProxy'); // API ----------------------------------------------------------------------

  publicAPI.setInputProxy = function (source) {
    if (model.inputSubscription) {
      model.inputSubscription();
      model.inputSubscription = null;
    }

    model.inputProxy = source;

    if (model.inputProxy) {
      model.inputSubscription = source.onModified(publicAPI.update, -1).unsubscribe; // Trigger at next cycle
    }

    publicAPI.update();
  }; // --------------------------------------------------------------------------


  publicAPI.setInputData = function (ds, type) {
    if (model.dataset !== ds) {
      model.dataset = ds;
      model.type = type || ds.getClassName();
      publicAPI.modified();
      publicAPI.invokeDatasetChange();
    }
  }; // --------------------------------------------------------------------------


  publicAPI.setInputAlgorithm = function (algo, type) {
    var autoUpdate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    model.type = type;

    if (model.algo !== algo) {
      model.algo = algo;

      if (model.algoSubscription) {
        model.algoSubscription();
        model.algoSubscription = null;
      }

      if (algo && autoUpdate) {
        model.algoSubscription = algo.onModified(function () {
          publicAPI.update();
        }, -1).unsubscribe; // Trigger at next cycle

        publicAPI.update();
      }
    }
  }; // --------------------------------------------------------------------------


  publicAPI.update = function () {
    if (model.algo && model.inputProxy) {
      model.algo.setInputData(model.inputProxy.getDataset());
    }

    if (model.updateDomain && model.inputProxy) {
      model.updateDomain(publicAPI, model.inputProxy.getDataset());
    }

    if (model.algo) {
      publicAPI.setInputData(model.algo.getOutputData(), model.type);
    }
  };

  publicAPI.getUpdate = function () {
    return model.algo.getMTime() > model.dataset.getMTime();
  }; // --------------------------------------------------------------------------


  publicAPI.delete = macro.chain(function () {
    if (model.algoSubscription) {
      model.algoSubscription();
      model.algoSubscription = null;
    }

    if (model.inputSubscription) {
      model.inputSubscription();
      model.inputSubscription = null;
    }
  }, publicAPI.delete); // --------------------------------------------------------------------------
  // Initialisation
  // --------------------------------------------------------------------------

  if (model.inputProxy) {
    model.inputSubscription = model.inputProxy.onModified(function () {
      publicAPI.update();
    }, -1).unsubscribe; // Trigger at next cycle
  }

  if (model.algoFactory) {
    publicAPI.setInputAlgorithm(model.algoFactory.newInstance(), null, model.autoUpdate);
  }

  publicAPI.update();
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  name: 'Default source'
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['name', 'type', 'dataset', 'algo', 'inputProxy']);
  macro.set(publicAPI, model, ['name']);
  macro.event(publicAPI, model, 'DatasetChange');
  macro.proxy(publicAPI, model); // Object specific methods

  vtkSourceProxy(publicAPI, model);

  if (model.proxyPropertyMapping) {
    macro.proxyPropertyMapping(publicAPI, model, model.proxyPropertyMapping);
  }
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkSourceProxy'); // ----------------------------------------------------------------------------

var vtkSourceProxy$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkSourceProxy$1 as default, extend, newInstance };
