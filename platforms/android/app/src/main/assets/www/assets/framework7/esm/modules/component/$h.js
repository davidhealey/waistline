import htm from 'htm';
import { flattenArray } from '../../shared/utils';
var ignoreChildren = [false, null, '', undefined];

var h = function h(type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type: type,
    props: props || {},
    children: flattenArray(children.filter(function (child) {
      return ignoreChildren.indexOf(child) < 0;
    }))
  };
};

var $h = htm.bind(h);
export default $h;