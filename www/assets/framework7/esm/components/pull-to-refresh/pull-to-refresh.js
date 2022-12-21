import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import PullToRefresh from './pull-to-refresh-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
  name: 'pullToRefresh',
  create: function create() {
    var app = this;
    app.ptr = extend(ConstructorMethods({
      defaultSelector: '.ptr-content',
      constructor: PullToRefresh,
      app: app,
      domProp: 'f7PullToRefresh'
    }), {
      done: function done(el) {
        var ptr = app.ptr.get(el);
        if (ptr) return ptr.done();
        return undefined;
      },
      refresh: function refresh(el) {
        var ptr = app.ptr.get(el);
        if (ptr) return ptr.refresh();
        return undefined;
      }
    });
  },
  static: {
    PullToRefresh: PullToRefresh
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      var $tabEl = $(tabEl);
      var $ptrEls = $tabEl.find('.ptr-content');
      if ($tabEl.is('.ptr-content')) $ptrEls.add($tabEl);
      $ptrEls.each(function (el) {
        app.ptr.create(el);
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var $tabEl = $(tabEl);
      var app = this;
      var $ptrEls = $tabEl.find('.ptr-content');
      if ($tabEl.is('.ptr-content')) $ptrEls.add($tabEl);
      $ptrEls.each(function (el) {
        app.ptr.destroy(el);
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.ptr-content').each(function (el) {
        app.ptr.create(el);
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;
      page.$el.find('.ptr-content').each(function (el) {
        app.ptr.destroy(el);
      });
    }
  }
};