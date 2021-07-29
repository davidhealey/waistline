function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import $ from '../../shared/dom7';
import { extend, deleteProps } from '../../shared/utils';
import Framework7Class from '../../shared/class';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx';

var PieChart = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(PieChart, _Framework7Class);

  function PieChart(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var self = _assertThisInitialized(_this);

    var defaults = extend({}, app.params.pieChart); // Extend defaults with modules params

    self.useModulesParams(defaults);
    self.params = extend(defaults, params);
    var el = self.params.el;
    if (!el) return self || _assertThisInitialized(_this);
    var $el = $(el);
    if ($el.length === 0) return self || _assertThisInitialized(_this);
    if ($el[0].f7PieChart) return $el[0].f7PieChart || _assertThisInitialized(_this);
    extend(self, {
      app: app,
      $el: $el,
      el: $el && $el[0],
      currentIndex: null,
      f7Tooltip: null
    });
    $el[0].f7PieChart = self; // Install Modules

    self.useModules();
    self.showTooltip = self.showTooltip.bind(_assertThisInitialized(_this));
    self.hideTooltip = self.hideTooltip.bind(_assertThisInitialized(_this));
    self.init();
    return self || _assertThisInitialized(_this);
  }

  var _proto = PieChart.prototype;

  _proto.getSummValue = function getSummValue() {
    var datasets = this.params.datasets;
    var summ = 0;
    datasets.map(function (d) {
      return d.value || 0;
    }).forEach(function (value) {
      summ += value;
    });
    return summ;
  };

  _proto.getPaths = function getPaths() {
    var _this2 = this;

    var _this$params = this.params,
        datasets = _this$params.datasets,
        size = _this$params.size;
    var paths = [];
    var cumulativePercentage = 0;

    function getCoordinatesForPercentage(percentage) {
      var x = Math.cos(2 * Math.PI * percentage) * (size / 3);
      var y = Math.sin(2 * Math.PI * percentage) * (size / 3);
      return [x, y];
    }

    datasets.forEach(function (_ref) {
      var value = _ref.value,
          label = _ref.label,
          color = _ref.color;

      var percentage = value / _this2.getSummValue();

      var _getCoordinatesForPer = getCoordinatesForPercentage(cumulativePercentage),
          startX = _getCoordinatesForPer[0],
          startY = _getCoordinatesForPer[1];

      cumulativePercentage += percentage;

      var _getCoordinatesForPer2 = getCoordinatesForPercentage(cumulativePercentage),
          endX = _getCoordinatesForPer2[0],
          endY = _getCoordinatesForPer2[1];

      var largeArcFlag = percentage > 0.5 ? 1 : 0;
      var points = ["M " + startX + " " + startY, // Move
      "A " + size / 3 + " " + size / 3 + " 0 " + largeArcFlag + " 1 " + endX + " " + endY, // Arc
      'L 0 0' // Line
      ].join(' ');
      paths.push({
        points: points,
        label: label,
        color: color
      });
    });
    return paths;
  };

  _proto.formatTooltipText = function formatTooltipText() {
    var datasets = this.params.datasets;
    var currentIndex = this.currentIndex;
    if (currentIndex === null) return '';
    var _datasets$currentInde = datasets[currentIndex],
        value = _datasets$currentInde.value,
        label = _datasets$currentInde.label,
        color = _datasets$currentInde.color;
    var percentage = value / this.getSummValue() * 100;

    var round = function round(v) {
      if (parseInt(v, 10) === v) return v;
      return Math.round(v * 100) / 100;
    };

    if (this.params.formatTooltip) {
      return this.params.formatTooltip.call(this, {
        index: currentIndex,
        value: value,
        label: label,
        color: color,
        percentage: percentage
      });
    }

    var tooltipText = "" + (label ? label + ": " : '') + round(value) + " (" + round(percentage) + "%)";
    return "\n      <div class=\"pie-chart-tooltip-label\">\n        <span class=\"pie-chart-tooltip-color\" style=\"background-color: " + color + ";\"></span> " + tooltipText + "\n      </div>\n    ";
  };

  _proto.setTooltip = function setTooltip() {
    var self = this;
    var currentIndex = self.currentIndex,
        el = self.el,
        app = self.app,
        params = self.params;
    var tooltip = params.tooltip;
    if (currentIndex === null && !self.f7Tooltip) return;
    if (!tooltip || !el) return;

    if (currentIndex !== null && !self.f7Tooltip) {
      self.f7Tooltip = app.tooltip.create({
        trigger: 'manual',
        containerEl: el,
        targetEl: el.querySelector("path[data-index=\"" + currentIndex + "\"]"),
        text: self.formatTooltipText(),
        cssClass: 'pie-chart-tooltip'
      });
      self.f7Tooltip.show();
      return;
    }

    if (!self.f7Tooltip) return;

    if (currentIndex !== null) {
      self.f7Tooltip.setText(self.formatTooltipText());
      self.f7Tooltip.setTargetEl(el.querySelector("path[data-index=\"" + currentIndex + "\"]"));
      self.f7Tooltip.show();
    } else {
      self.f7Tooltip.hide();
    }
  };

  _proto.render = function render() {
    var self = this;
    var size = self.params.size;
    var paths = self.getPaths();
    return $jsx("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      viewBox: "-" + size / 3 + " -" + size / 3 + " " + size * 2 / 3 + " " + size * 2 / 3,
      style: "transform: rotate(-90deg)"
    }, paths.map(function (path, index) {
      return $jsx("path", {
        d: path.points,
        fill: path.color,
        "data-index": index
      });
    }));
  };

  _proto.update = function update(newParams) {
    if (newParams === void 0) {
      newParams = {};
    }

    var self = this;
    var params = self.params;
    Object.keys(newParams).forEach(function (param) {
      if (typeof newParams[param] !== 'undefined') {
        params[param] = newParams[param];
      }
    });
    if (self.$svgEl.length === 0) return self;
    self.$svgEl.remove();
    delete self.$svgEl.f7PieChart;
    var $svgEl = $(self.render()).eq(0);
    $svgEl.f7PieChart = self;
    extend(self, {
      $svgEl: $svgEl,
      svgEl: $svgEl && $svgEl[0]
    });
    self.$el.append($svgEl);
    return self;
  };

  _proto.setCurrentIndex = function setCurrentIndex(index) {
    var self = this;
    if (index === self.currentIndex) return;
    var datasets = self.params.datasets;
    self.currentIndex = index;
    self.$el.trigger('piechart:select', {
      index: index,
      dataset: datasets[index]
    });
    self.emit('local::select pieChartSelect', self, index, datasets[index]);
  };

  _proto.showTooltip = function showTooltip(e) {
    var _this3 = this;

    var newIndex = parseInt(e.target.getAttribute('data-index'), 10);
    this.setCurrentIndex(newIndex);
    this.$svgEl.find('path').removeClass('pie-chart-hidden').forEach(function (el, index) {
      if (index !== _this3.currentIndex) $(el).addClass('pie-chart-hidden');
    });
    this.setTooltip();
  };

  _proto.hideTooltip = function hideTooltip() {
    this.setCurrentIndex(null);
    this.$svgEl.find('path').removeClass('pie-chart-hidden');
    this.setTooltip();
  };

  _proto.init = function init() {
    var self = this;
    var $svgEl = $(self.render()).eq(0);
    $svgEl.f7PieChart = self;
    extend(self, {
      $svgEl: $svgEl,
      svgEl: $svgEl && $svgEl[0]
    });
    self.$el.append($svgEl);
    self.$el.on('click mouseenter', 'path', self.showTooltip, true);
    self.$el.on('mouseleave', 'path', self.hideTooltip, true);
    return self;
  };

  _proto.destroy = function destroy() {
    var self = this;
    if (!self.$el || self.destroyed) return;
    self.$el.trigger('piechart:beforedestroy');
    self.emit('local::beforeDestroy pieChartBeforeDestroy', self);
    self.$el.off('click mouseenter', 'path', self.showTooltip, true);
    self.$el.off('mouseleave', 'path', self.hideTooltip, true);
    self.$svgEl.remove();

    if (self.f7Tooltip && self.f7Tooltip.destroy) {
      self.f7Tooltip.destroy();
    }

    delete self.$el[0].f7PieChart;
    deleteProps(self);
    self.destroyed = true;
  };

  return PieChart;
}(Framework7Class);

export default PieChart;