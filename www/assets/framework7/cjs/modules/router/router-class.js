"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _pathToRegexp = require("path-to-regexp");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _class = _interopRequireDefault(require("../../shared/class"));

var _utils = require("../../shared/utils");

var _history = _interopRequireDefault(require("../../shared/history"));

var _swipeBack = _interopRequireDefault(require("./swipe-back"));

var _navigate = require("./navigate");

var _tab = require("./tab");

var _modal = require("./modal");

var _back = require("./back");

var _clearPreviousHistory = require("./clear-previous-history");

var _appRouterCheck = _interopRequireDefault(require("./app-router-check"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Router = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Router, _Framework7Class);

  function Router(app, view) {
    var _this;

    _this = _Framework7Class.call(this, {}, [typeof view === 'undefined' ? app : view]) || this;

    var router = _assertThisInitialized(_this); // Is App Router


    router.isAppRouter = typeof view === 'undefined';

    if (router.isAppRouter) {
      // App Router
      (0, _utils.extend)(false, router, {
        app: app,
        params: app.params.view,
        routes: app.routes || [],
        cache: app.cache
      });
    } else {
      // View Router
      (0, _utils.extend)(false, router, {
        app: app,
        view: view,
        viewId: view.id,
        id: view.params.routerId,
        params: view.params,
        routes: view.routes,
        history: view.history,
        scrollHistory: view.scrollHistory,
        cache: app.cache,
        dynamicNavbar: app.theme === 'ios' && view.params.iosDynamicNavbar,
        initialPages: [],
        initialNavbars: []
      });
    } // Install Modules


    router.useModules(); // AllowPageChage

    router.allowPageChange = true; // Current Route

    var currentRoute = {};
    var previousRoute = {};
    Object.defineProperty(router, 'currentRoute', {
      enumerable: true,
      configurable: true,
      set: function set(newRoute) {
        if (newRoute === void 0) {
          newRoute = {};
        }

        previousRoute = (0, _utils.extend)({}, currentRoute);
        currentRoute = newRoute;
        if (!currentRoute) return;
        router.url = currentRoute.url;
        router.emit('routeChange', newRoute, previousRoute, router);
      },
      get: function get() {
        return currentRoute;
      }
    });
    Object.defineProperty(router, 'previousRoute', {
      enumerable: true,
      configurable: true,
      get: function get() {
        return previousRoute;
      },
      set: function set(newRoute) {
        previousRoute = newRoute;
      }
    });
    return router || _assertThisInitialized(_this);
  }

  var _proto = Router.prototype;

  _proto.mount = function mount() {
    var router = this;
    var view = router.view;
    var document = (0, _ssrWindow.getDocument)();
    (0, _utils.extend)(false, router, {
      tempDom: document.createElement('div'),
      $el: view.$el,
      el: view.el,
      $navbarsEl: view.$navbarsEl,
      navbarsEl: view.navbarsEl
    });
    router.emit('local::mount routerMount', router);
  };

  _proto.animatableNavElements = function animatableNavElements($newNavbarEl, $oldNavbarEl, toLarge, fromLarge, direction) {
    var router = this;
    var dynamicNavbar = router.dynamicNavbar;
    var animateIcon = router.params.iosAnimateNavbarBackIcon;
    var newNavEls;
    var oldNavEls;

    function animatableNavEl($el, $navbarInner) {
      var isSliding = $el.hasClass('sliding') || $navbarInner.hasClass('sliding');
      var isSubnavbar = $el.hasClass('subnavbar');
      var needsOpacityTransition = isSliding ? !isSubnavbar : true;
      var $iconEl = $el.find('.back .icon');
      var isIconLabel;

      if (isSliding && animateIcon && $el.hasClass('left') && $iconEl.length > 0 && $iconEl.next('span').length) {
        $el = $iconEl.next('span'); // eslint-disable-line

        isIconLabel = true;
      }

      return {
        $el: $el,
        isIconLabel: isIconLabel,
        leftOffset: $el[0].f7NavbarLeftOffset,
        rightOffset: $el[0].f7NavbarRightOffset,
        isSliding: isSliding,
        isSubnavbar: isSubnavbar,
        needsOpacityTransition: needsOpacityTransition
      };
    }

    if (dynamicNavbar) {
      newNavEls = [];
      oldNavEls = [];
      $newNavbarEl.children('.navbar-inner').children('.left, .right, .title, .subnavbar').each(function (navEl) {
        var $navEl = (0, _dom.default)(navEl);
        if ($navEl.hasClass('left') && fromLarge && direction === 'forward') return;
        if ($navEl.hasClass('title') && toLarge) return;
        newNavEls.push(animatableNavEl($navEl, $newNavbarEl.children('.navbar-inner')));
      });

      if (!($oldNavbarEl.hasClass('navbar-master') && router.params.masterDetailBreakpoint > 0 && router.app.width >= router.params.masterDetailBreakpoint)) {
        $oldNavbarEl.children('.navbar-inner').children('.left, .right, .title, .subnavbar').each(function (navEl) {
          var $navEl = (0, _dom.default)(navEl);
          if ($navEl.hasClass('left') && toLarge && !fromLarge && direction === 'forward') return;
          if ($navEl.hasClass('left') && toLarge && direction === 'backward') return;

          if ($navEl.hasClass('title') && fromLarge) {
            return;
          }

          oldNavEls.push(animatableNavEl($navEl, $oldNavbarEl.children('.navbar-inner')));
        });
      }

      [oldNavEls, newNavEls].forEach(function (navEls) {
        navEls.forEach(function (navEl) {
          var n = navEl;
          var isSliding = navEl.isSliding,
              $el = navEl.$el;
          var otherEls = navEls === oldNavEls ? newNavEls : oldNavEls;
          if (!(isSliding && $el.hasClass('title') && otherEls)) return;
          otherEls.forEach(function (otherNavEl) {
            if (otherNavEl.isIconLabel) {
              var iconTextEl = otherNavEl.$el[0];
              n.leftOffset += iconTextEl ? iconTextEl.offsetLeft || 0 : 0;
            }
          });
        });
      });
    }

    return {
      newNavEls: newNavEls,
      oldNavEls: oldNavEls
    };
  };

  _proto.animate = function animate($oldPageEl, $newPageEl, $oldNavbarEl, $newNavbarEl, direction, transition, callback) {
    var router = this;

    if (router.params.animateCustom) {
      router.params.animateCustom.apply(router, [$oldPageEl, $newPageEl, $oldNavbarEl, $newNavbarEl, direction, callback]);
      return;
    }

    var dynamicNavbar = router.dynamicNavbar;
    var ios = router.app.theme === 'ios';

    if (transition) {
      var routerCustomTransitionClass = "router-transition-custom router-transition-" + transition + "-" + direction; // Animate

      var onCustomTransitionDone = function onCustomTransitionDone() {
        router.$el.removeClass(routerCustomTransitionClass);

        if (dynamicNavbar && router.$navbarsEl.length) {
          if ($newNavbarEl) {
            router.$navbarsEl.prepend($newNavbarEl);
          }

          if ($oldNavbarEl) {
            router.$navbarsEl.prepend($oldNavbarEl);
          }
        }

        if (callback) callback();
      };

      (direction === 'forward' ? $newPageEl : $oldPageEl).animationEnd(onCustomTransitionDone);

      if (dynamicNavbar) {
        if ($newNavbarEl && $newPageEl) {
          router.setNavbarPosition($newNavbarEl, '');
          $newNavbarEl.removeClass('navbar-next navbar-previous navbar-current');
          $newPageEl.prepend($newNavbarEl);
        }

        if ($oldNavbarEl && $oldPageEl) {
          router.setNavbarPosition($oldNavbarEl, '');
          $oldNavbarEl.removeClass('navbar-next navbar-previous navbar-current');
          $oldPageEl.prepend($oldNavbarEl);
        }
      }

      router.$el.addClass(routerCustomTransitionClass);
      return;
    } // Router Animation class


    var routerTransitionClass = "router-transition-" + direction + " router-transition";
    var newNavEls;
    var oldNavEls;
    var fromLarge;
    var toLarge;
    var toDifferent;
    var oldIsLarge;
    var newIsLarge;

    if (ios && dynamicNavbar) {
      var betweenMasterAndDetail = router.params.masterDetailBreakpoint > 0 && router.app.width >= router.params.masterDetailBreakpoint && ($oldNavbarEl.hasClass('navbar-master') && $newNavbarEl.hasClass('navbar-master-detail') || $oldNavbarEl.hasClass('navbar-master-detail') && $newNavbarEl.hasClass('navbar-master'));

      if (!betweenMasterAndDetail) {
        oldIsLarge = $oldNavbarEl && $oldNavbarEl.hasClass('navbar-large');
        newIsLarge = $newNavbarEl && $newNavbarEl.hasClass('navbar-large');
        fromLarge = oldIsLarge && !$oldNavbarEl.hasClass('navbar-large-collapsed');
        toLarge = newIsLarge && !$newNavbarEl.hasClass('navbar-large-collapsed');
        toDifferent = fromLarge && !toLarge || toLarge && !fromLarge;
      }

      var navEls = router.animatableNavElements($newNavbarEl, $oldNavbarEl, toLarge, fromLarge, direction);
      newNavEls = navEls.newNavEls;
      oldNavEls = navEls.oldNavEls;
    }

    function animateNavbars(progress) {
      if (!(ios && dynamicNavbar)) return;

      if (progress === 1) {
        if (toLarge) {
          $newNavbarEl.addClass('router-navbar-transition-to-large');
          $oldNavbarEl.addClass('router-navbar-transition-to-large');
        }

        if (fromLarge) {
          $newNavbarEl.addClass('router-navbar-transition-from-large');
          $oldNavbarEl.addClass('router-navbar-transition-from-large');
        }
      }

      newNavEls.forEach(function (navEl) {
        var $el = navEl.$el;
        var offset = direction === 'forward' ? navEl.rightOffset : navEl.leftOffset;

        if (navEl.isSliding) {
          if (navEl.isSubnavbar && newIsLarge) {
            // prettier-ignore
            $el[0].style.setProperty('transform', "translate3d(" + offset * (1 - progress) + "px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)", 'important');
          } else {
            $el.transform("translate3d(" + offset * (1 - progress) + "px,0,0)");
          }
        }
      });
      oldNavEls.forEach(function (navEl) {
        var $el = navEl.$el;
        var offset = direction === 'forward' ? navEl.leftOffset : navEl.rightOffset;

        if (navEl.isSliding) {
          if (navEl.isSubnavbar && oldIsLarge) {
            $el.transform("translate3d(" + offset * progress + "px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)");
          } else {
            $el.transform("translate3d(" + offset * progress + "px,0,0)");
          }
        }
      });
    } // AnimationEnd Callback


    function onDone() {
      if (router.dynamicNavbar) {
        if ($newNavbarEl) {
          $newNavbarEl.removeClass('router-navbar-transition-to-large router-navbar-transition-from-large');
          $newNavbarEl.addClass('navbar-no-title-large-transition');
          (0, _utils.nextFrame)(function () {
            $newNavbarEl.removeClass('navbar-no-title-large-transition');
          });
        }

        if ($oldNavbarEl) {
          $oldNavbarEl.removeClass('router-navbar-transition-to-large router-navbar-transition-from-large');
        }

        if ($newNavbarEl.hasClass('sliding') || $newNavbarEl.children('.navbar-inner.sliding').length) {
          $newNavbarEl.find('.title, .left, .right, .left .icon, .subnavbar').transform('');
        } else {
          $newNavbarEl.find('.sliding').transform('');
        }

        if ($oldNavbarEl.hasClass('sliding') || $oldNavbarEl.children('.navbar-inner.sliding').length) {
          $oldNavbarEl.find('.title, .left, .right, .left .icon, .subnavbar').transform('');
        } else {
          $oldNavbarEl.find('.sliding').transform('');
        }
      }

      router.$el.removeClass(routerTransitionClass);
      if (callback) callback();
    }

    (direction === 'forward' ? $newPageEl : $oldPageEl).animationEnd(function () {
      onDone();
    }); // Animate

    if (dynamicNavbar) {
      // Prepare Navbars
      animateNavbars(0);
      (0, _utils.nextFrame)(function () {
        // Add class, start animation
        router.$el.addClass(routerTransitionClass);

        if (toDifferent) {
          // eslint-disable-next-line
          router.el._clientLeft = router.el.clientLeft;
        }

        animateNavbars(1);
      });
    } else {
      // Add class, start animation
      router.$el.addClass(routerTransitionClass);
    }
  };

  _proto.removeModal = function removeModal(modalEl) {
    var router = this;
    router.removeEl(modalEl);
  } // eslint-disable-next-line
  ;

  _proto.removeTabContent = function removeTabContent(tabEl) {
    var $tabEl = (0, _dom.default)(tabEl);
    $tabEl.html('');
  };

  _proto.removeNavbar = function removeNavbar(el) {
    var router = this;
    router.removeEl(el);
  };

  _proto.removePage = function removePage(el) {
    var $el = (0, _dom.default)(el);
    var f7Page = $el && $el[0] && $el[0].f7Page;
    var router = this;

    if (f7Page && f7Page.route && f7Page.route.route && f7Page.route.route.keepAlive) {
      $el.remove();
      return;
    }

    router.removeEl(el);
  };

  _proto.removeEl = function removeEl(el) {
    if (!el) return;
    var router = this;
    var $el = (0, _dom.default)(el);
    if ($el.length === 0) return;
    $el.find('.tab').each(function (tabEl) {
      (0, _dom.default)(tabEl).children().each(function (tabChild) {
        if (tabChild.f7Component) {
          (0, _dom.default)(tabChild).trigger('tab:beforeremove');
          tabChild.f7Component.destroy();
        }
      });
    });

    if ($el[0].f7Component && $el[0].f7Component.destroy) {
      $el[0].f7Component.destroy();
    }

    if (!router.params.removeElements) {
      return;
    }

    if (router.params.removeElementsWithTimeout) {
      setTimeout(function () {
        $el.remove();
      }, router.params.removeElementsTimeout);
    } else {
      $el.remove();
    }
  };

  _proto.getPageEl = function getPageEl(content) {
    var router = this;

    if (typeof content === 'string') {
      router.tempDom.innerHTML = content;
    } else {
      if ((0, _dom.default)(content).hasClass('page')) {
        return content;
      }

      router.tempDom.innerHTML = '';
      (0, _dom.default)(router.tempDom).append(content);
    }

    return router.findElement('.page', router.tempDom);
  };

  _proto.findElement = function findElement(stringSelector, container, notStacked) {
    var router = this;
    var view = router.view;
    var app = router.app; // Modals Selector

    var modalsSelector = '.popup, .dialog, .popover, .actions-modal, .sheet-modal, .login-screen, .page';
    var $container = (0, _dom.default)(container);
    var selector = stringSelector;
    if (notStacked) selector += ':not(.stacked)';
    var found = $container.find(selector).filter(function (el) {
      return (0, _dom.default)(el).parents(modalsSelector).length === 0;
    });

    if (found.length > 1) {
      if (typeof view.selector === 'string') {
        // Search in related view
        found = $container.find(view.selector + " " + selector);
      }

      if (found.length > 1) {
        // Search in main view
        found = $container.find("." + app.params.viewMainClass + " " + selector);
      }
    }

    if (found.length === 1) return found; // Try to find not stacked

    if (!notStacked) found = router.findElement(selector, $container, true);
    if (found && found.length === 1) return found;
    if (found && found.length > 1) return (0, _dom.default)(found[0]);
    return undefined;
  };

  _proto.flattenRoutes = function flattenRoutes(routes) {
    if (routes === void 0) {
      routes = this.routes;
    }

    var router = this;
    var flattenedRoutes = [];
    routes.forEach(function (route) {
      var hasTabRoutes = false;

      if ('tabs' in route && route.tabs) {
        var mergedPathsRoutes = route.tabs.map(function (tabRoute) {
          var tRoute = (0, _utils.extend)({}, route, {
            path: (route.path + "/" + tabRoute.path).replace('///', '/').replace('//', '/'),
            parentPath: route.path,
            tab: tabRoute
          });
          delete tRoute.tabs;
          delete tRoute.routes;
          return tRoute;
        });
        hasTabRoutes = true;
        flattenedRoutes = flattenedRoutes.concat(router.flattenRoutes(mergedPathsRoutes));
      }

      if ('detailRoutes' in route) {
        var _mergedPathsRoutes = route.detailRoutes.map(function (detailRoute) {
          var dRoute = (0, _utils.extend)({}, detailRoute);
          dRoute.masterRoute = route;
          dRoute.masterRoutePath = route.path;
          return dRoute;
        });

        flattenedRoutes = flattenedRoutes.concat(route, router.flattenRoutes(_mergedPathsRoutes));
      }

      if ('routes' in route) {
        var _mergedPathsRoutes2 = route.routes.map(function (childRoute) {
          var cRoute = (0, _utils.extend)({}, childRoute);
          cRoute.path = (route.path + "/" + cRoute.path).replace('///', '/').replace('//', '/');
          return cRoute;
        });

        if (hasTabRoutes) {
          flattenedRoutes = flattenedRoutes.concat(router.flattenRoutes(_mergedPathsRoutes2));
        } else {
          flattenedRoutes = flattenedRoutes.concat(route, router.flattenRoutes(_mergedPathsRoutes2));
        }
      }

      if (!('routes' in route) && !('tabs' in route && route.tabs) && !('detailRoutes' in route)) {
        flattenedRoutes.push(route);
      }
    });
    return flattenedRoutes;
  } // eslint-disable-next-line
  ;

  _proto.parseRouteUrl = function parseRouteUrl(url) {
    if (!url) return {};
    var query = (0, _utils.parseUrlQuery)(url);
    var hash = url.split('#')[1];
    var params = {};
    var path = url.split('#')[0].split('?')[0];
    return {
      query: query,
      hash: hash,
      params: params,
      url: url,
      path: path
    };
  };

  _proto.generateUrl = function generateUrl(parameters) {
    if (parameters === void 0) {
      parameters = {};
    }

    if (typeof parameters === 'string') {
      return parameters;
    }

    var _parameters = parameters,
        name = _parameters.name,
        path = _parameters.path,
        params = _parameters.params,
        query = _parameters.query;

    if (!name && !path) {
      throw new Error('Framework7: "name" or "path" parameter is required');
    }

    var router = this;
    var route = name ? router.findRouteByKey('name', name) : router.findRouteByKey('path', path);

    if (!route) {
      if (name) {
        throw new Error("Framework7: route with name \"" + name + "\" not found");
      } else {
        throw new Error("Framework7: route with path \"" + path + "\" not found");
      }
    }

    var url = router.constructRouteUrl(route, {
      params: params,
      query: query
    });

    if (!url) {
      throw new Error("Framework7: can't construct URL for route with name \"" + name + "\"");
    }

    return url;
  } // eslint-disable-next-line
  ;

  _proto.constructRouteUrl = function constructRouteUrl(route, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        params = _ref.params,
        query = _ref.query;

    var path = route.path;
    var toUrl = (0, _pathToRegexp.compile)(path);
    var url;

    try {
      url = toUrl(params || {});
    } catch (error) {
      throw new Error("Framework7: error constructing route URL from passed params:\nRoute: " + path + "\n" + error.toString());
    }

    if (query) {
      if (typeof query === 'string') url += "?" + query;else url += "?" + (0, _utils.serializeObject)(query);
    }

    return url;
  };

  _proto.findTabRoute = function findTabRoute(tabEl) {
    var router = this;
    var $tabEl = (0, _dom.default)(tabEl);
    var parentPath = router.currentRoute.route.parentPath;
    var tabId = $tabEl.attr('id');
    var flattenedRoutes = router.flattenRoutes(router.routes);
    var foundTabRoute;
    flattenedRoutes.forEach(function (route) {
      if (route.parentPath === parentPath && route.tab && route.tab.id === tabId) {
        foundTabRoute = route;
      }
    });
    return foundTabRoute;
  };

  _proto.findRouteByKey = function findRouteByKey(key, value) {
    var router = this;
    var routes = router.routes;
    var flattenedRoutes = router.flattenRoutes(routes);
    var matchingRoute;
    flattenedRoutes.forEach(function (route) {
      if (matchingRoute) return;

      if (route[key] === value) {
        matchingRoute = route;
      }
    });
    return matchingRoute;
  };

  _proto.findMatchingRoute = function findMatchingRoute(url) {
    if (!url) return undefined;
    var router = this;
    var routes = router.routes;
    var flattenedRoutes = router.flattenRoutes(routes);

    var _router$parseRouteUrl = router.parseRouteUrl(url),
        path = _router$parseRouteUrl.path,
        query = _router$parseRouteUrl.query,
        hash = _router$parseRouteUrl.hash,
        params = _router$parseRouteUrl.params;

    var matchingRoute;
    flattenedRoutes.forEach(function (route) {
      if (matchingRoute) return;
      var keys = [];
      var pathsToMatch = [route.path];

      if (route.alias) {
        if (typeof route.alias === 'string') pathsToMatch.push(route.alias);else if (Array.isArray(route.alias)) {
          route.alias.forEach(function (aliasPath) {
            pathsToMatch.push(aliasPath);
          });
        }
      }

      var matched;
      pathsToMatch.forEach(function (pathToMatch) {
        if (matched) return;
        matched = (0, _pathToRegexp.pathToRegexp)(pathToMatch, keys).exec(path);
      });

      if (matched) {
        keys.forEach(function (keyObj, index) {
          if (typeof keyObj.name === 'number') return;
          var paramValue = matched[index + 1];

          if (typeof paramValue === 'undefined' || paramValue === null) {
            params[keyObj.name] = paramValue;
          } else {
            params[keyObj.name] = decodeURIComponent(paramValue);
          }
        });
        var parentPath;

        if (route.parentPath) {
          parentPath = path.split('/').slice(0, route.parentPath.split('/').length - 1).join('/');
        }

        matchingRoute = {
          query: query,
          hash: hash,
          params: params,
          url: url,
          path: path,
          parentPath: parentPath,
          route: route,
          name: route.name
        };
      }
    });
    return matchingRoute;
  } // eslint-disable-next-line
  ;

  _proto.replaceRequestUrlParams = function replaceRequestUrlParams(url, options) {
    if (url === void 0) {
      url = '';
    }

    if (options === void 0) {
      options = {};
    }

    var compiledUrl = url;

    if (typeof compiledUrl === 'string' && compiledUrl.indexOf('{{') >= 0 && options && options.route && options.route.params && Object.keys(options.route.params).length) {
      Object.keys(options.route.params).forEach(function (paramName) {
        var regExp = new RegExp("{{" + paramName + "}}", 'g');
        compiledUrl = compiledUrl.replace(regExp, options.route.params[paramName] || '');
      });
    }

    return compiledUrl;
  };

  _proto.removeFromXhrCache = function removeFromXhrCache(url) {
    var router = this;
    var xhrCache = router.cache.xhr;
    var index = false;

    for (var i = 0; i < xhrCache.length; i += 1) {
      if (xhrCache[i].url === url) index = i;
    }

    if (index !== false) xhrCache.splice(index, 1);
  };

  _proto.xhrRequest = function xhrRequest(requestUrl, options) {
    var router = this;
    var params = router.params;
    var ignoreCache = options.ignoreCache;
    var url = requestUrl;
    var hasQuery = url.indexOf('?') >= 0;

    if (params.passRouteQueryToRequest && options && options.route && options.route.query && Object.keys(options.route.query).length) {
      url += "" + (hasQuery ? '&' : '?') + (0, _utils.serializeObject)(options.route.query);
      hasQuery = true;
    }

    if (params.passRouteParamsToRequest && options && options.route && options.route.params && Object.keys(options.route.params).length) {
      url += "" + (hasQuery ? '&' : '?') + (0, _utils.serializeObject)(options.route.params);
      hasQuery = true;
    }

    if (url.indexOf('{{') >= 0) {
      url = router.replaceRequestUrlParams(url, options);
    } // should we ignore get params or not


    if (params.xhrCacheIgnoreGetParameters && url.indexOf('?') >= 0) {
      url = url.split('?')[0];
    }

    return new Promise(function (resolve, reject) {
      if (params.xhrCache && !ignoreCache && url.indexOf('nocache') < 0 && params.xhrCacheIgnore.indexOf(url) < 0) {
        for (var i = 0; i < router.cache.xhr.length; i += 1) {
          var cachedUrl = router.cache.xhr[i];

          if (cachedUrl.url === url) {
            // Check expiration
            if ((0, _utils.now)() - cachedUrl.time < params.xhrCacheDuration) {
              // Load from cache
              resolve(cachedUrl.content);
              return;
            }
          }
        }
      }

      router.xhrAbortController = router.app.request.abortController();
      router.app.request({
        abortController: router.xhrAbortController,
        url: url,
        method: 'GET',
        beforeSend: function beforeSend(xhr) {
          router.emit('routerAjaxStart', xhr, options);
        },
        complete: function complete(xhr, status) {
          router.emit('routerAjaxComplete', xhr);

          if (status !== 'error' && status !== 'timeout' && xhr.status >= 200 && xhr.status < 300 || xhr.status === 0) {
            if (params.xhrCache && xhr.responseText !== '') {
              router.removeFromXhrCache(url);
              router.cache.xhr.push({
                url: url,
                time: (0, _utils.now)(),
                content: xhr.responseText
              });
            }

            router.emit('routerAjaxSuccess', xhr, options);
            resolve(xhr.responseText);
          } else {
            router.emit('routerAjaxError', xhr, options);
            reject(xhr);
          }
        },
        error: function error(xhr) {
          router.emit('routerAjaxError', xhr, options);
          reject(xhr);
        }
      });
    });
  };

  _proto.setNavbarPosition = function setNavbarPosition($el, position, ariaHidden) {
    var router = this;
    $el.removeClass('navbar-previous navbar-current navbar-next');

    if (position) {
      $el.addClass("navbar-" + position);
    }

    if (ariaHidden === false) {
      $el.removeAttr('aria-hidden');
    } else if (ariaHidden === true) {
      $el.attr('aria-hidden', 'true');
    }

    $el.trigger('navbar:position', {
      position: position
    });
    router.emit('navbarPosition', $el[0], position);
  };

  _proto.setPagePosition = function setPagePosition($el, position, ariaHidden) {
    var router = this;
    $el.removeClass('page-previous page-current page-next');
    $el.addClass("page-" + position);

    if (ariaHidden === false) {
      $el.removeAttr('aria-hidden');
    } else if (ariaHidden === true) {
      $el.attr('aria-hidden', 'true');
    }

    $el.trigger('page:position', {
      position: position
    });
    router.emit('pagePosition', $el[0], position);
  } // Remove theme elements
  ;

  _proto.removeThemeElements = function removeThemeElements(el) {
    var router = this;
    var theme = router.app.theme;
    var toRemove;

    if (theme === 'ios') {
      toRemove = '.md-only, .aurora-only, .if-md, .if-aurora, .if-not-ios, .not-ios';
    } else if (theme === 'md') {
      toRemove = '.ios-only, .aurora-only, .if-ios, .if-aurora, .if-not-md, .not-md';
    } else if (theme === 'aurora') {
      toRemove = '.ios-only, .md-only, .if-ios, .if-md, .if-not-aurora, .not-aurora';
    }

    (0, _dom.default)(el).find(toRemove).remove();
  };

  _proto.getPageData = function getPageData(pageEl, navbarEl, from, to, route, pageFromEl) {
    if (route === void 0) {
      route = {};
    }

    var router = this;
    var $pageEl = (0, _dom.default)(pageEl).eq(0);
    var $navbarEl = (0, _dom.default)(navbarEl).eq(0);
    var currentPage = $pageEl[0].f7Page || {};
    var direction;
    var pageFrom;
    if (from === 'next' && to === 'current' || from === 'current' && to === 'previous') direction = 'forward';
    if (from === 'current' && to === 'next' || from === 'previous' && to === 'current') direction = 'backward';

    if (currentPage && !currentPage.fromPage) {
      var $pageFromEl = (0, _dom.default)(pageFromEl);

      if ($pageFromEl.length) {
        pageFrom = $pageFromEl[0].f7Page;
      }
    }

    pageFrom = currentPage.pageFrom || pageFrom;

    if (pageFrom && pageFrom.pageFrom) {
      pageFrom.pageFrom = null;
    }

    var page = {
      app: router.app,
      view: router.view,
      router: router,
      $el: $pageEl,
      el: $pageEl[0],
      $pageEl: $pageEl,
      pageEl: $pageEl[0],
      $navbarEl: $navbarEl,
      navbarEl: $navbarEl[0],
      name: $pageEl.attr('data-name'),
      position: from,
      from: from,
      to: to,
      direction: direction,
      route: currentPage.route ? currentPage.route : route,
      pageFrom: pageFrom
    };
    $pageEl[0].f7Page = page;
    return page;
  } // Callbacks
  ;

  _proto.pageCallback = function pageCallback(callback, pageEl, navbarEl, from, to, options, pageFromEl) {
    if (options === void 0) {
      options = {};
    }

    if (!pageEl) return;
    var router = this;
    var $pageEl = (0, _dom.default)(pageEl);
    if (!$pageEl.length) return;
    var $navbarEl = (0, _dom.default)(navbarEl);
    var _options = options,
        route = _options.route;
    var restoreScrollTopOnBack = router.params.restoreScrollTopOnBack && !(router.params.masterDetailBreakpoint > 0 && $pageEl.hasClass('page-master') && router.app.width >= router.params.masterDetailBreakpoint);
    var keepAlive = $pageEl[0].f7Page && $pageEl[0].f7Page.route && $pageEl[0].f7Page.route.route && $pageEl[0].f7Page.route.route.keepAlive;

    if (callback === 'beforeRemove' && keepAlive) {
      callback = 'beforeUnmount'; // eslint-disable-line
    }

    var camelName = "page" + (callback[0].toUpperCase() + callback.slice(1, callback.length));
    var colonName = "page:" + callback.toLowerCase();
    var page = {};

    if (callback === 'beforeRemove' && $pageEl[0].f7Page) {
      page = (0, _utils.extend)($pageEl[0].f7Page, {
        from: from,
        to: to,
        position: from
      });
    } else {
      page = router.getPageData($pageEl[0], $navbarEl[0], from, to, route, pageFromEl);
    }

    page.swipeBack = !!options.swipeBack;

    var _ref2 = options.route ? options.route.route : {},
        _ref2$on = _ref2.on,
        on = _ref2$on === void 0 ? {} : _ref2$on,
        _ref2$once = _ref2.once,
        once = _ref2$once === void 0 ? {} : _ref2$once;

    if (options.on) {
      (0, _utils.extend)(on, options.on);
    }

    if (options.once) {
      (0, _utils.extend)(once, options.once);
    }

    function attachEvents() {
      if ($pageEl[0].f7RouteEventsAttached) return;
      $pageEl[0].f7RouteEventsAttached = true;

      if (on && Object.keys(on).length > 0) {
        $pageEl[0].f7RouteEventsOn = on;
        Object.keys(on).forEach(function (eventName) {
          on[eventName] = on[eventName].bind(router);
          $pageEl.on((0, _utils.eventNameToColonCase)(eventName), on[eventName]);
        });
      }

      if (once && Object.keys(once).length > 0) {
        $pageEl[0].f7RouteEventsOnce = once;
        Object.keys(once).forEach(function (eventName) {
          once[eventName] = once[eventName].bind(router);
          $pageEl.once((0, _utils.eventNameToColonCase)(eventName), once[eventName]);
        });
      }
    }

    function detachEvents() {
      if (!$pageEl[0].f7RouteEventsAttached) return;

      if ($pageEl[0].f7RouteEventsOn) {
        Object.keys($pageEl[0].f7RouteEventsOn).forEach(function (eventName) {
          $pageEl.off((0, _utils.eventNameToColonCase)(eventName), $pageEl[0].f7RouteEventsOn[eventName]);
        });
      }

      if ($pageEl[0].f7RouteEventsOnce) {
        Object.keys($pageEl[0].f7RouteEventsOnce).forEach(function (eventName) {
          $pageEl.off((0, _utils.eventNameToColonCase)(eventName), $pageEl[0].f7RouteEventsOnce[eventName]);
        });
      }

      $pageEl[0].f7RouteEventsAttached = null;
      $pageEl[0].f7RouteEventsOn = null;
      $pageEl[0].f7RouteEventsOnce = null;
      delete $pageEl[0].f7RouteEventsAttached;
      delete $pageEl[0].f7RouteEventsOn;
      delete $pageEl[0].f7RouteEventsOnce;
    }

    if (callback === 'mounted') {
      attachEvents();
    }

    if (callback === 'init') {
      if (restoreScrollTopOnBack && (from === 'previous' || !from) && to === 'current' && router.scrollHistory[page.route.url] && !$pageEl.hasClass('no-restore-scroll')) {
        var $pageContent = $pageEl.find('.page-content');

        if ($pageContent.length > 0) {
          // eslint-disable-next-line
          $pageContent = $pageContent.filter(function (pageContentEl) {
            return (0, _dom.default)(pageContentEl).parents('.tab:not(.tab-active)').length === 0 && !(0, _dom.default)(pageContentEl).is('.tab:not(.tab-active)');
          });
        }

        $pageContent.scrollTop(router.scrollHistory[page.route.url]);
      }

      attachEvents();

      if ($pageEl[0].f7PageInitialized) {
        $pageEl.trigger('page:reinit', page);
        router.emit('pageReinit', page);
        return;
      }

      $pageEl[0].f7PageInitialized = true;
    }

    if (restoreScrollTopOnBack && callback === 'beforeOut' && from === 'current' && to === 'previous') {
      // Save scroll position
      var _$pageContent = $pageEl.find('.page-content');

      if (_$pageContent.length > 0) {
        // eslint-disable-next-line
        _$pageContent = _$pageContent.filter(function (pageContentEl) {
          return (0, _dom.default)(pageContentEl).parents('.tab:not(.tab-active)').length === 0 && !(0, _dom.default)(pageContentEl).is('.tab:not(.tab-active)');
        });
      }

      router.scrollHistory[page.route.url] = _$pageContent.scrollTop();
    }

    if (restoreScrollTopOnBack && callback === 'beforeOut' && from === 'current' && to === 'next') {
      // Delete scroll position
      delete router.scrollHistory[page.route.url];
    }

    $pageEl.trigger(colonName, page);
    router.emit(camelName, page);

    if (callback === 'beforeRemove' || callback === 'beforeUnmount') {
      detachEvents();

      if (!keepAlive) {
        if ($pageEl[0].f7Page && $pageEl[0].f7Page.navbarEl) {
          delete $pageEl[0].f7Page.navbarEl.f7Page;
        }

        $pageEl[0].f7Page = null;
      }
    }
  };

  _proto.saveHistory = function saveHistory() {
    var router = this;
    var window = (0, _ssrWindow.getWindow)();
    router.view.history = router.history;

    if (router.params.browserHistory && router.params.browserHistoryStoreHistory && window.localStorage) {
      window.localStorage["f7router-" + router.view.id + "-history"] = JSON.stringify(router.history);
    }
  };

  _proto.restoreHistory = function restoreHistory() {
    var router = this;
    var window = (0, _ssrWindow.getWindow)();

    if (router.params.browserHistory && router.params.browserHistoryStoreHistory && window.localStorage && window.localStorage["f7router-" + router.view.id + "-history"]) {
      router.history = JSON.parse(window.localStorage["f7router-" + router.view.id + "-history"]);
      router.view.history = router.history;
    }
  };

  _proto.clearHistory = function clearHistory() {
    var router = this;
    router.history = [];
    if (router.view) router.view.history = [];
    router.saveHistory();
  };

  _proto.updateCurrentUrl = function updateCurrentUrl(newUrl) {
    var router = this;
    (0, _appRouterCheck.default)(router, 'updateCurrentUrl'); // Update history

    if (router.history.length) {
      router.history[router.history.length - 1] = newUrl;
    } else {
      router.history.push(newUrl);
    } // Update current route params


    var _router$parseRouteUrl2 = router.parseRouteUrl(newUrl),
        query = _router$parseRouteUrl2.query,
        hash = _router$parseRouteUrl2.hash,
        params = _router$parseRouteUrl2.params,
        url = _router$parseRouteUrl2.url,
        path = _router$parseRouteUrl2.path;

    if (router.currentRoute) {
      (0, _utils.extend)(router.currentRoute, {
        query: query,
        hash: hash,
        params: params,
        url: url,
        path: path
      });
    }

    if (router.params.browserHistory) {
      var browserHistoryRoot = router.params.browserHistoryRoot || '';

      _history.default.replace(router.view.id, {
        url: newUrl
      }, browserHistoryRoot + router.params.browserHistorySeparator + newUrl);
    } // Save History


    router.saveHistory();
    router.emit('routeUrlUpdate', router.currentRoute, router);
  };

  _proto.getInitialUrl = function getInitialUrl() {
    var router = this;

    if (router.initialUrl) {
      return {
        initialUrl: router.initialUrl,
        historyRestored: router.historyRestored
      };
    }

    var app = router.app,
        view = router.view;
    var document = (0, _ssrWindow.getDocument)();
    var window = (0, _ssrWindow.getWindow)();
    var location = app.params.url && typeof app.params.url === 'string' && typeof URL !== 'undefined' ? new URL(app.params.url) : document.location;
    var initialUrl = router.params.url;
    var documentUrl = location.href.split(location.origin)[1];
    var historyRestored;
    var _router$params = router.params,
        browserHistory = _router$params.browserHistory,
        browserHistoryOnLoad = _router$params.browserHistoryOnLoad,
        browserHistorySeparator = _router$params.browserHistorySeparator;
    var browserHistoryRoot = router.params.browserHistoryRoot;

    if ((window.cordova || window.Capacitor && window.Capacitor.isNative) && browserHistory && !browserHistorySeparator && !browserHistoryRoot && location.pathname.indexOf('index.html')) {
      // eslint-disable-next-line
      console.warn('Framework7: wrong or not complete browserHistory configuration, trying to guess browserHistoryRoot');
      browserHistoryRoot = location.pathname.split('index.html')[0];
    }

    if (!browserHistory || !browserHistoryOnLoad) {
      if (!initialUrl) {
        initialUrl = documentUrl;
      }

      if (location.search && initialUrl.indexOf('?') < 0) {
        initialUrl += location.search;
      }

      if (location.hash && initialUrl.indexOf('#') < 0) {
        initialUrl += location.hash;
      }
    } else {
      if (browserHistoryRoot && documentUrl.indexOf(browserHistoryRoot) >= 0) {
        documentUrl = documentUrl.split(browserHistoryRoot)[1];
        if (documentUrl === '') documentUrl = '/';
      }

      if (browserHistorySeparator.length > 0 && documentUrl.indexOf(browserHistorySeparator) >= 0) {
        initialUrl = documentUrl.split(browserHistorySeparator)[1];
      } else {
        initialUrl = documentUrl;
      }

      router.restoreHistory();

      if (router.history.indexOf(initialUrl) >= 0) {
        router.history = router.history.slice(0, router.history.indexOf(initialUrl) + 1);
      } else if (router.params.url === initialUrl) {
        router.history = [initialUrl];
      } else if (_history.default.state && _history.default.state[view.id] && _history.default.state[view.id].url === router.history[router.history.length - 1]) {
        initialUrl = router.history[router.history.length - 1];
      } else {
        router.history = [documentUrl.split(browserHistorySeparator)[0] || '/', initialUrl];
      }

      if (router.history.length > 1) {
        historyRestored = true;
      } else {
        router.history = [];
      }

      router.saveHistory();
    }

    router.initialUrl = initialUrl;
    router.historyRestored = historyRestored;
    return {
      initialUrl: initialUrl,
      historyRestored: historyRestored
    };
  };

  _proto.init = function init() {
    var router = this;
    var app = router.app,
        view = router.view;
    var document = (0, _ssrWindow.getDocument)();
    router.mount();

    var _router$getInitialUrl = router.getInitialUrl(),
        initialUrl = _router$getInitialUrl.initialUrl,
        historyRestored = _router$getInitialUrl.historyRestored; // Init Swipeback


    if (view && router.params.iosSwipeBack && app.theme === 'ios' || view && router.params.mdSwipeBack && app.theme === 'md' || view && router.params.auroraSwipeBack && app.theme === 'aurora') {
      (0, _swipeBack.default)(router);
    }

    var _router$params2 = router.params,
        browserHistory = _router$params2.browserHistory,
        browserHistoryOnLoad = _router$params2.browserHistoryOnLoad,
        browserHistoryAnimateOnLoad = _router$params2.browserHistoryAnimateOnLoad,
        browserHistoryInitialMatch = _router$params2.browserHistoryInitialMatch;
    var currentRoute;

    if (router.history.length > 1) {
      // Will load page
      var initUrl = browserHistoryInitialMatch ? initialUrl : router.history[0];
      currentRoute = router.findMatchingRoute(initUrl);

      if (!currentRoute) {
        currentRoute = (0, _utils.extend)(router.parseRouteUrl(initUrl), {
          route: {
            url: initUrl,
            path: initUrl.split('?')[0]
          }
        });
      }
    } else {
      // Don't load page
      currentRoute = router.findMatchingRoute(initialUrl);

      if (!currentRoute) {
        currentRoute = (0, _utils.extend)(router.parseRouteUrl(initialUrl), {
          route: {
            url: initialUrl,
            path: initialUrl.split('?')[0]
          }
        });
      }
    }

    if (router.params.stackPages) {
      router.$el.children('.page').each(function (pageEl) {
        var $pageEl = (0, _dom.default)(pageEl);
        router.initialPages.push($pageEl[0]);

        if (router.dynamicNavbar && $pageEl.children('.navbar').length > 0) {
          router.initialNavbars.push($pageEl.children('.navbar')[0]);
        }
      });
    }

    if (router.$el.children('.page:not(.stacked)').length === 0 && initialUrl && router.params.loadInitialPage) {
      // No pages presented in DOM, reload new page
      router.navigate(initialUrl, {
        initial: true,
        reloadCurrent: true,
        browserHistory: false,
        animate: false,
        once: {
          modalOpen: function modalOpen() {
            if (!historyRestored) return;
            var preloadPreviousPage = router.params.preloadPreviousPage || router.params[app.theme + "SwipeBack"];

            if (preloadPreviousPage && router.history.length > 1) {
              router.back({
                preload: true
              });
            }
          },
          pageAfterIn: function pageAfterIn() {
            if (!historyRestored) return;
            var preloadPreviousPage = router.params.preloadPreviousPage || router.params[app.theme + "SwipeBack"];

            if (preloadPreviousPage && router.history.length > 1) {
              router.back({
                preload: true
              });
            }
          }
        }
      });
    } else if (router.$el.children('.page:not(.stacked)').length) {
      // Init current DOM page
      var hasTabRoute;
      router.currentRoute = currentRoute;
      router.$el.children('.page:not(.stacked)').each(function (pageEl) {
        var $pageEl = (0, _dom.default)(pageEl);
        var $navbarEl;
        router.setPagePosition($pageEl, 'current');

        if (router.dynamicNavbar) {
          $navbarEl = $pageEl.children('.navbar');

          if ($navbarEl.length > 0) {
            if (!router.$navbarsEl.parents(document).length) {
              router.$el.prepend(router.$navbarsEl);
            }

            router.setNavbarPosition($navbarEl, 'current');
            router.$navbarsEl.append($navbarEl);

            if ($navbarEl.children('.title-large').length) {
              $navbarEl.addClass('navbar-large');
            }

            $pageEl.children('.navbar').remove();
          } else {
            router.$navbarsEl.addClass('navbar-hidden');

            if ($navbarEl.children('.title-large').length) {
              router.$navbarsEl.addClass('navbar-hidden navbar-large-hidden');
            }
          }
        }

        if (router.currentRoute && router.currentRoute.route && (router.currentRoute.route.master === true || typeof router.currentRoute.route.master === 'function' && router.currentRoute.route.master(app, router)) && router.params.masterDetailBreakpoint > 0) {
          $pageEl.addClass('page-master');
          $pageEl.trigger('page:role', {
            role: 'master'
          });

          if ($navbarEl && $navbarEl.length) {
            $navbarEl.addClass('navbar-master');
          }

          view.checkMasterDetailBreakpoint();
        }

        var initOptions = {
          route: router.currentRoute
        };

        if (router.currentRoute && router.currentRoute.route && router.currentRoute.route.options) {
          (0, _utils.extend)(initOptions, router.currentRoute.route.options);
        }

        router.currentPageEl = $pageEl[0];

        if (router.dynamicNavbar && $navbarEl.length) {
          router.currentNavbarEl = $navbarEl[0];
        }

        router.removeThemeElements($pageEl);

        if (router.dynamicNavbar && $navbarEl.length) {
          router.removeThemeElements($navbarEl);
        }

        if (initOptions.route.route.tab) {
          hasTabRoute = true;
          router.tabLoad(initOptions.route.route.tab, (0, _utils.extend)({}, initOptions));
        }

        router.pageCallback('init', $pageEl, $navbarEl, 'current', undefined, initOptions);
        router.pageCallback('beforeIn', $pageEl, $navbarEl, 'current', undefined, initOptions);
        router.pageCallback('afterIn', $pageEl, $navbarEl, 'current', undefined, initOptions);
      });

      if (historyRestored) {
        if (browserHistoryInitialMatch) {
          var preloadPreviousPage = router.params.preloadPreviousPage || router.params[app.theme + "SwipeBack"];

          if (preloadPreviousPage && router.history.length > 1) {
            router.back({
              preload: true
            });
          }
        } else {
          router.navigate(initialUrl, {
            initial: true,
            browserHistory: false,
            history: false,
            animate: browserHistoryAnimateOnLoad,
            once: {
              pageAfterIn: function pageAfterIn() {
                var preloadPreviousPage = router.params.preloadPreviousPage || router.params[app.theme + "SwipeBack"];

                if (preloadPreviousPage && router.history.length > 2) {
                  router.back({
                    preload: true
                  });
                }
              }
            }
          });
        }
      }

      if (!historyRestored && !hasTabRoute) {
        router.history.push(initialUrl);
        router.saveHistory();
      }
    }

    if (initialUrl && browserHistory && browserHistoryOnLoad && (!_history.default.state || !_history.default.state[view.id])) {
      _history.default.initViewState(view.id, {
        url: initialUrl
      });
    }

    router.emit('local::init routerInit', router);
  };

  _proto.destroy = function destroy() {
    var router = this;
    router.emit('local::destroy routerDestroy', router); // Delete props & methods

    Object.keys(router).forEach(function (routerProp) {
      router[routerProp] = null;
      delete router[routerProp];
    });
    router = null;
  };

  return Router;
}(_class.default); // Load


Router.prototype.navigate = _navigate.navigate;
Router.prototype.refreshPage = _navigate.refreshPage; // Tab

Router.prototype.tabLoad = _tab.tabLoad;
Router.prototype.tabRemove = _tab.tabRemove; // Modal

Router.prototype.modalLoad = _modal.modalLoad;
Router.prototype.modalRemove = _modal.modalRemove; // Back

Router.prototype.back = _back.back; // Clear history

Router.prototype.clearPreviousHistory = _clearPreviousHistory.clearPreviousHistory;
var _default = Router;
exports.default = _default;