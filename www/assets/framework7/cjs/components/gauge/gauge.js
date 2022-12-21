"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _gaugeClass = _interopRequireDefault(require("./gauge-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'gauge',
  static: {
    Gauge: _gaugeClass.default
  },
  create: function create() {
    var app = this;
    app.gauge = (0, _constructorMethods.default)({
      defaultSelector: '.gauge',
      constructor: _gaugeClass.default,
      app: app,
      domProp: 'f7Gauge'
    });

    app.gauge.update = function update(el, newParams) {
      var $el = (0, _dom.default)(el);
      if ($el.length === 0) return undefined;
      var gauge = app.gauge.get(el);
      if (!gauge) return undefined;
      gauge.update(newParams);
      return gauge;
    };
  },
  params: {
    gauge: {
      el: null,
      type: 'circle',
      value: 0,
      size: 200,
      bgColor: 'transparent',
      borderBgColor: '#eeeeee',
      borderColor: '#000000',
      borderWidth: 10,
      valueText: null,
      valueTextColor: '#000000',
      valueFontSize: 31,
      valueFontWeight: 500,
      labelText: null,
      labelTextColor: '#888888',
      labelFontSize: 14,
      labelFontWeight: 400
    }
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.gauge-init').each(function (el) {
        app.gauge.create((0, _utils.extend)({
          el: el
        }, (0, _dom.default)(el).dataset() || {}));
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      (0, _dom.default)(tabEl).find('.gauge-init').each(function (el) {
        if (el.f7Gauge) el.f7Gauge.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.gauge-init').each(function (el) {
        app.gauge.create((0, _utils.extend)({
          el: el
        }, (0, _dom.default)(el).dataset() || {}));
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      page.$el.find('.gauge-init').each(function (el) {
        if (el.f7Gauge) el.f7Gauge.destroy();
      });
    }
  },
  vnode: {
    'gauge-init': {
      insert: function insert(vnode) {
        var app = this;
        var el = vnode.elm;
        app.gauge.create((0, _utils.extend)({
          el: el
        }, (0, _dom.default)(el).dataset() || {}));
      },
      destroy: function destroy(vnode) {
        var el = vnode.elm;
        if (el.f7Gauge) el.f7Gauge.destroy();
      }
    }
  }
};
exports.default = _default;