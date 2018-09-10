import _Promise from 'babel-runtime/core-js/promise';
import _typeof from 'babel-runtime/helpers/typeof';
import _Object$keys from 'babel-runtime/core-js/object/keys';
import _Array$from from 'babel-runtime/core-js/array/from';
import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import onsElements from './elements';
import styler from './styler';
import internal from './internal';
import autoStyle from './autostyle';
import ModifierUtil from './internal/modifier-util';
import animationOptionsParse from './animation-options-parser';
import platform from './platform';

var util = {};
var errorPrefix = '[Onsen UI]';

util.globals = {
  fabOffset: 0,
  errorPrefix: errorPrefix,
  supportsPassive: false
};

platform._runOnActualPlatform(function () {
  util.globals.actualMobileOS = platform.getMobileOS();
  util.globals.isUIWebView = platform.isUIWebView();
  util.globals.isWKWebView = platform.isWKWebView();
});

try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function get() {
      util.globals.supportsPassive = true;
    }
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (e) {
  null;
}

/**
 * @param {Element} el Target
 * @param {String} name Event name
 * @param {Function} handler Event handler
 * @param {Object} [opt] Event options (passive, capture...)
 * @param {Boolean} [isGD] If comes from GestureDetector. Just for testing.
 */
util.addEventListener = function (el, name, handler, opt, isGD) {
  el.addEventListener(name, handler, util.globals.supportsPassive ? opt : (opt || {}).capture);
};
util.removeEventListener = function (el, name, handler, opt, isGD) {
  el.removeEventListener(name, handler, util.globals.supportsPassive ? opt : (opt || {}).capture);
};

/**
 * @param {String/Function} query dot class name or node name or matcher function.
 * @return {Function}
 */
util.prepareQuery = function (query) {
  return query instanceof Function ? query : function (element) {
    return util.match(element, query);
  };
};

/**
 * @param {Element} e
 * @param {String/Function} s CSS Selector.
 * @return {Boolean}
 */
util.match = function (e, s) {
  return (e.matches || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector).call(e, s);
};

/**
 * @param {Element} element
 * @param {String/Function} query dot class name or node name or matcher function.
 * @return {HTMLElement/null}
 */
util.findChild = function (element, query) {
  var match = util.prepareQuery(query);

  // Caution: `element.children` is `undefined` in some environments if `element` is `svg`
  for (var i = 0; i < element.childNodes.length; i++) {
    var node = element.childNodes[i];
    if (node.nodeType !== Node.ELEMENT_NODE) {
      // process only element nodes
      continue;
    }
    if (match(node)) {
      return node;
    }
  }
  return null;
};

/**
 * @param {Element} element
 * @param {String/Function} query dot class name or node name or matcher function.
 * @return {HTMLElement/null}
 */
util.findParent = function (element, query, until) {
  var match = util.prepareQuery(query);

  var parent = element.parentNode;
  for (;;) {
    if (!parent || parent === document || parent instanceof DocumentFragment || until && until(parent)) {
      return null;
    } else if (match(parent)) {
      return parent;
    }
    parent = parent.parentNode;
  }
};

/**
 * @param {Element} element
 * @return {boolean}
 */
util.isAttached = function (element) {
  return document.body.contains(element);
};

/**
 * @param {Element} element
 * @return {boolean}
 */
util.hasAnyComponentAsParent = function (element) {
  while (element && document.documentElement !== element) {
    element = element.parentNode;
    if (element && element.nodeName.toLowerCase().match(/(ons-navigator|ons-tabbar|ons-modal)/)) {
      return true;
    }
  }
  return false;
};

/**
 * @param {Object} element
 * @return {Array}
 */
util.getAllChildNodes = function (element) {
  var _ref;

  return (_ref = [element]).concat.apply(_ref, _toConsumableArray(_Array$from(element.children).map(function (childEl) {
    return util.getAllChildNodes(childEl);
  })));
};

/**
 * @param {Element} element
 * @return {boolean}
 */
util.isPageControl = function (element) {
  return element.nodeName.match(/^ons-(navigator|splitter|tabbar|page)$/i);
};

/**
 * @param {Element} element
 * @param {String} action to propagate
 */
util.propagateAction = function (element, action) {
  for (var i = 0; i < element.childNodes.length; i++) {
    var child = element.childNodes[i];
    if (child[action] instanceof Function) {
      child[action]();
    } else {
      util.propagateAction(child, action);
    }
  }
};

/**
 * @param {String} string - string to be camelized
 * @return {String} Camelized string
 */
util.camelize = function (string) {
  return string.toLowerCase().replace(/-([a-z])/g, function (m, l) {
    return l.toUpperCase();
  });
};

/**
 * @param {String} string - string to be hyphenated
 * @return {String} Hyphenated string
 */
util.hyphenate = function (string) {
  return string.replace(/([a-zA-Z])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * @param {String} selector - tag and class only
 * @param {Object} style
 * @param {Element}
 */
util.create = function () {
  var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var classList = selector.split('.');
  var element = document.createElement(classList.shift() || 'div');

  if (classList.length) {
    element.className = classList.join(' ');
  }

  styler(element, style);

  return element;
};

/**
 * @param {String} html
 * @return {Element}
 */
util.createElement = function (html) {
  var wrapper = document.createElement('div');

  if (html instanceof DocumentFragment) {
    wrapper.appendChild(document.importNode(html, true));
  } else {
    wrapper.innerHTML = html.trim();
  }

  if (wrapper.children.length > 1) {
    util.throw('HTML template must contain a single root element');
  }

  var element = wrapper.children[0];
  wrapper.children[0].remove();
  return element;
};

/**
 * @param {String} html
 * @return {HTMLFragment}
 */
util.createFragment = function (html) {
  var template = document.createElement('template');
  template.innerHTML = html;
  return document.importNode(template.content, true);
};

/*
 * @param {Object} dst Destination object.
 * @param {...Object} src Source object(s).
 * @returns {Object} Reference to `dst`.
 */
util.extend = function (dst) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  for (var i = 0; i < args.length; i++) {
    if (args[i]) {
      var keys = _Object$keys(args[i]);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        dst[key] = args[i][key];
      }
    }
  }

  return dst;
};

/**
 * @param {Object} arrayLike
 * @return {Array}
 */
util.arrayFrom = function (arrayLike) {
  return Array.prototype.slice.apply(arrayLike);
};

/**
 * @param {String} jsonString
 * @param {Object} [failSafe]
 * @return {Object}
 */
util.parseJSONObjectSafely = function (jsonString) {
  var failSafe = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  try {
    var result = JSON.parse('' + jsonString);
    if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object' && result !== null) {
      return result;
    }
  } catch (e) {
    return failSafe;
  }
  return failSafe;
};

/**
 * @param {String} path - path such as 'myApp.controllers.data.loadData'
 * @return {Any} - whatever is located at that path
 */
util.findFromPath = function (path) {
  path = path.split('.');
  var el = window,
      key;
  while (key = path.shift()) {
    // eslint-disable-line no-cond-assign
    el = el[key];
  }
  return el;
};

/**
 * @param {HTMLElement} container - Page or page-container that implements 'topPage'
 * @return {HTMLElement|null} - Visible page element or null if not found.
 */
util.getTopPage = function (container) {
  return container && (container.tagName.toLowerCase() === 'ons-page' ? container : container.topPage) || null;
};

/**
 * @param {HTMLElement} container - Element where the search begins
 * @return {HTMLElement|null} - Page element that contains the visible toolbar or null.
 */
util.findToolbarPage = function (container) {
  var page = util.getTopPage(container);

  if (page) {
    if (page._canAnimateToolbar()) {
      return page;
    }

    for (var i = 0; i < page._contentElement.children.length; i++) {
      var nextPage = util.getTopPage(page._contentElement.children[i]);
      if (nextPage && !/ons-tabbar/i.test(page._contentElement.children[i].tagName)) {
        return util.findToolbarPage(nextPage);
      }
    }
  }

  return null;
};

/**
 * @param {Element} element
 * @param {String} eventName
 * @param {Object} [detail]
 * @return {CustomEvent}
 */
util.triggerElementEvent = function (target, eventName) {
  var detail = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


  var event = new CustomEvent(eventName, {
    bubbles: true,
    cancelable: true,
    detail: detail
  });

  _Object$keys(detail).forEach(function (key) {
    event[key] = detail[key];
  });

  target.dispatchEvent(event);

  return event;
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @return {Boolean}
 */
util.hasModifier = function (target, modifierName) {
  if (!target.hasAttribute('modifier')) {
    return false;
  }

  return RegExp('(^|\\s+)' + modifierName + '($|\\s+)', 'i').test(target.getAttribute('modifier'));
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @param {Object} options.autoStyle Maps the modifierName to the corresponding styled modifier.
 * @param {Object} options.forceAutoStyle Ignores platform limitation.
 * @return {Boolean} Whether it was added or not.
 */
util.addModifier = function (target, modifierName) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (options.autoStyle) {
    modifierName = autoStyle.mapModifier(modifierName, target, options.forceAutoStyle);
  }

  if (util.hasModifier(target, modifierName)) {
    return false;
  }

  target.setAttribute('modifier', ((target.getAttribute('modifier') || '') + ' ' + modifierName).trim());
  return true;
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @param {Object} options.autoStyle Maps the modifierName to the corresponding styled modifier.
 * @param {Object} options.forceAutoStyle Ignores platform limitation.
 * @return {Boolean} Whether it was found or not.
 */
util.removeModifier = function (target, modifierName) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (options.autoStyle) {
    modifierName = autoStyle.mapModifier(modifierName, target, options.forceAutoStyle);
  }

  if (!target.getAttribute('modifier') || !util.hasModifier(target, modifierName)) {
    return false;
  }

  var newModifiers = target.getAttribute('modifier').split(/\s+/).filter(function (m) {
    return m && m !== modifierName;
  });
  newModifiers.length ? target.setAttribute('modifier', newModifiers.join(' ')) : target.removeAttribute('modifier');
  return true;
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @param {Boolean} options.force Forces modifier to be added or removed.
 * @param {Object} options.autoStyle Maps the modifierName to the corresponding styled modifier.
 * @param {Boolean} options.forceAutoStyle Ignores platform limitation.
 * @return {Boolean} Whether it was found or not.
 */
util.toggleModifier = function () {
  var options = arguments.length > 2 ? arguments.length <= 2 ? undefined : arguments[2] : {};
  var force = typeof options === 'boolean' ? options : options.force;

  var toggle = typeof force === 'boolean' ? force : !util.hasModifier.apply(util, arguments);
  toggle ? util.addModifier.apply(util, arguments) : util.removeModifier.apply(util, arguments);
};

/**
 * @param {Element} el
 * @param {String} defaultClass
 * @param {Object} scheme
 */
util.restoreClass = function (el, defaultClass, scheme) {
  defaultClass.split(/\s+/).forEach(function (c) {
    return c !== '' && !el.classList.contains(c) && el.classList.add(c);
  });
  el.hasAttribute('modifier') && ModifierUtil.refresh(el, scheme);
};

// TODO: FIX
util.updateParentPosition = function (el) {
  if (!el._parentUpdated && el.parentElement) {
    if (window.getComputedStyle(el.parentElement).getPropertyValue('position') === 'static') {
      el.parentElement.style.position = 'relative';
    }
    el._parentUpdated = true;
  }
};

util.toggleAttribute = function (element, name, value) {
  if (value) {
    element.setAttribute(name, typeof value === 'boolean' ? '' : value);
  } else {
    element.removeAttribute(name);
  }
};

util.bindListeners = function (element, listenerNames) {
  listenerNames.forEach(function (name) {
    var boundName = name.replace(/^_[a-z]/, '_bound' + name[1].toUpperCase());
    element[boundName] = element[boundName] || element[name].bind(element);
  });
};

util.each = function (obj, f) {
  return _Object$keys(obj).forEach(function (key) {
    return f(key, obj[key]);
  });
};

/**
 * @param {Element} target
 * @param {boolean} hasRipple
 * @param {Object} attrs
 */
util.updateRipple = function (target, hasRipple) {
  var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (hasRipple === undefined) {
    hasRipple = target.hasAttribute('ripple');
  }

  var rippleElement = util.findChild(target, 'ons-ripple');

  if (hasRipple) {
    if (!rippleElement) {
      var element = document.createElement('ons-ripple');
      _Object$keys(attrs).forEach(function (key) {
        return element.setAttribute(key, attrs[key]);
      });
      target.insertBefore(element, target.firstChild);
    }
  } else if (rippleElement) {
    rippleElement.remove();
  }
};

/**
 * @param {String}
 * @return {Object}
 */
util.animationOptionsParse = animationOptionsParse;

/**
 * @param {*} value
 */
util.isInteger = function (value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};

/**
 * @return {Object} Deferred promise.
 */
util.defer = function () {
  var deferred = {};
  deferred.promise = new _Promise(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

/**
 * Show warnings when they are enabled.
 *
 * @param {*} arguments to console.warn
 */
util.warn = function () {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  if (!internal.config.warningsDisabled) {
    var _console;

    (_console = console).warn.apply(_console, [errorPrefix].concat(args));
  }
};

util.throw = function (message) {
  throw new Error(errorPrefix + ' ' + message);
};

util.throwAbstract = function () {
  return util.throw('Cannot instantiate abstract class');
};
util.throwMember = function () {
  return util.throw('Class member must be implemented');
};
util.throwPageLoader = function () {
  return util.throw('First parameter should be an instance of PageLoader');
};
util.throwAnimator = function (el) {
  return util.throw('"Animator" param must inherit ' + el + 'Animator');
};

var prevent = function prevent(e) {
  return e.cancelable && e.preventDefault();
};

/**
 * Prevent scrolling while draging horizontally on iOS.
 *
 * @param {gd} GestureDetector instance
 */
util.iosPreventScroll = function (gd) {
  if (util.globals.actualMobileOS === 'ios') {
    var clean = function clean(e) {
      gd.off('touchmove', prevent);
      gd.off('dragend', clean);
    };

    gd.on('touchmove', prevent);
    gd.on('dragend', clean);
  }
};

/**
 * Prevents scroll in underlying pages on iOS. See #2220 #2274 #1949
 *
 * @param {el} HTMLElement that prevents the events
 * @param {add} Boolean Add or remove event listeners
 */
util.iosPageScrollFix = function (add) {
  // Full fix - May cause issues with UIWebView's momentum scroll
  if (util.globals.actualMobileOS === 'ios') {
    document.body.classList.toggle('ons-ios-scroll', add); // Allows custom and localized fixes (#2274)
    if (!util.globals.isUIWebView || internal.config.forceUIWebViewScrollFix) {
      document.body.classList.toggle('ons-ios-scroll-fix', add);
    }
  }
};
util.iosMaskScrollFix = function (el, add) {
  // Half fix - only prevents scroll on masks
  if (util.globals.isUIWebView) {
    var action = (add ? 'add' : 'remove') + 'EventListener';
    el[action]('touchmove', prevent, false);
  }
};

/**
 * Distance and deltaTime filter some weird dragstart events that are not fired immediately.
 *
 * @param {event}
 */
util.isValidGesture = function (event) {
  return event.gesture !== undefined && (event.gesture.distance <= 15 || event.gesture.deltaTime <= 100);
};

util.checkMissingImport = function () {
  for (var _len3 = arguments.length, elementNames = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    elementNames[_key3] = arguments[_key3];
  }

  elementNames.forEach(function (name) {
    if (!onsElements[name]) {
      util.throw('Ons' + name + ' is required but was not imported (Custom Elements)');
    }
  });
};

export default util;