"use strict";

exports.__esModule = true;
exports.default = void 0;

var _$jsx = _interopRequireDefault(require("../../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @jsx $jsx */
var _default = {
  render: function render(self) {
    var _self$params = self.params,
        hexLabel = _self$params.hexLabel,
        hexLabelText = _self$params.hexLabelText,
        hexValueEditable = _self$params.hexValueEditable;
    return (0, _$jsx.default)("div", {
      class: "color-picker-module color-picker-module-hex"
    }, (0, _$jsx.default)("div", {
      class: "color-picker-hex-wrap"
    }, hexLabel && (0, _$jsx.default)("div", {
      class: "color-picker-hex-label"
    }, hexLabelText), (0, _$jsx.default)("div", {
      class: "color-picker-hex-value"
    }, hexValueEditable ? (0, _$jsx.default)("input", {
      type: "text",
      class: "color-picker-value-hex"
    }) : (0, _$jsx.default)("span", {
      class: "color-picker-value-hex"
    }))));
  },
  init: function init(self) {
    function handleInputChange(e) {
      var hex = self.value.hex;
      var value = e.target.value.replace(/#/g, '');

      if (Number.isNaN(value) || !value || value.length !== 3 && value.length !== 6) {
        e.target.value = hex;
        return;
      }

      var min = 0;
      var current = parseInt(value, 16);
      var max = parseInt('ffffff', 16); // eslint-disable-line

      if (current > max) {
        value = 'fff';
      }

      if (current < min) {
        value = '000';
      }

      self.setValue({
        hex: value
      });
    }

    self.$el.on('change', '.color-picker-module-hex input', handleInputChange);

    self.destroyHexEvents = function destroyHexEvents() {
      self.$el.off('change', '.color-picker-module-hex input', handleInputChange);
    };
  },
  update: function update(self) {
    var value = self.value;
    var hexValueEditable = self.params.hexValueEditable;
    var hex = value.hex;

    if (hexValueEditable) {
      self.$el.find('input.color-picker-value-hex').val(hex);
    } else {
      self.$el.find('span.color-picker-value-hex').text(hex);
    }
  },
  destroy: function destroy(self) {
    if (self.destroyHexEvents) self.destroyHexEvents();
    delete self.destroyHexEvents;
  }
};
exports.default = _default;