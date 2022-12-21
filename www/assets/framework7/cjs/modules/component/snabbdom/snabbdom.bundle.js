"use strict";

exports.__esModule = true;
exports.default = exports.snabbdomBundle = void 0;

var _snabbdom = require("./snabbdom");

var _attributes = require("./modules/attributes");

var _class = require("./modules/class");

var _props = require("./modules/props");

var _style = require("./modules/style");

var _eventlisteners = require("./modules/eventlisteners");

var _h = require("./h");

// for setting attributes on DOM elements
// makes it easy to toggle classes
// for setting properties on DOM elements
// handles styling on elements with support for animations
// attaches event listeners
// helper function for creating vnodes
var patch = (0, _snabbdom.init)([_attributes.attributesModule, _class.classModule, _props.propsModule, _style.styleModule, _eventlisteners.eventListenersModule]);
var snabbdomBundle = {
  patch: patch,
  h: _h.h
};
exports.snabbdomBundle = snabbdomBundle;
var _default = snabbdomBundle;
exports.default = _default;