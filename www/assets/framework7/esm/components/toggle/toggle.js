import $ from '../../shared/dom7';
import ConstructorMethods from '../../shared/constructor-methods';
import Toggle from './toggle-class';
export default {
  name: 'toggle',
  create: function create() {
    var app = this;
    app.toggle = ConstructorMethods({
      defaultSelector: '.toggle',
      constructor: Toggle,
      app: app,
      domProp: 'f7Toggle'
    });
  },
  static: {
    Toggle: Toggle
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.toggle-init').each(function (toggleEl) {
        return app.toggle.create({
          el: toggleEl
        });
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      $(tabEl).find('.toggle-init').each(function (toggleEl) {
        if (toggleEl.f7Toggle) toggleEl.f7Toggle.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.toggle-init').each(function (toggleEl) {
        return app.toggle.create({
          el: toggleEl
        });
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      page.$el.find('.toggle-init').each(function (toggleEl) {
        if (toggleEl.f7Toggle) toggleEl.f7Toggle.destroy();
      });
    }
  },
  vnode: {
    'toggle-init': {
      insert: function insert(vnode) {
        var app = this;
        var toggleEl = vnode.elm;
        app.toggle.create({
          el: toggleEl
        });
      },
      destroy: function destroy(vnode) {
        var toggleEl = vnode.elm;
        if (toggleEl.f7Toggle) toggleEl.f7Toggle.destroy();
      }
    }
  }
};