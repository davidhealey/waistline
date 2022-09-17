import { extend, now } from './utils.js';
import EventsClass from './events-class.js';

class Framework7Class extends EventsClass {
  constructor(params, parents) {
    if (params === void 0) {
      params = {};
    }

    if (parents === void 0) {
      parents = [];
    }

    super(parents);
    const self = this;
    self.params = params;

    if (self.params && self.params.on) {
      Object.keys(self.params.on).forEach(eventName => {
        self.on(eventName, self.params.on[eventName]);
      });
    }
  } // eslint-disable-next-line


  useModuleParams(module, instanceParams) {
    if (module.params) {
      const originalParams = {};
      Object.keys(module.params).forEach(paramKey => {
        if (typeof instanceParams[paramKey] === 'undefined') return;
        originalParams[paramKey] = extend({}, instanceParams[paramKey]);
      });
      extend(instanceParams, module.params);
      Object.keys(originalParams).forEach(paramKey => {
        extend(instanceParams[paramKey], originalParams[paramKey]);
      });
    }
  }

  useModulesParams(instanceParams) {
    const instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach(moduleName => {
      const module = instance.modules[moduleName]; // Extend params

      if (module.params) {
        extend(instanceParams, module.params);
      }
    });
  }

  useModule(moduleName, moduleParams) {
    if (moduleName === void 0) {
      moduleName = '';
    }

    if (moduleParams === void 0) {
      moduleParams = {};
    }

    const instance = this;
    if (!instance.modules) return;
    const module = typeof moduleName === 'string' ? instance.modules[moduleName] : moduleName;
    if (!module) return; // Extend instance methods and props

    if (module.instance) {
      Object.keys(module.instance).forEach(modulePropName => {
        const moduleProp = module.instance[modulePropName];

        if (typeof moduleProp === 'function') {
          instance[modulePropName] = moduleProp.bind(instance);
        } else {
          instance[modulePropName] = moduleProp;
        }
      });
    } // Add event listeners


    if (module.on && instance.on) {
      Object.keys(module.on).forEach(moduleEventName => {
        instance.on(moduleEventName, module.on[moduleEventName]);
      });
    } // Add vnode hooks


    if (module.vnode) {
      if (!instance.vnodeHooks) instance.vnodeHooks = {};
      Object.keys(module.vnode).forEach(vnodeId => {
        Object.keys(module.vnode[vnodeId]).forEach(hookName => {
          const handler = module.vnode[vnodeId][hookName];
          if (!instance.vnodeHooks[hookName]) instance.vnodeHooks[hookName] = {};
          if (!instance.vnodeHooks[hookName][vnodeId]) instance.vnodeHooks[hookName][vnodeId] = [];
          instance.vnodeHooks[hookName][vnodeId].push(handler.bind(instance));
        });
      });
    } // Module create callback


    if (module.create) {
      module.create.bind(instance)(moduleParams);
    }
  }

  useModules(modulesParams) {
    if (modulesParams === void 0) {
      modulesParams = {};
    }

    const instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach(moduleName => {
      const moduleParams = modulesParams[moduleName] || {};
      instance.useModule(moduleName, moduleParams);
    });
  }

  static set components(components) {
    const Class = this;
    if (!Class.use) return;
    Class.use(components);
  }

  static installModule(module) {
    const Class = this;
    if (!Class.prototype.modules) Class.prototype.modules = {};
    const name = module.name || `${Object.keys(Class.prototype.modules).length}_${now()}`;
    Class.prototype.modules[name] = module; // Prototype

    if (module.proto) {
      Object.keys(module.proto).forEach(key => {
        Class.prototype[key] = module.proto[key];
      });
    } // Class


    if (module.static) {
      Object.keys(module.static).forEach(key => {
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
  }

  static use(module) {
    const Class = this;

    if (Array.isArray(module)) {
      module.forEach(m => Class.installModule(m));
      return Class;
    }

    for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      params[_key2 - 1] = arguments[_key2];
    }

    return Class.installModule(module, ...params);
  }

}

export default Framework7Class;