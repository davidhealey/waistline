"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

var _swipePanel = _interopRequireDefault(require("./swipe-panel"));

var _resizablePanel = _interopRequireDefault(require("./resizable-panel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Panel = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Panel, _Framework7Class);

  function Panel(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    var extendedParams = (0, _utils.extend)({
      on: {}
    }, app.params.panel, params);
    _this = _Framework7Class.call(this, extendedParams, [app]) || this;

    var panel = _assertThisInitialized(_this);

    panel.params = extendedParams;
    panel.$containerEl = panel.params.containerEl ? (0, _dom.default)(panel.params.containerEl).eq(0) : app.$el;
    panel.containerEl = panel.$containerEl[0];

    if (!panel.containerEl) {
      panel.$containerEl = app.$el;
      panel.containerEl = app.$el[0];
    }

    var $el;

    if (panel.params.el) {
      $el = (0, _dom.default)(panel.params.el).eq(0);
    } else if (panel.params.content) {
      $el = (0, _dom.default)(panel.params.content).filter(function (node) {
        return node.nodeType === 1;
      }).eq(0);
    }

    if ($el.length === 0) return panel || _assertThisInitialized(_this);
    if ($el[0].f7Panel) return $el[0].f7Panel || _assertThisInitialized(_this);
    $el[0].f7Panel = panel;
    var _panel$params = panel.params,
        side = _panel$params.side,
        effect = _panel$params.effect,
        resizable = _panel$params.resizable;
    if (typeof side === 'undefined') side = $el.hasClass('panel-left') ? 'left' : 'right';
    if (typeof effect === 'undefined') effect = $el.hasClass('panel-cover') ? 'cover' : 'reveal';
    if (typeof resizable === 'undefined') resizable = $el.hasClass('panel-resizable');
    var $backdropEl;

    if (panel.params.backdrop && panel.params.backdropEl) {
      $backdropEl = (0, _dom.default)(panel.params.backdropEl);
    } else if (panel.params.backdrop) {
      $backdropEl = panel.$containerEl.children('.panel-backdrop');

      if ($backdropEl.length === 0) {
        $backdropEl = (0, _dom.default)('<div class="panel-backdrop"></div>');
        panel.$containerEl.prepend($backdropEl);
      }
    }

    (0, _utils.extend)(panel, {
      app: app,
      side: side,
      effect: effect,
      resizable: resizable,
      $el: $el,
      el: $el[0],
      opened: false,
      $backdropEl: $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0]
    }); // Install Modules

    panel.useModules(); // Init

    panel.init();
    return panel || _assertThisInitialized(_this);
  }

  var _proto = Panel.prototype;

  _proto.getViewEl = function getViewEl() {
    var panel = this;
    var viewEl;

    if (panel.$containerEl.children('.views').length > 0) {
      viewEl = panel.$containerEl.children('.views')[0];
    } else {
      viewEl = panel.$containerEl.children('.view')[0];
    }

    return viewEl;
  };

  _proto.setStateClasses = function setStateClasses(state) {
    var panel = this;
    var side = panel.side,
        el = panel.el;
    var viewEl = panel.getViewEl();
    var panelInView = viewEl && viewEl.contains(el);
    var $targetEl = !viewEl || panelInView ? panel.$containerEl : (0, _dom.default)('html');

    if (state === 'open') {
      $targetEl.addClass("with-panel with-panel-" + panel.side + "-" + panel.effect);
    }

    if (state === 'before-closing') {
      $targetEl.addClass('with-panel-closing');
    }

    if (state === 'closing') {
      $targetEl.addClass('with-panel-closing');
      $targetEl.removeClass("with-panel with-panel-" + panel.side + "-" + panel.effect);
    }

    if (state === 'after-closing') {
      $targetEl.removeClass('with-panel-closing');
    }

    if (state === 'closed') {
      $targetEl.removeClass("with-panel-" + side + "-reveal with-panel-" + side + "-cover with-panel");
    }
  };

  _proto.enableVisibleBreakpoint = function enableVisibleBreakpoint() {
    var panel = this;
    panel.visibleBreakpointDisabled = false;
    panel.setVisibleBreakpoint();
    return panel;
  };

  _proto.disableVisibleBreakpoint = function disableVisibleBreakpoint() {
    var panel = this;
    panel.visibleBreakpointDisabled = true;
    panel.setVisibleBreakpoint();
    return panel;
  };

  _proto.toggleVisibleBreakpoint = function toggleVisibleBreakpoint() {
    var panel = this;
    panel.visibleBreakpointDisabled = !panel.visibleBreakpointDisabled;
    panel.setVisibleBreakpoint();
    return panel;
  };

  _proto.setVisibleBreakpoint = function setVisibleBreakpoint(emitEvents) {
    if (emitEvents === void 0) {
      emitEvents = true;
    }

    var panel = this;
    var app = panel.app;

    if (!panel.visibleBreakpointResizeHandler) {
      panel.visibleBreakpointResizeHandler = function visibleBreakpointResizeHandler() {
        panel.setVisibleBreakpoint();
      };

      app.on('resize', panel.visibleBreakpointResizeHandler);
    }

    var side = panel.side,
        $el = panel.$el,
        $containerEl = panel.$containerEl,
        params = panel.params,
        visibleBreakpointDisabled = panel.visibleBreakpointDisabled;
    var breakpoint = params.visibleBreakpoint;
    var $viewEl = (0, _dom.default)(panel.getViewEl());
    var wasVisible = $el.hasClass('panel-in-breakpoint');

    if ($containerEl && $containerEl.hasClass('page')) {
      $viewEl.add($containerEl.children('.page-content, .tabs, .fab'));
    }

    if (app.width >= breakpoint && typeof breakpoint !== 'undefined' && breakpoint !== null && !visibleBreakpointDisabled) {
      if (!wasVisible) {
        var _$viewEl$css;

        panel.setStateClasses('closed');
        $el.addClass('panel-in-breakpoint').removeClass('panel-in panel-in-collapsed');
        panel.onOpen(false);
        panel.onOpened();
        $viewEl.css((_$viewEl$css = {}, _$viewEl$css["margin-" + side] = $el.width() + "px", _$viewEl$css));
        app.allowPanelOpen = true;

        if (emitEvents) {
          panel.emit('local::breakpoint panelBreakpoint', panel);
          panel.$el.trigger('panel:breakpoint');
        }
      } else {
        var _$viewEl$css2;

        $viewEl.css((_$viewEl$css2 = {}, _$viewEl$css2["margin-" + side] = $el.width() + "px", _$viewEl$css2));
      }
    } else if (wasVisible) {
      var _$viewEl$css3;

      $el.removeClass('panel-in-breakpoint panel-in');
      panel.onClose();
      panel.onClosed();
      $viewEl.css((_$viewEl$css3 = {}, _$viewEl$css3["margin-" + side] = '', _$viewEl$css3));

      if (emitEvents) {
        panel.emit('local::breakpoint panelBreakpoint', panel);
        panel.$el.trigger('panel:breakpoint');
      }
    }
  };

  _proto.enableCollapsedBreakpoint = function enableCollapsedBreakpoint() {
    var panel = this;
    panel.collapsedBreakpointDisabled = false;
    panel.setCollapsedBreakpoint();
    return panel;
  };

  _proto.disableCollapsedBreakpoint = function disableCollapsedBreakpoint() {
    var panel = this;
    panel.collapsedBreakpointDisabled = true;
    panel.setCollapsedBreakpoint();
    return panel;
  };

  _proto.toggleCollapsedBreakpoint = function toggleCollapsedBreakpoint() {
    var panel = this;
    panel.collapsedBreakpointDisabled = !panel.collapsedBreakpointDisabled;
    panel.setCollapsedBreakpoint();
    return panel;
  };

  _proto.setCollapsedBreakpoint = function setCollapsedBreakpoint(emitEvents) {
    var panel = this;
    var app = panel.app;

    if (!panel.collapsedBreakpointResizeHandler) {
      panel.collapsedBreakpointResizeHandler = function collapsedBreakpointResizeHandler() {
        panel.setCollapsedBreakpoint();
      };

      app.on('resize', panel.collapsedBreakpointResizeHandler);
    }

    var $el = panel.$el,
        params = panel.params,
        collapsedBreakpointDisabled = panel.collapsedBreakpointDisabled;
    if ($el.hasClass('panel-in-breakpoint')) return;
    var breakpoint = params.collapsedBreakpoint;
    var wasVisible = $el.hasClass('panel-in-collapsed');

    if (app.width >= breakpoint && typeof breakpoint !== 'undefined' && breakpoint !== null && !collapsedBreakpointDisabled) {
      if (!wasVisible) {
        panel.setStateClasses('closed');
        $el.addClass('panel-in-collapsed').removeClass('panel-in');
        panel.collapsed = true;
        app.allowPanelOpen = true;

        if (emitEvents) {
          panel.emit('local::collapsedBreakpoint panelCollapsedBreakpoint', panel);
          panel.$el.trigger('panel:collapsedbreakpoint');
        }
      }
    } else if (wasVisible) {
      $el.removeClass('panel-in-collapsed panel-in');
      panel.collapsed = false;

      if (emitEvents) {
        panel.emit('local::collapsedBreakpoint panelCollapsedBreakpoint', panel);
        panel.$el.trigger('panel:collapsedbreakpoint');
      }
    }
  };

  _proto.enableResizable = function enableResizable() {
    var panel = this;

    if (panel.resizableInitialized) {
      panel.resizable = true;
      panel.$el.addClass('panel-resizable');
    } else {
      (0, _resizablePanel.default)(panel);
    }

    return panel;
  };

  _proto.disableResizable = function disableResizable() {
    var panel = this;
    panel.resizable = false;
    panel.$el.removeClass('panel-resizable');
    return panel;
  };

  _proto.enableSwipe = function enableSwipe() {
    var panel = this;

    if (panel.swipeInitialized) {
      panel.swipeable = true;
    } else {
      (0, _swipePanel.default)(panel);
    }

    return panel;
  };

  _proto.disableSwipe = function disableSwipe() {
    var panel = this;
    panel.swipeable = false;
    return panel;
  };

  _proto.onOpen = function onOpen(modifyHtmlClasses) {
    if (modifyHtmlClasses === void 0) {
      modifyHtmlClasses = true;
    }

    var panel = this;
    var app = panel.app;
    panel.opened = true;
    app.panel.allowOpen = false;
    panel.$el.trigger('panel:beforeopen');
    panel.emit('local::beforeOpen panelBeforeOpen', panel);

    if (modifyHtmlClasses) {
      panel.setStateClasses('open');
    }

    panel.$el.trigger('panel:open');
    panel.emit('local::open panelOpen', panel);
  };

  _proto.onOpened = function onOpened() {
    var panel = this;
    var app = panel.app;
    app.panel.allowOpen = true;
    panel.$el.trigger('panel:opened');
    panel.emit('local::opened panelOpened', panel);
  };

  _proto.onClose = function onClose() {
    var panel = this;
    var app = panel.app;
    panel.opened = false;
    app.panel.allowOpen = false;
    panel.$el.trigger('panel:beforeclose');
    panel.emit('local::beforeClose panelBeforeClose', panel);
    panel.setStateClasses('closing');
    panel.$el.trigger('panel:close');
    panel.emit('local::close panelClose', panel);
  };

  _proto.onClosed = function onClosed() {
    var panel = this;
    var app = panel.app;
    app.panel.allowOpen = true;
    panel.setStateClasses('after-closing');
    panel.$el.removeClass('panel-out');

    if (panel.$backdropEl) {
      var otherPanel = app.panel.get('.panel-in');
      var shouldHideBackdrop = !otherPanel || otherPanel && !otherPanel.$backdropEl;

      if (shouldHideBackdrop) {
        panel.$backdropEl.removeClass('panel-backdrop-in');
      }
    }

    panel.$el.trigger('panel:closed');
    panel.emit('local::closed panelClosed', panel);
  };

  _proto.toggle = function toggle(animate) {
    if (animate === void 0) {
      animate = true;
    }

    var panel = this;
    var breakpoint = panel.params.visibleBreakpoint;
    var app = panel.app;

    if (app.width >= breakpoint && typeof breakpoint !== 'undefined' && breakpoint !== null) {
      return panel.toggleVisibleBreakpoint();
    }

    if (panel.opened) panel.close(animate);else panel.open(animate);
    return panel;
  };

  _proto.insertToRoot = function insertToRoot() {
    var panel = this;
    var document = (0, _ssrWindow.getDocument)();
    var $el = panel.$el,
        $backdropEl = panel.$backdropEl,
        $containerEl = panel.$containerEl;
    var $panelParentEl = $el.parent();
    var wasInDom = $el.parents(document).length > 0;

    if (!$panelParentEl.is($containerEl) || $el.prevAll('.views, .view').length) {
      var $insertBeforeEl = $containerEl.children('.panel, .views, .view').eq(0);
      var $insertAfterEl = $containerEl.children('.panel-backdrop').eq(0);

      if ($insertBeforeEl.length) {
        $el.insertBefore($insertBeforeEl);
      } else if ($insertAfterEl) {
        $el.insertBefore($insertAfterEl);
      } else {
        $containerEl.prepend($el);
      }

      if ($backdropEl && $backdropEl.length && (!$backdropEl.parent().is($containerEl) && $backdropEl.nextAll('.panel').length === 0 || $backdropEl.parent().is($containerEl) && $backdropEl.nextAll('.panel').length === 0)) {
        $backdropEl.insertBefore($el);
      }

      panel.once('panelClosed', function () {
        if (wasInDom) {
          $panelParentEl.append($el);
        } else {
          $el.remove();
        }
      });
    }
  };

  _proto.open = function open(animate) {
    if (animate === void 0) {
      animate = true;
    }

    var panel = this;
    var app = panel.app;
    if (!app.panel.allowOpen) return false;
    var effect = panel.effect,
        $el = panel.$el,
        $backdropEl = panel.$backdropEl,
        opened = panel.opened,
        $containerEl = panel.$containerEl;

    if (!$el || $el.hasClass('panel-in')) {
      return panel;
    }

    panel.insertToRoot(); // Ignore if opened

    if (opened || $el.hasClass('panel-in-breakpoint') || $el.hasClass('panel-in')) return false; // Close if some panel is opened

    var otherOpenedPanel = app.panel.get('.panel-in');

    if (otherOpenedPanel && otherOpenedPanel !== panel) {
      otherOpenedPanel.close(animate);
    }

    $el[animate ? 'removeClass' : 'addClass']('not-animated');
    $el.addClass('panel-in');

    if ($backdropEl) {
      $backdropEl.addClass('panel-backdrop-in');
      $backdropEl[animate ? 'removeClass' : 'addClass']('not-animated');
    }

    if (panel.effect === 'cover') {
      /* eslint no-underscore-dangle: ["error", { "allow": ["_clientLeft"] }] */
      panel._clientLeft = $el[0].clientLeft;
    } // Transitionend


    var $viewEl = (0, _dom.default)(panel.getViewEl());

    if ($containerEl && $containerEl.hasClass('page')) {
      $viewEl.add($containerEl.children('.page-content, .tabs'));
    }

    var transitionEndTarget = effect === 'reveal' ? $viewEl : $el;

    function panelTransitionEnd() {
      transitionEndTarget.transitionEnd(function (e) {
        if ((0, _dom.default)(e.target).is(transitionEndTarget)) {
          if ($el.hasClass('panel-out')) {
            panel.onClosed();
          } else {
            panel.onOpened();
          }
        } else panelTransitionEnd();
      });
    }

    if (animate) {
      if ($backdropEl) {
        $backdropEl.removeClass('not-animated');
      }

      panelTransitionEnd();
      $el.removeClass('panel-out not-animated').addClass('panel-in');
      panel.onOpen();
    } else {
      if ($backdropEl) {
        $backdropEl.addClass('not-animated');
      }

      $el.removeClass('panel-out').addClass('panel-in not-animated');
      panel.onOpen();
      panel.onOpened();
    }

    return true;
  };

  _proto.close = function close(animate) {
    if (animate === void 0) {
      animate = true;
    }

    var panel = this;
    var effect = panel.effect,
        $el = panel.$el,
        $backdropEl = panel.$backdropEl,
        opened = panel.opened,
        $containerEl = panel.$containerEl;
    if (!opened || $el.hasClass('panel-in-breakpoint') || !$el.hasClass('panel-in')) return panel;
    $el[animate ? 'removeClass' : 'addClass']('not-animated');

    if ($backdropEl) {
      $backdropEl[animate ? 'removeClass' : 'addClass']('not-animated');
    }

    var $viewEl = (0, _dom.default)(panel.getViewEl());

    if ($containerEl && $containerEl.hasClass('page')) {
      $viewEl.add($containerEl.children('.page-content, .tabs'));
    }

    var transitionEndTarget = effect === 'reveal' ? $viewEl : $el;

    function transitionEnd() {
      if ($el.hasClass('panel-out')) {
        panel.onClosed();
      } else if ($el.hasClass('panel-in')) {
        panel.onOpened();
      }

      panel.setStateClasses('after-closing');
    }

    if (animate) {
      transitionEndTarget.transitionEnd(function () {
        transitionEnd();
      });
      $el.removeClass('panel-in').addClass('panel-out'); // Emit close

      panel.onClose();
    } else {
      $el.addClass('not-animated').removeClass('panel-in').addClass('panel-out'); // Emit close

      panel.onClose();
      panel.onClosed();
    }

    return panel;
  };

  _proto.init = function init() {
    var panel = this; // const app = panel.app;

    if (typeof panel.params.visibleBreakpoint !== 'undefined') {
      panel.setVisibleBreakpoint();
    }

    if (typeof panel.params.collapsedBreakpoint !== 'undefined') {
      panel.setCollapsedBreakpoint();
    }

    if (panel.params.swipe) {
      panel.enableSwipe();
    }

    if (panel.resizable) {
      panel.enableResizable();
    }
  };

  _proto.destroy = function destroy() {
    var panel = this;
    var app = panel.app;
    var _panel = panel,
        $containerEl = _panel.$containerEl;

    if (!panel.$el) {
      // Panel already destroyed
      return;
    }

    panel.emit('local::beforeDestroy panelBeforeDestroy', panel);
    panel.$el.trigger('panel:beforedestroy');

    if (panel.visibleBreakpointResizeHandler) {
      app.off('resize', panel.visibleBreakpointResizeHandler);
    }

    if (panel.collapsedBreakpointResizeHandler) {
      app.off('resize', panel.collapsedBreakpointResizeHandler);
    }

    if (panel.$el.hasClass('panel-in-breakpoint') || panel.$el.hasClass('panel-in-collapsed')) {
      var _$viewEl$css4;

      var $viewEl = (0, _dom.default)(panel.getViewEl());

      if ($containerEl && $containerEl.hasClass('page')) {
        $viewEl.add($containerEl.children('.page-content, .tabs'));
      }

      panel.$el.removeClass('panel-in-breakpoint panel-in-collapsed panel-in');
      $viewEl.css((_$viewEl$css4 = {}, _$viewEl$css4["margin-" + panel.side] = '', _$viewEl$css4));
      panel.emit('local::breakpoint panelBreakpoint', panel);
      panel.$el.trigger('panel:breakpoint');
    }

    panel.$el.trigger('panel:destroy');
    panel.emit('local::destroy panelDestroy', panel);

    if (panel.el) {
      panel.el.f7Panel = null;
      delete panel.el.f7Panel;
    }

    (0, _utils.deleteProps)(panel);
    panel = null;
  };

  return Panel;
}(_class.default);

var _default = Panel;
exports.default = _default;