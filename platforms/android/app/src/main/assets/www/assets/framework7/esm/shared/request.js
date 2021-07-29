function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/* eslint-disable max-classes-per-file */
import { getWindow, getDocument } from 'ssr-window';
import { extend, serializeObject } from './utils';
var globals = {};
var jsonpRequests = 0;

var RequestResponse = function RequestResponse(obj) {
  Object.assign(this, obj);
};

var RequestError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(RequestError, _Error);

  function RequestError(obj) {
    var _this;

    _this = _Error.call(this) || this;
    Object.assign(_assertThisInitialized(_this), obj);
    return _this;
  }

  return RequestError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var request = function request(requestOptions) {
  return new Promise(function (resolve, reject) {
    var window = getWindow();
    var document = getDocument();
    var globalsNoCallbacks = extend({}, globals);
    'beforeCreate beforeOpen beforeSend error complete success statusCode'.split(' ').forEach(function (callbackName) {
      delete globalsNoCallbacks[callbackName];
    });
    var defaults = extend({
      url: window.location.toString(),
      method: 'GET',
      data: false,
      async: true,
      cache: true,
      user: '',
      password: '',
      headers: {},
      xhrFields: {},
      statusCode: {},
      processData: true,
      dataType: 'text',
      contentType: 'application/x-www-form-urlencoded',
      timeout: 0
    }, globalsNoCallbacks);
    var proceedRequest;
    var options = extend({}, defaults, requestOptions);

    if (requestOptions.abortController) {
      options.abortController = requestOptions.abortController;
    }

    if (options.abortController && options.abortController.canceled) {
      reject(new RequestError({
        options: options,
        status: 'canceled',
        message: 'canceled'
      }));
      return;
    } // Function to run XHR callbacks and events


    function fireCallback(callbackName) {
      /*
      Callbacks:
      beforeCreate (options),
      beforeOpen (xhr, options),
      beforeSend (xhr, options),
      error (xhr, status, message),
      complete (xhr, status),
      success (response, status, xhr),
      statusCode ()
      */
      var globalCallbackValue;
      var optionCallbackValue;

      for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
      }

      if (globals[callbackName]) {
        globalCallbackValue = globals[callbackName].apply(globals, data);
      }

      if (options[callbackName]) {
        optionCallbackValue = options[callbackName].apply(options, data);
      }

      if (typeof globalCallbackValue !== 'boolean') globalCallbackValue = true;
      if (typeof optionCallbackValue !== 'boolean') optionCallbackValue = true;

      if (options.abortController && options.abortController.canceled && (callbackName === 'beforeCreate' || callbackName === 'beforeOpen' || callbackName === 'beforeSend')) {
        return false;
      }

      return globalCallbackValue && optionCallbackValue;
    } // Before create callback


    proceedRequest = fireCallback('beforeCreate', options);

    if (proceedRequest === false) {
      reject(new RequestError({
        options: options,
        status: 'canceled',
        message: 'canceled'
      }));
      return;
    } // For jQuery guys


    if (options.type) options.method = options.type; // Parameters Prefix

    var paramsPrefix = options.url.indexOf('?') >= 0 ? '&' : '?'; // UC method

    var method = options.method.toUpperCase(); // Data to modify GET URL

    if ((method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'DELETE') && options.data) {
      var stringData;

      if (typeof options.data === 'string') {
        // Should be key=value string
        if (options.data.indexOf('?') >= 0) stringData = options.data.split('?')[1];else stringData = options.data;
      } else {
        // Should be key=value object
        stringData = serializeObject(options.data);
      }

      if (stringData.length) {
        options.url += paramsPrefix + stringData;
        if (paramsPrefix === '?') paramsPrefix = '&';
      }
    } // JSONP


    if (options.dataType === 'json' && options.url.indexOf('callback=') >= 0) {
      var callbackName = "f7jsonp_" + (Date.now() + (jsonpRequests += 1));
      var abortTimeout;
      var callbackSplit = options.url.split('callback=');
      var requestUrl = callbackSplit[0] + "callback=" + callbackName;

      if (callbackSplit[1].indexOf('&') >= 0) {
        var addVars = callbackSplit[1].split('&').filter(function (el) {
          return el.indexOf('=') > 0;
        }).join('&');
        if (addVars.length > 0) requestUrl += "&" + addVars;
      } // Create script


      var script = document.createElement('script');
      script.type = 'text/javascript';

      script.onerror = function onerror() {
        clearTimeout(abortTimeout);
        fireCallback('error', null, 'scripterror', 'scripterror');
        reject(new RequestError({
          options: options,
          status: 'scripterror',
          message: 'scripterror'
        }));
        fireCallback('complete', null, 'scripterror');
      };

      script.src = requestUrl; // Handler

      window[callbackName] = function jsonpCallback(data) {
        clearTimeout(abortTimeout);
        fireCallback('success', data);
        script.parentNode.removeChild(script);
        script = null;
        delete window[callbackName];
        resolve(new RequestResponse({
          options: options,
          data: data
        }));
      };

      document.querySelector('head').appendChild(script);

      if (options.timeout > 0) {
        abortTimeout = setTimeout(function () {
          script.parentNode.removeChild(script);
          script = null;
          fireCallback('error', null, 'timeout', 'timeout');
          reject(new RequestError({
            options: options,
            status: 'timeout',
            message: 'timeout'
          }));
        }, options.timeout);
      }

      return;
    } // Cache for GET/HEAD requests


    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'DELETE') {
      if (options.cache === false) {
        options.url += paramsPrefix + "_nocache" + Date.now();
      }
    } // Create XHR


    var xhr = new XMLHttpRequest();

    if (options.abortController) {
      var aborted = false;

      options.abortController.onAbort = function () {
        if (aborted) return;
        aborted = true;
        xhr.abort();
        reject(new RequestError({
          options: options,
          xhr: xhr,
          status: 'canceled',
          message: 'canceled'
        }));
      };
    } // Save Request URL


    xhr.requestUrl = options.url;
    xhr.requestParameters = options; // Before open callback

    proceedRequest = fireCallback('beforeOpen', xhr, options);

    if (proceedRequest === false) {
      reject(new RequestError({
        options: options,
        xhr: xhr,
        status: 'canceled',
        message: 'canceled'
      }));
      return;
    } // Open XHR


    xhr.open(method, options.url, options.async, options.user, options.password); // Create POST Data

    var postData = null;

    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && options.data) {
      if (options.processData) {
        var postDataInstances = [ArrayBuffer, Blob, Document, FormData]; // Post Data

        if (postDataInstances.indexOf(options.data.constructor) >= 0) {
          postData = options.data;
        } else {
          // POST Headers
          var boundary = "---------------------------" + Date.now().toString(16);

          if (options.contentType === 'multipart/form-data') {
            xhr.setRequestHeader('Content-Type', "multipart/form-data; boundary=" + boundary);
          } else {
            xhr.setRequestHeader('Content-Type', options.contentType);
          }

          postData = '';
          var data = serializeObject(options.data);

          if (options.contentType === 'multipart/form-data') {
            data = data.split('&');
            var newData = [];

            for (var i = 0; i < data.length; i += 1) {
              newData.push("Content-Disposition: form-data; name=\"" + data[i].split('=')[0] + "\"\r\n\r\n" + data[i].split('=')[1] + "\r\n");
            }

            postData = "--" + boundary + "\r\n" + newData.join("--" + boundary + "\r\n") + "--" + boundary + "--\r\n";
          } else if (options.contentType === 'application/json') {
            postData = JSON.stringify(options.data);
          } else {
            postData = data;
          }
        }
      } else {
        postData = options.data;
        xhr.setRequestHeader('Content-Type', options.contentType);
      }
    }

    if (options.dataType === 'json' && (!options.headers || !options.headers.Accept)) {
      xhr.setRequestHeader('Accept', 'application/json');
    } // Additional headers


    if (options.headers) {
      Object.keys(options.headers).forEach(function (headerName) {
        if (typeof options.headers[headerName] === 'undefined') return;
        xhr.setRequestHeader(headerName, options.headers[headerName]);
      });
    } // Check for crossDomain


    if (typeof options.crossDomain === 'undefined') {
      options.crossDomain = // eslint-disable-next-line
      /^([\w-]+:)?\/\/([^\/]+)/.test(options.url) && RegExp.$2 !== window.location.host;
    }

    if (!options.crossDomain) {
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }

    if (options.xhrFields) {
      extend(xhr, options.xhrFields);
    } // Handle XHR


    xhr.onload = function onload() {
      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 0) {
        var responseData;

        if (options.dataType === 'json') {
          var parseError;

          try {
            responseData = JSON.parse(xhr.responseText);
          } catch (err) {
            parseError = true;
          }

          if (!parseError) {
            fireCallback('success', responseData, xhr.status, xhr);
            resolve(new RequestResponse({
              options: options,
              data: responseData,
              status: xhr.status,
              xhr: xhr
            }));
          } else {
            fireCallback('error', xhr, 'parseerror', 'parseerror');
            reject(new RequestError({
              options: options,
              xhr: xhr,
              status: 'parseerror',
              message: 'parseerror'
            }));
          }
        } else {
          responseData = xhr.responseType === 'text' || xhr.responseType === '' ? xhr.responseText : xhr.response;
          fireCallback('success', responseData, xhr.status, xhr);
          resolve(new RequestResponse({
            options: options,
            data: responseData,
            status: xhr.status,
            xhr: xhr
          }));
        }
      } else {
        fireCallback('error', xhr, xhr.status, xhr.statusText);
        reject(new RequestError({
          options: options,
          xhr: xhr,
          status: xhr.status,
          message: xhr.statusText
        }));
      }

      if (options.statusCode) {
        if (globals.statusCode && globals.statusCode[xhr.status]) globals.statusCode[xhr.status](xhr);
        if (options.statusCode[xhr.status]) options.statusCode[xhr.status](xhr);
      }

      fireCallback('complete', xhr, xhr.status);
    };

    xhr.onerror = function onerror() {
      fireCallback('error', xhr, xhr.status, xhr.status);
      reject(new RequestError({
        options: options,
        xhr: xhr,
        status: xhr.status,
        message: xhr.statusText
      }));
      fireCallback('complete', xhr, 'error');
    }; // Timeout


    if (options.timeout > 0) {
      xhr.timeout = options.timeout;

      xhr.ontimeout = function () {
        fireCallback('error', xhr, 'timeout', 'timeout');
        reject(new RequestError({
          options: options,
          xhr: xhr,
          status: 'timeout',
          message: 'timeout'
        }));
        fireCallback('complete', xhr, 'timeout');
      };
    } // Ajax start callback


    proceedRequest = fireCallback('beforeSend', xhr, options);

    if (proceedRequest === false) {
      reject(new RequestError({
        options: options,
        xhr: xhr,
        status: 'canceled',
        message: 'canceled'
      }));
      return;
    } // Send XHR


    xhr.send(postData);
  });
};

function requestShortcut(method) {
  var _ref = [],
      url = _ref[0],
      data = _ref[1],
      success = _ref[2],
      error = _ref[3],
      dataType = _ref[4];

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  if (typeof args[1] === 'function') {
    url = args[0];
    success = args[1];
    error = args[2];
    dataType = args[3];
  } else {
    url = args[0];
    data = args[1];
    success = args[2];
    error = args[3];
    dataType = args[4];
  }

  [success, error].forEach(function (callback) {
    if (typeof callback === 'string') {
      dataType = callback;
      if (callback === success) success = undefined;else error = undefined;
    }
  });
  dataType = dataType || (method === 'json' || method === 'postJSON' ? 'json' : undefined);
  var requestOptions = {
    url: url,
    method: method === 'post' || method === 'postJSON' ? 'POST' : 'GET',
    data: data,
    success: success,
    error: error,
    dataType: dataType
  };

  if (method === 'postJSON') {
    extend(requestOptions, {
      contentType: 'application/json',
      processData: false,
      crossDomain: true,
      data: typeof data === 'string' ? data : JSON.stringify(data)
    });
  }

  return request(requestOptions);
}

Object.assign(request, {
  get: function get() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return requestShortcut.apply(void 0, ['get'].concat(args));
  },
  post: function post() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return requestShortcut.apply(void 0, ['post'].concat(args));
  },
  json: function json() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    return requestShortcut.apply(void 0, ['json'].concat(args));
  },
  getJSON: function getJSON() {
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    return requestShortcut.apply(void 0, ['json'].concat(args));
  },
  postJSON: function postJSON() {
    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    return requestShortcut.apply(void 0, ['postJSON'].concat(args));
  }
});

request.abortController = function () {
  var contoller = {
    canceled: false,
    onAbort: null,
    abort: function abort() {
      contoller.canceled = true;
      if (contoller.onAbort) contoller.onAbort();
    }
  };
  return contoller;
};

request.setup = function setup(options) {
  if (options.type && !options.method) {
    extend(options, {
      method: options.type
    });
  }

  extend(globals, options);
};

export default request;