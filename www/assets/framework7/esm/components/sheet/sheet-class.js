function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { getWindow, getDocument } from 'ssr-window';
import $ from '../../shared/dom7';
import { extend, now, getTranslate } from '../../shared/utils';
import { getSupport } from '../../shared/get-support';
import { getDevice } from '../../shared/get-device';
import Modal from '../modal/modal-class';

var Sheet = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(Sheet, _Modal);

  function Sheet(app, params) {
    var _this;

    var extendedParams = extend({
      on: {}
    }, app.params.sheet, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var sheet = _assertThisInitialized(_this);

    var window = getWindow();
    var document = getDocument();
    var support = getSupport();
    var device = getDevice();
    sheet.params = extendedParams;

    if (typeof sheet.params.backdrop === 'undefined') {
      sheet.params.backdrop = app.theme !== 'ios';
    } // Find Element


    var $el;

    if (!sheet.params.el) {
      $el = $(sheet.params.content).filter(function (node) {
        return node.nodeType === 1;
      }).eq(0);
    } else {
      $el = $(sheet.params.el).eq(0);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el.length === 0) {
      return sheet.destroy() || _assertThisInitialized(_this);
    }

    var $backdropEl;

    if (sheet.params.backdrop && sheet.params.backdropEl) {
      $backdropEl = $(sheet.params.backdropEl);
    } else if (sheet.params.backdrop) {
      $backdropEl = sheet.$containerEl.children('.sheet-backdrop');

      if ($backdropEl.length === 0) {
        $backdropEl = $('<div class="sheet-backdrop"></div>');
        sheet.$containerEl.append($backdropEl);
      }
    }

    extend(sheet, {
      app: app,
      push: $el.hasClass('sheet-modal-push') || sheet.params.push,
      $el: $el,
      el: $el[0],
      $backdropEl: $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0],
      type: 'sheet',
      $htmlEl: $('html')
    });

    if (sheet.params.push) {
      $el.addClass('sheet-modal-push');
    }

    var $pageContentEl;

    function scrollToElementOnOpen() {
      var $scrollEl = $(sheet.params.scrollToEl).eq(0);
      if ($scrollEl.length === 0) return;
      $pageContentEl = $scrollEl.parents('.page-content');
      if ($pageContentEl.length === 0) return;
      var paddingTop = parseInt($pageContentEl.css('padding-top'), 10);
      var paddingBottom = parseInt($pageContentEl.css('padding-bottom'), 10);
      var pageHeight = $pageContentEl[0].offsetHeight - paddingTop - $el.height();
      var pageScrollHeight = $pageContentEl[0].scrollHeight - paddingTop - $el.height();
      var pageScroll = $pageContentEl.scrollTop();
      var newPaddingBottom;
      var scrollElTop = $scrollEl.offset().top - paddingTop + $scrollEl[0].offsetHeight;

      if (scrollElTop > pageHeight) {
        var scrollTop = pageScroll + scrollElTop - pageHeight;

        if (scrollTop + pageHeight > pageScrollHeight) {
          newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;

          if (pageHeight === pageScrollHeight) {
            newPaddingBottom = $el.height();
          }

          $pageContentEl.css({
            'padding-bottom': newPaddingBottom + "px"
          });
        }

        $pageContentEl.scrollTop(scrollTop, 300);
      }
    }

    function scrollToElementOnClose() {
      if ($pageContentEl && $pageContentEl.length > 0) {
        $pageContentEl.css({
          'padding-bottom': ''
        });
      }
    }

    function handleClick(e) {
      var target = e.target;
      var $target = $(target);
      var keyboardOpened = !device.desktop && device.cordova && (window.Keyboard && window.Keyboard.isVisible || window.cordova.plugins && window.cordova.plugins.Keyboard && window.cordova.plugins.Keyboard.isVisible);
      if (keyboardOpened) return;

      if ($target.closest(sheet.el).length === 0) {
        if (sheet.params.closeByBackdropClick && sheet.params.backdrop && sheet.backdropEl && sheet.backdropEl === target) {
          sheet.close();
        } else if (sheet.params.closeByOutsideClick) {
          sheet.close();
        }
      }
    }

    function onKeyDown(e) {
      var keyCode = e.keyCode;

      if (keyCode === 27 && sheet.params.closeOnEscape) {
        sheet.close();
      }
    }

    var pushOffset;

    function pushViewScale(offset) {
      return (app.height - offset * 2) / app.height;
    }

    var isTouched = false;
    var startTouch;
    var currentTouch;
    var isScrolling;
    var touchStartTime;
    var touchesDiff;
    var isMoved = false;
    var isTopSheetModal;
    var swipeStepTranslate;
    var startTranslate;
    var currentTranslate;
    var sheetElOffsetHeight;
    var minTranslate;
    var maxTranslate;
    var $pushViewEl;
    var pushBorderRadius;
    var sheetPageContentEl;
    var sheetPageContentScrollTop;
    var sheetPageContentScrollHeight;
    var sheetPageContentOffsetHeight;

    function handleTouchStart(e) {
      if (isTouched || !(sheet.params.swipeToClose || sheet.params.swipeToStep)) return;

      if (sheet.params.swipeHandler && $(e.target).closest(sheet.params.swipeHandler).length === 0) {
        return;
      }

      isTouched = true;
      isMoved = false;
      startTouch = {
        x: e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX,
        y: e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY
      };
      touchStartTime = now();
      isScrolling = undefined;
      isTopSheetModal = $el.hasClass('sheet-modal-top');

      if (!sheet.params.swipeHandler && e.type === 'touchstart') {
        sheetPageContentEl = $(e.target).closest('.page-content')[0];
      }
    }

    function handleTouchMove(e) {
      if (!isTouched) return;
      currentTouch = {
        x: e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX,
        y: e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY
      };

      if (typeof isScrolling === 'undefined') {
        isScrolling = !!(isScrolling || Math.abs(currentTouch.x - startTouch.x) > Math.abs(currentTouch.y - startTouch.y));
      }

      if (isScrolling) {
        isTouched = false;
        isMoved = false;
        return;
      }

      touchesDiff = startTouch.y - currentTouch.y;
      var direction = touchesDiff < 0 ? 'to-bottom' : 'to-top';

      if (!isMoved) {
        if (sheetPageContentEl && !$el.hasClass('modal-in-swipe-step')) {
          sheetPageContentScrollTop = sheetPageContentEl.scrollTop;
          sheetPageContentScrollHeight = sheetPageContentEl.scrollHeight;
          sheetPageContentOffsetHeight = sheetPageContentEl.offsetHeight;

          if (!(sheetPageContentScrollHeight === sheetPageContentOffsetHeight) && !(direction === 'to-bottom' && sheetPageContentScrollTop === 0) && !(direction === 'to-top' && sheetPageContentScrollTop === sheetPageContentScrollHeight - sheetPageContentOffsetHeight)) {
            $el.transform('');
            isTouched = false;
            isMoved = false;
            return;
          }
        }

        if (sheet.push && pushOffset) {
          $pushViewEl = app.$el.children('.view, .views');
        }

        sheetElOffsetHeight = $el[0].offsetHeight;
        startTranslate = getTranslate($el[0], 'y');

        if (isTopSheetModal) {
          minTranslate = sheet.params.swipeToClose ? -sheetElOffsetHeight : -swipeStepTranslate;
          maxTranslate = 0;
        } else {
          minTranslate = 0;
          maxTranslate = sheet.params.swipeToClose ? sheetElOffsetHeight : swipeStepTranslate;
        }

        isMoved = true;
      }

      currentTranslate = startTranslate - touchesDiff;
      currentTranslate = Math.min(Math.max(currentTranslate, minTranslate), maxTranslate);
      e.preventDefault();

      if (sheet.push && pushOffset) {
        var progress = (currentTranslate - startTranslate) / sheetElOffsetHeight;

        if (sheet.params.swipeToStep) {
          if (isTopSheetModal) {
            progress = currentTranslate / swipeStepTranslate;
          } else {
            progress = 1 - (swipeStepTranslate - currentTranslate) / swipeStepTranslate;
          }
        }

        progress = Math.abs(progress);
        progress = Math.min(Math.max(progress, 0), 1);
        var pushProgress = 1 - progress;
        var scale = 1 - (1 - pushViewScale(pushOffset)) * pushProgress;
        $pushViewEl.transition(0).forEach(function (el) {
          el.style.setProperty('transform', "translate3d(0,0,0) scale(" + scale + ")", 'important');
        });

        if (sheet.params.swipeToStep) {
          $pushViewEl.css('border-radius', pushBorderRadius * pushProgress + "px");
        }
      }

      $el.transition(0).transform("translate3d(0," + currentTranslate + "px,0)");

      if (sheet.params.swipeToStep) {
        var _progress;

        if (isTopSheetModal) {
          _progress = 1 - currentTranslate / swipeStepTranslate;
        } else {
          _progress = (swipeStepTranslate - currentTranslate) / swipeStepTranslate;
        }

        _progress = Math.min(Math.max(_progress, 0), 1);
        $el.trigger('sheet:stepprogress', _progress);
        sheet.emit('local::stepProgress sheetStepProgress', sheet, _progress);
      }
    }

    function handleTouchEnd() {
      isTouched = false;

      if (!isMoved) {
        return;
      }

      isMoved = false;
      $el.transform('').transition('');

      if (sheet.push && pushOffset) {
        $pushViewEl.transition('').transform('');
        $pushViewEl.css('border-radius', '');
      }

      var direction = touchesDiff < 0 ? 'to-bottom' : 'to-top';
      var diff = Math.abs(touchesDiff);
      if (diff === 0 || currentTranslate === startTranslate) return;
      var timeDiff = new Date().getTime() - touchStartTime;

      if (!sheet.params.swipeToStep) {
        if (direction !== (isTopSheetModal ? 'to-top' : 'to-bottom')) {
          return;
        }

        if (timeDiff < 300 && diff > 20 || timeDiff >= 300 && diff > sheetElOffsetHeight / 2) {
          sheet.close();
        }

        return;
      }

      var openDirection = isTopSheetModal ? 'to-bottom' : 'to-top';
      var closeDirection = isTopSheetModal ? 'to-top' : 'to-bottom';
      var absCurrentTranslate = Math.abs(currentTranslate);
      var absSwipeStepTranslate = Math.abs(swipeStepTranslate);

      if (timeDiff < 300 && diff > 10) {
        if (direction === openDirection && absCurrentTranslate < absSwipeStepTranslate) {
          // open step
          $el.removeClass('modal-in-swipe-step');
          $el.trigger('sheet:stepprogress', 1);
          sheet.emit('local::stepProgress sheetStepProgress', sheet, 1);
          $el.trigger('sheet:stepopen');
          sheet.emit('local::stepOpen sheetStepOpen', sheet);

          if (sheet.push && pushOffset) {
            sheet.$htmlEl[0].style.setProperty('--f7-sheet-push-scale', pushViewScale(pushOffset));
            $pushViewEl.css('border-radius', '');
          }
        }

        if (direction === closeDirection && absCurrentTranslate > absSwipeStepTranslate) {
          // close sheet
          if (sheet.params.swipeToClose) {
            sheet.close();
          } else {
            // close step
            $el.addClass('modal-in-swipe-step');
            $el.trigger('sheet:stepprogress', 0);
            sheet.emit('local::stepProgress sheetStepProgress', sheet, 0);
            $el.trigger('sheet:stepclose');
            sheet.emit('local::stepClose sheetStepClose', sheet);

            if (sheet.push && pushOffset) {
              sheet.$htmlEl[0].style.removeProperty('--f7-sheet-push-scale');
              $pushViewEl.css('border-radius', '0px');
            }
          }
        }

        if (direction === closeDirection && absCurrentTranslate <= absSwipeStepTranslate) {
          // close step
          $el.addClass('modal-in-swipe-step');
          $el.trigger('sheet:stepprogress', 0);
          sheet.emit('local::stepProgress sheetStepProgress', sheet, 0);
          $el.trigger('sheet:stepclose');
          sheet.emit('local::stepClose sheetStepClose', sheet);

          if (sheet.push && pushOffset) {
            sheet.$htmlEl[0].style.removeProperty('--f7-sheet-push-scale');
            $pushViewEl.css('border-radius', '0px');
          }
        }

        return;
      }

      if (timeDiff >= 300) {
        var stepOpened = !$el.hasClass('modal-in-swipe-step');

        if (!stepOpened) {
          if (absCurrentTranslate < absSwipeStepTranslate / 2) {
            // open step
            $el.removeClass('modal-in-swipe-step');
            $el.trigger('sheet:stepprogress', 1);
            sheet.emit('local::stepProgress sheetStepProgress', sheet, 1);
            $el.trigger('sheet:stepopen');
            sheet.emit('local::stepOpen sheetStepOpen', sheet);

            if (sheet.push && pushOffset) {
              sheet.$htmlEl[0].style.setProperty('--f7-sheet-push-scale', pushViewScale(pushOffset));
              $pushViewEl.css('border-radius', '');
            }
          } else if (absCurrentTranslate - absSwipeStepTranslate > (sheetElOffsetHeight - absSwipeStepTranslate) / 2) {
            // close sheet
            if (sheet.params.swipeToClose) sheet.close();
          }
        } else if (stepOpened) {
          if (absCurrentTranslate > absSwipeStepTranslate + (sheetElOffsetHeight - absSwipeStepTranslate) / 2) {
            // close sheet
            if (sheet.params.swipeToClose) sheet.close();
          } else if (absCurrentTranslate > absSwipeStepTranslate / 2) {
            // close step
            $el.addClass('modal-in-swipe-step');
            $el.trigger('sheet:stepprogress', 0);
            sheet.emit('local::stepProgress sheetStepProgress', sheet, 0);
            $el.trigger('sheet:stepclose');
            sheet.emit('local::stepClose sheetStepClose', sheet);

            if (sheet.push && pushOffset) {
              sheet.$htmlEl[0].style.removeProperty('--f7-sheet-push-scale');
              $pushViewEl.css('border-radius', '0px');
            }
          }
        }
      }
    }

    sheet.setSwipeStep = function setSwipeStep(byResize) {
      if (byResize === void 0) {
        byResize = true;
      }

      var $swipeStepEl = $el.find('.sheet-modal-swipe-step').eq(0);
      if (!$swipeStepEl.length) return;

      if ($el.hasClass('sheet-modal-top')) {
        swipeStepTranslate = -($swipeStepEl.offset().top - $el.offset().top + $swipeStepEl[0].offsetHeight);
      } else {
        swipeStepTranslate = $el[0].offsetHeight - ($swipeStepEl.offset().top - $el.offset().top + $swipeStepEl[0].offsetHeight);
      }

      $el[0].style.setProperty('--f7-sheet-swipe-step', swipeStepTranslate + "px");

      if (!byResize) {
        $el.addClass('modal-in-swipe-step');
      }
    };

    function onResize() {
      sheet.setSwipeStep(true);
    }

    var passive = support.passiveListener ? {
      passive: true
    } : false;

    if (sheet.params.swipeToClose || sheet.params.swipeToStep) {
      $el.on(app.touchEvents.start, handleTouchStart, passive);
      app.on('touchmove', handleTouchMove);
      app.on('touchend:passive', handleTouchEnd);
      sheet.once('sheetDestroy', function () {
        $el.off(app.touchEvents.start, handleTouchStart, passive);
        app.off('touchmove', handleTouchMove);
        app.off('touchend:passive', handleTouchEnd);
      });
    }

    sheet.on('open', function () {
      if (sheet.params.closeOnEscape) {
        $(document).on('keydown', onKeyDown);
      }

      $el.prevAll('.popup.modal-in').addClass('popup-behind');

      if (sheet.params.swipeToStep) {
        sheet.setSwipeStep(false);
        app.on('resize', onResize);
      }

      if (sheet.params.scrollToEl) {
        scrollToElementOnOpen();
      }

      if (sheet.push) {
        pushOffset = parseInt($el.css('--f7-sheet-push-offset'), 10);
        if (Number.isNaN(pushOffset)) pushOffset = 0;

        if (pushOffset) {
          $el.addClass('sheet-modal-push');
          sheet.$htmlEl.addClass('with-modal-sheet-push');

          if (!sheet.params.swipeToStep) {
            sheet.$htmlEl[0].style.setProperty('--f7-sheet-push-scale', pushViewScale(pushOffset));
          } else {
            $pushViewEl = app.$el.children('.view, .views');
            pushBorderRadius = parseFloat($el.css("border-" + (isTopSheetModal ? 'bottom' : 'top') + "-left-radius"));
            $pushViewEl.css('border-radius', '0px');
          }
        }
      }
    });
    sheet.on('opened', function () {
      if (sheet.params.closeByOutsideClick || sheet.params.closeByBackdropClick) {
        app.on('click', handleClick);
      }
    });
    sheet.on('close', function () {
      if (sheet.params.swipeToStep) {
        $el.removeClass('modal-in-swipe-step');
        app.off('resize', onResize);
      }

      if (sheet.params.closeOnEscape) {
        $(document).off('keydown', onKeyDown);
      }

      if (sheet.params.scrollToEl) {
        scrollToElementOnClose();
      }

      if (sheet.params.closeByOutsideClick || sheet.params.closeByBackdropClick) {
        app.off('click', handleClick);
      }

      $el.prevAll('.popup.modal-in').eq(0).removeClass('popup-behind');

      if (sheet.push && pushOffset) {
        sheet.$htmlEl.removeClass('with-modal-sheet-push');
        sheet.$htmlEl.addClass('with-modal-sheet-push-closing');
      }
    });
    sheet.on('closed', function () {
      if (sheet.push && pushOffset) {
        sheet.$htmlEl.removeClass('with-modal-sheet-push-closing');
        sheet.$htmlEl[0].style.removeProperty('--f7-sheet-push-scale');
      }
    });

    sheet.stepOpen = function stepOpen() {
      $el.removeClass('modal-in-swipe-step');

      if (sheet.push) {
        if (!pushOffset) {
          pushOffset = parseInt($el.css('--f7-sheet-push-offset'), 10);
          if (Number.isNaN(pushOffset)) pushOffset = 0;
        }

        if (pushOffset) {
          sheet.$htmlEl[0].style.setProperty('--f7-sheet-push-scale', pushViewScale(pushOffset));
        }
      }
    };

    sheet.stepClose = function stepClose() {
      $el.addClass('modal-in-swipe-step');

      if (sheet.push) {
        sheet.$htmlEl[0].style.removeProperty('--f7-sheet-push-scale');
      }
    };

    sheet.stepToggle = function stepToggle() {
      $el.toggleClass('modal-in-swipe-step');
    };

    $el[0].f7Modal = sheet;
    return sheet || _assertThisInitialized(_this);
  }

  return Sheet;
}(Modal);

export default Sheet;