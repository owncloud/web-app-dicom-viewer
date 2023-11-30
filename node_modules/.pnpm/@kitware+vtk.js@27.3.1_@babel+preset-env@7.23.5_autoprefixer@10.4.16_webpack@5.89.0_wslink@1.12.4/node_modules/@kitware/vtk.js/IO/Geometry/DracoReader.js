import DataAccessHelper from '../Core/DataAccessHelper.js';
import macro from '../../macros.js';
import vtkCellArray from '../../Common/Core/CellArray.js';
import vtkDataArray from '../../Common/Core/DataArray.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';
import '../Core/DataAccessHelper/LiteHttpDataAccessHelper.js';

// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper'; // HTTP + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HtmlDataAccessHelper'; // html + base64 + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/JSZipDataAccessHelper'; // zip

var vtkErrorMacro = macro.vtkErrorMacro;
var decoderModule = {}; // ----------------------------------------------------------------------------
// static methods
// ----------------------------------------------------------------------------

/**
 * Load the WASM decoder from url and set the decoderModule
 * @param url
 * @param binaryName
 * @return {Promise<boolean>}
 */

function setWasmBinary(url, binaryName) {
  var dracoDecoderType = {};
  return new Promise(function (resolve, reject) {
    dracoDecoderType.wasmBinaryFile = binaryName;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function () {
      if (xhr.status === 200) {
        dracoDecoderType.wasmBinary = xhr.response; // Use Promise.resolve to be compatible with versions before Draco 1.4.0

        Promise.resolve(window.DracoDecoderModule(dracoDecoderType)).then(function (module) {
          decoderModule = module;
          resolve(true);
        }, reject);
      } else {
        reject(Error("WASM binary could not be loaded: ".concat(xhr.statusText)));
      }
    };

    xhr.send(null);
  });
}

function setDracoDecoder(createDracoModule) {
  decoderModule = createDracoModule({});
}

function getDracoDecoder() {
  return decoderModule;
} // ----------------------------------------------------------------------------
// vtkDracoReader methods
// ----------------------------------------------------------------------------


function decodeBuffer(buffer) {
  var byteArray = new Int8Array(buffer);
  var decoder = new decoderModule.Decoder();
  var decoderBuffer = new decoderModule.DecoderBuffer();
  decoderBuffer.Init(byteArray, byteArray.length);
  var geometryType = decoder.GetEncodedGeometryType(decoderBuffer);
  var dracoGeometry;

  if (geometryType === decoderModule.TRIANGULAR_MESH) {
    dracoGeometry = new decoderModule.Mesh();
    var status = decoder.DecodeBufferToMesh(decoderBuffer, dracoGeometry);

    if (!status.ok()) {
      vtkErrorMacro("Could not decode Draco file: ".concat(status.error_msg()));
    }
  } else {
    vtkErrorMacro('Wrong geometry type, expected mesh, got point cloud.');
  }

  decoderModule.destroy(decoderBuffer);
  decoderModule.destroy(decoder);
  return dracoGeometry;
}

function getDracoAttributeAsFloat32Array(dracoGeometry, attributeId) {
  var decoder = new decoderModule.Decoder();
  var attribute = decoder.GetAttribute(dracoGeometry, attributeId);
  var numberOfComponents = attribute.num_components();
  var numberOfPoints = dracoGeometry.num_points();
  var attributeData = new decoderModule.DracoFloat32Array();
  decoder.GetAttributeFloatForAllPoints(dracoGeometry, attribute, attributeData);
  var i = numberOfPoints * numberOfComponents;
  var attributeArray = new Float32Array(i);

  while (i--) {
    attributeArray[i] = attributeData.GetValue(i);
  }

  return attributeArray;
}

function getPolyDataFromDracoGeometry(dracoGeometry) {
  var decoder = new decoderModule.Decoder(); // Get position attribute ID

  var positionAttributeId = decoder.GetAttributeId(dracoGeometry, decoderModule.POSITION);

  if (positionAttributeId === -1) {
    console.error('No position attribute found in the decoded model.');
    decoderModule.destroy(decoder);
    decoderModule.destroy(dracoGeometry);
    return null;
  }

  var positionArray = getDracoAttributeAsFloat32Array(dracoGeometry, positionAttributeId); // Read indices

  var i = dracoGeometry.num_faces();
  var indices = new Uint32Array(i * 4);
  var indicesArray = new decoderModule.DracoInt32Array();

  while (i--) {
    decoder.GetFaceFromMesh(dracoGeometry, i, indicesArray);
    var index = i * 4;
    indices[index] = 3;
    indices[index + 1] = indicesArray.GetValue(0);
    indices[index + 2] = indicesArray.GetValue(1);
    indices[index + 3] = indicesArray.GetValue(2);
  } // Create polyData and add positions and indinces


  var cellArray = vtkCellArray.newInstance({
    values: indices
  });
  var polyData = vtkPolyData.newInstance({
    polys: cellArray
  });
  polyData.getPoints().setData(positionArray); // Look for other attributes

  var pointData = polyData.getPointData(); // Normals

  var normalAttributeId = decoder.GetAttributeId(dracoGeometry, decoderModule.NORMAL);

  if (normalAttributeId !== -1) {
    var normalArray = getDracoAttributeAsFloat32Array(dracoGeometry, decoderModule.NORMAL);
    var normals = vtkDataArray.newInstance({
      numberOfComponents: 3,
      values: normalArray,
      name: 'Normals'
    });
    pointData.setNormals(normals);
  } // Texture coordinates


  var texCoordAttributeId = decoder.GetAttributeId(dracoGeometry, decoderModule.TEX_COORD);

  if (texCoordAttributeId !== -1) {
    var texCoordArray = getDracoAttributeAsFloat32Array(dracoGeometry, texCoordAttributeId);
    var texCoords = vtkDataArray.newInstance({
      numberOfComponents: 2,
      values: texCoordArray,
      name: 'TCoords'
    });
    pointData.setTCoords(texCoords);
  } // Scalars


  var colorAttributeId = decoder.GetAttributeId(dracoGeometry, decoderModule.COLOR);

  if (colorAttributeId !== -1) {
    var colorArray = getDracoAttributeAsFloat32Array(dracoGeometry, colorAttributeId);
    var scalars = vtkDataArray.newInstance({
      numberOfComponents: 3,
      values: colorArray,
      name: 'Scalars'
    });
    pointData.setScalars(scalars);
  }

  decoderModule.destroy(decoder);
  return polyData;
}

function vtkDracoReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkDracoReader'); // Create default dataAccessHelper if not available

  if (!model.dataAccessHelper) {
    model.dataAccessHelper = DataAccessHelper.get('http');
  } // Internal method to fetch Array


  function fetchData(url) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var compression = model.compression,
        progressCallback = model.progressCallback;

    if (option.binary) {
      return model.dataAccessHelper.fetchBinary(url, {
        compression: compression,
        progressCallback: progressCallback
      });
    }

    return model.dataAccessHelper.fetchText(publicAPI, url, {
      compression: compression,
      progressCallback: progressCallback
    });
  } // Set DataSet url


  publicAPI.setUrl = function (url) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      binary: true
    };
    model.url = url; // Remove the file in the URL

    var path = url.split('/');
    path.pop();
    model.baseURL = path.join('/');
    model.compression = option.compression; // Fetch metadata

    return publicAPI.loadData({
      progressCallback: option.progressCallback,
      binary: !!option.binary
    });
  }; // Fetch the actual data arrays


  publicAPI.loadData = function () {
    var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var promise = fetchData(model.url, option);
    promise.then(publicAPI.parse);
    return promise;
  };

  publicAPI.parse = function (content) {
    publicAPI.parseAsArrayBuffer(content);
  };

  publicAPI.parseAsArrayBuffer = function (content) {
    if (!content) {
      return;
    }

    if (content !== model.parseData) {
      publicAPI.modified();
    } else {
      return;
    }

    model.parseData = content;
    var dracoGeometry = decodeBuffer(content);
    var polyData = getPolyDataFromDracoGeometry(dracoGeometry);
    decoderModule.destroy(dracoGeometry);
    model.output[0] = polyData;
  };

  publicAPI.requestData = function () {
    publicAPI.parse(model.parseData);
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
  macro.algo(publicAPI, model, 0, 1); // vtkDracoReader methods

  vtkDracoReader(publicAPI, model); // To support destructuring

  if (!model.compression) {
    model.compression = null;
  }

  if (!model.progressCallback) {
    model.progressCallback = null;
  }
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkDracoReader'); // ----------------------------------------------------------------------------

var vtkDracoReader$1 = {
  extend: extend,
  newInstance: newInstance,
  setDracoDecoder: setDracoDecoder,
  setWasmBinary: setWasmBinary,
  getDracoDecoder: getDracoDecoder
};

export { vtkDracoReader$1 as default, extend, newInstance };
