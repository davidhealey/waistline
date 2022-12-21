function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import $ from './dom7';
import { extend } from './utils';
import ConstructorMethods from './constructor-methods';
export default function ModalMethods(parameters) {
  if (parameters === void 0) {
    parameters = {};
  }

  var _parameters = parameters,
      defaultSelector = _parameters.defaultSelector,
      Constructor = _parameters.constructor,
      app = _parameters.app;
  var methods = extend(ConstructorMethods({
    defaultSelector: defaultSelector,
    constructor: Constructor,
    app: app,
    domProp: 'f7Modal'
  }), {
    open: function open(el, animate, targetEl) {
      var $el = $(el);

      if ($el.length > 1 && targetEl) {
        // check if same modal in other page
        var $targetPage = $(targetEl).parents('.page');

        if ($targetPage.length) {
          $el.each(function (modalEl) {
            var $modalEl = $(modalEl);

            if ($modalEl.parents($targetPage)[0] === $targetPage[0]) {
              $el = $modalEl;
            }
          });
        }
      }

      if ($el.length > 1) {
        $el = $el.eq($el.length - 1);
      }

      if (!$el.length) return undefined;
      var instance = $el[0].f7Modal;

      if (!instance) {
        var params = $el.dataset();
        instance = new Constructor(app, _extends({
          el: $el
        }, params));
      }

      return instance.open(animate);
    },
    close: function close(el, animate, targetEl) {
      if (el === void 0) {
        el = defaultSelector;
      }

      var $el = $(el);
      if (!$el.length) return undefined;

      if ($el.length > 1) {
        // check if close link (targetEl) in this modal
        var $parentEl;

        if (targetEl) {
          var $targetEl = $(targetEl);

          if ($targetEl.length) {
            $parentEl = $targetEl.parents($el);
          }
        }

        if ($parentEl && $parentEl.length > 0) {
          $el = $parentEl;
        } else {
          $el = $el.eq($el.length - 1);
        }
      }

      var instance = $el[0].f7Modal;

      if (!instance) {
        var params = $el.dataset();
        instance = new Constructor(app, _extends({
          el: $el
        }, params));
      }

      return instance.close(animate);
    }
  });
  return methods;
}