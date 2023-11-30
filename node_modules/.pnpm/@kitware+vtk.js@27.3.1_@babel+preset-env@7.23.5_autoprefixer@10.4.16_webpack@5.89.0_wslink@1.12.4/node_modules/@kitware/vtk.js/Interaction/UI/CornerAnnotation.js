import macro from '../../macros.js';
import { s as style } from './CornerAnnotation/CornerAnnotation.module.css.js';

function noOp() {}

var KEY_MAPPING = {
  nw: 'northWestContainer',
  n: 'northContainer',
  ne: 'northEastContainer',
  w: 'westContainer',
  e: 'eastContainer',
  sw: 'southWestContainer',
  s: 'southContainer',
  se: 'southEastContainer'
}; // ----------------------------------------------------------------------------
// Static helpers
// ----------------------------------------------------------------------------

function get(path, obj) {
  var fb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "${".concat(path, "}");
  return path.split('.').reduce(function (res, key) {
    return res[key] !== undefined ? res[key] : fb;
  }, obj);
}
/* from https://gist.github.com/smeijer/6580740a0ff468960a5257108af1384e */


function applyTemplate(template, map, fallback) {
  return template.replace(/\${([^{]+)}/g, function (match) {
    var path = match.substr(2, match.length - 3).trim();
    return get(path, map, fallback);
  });
} // ----------------------------------------------------------------------------
// vtkCornerAnnotation methods
// ----------------------------------------------------------------------------


function vtkCornerAnnotation(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkCornerAnnotation'); // Create instance specific container

  if (!model.templates) {
    model.templates = {};
  }

  if (!model.metadata) {
    model.metadata = {};
  }

  model.annotationContainer = document.createElement('div');
  model.annotationContainer.setAttribute('class', style.container);
  model.annotationContainer.innerHTML = "\n    <div class=\"".concat(style.topRow, "\">\n      <div class=\"js-nw ").concat(style.northWest, "\"></div>\n      <div class=\"js-n ").concat(style.north, "\"></div>\n      <div class=\"js-ne ").concat(style.northEast, "\"></div>\n    </div>\n    <div class=\"").concat(style.middleRow, "\">\n      <div class=\"js-w ").concat(style.west, "\"></div>\n      <div class=\"js-e ").concat(style.east, "\"></div>\n    </div>\n    <div class=\"").concat(style.bottomRow, "\">\n      <div class=\"js-sw ").concat(style.southWest, "\"></div>\n      <div class=\"js-s ").concat(style.south, "\"></div>\n      <div class=\"js-se ").concat(style.southEast, "\"></div>\n    </div>"); // Extract various containers

  model.northWestContainer = model.annotationContainer.querySelector('.js-nw');
  model.northContainer = model.annotationContainer.querySelector('.js-n');
  model.northEastContainer = model.annotationContainer.querySelector('.js-ne');
  model.westContainer = model.annotationContainer.querySelector('.js-w');
  model.eastContainer = model.annotationContainer.querySelector('.js-e');
  model.southWestContainer = model.annotationContainer.querySelector('.js-sw');
  model.southContainer = model.annotationContainer.querySelector('.js-s');
  model.southEastContainer = model.annotationContainer.querySelector('.js-se'); // --------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------

  function updateAnnotations() {
    var keys = Object.keys(model.templates);
    var count = keys.length;

    while (count--) {
      var el = model[KEY_MAPPING[keys[count]]];
      var fn = model.templates[keys[count]];

      if (el && fn) {
        el.innerHTML = fn(model.metadata);
      }
    }
  } // --------------------------------------------------------------------------


  publicAPI.setContainer = function (el) {
    if (model.container && model.container !== el) {
      model.container.removeChild(model.annotationContainer);
    }

    if (model.container !== el) {
      model.container = el;

      if (model.container) {
        model.container.appendChild(model.annotationContainer);
        publicAPI.resize();
      }

      publicAPI.modified();
    }
  };

  publicAPI.resize = noOp;

  publicAPI.updateTemplates = function (templates) {
    model.templates = Object.assign(model.templates, templates);
    updateAnnotations();
    publicAPI.modified();
  };

  publicAPI.updateMetadata = function (metadata) {
    model.metadata = Object.assign(model.metadata, metadata);
    updateAnnotations();
    publicAPI.modified();
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  templates: null,
  metadata: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Object methods

  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, ['annotationContainer', 'northWestContainer', 'northContainer', 'northEastContainer', 'westContainer', 'eastContainer', 'southWestContainer', 'southContainer', 'southEastContainer', 'metadata']); // Object specific methods

  vtkCornerAnnotation(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkCornerAnnotation'); // ----------------------------------------------------------------------------

var vtkCornerAnnotation$1 = {
  newInstance: newInstance,
  extend: extend,
  applyTemplate: applyTemplate
};

export { vtkCornerAnnotation$1 as default, extend, newInstance };
