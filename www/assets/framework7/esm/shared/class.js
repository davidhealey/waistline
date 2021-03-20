function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { extend, now } from './utils';
import EventsClass from './events-class';

var Framework7Class = /*#__PURE__*/function (_EventsClass) {
  _inheritsLoose(Framework7Class, _EventsClass);

  function Framework7Class(params, parents) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    if (parents === void 0) {
      parents = [];
    }

    _this = _EventsClass.call(this, parents) || this;

    var self = _assertThisInitialized(_this);

    self.params = params;

    if (self.params && self.params.on) {
      Object.keys(self.params.on).forEach(function (eventName) {
        self.on(eventName, self.params.on[eventName]);
      });
    }

    return _this;
  } // eslint-disable-next-line


  var _proto = Framework7Class.prototype;

  _proto.useModuleParams = function useModuleParams(module, instanceParams) {
    if (module.params) {
      var originalParams = {};
      Object.keys(module.params).forEach(function (paramKey) {
        if (typeof instanceParams[paramKey] === 'undefined') return;
        originalParams[paramKey] = extend({}, instanceParams[paramKey]);
      });
      extend(instanceParams, module.params);
      Object.keys(originalParams).forEach(function (paramKey) {
        extend(instanceParams[paramKey], originalParams[paramKey]);
      });
    }
  };

  _proto.useModulesParams = function useModulesParams(instanceParams) {
    var instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach(function (moduleName) {
      var module = instance.modules[moduleName]; // Extend params

      if (module.params) {
        extend(instanceParams, module.params);
      }
    });
  };

  _proto.useModule = function useModule(moduleName, moduleParams) {
    if (moduleName === void 0) {
      moduleName = '';
    }

    if (moduleParams === void 0) {
      moduleParams = {};
    }

    var instance = this;
    if (!instance.modules) return;
    var module = typeof moduleName === 'string' ? instance.modules[moduleName] : moduleName;
    if (!module) return; // Extend instance methods and props

    if (module.instance) {
      Object.keys(module.instance).forEach(function (modulePropName) {
        var moduleProp = module.instance[modulePropName];

        if (typeof moduleProp === 'function') {
          instance[modulePropName] = moduleProp.bind(instance);
        } else {
          instance[modulePropName] = moduleProp;
        }
      });
    } // Add event listeners


    if (module.on && instance.on) {
      Object.keys(module.on).forEach(function (moduleEventName) {
        instance.on(moduleEventName, module.on[moduleEventName]);
      });
    } // Add vnode hooks


    if (module.vnode) {
      if (!instance.vnodeHooks) instance.vnodeHooks = {};
      Object.keys(module.vnode).forEach(function (vnodeId) {
        Object.keys(module.vnode[vnodeId]).forEach(function (hookName) {
          var handler = module.vnode[vnodeId][hookName];
          if (!instance.vnodeHooks[hookName]) instance.vnodeHooks[hookName] = {};
          if (!instance.vnodeHooks[hookName][vnodeId]) instance.vnodeHooks[hookName][vnodeId] = [];
          instance.vnodeHooks[hookName][vnodeId].push(handler.bind(instance));
        });
      });
    } // Module create callback


    if (module.create) {
      module.create.bind(instance)(moduleParams);
    }
  };

  _proto.useModules = function useModules(modulesParams) {
    if (modulesParams === void 0) {
      modulesParams = {};
    }

    var instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach(function (moduleName) {
      var moduleParams = modulesParams[moduleName] || {};
      instance.useModule(moduleName, moduleParams);
    });
  };

  Framework7Class.installModule = function installModule(module) {
    var Class = this;
    if (!Class.prototype.modules) Class.prototype.modules = {};
    var name = module.name || Object.keys(Class.prototype.modules).length + "_" + now();
    Class.prototype.modules[name] = module; // Prototype

    if (module.proto) {
      Object.keys(module.proto).forEach(function (key) {
        Class.prototype[key] = module.proto[key];
      });
    } // Class


    if (module.static) {
      Object.keys(module.static).forEach(function (key) {
        Class[key] = module.static[key];
      });
    } // Callback


    if (module.install) {
      for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      module.install.apply(Class, params);
    }

    return Class;
  };

  Framework7Class.use = function use(module) {
    var Class = this;

    if (Array.isArray(module)) {
      module.forEach(function (m) {
        return Class.installModule(m);
      });
      return Class;
    }

    for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      params[_key2 - 1] = arguments[_key2];
    }

    return Class.installModule.apply(Class, [module].concat(params));
  };

  _createClass(Framework7Class, null, [{
    key: "components",
    set: function set(components) {
      var Class = this;
      if (!Class.use) return;
      Class.use(components);
    }
  }]);

  return Framework7Class;
}(EventsClass);

export default Framework7Class;