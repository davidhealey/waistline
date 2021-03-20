"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

var _getSupport = require("../../shared/get-support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var ListIndex = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(ListIndex, _Framework7Class);

  function ListIndex(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var index = _assertThisInitialized(_this);

    var defaults = {
      el: null,
      // where to render indexes
      listEl: null,
      // list el to generate indexes
      indexes: 'auto',
      // or array of indexes
      iosItemHeight: 14,
      mdItemHeight: 14,
      auroraItemHeight: 14,
      scrollList: true,
      label: false,
      // eslint-disable-next-line
      renderItem: function renderItem(itemContent, itemIndex) {
        return ("\n          <li>" + itemContent + "</li>\n        ").trim();
      },
      renderSkipPlaceholder: function renderSkipPlaceholder() {
        return '<li class="list-index-skip-placeholder"></li>';
      },
      on: {}
    }; // Extend defaults with modules params

    index.useModulesParams(defaults);
    index.params = (0, _utils.extend)(defaults, params);
    var $el;
    var $listEl;
    var $pageContentEl;
    var $ul;

    if (index.params.el) {
      $el = (0, _dom.default)(index.params.el);
    } else {
      return index || _assertThisInitialized(_this);
    }

    if ($el[0].f7ListIndex) {
      return $el[0].f7ListIndex || _assertThisInitialized(_this);
    }

    $ul = $el.find('ul');

    if ($ul.length === 0) {
      $ul = (0, _dom.default)('<ul></ul>');
      $el.append($ul);
    }

    if (index.params.listEl) {
      $listEl = (0, _dom.default)(index.params.listEl);
    }

    if (index.params.indexes === 'auto' && !$listEl) {
      return index || _assertThisInitialized(_this);
    }

    if ($listEl) {
      $pageContentEl = $listEl.parents('.page-content').eq(0);
    } else {
      $pageContentEl = $el.siblings('.page-content').eq(0);

      if ($pageContentEl.length === 0) {
        $pageContentEl = $el.parents('.page').eq(0).find('.page-content').eq(0);
      }
    }

    $el[0].f7ListIndex = index;
    (0, _utils.extend)(index, {
      app: app,
      $el: $el,
      el: $el && $el[0],
      $ul: $ul,
      ul: $ul && $ul[0],
      $listEl: $listEl,
      listEl: $listEl && $listEl[0],
      $pageContentEl: $pageContentEl,
      pageContentEl: $pageContentEl && $pageContentEl[0],
      indexes: params.indexes,
      height: 0,
      skipRate: 0
    }); // Install Modules

    index.useModules(); // Attach events

    function handleResize() {
      var height = {
        index: index
      };
      index.calcSize();

      if (height !== index.height) {
        index.render();
      }
    }

    function handleClick(e) {
      var $clickedLi = (0, _dom.default)(e.target).closest('li');
      if (!$clickedLi.length) return;
      var itemIndex = $clickedLi.index();

      if (index.skipRate > 0) {
        var percentage = itemIndex / ($clickedLi.siblings('li').length - 1);
        itemIndex = Math.round((index.indexes.length - 1) * percentage);
      }

      var itemContent = index.indexes[itemIndex];
      index.$el.trigger('listindex:click', {
        content: itemContent,
        index: itemIndex
      });
      index.emit('local::click listIndexClick', index, itemContent, itemIndex);
      index.$el.trigger('listindex:select', {
        content: itemContent,
        index: itemIndex
      });
      index.emit('local::select listIndexSelect', index, itemContent, itemIndex);

      if (index.$listEl && index.params.scrollList) {
        index.scrollListToIndex(itemContent, itemIndex);
      }
    }

    var touchesStart = {};
    var isTouched;
    var isMoved;
    var topPoint;
    var bottomPoint;
    var $labelEl;
    var previousIndex = null;

    function handleTouchStart(e) {
      var $children = $ul.children();
      if (!$children.length) return;
      topPoint = $children[0].getBoundingClientRect().top;
      bottomPoint = $children[$children.length - 1].getBoundingClientRect().top + $children[0].offsetHeight;
      touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      isTouched = true;
      isMoved = false;
      previousIndex = null;
    }

    function handleTouchMove(e) {
      if (!isTouched) return;

      if (!isMoved && index.params.label) {
        $labelEl = (0, _dom.default)('<span class="list-index-label"></span>');
        $el.append($labelEl);
      }

      isMoved = true;
      var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
      e.preventDefault();
      var percentage = (pageY - topPoint) / (bottomPoint - topPoint);
      percentage = Math.min(Math.max(percentage, 0), 1);
      var itemIndex = Math.round((index.indexes.length - 1) * percentage);
      var itemContent = index.indexes[itemIndex];
      var ulHeight = bottomPoint - topPoint;
      var bubbleBottom = (index.height - ulHeight) / 2 + (1 - percentage) * ulHeight;

      if (itemIndex !== previousIndex) {
        if (index.params.label) {
          $labelEl.html(itemContent).transform("translateY(-" + bubbleBottom + "px)");
        }

        if (index.$listEl && index.params.scrollList) {
          index.scrollListToIndex(itemContent, itemIndex);
        }
      }

      previousIndex = itemIndex;
      index.$el.trigger('listindex:select');
      index.emit('local::select listIndexSelect', index, itemContent, itemIndex);
    }

    function handleTouchEnd() {
      if (!isTouched) return;
      isTouched = false;
      isMoved = false;

      if (index.params.label) {
        if ($labelEl) $labelEl.remove();
        $labelEl = undefined;
      }
    }

    var passiveListener = (0, _getSupport.getSupport)().passiveListener ? {
      passive: true
    } : false;

    index.attachEvents = function attachEvents() {
      $el.parents('.tab').on('tab:show', handleResize);
      $el.parents('.page').on('page:reinit', handleResize);
      $el.parents('.panel').on('panel:open', handleResize);
      $el.parents('.sheet-modal, .actions-modal, .popup, .popover, .login-screen, .dialog, .toast').on('modal:open', handleResize);
      app.on('resize', handleResize);
      $el.on('click', handleClick);
      $el.on(app.touchEvents.start, handleTouchStart, passiveListener);
      app.on('touchmove:active', handleTouchMove);
      app.on('touchend:passive', handleTouchEnd);
    };

    index.detachEvents = function attachEvents() {
      $el.parents('.tab').off('tab:show', handleResize);
      $el.parents('.page').off('page:reinit', handleResize);
      $el.parents('.panel').off('panel:open', handleResize);
      $el.parents('.sheet-modal, .actions-modal, .popup, .popover, .login-screen, .dialog, .toast').off('modal:open', handleResize);
      app.off('resize', handleResize);
      $el.off('click', handleClick);
      $el.off(app.touchEvents.start, handleTouchStart, passiveListener);
      app.off('touchmove:active', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);
    }; // Init


    index.init();
    return index || _assertThisInitialized(_this);
  } // eslint-disable-next-line


  var _proto = ListIndex.prototype;

  _proto.scrollListToIndex = function scrollListToIndex(itemContent, itemIndex) {
    var index = this;
    var $listEl = index.$listEl,
        $pageContentEl = index.$pageContentEl,
        app = index.app;
    if (!$listEl || !$pageContentEl || $pageContentEl.length === 0) return index;
    var $scrollToEl;
    $listEl.find('.list-group-title, .item-divider').each(function (el) {
      if ($scrollToEl) return;
      var $el = (0, _dom.default)(el);

      if ($el.text() === itemContent) {
        $scrollToEl = $el;
      }
    });
    if (!$scrollToEl || $scrollToEl.length === 0) return index;
    var parentTop = $scrollToEl.parent().offset().top;
    var paddingTop = parseInt($pageContentEl.css('padding-top'), 10);
    var scrollTop = $pageContentEl[0].scrollTop;
    var scrollToElTop = $scrollToEl.offset().top;

    if ($pageContentEl.parents('.page-with-navbar-large').length) {
      var navbarInnerEl = app.navbar.getElByPage($pageContentEl.parents('.page-with-navbar-large').eq(0));
      var $titleLargeEl = (0, _dom.default)(navbarInnerEl).find('.title-large');

      if ($titleLargeEl.length) {
        paddingTop -= $titleLargeEl[0].offsetHeight || 0;
      }
    }

    if (parentTop <= paddingTop) {
      $pageContentEl.scrollTop(parentTop + scrollTop - paddingTop);
    } else {
      $pageContentEl.scrollTop(scrollToElTop + scrollTop - paddingTop);
    }

    return index;
  };

  _proto.renderSkipPlaceholder = function renderSkipPlaceholder() {
    var index = this;
    return index.params.renderSkipPlaceholder.call(index);
  };

  _proto.renderItem = function renderItem(itemContent, itemIndex) {
    var index = this;
    return index.params.renderItem.call(index, itemContent, itemIndex);
  };

  _proto.render = function render() {
    var index = this;
    var $ul = index.$ul,
        indexes = index.indexes,
        skipRate = index.skipRate;
    var wasSkipped;
    var html = indexes.map(function (itemContent, itemIndex) {
      if (itemIndex % skipRate !== 0 && skipRate > 0) {
        wasSkipped = true;
        return '';
      }

      var itemHtml = index.renderItem(itemContent, itemIndex);

      if (wasSkipped) {
        itemHtml = index.renderSkipPlaceholder() + itemHtml;
      }

      wasSkipped = false;
      return itemHtml;
    }).join('');
    $ul.html(html);
    return index;
  };

  _proto.calcSize = function calcSize() {
    var index = this;
    var app = index.app,
        params = index.params,
        el = index.el,
        indexes = index.indexes;
    var height = el.offsetHeight;
    var itemHeight = params[app.theme + "ItemHeight"];
    var maxItems = Math.floor(height / itemHeight);
    var items = indexes.length;
    var skipRate = 0;

    if (items > maxItems) {
      skipRate = Math.ceil((items * 2 - 1) / maxItems);
    }

    index.height = height;
    index.skipRate = skipRate;
    return index;
  };

  _proto.calcIndexes = function calcIndexes() {
    var index = this;

    if (index.params.indexes === 'auto') {
      index.indexes = [];
      index.$listEl.find('.list-group-title, .item-divider').each(function (el) {
        var elContent = (0, _dom.default)(el).text();

        if (index.indexes.indexOf(elContent) < 0) {
          index.indexes.push(elContent);
        }
      });
    } else {
      index.indexes = index.params.indexes;
    }

    return index;
  };

  _proto.update = function update() {
    var index = this;
    index.calcIndexes();
    index.calcSize();
    index.render();
    return index;
  };

  _proto.init = function init() {
    var index = this;
    index.calcIndexes();
    index.calcSize();
    index.render();
    index.attachEvents();
  };

  _proto.destroy = function destroy() {
    var index = this;
    index.$el.trigger('listindex:beforedestroy', index);
    index.emit('local::beforeDestroy listIndexBeforeDestroy');
    index.detachEvents();

    if (index.$el[0]) {
      index.$el[0].f7ListIndex = null;
      delete index.$el[0].f7ListIndex;
    }

    (0, _utils.deleteProps)(index);
    index = null;
  };

  return ListIndex;
}(_class.default);

var _default = ListIndex;
exports.default = _default;