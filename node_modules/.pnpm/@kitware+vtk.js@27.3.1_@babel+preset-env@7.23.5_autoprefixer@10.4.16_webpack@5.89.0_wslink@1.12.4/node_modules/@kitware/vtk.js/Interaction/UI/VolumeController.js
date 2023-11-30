import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import macro from '../../macros.js';
import vtkColorMaps from '../../Rendering/Core/ColorTransferFunction/ColorMapsLite.js';
import vtkPiecewiseGaussianWidget from '../Widgets/PiecewiseGaussianWidget.js';
import { s as svgLogo } from './Icons/Logo.svg.js';
import { s as svgEdge } from './Icons/Contrast.svg.js';
import { s as svgSpacing } from './Icons/Spacing.svg.js';
import { s as style } from './VolumeController/VolumeController.module.css.js';

// Global structures
// ----------------------------------------------------------------------------

var PRESETS_OPTIONS = vtkColorMaps.rgbPresetNames.map(function (name) {
  return "<option value=\"".concat(name, "\">").concat(name, "</option>");
}); // ----------------------------------------------------------------------------
// vtkVolumeController methods
// ----------------------------------------------------------------------------

function vtkVolumeController(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkVolumeController');
  model.el = document.createElement('div');
  model.el.setAttribute('class', style.container);
  model.widget = vtkPiecewiseGaussianWidget.newInstance({
    numberOfBins: 256,
    size: model.size
  });

  function updateUseShadow() {
    var useShadow = !!Number(model.el.querySelector('.js-shadow').value);
    model.actor.getProperty().setShade(useShadow);
    model.renderWindow.render();
  }

  function updateColorMapPreset() {
    var sourceDS = model.actor.getMapper().getInputData();

    if (!sourceDS) {
      return;
    }

    var dataArray = sourceDS.getPointData().getScalars() || sourceDS.getPointData().getArrays()[0];
    var dataRange = model.rescaleColorMap ? model.colorDataRange : dataArray.getRange();
    var preset = vtkColorMaps.getPresetByName(model.el.querySelector('.js-color-preset').value);
    var lookupTable = model.actor.getProperty().getRGBTransferFunction(0);
    lookupTable.applyColorMap(preset);
    lookupTable.setMappingRange.apply(lookupTable, _toConsumableArray(dataRange));
    lookupTable.updateRange();
    model.renderWindow.render();
  }

  function updateSpacing() {
    var value = Number(model.el.querySelector('.js-spacing').value);
    var sourceDS = model.actor.getMapper().getInputData();
    var sampleDistance = 0.7 * Math.sqrt(sourceDS.getSpacing().map(function (v) {
      return v * v;
    }).reduce(function (a, b) {
      return a + b;
    }, 0));
    model.actor.getMapper().setSampleDistance(sampleDistance * Math.pow(2, value * 3.0 - 1.5));
    model.renderWindow.render();
  }

  function updateEdgeGradient() {
    var value = Number(model.el.querySelector('.js-edge').value);

    if (value === 0) {
      model.actor.getProperty().setUseGradientOpacity(0, false);
    } else {
      var sourceDS = model.actor.getMapper().getInputData();
      var dataArray = sourceDS.getPointData().getScalars() || sourceDS.getPointData().getArrays()[0];
      var dataRange = dataArray.getRange();
      model.actor.getProperty().setUseGradientOpacity(0, true);
      var minV = Math.max(0.0, value - 0.3) / 0.7;
      model.actor.getProperty().setGradientOpacityMinimumValue(0, (dataRange[1] - dataRange[0]) * 0.2 * minV * minV);
      model.actor.getProperty().setGradientOpacityMaximumValue(0, (dataRange[1] - dataRange[0]) * 1.0 * value * value);
    }

    model.renderWindow.render();
  }

  publicAPI.setupContent = function (renderWindow, actor, isBackgroundDark) {
    var useShadow = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '1';
    var presetName = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'erdc_rainbow_bright';
    publicAPI.setActor(actor);
    publicAPI.setRenderWindow(renderWindow);
    var sourceDS = model.actor.getMapper().getInputData();
    var dataArray = sourceDS.getPointData().getScalars() || sourceDS.getPointData().getArrays()[0];
    var lookupTable = model.actor.getProperty().getRGBTransferFunction(0);
    var piecewiseFunction = model.actor.getProperty().getScalarOpacity(0);
    var stylePostFix = isBackgroundDark ? 'DarkBG' : 'BrightBG';
    var localStyle = {};
    ['button', 'presets', 'shadow'].forEach(function (name) {
      localStyle[name] = style["".concat(name).concat(stylePostFix)];
    });
    model.el.innerHTML = "\n      <div class=\"".concat(style.line, "\">\n        <div class=\"").concat(localStyle.button, " js-button\">").concat(svgLogo, "</div>\n        <select class=\"").concat(localStyle.shadow, " js-shadow js-toggle\">\n          <option value=\"1\">Use Shadow</option>\n          <option value=\"0\">No Shadow</option>\n        </select>\n        <select class=\"").concat(localStyle.presets, " js-color-preset js-toggle\">\n          ").concat(PRESETS_OPTIONS, "\n        </select>\n      </div>\n      <div class=\"").concat(style.line, " js-toggle\">\n        <div class=\"").concat(style.sliderEntry, "\">\n          <div class=\"").concat(style.sliderIcon, "\">").concat(svgSpacing, "</div>\n          <input type=\"range\" min=\"0\" max=\"1\" value=\"0.4\" step=\"0.01\" class=\"").concat(style.slider, " js-spacing\" />\n        </div>\n        <div class=\"").concat(style.sliderEntry, "\">\n          <div class=\"").concat(style.sliderIcon, "\">").concat(svgEdge, "</div>\n          <input type=\"range\" min=\"0\" max=\"1\" value=\"0.2\" step=\"0.01\" class=\"").concat(style.slider, " js-edge\" />\n        </div>\n      </div>\n      <div class=\"").concat(style.piecewiseEditor, " js-pwf js-toggle\"></div>\n    "); // DOM elements

    var domToggleButton = model.el.querySelector('.js-button');
    var domShadow = model.el.querySelector('.js-shadow');
    var domPreset = model.el.querySelector('.js-color-preset');
    var domSpacing = model.el.querySelector('.js-spacing');
    var domEdge = model.el.querySelector('.js-edge');
    var widgetContainer = model.el.querySelector('.js-pwf'); // Piecewise editor widget

    model.widget.updateStyle({
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      histogramColor: 'rgba(100, 100, 100, 0.5)',
      strokeColor: 'rgb(0, 0, 0)',
      activeColor: 'rgb(255, 255, 255)',
      handleColor: 'rgb(50, 150, 50)',
      buttonDisableFillColor: 'rgba(255, 255, 255, 0.5)',
      buttonDisableStrokeColor: 'rgba(0, 0, 0, 0.5)',
      buttonStrokeColor: 'rgba(0, 0, 0, 1)',
      buttonFillColor: 'rgba(255, 255, 255, 1)',
      strokeWidth: 2,
      activeStrokeWidth: 3,
      buttonStrokeWidth: 1.5,
      handleWidth: 3,
      iconSize: 0,
      padding: 10
    });
    model.widget.addGaussian(0.5, 1.0, 0.5, 0.5, 0.4);
    model.widget.setDataArray(dataArray.getData());
    model.widget.setColorTransferFunction(lookupTable);
    model.widget.applyOpacity(piecewiseFunction);
    model.widget.setContainer(widgetContainer);
    model.widget.bindMouseListeners();
    model.colorDataRange = model.widget.getOpacityRange(); // Attach listeners

    domToggleButton.addEventListener('click', publicAPI.toggleVisibility);
    domShadow.addEventListener('change', updateUseShadow);
    domPreset.addEventListener('change', updateColorMapPreset);
    domSpacing.addEventListener('input', updateSpacing);
    domEdge.addEventListener('input', updateEdgeGradient);
    model.widget.onOpacityChange(function () {
      model.widget.applyOpacity(piecewiseFunction);
      model.colorDataRange = model.widget.getOpacityRange();

      if (model.rescaleColorMap) {
        updateColorMapPreset();
      }

      if (!model.renderWindow.getInteractor().isAnimating()) {
        model.renderWindow.render();
      }
    });
    model.widget.onAnimation(function (start) {
      if (start) {
        model.renderWindow.getInteractor().requestAnimation(model.widget);
      } else {
        model.renderWindow.getInteractor().cancelAnimation(model.widget);
        model.renderWindow.render();
      }
    });
    lookupTable.onModified(function () {
      model.widget.render();

      if (!model.renderWindow.getInteractor().isAnimating()) {
        model.renderWindow.render();
      }
    }); // Set default values

    domShadow.value = Number(useShadow) ? '1' : '0';
    domPreset.value = presetName; // Apply values

    updateUseShadow();
    updateColorMapPreset();
    updateSpacing();
    updateEdgeGradient();
  };

  publicAPI.setContainer = function (el) {
    if (model.container && model.container !== el) {
      model.container.removeChild(model.el);
    }

    if (model.container !== el) {
      model.container = el;

      if (model.container) {
        model.container.appendChild(model.el);
      }

      publicAPI.modified();
    }
  };

  var rescaleColorMap = publicAPI.setRescaleColorMap;

  publicAPI.setRescaleColorMap = function (value) {
    if (rescaleColorMap(value)) {
      updateColorMapPreset();
      return true;
    }

    return false;
  };

  publicAPI.toggleVisibility = function () {
    publicAPI.setExpanded(!publicAPI.getExpanded());
  };

  publicAPI.setExpanded = function (expanded) {
    var elements = model.el.querySelectorAll('.js-toggle');
    var count = elements.length;
    model.expanded = expanded;

    if (model.expanded) {
      while (count--) {
        elements[count].style.display = 'flex';
      }
    } else {
      while (count--) {
        elements[count].style.display = 'none';
      }
    }
  };

  publicAPI.getExpanded = function () {
    return model.expanded;
  };

  publicAPI.setSize = model.widget.setSize;
  publicAPI.render = model.widget.render;
  publicAPI.onAnimation = model.widget.onAnimation; // Trigger rendering for any modified event

  publicAPI.onModified(publicAPI.render);
  publicAPI.setSize.apply(publicAPI, _toConsumableArray(model.size));
} // ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------


var DEFAULT_VALUES = {
  size: [600, 300],
  expanded: true,
  rescaleColorMap: false
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  var initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues); // Object methods

  macro.obj(publicAPI, model);
  macro.setGet(publicAPI, model, ['actor', 'renderWindow', 'rescaleColorMap']);
  macro.get(publicAPI, model, ['widget']); // Object specific methods

  vtkVolumeController(publicAPI, model);
} // ----------------------------------------------------------------------------

var newInstance = macro.newInstance(extend, 'vtkVolumeController'); // ----------------------------------------------------------------------------

var vtkVolumeController$1 = {
  newInstance: newInstance,
  extend: extend
};

export { vtkVolumeController$1 as default, extend, newInstance };
