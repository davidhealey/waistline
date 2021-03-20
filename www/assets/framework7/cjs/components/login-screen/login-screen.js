"use strict";

exports.__esModule = true;
exports.default = void 0;

var _loginScreenClass = _interopRequireDefault(require("./login-screen-class"));

var _modalMethods = _interopRequireDefault(require("../../shared/modal-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'loginScreen',
  static: {
    LoginScreen: _loginScreenClass.default
  },
  create: function create() {
    var app = this;
    app.loginScreen = (0, _modalMethods.default)({
      app: app,
      constructor: _loginScreenClass.default,
      defaultSelector: '.login-screen.modal-in'
    });
  },
  clicks: {
    '.login-screen-open': function openLoginScreen($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.loginScreen.open(data.loginScreen, data.animate, $clickedEl);
    },
    '.login-screen-close': function closeLoginScreen($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.loginScreen.close(data.loginScreen, data.animate, $clickedEl);
    }
  }
};
exports.default = _default;