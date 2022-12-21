"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _history = _interopRequireDefault(require("../../shared/history"));

var _getSupport = require("../../shared/get-support");

var _getDevice = require("../../shared/get-device");

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SwipeBack(r) {
  var router = r;
  var $el = router.$el,
      $navbarsEl = router.$navbarsEl,
      app = router.app,
      params = router.params;
  var support = (0, _getSupport.getSupport)();
  var device = (0, _getDevice.getDevice)();
  var isTouched = false;
  var isMoved = false;
  var touchesStart = {};
  var isScrolling;
  var $currentPageEl = [];
  var $previousPageEl = [];
  var viewContainerWidth;
  var touchesDiff;
  var allowViewTouchMove = true;
  var touchStartTime;
  var $currentNavbarEl = [];
  var $previousNavbarEl = [];
  var dynamicNavbar;
  var $pageShadowEl;
  var $pageOpacityEl;
  var animatableNavEls;
  var paramsSwipeBackAnimateShadow = params[app.theme + "SwipeBackAnimateShadow"];
  var paramsSwipeBackAnimateOpacity = params[app.theme + "SwipeBackAnimateOpacity"];
  var paramsSwipeBackActiveArea = params[app.theme + "SwipeBackActiveArea"];
  var paramsSwipeBackThreshold = params[app.theme + "SwipeBackThreshold"];
  var transformOrigin = app.rtl ? 'right center' : 'left center';
  var transformOriginTitleLarge = app.rtl ? 'calc(100% - var(--f7-navbar-large-title-padding-left) - var(--f7-safe-area-left)) center' : 'calc(var(--f7-navbar-large-title-padding-left) + var(--f7-safe-area-left)) center';

  function animatableNavElements() {
    var els = [];
    var inverter = app.rtl ? -1 : 1;
    var currentNavIsTransparent = $currentNavbarEl.hasClass('navbar-transparent') && !$currentNavbarEl.hasClass('navbar-large') && !$currentNavbarEl.hasClass('navbar-transparent-visible');
    var currentNavIsLarge = $currentNavbarEl.hasClass('navbar-large');
    var currentNavIsCollapsed = $currentNavbarEl.hasClass('navbar-large-collapsed');
    var currentNavIsLargeTransparent = $currentNavbarEl.hasClass('navbar-large-transparent') || $currentNavbarEl.hasClass('navbar-large') && $currentNavbarEl.hasClass('navbar-transparent');
    var previousNavIsTransparent = $previousNavbarEl.hasClass('navbar-transparent') && !$previousNavbarEl.hasClass('navbar-large') && !$previousNavbarEl.hasClass('navbar-transparent-visible');
    var previousNavIsLarge = $previousNavbarEl.hasClass('navbar-large');
    var previousNavIsCollapsed = $previousNavbarEl.hasClass('navbar-large-collapsed');
    var previousNavIsLargeTransparent = $previousNavbarEl.hasClass('navbar-large-transparent') || $previousNavbarEl.hasClass('navbar-large') && $previousNavbarEl.hasClass('navbar-transparent');
    var fromLarge = currentNavIsLarge && !currentNavIsCollapsed;
    var toLarge = previousNavIsLarge && !previousNavIsCollapsed;
    var $currentNavElements = $currentNavbarEl.find('.left, .title, .right, .subnavbar, .fading, .title-large, .navbar-bg');
    var $previousNavElements = $previousNavbarEl.find('.left, .title, .right, .subnavbar, .fading, .title-large, .navbar-bg');
    var activeNavBackIconText;
    var previousNavBackIconText;

    if (params.iosAnimateNavbarBackIcon) {
      if ($currentNavbarEl.hasClass('sliding') || $currentNavbarEl.find('.navbar-inner.sliding').length) {
        activeNavBackIconText = $currentNavbarEl.find('.left').find('.back .icon + span').eq(0);
      } else {
        activeNavBackIconText = $currentNavbarEl.find('.left.sliding').find('.back .icon + span').eq(0);
      }

      if ($previousNavbarEl.hasClass('sliding') || $previousNavbarEl.find('.navbar-inner.sliding').length) {
        previousNavBackIconText = $previousNavbarEl.find('.left').find('.back .icon + span').eq(0);
      } else {
        previousNavBackIconText = $previousNavbarEl.find('.left.sliding').find('.back .icon + span').eq(0);
      }

      if (activeNavBackIconText.length) {
        $previousNavElements.each(function (el) {
          if (!(0, _dom.default)(el).hasClass('title')) return;
          el.f7NavbarLeftOffset += activeNavBackIconText.prev('.icon')[0].offsetWidth;
        });
      }
    }

    $currentNavElements.each(function (navEl) {
      var $navEl = (0, _dom.default)(navEl);
      var isSubnavbar = $navEl.hasClass('subnavbar');
      var isLeft = $navEl.hasClass('left');
      var isTitle = $navEl.hasClass('title');
      var isBg = $navEl.hasClass('navbar-bg');
      if ((isTitle || isBg) && currentNavIsTransparent) return;
      if (!fromLarge && $navEl.hasClass('.title-large')) return;
      var el = {
        el: navEl
      };

      if (fromLarge) {
        if (isTitle) return;

        if ($navEl.hasClass('title-large')) {
          if (els.indexOf(el) < 0) els.push(el);
          el.overflow = 'visible';
          $navEl.find('.title-large-text').each(function (subNavEl) {
            els.push({
              el: subNavEl,
              transform: function transform(progress) {
                return "translateX(" + progress * 100 * inverter + "%)";
              }
            });
          });
          return;
        }
      }

      if (toLarge) {
        if (!fromLarge) {
          if ($navEl.hasClass('title-large')) {
            if (els.indexOf(el) < 0) els.push(el);
            el.opacity = 0;
          }
        }

        if (isLeft) {
          if (els.indexOf(el) < 0) els.push(el);

          el.opacity = function (progress) {
            return 1 - Math.pow(progress, 0.33);
          };

          $navEl.find('.back span').each(function (subNavEl) {
            els.push({
              el: subNavEl,
              'transform-origin': transformOrigin,
              transform: function transform(progress) {
                return "translateX(calc(" + progress + " * (var(--f7-navbarTitleLargeOffset) - var(--f7-navbarLeftTextOffset)))) translateY(calc(" + progress + " * (var(--f7-navbar-large-title-height) - var(--f7-navbar-large-title-padding-vertical) / 2))) scale(" + (1 + 1 * progress) + ")";
              }
            });
          });
          return;
        }
      }

      if (isBg) {
        if (els.indexOf(el) < 0) els.push(el);

        if (!fromLarge && !toLarge) {
          if (currentNavIsCollapsed) {
            if (currentNavIsLargeTransparent) {
              el.className = 'ios-swipeback-navbar-bg-large';
            }

            el.transform = function (progress) {
              return "translateX(" + 100 * progress * inverter + "%) translateY(calc(-1 * var(--f7-navbar-large-title-height)))";
            };
          } else {
            el.transform = function (progress) {
              return "translateX(" + 100 * progress * inverter + "%)";
            };
          }
        }

        if (!fromLarge && toLarge) {
          el.className = 'ios-swipeback-navbar-bg-large';

          el.transform = function (progress) {
            return "translateX(" + 100 * progress * inverter + "%) translateY(calc(-1 * " + (1 - progress) + " * var(--f7-navbar-large-title-height)))";
          };
        }

        if (fromLarge && toLarge) {
          el.transform = function (progress) {
            return "translateX(" + 100 * progress * inverter + "%)";
          };
        }

        if (fromLarge && !toLarge) {
          el.transform = function (progress) {
            return "translateX(" + 100 * progress * inverter + "%) translateY(calc(-" + progress + " * var(--f7-navbar-large-title-height)))";
          };
        }

        return;
      }

      if ($navEl.hasClass('title-large')) return;
      var isSliding = $navEl.hasClass('sliding') || $navEl.parents('.navbar-inner.sliding').length;
      if (els.indexOf(el) < 0) els.push(el);

      if (!isSubnavbar || isSubnavbar && !isSliding) {
        el.opacity = function (progress) {
          return 1 - Math.pow(progress, 0.33);
        };
      }

      if (isSliding) {
        var transformTarget = el;

        if (isLeft && activeNavBackIconText.length && params.iosAnimateNavbarBackIcon) {
          var textEl = {
            el: activeNavBackIconText[0]
          };
          transformTarget = textEl;
          els.push(textEl);
        }

        transformTarget.transform = function (progress) {
          var activeNavTranslate = progress * transformTarget.el.f7NavbarRightOffset;
          if (device.pixelRatio === 1) activeNavTranslate = Math.round(activeNavTranslate);

          if (isSubnavbar && currentNavIsLarge) {
            return "translate3d(" + activeNavTranslate + "px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)";
          }

          return "translate3d(" + activeNavTranslate + "px,0,0)";
        };
      }
    });
    $previousNavElements.each(function (navEl) {
      var $navEl = (0, _dom.default)(navEl);
      var isSubnavbar = $navEl.hasClass('subnavbar');
      var isLeft = $navEl.hasClass('left');
      var isTitle = $navEl.hasClass('title');
      var isBg = $navEl.hasClass('navbar-bg');
      if ((isTitle || isBg) && previousNavIsTransparent) return;
      var el = {
        el: navEl
      };

      if (toLarge) {
        if (isTitle) return;
        if (els.indexOf(el) < 0) els.push(el);

        if ($navEl.hasClass('title-large')) {
          el.opacity = 1;
          el.overflow = 'visible';
          $navEl.find('.title-large-text').each(function (subNavEl) {
            els.push({
              el: subNavEl,
              'transform-origin': transformOriginTitleLarge,
              opacity: function opacity(progress) {
                return Math.pow(progress, 3);
              },
              transform: function transform(progress) {
                return "translateX(calc(" + (1 - progress) + " * (var(--f7-navbarLeftTextOffset) - var(--f7-navbarTitleLargeOffset)))) translateY(calc(" + (progress - 1) + " * var(--f7-navbar-large-title-height) + " + (1 - progress) + " * var(--f7-navbar-large-title-padding-vertical))) scale(" + (0.5 + progress * 0.5) + ")";
              }
            });
          });
          return;
        }
      }

      if (isBg) {
        if (els.indexOf(el) < 0) els.push(el);

        if (!fromLarge && !toLarge) {
          if (previousNavIsCollapsed) {
            if (previousNavIsLargeTransparent) {
              el.className = 'ios-swipeback-navbar-bg-large';
            }

            el.transform = function (progress) {
              return "translateX(" + (-100 + 100 * progress) * inverter + "%) translateY(calc(-1 * var(--f7-navbar-large-title-height)))";
            };
          } else {
            el.transform = function (progress) {
              return "translateX(" + (-100 + 100 * progress) * inverter + "%)";
            };
          }
        }

        if (!fromLarge && toLarge) {
          el.transform = function (progress) {
            return "translateX(" + (-100 + 100 * progress) * inverter + "%) translateY(calc(-1 * " + (1 - progress) + " * var(--f7-navbar-large-title-height)))";
          };
        }

        if (fromLarge && !toLarge) {
          el.className = 'ios-swipeback-navbar-bg-large';

          el.transform = function (progress) {
            return "translateX(" + (-100 + 100 * progress) * inverter + "%) translateY(calc(-" + progress + " * var(--f7-navbar-large-title-height)))";
          };
        }

        if (fromLarge && toLarge) {
          el.transform = function (progress) {
            return "translateX(" + (-100 + 100 * progress) * inverter + "%)";
          };
        }

        return;
      }

      if ($navEl.hasClass('title-large')) return;
      var isSliding = $navEl.hasClass('sliding') || $previousNavbarEl.children('.navbar-inner.sliding').length;
      if (els.indexOf(el) < 0) els.push(el);

      if (!isSubnavbar || isSubnavbar && !isSliding) {
        el.opacity = function (progress) {
          return Math.pow(progress, 3);
        };
      }

      if (isSliding) {
        var transformTarget = el;

        if (isLeft && previousNavBackIconText.length && params.iosAnimateNavbarBackIcon) {
          var textEl = {
            el: previousNavBackIconText[0]
          };
          transformTarget = textEl;
          els.push(textEl);
        }

        transformTarget.transform = function (progress) {
          var previousNavTranslate = transformTarget.el.f7NavbarLeftOffset * (1 - progress);
          if (device.pixelRatio === 1) previousNavTranslate = Math.round(previousNavTranslate);

          if (isSubnavbar && previousNavIsLarge) {
            return "translate3d(" + previousNavTranslate + "px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)";
          }

          return "translate3d(" + previousNavTranslate + "px,0,0)";
        };
      }
    });
    return els;
  }

  function setAnimatableNavElements(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        progress = _ref.progress,
        reset = _ref.reset,
        transition = _ref.transition,
        reflow = _ref.reflow;

    var styles = ['overflow', 'transform', 'transform-origin', 'opacity'];

    if (transition === true || transition === false) {
      for (var i = 0; i < animatableNavEls.length; i += 1) {
        var el = animatableNavEls[i];

        if (el && el.el) {
          if (transition === true) el.el.classList.add('navbar-page-transitioning');
          if (transition === false) el.el.classList.remove('navbar-page-transitioning');
        }
      }
    }

    if (reflow && animatableNavEls.length && animatableNavEls[0] && animatableNavEls[0].el) {
      // eslint-disable-next-line
      animatableNavEls[0].el._clientLeft = animatableNavEls[0].el.clientLeft;
    }

    for (var _i = 0; _i < animatableNavEls.length; _i += 1) {
      var _el = animatableNavEls[_i];

      if (_el && _el.el) {
        if (_el.className && !_el.classNameSet && !reset) {
          _el.el.classList.add(_el.className);

          _el.classNameSet = true;
        }

        if (_el.className && reset) {
          _el.el.classList.remove(_el.className);
        }

        for (var j = 0; j < styles.length; j += 1) {
          var styleProp = styles[j];

          if (_el[styleProp]) {
            if (reset) {
              _el.el.style[styleProp] = '';
            } else if (typeof _el[styleProp] === 'function') {
              _el.el.style[styleProp] = _el[styleProp](progress);
            } else {
              _el.el.style[styleProp] = _el[styleProp];
            }
          }
        }
      }
    }
  }

  function handleTouchStart(e) {
    var swipeBackEnabled = params[app.theme + "SwipeBack"];
    if (!allowViewTouchMove || !swipeBackEnabled || isTouched || app.swipeout && app.swipeout.el || !router.allowPageChange) return;
    if ((0, _dom.default)(e.target).closest('.range-slider, .calendar-months').length > 0) return;
    if ((0, _dom.default)(e.target).closest('.page-master, .page-master-detail').length > 0 && params.masterDetailBreakpoint > 0 && app.width >= params.masterDetailBreakpoint) return;
    isMoved = false;
    isTouched = true;
    isScrolling = undefined;
    touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
    touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
    touchStartTime = (0, _utils.now)();
    dynamicNavbar = router.dynamicNavbar;
  }

  function handleTouchMove(e) {
    if (!isTouched) return;
    var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
    var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

    if (typeof isScrolling === 'undefined') {
      isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x)) || pageX < touchesStart.x && !app.rtl || pageX > touchesStart.x && app.rtl;
    }

    if (isScrolling || e.f7PreventSwipeBack || app.preventSwipeBack) {
      isTouched = false;
      return;
    }

    if (!isMoved) {
      // Calc values during first move fired
      var cancel = false;
      var target = (0, _dom.default)(e.target);
      var swipeout = target.closest('.swipeout');

      if (swipeout.length > 0) {
        if (!app.rtl && swipeout.find('.swipeout-actions-left').length > 0) cancel = true;
        if (app.rtl && swipeout.find('.swipeout-actions-right').length > 0) cancel = true;
      }

      $currentPageEl = target.closest('.page');
      if ($currentPageEl.hasClass('no-swipeback') || target.closest('.no-swipeback, .card-opened').length > 0) cancel = true;
      $previousPageEl = $el.find('.page-previous:not(.stacked)');

      if ($previousPageEl.length > 1) {
        $previousPageEl = $previousPageEl.eq($previousPageEl.length - 1);
      }

      var notFromBorder = touchesStart.x - $el.offset().left > paramsSwipeBackActiveArea;
      viewContainerWidth = $el.width();

      if (app.rtl) {
        notFromBorder = touchesStart.x < $el.offset().left - $el[0].scrollLeft + (viewContainerWidth - paramsSwipeBackActiveArea);
      } else {
        notFromBorder = touchesStart.x - $el.offset().left > paramsSwipeBackActiveArea;
      }

      if (notFromBorder) cancel = true;
      if ($previousPageEl.length === 0 || $currentPageEl.length === 0) cancel = true;

      if (cancel) {
        isTouched = false;
        return;
      }

      if (paramsSwipeBackAnimateShadow) {
        $pageShadowEl = $currentPageEl.find('.page-shadow-effect');

        if ($pageShadowEl.length === 0) {
          $pageShadowEl = (0, _dom.default)('<div class="page-shadow-effect"></div>');
          $currentPageEl.append($pageShadowEl);
        }
      }

      if (paramsSwipeBackAnimateOpacity) {
        $pageOpacityEl = $previousPageEl.find('.page-opacity-effect');

        if ($pageOpacityEl.length === 0) {
          $pageOpacityEl = (0, _dom.default)('<div class="page-opacity-effect"></div>');
          $previousPageEl.append($pageOpacityEl);
        }
      }

      if (dynamicNavbar) {
        $currentNavbarEl = $navbarsEl.find('.navbar-current:not(.stacked)');
        $previousNavbarEl = $navbarsEl.find('.navbar-previous:not(.stacked)');

        if ($previousNavbarEl.length > 1) {
          $previousNavbarEl = $previousNavbarEl.eq($previousNavbarEl.length - 1);
        }

        animatableNavEls = animatableNavElements($previousNavbarEl, $currentNavbarEl);
      } // Close/Hide Any Picker


      if ((0, _dom.default)('.sheet.modal-in').length > 0 && app.sheet) {
        app.sheet.close((0, _dom.default)('.sheet.modal-in'));
      }
    }

    e.f7PreventSwipePanel = true;
    isMoved = true;
    app.preventSwipePanelBySwipeBack = true;
    e.preventDefault(); // RTL inverter

    var inverter = app.rtl ? -1 : 1; // Touches diff

    touchesDiff = (pageX - touchesStart.x - paramsSwipeBackThreshold) * inverter;
    if (touchesDiff < 0) touchesDiff = 0;
    var percentage = Math.min(Math.max(touchesDiff / viewContainerWidth, 0), 1); // Swipe Back Callback

    var callbackData = {
      percentage: percentage,
      progress: percentage,
      currentPageEl: $currentPageEl[0],
      previousPageEl: $previousPageEl[0],
      currentNavbarEl: $currentNavbarEl[0],
      previousNavbarEl: $previousNavbarEl[0]
    };
    $el.trigger('swipeback:move', callbackData);
    router.emit('swipebackMove', callbackData); // Transform pages

    var currentPageTranslate = touchesDiff * inverter;
    var previousPageTranslate = (touchesDiff / 5 - viewContainerWidth / 5) * inverter;

    if (!app.rtl) {
      currentPageTranslate = Math.min(currentPageTranslate, viewContainerWidth);
      previousPageTranslate = Math.min(previousPageTranslate, 0);
    } else {
      currentPageTranslate = Math.max(currentPageTranslate, -viewContainerWidth);
      previousPageTranslate = Math.max(previousPageTranslate, 0);
    }

    if (device.pixelRatio === 1) {
      currentPageTranslate = Math.round(currentPageTranslate);
      previousPageTranslate = Math.round(previousPageTranslate);
    }

    router.swipeBackActive = true;
    (0, _dom.default)([$currentPageEl[0], $previousPageEl[0]]).addClass('page-swipeback-active');
    $currentPageEl.transform("translate3d(" + currentPageTranslate + "px,0,0)");
    if (paramsSwipeBackAnimateShadow) $pageShadowEl[0].style.opacity = 1 - 1 * percentage;

    if (app.theme === 'ios') {
      $previousPageEl.transform("translate3d(" + previousPageTranslate + "px,0,0)");
    }

    if (paramsSwipeBackAnimateOpacity) $pageOpacityEl[0].style.opacity = 1 - 1 * percentage; // Dynamic Navbars Animation

    if (!dynamicNavbar) return;
    setAnimatableNavElements({
      progress: percentage
    });
  }

  function handleTouchEnd() {
    app.preventSwipePanelBySwipeBack = false;

    if (!isTouched || !isMoved) {
      isTouched = false;
      isMoved = false;
      return;
    }

    isTouched = false;
    isMoved = false;
    router.swipeBackActive = false;
    var $pages = (0, _dom.default)([$currentPageEl[0], $previousPageEl[0]]);
    $pages.removeClass('page-swipeback-active');

    if (touchesDiff === 0) {
      $pages.transform('');
      if ($pageShadowEl && $pageShadowEl.length > 0) $pageShadowEl.remove();
      if ($pageOpacityEl && $pageOpacityEl.length > 0) $pageOpacityEl.remove();

      if (dynamicNavbar) {
        setAnimatableNavElements({
          reset: true
        });
      }

      return;
    }

    var timeDiff = (0, _utils.now)() - touchStartTime;
    var pageChanged = false; // Swipe back to previous page

    if (timeDiff < 300 && touchesDiff > 10 || timeDiff >= 300 && touchesDiff > viewContainerWidth / 2) {
      $currentPageEl.removeClass('page-current').addClass("page-next" + (app.theme !== 'ios' ? ' page-next-on-right' : ''));
      $previousPageEl.removeClass('page-previous').addClass('page-current').removeAttr('aria-hidden');
      if ($pageShadowEl) $pageShadowEl[0].style.opacity = '';
      if ($pageOpacityEl) $pageOpacityEl[0].style.opacity = '';

      if (dynamicNavbar) {
        router.setNavbarPosition($currentNavbarEl, 'next');
        router.setNavbarPosition($previousNavbarEl, 'current', false);
      }

      pageChanged = true;
    } // Reset custom styles
    // Add transitioning class for transition-duration


    $pages.addClass('page-transitioning page-transitioning-swipeback');

    if (device.ios) {
      // eslint-disable-next-line
      $currentPageEl[0]._clientLeft = $currentPageEl[0].clientLeft;
    }

    $pages.transform('');

    if (dynamicNavbar) {
      setAnimatableNavElements({
        progress: pageChanged ? 1 : 0,
        transition: true,
        reflow: !!device.ios
      });
    }

    allowViewTouchMove = false;
    router.allowPageChange = false; // Swipe Back Callback

    var callbackData = {
      currentPageEl: $currentPageEl[0],
      previousPageEl: $previousPageEl[0],
      currentNavbarEl: $currentNavbarEl[0],
      previousNavbarEl: $previousNavbarEl[0]
    };

    if (pageChanged) {
      // Update Route
      router.currentRoute = $previousPageEl[0].f7Page.route;
      router.currentPage = $previousPageEl[0]; // Page before animation callback

      router.pageCallback('beforeOut', $currentPageEl, $currentNavbarEl, 'current', 'next', {
        route: $currentPageEl[0].f7Page.route,
        swipeBack: true
      });
      router.pageCallback('beforeIn', $previousPageEl, $previousNavbarEl, 'previous', 'current', {
        route: $previousPageEl[0].f7Page.route,
        swipeBack: true
      }, $currentPageEl[0]);
      $el.trigger('swipeback:beforechange', callbackData);
      router.emit('swipebackBeforeChange', callbackData);
    } else {
      $el.trigger('swipeback:beforereset', callbackData);
      router.emit('swipebackBeforeReset', callbackData);
    }

    $currentPageEl.transitionEnd(function () {
      $pages.removeClass('page-transitioning page-transitioning-swipeback');

      if (dynamicNavbar) {
        setAnimatableNavElements({
          reset: true,
          transition: false
        });
      }

      allowViewTouchMove = true;
      router.allowPageChange = true;

      if (pageChanged) {
        // Update History
        if (router.history.length === 1) {
          router.history.unshift(router.url);
        }

        router.history.pop();
        router.saveHistory(); // Update push state

        if (params.browserHistory) {
          _history.default.back();
        } // Page after animation callback


        router.pageCallback('afterOut', $currentPageEl, $currentNavbarEl, 'current', 'next', {
          route: $currentPageEl[0].f7Page.route,
          swipeBack: true
        });
        router.pageCallback('afterIn', $previousPageEl, $previousNavbarEl, 'previous', 'current', {
          route: $previousPageEl[0].f7Page.route,
          swipeBack: true
        }); // Remove Old Page

        if (params.stackPages && router.initialPages.indexOf($currentPageEl[0]) >= 0) {
          $currentPageEl.addClass('stacked');

          if (dynamicNavbar) {
            $currentNavbarEl.addClass('stacked');
          }
        } else {
          router.pageCallback('beforeRemove', $currentPageEl, $currentNavbarEl, 'next', {
            swipeBack: true
          });
          router.removePage($currentPageEl);

          if (dynamicNavbar) {
            router.removeNavbar($currentNavbarEl);
          }
        }

        $el.trigger('swipeback:afterchange', callbackData);
        router.emit('swipebackAfterChange', callbackData);
        router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

        if (params.preloadPreviousPage) {
          router.back(router.history[router.history.length - 2], {
            preload: true
          });
        }
      } else {
        $el.trigger('swipeback:afterreset', callbackData);
        router.emit('swipebackAfterReset', callbackData);
      }

      if ($pageShadowEl && $pageShadowEl.length > 0) $pageShadowEl.remove();
      if ($pageOpacityEl && $pageOpacityEl.length > 0) $pageOpacityEl.remove();
    });
  }

  function attachEvents() {
    var passiveListener = app.touchEvents.start === 'touchstart' && support.passiveListener ? {
      passive: true,
      capture: false
    } : false;
    $el.on(app.touchEvents.start, handleTouchStart, passiveListener);
    app.on('touchmove:active', handleTouchMove);
    app.on('touchend:passive', handleTouchEnd);
  }

  function detachEvents() {
    var passiveListener = app.touchEvents.start === 'touchstart' && support.passiveListener ? {
      passive: true,
      capture: false
    } : false;
    $el.off(app.touchEvents.start, handleTouchStart, passiveListener);
    app.off('touchmove:active', handleTouchMove);
    app.off('touchend:passive', handleTouchEnd);
  }

  attachEvents();
  router.on('routerDestroy', detachEvents);
}

var _default = SwipeBack;
exports.default = _default;