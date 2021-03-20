import $ from '../../../shared/dom7';
import { getSupport } from '../../../shared/get-support';
/** @jsx $jsx */

import $jsx from '../../../shared/$jsx';

function svgWheelCircles() {
  var total = 256;
  var circles = '';

  for (var i = total; i > 0; i -= 1) {
    var angle = i * Math.PI / (total / 2);
    var hue = 360 / total * i;
    circles += "<circle cx=\"" + (150 - Math.sin(angle) * 125) + "\" cy=\"" + (150 - Math.cos(angle) * 125) + "\" r=\"25\" fill=\"hsl(" + hue + ", 100%, 50%)\"></circle>";
  }

  return circles;
}

export default {
  render: function render() {
    return $jsx("div", {
      class: "color-picker-module color-picker-module-wheel"
    }, $jsx("div", {
      class: "color-picker-wheel"
    }, $jsx("svg", {
      viewBox: "0 0 300 300",
      width: "300",
      height: "300"
    }, svgWheelCircles()), $jsx("div", {
      class: "color-picker-wheel-handle"
    }), $jsx("div", {
      class: "color-picker-sb-spectrum",
      style: "background-color: hsl(0, 100%, 50%)"
    }, $jsx("div", {
      class: "color-picker-sb-spectrum-handle"
    }))));
  },
  init: function init(self) {
    var app = self.app;
    var isTouched;
    var isMoved;
    var touchStartX;
    var touchStartY;
    var touchCurrentX;
    var touchCurrentY;
    var wheelRect;
    var wheelIsTouched;
    var wheelHandleIsTouched;
    var specterRect;
    var specterIsTouched;
    var specterHandleIsTouched;
    var $el = self.$el;

    function setHueFromWheelCoords(x, y) {
      var wheelCenterX = wheelRect.left + wheelRect.width / 2;
      var wheelCenterY = wheelRect.top + wheelRect.height / 2;
      var angleRad = Math.atan2(y - wheelCenterY, x - wheelCenterX);
      var angleDeg = angleRad * 180 / Math.PI + 90;
      if (angleDeg < 0) angleDeg += 360;
      angleDeg = 360 - angleDeg;
      self.setValue({
        hue: angleDeg
      });
    }

    function setSBFromSpecterCoords(x, y) {
      var s = (x - specterRect.left) / specterRect.width;
      var b = (y - specterRect.top) / specterRect.height;
      s = Math.max(0, Math.min(1, s));
      b = 1 - Math.max(0, Math.min(1, b));
      self.setValue({
        hsb: [self.value.hue, s, b]
      });
    }

    function handleTouchStart(e) {
      if (isMoved || isTouched) return;
      touchStartX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchCurrentX = touchStartX;
      touchStartY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      touchCurrentY = touchStartY;
      var $targetEl = $(e.target);
      wheelHandleIsTouched = $targetEl.closest('.color-picker-wheel-handle').length > 0;
      wheelIsTouched = $targetEl.closest('circle').length > 0;
      specterHandleIsTouched = $targetEl.closest('.color-picker-sb-spectrum-handle').length > 0;

      if (!specterHandleIsTouched) {
        specterIsTouched = $targetEl.closest('.color-picker-sb-spectrum').length > 0;
      }

      if (wheelIsTouched) {
        wheelRect = $el.find('.color-picker-wheel')[0].getBoundingClientRect();
        setHueFromWheelCoords(touchStartX, touchStartY);
      }

      if (specterIsTouched) {
        specterRect = $el.find('.color-picker-sb-spectrum')[0].getBoundingClientRect();
        setSBFromSpecterCoords(touchStartX, touchStartY);
      }

      if (specterHandleIsTouched || specterIsTouched) {
        $el.find('.color-picker-sb-spectrum-handle').addClass('color-picker-sb-spectrum-handle-pressed');
      }
    }

    function handleTouchMove(e) {
      if (!(wheelIsTouched || wheelHandleIsTouched) && !(specterIsTouched || specterHandleIsTouched)) return;
      touchCurrentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
      touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
      e.preventDefault();

      if (!isMoved) {
        // First move
        isMoved = true;

        if (wheelHandleIsTouched) {
          wheelRect = $el.find('.color-picker-wheel')[0].getBoundingClientRect();
        }

        if (specterHandleIsTouched) {
          specterRect = $el.find('.color-picker-sb-spectrum')[0].getBoundingClientRect();
        }
      }

      if (wheelIsTouched || wheelHandleIsTouched) {
        setHueFromWheelCoords(touchCurrentX, touchCurrentY);
      }

      if (specterIsTouched || specterHandleIsTouched) {
        setSBFromSpecterCoords(touchCurrentX, touchCurrentY);
      }
    }

    function handleTouchEnd() {
      isMoved = false;

      if (specterIsTouched || specterHandleIsTouched) {
        $el.find('.color-picker-sb-spectrum-handle').removeClass('color-picker-sb-spectrum-handle-pressed');
      }

      wheelIsTouched = false;
      wheelHandleIsTouched = false;
      specterIsTouched = false;
      specterHandleIsTouched = false;
    }

    function handleResize() {
      self.modules.wheel.update(self);
    }

    var passiveListener = app.touchEvents.start === 'touchstart' && getSupport().passiveListener ? {
      passive: true,
      capture: false
    } : false;
    self.$el.on(app.touchEvents.start, handleTouchStart, passiveListener);
    app.on('touchmove:active', handleTouchMove);
    app.on('touchend:passive', handleTouchEnd);
    app.on('resize', handleResize);

    self.destroyWheelEvents = function destroyWheelEvents() {
      self.$el.off(app.touchEvents.start, handleTouchStart, passiveListener);
      app.off('touchmove:active', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);
      app.off('resize', handleResize);
    };
  },
  update: function update(self) {
    var value = self.value;
    var hsl = value.hsl,
        hsb = value.hsb;
    var specterWidth = self.$el.find('.color-picker-sb-spectrum')[0].offsetWidth;
    var specterHeight = self.$el.find('.color-picker-sb-spectrum')[0].offsetHeight;
    var wheelSize = self.$el.find('.color-picker-wheel')[0].offsetWidth;
    var wheelHalfSize = wheelSize / 2;
    var angleRad = value.hue * Math.PI / 180;
    var handleSize = wheelSize / 6;
    var handleHalfSize = handleSize / 2;
    var tX = wheelHalfSize - Math.sin(angleRad) * (wheelHalfSize - handleHalfSize) - handleHalfSize;
    var tY = wheelHalfSize - Math.cos(angleRad) * (wheelHalfSize - handleHalfSize) - handleHalfSize;
    self.$el.find('.color-picker-wheel-handle').css('background-color', "hsl(" + hsl[0] + ", 100%, 50%)").transform("translate(" + tX + "px, " + tY + "px)");
    self.$el.find('.color-picker-sb-spectrum').css('background-color', "hsl(" + hsl[0] + ", 100%, 50%)");
    self.$el.find('.color-picker-sb-spectrum-handle').css('background-color', "hsl(" + hsl[0] + ", " + hsl[1] * 100 + "%, " + hsl[2] * 100 + "%)").transform("translate(" + specterWidth * hsb[1] + "px, " + specterHeight * (1 - hsb[2]) + "px)");
  },
  destroy: function destroy(self) {
    if (self.destroyWheelEvents) self.destroyWheelEvents();
    delete self.destroyWheelEvents;
  }
};