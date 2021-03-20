import { getDocument } from 'ssr-window';
import $ from '../../shared/dom7';
import { bindMethods } from '../../shared/utils';
import { getSupport } from '../../shared/get-support';
var Sortable = {
  init: function init() {
    var app = this;
    var document = getDocument();
    var isTouched;
    var isMoved;
    var touchStartY;
    var touchesDiff;
    var $sortingEl;
    var $sortingItems;
    var $sortableContainer;
    var sortingElHeight;
    var minTop;
    var maxTop;
    var $insertAfterEl;
    var $insertBeforeEl;
    var indexFrom;
    var $pageEl;
    var $pageContentEl;
    var pageHeight;
    var pageOffset;
    var sortingElOffsetLocal;
    var sortingElOffsetTop;
    var initialScrollTop;
    var wasTapHold;

    function handleTouchStart(e, isTapHold) {
      isMoved = false;
      isTouched = true;
      wasTapHold = false;
      touchStartY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      $sortingEl = $(e.target).closest('li').eq(0);
      indexFrom = $sortingEl.index();
      $sortableContainer = $sortingEl.parents('.sortable');
      var $listGroup = $sortingEl.parents('.list-group');

      if ($listGroup.length && $listGroup.parents($sortableContainer).length) {
        $sortableContainer = $listGroup;
      }

      $sortingItems = $sortableContainer.children('ul').children('li:not(.disallow-sorting):not(.no-sorting)');
      if (app.panel) app.panel.allowOpen = false;
      if (app.swipeout) app.swipeout.allow = false;

      if (isTapHold) {
        $sortingEl.addClass('sorting');
        $sortableContainer.addClass('sortable-sorting');
        wasTapHold = true;
      }
    }

    function handleTouchMove(e) {
      if (!isTouched || !$sortingEl) return;
      var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

      if (!isMoved) {
        $pageEl = $sortingEl.parents('.page');
        $pageContentEl = $sortingEl.parents('.page-content');
        var paddingTop = parseInt($pageContentEl.css('padding-top'), 10);
        var paddingBottom = parseInt($pageContentEl.css('padding-bottom'), 10);
        initialScrollTop = $pageContentEl[0].scrollTop;
        pageOffset = $pageEl.offset().top + paddingTop;
        pageHeight = $pageEl.height() - paddingTop - paddingBottom;
        $sortingEl.addClass('sorting');
        $sortableContainer.addClass('sortable-sorting');
        sortingElOffsetLocal = $sortingEl[0].offsetTop;
        minTop = $sortingEl[0].offsetTop;
        maxTop = $sortingEl.parent().height() - sortingElOffsetLocal - $sortingEl.height();
        sortingElHeight = $sortingEl[0].offsetHeight;
        sortingElOffsetTop = $sortingEl.offset().top;
      }

      isMoved = true;
      e.preventDefault();
      e.f7PreventSwipePanel = true;
      touchesDiff = pageY - touchStartY;
      var translateScrollOffset = $pageContentEl[0].scrollTop - initialScrollTop;
      var translate = Math.min(Math.max(touchesDiff + translateScrollOffset, -minTop), maxTop);
      $sortingEl.transform("translate3d(0," + translate + "px,0)");
      var scrollAddition = 44;
      var allowScroll = true;

      if (touchesDiff + translateScrollOffset + scrollAddition < -minTop) {
        allowScroll = false;
      }

      if (touchesDiff + translateScrollOffset - scrollAddition > maxTop) {
        allowScroll = false;
      }

      $insertBeforeEl = undefined;
      $insertAfterEl = undefined;
      var scrollDiff;

      if (allowScroll) {
        if (sortingElOffsetTop + touchesDiff + sortingElHeight + scrollAddition > pageOffset + pageHeight) {
          // To Bottom
          scrollDiff = sortingElOffsetTop + touchesDiff + sortingElHeight + scrollAddition - (pageOffset + pageHeight);
        }

        if (sortingElOffsetTop + touchesDiff < pageOffset + scrollAddition) {
          // To Top
          scrollDiff = sortingElOffsetTop + touchesDiff - pageOffset - scrollAddition;
        }

        if (scrollDiff) {
          $pageContentEl[0].scrollTop += scrollDiff;
        }
      }

      $sortingItems.each(function (el) {
        var $currentEl = $(el);
        if ($currentEl[0] === $sortingEl[0]) return;
        var currentElOffset = $currentEl[0].offsetTop;
        var currentElHeight = $currentEl.height();
        var sortingElOffset = sortingElOffsetLocal + translate;

        if (sortingElOffset >= currentElOffset - currentElHeight / 2 && $sortingEl.index() < $currentEl.index()) {
          $currentEl.transform("translate3d(0, " + -sortingElHeight + "px,0)");
          $insertAfterEl = $currentEl;
          $insertBeforeEl = undefined;
        } else if (sortingElOffset <= currentElOffset + currentElHeight / 2 && $sortingEl.index() > $currentEl.index()) {
          $currentEl.transform("translate3d(0, " + sortingElHeight + "px,0)");
          $insertAfterEl = undefined;
          if (!$insertBeforeEl) $insertBeforeEl = $currentEl;
        } else {
          $currentEl.transform('translate3d(0, 0%,0)');
        }
      });
    }

    function handleTouchEnd() {
      if (!isTouched || !isMoved) {
        if (isTouched && !isMoved) {
          if (app.panel) app.panel.allowOpen = true;
          if (app.swipeout) app.swipeout.allow = true;

          if (wasTapHold) {
            $sortingEl.removeClass('sorting');
            $sortableContainer.removeClass('sortable-sorting');
          }
        }

        isTouched = false;
        isMoved = false;
        return;
      }

      if (app.panel) app.panel.allowOpen = true;
      if (app.swipeout) app.swipeout.allow = true;
      $sortingItems.transform('');
      $sortingEl.removeClass('sorting');
      $sortableContainer.removeClass('sortable-sorting');
      var indexTo;
      if ($insertAfterEl) indexTo = $insertAfterEl.index();else if ($insertBeforeEl) indexTo = $insertBeforeEl.index();
      var moveElements = $sortableContainer.dataset().sortableMoveElements;

      if (typeof moveElements === 'undefined') {
        moveElements = app.params.sortable.moveElements;
      }

      if (moveElements) {
        if ($insertAfterEl) {
          $sortingEl.insertAfter($insertAfterEl);
        }

        if ($insertBeforeEl) {
          $sortingEl.insertBefore($insertBeforeEl);
        }
      }

      if (($insertAfterEl || $insertBeforeEl) && $sortableContainer.hasClass('virtual-list')) {
        indexFrom = $sortingEl[0].f7VirtualListIndex;
        if (typeof indexFrom === 'undefined') indexFrom = $sortingEl.attr('data-virtual-list-index');

        if ($insertBeforeEl) {
          indexTo = $insertBeforeEl[0].f7VirtualListIndex;
          if (typeof indexTo === 'undefined') indexTo = $insertBeforeEl.attr('data-virtual-list-index');
        } else {
          indexTo = $insertAfterEl[0].f7VirtualListIndex;
          if (typeof indexTo === 'undefined') indexTo = $insertAfterEl.attr('data-virtual-list-index');
        }

        if (indexTo !== null) indexTo = parseInt(indexTo, 10);else indexTo = undefined;
        var virtualList = $sortableContainer[0].f7VirtualList;
        if (indexFrom) indexFrom = parseInt(indexFrom, 10);
        if (indexTo) indexTo = parseInt(indexTo, 10);
        if (virtualList) virtualList.moveItem(indexFrom, indexTo);
      }

      if (typeof indexTo !== 'undefined' && !Number.isNaN(indexTo) && indexTo !== indexFrom) {
        $sortingEl.trigger('sortable:sort', {
          from: indexFrom,
          to: indexTo
        });
        app.emit('sortableSort', $sortingEl[0], {
          from: indexFrom,
          to: indexTo,
          el: $sortingEl[0]
        }, $sortableContainer[0]);
      }

      $insertBeforeEl = undefined;
      $insertAfterEl = undefined;
      isTouched = false;
      isMoved = false;
    }

    var activeListener = getSupport().passiveListener ? {
      passive: false,
      capture: false
    } : false;
    $(document).on(app.touchEvents.start, '.list.sortable .sortable-handler', handleTouchStart, activeListener);
    app.on('touchmove:active', handleTouchMove);
    app.on('touchend:passive', handleTouchEnd);
    $(document).on('taphold', '.sortable-tap-hold', function (e, pointerEvent) {
      handleTouchStart(pointerEvent, true);
    });
  },
  enable: function enable(el) {
    if (el === void 0) {
      el = '.list.sortable';
    }

    var app = this;
    var $el = $(el);
    if ($el.length === 0) return;
    $el.addClass('sortable-enabled');
    $el.trigger('sortable:enable');
    app.emit('sortableEnable', $el[0]);
  },
  disable: function disable(el) {
    if (el === void 0) {
      el = '.list.sortable';
    }

    var app = this;
    var $el = $(el);
    if ($el.length === 0) return;
    $el.removeClass('sortable-enabled');
    $el.trigger('sortable:disable');
    app.emit('sortableDisable', $el[0]);
  },
  toggle: function toggle(el) {
    if (el === void 0) {
      el = '.list.sortable';
    }

    var app = this;
    var $el = $(el);
    if ($el.length === 0) return;

    if ($el.hasClass('sortable-enabled')) {
      app.sortable.disable($el);
    } else {
      app.sortable.enable($el);
    }
  }
};
export default {
  name: 'sortable',
  params: {
    sortable: {
      moveElements: true
    }
  },
  create: function create() {
    var app = this;
    bindMethods(app, {
      sortable: Sortable
    });
  },
  on: {
    init: function init() {
      var app = this;
      if (!app.params.sortable) return;
      app.sortable.init();
    }
  },
  clicks: {
    '.sortable-enable': function enable($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.sortable.enable(data.sortable);
    },
    '.sortable-disable': function disable($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.sortable.disable(data.sortable);
    },
    '.sortable-toggle': function toggle($clickedEl, data) {
      if (data === void 0) {
        data = {};
      }

      var app = this;
      app.sortable.toggle(data.sortable);
    }
  }
};