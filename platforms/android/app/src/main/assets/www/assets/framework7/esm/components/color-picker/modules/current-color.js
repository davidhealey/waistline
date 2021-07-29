/** @jsx $jsx */
import $jsx from '../../../shared/$jsx';
export default {
  render: function render() {
    return $jsx("div", {
      class: "color-picker-module color-picker-module-current-color"
    }, $jsx("div", {
      class: "color-picker-current-color"
    }));
  },
  update: function update(self) {
    self.$el.find('.color-picker-module-current-color .color-picker-current-color').css('background-color', self.value.hex);
  }
};