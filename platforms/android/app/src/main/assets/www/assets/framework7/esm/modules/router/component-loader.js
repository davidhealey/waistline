import { merge } from '../../shared/utils';
export default {
  name: 'routerComponentLoader',
  proto: {
    componentLoader: function componentLoader(component, componentUrl, options, resolve, reject) {
      if (options === void 0) {
        options = {};
      }

      var router = this;
      var app = router.app;
      var url = typeof component === 'string' ? component : componentUrl;
      var compiledUrl = router.replaceRequestUrlParams(url, options);

      function compile(componentFunction) {
        var context = options.context || {};
        if (typeof context === 'function') context = context.call(router);else if (typeof context === 'string') {
          try {
            context = JSON.parse(context);
          } catch (err) {
            reject(err);
            throw err;
          }
        }
        var componentContext = merge({}, context, {
          f7route: options.route,
          f7router: router
        });
        var componentProps = merge(options.route ? options.route.params || {} : {}, options.props || {}, options.routeProps || {});
        var componentEl;
        var componentRoot;

        if (options.componentOptions && options.componentOptions.el) {
          componentEl = options.componentOptions.el;
        }

        if (options.componentOptions && options.componentOptions.root) {
          componentRoot = options.componentOptions.root;
        }

        app.component.create(componentFunction, componentProps, {
          context: componentContext,
          el: componentEl,
          root: componentRoot
        }).then(function (createdComponent) {
          resolve(createdComponent.el);
        }).catch(function (err) {
          reject(err);
          throw new Error(err);
        });
      }

      var cachedComponent;

      if (compiledUrl && router.params.componentCache) {
        router.cache.components.forEach(function (cached) {
          if (cached.url === compiledUrl) cachedComponent = cached.component;
        });
      }

      if (compiledUrl && cachedComponent) {
        compile(cachedComponent);
      } else if (compiledUrl && !cachedComponent) {
        // Load via XHR
        if (router.xhrAbortController) {
          router.xhrAbortController.abort();
          router.xhrAbortController = false;
        }

        router.xhrRequest(url, options).then(function (loadedComponent) {
          var parsedComponent = app.component.parse(loadedComponent);

          if (router.params.componentCache) {
            router.cache.components.push({
              url: compiledUrl,
              component: parsedComponent
            });
          }

          compile(parsedComponent);
        }).catch(function (err) {
          reject();
          throw err;
        });
      } else {
        compile(component);
      }
    },
    modalComponentLoader: function modalComponentLoader(_temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          component = _ref.component,
          componentUrl = _ref.componentUrl,
          options = _ref.options,
          resolve = _ref.resolve,
          reject = _ref.reject;

      var router = this;
      router.componentLoader(component, componentUrl, options, function (el) {
        resolve(el);
      }, reject);
    },
    tabComponentLoader: function tabComponentLoader(_temp2) {
      var _ref2 = _temp2 === void 0 ? {} : _temp2,
          component = _ref2.component,
          componentUrl = _ref2.componentUrl,
          options = _ref2.options,
          resolve = _ref2.resolve,
          reject = _ref2.reject;

      var router = this;
      router.componentLoader(component, componentUrl, options, function (el) {
        resolve(el);
      }, reject);
    },
    pageComponentLoader: function pageComponentLoader(_temp3) {
      var _ref3 = _temp3 === void 0 ? {} : _temp3,
          component = _ref3.component,
          componentUrl = _ref3.componentUrl,
          options = _ref3.options,
          resolve = _ref3.resolve,
          reject = _ref3.reject;

      var router = this;
      router.componentLoader(component, componentUrl, options, function (el, newOptions) {
        if (newOptions === void 0) {
          newOptions = {};
        }

        resolve(el, newOptions);
      }, reject);
    }
  }
};