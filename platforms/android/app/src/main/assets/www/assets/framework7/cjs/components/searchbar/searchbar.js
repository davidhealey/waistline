"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _searchbarClass = _interopRequireDefault(require("./searchbar-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'searchbar',
  static: {
    Searchbar: _searchbarClass.default
  },
  create: function create() {
    var app = this;
    app.searchbar = (0, _constructorMethods.default)({
      defaultSelector: '.searchbar',
      constructor: _searchbarClass.default,
      app: app,
      domProp: 'f7Searchbar',
      addMethods: 'clear enable disable toggle search'.split(' ')
    });
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.searchbar-init').each(function (searchbarEl) {
        var $searchbarEl = (0, _dom.default)(searchbarEl);
        app.searchbar.create((0, _utils.extend)($searchbarEl.dataset(), {
          el: searchbarEl
        }));
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      (0, _dom.default)(tabEl).find('.searchbar-init').each(function (searchbarEl) {
        if (searchbarEl.f7Searchbar && searchbarEl.f7Searchbar.destroy) {
          searchbarEl.f7Searchbar.destroy();
        }
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.searchbar-init').each(function (searchbarEl) {
        var $searchbarEl = (0, _dom.default)(searchbarEl);
        app.searchbar.create((0, _utils.extend)($searchbarEl.dataset(), {
          el: searchbarEl
        }));
      });

      if (app.theme === 'ios' && page.view && page.view.router.dynamicNavbar && page.$navbarEl && page.$navbarEl.length > 0) {
        page.$navbarEl.find('.searchbar-init').each(function (searchbarEl) {
          var $searchbarEl = (0, _dom.default)(searchbarEl);
          app.searchbar.create((0, _utils.extend)($searchbarEl.dataset(), {
            el: searchbarEl
          }));
        });
      }
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;
      page.$el.find('.searchbar-init').each(function (searchbarEl) {
        if (searchbarEl.f7Searchbar && searchbarEl.f7Searchbar.destroy) {
          searchbarEl.f7Searchbar.destroy();
        }
      });

      if (app.theme === 'ios' && page.view && page.view.router.dynamicNavbar && page.$navbarEl && page.$navbarEl.length > 0) {
        page.$navbarEl.find('.searchbar-init').each(function (searchbarEl) {
          if (searchbarEl.f7Searchbar && searchbarEl.f7Searchbar.destroy) {
            searchbarEl.f7Searchbar.destroy();
          }
        });
      }
    }
  },
  clicks: {
    '.searchbar-clear': function clear($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      var sb = app.searchbar.get(data.searchbar);
      if (sb) sb.clear();
    },
    '.searchbar-enable': function enable($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      var sb = app.searchbar.get(data.searchbar);
      if (sb) sb.enable(true);
    },
    '.searchbar-disable': function disable($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      var sb = app.searchbar.get(data.searchbar);
      if (sb) sb.disable();
    },
    '.searchbar-toggle': function toggle($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      var sb = app.searchbar.get(data.searchbar);
      if (sb) sb.toggle();
    }
  },
  vnode: {
    'searchbar-init': {
      insert: function insert(vnode) {
        var app = this;
        var searchbarEl = vnode.elm;
        var $searchbarEl = (0, _dom.default)(searchbarEl);
        app.searchbar.create((0, _utils.extend)($searchbarEl.dataset(), {
          el: searchbarEl
        }));
      },
      destroy: function destroy(vnode) {
        var searchbarEl = vnode.elm;

        if (searchbarEl.f7Searchbar && searchbarEl.f7Searchbar.destroy) {
          searchbarEl.f7Searchbar.destroy();
        }
      }
    }
  }
};
exports.default = _default;