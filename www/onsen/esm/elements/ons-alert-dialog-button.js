import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
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

import onsElements from '../ons/elements';
import BaseButtonElement from './base/base-button';

/**
 * @element ons-alert-dialog-button
 * @modifier material
 *   [en]Material Design alert-dialog button.[/en]
 *   [ja]マテリアルデザインのボタンを表示します。[/ja]
 * @description
 *   [en][/en]
 *   [ja][/ja]
 * @seealso ons-alert-dialog
 *   [en]The `<ons-alert-dialog>` component displays a alert dialog.[/en]
 *   [ja]ons-alert-dialogコンポーネント[/ja]
 * @example
 *  <ons-alert-dialog>
 *    <div class="alert-dialog-title">Warning!</div>
 *    <div class="alert-dialog-content">
 *      An error has occurred!
 *    </div>
 *    <div class="alert-dialog-footer">
 *      <alert-dialog-button onclick="app.close()">Cancel</alert-dialog-button>
 *      <alert-dialog-button class="alert-dialog-button" onclick="app.close()">OK</alert-dialog-button>
 *    </div>
 *  </ons-alert-dialog>
 */

var AlertDialogButtonElement = function (_BaseButtonElement) {
  _inherits(AlertDialogButtonElement, _BaseButtonElement);

  function AlertDialogButtonElement() {
    _classCallCheck(this, AlertDialogButtonElement);

    return _possibleConstructorReturn(this, (AlertDialogButtonElement.__proto__ || _Object$getPrototypeOf(AlertDialogButtonElement)).apply(this, arguments));
  }

  _createClass(AlertDialogButtonElement, [{
    key: '_scheme',


    /**
     * @attribute modifier
     * @type {String}
     * @description
     *   [en]The appearance of the button.[/en]
     *   [ja]ボタンの表現を指定します。[/ja]
     */

    /**
     * @attribute disabled
     * @description
     *   [en]Specify if button should be disabled.[/en]
     *   [ja]ボタンを無効化する場合は指定してください。[/ja]
     */

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the element is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

    get: function get() {
      return { '': 'alert-dialog-button--*' };
    }
  }, {
    key: '_defaultClassName',
    get: function get() {
      return 'alert-dialog-button';
    }
  }, {
    key: '_rippleOpt',
    get: function get() {
      return [this, undefined, { 'modifier': 'light-gray' }];
    }
  }]);

  return AlertDialogButtonElement;
}(BaseButtonElement);

export default AlertDialogButtonElement;


onsElements.AlertDialogButton = AlertDialogButtonElement;
customElements.define('ons-alert-dialog-button', AlertDialogButtonElement);