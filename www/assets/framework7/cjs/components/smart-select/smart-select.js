"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _smartSelectClass = _interopRequireDefault(require("./smart-select-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'smartSelect',
  params: {
    smartSelect: {
      el: undefined,
      valueEl: undefined,
      setValueText: true,
      formatValueText: null,
      openIn: 'page',
      // or 'popup' or 'sheet' or 'popover'
      popupPush: false,
      popupSwipeToClose: undefined,
      // defaults to app
      sheetPush: false,
      sheetSwipeToClose: undefined,
      // defaults to app
      pageTitle: undefined,
      pageBackLinkText: 'Back',
      popupCloseLinkText: 'Close',
      popupTabletFullscreen: false,
      sheetCloseLinkText: 'Done',
      searchbar: false,
      searchbarPlaceholder: 'Search',
      searchbarDisableText: 'Cancel',
      searchbarDisableButton: undefined,
      searchbarSpellcheck: false,
      closeOnSelect: false,
      virtualList: false,
      virtualListHeight: undefined,
      scrollToSelectedItem: false,
      formColorTheme: undefined,
      navbarColorTheme: undefined,
      routableModals: false,
      url: 'select/',
      cssClass: '',

      /*
        Custom render functions
      */
      renderPage: undefined,
      renderPopup: undefined,
      renderSheet: undefined,
      renderPopover: undefined,
      renderItems: undefined,
      renderItem: undefined,
      renderSearchbar: undefined
    }
  },
  static: {
    SmartSelect: _smartSelectClass.default
  },
  create: function create() {
    var app = this;
    app.smartSelect = (0, _utils.extend)((0, _constructorMethods.default)({
      defaultSelector: '.smart-select',
      constructor: _smartSelectClass.default,
      app: app,
      domProp: 'f7SmartSelect'
    }), {
      open: function open(smartSelectEl) {
        var ss = app.smartSelect.get(smartSelectEl);
        if (ss && ss.open) return ss.open();
        return undefined;
      },
      close: function close(smartSelectEl) {
        var ss = app.smartSelect.get(smartSelectEl);
        if (ss && ss.close) return ss.close();
        return undefined;
      }
    });
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.smart-select-init').each(function (smartSelectEl) {
        app.smartSelect.create((0, _utils.extend)({
          el: smartSelectEl
        }, (0, _dom.default)(smartSelectEl).dataset()));
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      (0, _dom.default)(tabEl).find('.smart-select-init').each(function (smartSelectEl) {
        if (smartSelectEl.f7SmartSelect && smartSelectEl.f7SmartSelect.destroy) {
          smartSelectEl.f7SmartSelect.destroy();
        }
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.smart-select-init').each(function (smartSelectEl) {
        app.smartSelect.create((0, _utils.extend)({
          el: smartSelectEl
        }, (0, _dom.default)(smartSelectEl).dataset()));
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      page.$el.find('.smart-select-init').each(function (smartSelectEl) {
        if (smartSelectEl.f7SmartSelect && smartSelectEl.f7SmartSelect.destroy) {
          smartSelectEl.f7SmartSelect.destroy();
        }
      });
    }
  },
  clicks: {
    '.smart-select': function open($clickedEl, data) {
      var app = this;

      if (!$clickedEl[0].f7SmartSelect) {
        var ss = app.smartSelect.create((0, _utils.extend)({
          el: $clickedEl
        }, data));
        ss.open();
      }
    }
  },
  vnode: {
    'smart-select-init': {
      insert: function insert(vnode) {
        var app = this;
        var smartSelectEl = vnode.elm;
        app.smartSelect.create((0, _utils.extend)({
          el: smartSelectEl
        }, (0, _dom.default)(smartSelectEl).dataset()));
      },
      destroy: function destroy(vnode) {
        var smartSelectEl = vnode.elm;

        if (smartSelectEl.f7SmartSelect && smartSelectEl.f7SmartSelect.destroy) {
          smartSelectEl.f7SmartSelect.destroy();
        }
      }
    }
  }
};
exports.default = _default;