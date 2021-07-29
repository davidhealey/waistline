"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

var _getSupport = require("../../shared/get-support");

var _getDevice = require("../../shared/get-device");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var PullToRefresh = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(PullToRefresh, _Framework7Class);

  function PullToRefresh(app, el) {
    var _this;

    _this = _Framework7Class.call(this, {}, [app]) || this;

    var ptr = _assertThisInitialized(_this);

    var device = (0, _getDevice.getDevice)();
    var support = (0, _getSupport.getSupport)();
    var $el = (0, _dom.default)(el);
    var $preloaderEl = $el.find('.ptr-preloader');
    ptr.$el = $el;
    ptr.el = $el[0];
    ptr.app = app;
    ptr.bottom = ptr.$el.hasClass('ptr-bottom'); // Extend defaults with modules params

    ptr.useModulesParams({});
    var isMaterial = app.theme === 'md';
    var isIos = app.theme === 'ios';
    var isAurora = app.theme === 'aurora'; // Done

    ptr.done = function done() {
      var $transitionTarget = isMaterial ? $preloaderEl : $el;
      $transitionTarget.transitionEnd(function () {
        $el.removeClass('ptr-transitioning ptr-pull-up ptr-pull-down ptr-closing');
        $el.trigger('ptr:done');
        ptr.emit('local::done ptrDone', $el[0]);
      });
      $el.removeClass('ptr-refreshing').addClass('ptr-transitioning ptr-closing');
      return ptr;
    };

    ptr.refresh = function refresh() {
      if ($el.hasClass('ptr-refreshing')) return ptr;
      $el.addClass('ptr-transitioning ptr-refreshing');
      $el.trigger('ptr:refresh', ptr.done);
      ptr.emit('local::refresh ptrRefresh', $el[0], ptr.done);
      return ptr;
    }; // Mousewheel


    ptr.mousewheel = $el.attr('data-ptr-mousewheel') === 'true'; // Events handling

    var touchId;
    var isTouched;
    var isMoved;
    var touchesStart = {};
    var isScrolling;
    var touchesDiff;
    var refresh = false;
    var useTranslate = false;
    var forceUseTranslate = false;
    var startTranslate = 0;
    var translate;
    var scrollTop;
    var wasScrolled;
    var triggerDistance;
    var dynamicTriggerDistance;
    var pullStarted;
    var hasNavbar = false;
    var scrollHeight;
    var offsetHeight;
    var maxScrollTop;
    var $pageEl = $el.parents('.page');
    if ($pageEl.find('.navbar').length > 0 || $pageEl.parents('.view').children('.navbars').length > 0) hasNavbar = true;
    if ($pageEl.hasClass('no-navbar')) hasNavbar = false;

    if (!ptr.bottom) {
      var pageNavbarEl = app.navbar.getElByPage($pageEl[0]);

      if (pageNavbarEl) {
        var $pageNavbarEl = (0, _dom.default)(pageNavbarEl);
        var isLargeTransparent = $pageNavbarEl.hasClass('navbar-large-transparent') || $pageNavbarEl.hasClass('navbar-large') && $pageNavbarEl.hasClass('navbar-transparent');
        var isTransparent = $pageNavbarEl.hasClass('navbar-transparent') && !$pageNavbarEl.hasClass('navbar-large');

        if (isLargeTransparent) {
          $el.addClass('ptr-with-navbar-large-transparent');
        } else if (isTransparent) {
          $el.addClass('ptr-with-navbar-transparent');
        }
      }
    }

    if (!hasNavbar && !ptr.bottom) $el.addClass('ptr-no-navbar'); // Define trigger distance

    if ($el.attr('data-ptr-distance')) {
      dynamicTriggerDistance = true;
    } else if (isMaterial) {
      triggerDistance = 66;
    } else if (isIos) {
      triggerDistance = 44;
    } else if (isAurora) {
      triggerDistance = 38;
    }

    function handleTouchStart(e) {
      if (isTouched) {
        if (device.os === 'android') {
          if ('targetTouches' in e && e.targetTouches.length > 1) return;
        } else return;
      }

      if ($el.hasClass('ptr-refreshing')) {
        return;
      }

      if ((0, _dom.default)(e.target).closest('.sortable-handler, .ptr-ignore, .card-expandable.card-opened').length) return;
      isMoved = false;
      pullStarted = false;
      isTouched = true;
      isScrolling = undefined;
      wasScrolled = undefined;
      if (e.type === 'touchstart') touchId = e.targetTouches[0].identifier;
      touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
    }

    function handleTouchMove(e) {
      if (!isTouched) return;
      var pageX;
      var pageY;
      var touch;

      if (e.type === 'touchmove') {
        if (touchId && e.touches) {
          for (var i = 0; i < e.touches.length; i += 1) {
            if (e.touches[i].identifier === touchId) {
              touch = e.touches[i];
            }
          }
        }

        if (!touch) touch = e.targetTouches[0];
        pageX = touch.pageX;
        pageY = touch.pageY;
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }

      if (!pageX || !pageY) return;

      if (typeof isScrolling === 'undefined') {
        isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
      }

      if (!isScrolling) {
        isTouched = false;
        return;
      }

      scrollTop = $el[0].scrollTop;

      if (!isMoved) {
        $el.removeClass('ptr-transitioning');
        var targetIsScrollable;
        scrollHeight = $el[0].scrollHeight;
        offsetHeight = $el[0].offsetHeight;

        if (ptr.bottom) {
          maxScrollTop = scrollHeight - offsetHeight;
        }

        if (scrollTop > scrollHeight) {
          isTouched = false;
          return;
        }

        var $ptrWatchScrollable = (0, _dom.default)(e.target).closest('.ptr-watch-scroll');

        if ($ptrWatchScrollable.length) {
          $ptrWatchScrollable.each(function (ptrScrollableEl) {
            if (ptrScrollableEl === el) return;

            if (ptrScrollableEl.scrollHeight > ptrScrollableEl.offsetHeight && (0, _dom.default)(ptrScrollableEl).css('overflow') === 'auto' && (!ptr.bottom && ptrScrollableEl.scrollTop > 0 || ptr.bottom && ptrScrollableEl.scrollTop < ptrScrollableEl.scrollHeight - ptrScrollableEl.offsetHeight)) {
              targetIsScrollable = true;
            }
          });
        }

        if (targetIsScrollable) {
          isTouched = false;
          return;
        }

        if (dynamicTriggerDistance) {
          triggerDistance = $el.attr('data-ptr-distance');
          if (triggerDistance.indexOf('%') >= 0) triggerDistance = scrollHeight * parseInt(triggerDistance, 10) / 100;
        }

        startTranslate = $el.hasClass('ptr-refreshing') ? triggerDistance : 0;

        if (scrollHeight === offsetHeight || device.os !== 'ios' || isMaterial) {
          useTranslate = true;
        } else {
          useTranslate = false;
        }

        forceUseTranslate = false;
      }

      isMoved = true;
      touchesDiff = pageY - touchesStart.y;
      if (typeof wasScrolled === 'undefined' && (ptr.bottom ? scrollTop !== maxScrollTop : scrollTop !== 0)) wasScrolled = true;
      var ptrStarted = ptr.bottom ? touchesDiff < 0 && scrollTop >= maxScrollTop || scrollTop > maxScrollTop : touchesDiff > 0 && scrollTop <= 0 || scrollTop < 0;

      if (ptrStarted) {
        // iOS 8 fix
        if (device.os === 'ios' && parseInt(device.osVersion.split('.')[0], 10) > 7) {
          if (!ptr.bottom && scrollTop === 0 && !wasScrolled) useTranslate = true;
          if (ptr.bottom && scrollTop === maxScrollTop && !wasScrolled) useTranslate = true;
        }

        if (!useTranslate && ptr.bottom && !isMaterial) {
          $el.css('-webkit-overflow-scrolling', 'auto');
          $el.scrollTop(maxScrollTop);
          forceUseTranslate = true;
        }

        if (useTranslate || forceUseTranslate) {
          if (e.cancelable) {
            e.preventDefault();
          }

          translate = (ptr.bottom ? -1 * Math.pow(Math.abs(touchesDiff), 0.85) : Math.pow(touchesDiff, 0.85)) + startTranslate;

          if (isMaterial) {
            $preloaderEl.transform("translate3d(0," + translate + "px,0)").find('.ptr-arrow').transform("rotate(" + (180 * (Math.abs(touchesDiff) / 66) + 100) + "deg)");
          } else {
            // eslint-disable-next-line
            if (ptr.bottom) {
              $el.children().transform("translate3d(0," + translate + "px,0)");
            } else {
              $el.transform("translate3d(0," + translate + "px,0)");
            }
          }
        }

        if ((useTranslate || forceUseTranslate) && Math.pow(Math.abs(touchesDiff), 0.85) > triggerDistance || !useTranslate && Math.abs(touchesDiff) >= triggerDistance * 2) {
          refresh = true;
          $el.addClass('ptr-pull-up').removeClass('ptr-pull-down');
        } else {
          refresh = false;
          $el.removeClass('ptr-pull-up').addClass('ptr-pull-down');
        }

        if (!pullStarted) {
          $el.trigger('ptr:pullstart');
          ptr.emit('local::pullStart ptrPullStart', $el[0]);
          pullStarted = true;
        }

        $el.trigger('ptr:pullmove', {
          event: e,
          scrollTop: scrollTop,
          translate: translate,
          touchesDiff: touchesDiff
        });
        ptr.emit('local::pullMove ptrPullMove', $el[0], {
          event: e,
          scrollTop: scrollTop,
          translate: translate,
          touchesDiff: touchesDiff
        });
      } else {
        pullStarted = false;
        $el.removeClass('ptr-pull-up ptr-pull-down');
        refresh = false;
      }
    }

    function handleTouchEnd(e) {
      if (e.type === 'touchend' && e.changedTouches && e.changedTouches.length > 0 && touchId) {
        if (e.changedTouches[0].identifier !== touchId) {
          isTouched = false;
          isScrolling = false;
          isMoved = false;
          touchId = null;
          return;
        }
      }

      if (!isTouched || !isMoved) {
        isTouched = false;
        isMoved = false;
        return;
      }

      if (translate) {
        $el.addClass('ptr-transitioning');
        translate = 0;
      }

      if (isMaterial) {
        $preloaderEl.transform('').find('.ptr-arrow').transform('');
      } else {
        // eslint-disable-next-line
        if (ptr.bottom) {
          $el.children().transform('');
        } else {
          $el.transform('');
        }
      }

      if (!useTranslate && ptr.bottom && !isMaterial) {
        $el.css('-webkit-overflow-scrolling', '');
      }

      if (refresh) {
        $el.addClass('ptr-refreshing');
        $el.trigger('ptr:refresh', ptr.done);
        ptr.emit('local::refresh ptrRefresh', $el[0], ptr.done);
      } else {
        $el.removeClass('ptr-pull-down');
      }

      isTouched = false;
      isMoved = false;

      if (pullStarted) {
        $el.trigger('ptr:pullend');
        ptr.emit('local::pullEnd ptrPullEnd', $el[0]);
      }
    }

    var mousewheelTimeout;
    var mousewheelMoved;
    var mousewheelAllow = true;
    var mousewheelTranslate = 0;

    function handleMouseWheelRelease() {
      mousewheelAllow = true;
      mousewheelMoved = false;
      mousewheelTranslate = 0;

      if (translate) {
        $el.addClass('ptr-transitioning');
        translate = 0;
      }

      if (isMaterial) {
        $preloaderEl.transform('').find('.ptr-arrow').transform('');
      } else {
        // eslint-disable-next-line
        if (ptr.bottom) {
          $el.children().transform('');
        } else {
          $el.transform('');
        }
      }

      if (refresh) {
        $el.addClass('ptr-refreshing');
        $el.trigger('ptr:refresh', ptr.done);
        ptr.emit('local::refresh ptrRefresh', $el[0], ptr.done);
      } else {
        $el.removeClass('ptr-pull-down');
      }

      if (pullStarted) {
        $el.trigger('ptr:pullend');
        ptr.emit('local::pullEnd ptrPullEnd', $el[0]);
      }
    }

    function handleMouseWheel(e) {
      if (!mousewheelAllow) return;
      var deltaX = e.deltaX,
          deltaY = e.deltaY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) return;

      if ($el.hasClass('ptr-refreshing')) {
        return;
      }

      if ((0, _dom.default)(e.target).closest('.sortable-handler, .ptr-ignore, .card-expandable.card-opened').length) return;
      clearTimeout(mousewheelTimeout);
      scrollTop = $el[0].scrollTop;

      if (!mousewheelMoved) {
        $el.removeClass('ptr-transitioning');
        var targetIsScrollable;
        scrollHeight = $el[0].scrollHeight;
        offsetHeight = $el[0].offsetHeight;

        if (ptr.bottom) {
          maxScrollTop = scrollHeight - offsetHeight;
        }

        if (scrollTop > scrollHeight) {
          mousewheelAllow = false;
          return;
        }

        var $ptrWatchScrollable = (0, _dom.default)(e.target).closest('.ptr-watch-scroll');

        if ($ptrWatchScrollable.length) {
          $ptrWatchScrollable.each(function (ptrScrollableEl) {
            if (ptrScrollableEl === el) return;

            if (ptrScrollableEl.scrollHeight > ptrScrollableEl.offsetHeight && (0, _dom.default)(ptrScrollableEl).css('overflow') === 'auto' && (!ptr.bottom && ptrScrollableEl.scrollTop > 0 || ptr.bottom && ptrScrollableEl.scrollTop < ptrScrollableEl.scrollHeight - ptrScrollableEl.offsetHeight)) {
              targetIsScrollable = true;
            }
          });
        }

        if (targetIsScrollable) {
          mousewheelAllow = false;
          return;
        }

        if (dynamicTriggerDistance) {
          triggerDistance = $el.attr('data-ptr-distance');
          if (triggerDistance.indexOf('%') >= 0) triggerDistance = scrollHeight * parseInt(triggerDistance, 10) / 100;
        }
      }

      isMoved = true;
      mousewheelTranslate -= deltaY;
      touchesDiff = mousewheelTranslate; // pageY - touchesStart.y;

      if (typeof wasScrolled === 'undefined' && (ptr.bottom ? scrollTop !== maxScrollTop : scrollTop !== 0)) wasScrolled = true;
      var ptrStarted = ptr.bottom ? touchesDiff < 0 && scrollTop >= maxScrollTop || scrollTop > maxScrollTop : touchesDiff > 0 && scrollTop <= 0 || scrollTop < 0;

      if (ptrStarted) {
        if (e.cancelable) {
          e.preventDefault();
        }

        translate = touchesDiff;

        if (Math.abs(translate) > triggerDistance) {
          translate = triggerDistance + Math.pow(Math.abs(translate) - triggerDistance, 0.7);
          if (ptr.bottom) translate = -translate;
        }

        if (isMaterial) {
          $preloaderEl.transform("translate3d(0," + translate + "px,0)").find('.ptr-arrow').transform("rotate(" + (180 * (Math.abs(touchesDiff) / 66) + 100) + "deg)");
        } else {
          // eslint-disable-next-line
          if (ptr.bottom) {
            $el.children().transform("translate3d(0," + translate + "px,0)");
          } else {
            $el.transform("translate3d(0," + translate + "px,0)");
          }
        }

        if (Math.abs(translate) > triggerDistance) {
          refresh = true;
          $el.addClass('ptr-pull-up').removeClass('ptr-pull-down');
        } else {
          refresh = false;
          $el.removeClass('ptr-pull-up').addClass('ptr-pull-down');
        }

        if (!pullStarted) {
          $el.trigger('ptr:pullstart');
          ptr.emit('local::pullStart ptrPullStart', $el[0]);
          pullStarted = true;
        }

        $el.trigger('ptr:pullmove', {
          event: e,
          scrollTop: scrollTop,
          translate: translate,
          touchesDiff: touchesDiff
        });
        ptr.emit('local::pullMove ptrPullMove', $el[0], {
          event: e,
          scrollTop: scrollTop,
          translate: translate,
          touchesDiff: touchesDiff
        });
      } else {
        pullStarted = false;
        $el.removeClass('ptr-pull-up ptr-pull-down');
        refresh = false;
      }

      mousewheelTimeout = setTimeout(handleMouseWheelRelease, 300);
    }

    if (!$pageEl.length || !$el.length) return ptr || _assertThisInitialized(_this);
    $el[0].f7PullToRefresh = ptr; // Events

    ptr.attachEvents = function attachEvents() {
      var passive = support.passiveListener ? {
        passive: true
      } : false;
      $el.on(app.touchEvents.start, handleTouchStart, passive);
      app.on('touchmove:active', handleTouchMove);
      app.on('touchend:passive', handleTouchEnd);

      if (ptr.mousewheel && !ptr.bottom) {
        $el.on('wheel', handleMouseWheel);
      }
    };

    ptr.detachEvents = function detachEvents() {
      var passive = support.passiveListener ? {
        passive: true
      } : false;
      $el.off(app.touchEvents.start, handleTouchStart, passive);
      app.off('touchmove:active', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);

      if (ptr.mousewheel && !ptr.bottom) {
        $el.off('wheel', handleMouseWheel);
      }
    }; // Install Modules


    ptr.useModules(); // Init

    ptr.init();
    return ptr || _assertThisInitialized(_this);
  }

  var _proto = PullToRefresh.prototype;

  _proto.init = function init() {
    var ptr = this;
    ptr.attachEvents();
  };

  _proto.destroy = function destroy() {
    var ptr = this;
    ptr.emit('local::beforeDestroy ptrBeforeDestroy', ptr);
    ptr.$el.trigger('ptr:beforedestroy');
    delete ptr.el.f7PullToRefresh;
    ptr.detachEvents();
    (0, _utils.deleteProps)(ptr);
    ptr = null;
  };

  return PullToRefresh;
}(_class.default);

var _default = PullToRefresh;
exports.default = _default;