"use strict";

exports.__esModule = true;
exports.default = ConstructorMethods;

var _dom = _interopRequireDefault(require("./dom7"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function ConstructorMethods(parameters) {
  if (parameters === void 0) {
    parameters = {};
  }

  var _parameters = parameters,
      defaultSelector = _parameters.defaultSelector,
      Constructor = _parameters.constructor,
      domProp = _parameters.domProp,
      app = _parameters.app,
      addMethods = _parameters.addMethods;
  var methods = {
    create: function create() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (app) return _construct(Constructor, [app].concat(args));
      return _construct(Constructor, args);
    },
    get: function get(el) {
      if (el === void 0) {
        el = defaultSelector;
      }

      if (el instanceof Constructor) return el;
      var $el = (0, _dom.default)(el);
      if ($el.length === 0) return undefined;
      return $el[0][domProp];
    },
    destroy: function destroy(el) {
      var instance = methods.get(el);
      if (instance && instance.destroy) return instance.destroy();
      return undefined;
    }
  };

  if (addMethods && Array.isArray(addMethods)) {
    addMethods.forEach(function (methodName) {
      methods[methodName] = function (el) {
        if (el === void 0) {
          el = defaultSelector;
        }

        var instance = methods.get(el);

        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        if (instance && instance[methodName]) return instance[methodName].apply(instance, args);
        return undefined;
      };
    });
  }

  return methods;
}