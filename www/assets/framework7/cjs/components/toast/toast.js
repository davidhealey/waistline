"use strict";

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../../shared/utils");

var _toastClass = _interopRequireDefault(require("./toast-class"));

var _modalMethods = _interopRequireDefault(require("../../shared/modal-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'toast',
  static: {
    Toast: _toastClass.default
  },
  create: function create() {
    var app = this;
    app.toast = (0, _utils.extend)({}, (0, _modalMethods.default)({
      app: app,
      constructor: _toastClass.default,
      defaultSelector: '.toast.modal-in'
    }), {
      // Shortcuts
      show: function show(params) {
        (0, _utils.extend)(params, {
          destroyOnClose: true
        });
        return new _toastClass.default(app, params).open();
      }
    });
  },
  params: {
    toast: {
      icon: null,
      text: null,
      position: 'bottom',
      horizontalPosition: 'left',
      closeButton: false,
      closeButtonColor: null,
      closeButtonText: 'Ok',
      closeTimeout: null,
      cssClass: null,
      render: null,
      containerEl: null
    }
  }
};
exports.default = _default;