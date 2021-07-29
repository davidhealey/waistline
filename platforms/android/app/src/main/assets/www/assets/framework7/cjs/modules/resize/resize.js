"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _getDevice = require("../../shared/get-device");

var _default = {
  name: 'resize',
  create: function create() {
    var app = this;

    app.getSize = function () {
      if (!app.el) return {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      };
      var offset = app.$el.offset();
      var _ref = [app.el.offsetWidth, app.el.offsetHeight, offset.left, offset.top],
          width = _ref[0],
          height = _ref[1],
          left = _ref[2],
          top = _ref[3];
      app.width = width;
      app.height = height;
      app.left = left;
      app.top = top;
      return {
        width: width,
        height: height,
        left: left,
        top: top
      };
    };
  },
  on: {
    init: function init() {
      var app = this;
      var window = (0, _ssrWindow.getWindow)(); // Get Size

      app.getSize(); // Emit resize

      window.addEventListener('resize', function () {
        app.emit('resize');
      }, false); // Emit orientationchange

      window.addEventListener('orientationchange', function () {
        app.emit('orientationchange');
      });
    },
    orientationchange: function orientationchange() {
      var document = (0, _ssrWindow.getDocument)();
      var device = (0, _getDevice.getDevice)(); // Fix iPad weird body scroll

      if (device.ipad) {
        document.body.scrollLeft = 0;
        setTimeout(function () {
          document.body.scrollLeft = 0;
        }, 0);
      }
    },
    resize: function resize() {
      var app = this;
      app.getSize();
    }
  }
};
exports.default = _default;