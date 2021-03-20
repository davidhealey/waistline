function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import Modal from '../modal/modal-class';

var LoginScreen = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(LoginScreen, _Modal);

  function LoginScreen(app, params) {
    var _this;

    var extendedParams = extend({
      on: {}
    }, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var loginScreen = _assertThisInitialized(_this);

    loginScreen.params = extendedParams; // Find Element

    var $el;

    if (!loginScreen.params.el) {
      $el = $(loginScreen.params.content).filter(function (node) {
        return node.nodeType === 1;
      }).eq(0);
    } else {
      $el = $(loginScreen.params.el).eq(0);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el.length === 0) {
      return loginScreen.destroy() || _assertThisInitialized(_this);
    }

    extend(loginScreen, {
      app: app,
      $el: $el,
      el: $el[0],
      type: 'loginScreen'
    });
    $el[0].f7Modal = loginScreen;
    return loginScreen || _assertThisInitialized(_this);
  }

  return LoginScreen;
}(Modal);

export default LoginScreen;