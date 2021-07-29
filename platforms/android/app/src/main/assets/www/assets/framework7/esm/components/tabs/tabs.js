import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
var Tab = {
  show: function show() {
    var app = this;
    var tabEl;
    var tabLinkEl;
    var animate;
    var tabRoute;
    var animatedInit;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 1 && args[0] && args[0].constructor === Object) {
      tabEl = args[0].tabEl;
      tabLinkEl = args[0].tabLinkEl;
      animate = args[0].animate;
      tabRoute = args[0].tabRoute;
      animatedInit = args[0].animatedInit;
    } else {
      tabEl = args[0];
      tabLinkEl = args[1];
      animate = args[2];
      tabRoute = args[3];

      if (typeof args[1] === 'boolean') {
        tabEl = args[0];
        animate = args[1];
        tabLinkEl = args[2];
        tabRoute = args[3];

        if (args.length > 2 && tabLinkEl.constructor === Object) {
          tabEl = args[0];
          animate = args[1];
          tabRoute = args[2];
          tabLinkEl = args[3];
        }
      }
    }

    if (typeof animate === 'undefined') animate = true;
    var $newTabEl = $(tabEl);

    if (tabRoute && $newTabEl[0]) {
      $newTabEl[0].f7TabRoute = tabRoute;
    }

    if (!animatedInit && ($newTabEl.length === 0 || $newTabEl.hasClass('tab-active'))) {
      return {
        $newTabEl: $newTabEl,
        newTabEl: $newTabEl[0]
      };
    }

    var $tabLinkEl;
    if (tabLinkEl) $tabLinkEl = $(tabLinkEl);
    var $tabsEl = $newTabEl.parent('.tabs');

    if ($tabsEl.length === 0) {
      return {
        $newTabEl: $newTabEl,
        newTabEl: $newTabEl[0]
      };
    } // Release swipeouts in hidden tabs


    if (app.swipeout) app.swipeout.allowOpen = true; // Animated tabs

    var tabsChangedCallbacks = [];

    function onTabsChanged(callback) {
      tabsChangedCallbacks.push(callback);
    }

    function tabsChanged() {
      tabsChangedCallbacks.forEach(function (callback) {
        callback();
      });
    }

    var animated = false;

    if ($tabsEl.parent().hasClass('tabs-animated-wrap')) {
      $tabsEl.parent()[animate ? 'removeClass' : 'addClass']('not-animated');
      var transitionDuration = parseFloat($tabsEl.css('transition-duration').replace(',', '.'));

      if (animate && transitionDuration) {
        $tabsEl.transitionEnd(tabsChanged);
        animated = true;
      }

      var tabsTranslate = (app.rtl ? $newTabEl.index() : -$newTabEl.index()) * 100;
      $tabsEl.transform("translate3d(" + tabsTranslate + "%,0,0)");
    } // Swipeable tabs


    var swiper;

    if ($tabsEl.parent().hasClass('tabs-swipeable-wrap') && app.swiper) {
      swiper = $tabsEl.parent()[0].swiper;

      if (swiper && swiper.activeIndex !== $newTabEl.index()) {
        animated = true;
        swiper.once('slideChangeTransitionEnd', function () {
          tabsChanged();
        }).slideTo($newTabEl.index(), animate ? undefined : 0);
      } else if (swiper && swiper.animating) {
        animated = true;
        swiper.once('slideChangeTransitionEnd', function () {
          tabsChanged();
        });
      }
    } // Remove active class from old tabs


    var $oldTabEl = $tabsEl.children('.tab-active');
    $oldTabEl.removeClass('tab-active');

    if (!animatedInit && (!swiper || swiper && !swiper.animating || swiper && tabRoute)) {
      if ($oldTabEl.hasClass('view') && $oldTabEl.children('.page').length) {
        $oldTabEl.children('.page').each(function (pageEl) {
          $(pageEl).trigger('page:tabhide');
          app.emit('pageTabHide', pageEl);
        });
      }

      $oldTabEl.trigger('tab:hide');
      app.emit('tabHide', $oldTabEl[0]);
    } // Trigger 'show' event on new tab


    $newTabEl.addClass('tab-active');

    if (!animatedInit && (!swiper || swiper && !swiper.animating || swiper && tabRoute)) {
      if ($newTabEl.hasClass('view') && $newTabEl.children('.page').length) {
        $newTabEl.children('.page').each(function (pageEl) {
          $(pageEl).trigger('page:tabshow');
          app.emit('pageTabShow', pageEl);
        });
      }

      $newTabEl.trigger('tab:show');
      app.emit('tabShow', $newTabEl[0]);
    } // Find related link for new tab


    if (!$tabLinkEl) {
      // Search by id
      if (typeof tabEl === 'string') $tabLinkEl = $(".tab-link[href=\"" + tabEl + "\"]");else $tabLinkEl = $(".tab-link[href=\"#" + $newTabEl.attr('id') + "\"]"); // Search by data-tab

      if (!$tabLinkEl || $tabLinkEl && $tabLinkEl.length === 0) {
        $('[data-tab]').each(function (el) {
          if ($newTabEl.is($(el).attr('data-tab'))) $tabLinkEl = $(el);
        });
      }

      if (tabRoute && (!$tabLinkEl || $tabLinkEl && $tabLinkEl.length === 0)) {
        $tabLinkEl = $("[data-route-tab-id=\"" + tabRoute.route.tab.id + "\"]");

        if ($tabLinkEl.length === 0) {
          $tabLinkEl = $(".tab-link[href=\"" + tabRoute.url + "\"]");
        }
      }

      if ($tabLinkEl.length > 1 && $newTabEl.parents('.page').length) {
        // eslint-disable-next-line
        $tabLinkEl = $tabLinkEl.filter(function (tabLinkElement) {
          return $(tabLinkElement).parents('.page')[0] === $newTabEl.parents('.page')[0];
        });

        if (app.theme === 'ios' && $tabLinkEl.length === 0 && tabRoute) {
          var $pageEl = $newTabEl.parents('.page');
          var $navbarEl = $(app.navbar.getElByPage($pageEl));
          $tabLinkEl = $navbarEl.find("[data-route-tab-id=\"" + tabRoute.route.tab.id + "\"]");

          if ($tabLinkEl.length === 0) {
            $tabLinkEl = $navbarEl.find(".tab-link[href=\"" + tabRoute.url + "\"]");
          }
        }
      }
    }

    if ($tabLinkEl.length > 0) {
      // Find related link for old tab
      var $oldTabLinkEl;

      if ($oldTabEl && $oldTabEl.length > 0) {
        // Search by id
        var oldTabId = $oldTabEl.attr('id');

        if (oldTabId) {
          $oldTabLinkEl = $(".tab-link[href=\"#" + oldTabId + "\"]"); // Search by data-route-tab-id

          if (!$oldTabLinkEl || $oldTabLinkEl && $oldTabLinkEl.length === 0) {
            $oldTabLinkEl = $(".tab-link[data-route-tab-id=\"" + oldTabId + "\"]");
          }
        } // Search by data-tab


        if (!$oldTabLinkEl || $oldTabLinkEl && $oldTabLinkEl.length === 0) {
          $('[data-tab]').each(function (tabLinkElement) {
            if ($oldTabEl.is($(tabLinkElement).attr('data-tab'))) $oldTabLinkEl = $(tabLinkElement);
          });
        }

        if (!$oldTabLinkEl || $oldTabLinkEl && $oldTabLinkEl.length === 0) {
          $oldTabLinkEl = $tabLinkEl.siblings('.tab-link-active');
        }
      } else if (tabRoute) {
        $oldTabLinkEl = $tabLinkEl.siblings('.tab-link-active');
      }

      if ($oldTabLinkEl && $oldTabLinkEl.length > 1 && $oldTabEl && $oldTabEl.parents('.page').length) {
        // eslint-disable-next-line
        $oldTabLinkEl = $oldTabLinkEl.filter(function (tabLinkElement) {
          return $(tabLinkElement).parents('.page')[0] === $oldTabEl.parents('.page')[0];
        });
      }

      if ($oldTabLinkEl && $oldTabLinkEl.length > 0) $oldTabLinkEl.removeClass('tab-link-active'); // Update links' classes

      if ($tabLinkEl && $tabLinkEl.length > 0) {
        $tabLinkEl.addClass('tab-link-active'); // Material Highlight

        if (app.theme !== 'ios' && app.toolbar) {
          var $tabbarEl = $tabLinkEl.parents('.tabbar, .tabbar-labels');

          if ($tabbarEl.length > 0) {
            app.toolbar.setHighlight($tabbarEl);
          }
        }
      }
    }

    return {
      $newTabEl: $newTabEl,
      newTabEl: $newTabEl[0],
      $oldTabEl: $oldTabEl,
      oldTabEl: $oldTabEl[0],
      onTabsChanged: onTabsChanged,
      animated: animated
    };
  }
};
export default {
  name: 'tabs',
  create: function create() {
    var app = this;
    extend(app, {
      tab: {
        show: Tab.show.bind(app)
      }
    });
  },
  on: {
    'pageInit tabMounted': function onInit(pageOrTabEl) {
      var $el = $(pageOrTabEl.el || pageOrTabEl);
      var animatedTabEl = $el.find('.tabs-animated-wrap > .tabs > .tab-active')[0];
      if (!animatedTabEl) return;
      var app = this;
      app.tab.show({
        tabEl: animatedTabEl,
        animatedInit: true,
        animate: false
      });
    }
  },
  clicks: {
    '.tab-link': function tabLinkClick($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      if ($clickedEl.attr('href') && $clickedEl.attr('href').indexOf('#') === 0 || $clickedEl.attr('data-tab')) {
        var app = this;
        app.tab.show({
          tabEl: data.tab || $clickedEl.attr('href'),
          tabLinkEl: $clickedEl,
          animate: data.animate
        });
      }
    }
  }
};