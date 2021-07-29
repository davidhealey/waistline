"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _getSupport = require("../../shared/get-support");

var _getDevice = require("../../shared/get-device");

var _modalClass = _interopRequireDefault(require("../modal/modal-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Popup = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(Popup, _Modal);

  function Popup(app, params) {
    var _this;

    var extendedParams = (0, _utils.extend)({
      on: {}
    }, app.params.popup, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var popup = _assertThisInitialized(_this);

    var window = (0, _ssrWindow.getWindow)();
    var document = (0, _ssrWindow.getDocument)();
    var support = (0, _getSupport.getSupport)();
    var device = (0, _getDevice.getDevice)();
    popup.params = extendedParams; // Find Element

    var $el;

    if (!popup.params.el) {
      $el = (0, _dom.default)(popup.params.content).filter(function (node) {
        return node.nodeType === 1;
      }).eq(0);
    } else {
      $el = (0, _dom.default)(popup.params.el).eq(0);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el.length === 0) {
      return popup.destroy() || _assertThisInitialized(_this);
    }

    var $backdropEl;

    if (popup.params.backdrop && popup.params.backdropEl) {
      $backdropEl = (0, _dom.default)(popup.params.backdropEl);
    } else if (popup.params.backdrop) {
      $backdropEl = popup.$containerEl.children('.popup-backdrop');

      if ($backdropEl.length === 0) {
        $backdropEl = (0, _dom.default)('<div class="popup-backdrop"></div>');
        popup.$containerEl.append($backdropEl);
      }
    }

    (0, _utils.extend)(popup, {
      app: app,
      push: $el.hasClass('popup-push') || popup.params.push,
      $el: $el,
      el: $el[0],
      $backdropEl: $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0],
      type: 'popup',
      $htmlEl: (0, _dom.default)('html')
    });

    if (popup.params.push) {
      $el.addClass('popup-push');
    }

    function handleClick(e) {
      var target = e.target;
      var $target = (0, _dom.default)(target);
      var keyboardOpened = !device.desktop && device.cordova && (window.Keyboard && window.Keyboard.isVisible || window.cordova.plugins && window.cordova.plugins.Keyboard && window.cordova.plugins.Keyboard.isVisible);
      if (keyboardOpened) return;

      if ($target.closest(popup.el).length === 0) {
        if (popup.params && popup.params.closeByBackdropClick && popup.params.backdrop && popup.backdropEl && popup.backdropEl === target) {
          var needToClose = true;
          popup.$el.nextAll('.popup.modal-in').each(function (popupEl) {
            var popupInstance = popupEl.f7Modal;
            if (!popupInstance) return;

            if (popupInstance.params.closeByBackdropClick && popupInstance.params.backdrop && popupInstance.backdropEl === popup.backdropEl) {
              needToClose = false;
            }
          });

          if (needToClose) {
            popup.close();
          }
        }
      }
    }

    function onKeyDown(e) {
      var keyCode = e.keyCode;

      if (keyCode === 27 && popup.params.closeOnEscape) {
        popup.close();
      }
    }

    var pushOffset;
    var isPush;

    function pushViewScale(offset) {
      return (app.height - offset * 2) / app.height;
    }

    var allowSwipeToClose = true;
    var isTouched = false;
    var startTouch;
    var currentTouch;
    var isScrolling;
    var touchStartTime;
    var touchesDiff;
    var isMoved = false;
    var pageContentEl;
    var pageContentScrollTop;
    var pageContentOffsetHeight;
    var pageContentScrollHeight;
    var popupHeight;
    var $pushEl;

    function handleTouchStart(e) {
      if (isTouched || !allowSwipeToClose || !popup.params.swipeToClose) return;

      if (popup.params.swipeHandler && (0, _dom.default)(e.target).closest(popup.params.swipeHandler).length === 0) {
        return;
      }

      isTouched = true;
      isMoved = false;
      startTouch = {
        x: e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX,
        y: e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY
      };
      touchStartTime = (0, _utils.now)();
      isScrolling = undefined;

      if (!popup.params.swipeHandler && e.type === 'touchstart') {
        pageContentEl = (0, _dom.default)(e.target).closest('.page-content')[0];
      }
    }

    function handleTouchMove(e) {
      if (!isTouched) return;
      currentTouch = {
        x: e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX,
        y: e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY
      };

      if (typeof isScrolling === 'undefined') {
        isScrolling = !!(isScrolling || Math.abs(currentTouch.x - startTouch.x) > Math.abs(currentTouch.y - startTouch.y));
      }

      if (isScrolling) {
        isTouched = false;
        isMoved = false;
        return;
      }

      touchesDiff = startTouch.y - currentTouch.y;

      if (isPush && pushOffset && touchesDiff > 0) {
        touchesDiff = 0;
      }

      var direction = touchesDiff < 0 ? 'to-bottom' : 'to-top';
      $el.transition(0);

      if (typeof popup.params.swipeToClose === 'string' && direction !== popup.params.swipeToClose) {
        $el.transform('');
        $el.transition('');
        return;
      }

      if (!isMoved) {
        if (isPush && pushOffset) {
          popupHeight = $el[0].offsetHeight;
          $pushEl = $el.prevAll('.popup.modal-in').eq(0);

          if ($pushEl.length === 0) {
            $pushEl = app.$el.children('.view, .views');
          }
        }

        if (pageContentEl) {
          pageContentScrollTop = pageContentEl.scrollTop;
          pageContentScrollHeight = pageContentEl.scrollHeight;
          pageContentOffsetHeight = pageContentEl.offsetHeight;

          if (!(pageContentScrollHeight === pageContentOffsetHeight) && !(direction === 'to-bottom' && pageContentScrollTop === 0) && !(direction === 'to-top' && pageContentScrollTop === pageContentScrollHeight - pageContentOffsetHeight)) {
            $el.transform('');
            $el.transition('');
            isTouched = false;
            isMoved = false;
            return;
          }
        }

        isMoved = true;
        popup.emit('local::swipeStart popupSwipeStart', popup);
        popup.$el.trigger('popup:swipestart');
      } else {
        popup.emit('local::swipeMove popupSwipeMove', popup);
        popup.$el.trigger('popup:swipemove');
      }

      e.preventDefault();

      if (isPush && pushOffset) {
        var pushProgress = 1 - Math.abs(touchesDiff / popupHeight);
        var scale = 1 - (1 - pushViewScale(pushOffset)) * pushProgress;

        if ($pushEl.hasClass('popup')) {
          if ($pushEl.hasClass('popup-push')) {
            $pushEl.transition(0).forEach(function (el) {
              el.style.setProperty('transform', "translate3d(0, calc(-1 * " + pushProgress + " * (var(--f7-popup-push-offset) + 10px)) , 0px) scale(" + scale + ")", 'important');
            });
          } else {
            $pushEl.transition(0).forEach(function (el) {
              el.style.setProperty('transform', "translate3d(0, 0px , 0px) scale(" + scale + ")", 'important');
            });
          }
        } else {
          $pushEl.transition(0).forEach(function (el) {
            el.style.setProperty('transform', "translate3d(0,0,0) scale(" + scale + ")", 'important');
          });
        }
      }

      $el.transition(0).transform("translate3d(0," + -touchesDiff + "px,0)");
    }

    function handleTouchEnd() {
      isTouched = false;

      if (!isMoved) {
        return;
      }

      popup.emit('local::swipeEnd popupSwipeEnd', popup);
      popup.$el.trigger('popup:swipeend');
      isMoved = false;
      allowSwipeToClose = false;
      $el.transition('');

      if (isPush && pushOffset) {
        $pushEl.transition('').transform('');
      }

      var direction = touchesDiff <= 0 ? 'to-bottom' : 'to-top';

      if (typeof popup.params.swipeToClose === 'string' && direction !== popup.params.swipeToClose) {
        $el.transform('');
        allowSwipeToClose = true;
        return;
      }

      var diff = Math.abs(touchesDiff);
      var timeDiff = new Date().getTime() - touchStartTime;

      if (timeDiff < 300 && diff > 20 || timeDiff >= 300 && diff > 100) {
        (0, _utils.nextTick)(function () {
          if (direction === 'to-bottom') {
            $el.addClass('swipe-close-to-bottom');
          } else {
            $el.addClass('swipe-close-to-top');
          }

          $el.transform('');
          popup.emit('local::swipeclose popupSwipeClose', popup);
          popup.$el.trigger('popup:swipeclose');
          popup.close();
          allowSwipeToClose = true;
        });
        return;
      }

      allowSwipeToClose = true;
      $el.transform('');
    }

    var passive = support.passiveListener ? {
      passive: true
    } : false;

    if (popup.params.swipeToClose) {
      $el.on(app.touchEvents.start, handleTouchStart, passive);
      app.on('touchmove', handleTouchMove);
      app.on('touchend:passive', handleTouchEnd);
      popup.once('popupDestroy', function () {
        $el.off(app.touchEvents.start, handleTouchStart, passive);
        app.off('touchmove', handleTouchMove);
        app.off('touchend:passive', handleTouchEnd);
      });
    }

    var hasPreviousPushPopup;

    var updatePushOffset = function updatePushOffset() {
      var wasPush = isPush;

      if (popup.push) {
        isPush = popup.push && (app.width < 630 || app.height < 630 || $el.hasClass('popup-tablet-fullscreen'));
      }

      if (isPush && !wasPush) {
        // eslint-disable-next-line
        setPushOffset();
      } else if (isPush && wasPush) {
        popup.$htmlEl[0].style.setProperty('--f7-popup-push-scale', pushViewScale(pushOffset));
      } else if (!isPush && wasPush) {
        popup.$htmlEl.removeClass('with-modal-popup-push');
        popup.$htmlEl[0].style.removeProperty('--f7-popup-push-scale');
      }
    };

    var setPushOffset = function setPushOffset() {
      app.off('resize', updatePushOffset);

      if (popup.push) {
        isPush = popup.push && (app.width < 630 || app.height < 630 || $el.hasClass('popup-tablet-fullscreen'));
      }

      if (isPush) {
        pushOffset = parseInt($el.css('--f7-popup-push-offset'), 10);
        if (Number.isNaN(pushOffset)) pushOffset = 0;

        if (pushOffset) {
          $el.addClass('popup-push');
          popup.$htmlEl.addClass('with-modal-popup-push');
          popup.$htmlEl[0].style.setProperty('--f7-popup-push-scale', pushViewScale(pushOffset));
        }
      }

      app.on('resize', updatePushOffset);
    };

    popup.on('open', function () {
      hasPreviousPushPopup = false;

      if (popup.params.closeOnEscape) {
        (0, _dom.default)(document).on('keydown', onKeyDown);
      }

      $el.prevAll('.popup.modal-in').addClass('popup-behind');
      setPushOffset();
    });
    popup.on('opened', function () {
      $el.removeClass('swipe-close-to-bottom swipe-close-to-top');

      if (popup.params.closeByBackdropClick) {
        app.on('click', handleClick);
      }
    });
    popup.on('close', function () {
      hasPreviousPushPopup = popup.$el.prevAll('.popup-push.modal-in').length > 0;

      if (popup.params.closeOnEscape) {
        (0, _dom.default)(document).off('keydown', onKeyDown);
      }

      if (popup.params.closeByBackdropClick) {
        app.off('click', handleClick);
      }

      $el.prevAll('.popup.modal-in').eq(0).removeClass('popup-behind');

      if (isPush && pushOffset && !hasPreviousPushPopup) {
        popup.$htmlEl.removeClass('with-modal-popup-push');
        popup.$htmlEl.addClass('with-modal-popup-push-closing');
      }

      app.off('resize', updatePushOffset);
    });
    popup.on('closed', function () {
      $el.removeClass('popup-behind');

      if (isPush && pushOffset && !hasPreviousPushPopup) {
        popup.$htmlEl.removeClass('with-modal-popup-push-closing');
        popup.$htmlEl[0].style.removeProperty('--f7-popup-push-scale');
      }
    });
    $el[0].f7Modal = popup;
    return popup || _assertThisInitialized(_this);
  }

  return Popup;
}(_modalClass.default);

var _default = Popup;
exports.default = _default;