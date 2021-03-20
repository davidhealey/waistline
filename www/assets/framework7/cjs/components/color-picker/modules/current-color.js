"use strict";

exports.__esModule = true;
exports.default = void 0;

var _$jsx = _interopRequireDefault(require("../../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @jsx $jsx */
var _default = {
  render: function render() {
    return (0, _$jsx.default)("div", {
      class: "color-picker-module color-picker-module-current-color"
    }, (0, _$jsx.default)("div", {
      class: "color-picker-current-color"
    }));
  },
  update: function update(self) {
    self.$el.find('.color-picker-module-current-color .color-picker-current-color').css('background-color', self.value.hex);
  }
};
exports.default = _default;