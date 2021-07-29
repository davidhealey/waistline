"use strict";

exports.__esModule = true;
exports.default = void 0;

var _popupClass = _interopRequireDefault(require("./popup-class"));

var _modalMethods = _interopRequireDefault(require("../../shared/modal-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'popup',
  params: {
    popup: {
      backdrop: true,
      backdropEl: undefined,
      closeByBackdropClick: true,
      closeOnEscape: false,
      swipeToClose: false,
      swipeHandler: null,
      push: false,
      containerEl: null
    }
  },
  static: {
    Popup: _popupClass.default
  },
  create: function create() {
    var app = this;
    app.popup = (0, _modalMethods.default)({
      app: app,
      constructor: _popupClass.default,
      defaultSelector: '.popup.modal-in',
      parentSelector: '.popup'
    });
  },
  clicks: {
    '.popup-open': function openPopup($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.popup.open(data.popup, data.animate, $clickedEl);
    },
    '.popup-close': function closePopup($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.popup.close(data.popup, data.animate, $clickedEl);
    }
  }
};
exports.default = _default;