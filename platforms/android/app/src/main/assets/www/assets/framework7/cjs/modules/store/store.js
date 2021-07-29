"use strict";

exports.__esModule = true;
exports.default = void 0;

var _createStore = _interopRequireDefault(require("./create-store"));

exports.createStore = _createStore.default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'store',
  static: {
    createStore: _createStore.default
  },
  proto: {
    createStore: _createStore.default
  }
};
exports.default = _default;