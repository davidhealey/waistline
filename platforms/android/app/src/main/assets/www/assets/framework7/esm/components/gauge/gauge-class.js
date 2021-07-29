function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/* eslint no-nested-ternary: off */
import { getDocument } from 'ssr-window';
import $ from '../../shared/dom7';
import { extend, deleteProps } from '../../shared/utils';
import Framework7Class from '../../shared/class';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx';

var Gauge = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Gauge, _Framework7Class);

  function Gauge(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var self = _assertThisInitialized(_this);

    var defaults = extend({}, app.params.gauge); // Extend defaults with modules params

    self.useModulesParams(defaults);
    self.params = extend(defaults, params);
    var el = self.params.el;
    if (!el) return self || _assertThisInitialized(_this);
    var $el = $(el);
    if ($el.length === 0) return self || _assertThisInitialized(_this);
    if ($el[0].f7Gauge) return $el[0].f7Gauge || _assertThisInitialized(_this);
    extend(self, {
      app: app,
      $el: $el,
      el: $el && $el[0]
    });
    $el[0].f7Gauge = self; // Install Modules

    self.useModules();
    self.init();
    return self || _assertThisInitialized(_this);
  }

  var _proto = Gauge.prototype;

  _proto.calcRadius = function calcRadius() {
    var self = this;
    var _self$params = self.params,
        size = _self$params.size,
        borderWidth = _self$params.borderWidth;
    return size / 2 - borderWidth / 2;
  };

  _proto.calcBorderLength = function calcBorderLength() {
    var self = this;
    var radius = self.calcRadius();
    return 2 * Math.PI * radius;
  };

  _proto.render = function render() {
    var self = this;
    if (self.params.render) return self.params.render.call(self, self);
    var _self$params2 = self.params,
        type = _self$params2.type,
        value = _self$params2.value,
        size = _self$params2.size,
        bgColor = _self$params2.bgColor,
        borderBgColor = _self$params2.borderBgColor,
        borderColor = _self$params2.borderColor,
        borderWidth = _self$params2.borderWidth,
        valueText = _self$params2.valueText,
        valueTextColor = _self$params2.valueTextColor,
        valueFontSize = _self$params2.valueFontSize,
        valueFontWeight = _self$params2.valueFontWeight,
        labelText = _self$params2.labelText,
        labelTextColor = _self$params2.labelTextColor,
        labelFontSize = _self$params2.labelFontSize,
        labelFontWeight = _self$params2.labelFontWeight;
    var semiCircle = type === 'semicircle';
    var radius = self.calcRadius();
    var length = self.calcBorderLength();
    var progress = Math.max(Math.min(value, 1), 0);
    return $jsx("svg", {
      class: "gauge-svg",
      width: size + "px",
      height: (semiCircle ? size / 2 : size) + "px",
      viewBox: "0 0 " + size + " " + (semiCircle ? size / 2 : size)
    }, semiCircle && $jsx("path", {
      class: "gauge-back-semi",
      d: "M" + (size - borderWidth / 2) + "," + size / 2 + " a1,1 0 0,0 -" + (size - borderWidth) + ",0",
      stroke: borderBgColor,
      "stroke-width": borderWidth,
      fill: bgColor || 'none'
    }), semiCircle && $jsx("path", {
      class: "gauge-front-semi",
      d: "M" + (size - borderWidth / 2) + "," + size / 2 + " a1,1 0 0,0 -" + (size - borderWidth) + ",0",
      stroke: borderColor,
      "stroke-width": borderWidth,
      "stroke-dasharray": length / 2,
      "stroke-dashoffset": length / 2 * (1 + progress),
      fill: borderBgColor ? 'none' : bgColor || 'none'
    }), !semiCircle && borderBgColor && $jsx("circle", {
      class: "gauge-back-circle",
      stroke: borderBgColor,
      "stroke-width": borderWidth,
      fill: bgColor || 'none',
      cx: size / 2,
      cy: size / 2,
      r: radius
    }), !semiCircle && $jsx("circle", {
      class: "gauge-front-circle",
      transform: "rotate(-90 " + size / 2 + " " + size / 2 + ")",
      stroke: borderColor,
      "stroke-width": borderWidth,
      "stroke-dasharray": length,
      "stroke-dashoffset": length * (1 - progress),
      fill: borderBgColor ? 'none' : bgColor || 'none',
      cx: size / 2,
      cy: size / 2,
      r: radius
    }), valueText && $jsx("text", {
      class: "gauge-value-text",
      x: "50%",
      y: semiCircle ? '100%' : '50%',
      "font-weight": valueFontWeight,
      "font-size": valueFontSize,
      fill: valueTextColor,
      dy: semiCircle ? labelText ? -labelFontSize - 15 : -5 : 0,
      "text-anchor": "middle",
      "dominant-baseline": !semiCircle && 'middle'
    }, valueText), labelText && $jsx("text", {
      class: "gauge-label-text",
      x: "50%",
      y: semiCircle ? '100%' : '50%',
      "font-weight": labelFontWeight,
      "font-size": labelFontSize,
      fill: labelTextColor,
      dy: semiCircle ? -5 : valueText ? valueFontSize / 2 + 10 : 0,
      "text-anchor": "middle",
      "dominant-baseline": !semiCircle && 'middle'
    }, labelText));
  };

  _proto.update = function update(newParams) {
    if (newParams === void 0) {
      newParams = {};
    }

    var self = this;
    var document = getDocument();
    var params = self.params,
        $svgEl = self.$svgEl;
    Object.keys(newParams).forEach(function (param) {
      if (typeof newParams[param] !== 'undefined') {
        params[param] = newParams[param];
      }
    });
    if ($svgEl.length === 0) return self;
    var value = params.value,
        size = params.size,
        bgColor = params.bgColor,
        borderBgColor = params.borderBgColor,
        borderColor = params.borderColor,
        borderWidth = params.borderWidth,
        valueText = params.valueText,
        valueTextColor = params.valueTextColor,
        valueFontSize = params.valueFontSize,
        valueFontWeight = params.valueFontWeight,
        labelText = params.labelText,
        labelTextColor = params.labelTextColor,
        labelFontSize = params.labelFontSize,
        labelFontWeight = params.labelFontWeight;
    var length = self.calcBorderLength();
    var progress = Math.max(Math.min(value, 1), 0);
    var radius = self.calcRadius();
    var semiCircle = params.type === 'semicircle';
    var svgAttrs = {
      width: size + "px",
      height: (semiCircle ? size / 2 : size) + "px",
      viewBox: "0 0 " + size + " " + (semiCircle ? size / 2 : size)
    };
    Object.keys(svgAttrs).forEach(function (attr) {
      $svgEl.attr(attr, svgAttrs[attr]);
    });

    if (semiCircle) {
      var backAttrs = {
        d: "M" + (size - borderWidth / 2) + "," + size / 2 + " a1,1 0 0,0 -" + (size - borderWidth) + ",0",
        stroke: borderBgColor,
        'stroke-width': borderWidth,
        fill: bgColor || 'none'
      };
      var frontAttrs = {
        d: "M" + (size - borderWidth / 2) + "," + size / 2 + " a1,1 0 0,0 -" + (size - borderWidth) + ",0",
        stroke: borderColor,
        'stroke-width': borderWidth,
        'stroke-dasharray': length / 2,
        'stroke-dashoffset': length / 2 * (1 + progress),
        fill: borderBgColor ? 'none' : bgColor || 'none'
      };
      Object.keys(backAttrs).forEach(function (attr) {
        $svgEl.find('.gauge-back-semi').attr(attr, backAttrs[attr]);
      });
      Object.keys(frontAttrs).forEach(function (attr) {
        $svgEl.find('.gauge-front-semi').attr(attr, frontAttrs[attr]);
      });
    } else {
      var _backAttrs = {
        stroke: borderBgColor,
        'stroke-width': borderWidth,
        fill: bgColor || 'none',
        cx: size / 2,
        cy: size / 2,
        r: radius
      };
      var _frontAttrs = {
        transform: "rotate(-90 " + size / 2 + " " + size / 2 + ")",
        stroke: borderColor,
        'stroke-width': borderWidth,
        'stroke-dasharray': length,
        'stroke-dashoffset': length * (1 - progress),
        fill: borderBgColor ? 'none' : bgColor || 'none',
        cx: size / 2,
        cy: size / 2,
        r: radius
      };
      Object.keys(_backAttrs).forEach(function (attr) {
        $svgEl.find('.gauge-back-circle').attr(attr, _backAttrs[attr]);
      });
      Object.keys(_frontAttrs).forEach(function (attr) {
        $svgEl.find('.gauge-front-circle').attr(attr, _frontAttrs[attr]);
      });
    }

    if (valueText) {
      if (!$svgEl.find('.gauge-value-text').length) {
        var textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.classList.add('gauge-value-text');
        $svgEl.append(textEl);
      }

      var textAttrs = {
        x: '50%',
        y: semiCircle ? '100%' : '50%',
        'font-weight': valueFontWeight,
        'font-size': valueFontSize,
        fill: valueTextColor,
        dy: semiCircle ? labelText ? -labelFontSize - 15 : -5 : 0,
        'text-anchor': 'middle',
        'dominant-baseline': !semiCircle && 'middle'
      };
      Object.keys(textAttrs).forEach(function (attr) {
        $svgEl.find('.gauge-value-text').attr(attr, textAttrs[attr]);
      });
      $svgEl.find('.gauge-value-text').text(valueText);
    } else {
      $svgEl.find('.gauge-value-text').remove();
    }

    if (labelText) {
      if (!$svgEl.find('.gauge-label-text').length) {
        var _textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        _textEl.classList.add('gauge-label-text');

        $svgEl.append(_textEl);
      }

      var labelAttrs = {
        x: '50%',
        y: semiCircle ? '100%' : '50%',
        'font-weight': labelFontWeight,
        'font-size': labelFontSize,
        fill: labelTextColor,
        dy: semiCircle ? -5 : valueText ? valueFontSize / 2 + 10 : 0,
        'text-anchor': 'middle',
        'dominant-baseline': !semiCircle && 'middle'
      };
      Object.keys(labelAttrs).forEach(function (attr) {
        $svgEl.find('.gauge-label-text').attr(attr, labelAttrs[attr]);
      });
      $svgEl.find('.gauge-label-text').text(labelText);
    } else {
      $svgEl.find('.gauge-label-text').remove();
    }

    return self;
  };

  _proto.init = function init() {
    var self = this;
    var $svgEl = $(self.render()).eq(0);
    $svgEl.f7Gauge = self;
    extend(self, {
      $svgEl: $svgEl,
      svgEl: $svgEl && $svgEl[0]
    });
    self.$el.append($svgEl);
    return self;
  };

  _proto.destroy = function destroy() {
    var self = this;
    if (!self.$el || self.destroyed) return;
    self.$el.trigger('gauge:beforedestroy');
    self.emit('local::beforeDestroy selfBeforeDestroy', self);
    self.$svgEl.remove();
    delete self.$el[0].f7Gauge;
    deleteProps(self);
    self.destroyed = true;
  };

  return Gauge;
}(Framework7Class);

export default Gauge;