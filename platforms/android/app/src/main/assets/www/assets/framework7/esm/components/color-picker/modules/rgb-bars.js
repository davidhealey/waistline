import $ from '../../../shared/dom7';
/** @jsx $jsx */

import $jsx from '../../../shared/$jsx';
export default {
  render: function render(self) {
    var _self$params = self.params,
        barLabel = _self$params.barLabel,
        barValue = _self$params.barValue,
        barValueEditable = _self$params.barValueEditable,
        redLabelText = _self$params.redLabelText,
        greenLabelText = _self$params.greenLabelText,
        blueLabelText = _self$params.blueLabelText;
    return $jsx("div", {
      class: "color-picker-module color-picker-module-rgb-bars"
    }, $jsx("div", {
      class: "color-picker-bar-wrap"
    }, barLabel && $jsx("div", {
      class: "color-picker-bar-label"
    }, redLabelText), $jsx("div", {
      class: "range-slider color-picker-bar color-picker-bar-red"
    }), barValue && $jsx("div", {
      class: "color-picker-bar-value"
    }, barValueEditable ? $jsx("input", {
      type: "number",
      step: "1",
      min: "0",
      max: "255",
      class: "color-picker-value-bar-red",
      "data-color-index": "0"
    }) : $jsx("span", {
      class: "color-picker-value-bar-red"
    }))), $jsx("div", {
      class: "color-picker-bar-wrap"
    }, barLabel && $jsx("div", {
      class: "color-picker-bar-label"
    }, greenLabelText), $jsx("div", {
      class: "range-slider color-picker-bar color-picker-bar-green"
    }), barValue && $jsx("div", {
      class: "color-picker-bar-value"
    }, barValueEditable ? $jsx("input", {
      type: "number",
      step: "1",
      min: "0",
      max: "255",
      class: "color-picker-value-bar-green",
      "data-color-index": "1"
    }) : $jsx("span", {
      class: "color-picker-value-bar-green"
    }))), $jsx("div", {
      class: "color-picker-bar-wrap"
    }, barLabel && $jsx("div", {
      class: "color-picker-bar-label"
    }, blueLabelText), $jsx("div", {
      class: "range-slider color-picker-bar color-picker-bar-blue"
    }), barValue && $jsx("div", {
      class: "color-picker-bar-value"
    }, barValueEditable ? $jsx("input", {
      type: "number",
      step: "1",
      min: "0",
      max: "255",
      class: "color-picker-value-bar-blue",
      "data-color-index": "2"
    }) : $jsx("span", {
      class: "color-picker-value-bar-blue"
    }))));
  },
  init: function init(self) {
    self.redBar = self.app.range.create({
      el: self.$el.find('.color-picker-bar-red'),
      min: 0,
      max: 255,
      step: 1,
      value: 0,
      vertical: true,
      on: {
        change: function change(range, value) {
          self.setValue({
            rgb: [value, self.value.rgb[1], self.value.rgb[2]]
          });
        }
      }
    });
    self.greenBar = self.app.range.create({
      el: self.$el.find('.color-picker-bar-green'),
      min: 0,
      max: 255,
      step: 1,
      value: 0,
      vertical: true,
      on: {
        change: function change(range, value) {
          self.setValue({
            rgb: [self.value.rgb[0], value, self.value.rgb[2]]
          });
        }
      }
    });
    self.blueBar = self.app.range.create({
      el: self.$el.find('.color-picker-bar-blue'),
      min: 0,
      max: 255,
      step: 1,
      value: 0,
      vertical: true,
      on: {
        change: function change(range, value) {
          self.setValue({
            rgb: [self.value.rgb[0], self.value.rgb[1], value]
          });
        }
      }
    });

    function handleInputChange(e) {
      var rgb = [].concat(self.value.rgb);
      var index = parseInt($(e.target).attr('data-color-index'), 10);
      var value = parseInt(e.target.value, 10);

      if (Number.isNaN(value)) {
        e.target.value = rgb[index];
        return;
      }

      value = Math.max(0, Math.min(255, value));
      rgb[index] = value;
      self.setValue({
        rgb: rgb
      });
    }

    self.$el.on('change', '.color-picker-module-rgb-bars input', handleInputChange);

    self.destroyRgbBarsEvents = function destroyRgbBarsEvents() {
      self.$el.off('change', '.color-picker-module-rgb-bars input', handleInputChange);
    };
  },
  update: function update(self) {
    var value = self.value,
        redBar = self.redBar,
        greenBar = self.greenBar,
        blueBar = self.blueBar;
    var _self$params2 = self.params,
        barValue = _self$params2.barValue,
        barValueEditable = _self$params2.barValueEditable;
    var rgb = value.rgb;
    redBar.value = rgb[0];
    greenBar.value = rgb[1];
    blueBar.value = rgb[2];
    redBar.layout();
    greenBar.layout();
    blueBar.layout();
    redBar.$el.find('.range-bar').css('background-image', "linear-gradient(to top, rgb(0, " + rgb[1] + ", " + rgb[2] + "), rgb(255, " + rgb[1] + ", " + rgb[2] + "))");
    greenBar.$el.find('.range-bar').css('background-image', "linear-gradient(to top, rgb(" + rgb[0] + ", 0, " + rgb[2] + "), rgb(" + rgb[0] + ", 255, " + rgb[2] + "))");
    blueBar.$el.find('.range-bar').css('background-image', "linear-gradient(to top, rgb(" + rgb[0] + ", " + rgb[1] + ", 0), rgb(" + rgb[0] + ", " + rgb[1] + ", 255))");

    if (barValue && barValueEditable) {
      self.$el.find('input.color-picker-value-bar-red').val(rgb[0]);
      self.$el.find('input.color-picker-value-bar-green').val(rgb[1]);
      self.$el.find('input.color-picker-value-bar-blue').val(rgb[2]);
    } else if (barValue) {
      self.$el.find('span.color-picker-value-bar-red').text(rgb[0]);
      self.$el.find('span.color-picker-value-bar-green').text(rgb[1]);
      self.$el.find('span.color-picker-value-bar-blue').text(rgb[2]);
    }
  },
  destroy: function destroy(self) {
    if (self.redBar && self.redBar.destroy) {
      self.redBar.destroy();
    }

    if (self.greenBar && self.greenBar.destroy) {
      self.greenBar.destroy();
    }

    if (self.blueBar && self.blueBar.destroy) {
      self.blueBar.destroy();
    }

    delete self.redBar;
    delete self.greenBar;
    delete self.blueBar;
    if (self.destroyRgbBarsEvents) self.destroyRgbBarsEvents();
    delete self.destroyRgbBarsEvents;
  }
};