"use strict";

exports.__esModule = true;
exports.default = void 0;

var _history = _interopRequireDefault(require("../../shared/history"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'history',
  static: {
    history: _history.default
  },
  on: {
    init: function init() {
      _history.default.init(this);
    }
  }
};
exports.default = _default;