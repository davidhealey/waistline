/** @jsx $jsx */
import $jsx from '../../../shared/$jsx';
export default {
  render: function render() {
    return $jsx("div", {
      class: "color-picker-module color-picker-module-initial-current-colors"
    }, $jsx("div", {
      class: "color-picker-initial-current-colors"
    }, $jsx("div", {
      class: "color-picker-initial-color"
    }), $jsx("div", {
      class: "color-picker-current-color"
    })));
  },
  init: function init(self) {
    function handleInitialColorClick() {
      if (self.initialValue) {
        var _self$initialValue = self.initialValue,
            hex = _self$initialValue.hex,
            alpha = _self$initialValue.alpha;
        self.setValue({
          hex: hex,
          alpha: alpha
        });
      }
    }

    self.$el.on('click', '.color-picker-initial-color', handleInitialColorClick);

    self.destroyInitialCurrentEvents = function destroyInitialCurrentEvents() {
      self.$el.off('click', '.color-picker-initial-color', handleInitialColorClick);
    };
  },
  update: function update(self) {
    self.$el.find('.color-picker-module-initial-current-colors .color-picker-initial-color').css('background-color', self.initialValue.hex);
    self.$el.find('.color-picker-module-initial-current-colors .color-picker-current-color').css('background-color', self.value.hex);
  },
  destroy: function destroy(self) {
    if (self.destroyInitialCurrentEvents) {
      self.destroyInitialCurrentEvents();
    }

    delete self.destroyInitialCurrentEvents;
  }
};