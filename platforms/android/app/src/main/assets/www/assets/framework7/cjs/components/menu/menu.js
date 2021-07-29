"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Menu = {
  open: function open(el) {
    if (el === void 0) {
      el = '.menu-item-dropdown';
    }

    var app = this;
    if (!el) return;
    var $el = (0, _dom.default)(el).closest('.menu-item-dropdown');
    if (!$el.length) return;
    var $menuEl = $el.closest('.menu').eq(0);

    if ($menuEl.length) {
      var zIndex = $menuEl.css('z-index');
      var originalZIndex = $menuEl[0].style.zIndex;
      $menuEl.css('z-index', parseInt(zIndex || 0, 10) + 1);
      $menuEl[0].f7MenuZIndex = originalZIndex;
    }

    $el.eq(0).addClass('menu-item-dropdown-opened').trigger('menu:opened');
    app.emit('menuOpened', $el.eq(0)[0]);
  },
  close: function close(el) {
    if (el === void 0) {
      el = '.menu-item-dropdown-opened';
    }

    var app = this;
    if (!el) return;
    var $el = (0, _dom.default)(el).closest('.menu-item-dropdown-opened');
    if (!$el.length) return;
    var $menuEl = $el.closest('.menu').eq(0);

    if ($menuEl.length) {
      var zIndex = $menuEl[0].f7MenuZIndex;
      $menuEl.css('z-index', zIndex);
      delete $menuEl[0].f7MenuZIndex;
    }

    $el.eq(0).removeClass('menu-item-dropdown-opened').trigger('menu:closed');
    app.emit('menuClosed', $el.eq(0)[0]);
  }
};
var _default = {
  name: 'menu',
  create: function create() {
    var app = this;
    (0, _utils.bindMethods)(app, {
      menu: Menu
    });
  },
  on: {
    click: function click(e) {
      var app = this;
      var openedMenus = (0, _dom.default)('.menu-item-dropdown-opened');
      if (!openedMenus.length) return;
      openedMenus.each(function (el) {
        if (!(0, _dom.default)(e.target).closest('.menu-item-dropdown-opened').length) {
          app.menu.close(el);
        }
      });
    }
  },
  clicks: {
    '.menu-item-dropdown': function onClick($clickedEl, dataset, e) {
      var app = this;

      if ($clickedEl.hasClass('menu-item-dropdown-opened')) {
        if ((0, _dom.default)(e.target).closest('.menu-dropdown').length) return;
        app.menu.close($clickedEl);
      } else {
        app.menu.open($clickedEl);
      }
    },
    '.menu-close': function onClick() {
      var app = this;
      app.menu.close();
    }
  }
};
exports.default = _default;