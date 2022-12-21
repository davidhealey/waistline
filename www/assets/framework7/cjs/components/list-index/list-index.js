"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _listIndexClass = _interopRequireDefault(require("./list-index-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'listIndex',
  static: {
    ListIndex: _listIndexClass.default
  },
  create: function create() {
    var app = this;
    app.listIndex = (0, _constructorMethods.default)({
      defaultSelector: '.list-index',
      constructor: _listIndexClass.default,
      app: app,
      domProp: 'f7ListIndex'
    });
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.list-index-init').each(function (listIndexEl) {
        var params = (0, _utils.extend)((0, _dom.default)(listIndexEl).dataset(), {
          el: listIndexEl
        });
        app.listIndex.create(params);
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      (0, _dom.default)(tabEl).find('.list-index-init').each(function (listIndexEl) {
        if (listIndexEl.f7ListIndex) listIndexEl.f7ListIndex.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.list-index-init').each(function (listIndexEl) {
        var params = (0, _utils.extend)((0, _dom.default)(listIndexEl).dataset(), {
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
        var params = (0, _utils.extend)((0, _dom.default)(listIndexEl).dataset(), {
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
exports.default = _default;