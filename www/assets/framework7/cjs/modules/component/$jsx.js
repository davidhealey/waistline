"use strict";

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../../shared/utils");

var ignoreChildren = [false, null, '', undefined];

var $jsx = function $jsx(type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  var flatChildren = (0, _utils.flattenArray)((children || []).filter(function (child) {
    return ignoreChildren.indexOf(child) < 0;
  }));

  if (type === 'Fragment') {
    return flatChildren;
  }

  return {
    type: type,
    props: props || {},
    children: flatChildren
  };
};

var _default = $jsx;
exports.default = _default;