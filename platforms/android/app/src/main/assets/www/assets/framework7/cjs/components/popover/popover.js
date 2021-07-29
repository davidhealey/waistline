"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _popoverClass = _interopRequireDefault(require("./popover-class"));

var _modalMethods = _interopRequireDefault(require("../../shared/modal-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'popover',
  params: {
    popover: {
      backdrop: true,
      backdropEl: undefined,
      closeByBackdropClick: true,
      closeByOutsideClick: true,
      closeOnEscape: false,
      containerEl: null
    }
  },
  static: {
    Popover: _popoverClass.default
  },
  create: function create() {
    var app = this;
    app.popover = (0, _utils.extend)((0, _modalMethods.default)({
      app: app,
      constructor: _popoverClass.default,
      defaultSelector: '.popover.modal-in'
    }), {
      open: function open(popoverEl, targetEl, animate) {
        var $popoverEl = (0, _dom.default)(popoverEl);

        if ($popoverEl.length > 1) {
          // check if same popover in other page
          var $targetPage = (0, _dom.default)(targetEl).parents('.page');

          if ($targetPage.length) {
            $popoverEl.each(function (el) {
              var $el = (0, _dom.default)(el);

              if ($el.parents($targetPage)[0] === $targetPage[0]) {
                $popoverEl = $el;
              }
            });
          }
        }

        if ($popoverEl.length > 1) {
          $popoverEl = $popoverEl.eq($popoverEl.length - 1);
        }

        var popover = $popoverEl[0].f7Modal;
        var data = $popoverEl.dataset();

        if (!popover) {
          popover = new _popoverClass.default(app, Object.assign({
            el: $popoverEl,
            targetEl: targetEl
          }, data));
        }

        return popover.open(targetEl, animate);
      }
    });
  },
  clicks: {
    '.popover-open': function openPopover($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.popover.open(data.popover, $clickedEl, data.animate);
    },
    '.popover-close': function closePopover($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.popover.close(data.popover, data.animate, $clickedEl);
    }
  }
};
exports.default = _default;