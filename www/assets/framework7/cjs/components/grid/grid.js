"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getElMinSize(dimension, $el) {
  var minSize = $el.css("min-" + dimension);

  if (minSize === 'auto' || minSize === 'none') {
    minSize = 0;
  } else if (minSize.indexOf('px') >= 0) {
    minSize = parseFloat(minSize);
  } else if (minSize.indexOf('%') >= 0) {
    minSize = $el.parent()[0][dimension === 'height' ? 'offsetHeight' : 'offsetWidth'] * parseFloat(minSize) / 100;
  }

  return minSize;
}

function getElMaxSize(dimension, $el) {
  var maxSize = $el.css("max-" + dimension);

  if (maxSize === 'auto' || maxSize === 'none') {
    maxSize = null;
  } else if (maxSize.indexOf('px') >= 0) {
    maxSize = parseFloat(maxSize);
  } else if (maxSize.indexOf('%') >= 0) {
    maxSize = $el.parent()[0][dimension === 'height' ? 'offsetHeight' : 'offsetWidth'] * parseFloat(maxSize) / 100;
  }

  return maxSize;
}

var Grid = {
  init: function init() {
    var app = this;
    var isTouched;
    var isMoved;
    var touchStartX;
    var touchStartY;
    var $resizeHandlerEl;
    var $prevResizableEl;
    var $nextResizableEl;
    var prevElSize;
    var prevElMinSize;
    var prevElMaxSize;
    var nextElSize;
    var nextElMinSize;
    var nextElMaxSize;
    var parentSize;
    var itemsInFlow;
    var gapSize;
    var isScrolling;

    function handleTouchStart(e) {
      if (isTouched || isMoved) return;
      $resizeHandlerEl = (0, _dom.default)(e.target).closest('.resize-handler');
      touchStartX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchStartY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      isTouched = true;
      $prevResizableEl = undefined;
      $nextResizableEl = undefined;
      isScrolling = undefined;
    }

    function handleTouchMove(e) {
      if (!isTouched) return;
      var isRow = $resizeHandlerEl.parent('.row').length === 1;
      var sizeProp = isRow ? 'height' : 'width';
      var getSizeProp = isRow ? 'offsetHeight' : 'offsetWidth';

      if (!isMoved) {
        $prevResizableEl = $resizeHandlerEl.parent(isRow ? '.row' : '.col');

        if ($prevResizableEl.length && (!$prevResizableEl.hasClass('resizable') || $prevResizableEl.hasClass('resizable-fixed'))) {
          $prevResizableEl = $prevResizableEl.prevAll('.resizable:not(.resizable-fixed)').eq(0);
        }

        $nextResizableEl = $prevResizableEl.next(isRow ? '.row' : '.col');

        if ($nextResizableEl.length && (!$nextResizableEl.hasClass('resizable') || $nextResizableEl.hasClass('resizable-fixed'))) {
          $nextResizableEl = $nextResizableEl.nextAll('.resizable:not(.resizable-fixed)').eq(0);
        }

        if ($prevResizableEl.length) {
          prevElSize = $prevResizableEl[0][getSizeProp];
          prevElMinSize = getElMinSize(sizeProp, $prevResizableEl);
          prevElMaxSize = getElMaxSize(sizeProp, $prevResizableEl);
          parentSize = $prevResizableEl.parent()[0][getSizeProp];
          itemsInFlow = $prevResizableEl.parent().children(isRow ? '.row' : '[class*="col-"], .col').length;
          gapSize = parseFloat($prevResizableEl.css(isRow ? '--f7-grid-row-gap' : '--f7-grid-gap'));
        }

        if ($nextResizableEl.length) {
          nextElSize = $nextResizableEl[0][getSizeProp];
          nextElMinSize = getElMinSize(sizeProp, $nextResizableEl);
          nextElMaxSize = getElMaxSize(sizeProp, $nextResizableEl);

          if (!$prevResizableEl.length) {
            parentSize = $nextResizableEl.parent()[0][getSizeProp];
            itemsInFlow = $nextResizableEl.parent().children(isRow ? '.row' : '[class*="col-"], .col').length;
            gapSize = parseFloat($nextResizableEl.css(isRow ? '--f7-grid-row-gap' : '--f7-grid-gap'));
          }
        }
      }

      isMoved = true;
      var touchCurrentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
      var touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

      if (typeof isScrolling === 'undefined' && !isRow) {
        isScrolling = !!(isScrolling || Math.abs(touchCurrentY - touchStartY) > Math.abs(touchCurrentX - touchStartX));
      }

      if (isScrolling) {
        isTouched = false;
        isMoved = false;
        return;
      }

      var isAbsolute = $prevResizableEl.hasClass('resizable-absolute') || $nextResizableEl.hasClass('resizable-absolute');
      var resizeNextEl = !isRow || isRow && !isAbsolute;

      if (resizeNextEl && !$nextResizableEl.length || !$prevResizableEl.length) {
        isTouched = false;
        isMoved = false;
        return;
      }

      e.preventDefault();
      var diff = isRow ? touchCurrentY - touchStartY : touchCurrentX - touchStartX;
      var prevElNewSize;
      var nextElNewSize;

      if ($prevResizableEl.length) {
        prevElNewSize = prevElSize + diff;

        if (prevElNewSize < prevElMinSize) {
          prevElNewSize = prevElMinSize;
          diff = prevElNewSize - prevElSize;
        }

        if (prevElMaxSize && prevElNewSize > prevElMaxSize) {
          prevElNewSize = prevElMaxSize;
          diff = prevElNewSize - prevElSize;
        }
      }

      if ($nextResizableEl.length && resizeNextEl) {
        nextElNewSize = nextElSize - diff;

        if (nextElNewSize < nextElMinSize) {
          nextElNewSize = nextElMinSize;
          diff = nextElSize - nextElNewSize;
          prevElNewSize = prevElSize + diff;
        }

        if (nextElMaxSize && nextElNewSize > nextElMaxSize) {
          nextElNewSize = nextElMaxSize;
          diff = nextElSize - nextElNewSize;
          prevElNewSize = prevElSize + diff;
        }
      }

      if (isAbsolute) {
        $prevResizableEl[0].style[sizeProp] = prevElNewSize + "px";

        if (resizeNextEl) {
          $nextResizableEl[0].style[sizeProp] = nextElNewSize + "px";
        }

        $prevResizableEl.trigger('grid:resize');
        $nextResizableEl.trigger('grid:resize');
        app.emit('gridResize', $prevResizableEl[0]);
        app.emit('gridResize', $nextResizableEl[0]);
        return;
      }

      var gapAddSize = (itemsInFlow - 1) * gapSize / itemsInFlow;
      var gapAddSizeCSS = isRow ? itemsInFlow - 1 + " * var(--f7-grid-row-gap) / " + itemsInFlow : '(var(--f7-cols-per-row) - 1) * var(--f7-grid-gap) / var(--f7-cols-per-row)';
      var prevElNewSizeNormalized = prevElNewSize + gapAddSize;
      var nextElNewSizeNormalized = nextElNewSize + gapAddSize;
      $prevResizableEl[0].style[sizeProp] = "calc(" + prevElNewSizeNormalized / parentSize * 100 + "% - " + gapAddSizeCSS + ")";
      $nextResizableEl[0].style[sizeProp] = "calc(" + nextElNewSizeNormalized / parentSize * 100 + "% - " + gapAddSizeCSS + ")";
      $prevResizableEl.trigger('grid:resize');
      $nextResizableEl.trigger('grid:resize');
      app.emit('gridResize', $prevResizableEl[0]);
      app.emit('gridResize', $nextResizableEl[0]);
    }

    function handleTouchEnd() {
      if (!isTouched) return;

      if (!isMoved) {
        isTouched = false;
      }

      isTouched = false;
      isMoved = false;
    }

    var document = (0, _ssrWindow.getDocument)();
    (0, _dom.default)(document).on(app.touchEvents.start, '.col > .resize-handler, .row > .resize-handler', handleTouchStart);
    app.on('touchmove', handleTouchMove);
    app.on('touchend', handleTouchEnd);
  }
};
var _default = {
  name: 'grid',
  create: function create() {
    var app = this;
    (0, _utils.extend)(app, {
      grid: {
        init: Grid.init.bind(app)
      }
    });
  },
  on: {
    init: function init() {
      var app = this;
      app.grid.init();
    }
  }
};
exports.default = _default;