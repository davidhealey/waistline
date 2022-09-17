import { extend, iosPreloaderContent, mdPreloaderContent, auroraPreloaderContent } from '../../shared/utils.js';
import Dialog from './dialog-class.js';
import ModalMethods from '../../shared/modal-methods.js';
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
    Dialog
  },

  create() {
    const app = this;

    function defaultDialogTitle() {
      return app.params.dialog.title || app.name;
    }

    const destroyOnClose = app.params.dialog.destroyPredefinedDialogs;
    const keyboardActions = app.params.dialog.keyboardActions;
    const autoFocus = app.params.dialog.autoFocus;
    const autoFocusHandler = autoFocus ? {
      on: {
        opened(dialog) {
          dialog.$el.find('input').eq(0).focus();
        }

      }
    } : {};
    app.dialog = extend(ModalMethods({
      app,
      constructor: Dialog,
      defaultSelector: '.dialog.modal-in'
    }), {
      // Shortcuts
      alert() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        let [text, title, callbackOk] = args;

        if (args.length === 2 && typeof args[1] === 'function') {
          [text, callbackOk, title] = args;
        }

        return new Dialog(app, {
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text,
          buttons: [{
            text: app.params.dialog.buttonOk,
            bold: true,
            onClick: callbackOk,
            keyCodes: keyboardActions ? [13, 27] : null
          }],
          destroyOnClose
        }).open();
      },

      prompt() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        let [text, title, callbackOk, callbackCancel, defaultValue] = args;

        if (typeof args[1] === 'function') {
          [text, callbackOk, callbackCancel, defaultValue, title] = args;
        }

        defaultValue = typeof defaultValue === 'undefined' || defaultValue === null ? '' : defaultValue;
        return new Dialog(app, {
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text,
          content: `<div class="dialog-input-field input"><input type="text" class="dialog-input" value="${defaultValue}"></div>`,
          buttons: [{
            text: app.params.dialog.buttonCancel,
            keyCodes: keyboardActions ? [27] : null,
            color: app.theme === 'aurora' ? 'gray' : null
          }, {
            text: app.params.dialog.buttonOk,
            bold: true,
            keyCodes: keyboardActions ? [13] : null
          }],

          onClick(dialog, index) {
            const inputValue = dialog.$el.find('.dialog-input').val();
            if (index === 0 && callbackCancel) callbackCancel(inputValue);
            if (index === 1 && callbackOk) callbackOk(inputValue);
          },

          destroyOnClose,
          ...autoFocusHandler
        }).open();
      },

      confirm() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        let [text, title, callbackOk, callbackCancel] = args;

        if (typeof args[1] === 'function') {
          [text, callbackOk, callbackCancel, title] = args;
        }

        return new Dialog(app, {
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text,
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
          destroyOnClose
        }).open();
      },

      login() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        let [text, title, callbackOk, callbackCancel] = args;

        if (typeof args[1] === 'function') {
          [text, callbackOk, callbackCancel, title] = args;
        }

        return new Dialog(app, {
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text,
          // prettier-ignore
          content: `
              <div class="dialog-input-field dialog-input-double input">
                <input type="text" name="dialog-username" placeholder="${app.params.dialog.usernamePlaceholder}" class="dialog-input">
              </div>
              <div class="dialog-input-field dialog-input-double input">
                <input type="password" name="dialog-password" placeholder="${app.params.dialog.passwordPlaceholder}" class="dialog-input">
              </div>`,
          buttons: [{
            text: app.params.dialog.buttonCancel,
            keyCodes: keyboardActions ? [27] : null,
            color: app.theme === 'aurora' ? 'gray' : null
          }, {
            text: app.params.dialog.buttonOk,
            bold: true,
            keyCodes: keyboardActions ? [13] : null
          }],

          onClick(dialog, index) {
            const username = dialog.$el.find('[name="dialog-username"]').val();
            const password = dialog.$el.find('[name="dialog-password"]').val();
            if (index === 0 && callbackCancel) callbackCancel(username, password);
            if (index === 1 && callbackOk) callbackOk(username, password);
          },

          destroyOnClose,
          ...autoFocusHandler
        }).open();
      },

      password() {
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        let [text, title, callbackOk, callbackCancel] = args;

        if (typeof args[1] === 'function') {
          [text, callbackOk, callbackCancel, title] = args;
        }

        return new Dialog(app, {
          title: typeof title === 'undefined' ? defaultDialogTitle() : title,
          text,
          // prettier-ignore
          content: `
              <div class="dialog-input-field input">
                <input type="password" name="dialog-password" placeholder="${app.params.dialog.passwordPlaceholder}" class="dialog-input">
              </div>`,
          buttons: [{
            text: app.params.dialog.buttonCancel,
            keyCodes: keyboardActions ? [27] : null,
            color: app.theme === 'aurora' ? 'gray' : null
          }, {
            text: app.params.dialog.buttonOk,
            bold: true,
            keyCodes: keyboardActions ? [13] : null
          }],

          onClick(dialog, index) {
            const password = dialog.$el.find('[name="dialog-password"]').val();
            if (index === 0 && callbackCancel) callbackCancel(password);
            if (index === 1 && callbackOk) callbackOk(password);
          },

          destroyOnClose,
          ...autoFocusHandler
        }).open();
      },

      preloader(title, color) {
        const preloaders = {
          iosPreloaderContent,
          mdPreloaderContent,
          auroraPreloaderContent
        };
        const preloaderInner = preloaders[`${app.theme}PreloaderContent`] || '';
        return new Dialog(app, {
          title: typeof title === 'undefined' || title === null ? app.params.dialog.preloaderTitle : title,
          // prettier-ignore
          content: `<div class="preloader${color ? ` color-${color}` : ''}">${preloaderInner}</div>`,
          cssClass: 'dialog-preloader',
          destroyOnClose
        }).open();
      },

      progress() {
        for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }

        let [title, progress, color] = args;

        if (args.length === 2) {
          if (typeof args[0] === 'number') {
            [progress, color, title] = args;
          } else if (typeof args[0] === 'string' && typeof args[1] === 'string') {
            [title, color, progress] = args;
          }
        } else if (args.length === 1) {
          if (typeof args[0] === 'number') {
            [progress, title, color] = args;
          }
        }

        const infinite = typeof progress === 'undefined';
        const dialog = new Dialog(app, {
          title: typeof title === 'undefined' ? app.params.dialog.progressTitle : title,
          cssClass: 'dialog-progress',
          // prettier-ignore
          content: `
              <div class="progressbar${infinite ? '-infinite' : ''}${color ? ` color-${color}` : ''}">
                ${!infinite ? '<span></span>' : ''}
              </div>
            `,
          destroyOnClose
        });
        if (!infinite) dialog.setProgress(progress);
        return dialog.open();
      }

    });
  }

};