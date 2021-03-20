import Router from './router-class';
export default {
  name: 'router',
  static: {
    Router: Router
  },
  instance: {
    cache: {
      xhr: [],
      templates: [],
      components: []
    }
  },
  create: function create() {
    var instance = this;

    if (instance.app) {
      // View Router
      if (instance.params.router) {
        instance.router = new Router(instance.app, instance);
      }
    } else {
      // App Router
      instance.router = new Router(instance);
    }
  }
};