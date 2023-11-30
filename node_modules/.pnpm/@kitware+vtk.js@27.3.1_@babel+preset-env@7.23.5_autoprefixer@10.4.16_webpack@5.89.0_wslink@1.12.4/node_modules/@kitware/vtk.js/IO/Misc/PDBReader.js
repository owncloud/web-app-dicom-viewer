import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import macro from '../../macros.js';
import vtkMolecule from '../../Common/DataModel/Molecule.js';
import DataAccessHelper from '../Core/DataAccessHelper.js';
import { A as ATOMS } from '../../Utilities/XMLConverter/chemistry-mapper/elements.json.js';
import '../Core/DataAccessHelper/LiteHttpDataAccessHelper.js';

// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper'; // HTTP + gz
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HtmlDataAccessHelper'; // html + base64 + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/JSZipDataAccessHelper'; // zip
// ----------------------------------------------------------------------------
// vtkPDBReader methods
// ----------------------------------------------------------------------------

function vtkPDBReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkPDBReader'); // Create default dataAccessHelper if not available

  if (!model.dataAccessHelper) {
    model.dataAccessHelper = DataAccessHelper.get('http');
  } // Internal method to fetch Array


  function fetchPDB(url, option) {
    return model.dataAccessHelper.fetchText(publicAPI, url, option);
  } // Set DataSet url


  publicAPI.setUrl = function (url, option) {
    if (url.indexOf('.pdb') === -1) {
      model.baseURL = url;
      model.url = "".concat(url); // `${url}/index.pdb`;
    } else {
      model.url = url; // Remove the file in the URL

      var path = url.split('/');
      path.pop();
      model.baseURL = path.join('/');
    } // Fetch metadata


    return publicAPI.loadData(option);
  }; // Fetch the actual data arrays


  publicAPI.loadData = function (option) {
    return fetchPDB(model.url, option).then(publicAPI.parseAsText);
  };

  publicAPI.parseAsText = function (txt) {
    model.pdb = txt;
    model.molecule = [];
    model.molecule = model.pdb.split('\n');
    publicAPI.modified();
    return true;
  };

  publicAPI.requestData = function (inData, outData) {
    var moleculedata = vtkMolecule.newInstance();

    if (model.molecule) {
      var jSize = model.molecule.length; // atom position

      var pointValues = []; // atomicNumber

      var atomicNumber = [];
      model.numberOfAtoms = 0;
      var j = 0;

      while (j < jSize && model.molecule[j] !== 'END') {
        var iSize = model.molecule[j].length;
        var linebuf = model.molecule[j];
        var command = linebuf.substr(0, 6).replace(/\s+/g, '');
        command.toUpperCase(); // Parse lines

        if (command === 'ATOM' || command === 'HETATM') {
          var dum1 = linebuf.substr(12, 4).replace(/\s+/g, ''); // const dum2 = (linebuf.substr(17, 3)).replace(/\s+/g, '');
          // const chain = (linebuf.substr(21, 1)).replace(/\s+/g, '');
          // const resi = ((linebuf.substr(22, 8)).replace(/\s+/g, '')).replace(/\D/g, '');

          var x = linebuf.substr(30, 8).replace(/\s+/g, '');
          var y = linebuf.substr(38, 8).replace(/\s+/g, '');
          var z = linebuf.substr(46, 8).replace(/\s+/g, '');
          var elem = '';

          if (iSize >= 78) {
            elem = linebuf.substr(76, 2).replace(/\s+/g, '');
          }

          if (elem === '') {
            // if element symbol was not specified, just use the "Atom name".
            elem = dum1.substr(0, 2).replace(/\d/g, '');
          } // fill polydata
          // atoms position


          pointValues.push(x);
          pointValues.push(y);
          pointValues.push(z); // fetch data from the element database elements.json

          var _ATOMS$elem = _slicedToArray(ATOMS[elem], 1),
              atomicNumberData = _ATOMS$elem[0]; // atoms atomicNumber


          atomicNumber.push(atomicNumberData); // residue.push(resi);
          // chain.push(chain);
          // atomType.push(elem);
          // atomTypeStrings.push(dum1);
          // isHetatm.push(command === 'HETATM');

          model.numberOfAtoms++;
        } // if atom or hetatm

        /*
        else if (command === 'SHEET') {
          const startChain = (linebuf.substr(21,1)).replace(/\s+/g, '');
          const startResi = (linebuf.substr(22,4)).replace(/\s+/g, '').replace(/\D/g, '');
          const endChain = (linebuf.substr(32,1)).replace(/\s+/g, '');
          const endResi = (linebuf.substr(33,4)).replace(/\s+/g, '').replace(/\D/g, '');;
          const tuple = { startChain, startResi, endChain, endResi };
          sheets.push(tuple);
        }
        else if (command === 'HELIX') {
          const startChain = (linebuf.substr(19,2)).replace(/\s+/g, '');
          const startResi = (linebuf.substr(21,4)).replace(/\s+/g, '').replace(/\D/g, '');;
          const endChain = (linebuf.substr(31,2)).replace(/\s+/g, '');
          const endResi = (linebuf.substr(33,4)).replace(/\s+/g, '').replace(/\D/g, '');;
          const tuple = { startChain, startResi, endChain, endResi };
          helix.push(tuple);
        }
        */


        j++;
      } // lines loop (j)
      // fill molecule class


      moleculedata.getAtoms().elements = {};
      moleculedata.getAtoms().elements.number = Int8Array.from(atomicNumber);
      moleculedata.getAtoms().coords = {};
      moleculedata.getAtoms().coords['3d'] = Float32Array.from(pointValues);
    } // if model.molecule


    model.output[0] = moleculedata;
  }; // return Busy state


  publicAPI.isBusy = function () {
    return !!model.requestCount;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  numberOfAtoms: 0,
  requestCount: 0 // baseURL: null,
  // dataAccessHelper: null,
  // url: null,

}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['url', 'baseURL', 'numberOfAtoms', 'requestCount']);
  macro.setGet(publicAPI, model, ['dataAccessHelper']);
  macro.algo(publicAPI, model, 0, 1);
  macro.event(publicAPI, model, 'busy'); // Object methods

  vtkPDBReader(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkPDBReader'); // ----------------------------------------------------------------------------

var vtkPDBReader$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkPDBReader$1 as default, extend, newInstance };
