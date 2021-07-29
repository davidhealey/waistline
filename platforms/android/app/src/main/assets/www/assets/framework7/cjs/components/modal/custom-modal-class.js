"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _modalClass = _interopRequireDefault(require("./modal-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var CustomModal = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(CustomModal, _Modal);

  function CustomModal(app, params) {
    var _this;

    var extendedParams = (0, _utils.extend)({
      backdrop: true,
      closeByBackdropClick: true,
      on: {}
    }, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var customModal = _assertThisInitialized(_this);

    customModal.params = extendedParams; // Find Element

    var $el;

    if (!customModal.params.el) {
      $el = (0, _dom.default)(customModal.params.content);
    } else {
      $el = (0, _dom.default)(customModal.params.el);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el.length === 0) {
      return customModal.destroy() || _assertThisInitialized(_this);
    }

    var $backdropEl;

    if (customModal.params.backdrop) {
      $backdropEl = app.$el.children('.custom-modal-backdrop');

      if ($backdropEl.length === 0) {
        $backdropEl = (0, _dom.default)('<div class="custom-modal-backdrop"></div>');
        app.$el.append($backdropEl);
      }
    }

    function handleClick(e) {
      if (!customModal || customModal.destroyed) return;

      if ($backdropEl && e.target === $backdropEl[0]) {
        customModal.close();
      }
    }

    customModal.on('customModalOpened', function () {
      if (customModal.params.closeByBackdropClick && customModal.params.backdrop) {
        app.on('click', handleClick);
      }
    });
    customModal.on('customModalClose', function () {
      if (customModal.params.closeByBackdropClick && customModal.params.backdrop) {
        app.off('click', handleClick);
      }
    });
    (0, _utils.extend)(customModal, {
      app: app,
      $el: $el,
      el: $el[0],
      $backdropEl: $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0],
      type: 'customModal'
    });
    $el[0].f7Modal = customModal;
    return customModal || _assertThisInitialized(_this);
  }

  return CustomModal;
}(_modalClass.default);

var _default = CustomModal;
exports.default = _default;