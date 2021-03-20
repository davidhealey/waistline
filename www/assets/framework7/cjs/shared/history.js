"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("./dom7"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var History = {
  queue: [],
  clearQueue: function clearQueue() {
    if (History.queue.length === 0) return;
    var currentQueue = History.queue.shift();
    currentQueue();
  },
  routerQueue: [],
  clearRouterQueue: function clearRouterQueue() {
    if (History.routerQueue.length === 0) return;
    var currentQueue = History.routerQueue.pop();
    var router = currentQueue.router,
        stateUrl = currentQueue.stateUrl,
        action = currentQueue.action;
    var animate = router.params.animate;
    if (router.params.browserHistoryAnimate === false) animate = false;

    if (action === 'back') {
      router.back({
        animate: animate,
        browserHistory: false
      });
    }

    if (action === 'load') {
      router.navigate(stateUrl, {
        animate: animate,
        browserHistory: false
      });
    }
  },
  handle: function handle(e) {
    if (History.blockPopstate) return;
    var app = this; // const mainView = app.views.main;

    var state = e.state;
    History.previousState = History.state;
    History.state = state;
    History.allowChange = true;
    History.clearQueue();
    state = History.state;
    if (!state) state = {};
    app.views.forEach(function (view) {
      var router = view.router;
      var viewState = state[view.id];

      if (!viewState && view.params.browserHistory) {
        viewState = {
          url: view.router.history[0]
        };
      }

      if (!viewState) return;
      var stateUrl = viewState.url || undefined;
      var animate = router.params.animate;
      if (router.params.browserHistoryAnimate === false) animate = false;

      if (stateUrl !== router.url) {
        if (router.history.indexOf(stateUrl) >= 0) {
          // Go Back
          if (router.allowPageChange) {
            router.back({
              animate: animate,
              browserHistory: false
            });
          } else {
            History.routerQueue.push({
              action: 'back',
              router: router
            });
          }
        } else if (router.allowPageChange) {
          // Load page
          router.navigate(stateUrl, {
            animate: animate,
            browserHistory: false
          });
        } else {
          History.routerQueue.unshift({
            action: 'load',
            stateUrl: stateUrl,
            router: router
          });
        }
      }
    });
  },
  initViewState: function initViewState(viewId, viewState) {
    var _extend;

    var window = (0, _ssrWindow.getWindow)();
    var newState = (0, _utils.extend)({}, History.state || {}, (_extend = {}, _extend[viewId] = viewState, _extend));
    History.state = newState;
    window.history.replaceState(newState, '');
  },
  push: function push(viewId, viewState, url) {
    var _extend2;

    var window = (0, _ssrWindow.getWindow)();

    if (url.substr(-3) === '#!/') {
      // eslint-disable-next-line
      url = url.replace('#!/', '');
    }

    if (!History.allowChange) {
      History.queue.push(function () {
        History.push(viewId, viewState, url);
      });
      return;
    }

    History.previousState = History.state;
    var newState = (0, _utils.extend)({}, History.previousState || {}, (_extend2 = {}, _extend2[viewId] = viewState, _extend2));
    History.state = newState;
    window.history.pushState(newState, '', url);
  },
  replace: function replace(viewId, viewState, url) {
    var _extend3;

    var window = (0, _ssrWindow.getWindow)();

    if (url.substr(-3) === '#!/') {
      // eslint-disable-next-line
      url = url.replace('#!/', '');
    }

    if (!History.allowChange) {
      History.queue.push(function () {
        History.replace(viewId, viewState, url);
      });
      return;
    }

    History.previousState = History.state;
    var newState = (0, _utils.extend)({}, History.previousState || {}, (_extend3 = {}, _extend3[viewId] = viewState, _extend3));
    History.state = newState;
    window.history.replaceState(newState, '', url);
  },
  go: function go(index) {
    var window = (0, _ssrWindow.getWindow)();
    History.allowChange = false;
    window.history.go(index);
  },
  back: function back() {
    var window = (0, _ssrWindow.getWindow)();
    History.allowChange = false;
    window.history.back();
  },
  allowChange: true,
  previousState: {},
  state: {},
  blockPopstate: true,
  init: function init(app) {
    var window = (0, _ssrWindow.getWindow)();
    var document = (0, _ssrWindow.getDocument)();
    History.state = window.history.state;
    (0, _dom.default)(window).on('load', function () {
      setTimeout(function () {
        History.blockPopstate = false;
      }, 0);
    });

    if (document.readyState && document.readyState === 'complete') {
      History.blockPopstate = false;
    }

    (0, _dom.default)(window).on('popstate', History.handle.bind(app));
  }
};
var _default = History;
exports.default = _default;