/** @jsx $jsx */
import $jsx from '../../../shared/$jsx';
export default {
  render: function render(self) {
    var _self$params = self.params,
        sliderLabel = _self$params.sliderLabel,
        sliderValue = _self$params.sliderValue,
        sliderValueEditable = _self$params.sliderValueEditable,
        hueLabelText = _self$params.hueLabelText;
    return $jsx("div", {
      class: "color-picker-module color-picker-module-hue-slider"
    }, $jsx("div", {
      class: "color-picker-slider-wrap"
    }, sliderLabel && $jsx("div", {
      class: "color-picker-slider-label"
    }, hueLabelText), $jsx("div", {
      class: "range-slider color-picker-slider color-picker-slider-hue"
    }), sliderValue && $jsx("div", {
      class: "color-picker-slider-value"
    }, sliderValueEditable ? $jsx("input", {
      type: "number",
      step: "0.1",
      min: "0",
      max: "360",
      class: "color-picker-value-hue"
    }) : $jsx("span", {
      class: "color-picker-value-hue"
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
  },
  update: function update(self) {
    var value = self.value;
    var _self$params2 = self.params,
        sliderValue = _self$params2.sliderValue,
        sliderValueEditable = _self$params2.sliderValueEditable;
    var hue = value.hue;
    self.hueRangeSlider.value = hue;
    self.hueRangeSlider.layout();
    self.hueRangeSlider.$el[0].style.setProperty('--f7-range-knob-color', "hsl(" + hue + ", 100%, 50%)");

    if (sliderValue && sliderValueEditable) {
      self.$el.find('input.color-picker-value-hue').val("" + hue);
    } else if (sliderValue) {
      self.$el.find('span.color-picker-value-hue').text("" + hue);
    }
  },
  destroy: function destroy(self) {
    if (self.hueRangeSlider && self.hueRangeSlider.destroy) {
      self.hueRangeSlider.destroy();
    }

    delete self.hueRangeSlider;
  }
};