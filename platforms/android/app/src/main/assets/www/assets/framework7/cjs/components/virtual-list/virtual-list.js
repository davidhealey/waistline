"use strict";

exports.__esModule = true;
exports.default = void 0;

var _virtualListClass = _interopRequireDefault(require("./virtual-list-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'virtualList',
  static: {
    VirtualList: _virtualListClass.default
  },
  create: function create() {
    var app = this;
    app.virtualList = (0, _constructorMethods.default)({
      defaultSelector: '.virtual-list',
      constructor: _virtualListClass.default,
      app: app,
      domProp: 'f7VirtualList'
    });
  }
};
exports.default = _default;