import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import vtkDataArray from '../../Common/Core/DataArray.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';

var METHOD_MAPPING = {
  POINTS: 'getPoints',
  VERTICES: 'getVerts',
  LINES: 'getLines',
  TRIANGLE_STRIPS: 'getStrips',
  POLYGONS: 'getPolys',
  POINT_DATA: 'getPointData',
  CELL_DATA: 'getCellData',
  FIELD: 'getFieldData'
};
var DATATYPES = {
  bit: Uint8Array,
  unsigned_char: Uint8Array,
  char: Int8Array,
  unsigned_short: Uint16Array,
  short: Int16Array,
  unsigned_int: Uint32Array,
  int: Int32Array,
  unsigned_long: Uint32Array,
  long: Int32Array,
  float: Float32Array,
  double: Float64Array
};
var REGISTER_MAPPING = {
  SCALARS: 'addArray',
  COLOR_SCALARS: 'addArray',
  VECTORS: 'setVectors',
  NORMALS: 'setNormals',
  TEXTURE_COORDINATES: 'setTCoords',
  TENSORS: 'setTensors',
  FIELD: 'addArray'
};

function createArrayHandler(array, setData, nbComponents) {
  var offset = 0;

  function fillWith(line) {
    line.split(' ').forEach(function (token) {
      if (token.length) {
        array[offset++] = Number(token);
      }
    });

    if (offset < array.length) {
      return true;
    }

    setData(array, nbComponents);
    return false;
  }

  return fillWith;
}

var GENERIC_CELL_HANDLER = {
  init: function init(line, dataModel) {
    var _line$split = line.split(' '),
        _line$split2 = _slicedToArray(_line$split, 3),
        name = _line$split2[0],
        nbCells = _line$split2[1],
        nbValues = _line$split2[2];

    var cellArray = dataModel.dataset[METHOD_MAPPING[name]]();
    cellArray.set({
      numberOfCells: Number(nbCells)
    }, true); // Force numberOfCells update

    dataModel.arrayHandler = createArrayHandler(new Uint32Array(Number(nbValues)), cellArray.setData, 1);
    return true;
  },
  parse: function parse(line, dataModel) {
    return dataModel.arrayHandler(line);
  }
};
var TYPE_PARSER = {
  DATASET: {
    init: function init(line, datamodel) {
      var type = line.split(' ')[1];

      switch (type) {
        case 'POLYDATA':
          datamodel.dataset = vtkPolyData.newInstance();
          break;

        default:
          console.error("Dataset of type ".concat(type, " not supported"));
      }

      return false;
    },
    parse: function parse(line, datamodel) {
      return false;
    }
  },
  POINTS: {
    init: function init(line, dataModel) {
      var _line$split3 = line.split(' '),
          _line$split4 = _slicedToArray(_line$split3, 3),
          name = _line$split4[0],
          size = _line$split4[1],
          type = _line$split4[2];

      var array = type === 'float' ? new Float32Array(3 * Number(size)) : new Float64Array(3 * Number(size));
      var dataArray = dataModel.dataset.getPoints();
      dataArray.setName(name);
      dataModel.arrayHandler = createArrayHandler(array, dataArray.setData, 3);
      return true;
    },
    parse: function parse(line, dataModel) {
      return dataModel.arrayHandler(line);
    }
  },
  METADATA: {
    init: function init(line, dataModel) {
      return true;
    },
    parse: function parse(line, dataModel) {
      return !!line.length;
    }
  },
  VERTICES: GENERIC_CELL_HANDLER,
  LINES: GENERIC_CELL_HANDLER,
  TRIANGLE_STRIPS: GENERIC_CELL_HANDLER,
  POLYGONS: GENERIC_CELL_HANDLER,
  POINT_DATA: {
    init: function init(line, dataModel) {
      dataModel.POINT_DATA = Number(line.split(' ')[1]);
      dataModel.activeFieldLocation = 'POINT_DATA';
      return false;
    },
    parse: function parse(line, dataModel) {
      return false;
    }
  },
  CELL_DATA: {
    init: function init(line, dataModel) {
      dataModel.CELL_DATA = Number(line.split(' ')[1]);
      dataModel.activeFieldLocation = 'CELL_DATA';
      return false;
    },
    parse: function parse(line, dataModel) {
      return false;
    }
  },
  SCALARS: {
    init: function init(line, dataModel) {
      var _line$split5 = line.split(' '),
          _line$split6 = _slicedToArray(_line$split5, 4),
          type = _line$split6[0],
          name = _line$split6[1],
          dataType = _line$split6[2],
          numComp = _line$split6[3];

      var numOfComp = Number(numComp) > 0 ? Number(numComp) : 1;
      var size = dataModel[dataModel.activeFieldLocation] * numOfComp;
      var array = new DATATYPES[dataType](size);
      var dataArray = vtkDataArray.newInstance({
        name: name,
        empty: true
      });
      dataModel.dataset[METHOD_MAPPING[dataModel.activeFieldLocation]]()[REGISTER_MAPPING[type]](dataArray);
      dataModel.arrayHandler = createArrayHandler(array, dataArray.setData, numOfComp);
      return true;
    },
    parse: function parse(line, dataModel) {
      if (line.split(' ')[0] === 'LOOKUP_TABLE') {
        return true;
      }

      return dataModel.arrayHandler(line);
    }
  },
  COLOR_SCALARS: {
    init: function init(line, dataModel) {
      var _line$split7 = line.split(' '),
          _line$split8 = _slicedToArray(_line$split7, 3),
          type = _line$split8[0],
          name = _line$split8[1],
          numComp = _line$split8[2];

      var numOfComp = Number(numComp) > 0 ? Number(numComp) : 1;
      var size = dataModel[dataModel.activeFieldLocation] * numOfComp;
      var array = new Uint8Array(size);
      var dataArray = vtkDataArray.newInstance({
        name: name,
        empty: true
      });
      dataModel.dataset[METHOD_MAPPING[dataModel.activeFieldLocation]]()[REGISTER_MAPPING[type]](dataArray);
      dataModel.arrayHandler = createArrayHandler(array, dataArray.setData, numOfComp);
      return true;
    },
    parse: function parse(line, dataModel) {
      if (line.split(' ')[0] === 'LOOKUP_TABLE') {
        return true;
      }

      return dataModel.arrayHandler(line);
    }
  },
  VECTORS: {
    init: function init(line, dataModel) {
      var _line$split9 = line.split(' '),
          _line$split10 = _slicedToArray(_line$split9, 3),
          type = _line$split10[0],
          name = _line$split10[1],
          dataType = _line$split10[2];

      var size = dataModel[dataModel.activeFieldLocation] * 3;
      var array = new DATATYPES[dataType](size);
      var dataArray = vtkDataArray.newInstance({
        name: name,
        empty: true
      });
      dataModel.dataset[METHOD_MAPPING[dataModel.activeFieldLocation]]()[REGISTER_MAPPING[type]](dataArray);
      dataModel.arrayHandler = createArrayHandler(array, dataArray.setData, 3);
      return true;
    },
    parse: function parse(line, dataModel) {
      return dataModel.arrayHandler(line);
    }
  },
  NORMALS: {
    init: function init(line, dataModel) {
      var _line$split11 = line.split(' '),
          _line$split12 = _slicedToArray(_line$split11, 2),
          type = _line$split12[0],
          name = _line$split12[1];

      var size = dataModel[dataModel.activeFieldLocation] * 3;
      var array = new Float32Array(size);
      var dataArray = vtkDataArray.newInstance({
        name: name,
        empty: true
      });
      dataModel.dataset[METHOD_MAPPING[dataModel.activeFieldLocation]]()[REGISTER_MAPPING[type]](dataArray);
      dataModel.arrayHandler = createArrayHandler(array, dataArray.setData, 3);
      return true;
    },
    parse: function parse(line, dataModel) {
      return dataModel.arrayHandler(line);
    }
  },
  TEXTURE_COORDINATES: {
    init: function init(line, dataModel) {
      var _line$split13 = line.split(' '),
          _line$split14 = _slicedToArray(_line$split13, 4),
          type = _line$split14[0],
          name = _line$split14[1],
          numberOfComponents = _line$split14[2],
          dataType = _line$split14[3];

      var size = dataModel[dataModel.activeFieldLocation] * Number(numberOfComponents);
      var array = new DATATYPES[dataType](size);
      var dataArray = vtkDataArray.newInstance({
        name: name,
        empty: true
      });
      dataModel.dataset[METHOD_MAPPING[dataModel.activeFieldLocation]]()[REGISTER_MAPPING[type]](dataArray);
      dataModel.arrayHandler = createArrayHandler(array, dataArray.setData, 3);
      return true;
    },
    parse: function parse(line, dataModel) {
      return dataModel.arrayHandler(line);
    }
  },
  TENSORS: {
    init: function init(line, dataModel) {
      var _line$split15 = line.split(' '),
          _line$split16 = _slicedToArray(_line$split15, 3),
          type = _line$split16[0],
          name = _line$split16[1],
          dataType = _line$split16[2];

      var size = dataModel[dataModel.activeFieldLocation] * 9;
      var array = new DATATYPES[dataType](size);
      var dataArray = vtkDataArray.newInstance({
        name: name,
        empty: true
      });
      dataModel.dataset[METHOD_MAPPING[dataModel.activeFieldLocation]]()[REGISTER_MAPPING[type]](dataArray);
      dataModel.arrayHandler = createArrayHandler(array, dataArray.setData, 9);
      return true;
    },
    parse: function parse(line, dataModel) {
      return dataModel.arrayHandler(line);
    }
  }
};

function getParser(line, dataModel) {
  var tokens = line.split(' ');
  return TYPE_PARSER[tokens[0]];
}

function parseLegacyASCII(content) {
  var dataModel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var parser = null;
  var separatorRegExp = /\r?\n/;
  var separatorRes = separatorRegExp.exec(content);
  var separator = separatorRes !== null ? separatorRes[0] : null;
  content.split(separator).forEach(function (line, index) {
    if (index < 2) {
      return;
    }

    if (!parser) {
      parser = getParser(line);

      if (!parser) {
        return;
      }

      parser = parser.init(line, dataModel) ? parser : null;
      return;
    }

    if (parser && !parser.parse(line, dataModel)) {
      parser = null;
    }
  });
  return dataModel;
}

var vtkLegacyAsciiParser = {
  parseLegacyASCII: parseLegacyASCII
};

export { vtkLegacyAsciiParser as default };
