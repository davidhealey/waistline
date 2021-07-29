"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _pullToRefreshClass = _interopRequireDefault(require("./pull-to-refresh-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'pullToRefresh',
  create: function create() {
    var app = this;
    app.ptr = (0, _utils.extend)((0, _constructorMethods.default)({
      defaultSelector: '.ptr-content',
      constructor: _pullToRefreshClass.default,
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
    PullToRefresh: _pullToRefreshClass.default
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      var $tabEl = (0, _dom.default)(tabEl);
      var $ptrEls = $tabEl.find('.ptr-content');
      if ($tabEl.is('.ptr-content')) $ptrEls.add($tabEl);
      $ptrEls.each(function (el) {
        app.ptr.create(el);
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var $tabEl = (0, _dom.default)(tabEl);
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
exports.default = _default;