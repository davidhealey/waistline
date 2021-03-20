"use strict";

exports.__esModule = true;
exports.tabLoad = tabLoad;
exports.tabRemove = tabRemove;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _history = _interopRequireDefault(require("../../shared/history"));

var _asyncComponent = _interopRequireDefault(require("./async-component"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function tabLoad(tabRoute, loadOptions) {
  if (loadOptions === void 0) {
    loadOptions = {};
  }

  var router = this;
  var options = (0, _utils.extend)({
    animate: router.params.animate,
    browserHistory: true,
    history: true,
    parentPageEl: null,
    preload: false,
    on: {}
  }, loadOptions);
  var currentRoute;
  var previousRoute;

  if (options.route) {
    // Set Route
    if (!options.preload && options.route !== router.currentRoute) {
      previousRoute = router.previousRoute;
      router.currentRoute = options.route;
    }

    if (options.preload) {
      currentRoute = options.route;
      previousRoute = router.currentRoute;
    } else {
      currentRoute = router.currentRoute;
      if (!previousRoute) previousRoute = router.previousRoute;
    } // Update Browser History


    if (router.params.browserHistory && options.browserHistory && !options.reloadPrevious) {
      _history.default.replace(router.view.id, {
        url: options.route.url
      }, (router.params.browserHistoryRoot || '') + router.params.browserHistorySeparator + options.route.url);
    } // Update Router History


    if (options.history) {
      router.history[Math.max(router.history.length - 1, 0)] = options.route.url;
      router.saveHistory();
    }
  } // Show Tab


  var $parentPageEl = (0, _dom.default)(options.parentPageEl || router.currentPageEl);
  var tabEl;

  if ($parentPageEl.length && $parentPageEl.find("#" + tabRoute.id).length) {
    tabEl = $parentPageEl.find("#" + tabRoute.id).eq(0);
  } else if (router.view.selector) {
    tabEl = router.view.selector + " #" + tabRoute.id;
  } else {
    tabEl = "#" + tabRoute.id;
  }

  var tabShowResult = router.app.tab.show({
    tabEl: tabEl,
    animate: options.animate,
    tabRoute: options.route
  });
  var $newTabEl = tabShowResult.$newTabEl,
      $oldTabEl = tabShowResult.$oldTabEl,
      animated = tabShowResult.animated,
      onTabsChanged = tabShowResult.onTabsChanged;

  if ($newTabEl && $newTabEl.parents('.page').length > 0 && options.route) {
    var tabParentPageData = $newTabEl.parents('.page')[0].f7Page;

    if (tabParentPageData && options.route) {
      tabParentPageData.route = options.route;
    }
  } // Tab Content Loaded


  function onTabLoaded(contentEl) {
    // Remove theme elements
    router.removeThemeElements($newTabEl);
    var tabEventTarget = $newTabEl;
    if (typeof contentEl !== 'string') tabEventTarget = (0, _dom.default)(contentEl);
    tabEventTarget.trigger('tab:init tab:mounted', tabRoute);
    router.emit('tabInit tabMounted', $newTabEl[0], tabRoute);

    if ($oldTabEl && $oldTabEl.length) {
      if (animated) {
        onTabsChanged(function () {
          router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

          if (router.params.unloadTabContent) {
            router.tabRemove($oldTabEl, $newTabEl, tabRoute);
          }
        });
      } else {
        router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

        if (router.params.unloadTabContent) {
          router.tabRemove($oldTabEl, $newTabEl, tabRoute);
        }
      }
    }
  }

  if ($newTabEl[0].f7RouterTabLoaded) {
    if (!$oldTabEl || !$oldTabEl.length) return router;

    if (animated) {
      onTabsChanged(function () {
        router.emit('routeChanged', router.currentRoute, router.previousRoute, router);
      });
    } else {
      router.emit('routeChanged', router.currentRoute, router.previousRoute, router);
    }

    return router;
  } // Load Tab Content


  function loadTab(loadTabParams, loadTabOptions) {
    // Load Tab Props
    var url = loadTabParams.url,
        content = loadTabParams.content,
        el = loadTabParams.el,
        component = loadTabParams.component,
        componentUrl = loadTabParams.componentUrl; // Component/Template Callbacks

    function resolve(contentEl) {
      router.allowPageChange = true;
      if (!contentEl) return;

      if (typeof contentEl === 'string') {
        $newTabEl.html(contentEl);
      } else {
        $newTabEl.html('');

        if (contentEl.f7Component) {
          contentEl.f7Component.mount(function (componentEl) {
            $newTabEl.append(componentEl);
          });
        } else {
          $newTabEl.append(contentEl);
        }
      }

      $newTabEl[0].f7RouterTabLoaded = true;
      onTabLoaded(contentEl);
    }

    function reject() {
      router.allowPageChange = true;
      return router;
    }

    if (content) {
      resolve(content);
    } else if (el) {
      resolve(el);
    } else if (component || componentUrl) {
      // Load from component (F7/Vue/React/...)
      try {
        router.tabComponentLoader({
          tabEl: $newTabEl[0],
          component: component,
          componentUrl: componentUrl,
          options: loadTabOptions,
          resolve: resolve,
          reject: reject
        });
      } catch (err) {
        router.allowPageChange = true;
        throw err;
      }
    } else if (url) {
      // Load using XHR
      if (router.xhrAbortController) {
        router.xhrAbortController.abort();
        router.xhrAbortController = false;
      }

      router.xhrRequest(url, loadTabOptions).then(function (tabContent) {
        resolve(tabContent);
      }).catch(function () {
        router.allowPageChange = true;
      });
    }
  }

  var hasContentLoadProp;
  'url content component el componentUrl'.split(' ').forEach(function (tabLoadProp) {
    if (tabRoute[tabLoadProp]) {
      var _loadTab;

      hasContentLoadProp = true;
      loadTab((_loadTab = {}, _loadTab[tabLoadProp] = tabRoute[tabLoadProp], _loadTab), options);
    }
  }); // Async

  function asyncResolve(resolveParams, resolveOptions) {
    loadTab(resolveParams, (0, _utils.extend)(options, resolveOptions));
  }

  function asyncReject() {
    router.allowPageChange = true;
  }

  if (tabRoute.async) {
    tabRoute.async.call(router, {
      router: router,
      to: currentRoute,
      from: previousRoute,
      resolve: asyncResolve,
      reject: asyncReject,
      app: router.app
    });
  } else if (tabRoute.asyncComponent) {
    (0, _asyncComponent.default)(router, tabRoute.asyncComponent, asyncResolve, asyncReject);
  } else if (!hasContentLoadProp) {
    router.allowPageChange = true;
  }

  return router;
}

function tabRemove($oldTabEl, $newTabEl, tabRoute) {
  var router = this;
  var hasTabComponentChild;

  if ($oldTabEl[0]) {
    $oldTabEl[0].f7RouterTabLoaded = false;
    delete $oldTabEl[0].f7RouterTabLoaded;
  }

  $oldTabEl.children().each(function (tabChild) {
    if (tabChild.f7Component) {
      hasTabComponentChild = true;
      (0, _dom.default)(tabChild).trigger('tab:beforeremove', tabRoute);
      tabChild.f7Component.destroy();
    }
  });

  if (!hasTabComponentChild) {
    $oldTabEl.trigger('tab:beforeremove', tabRoute);
  }

  router.emit('tabBeforeRemove', $oldTabEl[0], $newTabEl[0], tabRoute);
  router.removeTabContent($oldTabEl[0], tabRoute);
}