"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _utils = require("../../shared/utils");

var _getDevice = require("../../shared/get-device");

var _getSupport = require("../../shared/get-support");

var _class = _interopRequireDefault(require("../../shared/class"));

var _eventsClass = _interopRequireDefault(require("../../shared/events-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

var _modalMethods = _interopRequireDefault(require("../../shared/modal-methods"));

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _loadModule = _interopRequireDefault(require("./load-module"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Framework7 = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Framework7, _Framework7Class);

  function Framework7(params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params) || this; // eslint-disable-next-line

    if (Framework7.instance && typeof window !== 'undefined') {
      throw new Error("Framework7 is already initialized and can't be initialized more than once");
    }

    var device = (0, _getDevice.getDevice)({
      userAgent: params.userAgent || undefined
    });
    var support = (0, _getSupport.getSupport)();
    var passedParams = (0, _utils.extend)({}, params); // App Instance

    var app = _assertThisInitialized(_this);

    app.device = device;
    app.support = support;
    var w = (0, _ssrWindow.getWindow)();
    var d = (0, _ssrWindow.getDocument)();
    Framework7.instance = app; // Default

    var defaults = {
      version: '1.0.0',
      id: 'io.framework7.myapp',
      el: 'body',
      theme: 'auto',
      language: w.navigator.language,
      routes: [],
      name: 'Framework7',
      lazyModulesPath: null,
      initOnDeviceReady: true,
      init: true,
      autoDarkTheme: false,
      iosTranslucentBars: true,
      iosTranslucentModals: true,
      component: undefined,
      componentUrl: undefined,
      userAgent: null,
      url: null
    }; // Extend defaults with modules params

    app.useModulesParams(defaults); // Extend defaults with passed params

    app.params = (0, _utils.extend)(defaults, params);
    (0, _utils.extend)(app, {
      // App Id
      id: app.params.id,
      // App Name
      name: app.params.name,
      // App version
      version: app.params.version,
      // Routes
      routes: app.params.routes,
      // Lang
      language: app.params.language,
      // Theme
      theme: function getTheme() {
        if (app.params.theme === 'auto') {
          if (device.ios) return 'ios';
          if (device.desktop && device.electron) return 'aurora';
          return 'md';
        }

        return app.params.theme;
      }(),
      // Initially passed parameters
      passedParams: passedParams,
      online: w.navigator.onLine
    });
    if (params.store) app.params.store = params.store; // Save Root

    if (app.$el && app.$el[0]) {
      app.$el[0].f7 = app;
    } // Install Modules


    app.useModules(); // Init Store

    app.initStore(); // Init

    if (app.params.init) {
      if (device.cordova && app.params.initOnDeviceReady) {
        (0, _dom.default)(d).on('deviceready', function () {
          app.init();
        });
      } else {
        app.init();
      }
    } // Return app instance


    return app || _assertThisInitialized(_this);
  }

  var _proto = Framework7.prototype;

  _proto.mount = function mount(rootEl) {
    var app = this;
    var window = (0, _ssrWindow.getWindow)();
    var document = (0, _ssrWindow.getDocument)();
    var $rootEl = (0, _dom.default)(rootEl || app.params.el).eq(0);
    app.$el = $rootEl;

    if (app.$el && app.$el[0]) {
      app.el = app.$el[0];
      app.el.f7 = app;
      app.rtl = $rootEl.css('direction') === 'rtl';
    } // Auto Dark Theme


    var DARK = '(prefers-color-scheme: dark)';
    var LIGHT = '(prefers-color-scheme: light)';
    app.mq = {};

    if (window.matchMedia) {
      app.mq.dark = window.matchMedia(DARK);
      app.mq.light = window.matchMedia(LIGHT);
    }

    app.colorSchemeListener = function colorSchemeListener(_ref) {
      var matches = _ref.matches,
          media = _ref.media;

      if (!matches) {
        return;
      }

      var html = document.querySelector('html');

      if (media === DARK) {
        html.classList.add('theme-dark');
        app.darkTheme = true;
        app.emit('darkThemeChange', true);
      } else if (media === LIGHT) {
        html.classList.remove('theme-dark');
        app.darkTheme = false;
        app.emit('darkThemeChange', false);
      }
    };

    app.emit('mount');
  };

  _proto.initStore = function initStore() {
    var app = this;

    if (typeof app.params.store !== 'undefined' && app.params.store.__store) {
      app.store = app.params.store;
    } else {
      app.store = app.createStore(app.params.store);
    }
  };

  _proto.enableAutoDarkTheme = function enableAutoDarkTheme() {
    var window = (0, _ssrWindow.getWindow)();
    var document = (0, _ssrWindow.getDocument)();
    if (!window.matchMedia) return;
    var app = this;
    var html = document.querySelector('html');

    if (app.mq.dark && app.mq.light) {
      app.mq.dark.addListener(app.colorSchemeListener);
      app.mq.light.addListener(app.colorSchemeListener);
    }

    if (app.mq.dark && app.mq.dark.matches) {
      html.classList.add('theme-dark');
      app.darkTheme = true;
      app.emit('darkThemeChange', true);
    } else if (app.mq.light && app.mq.light.matches) {
      html.classList.remove('theme-dark');
      app.darkTheme = false;
      app.emit('darkThemeChange', false);
    }
  };

  _proto.disableAutoDarkTheme = function disableAutoDarkTheme() {
    var window = (0, _ssrWindow.getWindow)();
    if (!window.matchMedia) return;
    var app = this;
    if (app.mq.dark) app.mq.dark.removeListener(app.colorSchemeListener);
    if (app.mq.light) app.mq.light.removeListener(app.colorSchemeListener);
  };

  _proto.initAppComponent = function initAppComponent(callback) {
    var app = this;
    app.router.componentLoader(app.params.component, app.params.componentUrl, {
      componentOptions: {
        el: app.$el[0]
      }
    }, function (el) {
      app.$el = (0, _dom.default)(el);
      app.$el[0].f7 = app;
      app.$elComponent = el.f7Component;
      app.el = app.$el[0];
      if (callback) callback();
    }, function () {});
  };

  _proto.init = function init(rootEl) {
    var app = this;
    app.mount(rootEl);

    var init = function init() {
      if (app.initialized) return;
      app.$el.addClass('framework7-initializing'); // RTL attr

      if (app.rtl) {
        (0, _dom.default)('html').attr('dir', 'rtl');
      } // Auto Dark Theme


      if (app.params.autoDarkTheme) {
        app.enableAutoDarkTheme();
      } // Watch for online/offline state


      var window = (0, _ssrWindow.getWindow)();
      window.addEventListener('offline', function () {
        app.online = false;
        app.emit('offline');
        app.emit('connection', false);
      });
      window.addEventListener('online', function () {
        app.online = true;
        app.emit('online');
        app.emit('connection', true);
      }); // Root class

      app.$el.addClass('framework7-root'); // Theme class

      (0, _dom.default)('html').removeClass('ios md aurora').addClass(app.theme); // iOS Translucent

      var device = app.device;

      if (app.params.iosTranslucentBars && app.theme === 'ios' && device.ios) {
        (0, _dom.default)('html').addClass('ios-translucent-bars');
      }

      if (app.params.iosTranslucentModals && app.theme === 'ios' && device.ios) {
        (0, _dom.default)('html').addClass('ios-translucent-modals');
      } // Init class


      (0, _utils.nextFrame)(function () {
        app.$el.removeClass('framework7-initializing');
      }); // Emit, init other modules

      app.initialized = true;
      app.emit('init');
    };

    if (app.params.component || app.params.componentUrl) {
      app.initAppComponent(function () {
        init();
      });
    } else {
      init();
    }

    return app;
  } // eslint-disable-next-line
  ;

  _proto.loadModule = function loadModule() {
    return Framework7.loadModule.apply(Framework7, arguments);
  } // eslint-disable-next-line
  ;

  _proto.loadModules = function loadModules() {
    return Framework7.loadModules.apply(Framework7, arguments);
  };

  _proto.getVnodeHooks = function getVnodeHooks(hook, id) {
    var app = this;
    if (!app.vnodeHooks || !app.vnodeHooks[hook]) return [];
    return app.vnodeHooks[hook][id] || [];
  } // eslint-disable-next-line
  ;

  _createClass(Framework7, [{
    key: "$",
    get: function get() {
      return _dom.default;
    }
  }], [{
    key: "Dom7",
    get: function get() {
      return _dom.default;
    }
  }, {
    key: "$",
    get: function get() {
      return _dom.default;
    }
  }, {
    key: "device",
    get: function get() {
      return (0, _getDevice.getDevice)();
    }
  }, {
    key: "support",
    get: function get() {
      return (0, _getSupport.getSupport)();
    }
  }, {
    key: "Class",
    get: function get() {
      return _class.default;
    }
  }, {
    key: "Events",
    get: function get() {
      return _eventsClass.default;
    }
  }]);

  return Framework7;
}(_class.default);

Framework7.ModalMethods = _modalMethods.default;
Framework7.ConstructorMethods = _constructorMethods.default;
Framework7.loadModule = _loadModule.default;

Framework7.loadModules = function loadModules(modules) {
  return Promise.all(modules.map(function (module) {
    return Framework7.loadModule(module);
  }));
};

var _default = Framework7;
exports.default = _default;