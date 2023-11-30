import BinaryHelper from '../Core/BinaryHelper.js';
import DataAccessHelper from '../Core/DataAccessHelper.js';
import macro from '../../macros.js';
import vtkDataArray from '../../Common/Core/DataArray.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';
import '../Core/DataAccessHelper/LiteHttpDataAccessHelper.js';

// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper'; // HTTP + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HtmlDataAccessHelper'; // html + base64 + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/JSZipDataAccessHelper'; // zip

var PLYFormats = {
  ASCII: 'ascii',
  BINARY_BIG_ENDIAN: 'binary_big_endian',
  BINARY_LITTLE_ENDIAN: 'binary_little_endian'
};
var mapping = {
  diffuse_red: 'red',
  diffuse_green: 'green',
  diffuse_blue: 'blue'
};
var patterns = {
  patternHeader: /ply([\s\S]*)end_header\r?\n/,
  patternBody: /end_header\s([\s\S]*)$/
};

function parseHeader(data) {
  var headerText = '';
  var headerLength = 0;
  var result = patterns.patternHeader.exec(data);

  if (result !== null) {
    headerText = result[1];
    headerLength = result[0].length;
  }

  var header = {
    comments: [],
    elements: [],
    headerLength: headerLength
  };
  var lines = headerText.split('\n');
  var elem;
  var lineType;
  var lineValues;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    line = line.trim();

    if (line !== '') {
      var property = void 0;
      lineValues = line.split(/\s+/);
      lineType = lineValues.shift();
      line = lineValues.join(' ');

      switch (lineType) {
        case 'format':
          header.format = lineValues[0];
          header.version = lineValues[1];
          break;

        case 'comment':
          header.comments.push(line);
          break;

        case 'element':
          if (elem !== undefined) {
            header.elements.push(elem);
          }

          elem = {};
          elem.name = lineValues[0];
          elem.count = parseInt(lineValues[1], 10);
          elem.properties = [];
          break;

        case 'property':
          property = {
            type: lineValues[0]
          };

          if (property.type === 'list') {
            property.name = lineValues[3];
            property.countType = lineValues[1];
            property.itemType = lineValues[2];
          } else {
            property.name = lineValues[1];
          }

          if (property.name in mapping) {
            property.name = mapping[property.name];
          }

          elem.properties.push(property);
          break;

        case 'obj_info':
          header.objInfo = line;
          break;

        default:
          console.warn('unhandled', lineType, lineValues);
          break;
      }
    }
  }

  if (elem !== undefined) {
    header.elements.push(elem);
  }

  return header;
}

function postProcess(buffer, elements) {
  var vertElement = elements.find(function (element) {
    return element.name === 'vertex';
  });
  var faceElement = elements.find(function (element) {
    return element.name === 'face';
  });
  var nbVerts = 0;
  var nbFaces = 0;

  if (vertElement) {
    nbVerts = vertElement.count;
  }

  if (faceElement) {
    nbFaces = faceElement.count;
  }

  var pointValues = new Float32Array(nbVerts * 3);
  var colorArray = new Uint8Array(nbVerts * 3);
  var tcoordsArray = new Float32Array(nbVerts * 2);
  var normalsArray = new Float32Array(nbVerts * 3);
  var hasColor = buffer.colors.length > 0;
  var hasVertTCoords = buffer.uvs.length > 0;
  var hasNorms = buffer.normals.length > 0;
  var hasFaceTCoords = buffer.faceVertexUvs.length > 0;

  for (var vertIdx = 0; vertIdx < nbVerts; vertIdx++) {
    var a = vertIdx * 3 + 0;
    var b = vertIdx * 3 + 1;
    var c = vertIdx * 3 + 2;
    pointValues[a] = buffer.vertices[a];
    pointValues[b] = buffer.vertices[b];
    pointValues[c] = buffer.vertices[c];

    if (hasColor) {
      colorArray[a] = buffer.colors[a];
      colorArray[b] = buffer.colors[b];
      colorArray[c] = buffer.colors[c];
    }

    if (hasVertTCoords) {
      a = vertIdx * 2 + 0;
      b = vertIdx * 2 + 1;
      tcoordsArray[a] = buffer.uvs[a];
      tcoordsArray[b] = buffer.uvs[b];
    }

    if (hasNorms) {
      normalsArray[a] = buffer.normals[a];
      normalsArray[b] = buffer.normals[b];
      normalsArray[c] = buffer.normals[c];
    }
  }

  if (!hasVertTCoords && hasFaceTCoords) {
    // don't use array.shift, because buffer.indices will be used later
    var idxVerts = 0;
    var idxCoord = 0;

    for (var faceIdx = 0; faceIdx < nbFaces; ++faceIdx) {
      var nbFaceVerts = buffer.indices[idxVerts++];
      var texcoords = buffer.faceVertexUvs[idxCoord++];

      if (texcoords && nbFaceVerts * 2 === texcoords.length) {
        // grab the vertex index
        for (var _vertIdx = 0; _vertIdx < nbFaceVerts; ++_vertIdx) {
          var vert = buffer.indices[idxVerts++]; // new texture stored at the current face

          tcoordsArray[vert * 2 + 0] = texcoords[_vertIdx * 2 + 0];
          tcoordsArray[vert * 2 + 1] = texcoords[_vertIdx * 2 + 1];
        }
      } else {
        idxVerts += nbFaceVerts;
      }
    }
  }

  var polydata = vtkPolyData.newInstance();
  polydata.getPoints().setData(pointValues, 3);

  if (hasColor) {
    polydata.getPointData().setScalars(vtkDataArray.newInstance({
      numberOfComponents: 3,
      values: colorArray,
      name: 'Scalars'
    }));
  }

  if (hasVertTCoords || hasFaceTCoords) {
    var da = vtkDataArray.newInstance({
      numberOfComponents: 2,
      values: tcoordsArray,
      name: 'TextureCoordinates'
    });
    var cpd = polydata.getPointData();
    cpd.addArray(da);
    cpd.setActiveTCoords(da.getName());
  }

  if (hasNorms) {
    polydata.getPointData().setNormals(vtkDataArray.newInstance({
      numberOfComponents: 3,
      name: 'Normals',
      values: normalsArray
    }));
  }

  polydata.getPolys().setData(Uint32Array.from(buffer.indices));
  return polydata;
}

function parseNumber(n, type) {
  var r;

  switch (type) {
    case 'char':
    case 'uchar':
    case 'short':
    case 'ushort':
    case 'int':
    case 'uint':
    case 'int8':
    case 'uint8':
    case 'int16':
    case 'uint16':
    case 'int32':
    case 'uint32':
      r = parseInt(n, 10);
      break;

    case 'float':
    case 'double':
    case 'float32':
    case 'float64':
      r = parseFloat(n);
      break;

    default:
      console.log('Unsupported type');
      break;
  }

  return r;
}

function parseElement(properties, line) {
  var values = line.split(/\s+/);
  var element = {};

  for (var i = 0; i < properties.length; i++) {
    if (properties[i].type === 'list') {
      var list = [];
      var n = parseNumber(values.shift(), properties[i].countType);

      for (var j = 0; j < n; j++) {
        list.push(parseNumber(values.shift(), properties[i].itemType));
      }

      element[properties[i].name] = list;
    } else {
      element[properties[i].name] = parseNumber(values.shift(), properties[i].type);
    }
  }

  return element;
}

function handleElement(buffer, name, element) {
  if (name === 'vertex') {
    buffer.vertices.push(element.x, element.y, element.z); // Normals

    if ('nx' in element && 'ny' in element && 'nz' in element) {
      buffer.normals.push(element.nx, element.ny, element.nz);
    } // Uvs


    if ('s' in element && 't' in element) {
      buffer.uvs.push(element.s, element.t);
    } else if ('u' in element && 'v' in element) {
      buffer.uvs.push(element.u, element.v);
    } else if ('texture_u' in element && 'texture_v' in element) {
      buffer.uvs.push(element.texture_u, element.texture_v);
    } // Colors


    if ('red' in element && 'green' in element && 'blue' in element) {
      buffer.colors.push(element.red, element.green, element.blue);
    }
  } else if (name === 'face') {
    var vertexIndices = element.vertex_indices || element.vertex_index;
    var texcoord = element.texcoord;

    if (vertexIndices && vertexIndices.length > 0) {
      buffer.indices.push(vertexIndices.length);
      vertexIndices.forEach(function (val, idx) {
        buffer.indices.push(val);
      });
    }

    buffer.faceVertexUvs.push(texcoord);
  }
}

function binaryRead(dataview, at, type, littleEndian) {
  var r;

  switch (type) {
    case 'int8':
    case 'char':
      r = [dataview.getInt8(at), 1];
      break;

    case 'uint8':
    case 'uchar':
      r = [dataview.getUint8(at), 1];
      break;

    case 'int16':
    case 'short':
      r = [dataview.getInt16(at, littleEndian), 2];
      break;

    case 'uint16':
    case 'ushort':
      r = [dataview.getUint16(at, littleEndian), 2];
      break;

    case 'int32':
    case 'int':
      r = [dataview.getInt32(at, littleEndian), 4];
      break;

    case 'uint32':
    case 'uint':
      r = [dataview.getUint32(at, littleEndian), 4];
      break;

    case 'float32':
    case 'float':
      r = [dataview.getFloat32(at, littleEndian), 4];
      break;

    case 'float64':
    case 'double':
      r = [dataview.getFloat64(at, littleEndian), 8];
      break;

    default:
      console.log('Unsupported type');
      break;
  }

  return r;
}

function binaryReadElement(dataview, at, properties, littleEndian) {
  var element = {};
  var result;
  var read = 0;

  for (var i = 0; i < properties.length; i++) {
    if (properties[i].type === 'list') {
      var list = [];
      result = binaryRead(dataview, at + read, properties[i].countType, littleEndian);
      var n = result[0];
      read += result[1];

      for (var j = 0; j < n; j++) {
        result = binaryRead(dataview, at + read, properties[i].itemType, littleEndian);
        list.push(result[0]);
        read += result[1];
      }

      element[properties[i].name] = list;
    } else {
      result = binaryRead(dataview, at + read, properties[i].type, littleEndian);
      element[properties[i].name] = result[0];
      read += result[1];
    }
  }

  return [element, read];
} // ----------------------------------------------------------------------------
// vtkPLYReader methods
// ----------------------------------------------------------------------------


function vtkPLYReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkPLYReader'); // Create default dataAccessHelper if not available

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
    } // Header


    var text = BinaryHelper.arrayBufferToString(content);
    var header = parseHeader(text); // ascii/binary detection

    var isBinary = header.format !== PLYFormats.ASCII; // Check if ascii format

    if (!isBinary) {
      publicAPI.parseAsText(content);
      return;
    }

    model.parseData = content; // Binary parsing

    var buffer = {
      indices: [],
      vertices: [],
      normals: [],
      uvs: [],
      faceVertexUvs: [],
      colors: []
    };
    var littleEndian = header.format === PLYFormats.BINARY_LITTLE_ENDIAN;
    var arraybuffer = content instanceof ArrayBuffer ? content : content.buffer;
    var body = new DataView(arraybuffer, header.headerLength);
    var result;
    var loc = 0;

    for (var elem = 0; elem < header.elements.length; elem++) {
      for (var idx = 0; idx < header.elements[elem].count; idx++) {
        result = binaryReadElement(body, loc, header.elements[elem].properties, littleEndian);
        loc += result[1];
        var element = result[0];
        handleElement(buffer, header.elements[elem].name, element);
      }
    }

    var polydata = postProcess(buffer, header.elements); // Add new output

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

    model.parseData = content; // Header

    var text = BinaryHelper.arrayBufferToString(content);
    var header = parseHeader(text); // ascii/binary detection

    var isBinary = header.format !== PLYFormats.ASCII; // Check if ascii format

    if (isBinary) {
      publicAPI.parseAsArrayBuffer(content);
      return;
    } // Text parsing


    var buffer = {
      indices: [],
      vertices: [],
      normals: [],
      uvs: [],
      faceVertexUvs: [],
      colors: []
    };
    var result = patterns.patternBody.exec(text);
    var body = '';

    if (result !== null) {
      body = result[1];
    }

    var lines = body.split('\n');
    var elem = 0;
    var idx = 0;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      line = line.trim();

      if (line !== '') {
        if (idx >= header.elements[elem].count) {
          elem++;
          idx = 0;
        }

        var element = parseElement(header.elements[elem].properties, line);
        handleElement(buffer, header.elements[elem].name, element);
        idx++;
      }
    }

    var polydata = postProcess(buffer, header.elements); // Add new output

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
  macro.algo(publicAPI, model, 0, 1); // vtkPLYReader methods

  vtkPLYReader(publicAPI, model); // To support destructuring

  if (!model.compression) {
    model.compression = null;
  }

  if (!model.progressCallback) {
    model.progressCallback = null;
  }
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkPLYReader'); // ----------------------------------------------------------------------------

var vtkPLYReader$1 = {
  extend: extend,
  newInstance: newInstance
};

export { vtkPLYReader$1 as default, extend, newInstance };
