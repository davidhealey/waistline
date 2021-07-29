"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Toolbar = {
  setHighlight: function setHighlight(tabbarEl) {
    var app = this;
    if (app.theme === 'ios') return;
    var $tabbarEl = (0, _dom.default)(tabbarEl);
    if ($tabbarEl.length === 0 || !($tabbarEl.hasClass('tabbar') || $tabbarEl.hasClass('tabbar-labels'))) return;
    var $highlightEl = $tabbarEl.find('.tab-link-highlight');
    var tabLinksCount = $tabbarEl.find('.tab-link').length;

    if (tabLinksCount === 0) {
      $highlightEl.remove();
      return;
    }

    if ($highlightEl.length === 0) {
      $tabbarEl.children('.toolbar-inner').append('<span class="tab-link-highlight"></span>');
      $highlightEl = $tabbarEl.find('.tab-link-highlight');
    } else if ($highlightEl.next().length) {
      $tabbarEl.children('.toolbar-inner').append($highlightEl);
    }

    var $activeLink = $tabbarEl.find('.tab-link-active');
    var highlightWidth;
    var highlightTranslate;

    if ($tabbarEl.hasClass('tabbar-scrollable') && $activeLink && $activeLink[0]) {
      highlightWidth = $activeLink[0].offsetWidth + "px";
      highlightTranslate = $activeLink[0].offsetLeft + "px";
    } else {
      var activeIndex = $activeLink.index();
      highlightWidth = 100 / tabLinksCount + "%";
      highlightTranslate = (app.rtl ? -activeIndex : activeIndex) * 100 + "%";
    }

    (0, _utils.nextFrame)(function () {
      $highlightEl.css('width', highlightWidth).transform("translate3d(" + highlightTranslate + ",0,0)");
    });
  },
  init: function init(tabbarEl) {
    var app = this;
    app.toolbar.setHighlight(tabbarEl);
  },
  hide: function hide(el, animate) {
    if (animate === void 0) {
      animate = true;
    }

    var app = this;
    var $el = (0, _dom.default)(el);
    if ($el.hasClass('toolbar-hidden')) return;
    var className = "toolbar-hidden" + (animate ? ' toolbar-transitioning' : '');
    $el.transitionEnd(function () {
      $el.removeClass('toolbar-transitioning');
    });
    $el.addClass(className);
    $el.trigger('toolbar:hide');
    app.emit('toolbarHide', $el[0]);
  },
  show: function show(el, animate) {
    if (animate === void 0) {
      animate = true;
    }

    var app = this;
    var $el = (0, _dom.default)(el);
    if (!$el.hasClass('toolbar-hidden')) return;

    if (animate) {
      $el.addClass('toolbar-transitioning');
      $el.transitionEnd(function () {
        $el.removeClass('toolbar-transitioning');
      });
    }

    $el.removeClass('toolbar-hidden');
    $el.trigger('toolbar:show');
    app.emit('toolbarShow', $el[0]);
  },
  initToolbarOnScroll: function initToolbarOnScroll(pageEl) {
    var app = this;
    var $pageEl = (0, _dom.default)(pageEl);
    var $toolbarEl = $pageEl.parents('.view').children('.toolbar');

    if ($toolbarEl.length === 0) {
      $toolbarEl = $pageEl.find('.toolbar');
    }

    if ($toolbarEl.length === 0) {
      $toolbarEl = $pageEl.parents('.views').children('.tabbar, .tabbar-labels');
    }

    if ($toolbarEl.length === 0) {
      return;
    }

    var previousScrollTop;
    var currentScrollTop;
    var scrollHeight;
    var offsetHeight;
    var reachEnd;
    var action;
    var toolbarHidden;

    function handleScroll(e) {
      if ($pageEl.hasClass('page-with-card-opened')) return;
      if ($pageEl.hasClass('page-previous')) return;
      var scrollContent = this;

      if (e && e.target && e.target !== scrollContent) {
        return;
      }

      currentScrollTop = scrollContent.scrollTop;
      scrollHeight = scrollContent.scrollHeight;
      offsetHeight = scrollContent.offsetHeight;
      reachEnd = currentScrollTop + offsetHeight >= scrollHeight;
      toolbarHidden = $toolbarEl.hasClass('toolbar-hidden');

      if (reachEnd) {
        if (app.params.toolbar.showOnPageScrollEnd) {
          action = 'show';
        }
      } else if (previousScrollTop > currentScrollTop) {
        if (app.params.toolbar.showOnPageScrollTop || currentScrollTop <= 44) {
          action = 'show';
        } else {
          action = 'hide';
        }
      } else if (currentScrollTop > 44) {
        action = 'hide';
      } else {
        action = 'show';
      }

      if (action === 'show' && toolbarHidden) {
        app.toolbar.show($toolbarEl);
        toolbarHidden = false;
      } else if (action === 'hide' && !toolbarHidden) {
        app.toolbar.hide($toolbarEl);
        toolbarHidden = true;
      }

      previousScrollTop = currentScrollTop;
    }

    $pageEl.on('scroll', '.page-content', handleScroll, true);
    $pageEl[0].f7ScrollToolbarHandler = handleScroll;
  }
};
var _default = {
  name: 'toolbar',
  create: function create() {
    var app = this;
    (0, _utils.bindMethods)(app, {
      toolbar: Toolbar
    });
  },
  params: {
    toolbar: {
      hideOnPageScroll: false,
      showOnPageScrollEnd: true,
      showOnPageScrollTop: true
    }
  },
  on: {
    pageBeforeRemove: function pageBeforeRemove(page) {
      if (page.$el[0].f7ScrollToolbarHandler) {
        page.$el.off('scroll', '.page-content', page.$el[0].f7ScrollToolbarHandler, true);
      }
    },
    pageBeforeIn: function pageBeforeIn(page) {
      var app = this;
      var $toolbarEl = page.$el.parents('.view').children('.toolbar');

      if ($toolbarEl.length === 0) {
        $toolbarEl = page.$el.parents('.views').children('.tabbar, .tabbar-labels');
      }

      if ($toolbarEl.length === 0) {
        $toolbarEl = page.$el.find('.toolbar');
      }

      if ($toolbarEl.length === 0) {
        return;
      }

      if (page.$el.hasClass('no-toolbar')) {
        app.toolbar.hide($toolbarEl);
      } else {
        app.toolbar.show($toolbarEl);
      }
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.tabbar, .tabbar-labels').each(function (tabbarEl) {
        app.toolbar.init(tabbarEl);
      });

      if (app.params.toolbar.hideOnPageScroll || page.$el.find('.hide-toolbar-on-scroll').length || page.$el.hasClass('hide-toolbar-on-scroll') || page.$el.find('.hide-bars-on-scroll').length || page.$el.hasClass('hide-bars-on-scroll')) {
        if (page.$el.find('.keep-toolbar-on-scroll').length || page.$el.hasClass('keep-toolbar-on-scroll') || page.$el.find('.keep-bars-on-scroll').length || page.$el.hasClass('keep-bars-on-scroll')) {
          return;
        }

        app.toolbar.initToolbarOnScroll(page.el);
      }
    },
    init: function init() {
      var app = this;
      app.$el.find('.tabbar, .tabbar-labels').each(function (tabbarEl) {
        app.toolbar.init(tabbarEl);
      });
    }
  },
  vnode: {
    tabbar: {
      insert: function insert(vnode) {
        var app = this;
        app.toolbar.init(vnode.elm);
      }
    }
  }
};
exports.default = _default;