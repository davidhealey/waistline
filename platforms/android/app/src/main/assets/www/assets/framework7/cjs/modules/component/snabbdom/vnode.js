"use strict";

exports.__esModule = true;
exports.vnode = vnode;
exports.default = void 0;

function vnode(sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return {
    sel: sel,
    data: data,
    children: children,
    text: text,
    elm: elm,
    key: key
  };
}

var _default = vnode;
exports.default = _default;