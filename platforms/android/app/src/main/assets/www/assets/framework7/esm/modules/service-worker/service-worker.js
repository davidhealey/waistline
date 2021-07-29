import { getWindow } from 'ssr-window';
import { extend } from '../../shared/utils';
var SW = {
  registrations: [],
  register: function register(path, scope) {
    var app = this;
    var window = getWindow();

    if (!('serviceWorker' in window.navigator) || !app.serviceWorker.container) {
      return new Promise(function (resolve, reject) {
        reject(new Error('Service worker is not supported'));
      });
    }

    return new Promise(function (resolve, reject) {
      app.serviceWorker.container.register(path, scope ? {
        scope: scope
      } : {}).then(function (reg) {
        SW.registrations.push(reg);
        app.emit('serviceWorkerRegisterSuccess', reg);
        resolve(reg);
      }).catch(function (error) {
        app.emit('serviceWorkerRegisterError', error);
        reject(error);
      });
    });
  },
  unregister: function unregister(registration) {
    var app = this;
    var window = getWindow();

    if (!('serviceWorker' in window.navigator) || !app.serviceWorker.container) {
      return new Promise(function (resolve, reject) {
        reject(new Error('Service worker is not supported'));
      });
    }

    var registrations;
    if (!registration) registrations = SW.registrations;else if (Array.isArray(registration)) registrations = registration;else registrations = [registration];
    return Promise.all(registrations.map(function (reg) {
      return new Promise(function (resolve, reject) {
        reg.unregister().then(function () {
          if (SW.registrations.indexOf(reg) >= 0) {
            SW.registrations.splice(SW.registrations.indexOf(reg), 1);
          }

          app.emit('serviceWorkerUnregisterSuccess', reg);
          resolve();
        }).catch(function (error) {
          app.emit('serviceWorkerUnregisterError', reg, error);
          reject(error);
        });
      });
    }));
  }
};
export default {
  name: 'sw',
  params: {
    serviceWorker: {
      path: undefined,
      scope: undefined
    }
  },
  create: function create() {
    var app = this;
    var window = getWindow();
    extend(app, {
      serviceWorker: {
        container: 'serviceWorker' in window.navigator ? window.navigator.serviceWorker : undefined,
        registrations: SW.registrations,
        register: SW.register.bind(app),
        unregister: SW.unregister.bind(app)
      }
    });
  },
  on: {
    init: function init() {
      var window = getWindow();
      if (!('serviceWorker' in window.navigator)) return;
      var app = this;
      if (app.device.cordova || window.Capacitor && window.Capacitor.isNative) return;
      if (!app.serviceWorker.container) return;
      var paths = app.params.serviceWorker.path;
      var scope = app.params.serviceWorker.scope;
      if (!paths || Array.isArray(paths) && !paths.length) return;
      var toRegister = Array.isArray(paths) ? paths : [paths];
      toRegister.forEach(function (path) {
        app.serviceWorker.register(path, scope);
      });
    }
  }
};