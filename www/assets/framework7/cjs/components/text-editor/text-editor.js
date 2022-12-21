"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _textEditorClass = _interopRequireDefault(require("./text-editor-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'textEditor',
  params: {
    textEditor: {
      el: null,
      mode: 'toolbar',
      // or 'popover'
      value: undefined,
      // will use html content
      customButtons: null,
      buttons: [['bold', 'italic', 'underline', 'strikeThrough'], ['orderedList', 'unorderedList'], ['link', 'image'], ['paragraph', 'h1', 'h2', 'h3'], ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'], ['subscript', 'superscript'], ['indent', 'outdent']],
      dividers: true,
      imageUrlText: 'Insert image URL',
      linkUrlText: 'Insert link URL',
      placeholder: null,
      clearFormattingOnPaste: true
    }
  },
  create: function create() {
    var app = this;
    app.textEditor = (0, _utils.extend)((0, _constructorMethods.default)({
      defaultSelector: '.text-editor',
      constructor: _textEditorClass.default,
      app: app,
      domProp: 'f7TextEditor'
    }));
  },
  static: {
    TextEditor: _textEditorClass.default
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.text-editor-init').each(function (editorEl) {
        var dataset = (0, _dom.default)(editorEl).dataset();
        app.textEditor.create((0, _utils.extend)({
          el: editorEl
        }, dataset || {}));
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      (0, _dom.default)(tabEl).find('.text-editor-init').each(function (editorEl) {
        if (editorEl.f7TextEditor) editorEl.f7TextEditor.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.text-editor-init').each(function (editorEl) {
        var dataset = (0, _dom.default)(editorEl).dataset();
        app.textEditor.create((0, _utils.extend)({
          el: editorEl
        }, dataset || {}));
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      page.$el.find('.text-editor-init').each(function (editorEl) {
        if (editorEl.f7TextEditor) editorEl.f7TextEditor.destroy();
      });
    }
  },
  vnode: {
    'text-editor-init': {
      insert: function insert(vnode) {
        var app = this;
        var editorEl = vnode.elm;
        var dataset = (0, _dom.default)(editorEl).dataset();
        app.textEditor.create((0, _utils.extend)({
          el: editorEl
        }, dataset || {}));
      },
      destroy: function destroy(vnode) {
        var editorEl = vnode.elm;
        if (editorEl.f7TextEditor) editorEl.f7TextEditor.destroy();
      }
    }
  }
};
exports.default = _default;