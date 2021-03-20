"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _viewClass = _interopRequireDefault(require("./view-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCurrentView(app) {
  var $popoverView = (0, _dom.default)('.popover.modal-in .view');
  var $popupView = (0, _dom.default)('.popup.modal-in .view');
  var $panelView = (0, _dom.default)('.panel.panel-in .view');
  var $viewsEl = (0, _dom.default)('.views');
  if ($viewsEl.length === 0) $viewsEl = app.$el; // Find active view as tab

  var $viewEl = $viewsEl.children('.view');

  if ($viewEl.length === 0) {
    $viewEl = $viewsEl.children('.tabs').children('.view');
  } // Propably in tabs or split view


  if ($viewEl.length > 1) {
    if ($viewEl.hasClass('tab')) {
      // Tabs
      $viewEl = $viewsEl.children('.view.tab-active');

      if ($viewEl.length === 0) {
        $viewEl = $viewsEl.children('.tabs').children('.view.tab-active');
      }
    } else {// Split View, leave appView intact
    }
  }

  if ($popoverView.length > 0 && $popoverView[0].f7View) return $popoverView[0].f7View;
  if ($popupView.length > 0 && $popupView[0].f7View) return $popupView[0].f7View;
  if ($panelView.length > 0 && $panelView[0].f7View) return $panelView[0].f7View;

  if ($viewEl.length > 0) {
    if ($viewEl.length === 1 && $viewEl[0].f7View) return $viewEl[0].f7View;

    if ($viewEl.length > 1) {
      return app.views.main;
    }
  }

  return undefined;
}

var _default = {
  name: 'view',
  params: {
    view: {
      init: true,
      name: undefined,
      main: false,
      router: true,
      linksView: null,
      stackPages: false,
      xhrCache: true,
      xhrCacheIgnore: [],
      xhrCacheIgnoreGetParameters: false,
      xhrCacheDuration: 1000 * 60 * 10,
      // Ten minutes
      componentCache: true,
      preloadPreviousPage: true,
      allowDuplicateUrls: false,
      reloadPages: false,
      reloadDetail: false,
      masterDetailBreakpoint: 0,
      masterDetailResizable: false,
      removeElements: true,
      removeElementsWithTimeout: false,
      removeElementsTimeout: 0,
      restoreScrollTopOnBack: true,
      unloadTabContent: true,
      passRouteQueryToRequest: true,
      passRouteParamsToRequest: false,
      loadInitialPage: true,
      // Swipe Back
      iosSwipeBack: true,
      iosSwipeBackAnimateShadow: true,
      iosSwipeBackAnimateOpacity: true,
      iosSwipeBackActiveArea: 30,
      iosSwipeBackThreshold: 0,
      mdSwipeBack: false,
      mdSwipeBackAnimateShadow: true,
      mdSwipeBackAnimateOpacity: false,
      mdSwipeBackActiveArea: 30,
      mdSwipeBackThreshold: 0,
      auroraSwipeBack: false,
      auroraSwipeBackAnimateShadow: false,
      auroraSwipeBackAnimateOpacity: true,
      auroraSwipeBackActiveArea: 30,
      auroraSwipeBackThreshold: 0,
      // Push State
      browserHistory: false,
      browserHistoryRoot: undefined,
      browserHistoryAnimate: true,
      browserHistoryAnimateOnLoad: false,
      browserHistorySeparator: '#!',
      browserHistoryOnLoad: true,
      browserHistoryInitialMatch: false,
      browserHistoryStoreHistory: true,
      // Animate Pages
      animate: true,
      // iOS Dynamic Navbar
      iosDynamicNavbar: true,
      // Animate iOS Navbar Back Icon
      iosAnimateNavbarBackIcon: true,
      // Delays
      iosPageLoadDelay: 0,
      mdPageLoadDelay: 0,
      auroraPageLoadDelay: 0,
      // Routes hooks
      routesBeforeEnter: null,
      routesBeforeLeave: null
    }
  },
  static: {
    View: _viewClass.default
  },
  create: function create() {
    var app = this;
    (0, _utils.extend)(app, {
      views: (0, _utils.extend)([], {
        create: function create(el, params) {
          return new _viewClass.default(app, el, params);
        },
        get: function get(viewEl) {
          var $viewEl = (0, _dom.default)(viewEl);
          if ($viewEl.length && $viewEl[0].f7View) return $viewEl[0].f7View;
          return undefined;
        }
      })
    });
    Object.defineProperty(app.views, 'current', {
      enumerable: true,
      configurable: true,
      get: function get() {
        return getCurrentView(app);
      }
    }); // Alias

    app.view = app.views;
  },
  on: {
    init: function init() {
      var app = this;
      (0, _dom.default)('.view-init').each(function (viewEl) {
        if (viewEl.f7View) return;
        var viewParams = (0, _dom.default)(viewEl).dataset();
        app.views.create(viewEl, viewParams);
      });
    },
    'modalOpen panelOpen': function onOpen(instance) {
      var app = this;
      instance.$el.find('.view-init').each(function (viewEl) {
        if (viewEl.f7View) return;
        var viewParams = (0, _dom.default)(viewEl).dataset();
        app.views.create(viewEl, viewParams);
      });
    },
    'modalBeforeDestroy panelBeforeDestroy': function onClose(instance) {
      if (!instance || !instance.$el) return;
      instance.$el.find('.view-init').each(function (viewEl) {
        var view = viewEl.f7View;
        if (!view) return;
        view.destroy();
      });
    }
  },
  vnode: {
    'view-init': {
      insert: function insert(vnode) {
        var app = this;
        var viewEl = vnode.elm;
        if (viewEl.f7View) return;
        var viewParams = (0, _dom.default)(viewEl).dataset();
        app.views.create(viewEl, viewParams);
      },
      destroy: function destroy(vnode) {
        var viewEl = vnode.elm;
        var view = viewEl.f7View;
        if (!view) return;
        view.destroy();
      }
    }
  }
};
exports.default = _default;