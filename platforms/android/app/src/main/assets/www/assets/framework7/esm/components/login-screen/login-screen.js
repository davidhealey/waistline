import LoginScreen from './login-screen-class';
import ModalMethods from '../../shared/modal-methods';
export default {
  name: 'loginScreen',
  static: {
    LoginScreen: LoginScreen
  },
  create: function create() {
    var app = this;
    app.loginScreen = ModalMethods({
      app: app,
      constructor: LoginScreen,
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