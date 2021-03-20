"use strict";

exports.__esModule = true;
exports.back = back;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _getDevice = require("../../shared/get-device");

var _history = _interopRequireDefault(require("../../shared/history"));

var _redirect = _interopRequireDefault(require("./redirect"));

var _processRouteQueue = _interopRequireDefault(require("./process-route-queue"));

var _appRouterCheck = _interopRequireDefault(require("./app-router-check"));

var _asyncComponent = _interopRequireDefault(require("./async-component"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function backward(router, el, backwardOptions) {
  var device = (0, _getDevice.getDevice)();
  var document = (0, _ssrWindow.getDocument)();
  var $el = (0, _dom.default)(el);
  var app = router.app;
  var view = router.view;
  var options = (0, _utils.extend)({
    animate: router.params.animate,
    browserHistory: true,
    replaceState: false
  }, backwardOptions);
  var masterDetailEnabled = router.params.masterDetailBreakpoint > 0;
  var isMaster = masterDetailEnabled && options.route && options.route.route && (options.route.route.master === true || typeof options.route.route.master === 'function' && options.route.route.master(app, router));
  var masterPageEl;
  var masterPageRemoved;
  var dynamicNavbar = router.dynamicNavbar;
  var $newPage = $el;
  var $oldPage = router.$el.children('.page-current');
  var initialPreload = $oldPage.length === 0 && options.preload;
  var currentIsMaster = masterDetailEnabled && $oldPage.hasClass('page-master');

  if ($newPage.length) {
    // Remove theme elements
    router.removeThemeElements($newPage);
  }

  var $navbarsEl;
  var $newNavbarEl;
  var $oldNavbarEl;

  if (dynamicNavbar) {
    $newNavbarEl = $newPage.children('.navbar');
    $navbarsEl = router.$navbarsEl;

    if ($newNavbarEl.length === 0 && $newPage[0] && $newPage[0].f7Page) {
      // Try from pageData
      $newNavbarEl = $newPage[0].f7Page.$navbarEl;
    }

    $oldNavbarEl = $navbarsEl.find('.navbar-current');
  }

  router.allowPageChange = false;

  if ($newPage.length === 0 || $oldPage.length === 0 && !options.preload) {
    router.allowPageChange = true;
    return router;
  } // Remove theme elements


  router.removeThemeElements($newPage); // Save Keep Alive Cache

  if (options.route && options.route.route && options.route.route.keepAlive && !options.route.route.keepAliveData) {
    options.route.route.keepAliveData = {
      pageEl: $el[0]
    };
  } // Pages In View


  var isDetail;
  var isDetailRoot;

  if (masterDetailEnabled) {
    var $pagesInView = router.$el.children('.page:not(.stacked)').filter(function (pageInView) {
      return pageInView !== $newPage[0];
    }); // Find Detail' master page

    for (var i = 0; i < $pagesInView.length; i += 1) {
      if (!masterPageEl && $pagesInView[i].classList.contains('page-master')) {
        masterPageEl = $pagesInView[i];
        continue; // eslint-disable-line
      }
    }

    isDetail = !isMaster && masterPageEl && router.history.indexOf(options.route.url) > router.history.indexOf(masterPageEl.f7Page.route.url);

    if (!isDetail && !isMaster && masterPageEl && masterPageEl.f7Page && options.route.route.masterRoute) {
      isDetail = options.route.route.masterRoute.path === masterPageEl.f7Page.route.route.path;
    }
  }

  if (isDetail && masterPageEl && masterPageEl.f7Page) {
    isDetailRoot = router.history.indexOf(options.route.url) - router.history.indexOf(masterPageEl.f7Page.route.url) === 1;
  } // New Page


  $newPage.addClass("page-" + (initialPreload ? 'current' : 'previous') + (isMaster ? ' page-master' : '') + (isDetail ? ' page-master-detail' : '') + (isDetailRoot ? ' page-master-detail-root' : '')).removeClass('stacked').removeAttr('aria-hidden').trigger('page:unstack').trigger('page:position', {
    position: initialPreload ? 'current' : 'previous'
  });
  router.emit('pageUnstack', $newPage[0]);
  router.emit('pagePosition', $newPage[0], initialPreload ? 'current' : 'previous');

  if (isMaster || isDetail) {
    $newPage.trigger('page:role', {
      role: isMaster ? 'master' : 'detail',
      root: !!isDetailRoot
    });
    router.emit('pageRole', $newPage[0], {
      role: isMaster ? 'master' : 'detail',
      detailRoot: !!isDetailRoot
    });
  }

  if (dynamicNavbar && $newNavbarEl.length > 0) {
    $newNavbarEl.addClass("navbar-" + (initialPreload ? 'current' : 'previous') + (isMaster ? ' navbar-master' : '') + (isDetail ? ' navbar-master-detail' : '') + (isDetailRoot ? ' navbar-master-detail-root' : '')).removeClass('stacked').removeAttr('aria-hidden');
    $newNavbarEl.trigger('navbar:position', {
      position: initialPreload ? 'current' : 'previous'
    });
    router.emit('navbarPosition', $newNavbarEl[0], initialPreload ? 'current' : 'previous');

    if (isMaster || isDetailRoot) {
      router.emit('navbarRole', $newNavbarEl[0], {
        role: isMaster ? 'master' : 'detail',
        detailRoot: !!isDetailRoot
      });
    }
  } // Remove previous page in case of "forced"


  var backIndex;

  if (options.force) {
    if ($oldPage.prev('.page-previous:not(.stacked)').length > 0 || $oldPage.prev('.page-previous').length === 0) {
      if (router.history.indexOf(options.route.url) >= 0) {
        backIndex = router.history.length - router.history.indexOf(options.route.url) - 1;
        router.history = router.history.slice(0, router.history.indexOf(options.route.url) + 2);
        view.history = router.history;
      } else if (router.history[[router.history.length - 2]]) {
        router.history[router.history.length - 2] = options.route.url;
      } else {
        router.history.unshift(router.url);
      }

      if (backIndex && router.params.stackPages) {
        $oldPage.prevAll('.page-previous').each(function (pageToRemove) {
          var $pageToRemove = (0, _dom.default)(pageToRemove);
          var $navbarToRemove;

          if (dynamicNavbar) {
            // $navbarToRemove = $oldNavbarEl.prevAll('.navbar-previous').eq(index);
            $navbarToRemove = (0, _dom.default)(app.navbar.getElByPage($pageToRemove));
          }

          if ($pageToRemove[0] !== $newPage[0] && $pageToRemove.index() > $newPage.index()) {
            if (router.initialPages.indexOf($pageToRemove[0]) >= 0) {
              $pageToRemove.addClass('stacked');
              $pageToRemove.trigger('page:stack');
              router.emit('pageStack', $pageToRemove[0]);

              if (dynamicNavbar) {
                $navbarToRemove.addClass('stacked');
              }
            } else {
              router.pageCallback('beforeRemove', $pageToRemove, $navbarToRemove, 'previous', undefined, options);

              if ($pageToRemove[0] === masterPageEl) {
                masterPageRemoved = true;
              }

              router.removePage($pageToRemove);

              if (dynamicNavbar && $navbarToRemove.length > 0) {
                router.removeNavbar($navbarToRemove);
              }
            }
          }
        });
      } else {
        var $pageToRemove = $oldPage.prev('.page-previous:not(.stacked)');
        var $navbarToRemove;

        if (dynamicNavbar) {
          // $navbarToRemove = $oldNavbarEl.prev('.navbar-inner:not(.stacked)');
          $navbarToRemove = (0, _dom.default)(app.navbar.getElByPage($pageToRemove));
        }

        if (router.params.stackPages && router.initialPages.indexOf($pageToRemove[0]) >= 0) {
          $pageToRemove.addClass('stacked');
          $pageToRemove.trigger('page:stack');
          router.emit('pageStack', $pageToRemove[0]);
          $navbarToRemove.addClass('stacked');
        } else if ($pageToRemove.length > 0) {
          router.pageCallback('beforeRemove', $pageToRemove, $navbarToRemove, 'previous', undefined, options);

          if ($pageToRemove[0] === masterPageEl) {
            masterPageRemoved = true;
          }

          router.removePage($pageToRemove);

          if (dynamicNavbar && $navbarToRemove.length) {
            router.removeNavbar($navbarToRemove);
          }
        }
      }
    }
  } // Insert new page


  var newPageInDom = $newPage.parents(document).length > 0;
  var f7Component = $newPage[0].f7Component;

  function insertPage() {
    if (initialPreload) {
      if (!newPageInDom && f7Component) {
        f7Component.mount(function (componentEl) {
          router.$el.append(componentEl);
        });
      } else {
        router.$el.append($newPage);
      }
    }

    if ($newPage.next($oldPage).length === 0) {
      if (!newPageInDom && f7Component) {
        f7Component.mount(function (componentEl) {
          (0, _dom.default)(componentEl).insertBefore($oldPage);
        });
      } else {
        $newPage.insertBefore($oldPage);
      }
    }

    if (dynamicNavbar && $newNavbarEl.length) {
      if ($newNavbarEl.find('.title-large').length) {
        $newNavbarEl.addClass('navbar-large');
      }

      $newNavbarEl.insertBefore($oldNavbarEl);

      if ($oldNavbarEl.length > 0) {
        $newNavbarEl.insertBefore($oldNavbarEl);
      } else {
        if (!router.$navbarsEl.parents(document).length) {
          router.$el.prepend(router.$navbarsEl);
        }

        $navbarsEl.append($newNavbarEl);
      }
    }

    if (!newPageInDom) {
      router.pageCallback('mounted', $newPage, $newNavbarEl, 'previous', 'current', options, $oldPage);
    } else if (options.route && options.route.route && options.route.route.keepAlive && !$newPage[0].f7PageMounted) {
      $newPage[0].f7PageMounted = true;
      router.pageCallback('mounted', $newPage, $newNavbarEl, 'previous', 'current', options, $oldPage);
    }
  }

  if (options.preload) {
    // Insert Page
    insertPage(); // Tab route

    if (options.route.route.tab) {
      router.tabLoad(options.route.route.tab, (0, _utils.extend)({}, options, {
        history: false,
        browserHistory: false,
        preload: true
      }));
    }

    if (isMaster) {
      $newPage.removeClass('page-master-stacked').trigger('page:masterunstack');
      router.emit('pageMasterUnstack', $newPage[0]);

      if (dynamicNavbar) {
        (0, _dom.default)(app.navbar.getElByPage($newPage)).removeClass('navbar-master-stacked');
        router.emit('navbarMasterUnstack', app.navbar.getElByPage($newPage));
      }
    } // Page init and before init events


    router.pageCallback('init', $newPage, $newNavbarEl, 'previous', 'current', options, $oldPage);

    if (initialPreload) {
      router.pageCallback('beforeIn', $newPage, $newNavbarEl, 'current', undefined, options);
      router.pageCallback('afterIn', $newPage, $newNavbarEl, 'current', undefined, options);
    }

    var $previousPages = $newPage.prevAll('.page-previous:not(.stacked):not(.page-master)');

    if ($previousPages.length > 0) {
      $previousPages.each(function (pageToRemove) {
        var $pageToRemove = (0, _dom.default)(pageToRemove);
        var $navbarToRemove;

        if (dynamicNavbar) {
          // $navbarToRemove = $newNavbarEl.prevAll('.navbar-previous:not(.stacked)').eq(index);
          $navbarToRemove = (0, _dom.default)(app.navbar.getElByPage($pageToRemove));
        }

        if (router.params.stackPages && router.initialPages.indexOf(pageToRemove) >= 0) {
          $pageToRemove.addClass('stacked');
          $pageToRemove.trigger('page:stack');
          router.emit('pageStack', $pageToRemove[0]);

          if (dynamicNavbar) {
            $navbarToRemove.addClass('stacked');
          }
        } else {
          router.pageCallback('beforeRemove', $pageToRemove, $navbarToRemove, 'previous', undefined);
          router.removePage($pageToRemove);

          if (dynamicNavbar && $navbarToRemove.length) {
            router.removeNavbar($navbarToRemove);
          }
        }
      });
    }

    router.allowPageChange = true;
    return router;
  } // History State


  if (!(device.ie || device.edge || device.firefox && !device.ios)) {
    if (router.params.browserHistory && options.browserHistory) {
      if (options.replaceState) {
        var browserHistoryRoot = router.params.browserHistoryRoot || '';

        _history.default.replace(view.id, {
          url: options.route.url
        }, browserHistoryRoot + router.params.browserHistorySeparator + options.route.url);
      } else if (backIndex) {
        _history.default.go(-backIndex);
      } else {
        _history.default.back();
      }
    }
  } // Update History


  if (options.replaceState) {
    router.history[router.history.length - 1] = options.route.url;
  } else {
    if (router.history.length === 1) {
      router.history.unshift(router.url);
    }

    router.history.pop();
  }

  router.saveHistory(); // Current Page & Navbar

  router.currentPageEl = $newPage[0];

  if (dynamicNavbar && $newNavbarEl.length) {
    router.currentNavbarEl = $newNavbarEl[0];
  } else {
    delete router.currentNavbarEl;
  } // Current Route


  router.currentRoute = options.route; // History State

  if (device.ie || device.edge || device.firefox && !device.ios) {
    if (router.params.browserHistory && options.browserHistory) {
      if (options.replaceState) {
        var _browserHistoryRoot = router.params.browserHistoryRoot || '';

        _history.default.replace(view.id, {
          url: options.route.url
        }, _browserHistoryRoot + router.params.browserHistorySeparator + options.route.url);
      } else if (backIndex) {
        _history.default.go(-backIndex);
      } else {
        _history.default.back();
      }
    }
  } // Insert Page


  insertPage(); // Load Tab

  if (options.route.route.tab) {
    router.tabLoad(options.route.route.tab, (0, _utils.extend)({}, options, {
      history: false,
      browserHistory: false
    }));
  } // Check master detail


  if (masterDetailEnabled && (currentIsMaster || masterPageRemoved)) {
    view.checkMasterDetailBreakpoint(false);
  } // Page init and before init events


  router.pageCallback('init', $newPage, $newNavbarEl, 'previous', 'current', options, $oldPage); // Before animation callback

  router.pageCallback('beforeOut', $oldPage, $oldNavbarEl, 'current', 'next', options);
  router.pageCallback('beforeIn', $newPage, $newNavbarEl, 'previous', 'current', options); // Animation

  function afterAnimation() {
    // Set classes
    router.setPagePosition($newPage, 'current', false);
    router.setPagePosition($oldPage, 'next', true);

    if (dynamicNavbar) {
      router.setNavbarPosition($newNavbarEl, 'current', false);
      router.setNavbarPosition($oldNavbarEl, 'next', true);
    } // After animation event


    router.pageCallback('afterOut', $oldPage, $oldNavbarEl, 'current', 'next', options);
    router.pageCallback('afterIn', $newPage, $newNavbarEl, 'previous', 'current', options); // Remove Old Page

    if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
      $oldPage.addClass('stacked');
      $oldPage.trigger('page:stack');
      router.emit('pageStack', $oldPage[0]);

      if (dynamicNavbar) {
        $oldNavbarEl.addClass('stacked');
      }
    } else {
      router.pageCallback('beforeRemove', $oldPage, $oldNavbarEl, 'next', undefined, options);
      router.removePage($oldPage);

      if (dynamicNavbar && $oldNavbarEl.length) {
        router.removeNavbar($oldNavbarEl);
      }
    }

    router.allowPageChange = true;
    router.emit('routeChanged', router.currentRoute, router.previousRoute, router); // Preload previous page

    var preloadPreviousPage = router.params.preloadPreviousPage || router.params[app.theme + "SwipeBack"];

    if (preloadPreviousPage && router.history[router.history.length - 2] && !isMaster) {
      router.back(router.history[router.history.length - 2], {
        preload: true
      });
    }

    if (router.params.browserHistory) {
      _history.default.clearRouterQueue();
    }
  }

  function setPositionClasses() {
    router.setPagePosition($oldPage, 'current');
    router.setPagePosition($newPage, 'previous', false);

    if (dynamicNavbar) {
      router.setNavbarPosition($oldNavbarEl, 'current');
      router.setNavbarPosition($newNavbarEl, 'previous', false);
    }
  }

  if (options.animate && !(currentIsMaster && app.width >= router.params.masterDetailBreakpoint)) {
    var transition = router.params.transition;

    if ($oldPage[0] && $oldPage[0].f7PageTransition) {
      transition = $oldPage[0].f7PageTransition;
      delete $oldPage[0].f7PageTransition;
    }

    if (options.transition) transition = options.transition;

    if (!transition && router.previousRoute && router.previousRoute.route) {
      transition = router.previousRoute.route.transition;
    }

    if (!transition && router.previousRoute && router.previousRoute.route && router.previousRoute.route.options) {
      transition = router.previousRoute.route.options.transition;
    }

    setPositionClasses();
    router.animate($oldPage, $newPage, $oldNavbarEl, $newNavbarEl, 'backward', transition, function () {
      afterAnimation();
    });
  } else {
    afterAnimation();
  }

  return router;
}

function loadBack(router, backParams, backOptions, ignorePageChange) {
  if (!router.allowPageChange && !ignorePageChange) return router;
  var params = backParams;
  var options = backOptions;
  var url = params.url,
      content = params.content,
      el = params.el,
      pageName = params.pageName,
      component = params.component,
      componentUrl = params.componentUrl;

  if (options.route.url && router.url === options.route.url && !(options.reloadCurrent || options.reloadPrevious) && !router.params.allowDuplicateUrls) {
    return false;
  }

  if (!options.route && url) {
    options.route = router.parseRouteUrl(url);
  } // Component Callbacks


  function resolve(pageEl, newOptions) {
    return backward(router, pageEl, (0, _utils.extend)(options, newOptions));
  }

  function reject() {
    router.allowPageChange = true;
    return router;
  }

  if (url || componentUrl || component) {
    router.allowPageChange = false;
  } // Proceed


  if (content) {
    backward(router, router.getPageEl(content), options);
  } else if (el) {
    // Load page from specified HTMLElement or by page name in pages container
    backward(router, router.getPageEl(el), options);
  } else if (pageName) {
    // Load page by page name in pages container
    backward(router, router.$el.children(".page[data-name=\"" + pageName + "\"]").eq(0), options);
  } else if (component || componentUrl) {
    // Load from component (F7/Vue/React/...)
    try {
      router.pageComponentLoader({
        routerEl: router.el,
        component: component,
        componentUrl: componentUrl,
        options: options,
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

    router.xhrRequest(url, options).then(function (pageContent) {
      backward(router, router.getPageEl(pageContent), options);
    }).catch(function () {
      router.allowPageChange = true;
    });
  }

  return router;
}

function back() {
  var router = this;
  var device = (0, _getDevice.getDevice)();
  if (router.swipeBackActive) return router;
  var navigateUrl;
  var navigateOptions;
  var route;

  if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'object') {
    navigateOptions = (arguments.length <= 0 ? undefined : arguments[0]) || {};
  } else {
    navigateUrl = arguments.length <= 0 ? undefined : arguments[0];
    navigateOptions = (arguments.length <= 1 ? undefined : arguments[1]) || {};
  }

  var _navigateOptions = navigateOptions,
      name = _navigateOptions.name,
      params = _navigateOptions.params,
      query = _navigateOptions.query;

  if (name) {
    navigateUrl = router.generateUrl({
      name: name,
      params: params,
      query: query
    });

    if (navigateUrl) {
      return router.back(navigateUrl, (0, _utils.extend)({}, navigateOptions, {
        name: null,
        params: null,
        query: null
      }));
    }

    return router;
  }

  var app = router.app;
  (0, _appRouterCheck.default)(router, 'back');
  var currentRouteIsModal = router.currentRoute.modal;
  var modalType;

  if (!currentRouteIsModal) {
    'popup popover sheet loginScreen actions customModal panel'.split(' ').forEach(function (modalLoadProp) {
      if (router.currentRoute.route[modalLoadProp]) {
        currentRouteIsModal = true;
        modalType = modalLoadProp;
      }
    });
  }

  if (currentRouteIsModal && !navigateOptions.preload) {
    var modalToClose = router.currentRoute.modal || router.currentRoute.route.modalInstance || app[modalType].get();
    var previousUrl = router.history[router.history.length - 2];
    var previousRoute; // check if previous route is modal too

    if (modalToClose && modalToClose.$el) {
      var prevOpenedModals = modalToClose.$el.prevAll('.modal-in');

      if (prevOpenedModals.length && prevOpenedModals[0].f7Modal) {
        var modalEl = prevOpenedModals[0]; // check if current router not inside of the modalEl

        if (!router.$el.parents(modalEl).length) {
          previousRoute = modalEl.f7Modal.route;
        }
      }
    }

    if (!previousRoute) {
      previousRoute = router.findMatchingRoute(previousUrl);
    }

    if (!previousRoute && previousUrl) {
      previousRoute = {
        url: previousUrl,
        path: previousUrl.split('?')[0],
        query: (0, _utils.parseUrlQuery)(previousUrl),
        route: {
          path: previousUrl.split('?')[0],
          url: previousUrl
        }
      };
    }

    if (!navigateUrl || navigateUrl.replace(/[# ]/g, '').trim().length === 0) {
      if (!previousRoute || !modalToClose) {
        return router;
      }
    }

    var forceOtherUrl = navigateOptions.force && previousRoute && navigateUrl;

    if (previousRoute && modalToClose) {
      var isBrokenBrowserHistory = device.ie || device.edge || device.firefox && !device.ios;
      var needHistoryBack = router.params.browserHistory && navigateOptions.browserHistory !== false;
      var currentRouteWithoutBrowserHistory = router.currentRoute && router.currentRoute.route && router.currentRoute.route.options && router.currentRoute.route.options.browserHistory === false;

      if (needHistoryBack && !isBrokenBrowserHistory && !currentRouteWithoutBrowserHistory) {
        _history.default.back();
      }

      router.currentRoute = previousRoute;
      router.history.pop();
      router.saveHistory();

      if (needHistoryBack && isBrokenBrowserHistory && !currentRouteWithoutBrowserHistory) {
        _history.default.back();
      }

      router.modalRemove(modalToClose);

      if (forceOtherUrl) {
        router.navigate(navigateUrl, {
          reloadCurrent: true
        });
      }
    } else if (modalToClose) {
      router.modalRemove(modalToClose);

      if (navigateUrl) {
        router.navigate(navigateUrl, {
          reloadCurrent: true
        });
      }
    }

    return router;
  }

  var $previousPage = router.$el.children('.page-current').prevAll('.page-previous:not(.page-master)').eq(0);
  var skipMaster;

  if (router.params.masterDetailBreakpoint > 0) {
    var classes = [];
    router.$el.children('.page').each(function (pageEl) {
      classes.push(pageEl.className);
    });
    var $previousMaster = router.$el.children('.page-current').prevAll('.page-master').eq(0);

    if ($previousMaster.length) {
      var expectedPreviousPageUrl = router.history[router.history.length - 2];
      var expectedPreviousPageRoute = router.findMatchingRoute(expectedPreviousPageUrl);

      if (expectedPreviousPageRoute && $previousMaster[0].f7Page && expectedPreviousPageRoute.route === $previousMaster[0].f7Page.route.route) {
        $previousPage = $previousMaster;

        if (!navigateOptions.preload) {
          skipMaster = app.width >= router.params.masterDetailBreakpoint;
        }
      }
    }
  }

  if (!navigateOptions.force && $previousPage.length && !skipMaster) {
    if (router.params.browserHistory && $previousPage[0].f7Page && router.history[router.history.length - 2] !== $previousPage[0].f7Page.route.url) {
      router.back(router.history[router.history.length - 2], (0, _utils.extend)(navigateOptions, {
        force: true
      }));
      return router;
    }

    var previousPageRoute = $previousPage[0].f7Page.route;

    _processRouteQueue.default.call(router, previousPageRoute, router.currentRoute, function () {
      loadBack(router, {
        el: $previousPage
      }, (0, _utils.extend)(navigateOptions, {
        route: previousPageRoute
      }));
    }, function () {}, 'backward');

    return router;
  } // Navigate URL


  if (navigateUrl === '#') {
    navigateUrl = undefined;
  }

  if (navigateUrl && navigateUrl[0] !== '/' && navigateUrl.indexOf('#') !== 0) {
    navigateUrl = ((router.path || '/') + navigateUrl).replace('//', '/');
  }

  if (!navigateUrl && router.history.length > 1) {
    navigateUrl = router.history[router.history.length - 2];
  }

  if (skipMaster && !navigateOptions.force && router.history[router.history.length - 3]) {
    return router.back(router.history[router.history.length - 3], (0, _utils.extend)({}, navigateOptions || {}, {
      force: true,
      animate: false
    }));
  }

  if (skipMaster && !navigateOptions.force) {
    return router;
  } // Find route to load


  route = router.findMatchingRoute(navigateUrl);

  if (!route) {
    if (navigateUrl) {
      route = {
        url: navigateUrl,
        path: navigateUrl.split('?')[0],
        query: (0, _utils.parseUrlQuery)(navigateUrl),
        route: {
          path: navigateUrl.split('?')[0],
          url: navigateUrl
        }
      };
    }
  }

  if (!route) {
    return router;
  }

  if (route.route.redirect) {
    return _redirect.default.call(router, 'backward', route, navigateOptions);
  }

  var options = {};

  if (route.route.options) {
    (0, _utils.extend)(options, route.route.options, navigateOptions);
  } else {
    (0, _utils.extend)(options, navigateOptions);
  }

  options.route = route;
  var backForceLoaded;

  if (options.force && router.params.stackPages) {
    router.$el.children('.page-previous.stacked').each(function (pageEl) {
      if (pageEl.f7Page && pageEl.f7Page.route && pageEl.f7Page.route.url === route.url) {
        backForceLoaded = true;
        loadBack(router, {
          el: pageEl
        }, options);
      }
    });

    if (backForceLoaded) {
      return router;
    }
  }

  function resolve() {
    var routerLoaded = false;

    if (route.route.keepAlive && route.route.keepAliveData) {
      loadBack(router, {
        el: route.route.keepAliveData.pageEl
      }, options);
      routerLoaded = true;
    }

    'url content component pageName el componentUrl'.split(' ').forEach(function (pageLoadProp) {
      if (route.route[pageLoadProp] && !routerLoaded) {
        var _loadBack;

        routerLoaded = true;
        loadBack(router, (_loadBack = {}, _loadBack[pageLoadProp] = route.route[pageLoadProp], _loadBack), options);
      }
    });
    if (routerLoaded) return; // Async

    function asyncResolve(resolveParams, resolveOptions) {
      router.allowPageChange = false;
      loadBack(router, resolveParams, (0, _utils.extend)(options, resolveOptions), true);
    }

    function asyncReject() {
      router.allowPageChange = true;
    }

    if (route.route.async) {
      router.allowPageChange = false;
      route.route.async.call(router, {
        router: router,
        to: route,
        from: router.currentRoute,
        resolve: asyncResolve,
        reject: asyncReject,
        direction: 'backward',
        app: app
      });
    }

    if (route.route.asyncComponent) {
      (0, _asyncComponent.default)(router, route.route.asyncComponent, asyncResolve, asyncReject);
    }
  }

  function reject() {
    router.allowPageChange = true;
  }

  if (options.preload) {
    resolve();
  } else {
    _processRouteQueue.default.call(router, route, router.currentRoute, function () {
      if (route.route.modules) {
        app.loadModules(Array.isArray(route.route.modules) ? route.route.modules : [route.route.modules]).then(function () {
          resolve();
        }).catch(function () {
          reject();
        });
      } else {
        resolve();
      }
    }, function () {
      reject();
    }, 'backward');
  } // Return Router


  return router;
}