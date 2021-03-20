"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InfiniteScroll = {
  handle: function handle(el, e) {
    var app = this;
    var $el = (0, _dom.default)(el);
    var scrollTop = $el[0].scrollTop;
    var scrollHeight = $el[0].scrollHeight;
    var height = $el[0].offsetHeight;
    var distance = $el[0].getAttribute('data-infinite-distance');
    var virtualListContainer = $el.find('.virtual-list');
    var virtualList;
    var onTop = $el.hasClass('infinite-scroll-top');
    if (!distance) distance = 50;

    if (typeof distance === 'string' && distance.indexOf('%') >= 0) {
      distance = parseInt(distance, 10) / 100 * height;
    }

    if (distance > height) distance = height;

    if (onTop) {
      if (scrollTop < distance) {
        $el.trigger('infinite', e);
        app.emit('infinite', $el[0], e);
      }
    } else if (scrollTop + height >= scrollHeight - distance) {
      if (virtualListContainer.length > 0) {
        virtualList = virtualListContainer.eq(-1)[0].f7VirtualList;

        if (virtualList && !virtualList.reachEnd && !virtualList.params.updatableScroll) {
          return;
        }
      }

      $el.trigger('infinite', e);
      app.emit('infinite', $el[0], e);
    }
  },
  create: function create(el) {
    var $el = (0, _dom.default)(el);
    var app = this;

    function scrollHandler(e) {
      app.infiniteScroll.handle(this, e);
    }

    $el.each(function (element) {
      element.f7InfiniteScrollHandler = scrollHandler;
      element.addEventListener('scroll', element.f7InfiniteScrollHandler);
    });
  },
  destroy: function destroy(el) {
    var $el = (0, _dom.default)(el);
    $el.each(function (element) {
      element.removeEventListener('scroll', element.f7InfiniteScrollHandler);
      delete element.f7InfiniteScrollHandler;
    });
  }
};
var _default = {
  name: 'infiniteScroll',
  create: function create() {
    var app = this;
    (0, _utils.bindMethods)(app, {
      infiniteScroll: InfiniteScroll
    });
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      var $tabEl = (0, _dom.default)(tabEl);
      var $isEls = $tabEl.find('.infinite-scroll-content');
      if ($tabEl.is('.infinite-scroll-content')) $isEls.add($tabEl);
      $isEls.each(function (el) {
        app.infiniteScroll.create(el);
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var $tabEl = (0, _dom.default)(tabEl);
      var app = this;
      var $isEls = $tabEl.find('.infinite-scroll-content');
      if ($tabEl.is('.infinite-scroll-content')) $isEls.add($tabEl);
      $isEls.each(function (el) {
        app.infiniteScroll.destroy(el);
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.infinite-scroll-content').each(function (el) {
        app.infiniteScroll.create(el);
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;
      page.$el.find('.infinite-scroll-content').each(function (el) {
        app.infiniteScroll.destroy(el);
      });
    }
  }
};
exports.default = _default;