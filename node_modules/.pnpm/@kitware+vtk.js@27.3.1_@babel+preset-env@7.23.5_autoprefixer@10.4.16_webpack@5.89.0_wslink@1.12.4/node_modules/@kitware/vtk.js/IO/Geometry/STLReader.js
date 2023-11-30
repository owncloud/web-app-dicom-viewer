import BinaryHelper from '../Core/BinaryHelper.js';
import DataAccessHelper from '../Core/DataAccessHelper.js';
import macro from '../../macros.js';
import vtkDataArray from '../../Common/Core/DataArray.js';
import vtkMatrixBuilder from '../../Common/Core/MatrixBuilder.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';
import '../Core/DataAccessHelper/LiteHttpDataAccessHelper.js';

// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper'; // HTTP + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HtmlDataAccessHelper'; // html + base64 + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/JSZipDataAccessHelper'; // zip

var vtkErrorMacro = macro.vtkErrorMacro;

function parseHeader(headerString) {
  var headerSubStr = headerString.split(' ');
  var fieldValues = headerSubStr.filter(function (e) {
    return e.indexOf('=') > -1;
  });
  var header = {};

  for (var i = 0; i < fieldValues.length; ++i) {
    var fieldValueStr = fieldValues[i];
    var fieldValueSubStr = fieldValueStr.split('=');

    if (fieldValueSubStr.length === 2) {
      header[fieldValueSubStr[0]] = fieldValueSubStr[1];
    }
  }

  return header;
}

function addValuesToArray(src, dst) {
  for (var i = 0; i < src.length; i++) {
    dst.push(src[i]);
  }
} // facet normal ni nj nk
//     outer loop
//         vertex v1x v1y v1z
//         vertex v2x v2y v2z
//         vertex v3x v3y v3z
//     endloop
// endfacet


function readTriangle(lines, offset, points, cellArray, cellNormals) {
  var normalLine = lines[offset];

  if (normalLine === undefined) {
    return -1;
  }

  if (normalLine.indexOf('endfacet') !== -1) {
    return offset + 1;
  }

  if (normalLine.indexOf('facet') === -1) {
    return offset + 1; // Move to next line
  }

  var nbVertex = 0;
  var nbConsumedLines = 2;
  var firstVertexIndex = points.length / 3;
  var normal = normalLine.split(/[ \t]+/).filter(function (i) {
    return i;
  }).slice(-3).map(Number);
  addValuesToArray(normal, cellNormals);

  while (lines[offset + nbConsumedLines].indexOf('vertex') !== -1) {
    var line = lines[offset + nbConsumedLines];
    var coords = line.split(/[ \t]+/).filter(function (i) {
      return i;
    }).slice(-3).map(Number);
    addValuesToArray(coords, points);
    nbVertex++;
    nbConsumedLines++;
  }

  cellArray.push(nbVertex);

  for (var i = 0; i < nbVertex; i++) {
    cellArray.push(firstVertexIndex + i);
  }

  while (lines[offset + nbConsumedLines] && lines[offset + nbConsumedLines].indexOf('endfacet') !== -1) {
    nbConsumedLines++;
  } // +1 (endfacet) +1 (next facet)


  return offset + nbConsumedLines + 2;
} // ----------------------------------------------------------------------------
// vtkSTLReader methods
// ----------------------------------------------------------------------------


function vtkSTLReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkSTLReader'); // Create default dataAccessHelper if not available

  if (!model.dataAccessHelper) {
    model.dataAccessHelper = DataAccessHelper.get('http');
  } // Internal method to fetch Array


  function fetchData(url) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var compression = option.compression !== undefined ? option.compression : model.compression;
    var progressCallback = option.progressCallback !== undefined ? option.progressCallback : model.progressCallback;

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
    model.baseURL = path.join('/'); // Fetch metadata

    return publicAPI.loadData(option);
  }; // Fetch the actual data arrays


  publicAPI.loadData = function () {
    var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var promise = fetchData(model.url, option);
    promise.then(publicAPI.parse);
    return promise;
  };

  publicAPI.parse = function (content) {
    if (typeof content === 'string') {
      publicAPI.parseAsText(content);
    } else {
      publicAPI.parseAsArrayBuffer(content);
    }
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

    model.parseData = content; // ascii/binary detection

    var isBinary = false; // 80=STL header, 4=uint32 of num of triangles (le)

    var dview = new DataView(content, 0, 80 + 4);
    var numTriangles = dview.getUint32(80, true); // 50 bytes per triangle

    isBinary = 84 + numTriangles * 50 === content.byteLength; // Check if ascii format

    if (!isBinary) {
      publicAPI.parseAsText(BinaryHelper.arrayBufferToString(content));
      return;
    } // Binary parsing
    // Header


    var headerData = content.slice(0, 80);
    var headerStr = BinaryHelper.arrayBufferToString(headerData);
    var header = parseHeader(headerStr); // Data

    var dataView = new DataView(content, 84); // global.dataview = dataView;

    var nbFaces = (content.byteLength - 84) / 50;
    var pointValues = new Float32Array(nbFaces * 9);
    var normalValues = new Float32Array(nbFaces * 3);
    var cellValues = new Uint32Array(nbFaces * 4);
    var cellDataValues = new Uint16Array(nbFaces);
    var cellOffset = 0;

    for (var faceIdx = 0; faceIdx < nbFaces; faceIdx++) {
      var offset = faceIdx * 50;
      normalValues[faceIdx * 3 + 0] = dataView.getFloat32(offset + 0, true);
      normalValues[faceIdx * 3 + 1] = dataView.getFloat32(offset + 4, true);
      normalValues[faceIdx * 3 + 2] = dataView.getFloat32(offset + 8, true);
      pointValues[faceIdx * 9 + 0] = dataView.getFloat32(offset + 12, true);
      pointValues[faceIdx * 9 + 1] = dataView.getFloat32(offset + 16, true);
      pointValues[faceIdx * 9 + 2] = dataView.getFloat32(offset + 20, true);
      pointValues[faceIdx * 9 + 3] = dataView.getFloat32(offset + 24, true);
      pointValues[faceIdx * 9 + 4] = dataView.getFloat32(offset + 28, true);
      pointValues[faceIdx * 9 + 5] = dataView.getFloat32(offset + 32, true);
      pointValues[faceIdx * 9 + 6] = dataView.getFloat32(offset + 36, true);
      pointValues[faceIdx * 9 + 7] = dataView.getFloat32(offset + 40, true);
      pointValues[faceIdx * 9 + 8] = dataView.getFloat32(offset + 44, true);
      cellValues[cellOffset++] = 3;
      cellValues[cellOffset++] = faceIdx * 3 + 0;
      cellValues[cellOffset++] = faceIdx * 3 + 1;
      cellValues[cellOffset++] = faceIdx * 3 + 2;
      cellDataValues[faceIdx] = dataView.getUint16(offset + 48, true);
    } // Rotate points


    var orientationField = 'SPACE';

    if (orientationField in header && header[orientationField] !== 'LPS') {
      var XYZ = header[orientationField];
      var mat4 = new Float32Array(16);
      mat4[15] = 1;

      switch (XYZ[0]) {
        case 'L':
          mat4[0] = 1;
          break;

        case 'R':
          mat4[0] = -1;
          break;

        default:
          vtkErrorMacro("Can not convert STL file from ".concat(XYZ, " to LPS space: ") + "permutations not supported. Use itk.js STL reader instead.");
          return;
      }

      switch (XYZ[1]) {
        case 'P':
          mat4[5] = 1;
          break;

        case 'A':
          mat4[5] = -1;
          break;

        default:
          vtkErrorMacro("Can not convert STL file from ".concat(XYZ, " to LPS space: ") + "permutations not supported. Use itk.js STL reader instead.");
          return;
      }

      switch (XYZ[2]) {
        case 'S':
          mat4[10] = 1;
          break;

        case 'I':
          mat4[10] = -1;
          break;

        default:
          vtkErrorMacro("Can not convert STL file from ".concat(XYZ, " to LPS space: ") + "permutations not supported. Use itk.js STL reader instead.");
          return;
      }

      vtkMatrixBuilder.buildFromDegree().setMatrix(mat4).apply(pointValues).apply(normalValues);
    }

    var polydata = vtkPolyData.newInstance();
    polydata.getPoints().setData(pointValues, 3);
    polydata.getPolys().setData(cellValues);
    polydata.getCellData().setScalars(vtkDataArray.newInstance({
      name: 'Attribute',
      values: cellDataValues
    }));
    polydata.getCellData().setNormals(vtkDataArray.newInstance({
      name: 'Normals',
      values: normalValues,
      numberOfComponents: 3
    })); // Add new output

    model.output[0] = polydata;
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
    var lines = content.split('\n');
    var offset = 1;
    var points = [];
    var cellArray = [];
    var cellNormals = [];

    while (offset !== -1) {
      offset = readTriangle(lines, offset, points, cellArray, cellNormals);
    }

    var polydata = vtkPolyData.newInstance();
    polydata.getPoints().setData(Float32Array.from(points), 3);
    polydata.getPolys().setData(Uint32Array.from(cellArray));
    polydata.getCellData().setNormals(vtkDataArray.newInstance({
      name: 'Normals',
      values: Float32Array.from(cellNormals),
      numberOfComponents: 3
    })); // Add new output

    model.output[0] = polydata;
  };

  publicAPI.requestData = function (inData, outData) {
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
  macro.algo(publicAPI, model, 0, 1); // vtkSTLReader methods

  vtkSTLReader(publicAPI, model); // To support destructuring

  if (!model.compression) {
    model.compression = null;
  }

  if (!model.progressCallback) {
    model.progressCallback = null;
  }
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkSTLReader'); // ----------------------------------------------------------------------------

var vtkSTLReader$1 = {
  extend: extend,
  newInstance: newInstance
};

export { vtkSTLReader$1 as default, extend, newInstance };
