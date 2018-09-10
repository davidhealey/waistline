import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
/*
Copyright 2013-2018 ASIAL CORPORATION

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

import animit from '../../ons/animit';
import BaseAnimator from '../../ons/base-animator';

export var ListItemAnimator = function (_BaseAnimator) {
  _inherits(ListItemAnimator, _BaseAnimator);

  function ListItemAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.2 : _ref$duration;

    _classCallCheck(this, ListItemAnimator);

    return _possibleConstructorReturn(this, (ListItemAnimator.__proto__ || _Object$getPrototypeOf(ListItemAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  _createClass(ListItemAnimator, [{
    key: 'showExpansion',
    value: function showExpansion(listItem, callback) {
      callback();
    }
  }, {
    key: 'hideExpansion',
    value: function hideExpansion(listItem, callback) {
      callback();
    }
  }]);

  return ListItemAnimator;
}(BaseAnimator);

export var SlideListItemAnimator = function (_ListItemAnimator) {
  _inherits(SlideListItemAnimator, _ListItemAnimator);

  function SlideListItemAnimator() {
    _classCallCheck(this, SlideListItemAnimator);

    return _possibleConstructorReturn(this, (SlideListItemAnimator.__proto__ || _Object$getPrototypeOf(SlideListItemAnimator)).apply(this, arguments));
  }

  _createClass(SlideListItemAnimator, [{
    key: 'showExpansion',
    value: function showExpansion(listItem, callback) {
      this._animateExpansion(listItem, true, callback);
    }
  }, {
    key: 'hideExpansion',
    value: function hideExpansion(listItem, callback) {
      this._animateExpansion(listItem, false, callback);
    }
  }, {
    key: '_animateExpansion',
    value: function _animateExpansion(listItem, shouldOpen, callback) {
      var _animit;

      // To animate the opening of the expansion panel correctly, we need to know its
      // height. To calculate this, we set its height to auto, and then get the computed
      // height and padding. Once this is done, we set the height back to its original value.
      var oldHeight = listItem.expandableContent.style.height;
      var oldDisplay = listItem.expandableContent.style.display;
      listItem.expandableContent.style.height = 'auto';
      listItem.expandableContent.style.display = 'block';
      var computedStyle = window.getComputedStyle(listItem.expandableContent);

      var expansionOpenTransition = [{ height: 0, paddingTop: 0, paddingBottom: 0 }, {
        height: computedStyle.height,
        paddingTop: computedStyle.paddingTop,
        paddingBottom: computedStyle.paddingBottom
      }];
      var iconOpenTransition = [{ transform: 'rotate(45deg)' }, { transform: 'rotate(225deg)' }];

      // Now that we have the values we need, reset the height back to its original state
      listItem.expandableContent.style.height = oldHeight;

      (_animit = animit(listItem.expandableContent, { duration: this.duration, property: 'height padding-top padding-bottom' })).default.apply(_animit, _toConsumableArray(shouldOpen ? expansionOpenTransition : expansionOpenTransition.reverse())).play(function () {
        listItem.expandableContent.style.display = oldDisplay;
        callback && callback();
      });

      if (listItem.expandChevron) {
        var _animit2;

        (_animit2 = animit(listItem.expandChevron, { duration: this.duration, property: 'transform' })).default.apply(_animit2, _toConsumableArray(shouldOpen ? iconOpenTransition : iconOpenTransition.reverse())).play();
      }
    }
  }]);

  return SlideListItemAnimator;
}(ListItemAnimator);