"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _stepperClass = _interopRequireDefault(require("./stepper-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'stepper',
  create: function create() {
    var app = this;
    app.stepper = (0, _utils.extend)((0, _constructorMethods.default)({
      defaultSelector: '.stepper',
      constructor: _stepperClass.default,
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
    Stepper: _stepperClass.default
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.stepper-init').each(function (stepperEl) {
        var dataset = (0, _dom.default)(stepperEl).dataset();
        app.stepper.create((0, _utils.extend)({
          el: stepperEl
        }, dataset || {}));
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      (0, _dom.default)(tabEl).find('.stepper-init').each(function (stepperEl) {
        if (stepperEl.f7Stepper) stepperEl.f7Stepper.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.stepper-init').each(function (stepperEl) {
        var dataset = (0, _dom.default)(stepperEl).dataset();
        app.stepper.create((0, _utils.extend)({
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
        var dataset = (0, _dom.default)(stepperEl).dataset();
        app.stepper.create((0, _utils.extend)({
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
exports.default = _default;