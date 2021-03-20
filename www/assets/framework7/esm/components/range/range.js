import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import Range from './range-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
  name: 'range',
  create: function create() {
    var app = this;
    app.range = extend(ConstructorMethods({
      defaultSelector: '.range-slider',
      constructor: Range,
      app: app,
      domProp: 'f7Range'
    }), {
      getValue: function getValue(el) {
        if (el === void 0) {
          el = '.range-slider';
        }

        var range = app.range.get(el);
        if (range) return range.getValue();
        return undefined;
      },
      setValue: function setValue(el, value) {
        if (el === void 0) {
          el = '.range-slider';
        }

        var range = app.range.get(el);
        if (range) return range.setValue(value);
        return undefined;
      }
    });
  },
  static: {
    Range: Range
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.range-slider-init').each(function (rangeEl) {
        return new Range(app, {
          el: rangeEl
        });
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      $(tabEl).find('.range-slider-init').each(function (rangeEl) {
        if (rangeEl.f7Range) rangeEl.f7Range.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.range-slider-init').each(function (rangeEl) {
        return new Range(app, {
          el: rangeEl
        });
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      page.$el.find('.range-slider-init').each(function (rangeEl) {
        if (rangeEl.f7Range) rangeEl.f7Range.destroy();
      });
    }
  },
  vnode: {
    'range-slider-init': {
      insert: function insert(vnode) {
        var rangeEl = vnode.elm;
        var app = this;
        app.range.create({
          el: rangeEl
        });
      },
      destroy: function destroy(vnode) {
        var rangeEl = vnode.elm;
        if (rangeEl.f7Range) rangeEl.f7Range.destroy();
      }
    }
  }
};