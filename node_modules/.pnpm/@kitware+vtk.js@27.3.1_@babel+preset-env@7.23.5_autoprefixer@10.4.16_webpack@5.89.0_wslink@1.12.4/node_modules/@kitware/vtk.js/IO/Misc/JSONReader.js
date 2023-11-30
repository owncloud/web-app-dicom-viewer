import macro from '../../macros.js';

// vtkJSONReader methods
// ----------------------------------------------------------------------------

function vtkJSONReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkJSONReader'); // Internal method to fetch Array

  function fetchData(url) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return model.dataAccessHelper.fetchText(publicAPI, url, option);
  } // Set DataSet url


  publicAPI.setUrl = function (url) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    model.url = url; // Fetch metadata

    return publicAPI.loadData(option);
  }; // Fetch the actual data arrays


  publicAPI.loadData = function () {
    var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return fetchData(model.url, option).then(publicAPI.parseAsText);
  };

  publicAPI.parseAsText = function (content) {
    if (!content) {
      return false;
    }

    model.data = JSON.parse(content);
    publicAPI.modified();
    return true;
  };

  publicAPI.requestData = function (inData, outData) {
    outData[0] = model.data;
  }; // return Busy state


  publicAPI.isBusy = function () {
    return false;
  };

  publicAPI.getNumberOfOutputPorts = function () {
    return model.numberOfOutputs;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {// url: null,
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['url']);
  macro.algo(publicAPI, model, 0, 1);
  macro.event(publicAPI, model, 'busy'); // Object methods

  vtkJSONReader(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkJSONReader'); // ----------------------------------------------------------------------------

var vtkJSONReader$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkJSONReader$1 as default, extend, newInstance };
