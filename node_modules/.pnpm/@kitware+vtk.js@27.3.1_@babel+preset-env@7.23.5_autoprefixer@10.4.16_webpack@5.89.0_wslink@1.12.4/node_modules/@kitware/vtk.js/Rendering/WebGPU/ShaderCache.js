import macro from '../../macros.js';
import vtkWebGPUShaderModule from './ShaderModule.js';

// this is useful for building up shader strings which typically involve
// lots of string substitutions. Return true if a substitution was done.

function substitute(source, search, replace) {
  var all = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  var replaceStr = Array.isArray(replace) ? replace.join('\n') : replace;
  var replaced = false;

  if (source.search(search) !== -1) {
    replaced = true;
  }

  var gflag = '';

  if (all) {
    gflag = 'g';
  }

  var regex = new RegExp(search, gflag);
  var resultstr = source.replace(regex, replaceStr);
  return {
    replace: replaced,
    result: resultstr
  };
} // ----------------------------------------------------------------------------
// vtkWebGPUShaderCache methods
// ----------------------------------------------------------------------------


function vtkWebGPUShaderCache(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkWebGPUShaderCache');

  publicAPI.getShaderModule = function (shaderDesc) {
    // has it already been created?
    var sType = shaderDesc.getType();
    var sHash = shaderDesc.getHash();

    var keys = model._shaderModules.keys();

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];

      if (key.getHash() === sHash && key.getType() === sType) {
        return model._shaderModules.get(key);
      }
    } // console.log(JSON.stringify(shaderDesc));


    var sm = vtkWebGPUShaderModule.newInstance();
    sm.initialize(model.device, shaderDesc);

    model._shaderModules.set(shaderDesc, sm);

    return sm;
  };
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  shaderModules: null,
  device: null,
  window: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Internal objects

  model._shaderModules = new Map(); // Build VTK API

  macro.obj(publicAPI, model);
  macro.setGet(publicAPI, model, ['device', 'window']); // Object methods

  vtkWebGPUShaderCache(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkWebGPUShaderCache'); // ----------------------------------------------------------------------------

var vtkWebGPUShaderCache$1 = {
  newInstance: newInstance,
  extend: extend,
  substitute: substitute
};

export { vtkWebGPUShaderCache$1 as default, extend, newInstance };
