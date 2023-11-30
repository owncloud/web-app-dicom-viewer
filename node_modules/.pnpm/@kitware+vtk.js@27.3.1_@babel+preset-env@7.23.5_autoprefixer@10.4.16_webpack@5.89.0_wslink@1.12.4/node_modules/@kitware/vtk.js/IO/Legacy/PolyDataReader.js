import macro from '../../macros.js';
import DataAccessHelper from '../Core/DataAccessHelper.js';
import vtkLegacyAsciiParser from './LegacyAsciiParser.js';
import '../Core/DataAccessHelper/LiteHttpDataAccessHelper.js';

// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper'; // HTTP + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HtmlDataAccessHelper'; // html + base64 + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/JSZipDataAccessHelper'; // zip
// ----------------------------------------------------------------------------
// vtkPolyDataReader methods
// ----------------------------------------------------------------------------

function vtkPolyDataReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkPolyDataReader'); // Create default dataAccessHelper if not available

  if (!model.dataAccessHelper) {
    model.dataAccessHelper = DataAccessHelper.get('http');
  } // Internal method to fetch Array


  function fetchData(url) {
    var compression = model.compression,
        progressCallback = model.progressCallback;
    return model.dataAccessHelper.fetchText(publicAPI, url, {
      compression: compression,
      progressCallback: progressCallback
    });
  } // Set DataSet url


  publicAPI.setUrl = function (url) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    model.url = url; // Remove the file in the URL

    var path = url.split('/');
    path.pop();
    model.baseURL = path.join('/');
    model.compression = option.compression; // Fetch metadata

    return publicAPI.loadData({
      progressCallback: option.progressCallback
    });
  }; // Fetch the actual data arrays


  publicAPI.loadData = function () {
    var promise = fetchData(model.url);
    promise.then(publicAPI.parseAsText);
    return promise;
  };

  publicAPI.parseAsText = function (content) {
    if (!content) {
      return;
    }

    if (content !== model.parseData) {
      publicAPI.modified();
    } else {
      return;
    }

    model.parseData = content;
    model.output[0] = vtkLegacyAsciiParser.parseLegacyASCII(model.parseData).dataset;
  };

  publicAPI.requestData = function (inData, outData) {
    publicAPI.parseAsText(model.parseData);
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {// baseURL: null,
  // dataAccessHelper: null,
  // url: null,
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['url', 'baseURL']);
  macro.setGet(publicAPI, model, ['dataAccessHelper']);
  macro.algo(publicAPI, model, 0, 1); // vtkPolyDataReader methods

  vtkPolyDataReader(publicAPI, model); // To support destructuring

  if (!model.compression) {
    model.compression = null;
  }

  if (!model.progressCallback) {
    model.progressCallback = null;
  }
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkPolyDataReader'); // ----------------------------------------------------------------------------

var vtkPolyDataReader$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkPolyDataReader$1 as default, extend, newInstance };
