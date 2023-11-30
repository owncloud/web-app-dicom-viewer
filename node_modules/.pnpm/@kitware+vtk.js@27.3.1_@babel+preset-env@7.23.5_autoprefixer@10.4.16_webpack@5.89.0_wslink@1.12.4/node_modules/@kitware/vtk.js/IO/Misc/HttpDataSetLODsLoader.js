import macro from '../../macros.js';
import DataAccessHelper from '../Core/DataAccessHelper.js';
import vtkHttpDataSetReader from '../Core/HttpDataSetReader.js';
import '../Core/DataAccessHelper/LiteHttpDataAccessHelper.js';

// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper'; // HTTP + gz
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HtmlDataAccessHelper'; // html + base64 + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/JSZipDataAccessHelper'; // zip

var vtkErrorMacro = macro.vtkErrorMacro; // ----------------------------------------------------------------------------
// vtkHttpDataSetLODsLoader methods
// ----------------------------------------------------------------------------

function vtkHttpDataSetLODsLoader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkHttpDataSetLODsLoader');
  var internal = {
    downloadStack: []
  }; //--------------------------------------------------------------------------

  publicAPI.startDownloads = function () {
    if (!model.mapper) {
      vtkErrorMacro('Mapper was not set.');
      return;
    }

    if (!model.files || model.files.length === 0) {
      vtkErrorMacro('No files set.');
      return;
    }

    var baseUrl = model.baseUrl;

    if (baseUrl && !baseUrl.endsWith('/')) {
      baseUrl += '/';
    } // Create the download stack


    internal.downloadStack = [];
    model.files.forEach(function (file) {
      return internal.downloadStack.push("".concat(baseUrl).concat(file));
    });

    var downloadNextSource = function downloadNextSource() {
      var url = internal.downloadStack.shift();
      var nextSource = vtkHttpDataSetReader.newInstance({
        dataAccessHelper: DataAccessHelper.get('http')
      });
      model.currentSource = nextSource;
      var options = {
        compression: 'zip',
        loadData: true,
        fullpath: true
      };
      nextSource.setUrl(url, options).then(function () {
        model.mapper.setInputConnection(nextSource.getOutputPort());

        if (model.sceneItem) {
          // Apply settings to the new source
          var settings = model.sceneItem.defaultSettings;

          if (settings.mapper) {
            if (settings.mapper.colorByArrayName) {
              nextSource.enableArray(settings.mapper.colorByArrayName, settings.mapper.colorByArrayName);
            }
          }

          model.sceneItem.source = nextSource;
        }

        if (model.stepFinishedCallback) {
          // In clients like paraview glance, the callback might
          // involve setting the current source on a proxy
          model.stepFinishedCallback();
        }

        if (internal.downloadStack.length !== 0) {
          setTimeout(downloadNextSource, model.waitTimeBetweenDownloads);
        }
      });
    };

    setTimeout(downloadNextSource, model.waitTimeToStart);
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  baseUrl: '',
  // The currentSource is set internally to the most recently
  // created source. It might be useful to access it in a callback
  // via 'getCurrentSource'.
  currentSource: null,
  files: [],
  mapper: null,
  sceneItem: null,
  stepFinishedCallback: null,
  // These are in milliseconds
  waitTimeToStart: 4000,
  waitTimeBetweenDownloads: 0
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.obj(publicAPI, model); // Create get-set macros

  macro.setGet(publicAPI, model, ['baseUrl', 'files', 'mapper', 'sceneItem', 'stepFinishedCallback', 'waitTimeToStart', 'waitTimeBetweenDownloads']);
  macro.get(publicAPI, model, ['currentSource']); // Object specific methods

  vtkHttpDataSetLODsLoader(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkHttpDataSetLODsLoader'); // ----------------------------------------------------------------------------

var vtkHttpDataSetLODsLoader$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkHttpDataSetLODsLoader$1 as default, extend, newInstance };
