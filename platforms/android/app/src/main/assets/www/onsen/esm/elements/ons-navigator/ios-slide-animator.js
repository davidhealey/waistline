import _extends from 'babel-runtime/helpers/extends';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _get from 'babel-runtime/helpers/get';
import _inherits from 'babel-runtime/helpers/inherits';
/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import IOSSwipeNavigatorAnimator from './ios-swipe-animator';
import util from '../../ons/util';
import animit from '../../ons/animit';
import contentReady from '../../ons/content-ready';

var translate3d = function translate3d() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  return 'translate3d(' + x + ', ' + y + ', ' + z + ')';
};

/**
 * Slide animator for navigator transition like iOS's screen slide transition.
 */

var IOSSlideNavigatorAnimator = function (_IOSSwipeNavigatorAni) {
  _inherits(IOSSlideNavigatorAnimator, _IOSSwipeNavigatorAni);

  function IOSSlideNavigatorAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'cubic-bezier(0.3, .4, 0, .9)' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.4 : _ref$duration,
        rest = _objectWithoutProperties(_ref, ['timing', 'delay', 'duration']);

    _classCallCheck(this, IOSSlideNavigatorAnimator);

    var _this = _possibleConstructorReturn(this, (IOSSlideNavigatorAnimator.__proto__ || _Object$getPrototypeOf(IOSSlideNavigatorAnimator)).call(this, _extends({ timing: timing, delay: delay, duration: duration }, rest)));

    _this.backgroundMask = util.createElement('<div style="position: absolute; width: 100%; height: 100%;' + 'background-color: black; z-index: 2"></div>');
    return _this;
  }

  _createClass(IOSSlideNavigatorAnimator, [{
    key: '_decompose',
    value: function _decompose(page) {
      var toolbar = page._getToolbarElement();
      var left = toolbar._getToolbarLeftItemsElement();
      var right = toolbar._getToolbarRightItemsElement();

      var excludeBackButton = function excludeBackButton(elements) {
        var result = [];

        for (var i = 0; i < elements.length; i++) {
          if (elements[i].nodeName.toLowerCase() !== 'ons-back-button') {
            result.push(elements[i]);
          }
        }

        return result;
      };

      var other = [].concat(left.children.length === 0 ? left : excludeBackButton(left.children)).concat(right.children.length === 0 ? right : excludeBackButton(right.children));

      return {
        toolbarCenter: toolbar._getToolbarCenterItemsElement(),
        backButtonIcon: toolbar._getToolbarBackButtonIconElement(),
        backButtonLabel: toolbar._getToolbarBackButtonLabelElement(),
        other: other,
        content: page._getContentElement(),
        background: page._getBackgroundElement(),
        toolbar: toolbar,
        bottomToolbar: page._getBottomToolbarElement()
      };
    }
  }, {
    key: '_shouldAnimateToolbar',
    value: function _shouldAnimateToolbar(enterPage, leavePage) {
      var toolbars = enterPage._canAnimateToolbar() && leavePage._canAnimateToolbar();

      var enterToolbar = enterPage._getToolbarElement();
      var leaveToolbar = leavePage._getToolbarElement();

      var isStatic = enterToolbar.hasAttribute('static') || leaveToolbar.hasAttribute('static');
      var isMaterial = util.hasModifier(enterToolbar, 'material') || util.hasModifier(leaveToolbar, 'material');
      var isTransparent = util.hasModifier(enterToolbar, 'transparent') || util.hasModifier(leaveToolbar, 'transparent');

      return toolbars && !isStatic && !isMaterial && !isTransparent;
    }
  }, {
    key: '_calculateDelta',
    value: function _calculateDelta(element, decomposition) {
      var title = void 0,
          label = void 0;

      var pageRect = element.getBoundingClientRect();
      if (decomposition.backButtonLabel.classList.contains('back-button__label')) {
        var labelRect = decomposition.backButtonLabel.getBoundingClientRect();
        title = Math.round(pageRect.width / 2 - labelRect.width / 2 - labelRect.left);
      } else {
        title = Math.round(pageRect.width / 2 * 0.6);
      }

      if (decomposition.backButtonIcon.classList.contains('back-button__icon')) {
        label = decomposition.backButtonIcon.getBoundingClientRect().right - 2;
      }

      return { title: title, label: label };
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

  }, {
    key: 'push',
    value: function push(enterPage, leavePage, callback) {
      var _this2 = this;

      this.backgroundMask.remove();
      leavePage.parentNode.insertBefore(this.backgroundMask, leavePage);

      var unblock = _get(IOSSlideNavigatorAnimator.prototype.__proto__ || _Object$getPrototypeOf(IOSSlideNavigatorAnimator.prototype), 'block', this).call(this, enterPage);

      contentReady(enterPage, function () {
        var enterPageTarget = util.findToolbarPage(enterPage) || enterPage;
        var leavePageTarget = util.findToolbarPage(leavePage) || leavePage;
        var enterPageDecomposition = _this2._decompose(enterPageTarget);
        var leavePageDecomposition = _this2._decompose(leavePageTarget);

        var delta = _this2._calculateDelta(leavePage, enterPageDecomposition);

        var shouldAnimateToolbar = _this2._shouldAnimateToolbar(enterPageTarget, leavePageTarget);

        if (shouldAnimateToolbar) {

          animit.runAll(animit([enterPageDecomposition.content, enterPageDecomposition.bottomToolbar, enterPageDecomposition.background], _this2.def).default({ transform: translate3d('100%') }, { transform: translate3d() }), animit(enterPageDecomposition.toolbar, _this2.def).default({ opacity: 0 }, { opacity: 1 }), animit(enterPageDecomposition.toolbarCenter, _this2.def).default({ transform: translate3d('125%'), opacity: 1 }, { transform: translate3d(), opacity: 1 }), animit(enterPageDecomposition.backButtonLabel, _this2.def).default({ transform: translate3d(delta.title + 'px'), opacity: 0 }, {
            transform: translate3d(),
            opacity: 1,
            transition: 'opacity ' + _this2.duration + 's linear, transform ' + _this2.duration + 's ' + _this2.timing
          }), animit(enterPageDecomposition.other, _this2.def).default({ opacity: 0 }, { css: { opacity: 1 }, timing: 'linear' }), animit([leavePageDecomposition.content, leavePageDecomposition.bottomToolbar, leavePageDecomposition.background], _this2.def).default({ transform: translate3d(), opacity: 1 }, { transform: translate3d('-25%'), opacity: 0.9 }).queue(function (done) {
            _this2.backgroundMask.remove();
            unblock();
            callback();
            done();
          }), animit(leavePageDecomposition.toolbarCenter, _this2.def).default({ transform: translate3d(), opacity: 1 }, {
            transform: translate3d('-' + delta.title + 'px'),
            opacity: 0,
            transition: 'opacity ' + _this2.duration + 's linear, transform ' + _this2.duration + 's ' + _this2.timing
          }), animit(leavePageDecomposition.backButtonLabel, _this2.def).default({ transform: translate3d(), opacity: 1 }, { transform: translate3d('-' + delta.label + 'px'), opacity: 0 }), animit(leavePageDecomposition.other, _this2.def).default({ opacity: 1 }, { css: { opacity: 0 }, timing: 'linear' }));
        } else {

          animit.runAll(animit(enterPage, _this2.def).default({ transform: translate3d('100%') }, { transform: translate3d() }), animit(leavePage, _this2.def).default({ transform: translate3d(), opacity: 1 }, { transform: translate3d('-25%'), opacity: .9 }).queue(function (done) {
            _this2.backgroundMask.remove();
            unblock();
            callback();
            done();
          }));
        }
      });
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      var _this3 = this;

      if (this.isSwiping) {
        return this.popSwipe(enterPage, leavePage, callback);
      }

      this.backgroundMask.remove();
      enterPage.parentNode.insertBefore(this.backgroundMask, enterPage);

      var unblock = _get(IOSSlideNavigatorAnimator.prototype.__proto__ || _Object$getPrototypeOf(IOSSlideNavigatorAnimator.prototype), 'block', this).call(this, enterPage);

      var enterPageTarget = util.findToolbarPage(enterPage) || enterPage;
      var leavePageTarget = util.findToolbarPage(leavePage) || leavePage;
      var enterPageDecomposition = this._decompose(enterPageTarget);
      var leavePageDecomposition = this._decompose(leavePageTarget);

      var delta = this._calculateDelta(leavePage, leavePageDecomposition);

      var shouldAnimateToolbar = this._shouldAnimateToolbar(enterPageTarget, leavePageTarget);

      if (shouldAnimateToolbar) {
        animit.runAll(animit([enterPageDecomposition.content, enterPageDecomposition.bottomToolbar, enterPageDecomposition.background], this.def).default({ transform: translate3d('-25%'), opacity: .9 }, { transform: translate3d(), opacity: 1 }), animit(enterPageDecomposition.toolbarCenter, this.def).default({ transform: translate3d('-' + delta.title + 'px'), opacity: 0 }, {
          transform: translate3d(),
          opacity: 1,
          transition: 'opacity ' + this.duration + 's linear, transform ' + this.duration + 's ' + this.timing
        }), animit(enterPageDecomposition.backButtonLabel, this.def).default({ transform: translate3d('-' + delta.label + 'px') }, { transform: translate3d() }), animit(enterPageDecomposition.other, this.def).default({ opacity: 0 }, { css: { opacity: 1 }, timing: 'linear' }), animit([leavePageDecomposition.content, leavePageDecomposition.bottomToolbar, leavePageDecomposition.background], this.def).default({ transform: translate3d() }, { transform: translate3d('100%') }).wait(0).queue(function (done) {
          _this3.backgroundMask.remove();
          unblock();
          callback();
          done();
        }), animit(leavePageDecomposition.toolbar, this.def).default({ opacity: 1 }, { opacity: 0 }), animit(leavePageDecomposition.toolbarCenter, this.def).default({ transform: translate3d() }, { transform: translate3d('125%') }), animit(leavePageDecomposition.backButtonLabel, this.def).default({ transform: translate3d(), opacity: 1 }, {
          transform: translate3d(delta.title + 'px'),
          opacity: 0,
          transition: 'opacity ' + this.duration + 's linear, transform ' + this.duration + 's ' + this.timing
        }));
      } else {
        animit.runAll(animit(enterPage, this.def).default({ transform: translate3d('-25%'), opacity: .9 }, { transform: translate3d(), opacity: 1 }), animit(leavePage, this.def).default({ transform: translate3d() }, { transform: translate3d('100%') }).queue(function (done) {
          _this3.backgroundMask.remove();
          unblock();
          callback();
          done();
        }));
      }
    }
  }]);

  return IOSSlideNavigatorAnimator;
}(IOSSwipeNavigatorAnimator);

export default IOSSlideNavigatorAnimator;