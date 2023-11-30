import macro from '../../macros.js';
import vtkPolyData from '../../Common/DataModel/PolyData.js';
import vtkXMLReader from './XMLReader.js';

// Global method
// ----------------------------------------------------------------------------

function handleArray(polydata, cellType, piece, compressor, byteOrder, headerType, binaryBuffer) {
  var size = Number(piece.getAttribute("NumberOf".concat(cellType)));

  if (size > 0) {
    var dataArrayElem = piece.getElementsByTagName(cellType)[0].getElementsByTagName('DataArray')[0];

    var _vtkXMLReader$process = vtkXMLReader.processDataArray(size, dataArrayElem, compressor, byteOrder, headerType, binaryBuffer),
        values = _vtkXMLReader$process.values,
        numberOfComponents = _vtkXMLReader$process.numberOfComponents;

    polydata["get".concat(cellType)]().setData(values, numberOfComponents);
  }

  return size;
} // ----------------------------------------------------------------------------


function handleCells(polydata, cellType, piece, compressor, byteOrder, headerType, binaryBuffer) {
  var size = Number(piece.getAttribute("NumberOf".concat(cellType)));

  if (size > 0) {
    var values = vtkXMLReader.processCells(size, piece.getElementsByTagName(cellType)[0], compressor, byteOrder, headerType, binaryBuffer);
    polydata["get".concat(cellType)]().setData(values);
  }

  return size;
} // ----------------------------------------------------------------------------
// vtkXMLPolyDataReader methods
// ----------------------------------------------------------------------------


function vtkXMLPolyDataReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkXMLPolyDataReader');

  publicAPI.parseXML = function (rootElem, type, compressor, byteOrder, headerType) {
    var datasetElem = rootElem.getElementsByTagName(model.dataType)[0];
    var pieces = datasetElem.getElementsByTagName('Piece');
    var nbPieces = pieces.length;

    var _loop = function _loop(outputIndex) {
      // Create dataset
      var polydata = vtkPolyData.newInstance();
      var piece = pieces[outputIndex]; // Points

      var nbPoints = handleArray(polydata, 'Points', piece, compressor, byteOrder, headerType, model.binaryBuffer); // Cells

      var nbCells = 0;
      ['Verts', 'Lines', 'Strips', 'Polys'].forEach(function (cellType) {
        nbCells += handleCells(polydata, cellType, piece, compressor, byteOrder, headerType, model.binaryBuffer);
      }); // Fill data

      vtkXMLReader.processFieldData(nbPoints, piece.getElementsByTagName('PointData')[0], polydata.getPointData(), compressor, byteOrder, headerType, model.binaryBuffer);
      vtkXMLReader.processFieldData(nbCells, piece.getElementsByTagName('CellData')[0], polydata.getCellData(), compressor, byteOrder, headerType, model.binaryBuffer); // Add new output

      model.output[outputIndex] = polydata;
    };

    for (var outputIndex = 0; outputIndex < nbPieces; outputIndex++) {
      _loop(outputIndex);
    }
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  dataType: 'PolyData'
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  vtkXMLReader.extend(publicAPI, model, initialValues);
  vtkXMLPolyDataReader(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkXMLPolyDataReader'); // ----------------------------------------------------------------------------

var vtkXMLPolyDataReader$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkXMLPolyDataReader$1 as default, extend, newInstance };
