"use strict";

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../../shared/utils");

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function createStore(storeParams) {
  if (storeParams === void 0) {
    storeParams = {};
  }

  var store = {
    __store: true
  };

  var originalState = _extends({}, storeParams.state || {});

  var actions = _extends({}, storeParams.actions || {});

  var getters = _extends({}, storeParams.getters || {});

  var state = (0, _utils.extend)({}, originalState);
  var propsQueue = [];
  var gettersDependencies = {};
  var gettersCallbacks = {};
  Object.keys(getters).forEach(function (getterKey) {
    gettersDependencies[getterKey] = [];
    gettersCallbacks[getterKey] = [];
  });

  var getGetterValue = function getGetterValue(getterKey) {
    return getters[getterKey]({
      state: store.state
    });
  };

  var addGetterDependencies = function addGetterDependencies(getterKey, deps) {
    if (!gettersDependencies[getterKey]) gettersDependencies[getterKey] = [];
    deps.forEach(function (dep) {
      if (gettersDependencies[getterKey].indexOf(dep) < 0) {
        gettersDependencies[getterKey].push(dep);
      }
    });
  };

  var addGetterCallback = function addGetterCallback(getterKey, callback) {
    if (!gettersCallbacks[getterKey]) gettersCallbacks[getterKey] = [];
    gettersCallbacks[getterKey].push(callback);
  };

  var runGetterCallbacks = function runGetterCallbacks(stateKey) {
    var keys = Object.keys(gettersDependencies).filter(function (getterKey) {
      return gettersDependencies[getterKey].indexOf(stateKey) >= 0;
    });
    keys.forEach(function (getterKey) {
      if (!gettersCallbacks[getterKey] || !gettersCallbacks[getterKey].length) return;
      gettersCallbacks[getterKey].forEach(function (callback) {
        callback(getGetterValue(getterKey));
      });
    });
  };

  var removeGetterCallback = function removeGetterCallback(callback) {
    Object.keys(gettersCallbacks).forEach(function (stateKey) {
      var callbacks = gettersCallbacks[stateKey];

      if (callbacks.indexOf(callback) >= 0) {
        callbacks.splice(callbacks.indexOf(callback), 1);
      }
    });
  }; // eslint-disable-next-line


  store.__removeCallback = function (callback) {
    removeGetterCallback(callback);
  };

  var getterValue = function getterValue(getterKey, addCallback) {
    if (addCallback === void 0) {
      addCallback = true;
    }

    if (getterKey === 'constructor') return undefined;
    propsQueue = [];
    var value = getGetterValue(getterKey);
    addGetterDependencies(getterKey, propsQueue);

    var onUpdated = function onUpdated(callback) {
      addGetterCallback(getterKey, callback);
    };

    var obj = {
      value: value,
      onUpdated: onUpdated
    };

    if (!addCallback) {
      return obj;
    }

    var callback = function callback(v) {
      obj.value = v;
    };

    obj.__callback = callback;
    addGetterCallback(getterKey, callback); // eslint-disable-next-line

    return obj;
  };

  store.state = new Proxy(state, {
    set: function set(target, prop, value) {
      target[prop] = value;
      runGetterCallbacks(prop);
      return true;
    },
    get: function get(target, prop) {
      propsQueue.push(prop);
      return target[prop];
    }
  });
  store.getters = new Proxy(getters, {
    set: function set() {
      return false;
    },
    get: function get(target, prop) {
      if (!target[prop]) {
        return undefined;
      }

      return getterValue(prop, true);
    }
  });
  store._gettersPlain = new Proxy(getters, {
    set: function set() {
      return false;
    },
    get: function get(target, prop) {
      if (!target[prop]) {
        return undefined;
      }

      return getterValue(prop, false);
    }
  });

  store.dispatch = function (actionName, data) {
    return new Promise(function (resolve, reject) {
      if (!actions[actionName]) {
        reject();
        throw new Error("Framework7: Store action \"" + actionName + "\" is not found");
      }

      var result = actions[actionName]({
        state: store.state,
        dispatch: store.dispatch
      }, data);
      resolve(result);
    });
  };

  return store;
}

var _default = createStore;
exports.default = _default;