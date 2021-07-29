function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import $ from '../../shared/dom7';
import { extend, deleteProps } from '../../shared/utils';
import Framework7Class from '../../shared/class';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx';

var AreaChart = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(AreaChart, _Framework7Class);

  function AreaChart(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var self = _assertThisInitialized(_this);

    var defaults = extend({}, app.params.areaChart); // Extend defaults with modules params

    self.useModulesParams(defaults);
    self.params = extend(defaults, params);
    var el = self.params.el;
    if (!el) return self || _assertThisInitialized(_this);
    var $el = $(el);
    if ($el.length === 0) return self || _assertThisInitialized(_this);
    if ($el[0].f7AreaChart) return $el[0].f7AreaChart || _assertThisInitialized(_this);
    extend(self, {
      app: app,
      $el: $el,
      el: $el && $el[0],
      currentIndex: null,
      hiddenDatasets: [],
      f7Tooltip: null,
      linesOffsets: null
    });
    $el[0].f7AreaChart = self; // Install Modules

    self.useModules();
    self.onMouseEnter = self.onMouseEnter.bind(self);
    self.onMouseMove = self.onMouseMove.bind(self);
    self.onMouseLeave = self.onMouseLeave.bind(self);
    self.onLegendClick = self.onLegendClick.bind(self);
    self.init();
    return self || _assertThisInitialized(_this);
  }

  var _proto = AreaChart.prototype;

  _proto.getVisibleLabels = function getVisibleLabels() {
    var _this$params = this.params,
        maxAxisLabels = _this$params.maxAxisLabels,
        axisLabels = _this$params.axisLabels;
    if (!maxAxisLabels || axisLabels.length <= maxAxisLabels) return axisLabels;
    var skipStep = Math.ceil(axisLabels.length / maxAxisLabels);
    var filtered = axisLabels.filter(function (label, index) {
      return index % skipStep === 0;
    });
    return filtered;
  };

  _proto.getSummValues = function getSummValues() {
    var datasets = this.params.datasets;
    var hiddenDatasets = this.hiddenDatasets;
    var summValues = [];
    datasets.filter(function (dataset, index) {
      return !hiddenDatasets.includes(index);
    }).forEach(function (_ref) {
      var values = _ref.values;
      values.forEach(function (value, valueIndex) {
        if (!summValues[valueIndex]) summValues[valueIndex] = 0;
        summValues[valueIndex] += value;
      });
    });
    return summValues;
  };

  _proto.getChartData = function getChartData() {
    var _this$params2 = this.params,
        datasets = _this$params2.datasets,
        lineChart = _this$params2.lineChart,
        width = _this$params2.width,
        height = _this$params2.height;
    var hiddenDatasets = this.hiddenDatasets;
    var data = [];

    if (!datasets.length) {
      return data;
    }

    var lastValues = datasets[0].values.map(function () {
      return 0;
    });
    var maxValue = 0;

    if (lineChart) {
      datasets.filter(function (dataset, index) {
        return !hiddenDatasets.includes(index);
      }).forEach(function (_ref2) {
        var values = _ref2.values;
        var datasetMaxValue = Math.max.apply(Math, values);
        if (datasetMaxValue > maxValue) maxValue = datasetMaxValue;
      });
    } else {
      maxValue = Math.max.apply(Math, this.getSummValues());
    }

    datasets.filter(function (dataset, index) {
      return !hiddenDatasets.includes(index);
    }).forEach(function (_ref3) {
      var label = _ref3.label,
          values = _ref3.values,
          color = _ref3.color;
      var points = values.map(function (originalValue, valueIndex) {
        lastValues[valueIndex] += originalValue;
        var value = lineChart ? originalValue : lastValues[valueIndex];
        var x = valueIndex / (values.length - 1) * width;
        var y = height - value / maxValue * height;

        if (lineChart) {
          return "" + (valueIndex === 0 ? 'M' : 'L') + x + "," + y;
        }

        return x + " " + y;
      });

      if (!lineChart) {
        points.push(width + " " + height + " 0 " + height);
      }

      data.push({
        label: label,
        points: points.join(' '),
        color: color
      });
    });
    return data.reverse();
  };

  _proto.getVerticalLines = function getVerticalLines() {
    var _this$params3 = this.params,
        datasets = _this$params3.datasets,
        width = _this$params3.width;
    var lines = [];

    if (!datasets.length) {
      return lines;
    }

    var values = datasets[0].values;
    values.forEach(function (value, valueIndex) {
      var x = valueIndex / (values.length - 1) * width;
      lines.push(x);
    });
    return lines;
  };

  _proto.toggleDataset = function toggleDataset(index) {
    var _this2 = this;

    var hiddenDatasets = this.hiddenDatasets,
        toggleDatasets = this.params.toggleDatasets;
    if (!toggleDatasets) return;

    if (hiddenDatasets.includes(index)) {
      hiddenDatasets.splice(hiddenDatasets.indexOf(index), 1);
    } else {
      hiddenDatasets.push(index);
    }

    if (this.$legendEl) {
      this.$legendEl.find('.area-chart-legend-item').removeClass('area-chart-legend-item-hidden');
      hiddenDatasets.forEach(function (i) {
        _this2.$legendEl.find(".area-chart-legend-item[data-index=\"" + i + "\"]").addClass('area-chart-legend-item-hidden');
      });
    }

    this.update({}, true);
  };

  _proto.formatAxisLabel = function formatAxisLabel(label) {
    var formatAxisLabel = this.params.formatAxisLabel;
    if (formatAxisLabel) return formatAxisLabel.call(this, label);
    return label;
  };

  _proto.formatLegendLabel = function formatLegendLabel(label) {
    var formatLegendLabel = this.params.formatLegendLabel;
    if (formatLegendLabel) return formatLegendLabel.call(this, label);
    return label;
  };

  _proto.calcLinesOffsets = function calcLinesOffsets() {
    var lines = this.svgEl.querySelectorAll('line');
    this.linesOffsets = [];

    for (var i = 0; i < lines.length; i += 1) {
      this.linesOffsets.push(lines[i].getBoundingClientRect().left);
    }
  };

  _proto.formatTooltip = function formatTooltip() {
    var self = this;
    var currentIndex = self.currentIndex,
        hiddenDatasets = self.hiddenDatasets,
        _self$params = self.params,
        datasets = _self$params.datasets,
        axisLabels = _self$params.axisLabels,
        formatTooltip = _self$params.formatTooltip,
        formatTooltipTotal = _self$params.formatTooltipTotal,
        formatTooltipAxisLabel = _self$params.formatTooltipAxisLabel,
        formatTooltipDataset = _self$params.formatTooltipDataset;
    if (currentIndex === null) return '';
    var total = 0;
    var currentValues = datasets.filter(function (dataset, index) {
      return !hiddenDatasets.includes(index);
    }).map(function (dataset) {
      return {
        color: dataset.color,
        label: dataset.label,
        value: dataset.values[currentIndex]
      };
    });
    currentValues.forEach(function (dataset) {
      total += dataset.value;
    });

    if (formatTooltip) {
      return formatTooltip({
        index: currentIndex,
        total: total,
        datasets: currentValues
      });
    }

    var labelText = formatTooltipAxisLabel ? formatTooltipAxisLabel.call(self, axisLabels[currentIndex]) : this.formatAxisLabel(axisLabels[currentIndex]);
    if (!labelText) labelText = '';
    var totalText = formatTooltipTotal ? formatTooltipTotal.call(self, total) : total; // prettier-ignore

    var datasetsText = currentValues.length > 0 ? "\n      <ul class=\"area-chart-tooltip-list\">\n        " + currentValues.map(function (_ref4) {
      var label = _ref4.label,
          color = _ref4.color,
          value = _ref4.value;
      var valueText = formatTooltipDataset ? formatTooltipDataset.call(self, label, value, color) : "" + (label ? label + ": " : '') + value;
      return "\n              <li><span style=\"background-color: " + color + ";\"></span>" + valueText + "</li>\n            ";
    }).join('') + "\n      </ul>" : ''; // prettier-ignore

    return "\n      <div class=\"area-chart-tooltip-label\">" + labelText + "</div>\n      <div class=\"area-chart-tooltip-total\">" + totalText + "</div>\n      " + datasetsText + "\n    ";
  };

  _proto.setTooltip = function setTooltip() {
    var self = this;
    var app = self.app,
        el = self.el,
        svgEl = self.svgEl,
        hiddenDatasets = self.hiddenDatasets,
        currentIndex = self.currentIndex,
        _self$params2 = self.params,
        tooltip = _self$params2.tooltip,
        datasets = _self$params2.datasets;
    if (!tooltip) return;
    var hasVisibleDataSets = datasets.filter(function (dataset, index) {
      return !hiddenDatasets.includes(index);
    }).length > 0;

    if (!hasVisibleDataSets) {
      if (self.f7Tooltip && self.f7Tooltip.hide) self.f7Tooltip.hide();
      return;
    }

    if (currentIndex !== null && !self.f7Tooltip) {
      self.f7Tooltip = app.tooltip.create({
        trigger: 'manual',
        containerEl: el,
        targetEl: svgEl.querySelector("line[data-index=\"" + currentIndex + "\"]"),
        text: self.formatTooltip(),
        cssClass: 'area-chart-tooltip'
      });

      if (self.f7Tooltip && self.f7Tooltip.show) {
        self.f7Tooltip.show();
      }

      return;
    }

    if (!self.f7Tooltip || !self.f7Tooltip.hide || !self.f7Tooltip.show) {
      return;
    }

    if (currentIndex !== null) {
      self.f7Tooltip.setText(self.formatTooltip());
      self.f7Tooltip.setTargetEl(svgEl.querySelector("line[data-index=\"" + currentIndex + "\"]"));
      self.f7Tooltip.show();
    } else {
      self.f7Tooltip.hide();
    }
  };

  _proto.setCurrentIndex = function setCurrentIndex(index) {
    if (index === this.currentIndex) return;
    this.currentIndex = index;
    this.$el.trigger('areachart:select', {
      index: index
    });
    this.emit('local::select areaChartSelect', this, index);
    this.$svgEl.find('line').removeClass('area-chart-current-line');
    this.$svgEl.find("line[data-index=\"" + index + "\"]").addClass('area-chart-current-line');
    this.setTooltip();
  };

  _proto.onLegendClick = function onLegendClick(e) {
    var index = parseInt($(e.target).closest('.area-chart-legend-item').attr('data-index'), 10);
    this.toggleDataset(index);
  };

  _proto.onMouseEnter = function onMouseEnter() {
    this.calcLinesOffsets();
  };

  _proto.onMouseMove = function onMouseMove(e) {
    var self = this;

    if (!self.linesOffsets) {
      self.calcLinesOffsets();
    }

    var currentLeft = e.pageX;
    if (typeof currentLeft === 'undefined') currentLeft = 0;
    var distances = self.linesOffsets.map(function (left) {
      return Math.abs(currentLeft - left);
    });
    var minDistance = Math.min.apply(Math, distances);
    var closestIndex = distances.indexOf(minDistance);
    self.setCurrentIndex(closestIndex);
  };

  _proto.onMouseLeave = function onMouseLeave() {
    this.setCurrentIndex(null);
  };

  _proto.attachEvents = function attachEvents() {
    var svgEl = this.svgEl,
        $el = this.$el;
    if (!svgEl) return;
    svgEl.addEventListener('mouseenter', this.onMouseEnter);
    svgEl.addEventListener('mousemove', this.onMouseMove);
    svgEl.addEventListener('mouseleave', this.onMouseLeave);
    $el.on('click', '.area-chart-legend-item', this.onLegendClick);
  };

  _proto.detachEvents = function detachEvents() {
    var svgEl = this.svgEl,
        $el = this.$el;
    if (!svgEl) return;
    svgEl.removeEventListener('mouseenter', this.onMouseEnter);
    svgEl.removeEventListener('mousemove', this.onMouseMove);
    svgEl.removeEventListener('mouseleave', this.onMouseLeave);
    $el.off('click', '.area-chart-legend-item', this.onLegendClick);
  };

  _proto.render = function render() {
    var self = this;
    var _self$params3 = self.params,
        lineChart = _self$params3.lineChart,
        toggleDatasets = _self$params3.toggleDatasets,
        width = _self$params3.width,
        height = _self$params3.height,
        axis = _self$params3.axis,
        axisLabels = _self$params3.axisLabels,
        legend = _self$params3.legend,
        datasets = _self$params3.datasets;
    var chartData = self.getChartData();
    var verticalLines = self.getVerticalLines();
    var visibleLegends = self.getVisibleLabels();
    var LegendItemTag = toggleDatasets ? 'button' : 'span';
    return $jsx("div", null, $jsx("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: width,
      height: height,
      viewBox: "0 0 " + width + " " + height,
      preserveAspectRatio: "none"
    }, chartData.map(function (data) {
      return lineChart ? $jsx("path", {
        stroke: data.color,
        "fill-rule": "evenodd",
        d: data.points
      }) : $jsx("polygon", {
        fill: data.color,
        "fill-rule": "evenodd",
        points: data.points
      });
    }), verticalLines.map(function (line, index) {
      return $jsx("line", {
        "data-index": index,
        fill: "#000",
        x1: line,
        y1: 0,
        x2: line,
        y2: height
      });
    })), axis && $jsx("div", {
      class: "area-chart-axis"
    }, axisLabels.map(function (label) {
      return $jsx("span", null, visibleLegends.includes(label) && $jsx("span", null, self.formatAxisLabel(label)));
    })), legend && $jsx("div", {
      class: "area-chart-legend"
    }, datasets.map(function (dataset, index) {
      return $jsx(LegendItemTag, {
        "data-index": index,
        class: "area-chart-legend-item " + (toggleDatasets ? 'area-chart-legend-button' : ''),
        _type: toggleDatasets ? 'button' : undefined
      }, $jsx("span", {
        style: "background-color: " + dataset.color
      }), self.formatLegendLabel(dataset.label));
    })));
  };

  _proto.update = function update(newParams, onlySvg) {
    if (newParams === void 0) {
      newParams = {};
    }

    if (onlySvg === void 0) {
      onlySvg = false;
    }

    var self = this;
    var params = self.params;
    Object.keys(newParams).forEach(function (param) {
      if (typeof newParams[param] !== 'undefined') {
        params[param] = newParams[param];
      }
    });
    if (self.$svgEl.length === 0) return self;
    self.detachEvents();
    self.$svgEl.remove();

    if (!onlySvg) {
      self.$axisEl.remove();
      self.$legendEl.remove();
    }

    var $rendered = $(self.render());
    var $svgEl = $rendered.find('svg');
    extend(self, {
      svgEl: $svgEl && $svgEl[0],
      $svgEl: $svgEl
    });

    if (!onlySvg) {
      var $axisEl = $rendered.find('.area-chart-axis');
      var $legendEl = $rendered.find('.area-chart-legend');
      extend(self, {
        $axisEl: $axisEl,
        $legendEl: $legendEl
      });
      self.$el.append($axisEl);
      self.$el.append($legendEl);
    }

    self.$el.prepend($svgEl);
    self.attachEvents();
    return self;
  };

  _proto.init = function init() {
    var self = this;
    var $rendered = $(self.render());
    var $svgEl = $rendered.find('svg');
    var $axisEl = $rendered.find('.area-chart-axis');
    var $legendEl = $rendered.find('.area-chart-legend');
    extend(self, {
      svgEl: $svgEl && $svgEl[0],
      $svgEl: $svgEl,
      $axisEl: $axisEl,
      $legendEl: $legendEl
    });
    self.$el.append($svgEl);
    self.$el.append($axisEl);
    self.$el.append($legendEl);
    self.attachEvents();
    return self;
  };

  _proto.destroy = function destroy() {
    var self = this;
    if (!self.$el || self.destroyed) return;
    self.$el.trigger('piechart:beforedestroy');
    self.emit('local::beforeDestroy areaChartBeforeDestroy', self);
    self.detachEvents();
    self.$svgEl.remove();
    self.$axisEl.remove();
    self.$legendEl.remove();

    if (self.f7Tooltip && self.f7Tooltip.destroy) {
      self.f7Tooltip.destroy();
    }

    delete self.$el[0].f7AreaChart;
    deleteProps(self);
    self.destroyed = true;
  };

  return AreaChart;
}(Framework7Class);

export default AreaChart;