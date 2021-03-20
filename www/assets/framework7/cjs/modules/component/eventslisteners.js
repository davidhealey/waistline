"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function invokeHandler(handler, event, args) {
  if (typeof handler === 'function') {
    // call function handler
    handler.apply(void 0, [event].concat(args));
  }
}

function handleEvent(event, args, vnode) {
  var name = event.type;
  var on = vnode.data.on; // call event handler(s) if exists

  if (on && on[name]) {
    invokeHandler(on[name], event, args, vnode);
  }
}

function createListener() {
  return function handler(event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    handleEvent(event, args, handler.vnode);
  };
}

function updateEvents(oldVnode, vnode) {
  var oldOn = oldVnode.data.on;
  var oldListener = oldVnode.listener;
  var oldElm = oldVnode.elm;
  var on = vnode && vnode.data.on;
  var elm = vnode && vnode.elm; // optimization for reused immutable handlers

  if (oldOn === on) {
    return;
  } // remove existing listeners which no longer used


  if (oldOn && oldListener) {
    // if element changed or deleted we remove all existing listeners unconditionally
    if (!on) {
      Object.keys(oldOn).forEach(function (name) {
        (0, _dom.default)(oldElm).off(name, oldListener);
      });
    } else {
      Object.keys(oldOn).forEach(function (name) {
        if (!on[name]) {
          (0, _dom.default)(oldElm).off(name, oldListener);
        }
      });
    }
  } // add new listeners which has not already attached


  if (on) {
    // reuse existing listener or create new
    var listener = oldVnode.listener || createListener();
    vnode.listener = listener; // update vnode for listener

    listener.vnode = vnode; // if element changed or added we add all needed listeners unconditionally

    if (!oldOn) {
      Object.keys(on).forEach(function (name) {
        (0, _dom.default)(elm).on(name, listener);
      });
    } else {
      Object.keys(on).forEach(function (name) {
        if (!oldOn[name]) {
          (0, _dom.default)(elm).on(name, listener);
        }
      });
    }
  }
}

var _default = {
  create: updateEvents,
  update: updateEvents,
  destroy: updateEvents
};
exports.default = _default;