"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _getDevice = require("../../shared/get-device");

var _modalClass = _interopRequireDefault(require("../modal/modal-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Popover = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(Popover, _Modal);

  function Popover(app, params) {
    var _this;

    var extendedParams = (0, _utils.extend)({
      on: {}
    }, app.params.popover, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var popover = _assertThisInitialized(_this);

    var device = (0, _getDevice.getDevice)();
    var window = (0, _ssrWindow.getWindow)();
    var document = (0, _ssrWindow.getDocument)();
    popover.params = extendedParams; // Find Element

    var $el;

    if (!popover.params.el) {
      $el = (0, _dom.default)(popover.params.content).filter(function (node) {
        return node.nodeType === 1;
      }).eq(0);
    } else {
      $el = (0, _dom.default)(popover.params.el).eq(0);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    } // Find Target


    var $targetEl = (0, _dom.default)(popover.params.targetEl).eq(0);

    if ($el.length === 0) {
      return popover.destroy() || _assertThisInitialized(_this);
    } // Backdrop


    var $backdropEl;

    if (popover.params.backdrop && popover.params.backdropEl) {
      $backdropEl = (0, _dom.default)(popover.params.backdropEl);
    } else if (popover.params.backdrop) {
      $backdropEl = popover.$containerEl.children('.popover-backdrop');

      if ($backdropEl.length === 0) {
        $backdropEl = (0, _dom.default)('<div class="popover-backdrop"></div>');
        popover.$containerEl.append($backdropEl);
      }
    } // Find Angle


    var $angleEl;

    if ($el.find('.popover-angle').length === 0) {
      $angleEl = (0, _dom.default)('<div class="popover-angle"></div>');
      $el.prepend($angleEl);
    } else {
      $angleEl = $el.find('.popover-angle');
    } // Open


    var originalOpen = popover.open;
    (0, _utils.extend)(popover, {
      app: app,
      $el: $el,
      el: $el[0],
      $targetEl: $targetEl,
      targetEl: $targetEl[0],
      $angleEl: $angleEl,
      angleEl: $angleEl[0],
      $backdropEl: $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0],
      type: 'popover',
      open: function open() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var targetEl = args[0],
            animate = args[1];

        if (typeof args[0] === 'boolean') {
          animate = args[0];
          targetEl = args[1];
        }

        if (targetEl) {
          popover.$targetEl = (0, _dom.default)(targetEl);
          popover.targetEl = popover.$targetEl[0];
        }

        return originalOpen.call(popover, animate);
      }
    });

    function handleResize() {
      popover.resize();
    }

    popover.on('popoverOpen', function () {
      popover.resize();
      app.on('resize', handleResize);
      (0, _dom.default)(window).on('keyboardDidShow keyboardDidHide', handleResize);
      popover.on('popoverClose popoverBeforeDestroy', function () {
        app.off('resize', handleResize);
        (0, _dom.default)(window).off('keyboardDidShow keyboardDidHide', handleResize);
      });
    });

    function handleClick(e) {
      var target = e.target;
      var $target = (0, _dom.default)(target);
      var keyboardOpened = !device.desktop && device.cordova && (window.Keyboard && window.Keyboard.isVisible || window.cordova.plugins && window.cordova.plugins.Keyboard && window.cordova.plugins.Keyboard.isVisible);
      if (keyboardOpened) return;

      if ($target.closest(popover.el).length === 0) {
        if (popover.params.closeByBackdropClick && popover.params.backdrop && popover.backdropEl && popover.backdropEl === target) {
          popover.close();
        } else if (popover.params.closeByOutsideClick) {
          popover.close();
        }
      }
    }

    function onKeyDown(e) {
      var keyCode = e.keyCode;

      if (keyCode === 27 && popover.params.closeOnEscape) {
        popover.close();
      }
    }

    if (popover.params.closeOnEscape) {
      popover.on('popoverOpen', function () {
        (0, _dom.default)(document).on('keydown', onKeyDown);
      });
      popover.on('popoverClose', function () {
        (0, _dom.default)(document).off('keydown', onKeyDown);
      });
    }

    popover.on('popoverOpened', function () {
      if (popover.params.closeByOutsideClick || popover.params.closeByBackdropClick) {
        app.on('click', handleClick);
      }
    });
    popover.on('popoverClose', function () {
      if (popover.params.closeByOutsideClick || popover.params.closeByBackdropClick) {
        app.off('click', handleClick);
      }
    });
    $el[0].f7Modal = popover;
    return popover || _assertThisInitialized(_this);
  }

  var _proto = Popover.prototype;

  _proto.resize = function resize() {
    var popover = this;
    var app = popover.app,
        $el = popover.$el,
        $targetEl = popover.$targetEl,
        $angleEl = popover.$angleEl;
    var _popover$params = popover.params,
        targetX = _popover$params.targetX,
        targetY = _popover$params.targetY;
    $el.css({
      left: '',
      top: ''
    });
    var _ref = [$el.width(), $el.height()],
        width = _ref[0],
        height = _ref[1];
    var angleSize = 0;
    var angleLeft;
    var angleTop;

    if (app.theme === 'ios' || app.theme === 'aurora') {
      $angleEl.removeClass('on-left on-right on-top on-bottom').css({
        left: '',
        top: ''
      });
      angleSize = $angleEl.width() / 2;
    } else {
      $el.removeClass('popover-on-left popover-on-right popover-on-top popover-on-bottom popover-on-middle').css({
        left: '',
        top: ''
      });
    }

    var targetWidth;
    var targetHeight;
    var targetOffsetLeft;
    var targetOffsetTop;
    var safeAreaTop = parseInt((0, _dom.default)('html').css('--f7-safe-area-top'), 10);
    var safeAreaLeft = parseInt((0, _dom.default)('html').css('--f7-safe-area-left'), 10);
    var safeAreaRight = parseInt((0, _dom.default)('html').css('--f7-safe-area-right'), 10);
    if (Number.isNaN(safeAreaTop)) safeAreaTop = 0;
    if (Number.isNaN(safeAreaLeft)) safeAreaLeft = 0;
    if (Number.isNaN(safeAreaRight)) safeAreaRight = 0;

    if ($targetEl && $targetEl.length > 0) {
      targetWidth = $targetEl.outerWidth();
      targetHeight = $targetEl.outerHeight();
      var targetOffset = $targetEl.offset();
      targetOffsetLeft = targetOffset.left - app.left;
      targetOffsetTop = targetOffset.top - app.top;
      var targetParentPage = $targetEl.parents('.page');

      if (targetParentPage.length > 0) {
        targetOffsetTop -= targetParentPage[0].scrollTop;
      }
    } else if (typeof targetX !== 'undefined' && targetY !== 'undefined') {
      targetOffsetLeft = targetX;
      targetOffsetTop = targetY;
      targetWidth = popover.params.targetWidth || 0;
      targetHeight = popover.params.targetHeight || 0;
    }

    var left = 0,
        top = 0,
        diff = 0; // Top Position

    var position = app.theme === 'md' ? 'bottom' : 'top';

    if (app.theme === 'md') {
      if (height < app.height - targetOffsetTop - targetHeight) {
        // On bottom
        position = 'bottom';
        top = targetOffsetTop + targetHeight;
      } else if (height < targetOffsetTop - safeAreaTop) {
        // On top
        top = targetOffsetTop - height;
        position = 'top';
      } else {
        // On middle
        position = 'middle';
        top = targetHeight / 2 + targetOffsetTop - height / 2;
      }

      top = Math.max(8, Math.min(top, app.height - height - 8)); // Horizontal Position

      var hPosition;

      if (targetOffsetLeft < app.width / 2) {
        hPosition = 'right';
        left = position === 'middle' ? targetOffsetLeft + targetWidth : targetOffsetLeft;
      } else {
        hPosition = 'left';
        left = position === 'middle' ? targetOffsetLeft - width : targetOffsetLeft + targetWidth - width;
      }

      left = Math.max(8, Math.min(left, app.width - width - 8 - safeAreaRight), safeAreaLeft);
      $el.addClass("popover-on-" + position + " popover-on-" + hPosition);
    } else {
      // ios and aurora
      if (height + angleSize < targetOffsetTop - safeAreaTop) {
        // On top
        top = targetOffsetTop - height - angleSize;
      } else if (height + angleSize < app.height - targetOffsetTop - targetHeight) {
        // On bottom
        position = 'bottom';
        top = targetOffsetTop + targetHeight + angleSize;
      } else {
        // On middle
        position = 'middle';
        top = targetHeight / 2 + targetOffsetTop - height / 2;
        diff = top;
        top = Math.max(5, Math.min(top, app.height - height - 5));
        diff -= top;
      } // Horizontal Position


      if (position === 'top' || position === 'bottom') {
        left = targetWidth / 2 + targetOffsetLeft - width / 2;
        diff = left;
        left = Math.max(5, Math.min(left, app.width - width - 5));

        if (safeAreaLeft) {
          left = Math.max(left, safeAreaLeft);
        }

        if (safeAreaRight && left + width > app.width - 5 - safeAreaRight) {
          left = app.width - 5 - safeAreaRight - width;
        }

        if (position === 'top') {
          $angleEl.addClass('on-bottom');
        }

        if (position === 'bottom') {
          $angleEl.addClass('on-top');
        }

        diff -= left;
        angleLeft = width / 2 - angleSize + diff;
        angleLeft = Math.max(Math.min(angleLeft, width - angleSize * 2 - 13), 13);
        $angleEl.css({
          left: angleLeft + "px"
        });
      } else if (position === 'middle') {
        left = targetOffsetLeft - width - angleSize;
        $angleEl.addClass('on-right');

        if (left < 5 || left + width + safeAreaRight > app.width || left < safeAreaLeft) {
          if (left < 5) left = targetOffsetLeft + targetWidth + angleSize;
          if (left + width + safeAreaRight > app.width) left = app.width - width - 5 - safeAreaRight;
          if (left < safeAreaLeft) left = safeAreaLeft;
          $angleEl.removeClass('on-right').addClass('on-left');
        }

        angleTop = height / 2 - angleSize + diff;
        angleTop = Math.max(Math.min(angleTop, height - angleSize * 2 - 13), 13);
        $angleEl.css({
          top: angleTop + "px"
        });
      }
    } // Apply Styles


    $el.css({
      top: top + "px",
      left: left + "px"
    });
  };

  return Popover;
}(_modalClass.default);

var _default = Popover;
exports.default = _default;