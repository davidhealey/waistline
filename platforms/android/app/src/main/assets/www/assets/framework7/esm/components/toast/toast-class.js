function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { getWindow } from 'ssr-window';
import $ from '../../shared/dom7';
import { extend, nextTick } from '../../shared/utils';
import Modal from '../modal/modal-class';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx';

var Toast = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(Toast, _Modal);

  function Toast(app, params) {
    var _this;

    var extendedParams = extend({
      on: {}
    }, app.params.toast, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var toast = _assertThisInitialized(_this);

    var window = getWindow();
    toast.app = app;
    toast.params = extendedParams;
    var _toast$params = toast.params,
        closeButton = _toast$params.closeButton,
        closeTimeout = _toast$params.closeTimeout;
    var $el;

    if (!toast.params.el) {
      // Find Element
      var toastHtml = toast.render();
      $el = $(toastHtml);
    } else {
      $el = $(toast.params.el);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el.length === 0) {
      return toast.destroy() || _assertThisInitialized(_this);
    }

    extend(toast, {
      $el: $el,
      el: $el[0],
      type: 'toast'
    });
    $el[0].f7Modal = toast;

    if (closeButton) {
      $el.find('.toast-button').on('click', function () {
        toast.emit('local::closeButtonClick toastCloseButtonClick', toast);
        toast.close();
      });
      toast.on('beforeDestroy', function () {
        $el.find('.toast-button').off('click');
      });
    }

    var timeoutId;
    toast.on('open', function () {
      $('.toast.modal-in').each(function (openedEl) {
        var toastInstance = app.toast.get(openedEl);

        if (openedEl !== toast.el && toastInstance) {
          toastInstance.close();
        }
      });

      if (closeTimeout) {
        timeoutId = nextTick(function () {
          toast.close();
        }, closeTimeout);
      }
    });
    toast.on('close', function () {
      window.clearTimeout(timeoutId);
    });

    if (toast.params.destroyOnClose) {
      toast.once('closed', function () {
        setTimeout(function () {
          toast.destroy();
        }, 0);
      });
    }

    return toast || _assertThisInitialized(_this);
  }

  var _proto = Toast.prototype;

  _proto.render = function render() {
    var toast = this;
    if (toast.params.render) return toast.params.render.call(toast, toast);
    var _toast$params2 = toast.params,
        position = _toast$params2.position,
        horizontalPosition = _toast$params2.horizontalPosition,
        cssClass = _toast$params2.cssClass,
        icon = _toast$params2.icon,
        text = _toast$params2.text,
        closeButton = _toast$params2.closeButton,
        closeButtonColor = _toast$params2.closeButtonColor,
        closeButtonText = _toast$params2.closeButtonText;
    var horizontalClass = position === 'top' || position === 'bottom' ? "toast-horizontal-" + horizontalPosition : '';
    return $jsx("div", {
      class: "toast toast-" + position + " " + horizontalClass + " " + (cssClass || '') + " " + (icon ? 'toast-with-icon' : '')
    }, $jsx("div", {
      class: "toast-content"
    }, icon && $jsx("div", {
      class: "toast-icon"
    }, icon), $jsx("div", {
      class: "toast-text"
    }, text), closeButton && !icon && $jsx("a", {
      class: "toast-button button " + (closeButtonColor ? "color-" + closeButtonColor : '')
    }, closeButtonText)));
  };

  return Toast;
}(Modal);

export default Toast;