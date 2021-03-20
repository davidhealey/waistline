"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _pieChartClass = _interopRequireDefault(require("./pie-chart-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'pieChart',
  params: {
    pieChart: {
      el: null,
      datasets: [],
      size: 320,
      tooltip: false,
      formatTooltip: null
    }
  },
  create: function create() {
    var app = this;
    app.pieChart = (0, _constructorMethods.default)({
      defaultSelector: '.pie-chart',
      constructor: _pieChartClass.default,
      app: app,
      domProp: 'f7PieChart'
    });

    app.pieChart.update = function update(el, newParams) {
      var $el = (0, _dom.default)(el);
      if ($el.length === 0) return undefined;
      var pieChart = app.pieChart.get(el);
      if (!pieChart) return undefined;
      pieChart.update(newParams);
      return pieChart;
    };
  }
};
exports.default = _default;