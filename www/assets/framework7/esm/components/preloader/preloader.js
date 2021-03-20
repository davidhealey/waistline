import $ from '../../shared/dom7';
import { bindMethods, iosPreloaderContent, mdPreloaderContent, auroraPreloaderContent } from '../../shared/utils';
var Preloader = {
  init: function init(el) {
    var app = this;
    var preloaders = {
      iosPreloaderContent: iosPreloaderContent,
      mdPreloaderContent: mdPreloaderContent,
      auroraPreloaderContent: auroraPreloaderContent
    };
    var $el = $(el);
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
      iosPreloaderContent: iosPreloaderContent,
      mdPreloaderContent: mdPreloaderContent,
      auroraPreloaderContent: auroraPreloaderContent
    };
    var preloaderInner = preloaders[app.theme + "PreloaderContent"] || '';
    $('html').addClass('with-modal-preloader'); // prettier-ignore

    app.$el.append("\n      <div class=\"preloader-backdrop\"></div>\n      <div class=\"preloader-modal\">\n        <div class=\"preloader color-" + color + "\">" + preloaderInner + "</div>\n      </div>\n    ");
    Preloader.visible = true;
  },
  showIn: function showIn(el, color) {
    if (color === void 0) {
      color = 'white';
    }

    var app = this;
    var preloaders = {
      iosPreloaderContent: iosPreloaderContent,
      mdPreloaderContent: mdPreloaderContent,
      auroraPreloaderContent: auroraPreloaderContent
    };
    var preloaderInner = preloaders[app.theme + "PreloaderContent"] || '';
    $(el || 'html').addClass('with-modal-preloader'); // prettier-ignore

    $(el || app.$el).append("\n      <div class=\"preloader-backdrop\"></div>\n      <div class=\"preloader-modal\">\n        <div class=\"preloader color-" + color + "\">" + preloaderInner + "</div>\n      </div>\n    ");
  },
  hide: function hide() {
    var app = this;
    if (!Preloader.visible) return;
    $('html').removeClass('with-modal-preloader');
    app.$el.find('.preloader-backdrop, .preloader-modal').remove();
    Preloader.visible = false;
  },
  hideIn: function hideIn(el) {
    var app = this;
    $(el || 'html').removeClass('with-modal-preloader');
    $(el || app.$el).find('.preloader-backdrop, .preloader-modal').remove();
  }
};
export default {
  name: 'preloader',
  create: function create() {
    var app = this;
    bindMethods(app, {
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
      $(tabEl).find('.preloader').each(function (preloaderEl) {
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