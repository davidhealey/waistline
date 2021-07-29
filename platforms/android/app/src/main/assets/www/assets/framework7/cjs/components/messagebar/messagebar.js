"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _messagebarClass = _interopRequireDefault(require("./messagebar-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'messagebar',
  static: {
    Messagebar: _messagebarClass.default
  },
  create: function create() {
    var app = this;
    app.messagebar = (0, _constructorMethods.default)({
      defaultSelector: '.messagebar',
      constructor: _messagebarClass.default,
      app: app,
      domProp: 'f7Messagebar',
      addMethods: 'clear getValue setValue setPlaceholder resizePage focus blur attachmentsCreate attachmentsShow attachmentsHide attachmentsToggle renderAttachments sheetCreate sheetShow sheetHide sheetToggle'.split(' ')
    });
  },
  on: {
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.messagebar-init').each(function (messagebarEl) {
        app.messagebar.destroy(messagebarEl);
      });
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.messagebar-init').each(function (messagebarEl) {
        app.messagebar.create((0, _utils.extend)({
          el: messagebarEl
        }, (0, _dom.default)(messagebarEl).dataset()));
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
        app.messagebar.create((0, _utils.extend)({
          el: messagebarEl
        }, (0, _dom.default)(messagebarEl).dataset()));
      });
    }
  },
  vnode: {
    'messagebar-init': {
      insert: function insert(vnode) {
        var app = this;
        var messagebarEl = vnode.elm;
        app.messagebar.create((0, _utils.extend)({
          el: messagebarEl
        }, (0, _dom.default)(messagebarEl).dataset()));
      },
      destroy: function destroy(vnode) {
        var app = this;
        var messagebarEl = vnode.elm;
        app.messagebar.destroy(messagebarEl);
      }
    }
  }
};
exports.default = _default;