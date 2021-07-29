"use strict";

exports.__esModule = true;
exports.default = void 0;

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

var _calendarClass = _interopRequireDefault(require("./calendar-class"));

var _dom = _interopRequireDefault(require("../../shared/dom7"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'calendar',
  static: {
    Calendar: _calendarClass.default
  },
  create: function create() {
    var app = this;
    app.calendar = (0, _constructorMethods.default)({
      defaultSelector: '.calendar',
      constructor: _calendarClass.default,
      app: app,
      domProp: 'f7Calendar'
    });

    app.calendar.close = function close(el) {
      if (el === void 0) {
        el = '.calendar';
      }

      var $el = (0, _dom.default)(el);
      if ($el.length === 0) return;
      var calendar = $el[0].f7Calendar;
      if (!calendar || calendar && !calendar.opened) return;
      calendar.close();
    };
  },
  params: {
    calendar: {
      // Calendar settings
      dateFormat: undefined,
      monthNames: 'auto',
      monthNamesShort: 'auto',
      dayNames: 'auto',
      dayNamesShort: 'auto',
      locale: undefined,
      firstDay: 1,
      // First day of the week, Monday
      weekendDays: [0, 6],
      // Sunday and Saturday
      multiple: false,
      rangePicker: false,
      rangePickerMinDays: 1,
      // when calendar is used as rangePicker
      rangePickerMaxDays: 0,
      // when calendar is used as rangePicker, 0 means unlimited
      direction: 'horizontal',
      // or 'vertical'
      minDate: null,
      maxDate: null,
      disabled: null,
      // dates range of disabled days
      events: null,
      // dates range of days with events
      rangesClasses: null,
      // array with custom classes date ranges
      touchMove: true,
      animate: true,
      closeOnSelect: false,
      monthSelector: true,
      monthPicker: true,
      yearSelector: true,
      yearPicker: true,
      yearPickerMin: undefined,
      yearPickerMax: undefined,
      timePicker: false,
      timePickerFormat: {
        hour: 'numeric',
        minute: 'numeric'
      },
      timePickerPlaceholder: 'Select time',
      weekHeader: true,
      value: null,
      // Common opener settings
      containerEl: null,
      openIn: 'auto',
      // or 'popover' or 'sheet' or 'customModal'
      sheetPush: false,
      sheetSwipeToClose: undefined,
      formatValue: null,
      inputEl: null,
      inputReadOnly: true,
      closeByOutsideClick: true,
      scrollToInput: true,
      header: false,
      headerPlaceholder: 'Select date',
      toolbar: true,
      toolbarCloseText: 'Done',
      footer: false,
      cssClass: null,
      routableModals: false,
      view: null,
      url: 'date/',
      backdrop: null,
      closeByBackdropClick: true,
      // Render functions
      renderWeekHeader: null,
      renderMonths: null,
      renderMonth: null,
      renderMonthSelector: null,
      renderYearSelector: null,
      renderHeader: null,
      renderFooter: null,
      renderToolbar: null,
      renderInline: null,
      renderPopover: null,
      renderSheet: null,
      render: null
    }
  }
};
exports.default = _default;