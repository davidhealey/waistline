"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TouchRipple = /*#__PURE__*/function () {
  function TouchRipple(app, $el, x, y) {
    var ripple = this;
    if (!$el) return undefined;

    var _$el$0$getBoundingCli = $el[0].getBoundingClientRect(),
        left = _$el$0$getBoundingCli.left,
        top = _$el$0$getBoundingCli.top,
        width = _$el$0$getBoundingCli.width,
        height = _$el$0$getBoundingCli.height;

    var center = {
      x: x - left,
      y: y - top
    };
    var diameter = Math.max(Math.pow(Math.pow(height, 2) + Math.pow(width, 2), 0.5), 48);
    var isInset = false;
    var insetElements = app.params.touch.touchRippleInsetElements || '';

    if (insetElements && $el.is(insetElements)) {
      isInset = true;
    }

    if (isInset) {
      diameter = Math.max(Math.min(width, height), 48);
    }

    if (!isInset && $el.css('overflow') === 'hidden') {
      var distanceFromCenter = Math.pow(Math.pow(center.x - width / 2, 2) + Math.pow(center.y - height / 2, 2), 0.5);
      var scale = (diameter / 2 + distanceFromCenter) / (diameter / 2);
      ripple.rippleTransform = "translate3d(0px, 0px, 0) scale(" + scale + ")";
    } else {
      // prettier-ignore
      ripple.rippleTransform = "translate3d(" + (-center.x + width / 2) + "px, " + (-center.y + height / 2) + "px, 0) scale(1)";
    }

    if (isInset) {
      $el.addClass('ripple-inset');
    }

    ripple.$rippleWaveEl = (0, _dom.default)("<div class=\"ripple-wave\" style=\"width: " + diameter + "px; height: " + diameter + "px; margin-top:-" + diameter / 2 + "px; margin-left:-" + diameter / 2 + "px; left:" + center.x + "px; top:" + center.y + "px; --f7-ripple-transform: " + ripple.rippleTransform + "\"></div>");
    $el.prepend(ripple.$rippleWaveEl);
    ripple.$rippleWaveEl.animationEnd(function () {
      if (!ripple.$rippleWaveEl) return;
      if (ripple.$rippleWaveEl.hasClass('ripple-wave-out')) return;
      ripple.$rippleWaveEl.addClass('ripple-wave-in');

      if (ripple.shouldBeRemoved) {
        ripple.out();
      }
    });
    return ripple;
  }

  var _proto = TouchRipple.prototype;

  _proto.destroy = function destroy() {
    var ripple = this;

    if (ripple.$rippleWaveEl) {
      ripple.$rippleWaveEl.remove();
    }

    Object.keys(ripple).forEach(function (key) {
      ripple[key] = null;
      delete ripple[key];
    });
    ripple = null;
  };

  _proto.out = function out() {
    var ripple = this;
    var $rippleWaveEl = this.$rippleWaveEl;
    clearTimeout(ripple.removeTimeout);
    $rippleWaveEl.addClass('ripple-wave-out');
    ripple.removeTimeout = setTimeout(function () {
      ripple.destroy();
    }, 300);
    $rippleWaveEl.animationEnd(function () {
      clearTimeout(ripple.removeTimeout);
      ripple.destroy();
    });
  };

  _proto.remove = function remove() {
    var ripple = this;
    if (ripple.shouldBeRemoved) return;
    ripple.removeTimeout = setTimeout(function () {
      ripple.destroy();
    }, 400);
    ripple.shouldBeRemoved = true;

    if (ripple.$rippleWaveEl.hasClass('ripple-wave-in')) {
      ripple.out();
    }
  };

  return TouchRipple;
}();

exports.default = TouchRipple;