"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _getDevice = require("../../shared/get-device");

var _utils = require("../../shared/utils");

var _modalClass = _interopRequireDefault(require("../modal/modal-class"));

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _$jsx = _interopRequireDefault(require("../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Actions = /*#__PURE__*/function (_Modal) {
  _inheritsLoose(Actions, _Modal);

  function Actions(app, params) {
    var _this;

    var extendedParams = (0, _utils.extend)({
      on: {}
    }, app.params.actions, params); // Extends with open/close Modal methods;

    _this = _Modal.call(this, app, extendedParams) || this;

    var actions = _assertThisInitialized(_this);

    var device = (0, _getDevice.getDevice)();
    var window = (0, _ssrWindow.getWindow)();
    var document = (0, _ssrWindow.getDocument)();
    actions.params = extendedParams; // Buttons

    var groups;

    if (actions.params.buttons) {
      groups = actions.params.buttons;
      if (!Array.isArray(groups[0])) groups = [groups];
    }

    actions.groups = groups; // Find Element

    var $el;

    if (actions.params.el) {
      $el = (0, _dom.default)(actions.params.el).eq(0);
    } else if (actions.params.content) {
      $el = (0, _dom.default)(actions.params.content).filter(function (node) {
        return node.nodeType === 1;
      }).eq(0);
    } else if (actions.params.buttons) {
      if (actions.params.convertToPopover) {
        actions.popoverHtml = actions.renderPopover();
      }

      actions.actionsHtml = actions.render();
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal || _assertThisInitialized(_this);
    }

    if ($el && $el.length === 0 && !(actions.actionsHtml || actions.popoverHtml)) {
      return actions.destroy() || _assertThisInitialized(_this);
    } // Backdrop


    var $backdropEl;

    if (actions.params.backdrop && actions.params.backdropEl) {
      $backdropEl = (0, _dom.default)(actions.params.backdropEl);
    } else if (actions.params.backdrop) {
      $backdropEl = actions.$containerEl.children('.actions-backdrop');

      if ($backdropEl.length === 0) {
        $backdropEl = (0, _dom.default)('<div class="actions-backdrop"></div>');
        actions.$containerEl.append($backdropEl);
      }
    }

    var originalOpen = actions.open;
    var originalClose = actions.close;
    var popover;

    function buttonOnClick(e) {
      var $buttonEl = (0, _dom.default)(this);
      var buttonIndex;
      var groupIndex;

      if ($buttonEl.hasClass('list-button') || $buttonEl.hasClass('item-link')) {
        buttonIndex = $buttonEl.parents('li').index();
        groupIndex = $buttonEl.parents('.list').index();
      } else {
        buttonIndex = $buttonEl.index();
        groupIndex = $buttonEl.parents('.actions-group').index();
      }

      if (typeof groups !== 'undefined') {
        var button = groups[groupIndex][buttonIndex];
        if (button.onClick) button.onClick(actions, e);
        if (actions.params.onClick) actions.params.onClick(actions, e);
        if (button.close !== false) actions.close();
      }
    }

    actions.open = function open(animate) {
      var convertToPopover = false;
      var _actions$params = actions.params,
          targetEl = _actions$params.targetEl,
          targetX = _actions$params.targetX,
          targetY = _actions$params.targetY,
          targetWidth = _actions$params.targetWidth,
          targetHeight = _actions$params.targetHeight;

      if (actions.params.convertToPopover && (targetEl || targetX !== undefined && targetY !== undefined)) {
        // Popover
        if (actions.params.forceToPopover || device.ios && device.ipad || app.width >= 768 || device.desktop && app.theme === 'aurora') {
          convertToPopover = true;
        }
      }

      if (convertToPopover && actions.popoverHtml) {
        popover = app.popover.create({
          content: actions.popoverHtml,
          backdrop: actions.params.backdrop,
          targetEl: targetEl,
          targetX: targetX,
          targetY: targetY,
          targetWidth: targetWidth,
          targetHeight: targetHeight,
          on: {
            open: function open() {
              if (!actions.$el) {
                actions.$el = popover.$el;
              }

              actions.$el.trigger("modal:open " + actions.type.toLowerCase() + ":open");
              actions.emit("local::open modalOpen " + actions.type + "Open", actions);
            },
            opened: function opened() {
              if (!actions.$el) {
                actions.$el = popover.$el;
              }

              actions.$el.trigger("modal:opened " + actions.type.toLowerCase() + ":opened");
              actions.emit("local::opened modalOpened " + actions.type + "Opened", actions);
            },
            close: function close() {
              if (!actions.$el) {
                actions.$el = popover.$el;
              }

              actions.$el.trigger("modal:close " + actions.type.toLowerCase() + ":close");
              actions.emit("local::close modalClose " + actions.type + "Close", actions);
            },
            closed: function closed() {
              if (!actions.$el) {
                actions.$el = popover.$el;
              }

              actions.$el.trigger("modal:closed " + actions.type.toLowerCase() + ":closed");
              actions.emit("local::closed modalClosed " + actions.type + "Closed", actions);
            }
          }
        });
        popover.open(animate);
        popover.once('popoverOpened', function () {
          popover.$el.find('.list-button, .item-link').each(function (buttonEl) {
            (0, _dom.default)(buttonEl).on('click', buttonOnClick);
          });
        });
        popover.once('popoverClosed', function () {
          popover.$el.find('.list-button, .item-link').each(function (buttonEl) {
            (0, _dom.default)(buttonEl).off('click', buttonOnClick);
          });
          (0, _utils.nextTick)(function () {
            popover.destroy();
            popover = undefined;
          });
        });
      } else {
        actions.$el = actions.actionsHtml ? (0, _dom.default)(actions.actionsHtml) : actions.$el;
        actions.$el[0].f7Modal = actions;

        if (actions.groups) {
          actions.$el.find('.actions-button').each(function (buttonEl) {
            (0, _dom.default)(buttonEl).on('click', buttonOnClick);
          });
          actions.once('actionsClosed', function () {
            actions.$el.find('.actions-button').each(function (buttonEl) {
              (0, _dom.default)(buttonEl).off('click', buttonOnClick);
            });
          });
        }

        actions.el = actions.$el[0];
        originalOpen.call(actions, animate);
      }

      return actions;
    };

    actions.close = function close(animate) {
      if (popover) {
        popover.close(animate);
      } else {
        originalClose.call(actions, animate);
      }

      return actions;
    };

    (0, _utils.extend)(actions, {
      app: app,
      $el: $el,
      el: $el ? $el[0] : undefined,
      $backdropEl: $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0],
      type: 'actions'
    });

    function handleClick(e) {
      var target = e.target;
      var $target = (0, _dom.default)(target);
      var keyboardOpened = !device.desktop && device.cordova && (window.Keyboard && window.Keyboard.isVisible || window.cordova.plugins && window.cordova.plugins.Keyboard && window.cordova.plugins.Keyboard.isVisible);
      if (keyboardOpened) return;

      if ($target.closest(actions.el).length === 0) {
        if (actions.params.closeByBackdropClick && actions.params.backdrop && actions.backdropEl && actions.backdropEl === target) {
          actions.close();
        } else if (actions.params.closeByOutsideClick) {
          actions.close();
        }
      }
    }

    function onKeyDown(e) {
      var keyCode = e.keyCode;

      if (keyCode === 27 && actions.params.closeOnEscape) {
        actions.close();
      }
    }

    if (actions.params.closeOnEscape) {
      actions.on('open', function () {
        (0, _dom.default)(document).on('keydown', onKeyDown);
      });
      actions.on('close', function () {
        (0, _dom.default)(document).off('keydown', onKeyDown);
      });
    }

    actions.on('opened', function () {
      if (actions.params.closeByBackdropClick || actions.params.closeByOutsideClick) {
        app.on('click', handleClick);
      }
    });
    actions.on('close', function () {
      if (actions.params.closeByBackdropClick || actions.params.closeByOutsideClick) {
        app.off('click', handleClick);
      }
    });

    if ($el) {
      $el[0].f7Modal = actions;
    }

    return actions || _assertThisInitialized(_this);
  }

  var _proto = Actions.prototype;

  _proto.render = function render() {
    var actions = this;
    if (actions.params.render) return actions.params.render.call(actions, actions);
    var groups = actions.groups;
    var cssClass = actions.params.cssClass;
    return (0, _$jsx.default)("div", {
      class: "actions-modal" + (actions.params.grid ? ' actions-grid' : '') + " " + (cssClass || '')
    }, groups.map(function (group) {
      return (0, _$jsx.default)("div", {
        class: "actions-group"
      }, group.map(function (button) {
        var buttonClasses = ["actions-" + (button.label ? 'label' : 'button')];
        var color = button.color,
            bg = button.bg,
            bold = button.bold,
            disabled = button.disabled,
            label = button.label,
            text = button.text,
            icon = button.icon;
        if (color) buttonClasses.push("color-" + color);
        if (bg) buttonClasses.push("bg-color-" + bg);
        if (bold) buttonClasses.push('actions-button-bold');
        if (disabled) buttonClasses.push('disabled');

        if (label) {
          return (0, _$jsx.default)("div", {
            class: buttonClasses.join(' ')
          }, text);
        }

        return (0, _$jsx.default)("div", {
          class: buttonClasses.join(' ')
        }, icon && (0, _$jsx.default)("div", {
          class: "actions-button-media"
        }, icon), (0, _$jsx.default)("div", {
          class: "actions-button-text"
        }, text));
      }));
    }));
  };

  _proto.renderPopover = function renderPopover() {
    var actions = this;
    if (actions.params.renderPopover) return actions.params.renderPopover.call(actions, actions);
    var groups = actions.groups;
    var cssClass = actions.params.cssClass;
    return (0, _$jsx.default)("div", {
      class: "popover popover-from-actions " + (cssClass || '')
    }, (0, _$jsx.default)("div", {
      class: "popover-inner"
    }, groups.map(function (group) {
      return (0, _$jsx.default)("div", {
        class: "list"
      }, (0, _$jsx.default)("ul", null, group.map(function (button) {
        var itemClasses = [];
        var color = button.color,
            bg = button.bg,
            bold = button.bold,
            disabled = button.disabled,
            label = button.label,
            text = button.text,
            icon = button.icon;
        if (color) itemClasses.push("color-" + color);
        if (bg) itemClasses.push("bg-color-" + bg);
        if (bold) itemClasses.push('popover-from-actions-bold');
        if (disabled) itemClasses.push('disabled');

        if (label) {
          itemClasses.push('popover-from-actions-label');
          return "<li class=\"" + itemClasses.join(' ') + "\">" + text + "</li>";
        }

        if (icon) {
          itemClasses.push('item-link item-content');
          return (0, _$jsx.default)("li", null, (0, _$jsx.default)("a", {
            class: itemClasses.join(' ')
          }, (0, _$jsx.default)("div", {
            class: "item-media"
          }, icon), (0, _$jsx.default)("div", {
            class: "item-inner"
          }, (0, _$jsx.default)("div", {
            class: "item-title"
          }, text))));
        }

        itemClasses.push('list-button');
        return (0, _$jsx.default)("li", null, (0, _$jsx.default)("a", {
          class: itemClasses.join(' ')
        }, text));
      })));
    })));
  };

  return Actions;
}(_modalClass.default);

var _default = Actions;
exports.default = _default;