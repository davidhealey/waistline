import { extend, nextTick } from '../../shared/utils';
import History from '../../shared/history';
import asyncComponent from './async-component';

function modalLoad(modalType, route, loadOptions, direction) {
  if (loadOptions === void 0) {
    loadOptions = {};
  }

  var router = this;
  var app = router.app;
  var isPanel = modalType === 'panel';
  var modalOrPanel = isPanel ? 'panel' : 'modal';
  var options = extend({
    animate: router.params.animate,
    browserHistory: true,
    history: true,
    on: {},
    once: {}
  }, loadOptions);
  var modalParams = extend({}, route.route[modalType]);
  var modalRoute = route.route;

  var routeCallback = function routeCallback(modal, name) {
    var on = options.on,
        once = options.once;
    var callback;

    if (name === 'open') {
      callback = on.modalOpen || once.modalOpen || on.panelOpen || once.panelOpen;
    }

    if (name === 'close') {
      callback = on.modalClose || once.modalClose || on.panelClose || once.panelClose;
    }

    if (name === 'closed') {
      callback = on.modalClosed || once.modalClosed || on.panelClosed || once.panelClosed;
    }

    if (callback) callback(modal);
  };

  function onModalLoaded() {
    // Create Modal
    var modal = app[modalType].create(modalParams);
    modalRoute.modalInstance = modal;
    var hasEl = modal.el;

    function closeOnSwipeBack() {
      modal.close();
    }

    modal.on(modalOrPanel + "Open", function () {
      if (!hasEl) {
        // Remove theme elements
        router.removeThemeElements(modal.el); // Emit events

        modal.$el.trigger(modalType.toLowerCase() + ":init " + modalType.toLowerCase() + ":mounted", route, modal);
        router.emit((!isPanel ? 'modalInit' : '') + " " + modalType + "Init " + modalType + "Mounted", modal.el, route, modal);
      }

      router.once('swipeBackMove', closeOnSwipeBack);
      routeCallback(modal, 'open');
    });
    modal.on(modalOrPanel + "Close", function () {
      router.off('swipeBackMove', closeOnSwipeBack);

      if (!modal.closeByRouter) {
        router.back();
      }

      routeCallback(modal, 'close');
    });
    modal.on(modalOrPanel + "Closed", function () {
      modal.$el.trigger(modalType.toLowerCase() + ":beforeremove", route, modal);
      modal.emit("" + (!isPanel ? 'modalBeforeRemove ' : '') + modalType + "BeforeRemove", modal.el, route, modal);
      var modalComponent = modal.el.f7Component;
      routeCallback(modal, 'closed');

      if (modalComponent) {
        modalComponent.destroy();
      }

      nextTick(function () {
        if (modalComponent || modalParams.component) {
          router.removeModal(modal.el);
        }

        modal.destroy();
        delete modal.route;
        delete modalRoute.modalInstance;
      });
    });

    if (options.route) {
      // Update Browser History
      if (router.params.browserHistory && options.browserHistory) {
        History.push(router.view.id, {
          url: options.route.url,
          modal: modalType
        }, (router.params.browserHistoryRoot || '') + router.params.browserHistorySeparator + options.route.url);
      } // Set Route


      if (options.route !== router.currentRoute) {
        modal.route = extend(options.route, {
          modal: modal
        });
        router.currentRoute = modal.route;
      } // Update Router History


      if (options.history && !options.reloadCurrent) {
        router.history.push(options.route.url);
        router.saveHistory();
      }
    }

    if (hasEl) {
      // Remove theme elements
      router.removeThemeElements(modal.el); // Emit events

      modal.$el.trigger(modalType.toLowerCase() + ":init " + modalType.toLowerCase() + ":mounted", route, modal);
      router.emit(modalOrPanel + "Init " + modalType + "Init " + modalType + "Mounted", modal.el, route, modal);
    } // Open


    modal.open(options.animate === false || options.animate === true ? options.animate : undefined);
  } // Load Modal Content


  function loadModal(loadModalParams, loadModalOptions) {
    // Load Modal Props
    var url = loadModalParams.url,
        content = loadModalParams.content,
        component = loadModalParams.component,
        componentUrl = loadModalParams.componentUrl; // Component/Template Callbacks

    function resolve(contentEl) {
      if (contentEl) {
        if (typeof contentEl === 'string') {
          modalParams.content = contentEl;
        } else if (contentEl.f7Component) {
          contentEl.f7Component.mount(function (componentEl) {
            modalParams.el = componentEl;
            app.$el.append(componentEl);
          });
        } else {
          modalParams.el = contentEl;
        }

        onModalLoaded();
      }
    }

    function reject() {
      router.allowPageChange = true;
      return router;
    }

    if (content) {
      resolve(content);
    } else if (component || componentUrl) {
      // Load from component (F7/Vue/React/...)
      try {
        router.modalComponentLoader({
          rootEl: app.el,
          component: component,
          componentUrl: componentUrl,
          options: loadModalOptions,
          resolve: resolve,
          reject: reject
        });
      } catch (err) {
        router.allowPageChange = true;
        throw err;
      }
    } else if (url) {
      // Load using XHR
      if (router.xhrAbortController) {
        router.xhrAbortController.abort();
        router.xhrAbortController = false;
      }

      router.xhrRequest(url, loadModalOptions).then(function (modalContent) {
        modalParams.content = modalContent;
        onModalLoaded();
      }).catch(function () {
        router.allowPageChange = true;
      });
    } else {
      onModalLoaded();
    }
  }

  var foundLoadProp;
  'url content component el componentUrl template'.split(' ').forEach(function (modalLoadProp) {
    if (modalParams[modalLoadProp] && !foundLoadProp) {
      var _loadModal;

      foundLoadProp = true;
      loadModal((_loadModal = {}, _loadModal[modalLoadProp] = modalParams[modalLoadProp], _loadModal), options);
    }
  });

  if (!foundLoadProp && modalType === 'actions') {
    onModalLoaded();
  } // Async


  function asyncResolve(resolveParams, resolveOptions) {
    loadModal(resolveParams, extend(options, resolveOptions));
  }

  function asyncReject() {
    router.allowPageChange = true;
  }

  if (modalParams.async) {
    modalParams.async.call(router, {
      router: router,
      to: options.route,
      from: router.currentRoute,
      resolve: asyncResolve,
      reject: asyncReject,
      direction: direction,
      app: app
    });
  }

  if (modalParams.asyncComponent) {
    asyncComponent(router, modalParams.asyncComponent, asyncResolve, asyncReject);
  }

  return router;
}

function modalRemove(modal) {
  extend(modal, {
    closeByRouter: true
  });
  modal.close();
}

export { modalLoad, modalRemove };