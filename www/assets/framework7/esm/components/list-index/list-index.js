import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import ListIndex from './list-index-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
  name: 'listIndex',
  static: {
    ListIndex: ListIndex
  },
  create: function create() {
    var app = this;
    app.listIndex = ConstructorMethods({
      defaultSelector: '.list-index',
      constructor: ListIndex,
      app: app,
      domProp: 'f7ListIndex'
    });
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.list-index-init').each(function (listIndexEl) {
        var params = extend($(listIndexEl).dataset(), {
          el: listIndexEl
        });
        app.listIndex.create(params);
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      $(tabEl).find('.list-index-init').each(function (listIndexEl) {
        if (listIndexEl.f7ListIndex) listIndexEl.f7ListIndex.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.list-index-init').each(function (listIndexEl) {
        var params = extend($(listIndexEl).dataset(), {
          el: listIndexEl
        });
        app.listIndex.create(params);
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      page.$el.find('.list-index-init').each(function (listIndexEl) {
        if (listIndexEl.f7ListIndex) listIndexEl.f7ListIndex.destroy();
      });
    }
  },
  vnode: {
    'list-index-init': {
      insert: function insert(vnode) {
        var app = this;
        var listIndexEl = vnode.elm;
        var params = extend($(listIndexEl).dataset(), {
          el: listIndexEl
        });
        app.listIndex.create(params);
      },
      destroy: function destroy(vnode) {
        var listIndexEl = vnode.elm;
        if (listIndexEl.f7ListIndex) listIndexEl.f7ListIndex.destroy();
      }
    }
  }
};