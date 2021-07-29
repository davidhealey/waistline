function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

/* eslint no-use-before-define: "off" */

/* eslint import/no-named-as-default: "off" */
import h from './snabbdom/h';
import customComponents from './custom-components';
import { isObject, eventNameToColonCase } from '../../shared/utils';
var SELF_CLOSING = 'area base br col command embed hr img input keygen link menuitem meta param source track wbr'.split(' ');
var PROPS_ATTRS = 'hidden checked disabled readonly selected autofocus autoplay required multiple value indeterminate routeProps innerHTML'.split(' ');
var BOOLEAN_PROPS = 'hidden checked disabled readonly selected autofocus autoplay required multiple readOnly indeterminate'.split(' ');

var getTagName = function getTagName(treeNode) {
  return typeof treeNode.type === 'function' ? treeNode.type.name || 'CustomComponent' : treeNode.type;
};

var toCamelCase = function toCamelCase(name) {
  return name.split('-').map(function (word, index) {
    if (index === 0) return word.toLowerCase();
    return word[0].toUpperCase() + word.substr(1);
  }).join('');
};

var propsFromAttrs = function propsFromAttrs() {
  var context = {};

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  args.forEach(function (obj) {
    if (obj === void 0) {
      obj = {};
    }

    Object.keys(obj).forEach(function (key) {
      context[toCamelCase(key)] = obj[key];
    });
  });
  return context;
};

var createCustomComponent = function createCustomComponent(_ref) {
  var f7 = _ref.f7,
      treeNode = _ref.treeNode,
      vnode = _ref.vnode,
      data = _ref.data;
  var component = typeof treeNode.type === 'function' ? treeNode.type : customComponents[treeNode.type];
  f7.component.create(component, propsFromAttrs(data.attrs || {}, data.props || {}), {
    el: vnode.elm,
    children: treeNode.children
  }).then(function (c) {
    if (vnode.data && vnode.data.on && c && c.$el) {
      Object.keys(vnode.data.on).forEach(function (eventName) {
        c.$el.on(eventName, vnode.data.on[eventName]);
      });
    } // eslint-disable-next-line


    vnode.elm.__component__ = c;
  });
};

var updateCustomComponent = function updateCustomComponent(vnode) {
  // eslint-disable-next-line
  var component = vnode && vnode.elm && vnode.elm.__component__;
  if (!component) return;
  var newProps = propsFromAttrs(vnode.data.attrs || {}, vnode.data.props || {});
  component.children = vnode.data.treeNode.children;
  Object.assign(component.props, newProps);
  component.update();
};

var destroyCustomComponent = function destroyCustomComponent(vnode) {
  // eslint-disable-next-line
  var component = vnode && vnode.elm && vnode.elm.__component__;

  if (component) {
    var el = component.el,
        $el = component.$el;

    if (vnode.data && vnode.data.on && $el) {
      Object.keys(vnode.data.on).forEach(function (eventName) {
        $el.off(eventName, vnode.data.on[eventName]);
      });
    }

    if (component.destroy) component.destroy();
    if (el && el.parentNode) el.parentNode.removeChild(el);
    delete vnode.elm.__component__; // eslint-disable-line
  }
};

var isCustomComponent = function isCustomComponent(treeNodeType) {
  return typeof treeNodeType === 'function' || treeNodeType && treeNodeType.indexOf('-') > 0 && customComponents[treeNodeType];
};

function getHooks(treeNode, data, f7, initial, isRoot) {
  var hooks = {};
  var insert = [];
  var destroy = [];
  var update = [];
  var postpatch = [];
  var isFakeElement = false;
  var tagName = getTagName(treeNode);

  if (data && data.attrs && data.attrs.component) {
    // eslint-disable-next-line
    tagName = (_readOnlyError("tagName"), data.attrs.component);
    delete data.attrs.component;
    isFakeElement = true;
  }

  var isCustom = isCustomComponent(treeNode.type);

  if (isCustom) {
    insert.push(function (vnode) {
      if (vnode.sel !== tagName && !isFakeElement) return;
      createCustomComponent({
        f7: f7,
        treeNode: treeNode,
        vnode: vnode,
        data: data
      });
    });
    destroy.push(function (vnode) {
      destroyCustomComponent(vnode);
    });
    update.push(function (oldVnode, vnode) {
      updateCustomComponent(vnode);
    });
  }

  if (!isCustom) {
    if (!data || !data.attrs || !data.attrs.class) return hooks;
    var classNames = data.attrs.class;
    classNames.split(' ').forEach(function (className) {
      if (!initial) {
        insert.push.apply(insert, f7.getVnodeHooks('insert', className));
      }

      destroy.push.apply(destroy, f7.getVnodeHooks('destroy', className));
      update.push.apply(update, f7.getVnodeHooks('update', className));
      postpatch.push.apply(postpatch, f7.getVnodeHooks('postpatch', className));
    });
  }

  if (isRoot && !initial) {
    postpatch.push(function (oldVnode, vnode) {
      var vn = vnode || oldVnode;
      if (!vn) return;

      if (vn.data && vn.data.component) {
        vn.data.component.hook('onUpdated');
      }
    });
  }

  if (insert.length === 0 && destroy.length === 0 && update.length === 0 && postpatch.length === 0) {
    return hooks;
  }

  if (insert.length) {
    hooks.insert = function (vnode) {
      insert.forEach(function (f) {
        return f(vnode);
      });
    };
  }

  if (destroy.length) {
    hooks.destroy = function (vnode) {
      destroy.forEach(function (f) {
        return f(vnode);
      });
    };
  }

  if (update.length) {
    hooks.update = function (oldVnode, vnode) {
      update.forEach(function (f) {
        return f(oldVnode, vnode);
      });
    };
  }

  if (postpatch.length) {
    hooks.postpatch = function (oldVnode, vnode) {
      postpatch.forEach(function (f) {
        return f(oldVnode, vnode);
      });
    };
  }

  return hooks;
}

var getEventHandler = function getEventHandler(eventHandler, _temp) {
  var _ref2 = _temp === void 0 ? {} : _temp,
      stop = _ref2.stop,
      prevent = _ref2.prevent,
      once = _ref2.once;

  var fired = false;

  function handler() {
    var e = arguments.length <= 0 ? undefined : arguments[0];
    if (once && fired) return;
    if (stop) e.stopPropagation();
    if (prevent) e.preventDefault();
    fired = true;
    eventHandler.apply(void 0, arguments);
  }

  return handler;
};

var getData = function getData(treeNode, component, f7, initial, isRoot) {
  var data = {
    component: component,
    treeNode: treeNode
  };
  var tagName = getTagName(treeNode);
  Object.keys(treeNode.props).forEach(function (attrName) {
    var attrValue = treeNode.props[attrName];
    if (typeof attrValue === 'undefined') return;

    if (PROPS_ATTRS.indexOf(attrName) >= 0) {
      // Props
      if (!data.props) data.props = {};

      if (attrName === 'readonly') {
        // eslint-disable-next-line
        attrName = 'readOnly';
      }

      if (attrName === 'routeProps') {
        // eslint-disable-next-line
        attrName = 'f7RouteProps';
      }

      if (tagName === 'option' && attrName === 'value') {
        if (!data.attrs) data.attrs = {};
        data.attrs.value = attrValue;
      }

      if (BOOLEAN_PROPS.indexOf(attrName) >= 0) {
        // eslint-disable-next-line
        data.props[attrName] = attrValue === false ? false : true;
      } else {
        data.props[attrName] = attrValue;
      }
    } else if (attrName === 'key') {
      // Key
      data.key = attrValue;
    } else if (attrName.indexOf('@') === 0 || attrName.indexOf('on') === 0 && attrName.length > 2) {
      // Events
      if (!data.on) data.on = {};
      var eventName = attrName.indexOf('@') === 0 ? attrName.substr(1) : eventNameToColonCase(attrName.substr(2));
      var stop = false;
      var prevent = false;
      var once = false;

      if (eventName.indexOf('.') >= 0) {
        eventName.split('.').forEach(function (eventNamePart, eventNameIndex) {
          if (eventNameIndex === 0) eventName = eventNamePart;else {
            if (eventNamePart === 'stop') stop = true;
            if (eventNamePart === 'prevent') prevent = true;
            if (eventNamePart === 'once') once = true;
          }
        });
      }

      data.on[eventName] = getEventHandler(attrValue, {
        stop: stop,
        prevent: prevent,
        once: once
      });
    } else if (attrName === 'style') {
      // Style
      if (typeof attrValue !== 'string') {
        data.style = attrValue;
      } else {
        if (!data.attrs) data.attrs = {};
        data.attrs.style = attrValue;
      }
    } else {
      // Rest of attribures
      if (!data.attrs) data.attrs = {};
      data.attrs[attrName] = attrValue; // ID -> Key

      if (attrName === 'id' && !data.key && !isRoot) {
        data.key = attrValue;
      }
    }
  });
  var hooks = getHooks(treeNode, data, f7, initial, isRoot);

  hooks.prepatch = function (oldVnode, vnode) {
    if (!oldVnode || !vnode) return;

    if (oldVnode && oldVnode.data && oldVnode.data.props) {
      Object.keys(oldVnode.data.props).forEach(function (key) {
        if (BOOLEAN_PROPS.indexOf(key) < 0) return;
        if (!vnode.data) vnode.data = {};
        if (!vnode.data.props) vnode.data.props = {};

        if (oldVnode.data.props[key] === true && !(key in vnode.data.props)) {
          vnode.data.props[key] = false;
        }
      });
    }
  };

  data.hook = hooks;
  return data;
};

var getChildren = function getChildren(treeNode, component, f7, initial) {
  if (treeNode && treeNode.type && SELF_CLOSING.indexOf(treeNode.type) >= 0) {
    return [];
  }

  var children = [];
  var nodes = treeNode.children;

  for (var i = 0; i < nodes.length; i += 1) {
    var childNode = nodes[i];
    var child = treeNodeToVNode(childNode, component, f7, initial, false);

    if (Array.isArray(child)) {
      children.push.apply(children, child);
    } else if (child) {
      children.push(child);
    }
  }

  return children;
};

var getSlots = function getSlots(treeNode, component, f7, initial) {
  var slotName = treeNode.props.name || 'default';
  var slotNodes = (component.children || []).filter(function (childTreeNode) {
    var childSlotName = 'default';

    if (childTreeNode.props) {
      childSlotName = childTreeNode.props.slot || 'default';
    }

    return childSlotName === slotName;
  });

  if (slotNodes.length === 0) {
    return getChildren(treeNode, component, f7, initial);
  }

  return slotNodes.map(function (subTreeNode) {
    return treeNodeToVNode(subTreeNode, component, f7, initial);
  });
};

var isTreeNode = function isTreeNode(treeNode) {
  return isObject(treeNode) && 'props' in treeNode && 'type' in treeNode && 'children' in treeNode;
};

var treeNodeToVNode = function treeNodeToVNode(treeNode, component, f7, initial, isRoot) {
  if (!isTreeNode(treeNode)) {
    return String(treeNode);
  }

  if (treeNode.type === 'slot') {
    return getSlots(treeNode, component, f7, initial);
  }

  var data = getData(treeNode, component, f7, initial, isRoot);
  var children = isCustomComponent(treeNode.type) ? [] : getChildren(treeNode, component, f7, initial);
  return h(getTagName(treeNode), data, children);
};

export default function vdom(tree, component, initial) {
  if (tree === void 0) {
    tree = {};
  }

  return treeNodeToVNode(tree, component, component.f7, initial, true);
}