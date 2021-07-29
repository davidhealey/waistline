"use strict";

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _getDevice = require("../../shared/get-device");

var _alphaSlider = _interopRequireDefault(require("./modules/alpha-slider"));

var _currentColor = _interopRequireDefault(require("./modules/current-color"));

var _hex = _interopRequireDefault(require("./modules/hex"));

var _hsbSliders = _interopRequireDefault(require("./modules/hsb-sliders"));

var _hueSlider = _interopRequireDefault(require("./modules/hue-slider"));

var _brightnessSlider = _interopRequireDefault(require("./modules/brightness-slider"));

var _palette = _interopRequireDefault(require("./modules/palette"));

var _initialCurrentColors = _interopRequireDefault(require("./modules/initial-current-colors"));

var _rgbBars = _interopRequireDefault(require("./modules/rgb-bars"));

var _rgbSliders = _interopRequireDefault(require("./modules/rgb-sliders"));

var _sbSpectrum = _interopRequireDefault(require("./modules/sb-spectrum"));

var _hsSpectrum = _interopRequireDefault(require("./modules/hs-spectrum"));

var _wheel = _interopRequireDefault(require("./modules/wheel"));

var _$jsx = _interopRequireDefault(require("../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var ColorPicker = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(ColorPicker, _Framework7Class);

  function ColorPicker(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var self = _assertThisInitialized(_this);

    self.params = (0, _utils.extend)({}, app.params.colorPicker, params);
    var $containerEl;

    if (self.params.containerEl) {
      $containerEl = (0, _dom.default)(self.params.containerEl);
      if ($containerEl.length === 0) return self || _assertThisInitialized(_this);
    }

    var $inputEl;

    if (self.params.inputEl) {
      $inputEl = (0, _dom.default)(self.params.inputEl);
    }

    var $targetEl;

    if (self.params.targetEl) {
      $targetEl = (0, _dom.default)(self.params.targetEl);
    }

    (0, _utils.extend)(self, {
      app: app,
      $containerEl: $containerEl,
      containerEl: $containerEl && $containerEl[0],
      inline: $containerEl && $containerEl.length > 0,
      $inputEl: $inputEl,
      inputEl: $inputEl && $inputEl[0],
      $targetEl: $targetEl,
      targetEl: $targetEl && $targetEl[0],
      initialized: false,
      opened: false,
      url: self.params.url,
      modules: {
        'alpha-slider': _alphaSlider.default,
        'current-color': _currentColor.default,
        hex: _hex.default,
        // eslint-disable-line
        'hsb-sliders': _hsbSliders.default,
        'hue-slider': _hueSlider.default,
        'brightness-slider': _brightnessSlider.default,
        palette: _palette.default,
        // eslint-disable-line
        'initial-current-colors': _initialCurrentColors.default,
        'rgb-bars': _rgbBars.default,
        'rgb-sliders': _rgbSliders.default,
        'sb-spectrum': _sbSpectrum.default,
        'hs-spectrum': _hsSpectrum.default,
        wheel: _wheel.default // eslint-disable-line

      }
    });

    function onInputClick() {
      self.open();
    }

    function onInputFocus(e) {
      e.preventDefault();
    }

    function onTargetClick() {
      self.open();
    }

    function onHtmlClick(e) {
      if (self.destroyed || !self.params) return;
      if (self.params.openIn === 'page') return;
      var $clickTargetEl = (0, _dom.default)(e.target);
      if (!self.opened || self.closing) return;
      if ($clickTargetEl.closest('[class*="backdrop"]').length) return;
      if ($clickTargetEl.closest('.color-picker-popup, .color-picker-popover').length) return;

      if ($inputEl && $inputEl.length > 0) {
        if ($clickTargetEl[0] !== $inputEl[0] && $clickTargetEl.closest('.sheet-modal').length === 0) {
          self.close();
        }
      } else if ((0, _dom.default)(e.target).closest('.sheet-modal').length === 0) {
        self.close();
      }
    } // Events


    (0, _utils.extend)(self, {
      attachInputEvents: function attachInputEvents() {
        self.$inputEl.on('click', onInputClick);

        if (self.params.inputReadOnly) {
          self.$inputEl.on('focus mousedown', onInputFocus);

          if (self.$inputEl[0]) {
            self.$inputEl[0].f7ValidateReadonly = true;
          }
        }
      },
      detachInputEvents: function detachInputEvents() {
        self.$inputEl.off('click', onInputClick);

        if (self.params.inputReadOnly) {
          self.$inputEl.off('focus mousedown', onInputFocus);

          if (self.$inputEl[0]) {
            delete self.$inputEl[0].f7ValidateReadonly;
          }
        }
      },
      attachTargetEvents: function attachTargetEvents() {
        self.$targetEl.on('click', onTargetClick);
      },
      detachTargetEvents: function detachTargetEvents() {
        self.$targetEl.off('click', onTargetClick);
      },
      attachHtmlEvents: function attachHtmlEvents() {
        app.on('click', onHtmlClick);
      },
      detachHtmlEvents: function detachHtmlEvents() {
        app.off('click', onHtmlClick);
      }
    });
    self.init();
    return self || _assertThisInitialized(_this);
  }

  var _proto = ColorPicker.prototype;

  _proto.attachEvents = function attachEvents() {
    var self = this;
    self.centerModules = self.centerModules.bind(self);

    if (self.params.centerModules) {
      self.app.on('resize', self.centerModules);
    }
  };

  _proto.detachEvents = function detachEvents() {
    var self = this;

    if (self.params.centerModules) {
      self.app.off('resize', self.centerModules);
    }
  };

  _proto.centerModules = function centerModules() {
    var self = this;
    if (!self.opened || !self.$el || self.inline) return;
    var $pageContentEl = self.$el.find('.page-content');
    if (!$pageContentEl.length) return;
    var _$pageContentEl$ = $pageContentEl[0],
        scrollHeight = _$pageContentEl$.scrollHeight,
        offsetHeight = _$pageContentEl$.offsetHeight;

    if (scrollHeight <= offsetHeight) {
      $pageContentEl.addClass('justify-content-center');
    } else {
      $pageContentEl.removeClass('justify-content-center');
    }
  };

  _proto.initInput = function initInput() {
    var self = this;
    if (!self.$inputEl) return;
    if (self.params.inputReadOnly) self.$inputEl.prop('readOnly', true);
  };

  _proto.getModalType = function getModalType() {
    var self = this;
    var app = self.app,
        modal = self.modal,
        params = self.params;
    var openIn = params.openIn,
        openInPhone = params.openInPhone;
    var device = (0, _getDevice.getDevice)();
    if (modal && modal.type) return modal.type;
    if (openIn !== 'auto') return openIn;
    if (self.inline) return null;

    if (device.ios) {
      return device.ipad ? 'popover' : openInPhone;
    }

    if (app.width >= 768 || device.desktop && app.theme === 'aurora') {
      return 'popover';
    }

    return openInPhone;
  };

  _proto.formatValue = function formatValue() {
    var self = this;
    var value = self.value;

    if (self.params.formatValue) {
      return self.params.formatValue.call(self, value);
    }

    return value.hex;
  } // eslint-disable-next-line
  ;

  _proto.normalizeHsValues = function normalizeHsValues(arr) {
    return [Math.floor(arr[0] * 10) / 10, Math.floor(arr[1] * 1000) / 1000, Math.floor(arr[2] * 1000) / 1000];
  };

  _proto.setValue = function setValue(value, updateModules) {
    if (value === void 0) {
      value = {};
    }

    if (updateModules === void 0) {
      updateModules = true;
    }

    var self = this;
    if (typeof value === 'undefined') return;

    var _ref = self.value || {},
        hex = _ref.hex,
        rgb = _ref.rgb,
        hsl = _ref.hsl,
        hsb = _ref.hsb,
        _ref$alpha = _ref.alpha,
        alpha = _ref$alpha === void 0 ? 1 : _ref$alpha,
        hue = _ref.hue,
        rgba = _ref.rgba,
        hsla = _ref.hsla;

    var needChangeEvent = self.value || !self.value && !self.params.value;
    var valueChanged;
    Object.keys(value).forEach(function (k) {
      if (!self.value || typeof self.value[k] === 'undefined') {
        valueChanged = true;
        return;
      }

      var v = value[k];

      if (Array.isArray(v)) {
        v.forEach(function (subV, subIndex) {
          if (subV !== self.value[k][subIndex]) {
            valueChanged = true;
          }
        });
      } else if (v !== self.value[k]) {
        valueChanged = true;
      }
    });
    if (!valueChanged) return;

    if (value.rgb || value.rgba) {
      var _ref2 = value.rgb || value.rgba,
          r = _ref2[0],
          g = _ref2[1],
          b = _ref2[2],
          _ref2$ = _ref2[3],
          a = _ref2$ === void 0 ? alpha : _ref2$;

      rgb = [r, g, b];
      hex = _utils.colorRgbToHex.apply(void 0, rgb);
      hsl = _utils.colorRgbToHsl.apply(void 0, rgb);
      hsb = _utils.colorHslToHsb.apply(void 0, hsl);
      hsl = self.normalizeHsValues(hsl);
      hsb = self.normalizeHsValues(hsb);
      hue = hsb[0];
      alpha = a;
      rgba = [rgb[0], rgb[1], rgb[2], a];
      hsla = [hsl[0], hsl[1], hsl[2], a];
    }

    if (value.hsl || value.hsla) {
      var _ref3 = value.hsl || value.hsla,
          h = _ref3[0],
          s = _ref3[1],
          l = _ref3[2],
          _ref3$ = _ref3[3],
          _a = _ref3$ === void 0 ? alpha : _ref3$;

      hsl = [h, s, l];
      rgb = _utils.colorHslToRgb.apply(void 0, hsl);
      hex = _utils.colorRgbToHex.apply(void 0, rgb);
      hsb = _utils.colorHslToHsb.apply(void 0, hsl);
      hsl = self.normalizeHsValues(hsl);
      hsb = self.normalizeHsValues(hsb);
      hue = hsb[0];
      alpha = _a;
      rgba = [rgb[0], rgb[1], rgb[2], _a];
      hsla = [hsl[0], hsl[1], hsl[2], _a];
    }

    if (value.hsb) {
      var _value$hsb = value.hsb,
          _h = _value$hsb[0],
          _s = _value$hsb[1],
          _b = _value$hsb[2],
          _value$hsb$ = _value$hsb[3],
          _a2 = _value$hsb$ === void 0 ? alpha : _value$hsb$;

      hsb = [_h, _s, _b];
      hsl = _utils.colorHsbToHsl.apply(void 0, hsb);
      rgb = _utils.colorHslToRgb.apply(void 0, hsl);
      hex = _utils.colorRgbToHex.apply(void 0, rgb);
      hsl = self.normalizeHsValues(hsl);
      hsb = self.normalizeHsValues(hsb);
      hue = hsb[0];
      alpha = _a2;
      rgba = [rgb[0], rgb[1], rgb[2], _a2];
      hsla = [hsl[0], hsl[1], hsl[2], _a2];
    }

    if (value.hex) {
      rgb = (0, _utils.colorHexToRgb)(value.hex);
      hex = _utils.colorRgbToHex.apply(void 0, rgb);
      hsl = _utils.colorRgbToHsl.apply(void 0, rgb);
      hsb = _utils.colorHslToHsb.apply(void 0, hsl);
      hsl = self.normalizeHsValues(hsl);
      hsb = self.normalizeHsValues(hsb);
      hue = hsb[0];
      rgba = [rgb[0], rgb[1], rgb[2], alpha];
      hsla = [hsl[0], hsl[1], hsl[2], alpha];
    }

    if (typeof value.alpha !== 'undefined') {
      alpha = value.alpha;

      if (typeof rgb !== 'undefined') {
        rgba = [rgb[0], rgb[1], rgb[2], alpha];
      }

      if (typeof hsl !== 'undefined') {
        hsla = [hsl[0], hsl[1], hsl[2], alpha];
      }
    }

    if (typeof value.hue !== 'undefined') {
      var _hsl = hsl,
          _h2 = _hsl[0],
          _s2 = _hsl[1],
          _l = _hsl[2]; // eslint-disable-line

      hsl = [value.hue, _s2, _l];
      hsb = _utils.colorHslToHsb.apply(void 0, hsl);
      rgb = _utils.colorHslToRgb.apply(void 0, hsl);
      hex = _utils.colorRgbToHex.apply(void 0, rgb);
      hsl = self.normalizeHsValues(hsl);
      hsb = self.normalizeHsValues(hsb);
      hue = hsb[0];
      rgba = [rgb[0], rgb[1], rgb[2], alpha];
      hsla = [hsl[0], hsl[1], hsl[2], alpha];
    }

    self.value = {
      hex: hex,
      alpha: alpha,
      hue: hue,
      rgb: rgb,
      hsl: hsl,
      hsb: hsb,
      rgba: rgba,
      hsla: hsla
    };
    if (!self.initialValue) self.initialValue = (0, _utils.extend)({}, self.value);
    self.updateValue(needChangeEvent);

    if (self.opened && updateModules) {
      self.updateModules();
    }
  };

  _proto.getValue = function getValue() {
    var self = this;
    return self.value;
  };

  _proto.updateValue = function updateValue(fireEvents) {
    if (fireEvents === void 0) {
      fireEvents = true;
    }

    var self = this;
    var $inputEl = self.$inputEl,
        value = self.value,
        $targetEl = self.$targetEl;

    if ($targetEl && self.params.targetElSetBackgroundColor) {
      var rgba = value.rgba;
      $targetEl.css('background-color', "rgba(" + rgba.join(', ') + ")");
    }

    if (fireEvents) {
      self.emit('local::change colorPickerChange', self, value);
    }

    if ($inputEl && $inputEl.length) {
      var inputValue = self.formatValue(value);

      if ($inputEl && $inputEl.length) {
        $inputEl.val(inputValue);

        if (fireEvents) {
          $inputEl.trigger('change');
        }
      }
    }
  };

  _proto.updateModules = function updateModules() {
    var self = this;
    var modules = self.modules;
    self.params.modules.forEach(function (m) {
      if (typeof m === 'string' && modules[m] && modules[m].update) {
        modules[m].update(self);
      } else if (m && m.update) {
        m.update(self);
      }
    });
  };

  _proto.update = function update() {
    var self = this;
    self.updateModules();
  };

  _proto.renderPicker = function renderPicker() {
    var self = this;
    var params = self.params,
        modules = self.modules;
    var html = '';
    params.modules.forEach(function (m) {
      if (typeof m === 'string' && modules[m] && modules[m].render) {
        html += modules[m].render(self);
      } else if (m && m.render) {
        html += m.render(self);
      }
    });
    return html;
  };

  _proto.renderNavbar = function renderNavbar() {
    var self = this;

    if (self.params.renderNavbar) {
      return self.params.renderNavbar.call(self, self);
    }

    var _self$params = self.params,
        openIn = _self$params.openIn,
        navbarTitleText = _self$params.navbarTitleText,
        navbarBackLinkText = _self$params.navbarBackLinkText,
        navbarCloseText = _self$params.navbarCloseText;
    return (0, _$jsx.default)("div", {
      class: "navbar"
    }, (0, _$jsx.default)("div", {
      class: "navbar-bg"
    }), (0, _$jsx.default)("div", {
      class: "navbar-inner sliding"
    }, openIn === 'page' && (0, _$jsx.default)("div", {
      class: "left"
    }, (0, _$jsx.default)("a", {
      class: "link back"
    }, (0, _$jsx.default)("i", {
      class: "icon icon-back"
    }), (0, _$jsx.default)("span", {
      class: "if-not-md"
    }, navbarBackLinkText))), (0, _$jsx.default)("div", {
      class: "title"
    }, navbarTitleText), openIn !== 'page' && (0, _$jsx.default)("div", {
      class: "right"
    }, (0, _$jsx.default)("a", {
      class: "link popup-close",
      "data-popup": ".color-picker-popup"
    }, navbarCloseText))));
  };

  _proto.renderToolbar = function renderToolbar() {
    var self = this;

    if (self.params.renderToolbar) {
      return self.params.renderToolbar.call(self, self);
    }

    return (0, _$jsx.default)("div", {
      class: "toolbar toolbar-top no-shadow"
    }, (0, _$jsx.default)("div", {
      class: "toolbar-inner"
    }, (0, _$jsx.default)("div", {
      class: "left"
    }), (0, _$jsx.default)("div", {
      class: "right"
    }, (0, _$jsx.default)("a", {
      class: "link sheet-close popover-close",
      "data-sheet": ".color-picker-sheet-modal",
      "data-popover": ".color-picker-popover"
    }, self.params.toolbarCloseText))));
  };

  _proto.renderInline = function renderInline() {
    var self = this;
    var _self$params2 = self.params,
        cssClass = _self$params2.cssClass,
        groupedModules = _self$params2.groupedModules;
    return (0, _$jsx.default)("div", {
      class: "color-picker color-picker-inline " + (groupedModules ? 'color-picker-grouped-modules' : '') + " " + (cssClass || '')
    }, self.renderPicker());
  };

  _proto.renderSheet = function renderSheet() {
    var self = this;
    var _self$params3 = self.params,
        cssClass = _self$params3.cssClass,
        toolbarSheet = _self$params3.toolbarSheet,
        groupedModules = _self$params3.groupedModules;
    return (0, _$jsx.default)("div", {
      class: "sheet-modal color-picker color-picker-sheet-modal " + (groupedModules ? 'color-picker-grouped-modules' : '') + " " + (cssClass || '')
    }, toolbarSheet && self.renderToolbar(), (0, _$jsx.default)("div", {
      class: "sheet-modal-inner"
    }, (0, _$jsx.default)("div", {
      class: "page-content"
    }, self.renderPicker())));
  };

  _proto.renderPopover = function renderPopover() {
    var self = this;
    var _self$params4 = self.params,
        cssClass = _self$params4.cssClass,
        toolbarPopover = _self$params4.toolbarPopover,
        groupedModules = _self$params4.groupedModules;
    return (0, _$jsx.default)("div", {
      class: "popover color-picker-popover " + (cssClass || '')
    }, (0, _$jsx.default)("div", {
      class: "popover-inner"
    }, (0, _$jsx.default)("div", {
      class: "color-picker " + (groupedModules ? 'color-picker-grouped-modules' : '')
    }, toolbarPopover && self.renderToolbar(), (0, _$jsx.default)("div", {
      class: "page-content"
    }, self.renderPicker()))));
  };

  _proto.renderPopup = function renderPopup() {
    var self = this;
    var _self$params5 = self.params,
        cssClass = _self$params5.cssClass,
        navbarPopup = _self$params5.navbarPopup,
        groupedModules = _self$params5.groupedModules;
    return (0, _$jsx.default)("div", {
      class: "popup color-picker-popup " + (cssClass || '')
    }, (0, _$jsx.default)("div", {
      class: "page"
    }, navbarPopup && self.renderNavbar(), (0, _$jsx.default)("div", {
      class: "color-picker " + (groupedModules ? 'color-picker-grouped-modules' : '')
    }, (0, _$jsx.default)("div", {
      class: "page-content"
    }, self.renderPicker()))));
  };

  _proto.renderPage = function renderPage() {
    var self = this;
    var _self$params6 = self.params,
        cssClass = _self$params6.cssClass,
        groupedModules = _self$params6.groupedModules;
    return (0, _$jsx.default)("div", {
      class: "page color-picker-page " + (cssClass || ''),
      "data-name": "color-picker-page"
    }, self.renderNavbar(), (0, _$jsx.default)("div", {
      class: "color-picker " + (groupedModules ? 'color-picker-grouped-modules' : '')
    }, (0, _$jsx.default)("div", {
      class: "page-content"
    }, self.renderPicker())));
  } // eslint-disable-next-line
  ;

  _proto.render = function render() {
    var self = this;
    var params = self.params;
    if (params.render) return params.render.call(self);
    if (self.inline) return self.renderInline();

    if (params.openIn === 'page') {
      return self.renderPage();
    }

    var modalType = self.getModalType();
    if (modalType === 'popover') return self.renderPopover();
    if (modalType === 'sheet') return self.renderSheet();
    if (modalType === 'popup') return self.renderPopup();
  };

  _proto.onOpen = function onOpen() {
    var self = this;
    var initialized = self.initialized,
        $el = self.$el,
        app = self.app,
        $inputEl = self.$inputEl,
        inline = self.inline,
        value = self.value,
        params = self.params,
        modules = self.modules;
    self.closing = false;
    self.opened = true;
    self.opening = true; // Init main events

    self.attachEvents();
    params.modules.forEach(function (m) {
      if (typeof m === 'string' && modules[m] && modules[m].init) {
        modules[m].init(self);
      } else if (m && m.init) {
        m.init(self);
      }
    });
    var updateValue = !value && params.value; // Set value

    if (!initialized) {
      if (value) self.setValue(value);else if (params.value) {
        self.setValue(params.value, false);
      } else if (!params.value) {
        self.setValue({
          hex: '#ff0000'
        }, false);
      }
    } else if (value) {
      self.initialValue = (0, _utils.extend)({}, value);
      self.setValue(value, false);
    } // Update input value


    if (updateValue) self.updateValue();
    self.updateModules(); // Center modules

    if (params.centerModules) {
      self.centerModules();
    } // Extra focus


    if (!inline && $inputEl && $inputEl.length && app.theme === 'md') {
      $inputEl.trigger('focus');
    }

    self.initialized = true; // Trigger events

    if ($el) {
      $el.trigger('colorpicker:open');
    }

    if ($inputEl) {
      $inputEl.trigger('colorpicker:open');
    }

    self.emit('local::open colorPickerOpen', self);
  };

  _proto.onOpened = function onOpened() {
    var self = this;
    self.opening = false;

    if (self.$el) {
      self.$el.trigger('colorpicker:opened');
    }

    if (self.$inputEl) {
      self.$inputEl.trigger('colorpicker:opened');
    }

    self.emit('local::opened colorPickerOpened', self);
  };

  _proto.onClose = function onClose() {
    var self = this;
    var app = self.app,
        params = self.params,
        modules = self.modules;
    self.opening = false;
    self.closing = true; // Detach events

    self.detachEvents();

    if (self.$inputEl) {
      if (app.theme === 'md') {
        self.$inputEl.trigger('blur');
      } else {
        var validate = self.$inputEl.attr('validate');
        var required = self.$inputEl.attr('required');

        if (validate && required) {
          app.input.validate(self.$inputEl);
        }
      }
    }

    params.modules.forEach(function (m) {
      if (typeof m === 'string' && modules[m] && modules[m].destroy) {
        modules[m].destroy(self);
      } else if (m && m.destroy) {
        m.destroy(self);
      }
    });

    if (self.$el) {
      self.$el.trigger('colorpicker:close');
    }

    if (self.$inputEl) {
      self.$inputEl.trigger('colorpicker:close');
    }

    self.emit('local::close colorPickerClose', self);
  };

  _proto.onClosed = function onClosed() {
    var self = this;
    self.opened = false;
    self.closing = false;

    if (!self.inline) {
      (0, _utils.nextTick)(function () {
        if (self.modal && self.modal.el && self.modal.destroy) {
          if (!self.params.routableModals) {
            self.modal.destroy();
          }
        }

        delete self.modal;
      });
    }

    if (self.$el) {
      self.$el.trigger('colorpicker:closed');
    }

    if (self.$inputEl) {
      self.$inputEl.trigger('colorpicker:closed');
    }

    self.emit('local::closed colorPickerClosed', self);
  };

  _proto.open = function open() {
    var self = this;
    var app = self.app,
        opened = self.opened,
        inline = self.inline,
        $inputEl = self.$inputEl,
        $targetEl = self.$targetEl,
        params = self.params;
    if (opened) return;

    if (inline) {
      self.$el = (0, _dom.default)(self.render());
      self.$el[0].f7ColorPicker = self;
      self.$containerEl.append(self.$el);
      self.onOpen();
      self.onOpened();
      return;
    }

    var colorPickerContent = self.render();

    if (params.openIn === 'page') {
      self.view.router.navigate({
        url: self.url,
        route: {
          content: colorPickerContent,
          path: self.url,
          on: {
            pageBeforeIn: function pageBeforeIn(e, page) {
              self.$el = page.$el.find('.color-picker');
              self.$el[0].f7ColorPicker = self;
              self.onOpen();
            },
            pageAfterIn: function pageAfterIn() {
              self.onOpened();
            },
            pageBeforeOut: function pageBeforeOut() {
              self.onClose();
            },
            pageAfterOut: function pageAfterOut() {
              self.onClosed();

              if (self.$el && self.$el[0]) {
                self.$el[0].f7ColorPicker = null;
                delete self.$el[0].f7ColorPicker;
              }
            }
          }
        }
      });
    } else {
      var modalType = self.getModalType();
      var backdrop = params.backdrop;

      if (backdrop === null || typeof backdrop === 'undefined') {
        if (modalType === 'popover' && app.params.popover.backdrop !== false) backdrop = true;
        if (modalType === 'popup') backdrop = true;
      }

      var modalParams = {
        targetEl: $targetEl || $inputEl,
        scrollToEl: params.scrollToInput ? $targetEl || $inputEl : undefined,
        content: colorPickerContent,
        backdrop: backdrop,
        closeByBackdropClick: params.closeByBackdropClick,
        on: {
          open: function open() {
            var modal = this;
            self.modal = modal;
            self.$el = modalType === 'popover' || modalType === 'popup' ? modal.$el.find('.color-picker') : modal.$el;
            self.$el[0].f7ColorPicker = self;
            self.onOpen();
          },
          opened: function opened() {
            self.onOpened();
          },
          close: function close() {
            self.onClose();
          },
          closed: function closed() {
            self.onClosed();

            if (self.$el && self.$el[0]) {
              self.$el[0].f7ColorPicker = null;
              delete self.$el[0].f7ColorPicker;
            }
          }
        }
      };

      if (modalType === 'popup') {
        modalParams.push = params.popupPush;
        modalParams.swipeToClose = params.popupSwipeToClose;
      }

      if (modalType === 'sheet') {
        modalParams.push = params.sheetPush;
        modalParams.swipeToClose = params.sheetSwipeToClose;
      }

      if (params.routableModals && self.view) {
        var _route;

        self.view.router.navigate({
          url: self.url,
          route: (_route = {
            path: self.url
          }, _route[modalType] = modalParams, _route)
        });
      } else {
        self.modal = app[modalType].create(modalParams);
        self.modal.open();
      }
    }
  };

  _proto.close = function close() {
    var self = this;
    var opened = self.opened,
        inline = self.inline;
    if (!opened) return;

    if (inline) {
      self.onClose();
      self.onClosed();
      return;
    }

    if (self.params.routableModals && self.view || self.params.openIn === 'page') {
      self.view.router.back();
    } else {
      self.modal.close();
    }
  };

  _proto.init = function init() {
    var self = this;
    self.initInput();

    if (self.inline) {
      self.open();
      self.emit('local::init colorPickerInit', self);
      return;
    }

    if (!self.initialized && self.params.value) {
      self.setValue(self.params.value);
    } // Attach input Events


    if (self.$inputEl) {
      self.attachInputEvents();
    }

    if (self.$targetEl) {
      self.attachTargetEvents();
    }

    if (self.params.closeByOutsideClick) {
      self.attachHtmlEvents();
    }

    self.emit('local::init colorPickerInit', self);
  };

  _proto.destroy = function destroy() {
    var self = this;
    if (self.destroyed) return;
    var $el = self.$el;
    self.emit('local::beforeDestroy colorPickerBeforeDestroy', self);
    if ($el) $el.trigger('colorpicker:beforedestroy');
    self.close(); // Detach Events

    self.detachEvents();

    if (self.$inputEl) {
      self.detachInputEvents();
    }

    if (self.$targetEl) {
      self.detachTargetEvents();
    }

    if (self.params.closeByOutsideClick) {
      self.detachHtmlEvents();
    }

    if ($el && $el.length) delete self.$el[0].f7ColorPicker;
    (0, _utils.deleteProps)(self);
    self.destroyed = true;
  };

  _createClass(ColorPicker, [{
    key: "view",
    get: function get() {
      var $inputEl = this.$inputEl,
          $targetEl = this.$targetEl,
          app = this.app,
          params = this.params;
      var view;

      if (params.view) {
        view = params.view;
      } else {
        if ($inputEl) {
          view = $inputEl.parents('.view').length && $inputEl.parents('.view')[0].f7View;
        }

        if (!view && $targetEl) {
          view = $targetEl.parents('.view').length && $targetEl.parents('.view')[0].f7View;
        }
      }

      if (!view) view = app.views.main;
      return view;
    }
  }]);

  return ColorPicker;
}(_class.default);

var _default = ColorPicker;
exports.default = _default;