"use strict";

exports.__esModule = true;
exports.default = void 0;

var _bundle = _interopRequireDefault(require("swiper/bundle"));

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }




function initSwiper(swiperEl) {
  var app = this;
  var $swiperEl = (0, _dom.default)(swiperEl);
  if ($swiperEl.length === 0) return;
  if ($swiperEl[0].swiper) return;
  var initialSlide;
  var params = {};
  var isTabs;
  var isRoutableTabs;

  if ($swiperEl.hasClass('tabs-swipeable-wrap')) {
    $swiperEl.addClass('swiper-container').children('.tabs').addClass('swiper-wrapper').children('.tab').addClass('swiper-slide');
    initialSlide = $swiperEl.children('.tabs').children('.tab-active').index();
    isTabs = true;
    isRoutableTabs = $swiperEl.find('.tabs-routable').length > 0;
  }

  if ($swiperEl.attr('data-swiper')) {
    params = JSON.parse($swiperEl.attr('data-swiper'));
  } else if ($swiperEl[0].f7SwiperParams) {
    params = $swiperEl[0].f7SwiperParams;
  } else {
    params = $swiperEl.dataset();
    Object.keys(params).forEach(function (key) {
      var value = params[key];

      if (typeof value === 'string' && value.indexOf('{') === 0 && value.indexOf('}') > 0) {
        try {
          params[key] = JSON.parse(value);
        } catch (e) {// not JSON
        }
      }
    });
  }

  if (typeof params.initialSlide === 'undefined' && typeof initialSlide !== 'undefined') {
    params.initialSlide = initialSlide;
  }

  var swiper = app.swiper.create($swiperEl[0], params);

  function updateSwiper() {
    swiper.update();
  }

  var $tabEl = $swiperEl.parents('.tab').filter(function (tabEl) {
    return (0, _dom.default)(tabEl).parent('.tabs').parent('.tabs-animated-wrap, .tabs-swipeable-wrap').length === 0;
  }).eq(0);
  $swiperEl.parents('.popup, .login-screen, .sheet-modal, .popover').on('modal:open', updateSwiper);
  $swiperEl.parents('.panel').on('panel:open', updateSwiper);

  if ($tabEl && $tabEl.length) {
    $tabEl.on('tab:show', updateSwiper);
  }

  swiper.on('beforeDestroy', function () {
    $swiperEl.parents('.popup, .login-screen, .sheet-modal, .popover').off('modal:open', updateSwiper);
    $swiperEl.parents('.panel').off('panel:open', updateSwiper);

    if ($tabEl && $tabEl.length) {
      $tabEl.off('tab:show', updateSwiper);
    }
  });

  if (isTabs) {
    swiper.on('slideChange', function () {
      if (isRoutableTabs) {
        var view = app.views.get($swiperEl.parents('.view'));
        if (!view) view = app.views.main;
        var router = view.router;
        var tabRoute = router.findTabRoute(swiper.slides.eq(swiper.activeIndex)[0]);

        if (tabRoute) {
          setTimeout(function () {
            router.navigate(tabRoute.path);
          }, 0);
        }
      } else {
        app.tab.show({
          tabEl: swiper.slides.eq(swiper.activeIndex)
        });
      }
    });
  }
}

var _default = {
  name: 'swiper',
  static: {
    Swiper: _bundle.default
  },
  create: function create() {
    var app = this;
    app.swiper = (0, _constructorMethods.default)({
      defaultSelector: '.swiper-container',
      constructor: _bundle.default,
      domProp: 'swiper'
    });
  },
  on: {
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;
      page.$el.find('.swiper-init, .tabs-swipeable-wrap').each(function (swiperEl) {
        app.swiper.destroy(swiperEl);
      });
    },
    pageMounted: function pageMounted(page) {
      var app = this;
      page.$el.find('.tabs-swipeable-wrap').each(function (swiperEl) {
        initSwiper.call(app, swiperEl);
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.swiper-init, .tabs-swipeable-wrap').each(function (swiperEl) {
        initSwiper.call(app, swiperEl);
      });
    },
    pageReinit: function pageReinit(page) {
      var app = this;
      page.$el.find('.swiper-init, .tabs-swipeable-wrap').each(function (swiperEl) {
        var swiper = app.swiper.get(swiperEl);
        if (swiper && swiper.update) swiper.update();
      });
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.swiper-init, .tabs-swipeable-wrap').each(function (swiperEl) {
        initSwiper.call(app, swiperEl);
      });
    },
    tabShow: function tabShow(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.swiper-init, .tabs-swipeable-wrap').each(function (swiperEl) {
        var swiper = app.swiper.get(swiperEl);
        if (swiper && swiper.update) swiper.update();
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.swiper-init, .tabs-swipeable-wrap').each(function (swiperEl) {
        app.swiper.destroy(swiperEl);
      });
    }
  },
  vnode: {
    'swiper-init': {
      insert: function insert(vnode) {
        var app = this;
        var swiperEl = vnode.elm;
        initSwiper.call(app, swiperEl);
      },
      destroy: function destroy(vnode) {
        var app = this;
        var swiperEl = vnode.elm;
        app.swiper.destroy(swiperEl);
      }
    },
    'tabs-swipeable-wrap': {
      insert: function insert(vnode) {
        var app = this;
        var swiperEl = vnode.elm;
        initSwiper.call(app, swiperEl);
      },
      destroy: function destroy(vnode) {
        var app = this;
        var swiperEl = vnode.elm;
        app.swiper.destroy(swiperEl);
      }
    }
  }
};
exports.default = _default;