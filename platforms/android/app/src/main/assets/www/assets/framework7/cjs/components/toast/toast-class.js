"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _modalClass = _interopRequireDefault(require("../modal/modal-class"));

var _$jsx = _interopRequireDefault(require("../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Toast = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(Toast, _Modal);

  function Toast(app, params) {
    var _this;

    var extendedParams = (0, _utils.extend)({
      on: {}
    }, app.params.toast, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var toast = _assertThisInitialized(_this);

    var window = (0, _ssrWindow.getWindow)();
    toast.app = app;
    toast.params = extendedParams;
    var _toast$params = toast.params,
        closeButton = _toast$params.closeButton,
        closeTimeout = _toast$params.closeTimeout;
    var $el;

    if (!toast.params.el) {
      // Find Element
      var toastHtml = toast.render();
      $el = (0, _dom.default)(toastHtml);
    } else {
      $el = (0, _dom.default)(toast.params.el);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el.length === 0) {
      return toast.destroy() || _assertThisInitialized(_this);
    }

    (0, _utils.extend)(toast, {
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
      (0, _dom.default)('.toast.modal-in').each(function (openedEl) {
        var toastInstance = app.toast.get(openedEl);

        if (openedEl !== toast.el && toastInstance) {
          toastInstance.close();
        }
      });

      if (closeTimeout) {
        timeoutId = (0, _utils.nextTick)(function () {
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
    return (0, _$jsx.default)("div", {
      class: "toast toast-" + position + " " + horizontalClass + " " + (cssClass || '') + " " + (icon ? 'toast-with-icon' : '')
    }, (0, _$jsx.default)("div", {
      class: "toast-content"
    }, icon && (0, _$jsx.default)("div", {
      class: "toast-icon"
    }, icon), (0, _$jsx.default)("div", {
      class: "toast-text"
    }, text), closeButton && !icon && (0, _$jsx.default)("a", {
      class: "toast-button button " + (closeButtonColor ? "color-" + closeButtonColor : '')
    }, closeButtonText)));
  };

  return Toast;
}(_modalClass.default);

var _default = Toast;
exports.default = _default;