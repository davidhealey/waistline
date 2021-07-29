function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import $ from '../../shared/dom7';
import { extend, now, nextTick } from '../../shared/utils';
import Modal from '../modal/modal-class';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx';

var Notification = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(Notification, _Modal);

  function Notification(app, params) {
    var _this;

    var extendedParams = extend({
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
      $el = $(notificationHtml);
    } else {
      $el = $(notification.params.el);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el.length === 0) {
      return notification.destroy() || _assertThisInitialized(_this);
    }

    extend(notification, {
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
      if (closeButton && $(e.target).closest('.notification-close-button').length) {
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
      touchStartTime = now();
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

      var timeDiff = now() - touchStartTime;
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
      timeoutId = nextTick(function () {
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

      $('.notification.modal-in').each(function (openedEl) {
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
    return $jsx("div", {
      class: "notification " + (cssClass || '')
    }, $jsx("div", {
      class: "notification-header"
    }, icon && $jsx("div", {
      class: "notification-icon"
    }, icon), title && $jsx("div", {
      class: "notification-title"
    }, title), titleRightText && $jsx("div", {
      class: "notification-title-right-text"
    }, titleRightText), closeButton && $jsx("span", {
      class: "notification-close-button"
    })), $jsx("div", {
      class: "notification-content"
    }, subtitle && $jsx("div", {
      class: "notification-subtitle"
    }, subtitle), text && $jsx("div", {
      class: "notification-text"
    }, text)));
  };

  return Notification;
}(Modal);

export default Notification;