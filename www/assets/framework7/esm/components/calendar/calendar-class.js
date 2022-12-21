function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

import { extend, nextTick, deleteProps } from '../../shared/utils';
import Framework7Class from '../../shared/class';
import $ from '../../shared/dom7';
import { getDevice } from '../../shared/get-device';
import { getSupport } from '../../shared/get-support';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx';

var Calendar = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Calendar, _Framework7Class);

  function Calendar(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var calendar = _assertThisInitialized(_this);

    calendar.params = extend({}, app.params.calendar, params);
    var $containerEl;

    if (calendar.params.containerEl) {
      $containerEl = $(calendar.params.containerEl);
      if ($containerEl.length === 0) return calendar || _assertThisInitialized(_this);
    }

    var $inputEl;

    if (calendar.params.inputEl) {
      $inputEl = $(calendar.params.inputEl);
    }

    var isHorizontal = calendar.params.direction === 'horizontal';
    var inverter = 1;

    if (isHorizontal) {
      inverter = app.rtl ? -1 : 1;
    }

    extend(calendar, {
      app: app,
      $containerEl: $containerEl,
      containerEl: $containerEl && $containerEl[0],
      inline: $containerEl && $containerEl.length > 0,
      $inputEl: $inputEl,
      inputEl: $inputEl && $inputEl[0],
      initialized: false,
      opened: false,
      url: calendar.params.url,
      isHorizontal: isHorizontal,
      inverter: inverter,
      animating: false,
      allowTouchMove: true,
      hasTimePicker: calendar.params.timePicker && !calendar.params.rangePicker && !calendar.params.multiple
    });

    calendar.dayFormatter = function (date) {
      var formatter = new Intl.DateTimeFormat(calendar.params.locale, {
        day: 'numeric'
      });
      return formatter.format(date).replace(/日/, '');
    };

    calendar.monthFormatter = function (date) {
      var formatter = new Intl.DateTimeFormat(calendar.params.locale, {
        month: 'long'
      });
      return formatter.format(date);
    };

    calendar.yearFormatter = function (date) {
      var formatter = new Intl.DateTimeFormat(calendar.params.locale, {
        year: 'numeric'
      });
      return formatter.format(date);
    };

    calendar.timeSelectorFormatter = function (date) {
      var formatter = new Intl.DateTimeFormat(calendar.params.locale, calendar.params.timePickerFormat);
      return formatter.format(date);
    };

    var timeFormatCheckDate = calendar.timeSelectorFormatter(new Date()).toLowerCase();
    calendar.is12HoursFormat = timeFormatCheckDate.indexOf('pm') >= 0 || timeFormatCheckDate.indexOf('am') >= 0; // Auto names

    var _calendar$params = calendar.params,
        monthNames = _calendar$params.monthNames,
        monthNamesShort = _calendar$params.monthNamesShort,
        dayNames = _calendar$params.dayNames,
        dayNamesShort = _calendar$params.dayNamesShort;

    var _calendar$getIntlName = calendar.getIntlNames(),
        monthNamesIntl = _calendar$getIntlName.monthNamesIntl,
        monthNamesShortIntl = _calendar$getIntlName.monthNamesShortIntl,
        dayNamesIntl = _calendar$getIntlName.dayNamesIntl,
        dayNamesShortIntl = _calendar$getIntlName.dayNamesShortIntl;

    if (monthNames === 'auto') monthNames = monthNamesIntl;
    if (monthNamesShort === 'auto') monthNamesShort = monthNamesShortIntl;
    if (dayNames === 'auto') dayNames = dayNamesIntl;
    if (dayNamesShort === 'auto') dayNamesShort = dayNamesShortIntl;
    extend(calendar, {
      monthNames: monthNames,
      monthNamesShort: monthNamesShort,
      dayNames: dayNames,
      dayNamesShort: dayNamesShort
    });

    function onInputClick() {
      calendar.open();
    }

    function onInputFocus(e) {
      e.preventDefault();
    }

    function onInputClear() {
      calendar.setValue([]);

      if (calendar.opened) {
        calendar.update();
      }
    }

    function onHtmlClick(e) {
      var $targetEl = $(e.target);
      if (calendar.destroyed || !calendar.params) return;
      if (calendar.isPopover()) return;
      if (!calendar.opened || calendar.closing) return;
      if ($targetEl.closest('[class*="backdrop"]').length) return;

      if ($inputEl && $inputEl.length > 0) {
        if ($targetEl[0] !== $inputEl[0] && $targetEl.closest('.sheet-modal, .calendar-modal').length === 0) {
          calendar.close();
        }
      } else if ($(e.target).closest('.sheet-modal, .calendar-modal').length === 0) {
        calendar.close();
      }
    } // Events


    extend(calendar, {
      attachInputEvents: function attachInputEvents() {
        calendar.$inputEl.on('click', onInputClick);
        calendar.$inputEl.on('input:clear', onInputClear);

        if (calendar.params.inputReadOnly) {
          calendar.$inputEl.on('focus mousedown', onInputFocus);

          if (calendar.$inputEl[0]) {
            calendar.$inputEl[0].f7ValidateReadonly = true;
          }
        }
      },
      detachInputEvents: function detachInputEvents() {
        calendar.$inputEl.off('click', onInputClick);
        calendar.$inputEl.off('input:clear', onInputClear);

        if (calendar.params.inputReadOnly) {
          calendar.$inputEl.off('focus mousedown', onInputFocus);

          if (calendar.$inputEl[0]) {
            delete calendar.$inputEl[0].f7ValidateReadonly;
          }
        }
      },
      attachHtmlEvents: function attachHtmlEvents() {
        app.on('click', onHtmlClick);
      },
      detachHtmlEvents: function detachHtmlEvents() {
        app.off('click', onHtmlClick);
      }
    });

    calendar.attachCalendarEvents = function attachCalendarEvents() {
      var allowItemClick = true;
      var isTouched;
      var isMoved;
      var touchStartX;
      var touchStartY;
      var touchCurrentX;
      var touchCurrentY;
      var touchStartTime;
      var touchEndTime;
      var currentTranslate;
      var wrapperWidth;
      var wrapperHeight;
      var percentage;
      var touchesDiff;
      var isScrolling;
      var $el = calendar.$el,
          $wrapperEl = calendar.$wrapperEl;

      function handleTouchStart(e) {
        if (isMoved || isTouched) return;
        isTouched = true;
        touchStartX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        touchCurrentX = touchStartX;
        touchStartY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
        touchCurrentY = touchStartY;
        touchStartTime = new Date().getTime();
        percentage = 0;
        allowItemClick = true;
        isScrolling = undefined;
        currentTranslate = calendar.monthsTranslate;
      }

      function handleTouchMove(e) {
        if (!isTouched) return;
        var isH = calendar.isHorizontal;
        touchCurrentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

        if (typeof isScrolling === 'undefined') {
          isScrolling = !!(isScrolling || Math.abs(touchCurrentY - touchStartY) > Math.abs(touchCurrentX - touchStartX));
        }

        if (isH && isScrolling || !calendar.allowTouchMove) {
          isTouched = false;
          return;
        }

        e.preventDefault();

        if (calendar.animating) {
          isTouched = false;
          return;
        }

        allowItemClick = false;

        if (!isMoved) {
          // First move
          isMoved = true;
          wrapperWidth = $wrapperEl[0].offsetWidth;
          wrapperHeight = $wrapperEl[0].offsetHeight;
          $wrapperEl.transition(0);
        }

        touchesDiff = isH ? touchCurrentX - touchStartX : touchCurrentY - touchStartY;
        percentage = touchesDiff / (isH ? wrapperWidth : wrapperHeight);
        currentTranslate = (calendar.monthsTranslate * calendar.inverter + percentage) * 100; // Transform wrapper

        $wrapperEl.transform("translate3d(" + (isH ? currentTranslate : 0) + "%, " + (isH ? 0 : currentTranslate) + "%, 0)");
      }

      function handleTouchEnd() {
        if (!isTouched || !isMoved) {
          isTouched = false;
          isMoved = false;
          return;
        }

        isTouched = false;
        isMoved = false;
        touchEndTime = new Date().getTime();

        if (touchEndTime - touchStartTime < 300) {
          if (Math.abs(touchesDiff) < 10) {
            calendar.resetMonth();
          } else if (touchesDiff >= 10) {
            if (app.rtl) calendar.nextMonth();else calendar.prevMonth();
          } else if (app.rtl) calendar.prevMonth();else calendar.nextMonth();
        } else if (percentage <= -0.5) {
          if (app.rtl) calendar.prevMonth();else calendar.nextMonth();
        } else if (percentage >= 0.5) {
          if (app.rtl) calendar.nextMonth();else calendar.prevMonth();
        } else {
          calendar.resetMonth();
        } // Allow click


        setTimeout(function () {
          allowItemClick = true;
        }, 100);
      }

      function handleDayClick(e) {
        if (!allowItemClick) return;
        var $dayEl = $(e.target).parents('.calendar-day');

        if ($dayEl.length === 0 && $(e.target).hasClass('calendar-day')) {
          $dayEl = $(e.target);
        }

        if ($dayEl.length === 0) return;
        if ($dayEl.hasClass('calendar-day-disabled')) return;

        if (!calendar.params.rangePicker) {
          if ($dayEl.hasClass('calendar-day-next')) calendar.nextMonth();
          if ($dayEl.hasClass('calendar-day-prev')) calendar.prevMonth();
        }

        var dateYear = parseInt($dayEl.attr('data-year'), 10);
        var dateMonth = parseInt($dayEl.attr('data-month'), 10);
        var dateDay = parseInt($dayEl.attr('data-day'), 10);
        calendar.emit('local::dayClick calendarDayClick', calendar, $dayEl[0], dateYear, dateMonth, dateDay);

        if (!$dayEl.hasClass('calendar-day-selected') || calendar.params.multiple || calendar.params.rangePicker) {
          var valueToAdd = new Date(dateYear, dateMonth, dateDay, 0, 0, 0);

          if (calendar.hasTimePicker) {
            if (calendar.value && calendar.value[0]) {
              valueToAdd.setHours(calendar.value[0].getHours(), calendar.value[0].getMinutes());
            } else {
              valueToAdd.setHours(new Date().getHours(), new Date().getMinutes());
            }
          }

          calendar.addValue(valueToAdd);
        }

        if (calendar.params.closeOnSelect) {
          if (calendar.params.rangePicker && calendar.value.length === 2 || !calendar.params.rangePicker) {
            calendar.close();
          }
        }
      }

      function onNextMonthClick() {
        calendar.nextMonth();
      }

      function onPrevMonthClick() {
        calendar.prevMonth();
      }

      function onNextYearClick() {
        calendar.nextYear();
      }

      function onPrevYearClick() {
        calendar.prevYear();
      }

      function onMonthSelectorClick() {
        $el.append(calendar.renderMonthPicker());
      }

      function onMonthSelectorItemClick() {
        var $clickedEl = $(this);

        if ($clickedEl.hasClass('calendar-month-picker-item-current')) {
          $el.find('.calendar-month-picker').remove();
          return;
        }

        $el.find('.calendar-month-picker-item-current').add($clickedEl).toggleClass('calendar-month-picker-item-current');
        var index = $clickedEl.index();
        var localeMonthIndex = parseInt(calendar.$el.find('.calendar-month-current').attr('data-locale-month'), 10);
        var monthIndex = calendar.currentMonth;
        var diff = localeMonthIndex - monthIndex;
        var diffIndex = index - diff;
        calendar.setYearMonth(calendar.currentYear, diffIndex, 0);
        setTimeout(function () {
          $el.find('.calendar-month-picker').remove();
        }, 200);
      }

      function onYearSelectorClick() {
        $el.append(calendar.renderYearPicker());
        var $currentEl = $el.find('.calendar-year-picker-item-current');
        var $yearPickerEl = $el.find('.calendar-year-picker');
        if (!$currentEl || !$currentEl.length) return;
        $yearPickerEl.scrollTop($currentEl[0].offsetTop - $yearPickerEl[0].offsetHeight / 2 + $currentEl[0].offsetHeight / 2);
      }

      function onYearSelectorItemClick() {
        var $clickedEl = $(this);

        if ($clickedEl.hasClass('calendar-year-picker-item-current')) {
          $el.find('.calendar-year-picker').remove();
          return;
        }

        $el.find('.calendar-year-picker-item-current').add($clickedEl).toggleClass('calendar-year-picker-item-current');
        var year = parseInt($clickedEl.attr('data-year'), 10);
        calendar.setYearMonth(year, undefined, 0);
        setTimeout(function () {
          $el.find('.calendar-year-picker').remove();
        }, 200);
      }

      function onTimeSelectorClick() {
        calendar.openTimePicker();
      }

      function onTimePickerCloseClick() {
        calendar.closeTimePicker();
      }

      var passiveListener = app.touchEvents.start === 'touchstart' && getSupport().passiveListener ? {
        passive: true,
        capture: false
      } : false; // Selectors clicks

      $el.find('.calendar-prev-month-button').on('click', onPrevMonthClick);
      $el.find('.calendar-next-month-button').on('click', onNextMonthClick);
      $el.find('.calendar-prev-year-button').on('click', onPrevYearClick);
      $el.find('.calendar-next-year-button').on('click', onNextYearClick);

      if (calendar.params.monthPicker) {
        $el.find('.current-month-value').on('click', onMonthSelectorClick);
        $el.on('click', '.calendar-month-picker-item', onMonthSelectorItemClick);
      }

      if (calendar.params.yearPicker) {
        $el.find('.current-year-value').on('click', onYearSelectorClick);
        $el.on('click', '.calendar-year-picker-item', onYearSelectorItemClick);
      }

      if (calendar.hasTimePicker) {
        $el.find('.calendar-time-selector a').on('click', onTimeSelectorClick);
        $el.on('click', '.calendar-time-picker-close', onTimePickerCloseClick);
      } // Day clicks


      $wrapperEl.on('click', handleDayClick); // Touch events

      if (calendar.params.touchMove) {
        $wrapperEl.on(app.touchEvents.start, handleTouchStart, passiveListener);
        app.on('touchmove:active', handleTouchMove);
        app.on('touchend:passive', handleTouchEnd);
      }

      calendar.detachCalendarEvents = function detachCalendarEvents() {
        $el.find('.calendar-prev-month-button').off('click', onPrevMonthClick);
        $el.find('.calendar-next-month-button').off('click', onNextMonthClick);
        $el.find('.calendar-prev-year-button').off('click', onPrevYearClick);
        $el.find('.calendar-next-year-button').off('click', onNextYearClick);

        if (calendar.params.monthPicker) {
          $el.find('.current-month-value').off('click', onMonthSelectorClick);
          $el.off('click', '.calendar-month-picker-item', onMonthSelectorItemClick);
        }

        if (calendar.params.yearPicker) {
          $el.find('.current-year-value').off('click', onYearSelectorClick);
          $el.off('click', '.calendar-year-picker-item', onYearSelectorItemClick);
        }

        if (calendar.hasTimePicker) {
          $el.find('.calendar-time-selector a').off('click', onTimeSelectorClick);
          $el.off('click', '.calendar-time-picker-close', onTimePickerCloseClick);
        }

        $wrapperEl.off('click', handleDayClick);

        if (calendar.params.touchMove) {
          $wrapperEl.off(app.touchEvents.start, handleTouchStart, passiveListener);
          app.off('touchmove:active', handleTouchMove);
          app.off('touchend:passive', handleTouchEnd);
        }
      };
    };

    calendar.init();
    return calendar || _assertThisInitialized(_this);
  }

  var _proto = Calendar.prototype;

  _proto.getIntlNames = function getIntlNames() {
    var calendar = this;
    var locale = calendar.params.locale;
    var monthNamesIntl = [];
    var monthNamesShortIntl = [];
    var dayNamesIntl = [];
    var dayNamesShortIntl = [];
    var formatterMonthNames = new Intl.DateTimeFormat(locale, {
      month: 'long'
    });
    var formatterMonthNamesShort = new Intl.DateTimeFormat(locale, {
      month: 'short'
    });
    var formatterDayNames = new Intl.DateTimeFormat(locale, {
      weekday: 'long'
    });
    var formatterDayNamesShort = new Intl.DateTimeFormat(locale, {
      weekday: 'short'
    });
    var year;
    var yearStarted;
    var yearEnded;

    for (var i = 0; i < 24; i += 1) {
      var date = new Date().setMonth(i, 1);
      var currentYear = calendar.yearFormatter(date);

      if (year && currentYear !== year) {
        if (yearStarted) yearEnded = true;
        yearStarted = true;
        year = currentYear;
      }

      if (!year) {
        year = currentYear;
      }

      if (yearStarted && year === currentYear && !yearEnded) {
        monthNamesIntl.push(formatterMonthNames.format(date));
        monthNamesShortIntl.push(formatterMonthNamesShort.format(date));
      }
    }

    var weekDay = new Date().getDay();

    for (var _i = 0; _i < 7; _i += 1) {
      var _date = new Date().getTime() + (_i - weekDay) * 24 * 60 * 60 * 1000;

      dayNamesIntl.push(formatterDayNames.format(_date));
      dayNamesShortIntl.push(formatterDayNamesShort.format(_date));
    }

    return {
      monthNamesIntl: monthNamesIntl,
      monthNamesShortIntl: monthNamesShortIntl,
      dayNamesIntl: dayNamesIntl,
      dayNamesShortIntl: dayNamesShortIntl
    };
  };

  _proto.normalizeDate = function normalizeDate(date) {
    var calendar = this;
    var d = new Date(date);

    if (calendar.hasTimePicker) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
    }

    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  _proto.normalizeValues = function normalizeValues(values) {
    var calendar = this;
    var newValues = [];

    if (values && Array.isArray(values)) {
      newValues = values.map(function (val) {
        return calendar.normalizeDate(val);
      });
    }

    return newValues;
  };

  _proto.initInput = function initInput() {
    var calendar = this;
    if (!calendar.$inputEl) return;
    if (calendar.params.inputReadOnly) calendar.$inputEl.prop('readOnly', true);
  };

  _proto.isPopover = function isPopover() {
    var calendar = this;
    var app = calendar.app,
        modal = calendar.modal,
        params = calendar.params;
    var device = getDevice();
    if (params.openIn === 'sheet') return false;
    if (modal && modal.type !== 'popover') return false;

    if (!calendar.inline && calendar.inputEl) {
      if (params.openIn === 'popover') return true;

      if (device.ios) {
        return !!device.ipad;
      }

      if (app.width >= 768) {
        return true;
      }

      if (device.desktop && app.theme === 'aurora') {
        return true;
      }
    }

    return false;
  };

  _proto.formatDate = function formatDate(d) {
    var calendar = this;
    var date = new Date(d);
    var year = date.getFullYear();
    var month = date.getMonth();
    var month1 = month + 1;
    var day = date.getDate();
    var weekDay = date.getDay();
    var monthNames = calendar.monthNames,
        monthNamesShort = calendar.monthNamesShort,
        dayNames = calendar.dayNames,
        dayNamesShort = calendar.dayNamesShort;
    var _calendar$params2 = calendar.params,
        dateFormat = _calendar$params2.dateFormat,
        locale = _calendar$params2.locale;

    function twoDigits(number) {
      return number < 10 ? "0" + number : number;
    }

    if (typeof dateFormat === 'string') {
      var tokens = {
        yyyy: year,
        yy: String(year).substring(2),
        mm: twoDigits(month1),
        m: month1,
        MM: monthNames[month],
        M: monthNamesShort[month],
        dd: twoDigits(day),
        d: day,
        DD: dayNames[weekDay],
        D: dayNamesShort[weekDay]
      };

      if (calendar.params.timePicker) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var hours12 = hours;
        if (hours > 12) hours12 = hours - 12;
        if (hours === 0) hours12 = 12;
        var a = hours >= 12 && hours !== 0 ? 'pm' : 'am';
        Object.assign(tokens, {
          HH: twoDigits(hours),
          H: hours,
          hh: twoDigits(hours12),
          h: hours12,
          ss: twoDigits(seconds),
          s: seconds,
          ':mm': twoDigits(minutes),
          ':m': minutes,
          a: a,
          A: a.toUpperCase()
        });
      }

      var regexp = new RegExp(Object.keys(tokens).map(function (t) {
        return "(" + t + ")";
      }).join('|'), 'g');
      return dateFormat.replace(regexp, function (token) {
        if (token in tokens) return tokens[token];
        return token;
      });
    }

    if (typeof dateFormat === 'function') {
      return dateFormat(date);
    } // Intl Object


    var formatter = new Intl.DateTimeFormat(locale, dateFormat);
    return formatter.format(date);
  };

  _proto.formatValue = function formatValue() {
    var calendar = this;
    var value = calendar.value;

    if (calendar.params.formatValue) {
      return calendar.params.formatValue.call(calendar, value);
    }

    return value.map(function (v) {
      return calendar.formatDate(v);
    }).join(calendar.params.rangePicker ? ' - ' : ', ');
  };

  _proto.addValue = function addValue(newValue) {
    var calendar = this;
    var _calendar$params3 = calendar.params,
        multiple = _calendar$params3.multiple,
        rangePicker = _calendar$params3.rangePicker,
        rangePickerMinDays = _calendar$params3.rangePickerMinDays,
        rangePickerMaxDays = _calendar$params3.rangePickerMaxDays;

    if (multiple) {
      if (!calendar.value) calendar.value = [];
      var inValuesIndex;

      for (var i = 0; i < calendar.value.length; i += 1) {
        if (new Date(newValue).getTime() === new Date(calendar.value[i]).getTime()) {
          inValuesIndex = i;
        }
      }

      if (typeof inValuesIndex === 'undefined') {
        calendar.value.push(newValue);
      } else {
        calendar.value.splice(inValuesIndex, 1);
      }

      calendar.updateValue();
    } else if (rangePicker) {
      if (!calendar.value) calendar.value = [];

      if (calendar.value.length === 2 || calendar.value.length === 0) {
        calendar.value = [];
      }

      if (calendar.value.length === 0 || Math.abs(calendar.value[0].getTime() - newValue.getTime()) >= (rangePickerMinDays - 1) * 60 * 60 * 24 * 1000 && (rangePickerMaxDays === 0 || Math.abs(calendar.value[0].getTime() - newValue.getTime()) <= (rangePickerMaxDays - 1) * 60 * 60 * 24 * 1000)) calendar.value.push(newValue);else calendar.value = [];
      calendar.value.sort(function (a, b) {
        return a - b;
      });
      calendar.updateValue();
    } else {
      calendar.value = [newValue];
      calendar.updateValue();
    }
  };

  _proto.setValue = function setValue(values) {
    var calendar = this;
    var currentValue = calendar.value;

    if (Array.isArray(currentValue) && Array.isArray(values) && currentValue.length === values.length) {
      var equal = true;
      currentValue.forEach(function (v, index) {
        if (v !== values[index]) equal = false;
      });
      if (equal) return;
    }

    calendar.value = values;
    calendar.updateValue();
  };

  _proto.getValue = function getValue() {
    var calendar = this;
    return calendar.value;
  };

  _proto.updateValue = function updateValue(onlyHeader) {
    var calendar = this;
    var $el = calendar.$el,
        $wrapperEl = calendar.$wrapperEl,
        $inputEl = calendar.$inputEl,
        value = calendar.value,
        params = calendar.params;
    var i;

    if ($el && $el.length > 0) {
      $wrapperEl.find('.calendar-day-selected').removeClass('calendar-day-selected calendar-day-selected-range calendar-day-selected-left calendar-day-selected-right');
      var valueDate;

      if (params.rangePicker && value.length === 2) {
        var leftDate = new Date(value[0]).getTime();
        var rightDate = new Date(value[1]).getTime();

        for (i = leftDate; i <= rightDate; i += 24 * 60 * 60 * 1000) {
          valueDate = new Date(i);
          var addClass = 'calendar-day-selected';

          if (leftDate !== rightDate) {
            if (i !== leftDate && i !== rightDate) {
              addClass += ' calendar-day-selected-range';
            }

            if (i === leftDate) {
              addClass += ' calendar-day-selected-left';
            }

            if (i === rightDate) {
              addClass += ' calendar-day-selected-right';
            }
          }

          $wrapperEl.find(".calendar-day[data-date=\"" + valueDate.getFullYear() + "-" + valueDate.getMonth() + "-" + valueDate.getDate() + "\"]").addClass(addClass);
        }

        valueDate = new Date(leftDate);
        $wrapperEl.find(".calendar-day[data-date=\"" + valueDate.getFullYear() + "-" + valueDate.getMonth() + "-" + valueDate.getDate() + "\"]").removeClass('calendar-day-selected-range').addClass('calendar-day-selected calendar-day-selected-left');
        valueDate = new Date(rightDate);
        $wrapperEl.find(".calendar-day[data-date=\"" + valueDate.getFullYear() + "-" + valueDate.getMonth() + "-" + valueDate.getDate() + "\"]").removeClass('calendar-day-selected-range').addClass('calendar-day-selected calendar-day-selected-right');
      } else {
        for (i = 0; i < calendar.value.length; i += 1) {
          valueDate = new Date(value[i]);
          $wrapperEl.find(".calendar-day[data-date=\"" + valueDate.getFullYear() + "-" + valueDate.getMonth() + "-" + valueDate.getDate() + "\"]").addClass('calendar-day-selected');
        }
      }
    }

    if (!onlyHeader) {
      calendar.emit('local::change calendarChange', calendar, value);
    }

    if ($el && $el.length > 0 && calendar.hasTimePicker) {
      $el.find('.calendar-time-selector a').text(value && value.length ? calendar.timeSelectorFormatter(value[0]) : calendar.params.timePickerPlaceholder);
    }

    if ($inputEl && $inputEl.length || params.header) {
      var inputValue = calendar.formatValue(value);

      if (params.header && $el && $el.length) {
        $el.find('.calendar-selected-date').text(inputValue);
      }

      if ($inputEl && $inputEl.length && !onlyHeader) {
        $inputEl.val(inputValue);
        $inputEl.trigger('change');
      }
    }
  };

  _proto.updateCurrentMonthYear = function updateCurrentMonthYear(dir) {
    var calendar = this;
    var $months = calendar.$months,
        $el = calendar.$el,
        monthNames = calendar.monthNames;
    var currentLocaleMonth;
    var currentLocaleYear;

    if (typeof dir === 'undefined') {
      calendar.currentMonth = parseInt($months.eq(1).attr('data-month'), 10);
      calendar.currentYear = parseInt($months.eq(1).attr('data-year'), 10);
      currentLocaleMonth = $months.eq(1).attr('data-locale-month');
      currentLocaleYear = $months.eq(1).attr('data-locale-year');
    } else {
      calendar.currentMonth = parseInt($months.eq(dir === 'next' ? $months.length - 1 : 0).attr('data-month'), 10);
      calendar.currentYear = parseInt($months.eq(dir === 'next' ? $months.length - 1 : 0).attr('data-year'), 10);
      currentLocaleMonth = $months.eq(dir === 'next' ? $months.length - 1 : 0).attr('data-locale-month');
      currentLocaleYear = $months.eq(dir === 'next' ? $months.length - 1 : 0).attr('data-locale-year');
    }

    $el.find('.current-month-value').text(monthNames[currentLocaleMonth]);
    $el.find('.current-year-value').text(currentLocaleYear);
  };

  _proto.update = function update() {
    var calendar = this;
    var currentYear = calendar.currentYear,
        currentMonth = calendar.currentMonth,
        $wrapperEl = calendar.$wrapperEl;
    var currentDate = new Date(currentYear, currentMonth);
    var prevMonthHtml = calendar.renderMonth(currentDate, 'prev');
    var currentMonthHtml = calendar.renderMonth(currentDate);
    var nextMonthHtml = calendar.renderMonth(currentDate, 'next');
    $wrapperEl.transition(0).html("" + prevMonthHtml + currentMonthHtml + nextMonthHtml).transform('translate3d(0,0,0)');
    calendar.$months = $wrapperEl.find('.calendar-month');
    calendar.monthsTranslate = 0;
    calendar.setMonthsTranslate();
    calendar.$months.each(function (monthEl) {
      calendar.emit('local::monthAdd calendarMonthAdd', monthEl);
    });
  };

  _proto.onMonthChangeStart = function onMonthChangeStart(dir) {
    var calendar = this;
    var $months = calendar.$months,
        currentYear = calendar.currentYear,
        currentMonth = calendar.currentMonth;
    calendar.updateCurrentMonthYear(dir);
    $months.removeClass('calendar-month-current calendar-month-prev calendar-month-next');
    var currentIndex = dir === 'next' ? $months.length - 1 : 0;
    $months.eq(currentIndex).addClass('calendar-month-current');
    $months.eq(dir === 'next' ? currentIndex - 1 : currentIndex + 1).addClass(dir === 'next' ? 'calendar-month-prev' : 'calendar-month-next');
    calendar.emit('local::monthYearChangeStart calendarMonthYearChangeStart', calendar, currentYear, currentMonth);
  };

  _proto.onMonthChangeEnd = function onMonthChangeEnd(dir, rebuildBoth) {
    var calendar = this;
    var currentYear = calendar.currentYear,
        currentMonth = calendar.currentMonth,
        $wrapperEl = calendar.$wrapperEl,
        monthsTranslate = calendar.monthsTranslate;
    calendar.animating = false;
    var nextMonthHtml;
    var prevMonthHtml;
    var currentMonthHtml;
    $wrapperEl.find('.calendar-month:not(.calendar-month-prev):not(.calendar-month-current):not(.calendar-month-next)').remove();

    if (typeof dir === 'undefined') {
      dir = 'next'; // eslint-disable-line

      rebuildBoth = true; // eslint-disable-line
    }

    if (!rebuildBoth) {
      currentMonthHtml = calendar.renderMonth(new Date(currentYear, currentMonth), dir);
    } else {
      $wrapperEl.find('.calendar-month-next, .calendar-month-prev').remove();
      prevMonthHtml = calendar.renderMonth(new Date(currentYear, currentMonth), 'prev');
      nextMonthHtml = calendar.renderMonth(new Date(currentYear, currentMonth), 'next');
    }

    if (dir === 'next' || rebuildBoth) {
      $wrapperEl.append(currentMonthHtml || nextMonthHtml);
    }

    if (dir === 'prev' || rebuildBoth) {
      $wrapperEl.prepend(currentMonthHtml || prevMonthHtml);
    }

    var $months = $wrapperEl.find('.calendar-month');
    calendar.$months = $months;
    calendar.setMonthsTranslate(monthsTranslate);
    calendar.emit('local::monthAdd calendarMonthAdd', calendar, dir === 'next' ? $months.eq($months.length - 1)[0] : $months.eq(0)[0]);
    calendar.emit('local::monthYearChangeEnd calendarMonthYearChangeEnd', calendar, currentYear, currentMonth);
  };

  _proto.setMonthsTranslate = function setMonthsTranslate(translate) {
    var calendar = this;
    var $months = calendar.$months,
        isH = calendar.isHorizontal,
        inverter = calendar.inverter; // eslint-disable-next-line

    translate = translate || calendar.monthsTranslate || 0;

    if (typeof calendar.monthsTranslate === 'undefined') {
      calendar.monthsTranslate = translate;
    }

    $months.removeClass('calendar-month-current calendar-month-prev calendar-month-next');
    var prevMonthTranslate = -(translate + 1) * 100 * inverter;
    var currentMonthTranslate = -translate * 100 * inverter;
    var nextMonthTranslate = -(translate - 1) * 100 * inverter;
    $months.eq(0).transform("translate3d(" + (isH ? prevMonthTranslate : 0) + "%, " + (isH ? 0 : prevMonthTranslate) + "%, 0)").addClass('calendar-month-prev');
    $months.eq(1).transform("translate3d(" + (isH ? currentMonthTranslate : 0) + "%, " + (isH ? 0 : currentMonthTranslate) + "%, 0)").addClass('calendar-month-current');
    $months.eq(2).transform("translate3d(" + (isH ? nextMonthTranslate : 0) + "%, " + (isH ? 0 : nextMonthTranslate) + "%, 0)").addClass('calendar-month-next');
  };

  _proto.nextMonth = function nextMonth(transition) {
    var calendar = this;
    var params = calendar.params,
        $wrapperEl = calendar.$wrapperEl,
        inverter = calendar.inverter,
        isH = calendar.isHorizontal;

    if (typeof transition === 'undefined' || typeof transition === 'object') {
      transition = ''; // eslint-disable-line

      if (!params.animate) transition = 0; // eslint-disable-line
    }

    var nextMonth = parseInt(calendar.$months.eq(calendar.$months.length - 1).attr('data-month'), 10);
    var nextYear = parseInt(calendar.$months.eq(calendar.$months.length - 1).attr('data-year'), 10);
    var nextDate = new Date(nextYear, nextMonth);
    var nextDateTime = nextDate.getTime();
    var transitionEndCallback = !calendar.animating;

    if (params.maxDate) {
      if (nextDateTime > new Date(params.maxDate).getTime()) {
        calendar.resetMonth();
        return;
      }
    }

    calendar.monthsTranslate -= 1;

    if (nextMonth === calendar.currentMonth) {
      var nextMonthTranslate = -calendar.monthsTranslate * 100 * inverter;
      var nextMonthHtml = $(calendar.renderMonth(nextDateTime, 'next')).transform("translate3d(" + (isH ? nextMonthTranslate : 0) + "%, " + (isH ? 0 : nextMonthTranslate) + "%, 0)").addClass('calendar-month-next');
      $wrapperEl.append(nextMonthHtml[0]);
      calendar.$months = $wrapperEl.find('.calendar-month');
      calendar.emit('local::monthAdd calendarMonthAdd', calendar.$months.eq(calendar.$months.length - 1)[0]);
    }

    calendar.animating = true;
    calendar.onMonthChangeStart('next');
    var translate = calendar.monthsTranslate * 100 * inverter;
    $wrapperEl.transition(transition).transform("translate3d(" + (isH ? translate : 0) + "%, " + (isH ? 0 : translate) + "%, 0)");

    if (transitionEndCallback) {
      $wrapperEl.transitionEnd(function () {
        calendar.onMonthChangeEnd('next');
      });
    }

    if (!params.animate) {
      calendar.onMonthChangeEnd('next');
    }
  };

  _proto.prevMonth = function prevMonth(transition) {
    var calendar = this;
    var params = calendar.params,
        $wrapperEl = calendar.$wrapperEl,
        inverter = calendar.inverter,
        isH = calendar.isHorizontal;

    if (typeof transition === 'undefined' || typeof transition === 'object') {
      transition = ''; // eslint-disable-line

      if (!params.animate) transition = 0; // eslint-disable-line
    }

    var prevMonth = parseInt(calendar.$months.eq(0).attr('data-month'), 10);
    var prevYear = parseInt(calendar.$months.eq(0).attr('data-year'), 10);
    var prevDate = new Date(prevYear, prevMonth + 1, -1);
    var prevDateTime = prevDate.getTime();
    var transitionEndCallback = !calendar.animating;

    if (params.minDate) {
      var minDate = new Date(params.minDate);
      minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

      if (prevDateTime < minDate.getTime()) {
        calendar.resetMonth();
        return;
      }
    }

    calendar.monthsTranslate += 1;

    if (prevMonth === calendar.currentMonth) {
      var prevMonthTranslate = -calendar.monthsTranslate * 100 * inverter;
      var prevMonthHtml = $(calendar.renderMonth(prevDateTime, 'prev')).transform("translate3d(" + (isH ? prevMonthTranslate : 0) + "%, " + (isH ? 0 : prevMonthTranslate) + "%, 0)").addClass('calendar-month-prev');
      $wrapperEl.prepend(prevMonthHtml[0]);
      calendar.$months = $wrapperEl.find('.calendar-month');
      calendar.emit('local::monthAdd calendarMonthAdd', calendar.$months.eq(0)[0]);
    }

    calendar.animating = true;
    calendar.onMonthChangeStart('prev');
    var translate = calendar.monthsTranslate * 100 * inverter;
    $wrapperEl.transition(transition).transform("translate3d(" + (isH ? translate : 0) + "%, " + (isH ? 0 : translate) + "%, 0)");

    if (transitionEndCallback) {
      $wrapperEl.transitionEnd(function () {
        calendar.onMonthChangeEnd('prev');
      });
    }

    if (!params.animate) {
      calendar.onMonthChangeEnd('prev');
    }
  };

  _proto.resetMonth = function resetMonth(transition) {
    if (transition === void 0) {
      transition = '';
    }

    var calendar = this;
    var $wrapperEl = calendar.$wrapperEl,
        inverter = calendar.inverter,
        isH = calendar.isHorizontal,
        monthsTranslate = calendar.monthsTranslate;
    var translate = monthsTranslate * 100 * inverter;
    $wrapperEl.transition(transition).transform("translate3d(" + (isH ? translate : 0) + "%, " + (isH ? 0 : translate) + "%, 0)");
  } // eslint-disable-next-line
  ;

  _proto.setYearMonth = function setYearMonth(year, month, transition) {
    var calendar = this;
    var params = calendar.params,
        isH = calendar.isHorizontal,
        $wrapperEl = calendar.$wrapperEl,
        inverter = calendar.inverter; // eslint-disable-next-line

    if (typeof year === 'undefined') year = calendar.currentYear; // eslint-disable-next-line

    if (typeof month === 'undefined') month = calendar.currentMonth;

    if (typeof transition === 'undefined' || typeof transition === 'object') {
      // eslint-disable-next-line
      transition = ''; // eslint-disable-next-line

      if (!params.animate) transition = 0;
    }

    var targetDate;

    if (year < calendar.currentYear) {
      targetDate = new Date(year, month + 1, -1).getTime();
    } else {
      targetDate = new Date(year, month).getTime();
    }

    if (params.maxDate && targetDate > new Date(params.maxDate).getTime()) {
      return false;
    }

    if (params.minDate) {
      var minDate = new Date(params.minDate);
      minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

      if (targetDate < minDate.getTime()) {
        return false;
      }
    }

    var currentDate = new Date(calendar.currentYear, calendar.currentMonth).getTime();
    var dir = targetDate > currentDate ? 'next' : 'prev';
    var newMonthHTML = calendar.renderMonth(new Date(year, month));
    calendar.monthsTranslate = calendar.monthsTranslate || 0;
    var prevTranslate = calendar.monthsTranslate;
    var monthTranslate;
    var transitionEndCallback = !calendar.animating && transition !== 0;

    if (targetDate > currentDate) {
      // To next
      calendar.monthsTranslate -= 1;
      if (!calendar.animating) calendar.$months.eq(calendar.$months.length - 1).remove();
      $wrapperEl.append(newMonthHTML);
      calendar.$months = $wrapperEl.find('.calendar-month');
      monthTranslate = -(prevTranslate - 1) * 100 * inverter;
      calendar.$months.eq(calendar.$months.length - 1).transform("translate3d(" + (isH ? monthTranslate : 0) + "%, " + (isH ? 0 : monthTranslate) + "%, 0)").addClass('calendar-month-next');
    } else {
      // To prev
      calendar.monthsTranslate += 1;
      if (!calendar.animating) calendar.$months.eq(0).remove();
      $wrapperEl.prepend(newMonthHTML);
      calendar.$months = $wrapperEl.find('.calendar-month');
      monthTranslate = -(prevTranslate + 1) * 100 * inverter;
      calendar.$months.eq(0).transform("translate3d(" + (isH ? monthTranslate : 0) + "%, " + (isH ? 0 : monthTranslate) + "%, 0)").addClass('calendar-month-prev');
    }

    calendar.emit('local::monthAdd calendarMonthAdd', dir === 'next' ? calendar.$months.eq(calendar.$months.length - 1)[0] : calendar.$months.eq(0)[0]);
    calendar.animating = true;
    calendar.onMonthChangeStart(dir);
    var wrapperTranslate = calendar.monthsTranslate * 100 * inverter;
    $wrapperEl.transition(transition).transform("translate3d(" + (isH ? wrapperTranslate : 0) + "%, " + (isH ? 0 : wrapperTranslate) + "%, 0)");

    if (transitionEndCallback) {
      $wrapperEl.transitionEnd(function () {
        calendar.onMonthChangeEnd(dir, true);
      });
    }

    if (!params.animate || transition === 0) {
      calendar.onMonthChangeEnd(dir, true);
    }
  };

  _proto.nextYear = function nextYear() {
    var calendar = this;
    calendar.setYearMonth(calendar.currentYear + 1);
  };

  _proto.prevYear = function prevYear() {
    var calendar = this;
    calendar.setYearMonth(calendar.currentYear - 1);
  } // eslint-disable-next-line
  ;

  _proto.dateInRange = function dateInRange(dayDate, range) {
    var match = false;
    var i;
    if (!range) return false;

    if (Array.isArray(range)) {
      for (i = 0; i < range.length; i += 1) {
        if (range[i].from || range[i].to) {
          if (range[i].from && range[i].to) {
            if (dayDate <= new Date(range[i].to).getTime() && dayDate >= new Date(range[i].from).getTime()) {
              match = true;
            }
          } else if (range[i].from) {
            if (dayDate >= new Date(range[i].from).getTime()) {
              match = true;
            }
          } else if (range[i].to) {
            if (dayDate <= new Date(range[i].to).getTime()) {
              match = true;
            }
          }
        } else if (range[i].date) {
          if (dayDate === new Date(range[i].date).getTime()) {
            match = true;
          }
        } else if (dayDate === new Date(range[i]).getTime()) {
          match = true;
        }
      }
    } else if (range.from || range.to) {
      if (range.from && range.to) {
        if (dayDate <= new Date(range.to).getTime() && dayDate >= new Date(range.from).getTime()) {
          match = true;
        }
      } else if (range.from) {
        if (dayDate >= new Date(range.from).getTime()) {
          match = true;
        }
      } else if (range.to) {
        if (dayDate <= new Date(range.to).getTime()) {
          match = true;
        }
      }
    } else if (range.date) {
      match = dayDate === new Date(range.date).getTime();
    } else if (typeof range === 'function') {
      match = range(new Date(dayDate));
    }

    return match;
  } // eslint-disable-next-line
  ;

  _proto.daysInMonth = function daysInMonth(date) {
    var d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  };

  _proto.renderMonths = function renderMonths(date) {
    var calendar = this;

    if (calendar.params.renderMonths) {
      return calendar.params.renderMonths.call(calendar, date);
    }

    return $jsx("div", {
      class: "calendar-months-wrapper"
    }, calendar.renderMonth(date, 'prev'), calendar.renderMonth(date), calendar.renderMonth(date, 'next'));
  };

  _proto.renderMonth = function renderMonth(d, offset) {
    var calendar = this;
    var params = calendar.params,
        value = calendar.value;

    if (params.renderMonth) {
      return params.renderMonth.call(calendar, d, offset);
    }

    var date = new Date(d);
    var year = date.getFullYear();
    var month = date.getMonth();
    var localeMonth = calendar.monthNames.indexOf(calendar.monthFormatter(date));
    if (localeMonth < 0) localeMonth = month;
    var localeYear = calendar.yearFormatter(date);

    if (offset === 'next') {
      if (month === 11) date = new Date(year + 1, 0);else date = new Date(year, month + 1, 1);
    }

    if (offset === 'prev') {
      if (month === 0) date = new Date(year - 1, 11);else date = new Date(year, month - 1, 1);
    }

    if (offset === 'next' || offset === 'prev') {
      month = date.getMonth();
      year = date.getFullYear();
      localeMonth = calendar.monthNames.indexOf(calendar.monthFormatter(date));
      if (localeMonth < 0) localeMonth = month;
      localeYear = calendar.yearFormatter(date);
    }

    var currentValues = [];
    var today = new Date().setHours(0, 0, 0, 0);
    var minDate = params.minDate ? new Date(params.minDate).getTime() : null;
    var maxDate = params.maxDate ? new Date(params.maxDate).getTime() : null;
    var rows = 6;
    var cols = 7;
    var daysInPrevMonth = calendar.daysInMonth(new Date(date.getFullYear(), date.getMonth()).getTime() - 10 * 24 * 60 * 60 * 1000);
    var daysInMonth = calendar.daysInMonth(date);
    var minDayNumber = params.firstDay === 6 ? 0 : 1;
    var monthHtml = '';
    var dayIndex = 0 + (params.firstDay - 1);
    var disabled;
    var hasEvents;
    var firstDayOfMonthIndex = new Date(date.getFullYear(), date.getMonth()).getDay();
    if (firstDayOfMonthIndex === 0) firstDayOfMonthIndex = 7;

    if (value && value.length) {
      for (var i = 0; i < value.length; i += 1) {
        currentValues.push(new Date(value[i]).setHours(0, 0, 0, 0));
      }
    }

    for (var row = 1; row <= rows; row += 1) {
      var rowHtml = '';

      var _loop = function _loop(col) {
        dayIndex += 1;
        var dayDate = void 0;
        var dayNumber = dayIndex - firstDayOfMonthIndex;
        var addClass = '';

        if (row === 1 && col === 1 && dayNumber > minDayNumber && params.firstDay !== 1) {
          dayIndex -= 7;
          dayNumber = dayIndex - firstDayOfMonthIndex;
        }

        var weekDayIndex = col - 1 + params.firstDay > 6 ? col - 1 - 7 + params.firstDay : col - 1 + params.firstDay;

        if (dayNumber < 0) {
          dayNumber = daysInPrevMonth + dayNumber + 1;
          addClass += ' calendar-day-prev';
          dayDate = new Date(month - 1 < 0 ? year - 1 : year, month - 1 < 0 ? 11 : month - 1, dayNumber).getTime();
        } else {
          dayNumber += 1;

          if (dayNumber > daysInMonth) {
            dayNumber -= daysInMonth;
            addClass += ' calendar-day-next';
            dayDate = new Date(month + 1 > 11 ? year + 1 : year, month + 1 > 11 ? 0 : month + 1, dayNumber).getTime();
          } else {
            dayDate = new Date(year, month, dayNumber).getTime();
          }
        } // Today


        if (dayDate === today) addClass += ' calendar-day-today'; // Selected

        if (params.rangePicker && currentValues.length === 2) {
          if (dayDate >= currentValues[0] && dayDate <= currentValues[1]) {
            addClass += ' calendar-day-selected';
          }

          if (currentValues[0] !== currentValues[1]) {
            if (dayDate > currentValues[0] && dayDate < currentValues[1]) {
              addClass += ' calendar-day-selected-range';
            }

            if (dayDate === currentValues[0]) {
              addClass += ' calendar-day-selected-left';
            }

            if (dayDate === currentValues[1]) {
              addClass += ' calendar-day-selected-right';
            }
          }
        } else if (currentValues.indexOf(dayDate) >= 0) addClass += ' calendar-day-selected'; // Weekend


        if (params.weekendDays.indexOf(weekDayIndex) >= 0) {
          addClass += ' calendar-day-weekend';
        } // Events


        var eventsHtml = '';
        hasEvents = false;

        if (params.events) {
          if (calendar.dateInRange(dayDate, params.events)) {
            hasEvents = true;
          }
        }

        if (hasEvents) {
          addClass += ' calendar-day-has-events'; // prettier-ignore

          eventsHtml = "\n            <span class=\"calendar-day-events\">\n              <span class=\"calendar-day-event\"></span>\n            </span>\n          ";

          if (Array.isArray(params.events)) {
            var eventDots = [];
            params.events.forEach(function (ev) {
              var color = ev.color || '';

              if (eventDots.indexOf(color) < 0 && calendar.dateInRange(dayDate, ev)) {
                eventDots.push(color);
              }
            }); // prettier-ignore

            eventsHtml = "\n              <span class=\"calendar-day-events\">\n                " + eventDots.map(function (color) {
              return ("\n                  <span class=\"calendar-day-event\" style=\"" + (color ? "background-color: " + color : '') + "\"></span>\n                ").trim();
            }).join('') + "\n              </span>\n            ";
          }
        } // Custom Ranges


        if (params.rangesClasses) {
          for (var k = 0; k < params.rangesClasses.length; k += 1) {
            if (calendar.dateInRange(dayDate, params.rangesClasses[k].range)) {
              addClass += " " + params.rangesClasses[k].cssClass;
            }
          }
        } // Disabled


        disabled = false;

        if (minDate && dayDate < minDate || maxDate && dayDate > maxDate) {
          disabled = true;
        }

        if (params.disabled) {
          if (calendar.dateInRange(dayDate, params.disabled)) {
            disabled = true;
          }
        }

        if (disabled) {
          addClass += ' calendar-day-disabled';
        }

        dayDate = new Date(dayDate);
        var dayYear = dayDate.getFullYear();
        var dayMonth = dayDate.getMonth();
        var dayNumberDisplay = calendar.dayFormatter(dayDate); // prettier-ignore

        rowHtml += ("\n          <div data-year=\"" + dayYear + "\" data-month=\"" + dayMonth + "\" data-day=\"" + dayNumber + "\" class=\"calendar-day" + addClass + "\" data-date=\"" + dayYear + "-" + dayMonth + "-" + dayNumber + "\">\n            <span class=\"calendar-day-number\">" + dayNumberDisplay + eventsHtml + "</span>\n          </div>").trim();
      };

      for (var col = 1; col <= cols; col += 1) {
        _loop(col);
      }

      monthHtml += "<div class=\"calendar-row\">" + rowHtml + "</div>";
    }

    monthHtml = "<div class=\"calendar-month\" data-year=\"" + year + "\" data-month=\"" + month + "\" data-locale-year=\"" + localeYear + "\" data-locale-month=\"" + localeMonth + "\">" + monthHtml + "</div>";
    return monthHtml;
  };

  _proto.renderWeekHeader = function renderWeekHeader() {
    var calendar = this;

    if (calendar.params.renderWeekHeader) {
      return calendar.params.renderWeekHeader.call(calendar);
    }

    var params = calendar.params;
    var weekDaysHtml = '';

    for (var i = 0; i < 7; i += 1) {
      var dayIndex = i + params.firstDay > 6 ? i - 7 + params.firstDay : i + params.firstDay;
      var dayName = calendar.dayNamesShort[dayIndex];
      weekDaysHtml += "<div class=\"calendar-week-day\">" + dayName + "</div>";
    }

    return $jsx("div", {
      class: "calendar-week-header"
    }, weekDaysHtml);
  };

  _proto.renderMonthSelector = function renderMonthSelector() {
    var calendar = this;

    if (calendar.params.renderMonthSelector) {
      return calendar.params.renderMonthSelector.call(calendar);
    }

    return $jsx("div", {
      class: "calendar-month-selector"
    }, $jsx("a", {
      class: "link icon-only calendar-prev-month-button"
    }, $jsx("i", {
      class: "icon icon-prev"
    })), calendar.params.monthPicker ? $jsx("a", {
      class: "current-month-value link"
    }) : $jsx("span", {
      class: "current-month-value"
    }), $jsx("a", {
      class: "link icon-only calendar-next-month-button"
    }, $jsx("i", {
      class: "icon icon-next"
    })));
  };

  _proto.renderMonthPicker = function renderMonthPicker() {
    var calendar = this;
    var localeMonth = parseInt(calendar.$el.find('.calendar-month-current').attr('data-locale-month'), 10);
    return $jsx("div", {
      class: "calendar-month-picker"
    }, calendar.monthNames.map(function (m, index) {
      return $jsx("div", {
        class: "calendar-month-picker-item " + (localeMonth === index ? 'calendar-month-picker-item-current' : '')
      }, $jsx("span", null, m));
    }));
  };

  _proto.renderYearSelector = function renderYearSelector() {
    var calendar = this;

    if (calendar.params.renderYearSelector) {
      return calendar.params.renderYearSelector.call(calendar);
    }

    return $jsx("div", {
      class: "calendar-year-selector"
    }, $jsx("a", {
      class: "link icon-only calendar-prev-year-button"
    }, $jsx("i", {
      class: "icon icon-prev"
    })), calendar.params.yearPicker ? $jsx("a", {
      class: "current-year-value link"
    }) : $jsx("span", {
      class: "current-year-value"
    }), $jsx("a", {
      class: "link icon-only calendar-next-year-button"
    }, $jsx("i", {
      class: "icon icon-next"
    })));
  };

  _proto.renderYearPicker = function renderYearPicker() {
    var calendar = this;
    var currentYear = calendar.currentYear;
    var yearMin = calendar.params.yearPickerMin || new Date().getFullYear() - 100;

    if (calendar.params.minDate) {
      yearMin = Math.max(yearMin, new Date(calendar.params.minDate).getFullYear());
    }

    var yearMax = calendar.params.yearPickerMax || new Date().getFullYear() + 100;

    if (calendar.params.maxDate) {
      yearMax = Math.min(yearMax, new Date(calendar.params.maxDate).getFullYear());
    }

    var years = [];

    for (var i = yearMin; i <= yearMax; i += 1) {
      years.push(i);
    }

    return $jsx("div", {
      class: "calendar-year-picker"
    }, years.map(function (year) {
      return $jsx("div", {
        "data-year": year,
        class: "calendar-year-picker-item " + (year === currentYear ? 'calendar-year-picker-item-current' : '')
      }, $jsx("span", null, calendar.yearFormatter(new Date().setFullYear(year))));
    }));
  } // eslint-disable-next-line
  ;

  _proto.renderTimeSelector = function renderTimeSelector() {
    var calendar = this;
    var value = calendar.value && calendar.value[0];
    var timeString;
    if (value) timeString = calendar.timeSelectorFormatter(value);
    return $jsx("div", {
      class: "calendar-time-selector"
    }, $jsx("a", {
      class: "link"
    }, timeString || calendar.params.timePickerPlaceholder));
  };

  _proto.renderHeader = function renderHeader() {
    var calendar = this;

    if (calendar.params.renderHeader) {
      return calendar.params.renderHeader.call(calendar);
    }

    return $jsx("div", {
      class: "calendar-header"
    }, $jsx("div", {
      class: "calendar-selected-date"
    }, calendar.params.headerPlaceholder));
  };

  _proto.renderFooter = function renderFooter() {
    var calendar = this;
    var app = calendar.app;

    if (calendar.params.renderFooter) {
      return calendar.params.renderFooter.call(calendar);
    }

    return $jsx("div", {
      class: "calendar-footer"
    }, $jsx("a", {
      class: (app.theme === 'md' ? 'button' : 'link') + " calendar-close sheet-close popover-close"
    }, calendar.params.toolbarCloseText));
  };

  _proto.renderToolbar = function renderToolbar() {
    var calendar = this;

    if (calendar.params.renderToolbar) {
      return calendar.params.renderToolbar.call(calendar, calendar);
    } // prettier-ignore


    return $jsx("div", {
      class: "toolbar toolbar-top no-shadow"
    }, $jsx("div", {
      class: "toolbar-inner"
    }, calendar.params.monthSelector ? calendar.renderMonthSelector() : '', calendar.params.yearSelector ? calendar.renderYearSelector() : ''));
  } // eslint-disable-next-line
  ;

  _proto.renderInline = function renderInline() {
    var calendar = this;
    var _calendar$params4 = calendar.params,
        cssClass = _calendar$params4.cssClass,
        toolbar = _calendar$params4.toolbar,
        header = _calendar$params4.header,
        footer = _calendar$params4.footer,
        rangePicker = _calendar$params4.rangePicker,
        weekHeader = _calendar$params4.weekHeader;
    var value = calendar.value,
        hasTimePicker = calendar.hasTimePicker;
    var date = value && value.length ? value[0] : new Date().setHours(0, 0, 0);
    return $jsx("div", {
      class: "calendar calendar-inline " + (rangePicker ? 'calendar-range' : '') + " " + (cssClass || '')
    }, header && calendar.renderHeader(), toolbar && calendar.renderToolbar(), weekHeader && calendar.renderWeekHeader(), $jsx("div", {
      class: "calendar-months"
    }, calendar.renderMonths(date)), hasTimePicker && calendar.renderTimeSelector(), footer && calendar.renderFooter());
  };

  _proto.renderCustomModal = function renderCustomModal() {
    var calendar = this;
    var _calendar$params5 = calendar.params,
        cssClass = _calendar$params5.cssClass,
        toolbar = _calendar$params5.toolbar,
        header = _calendar$params5.header,
        footer = _calendar$params5.footer,
        rangePicker = _calendar$params5.rangePicker,
        weekHeader = _calendar$params5.weekHeader;
    var value = calendar.value,
        hasTimePicker = calendar.hasTimePicker;
    var date = value && value.length ? value[0] : new Date().setHours(0, 0, 0);
    return $jsx("div", {
      class: "calendar calendar-modal " + (rangePicker ? 'calendar-range' : '') + " " + (cssClass || '')
    }, header && calendar.renderHeader(), toolbar && calendar.renderToolbar(), weekHeader && calendar.renderWeekHeader(), $jsx("div", {
      class: "calendar-months"
    }, calendar.renderMonths(date)), hasTimePicker && calendar.renderTimeSelector(), footer && calendar.renderFooter());
  };

  _proto.renderSheet = function renderSheet() {
    var calendar = this;
    var _calendar$params6 = calendar.params,
        cssClass = _calendar$params6.cssClass,
        toolbar = _calendar$params6.toolbar,
        header = _calendar$params6.header,
        footer = _calendar$params6.footer,
        rangePicker = _calendar$params6.rangePicker,
        weekHeader = _calendar$params6.weekHeader;
    var value = calendar.value,
        hasTimePicker = calendar.hasTimePicker;
    var date = value && value.length ? value[0] : new Date().setHours(0, 0, 0);
    return $jsx("div", {
      class: "sheet-modal calendar calendar-sheet " + (rangePicker ? 'calendar-range' : '') + " " + (cssClass || '')
    }, header && calendar.renderHeader(), toolbar && calendar.renderToolbar(), weekHeader && calendar.renderWeekHeader(), $jsx("div", {
      class: "sheet-modal-inner calendar-months"
    }, calendar.renderMonths(date)), hasTimePicker && calendar.renderTimeSelector(), footer && calendar.renderFooter());
  };

  _proto.renderPopover = function renderPopover() {
    var calendar = this;
    var _calendar$params7 = calendar.params,
        cssClass = _calendar$params7.cssClass,
        toolbar = _calendar$params7.toolbar,
        header = _calendar$params7.header,
        footer = _calendar$params7.footer,
        rangePicker = _calendar$params7.rangePicker,
        weekHeader = _calendar$params7.weekHeader;
    var value = calendar.value,
        hasTimePicker = calendar.hasTimePicker;
    var date = value && value.length ? value[0] : new Date().setHours(0, 0, 0);
    return $jsx("div", {
      class: "popover calendar-popover"
    }, $jsx("div", {
      class: "popover-inner"
    }, $jsx("div", {
      class: "calendar " + (rangePicker ? 'calendar-range' : '') + " " + (cssClass || '')
    }, header && calendar.renderHeader(), toolbar && calendar.renderToolbar(), weekHeader && calendar.renderWeekHeader(), $jsx("div", {
      class: "calendar-months"
    }, calendar.renderMonths(date)), hasTimePicker && calendar.renderTimeSelector(), footer && calendar.renderFooter())));
  };

  _proto.render = function render() {
    var calendar = this;
    var params = calendar.params;
    if (params.render) return params.render.call(calendar);

    if (!calendar.inline) {
      var modalType = params.openIn;
      if (modalType === 'auto') modalType = calendar.isPopover() ? 'popover' : 'sheet';
      if (modalType === 'popover') return calendar.renderPopover();
      if (modalType === 'sheet') return calendar.renderSheet();
      return calendar.renderCustomModal();
    }

    return calendar.renderInline();
  };

  _proto.openTimePicker = function openTimePicker() {
    var calendar = this;
    var $el = calendar.$el,
        app = calendar.app,
        is12HoursFormat = calendar.is12HoursFormat;
    if (!$el || !$el.length) return;
    $el.append('<div class="calendar-time-picker"></div>');
    var hoursArr = [];
    var minutesArr = [];
    var hoursMin = is12HoursFormat ? 1 : 0;
    var hoursMax = is12HoursFormat ? 12 : 23;

    for (var i = hoursMin; i <= hoursMax; i += 1) {
      hoursArr.push(i);
    }

    for (var _i2 = 0; _i2 <= 59; _i2 += 1) {
      minutesArr.push(_i2);
    }

    var value;

    if (calendar.value && calendar.value.length) {
      value = [calendar.value[0].getHours(), calendar.value[0].getMinutes()];
    } else {
      value = [new Date().getHours(), new Date().getMinutes()];
    }

    if (is12HoursFormat) {
      value.push(value[0] < 12 ? 'AM' : 'PM');
      if (value[0] > 12) value[0] -= 12;
      if (value[0] === 0) value[0] = 12;
    }

    calendar.timePickerInstance = app.picker.create({
      containerEl: $el.find('.calendar-time-picker'),
      value: value,
      toolbar: true,
      rotateEffect: false,
      toolbarCloseText: calendar.params.toolbarCloseText,
      cols: [{
        values: hoursArr
      }, {
        divider: true,
        content: ':'
      }, {
        values: minutesArr,
        displayValues: minutesArr.map(function (m) {
          return m < 10 ? "0" + m : m;
        })
      }].concat(is12HoursFormat ? [{
        values: ['AM', 'PM']
      }] : [])
    });
    calendar.timePickerInstance.$el.find('.toolbar a').removeClass('sheet-close popover-close').addClass('calendar-time-picker-close');
  };

  _proto.closeTimePicker = function closeTimePicker() {
    var calendar = this;
    var is12HoursFormat = calendar.is12HoursFormat;

    if (calendar.timePickerInstance) {
      var timePickerValue = calendar.timePickerInstance.value;
      var hours = parseInt(timePickerValue[0], 10);
      var minutes = parseInt(timePickerValue[1], 10);
      var period = calendar.timePickerInstance.value[2];

      if (is12HoursFormat) {
        if (period === 'AM' && hours === 12) {
          hours = 0;
        } else if (period === 'PM' && hours !== 12) {
          hours += 12;
        }
      }

      var value = calendar.value && calendar.value.length && calendar.value[0];

      if (!value) {
        value = new Date();
        value.setHours(hours, minutes, 0, 0);
      } else {
        value = new Date(value);
        value.setHours(hours, minutes);
      }

      calendar.setValue([value]);
      calendar.timePickerInstance.close();
      calendar.timePickerInstance.destroy();
      delete calendar.timePickerInstance;
    }

    if (calendar.$el && calendar.$el.length) {
      calendar.$el.find('.calendar-time-picker').remove();
    }
  };

  _proto.onOpen = function onOpen() {
    var calendar = this;
    var initialized = calendar.initialized,
        $el = calendar.$el,
        app = calendar.app,
        $inputEl = calendar.$inputEl,
        inline = calendar.inline,
        value = calendar.value,
        params = calendar.params;
    calendar.closing = false;
    calendar.opened = true;
    calendar.opening = true; // Init main events

    calendar.attachCalendarEvents();
    var updateValue = !value && params.value; // Set value

    if (!initialized) {
      if (value) calendar.setValue(value, 0);else if (params.value) {
        calendar.setValue(calendar.normalizeValues(params.value), 0);
      }
    } else if (value) {
      calendar.setValue(value, 0);
    } // Update current month and year


    calendar.updateCurrentMonthYear(); // Set initial translate

    calendar.monthsTranslate = 0;
    calendar.setMonthsTranslate(); // Update input value

    if (updateValue) calendar.updateValue();else if (params.header && value) {
      calendar.updateValue(true);
    } // Extra focus

    if (!inline && $inputEl && $inputEl.length && app.theme === 'md') {
      $inputEl.trigger('focus');
    }

    calendar.initialized = true;
    calendar.$months.each(function (monthEl) {
      calendar.emit('local::monthAdd calendarMonthAdd', monthEl);
    }); // Trigger events

    if ($el) {
      $el.trigger('calendar:open');
    }

    if ($inputEl) {
      $inputEl.trigger('calendar:open');
    }

    calendar.emit('local::open calendarOpen', calendar);
  };

  _proto.onOpened = function onOpened() {
    var calendar = this;
    calendar.opening = false;

    if (calendar.$el) {
      calendar.$el.trigger('calendar:opened');
    }

    if (calendar.$inputEl) {
      calendar.$inputEl.trigger('calendar:opened');
    }

    calendar.emit('local::opened calendarOpened', calendar);
  };

  _proto.onClose = function onClose() {
    var calendar = this;
    var app = calendar.app;
    calendar.opening = false;
    calendar.closing = true;

    if (calendar.$inputEl) {
      if (app.theme === 'md') {
        calendar.$inputEl.trigger('blur');
      } else {
        var validate = calendar.$inputEl.attr('validate');
        var required = calendar.$inputEl.attr('required');

        if (validate && required) {
          app.input.validate(calendar.$inputEl);
        }
      }
    }

    if (calendar.detachCalendarEvents) {
      calendar.detachCalendarEvents();
    }

    if (calendar.$el) {
      calendar.$el.trigger('calendar:close');
    }

    if (calendar.$inputEl) {
      calendar.$inputEl.trigger('calendar:close');
    }

    calendar.emit('local::close calendarClose', calendar);
  };

  _proto.onClosed = function onClosed() {
    var calendar = this;
    calendar.opened = false;
    calendar.closing = false;

    if (!calendar.inline) {
      nextTick(function () {
        if (calendar.modal && calendar.modal.el && calendar.modal.destroy) {
          if (!calendar.params.routableModals) {
            calendar.modal.destroy();
          }
        }

        delete calendar.modal;
      });
    }

    if (calendar.timePickerInstance) {
      if (calendar.timePickerInstance.destroy) calendar.timePickerInstance.destroy();
      delete calendar.timePickerInstance;
    }

    if (calendar.$el) {
      calendar.$el.trigger('calendar:closed');
    }

    if (calendar.$inputEl) {
      calendar.$inputEl.trigger('calendar:closed');
    }

    calendar.emit('local::closed calendarClosed', calendar);
  };

  _proto.open = function open() {
    var calendar = this;
    var app = calendar.app,
        opened = calendar.opened,
        inline = calendar.inline,
        $inputEl = calendar.$inputEl,
        params = calendar.params;
    if (opened) return;

    if (inline) {
      calendar.$el = $(calendar.render());
      calendar.$el[0].f7Calendar = calendar;
      calendar.$wrapperEl = calendar.$el.find('.calendar-months-wrapper');
      calendar.$months = calendar.$wrapperEl.find('.calendar-month');
      calendar.$containerEl.append(calendar.$el);
      calendar.onOpen();
      calendar.onOpened();
      return;
    }

    var modalType = params.openIn;

    if (modalType === 'auto') {
      modalType = calendar.isPopover() ? 'popover' : 'sheet';
    }

    var modalContent = calendar.render();
    var modalParams = {
      targetEl: $inputEl,
      scrollToEl: params.scrollToInput ? $inputEl : undefined,
      content: modalContent,
      backdrop: params.backdrop === true || modalType === 'popover' && app.params.popover.backdrop !== false && params.backdrop !== false,
      closeByBackdropClick: params.closeByBackdropClick,
      on: {
        open: function open() {
          var modal = this;
          calendar.modal = modal;
          calendar.$el = modalType === 'popover' ? modal.$el.find('.calendar') : modal.$el;
          calendar.$wrapperEl = calendar.$el.find('.calendar-months-wrapper');
          calendar.$months = calendar.$wrapperEl.find('.calendar-month');
          calendar.$el[0].f7Calendar = calendar;

          if (modalType === 'customModal') {
            $(calendar.$el).find('.calendar-close').once('click', function () {
              calendar.close();
            });
          }

          calendar.onOpen();
        },
        opened: function opened() {
          calendar.onOpened();
        },
        close: function close() {
          calendar.onClose();
        },
        closed: function closed() {
          calendar.onClosed();
        }
      }
    };

    if (modalType === 'sheet') {
      modalParams.push = params.sheetPush;
      modalParams.swipeToClose = params.sheetSwipeToClose;
    }

    if (params.routableModals && calendar.view) {
      var _route;

      calendar.view.router.navigate({
        url: calendar.url,
        route: (_route = {
          path: calendar.url
        }, _route[modalType] = modalParams, _route)
      });
    } else {
      calendar.modal = app[modalType].create(modalParams);
      calendar.modal.open();
    }
  };

  _proto.close = function close() {
    var calendar = this;
    var opened = calendar.opened,
        inline = calendar.inline;
    if (!opened) return;

    if (inline) {
      calendar.onClose();
      calendar.onClosed();
      return;
    }

    if (calendar.params.routableModals && calendar.view) {
      calendar.view.router.back();
    } else {
      calendar.modal.close();
    }
  };

  _proto.init = function init() {
    var calendar = this;
    calendar.initInput();

    if (calendar.inline) {
      calendar.open();
      calendar.emit('local::init calendarInit', calendar);
      return;
    }

    if (!calendar.initialized && calendar.params.value) {
      calendar.setValue(calendar.normalizeValues(calendar.params.value));
    } // Attach input Events


    if (calendar.$inputEl) {
      calendar.attachInputEvents();
    }

    if (calendar.params.closeByOutsideClick) {
      calendar.attachHtmlEvents();
    }

    calendar.emit('local::init calendarInit', calendar);
  };

  _proto.destroy = function destroy() {
    var calendar = this;
    if (calendar.destroyed) return;
    var $el = calendar.$el;
    calendar.emit('local::beforeDestroy calendarBeforeDestroy', calendar);
    if ($el) $el.trigger('calendar:beforedestroy');
    calendar.close(); // Detach Events

    if (calendar.$inputEl) {
      calendar.detachInputEvents();
    }

    if (calendar.params.closeByOutsideClick) {
      calendar.detachHtmlEvents();
    }

    if (calendar.timePickerInstance) {
      if (calendar.timePickerInstance.destroy) calendar.timePickerInstance.destroy();
      delete calendar.timePickerInstance;
    }

    if ($el && $el.length) delete calendar.$el[0].f7Calendar;
    deleteProps(calendar);
    calendar.destroyed = true;
  };

  _createClass(Calendar, [{
    key: "view",
    get: function get() {
      var $inputEl = this.$inputEl,
          app = this.app,
          params = this.params;
      var view;

      if (params.view) {
        view = params.view;
      } else if ($inputEl) {
        view = $inputEl.parents('.view').length && $inputEl.parents('.view')[0].f7View;
      }

      if (!view) view = app.views.main;
      return view;
    }
  }]);

  return Calendar;
}(Framework7Class);

export default Calendar;