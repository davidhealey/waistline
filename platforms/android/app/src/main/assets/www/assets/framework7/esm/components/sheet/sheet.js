import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import Sheet from './sheet-class';
import ModalMethods from '../../shared/modal-methods';
export default {
  name: 'sheet',
  params: {
    sheet: {
      push: false,
      backdrop: undefined,
      backdropEl: undefined,
      closeByBackdropClick: true,
      closeByOutsideClick: false,
      closeOnEscape: false,
      swipeToClose: false,
      swipeToStep: false,
      swipeHandler: null,
      containerEl: null
    }
  },
  static: {
    Sheet: Sheet
  },
  create: function create() {
    var app = this;
    app.sheet = extend({}, ModalMethods({
      app: app,
      constructor: Sheet,
      defaultSelector: '.sheet-modal.modal-in'
    }), {
      stepOpen: function stepOpen(sheet) {
        var sheetInstance = app.sheet.get(sheet);
        if (sheetInstance && sheetInstance.stepOpen) return sheetInstance.stepOpen();
        return undefined;
      },
      stepClose: function stepClose(sheet) {
        var sheetInstance = app.sheet.get(sheet);
        if (sheetInstance && sheetInstance.stepClose) return sheetInstance.stepClose();
        return undefined;
      },
      stepToggle: function stepToggle(sheet) {
        var sheetInstance = app.sheet.get(sheet);
        if (sheetInstance && sheetInstance.stepToggle) return sheetInstance.stepToggle();
        return undefined;
      }
    });
  },
  clicks: {
    '.sheet-open': function openSheet($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;

      if ($('.sheet-modal.modal-in').length > 0 && data.sheet && $(data.sheet)[0] !== $('.sheet-modal.modal-in')[0]) {
        app.sheet.close('.sheet-modal.modal-in');
      }

      app.sheet.open(data.sheet, data.animate, $clickedEl);
    },
    '.sheet-close': function closeSheet($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.sheet.close(data.sheet, data.animate, $clickedEl);
    }
  }
};