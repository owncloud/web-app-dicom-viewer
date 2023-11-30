import { newInstance as newInstance$1, obj, get, setGet, event } from '../../macros.js';
import DataAccessHelper from '../Core/DataAccessHelper.js';
import vtkTexture from '../../Rendering/Core/Texture.js';
import '../Core/DataAccessHelper/LiteHttpDataAccessHelper.js';

// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper'; // HTTP + gz
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/HtmlDataAccessHelper'; // html + base64 + zip
// import 'vtk.js/Sources/IO/Core/DataAccessHelper/JSZipDataAccessHelper'; // zip
// ----------------------------------------------------------------------------
// vtkMTLReader methods
// ----------------------------------------------------------------------------

function vtkMTLReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkMTLReader');

  function imageReady() {
    model.requestCount--;

    if (model.requestCount === 0) {
      publicAPI.invokeBusy(false);
    }
  }

  function parseLine(line) {
    if (line[0] === '#' || line.length === 0) {
      return;
    }

    var tokens = line.split(/[ \t]+/).map(function (s) {
      return s.trim();
    }).filter(function (s) {
      return s.length;
    });

    if (tokens[0] === 'newmtl') {
      tokens.shift();
      model.currentMaterial = tokens.join(' ').trim();
    } else if (model.currentMaterial) {
      if (tokens.length < 2) {
        return;
      }

      if (!model.materials[model.currentMaterial]) {
        model.materials[model.currentMaterial] = {};
      }

      model.materials[model.currentMaterial][tokens[0]] = tokens.slice(1);

      if (tokens[0] === 'map_Kd') {
        var image = new Image();

        image.onload = function () {
          return setTimeout(imageReady, 0);
        };

        image.src = [model.baseURL, tokens[1]].join('/');
        model.materials[model.currentMaterial].image = image;
        model.requestCount++;
      }
    }
  } // Create default dataAccessHelper if not available


  if (!model.dataAccessHelper) {
    model.dataAccessHelper = DataAccessHelper.get('http');
  } // Internal method to fetch Array


  function fetchData(url, options) {
    return model.dataAccessHelper.fetchText(publicAPI, url, options);
  } // Set DataSet url


  publicAPI.setUrl = function (url) {
    var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (url.indexOf('.mtl') === -1 && !option.fullpath) {
      model.baseURL = url;
      model.url = "".concat(url, "/index.mtl");
    } else {
      model.url = url; // Remove the file in the URL

      var path = url.split('/');
      path.pop();
      model.baseURL = path.join('/');
    } // Fetch metadata


    return publicAPI.loadData(option);
  }; // Fetch the actual data arrays


  publicAPI.loadData = function (option) {
    return new Promise(function (resolve, reject) {
      fetchData(model.url, option).then(function (content) {
        publicAPI.parseAsText(content);
        resolve();
      }, function (err) {
        reject();
      });
    });
  };

  publicAPI.parseAsText = function (content) {
    publicAPI.modified();
    model.materials = {};
    content.split('\n').forEach(parseLine);
  }; // return Busy state


  publicAPI.isBusy = function () {
    return !!model.requestCount;
  };

  publicAPI.getMaterialNames = function () {
    return Object.keys(model.materials);
  };

  publicAPI.getMaterial = function (name) {
    return model.materials[name];
  };

  publicAPI.listImages = function () {
    return Object.keys(model.materials).map(function (name) {
      return model.materials[name].map_Kd;
    }).filter(function (fileName) {
      return !!fileName;
    }).map(function (s) {
      return s[0].trim();
    });
  };

  publicAPI.setImageSrc = function (imagePath, src) {
    return new Promise(function (resolve, reject) {
      var selectedName = Object.keys(model.materials).find(function (name) {
        return model.materials[name].map_Kd && model.materials[name].map_Kd[0].trim() === imagePath.trim();
      });
      var material = model.materials[selectedName];

      if (material && material.image) {
        material.image.src = src;

        material.image.onload = function () {
          return setTimeout(resolve, 0);
        };
      } else {
        resolve();
      }
    });
  };

  publicAPI.applyMaterialToActor = function (name, actor) {
    var material = model.materials[name];

    if (material && actor) {
      var white = [1, 1, 1];
      var actorProp = {
        ambientColor: material.Ka ? material.Ka.map(function (i) {
          return Number(i);
        }) : white,
        specularColor: material.Ks ? material.Ks.map(function (i) {
          return Number(i);
        }) : white,
        diffuseColor: material.Kd ? material.Kd.map(function (i) {
          return Number(i);
        }) : white,
        opacity: material.d ? Number(material.d) : 1,
        specularPower: material.Ns ? Number(material.Ns) : 1
      };
      var illum = Number(material.illum || 2);
      ['ambient', 'diffuse', 'specular'].forEach(function (k, idx) {
        actorProp[k] = idx <= illum ? 1.0 : 0.0;
      });

      if (material.image) {
        var texture = vtkTexture.newInstance({
          interpolate: model.interpolateTextures
        });
        texture.setImage(material.image);
        actor.addTexture(texture);
      }

      actor.getProperty().set(actorProp);
    }
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  numberOfOutputs: 1,
  requestCount: 0,
  materials: {},
  interpolateTextures: true // baseURL: null,
  // dataAccessHelper: null,
  // url: null,

}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Build VTK API

  obj(publicAPI, model);
  get(publicAPI, model, ['url', 'baseURL']);
  setGet(publicAPI, model, ['dataAccessHelper', 'interpolateTextures', 'splitGroup']);
  event(publicAPI, model, 'busy'); // Object methods

  vtkMTLReader(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = newInstance$1(extend, 'vtkMTLReader'); // ----------------------------------------------------------------------------

var vtkMTLReader$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkMTLReader$1 as default, extend, newInstance };
