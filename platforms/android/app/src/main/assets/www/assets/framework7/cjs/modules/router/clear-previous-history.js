"use strict";

exports.__esModule = true;
exports.clearPreviousHistory = clearPreviousHistory;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _appRouterCheck = _interopRequireDefault(require("./app-router-check"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function clearPreviousPages(router) {
  (0, _appRouterCheck.default)(router, 'clearPreviousPages');
  var app = router.app;
  var dynamicNavbar = router.dynamicNavbar;
  var $pagesToRemove = router.$el.children('.page').filter(function (pageInView) {
    if (router.currentRoute && (router.currentRoute.modal || router.currentRoute.panel)) return true;
    return pageInView !== router.currentPageEl;
  });
  $pagesToRemove.each(function (pageEl) {
    var $oldPageEl = (0, _dom.default)(pageEl);
    var $oldNavbarEl = (0, _dom.default)(app.navbar.getElByPage($oldPageEl));

    if (router.params.stackPages && router.initialPages.indexOf($oldPageEl[0]) >= 0) {
      $oldPageEl.addClass('stacked');

      if (dynamicNavbar) {
        $oldNavbarEl.addClass('stacked');
      }
    } else {
      // Page remove event
      router.pageCallback('beforeRemove', $oldPageEl, $oldNavbarEl, 'previous', undefined, {});
      router.removePage($oldPageEl);

      if (dynamicNavbar && $oldNavbarEl.length) {
        router.removeNavbar($oldNavbarEl);
      }
    }
  });
}

function clearPreviousHistory() {
  var router = this;
  (0, _appRouterCheck.default)(router, 'clearPreviousHistory');
  var url = router.history[router.history.length - 1];
  clearPreviousPages(router);
  router.history = [url];
  router.view.history = [url];
  router.saveHistory();
} // eslint-disable-line