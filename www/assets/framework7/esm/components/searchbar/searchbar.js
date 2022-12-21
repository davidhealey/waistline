import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import Searchbar from './searchbar-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
  name: 'searchbar',
  static: {
    Searchbar: Searchbar
  },
  create: function create() {
    var app = this;
    app.searchbar = ConstructorMethods({
      defaultSelector: '.searchbar',
      constructor: Searchbar,
      app: app,
      domProp: 'f7Searchbar',
      addMethods: 'clear enable disable toggle search'.split(' ')
    });
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.searchbar-init').each(function (searchbarEl) {
        var $searchbarEl = $(searchbarEl);
        app.searchbar.create(extend($searchbarEl.dataset(), {
          el: searchbarEl
        }));
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      $(tabEl).find('.searchbar-init').each(function (searchbarEl) {
        if (searchbarEl.f7Searchbar && searchbarEl.f7Searchbar.destroy) {
          searchbarEl.f7Searchbar.destroy();
        }
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.searchbar-init').each(function (searchbarEl) {
        var $searchbarEl = $(searchbarEl);
        app.searchbar.create(extend($searchbarEl.dataset(), {
          el: searchbarEl
        }));
      });

      if (app.theme === 'ios' && page.view && page.view.router.dynamicNavbar && page.$navbarEl && page.$navbarEl.length > 0) {
        page.$navbarEl.find('.searchbar-init').each(function (searchbarEl) {
          var $searchbarEl = $(searchbarEl);
          app.searchbar.create(extend($searchbarEl.dataset(), {
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
        var $searchbarEl = $(searchbarEl);
        app.searchbar.create(extend($searchbarEl.dataset(), {
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