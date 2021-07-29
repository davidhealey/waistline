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

var Range = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Range, _Framework7Class);

  function Range(app, params) {
    var _this;

    _this = _Framework7Class.call(this, params, [app]) || this;

    var range = _assertThisInitialized(_this);

    var support = (0, _getSupport.getSupport)();
    var defaults = {
      el: null,
      inputEl: null,
      dual: false,
      step: 1,
      label: false,
      min: 0,
      max: 100,
      value: 0,
      draggableBar: true,
      vertical: false,
      verticalReversed: false,
      formatLabel: null,
      scale: false,
      scaleSteps: 5,
      scaleSubSteps: 0,
      formatScaleLabel: null,
      limitKnobPosition: app.theme === 'ios'
    }; // Extend defaults with modules params

    range.useModulesParams(defaults);
    range.params = (0, _utils.extend)(defaults, params);
    var el = range.params.el;
    if (!el) return range || _assertThisInitialized(_this);
    var $el = (0, _dom.default)(el);
    if ($el.length === 0) return range || _assertThisInitialized(_this);
    if ($el[0].f7Range) return $el[0].f7Range || _assertThisInitialized(_this);
    var dataset = $el.dataset();
    'step min max value scaleSteps scaleSubSteps'.split(' ').forEach(function (paramName) {
      if (typeof params[paramName] === 'undefined' && typeof dataset[paramName] !== 'undefined') {
        range.params[paramName] = parseFloat(dataset[paramName]);
      }
    });
    'dual label vertical verticalReversed scale'.split(' ').forEach(function (paramName) {
      if (typeof params[paramName] === 'undefined' && typeof dataset[paramName] !== 'undefined') {
        range.params[paramName] = dataset[paramName];
      }
    });

    if (!range.params.value) {
      if (typeof dataset.value !== 'undefined') range.params.value = dataset.value;

      if (typeof dataset.valueLeft !== 'undefined' && typeof dataset.valueRight !== 'undefined') {
        range.params.value = [parseFloat(dataset.valueLeft), parseFloat(dataset.valueRight)];
      }
    }

    var $inputEl;

    if (!range.params.dual) {
      if (range.params.inputEl) {
        $inputEl = (0, _dom.default)(range.params.inputEl);
      } else if ($el.find('input[type="range"]').length) {
        $inputEl = $el.find('input[type="range"]').eq(0);
      }
    }

    var _range$params = range.params,
        dual = _range$params.dual,
        step = _range$params.step,
        label = _range$params.label,
        min = _range$params.min,
        max = _range$params.max,
        value = _range$params.value,
        vertical = _range$params.vertical,
        verticalReversed = _range$params.verticalReversed,
        scale = _range$params.scale,
        scaleSteps = _range$params.scaleSteps,
        scaleSubSteps = _range$params.scaleSubSteps,
        limitKnobPosition = _range$params.limitKnobPosition;
    (0, _utils.extend)(range, {
      app: app,
      $el: $el,
      el: $el[0],
      $inputEl: $inputEl,
      inputEl: $inputEl ? $inputEl[0] : undefined,
      dual: dual,
      step: step,
      label: label,
      min: min,
      max: max,
      value: value,
      previousValue: value,
      vertical: vertical,
      verticalReversed: verticalReversed,
      scale: scale,
      scaleSteps: scaleSteps,
      scaleSubSteps: scaleSubSteps,
      limitKnobPosition: limitKnobPosition
    });

    if ($inputEl) {
      'step min max'.split(' ').forEach(function (paramName) {
        if (!params[paramName] && $inputEl.attr(paramName)) {
          range.params[paramName] = parseFloat($inputEl.attr(paramName));
          range[paramName] = parseFloat($inputEl.attr(paramName));
        }
      });

      if (typeof $inputEl.val() !== 'undefined') {
        range.params.value = parseFloat($inputEl.val());
        range.value = parseFloat($inputEl.val());
      }
    } // Dual


    if (range.dual) {
      $el.addClass('range-slider-dual');
    }

    if (range.label) {
      $el.addClass('range-slider-label');
    } // Vertical


    if (range.vertical) {
      $el.addClass('range-slider-vertical');

      if (range.verticalReversed) {
        $el.addClass('range-slider-vertical-reversed');
      }
    } else {
      $el.addClass('range-slider-horizontal');
    } // Check for layout


    var $barEl = (0, _dom.default)('<div class="range-bar"></div>');
    var $barActiveEl = (0, _dom.default)('<div class="range-bar-active"></div>');
    $barEl.append($barActiveEl); // Create Knobs
    // prettier-ignore

    var knobHTML = "\n      <div class=\"range-knob-wrap\">\n        <div class=\"range-knob\"></div>\n        " + (range.label ? '<div class="range-knob-label"></div>' : '') + "\n      </div>\n    ";
    var knobs = [(0, _dom.default)(knobHTML)];

    if (range.dual) {
      knobs.push((0, _dom.default)(knobHTML));
    }

    $el.append($barEl);
    knobs.forEach(function ($knobEl) {
      $el.append($knobEl);
    }); // Labels

    var labels = [];

    if (range.label) {
      labels.push(knobs[0].find('.range-knob-label'));

      if (range.dual) {
        labels.push(knobs[1].find('.range-knob-label'));
      }
    } // Scale


    var $scaleEl;

    if (range.scale && range.scaleSteps >= 1) {
      $scaleEl = (0, _dom.default)("\n        <div class=\"range-scale\">\n          " + range.renderScale() + "\n        </div>\n      ");
      $el.append($scaleEl);
    }

    (0, _utils.extend)(range, {
      knobs: knobs,
      labels: labels,
      $barEl: $barEl,
      $barActiveEl: $barActiveEl,
      $scaleEl: $scaleEl
    });
    $el[0].f7Range = range; // Touch Events

    var isTouched;
    var touchesStart = {};
    var isScrolling;
    var rangeOffset;
    var rangeOffsetLeft;
    var rangeOffsetTop;
    var $touchedKnobEl;
    var dualValueIndex;
    var valueChangedByTouch;
    var targetTouchIdentifier;

    function onTouchChange() {
      valueChangedByTouch = true;
    }

    function handleTouchStart(e) {
      if (isTouched) return;

      if (!range.params.draggableBar) {
        if ((0, _dom.default)(e.target).closest('.range-knob').length === 0) {
          return;
        }
      }

      valueChangedByTouch = false;
      touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;

      if (e.type === 'touchstart') {
        targetTouchIdentifier = e.targetTouches[0].identifier;
      }

      isTouched = true;
      isScrolling = undefined;
      rangeOffset = $el.offset();
      rangeOffsetLeft = rangeOffset.left;
      rangeOffsetTop = rangeOffset.top;
      var progress;

      if (range.vertical) {
        progress = (touchesStart.y - rangeOffsetTop) / range.rangeHeight;
        if (!range.verticalReversed) progress = 1 - progress;
      } else if (range.app.rtl) {
        progress = (rangeOffsetLeft + range.rangeWidth - touchesStart.x) / range.rangeWidth;
      } else {
        progress = (touchesStart.x - rangeOffsetLeft) / range.rangeWidth;
      }

      var newValue = progress * (range.max - range.min) + range.min;

      if (range.dual) {
        if (Math.abs(range.value[0] - newValue) < Math.abs(range.value[1] - newValue)) {
          dualValueIndex = 0;
          $touchedKnobEl = range.knobs[0];
          newValue = [newValue, range.value[1]];
        } else {
          dualValueIndex = 1;
          $touchedKnobEl = range.knobs[1];
          newValue = [range.value[0], newValue];
        }
      } else {
        $touchedKnobEl = range.knobs[0];
        newValue = progress * (range.max - range.min) + range.min;
      }

      (0, _utils.nextTick)(function () {
        if (isTouched) $touchedKnobEl.addClass('range-knob-active-state');
      }, 70);
      range.on('change', onTouchChange);
      range.setValue(newValue, true);
    }

    function handleTouchMove(e) {
      if (!isTouched) return;
      var pageX;
      var pageY;

      if (e.type === 'touchmove') {
        for (var i = 0; i < e.targetTouches.length; i += 1) {
          if (e.targetTouches[i].identifier === targetTouchIdentifier) {
            pageX = e.targetTouches[i].pageX;
            pageY = e.targetTouches[i].pageY;
          }
        }
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }

      if (typeof pageX === 'undefined' && typeof pageY === 'undefined') return;

      if (typeof isScrolling === 'undefined' && !range.vertical) {
        isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
      }

      if (isScrolling) {
        isTouched = false;
        return;
      }

      e.preventDefault();
      var progress;

      if (range.vertical) {
        progress = (pageY - rangeOffsetTop) / range.rangeHeight;
        if (!range.verticalReversed) progress = 1 - progress;
      } else if (range.app.rtl) {
        progress = (rangeOffsetLeft + range.rangeWidth - pageX) / range.rangeWidth;
      } else {
        progress = (pageX - rangeOffsetLeft) / range.rangeWidth;
      }

      var newValue = progress * (range.max - range.min) + range.min;

      if (range.dual) {
        var leftValue;
        var rightValue;

        if (dualValueIndex === 0) {
          leftValue = newValue;
          rightValue = range.value[1];

          if (leftValue > rightValue) {
            rightValue = leftValue;
          }
        } else {
          leftValue = range.value[0];
          rightValue = newValue;

          if (rightValue < leftValue) {
            leftValue = rightValue;
          }
        }

        newValue = [leftValue, rightValue];
      }

      range.setValue(newValue, true);
    }

    function handleTouchEnd(e) {
      if (e.type === 'touchend') {
        var touchEnded;

        for (var i = 0; i < e.changedTouches.length; i += 1) {
          if (e.changedTouches[i].identifier === targetTouchIdentifier) touchEnded = true;
        }

        if (!touchEnded) return;
      }

      if (!isTouched) {
        if (isScrolling) $touchedKnobEl.removeClass('range-knob-active-state');
        isTouched = false;
        return;
      }

      range.off('change', onTouchChange);
      isTouched = false;
      $touchedKnobEl.removeClass('range-knob-active-state');

      if (valueChangedByTouch && range.$inputEl && !range.dual) {
        range.$inputEl.trigger('change');
      }

      valueChangedByTouch = false;

      if (typeof range.previousValue !== 'undefined') {
        if (range.dual && (range.previousValue[0] !== range.value[0] || range.previousValue[1] !== range.value[1]) || !range.dual && range.previousValue !== range.value) {
          range.$el.trigger('range:changed', range.value);
          range.emit('local::changed rangeChanged', range, range.value);
        }
      }
    }

    function handleResize() {
      range.calcSize();
      range.layout();
    }

    var parentModals;
    var parentPanel;
    var parentPage;

    range.attachEvents = function attachEvents() {
      var passive = support.passiveListener ? {
        passive: true
      } : false;
      range.$el.on(app.touchEvents.start, handleTouchStart, passive);
      app.on('touchmove', handleTouchMove);
      app.on('touchend:passive', handleTouchEnd);
      app.on('tabShow', handleResize);
      app.on('resize', handleResize);
      parentModals = range.$el.parents('.sheet-modal, .actions-modal, .popup, .popover, .login-screen, .dialog, .toast');
      parentModals.on('modal:open', handleResize);
      parentPanel = range.$el.parents('.panel');
      parentPanel.on('panel:open panel:resize', handleResize);
      parentPage = range.$el.parents('.page').eq(0);
      parentPage.on('page:reinit', handleResize);
    };

    range.detachEvents = function detachEvents() {
      var passive = support.passiveListener ? {
        passive: true
      } : false;
      range.$el.off(app.touchEvents.start, handleTouchStart, passive);
      app.off('touchmove', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);
      app.off('tabShow', handleResize);
      app.off('resize', handleResize);

      if (parentModals) {
        parentModals.off('modal:open', handleResize);
      }

      if (parentPanel) {
        parentPanel.off('panel:open panel:resize', handleResize);
      }

      if (parentPage) {
        parentPage.off('page:reinit', handleResize);
      }

      parentModals = null;
      parentPanel = null;
      parentPage = null;
    }; // Install Modules


    range.useModules(); // Init

    range.init();
    return range || _assertThisInitialized(_this);
  }

  var _proto = Range.prototype;

  _proto.calcSize = function calcSize() {
    var range = this;

    if (range.vertical) {
      var height = range.$el.outerHeight();
      if (height === 0) return;
      range.rangeHeight = height;
      range.knobHeight = range.knobs[0].outerHeight();
    } else {
      var width = range.$el.outerWidth();
      if (width === 0) return;
      range.rangeWidth = width;
      range.knobWidth = range.knobs[0].outerWidth();
    }
  };

  _proto.layout = function layout() {
    var range = this;
    var app = range.app,
        knobWidth = range.knobWidth,
        knobHeight = range.knobHeight,
        rangeWidth = range.rangeWidth,
        rangeHeight = range.rangeHeight,
        min = range.min,
        max = range.max,
        knobs = range.knobs,
        $barActiveEl = range.$barActiveEl,
        value = range.value,
        label = range.label,
        labels = range.labels,
        vertical = range.vertical,
        verticalReversed = range.verticalReversed,
        limitKnobPosition = range.limitKnobPosition;
    var knobSize = vertical ? knobHeight : knobWidth;
    var rangeSize = vertical ? rangeHeight : rangeWidth; // eslint-disable-next-line

    var positionProperty = vertical ? verticalReversed ? 'top' : 'bottom' : app.rtl ? 'right' : 'left';

    if (range.dual) {
      var _$barActiveEl$css;

      var progress = [(value[0] - min) / (max - min), (value[1] - min) / (max - min)];
      $barActiveEl.css((_$barActiveEl$css = {}, _$barActiveEl$css[positionProperty] = progress[0] * 100 + "%", _$barActiveEl$css[vertical ? 'height' : 'width'] = (progress[1] - progress[0]) * 100 + "%", _$barActiveEl$css));
      knobs.forEach(function ($knobEl, knobIndex) {
        var startPos = rangeSize * progress[knobIndex];

        if (limitKnobPosition) {
          var realStartPos = rangeSize * progress[knobIndex] - knobSize / 2;
          if (realStartPos < 0) startPos = knobSize / 2;
          if (realStartPos + knobSize > rangeSize) startPos = rangeSize - knobSize / 2;
        }

        $knobEl.css(positionProperty, startPos + "px");
        if (label) labels[knobIndex].text(range.formatLabel(value[knobIndex], labels[knobIndex][0]));
      });
    } else {
      var _progress = (value - min) / (max - min);

      $barActiveEl.css(vertical ? 'height' : 'width', _progress * 100 + "%");
      var startPos = rangeSize * _progress;

      if (limitKnobPosition) {
        var realStartPos = rangeSize * _progress - knobSize / 2;
        if (realStartPos < 0) startPos = knobSize / 2;
        if (realStartPos + knobSize > rangeSize) startPos = rangeSize - knobSize / 2;
      }

      knobs[0].css(positionProperty, startPos + "px");
      if (label) labels[0].text(range.formatLabel(value, labels[0][0]));
    }

    if (range.dual && value.indexOf(min) >= 0 || !range.dual && value === min) {
      range.$el.addClass('range-slider-min');
    } else {
      range.$el.removeClass('range-slider-min');
    }

    if (range.dual && value.indexOf(max) >= 0 || !range.dual && value === max) {
      range.$el.addClass('range-slider-max');
    } else {
      range.$el.removeClass('range-slider-max');
    }
  };

  _proto.setValue = function setValue(newValue, byTouchMove) {
    var range = this;
    var step = range.step,
        min = range.min,
        max = range.max;
    var valueChanged;
    var oldValue;

    if (range.dual) {
      oldValue = [range.value[0], range.value[1]];
      var newValues = newValue;
      if (!Array.isArray(newValues)) newValues = [newValue, newValue];

      if (newValue[0] > newValue[1]) {
        newValues = [newValues[0], newValues[0]];
      }

      newValues = newValues.map(function (value) {
        return Math.max(Math.min(Math.round(value / step) * step, max), min);
      });

      if (newValues[0] === range.value[0] && newValues[1] === range.value[1]) {
        return range;
      }

      newValues.forEach(function (value, valueIndex) {
        range.value[valueIndex] = value;
      });
      valueChanged = oldValue[0] !== newValues[0] || oldValue[1] !== newValues[1];
      range.layout();
    } else {
      oldValue = range.value;
      var value = Math.max(Math.min(Math.round(newValue / step) * step, max), min);
      range.value = value;
      range.layout();
      valueChanged = oldValue !== value;
    }

    if (valueChanged) {
      range.previousValue = oldValue;
    } // Events


    if (!valueChanged) return range;
    range.$el.trigger('range:change', range.value);

    if (range.$inputEl && !range.dual) {
      range.$inputEl.val(range.value);

      if (!byTouchMove) {
        range.$inputEl.trigger('input change');
      } else {
        range.$inputEl.trigger('input');
      }
    }

    if (!byTouchMove) {
      range.$el.trigger('range:changed', range.value);
      range.emit('local::changed rangeChanged', range, range.value);
    }

    range.emit('local::change rangeChange', range, range.value);
    return range;
  };

  _proto.getValue = function getValue() {
    return this.value;
  };

  _proto.formatLabel = function formatLabel(value, labelEl) {
    var range = this;
    if (range.params.formatLabel) return range.params.formatLabel.call(range, value, labelEl);
    return value;
  };

  _proto.formatScaleLabel = function formatScaleLabel(value) {
    var range = this;
    if (range.params.formatScaleLabel) return range.params.formatScaleLabel.call(range, value);
    return value;
  };

  _proto.renderScale = function renderScale() {
    var range = this;
    var app = range.app,
        verticalReversed = range.verticalReversed,
        vertical = range.vertical; // eslint-disable-next-line

    var positionProperty = vertical ? verticalReversed ? 'top' : 'bottom' : app.rtl ? 'right' : 'left';
    var html = '';
    Array.from({
      length: range.scaleSteps + 1
    }).forEach(function (scaleEl, index) {
      var scaleStepValue = (range.max - range.min) / range.scaleSteps;
      var scaleValue = range.min + scaleStepValue * index;
      var progress = (scaleValue - range.min) / (range.max - range.min);
      html += "<div class=\"range-scale-step\" style=\"" + positionProperty + ": " + progress * 100 + "%\">" + range.formatScaleLabel(scaleValue) + "</div>";

      if (range.scaleSubSteps && range.scaleSubSteps > 1 && index < range.scaleSteps) {
        Array.from({
          length: range.scaleSubSteps - 1
        }).forEach(function (subStepEl, subIndex) {
          var subStep = scaleStepValue / range.scaleSubSteps;
          var scaleSubValue = scaleValue + subStep * (subIndex + 1);
          var subProgress = (scaleSubValue - range.min) / (range.max - range.min);
          html += "<div class=\"range-scale-step range-scale-substep\" style=\"" + positionProperty + ": " + subProgress * 100 + "%\"></div>";
        });
      }
    });
    return html;
  };

  _proto.updateScale = function updateScale() {
    var range = this;

    if (!range.scale || range.scaleSteps < 1) {
      if (range.$scaleEl) range.$scaleEl.remove();
      delete range.$scaleEl;
      return;
    }

    if (!range.$scaleEl) {
      range.$scaleEl = (0, _dom.default)('<div class="range-scale"></div>');
      range.$el.append(range.$scaleEl);
    }

    range.$scaleEl.html(range.renderScale());
  };

  _proto.init = function init() {
    var range = this;
    range.calcSize();
    range.layout();
    range.attachEvents();
    return range;
  };

  _proto.destroy = function destroy() {
    var range = this;
    range.$el.trigger('range:beforedestroy');
    range.emit('local::beforeDestroy rangeBeforeDestroy', range);
    delete range.$el[0].f7Range;
    range.detachEvents();
    (0, _utils.deleteProps)(range);
    range = null;
  };

  return Range;
}(_class.default);

var _default = Range;
exports.default = _default;