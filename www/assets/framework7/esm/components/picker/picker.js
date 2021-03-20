import $ from '../../shared/dom7';
import ConstructorMethods from '../../shared/constructor-methods';
import Picker from './picker-class';
export default {
  name: 'picker',
  static: {
    Picker: Picker
  },
  create: function create() {
    var app = this;
    app.picker = ConstructorMethods({
      defaultSelector: '.picker',
      constructor: Picker,
      app: app,
      domProp: 'f7Picker'
    });

    app.picker.close = function close(el) {
      if (el === void 0) {
        el = '.picker';
      }

      var $el = $(el);
      if ($el.length === 0) return;
      var picker = $el[0].f7Picker;
      if (!picker || picker && !picker.opened) return;
      picker.close();
    };
  },
  params: {
    picker: {
      // Picker settings
      updateValuesOnMomentum: false,
      updateValuesOnTouchmove: true,
      updateValuesOnMousewheel: true,
      mousewheel: true,
      rotateEffect: false,
      momentumRatio: 7,
      freeMode: false,
      cols: [],
      // Common opener settings
      containerEl: null,
      openIn: 'auto',
      // or 'popover' or 'sheet'
      sheetPush: false,
      sheetSwipeToClose: undefined,
      backdrop: undefined,
      // uses Popover or Sheet defaults
      formatValue: null,
      inputEl: null,
      inputReadOnly: true,
      closeByOutsideClick: true,
      scrollToInput: true,
      scrollToEl: undefined,
      toolbar: true,
      toolbarCloseText: 'Done',
      cssClass: null,
      routableModals: false,
      view: null,
      url: 'select/',
      // Render functions
      renderToolbar: null,
      render: null
    }
  }
};