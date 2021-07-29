"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

var _getSupport = require("../../shared/get-support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Toggle = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Toggle, _Framework7Class);

  function Toggle(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var toggle = _assertThisInitialized(_this);

    var support = (0, _getSupport.getSupport)();
    var defaults = {}; // Extend defaults with modules params

    toggle.useModulesParams(defaults);
    toggle.params = (0, _utils.extend)(defaults, params);
    var el = toggle.params.el;
    if (!el) return toggle || _assertThisInitialized(_this);
    var $el = (0, _dom.default)(el);
    if ($el.length === 0) return toggle || _assertThisInitialized(_this);
    if ($el[0].f7Toggle) return $el[0].f7Toggle || _assertThisInitialized(_this);
    var $inputEl = $el.children('input[type="checkbox"]');
    (0, _utils.extend)(toggle, {
      app: app,
      $el: $el,
      el: $el[0],
      $inputEl: $inputEl,
      inputEl: $inputEl[0],
      disabled: $el.hasClass('disabled') || $inputEl.hasClass('disabled') || $inputEl.attr('disabled') || $inputEl[0].disabled
    });
    Object.defineProperty(toggle, 'checked', {
      enumerable: true,
      configurable: true,
      set: function set(checked) {
        if (!toggle || typeof toggle.$inputEl === 'undefined') return;
        if (toggle.checked === checked) return;
        $inputEl[0].checked = checked;
        toggle.$inputEl.trigger('change');
      },
      get: function get() {
        return $inputEl[0].checked;
      }
    });
    $el[0].f7Toggle = toggle;
    var isTouched;
    var touchesStart = {};
    var isScrolling;
    var touchesDiff;
    var toggleWidth;
    var touchStartTime;
    var touchStartChecked;

    function handleTouchStart(e) {
      if (isTouched || toggle.disabled) return;
      touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      touchesDiff = 0;
      isTouched = true;
      isScrolling = undefined;
      touchStartTime = (0, _utils.now)();
      touchStartChecked = toggle.checked;
      toggleWidth = $el[0].offsetWidth;
      (0, _utils.nextTick)(function () {
        if (isTouched) {
          $el.addClass('toggle-active-state');
        }
      });
    }

    function handleTouchMove(e) {
      if (!isTouched || toggle.disabled) return;
      var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
      var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
      var inverter = app.rtl ? -1 : 1;

      if (typeof isScrolling === 'undefined') {
        isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
      }

      if (isScrolling) {
        isTouched = false;
        return;
      }

      e.preventDefault();
      touchesDiff = pageX - touchesStart.x;
      var changed;

      if (touchesDiff * inverter < 0 && Math.abs(touchesDiff) > toggleWidth / 3 && touchStartChecked) {
        changed = true;
      }

      if (touchesDiff * inverter > 0 && Math.abs(touchesDiff) > toggleWidth / 3 && !touchStartChecked) {
        changed = true;
      }

      if (changed) {
        touchesStart.x = pageX;
        toggle.checked = !touchStartChecked;
        touchStartChecked = !touchStartChecked;
      }
    }

    function handleTouchEnd() {
      if (!isTouched || toggle.disabled) {
        if (isScrolling) $el.removeClass('toggle-active-state');
        isTouched = false;
        return;
      }

      var inverter = app.rtl ? -1 : 1;
      isTouched = false;
      $el.removeClass('toggle-active-state');
      var changed;

      if ((0, _utils.now)() - touchStartTime < 300) {
        if (touchesDiff * inverter < 0 && touchStartChecked) {
          changed = true;
        }

        if (touchesDiff * inverter > 0 && !touchStartChecked) {
          changed = true;
        }

        if (changed) {
          toggle.checked = !touchStartChecked;
        }
      }
    }

    function handleInputChange() {
      toggle.$el.trigger('toggle:change');
      toggle.emit('local::change toggleChange', toggle);
    }

    toggle.attachEvents = function attachEvents() {
      var passive = support.passiveListener ? {
        passive: true
      } : false;
      $el.on(app.touchEvents.start, handleTouchStart, passive);
      app.on('touchmove', handleTouchMove);
      app.on('touchend:passive', handleTouchEnd);
      toggle.$inputEl.on('change', handleInputChange);
    };

    toggle.detachEvents = function detachEvents() {
      var passive = support.passiveListener ? {
        passive: true
      } : false;
      $el.off(app.touchEvents.start, handleTouchStart, passive);
      app.off('touchmove', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);
      toggle.$inputEl.off('change', handleInputChange);
    }; // Install Modules


    toggle.useModules(); // Init

    toggle.init();
    return _this;
  }

  var _proto = Toggle.prototype;

  _proto.toggle = function toggle() {
    var toggle = this;
    toggle.checked = !toggle.checked;
  };

  _proto.init = function init() {
    var toggle = this;
    toggle.attachEvents();
  };

  _proto.destroy = function destroy() {
    var toggle = this;
    toggle.$el.trigger('toggle:beforedestroy');
    toggle.emit('local::beforeDestroy toggleBeforeDestroy', toggle);
    delete toggle.$el[0].f7Toggle;
    toggle.detachEvents();
    (0, _utils.deleteProps)(toggle);
    toggle = null;
  };

  return Toggle;
}(_class.default);

var _default = Toggle;
exports.default = _default;