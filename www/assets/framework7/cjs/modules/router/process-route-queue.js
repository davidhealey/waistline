"use strict";

exports.__esModule = true;
exports.default = processRouteQueue;

function processQueue(router, routerQueue, routeQueue, to, from, resolve, _reject, direction) {
  var queue = [];

  if (Array.isArray(routeQueue)) {
    queue.push.apply(queue, routeQueue);
  } else if (routeQueue && typeof routeQueue === 'function') {
    queue.push(routeQueue);
  }

  if (routerQueue) {
    if (Array.isArray(routerQueue)) {
      queue.push.apply(queue, routerQueue);
    } else {
      queue.push(routerQueue);
    }
  }

  function next() {
    if (queue.length === 0) {
      resolve();
      return;
    }

    var queueItem = queue.shift();
    queueItem.call(router, {
      router: router,
      to: to,
      from: from,
      resolve: function resolve() {
        next();
      },
      reject: function reject() {
        _reject();
      },
      direction: direction,
      app: router.app
    });
  }

  next();
}

function processRouteQueue(to, from, resolve, reject, direction) {
  var router = this;

  function enterNextRoute() {
    if (to && to.route && (router.params.routesBeforeEnter || to.route.beforeEnter)) {
      router.allowPageChange = false;
      processQueue(router, router.params.routesBeforeEnter, to.route.beforeEnter, to, from, function () {
        router.allowPageChange = true;
        resolve();
      }, function () {
        reject();
      }, direction);
    } else {
      resolve();
    }
  }

  function leaveCurrentRoute() {
    if (from && from.route && (router.params.routesBeforeLeave || from.route.beforeLeave)) {
      router.allowPageChange = false;
      processQueue(router, router.params.routesBeforeLeave, from.route.beforeLeave, to, from, function () {
        router.allowPageChange = true;
        enterNextRoute();
      }, function () {
        reject();
      }, direction);
    } else {
      enterNextRoute();
    }
  }

  leaveCurrentRoute();
}