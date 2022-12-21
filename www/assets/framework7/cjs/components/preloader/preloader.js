"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Preloader = {
  init: function init(el) {
    var app = this;
    var preloaders = {
      iosPreloaderContent: _utils.iosPreloaderContent,
      mdPreloaderContent: _utils.mdPreloaderContent,
      auroraPreloaderContent: _utils.auroraPreloaderContent
    };
    var $el = (0, _dom.default)(el);
    if ($el.length === 0 || $el.children('.preloader-inner').length > 0 || $el.children('.preloader-inner-line').length > 0) return;
    $el.append(preloaders[app.theme + "PreloaderContent"]);
  },
  // Modal
  visible: false,
  show: function show(color) {
    if (color === void 0) {
      color = 'white';
    }

    var app = this;
    if (Preloader.visible) return;
    var preloaders = {
      iosPreloaderContent: _utils.iosPreloaderContent,
      mdPreloaderContent: _utils.mdPreloaderContent,
      auroraPreloaderContent: _utils.auroraPreloaderContent
    };
    var preloaderInner = preloaders[app.theme + "PreloaderContent"] || '';
    (0, _dom.default)('html').addClass('with-modal-preloader'); // prettier-ignore

    app.$el.append("\n      <div class=\"preloader-backdrop\"></div>\n      <div class=\"preloader-modal\">\n        <div class=\"preloader color-" + color + "\">" + preloaderInner + "</div>\n      </div>\n    ");
    Preloader.visible = true;
  },
  showIn: function showIn(el, color) {
    if (color === void 0) {
      color = 'white';
    }

    var app = this;
    var preloaders = {
      iosPreloaderContent: _utils.iosPreloaderContent,
      mdPreloaderContent: _utils.mdPreloaderContent,
      auroraPreloaderContent: _utils.auroraPreloaderContent
    };
    var preloaderInner = preloaders[app.theme + "PreloaderContent"] || '';
    (0, _dom.default)(el || 'html').addClass('with-modal-preloader'); // prettier-ignore

    (0, _dom.default)(el || app.$el).append("\n      <div class=\"preloader-backdrop\"></div>\n      <div class=\"preloader-modal\">\n        <div class=\"preloader color-" + color + "\">" + preloaderInner + "</div>\n      </div>\n    ");
  },
  hide: function hide() {
    var app = this;
    if (!Preloader.visible) return;
    (0, _dom.default)('html').removeClass('with-modal-preloader');
    app.$el.find('.preloader-backdrop, .preloader-modal').remove();
    Preloader.visible = false;
  },
  hideIn: function hideIn(el) {
    var app = this;
    (0, _dom.default)(el || 'html').removeClass('with-modal-preloader');
    (0, _dom.default)(el || app.$el).find('.preloader-backdrop, .preloader-modal').remove();
  }
};
var _default = {
  name: 'preloader',
  create: function create() {
    var app = this;
    (0, _utils.bindMethods)(app, {
      preloader: Preloader
    });
  },
  on: {
    photoBrowserOpen: function photoBrowserOpen(pb) {
      var app = this;
      pb.$el.find('.preloader').each(function (preloaderEl) {
        app.preloader.init(preloaderEl);
      });
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.preloader').each(function (preloaderEl) {
        app.preloader.init(preloaderEl);
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.preloader').each(function (preloaderEl) {
        app.preloader.init(preloaderEl);
      });
    }
  },
  vnode: {
    preloader: {
      insert: function insert(vnode) {
        var app = this;
        var preloaderEl = vnode.elm;
        app.preloader.init(preloaderEl);
      }
    }
  }
};
exports.default = _default;