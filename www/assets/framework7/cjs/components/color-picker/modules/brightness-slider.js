"use strict";

exports.__esModule = true;
exports.default = void 0;

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
        brightnessLabelText = _self$params.brightnessLabelText;
    return (0, _$jsx.default)("div", {
      class: "color-picker-module color-picker-module-brightness-slider"
    }, (0, _$jsx.default)("div", {
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
      class: "color-picker-value-brightness"
    }) : (0, _$jsx.default)("span", {
      class: "color-picker-value-brightness"
    }))));
  },
  init: function init(self) {
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
  },
  update: function update(self) {
    var value = self.value,
        app = self.app;
    var _self$params2 = self.params,
        sliderValue = _self$params2.sliderValue,
        sliderValueEditable = _self$params2.sliderValueEditable;
    var hsb = value.hsb;
    self.brightnessRangeSlider.value = hsb[2];
    self.brightnessRangeSlider.layout();
    var hslCurrent = (0, _utils.colorHsbToHsl)(hsb[0], hsb[1], hsb[2]);
    var hslLeft = (0, _utils.colorHsbToHsl)(hsb[0], hsb[1], 0);
    var hslRight = (0, _utils.colorHsbToHsl)(hsb[0], hsb[1], 1);
    self.brightnessRangeSlider.$el[0].style.setProperty('--f7-range-knob-color', "hsl(" + hslCurrent[0] + ", " + hslCurrent[1] * 100 + "%, " + hslCurrent[2] * 100 + "%)");
    self.brightnessRangeSlider.$el.find('.range-bar').css('background-image', "linear-gradient(" + (app.rtl ? 'to left' : 'to right') + ", hsl(" + hslLeft[0] + ", " + hslLeft[1] * 100 + "%, " + hslLeft[2] * 100 + "%), hsl(" + hslRight[0] + ", " + hslRight[1] * 100 + "%, " + hslRight[2] * 100 + "%))");

    if (sliderValue && sliderValueEditable) {
      self.$el.find('input.color-picker-value-brightness').val("" + hsb[2] * 1000 / 10);
    } else if (sliderValue) {
      self.$el.find('span.color-picker-value-brightness').text("" + hsb[2] * 1000 / 10);
    }
  },
  destroy: function destroy(self) {
    if (self.brightnessRangeSlider && self.brightnessRangeSlider.destroy) {
      self.brightnessRangeSlider.destroy();
    }

    delete self.brightnessRangeSlider;
  }
};
exports.default = _default;