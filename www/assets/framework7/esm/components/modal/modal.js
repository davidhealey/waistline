import Modal from './modal-class';
import CustomModal from './custom-modal-class';
export default {
  name: 'modal',
  static: {
    Modal: Modal,
    CustomModal: CustomModal
  },
  create: function create() {
    var app = this;
    app.customModal = {
      create: function create(params) {
        return new CustomModal(app, params);
      }
    };
  },
  params: {
    modal: {
      queueDialogs: true
    }
  }
};