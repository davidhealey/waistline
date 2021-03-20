"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _tooltipClass = _interopRequireDefault(require("./tooltip-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'tooltip',
  static: {
    Tooltip: _tooltipClass.default
  },
  create: function create() {
    var app = this;
    app.tooltip = (0, _constructorMethods.default)({
      defaultSelector: '.tooltip',
      constructor: _tooltipClass.default,
      app: app,
      domProp: 'f7Tooltip'
    });

    app.tooltip.show = function show(el) {
      var $el = (0, _dom.default)(el);
      if ($el.length === 0) return undefined;
      var tooltip = $el[0].f7Tooltip;
      if (!tooltip) return undefined;
      tooltip.show($el[0]);
      return tooltip;
    };

    app.tooltip.hide = function hide(el) {
      var $el = (0, _dom.default)(el);
      if ($el.length === 0) return undefined;
      var tooltip = $el[0].f7Tooltip;
      if (!tooltip) return undefined;
      tooltip.hide();
      return tooltip;
    };

    app.tooltip.setText = function text(el, newText) {
      var $el = (0, _dom.default)(el);
      if ($el.length === 0) return undefined;
      var tooltip = $el[0].f7Tooltip;
      if (!tooltip) return undefined;
      tooltip.setText(newText);
      return tooltip;
    };
  },
  params: {
    tooltip: {
      targetEl: null,
      delegated: false,
      text: null,
      cssClass: null,
      render: null,
      offset: 0,
      trigger: 'hover',
      containerEl: undefined
    }
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.tooltip-init').each(function (el) {
        var text = (0, _dom.default)(el).attr('data-tooltip');
        if (!text) return;
        app.tooltip.create({
          targetEl: el,
          text: text
        });
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      (0, _dom.default)(tabEl).find('.tooltip-init').each(function (el) {
        if (el.f7Tooltip) el.f7Tooltip.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.tooltip-init').each(function (el) {
        var text = (0, _dom.default)(el).attr('data-tooltip');
        if (!text) return;
        app.tooltip.create({
          targetEl: el,
          text: text
        });
      });

      if (app.theme === 'ios' && page.view && page.view.router.dynamicNavbar && page.$navbarEl && page.$navbarEl.length > 0) {
        page.$navbarEl.find('.tooltip-init').each(function (el) {
          var text = (0, _dom.default)(el).attr('data-tooltip');
          if (!text) return;
          app.tooltip.create({
            targetEl: el,
            text: text
          });
        });
      }
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;
      page.$el.find('.tooltip-init').each(function (el) {
        if (el.f7Tooltip) el.f7Tooltip.destroy();
      });

      if (app.theme === 'ios' && page.view && page.view.router.dynamicNavbar && page.$navbarEl && page.$navbarEl.length > 0) {
        page.$navbarEl.find('.tooltip-init').each(function (el) {
          if (el.f7Tooltip) el.f7Tooltip.destroy();
        });
      }
    }
  },
  vnode: {
    'tooltip-init': {
      insert: function insert(vnode) {
        var app = this;
        var el = vnode.elm;
        var text = (0, _dom.default)(el).attr('data-tooltip');
        if (!text) return;
        app.tooltip.create({
          targetEl: el,
          text: text
        });
      },
      update: function update(vnode) {
        var el = vnode.elm;
        if (!el.f7Tooltip) return;

        if (vnode && vnode.data && vnode.data.attrs && vnode.data.attrs['data-tooltip']) {
          el.f7Tooltip.setText(vnode.data.attrs['data-tooltip']);
        }
      },
      destroy: function destroy(vnode) {
        var el = vnode.elm;
        if (el.f7Tooltip) el.f7Tooltip.destroy();
      }
    }
  }
};
exports.default = _default;