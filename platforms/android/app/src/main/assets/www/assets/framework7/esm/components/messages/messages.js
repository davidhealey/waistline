import $ from '../../shared/dom7';
import Messages from './messages-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
  name: 'messages',
  static: {
    Messages: Messages
  },
  create: function create() {
    var app = this;
    app.messages = ConstructorMethods({
      defaultSelector: '.messages',
      constructor: Messages,
      app: app,
      domProp: 'f7Messages',
      addMethods: 'renderMessages layout scroll clear removeMessage removeMessages addMessage addMessages'.split(' ')
    });
  },
  on: {
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var app = this;
      $(tabEl).find('.messages-init').each(function (messagesEl) {
        app.messages.destroy(messagesEl);
      });
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.messages-init').each(function (messagesEl) {
        app.messages.create({
          el: messagesEl
        });
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;
      page.$el.find('.messages-init').each(function (messagesEl) {
        app.messages.destroy(messagesEl);
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.messages-init').each(function (messagesEl) {
        app.messages.create({
          el: messagesEl
        });
      });
    }
  },
  vnode: {
    'messages-init': {
      insert: function insert(vnode) {
        var app = this;
        var messagesEl = vnode.elm;
        app.messages.create({
          el: messagesEl
        });
      },
      destroy: function destroy(vnode) {
        var app = this;
        var messagesEl = vnode.elm;
        app.messages.destroy(messagesEl);
      }
    }
  }
};