import $ from '../../shared/dom7';
import { bindMethods } from '../../shared/utils';
var Progressbar = {
  set: function set() {
    var app = this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var el = args[0],
        progress = args[1],
        duration = args[2];

    if (typeof args[0] === 'number') {
      progress = args[0];
      duration = args[1];
      el = app.$el;
    }

    if (typeof progress === 'undefined' || progress === null) return el;
    if (!progress) progress = 0;
    var $el = $(el || app.$el);

    if ($el.length === 0) {
      return el;
    }

    var progressNormalized = Math.min(Math.max(progress, 0), 100);
    var $progressbarEl;
    if ($el.hasClass('progressbar')) $progressbarEl = $el.eq(0);else {
      $progressbarEl = $el.children('.progressbar');
    }

    if ($progressbarEl.length === 0 || $progressbarEl.hasClass('progressbar-infinite')) {
      return $progressbarEl;
    }

    var $progressbarLine = $progressbarEl.children('span');

    if ($progressbarLine.length === 0) {
      $progressbarLine = $('<span></span>');
      $progressbarEl.append($progressbarLine);
    }

    $progressbarLine.transition(typeof duration !== 'undefined' ? duration : '').transform("translate3d(" + (-100 + progressNormalized) + "%,0,0)");
    return $progressbarEl[0];
  },
  show: function show() {
    var app = this; // '.page', 50, 'multi'

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var el = args[0],
        progress = args[1],
        color = args[2];
    var type = 'determined';

    if (args.length === 2) {
      if ((typeof args[0] === 'string' || typeof args[0] === 'object') && typeof args[1] === 'string') {
        // '.page', 'multi'
        el = args[0];
        color = args[1];
        progress = args[2];
        type = 'infinite';
      } else if (typeof args[0] === 'number' && typeof args[1] === 'string') {
        // 50, 'multi'
        progress = args[0];
        color = args[1];
        el = app.$el;
      }
    } else if (args.length === 1) {
      if (typeof args[0] === 'number') {
        el = app.$el;
        progress = args[0];
      } else if (typeof args[0] === 'string') {
        type = 'infinite';
        el = app.$el;
        color = args[0];
      }
    } else if (args.length === 0) {
      type = 'infinite';
      el = app.$el;
    }

    var $el = $(el);
    if ($el.length === 0) return undefined;
    var $progressbarEl;

    if ($el.hasClass('progressbar') || $el.hasClass('progressbar-infinite')) {
      $progressbarEl = $el;
    } else {
      $progressbarEl = $el.children('.progressbar:not(.progressbar-out), .progressbar-infinite:not(.progressbar-out)');

      if ($progressbarEl.length === 0) {
        $progressbarEl = $("\n          <span class=\"progressbar" + (type === 'infinite' ? '-infinite' : '') + (color ? " color-" + color : '') + " progressbar-in\">\n            " + (type === 'infinite' ? '' : '<span></span>') + "\n          </span>");
        $el.append($progressbarEl);
      }
    }

    if (typeof progress !== 'undefined') {
      app.progressbar.set($progressbarEl, progress);
    }

    return $progressbarEl[0];
  },
  hide: function hide(el, removeAfterHide) {
    if (removeAfterHide === void 0) {
      removeAfterHide = true;
    }

    var app = this;
    var $el = $(el || app.$el);
    if ($el.length === 0) return undefined;
    var $progressbarEl;

    if ($el.hasClass('progressbar') || $el.hasClass('progressbar-infinite')) {
      $progressbarEl = $el;
    } else {
      $progressbarEl = $el.children('.progressbar, .progressbar-infinite');
    }

    if ($progressbarEl.length === 0 || !$progressbarEl.hasClass('progressbar-in') || $progressbarEl.hasClass('progressbar-out')) {
      return $progressbarEl;
    }

    $progressbarEl.removeClass('progressbar-in').addClass('progressbar-out').animationEnd(function () {
      if (removeAfterHide) {
        $progressbarEl.remove();
      }
    });
    return $progressbarEl;
  }
};
export default {
  name: 'progressbar',
  create: function create() {
    var app = this;
    bindMethods(app, {
      progressbar: Progressbar
    });
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.progressbar').each(function (progressbarEl) {
        var $progressbarEl = $(progressbarEl);
        app.progressbar.set($progressbarEl, $progressbarEl.attr('data-progress'));
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.progressbar').each(function (progressbarEl) {
        var $progressbarEl = $(progressbarEl);
        app.progressbar.set($progressbarEl, $progressbarEl.attr('data-progress'));
      });
    }
  },
  vnode: {
    progressbar: {
      insert: function insert(vnode) {
        var app = this;
        var el = vnode.elm;
        app.progressbar.set(el, el.getAttribute('data-progress'));
      },
      update: function update(vnode) {
        var app = this;
        var el = vnode.elm;
        app.progressbar.set(el, el.getAttribute('data-progress'));
      }
    }
  }
};