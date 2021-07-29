"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _modalClass = _interopRequireDefault(require("../modal/modal-class"));

var _$jsx = _interopRequireDefault(require("../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Notification = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(Notification, _Modal);

  function Notification(app, params) {
    var _this;

    var extendedParams = (0, _utils.extend)({
      on: {}
    }, app.params.notification, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var notification = _assertThisInitialized(_this);

    notification.app = app;
    notification.params = extendedParams;
    var _notification$params = notification.params,
        icon = _notification$params.icon,
        title = _notification$params.title,
        titleRightText = _notification$params.titleRightText,
        subtitle = _notification$params.subtitle,
        text = _notification$params.text,
        closeButton = _notification$params.closeButton,
        closeTimeout = _notification$params.closeTimeout,
        cssClass = _notification$params.cssClass,
        closeOnClick = _notification$params.closeOnClick;
    var $el;

    if (!notification.params.el) {
      // Find Element
      var notificationHtml = notification.render({
        icon: icon,
        title: title,
        titleRightText: titleRightText,
        subtitle: subtitle,
        text: text,
        closeButton: closeButton,
        cssClass: cssClass
      });
      $el = (0, _dom.default)(notificationHtml);
    } else {
      $el = (0, _dom.default)(notification.params.el);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el.length === 0) {
      return notification.destroy() || _assertThisInitialized(_this);
    }

    (0, _utils.extend)(notification, {
      $el: $el,
      el: $el[0],
      type: 'notification'
    });
    $el[0].f7Modal = notification;

    if (closeButton) {
      $el.find('.notification-close-button').on('click', function () {
        notification.close();
      });
    }

    $el.on('click', function (e) {
      if (closeButton && (0, _dom.default)(e.target).closest('.notification-close-button').length) {
        return;
      }

      notification.emit('local::click notificationClick', notification);
      if (closeOnClick) notification.close();
    });
    notification.on('beforeDestroy', function () {
      $el.off('click');
    });
    /* Touch Events */

    var isTouched;
    var isMoved;
    var isScrolling;
    var touchesDiff;
    var touchStartTime;
    var notificationHeight;
    var touchesStart = {};

    function handleTouchStart(e) {
      if (isTouched) return;
      isTouched = true;
      isMoved = false;
      isScrolling = undefined;
      touchStartTime = (0, _utils.now)();
      touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
    }

    function handleTouchMove(e) {
      if (!isTouched) return;
      var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
      var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

      if (typeof isScrolling === 'undefined') {
        isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) < Math.abs(pageX - touchesStart.x));
      }

      if (isScrolling) {
        isTouched = false;
        return;
      }

      e.preventDefault();

      if (!isMoved) {
        notification.$el.removeClass('notification-transitioning');
        notification.$el.transition(0);
        notificationHeight = notification.$el[0].offsetHeight / 2;
      }

      isMoved = true;
      touchesDiff = pageY - touchesStart.y;
      var newTranslate = touchesDiff;

      if (touchesDiff > 0) {
        newTranslate = Math.pow(touchesDiff, 0.8);
      }

      notification.$el.transform("translate3d(0, " + newTranslate + "px, 0)");
    }

    function handleTouchEnd() {
      if (!isTouched || !isMoved) {
        isTouched = false;
        isMoved = false;
        return;
      }

      isTouched = false;
      isMoved = false;

      if (touchesDiff === 0) {
        return;
      }

      var timeDiff = (0, _utils.now)() - touchStartTime;
      notification.$el.transition('');
      notification.$el.addClass('notification-transitioning');
      notification.$el.transform('');

      if (touchesDiff < -10 && timeDiff < 300 || -touchesDiff >= notificationHeight / 1) {
        notification.close();
      }
    }

    function attachTouchEvents() {
      notification.$el.on(app.touchEvents.start, handleTouchStart, {
        passive: true
      });
      app.on('touchmove:active', handleTouchMove);
      app.on('touchend:passive', handleTouchEnd);
    }

    function detachTouchEvents() {
      notification.$el.off(app.touchEvents.start, handleTouchStart, {
        passive: true
      });
      app.off('touchmove:active', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);
    }

    var timeoutId;

    function closeOnTimeout() {
      timeoutId = (0, _utils.nextTick)(function () {
        if (isTouched && isMoved) {
          closeOnTimeout();
          return;
        }

        notification.close();
      }, closeTimeout);
    }

    notification.on('open', function () {
      if (notification.params.swipeToClose) {
        attachTouchEvents();
      }

      (0, _dom.default)('.notification.modal-in').each(function (openedEl) {
        var notificationInstance = app.notification.get(openedEl);

        if (openedEl !== notification.el && notificationInstance) {
          notificationInstance.close();
        }
      });

      if (closeTimeout) {
        closeOnTimeout();
      }
    });
    notification.on('close beforeDestroy', function () {
      if (notification.params.swipeToClose) {
        detachTouchEvents();
      }

      clearTimeout(timeoutId);
    });
    return notification || _assertThisInitialized(_this);
  }

  var _proto = Notification.prototype;

  _proto.render = function render() {
    var notification = this;
    if (notification.params.render) return notification.params.render.call(notification, notification);
    var _notification$params2 = notification.params,
        icon = _notification$params2.icon,
        title = _notification$params2.title,
        titleRightText = _notification$params2.titleRightText,
        subtitle = _notification$params2.subtitle,
        text = _notification$params2.text,
        closeButton = _notification$params2.closeButton,
        cssClass = _notification$params2.cssClass;
    return (0, _$jsx.default)("div", {
      class: "notification " + (cssClass || '')
    }, (0, _$jsx.default)("div", {
      class: "notification-header"
    }, icon && (0, _$jsx.default)("div", {
      class: "notification-icon"
    }, icon), title && (0, _$jsx.default)("div", {
      class: "notification-title"
    }, title), titleRightText && (0, _$jsx.default)("div", {
      class: "notification-title-right-text"
    }, titleRightText), closeButton && (0, _$jsx.default)("span", {
      class: "notification-close-button"
    })), (0, _$jsx.default)("div", {
      class: "notification-content"
    }, subtitle && (0, _$jsx.default)("div", {
      class: "notification-subtitle"
    }, subtitle), text && (0, _$jsx.default)("div", {
      class: "notification-text"
    }, text)));
  };

  return Notification;
}(_modalClass.default);

var _default = Notification;
exports.default = _default;