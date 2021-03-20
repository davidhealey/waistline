"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var DataTable = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(DataTable, _Framework7Class);

  function DataTable(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var table = _assertThisInitialized(_this);

    var defaults = {}; // Extend defaults with modules params

    table.useModulesParams(defaults);
    table.params = (0, _utils.extend)(defaults, params); // El

    var $el = (0, _dom.default)(table.params.el);
    if ($el.length === 0) return undefined || _assertThisInitialized(_this);
    table.$el = $el;
    table.el = $el[0];

    if (table.$el[0].f7DataTable) {
      var instance = table.$el[0].f7DataTable;
      table.destroy();
      return instance || _assertThisInitialized(_this);
    }

    table.$el[0].f7DataTable = table;
    (0, _utils.extend)(table, {
      collapsible: $el.hasClass('data-table-collapsible'),
      // Headers
      $headerEl: $el.find('.data-table-header'),
      $headerSelectedEl: $el.find('.data-table-header-selected')
    }); // Events

    function handleChange(e) {
      if (e.detail && e.detail.sentByF7DataTable) {
        // Scripted event, don't do anything
        return;
      }

      var $inputEl = (0, _dom.default)(this);
      var checked = $inputEl[0].checked;
      var columnIndex = $inputEl.parents('td,th').index();

      if ($inputEl.parents('thead').length > 0) {
        if (columnIndex === 0) {
          $el.find('tbody tr')[checked ? 'addClass' : 'removeClass']('data-table-row-selected');
        }

        $el.find("tbody tr td:nth-child(" + (columnIndex + 1) + ") input").prop('checked', checked).trigger('change', {
          sentByF7DataTable: true
        });
        $inputEl.prop('indeterminate', false);
      } else {
        if (columnIndex === 0) {
          $inputEl.parents('tr')[checked ? 'addClass' : 'removeClass']('data-table-row-selected');
        }

        var checkedRows = $el.find("tbody .checkbox-cell:nth-child(" + (columnIndex + 1) + ") input[type=\"checkbox\"]:checked").length;
        var totalRows = $el.find('tbody tr').length;
        var $headCheckboxEl = $el.find("thead .checkbox-cell:nth-child(" + (columnIndex + 1) + ") input[type=\"checkbox\"]");

        if (!checked) {
          $headCheckboxEl.prop('checked', false);
        } else if (checkedRows === totalRows) {
          $headCheckboxEl.prop('checked', true).trigger('change', {
            sentByF7DataTable: true
          });
        }

        $headCheckboxEl.prop('indeterminate', checkedRows > 0 && checkedRows < totalRows);
      }

      table.checkSelectedHeader();
    }

    function handleSortableClick() {
      var $cellEl = (0, _dom.default)(this);
      var isActive = $cellEl.hasClass('sortable-cell-active');
      var currentSort = $cellEl.hasClass('sortable-desc') ? 'desc' : 'asc';
      var newSort;

      if (isActive) {
        newSort = currentSort === 'desc' ? 'asc' : 'desc';
        $cellEl.removeClass('sortable-desc sortable-asc').addClass("sortable-" + newSort);
      } else {
        $el.find('thead .sortable-cell-active').removeClass('sortable-cell-active');
        $cellEl.addClass('sortable-cell-active');
        newSort = currentSort;
      }

      $cellEl.trigger('datatable:sort', newSort);
      table.emit('local::sort dataTableSort', table, newSort);
    }

    table.attachEvents = function attachEvents() {
      table.$el.on('change', '.checkbox-cell input[type="checkbox"]', handleChange);
      table.$el.find('thead .sortable-cell').on('click', handleSortableClick);
    };

    table.detachEvents = function detachEvents() {
      table.$el.off('change', '.checkbox-cell input[type="checkbox"]', handleChange);
      table.$el.find('thead .sortable-cell').off('click', handleSortableClick);
    }; // Install Modules


    table.useModules(); // Init

    table.init();
    return table || _assertThisInitialized(_this);
  }

  var _proto = DataTable.prototype;

  _proto.setCollapsibleLabels = function setCollapsibleLabels() {
    var table = this;
    if (!table.collapsible) return;
    table.$el.find('tbody td:not(.checkbox-cell)').each(function (el) {
      var $el = (0, _dom.default)(el);
      var elIndex = $el.index();
      var collpsibleTitle = $el.attr('data-collapsible-title');

      if (!collpsibleTitle && collpsibleTitle !== '') {
        $el.attr('data-collapsible-title', table.$el.find('thead th').eq(elIndex).text());
      }
    });
  };

  _proto.checkSelectedHeader = function checkSelectedHeader() {
    var table = this;

    if (table.$headerEl.length > 0 && table.$headerSelectedEl.length > 0) {
      var checkedItems = table.$el.find('tbody .checkbox-cell input:checked').length;
      table.$el[checkedItems > 0 ? 'addClass' : 'removeClass']('data-table-has-checked');
      table.$headerSelectedEl.find('.data-table-selected-count').text(checkedItems);
    }
  };

  _proto.init = function init() {
    var table = this;
    table.attachEvents();
    table.setCollapsibleLabels();
    table.checkSelectedHeader();
  };

  _proto.destroy = function destroy() {
    var table = this;
    table.$el.trigger('datatable:beforedestroy');
    table.emit('local::beforeDestroy dataTableBeforeDestroy', table);
    table.attachEvents();

    if (table.$el[0]) {
      table.$el[0].f7DataTable = null;
      delete table.$el[0].f7DataTable;
    }

    (0, _utils.deleteProps)(table);
    table = null;
  };

  return DataTable;
}(_class.default);

var _default = DataTable;
exports.default = _default;