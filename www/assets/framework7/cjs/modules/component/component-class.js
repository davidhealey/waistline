"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _$h = _interopRequireDefault(require("./$h"));

var _utils = require("../../shared/utils");

var _vdom = _interopRequireDefault(require("./vdom"));

var _patch = _interopRequireDefault(require("./patch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-underscore-dangle: "off" */
var Component = /*#__PURE__*/function () {
  function Component(app, component, props, _temp) {
    var _this = this;

    if (props === void 0) {
      props = {};
    }

    var _ref = _temp === void 0 ? {} : _temp,
        el = _ref.el,
        context = _ref.context,
        children = _ref.children;

    var document = (0, _ssrWindow.getDocument)();
    (0, _utils.merge)(this, {
      f7: app,
      props: props || {},
      context: context || {},
      id: component.id || (0, _utils.id)(),
      children: children || [],
      theme: {
        ios: app.theme === 'ios',
        md: app.theme === 'md',
        aurora: app.theme === 'aurora'
      },
      style: component.style,
      __storeCallbacks: [],
      __updateQueue: [],
      __eventHandlers: [],
      __onceEventHandlers: [],
      __onBeforeMount: [],
      __onMounted: [],
      __onBeforeUpdate: [],
      __onUpdated: [],
      __onBeforeUnmount: [],
      __onUnmounted: []
    });

    var createComponent = function createComponent() {
      return component(_this.props, _this.getComponentContext(true));
    };

    var getRenderFuncion = function getRenderFuncion(componentResult) {
      return new Promise(function (resolve, reject) {
        if (typeof componentResult === 'function') {
          resolve(componentResult);
        } else if (componentResult instanceof Promise) {
          componentResult.then(function (render) {
            resolve(render);
          }).catch(function (err) {
            reject(err);
          });
        } else {
          reject(new Error('Framework7: Component render function is not a "function" type. Didn\'t you forget to "return $render"?'));
        }
      });
    };

    return new Promise(function (resolve, reject) {
      var componentResult = createComponent();
      getRenderFuncion(componentResult).then(function (render) {
        _this.renderFunction = render;

        var tree = _this.render();

        if (el) {
          _this.vnode = (0, _vdom.default)(tree, _this, true);

          if (_this.style) {
            _this.styleEl = document.createElement('style');
            _this.styleEl.innerHTML = _this.style;
          }

          _this.el = el;
          (0, _patch.default)(_this.el, _this.vnode);
          _this.el = _this.vnode.elm;
          _this.$el = (0, _dom.default)(_this.el);

          _this.attachEvents();

          _this.el.f7Component = _this;

          _this.mount();

          resolve(_this);
          return;
        } // Make Dom


        if (tree) {
          _this.vnode = (0, _vdom.default)(tree, _this, true);
          _this.el = document.createElement(_this.vnode.sel || 'div');
          (0, _patch.default)(_this.el, _this.vnode);
          _this.$el = (0, _dom.default)(_this.el);
        }

        if (_this.style) {
          _this.styleEl = document.createElement('style');
          _this.styleEl.innerHTML = _this.style;
        }

        _this.attachEvents();

        if (_this.el) {
          _this.el.f7Component = _this;
        }

        resolve(_this);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  var _proto = Component.prototype;

  _proto.on = function on(eventName, handler) {
    if (!this.__eventHandlers) return;

    this.__eventHandlers.push({
      eventName: eventName,
      handler: handler
    });
  };

  _proto.once = function once(eventName, handler) {
    if (!this.__eventHandlers) return;

    this.__onceEventHandlers.push({
      eventName: eventName,
      handler: handler
    });
  };

  _proto.getComponentStore = function getComponentStore() {
    var _this2 = this;

    var _this$f7$store = this.f7.store,
        state = _this$f7$store.state,
        getters = _this$f7$store.getters,
        dispatch = _this$f7$store.dispatch;
    var $store = {
      state: state,
      dispatch: dispatch
    };
    $store.getters = new Proxy(getters, {
      get: function get(target, prop) {
        var obj = target[prop];

        var callback = function callback() {
          _this2.update();
        };

        obj.onUpdated(callback);

        _this2.__storeCallbacks.push(callback, obj.__callback);

        return obj;
      }
    });
    return $store;
  };

  _proto.getComponentContext = function getComponentContext(includeHooks) {
    var _this3 = this;

    var ctx = {
      $f7route: this.context.f7route,
      $f7router: this.context.f7router,
      $h: _$h.default,
      $: _dom.default,
      $id: this.id,
      $f7: this.f7,
      $f7ready: this.f7ready.bind(this),
      $theme: this.theme,
      $tick: this.tick.bind(this),
      $update: this.update.bind(this),
      $emit: this.emit.bind(this),
      $store: this.getComponentStore(),
      $el: {}
    };
    Object.defineProperty(ctx.$el, 'value', {
      get: function get() {
        return _this3.$el;
      }
    });
    if (includeHooks) Object.assign(ctx, {
      $on: this.on.bind(this),
      $once: this.once.bind(this),
      $onBeforeMount: function $onBeforeMount(handler) {
        return _this3.__onBeforeMount.push(handler);
      },
      $onMounted: function $onMounted(handler) {
        return _this3.__onMounted.push(handler);
      },
      $onBeforeUpdate: function $onBeforeUpdate(handler) {
        return _this3.__onBeforeUpdate.push(handler);
      },
      $onUpdated: function $onUpdated(handler) {
        return _this3.__onUpdated.push(handler);
      },
      $onBeforeUnmount: function $onBeforeUnmount(handler) {
        return _this3.__onBeforeUnmount.push(handler);
      },
      $onUnmounted: function $onUnmounted(handler) {
        return _this3.__onUnmounted.push(handler);
      }
    });
    return ctx;
  };

  _proto.render = function render() {
    return this.renderFunction(this.getComponentContext());
  };

  _proto.emit = function emit(name, data) {
    if (!this.el) return;
    this.$el.trigger(name, data);
  };

  _proto.attachEvents = function attachEvents() {
    var $el = this.$el;
    if (!this.__eventHandlers) return;

    this.__eventHandlers.forEach(function (_ref2) {
      var eventName = _ref2.eventName,
          handler = _ref2.handler;
      $el.on((0, _utils.eventNameToColonCase)(eventName), handler);
    });

    this.__onceEventHandlers.forEach(function (_ref3) {
      var eventName = _ref3.eventName,
          handler = _ref3.handler;
      $el.once((0, _utils.eventNameToColonCase)(eventName), handler);
    });
  };

  _proto.detachEvents = function detachEvents() {
    var $el = this.$el;
    if (!this.__eventHandlers) return;

    this.__eventHandlers.forEach(function (_ref4) {
      var eventName = _ref4.eventName,
          handler = _ref4.handler;
      $el.on((0, _utils.eventNameToColonCase)(eventName), handler);
    });

    this.__onceEventHandlers.forEach(function (_ref5) {
      var eventName = _ref5.eventName,
          handler = _ref5.handler;
      $el.once((0, _utils.eventNameToColonCase)(eventName), handler);
    });
  };

  _proto.startUpdateQueue = function startUpdateQueue() {
    var _this4 = this;

    var window = (0, _ssrWindow.getWindow)();
    if (this.__requestAnimationFrameId) return;

    var update = function update() {
      _this4.hook('onBeforeUpdate');

      var tree = _this4.render(); // Make Dom


      if (tree) {
        var newVNode = (0, _vdom.default)(tree, _this4, false);
        _this4.vnode = (0, _patch.default)(_this4.vnode, newVNode);
      }
    };

    this.__requestAnimationFrameId = window.requestAnimationFrame(function () {
      if (_this4.__updateIsPending) update();
      var resolvers = [].concat(_this4.__updateQueue);
      _this4.__updateQueue = [];
      _this4.__updateIsPending = false;
      window.cancelAnimationFrame(_this4.__requestAnimationFrameId);
      delete _this4.__requestAnimationFrameId;
      delete _this4.__updateIsPending;
      resolvers.forEach(function (resolver) {
        return resolver();
      });
      resolvers = [];
    });
  };

  _proto.tick = function tick(callback) {
    var _this5 = this;

    return new Promise(function (resolve) {
      function resolver() {
        resolve();
        if (callback) callback();
      }

      _this5.__updateQueue.push(resolver);

      _this5.startUpdateQueue();
    });
  };

  _proto.update = function update(callback) {
    var _this6 = this;

    if (this.__destroyed) return new Promise(function () {});
    return new Promise(function (resolve) {
      var resolver = function resolver() {
        resolve();
        if (callback) callback();
      };

      _this6.__updateIsPending = true;

      _this6.__updateQueue.push(resolver);

      _this6.startUpdateQueue();
    });
  };

  _proto.setState = function setState(callback) {
    return this.update(callback);
  };

  _proto.f7ready = function f7ready(callback) {
    var _this7 = this;

    if (this.f7.initialized) {
      callback(this.f7);
      return;
    }

    this.f7.once('init', function () {
      callback(_this7.f7);
    });
  };

  _proto.mount = function mount(mountMethod) {
    this.hook('onBeforeMount', this.$el);
    if (this.styleEl) (0, _dom.default)('head').append(this.styleEl);
    if (mountMethod) mountMethod(this.el);
    this.hook('onMounted', this.$el);
  };

  _proto.destroy = function destroy() {
    var _this8 = this;

    if (this.__destroyed) return;
    var window = (0, _ssrWindow.getWindow)();
    this.hook('onBeforeUnmount');
    if (this.styleEl) (0, _dom.default)(this.styleEl).remove();
    this.detachEvents();
    this.hook('onUnmounted'); // Delete component instance

    if (this.el && this.el.f7Component) {
      this.el.f7Component = null;
      delete this.el.f7Component;
    } // Patch with empty node


    if (this.vnode) {
      this.vnode = (0, _patch.default)(this.vnode, {
        sel: this.vnode.sel,
        data: {}
      });
    } // Clear update queue


    window.cancelAnimationFrame(this.__requestAnimationFrameId);

    this.__storeCallbacks.forEach(function (callback) {
      _this8.f7.store.__removeCallback(callback);
    });

    this.__storeCallbacks = [];
    this.__updateQueue = [];
    this.__eventHandlers = [];
    this.__onceEventHandlers = [];
    this.__onBeforeMount = [];
    this.__onMounted = [];
    this.__onBeforeUpdate = [];
    this.__onUpdated = [];
    this.__onBeforeUnmount = [];
    this.__onUnmounted = []; // Delete all props

    (0, _utils.deleteProps)(this);
    this.__destroyed = true;
  };

  _proto.hook = function hook(name) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (this.__destroyed) return;
    this["__" + name].forEach(function (handler) {
      handler.apply(void 0, args);
    });
  };

  return Component;
}();

var _default = Component;
exports.default = _default;