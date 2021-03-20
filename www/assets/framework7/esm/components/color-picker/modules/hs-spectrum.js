import $ from '../../../shared/dom7';
import { colorHsbToHsl } from '../../../shared/utils';
import { getSupport } from '../../../shared/get-support';
/** @jsx $jsx */

import $jsx from '../../../shared/$jsx';
export default {
  render: function render() {
    return $jsx("div", {
      class: "color-picker-module color-picker-module-hs-spectrum"
    }, $jsx("div", {
      class: "color-picker-hs-spectrum"
    }, $jsx("div", {
      class: "color-picker-hs-spectrum-handle"
    })));
  },
  init: function init(self) {
    var app = self.app;
    var isTouched;
    var isMoved;
    var touchStartX;
    var touchStartY;
    var touchCurrentX;
    var touchCurrentY;
    var specterRect;
    var specterIsTouched;
    var specterHandleIsTouched;
    var $el = self.$el;

    function setHSFromSpecterCoords(x, y) {
      var h = (x - specterRect.left) / specterRect.width * 360;
      var s = (y - specterRect.top) / specterRect.height;
      h = Math.max(0, Math.min(360, h));
      s = 1 - Math.max(0, Math.min(1, s));
      self.setValue({
        hsb: [h, s, self.value.hsb[2]]
      });
    }

    function handleTouchStart(e) {
      if (isMoved || isTouched) return;
      touchStartX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchCurrentX = touchStartX;
      touchStartY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      touchCurrentY = touchStartY;
      var $targetEl = $(e.target);
      specterHandleIsTouched = $targetEl.closest('.color-picker-hs-spectrum-handle').length > 0;

      if (!specterHandleIsTouched) {
        specterIsTouched = $targetEl.closest('.color-picker-hs-spectrum').length > 0;
      }

      if (specterIsTouched) {
        specterRect = $el.find('.color-picker-hs-spectrum')[0].getBoundingClientRect();
        setHSFromSpecterCoords(touchStartX, touchStartY);
      }

      if (specterHandleIsTouched || specterIsTouched) {
        $el.find('.color-picker-hs-spectrum-handle').addClass('color-picker-hs-spectrum-handle-pressed');
      }
    }

    function handleTouchMove(e) {
      if (!(specterIsTouched || specterHandleIsTouched)) return;
      touchCurrentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
      touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
      e.preventDefault();

      if (!isMoved) {
        // First move
        isMoved = true;

        if (specterHandleIsTouched) {
          specterRect = $el.find('.color-picker-hs-spectrum')[0].getBoundingClientRect();
        }
      }

      if (specterIsTouched || specterHandleIsTouched) {
        setHSFromSpecterCoords(touchCurrentX, touchCurrentY);
      }
    }

    function handleTouchEnd() {
      isMoved = false;

      if (specterIsTouched || specterHandleIsTouched) {
        $el.find('.color-picker-hs-spectrum-handle').removeClass('color-picker-hs-spectrum-handle-pressed');
      }

      specterIsTouched = false;
      specterHandleIsTouched = false;
    }

    function handleResize() {
      self.modules['hs-spectrum'].update(self);
    }

    var passiveListener = app.touchEvents.start === 'touchstart' && getSupport().passiveListener ? {
      passive: true,
      capture: false
    } : false;
    self.$el.on(app.touchEvents.start, handleTouchStart, passiveListener);
    app.on('touchmove:active', handleTouchMove);
    app.on('touchend:passive', handleTouchEnd);
    app.on('resize', handleResize);

    self.destroySpectrumEvents = function destroySpectrumEvents() {
      self.$el.off(app.touchEvents.start, handleTouchStart, passiveListener);
      app.off('touchmove:active', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);
      app.off('resize', handleResize);
    };
  },
  update: function update(self) {
    var value = self.value;
    var hsb = value.hsb;
    var specterWidth = self.$el.find('.color-picker-hs-spectrum')[0].offsetWidth;
    var specterHeight = self.$el.find('.color-picker-hs-spectrum')[0].offsetHeight;
    var hslBright = colorHsbToHsl(hsb[0], hsb[1], 1);
    self.$el.find('.color-picker-hs-spectrum-handle').css('background-color', "hsl(" + hslBright[0] + ", " + hslBright[1] * 100 + "%, " + hslBright[2] * 100 + "%)").transform("translate(" + specterWidth * (hsb[0] / 360) + "px, " + specterHeight * (1 - hsb[1]) + "px)");
  },
  destroy: function destroy(self) {
    if (self.destroySpectrumEvents) self.destroySpectrumEvents();
    delete self.destroySpectrumEvents;
  }
};