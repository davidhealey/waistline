"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _router = _interopRequireDefault(require("../../modules/router/router"));

var _class = _interopRequireDefault(require("../../shared/class"));

var _resizableView = _interopRequireDefault(require("./resizable-view"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var View = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(View, _Framework7Class);

  function View(app, el, viewParams) {
    var _this;

    if (viewParams === void 0) {
      viewParams = {};
    }

    _this = _Framework7Class.call(this, viewParams, [app]) || this;

    var view = _assertThisInitialized(_this);

    var ssr = view.params.routerId;
    var defaults = {
      routes: [],
      routesAdd: []
    };

    if (!ssr) {
      var $el = (0, _dom.default)(el);

      if (!$el.length) {
        var message = "Framework7: can't create a View instance because ";
        message += typeof el === 'string' ? "the selector \"" + el + "\" didn't match any element" : 'el must be an HTMLElement or Dom7 object';
        throw new Error(message);
      }
    } // Default View params


    view.params = (0, _utils.extend)({
      el: el
    }, defaults, app.params.view, viewParams); // Routes

    if (view.params.routes.length > 0) {
      view.routes = view.params.routes;
    } else {
      view.routes = [].concat(app.routes, view.params.routesAdd);
    } // View Props


    (0, _utils.extend)(false, view, {
      app: app,
      name: view.params.name,
      main: view.params.main,
      history: [],
      scrollHistory: {}
    }); // Install Modules

    view.useModules(); // Add to app

    app.views.push(view);

    if (view.main) {
      app.views.main = view;
    }

    if (view.name) {
      app.views[view.name] = view;
    } // Index


    view.index = app.views.indexOf(view); // View ID

    var viewId;

    if (view.name) {
      viewId = "view_" + view.name;
    } else if (view.main) {
      viewId = 'view_main';
    } else {
      viewId = "view_" + view.index;
    }

    view.id = viewId;

    if (!view.params.init) {
      return view || _assertThisInitialized(_this);
    } // Init View


    if (app.initialized) {
      view.init();
    } else {
      app.on('init', function () {
        view.init();
      });
    }

    return view || _assertThisInitialized(_this);
  }

  var _proto = View.prototype;

  _proto.destroy = function destroy() {
    var view = this;
    var app = view.app;
    view.$el.trigger('view:beforedestroy');
    view.emit('local::beforeDestroy viewBeforeDestroy', view);
    app.off('resize', view.checkMasterDetailBreakpoint);

    if (view.main) {
      app.views.main = null;
      delete app.views.main;
    } else if (view.name) {
      app.views[view.name] = null;
      delete app.views[view.name];
    }

    view.$el[0].f7View = null;
    delete view.$el[0].f7View;
    app.views.splice(app.views.indexOf(view), 1); // Destroy Router

    if (view.params.router && view.router) {
      view.router.destroy();
    }

    view.emit('local::destroy viewDestroy', view); // Delete props & methods

    Object.keys(view).forEach(function (viewProp) {
      view[viewProp] = null;
      delete view[viewProp];
    });
    view = null;
  };

  _proto.checkMasterDetailBreakpoint = function checkMasterDetailBreakpoint(force) {
    var view = this;
    var app = view.app;
    var wasMasterDetail = view.$el.hasClass('view-master-detail');
    var isMasterDetail = app.width >= view.params.masterDetailBreakpoint && view.$el.children('.page-master').length;

    if (typeof force === 'undefined' && isMasterDetail || force === true) {
      view.$el.addClass('view-master-detail');

      if (!wasMasterDetail) {
        view.emit('local::masterDetailBreakpoint viewMasterDetailBreakpoint', view);
        view.$el.trigger('view:masterDetailBreakpoint');
      }
    } else {
      view.$el.removeClass('view-master-detail');

      if (wasMasterDetail) {
        view.emit('local::masterDetailBreakpoint viewMasterDetailBreakpoint', view);
        view.$el.trigger('view:masterDetailBreakpoint');
      }
    }
  };

  _proto.initMasterDetail = function initMasterDetail() {
    var view = this;
    var app = view.app;
    view.checkMasterDetailBreakpoint = view.checkMasterDetailBreakpoint.bind(view);
    view.checkMasterDetailBreakpoint();

    if (view.params.masterDetailResizable) {
      (0, _resizableView.default)(view);
    }

    app.on('resize', view.checkMasterDetailBreakpoint);
  };

  _proto.mount = function mount(viewEl) {
    var view = this;
    var app = view.app;
    var el = view.params.el || viewEl;
    var $el = (0, _dom.default)(el); // Selector

    var selector;
    if (typeof el === 'string') selector = el;else {
      // Supposed to be HTMLElement or Dom7
      selector = ($el.attr('id') ? "#" + $el.attr('id') : '') + ($el.attr('class') ? "." + $el.attr('class').replace(/ /g, '.').replace('.active', '') : '');
    } // DynamicNavbar

    var $navbarsEl;

    if (app.theme === 'ios' && view.params.iosDynamicNavbar) {
      $navbarsEl = $el.children('.navbars').eq(0);

      if ($navbarsEl.length === 0) {
        $navbarsEl = (0, _dom.default)('<div class="navbars"></div>');
      }
    }

    (0, _utils.extend)(view, {
      $el: $el,
      el: $el[0],
      main: view.main || $el.hasClass('view-main'),
      $navbarsEl: $navbarsEl,
      navbarsEl: $navbarsEl ? $navbarsEl[0] : undefined,
      selector: selector
    });

    if (view.main) {
      app.views.main = view;
    } // Save in DOM


    if ($el && $el[0]) {
      $el[0].f7View = view;
    }

    view.emit('local::mount viewMount', view);
  };

  _proto.init = function init(viewEl) {
    var view = this;
    view.mount(viewEl);

    if (view.params.router) {
      if (view.params.masterDetailBreakpoint > 0) {
        view.initMasterDetail();
      }

      view.router.init();
      view.$el.trigger('view:init');
      view.emit('local::init viewInit', view);
    }
  };

  return View;
}(_class.default); // Use Router


View.use(_router.default);
var _default = View;
exports.default = _default;