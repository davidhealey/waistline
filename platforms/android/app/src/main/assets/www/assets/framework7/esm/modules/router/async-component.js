export default function asyncComponent(router, component, resolve, reject) {
  function resolvePromise(componentPromise) {
    componentPromise.then(function (c) {
      // eslint-disable-next-line
      resolve({
        component: c.default || c._default || c
      });
    }).catch(function (err) {
      reject();
      throw new Error(err);
    });
  }

  if (component instanceof Promise) {
    resolvePromise(component);
    return;
  }

  var asyncComponentResult = component.call(router);

  if (asyncComponentResult instanceof Promise) {
    resolvePromise(asyncComponentResult);
  } else {
    resolve({
      component: asyncComponentResult
    });
  }
}