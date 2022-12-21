"use strict";

exports.__esModule = true;
exports.default = void 0;

var _modalClass = _interopRequireDefault(require("./modal-class"));

var _customModalClass = _interopRequireDefault(require("./custom-modal-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'modal',
  static: {
    Modal: _modalClass.default,
    CustomModal: _customModalClass.default
  },
  create: function create() {
    var app = this;
    app.customModal = {
      create: function create(params) {
        return new _customModalClass.default(app, params);
      }
    };
  },
  params: {
    modal: {
      queueDialogs: true
    }
  }
};
exports.default = _default;