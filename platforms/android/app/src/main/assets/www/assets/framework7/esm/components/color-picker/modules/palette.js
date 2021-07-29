/* eslint indent: ["off"] */
import $ from '../../../shared/dom7';
/** @jsx $jsx */

import $jsx from '../../../shared/$jsx';
export default {
  render: function render(self) {
    return $jsx("div", {
      class: "color-picker-module color-picker-module-palette"
    }, $jsx("div", {
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

      return $jsx("div", {
        class: "color-picker-palette-value",
        "data-palette-color": p,
        style: "background-color: " + p
      });
    })));
  },
  init: function init(self) {
    function handlePaletteClick(e) {
      var hex = $(e.target).attr('data-palette-color');
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