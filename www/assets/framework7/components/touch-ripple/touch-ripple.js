import TouchRipple from './touch-ripple-class.js';
export default {
  name: 'touch-ripple',
  static: {
    TouchRipple
  },

  create() {
    const app = this;
    app.touchRipple = {
      create() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return new TouchRipple(...args);
      }

    };
  }

};