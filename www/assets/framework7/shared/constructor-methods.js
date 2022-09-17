import $ from './dom7.js';
export default function ConstructorMethods(parameters) {
  if (parameters === void 0) {
    parameters = {};
  }

  const {
    defaultSelector,
    constructor: Constructor,
    domProp,
    app,
    addMethods
  } = parameters;
  const methods = {
    create() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (app) return new Constructor(app, ...args);
      return new Constructor(...args);
    },

    get(el) {
      if (el === void 0) {
        el = defaultSelector;
      }

      if (el instanceof Constructor) return el;
      const $el = $(el);
      if ($el.length === 0) return undefined;
      return $el[0][domProp];
    },

    destroy(el) {
      const instance = methods.get(el);
      if (instance && instance.destroy) return instance.destroy();
      return undefined;
    }

  };

  if (addMethods && Array.isArray(addMethods)) {
    addMethods.forEach(methodName => {
      methods[methodName] = function (el) {
        if (el === void 0) {
          el = defaultSelector;
        }

        const instance = methods.get(el);

        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        if (instance && instance[methodName]) return instance[methodName](...args);
        return undefined;
      };
    });
  }

  return methods;
}