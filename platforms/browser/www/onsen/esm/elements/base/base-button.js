import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _createClass from 'babel-runtime/helpers/createClass';
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

import onsElements from '../../ons/elements';
import util from '../../ons/util';
import autoStyle from '../../ons/autostyle';
import contentReady from '../../ons/content-ready';
import ModifierUtil from '../../ons/internal/modifier-util';
import BaseElement from './base-element';

var BaseButtonElement = function (_BaseElement) {
  _inherits(BaseButtonElement, _BaseElement);

  _createClass(BaseButtonElement, [{
    key: '_scheme',
    get: function get() {
      util.throwMember();
    }
  }, {
    key: '_defaultClassName',
    get: function get() {
      util.throwMember();
    }
  }, {
    key: '_rippleOpt',
    get: function get() {
      return [this];
    }
  }]);

  function BaseButtonElement() {
    _classCallCheck(this, BaseButtonElement);

    var _this = _possibleConstructorReturn(this, (BaseButtonElement.__proto__ || _Object$getPrototypeOf(BaseButtonElement)).call(this));

    if (_this.constructor === BaseButtonElement) {
      util.throwAbstract();
    }

    contentReady(_this, function () {
      return _this._compile();
    });
    return _this;
  }

  _createClass(BaseButtonElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.classList.add(this._defaultClassName);

      if (!this._icon && this.hasAttribute('icon')) {
        util.checkMissingImport('Icon');
        var icon = util.createElement('<ons-icon icon="' + this.getAttribute('icon') + '"></ons-icon>');
        icon.classList.add(this._defaultClassName.replace('button', 'icon'));
        this.insertBefore(icon, this.firstChild);
      }

      this._updateRipple();

      ModifierUtil.initModifier(this, this._scheme);
    }
  }, {
    key: '_updateIcon',
    value: function _updateIcon() {
      if (this._icon) {
        this._icon.setAttribute('icon', this.getAttribute('icon'));
      }
    }
  }, {
    key: '_updateRipple',
    value: function _updateRipple() {
      this._rippleOpt && util.updateRipple.apply(util, _toConsumableArray(this._rippleOpt));
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          util.restoreClass(this, this._defaultClassName, this._scheme);
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, this._scheme);
          break;
        case 'icon':
          this._updateIcon();
          break;
        case 'ripple':
          this.classList.contains(this._defaultClassName) && this._updateRipple();
          break;
      }
    }
  }, {
    key: 'disabled',
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get() {
      return this.hasAttribute('disabled');
    }
  }, {
    key: '_icon',
    get: function get() {
      return util.findChild(this, 'ons-icon');
    }
  }], [{
    key: 'observedAttributes',
    get: function get() {
      return ['modifier', 'class', 'icon', 'ripple'];
    }
  }]);

  return BaseButtonElement;
}(BaseElement);

export default BaseButtonElement;