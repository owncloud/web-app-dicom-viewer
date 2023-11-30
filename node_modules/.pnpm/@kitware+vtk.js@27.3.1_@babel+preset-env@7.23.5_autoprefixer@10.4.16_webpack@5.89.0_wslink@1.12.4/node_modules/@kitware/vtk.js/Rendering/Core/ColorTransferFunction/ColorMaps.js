import { v as vtkColorMaps$1 } from './ColorMaps.json.js';

var presetMap = Object.create(null);
vtkColorMaps$1.filter(function (p) {
  return p.RGBPoints;
}).filter(function (p) {
  return p.ColorSpace !== 'CIELAB';
}).forEach(function (p) {
  presetMap[p.Name] = p;
}); // ----------------------------------------------------------------------------

var rgbPresetNames = Object.keys(presetMap);
rgbPresetNames.sort(); // ----------------------------------------------------------------------------

function getPresetByName(name) {
  return presetMap[name];
} // ----------------------------------------------------------------------------


function addPreset(preset) {
  if (!preset.RGBPoints || preset.ColorSpace === 'CIELAB') {
    return;
  }

  if (!presetMap[preset.Name]) {
    rgbPresetNames.push(preset.Name);
    rgbPresetNames.sort();
  }

  presetMap[preset.Name] = preset;
} // ----------------------------------------------------------------------------


function removePresetByName(name) {
  var index = rgbPresetNames.indexOf(name);

  if (index > -1) {
    rgbPresetNames.splice(index, 1);
  }

  delete presetMap[name];
} // ----------------------------------------------------------------------------


var vtkColorMaps = {
  addPreset: addPreset,
  removePresetByName: removePresetByName,
  getPresetByName: getPresetByName,
  rgbPresetNames: rgbPresetNames
};

export { vtkColorMaps as default };
