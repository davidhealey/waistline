"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _dataTableClass = _interopRequireDefault(require("./data-table-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'dataTable',
  static: {
    DataTable: _dataTableClass.default
  },
  create: function create() {
    var app = this;
    app.dataTable = (0, _constructorMethods.default)({
      defaultSelector: '.data-table',
      constructor: _dataTableClass.default,
      app: app,
      domProp: 'f7DataTable'
    });
  },
  on: {
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.data-table-init').each(function (tableEl) {
        app.dataTable.destroy(tableEl);
      });
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.data-table-init').each(function (tableEl) {
        app.dataTable.create({
          el: tableEl
        });
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;
      page.$el.find('.data-table-init').each(function (tableEl) {
        app.dataTable.destroy(tableEl);
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.data-table-init').each(function (tableEl) {
        app.dataTable.create({
          el: tableEl
        });
      });
    }
  },
  vnode: {
    'data-table-init': {
      insert: function insert(vnode) {
        var app = this;
        var tableEl = vnode.elm;
        app.dataTable.create({
          el: tableEl
        });
      },
      destroy: function destroy(vnode) {
        var app = this;
        var tableEl = vnode.elm;
        app.dataTable.destroy(tableEl);
      }
    }
  }
};
exports.default = _default;