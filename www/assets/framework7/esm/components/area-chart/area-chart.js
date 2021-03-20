import $ from '../../shared/dom7';
import AreaChart from './area-chart-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
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
    app.areaChart = ConstructorMethods({
      defaultSelector: '.area-chart',
      constructor: AreaChart,
      app: app,
      domProp: 'f7AreaChart'
    });

    app.areaChart.update = function update(el, newParams) {
      var $el = $(el);
      if ($el.length === 0) return undefined;
      var areaChart = app.areaChart.get(el);
      if (!areaChart) return undefined;
      areaChart.update(newParams);
      return areaChart;
    };
  }
};