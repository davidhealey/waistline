"use strict";

exports.__esModule = true;
exports.toVNode = toVNode;
exports.default = void 0;

var _vnode = _interopRequireDefault(require("./vnode"));

var _htmldomapi = _interopRequireDefault(require("./htmldomapi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toVNode(node, domApi) {
  var api = domApi !== undefined ? domApi : _htmldomapi.default;
  var text;

  if (api.isElement(node)) {
    var id = node.id ? '#' + node.id : '';
    var cn = node.getAttribute('class');
    var c = cn ? '.' + cn.split(' ').join('.') : '';
    var sel = api.tagName(node).toLowerCase() + id + c;
    var attrs = {};
    var children = [];
    var name_1;
    var i = void 0,
        n = void 0;
    var elmAttrs = node.attributes;
    var elmChildren = node.childNodes;

    for (i = 0, n = elmAttrs.length; i < n; i++) {
      name_1 = elmAttrs[i].nodeName;

      if (name_1 !== 'id' && name_1 !== 'class') {
        attrs[name_1] = elmAttrs[i].nodeValue;
      }
    }

    for (i = 0, n = elmChildren.length; i < n; i++) {
      children.push(toVNode(elmChildren[i]));
    }

    return (0, _vnode.default)(sel, {
      attrs: attrs
    }, children, undefined, node);
  } else if (api.isText(node)) {
    text = api.getTextContent(node);
    return (0, _vnode.default)(undefined, undefined, undefined, text, node);
  } else if (api.isComment(node)) {
    text = api.getTextContent(node);
    return (0, _vnode.default)('!', {}, [], text, node);
  } else {
    return (0, _vnode.default)('', {}, [], undefined, node);
  }
}

var _default = toVNode;
exports.default = _default;