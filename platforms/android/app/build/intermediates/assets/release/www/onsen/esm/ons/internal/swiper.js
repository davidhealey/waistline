import _Promise from 'babel-runtime/core-js/promise';
import _Map from 'babel-runtime/core-js/map';
import _setImmediate from 'babel-runtime/core-js/set-immediate';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import util from '../util';
import platform from '../platform';
import animit from '../animit';
import GestureDetector from '../gesture-detector';

var directionMap = {
  vertical: {
    axis: 'Y',
    size: 'Height',
    dir: ['up', 'down'],
    t3d: ['0px, ', 'px, 0px']
  },
  horizontal: {
    axis: 'X',
    size: 'Width',
    dir: ['left', 'right'],
    t3d: ['', 'px, 0px, 0px']
  }
};

var Swiper = function () {
  function Swiper(params) {
    var _this = this;

    _classCallCheck(this, Swiper);

    // Parameters
    var FALSE = function FALSE() {
      return false;
    };
    'getInitialIndex getBubbleWidth isVertical isOverScrollable isCentered\n    isAutoScrollable refreshHook preChangeHook postChangeHook overScrollHook'.split(/\s+/).forEach(function (key) {
      return _this[key] = params[key] || FALSE;
    });

    this.getElement = params.getElement; // Required
    this.scrollHook = params.scrollHook; // Optional
    this.itemSize = params.itemSize || '100%';

    this.getAutoScrollRatio = function () {
      var ratio = params.getAutoScrollRatio && params.getAutoScrollRatio.apply(params, arguments);
      ratio = typeof ratio === 'number' && ratio === ratio ? ratio : .5;
      if (ratio < 0.0 || ratio > 1.0) {
        util.throw('Invalid auto-scroll-ratio ' + ratio + '. Must be between 0 and 1');
      }
      return ratio;
    };

    // Prevent clicks only on desktop
    this.shouldBlock = util.globals.actualMobileOS === 'other';

    // Bind handlers
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onResize = this.onResize.bind(this);

    this._shouldFixScroll = util.globals.actualMobileOS === 'ios';
  }

  _createClass(Swiper, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          swipeable = _ref.swipeable,
          autoRefresh = _ref.autoRefresh;

      this.initialized = true;
      this.target = this.getElement().children[0];
      this.blocker = this.getElement().children[1];
      if (!this.target || !this.blocker) {
        util.throw('Expected "target" and "blocker" elements to exist before initializing Swiper');
      }

      if (!this.shouldBlock) {
        this.blocker.style.display = 'none';
      }

      // Add classes
      this.getElement().classList.add('ons-swiper');
      this.target.classList.add('ons-swiper-target');
      this.blocker.classList.add('ons-swiper-blocker');

      // Setup listeners
      this._gestureDetector = new GestureDetector(this.getElement(), { dragMinDistance: 1, dragLockToAxis: true, passive: !this._shouldFixScroll });
      this._mutationObserver = new MutationObserver(function () {
        return _this2.refresh();
      });
      this.updateSwipeable(swipeable);
      this.updateAutoRefresh(autoRefresh);

      // Setup initial layout
      this._scroll = this._offset = this._lastActiveIndex = 0;
      this._updateLayout();
      this._setupInitialIndex();
      _setImmediate(function () {
        return _this2.initialized && _this2._setupInitialIndex();
      });

      // Fix rendering glitch on Android 4.1
      // Fix for iframes where the width is inconsistent at the beginning
      if (window !== window.parent || this.offsetHeight === 0) {
        window.requestAnimationFrame(function () {
          return _this2.initialized && _this2.onResize();
        });
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.initialized = false;
      this.updateSwipeable(false);
      this.updateAutoRefresh(false);

      this._gestureDetector && this._gestureDetector.dispose();
      this.target = this.blocker = this._gestureDetector = this._mutationObserver = null;

      this.setupResize(false);
    }
  }, {
    key: 'onResize',
    value: function onResize() {
      var i = this._scroll / this.targetSize;
      this._reset();
      this.setActiveIndex(i);
      this.refresh();
    }
  }, {
    key: '_calculateItemSize',
    value: function _calculateItemSize() {
      var matches = this.itemSize.match(/^(\d+)(px|%)/);

      if (!matches) {
        util.throw('Invalid state: swiper\'s size unit must be \'%\' or \'px\'');
      }

      var value = parseInt(matches[1], 10);
      return matches[2] === '%' ? Math.round(value / 100 * this.targetSize) : value;
    }
  }, {
    key: '_setupInitialIndex',
    value: function _setupInitialIndex() {
      this._reset();
      this._lastActiveIndex = Math.max(Math.min(Number(this.getInitialIndex()), this.itemCount), 0);
      this._scroll = this._offset + this.itemNumSize * this._lastActiveIndex;
      this._scrollTo(this._scroll);
    }
  }, {
    key: '_setSwiping',
    value: function _setSwiping(toggle) {
      this.target.classList.toggle('swiping', toggle); // Hides everything except shown pages
    }
  }, {
    key: 'setActiveIndex',
    value: function setActiveIndex(index) {
      var _this3 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this._setSwiping(true);
      index = Math.max(0, Math.min(index, this.itemCount - 1));
      var scroll = Math.max(0, Math.min(this.maxScroll, this._offset + this.itemNumSize * index));

      if (platform.isUIWebView()) {
        /* Dirty fix for #2231(https://github.com/OnsenUI/OnsenUI/issues/2231). begin */
        var concat = function concat(arrayOfArray) {
          return Array.prototype.concat.apply([], arrayOfArray);
        };
        var contents = concat(util.arrayFrom(this.target.children).map(function (page) {
          return util.arrayFrom(page.children).filter(function (child) {
            return child.classList.contains('page__content');
          });
        }));

        var map = new _Map();
        return new _Promise(function (resolve) {
          contents.forEach(function (content) {
            map.set(content, content.getAttribute('class'));
            content.classList.add('page__content--suppress-layer-creation');
          });
          requestAnimationFrame(resolve);
        }).then(function () {
          return _this3._changeTo(scroll, options);
        }).then(function () {
          return new _Promise(function (resolve) {
            contents.forEach(function (content) {
              content.setAttribute('class', map.get(content));
            });
            requestAnimationFrame(resolve);
          });
        });
        /* end */
      } else {
        return this._changeTo(scroll, options);
      }
    }
  }, {
    key: 'getActiveIndex',
    value: function getActiveIndex() {
      var scroll = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._scroll;

      scroll -= this._offset;
      var count = this.itemCount,
          size = this.itemNumSize;

      if (this.itemNumSize === 0 || !util.isInteger(scroll)) {
        return this._lastActiveIndex;
      }

      if (scroll <= 0) {
        return 0;
      }

      for (var i = 0; i < count; i++) {
        if (size * i <= scroll && size * (i + 1) > scroll) {
          return i;
        }
      }

      return count - 1;
    }
  }, {
    key: 'setupResize',
    value: function setupResize(add) {
      window[(add ? 'add' : 'remove') + 'EventListener']('resize', this.onResize, true);
    }
  }, {
    key: 'show',
    value: function show() {
      var _this4 = this;

      this.setupResize(true);
      this.onResize();
      setTimeout(function () {
        return _this4.target && _this4.target.classList.add('active');
      }, 1000 / 60); // Hide elements after animations
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.setupResize(false);
      this.target.classList.remove('active'); // Show elements before animations
    }
  }, {
    key: 'updateSwipeable',
    value: function updateSwipeable(shouldUpdate) {
      if (this._gestureDetector) {
        var action = shouldUpdate ? 'on' : 'off';
        this._gestureDetector[action]('drag', this.onDrag);
        this._gestureDetector[action]('dragstart', this.onDragStart);
        this._gestureDetector[action]('dragend', this.onDragEnd);
      }
    }
  }, {
    key: 'updateAutoRefresh',
    value: function updateAutoRefresh(shouldWatch) {
      if (this._mutationObserver) {
        shouldWatch ? this._mutationObserver.observe(this.target, { childList: true }) : this._mutationObserver.disconnect();
      }
    }
  }, {
    key: 'updateItemSize',
    value: function updateItemSize(newSize) {
      this.itemSize = newSize || '100%';
      this.refresh();
    }
  }, {
    key: 'toggleBlocker',
    value: function toggleBlocker(block) {
      this.blocker.style.pointerEvents = block ? 'auto' : 'none';
    }
  }, {
    key: '_canConsumeGesture',
    value: function _canConsumeGesture(gesture) {
      var d = gesture.direction;
      var isFirst = this._scroll === 0 && !this.isOverScrollable();
      var isLast = this._scroll === this.maxScroll && !this.isOverScrollable();

      return this.isVertical() ? d === 'down' && !isFirst || d === 'up' && !isLast : d === 'right' && !isFirst || d === 'left' && !isLast;
    }
  }, {
    key: 'onDragStart',
    value: function onDragStart(event) {
      var _this5 = this;

      this._ignoreDrag = event.consumed || !util.isValidGesture(event);

      if (!this._ignoreDrag) {
        var consume = event.consume;
        event.consume = function () {
          consume && consume();_this5._ignoreDrag = true;
        };

        if (this._canConsumeGesture(event.gesture)) {
          var startX = event.gesture.center && event.gesture.center.clientX || 0,
              distFromEdge = this.getBubbleWidth() || 0,
              start = function start() {
            consume && consume();
            event.consumed = true;
            _this5._started = true; // Avoid starting drag from outside
            _this5.shouldBlock && _this5.toggleBlocker(true);
            _this5._setSwiping(true);
            util.iosPreventScroll(_this5._gestureDetector);
          };

          // Let parent elements consume the gesture or consume it right away
          startX < distFromEdge || startX > this.targetSize - distFromEdge ? _setImmediate(function () {
            return !_this5._ignoreDrag && start();
          }) : start();
        }
      }
    }
  }, {
    key: 'onDrag',
    value: function onDrag(event) {
      if (!event.gesture || this._ignoreDrag || !this._started) {
        return;
      }

      this._continued = true; // Fix for random 'dragend' without 'drag'
      event.stopPropagation();

      this._scrollTo(this._scroll - this._getDelta(event), { throttle: true });
    }
  }, {
    key: 'onDragEnd',
    value: function onDragEnd(event) {
      this._started = false;
      if (!event.gesture || this._ignoreDrag || !this._continued) {
        this._ignoreDrag = true; // onDragEnd might fire before onDragStart's setImmediate
        return;
      }

      this._continued = false;
      event.stopPropagation();

      var scroll = this._scroll - this._getDelta(event);
      var normalizedScroll = this._normalizeScroll(scroll);
      scroll === normalizedScroll ? this._startMomentumScroll(scroll, event) : this._killOverScroll(normalizedScroll);
      this.shouldBlock && this.toggleBlocker(false);
    }
  }, {
    key: '_startMomentumScroll',
    value: function _startMomentumScroll(scroll, event) {
      var velocity = this._getVelocity(event),
          matchesDirection = event.gesture.interimDirection === this.dM.dir[this._getDelta(event) < 0 ? 0 : 1];

      var nextScroll = this._getAutoScroll(scroll, velocity, matchesDirection);
      var duration = Math.abs(nextScroll - scroll) / (velocity + 0.01) / 1000;
      duration = Math.min(.25, Math.max(.1, duration));

      this._changeTo(nextScroll, { swipe: true, animationOptions: { duration: duration, timing: 'cubic-bezier(.4, .7, .5, 1)' } });
    }
  }, {
    key: '_killOverScroll',
    value: function _killOverScroll(scroll) {
      var _this6 = this;

      this._scroll = scroll;
      var direction = this.dM.dir[Number(scroll > 0)];
      var killOverScroll = function killOverScroll() {
        return _this6._changeTo(scroll, { animationOptions: { duration: .4, timing: 'cubic-bezier(.1, .4, .1, 1)' } });
      };
      this.overScrollHook({ direction: direction, killOverScroll: killOverScroll }) || killOverScroll();
    }
  }, {
    key: '_changeTo',
    value: function _changeTo(scroll) {
      var _this7 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var e = { activeIndex: this.getActiveIndex(scroll), lastActiveIndex: this._lastActiveIndex, swipe: options.swipe || false };
      var change = e.activeIndex !== e.lastActiveIndex;
      var canceled = change ? this.preChangeHook(e) : false;

      this._scroll = canceled ? this._offset + e.lastActiveIndex * this.itemNumSize : scroll;
      this._lastActiveIndex = canceled ? e.lastActiveIndex : e.activeIndex;

      return this._scrollTo(this._scroll, options).then(function () {
        if (scroll === _this7._scroll && !canceled) {
          _this7._setSwiping(false);
          change && _this7.postChangeHook(e);
        } else if (options.reject) {
          _this7._setSwiping(false);
          return _Promise.reject('Canceled');
        }
      });
    }
  }, {
    key: '_scrollTo',
    value: function _scrollTo(scroll) {
      var _this8 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (options.throttle) {
        var ratio = 0.35;
        if (scroll < 0) {
          scroll = this.isOverScrollable() ? Math.round(scroll * ratio) : 0;
        } else {
          var maxScroll = this.maxScroll;
          if (maxScroll < scroll) {
            scroll = this.isOverScrollable() ? maxScroll + Math.round((scroll - maxScroll) * ratio) : maxScroll;
          }
        }
      }

      var opt = options.animation === 'none' ? {} : options.animationOptions;
      this.scrollHook && this.itemNumSize > 0 && this.scrollHook((scroll / this.itemNumSize).toFixed(2), options.animationOptions || {});

      return new _Promise(function (resolve) {
        return animit(_this8.target).queue({ transform: _this8._getTransform(scroll) }, opt).play(resolve);
      });
    }
  }, {
    key: '_getAutoScroll',
    value: function _getAutoScroll(scroll, velocity, matchesDirection) {
      var max = this.maxScroll,
          offset = this._offset,
          size = this.itemNumSize;

      if (!this.isAutoScrollable()) {
        return Math.max(0, Math.min(max, scroll));
      }

      var arr = [];
      for (var s = offset; s < max; s += size) {
        arr.push(s);
      }
      arr.push(max);

      arr = arr.sort(function (left, right) {
        return Math.abs(left - scroll) - Math.abs(right - scroll);
      }).filter(function (item, pos) {
        return !pos || item !== arr[pos - 1];
      });

      var result = arr[0];
      var lastScroll = this._lastActiveIndex * size + offset;
      var scrollRatio = Math.abs(scroll - lastScroll) / size;

      if (scrollRatio <= this.getAutoScrollRatio(matchesDirection, velocity, size)) {
        result = lastScroll;
      } else {
        if (scrollRatio < 1.0 && arr[0] === lastScroll && arr.length > 1) {
          result = arr[1];
        }
      }
      return Math.max(0, Math.min(max, result));
    }
  }, {
    key: '_reset',
    value: function _reset() {
      this._targetSize = this._itemNumSize = undefined;
    }
  }, {
    key: '_normalizeScroll',
    value: function _normalizeScroll(scroll) {
      return Math.max(Math.min(scroll, this.maxScroll), 0);
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this._reset();
      this._updateLayout();

      if (util.isInteger(this._scroll)) {
        var scroll = this._normalizeScroll(this._scroll);
        scroll !== this._scroll ? this._killOverScroll(scroll) : this._changeTo(scroll);
      } else {
        this._setupInitialIndex();
      }

      this.refreshHook();
    }
  }, {
    key: '_getDelta',
    value: function _getDelta(event) {
      return event.gesture['delta' + this.dM.axis];
    }
  }, {
    key: '_getVelocity',
    value: function _getVelocity(event) {
      return event.gesture['velocity' + this.dM.axis];
    }
  }, {
    key: '_getTransform',
    value: function _getTransform(scroll) {
      return 'translate3d(' + this.dM.t3d[0] + -scroll + this.dM.t3d[1] + ')';
    }
  }, {
    key: '_updateLayout',
    value: function _updateLayout() {
      this.dM = directionMap[this.isVertical() ? 'vertical' : 'horizontal'];
      this.target.classList.toggle('ons-swiper-target--vertical', this.isVertical());

      for (var c = this.target.children[0]; c; c = c.nextElementSibling) {
        c.style[this.dM.size.toLowerCase()] = this.itemSize;
      }

      if (this.isCentered()) {
        this._offset = (this.targetSize - this.itemNumSize) / -2 || 0;
      }
    }
  }, {
    key: 'itemCount',
    get: function get() {
      return this.target.children.length;
    }
  }, {
    key: 'itemNumSize',
    get: function get() {
      if (typeof this._itemNumSize !== 'number' || this._itemNumSize !== this._itemNumSize) {
        this._itemNumSize = this._calculateItemSize();
      }
      return this._itemNumSize;
    }
  }, {
    key: 'maxScroll',
    get: function get() {
      var max = this.itemCount * this.itemNumSize - this.targetSize;
      return Math.ceil(max < 0 ? 0 : max); // Need to return an integer value.
    }
  }, {
    key: 'targetSize',
    get: function get() {
      if (!this._targetSize) {
        this._targetSize = this.target['offset' + this.dM.size];
      }
      return this._targetSize;
    }
  }]);

  return Swiper;
}();

export default Swiper;