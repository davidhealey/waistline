"use strict";

exports.__esModule = true;
exports.default = void 0;

var _snabbdom = require("./snabbdom/snabbdom");

var _attributes = _interopRequireDefault(require("./snabbdom/modules/attributes"));

var _props = _interopRequireDefault(require("./snabbdom/modules/props"));

var _style = _interopRequireDefault(require("./snabbdom/modules/style"));

var _eventslisteners = _interopRequireDefault(require("./eventslisteners"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint import/no-named-as-default: off */
var patch = (0, _snabbdom.init)([_attributes.default, _props.default, _style.default, _eventslisteners.default]);
var _default = patch;
exports.default = _default;