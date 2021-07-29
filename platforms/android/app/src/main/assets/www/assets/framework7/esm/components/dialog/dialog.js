function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { extend, iosPreloaderContent, mdPreloaderContent, auroraPreloaderContent } from '../../shared/utils';
import Dialog from './dialog-class';
import ModalMethods from '../../shared/modal-methods';
export default {
  name: 'dialog',
  params: {
    dialog: {
      title: undefined,
      buttonOk: 'OK',
      buttonCancel: 'Cancel',
      usernamePlaceholder: 'Username',
      passwordPlaceholder: 'Password',
      preloaderTitle: 'Loading... ',
      progressTitle: 'Loading... ',
      backdrop: true,
      closeByBackdropClick: false,
      destroyPredefinedDialogs: true,
      keyboardActions: true,
      autoFocus: true
    }
  },
  static: {
    Dialog: Dialog
  },
  create: function create() {
    var app = this;

    function defaultDialogTitle() {
      return app.params.dialog.title || app.name;
    }

    var destroyOnClose = app.params.dialog.destroyPredefinedDialogs;
    var keyboardActions = app.params.dialog.keyboardActions;
    var autoFocus = app.params.dialog.autoFocus;
    var autoFocusHandler = autoFocus ? {
      on: {
        opened: function opened(dialog) {
          dialog.$el.find('input').eq(0).focus();
        }
      }
    } : {};
    app.dialog = extend(ModalMethods({
      app: app,
      constructor: Dialog,
      defaultSelector: '.dialog.modal-in'
    }), {
      // Shortcuts
      alert: function alert() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var text = args[0],
            title = args[1],
            callbackOk = args[2];

        if (args.length === 2 && typeof args[1] === 'function') {
          text = args[0];
          callbackOk = args[1];
          title = args[2];
        }

        return new Dialog(app, {
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text: text,
          buttons: [{
            text: app.params.dialog.buttonOk,
            bold: true,
            onClick: callbackOk,
            keyCodes: keyboardActions ? [13, 27] : null
          }],
          destroyOnClose: destroyOnClose
        }).open();
      },
      prompt: function prompt() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var text = args[0],
            title = args[1],
            callbackOk = args[2],
            callbackCancel = args[3],
            defaultValue = args[4];

        if (typeof args[1] === 'function') {
          text = args[0];
          callbackOk = args[1];
          callbackCancel = args[2];
          defaultValue = args[3];
          title = args[4];
        }

        defaultValue = typeof defaultValue === 'undefined' || defaultValue === null ? '' : defaultValue;
        return new Dialog(app, _extends({
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text: text,
          content: "<div class=\"dialog-input-field input\"><input type=\"text\" class=\"dialog-input\" value=\"" + defaultValue + "\"></div>",
          buttons: [{
            text: app.params.dialog.buttonCancel,
            keyCodes: keyboardActions ? [27] : null,
            color: app.theme === 'aurora' ? 'gray' : null
          }, {
            text: app.params.dialog.buttonOk,
            bold: true,
            keyCodes: keyboardActions ? [13] : null
          }],
          onClick: function onClick(dialog, index) {
            var inputValue = dialog.$el.find('.dialog-input').val();
            if (index === 0 && callbackCancel) callbackCancel(inputValue);
            if (index === 1 && callbackOk) callbackOk(inputValue);
          },
          destroyOnClose: destroyOnClose
        }, autoFocusHandler)).open();
      },
      confirm: function confirm() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        var text = args[0],
            title = args[1],
            callbackOk = args[2],
            callbackCancel = args[3];

        if (typeof args[1] === 'function') {
          text = args[0];
          callbackOk = args[1];
          callbackCancel = args[2];
          title = args[3];
        }

        return new Dialog(app, {
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text: text,
          buttons: [{
            text: app.params.dialog.buttonCancel,
            onClick: callbackCancel,
            keyCodes: keyboardActions ? [27] : null,
            color: app.theme === 'aurora' ? 'gray' : null
          }, {
            text: app.params.dialog.buttonOk,
            bold: true,
            onClick: callbackOk,
            keyCodes: keyboardActions ? [13] : null
          }],
          destroyOnClose: destroyOnClose
        }).open();
      },
      login: function login() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        var text = args[0],
            title = args[1],
            callbackOk = args[2],
            callbackCancel = args[3];

        if (typeof args[1] === 'function') {
          text = args[0];
          callbackOk = args[1];
          callbackCancel = args[2];
          title = args[3];
        }

        return new Dialog(app, _extends({
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text: text,
          // prettier-ignore
          content: "\n              <div class=\"dialog-input-field dialog-input-double input\">\n                <input type=\"text\" name=\"dialog-username\" placeholder=\"" + app.params.dialog.usernamePlaceholder + "\" class=\"dialog-input\">\n              </div>\n              <div class=\"dialog-input-field dialog-input-double input\">\n                <input type=\"password\" name=\"dialog-password\" placeholder=\"" + app.params.dialog.passwordPlaceholder + "\" class=\"dialog-input\">\n              </div>",
          buttons: [{
            text: app.params.dialog.buttonCancel,
            keyCodes: keyboardActions ? [27] : null,
            color: app.theme === 'aurora' ? 'gray' : null
          }, {
            text: app.params.dialog.buttonOk,
            bold: true,
            keyCodes: keyboardActions ? [13] : null
          }],
          onClick: function onClick(dialog, index) {
            var username = dialog.$el.find('[name="dialog-username"]').val();
            var password = dialog.$el.find('[name="dialog-password"]').val();
            if (index === 0 && callbackCancel) callbackCancel(username, password);
            if (index === 1 && callbackOk) callbackOk(username, password);
          },
          destroyOnClose: destroyOnClose
        }, autoFocusHandler)).open();
      },
      password: function password() {
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        var text = args[0],
            title = args[1],
            callbackOk = args[2],
            callbackCancel = args[3];

        if (typeof args[1] === 'function') {
          text = args[0];
          callbackOk = args[1];
          callbackCancel = args[2];
          title = args[3];
        }

        return new Dialog(app, _extends({
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text: text,
          // prettier-ignore
          content: "\n              <div class=\"dialog-input-field input\">\n                <input type=\"password\" name=\"dialog-password\" placeholder=\"" + app.params.dialog.passwordPlaceholder + "\" class=\"dialog-input\">\n              </div>",
          buttons: [{
            text: app.params.dialog.buttonCancel,
            keyCodes: keyboardActions ? [27] : null,
            color: app.theme === 'aurora' ? 'gray' : null
          }, {
            text: app.params.dialog.buttonOk,
            bold: true,
            keyCodes: keyboardActions ? [13] : null
          }],
          onClick: function onClick(dialog, index) {
            var password = dialog.$el.find('[name="dialog-password"]').val();
            if (index === 0 && callbackCancel) callbackCancel(password);
            if (index === 1 && callbackOk) callbackOk(password);
          },
          destroyOnClose: destroyOnClose
        }, autoFocusHandler)).open();
      },
      preloader: function preloader(title, color) {
        var preloaders = {
          iosPreloaderContent: iosPreloaderContent,
          mdPreloaderContent: mdPreloaderContent,
          auroraPreloaderContent: auroraPreloaderContent
        };
        var preloaderInner = preloaders[app.theme + "PreloaderContent"] || '';
        return new Dialog(app, {
          title: typeof title === 'undefined' || title === null ? app.params.dialog.preloaderTitle : title,
          // prettier-ignore
          content: "<div class=\"preloader" + (color ? " color-" + color : '') + "\">" + preloaderInner + "</div>",
          cssClass: 'dialog-preloader',
          destroyOnClose: destroyOnClose
        }).open();
      },
      progress: function progress() {
        for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }

        var title = args[0],
            progress = args[1],
            color = args[2];

        if (args.length === 2) {
          if (typeof args[0] === 'number') {
            progress = args[0];
            color = args[1];
            title = args[2];
          } else if (typeof args[0] === 'string' && typeof args[1] === 'string') {
            title = args[0];
            color = args[1];
            progress = args[2];
          }
        } else if (args.length === 1) {
          if (typeof args[0] === 'number') {
            progress = args[0];
            title = args[1];
            color = args[2];
          }
        }

        var infinite = typeof progress === 'undefined';
        var dialog = new Dialog(app, {
          title: typeof title === 'undefined' ? app.params.dialog.progressTitle : title,
          cssClass: 'dialog-progress',
          // prettier-ignore
          content: "\n              <div class=\"progressbar" + (infinite ? '-infinite' : '') + (color ? " color-" + color : '') + "\">\n                " + (!infinite ? '<span></span>' : '') + "\n              </div>\n            ",
          destroyOnClose: destroyOnClose
        });
        if (!infinite) dialog.setProgress(progress);
        return dialog.open();
      }
    });
  }
};