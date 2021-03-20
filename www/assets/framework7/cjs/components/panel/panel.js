"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _panelClass = _interopRequireDefault(require("./panel-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'panel',
  params: {
    panel: {
      opened: undefined,
      // default based on panel-in class
      side: undefined,
      // default based on panel class
      effect: undefined,
      // default based on panel class
      resizable: undefined,
      // default based on panel-resizable class
      backdrop: true,
      backdropEl: undefined,
      visibleBreakpoint: undefined,
      collapsedBreakpoint: undefined,
      swipe: false,
      // or true
      swipeNoFollow: false,
      // or true
      swipeOnlyClose: false,
      swipeActiveArea: 0,
      swipeThreshold: 0,
      closeByBackdropClick: true,
      containerEl: undefined
    }
  },
  static: {
    Panel: _panelClass.default
  },
  create: function create() {
    var app = this;
    (0, _utils.extend)(app, {
      panel: {
        allowOpen: true,
        create: function create(params) {
          return new _panelClass.default(app, params);
        },
        get: function get(el) {
          if (el === void 0) {
            el = '.panel';
          }

          if (el instanceof _panelClass.default) return el;
          if (el === 'left' || el === 'right') el = ".panel-" + el; // eslint-disable-line

          var $el = (0, _dom.default)(el);
          if ($el.length === 0 || $el.length > 1) return undefined;
          return $el[0].f7Panel;
        },
        destroy: function destroy(el) {
          if (el === void 0) {
            el = '.panel';
          }

          var panel = app.panel.get(el);
          if (panel && panel.destroy) return panel.destroy();
          return undefined;
        },
        open: function open(el, animate) {
          if (el === void 0) {
            el = '.panel';
          }

          if (el === 'left' || el === 'right') el = ".panel-" + el; // eslint-disable-line

          var panel = app.panel.get(el);
          if (panel && panel.open) return panel.open(animate);

          if (!panel) {
            panel = app.panel.create({
              el: el
            });
            return panel.open(animate);
          }

          return undefined;
        },
        close: function close(el, animate) {
          if (el === void 0) {
            el = '.panel-in';
          }

          if (el === 'left' || el === 'right') el = ".panel-" + el; // eslint-disable-line

          var panel = app.panel.get(el);
          if (panel && panel.open) return panel.close(animate);

          if (!panel) {
            panel = app.panel.create({
              el: el
            });
            return panel.close(animate);
          }

          return undefined;
        },
        toggle: function toggle(el, animate) {
          if (el === void 0) {
            el = '.panel';
          }

          if (el === 'left' || el === 'right') el = ".panel-" + el; // eslint-disable-line

          var panel = app.panel.get(el);
          if (panel && panel.toggle) return panel.toggle(animate);

          if (!panel) {
            panel = app.panel.create({
              el: el
            });
            return panel.toggle(animate);
          }

          return undefined;
        }
      }
    });
  },
  on: {
    init: function init() {
      var app = this;
      (0, _dom.default)('.panel-init').each(function (panelEl) {
        var params = Object.assign({
          el: panelEl
        }, (0, _dom.default)(panelEl).dataset() || {});
        app.panel.create(params);
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.panel-init').each(function (panelEl) {
        var params = Object.assign({
          el: panelEl
        }, (0, _dom.default)(panelEl).dataset() || {});
        app.panel.create(params);
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;
      page.$el.find('.panel-init').each(function (panelEl) {
        var panel = app.panel.get(panelEl);
        if (panel && panel.destroy) panel.destroy();
      });
    }
  },
  vnode: {
    'panel-init': {
      insert: function insert(vnode) {
        var app = this;
        var panelEl = vnode.elm;
        var params = Object.assign({
          el: panelEl
        }, (0, _dom.default)(panelEl).dataset() || {});
        app.panel.create(params);
      },
      destroy: function destroy(vnode) {
        var app = this;
        var panelEl = vnode.elm;
        var panel = app.panel.get(panelEl);
        if (panel && panel.destroy) panel.destroy();
      }
    }
  },
  clicks: {
    '.panel-open': function open(clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.panel.open(data.panel, data.animate);
    },
    '.panel-close': function close(clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.panel.close(data.panel, data.animate);
    },
    '.panel-toggle': function close(clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.panel.toggle(data.panel, data.animate);
    },
    '.panel-backdrop': function close() {
      var app = this;
      var $panelEl = (0, _dom.default)('.panel-in:not(.panel-out)');
      if (!$panelEl.length) return;
      var instance = $panelEl[0] && $panelEl[0].f7Panel;
      $panelEl.trigger('panel:backdrop-click');

      if (instance) {
        instance.emit('backdropClick', instance);
      }

      app.emit('panelBackdropClick', instance || $panelEl[0]);
      if (app.params.panel.closeByBackdropClick) app.panel.close();
    }
  }
};
exports.default = _default;