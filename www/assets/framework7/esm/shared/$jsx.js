/* eslint-disable prefer-rest-params */
var $jsx = function $jsx(tag, props) {
  var attrs = props || {};

  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var children = args || [];
  var attrsString = Object.keys(attrs).map(function (attr) {
    if (attr[0] === '_') {
      if (attrs[attr]) return attr.replace('_', '');
      return '';
    }

    return attr + "=\"" + attrs[attr] + "\"";
  }).filter(function (attr) {
    return !!attr;
  }).join(' ');

  if (['path', 'img', 'circle', 'polygon', 'line', 'input'].indexOf(tag) >= 0) {
    return ("<" + tag + " " + attrsString + " />").trim();
  }

  var childrenContent = children.filter(function (c) {
    return !!c;
  }).map(function (c) {
    return Array.isArray(c) ? c.join('') : c;
  }).join('');
  return ("<" + tag + " " + attrsString + ">" + childrenContent + "</" + tag + ">").trim();
};

export default $jsx;