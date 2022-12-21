"use strict";

exports.__esModule = true;
exports.default = void 0;

var _request = _interopRequireDefault(require("../../shared/request"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-param-reassign: "off" */
var _default = {
  name: 'request',
  proto: {
    request: _request.default
  },
  static: {
    request: _request.default
  }
};
exports.default = _default;