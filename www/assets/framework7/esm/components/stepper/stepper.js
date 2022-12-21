import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import Stepper from './stepper-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
  name: 'stepper',
  create: function create() {
    var app = this;
    app.stepper = extend(ConstructorMethods({
      defaultSelector: '.stepper',
      constructor: Stepper,
      app: app,
      domProp: 'f7Stepper'
    }), {
      getValue: function getValue(el) {
        if (el === void 0) {
          el = '.stepper';
        }

        var stepper = app.stepper.get(el);
        if (stepper) return stepper.getValue();
        return undefined;
      },
      setValue: function setValue(el, value) {
        if (el === void 0) {
          el = '.stepper';
        }

        var stepper = app.stepper.get(el);
        if (stepper) return stepper.setValue(value);
        return undefined;
      }
    });
  },
  static: {
    Stepper: Stepper
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.stepper-init').each(function (stepperEl) {
        var dataset = $(stepperEl).dataset();
        app.stepper.create(extend({
          el: stepperEl
        }, dataset || {}));
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      $(tabEl).find('.stepper-init').each(function (stepperEl) {
        if (stepperEl.f7Stepper) stepperEl.f7Stepper.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.stepper-init').each(function (stepperEl) {
        var dataset = $(stepperEl).dataset();
        app.stepper.create(extend({
          el: stepperEl
        }, dataset || {}));
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      page.$el.find('.stepper-init').each(function (stepperEl) {
        if (stepperEl.f7Stepper) stepperEl.f7Stepper.destroy();
      });
    }
  },
  vnode: {
    'stepper-init': {
      insert: function insert(vnode) {
        var app = this;
        var stepperEl = vnode.elm;
        var dataset = $(stepperEl).dataset();
        app.stepper.create(extend({
          el: stepperEl
        }, dataset || {}));
      },
      destroy: function destroy(vnode) {
        var stepperEl = vnode.elm;
        if (stepperEl.f7Stepper) stepperEl.f7Stepper.destroy();
      }
    }
  }
};