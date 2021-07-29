"use strict";

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../../shared/utils");

var _notificationClass = _interopRequireDefault(require("./notification-class"));

var _modalMethods = _interopRequireDefault(require("../../shared/modal-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'notification',
  static: {
    Notification: _notificationClass.default
  },
  create: function create() {
    var app = this;
    app.notification = (0, _utils.extend)({}, (0, _modalMethods.default)({
      app: app,
      constructor: _notificationClass.default,
      defaultSelector: '.notification.modal-in'
    }));
  },
  params: {
    notification: {
      icon: null,
      title: null,
      titleRightText: null,
      subtitle: null,
      text: null,
      closeButton: false,
      closeTimeout: null,
      closeOnClick: false,
      swipeToClose: true,
      cssClass: null,
      render: null,
      containerEl: null
    }
  }
};
exports.default = _default;