"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../../shared/dom7"));

var _utils = require("../../../shared/utils");

var _$jsx = _interopRequireDefault(require("../../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @jsx $jsx */
var _default = {
  render: function render(self) {
    var _self$params = self.params,
        sliderLabel = _self$params.sliderLabel,
        sliderValue = _self$params.sliderValue,
        sliderValueEditable = _self$params.sliderValueEditable,
        hueLabelText = _self$params.hueLabelText,
        saturationLabelText = _self$params.saturationLabelText,
        brightnessLabelText = _self$params.brightnessLabelText;
    return (0, _$jsx.default)("div", {
      class: "color-picker-module color-picker-module-hsb-sliders"
    }, (0, _$jsx.default)("div", {
      class: "color-picker-slider-wrap"
    }, sliderLabel && (0, _$jsx.default)("div", {
      class: "color-picker-slider-label"
    }, hueLabelText), (0, _$jsx.default)("div", {
      class: "range-slider color-picker-slider color-picker-slider-hue"
    }), sliderValue && (0, _$jsx.default)("div", {
      class: "color-picker-slider-value"
    }, sliderValueEditable ? (0, _$jsx.default)("input", {
      type: "number",
      step: "0.1",
      min: "0",
      max: "360",
      class: "color-picker-value-hue",
      "data-color-index": "0"
    }) : (0, _$jsx.default)("span", {
      class: "color-picker-value-hue"
    }))), (0, _$jsx.default)("div", {
      class: "color-picker-slider-wrap"
    }, sliderLabel && (0, _$jsx.default)("div", {
      class: "color-picker-slider-label"
    }, saturationLabelText), (0, _$jsx.default)("div", {
      class: "range-slider color-picker-slider color-picker-slider-saturation"
    }), sliderValue && (0, _$jsx.default)("div", {
      class: "color-picker-slider-value"
    }, sliderValueEditable ? (0, _$jsx.default)("input", {
      type: "number",
      step: "0.1",
      min: "0",
      max: "100",
      class: "color-picker-value-saturation",
      "data-color-index": "1"
    }) : (0, _$jsx.default)("span", {
      class: "color-picker-value-saturation"
    }))), (0, _$jsx.default)("div", {
      class: "color-picker-slider-wrap"
    }, sliderLabel && (0, _$jsx.default)("div", {
      class: "color-picker-slider-label"
    }, brightnessLabelText), (0, _$jsx.default)("div", {
      class: "range-slider color-picker-slider color-picker-slider-brightness"
    }), sliderValue && (0, _$jsx.default)("div", {
      class: "color-picker-slider-value"
    }, sliderValueEditable ? (0, _$jsx.default)("input", {
      type: "number",
      step: "0.1",
      min: "0",
      max: "100",
      class: "color-picker-value-brightness",
      "data-color-index": "2"
    }) : (0, _$jsx.default)("span", {
      class: "color-picker-value-brightness"
    }))));
  },
  init: function init(self) {
    self.hueRangeSlider = self.app.range.create({
      el: self.$el.find('.color-picker-slider-hue'),
      min: 0,
      max: 360,
      step: 0.1,
      value: 0,
      on: {
        change: function change(range, value) {
          self.setValue({
            hue: value
          });
        }
      }
    });
    self.saturationRangeSlider = self.app.range.create({
      el: self.$el.find('.color-picker-slider-saturation'),
      min: 0,
      max: 1,
      step: 0.001,
      value: 0,
      on: {
        change: function change(range, value) {
          var s = Math.floor(value * 1000) / 1000;
          self.setValue({
            hsb: [self.value.hsb[0], s, self.value.hsb[2]]
          });
        }
      }
    });
    self.brightnessRangeSlider = self.app.range.create({
      el: self.$el.find('.color-picker-slider-brightness'),
      min: 0,
      max: 1,
      step: 0.001,
      value: 0,
      on: {
        change: function change(range, value) {
          var b = Math.floor(value * 1000) / 1000;
          self.setValue({
            hsb: [self.value.hsb[0], self.value.hsb[1], b]
          });
        }
      }
    });

    function handleInputChange(e) {
      var hsb = [].concat(self.value.hsb);
      var index = parseInt((0, _dom.default)(e.target).attr('data-color-index'), 10);
      var value = parseFloat(e.target.value);

      if (Number.isNaN(value)) {
        e.target.value = hsb[index];
        return;
      }

      if (index === 0) {
        value = Math.max(0, Math.min(360, value));
      } else {
        value = Math.max(0, Math.min(100, value)) / 100;
      }

      hsb[index] = value;
      self.setValue({
        hsb: hsb
      });
    }

    self.$el.on('change', '.color-picker-module-hsb-sliders input', handleInputChange);

    self.destroyHsbSlidersEvents = function destroyHsbSlidersEvents() {
      self.$el.off('change', '.color-picker-module-hsb-sliders input', handleInputChange);
    };
  },
  update: function update(self) {
    var app = self.app,
        value = self.value;
    var _self$params2 = self.params,
        sliderValue = _self$params2.sliderValue,
        sliderValueEditable = _self$params2.sliderValueEditable;
    var hsb = value.hsb,
        hue = value.hue;
    self.hueRangeSlider.value = hue;
    self.saturationRangeSlider.value = hsb[1];
    self.brightnessRangeSlider.value = hsb[2];
    self.hueRangeSlider.layout();
    self.saturationRangeSlider.layout();
    self.brightnessRangeSlider.layout();
    var hslCurrent = (0, _utils.colorHsbToHsl)(hsb[0], hsb[1], 1);
    var hslLeft = (0, _utils.colorHsbToHsl)(hsb[0], 0, 1);
    var hslRight = (0, _utils.colorHsbToHsl)(hsb[0], 1, 1);
    var brightness = hsb[2];
    self.hueRangeSlider.$el[0].style.setProperty('--f7-range-knob-color', "hsl(" + hue + ", 100%, 50%)");
    self.saturationRangeSlider.$el[0].style.setProperty('--f7-range-knob-color', "hsl(" + hslCurrent[0] + ", " + hslCurrent[1] * 100 + "%, " + hslCurrent[2] * 100 + "%)");
    self.brightnessRangeSlider.$el[0].style.setProperty('--f7-range-knob-color', "rgb(" + brightness * 255 + ", " + brightness * 255 + ", " + brightness * 255 + ")");
    self.saturationRangeSlider.$el.find('.range-bar').css('background-image', "linear-gradient(" + (app.rtl ? 'to left' : 'to right') + ", hsl(" + hslLeft[0] + ", " + hslLeft[1] * 100 + "%, " + hslLeft[2] * 100 + "%), hsl(" + hslRight[0] + ", " + hslRight[1] * 100 + "%, " + hslRight[2] * 100 + "%))");

    if (sliderValue && sliderValueEditable) {
      self.$el.find('input.color-picker-value-hue').val("" + hue);
      self.$el.find('input.color-picker-value-saturation').val("" + hsb[1] * 1000 / 10);
      self.$el.find('input.color-picker-value-brightness').val("" + hsb[2] * 1000 / 10);
    } else if (sliderValue) {
      self.$el.find('span.color-picker-value-hue').text("" + hue);
      self.$el.find('span.color-picker-value-saturation').text("" + hsb[1] * 1000 / 10);
      self.$el.find('span.color-picker-value-brightness').text("" + hsb[2] * 1000 / 10);
    }
  },
  destroy: function destroy(self) {
    if (self.hueRangeSlider && self.hueRangeSlider.destroy) {
      self.hueRangeSlider.destroy();
    }

    if (self.saturationRangeSlider && self.saturationRangeSlider.destroy) {
      self.saturationRangeSlider.destroy();
    }

    if (self.brightnessRangeSlider && self.brightnessRangeSlider.destroy) {
      self.brightnessRangeSlider.destroy();
    }

    delete self.hueRangeSlider;
    delete self.saturationRangeSlider;
    delete self.brightnessRangeSlider;
    if (self.destroyHsbSlidersEvents) self.destroyHsbSlidersEvents();
    delete self.destroyHsbSlidersEvents;
  }
};
exports.default = _default;