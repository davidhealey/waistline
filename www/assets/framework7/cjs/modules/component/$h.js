"use strict";

exports.__esModule = true;
exports.default = void 0;

var _htm = _interopRequireDefault(require("htm"));

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ignoreChildren = [false, null, '', undefined];

var h = function h(type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type: type,
    props: props || {},
    children: (0, _utils.flattenArray)(children.filter(function (child) {
      return ignoreChildren.indexOf(child) < 0;
    }))
  };
};

var $h = _htm.default.bind(h);

var _default = $h;
exports.default = _default;