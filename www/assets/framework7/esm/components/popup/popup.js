import Popup from './popup-class';
import ModalMethods from '../../shared/modal-methods';
export default {
  name: 'popup',
  params: {
    popup: {
      backdrop: true,
      backdropEl: undefined,
      closeByBackdropClick: true,
      closeOnEscape: false,
      swipeToClose: false,
      swipeHandler: null,
      push: false,
      containerEl: null
    }
  },
  static: {
    Popup: Popup
  },
  create: function create() {
    var app = this;
    app.popup = ModalMethods({
      app: app,
      constructor: Popup,
      defaultSelector: '.popup.modal-in',
      parentSelector: '.popup'
    });
  },
  clicks: {
    '.popup-open': function openPopup($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.popup.open(data.popup, data.animate, $clickedEl);
    },
    '.popup-close': function closePopup($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.popup.close(data.popup, data.animate, $clickedEl);
    }
  }
};