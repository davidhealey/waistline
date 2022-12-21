"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _rangeClass = _interopRequireDefault(require("./range-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'range',
  create: function create() {
    var app = this;
    app.range = (0, _utils.extend)((0, _constructorMethods.default)({
      defaultSelector: '.range-slider',
      constructor: _rangeClass.default,
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
    Range: _rangeClass.default
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.range-slider-init').each(function (rangeEl) {
        return new _rangeClass.default(app, {
          el: rangeEl
        });
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      (0, _dom.default)(tabEl).find('.range-slider-init').each(function (rangeEl) {
        if (rangeEl.f7Range) rangeEl.f7Range.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.range-slider-init').each(function (rangeEl) {
        return new _rangeClass.default(app, {
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
exports.default = _default;