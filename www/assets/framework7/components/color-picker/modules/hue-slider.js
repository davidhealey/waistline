/** @jsx $jsx */
import $jsx from '../../../shared/$jsx.js';
export default {
  render(self) {
    const {
      sliderLabel,
      sliderValue,
      sliderValueEditable,
      hueLabelText
    } = self.params;
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

  init(self) {
    self.hueRangeSlider = self.app.range.create({
      el: self.$el.find('.color-picker-slider-hue'),
      min: 0,
      max: 360,
      step: 0.1,
      value: 0,
      on: {
        change(range, value) {
          self.setValue({
            hue: value
          });
        }

      }
    });
  },

  update(self) {
    const {
      value
    } = self;
    const {
      sliderValue,
      sliderValueEditable
    } = self.params;
    const {
      hue
    } = value;
    self.hueRangeSlider.value = hue;
    self.hueRangeSlider.layout();
    self.hueRangeSlider.$el[0].style.setProperty('--f7-range-knob-color', `hsl(${hue}, 100%, 50%)`);

    if (sliderValue && sliderValueEditable) {
      self.$el.find('input.color-picker-value-hue').val(`${hue}`);
    } else if (sliderValue) {
      self.$el.find('span.color-picker-value-hue').text(`${hue}`);
    }
  },

  destroy(self) {
    if (self.hueRangeSlider && self.hueRangeSlider.destroy) {
      self.hueRangeSlider.destroy();
    }

    delete self.hueRangeSlider;
  }

};