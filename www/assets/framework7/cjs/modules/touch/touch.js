"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _getSupport = require("../../shared/get-support");

var _getDevice = require("../../shared/get-device");

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-nested-ternary */
function initTouch() {
  var app = this;
  var device = (0, _getDevice.getDevice)();
  var support = (0, _getSupport.getSupport)();
  var window = (0, _ssrWindow.getWindow)();
  var document = (0, _ssrWindow.getDocument)();
  var params = app.params.touch;
  var useRipple = params[app.theme + "TouchRipple"];

  if (device.ios && device.webView) {
    // Strange hack required for iOS 8 webview to work on inputs
    window.addEventListener('touchstart', function () {});
  }

  var touchStartX;
  var touchStartY;
  var targetElement;
  var isMoved;
  var tapHoldFired;
  var tapHoldTimeout;
  var preventClick;
  var activableElement;
  var activeTimeout;
  var rippleWave;
  var rippleTarget;
  var rippleTimeout;

  function findActivableElement(el) {
    var target = (0, _dom.default)(el);
    var parents = target.parents(params.activeStateElements);

    if (target.closest('.no-active-state').length) {
      return null;
    }

    var activable;

    if (target.is(params.activeStateElements)) {
      activable = target;
    }

    if (parents.length > 0) {
      activable = activable ? activable.add(parents) : parents;
    }

    if (activable && activable.length > 1) {
      var newActivable = [];
      var preventPropagation;

      for (var i = 0; i < activable.length; i += 1) {
        if (!preventPropagation) {
          newActivable.push(activable[i]);

          if (activable.eq(i).hasClass('prevent-active-state-propagation') || activable.eq(i).hasClass('no-active-state-propagation')) {
            preventPropagation = true;
          }
        }
      }

      activable = (0, _dom.default)(newActivable);
    }

    return activable || target;
  }

  function isInsideScrollableView(el) {
    var pageContent = el.parents('.page-content');
    return pageContent.length > 0;
  }

  function addActive() {
    if (!activableElement) return;
    activableElement.addClass('active-state');
  }

  function removeActive() {
    if (!activableElement) return;
    activableElement.removeClass('active-state');
    activableElement = null;
  } // Ripple handlers


  function findRippleElement(el) {
    var rippleElements = params.touchRippleElements;
    var $el = (0, _dom.default)(el);

    if ($el.is(rippleElements)) {
      if ($el.hasClass('no-ripple')) {
        return false;
      }

      return $el;
    }

    if ($el.parents(rippleElements).length > 0) {
      var rippleParent = $el.parents(rippleElements).eq(0);

      if (rippleParent.hasClass('no-ripple')) {
        return false;
      }

      return rippleParent;
    }

    return false;
  }

  function createRipple($el, x, y) {
    if (!$el) return;
    rippleWave = app.touchRipple.create(app, $el, x, y);
  }

  function removeRipple() {
    if (!rippleWave) return;
    rippleWave.remove();
    rippleWave = undefined;
    rippleTarget = undefined;
  }

  function rippleTouchStart(el) {
    rippleTarget = findRippleElement(el);

    if (!rippleTarget || rippleTarget.length === 0) {
      rippleTarget = undefined;
      return;
    }

    var inScrollable = isInsideScrollableView(rippleTarget);

    if (!inScrollable) {
      removeRipple();
      createRipple(rippleTarget, touchStartX, touchStartY);
    } else {
      clearTimeout(rippleTimeout);
      rippleTimeout = setTimeout(function () {
        removeRipple();
        createRipple(rippleTarget, touchStartX, touchStartY);
      }, 80);
    }
  }

  function rippleTouchMove() {
    clearTimeout(rippleTimeout);
    removeRipple();
  }

  function rippleTouchEnd() {
    if (!rippleWave && rippleTarget && !isMoved) {
      clearTimeout(rippleTimeout);
      createRipple(rippleTarget, touchStartX, touchStartY);
      setTimeout(removeRipple, 0);
    } else {
      removeRipple();
    }
  } // Mouse Handlers


  function handleMouseDown(e) {
    var $activableEl = findActivableElement(e.target);

    if ($activableEl) {
      $activableEl.addClass('active-state');

      if ('which' in e && e.which === 3) {
        setTimeout(function () {
          (0, _dom.default)('.active-state').removeClass('active-state');
        }, 0);
      }
    }

    if (useRipple) {
      touchStartX = e.pageX;
      touchStartY = e.pageY;
      rippleTouchStart(e.target, e.pageX, e.pageY);
    }
  }

  function handleMouseMove() {
    if (!params.activeStateOnMouseMove) {
      (0, _dom.default)('.active-state').removeClass('active-state');
    }

    if (useRipple) {
      rippleTouchMove();
    }
  }

  function handleMouseUp() {
    (0, _dom.default)('.active-state').removeClass('active-state');

    if (useRipple) {
      rippleTouchEnd();
    }
  }

  function handleTouchCancel() {
    targetElement = null; // Remove Active State

    clearTimeout(activeTimeout);
    clearTimeout(tapHoldTimeout);

    if (params.activeState) {
      removeActive();
    } // Remove Ripple


    if (useRipple) {
      rippleTouchEnd();
    }
  }

  function handleTouchStart(e) {
    isMoved = false;
    tapHoldFired = false;
    preventClick = false;

    if (e.targetTouches.length > 1) {
      if (activableElement) removeActive();
      return true;
    }

    if (e.touches.length > 1 && activableElement) {
      removeActive();
    }

    if (params.tapHold) {
      if (tapHoldTimeout) clearTimeout(tapHoldTimeout);
      tapHoldTimeout = setTimeout(function () {
        if (e && e.touches && e.touches.length > 1) return;
        tapHoldFired = true;
        e.preventDefault();
        preventClick = true;
        (0, _dom.default)(e.target).trigger('taphold', e);
        app.emit('taphold', e);
      }, params.tapHoldDelay);
    }

    targetElement = e.target;
    touchStartX = e.targetTouches[0].pageX;
    touchStartY = e.targetTouches[0].pageY;

    if (params.activeState) {
      activableElement = findActivableElement(targetElement);

      if (activableElement && !isInsideScrollableView(activableElement)) {
        addActive();
      } else if (activableElement) {
        activeTimeout = setTimeout(addActive, 80);
      }
    }

    if (useRipple) {
      rippleTouchStart(targetElement, touchStartX, touchStartY);
    }

    return true;
  }

  function handleTouchMove(e) {
    var touch;
    var distance;

    if (e.type === 'touchmove') {
      touch = e.targetTouches[0];
      distance = params.touchClicksDistanceThreshold;
    }

    if (distance && touch) {
      var pageX = touch.pageX;
      var pageY = touch.pageY;

      if (Math.abs(pageX - touchStartX) > distance || Math.abs(pageY - touchStartY) > distance) {
        isMoved = true;
      }
    } else {
      isMoved = true;
    }

    if (isMoved) {
      preventClick = true;

      if (params.tapHold) {
        clearTimeout(tapHoldTimeout);
      }

      if (params.activeState) {
        clearTimeout(activeTimeout);
        removeActive();
      }

      if (useRipple) {
        rippleTouchMove();
      }
    }
  }

  function handleTouchEnd(e) {
    clearTimeout(activeTimeout);
    clearTimeout(tapHoldTimeout);

    if (document.activeElement === e.target) {
      if (params.activeState) removeActive();

      if (useRipple) {
        rippleTouchEnd();
      }

      return true;
    }

    if (params.activeState) {
      addActive();
      setTimeout(removeActive, 0);
    }

    if (useRipple) {
      rippleTouchEnd();
    }

    if (params.tapHoldPreventClicks && tapHoldFired || preventClick) {
      if (e.cancelable) e.preventDefault();
      preventClick = true;
      return false;
    }

    return true;
  }

  function handleClick(e) {
    var isOverswipe = e && e.detail && e.detail === 'f7Overswipe';
    var localPreventClick = preventClick;

    if (targetElement && e.target !== targetElement) {
      if (isOverswipe) {
        localPreventClick = false;
      } else {
        localPreventClick = true;
      }
    }

    if (params.tapHold && params.tapHoldPreventClicks && tapHoldFired) {
      localPreventClick = true;
    }

    if (localPreventClick) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }

    if (params.tapHold) {
      tapHoldTimeout = setTimeout(function () {
        tapHoldFired = false;
      }, device.ios || device.androidChrome ? 100 : 400);
    }

    preventClick = false;
    targetElement = null;
    return !localPreventClick;
  }

  function emitAppTouchEvent(name, e) {
    app.emit({
      events: name,
      data: [e]
    });
  }

  function appClick(e) {
    emitAppTouchEvent('click', e);
  }

  function appTouchStartActive(e) {
    emitAppTouchEvent('touchstart touchstart:active', e);
  }

  function appTouchMoveActive(e) {
    emitAppTouchEvent('touchmove touchmove:active', e);
  }

  function appTouchEndActive(e) {
    emitAppTouchEvent('touchend touchend:active', e);
  }

  function appTouchStartPassive(e) {
    emitAppTouchEvent('touchstart:passive', e);
  }

  function appTouchMovePassive(e) {
    emitAppTouchEvent('touchmove:passive', e);
  }

  function appTouchEndPassive(e) {
    emitAppTouchEvent('touchend:passive', e);
  }

  var passiveListener = support.passiveListener ? {
    passive: true
  } : false;
  var passiveListenerCapture = support.passiveListener ? {
    passive: true,
    capture: true
  } : true;
  var activeListener = support.passiveListener ? {
    passive: false
  } : false;
  var activeListenerCapture = support.passiveListener ? {
    passive: false,
    capture: true
  } : true;
  document.addEventListener('click', appClick, true);

  if (support.passiveListener) {
    document.addEventListener(app.touchEvents.start, appTouchStartActive, activeListenerCapture);
    document.addEventListener(app.touchEvents.move, appTouchMoveActive, activeListener);
    document.addEventListener(app.touchEvents.end, appTouchEndActive, activeListener);
    document.addEventListener(app.touchEvents.start, appTouchStartPassive, passiveListenerCapture);
    document.addEventListener(app.touchEvents.move, appTouchMovePassive, passiveListener);
    document.addEventListener(app.touchEvents.end, appTouchEndPassive, passiveListener);
  } else {
    document.addEventListener(app.touchEvents.start, function (e) {
      appTouchStartActive(e);
      appTouchStartPassive(e);
    }, true);
    document.addEventListener(app.touchEvents.move, function (e) {
      appTouchMoveActive(e);
      appTouchMovePassive(e);
    }, false);
    document.addEventListener(app.touchEvents.end, function (e) {
      appTouchEndActive(e);
      appTouchEndPassive(e);
    }, false);
  }

  if (support.touch) {
    app.on('click', handleClick);
    app.on('touchstart', handleTouchStart);
    app.on('touchmove', handleTouchMove);
    app.on('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel, {
      passive: true
    });
  } else if (params.activeState) {
    app.on('touchstart', handleMouseDown);
    app.on('touchmove', handleMouseMove);
    app.on('touchend', handleMouseUp);
    document.addEventListener('pointercancel', handleMouseUp, {
      passive: true
    });
  }

  document.addEventListener('contextmenu', function (e) {
    if (params.disableContextMenu && (device.ios || device.android || device.cordova || window.Capacitor && window.Capacitor.isNative)) {
      e.preventDefault();
    }

    if (useRipple) {
      if (activableElement) removeActive();
      rippleTouchEnd();
    }
  });
}

var _default = {
  name: 'touch',
  params: {
    touch: {
      // Clicks
      touchClicksDistanceThreshold: 5,
      // ContextMenu
      disableContextMenu: false,
      // Tap Hold
      tapHold: false,
      tapHoldDelay: 750,
      tapHoldPreventClicks: true,
      // Active State
      activeState: true,
      activeStateElements: 'a, button, label, span, .actions-button, .stepper-button, .stepper-button-plus, .stepper-button-minus, .card-expandable, .menu-item, .link, .item-link, .accordion-item-toggle',
      activeStateOnMouseMove: false,
      mdTouchRipple: true,
      iosTouchRipple: false,
      auroraTouchRipple: false,
      touchRippleElements: '.ripple, .link, .item-link, .list-button, .links-list a, .button, button, .input-clear-button, .dialog-button, .tab-link, .item-radio, .item-checkbox, .actions-button, .searchbar-disable-button, .fab a, .checkbox, .radio, .data-table .sortable-cell:not(.input-cell), .notification-close-button, .stepper-button, .stepper-button-minus, .stepper-button-plus, .menu-item-content, .list.accordion-list .accordion-item-toggle',
      touchRippleInsetElements: '.ripple-inset, .icon-only, .searchbar-disable-button, .input-clear-button, .notification-close-button, .md .navbar .link.back'
    }
  },
  create: function create() {
    var app = this;
    var support = (0, _getSupport.getSupport)();
    (0, _utils.extend)(app, {
      touchEvents: {
        start: support.touch ? 'touchstart' : support.pointerEvents ? 'pointerdown' : 'mousedown',
        move: support.touch ? 'touchmove' : support.pointerEvents ? 'pointermove' : 'mousemove',
        end: support.touch ? 'touchend' : support.pointerEvents ? 'pointerup' : 'mouseup'
      }
    });
  },
  on: {
    init: initTouch
  }
};
exports.default = _default;