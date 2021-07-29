"use strict";

exports.__esModule = true;
exports.default = void 0;

var _actionsClass = _interopRequireDefault(require("./actions-class"));

var _modalMethods = _interopRequireDefault(require("../../shared/modal-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'actions',
  params: {
    actions: {
      convertToPopover: true,
      forceToPopover: false,
      backdrop: true,
      backdropEl: undefined,
      cssClass: null,
      closeByBackdropClick: true,
      closeOnEscape: false,
      render: null,
      renderPopover: null,
      containerEl: null
    }
  },
  static: {
    Actions: _actionsClass.default
  },
  create: function create() {
    var app = this;
    app.actions = (0, _modalMethods.default)({
      app: app,
      constructor: _actionsClass.default,
      defaultSelector: '.actions-modal.modal-in'
    });
  },
  clicks: {
    '.actions-open': function openActions($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.actions.open(data.actions, data.animate, $clickedEl);
    },
    '.actions-close': function closeActions($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.actions.close(data.actions, data.animate, $clickedEl);
    }
  }
};
exports.default = _default;