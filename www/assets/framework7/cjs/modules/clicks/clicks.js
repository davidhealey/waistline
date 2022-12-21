"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _viewClass = _interopRequireDefault(require("../../components/view/view-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initClicks(app) {
  function handleClicks(e) {
    var window = (0, _ssrWindow.getWindow)();
    var $clickedEl = (0, _dom.default)(e.target);
    var $clickedLinkEl = $clickedEl.closest('a');
    var isLink = $clickedLinkEl.length > 0;
    var url = isLink && $clickedLinkEl.attr('href'); // Check if link is external

    if (isLink) {
      if ($clickedLinkEl.is(app.params.clicks.externalLinks) || // eslint-disable-next-line
      url && url.indexOf('javascript:') >= 0) {
        var target = $clickedLinkEl.attr('target');

        if (url && window.cordova && window.cordova.InAppBrowser && (target === '_system' || target === '_blank')) {
          e.preventDefault();
          window.cordova.InAppBrowser.open(url, target);
        } else if (url && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser && (target === '_system' || target === '_blank')) {
          e.preventDefault();
          window.Capacitor.Plugins.Browser.open({
            url: url
          });
        }

        return;
      }
    } // Modules Clicks


    Object.keys(app.modules).forEach(function (moduleName) {
      var moduleClicks = app.modules[moduleName].clicks;
      if (!moduleClicks) return;
      if (e.preventF7Router) return;
      Object.keys(moduleClicks).forEach(function (clickSelector) {
        var matchingClickedElement = $clickedEl.closest(clickSelector).eq(0);

        if (matchingClickedElement.length > 0) {
          moduleClicks[clickSelector].call(app, matchingClickedElement, matchingClickedElement.dataset(), e);
        }
      });
    }); // Load Page

    var clickedLinkData = {};

    if (isLink) {
      e.preventDefault();
      clickedLinkData = $clickedLinkEl.dataset();
    }

    clickedLinkData.clickedEl = $clickedLinkEl[0]; // Prevent Router

    if (e.preventF7Router) return;
    if ($clickedLinkEl.hasClass('prevent-router') || $clickedLinkEl.hasClass('router-prevent')) return;
    var validUrl = url && url.length > 0 && url[0] !== '#';

    if (validUrl || $clickedLinkEl.hasClass('back')) {
      var view;

      if (clickedLinkData.view && clickedLinkData.view === 'current') {
        view = app.views.current;
      } else if (clickedLinkData.view) {
        view = (0, _dom.default)(clickedLinkData.view)[0].f7View;
      } else {
        view = $clickedEl.parents('.view')[0] && $clickedEl.parents('.view')[0].f7View;

        if (!$clickedLinkEl.hasClass('back') && view && view.params.linksView) {
          if (typeof view.params.linksView === 'string') view = (0, _dom.default)(view.params.linksView)[0].f7View;else if (view.params.linksView instanceof _viewClass.default) view = view.params.linksView;
        }
      }

      if (!view) {
        if (app.views.main) view = app.views.main;
      }

      if (!view || !view.router) return;

      if ($clickedLinkEl[0].f7RouteProps) {
        clickedLinkData.props = $clickedLinkEl[0].f7RouteProps;
      }

      if ($clickedLinkEl.hasClass('back')) view.router.back(url, clickedLinkData);else view.router.navigate(url, clickedLinkData);
    }
  }

  app.on('click', handleClicks);
}

var _default = {
  name: 'clicks',
  params: {
    clicks: {
      // External Links
      externalLinks: '.external'
    }
  },
  on: {
    init: function init() {
      var app = this;
      initClicks(app);
    }
  }
};
exports.default = _default;