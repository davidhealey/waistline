import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import Messagebar from './messagebar-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
  name: 'messagebar',
  static: {
    Messagebar: Messagebar
  },
  create: function create() {
    var app = this;
    app.messagebar = ConstructorMethods({
      defaultSelector: '.messagebar',
      constructor: Messagebar,
      app: app,
      domProp: 'f7Messagebar',
      addMethods: 'clear getValue setValue setPlaceholder resizePage focus blur attachmentsCreate attachmentsShow attachmentsHide attachmentsToggle renderAttachments sheetCreate sheetShow sheetHide sheetToggle'.split(' ')
    });
  },
  on: {
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var app = this;
      $(tabEl).find('.messagebar-init').each(function (messagebarEl) {
        app.messagebar.destroy(messagebarEl);
      });
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.messagebar-init').each(function (messagebarEl) {
        app.messagebar.create(extend({
          el: messagebarEl
        }, $(messagebarEl).dataset()));
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;
      page.$el.find('.messagebar-init').each(function (messagebarEl) {
        app.messagebar.destroy(messagebarEl);
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.messagebar-init').each(function (messagebarEl) {
        app.messagebar.create(extend({
          el: messagebarEl
        }, $(messagebarEl).dataset()));
      });
    }
  },
  vnode: {
    'messagebar-init': {
      insert: function insert(vnode) {
        var app = this;
        var messagebarEl = vnode.elm;
        app.messagebar.create(extend({
          el: messagebarEl
        }, $(messagebarEl).dataset()));
      },
      destroy: function destroy(vnode) {
        var app = this;
        var messagebarEl = vnode.elm;
        app.messagebar.destroy(messagebarEl);
      }
    }
  }
};