"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

var _pickerClass = _interopRequireDefault(require("./picker-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'picker',
  static: {
    Picker: _pickerClass.default
  },
  create: function create() {
    var app = this;
    app.picker = (0, _constructorMethods.default)({
      defaultSelector: '.picker',
      constructor: _pickerClass.default,
      app: app,
      domProp: 'f7Picker'
    });

    app.picker.close = function close(el) {
      if (el === void 0) {
        el = '.picker';
      }

      var $el = (0, _dom.default)(el);
      if ($el.length === 0) return;
      var picker = $el[0].f7Picker;
      if (!picker || picker && !picker.opened) return;
      picker.close();
    };
  },
  params: {
    picker: {
      // Picker settings
      updateValuesOnMomentum: false,
      updateValuesOnTouchmove: true,
      updateValuesOnMousewheel: true,
      mousewheel: true,
      rotateEffect: false,
      momentumRatio: 7,
      freeMode: false,
      cols: [],
      // Common opener settings
      containerEl: null,
      openIn: 'auto',
      // or 'popover' or 'sheet'
      sheetPush: false,
      sheetSwipeToClose: undefined,
      backdrop: undefined,
      // uses Popover or Sheet defaults
      formatValue: null,
      inputEl: null,
      inputReadOnly: true,
      closeByOutsideClick: true,
      scrollToInput: true,
      scrollToEl: undefined,
      toolbar: true,
      toolbarCloseText: 'Done',
      cssClass: null,
      routableModals: false,
      view: null,
      url: 'select/',
      // Render functions
      renderToolbar: null,
      render: null
    }
  }
};
exports.default = _default;