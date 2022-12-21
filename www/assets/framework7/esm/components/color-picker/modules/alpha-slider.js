/** @jsx $jsx */
import $jsx from '../../../shared/$jsx';
export default {
  render: function render(self) {
    var _self$params = self.params,
        sliderLabel = _self$params.sliderLabel,
        sliderValue = _self$params.sliderValue,
        sliderValueEditable = _self$params.sliderValueEditable,
        alphaLabelText = _self$params.alphaLabelText;
    return $jsx("div", {
      class: "color-picker-module color-picker-module-alpha-slider"
    }, $jsx("div", {
      class: "color-picker-slider-wrap"
    }, sliderLabel && $jsx("div", {
      class: "color-picker-slider-label"
    }, alphaLabelText), $jsx("div", {
      class: "range-slider color-picker-slider color-picker-slider-alpha"
    }), sliderValue && $jsx("div", {
      class: "color-picker-slider-value"
    }, sliderValueEditable ? $jsx("input", {
      type: "number",
      step: "0.01",
      min: "0",
      max: "1",
      class: "color-picker-value-alpha"
    }) : $jsx("span", {
      class: "color-picker-value-alpha"
    }))));
  },
  init: function init(self) {
    self.alphaRangeSlider = self.app.range.create({
      el: self.$el.find('.color-picker-slider-alpha'),
      min: 0,
      max: 1,
      step: 0.01,
      value: 1,
      on: {
        change: function change(range, value) {
          var alpha = Math.floor(value * 100) / 100;
          self.setValue({
            alpha: alpha
          });
        }
      }
    });

    function handleInputChange(e) {
      var alpha = self.value.alpha;
      var value = parseFloat(e.target.value);

      if (Number.isNaN(value)) {
        e.target.value = alpha;
        return;
      }

      value = Math.max(0, Math.min(1, value));
      self.setValue({
        alpha: value
      });
    }

    self.$el.on('change', '.color-picker-module-alpha-slider input', handleInputChange);

    self.destroyAlphaSliderEvents = function destroyAlphaSliderEvents() {
      self.$el.off('change', '.color-picker-module-alpha-slider input', handleInputChange);
    };
  },
  update: function update(self) {
    var value = self.value;
    var _self$params2 = self.params,
        sliderValue = _self$params2.sliderValue,
        sliderValueEditable = _self$params2.sliderValueEditable;
    var alpha = value.alpha;
    self.alphaRangeSlider.value = alpha;
    self.alphaRangeSlider.layout();

    if (sliderValue && sliderValueEditable) {
      self.$el.find('input.color-picker-value-alpha').val(alpha);
    } else {
      self.$el.find('span.color-picker-value-alpha').text(alpha);
    }
  },
  destroy: function destroy(self) {
    if (self.alphaRangeSlider && self.alphaRangeSlider.destroy) {
      self.alphaRangeSlider.destroy();
    }

    delete self.alphaRangeSlider;
    if (self.destroyAlphaSliderEvents) self.destroyAlphaSliderEvents();
    delete self.destroyAlphaSliderEvents;
  }
};