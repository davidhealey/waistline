"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

var _toggleClass = _interopRequireDefault(require("./toggle-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'toggle',
  create: function create() {
    var app = this;
    app.toggle = (0, _constructorMethods.default)({
      defaultSelector: '.toggle',
      constructor: _toggleClass.default,
      app: app,
      domProp: 'f7Toggle'
    });
  },
  static: {
    Toggle: _toggleClass.default
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.toggle-init').each(function (toggleEl) {
        return app.toggle.create({
          el: toggleEl
        });
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      (0, _dom.default)(tabEl).find('.toggle-init').each(function (toggleEl) {
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
exports.default = _default;