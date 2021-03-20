"use strict";

exports.__esModule = true;
exports.default = void 0;

var _routerClass = _interopRequireDefault(require("./router-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'router',
  static: {
    Router: _routerClass.default
  },
  instance: {
    cache: {
      xhr: [],
      templates: [],
      components: []
    }
  },
  create: function create() {
    var instance = this;

    if (instance.app) {
      // View Router
      if (instance.params.router) {
        instance.router = new _routerClass.default(instance.app, instance);
      }
    } else {
      // App Router
      instance.router = new _routerClass.default(instance);
    }
  }
};
exports.default = _default;