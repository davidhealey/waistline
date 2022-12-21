"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _messagesClass = _interopRequireDefault(require("./messages-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'messages',
  static: {
    Messages: _messagesClass.default
  },
  create: function create() {
    var app = this;
    app.messages = (0, _constructorMethods.default)({
      defaultSelector: '.messages',
      constructor: _messagesClass.default,
      app: app,
      domProp: 'f7Messages',
      addMethods: 'renderMessages layout scroll clear removeMessage removeMessages addMessage addMessages'.split(' ')
    });
  },
  on: {
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.messages-init').each(function (messagesEl) {
        app.messages.destroy(messagesEl);
      });
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.messages-init').each(function (messagesEl) {
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
exports.default = _default;