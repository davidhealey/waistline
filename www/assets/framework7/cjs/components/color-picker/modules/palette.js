"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../../shared/dom7"));

var _$jsx = _interopRequireDefault(require("../../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint indent: ["off"] */

/** @jsx $jsx */
var _default = {
  render: function render(self) {
    return (0, _$jsx.default)("div", {
      class: "color-picker-module color-picker-module-palette"
    }, (0, _$jsx.default)("div", {
      class: "color-picker-palette"
    }, self.params.palette.map(function (p) {
      if (Array.isArray(p)) {
        var row = '<div class="color-picker-palette-row">'; // prettier-ignore

        row += p.map(function (c) {
          return "\n                <div class=\"color-picker-palette-value\" data-palette-color=\"" + c + "\" style=\"background-color: " + c + "\"></div>\n              ";
        }).join('');
        row += '</div>';
        return row;
      }

      return (0, _$jsx.default)("div", {
        class: "color-picker-palette-value",
        "data-palette-color": p,
        style: "background-color: " + p
      });
    })));
  },
  init: function init(self) {
    function handlePaletteClick(e) {
      var hex = (0, _dom.default)(e.target).attr('data-palette-color');
      self.setValue({
        hex: hex
      });
    }

    self.$el.on('click', '.color-picker-module-palette .color-picker-palette-value', handlePaletteClick);

    self.destroyPaletteEvents = function destroyPaletteEvents() {
      self.$el.off('click', '.color-picker-module-hex input', handlePaletteClick);
    };
  },
  destroy: function destroy(self) {
    if (self.destroyPaletteEvents) {
      self.destroyPaletteEvents();
    }

    delete self.destroyPaletteEvents;
  }
};
exports.default = _default;