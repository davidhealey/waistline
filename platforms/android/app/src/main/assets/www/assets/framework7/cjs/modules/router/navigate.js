"use strict";

exports.__esModule = true;
exports.refreshPage = refreshPage;
exports.navigate = navigate;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _history = _interopRequireDefault(require("../../shared/history"));

var _redirect = _interopRequireDefault(require("./redirect"));

var _processRouteQueue = _interopRequireDefault(require("./process-route-queue"));

var _appRouterCheck = _interopRequireDefault(require("./app-router-check"));

var _asyncComponent = _interopRequireDefault(require("./async-component"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function refreshPage() {
  var router = this;
  (0, _appRouterCheck.default)(router, 'refreshPage');
  return router.navigate(router.currentRoute.url, {
    ignoreCache: true,
    reloadCurrent: true
  });
}

function forward(router, el, forwardOptions) {
  if (forwardOptions === void 0) {
    forwardOptions = {};
  }

  var document = (0, _ssrWindow.getDocument)();
  var $el = (0, _dom.default)(el);
  var app = router.app;
  var view = router.view;
  var options = (0, _utils.extend)(false, {
    animate: router.params.animate,
    browserHistory: true,
    replaceState: false,
    history: true,
    reloadCurrent: router.params.reloadPages,
    reloadPrevious: false,
    reloadAll: false,
    clearPreviousHistory: false,
    reloadDetail: router.params.reloadDetail,
    on: {}
  }, forwardOptions);
  var masterDetailEnabled = router.params.masterDetailBreakpoint > 0;
  var isMaster = masterDetailEnabled && options.route && options.route.route && (options.route.route.master === true || typeof options.route.route.master === 'function' && options.route.route.master(app, router));
  var masterPageEl;
  var otherDetailPageEl;
  var detailsInBetweenRemoved = 0;
  var currentRouteIsModal = router.currentRoute.modal;
  var modalType;

  if (!currentRouteIsModal) {
    'popup popover sheet loginScreen actions customModal panel'.split(' ').forEach(function (modalLoadProp) {
      if (router.currentRoute && router.currentRoute.route && router.currentRoute.route[modalLoadProp]) {
        currentRouteIsModal = true;
        modalType = modalLoadProp;
      }
    });
  }

  if (currentRouteIsModal) {
    var modalToClose = router.currentRoute.modal || router.currentRoute.route.modalInstance || app[modalType].get();
    var previousUrl = router.history[router.history.length - 2];
    var previousRoute = router.findMatchingRoute(previousUrl);

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

    router.modalRemove(modalToClose);
  }

  var dynamicNavbar = router.dynamicNavbar;
  var $viewEl = router.$el;
  var $newPage = $el;
  var reload = options.reloadPrevious || options.reloadCurrent || options.reloadAll;
  var $oldPage;
  var $navbarsEl;
  var $newNavbarEl;
  var $oldNavbarEl;
  router.allowPageChange = false;

  if ($newPage.length === 0) {
    router.allowPageChange = true;
    return router;
  }

  if ($newPage.length) {
    // Remove theme elements
    router.removeThemeElements($newPage);
  }

  if (dynamicNavbar) {
    $newNavbarEl = $newPage.children('.navbar');
    $navbarsEl = router.$navbarsEl;

    if ($newNavbarEl.length === 0 && $newPage[0] && $newPage[0].f7Page) {
      // Try from pageData
      $newNavbarEl = $newPage[0].f7Page.$navbarEl;
    }
  } // Save Keep Alive Cache


  if (options.route && options.route.route && options.route.route.keepAlive && !options.route.route.keepAliveData) {
    options.route.route.keepAliveData = {
      pageEl: $el[0]
    };
  } // Pages In View


  var $pagesInView = $viewEl.children('.page:not(.stacked)').filter(function (pageInView) {
    return pageInView !== $newPage[0];
  }); // Navbars In View

  var $navbarsInView;

  if (dynamicNavbar) {
    $navbarsInView = $navbarsEl.children('.navbar:not(.stacked)').filter(function (navbarInView) {
      return navbarInView !== $newNavbarEl[0];
    });
  } // Exit when reload previous and only 1 page in view so nothing ro reload


  if (options.reloadPrevious && $pagesInView.length < 2) {
    router.allowPageChange = true;
    return router;
  } // Find Detail' master page


  var isDetail;
  var reloadDetail;
  var isDetailRoot;

  if (masterDetailEnabled && !options.reloadAll) {
    for (var i = 0; i < $pagesInView.length; i += 1) {
      if (!masterPageEl && $pagesInView[i].classList.contains('page-master')) {
        masterPageEl = $pagesInView[i];
        continue; // eslint-disable-line
      }
    }

    isDetail = !isMaster && masterPageEl;

    if (isDetail) {
      // Find Other Detail
      if (masterPageEl) {
        for (var _i = 0; _i < $pagesInView.length; _i += 1) {
          if ($pagesInView[_i].classList.contains('page-master-detail')) {
            otherDetailPageEl = $pagesInView[_i];
            continue; // eslint-disable-line
          }
        }
      }
    }

    reloadDetail = isDetail && options.reloadDetail && app.width >= router.params.masterDetailBreakpoint && masterPageEl;
  }

  if (isDetail) {
    isDetailRoot = !otherDetailPageEl || reloadDetail || options.reloadAll || options.reloadCurrent;
  } // New Page


  var newPagePosition = 'next';

  if (options.reloadCurrent || options.reloadAll || reloadDetail) {
    newPagePosition = 'current';
  } else if (options.reloadPrevious) {
    newPagePosition = 'previous';
  }

  $newPage.removeClass('page-previous page-current page-next').addClass("page-" + newPagePosition + (isMaster ? ' page-master' : '') + (isDetail ? ' page-master-detail' : '') + (isDetailRoot ? ' page-master-detail-root' : '')).removeClass('stacked').trigger('page:unstack').trigger('page:position', {
    position: newPagePosition
  });
  router.emit('pageUnstack', $newPage[0]);
  router.emit('pagePosition', $newPage[0], newPagePosition);

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

  if (dynamicNavbar && $newNavbarEl.length) {
    $newNavbarEl.removeClass('navbar-previous navbar-current navbar-next').addClass("navbar-" + newPagePosition + (isMaster ? ' navbar-master' : '') + (isDetail ? ' navbar-master-detail' : '') + (isDetailRoot ? ' navbar-master-detail-root' : '')).removeClass('stacked');
    $newNavbarEl.trigger('navbar:position', {
      position: newPagePosition
    });
    router.emit('navbarPosition', $newNavbarEl[0], newPagePosition);

    if (isMaster || isDetail) {
      router.emit('navbarRole', $newNavbarEl[0], {
        role: isMaster ? 'master' : 'detail',
        detailRoot: !!isDetailRoot
      });
    }
  } // Find Old Page


  if (options.reloadCurrent || reloadDetail) {
    if (reloadDetail) {
      $oldPage = $pagesInView.filter(function (pageEl) {
        return !pageEl.classList.contains('page-master');
      });

      if (dynamicNavbar) {
        $oldNavbarEl = (0, _dom.default)($oldPage.map(function (pageEl) {
          return app.navbar.getElByPage(pageEl);
        }));
      }

      if ($oldPage.length > 1 && masterPageEl) {
        detailsInBetweenRemoved = $oldPage.length - 1;
        (0, _dom.default)(masterPageEl).removeClass('page-master-stacked').trigger('page:masterunstack');
        router.emit('pageMasterUnstack', masterPageEl);

        if (dynamicNavbar) {
          (0, _dom.default)(app.navbar.getElByPage(masterPageEl)).removeClass('navbar-master-stacked');
          router.emit('navbarMasterUnstack', app.navbar.getElByPage(masterPageEl));
        }
      }
    } else {
      $oldPage = $pagesInView.eq($pagesInView.length - 1);

      if (dynamicNavbar) {
        $oldNavbarEl = (0, _dom.default)(app.navbar.getElByPage($oldPage));
      }
    }
  } else if (options.reloadPrevious) {
    $oldPage = $pagesInView.eq($pagesInView.length - 2);

    if (dynamicNavbar) {
      // $oldNavbarEl = $navbarsInView.eq($pagesInView.length - 2);
      $oldNavbarEl = (0, _dom.default)(app.navbar.getElByPage($oldPage));
    }
  } else if (options.reloadAll) {
    $oldPage = $pagesInView.filter(function (pageEl) {
      return pageEl !== $newPage[0];
    });

    if (dynamicNavbar) {
      $oldNavbarEl = $navbarsInView.filter(function (navbarEl) {
        return navbarEl !== $newNavbarEl[0];
      });
    }
  } else {
    var removedPageEls = [];
    var removedNavbarEls = [];

    if ($pagesInView.length > 1) {
      var _i2 = 0;

      for (_i2 = 0; _i2 < $pagesInView.length - 1; _i2 += 1) {
        if (masterPageEl && $pagesInView[_i2] === masterPageEl) {
          $pagesInView.eq(_i2).addClass('page-master-stacked');
          $pagesInView.eq(_i2).trigger('page:masterstack');
          router.emit('pageMasterStack', $pagesInView[_i2]);

          if (dynamicNavbar) {
            (0, _dom.default)(app.navbar.getElByPage(masterPageEl)).addClass('navbar-master-stacked');
            router.emit('navbarMasterStack', app.navbar.getElByPage(masterPageEl));
          }

          continue; // eslint-disable-line
        }

        var oldNavbarEl = app.navbar.getElByPage($pagesInView.eq(_i2));

        if (router.params.stackPages) {
          $pagesInView.eq(_i2).addClass('stacked');
          $pagesInView.eq(_i2).trigger('page:stack');
          router.emit('pageStack', $pagesInView[_i2]);

          if (dynamicNavbar) {
            (0, _dom.default)(oldNavbarEl).addClass('stacked');
          }
        } else {
          // Page remove event
          removedPageEls.push($pagesInView[_i2]);
          router.pageCallback('beforeRemove', $pagesInView[_i2], $navbarsInView && $navbarsInView[_i2], 'previous', undefined, options);
          router.removePage($pagesInView[_i2]);

          if (dynamicNavbar && oldNavbarEl) {
            removedNavbarEls.push(oldNavbarEl);
            router.removeNavbar(oldNavbarEl);
          }
        }
      }
    }

    $oldPage = $viewEl.children('.page:not(.stacked)').filter(function (pageEl) {
      return pageEl !== $newPage[0] && removedPageEls.indexOf(pageEl) < 0;
    });

    if (dynamicNavbar) {
      $oldNavbarEl = $navbarsEl.children('.navbar:not(.stacked)').filter(function (navbarEl) {
        return navbarEl !== $newNavbarEl[0] && removedNavbarEls.indexOf(removedNavbarEls) < 0;
      });
    }

    removedPageEls = [];
    removedNavbarEls = [];
  }

  if (isDetail && !options.reloadAll) {
    if ($oldPage.length > 1 || reloadDetail) {
      $oldPage = $oldPage.filter(function (pageEl) {
        return !pageEl.classList.contains('page-master');
      });
    }

    if ($oldNavbarEl && ($oldNavbarEl.length > 1 || reloadDetail)) {
      $oldNavbarEl = $oldNavbarEl.filter(function (navbarEl) {
        return !navbarEl.classList.contains('navbar-master');
      });
    }
  } // Push State


  if (router.params.browserHistory && (options.browserHistory || options.replaceState) && !options.reloadPrevious) {
    var browserHistoryRoot = router.params.browserHistoryRoot || '';

    _history.default[options.reloadCurrent || reloadDetail && otherDetailPageEl || options.reloadAll || options.replaceState ? 'replace' : 'push'](view.id, {
      url: options.route.url
    }, browserHistoryRoot + router.params.browserHistorySeparator + options.route.url);
  }

  if (!options.reloadPrevious) {
    // Current Page & Navbar
    router.currentPageEl = $newPage[0];

    if (dynamicNavbar && $newNavbarEl.length) {
      router.currentNavbarEl = $newNavbarEl[0];
    } else {
      delete router.currentNavbarEl;
    } // Current Route


    router.currentRoute = options.route;
  } // Update router history


  var url = options.route.url;

  if (options.history) {
    if (((options.reloadCurrent || reloadDetail && otherDetailPageEl) && router.history.length) > 0 || options.replaceState) {
      if (reloadDetail && detailsInBetweenRemoved > 0) {
        router.history = router.history.slice(0, router.history.length - detailsInBetweenRemoved);
      }

      router.history[router.history.length - (options.reloadPrevious ? 2 : 1)] = url;
    } else if (options.reloadPrevious) {
      router.history[router.history.length - 2] = url;
    } else if (options.reloadAll) {
      router.history = [url];
    } else {
      router.history.push(url);
    }
  }

  router.saveHistory(); // Insert new page and navbar

  var newPageInDom = $newPage.parents(document).length > 0;
  var f7Component = $newPage[0].f7Component;

  if (options.reloadPrevious) {
    if (f7Component && !newPageInDom) {
      f7Component.mount(function (componentEl) {
        (0, _dom.default)(componentEl).insertBefore($oldPage);
      });
    } else {
      $newPage.insertBefore($oldPage);
    }

    if (dynamicNavbar && $newNavbarEl.length) {
      if ($newNavbarEl.find('.title-large').length) {
        $newNavbarEl.addClass('navbar-large');
      }

      if ($oldNavbarEl.length) {
        $newNavbarEl.insertBefore($oldNavbarEl);
      } else {
        if (!router.$navbarsEl.parents(document).length) {
          router.$el.prepend(router.$navbarsEl);
        }

        $navbarsEl.append($newNavbarEl);
      }
    }
  } else {
    if ($oldPage.next('.page')[0] !== $newPage[0]) {
      if (f7Component && !newPageInDom) {
        f7Component.mount(function (componentEl) {
          $viewEl.append(componentEl);
        });
      } else {
        $viewEl.append($newPage[0]);
      }
    }

    if (dynamicNavbar && $newNavbarEl.length) {
      if ($newNavbarEl.find('.title-large').length) {
        $newNavbarEl.addClass('navbar-large');
      }

      if (!router.$navbarsEl.parents(document).length) {
        router.$el.prepend(router.$navbarsEl);
      }

      $navbarsEl.append($newNavbarEl[0]);
    }
  }

  if (!newPageInDom) {
    router.pageCallback('mounted', $newPage, $newNavbarEl, newPagePosition, reload ? newPagePosition : 'current', options, $oldPage);
  } else if (options.route && options.route.route && options.route.route.keepAlive && !$newPage[0].f7PageMounted) {
    $newPage[0].f7PageMounted = true;
    router.pageCallback('mounted', $newPage, $newNavbarEl, newPagePosition, reload ? newPagePosition : 'current', options, $oldPage);
  } // Remove old page


  if ((options.reloadCurrent || reloadDetail) && $oldPage.length > 0) {
    if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
      $oldPage.addClass('stacked');
      $oldPage.trigger('page:stack');
      router.emit('pageStack', $oldPage[0]);

      if (dynamicNavbar) {
        $oldNavbarEl.addClass('stacked');
      }
    } else {
      // Page remove event
      router.pageCallback('beforeOut', $oldPage, $oldNavbarEl, 'current', undefined, options);
      router.pageCallback('afterOut', $oldPage, $oldNavbarEl, 'current', undefined, options);
      router.pageCallback('beforeRemove', $oldPage, $oldNavbarEl, 'current', undefined, options);
      router.removePage($oldPage);

      if (dynamicNavbar && $oldNavbarEl && $oldNavbarEl.length) {
        router.removeNavbar($oldNavbarEl);
      }
    }
  } else if (options.reloadAll) {
    $oldPage.each(function (pageEl, index) {
      var $oldPageEl = (0, _dom.default)(pageEl);
      var $oldNavbarElEl = (0, _dom.default)(app.navbar.getElByPage($oldPageEl));

      if (router.params.stackPages && router.initialPages.indexOf($oldPageEl[0]) >= 0) {
        $oldPageEl.addClass('stacked');
        $oldPageEl.trigger('page:stack');
        router.emit('pageStack', $oldPageEl[0]);

        if (dynamicNavbar) {
          $oldNavbarElEl.addClass('stacked');
        }
      } else {
        // Page remove event
        if ($oldPageEl.hasClass('page-current')) {
          router.pageCallback('beforeOut', $oldPage, $oldNavbarEl, 'current', undefined, options);
          router.pageCallback('afterOut', $oldPage, $oldNavbarEl, 'current', undefined, options);
        }

        router.pageCallback('beforeRemove', $oldPageEl, $oldNavbarEl && $oldNavbarEl.eq(index), 'previous', undefined, options);
        router.removePage($oldPageEl);

        if (dynamicNavbar && $oldNavbarElEl.length) {
          router.removeNavbar($oldNavbarElEl);
        }
      }
    });
  } else if (options.reloadPrevious) {
    if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
      $oldPage.addClass('stacked');
      $oldPage.trigger('page:stack');
      router.emit('pageStack', $oldPage[0]);

      if (dynamicNavbar) {
        $oldNavbarEl.addClass('stacked');
      }
    } else {
      // Page remove event
      router.pageCallback('beforeRemove', $oldPage, $oldNavbarEl, 'previous', undefined, options);
      router.removePage($oldPage);

      if (dynamicNavbar && $oldNavbarEl && $oldNavbarEl.length) {
        router.removeNavbar($oldNavbarEl);
      }
    }
  } // Load Tab


  if (options.route.route.tab) {
    router.tabLoad(options.route.route.tab, (0, _utils.extend)({}, options, {
      history: false,
      browserHistory: false
    }));
  } // Check master detail


  if (masterDetailEnabled) {
    view.checkMasterDetailBreakpoint();
  } // Page init and before init events


  router.pageCallback('init', $newPage, $newNavbarEl, newPagePosition, reload ? newPagePosition : 'current', options, $oldPage);

  if (options.reloadCurrent || options.reloadAll || reloadDetail) {
    router.allowPageChange = true;
    router.pageCallback('beforeIn', $newPage, $newNavbarEl, newPagePosition, 'current', options);
    $newPage.removeAttr('aria-hidden');

    if (dynamicNavbar && $newNavbarEl) {
      $newNavbarEl.removeAttr('aria-hidden');
    }

    router.pageCallback('afterIn', $newPage, $newNavbarEl, newPagePosition, 'current', options);
    if (options.reloadCurrent && options.clearPreviousHistory) router.clearPreviousHistory();

    if (reloadDetail) {
      router.setPagePosition((0, _dom.default)(masterPageEl), 'previous');

      if (masterPageEl.f7Page && masterPageEl.f7Page.navbarEl) {
        router.setNavbarPosition((0, _dom.default)(masterPageEl.f7Page.navbarEl), 'previous');
      }
    }

    return router;
  }

  if (options.reloadPrevious) {
    router.allowPageChange = true;
    return router;
  } // Before animation event


  router.pageCallback('beforeOut', $oldPage, $oldNavbarEl, 'current', 'previous', options);
  router.pageCallback('beforeIn', $newPage, $newNavbarEl, 'next', 'current', options); // Animation

  function afterAnimation() {
    router.setPagePosition($newPage, 'current', false);
    router.setPagePosition($oldPage, 'previous', !$oldPage.hasClass('page-master'));

    if (dynamicNavbar) {
      router.setNavbarPosition($newNavbarEl, 'current', false);
      router.setNavbarPosition($oldNavbarEl, 'previous', !$oldNavbarEl.hasClass('navbar-master'));
    } // After animation event


    router.allowPageChange = true;
    router.pageCallback('afterOut', $oldPage, $oldNavbarEl, 'current', 'previous', options);
    router.pageCallback('afterIn', $newPage, $newNavbarEl, 'next', 'current', options);
    var keepOldPage = (router.params.preloadPreviousPage || router.params[app.theme + "SwipeBack"]) && !isMaster;

    if (!keepOldPage) {
      if ($newPage.hasClass('smart-select-page') || $newPage.hasClass('photo-browser-page') || $newPage.hasClass('autocomplete-page') || $newPage.hasClass('color-picker-page')) {
        keepOldPage = true;
      }
    }

    if (!keepOldPage) {
      if (router.params.stackPages) {
        $oldPage.addClass('stacked');
        $oldPage.trigger('page:stack');
        router.emit('pageStack', $oldPage[0]);

        if (dynamicNavbar) {
          $oldNavbarEl.addClass('stacked');
        }
      } else if (!($newPage.attr('data-name') && $newPage.attr('data-name') === 'smart-select-page')) {
        // Remove event
        router.pageCallback('beforeRemove', $oldPage, $oldNavbarEl, 'previous', undefined, options);
        router.removePage($oldPage);

        if (dynamicNavbar && $oldNavbarEl.length) {
          router.removeNavbar($oldNavbarEl);
        }
      }
    }

    if (options.clearPreviousHistory) router.clearPreviousHistory();
    router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

    if (router.params.browserHistory) {
      _history.default.clearRouterQueue();
    }
  }

  function setPositionClasses() {
    router.setPagePosition($oldPage, 'current', false);
    router.setPagePosition($newPage, 'next', false);

    if (dynamicNavbar) {
      router.setNavbarPosition($oldNavbarEl, 'current', false);
      router.setNavbarPosition($newNavbarEl, 'next', false);
    }
  }

  if (options.animate && !(isMaster && app.width >= router.params.masterDetailBreakpoint)) {
    var delay = router.params[router.app.theme + "PageLoadDelay"];
    var transition = router.params.transition;
    if (options.transition) transition = options.transition;

    if (!transition && router.currentRoute && router.currentRoute.route) {
      transition = router.currentRoute.route.transition;
    }

    if (!transition && router.currentRoute && router.currentRoute.route.options) {
      transition = router.currentRoute.route.options.transition;
    }

    if (transition) {
      $newPage[0].f7PageTransition = transition;
    }

    if (delay) {
      setTimeout(function () {
        setPositionClasses();
        router.animate($oldPage, $newPage, $oldNavbarEl, $newNavbarEl, 'forward', transition, function () {
          afterAnimation();
        });
      }, delay);
    } else {
      setPositionClasses();
      router.animate($oldPage, $newPage, $oldNavbarEl, $newNavbarEl, 'forward', transition, function () {
        afterAnimation();
      });
    }
  } else {
    afterAnimation();
  }

  return router;
}

function load(router, loadParams, loadOptions, ignorePageChange) {
  if (loadParams === void 0) {
    loadParams = {};
  }

  if (loadOptions === void 0) {
    loadOptions = {};
  }

  if (!router.allowPageChange && !ignorePageChange) return router;
  var params = loadParams;
  var options = loadOptions;
  var url = params.url,
      content = params.content,
      el = params.el,
      pageName = params.pageName,
      component = params.component,
      componentUrl = params.componentUrl;

  if (!options.reloadCurrent && options.route && options.route.route && options.route.route.parentPath && router.currentRoute.route && router.currentRoute.route.parentPath === options.route.route.parentPath) {
    // Do something nested
    if (options.route.url === router.url) {
      router.allowPageChange = true;
      return false;
    } // Check for same params


    var sameParams = Object.keys(options.route.params).length === Object.keys(router.currentRoute.params).length;

    if (sameParams) {
      // Check for equal params name
      Object.keys(options.route.params).forEach(function (paramName) {
        if (!(paramName in router.currentRoute.params) || router.currentRoute.params[paramName] !== options.route.params[paramName]) {
          sameParams = false;
        }
      });
    }

    if (sameParams) {
      if (options.route.route.tab) {
        return router.tabLoad(options.route.route.tab, options);
      }

      return false;
    }

    if (!sameParams && options.route.route.tab && router.currentRoute.route.tab && router.currentRoute.parentPath === options.route.parentPath) {
      return router.tabLoad(options.route.route.tab, options);
    }
  }

  if (options.route && options.route.url && router.url === options.route.url && !(options.reloadCurrent || options.reloadPrevious) && !router.params.allowDuplicateUrls) {
    router.allowPageChange = true;
    return false;
  }

  if (!options.route && url) {
    options.route = router.parseRouteUrl(url);
    (0, _utils.extend)(options.route, {
      route: {
        url: url,
        path: url
      }
    });
  } // Component Callbacks


  function resolve(pageEl, newOptions) {
    return forward(router, pageEl, (0, _utils.extend)(options, newOptions));
  }

  function reject() {
    router.allowPageChange = true;
    return router;
  }

  if (url || componentUrl || component) {
    router.allowPageChange = false;
  } // Proceed


  if (content) {
    forward(router, router.getPageEl(content), options);
  } else if (el) {
    // Load page from specified HTMLElement or by page name in pages container
    forward(router, router.getPageEl(el), options);
  } else if (pageName) {
    // Load page by page name in pages container
    forward(router, router.$el.children(".page[data-name=\"" + pageName + "\"]").eq(0), options);
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
      forward(router, router.getPageEl(pageContent), options);
    }).catch(function () {
      router.allowPageChange = true;
    });
  }

  return router;
}

function openIn(router, url, options) {
  var navigateOptions = {
    url: url,
    route: {
      path: url,
      options: _extends({}, options, {
        openIn: undefined
      })
    }
  };

  var params = _extends({}, options);

  if (options.openIn === 'popup') {
    params.content = "<div class=\"popup popup-router-open-in\" data-url=\"" + url + "\"><div class=\"view view-init\" data-links-view=\"" + router.view.selector + "\" data-url=\"" + url + "\" data-ignore-open-in=\"true\"></div></div>";
    navigateOptions.route.popup = params;
  }

  if (options.openIn === 'loginScreen') {
    params.content = "<div class=\"login-screen login-screen-router-open-in\" data-url=\"" + url + "\"><div class=\"view view-init\" data-links-view=\"" + router.view.selector + "\" data-url=\"" + url + "\" data-ignore-open-in=\"true\"></div></div>";
    navigateOptions.route.loginScreen = params;
  }

  if (options.openIn === 'sheet') {
    params.content = "<div class=\"sheet-modal sheet-modal-router-open-in\" data-url=\"" + url + "\"><div class=\"sheet-modal-inner\"><div class=\"view view-init\" data-links-view=\"" + router.view.selector + "\" data-url=\"" + url + "\" data-ignore-open-in=\"true\"></div></div></div>";
    navigateOptions.route.sheet = params;
  }

  if (options.openIn === 'popover') {
    params.targetEl = options.clickedEl || options.targetEl;
    params.content = "<div class=\"popover popover-router-open-in\" data-url=\"" + url + "\"><div class=\"popover-inner\"><div class=\"view view-init\" data-links-view=\"" + router.view.selector + "\" data-url=\"" + url + "\" data-ignore-open-in=\"true\"></div></div></div>";
    navigateOptions.route.popover = params;
  }

  if (options.openIn.indexOf('panel') >= 0) {
    var parts = options.openIn.split(':');
    var side = parts[1] || 'left';
    var effect = parts[2] || 'cover';
    params.targetEl = options.clickedEl || options.targetEl;
    params.content = "<div class=\"panel panel-router-open-in panel-" + side + " panel-" + effect + "\" data-url=\"" + url + "\"><div class=\"view view-init\" data-links-view=\"" + router.view.selector + "\" data-url=\"" + url + "\" data-ignore-open-in=\"true\"></div></div>";
    navigateOptions.route.panel = params;
  }

  return router.navigate(navigateOptions);
}

function navigate(navigateParams, navigateOptions) {
  if (navigateOptions === void 0) {
    navigateOptions = {};
  }

  var router = this;
  if (router.swipeBackActive) return router;
  var url;
  var createRoute;
  var name;
  var path;
  var query;
  var params;
  var route;

  if (typeof navigateParams === 'string') {
    url = navigateParams;
  } else {
    url = navigateParams.url;
    createRoute = navigateParams.route;
    name = navigateParams.name;
    path = navigateParams.path;
    query = navigateParams.query;
    params = navigateParams.params;
  }

  if (name || path) {
    url = router.generateUrl({
      path: path,
      name: name,
      params: params,
      query: query
    });

    if (url) {
      return router.navigate(url, navigateOptions);
    }

    return router;
  }

  var app = router.app;
  (0, _appRouterCheck.default)(router, 'navigate');

  if (url === '#' || url === '') {
    return router;
  }

  var navigateUrl = url.replace('./', '');

  if (navigateUrl[0] !== '/' && navigateUrl.indexOf('#') !== 0) {
    var currentPath = router.currentRoute.parentPath || router.currentRoute.path;
    navigateUrl = ((currentPath ? currentPath + "/" : '/') + navigateUrl).replace('///', '/').replace('//', '/');
  }

  if (createRoute) {
    route = (0, _utils.extend)(router.parseRouteUrl(navigateUrl), {
      route: (0, _utils.extend)({}, createRoute)
    });
  } else {
    route = router.findMatchingRoute(navigateUrl);
  }

  if (!route) {
    return router;
  }

  if (route.route && route.route.viewName) {
    var anotherViewName = route.route.viewName;
    var anotherView = app.views[anotherViewName];

    if (!anotherView) {
      throw new Error("Framework7: There is no View with \"" + anotherViewName + "\" name that was specified in this route");
    }

    if (anotherView !== router.view) {
      return anotherView.router.navigate(navigateParams, navigateOptions);
    }
  }

  if (route.route.redirect) {
    return _redirect.default.call(router, 'forward', route, navigateOptions);
  }

  var options = {};

  if (route.route.options) {
    (0, _utils.extend)(options, route.route.options, navigateOptions);
  } else {
    (0, _utils.extend)(options, navigateOptions);
  }

  if (options.openIn && (!router.params.ignoreOpenIn || router.params.ignoreOpenIn && router.history.length > 0)) {
    return openIn(router, navigateUrl, options);
  }

  options.route = route;

  function resolve() {
    var routerLoaded = false;
    'popup popover sheet loginScreen actions customModal panel'.split(' ').forEach(function (modalLoadProp) {
      if (route.route[modalLoadProp] && !routerLoaded) {
        routerLoaded = true;
        router.modalLoad(modalLoadProp, route, options, 'forward');
      }
    });

    if (route.route.keepAlive && route.route.keepAliveData) {
      load(router, {
        el: route.route.keepAliveData.pageEl
      }, options, false);
      routerLoaded = true;
    }

    'url content component pageName el componentUrl'.split(' ').forEach(function (pageLoadProp) {
      if (route.route[pageLoadProp] && !routerLoaded) {
        var _load;

        routerLoaded = true;
        load(router, (_load = {}, _load[pageLoadProp] = route.route[pageLoadProp], _load), options, false);
      }
    });
    if (routerLoaded) return; // Async

    function asyncResolve(resolveParams, resolveOptions) {
      router.allowPageChange = false;
      var resolvedAsModal = false;
      'popup popover sheet loginScreen actions customModal panel'.split(' ').forEach(function (modalLoadProp) {
        if (resolveParams[modalLoadProp]) {
          resolvedAsModal = true;
          var modalRoute = (0, _utils.extend)({}, route, {
            route: resolveParams
          });
          router.allowPageChange = true;
          router.modalLoad(modalLoadProp, modalRoute, (0, _utils.extend)(options, resolveOptions), 'forward');
        }
      });
      if (resolvedAsModal) return;
      load(router, resolveParams, (0, _utils.extend)(options, resolveOptions), true);
    }

    function asyncReject() {
      router.allowPageChange = true;
    }

    if (route.route.async) {
      router.allowPageChange = false;
      route.route.async.call(router, {
        router: router,
        to: options.route,
        from: router.currentRoute,
        resolve: asyncResolve,
        reject: asyncReject,
        direction: 'forward',
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

  if (router.params.masterDetailBreakpoint > 0 && route.route.masterRoute) {
    // load detail route
    var preloadMaster = true;
    var masterLoaded = false;

    if (router.currentRoute && router.currentRoute.route) {
      if ((router.currentRoute.route.master === true || typeof router.currentRoute.route.master === 'function' && router.currentRoute.route.master(app, router)) && (router.currentRoute.route === route.route.masterRoute || router.currentRoute.route.path === route.route.masterRoute.path)) {
        preloadMaster = false;
      }

      if (router.currentRoute.route.masterRoute && (router.currentRoute.route.masterRoute === route.route.masterRoute || router.currentRoute.route.masterRoute.path === route.route.masterRoute.path)) {
        preloadMaster = false;
        masterLoaded = true;
      }
    }

    if (preloadMaster || masterLoaded && navigateOptions.reloadAll) {
      router.navigate({
        path: route.route.masterRoute.path,
        params: route.params || {}
      }, {
        animate: false,
        reloadAll: navigateOptions.reloadAll,
        reloadCurrent: navigateOptions.reloadCurrent,
        reloadPrevious: navigateOptions.reloadPrevious,
        browserHistory: !navigateOptions.initial,
        history: !navigateOptions.initial,
        once: {
          pageAfterIn: function pageAfterIn() {
            router.navigate(navigateParams, (0, _utils.extend)({}, navigateOptions, {
              animate: false,
              reloadAll: false,
              reloadCurrent: false,
              reloadPrevious: false,
              history: !navigateOptions.initial,
              browserHistory: !navigateOptions.initial
            }));
          }
        }
      });
      return router;
    }
  }

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
  }, 'forward'); // Return Router


  return router;
}