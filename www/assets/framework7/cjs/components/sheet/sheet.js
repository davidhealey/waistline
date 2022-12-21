"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _sheetClass = _interopRequireDefault(require("./sheet-class"));

var _modalMethods = _interopRequireDefault(require("../../shared/modal-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'sheet',
  params: {
    sheet: {
      push: false,
      backdrop: undefined,
      backdropEl: undefined,
      closeByBackdropClick: true,
      closeByOutsideClick: false,
      closeOnEscape: false,
      swipeToClose: false,
      swipeToStep: false,
      swipeHandler: null,
      containerEl: null
    }
  },
  static: {
    Sheet: _sheetClass.default
  },
  create: function create() {
    var app = this;
    app.sheet = (0, _utils.extend)({}, (0, _modalMethods.default)({
      app: app,
      constructor: _sheetClass.default,
      defaultSelector: '.sheet-modal.modal-in'
    }), {
      stepOpen: function stepOpen(sheet) {
        var sheetInstance = app.sheet.get(sheet);
        if (sheetInstance && sheetInstance.stepOpen) return sheetInstance.stepOpen();
        return undefined;
      },
      stepClose: function stepClose(sheet) {
        var sheetInstance = app.sheet.get(sheet);
        if (sheetInstance && sheetInstance.stepClose) return sheetInstance.stepClose();
        return undefined;
      },
      stepToggle: function stepToggle(sheet) {
        var sheetInstance = app.sheet.get(sheet);
        if (sheetInstance && sheetInstance.stepToggle) return sheetInstance.stepToggle();
        return undefined;
      }
    });
  },
  clicks: {
    '.sheet-open': function openSheet($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;

      if ((0, _dom.default)('.sheet-modal.modal-in').length > 0 && data.sheet && (0, _dom.default)(data.sheet)[0] !== (0, _dom.default)('.sheet-modal.modal-in')[0]) {
        app.sheet.close('.sheet-modal.modal-in');
      }

      app.sheet.open(data.sheet, data.animate, $clickedEl);
    },
    '.sheet-close': function closeSheet($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.sheet.close(data.sheet, data.animate, $clickedEl);
    }
  }
};
exports.default = _default;