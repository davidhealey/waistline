"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _areaChartClass = _interopRequireDefault(require("./area-chart-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'areaChart',
  params: {
    areaChart: {
      el: null,
      lineChart: false,
      datasets: [],
      axis: false,
      axisLabels: [],
      tooltip: false,
      legend: false,
      toggleDatasets: false,
      width: 640,
      height: 320,
      maxAxisLabels: 8,
      formatAxisLabel: null,
      formatLegendLabel: null,
      formatTooltip: null,
      formatTooltipAxisLabel: null,
      formatTooltipTotal: null,
      formatTooltipDataset: null
    }
  },
  create: function create() {
    var app = this;
    app.areaChart = (0, _constructorMethods.default)({
      defaultSelector: '.area-chart',
      constructor: _areaChartClass.default,
      app: app,
      domProp: 'f7AreaChart'
    });

    app.areaChart.update = function update(el, newParams) {
      var $el = (0, _dom.default)(el);
      if ($el.length === 0) return undefined;
      var areaChart = app.areaChart.get(el);
      if (!areaChart) return undefined;
      areaChart.update(newParams);
      return areaChart;
    };
  }
};
exports.default = _default;