function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import Modal from './modal-class';

var CustomModal = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(CustomModal, _Modal);

  function CustomModal(app, params) {
    var _this;

    var extendedParams = extend({
      backdrop: true,
      closeByBackdropClick: true,
      on: {}
    }, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var customModal = _assertThisInitialized(_this);

    customModal.params = extendedParams; // Find Element

    var $el;

    if (!customModal.params.el) {
      $el = $(customModal.params.content);
    } else {
      $el = $(customModal.params.el);
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
        $backdropEl = $('<div class="custom-modal-backdrop"></div>');
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
    extend(customModal, {
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
}(Modal);

export default CustomModal;