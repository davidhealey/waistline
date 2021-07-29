"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

var _getDevice = require("../../shared/get-device");

var _pickerColumn = _interopRequireDefault(require("./picker-column"));

var _$jsx = _interopRequireDefault(require("../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Picker = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Picker, _Framework7Class);

  function Picker(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var picker = _assertThisInitialized(_this);

    var device = (0, _getDevice.getDevice)();
    var window = (0, _ssrWindow.getWindow)();
    picker.params = (0, _utils.extend)({}, app.params.picker, params);
    var $containerEl;

    if (picker.params.containerEl) {
      $containerEl = (0, _dom.default)(picker.params.containerEl);
      if ($containerEl.length === 0) return picker || _assertThisInitialized(_this);
    }

    var $inputEl;

    if (picker.params.inputEl) {
      $inputEl = (0, _dom.default)(picker.params.inputEl);
    }

    var $scrollToEl = picker.params.scrollToInput ? $inputEl : undefined;

    if (picker.params.scrollToEl) {
      var scrollToEl = (0, _dom.default)(picker.params.scrollToEl);

      if (scrollToEl.length > 0) {
        $scrollToEl = scrollToEl;
      }
    }

    (0, _utils.extend)(picker, {
      app: app,
      $containerEl: $containerEl,
      containerEl: $containerEl && $containerEl[0],
      inline: $containerEl && $containerEl.length > 0,
      needsOriginFix: device.ios || window.navigator.userAgent.toLowerCase().indexOf('safari') >= 0 && window.navigator.userAgent.toLowerCase().indexOf('chrome') < 0 && !device.android,
      cols: [],
      $inputEl: $inputEl,
      inputEl: $inputEl && $inputEl[0],
      $scrollToEl: $scrollToEl,
      initialized: false,
      opened: false,
      url: picker.params.url
    });

    function onResize() {
      picker.resizeCols();
    }

    function onInputClick() {
      picker.open();
    }

    function onInputFocus(e) {
      e.preventDefault();
    }

    function onHtmlClick(e) {
      if (picker.destroyed || !picker.params) return;
      var $targetEl = (0, _dom.default)(e.target);
      if (picker.isPopover()) return;
      if (!picker.opened || picker.closing) return;
      if ($targetEl.closest('[class*="backdrop"]').length) return;

      if ($inputEl && $inputEl.length > 0) {
        if ($targetEl[0] !== $inputEl[0] && $targetEl.closest('.sheet-modal').length === 0) {
          picker.close();
        }
      } else if ((0, _dom.default)(e.target).closest('.sheet-modal').length === 0) {
        picker.close();
      }
    } // Events


    (0, _utils.extend)(picker, {
      attachResizeEvent: function attachResizeEvent() {
        app.on('resize', onResize);
      },
      detachResizeEvent: function detachResizeEvent() {
        app.off('resize', onResize);
      },
      attachInputEvents: function attachInputEvents() {
        picker.$inputEl.on('click', onInputClick);

        if (picker.params.inputReadOnly) {
          picker.$inputEl.on('focus mousedown', onInputFocus);

          if (picker.$inputEl[0]) {
            picker.$inputEl[0].f7ValidateReadonly = true;
          }
        }
      },
      detachInputEvents: function detachInputEvents() {
        picker.$inputEl.off('click', onInputClick);

        if (picker.params.inputReadOnly) {
          picker.$inputEl.off('focus mousedown', onInputFocus);

          if (picker.$inputEl[0]) {
            delete picker.$inputEl[0].f7ValidateReadonly;
          }
        }
      },
      attachHtmlEvents: function attachHtmlEvents() {
        app.on('click', onHtmlClick);
      },
      detachHtmlEvents: function detachHtmlEvents() {
        app.off('click', onHtmlClick);
      }
    });
    picker.init();
    return picker || _assertThisInitialized(_this);
  }

  var _proto = Picker.prototype;

  _proto.initInput = function initInput() {
    var picker = this;
    if (!picker.$inputEl) return;
    if (picker.params.inputReadOnly) picker.$inputEl.prop('readOnly', true);
  };

  _proto.resizeCols = function resizeCols() {
    var picker = this;
    if (!picker.opened) return;

    for (var i = 0; i < picker.cols.length; i += 1) {
      if (!picker.cols[i].divider) {
        picker.cols[i].calcSize();
        picker.cols[i].setValue(picker.cols[i].value, 0, false);
      }
    }
  };

  _proto.isPopover = function isPopover() {
    var picker = this;
    var app = picker.app,
        modal = picker.modal,
        params = picker.params;
    var device = (0, _getDevice.getDevice)();
    if (params.openIn === 'sheet') return false;
    if (modal && modal.type !== 'popover') return false;

    if (!picker.inline && picker.inputEl) {
      if (params.openIn === 'popover') return true;

      if (device.ios) {
        return !!device.ipad;
      }

      if (app.width >= 768) {
        return true;
      }

      if (device.desktop && app.theme === 'aurora') {
        return true;
      }
    }

    return false;
  };

  _proto.formatValue = function formatValue() {
    var picker = this;
    var value = picker.value,
        displayValue = picker.displayValue;

    if (picker.params.formatValue) {
      return picker.params.formatValue.call(picker, value, displayValue);
    }

    return value.join(' ');
  };

  _proto.setValue = function setValue(values, transition) {
    var picker = this;
    var valueIndex = 0;

    if (picker.cols.length === 0) {
      picker.value = values;
      picker.updateValue(values);
      return;
    }

    for (var i = 0; i < picker.cols.length; i += 1) {
      if (picker.cols[i] && !picker.cols[i].divider) {
        picker.cols[i].setValue(values[valueIndex], transition);
        valueIndex += 1;
      }
    }
  };

  _proto.getValue = function getValue() {
    var picker = this;
    return picker.value;
  };

  _proto.updateValue = function updateValue(forceValues) {
    var picker = this;
    var newValue = forceValues || [];
    var newDisplayValue = [];
    var column;

    if (picker.cols.length === 0) {
      var noDividerColumns = picker.params.cols.filter(function (c) {
        return !c.divider;
      });

      for (var i = 0; i < noDividerColumns.length; i += 1) {
        column = noDividerColumns[i];

        if (column.displayValues !== undefined && column.values !== undefined && column.values.indexOf(newValue[i]) !== -1) {
          newDisplayValue.push(column.displayValues[column.values.indexOf(newValue[i])]);
        } else {
          newDisplayValue.push(newValue[i]);
        }
      }
    } else {
      for (var _i = 0; _i < picker.cols.length; _i += 1) {
        if (!picker.cols[_i].divider) {
          newValue.push(picker.cols[_i].value);
          newDisplayValue.push(picker.cols[_i].displayValue);
        }
      }
    }

    if (newValue.indexOf(undefined) >= 0) {
      return;
    }

    picker.value = newValue;
    picker.displayValue = newDisplayValue;
    picker.emit('local::change pickerChange', picker, picker.value, picker.displayValue);

    if (picker.inputEl) {
      picker.$inputEl.val(picker.formatValue());
      picker.$inputEl.trigger('change');
    }
  };

  _proto.initColumn = function initColumn(colEl, updateItems) {
    var picker = this;

    _pickerColumn.default.call(picker, colEl, updateItems);
  } // eslint-disable-next-line
  ;

  _proto.destroyColumn = function destroyColumn(colEl) {
    var picker = this;
    var $colEl = (0, _dom.default)(colEl);
    var index = $colEl.index();

    if (picker.cols[index] && picker.cols[index].destroy) {
      picker.cols[index].destroy();
    }
  };

  _proto.renderToolbar = function renderToolbar() {
    var picker = this;
    if (picker.params.renderToolbar) return picker.params.renderToolbar.call(picker, picker);
    return (0, _$jsx.default)("div", {
      class: "toolbar toolbar-top no-shadow"
    }, (0, _$jsx.default)("div", {
      class: "toolbar-inner"
    }, (0, _$jsx.default)("div", {
      class: "left"
    }), (0, _$jsx.default)("div", {
      class: "right"
    }, (0, _$jsx.default)("a", {
      class: "link sheet-close popover-close"
    }, picker.params.toolbarCloseText))));
  } // eslint-disable-next-line
  ;

  _proto.renderColumn = function renderColumn(col, onlyItems) {
    var colClasses = "picker-column " + (col.textAlign ? "picker-column-" + col.textAlign : '') + " " + (col.cssClass || '');
    var columnHtml;
    var columnItemsHtml;

    if (col.divider) {
      // prettier-ignore
      columnHtml = "\n        <div class=\"" + colClasses + " picker-column-divider\">" + col.content + "</div>\n      ";
    } else {
      // prettier-ignore
      columnItemsHtml = col.values.map(function (value, index) {
        return "\n        <div class=\"picker-item\" data-picker-value=\"" + value + "\">\n          <span>" + (col.displayValues ? col.displayValues[index] : value) + "</span>\n        </div>\n      ";
      }).join(''); // prettier-ignore

      columnHtml = "\n        <div class=\"" + colClasses + "\">\n          <div class=\"picker-items\">" + columnItemsHtml + "</div>\n        </div>\n      ";
    }

    return onlyItems ? columnItemsHtml.trim() : columnHtml.trim();
  };

  _proto.renderInline = function renderInline() {
    var picker = this;
    var _picker$params = picker.params,
        rotateEffect = _picker$params.rotateEffect,
        cssClass = _picker$params.cssClass,
        toolbar = _picker$params.toolbar;
    var inlineHtml = (0, _$jsx.default)("div", {
      class: "picker picker-inline " + (rotateEffect ? 'picker-3d' : '') + " " + (cssClass || '')
    }, toolbar && picker.renderToolbar(), (0, _$jsx.default)("div", {
      class: "picker-columns"
    }, picker.cols.map(function (col) {
      return picker.renderColumn(col);
    }), (0, _$jsx.default)("div", {
      class: "picker-center-highlight"
    })));
    return inlineHtml;
  };

  _proto.renderSheet = function renderSheet() {
    var picker = this;
    var _picker$params2 = picker.params,
        rotateEffect = _picker$params2.rotateEffect,
        cssClass = _picker$params2.cssClass,
        toolbar = _picker$params2.toolbar;
    var sheetHtml = (0, _$jsx.default)("div", {
      class: "sheet-modal picker picker-sheet " + (rotateEffect ? 'picker-3d' : '') + " " + (cssClass || '')
    }, toolbar && picker.renderToolbar(), (0, _$jsx.default)("div", {
      class: "sheet-modal-inner picker-columns"
    }, picker.cols.map(function (col) {
      return picker.renderColumn(col);
    }), (0, _$jsx.default)("div", {
      class: "picker-center-highlight"
    })));
    return sheetHtml;
  };

  _proto.renderPopover = function renderPopover() {
    var picker = this;
    var _picker$params3 = picker.params,
        rotateEffect = _picker$params3.rotateEffect,
        cssClass = _picker$params3.cssClass,
        toolbar = _picker$params3.toolbar;
    var popoverHtml = (0, _$jsx.default)("div", {
      class: "popover picker-popover"
    }, (0, _$jsx.default)("div", {
      class: "popover-inner"
    }, (0, _$jsx.default)("div", {
      class: "picker " + (rotateEffect ? 'picker-3d' : '') + " " + (cssClass || '')
    }, toolbar && picker.renderToolbar(), (0, _$jsx.default)("div", {
      class: "picker-columns"
    }, picker.cols.map(function (col) {
      return picker.renderColumn(col);
    }), (0, _$jsx.default)("div", {
      class: "picker-center-highlight"
    })))));
    return popoverHtml;
  };

  _proto.render = function render() {
    var picker = this;
    if (picker.params.render) return picker.params.render.call(picker);

    if (!picker.inline) {
      if (picker.isPopover()) return picker.renderPopover();
      return picker.renderSheet();
    }

    return picker.renderInline();
  };

  _proto.onOpen = function onOpen() {
    var picker = this;
    var initialized = picker.initialized,
        $el = picker.$el,
        app = picker.app,
        $inputEl = picker.$inputEl,
        inline = picker.inline,
        value = picker.value,
        params = picker.params;
    picker.opened = true;
    picker.closing = false;
    picker.opening = true; // Init main events

    picker.attachResizeEvent(); // Init cols

    $el.find('.picker-column').each(function (colEl) {
      var updateItems = true;

      if (!initialized && params.value || initialized && value) {
        updateItems = false;
      }

      picker.initColumn(colEl, updateItems);
    }); // Set value

    if (!initialized) {
      if (value) picker.setValue(value, 0);else if (params.value) {
        picker.setValue(params.value, 0);
      }
    } else if (value) {
      picker.setValue(value, 0);
    } // Extra focus


    if (!inline && $inputEl && $inputEl.length && app.theme === 'md') {
      $inputEl.trigger('focus');
    }

    picker.initialized = true; // Trigger events

    if ($el) {
      $el.trigger('picker:open');
    }

    if ($inputEl) {
      $inputEl.trigger('picker:open');
    }

    picker.emit('local::open pickerOpen', picker);
  };

  _proto.onOpened = function onOpened() {
    var picker = this;
    picker.opening = false;

    if (picker.$el) {
      picker.$el.trigger('picker:opened');
    }

    if (picker.$inputEl) {
      picker.$inputEl.trigger('picker:opened');
    }

    picker.emit('local::opened pickerOpened', picker);
  };

  _proto.onClose = function onClose() {
    var picker = this;
    var app = picker.app;
    picker.opening = false;
    picker.closing = true; // Detach events

    picker.detachResizeEvent();
    picker.cols.forEach(function (col) {
      if (col.destroy) col.destroy();
    });

    if (picker.$inputEl) {
      if (app.theme === 'md') {
        picker.$inputEl.trigger('blur');
      } else {
        var validate = picker.$inputEl.attr('validate');
        var required = picker.$inputEl.attr('required');

        if (validate && required) {
          app.input.validate(picker.$inputEl);
        }
      }
    }

    if (picker.$el) {
      picker.$el.trigger('picker:close');
    }

    if (picker.$inputEl) {
      picker.$inputEl.trigger('picker:close');
    }

    picker.emit('local::close pickerClose', picker);
  };

  _proto.onClosed = function onClosed() {
    var picker = this;
    picker.opened = false;
    picker.closing = false;

    if (!picker.inline) {
      (0, _utils.nextTick)(function () {
        if (picker.modal && picker.modal.el && picker.modal.destroy) {
          if (!picker.params.routableModals) {
            picker.modal.destroy();
          }
        }

        delete picker.modal;
      });
    }

    if (picker.$el) {
      picker.$el.trigger('picker:closed');
    }

    if (picker.$inputEl) {
      picker.$inputEl.trigger('picker:closed');
    }

    picker.emit('local::closed pickerClosed', picker);
  };

  _proto.open = function open() {
    var picker = this;
    var app = picker.app,
        opened = picker.opened,
        inline = picker.inline,
        $inputEl = picker.$inputEl,
        $scrollToEl = picker.$scrollToEl,
        params = picker.params;
    if (opened) return;

    if (picker.cols.length === 0 && params.cols.length) {
      params.cols.forEach(function (col) {
        picker.cols.push(col);
      });
    }

    if (inline) {
      picker.$el = (0, _dom.default)(picker.render());
      picker.$el[0].f7Picker = picker;
      picker.$containerEl.append(picker.$el);
      picker.onOpen();
      picker.onOpened();
      return;
    }

    var isPopover = picker.isPopover();
    var modalType = isPopover ? 'popover' : 'sheet';
    var modalParams = {
      targetEl: $inputEl,
      scrollToEl: $scrollToEl,
      content: picker.render(),
      backdrop: typeof params.backdrop !== 'undefined' ? params.backdrop : isPopover,
      on: {
        open: function open() {
          var modal = this;
          picker.modal = modal;
          picker.$el = isPopover ? modal.$el.find('.picker') : modal.$el;
          picker.$el[0].f7Picker = picker;
          picker.onOpen();
        },
        opened: function opened() {
          picker.onOpened();
        },
        close: function close() {
          picker.onClose();
        },
        closed: function closed() {
          picker.onClosed();
        }
      }
    };

    if (modalType === 'sheet') {
      modalParams.push = params.sheetPush;
      modalParams.swipeToClose = params.sheetSwipeToClose;
    }

    if (params.routableModals && picker.view) {
      var _route;

      picker.view.router.navigate({
        url: picker.url,
        route: (_route = {
          path: picker.url
        }, _route[modalType] = modalParams, _route)
      });
    } else {
      picker.modal = app[modalType].create(modalParams);
      picker.modal.open();
    }
  };

  _proto.close = function close() {
    var picker = this;
    var opened = picker.opened,
        inline = picker.inline;
    if (!opened) return;

    if (inline) {
      picker.onClose();
      picker.onClosed();
      return;
    }

    if (picker.params.routableModals && picker.view) {
      picker.view.router.back();
    } else {
      picker.modal.close();
    }
  };

  _proto.init = function init() {
    var picker = this;
    picker.initInput();

    if (picker.inline) {
      picker.open();
      picker.emit('local::init pickerInit', picker);
      return;
    }

    if (!picker.initialized && picker.params.value) {
      picker.setValue(picker.params.value);
    } // Attach input Events


    if (picker.$inputEl) {
      picker.attachInputEvents();
    }

    if (picker.params.closeByOutsideClick) {
      picker.attachHtmlEvents();
    }

    picker.emit('local::init pickerInit', picker);
  };

  _proto.destroy = function destroy() {
    var picker = this;
    if (picker.destroyed) return;
    var $el = picker.$el;
    picker.emit('local::beforeDestroy pickerBeforeDestroy', picker);
    if ($el) $el.trigger('picker:beforedestroy');
    picker.close(); // Detach Events

    if (picker.$inputEl) {
      picker.detachInputEvents();
    }

    if (picker.params.closeByOutsideClick) {
      picker.detachHtmlEvents();
    }

    if ($el && $el.length) delete picker.$el[0].f7Picker;
    (0, _utils.deleteProps)(picker);
    picker.destroyed = true;
  };

  _createClass(Picker, [{
    key: "view",
    get: function get() {
      var app = this.app,
          params = this.params,
          $inputEl = this.$inputEl;
      var view;

      if (params.view) {
        view = params.view;
      } else if ($inputEl) {
        view = $inputEl.parents('.view').length && $inputEl.parents('.view')[0].f7View;
      }

      if (!view) view = app.views.main;
      return view;
    }
  }]);

  return Picker;
}(_class.default);

var _default = Picker;
exports.default = _default;