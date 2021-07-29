import $ from '../../shared/dom7';
import { extend } from '../../shared/utils';
import TextEditor from './text-editor-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
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
    app.textEditor = extend(ConstructorMethods({
      defaultSelector: '.text-editor',
      constructor: TextEditor,
      app: app,
      domProp: 'f7TextEditor'
    }));
  },
  static: {
    TextEditor: TextEditor
  },
  on: {
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      $(tabEl).find('.text-editor-init').each(function (editorEl) {
        var dataset = $(editorEl).dataset();
        app.textEditor.create(extend({
          el: editorEl
        }, dataset || {}));
      });
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      $(tabEl).find('.text-editor-init').each(function (editorEl) {
        if (editorEl.f7TextEditor) editorEl.f7TextEditor.destroy();
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      page.$el.find('.text-editor-init').each(function (editorEl) {
        var dataset = $(editorEl).dataset();
        app.textEditor.create(extend({
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
        var dataset = $(editorEl).dataset();
        app.textEditor.create(extend({
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