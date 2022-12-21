"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _utils = require("../../shared/utils");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetchedModules = [];

function loadModule(moduleToLoad) {
  var Framework7 = this;
  var window = (0, _ssrWindow.getWindow)();
  var document = (0, _ssrWindow.getDocument)();
  return new Promise(function (resolve, reject) {
    var app = Framework7.instance;
    var modulePath;
    var moduleObj;
    var moduleFunc;

    if (!moduleToLoad) {
      reject(new Error('Framework7: Lazy module must be specified'));
      return;
    }

    function install(module) {
      Framework7.use(module);

      if (app) {
        app.useModuleParams(module, app.params);
        app.useModule(module);
      }
    }

    if (typeof moduleToLoad === 'string') {
      var matchNamePattern = moduleToLoad.match(/([a-z0-9-]*)/i);

      if (moduleToLoad.indexOf('.') < 0 && matchNamePattern && matchNamePattern[0].length === moduleToLoad.length) {
        if (!app || app && !app.params.lazyModulesPath) {
          reject(new Error('Framework7: "lazyModulesPath" app parameter must be specified to fetch module by name'));
          return;
        }

        modulePath = app.params.lazyModulesPath + "/" + moduleToLoad + "/" + moduleToLoad + ".js";
      } else {
        modulePath = moduleToLoad;
      }
    } else if (typeof moduleToLoad === 'function') {
      moduleFunc = moduleToLoad;
    } else {
      // considering F7-Plugin object
      moduleObj = moduleToLoad;
    }

    if (moduleFunc) {
      var module = moduleFunc(Framework7, false);

      if (!module) {
        reject(new Error("Framework7: Can't find Framework7 component in specified component function"));
        return;
      } // Check if it was added


      if (Framework7.prototype.modules && Framework7.prototype.modules[module.name]) {
        resolve();
        return;
      } // Install It


      install(module);
      resolve();
    }

    if (moduleObj) {
      var _module = moduleObj;

      if (!_module) {
        reject(new Error("Framework7: Can't find Framework7 component in specified component"));
        return;
      } // Check if it was added


      if (Framework7.prototype.modules && Framework7.prototype.modules[_module.name]) {
        resolve();
        return;
      } // Install It


      install(_module);
      resolve();
    }

    if (modulePath) {
      if (fetchedModules.indexOf(modulePath) >= 0) {
        resolve();
        return;
      }

      fetchedModules.push(modulePath);
      var scriptLoad = new Promise(function (resolveScript, rejectScript) {
        Framework7.request.get(modulePath, function (scriptContent) {
          var callbackId = (0, _utils.id)();
          var callbackLoadName = "f7_component_loader_callback_" + callbackId;
          var scriptEl = document.createElement('script');
          scriptEl.innerHTML = "window." + callbackLoadName + " = function (Framework7, Framework7AutoInstallComponent) {return " + scriptContent.trim() + "}";
          (0, _dom.default)('head').append(scriptEl);
          var componentLoader = window[callbackLoadName];
          delete window[callbackLoadName];
          (0, _dom.default)(scriptEl).remove();
          var module = componentLoader(Framework7, false);

          if (!module) {
            rejectScript(new Error("Framework7: Can't find Framework7 component in " + modulePath + " file"));
            return;
          } // Check if it was added


          if (Framework7.prototype.modules && Framework7.prototype.modules[module.name]) {
            resolveScript();
            return;
          } // Install It


          install(module);
          resolveScript();
        }, function (xhr, status) {
          rejectScript(xhr, status);
        });
      });
      var styleLoad = new Promise(function (resolveStyle) {
        Framework7.request.get(modulePath.replace('.js', app.rtl ? '.rtl.css' : '.css'), function (styleContent) {
          var styleEl = document.createElement('style');
          styleEl.innerHTML = styleContent;
          (0, _dom.default)('head').append(styleEl);
          resolveStyle();
        }, function () {
          resolveStyle();
        });
      });
      Promise.all([scriptLoad, styleLoad]).then(function () {
        resolve();
      }).catch(function (err) {
        reject(err);
      });
    }
  });
}

var _default = loadModule;
exports.default = _default;