import htm from 'htm';
import { flattenArray } from '../../shared/utils.js';
const ignoreChildren = [false, null, '', undefined];

const h = function (type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type,
    props: props || {},
    children: flattenArray(children.filter(child => ignoreChildren.indexOf(child) < 0))
  };
};

const $h = htm.bind(h);
export default $h;