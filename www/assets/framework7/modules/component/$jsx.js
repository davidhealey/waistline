import { flattenArray } from '../../shared/utils.js';
const ignoreChildren = [false, null, '', undefined];

const $jsx = function (type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  const flatChildren = flattenArray((children || []).filter(child => ignoreChildren.indexOf(child) < 0));

  if (type === 'Fragment') {
    return flatChildren;
  }

  return {
    type,
    props: props || {},
    children: flatChildren
  };
};

export default $jsx;