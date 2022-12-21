import $ from '../../shared/dom7';
import Gauge from './gauge-class';
import ConstructorMethods from '../../shared/constructor-methods';
import { extend } from '../../shared/utils';
export default {
  name: 'gauge',
  static: {
    Gauge: Gauge
  },
  create: function create() {
    var app = this;
    app.gauge = ConstructorMethods({
      defaultSelector: '.gauge',
      constructor: Gauge,
      app: app,
      domProp: 'f7Gauge'
    });

    app.gauge.update = function update(el, newParams) {
      var $el = $(el);
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
      $(tabEl).find('.gauge-init').each(function (el) {
        app.gauge.create(extend({
          el: el
        }, $(el).dataset() || {}));
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      $(tabEl).find('.gauge-init').each(function (el) {
        if (el.f7Gauge) el.f7Gauge.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.gauge-init').each(function (el) {
        app.gauge.create(extend({
          el: el
        }, $(el).dataset() || {}));
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
        app.gauge.create(extend({
          el: el
        }, $(el).dataset() || {}));
      },
      destroy: function destroy(vnode) {
        var el = vnode.elm;
        if (el.f7Gauge) el.f7Gauge.destroy();
      }
    }
  }
};