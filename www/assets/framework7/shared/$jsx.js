/* eslint-disable prefer-rest-params */
const $jsx = function (tag, props) {
  const attrs = props || {};

  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  const children = args || [];
  const attrsString = Object.keys(attrs).map(attr => {
    if (attr[0] === '_') {
      if (attrs[attr]) return attr.replace('_', '');
      return '';
    }

    return `${attr}="${attrs[attr]}"`;
  }).filter(attr => !!attr).join(' ');

  if (['path', 'img', 'circle', 'polygon', 'line', 'input'].indexOf(tag) >= 0) {
    return `<${tag} ${attrsString} />`.trim();
  }

  const childrenContent = children.filter(c => !!c).map(c => Array.isArray(c) ? c.join('') : c).join('');
  return `<${tag} ${attrsString}>${childrenContent}</${tag}>`.trim();
};

export default $jsx;