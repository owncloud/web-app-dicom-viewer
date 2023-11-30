import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import macro from '../../macros.js';
import vtkCell from './Cell.js';

// Global methods
// ----------------------------------------------------------------------------

var InitLink = {
  ncells: 0,
  cells: null
};

function resize(model, sz) {
  var newSize = sz;

  if (sz >= model.array.length) {
    newSize += model.array.length;
  }

  while (newSize > model.array.length) {
    model.array.push({
      ncells: 0,
      cells: null
    });
  }

  model.array.length = newSize;
} // ----------------------------------------------------------------------------
// vtkCellLinks methods
// ----------------------------------------------------------------------------


function vtkCellLinks(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkCellLinks');
  /**
   * Build the link list array. All subclasses of vtkAbstractCellLinks
   * must support this method.
   */

  publicAPI.buildLinks = function (data) {
    var numPts = data.getPoints().getNumberOfPoints();
    var numCells = data.getNumberOfCells(); // fill out lists with number of references to cells

    var linkLoc = new Uint32Array(numPts); // Use fast path if polydata

    if (data.isA('vtkPolyData')) {
      // traverse data to determine number of uses of each point
      for (var cellId = 0; cellId < numCells; ++cellId) {
        var _data$getCellPoints = data.getCellPoints(cellId),
            cellPointIds = _data$getCellPoints.cellPointIds;

        cellPointIds.forEach(function (cellPointId) {
          publicAPI.incrementLinkCount(cellPointId);
        });
      } // now allocate storage for the links


      publicAPI.allocateLinks(numPts);
      model.maxId = numPts - 1;

      var _loop = function _loop(_cellId) {
        var _data$getCellPoints2 = data.getCellPoints(_cellId),
            cellPointIds = _data$getCellPoints2.cellPointIds;

        cellPointIds.forEach(function (cellPointId) {
          publicAPI.insertCellReference(cellPointId, linkLoc[cellPointId]++, _cellId);
        });
      };

      for (var _cellId = 0; _cellId < numCells; ++_cellId) {
        _loop(_cellId);
      }
    } // any other type of dataset
    else {
      // traverse data to determine number of uses of each point
      for (var _cellId2 = 0; _cellId2 < numCells; _cellId2++) {
        // TODO: Currently not supported: const cell = data.getCell(cellId);
        var cell = vtkCell.newInstance();
        cell.getPointsIds().forEach(function (cellPointId) {
          publicAPI.incrementLinkCount(cellPointId);
        });
      } // now allocate storage for the links


      publicAPI.allocateLinks(numPts);
      model.maxId = numPts - 1;

      var _loop2 = function _loop2(_cellId3) {
        // TODO: Currently not supported: const cell = data.getCell(cellId);
        var cell = vtkCell.newInstance();
        cell.getPointsIds().forEach(function (cellPointId) {
          publicAPI.insertCellReference(cellPointId, linkLoc[cellPointId]++, _cellId3);
        });
      };

      for (var _cellId3 = 0; _cellId3 < numCells; ++_cellId3) {
        _loop2(_cellId3);
      }
    } // end else

  };
  /**
   * Build the link list array with a provided connectivity array.
   */
  // publicAPI.buildLinks = (data, connectivity) => {};

  /**
   * Allocate the specified number of links (i.e., number of points) that
   * will be built.
   */


  publicAPI.allocate = function (numLinks) {
    var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
    model.array = Array(numLinks).fill().map(function () {
      return {
        ncells: 0,
        cells: null
      };
    });
    model.extend = ext;
    model.maxId = -1;
  };

  publicAPI.initialize = function () {
    model.array = null;
  };
  /**
   * Get a link structure given a point id.
   */


  publicAPI.getLink = function (ptId) {
    return model.array[ptId];
  };
  /**
   * Get the number of cells using the point specified by ptId.
   */


  publicAPI.getNcells = function (ptId) {
    return model.array[ptId].ncells;
  };
  /**
   * Return a list of cell ids using the point.
   */


  publicAPI.getCells = function (ptId) {
    return model.array[ptId].cells;
  };
  /**
   * Insert a new point into the cell-links data structure. The size parameter
   * is the initial size of the list.
   */


  publicAPI.insertNextPoint = function (numLinks) {
    model.array.push({
      ncells: numLinks,
      cells: Array(numLinks)
    });
    ++model.maxId;
  };
  /**
   * Insert a cell id into the list of cells (at the end) using the cell id
   * provided. (Make sure to extend the link list (if necessary) using the
   * method resizeCellList().)
   */


  publicAPI.insertNextCellReference = function (ptId, cellId) {
    model.array[ptId].cells[model.array[ptId].ncells++] = cellId;
  };
  /**
   * Delete point (and storage) by destroying links to using cells.
   */


  publicAPI.deletePoint = function (ptId) {
    model.array[ptId].ncells = 0;
    model.array[ptId].cells = null;
  };
  /**
   * Delete the reference to the cell (cellId) from the point (ptId). This
   * removes the reference to the cellId from the cell list, but does not
   * resize the list (recover memory with resizeCellList(), if necessary).
   */


  publicAPI.removeCellReference = function (cellId, ptId) {
    model.array[ptId].cells = model.array[ptId].cells.filter(function (cell) {
      return cell !== cellId;
    });
    model.array[ptId].ncells = model.array[ptId].cells.length;
  };
  /**
   * Add the reference to the cell (cellId) from the point (ptId). This
   * adds a reference to the cellId from the cell list, but does not resize
   * the list (extend memory with resizeCellList(), if necessary).
   */


  publicAPI.addCellReference = function (cellId, ptId) {
    model.array[ptId].cells[model.array[ptId].ncells++] = cellId;
  };
  /**
   * Change the length of a point's link list (i.e., list of cells using a
   * point) by the size specified.
   */


  publicAPI.resizeCellList = function (ptId, size) {
    model.array[ptId].cells.length = size;
  };
  /**
   * Reclaim any unused memory.
   */


  publicAPI.squeeze = function () {
    resize(model, model.maxId + 1);
  };
  /**
   * Reset to a state of no entries without freeing the memory.
   */


  publicAPI.reset = function () {
    model.maxId = -1;
  };
  /**
   * Standard DeepCopy method.  Since this object contains no reference
   * to other objects, there is no ShallowCopy.
   */


  publicAPI.deepCopy = function (src) {
    model.array = _toConsumableArray(src.array);
    model.extend = src.extend;
    model.maxId = src.maxId;
  };
  /**
   * Increment the count of the number of cells using the point.
   */


  publicAPI.incrementLinkCount = function (ptId) {
    ++model.array[ptId].ncells;
  };

  publicAPI.allocateLinks = function (n) {
    for (var i = 0; i < n; ++i) {
      model.array[i].cells = new Array(model.array[i].ncells);
    }
  };
  /**
   * Insert a cell id into the list of cells using the point.
   */


  publicAPI.insertCellReference = function (ptId, pos, cellId) {
    model.array[ptId].cells[pos] = cellId;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  array: null,
  // pointer to data
  maxId: 0,
  // maximum index inserted thus far
  extend: 0 // grow array by this point

}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.obj(publicAPI, model);
  vtkCellLinks(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkCellLinks'); // ----------------------------------------------------------------------------

var vtkCellLinks$1 = {
  newInstance: newInstance,
  extend: extend
};

export { InitLink, vtkCellLinks$1 as default, extend, newInstance };
