"use strict";

exports.__esModule = true;
exports.default = void 0;

var EventsClass = /*#__PURE__*/function () {
  function EventsClass(parents) {
    if (parents === void 0) {
      parents = [];
    }

    var self = this;
    self.eventsParents = parents;
    self.eventsListeners = {};
  }

  var _proto = EventsClass.prototype;

  _proto.on = function on(events, handler, priority) {
    var self = this;
    if (typeof handler !== 'function') return self;
    var method = priority ? 'unshift' : 'push';
    events.split(' ').forEach(function (event) {
      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
      self.eventsListeners[event][method](handler);
    });
    return self;
  };

  _proto.once = function once(events, handler, priority) {
    var self = this;
    if (typeof handler !== 'function') return self;

    function onceHandler() {
      self.off(events, onceHandler);

      if (onceHandler.f7proxy) {
        delete onceHandler.f7proxy;
      }

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      handler.apply(self, args);
    }

    onceHandler.f7proxy = handler;
    return self.on(events, onceHandler, priority);
  };

  _proto.off = function off(events, handler) {
    var self = this;
    if (!self.eventsListeners) return self;
    events.split(' ').forEach(function (event) {
      if (typeof handler === 'undefined') {
        self.eventsListeners[event] = [];
      } else if (self.eventsListeners[event]) {
        self.eventsListeners[event].forEach(function (eventHandler, index) {
          if (eventHandler === handler || eventHandler.f7proxy && eventHandler.f7proxy === handler) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  };

  _proto.emit = function emit() {
    var self = this;
    if (!self.eventsListeners) return self;
    var events;
    var data;
    var context;
    var eventsParents;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
      events = args[0];
      data = args.slice(1, args.length);
      context = self;
      eventsParents = self.eventsParents;
    } else {
      events = args[0].events;
      data = args[0].data;
      context = args[0].context || self;
      eventsParents = args[0].local ? [] : args[0].parents || self.eventsParents;
    }

    var eventsArray = Array.isArray(events) ? events : events.split(' ');
    var localEvents = eventsArray.map(function (eventName) {
      return eventName.replace('local::', '');
    });
    var parentEvents = eventsArray.filter(function (eventName) {
      return eventName.indexOf('local::') < 0;
    });
    localEvents.forEach(function (event) {
      if (self.eventsListeners && self.eventsListeners[event]) {
        var handlers = [];
        self.eventsListeners[event].forEach(function (eventHandler) {
          handlers.push(eventHandler);
        });
        handlers.forEach(function (eventHandler) {
          eventHandler.apply(context, data);
        });
      }
    });

    if (eventsParents && eventsParents.length > 0) {
      eventsParents.forEach(function (eventsParent) {
        eventsParent.emit.apply(eventsParent, [parentEvents].concat(data));
      });
    }

    return self;
  };

  return EventsClass;
}();

var _default = EventsClass;
exports.default = _default;