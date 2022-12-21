import $ from '../../shared/dom7';
import DataTable from './data-table-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
  name: 'dataTable',
  static: {
    DataTable: DataTable
  },
  create: function create() {
    var app = this;
    app.dataTable = ConstructorMethods({
      defaultSelector: '.data-table',
      constructor: DataTable,
      app: app,
      domProp: 'f7DataTable'
    });
  },
  on: {
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var app = this;
      $(tabEl).find('.data-table-init').each(function (tableEl) {
        app.dataTable.destroy(tableEl);
      });
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.data-table-init').each(function (tableEl) {
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