import macro from '../../macros.js';

var MOLECULE_FIELDS = ['chemical json', 'name', 'inchi', 'formula', 'atoms', 'bonds', 'properties']; // ----------------------------------------------------------------------------
// vtkMolecule methods
// ----------------------------------------------------------------------------

function vtkMolecule(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkMolecule');
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  'chemical json': 0,
  name: '',
  inchi: '',
  formula: '',
  atoms: null,
  bonds: null,
  properties: null
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Object methods

  macro.obj(publicAPI, model);

  if (!model.atoms) {
    model.atoms = {};
  }

  if (!model.bonds) {
    model.bonds = {};
  }

  if (!model.properties) {
    model.properties = {};
  }

  macro.setGet(publicAPI, model, MOLECULE_FIELDS); // Object specific methods

  vtkMolecule(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkMolecule'); // ----------------------------------------------------------------------------

var vtkMolecule$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkMolecule$1 as default, extend, newInstance };
