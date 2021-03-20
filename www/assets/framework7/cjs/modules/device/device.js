"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _getDevice = require("../../shared/get-device");

var _default = {
  name: 'device',
  static: {
    getDevice: _getDevice.getDevice
  },
  on: {
    init: function init() {
      var document = (0, _ssrWindow.getDocument)();
      var device = (0, _getDevice.getDevice)();
      var classNames = [];
      var html = document.querySelector('html');
      var metaStatusbar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!html) return;

      if (device.standalone && device.ios && metaStatusbar && metaStatusbar.content === 'black-translucent') {
        classNames.push('device-full-viewport');
      } // Pixel Ratio


      classNames.push("device-pixel-ratio-" + Math.floor(device.pixelRatio)); // OS classes

      if (device.os && !device.desktop) {
        classNames.push("device-" + device.os);
      } else if (device.desktop) {
        classNames.push('device-desktop');

        if (device.os) {
          classNames.push("device-" + device.os);
        }
      }

      if (device.cordova || device.phonegap) {
        classNames.push('device-cordova');
      }

      if (device.capacitor) {
        classNames.push('device-capacitor');
      } // Add html classes


      classNames.forEach(function (className) {
        html.classList.add(className);
      });
    }
  }
};
exports.default = _default;