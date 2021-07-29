"use strict";

exports.__esModule = true;
exports.default = void 0;

var _$jsx = _interopRequireDefault(require("../../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @jsx $jsx */
var _default = {
  render: function render() {
    return (0, _$jsx.default)("div", {
      class: "color-picker-module color-picker-module-initial-current-colors"
    }, (0, _$jsx.default)("div", {
      class: "color-picker-initial-current-colors"
    }, (0, _$jsx.default)("div", {
      class: "color-picker-initial-color"
    }), (0, _$jsx.default)("div", {
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
exports.default = _default;