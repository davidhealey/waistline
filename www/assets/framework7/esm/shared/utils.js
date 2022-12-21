import { getWindow } from 'ssr-window';
var uniqueNum = 0;
export function uniqueNumber() {
  uniqueNum += 1;
  return uniqueNum;
}
export function id(mask, map) {
  if (mask === void 0) {
    mask = 'xxxxxxxxxx';
  }

  if (map === void 0) {
    map = '0123456789abcdef';
  }

  var length = map.length;
  return mask.replace(/x/g, function () {
    return map[Math.floor(Math.random() * length)];
  });
}
export var mdPreloaderContent = "\n  <span class=\"preloader-inner\">\n    <svg viewBox=\"0 0 36 36\">\n      <circle cx=\"18\" cy=\"18\" r=\"16\"></circle>\n    </svg>\n  </span>\n".trim();
export var iosPreloaderContent = ("\n  <span class=\"preloader-inner\">\n    " + [0, 1, 2, 3, 4, 5, 6, 7].map(function () {
  return '<span class="preloader-inner-line"></span>';
}).join('') + "\n  </span>\n").trim();
export var auroraPreloaderContent = "\n  <span class=\"preloader-inner\">\n    <span class=\"preloader-inner-circle\"></span>\n  </span>\n";
export function eventNameToColonCase(eventName) {
  var hasColon;
  return eventName.split('').map(function (char, index) {
    if (char.match(/[A-Z]/) && index !== 0 && !hasColon) {
      hasColon = true;
      return ":" + char.toLowerCase();
    }

    return char.toLowerCase();
  }).join('');
}
export function deleteProps(obj) {
  var object = obj;
  Object.keys(object).forEach(function (key) {
    try {
      object[key] = null;
    } catch (e) {// no setter for object
    }

    try {
      delete object[key];
    } catch (e) {// something got wrong
    }
  });
}
export function requestAnimationFrame(callback) {
  var window = getWindow();
  return window.requestAnimationFrame(callback);
}
export function cancelAnimationFrame(frameId) {
  var window = getWindow();
  return window.cancelAnimationFrame(frameId);
}
export function nextTick(callback, delay) {
  if (delay === void 0) {
    delay = 0;
  }

  return setTimeout(callback, delay);
}
export function nextFrame(callback) {
  return requestAnimationFrame(function () {
    requestAnimationFrame(callback);
  });
}
export function now() {
  return Date.now();
}
export function parseUrlQuery(url) {
  var window = getWindow();
  var query = {};
  var urlToParse = url || window.location.href;
  var i;
  var params;
  var param;
  var length;

  if (typeof urlToParse === 'string' && urlToParse.length) {
    urlToParse = urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
    params = urlToParse.split('&').filter(function (paramsPart) {
      return paramsPart !== '';
    });
    length = params.length;

    for (i = 0; i < length; i += 1) {
      param = params[i].replace(/#\S+/g, '').split('=');
      query[decodeURIComponent(param[0])] = typeof param[1] === 'undefined' ? undefined : decodeURIComponent(param.slice(1).join('=')) || '';
    }
  }

  return query;
}
export function getTranslate(el, axis) {
  if (axis === void 0) {
    axis = 'x';
  }

  var window = getWindow();
  var matrix;
  var curTransform;
  var transformMatrix;
  var curStyle = window.getComputedStyle(el, null);

  if (window.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform;

    if (curTransform.split(',').length > 6) {
      curTransform = curTransform.split(', ').map(function (a) {
        return a.replace(',', '.');
      }).join(', ');
    } // Some old versions of Webkit choke when 'none' is passed; pass
    // empty string instead in this case


    transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
  } else {
    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
    matrix = transformMatrix.toString().split(',');
  }

  if (axis === 'x') {
    // Latest Chrome and webkits Fix
    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; // Crazy IE10 Matrix
    else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); // Normal Browsers
      else curTransform = parseFloat(matrix[4]);
  }

  if (axis === 'y') {
    // Latest Chrome and webkits Fix
    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; // Crazy IE10 Matrix
    else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); // Normal Browsers
      else curTransform = parseFloat(matrix[5]);
  }

  return curTransform || 0;
}
export function serializeObject(obj, parents) {
  if (parents === void 0) {
    parents = [];
  }

  if (typeof obj === 'string') return obj;
  var resultArray = [];
  var separator = '&';
  var newParents;

  function varName(name) {
    if (parents.length > 0) {
      var parentParts = '';

      for (var j = 0; j < parents.length; j += 1) {
        if (j === 0) parentParts += parents[j];else parentParts += "[" + encodeURIComponent(parents[j]) + "]";
      }

      return parentParts + "[" + encodeURIComponent(name) + "]";
    }

    return encodeURIComponent(name);
  }

  function varValue(value) {
    return encodeURIComponent(value);
  }

  Object.keys(obj).forEach(function (prop) {
    var toPush;

    if (Array.isArray(obj[prop])) {
      toPush = [];

      for (var i = 0; i < obj[prop].length; i += 1) {
        if (!Array.isArray(obj[prop][i]) && typeof obj[prop][i] === 'object') {
          newParents = parents.slice();
          newParents.push(prop);
          newParents.push(String(i));
          toPush.push(serializeObject(obj[prop][i], newParents));
        } else {
          toPush.push(varName(prop) + "[]=" + varValue(obj[prop][i]));
        }
      }

      if (toPush.length > 0) resultArray.push(toPush.join(separator));
    } else if (obj[prop] === null || obj[prop] === '') {
      resultArray.push(varName(prop) + "=");
    } else if (typeof obj[prop] === 'object') {
      // Object, convert to named array
      newParents = parents.slice();
      newParents.push(prop);
      toPush = serializeObject(obj[prop], newParents);
      if (toPush !== '') resultArray.push(toPush);
    } else if (typeof obj[prop] !== 'undefined' && obj[prop] !== '') {
      // Should be string or plain value
      resultArray.push(varName(prop) + "=" + varValue(obj[prop]));
    } else if (obj[prop] === '') resultArray.push(varName(prop));
  });
  return resultArray.join(separator);
}
export function isObject(o) {
  return typeof o === 'object' && o !== null && o.constructor && o.constructor === Object;
}
export function merge() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var to = args[0];
  args.splice(0, 1);
  var from = args;

  for (var i = 0; i < from.length; i += 1) {
    var nextSource = args[i];

    if (nextSource !== undefined && nextSource !== null) {
      var keysArray = Object.keys(Object(nextSource));

      for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
        var nextKey = keysArray[nextIndex];
        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

        if (desc !== undefined && desc.enumerable) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }

  return to;
}
export function extend() {
  var deep = true;
  var to;
  var from;

  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  if (typeof args[0] === 'boolean') {
    deep = args[0];
    to = args[1];
    args.splice(0, 2);
    from = args;
  } else {
    to = args[0];
    args.splice(0, 1);
    from = args;
  }

  for (var i = 0; i < from.length; i += 1) {
    var nextSource = args[i];

    if (nextSource !== undefined && nextSource !== null) {
      var keysArray = Object.keys(Object(nextSource));

      for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
        var nextKey = keysArray[nextIndex];
        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

        if (desc !== undefined && desc.enumerable) {
          if (!deep) {
            to[nextKey] = nextSource[nextKey];
          } else if (isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            extend(to[nextKey], nextSource[nextKey]);
          } else if (!isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            to[nextKey] = {};
            extend(to[nextKey], nextSource[nextKey]);
          } else {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
  }

  return to;
}
export function colorHexToRgb(hex) {
  var h = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  return result ? result.slice(1).map(function (n) {
    return parseInt(n, 16);
  }) : null;
}
export function colorRgbToHex(r, g, b) {
  var result = [r, g, b].map(function (n) {
    var hex = n.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
  return "#" + result;
}
export function colorRgbToHsl(r, g, b) {
  r /= 255; // eslint-disable-line

  g /= 255; // eslint-disable-line

  b /= 255; // eslint-disable-line

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var d = max - min;
  var h;
  if (d === 0) h = 0;else if (max === r) h = (g - b) / d % 6;else if (max === g) h = (b - r) / d + 2;else if (max === b) h = (r - g) / d + 4;
  var l = (min + max) / 2;
  var s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (h < 0) h = 360 / 60 + h;
  return [h * 60, s, l];
}
export function colorHslToRgb(h, s, l) {
  var c = (1 - Math.abs(2 * l - 1)) * s;
  var hp = h / 60;
  var x = c * (1 - Math.abs(hp % 2 - 1));
  var rgb1;

  if (Number.isNaN(h) || typeof h === 'undefined') {
    rgb1 = [0, 0, 0];
  } else if (hp <= 1) rgb1 = [c, x, 0];else if (hp <= 2) rgb1 = [x, c, 0];else if (hp <= 3) rgb1 = [0, c, x];else if (hp <= 4) rgb1 = [0, x, c];else if (hp <= 5) rgb1 = [x, 0, c];else if (hp <= 6) rgb1 = [c, 0, x];

  var m = l - c / 2;
  return rgb1.map(function (n) {
    return Math.max(0, Math.min(255, Math.round(255 * (n + m))));
  });
}
export function colorHsbToHsl(h, s, b) {
  var HSL = {
    h: h,
    s: 0,
    l: 0
  };
  var HSB = {
    h: h,
    s: s,
    b: b
  };
  HSL.l = (2 - HSB.s) * HSB.b / 2;
  HSL.s = HSL.l && HSL.l < 1 ? HSB.s * HSB.b / (HSL.l < 0.5 ? HSL.l * 2 : 2 - HSL.l * 2) : HSL.s;
  return [HSL.h, HSL.s, HSL.l];
}
export function colorHslToHsb(h, s, l) {
  var HSB = {
    h: h,
    s: 0,
    b: 0
  };
  var HSL = {
    h: h,
    s: s,
    l: l
  };
  var t = HSL.s * (HSL.l < 0.5 ? HSL.l : 1 - HSL.l);
  HSB.b = HSL.l + t;
  HSB.s = HSL.l > 0 ? 2 * t / HSB.b : HSB.s;
  return [HSB.h, HSB.s, HSB.b];
}
export function colorThemeCSSProperties() {
  var hex;
  var rgb;

  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  if (args.length === 1) {
    hex = args[0];
    rgb = colorHexToRgb(hex);
  } else if (args.length === 3) {
    rgb = args;
    hex = colorRgbToHex.apply(void 0, rgb);
  }

  if (!rgb) return {};
  var hsl = colorRgbToHsl.apply(void 0, rgb);
  var hslShade = [hsl[0], hsl[1], Math.max(0, hsl[2] - 0.08)];
  var hslTint = [hsl[0], hsl[1], Math.max(0, hsl[2] + 0.08)];
  var shade = colorRgbToHex.apply(void 0, colorHslToRgb.apply(void 0, hslShade));
  var tint = colorRgbToHex.apply(void 0, colorHslToRgb.apply(void 0, hslTint));
  return {
    '--f7-theme-color': hex,
    '--f7-theme-color-rgb': rgb.join(', '),
    '--f7-theme-color-shade': shade,
    '--f7-theme-color-tint': tint
  };
}
export function bindMethods(instance, obj) {
  Object.keys(obj).forEach(function (key) {
    if (isObject(obj[key])) {
      Object.keys(obj[key]).forEach(function (subKey) {
        if (typeof obj[key][subKey] === 'function') {
          obj[key][subKey] = obj[key][subKey].bind(instance);
        }
      });
    }

    instance[key] = obj[key];
  });
}
export function flattenArray() {
  var arr = [];

  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }

  args.forEach(function (arg) {
    if (Array.isArray(arg)) arr.push.apply(arr, flattenArray.apply(void 0, arg));else arr.push(arg);
  });
  return arr;
}