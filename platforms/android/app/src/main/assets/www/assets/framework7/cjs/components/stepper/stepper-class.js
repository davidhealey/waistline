"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Stepper = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Stepper, _Framework7Class);

  function Stepper(app, params) {
    var _this;

    _this = _Framework7Class.call(this, params, [app]) || this;

    var stepper = _assertThisInitialized(_this);

    var defaults = {
      el: null,
      inputEl: null,
      valueEl: null,
      value: 0,
      formatValue: null,
      step: 1,
      min: 0,
      max: 100,
      watchInput: true,
      autorepeat: false,
      autorepeatDynamic: false,
      wraps: false,
      manualInputMode: false,
      decimalPoint: 4,
      buttonsEndInputMode: true
    }; // Extend defaults with modules params

    stepper.useModulesParams(defaults);
    stepper.params = (0, _utils.extend)(defaults, params);

    if (stepper.params.value < stepper.params.min) {
      stepper.params.value = stepper.params.min;
    }

    if (stepper.params.value > stepper.params.max) {
      stepper.params.value = stepper.params.max;
    }

    var el = stepper.params.el;
    if (!el) return stepper || _assertThisInitialized(_this);
    var $el = (0, _dom.default)(el);
    if ($el.length === 0) return stepper || _assertThisInitialized(_this);
    if ($el[0].f7Stepper) return $el[0].f7Stepper || _assertThisInitialized(_this);
    var $inputEl;

    if (stepper.params.inputEl) {
      $inputEl = (0, _dom.default)(stepper.params.inputEl);
    } else if ($el.find('.stepper-input-wrap').find('input, textarea').length) {
      $inputEl = $el.find('.stepper-input-wrap').find('input, textarea').eq(0);
    }

    if ($inputEl && $inputEl.length) {
      'step min max'.split(' ').forEach(function (paramName) {
        if (!params[paramName] && $inputEl.attr(paramName)) {
          stepper.params[paramName] = parseFloat($inputEl.attr(paramName));
        }
      });

      var _decimalPoint = parseInt(stepper.params.decimalPoint, 10);

      if (Number.isNaN(_decimalPoint)) {
        stepper.params.decimalPoint = 0;
      } else {
        stepper.params.decimalPoint = _decimalPoint;
      }

      var inputValue = parseFloat($inputEl.val());

      if (typeof params.value === 'undefined' && !Number.isNaN(inputValue) && (inputValue || inputValue === 0)) {
        stepper.params.value = inputValue;
      }
    }

    var $valueEl;

    if (stepper.params.valueEl) {
      $valueEl = (0, _dom.default)(stepper.params.valueEl);
    } else if ($el.find('.stepper-value').length) {
      $valueEl = $el.find('.stepper-value').eq(0);
    }

    var $buttonPlusEl = $el.find('.stepper-button-plus');
    var $buttonMinusEl = $el.find('.stepper-button-minus');
    var _stepper$params = stepper.params,
        step = _stepper$params.step,
        min = _stepper$params.min,
        max = _stepper$params.max,
        value = _stepper$params.value,
        decimalPoint = _stepper$params.decimalPoint;
    (0, _utils.extend)(stepper, {
      app: app,
      $el: $el,
      el: $el[0],
      $buttonPlusEl: $buttonPlusEl,
      buttonPlusEl: $buttonPlusEl[0],
      $buttonMinusEl: $buttonMinusEl,
      buttonMinusEl: $buttonMinusEl[0],
      $inputEl: $inputEl,
      inputEl: $inputEl ? $inputEl[0] : undefined,
      $valueEl: $valueEl,
      valueEl: $valueEl ? $valueEl[0] : undefined,
      step: step,
      min: min,
      max: max,
      value: value,
      decimalPoint: decimalPoint,
      typeModeChanged: false
    });
    $el[0].f7Stepper = stepper; // Handle Events

    var touchesStart = {};
    var isTouched;
    var isScrolling;
    var preventButtonClick;
    var intervalId;
    var timeoutId;
    var autorepeatAction = null;
    var autorepeatInAction = false;
    var manualInput = false;

    function dynamicRepeat(current, progressions, startsIn, progressionStep, repeatEvery, action) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        if (current === 1) {
          preventButtonClick = true;
          autorepeatInAction = true;
        }

        clearInterval(intervalId);
        action();
        intervalId = setInterval(function () {
          action();
        }, repeatEvery);

        if (current < progressions) {
          dynamicRepeat(current + 1, progressions, startsIn, progressionStep, repeatEvery / 2, action);
        }
      }, current === 1 ? startsIn : progressionStep);
    }

    function onTouchStart(e) {
      if (isTouched) return;

      if (manualInput) {
        return;
      }

      if ((0, _dom.default)(e.target).closest($buttonPlusEl).length) {
        autorepeatAction = 'increment';
      } else if ((0, _dom.default)(e.target).closest($buttonMinusEl).length) {
        autorepeatAction = 'decrement';
      }

      if (!autorepeatAction) return;
      touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      isTouched = true;
      isScrolling = undefined;
      var progressions = stepper.params.autorepeatDynamic ? 4 : 1;
      dynamicRepeat(1, progressions, 500, 1000, 300, function () {
        stepper[autorepeatAction]();
      });
    }

    function onTouchMove(e) {
      if (!isTouched) return;

      if (manualInput) {
        return;
      }

      var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
      var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

      if (typeof isScrolling === 'undefined' && !autorepeatInAction) {
        isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
      }

      var distance = Math.pow(Math.pow(pageX - touchesStart.x, 2) + Math.pow(pageY - touchesStart.y, 2), 0.5);

      if (isScrolling || distance > 20) {
        isTouched = false;
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      }
    }

    function onTouchEnd() {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      autorepeatAction = null;
      autorepeatInAction = false;
      isTouched = false;
    }

    function onMinusClick() {
      if (manualInput) {
        if (stepper.params.buttonsEndInputMode) {
          manualInput = false;
          stepper.endTypeMode(true);
        }

        return;
      }

      if (preventButtonClick) {
        preventButtonClick = false;
        return;
      }

      stepper.decrement(true);
    }

    function onPlusClick() {
      if (manualInput) {
        if (stepper.params.buttonsEndInputMode) {
          manualInput = false;
          stepper.endTypeMode(true);
        }

        return;
      }

      if (preventButtonClick) {
        preventButtonClick = false;
        return;
      }

      stepper.increment(true);
    }

    function onInputClick(e) {
      if (!e.target.readOnly && stepper.params.manualInputMode) {
        manualInput = true;

        if (typeof e.target.selectionStart === 'number') {
          e.target.selectionStart = e.target.value.length;
          e.target.selectionEnd = e.target.value.length;
        }
      }
    }

    function onInputKey(e) {
      if (e.keyCode === 13 || e.which === 13) {
        e.preventDefault();
        manualInput = false;
        stepper.endTypeMode();
      }
    }

    function onInputBlur() {
      manualInput = false;
      stepper.endTypeMode(true);
    }

    function onInput(e) {
      if (manualInput) {
        stepper.typeValue(e.target.value);
        return;
      }

      if (e.detail && e.detail.sentByF7Stepper) return;
      stepper.setValue(e.target.value, true);
    }

    stepper.attachEvents = function attachEvents() {
      $buttonMinusEl.on('click', onMinusClick);
      $buttonPlusEl.on('click', onPlusClick);

      if (stepper.params.watchInput && $inputEl && $inputEl.length) {
        $inputEl.on('input', onInput);
        $inputEl.on('click', onInputClick);
        $inputEl.on('blur', onInputBlur);
        $inputEl.on('keyup', onInputKey);
      }

      if (stepper.params.autorepeat) {
        app.on('touchstart:passive', onTouchStart);
        app.on('touchmove:active', onTouchMove);
        app.on('touchend:passive', onTouchEnd);
      }
    };

    stepper.detachEvents = function detachEvents() {
      $buttonMinusEl.off('click', onMinusClick);
      $buttonPlusEl.off('click', onPlusClick);

      if (stepper.params.watchInput && $inputEl && $inputEl.length) {
        $inputEl.off('input', onInput);
        $inputEl.off('click', onInputClick);
        $inputEl.off('blur', onInputBlur);
        $inputEl.off('keyup', onInputKey);
      }
    }; // Install Modules


    stepper.useModules(); // Init

    stepper.init();
    return stepper || _assertThisInitialized(_this);
  }

  var _proto = Stepper.prototype;

  _proto.minus = function minus() {
    return this.decrement();
  };

  _proto.plus = function plus() {
    return this.increment();
  };

  _proto.decrement = function decrement() {
    var stepper = this;
    return stepper.setValue(stepper.value - stepper.step, false, true);
  };

  _proto.increment = function increment() {
    var stepper = this;
    return stepper.setValue(stepper.value + stepper.step, false, true);
  };

  _proto.setValue = function setValue(newValue, forceUpdate, withWraps) {
    var stepper = this;
    var step = stepper.step,
        min = stepper.min,
        max = stepper.max;
    var oldValue = stepper.value;
    var value = Math.round(newValue / step) * step;

    if (stepper.params.wraps && withWraps) {
      if (value > max) value = min;
      if (value < min) value = max;
    } else {
      value = Math.max(Math.min(value, max), min);
    }

    if (Number.isNaN(value)) {
      value = oldValue;
    }

    stepper.value = value;
    var valueChanged = oldValue !== value; // Events

    if (!valueChanged && !forceUpdate) return stepper;
    stepper.$el.trigger('stepper:change', stepper.value);
    var formattedValue = stepper.formatValue(stepper.value);

    if (stepper.$inputEl && stepper.$inputEl.length) {
      stepper.$inputEl.val(formattedValue);
      stepper.$inputEl.trigger('input change', {
        sentByF7Stepper: true
      });
    }

    if (stepper.$valueEl && stepper.$valueEl.length) {
      stepper.$valueEl.html(formattedValue);
    }

    stepper.emit('local::change stepperChange', stepper, stepper.value);
    return stepper;
  };

  _proto.endTypeMode = function endTypeMode(noBlur) {
    var stepper = this;
    var min = stepper.min,
        max = stepper.max;
    var value = parseFloat(stepper.value);
    if (Number.isNaN(value)) value = 0;
    value = Math.max(Math.min(value, max), min);
    stepper.value = value;

    if (!stepper.typeModeChanged) {
      if (stepper.$inputEl && stepper.$inputEl.length && !noBlur) {
        stepper.$inputEl.blur();
      }

      return stepper;
    }

    stepper.typeModeChanged = false;
    stepper.$el.trigger('stepper:change', stepper.value);
    var formattedValue = stepper.formatValue(stepper.value);

    if (stepper.$inputEl && stepper.$inputEl.length) {
      stepper.$inputEl.val(formattedValue);
      stepper.$inputEl.trigger('input change', {
        sentByF7Stepper: true
      });
      if (!noBlur) stepper.$inputEl.blur();
    }

    if (stepper.$valueEl && stepper.$valueEl.length) {
      stepper.$valueEl.html(formattedValue);
    }

    stepper.emit('local::change stepperChange', stepper, stepper.value);
    return stepper;
  };

  _proto.typeValue = function typeValue(value) {
    var stepper = this;
    stepper.typeModeChanged = true;
    var inputTxt = String(value);

    if (inputTxt.lastIndexOf('.') + 1 === inputTxt.length || inputTxt.lastIndexOf(',') + 1 === inputTxt.length) {
      if (inputTxt.lastIndexOf('.') !== inputTxt.indexOf('.') || inputTxt.lastIndexOf(',') !== inputTxt.indexOf(',')) {
        inputTxt = inputTxt.slice(0, -1);
        stepper.value = inputTxt;
        stepper.$inputEl.val(stepper.value);
        return stepper;
      }
    } else {
      var newValue = parseFloat(inputTxt.replace(',', '.'));

      if (newValue === 0) {
        stepper.value = inputTxt.replace(',', '.');
        stepper.$inputEl.val(stepper.value);
        return stepper;
      }

      if (Number.isNaN(newValue)) {
        stepper.value = 0;
        stepper.$inputEl.val(stepper.value);
        return stepper;
      }

      var powVal = Math.pow(10, stepper.params.decimalPoint);
      newValue = Math.round(newValue * powVal).toFixed(stepper.params.decimalPoint + 1) / powVal;
      stepper.value = parseFloat(String(newValue).replace(',', '.'));
      stepper.$inputEl.val(stepper.value);
      return stepper;
    }

    stepper.value = inputTxt;
    stepper.$inputEl.val(inputTxt);
    return stepper;
  };

  _proto.getValue = function getValue() {
    return this.value;
  };

  _proto.formatValue = function formatValue(value) {
    var stepper = this;
    if (!stepper.params.formatValue) return value;
    return stepper.params.formatValue.call(stepper, value);
  };

  _proto.init = function init() {
    var stepper = this;
    stepper.attachEvents();

    if (stepper.$valueEl && stepper.$valueEl.length) {
      var formattedValue = stepper.formatValue(stepper.value);
      stepper.$valueEl.html(formattedValue);
    }

    return stepper;
  };

  _proto.destroy = function destroy() {
    var stepper = this;
    stepper.$el.trigger('stepper:beforedestroy');
    stepper.emit('local::beforeDestroy stepperBeforeDestroy', stepper);
    delete stepper.$el[0].f7Stepper;
    stepper.detachEvents();
    (0, _utils.deleteProps)(stepper);
    stepper = null;
  };

  return Stepper;
}(_class.default);

var _default = Stepper;
exports.default = _default;