import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import Popover from './popover-class';
import ModalMethods from '../../shared/modal-methods';
export default {
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
    Popover: Popover
  },
  create: function create() {
    var app = this;
    app.popover = extend(ModalMethods({
      app: app,
      constructor: Popover,
      defaultSelector: '.popover.modal-in'
    }), {
      open: function open(popoverEl, targetEl, animate) {
        var $popoverEl = $(popoverEl);

        if ($popoverEl.length > 1) {
          // check if same popover in other page
          var $targetPage = $(targetEl).parents('.page');

          if ($targetPage.length) {
            $popoverEl.each(function (el) {
              var $el = $(el);

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
          popover = new Popover(app, Object.assign({
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