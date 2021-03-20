import { extend } from '../../shared/utils';
export default function redirect(direction, route, options) {
  var router = this;
  var r = route.route.redirect;
  var method = direction === 'forward' ? 'navigate' : 'back';

  if (options.initial && router.params.browserHistory) {
    options.replaceState = true; // eslint-disable-line

    options.history = true; // eslint-disable-line
  }

  function redirectResolve(redirectUrl, redirectOptions) {
    if (redirectOptions === void 0) {
      redirectOptions = {};
    }

    router.allowPageChange = true;
    router[method](redirectUrl, extend({}, options, redirectOptions));
  }

  function redirectReject() {
    router.allowPageChange = true;
  }

  if (typeof r === 'function') {
    router.allowPageChange = false;
    var redirectUrl = r.call(router, {
      router: router,
      to: route,
      resolve: redirectResolve,
      reject: redirectReject,
      direction: direction,
      app: router.app
    });

    if (redirectUrl && typeof redirectUrl === 'string') {
      router.allowPageChange = true;
      return router[method](redirectUrl, options);
    }

    return router;
  }

  return router[method](r, options);
}