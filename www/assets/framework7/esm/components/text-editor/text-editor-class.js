function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { getWindow, getDocument } from 'ssr-window';
import $ from '../../shared/dom7';
import { extend, deleteProps } from '../../shared/utils';
import Framework7Class from '../../shared/class';
import { getDevice } from '../../shared/get-device';
var textEditorButtonsMap = {
  // f7-icon, material-icon, command
  bold: ['bold', 'format_bold', 'bold'],
  italic: ['italic', 'format_italic', 'italic'],
  underline: ['underline', 'format_underlined', 'underline'],
  strikeThrough: ['strikethrough', 'strikethrough_s', 'strikeThrough'],
  orderedList: ['list_number', 'format_list_numbered', 'insertOrderedList'],
  unorderedList: ['list_bullet', 'format_list_bulleted', 'insertUnorderedList'],
  link: ['link', 'link', 'createLink'],
  image: ['photo', 'image', 'insertImage'],
  paragraph: ['paragraph', '<i class="icon">¶</i>', 'formatBlock.P'],
  h1: ['<i class="icon">H<sub>1</sub></i>', '<i class="icon">H<sub>1</sub></i>', 'formatBlock.H1'],
  h2: ['<i class="icon">H<sub>2</sub></i>', '<i class="icon">H<sub>2</sub></i>', 'formatBlock.H2'],
  h3: ['<i class="icon">H<sub>3</sub></i>', '<i class="icon">H<sub>3</sub></i>', 'formatBlock.H3'],
  alignLeft: ['text_alignleft', 'format_align_left', 'justifyLeft'],
  alignCenter: ['text_aligncenter', 'format_align_center', 'justifyCenter'],
  alignRight: ['text_alignright', 'format_align_right', 'justifyRight'],
  alignJustify: ['text_justify', 'format_align_justify', 'justifyFull'],
  subscript: ['textformat_subscript', '<i class="icon">A<sub>1</sub></i>', 'subscript'],
  superscript: ['textformat_superscript', '<i class="icon">A<sup>1</sup></i>', 'superscript'],
  indent: ['increase_indent', 'format_indent_increase', 'indent'],
  outdent: ['decrease_indent', 'format_indent_decrease', 'outdent']
};

var TextEditor = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(TextEditor, _Framework7Class);

  function TextEditor(app, params) {
    var _this;

    _this = _Framework7Class.call(this, params, [app]) || this;

    var self = _assertThisInitialized(_this);

    var document = getDocument();
    var device = getDevice();
    var defaults = extend({}, app.params.textEditor); // Extend defaults with modules params

    self.useModulesParams(defaults);
    self.params = extend(defaults, params);
    var el = self.params.el;
    if (!el) return self || _assertThisInitialized(_this);
    var $el = $(el);
    if ($el.length === 0) return self || _assertThisInitialized(_this);
    if ($el[0].f7TextEditor) return $el[0].f7TextEditor || _assertThisInitialized(_this);
    var $contentEl = $el.children('.text-editor-content');

    if (!$contentEl.length) {
      $el.append('<div class="text-editor-content" contenteditable></div>');
      $contentEl = $el.children('.text-editor-content');
    }

    extend(self, {
      app: app,
      $el: $el,
      el: $el[0],
      $contentEl: $contentEl,
      contentEl: $contentEl[0]
    });

    if ('value' in params) {
      self.value = self.params.value;
    }

    if (self.params.mode === 'keyboard-toolbar') {
      if (!(device.cordova || device.capacitor) && !device.android) {
        self.params.mode = 'popover';
      }
    }

    if (typeof self.params.buttons === 'string') {
      try {
        self.params.buttons = JSON.parse(self.params.buttons);
      } catch (err) {
        throw new Error('Framework7: TextEditor: wrong "buttons" parameter format');
      }
    }

    $el[0].f7TextEditor = self; // Bind

    self.onButtonClick = self.onButtonClick.bind(self);
    self.onFocus = self.onFocus.bind(self);
    self.onBlur = self.onBlur.bind(self);
    self.onInput = self.onInput.bind(self);
    self.onPaste = self.onPaste.bind(self);
    self.onSelectionChange = self.onSelectionChange.bind(self);
    self.closeKeyboardToolbar = self.closeKeyboardToolbar.bind(self); // Handle Events

    self.attachEvents = function attachEvents() {
      if (self.params.mode === 'toolbar') {
        self.$el.find('.text-editor-toolbar').on('click', 'button', self.onButtonClick);
      }

      if (self.params.mode === 'keyboard-toolbar') {
        self.$keyboardToolbarEl.on('click', 'button', self.onButtonClick);
        self.$el.parents('.page').on('page:beforeout', self.closeKeyboardToolbar);
      }

      if (self.params.mode === 'popover' && self.popover) {
        self.popover.$el.on('click', 'button', self.onButtonClick);
      }

      self.$contentEl.on('paste', self.onPaste);
      self.$contentEl.on('focus', self.onFocus);
      self.$contentEl.on('blur', self.onBlur);
      self.$contentEl.on('input', self.onInput, true);
      $(document).on('selectionchange', self.onSelectionChange);
    };

    self.detachEvents = function detachEvents() {
      if (self.params.mode === 'toolbar') {
        self.$el.find('.text-editor-toolbar').off('click', 'button', self.onButtonClick);
      }

      if (self.params.mode === 'keyboard-toolbar') {
        self.$keyboardToolbarEl.off('click', 'button', self.onButtonClick);
        self.$el.parents('.page').off('page:beforeout', self.closeKeyboardToolbar);
      }

      if (self.params.mode === 'popover' && self.popover) {
        self.popover.$el.off('click', 'button', self.onButtonClick);
      }

      self.$contentEl.off('paste', self.onPaste);
      self.$contentEl.off('focus', self.onFocus);
      self.$contentEl.off('blur', self.onBlur);
      self.$contentEl.off('input', self.onInput, true);
      $(document).off('selectionchange', self.onSelectionChange);
    }; // Install Modules


    self.useModules(); // Init

    self.init();
    return self || _assertThisInitialized(_this);
  }

  var _proto = TextEditor.prototype;

  _proto.setValue = function setValue(newValue) {
    var self = this;
    var currentValue = self.value;
    if (currentValue === newValue) return self;
    self.value = newValue;
    self.$contentEl.html(newValue);
    self.$el.trigger('texteditor:change', self.value);
    self.emit('local::change textEditorChange', self, self.value);
    return self;
  };

  _proto.getValue = function getValue() {
    var self = this;
    return self.value;
  };

  _proto.clearValue = function clearValue() {
    var self = this;
    self.setValue('');

    if (self.params.placeholder && !self.$contentEl.html()) {
      self.insertPlaceholder();
    }

    return self;
  };

  _proto.createLink = function createLink() {
    var self = this;
    var window = getWindow();
    var document = getDocument();
    var currentSelection = window.getSelection();
    var selectedNodes = [];
    var $selectedLinks;

    if (currentSelection && currentSelection.anchorNode && $(currentSelection.anchorNode).parents(self.$el).length) {
      var anchorNode = currentSelection.anchorNode;

      while (anchorNode) {
        selectedNodes.push(anchorNode);

        if (!anchorNode.nextSibling || anchorNode === currentSelection.focusNode) {
          anchorNode = null;
        }

        if (anchorNode) {
          anchorNode = anchorNode.nextSibling;
        }
      }

      var selectedNodesLinks = [];
      var $selectedNodes = $(selectedNodes);

      for (var i = 0; i < $selectedNodes.length; i += 1) {
        var childNodes = $selectedNodes[i].children;

        if (childNodes) {
          for (var j = 0; j < childNodes.length; j += 1) {
            if ($(childNodes[j]).is('a')) {
              selectedNodesLinks.push(childNodes[j]);
            }
          }
        }
      }

      $selectedLinks = $selectedNodes.closest('a').add($(selectedNodesLinks));
    }

    if ($selectedLinks && $selectedLinks.length) {
      $selectedLinks.each(function (linkNode) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(linkNode);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('unlink', false);
        selection.removeAllRanges();
      });
      return self;
    }

    var currentRange = self.getSelectionRange();
    if (!currentRange) return self;
    var dialog = self.app.dialog.prompt(self.params.linkUrlText, '', function (link) {
      if (link && link.trim().length) {
        self.setSelectionRange(currentRange);
        document.execCommand('createLink', false, link.trim());
      }
    });
    dialog.$el.find('input').focus();
    return self;
  };

  _proto.insertImage = function insertImage() {
    var self = this;
    var document = getDocument();
    var currentRange = self.getSelectionRange();
    if (!currentRange) return self;
    var dialog = self.app.dialog.prompt(self.params.imageUrlText, '', function (imageUrl) {
      if (imageUrl && imageUrl.trim().length) {
        self.setSelectionRange(currentRange);
        document.execCommand('insertImage', false, imageUrl.trim());
      }
    });
    dialog.$el.find('input').focus();
    return self;
  };

  _proto.removePlaceholder = function removePlaceholder() {
    var self = this;
    self.$contentEl.find('.text-editor-placeholder').remove();
  };

  _proto.insertPlaceholder = function insertPlaceholder() {
    var self = this;
    self.$contentEl.append("<div class=\"text-editor-placeholder\">" + self.params.placeholder + "</div>");
  };

  _proto.onSelectionChange = function onSelectionChange() {
    var self = this;
    var window = getWindow();
    var document = getDocument();
    if (self.params.mode === 'toolbar') return;
    var selection = window.getSelection();
    var selectionIsInContent = $(selection.anchorNode).parents(self.contentEl).length || selection.anchorNode === self.contentEl;

    if (self.params.mode === 'keyboard-toolbar') {
      if (!selectionIsInContent) {
        self.closeKeyboardToolbar();
      } else {
        self.openKeyboardToolbar();
      }

      return;
    }

    if (self.params.mode === 'popover') {
      var selectionIsInPopover = $(selection.anchorNode).parents(self.popover.el).length || selection.anchorNode === self.popover.el;

      if (!selectionIsInContent && !selectionIsInPopover) {
        self.closePopover();
        return;
      }

      if (!selection.isCollapsed && selection.rangeCount) {
        var range = selection.getRangeAt(0);
        var rect = range.getBoundingClientRect();
        var rootEl = self.app.$el[0] || document.body;
        self.openPopover(rect.x + (window.scrollX || 0) - rootEl.offsetLeft, rect.y + (window.scrollY || 0) - rootEl.offsetTop, rect.width, rect.height);
      } else if (selection.isCollapsed) {
        self.closePopover();
      }
    }
  };

  _proto.onPaste = function onPaste(e) {
    var self = this;
    var document = getDocument();

    if (self.params.clearFormattingOnPaste && e.clipboardData && e.clipboardData.getData) {
      var text = e.clipboardData.getData('text/plain');
      e.preventDefault();
      document.execCommand('insertText', false, text);
    }
  };

  _proto.onInput = function onInput() {
    var self = this;
    var value = self.$contentEl.html();
    self.value = value;
    self.$el.trigger('texteditor:input');
    self.emit('local:input textEditorInput', self, self.value);
    self.$el.trigger('texteditor:change', self.value);
    self.emit('local::change textEditorChange', self, self.value);
  };

  _proto.onFocus = function onFocus() {
    var self = this;
    self.removePlaceholder();
    self.$contentEl.focus();
    self.$el.trigger('texteditor:focus');
    self.emit('local::focus textEditorFocus', self);
  };

  _proto.onBlur = function onBlur() {
    var self = this;
    var window = getWindow();
    var document = getDocument();

    if (self.params.placeholder && self.$contentEl.html() === '') {
      self.insertPlaceholder();
    }

    if (self.params.mode === 'popover') {
      var selection = window.getSelection();
      var selectionIsInContent = $(selection.anchorNode).parents(self.contentEl).length || selection.anchorNode === self.contentEl;
      var inPopover = document.activeElement && self.popover && $(document.activeElement).closest(self.popover.$el).length;

      if (!inPopover && !selectionIsInContent) {
        self.closePopover();
      }
    }

    if (self.params.mode === 'keyboard-toolbar') {
      var _selection = window.getSelection();

      var _selectionIsInContent = $(_selection.anchorNode).parents(self.contentEl).length || _selection.anchorNode === self.contentEl;

      if (!_selectionIsInContent) {
        self.closeKeyboardToolbar();
      }
    }

    self.$el.trigger('texteditor:blur');
    self.emit('local::blur textEditorBlur', self);
  };

  _proto.onButtonClick = function onButtonClick(e) {
    var self = this;
    var window = getWindow();
    var document = getDocument();
    var selection = window.getSelection();
    var selectionIsInContent = $(selection.anchorNode).parents(self.contentEl).length || selection.anchorNode === self.contentEl;
    if (!selectionIsInContent) return;
    var $buttonEl = $(e.target).closest('button');

    if ($buttonEl.parents('form').length) {
      e.preventDefault();
    }

    var button = $buttonEl.attr('data-button');
    var buttonData = self.params.customButtons && self.params.customButtons[button];
    if (!button || !(textEditorButtonsMap[button] || buttonData)) return;
    $buttonEl.trigger('texteditor:buttonclick', button);
    self.emit('local::buttonClick textEditorButtonClick', self, button);

    if (buttonData) {
      if (buttonData.onClick) buttonData.onClick(self, $buttonEl[0]);
      return;
    }

    var command = textEditorButtonsMap[button][2];

    if (command === 'createLink') {
      self.createLink();
      return;
    }

    if (command === 'insertImage') {
      self.insertImage();
      return;
    }

    if (command.indexOf('formatBlock') === 0) {
      var tagName = command.split('.')[1];
      var $anchorNode = $(selection.anchorNode);

      if ($anchorNode.parents(tagName.toLowerCase()).length || $anchorNode.is(tagName)) {
        document.execCommand('formatBlock', false, 'div');
      } else {
        document.execCommand('formatBlock', false, tagName);
      }

      return;
    }

    document.execCommand(command, false);
  } // eslint-disable-next-line
  ;

  _proto.getSelectionRange = function getSelectionRange() {
    var window = getWindow();
    var document = getDocument();

    if (window.getSelection) {
      var sel = window.getSelection();

      if (sel.getRangeAt && sel.rangeCount) {
        return sel.getRangeAt(0);
      }
    } else if (document.selection && document.selection.createRange) {
      return document.selection.createRange();
    }

    return null;
  } // eslint-disable-next-line
  ;

  _proto.setSelectionRange = function setSelectionRange(range) {
    var window = getWindow();
    var document = getDocument();

    if (range) {
      if (window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (document.selection && range.select) {
        range.select();
      }
    }
  };

  _proto.renderButtons = function renderButtons() {
    var self = this;
    var html = '';

    function renderButton(button) {
      var iconClass = self.app.theme === 'md' ? 'material-icons' : 'f7-icons';

      if (self.params.customButtons && self.params.customButtons[button]) {
        var buttonData = self.params.customButtons[button];
        return "<button type=\"button\" class=\"text-editor-button\" data-button=\"" + button + "\">" + (buttonData.content || '') + "</button>";
      }

      if (!textEditorButtonsMap[button]) return '';
      var iconContent = textEditorButtonsMap[button][self.app.theme === 'md' ? 1 : 0];
      return ("<button type=\"button\" class=\"text-editor-button\" data-button=\"" + button + "\">" + (iconContent.indexOf('<') >= 0 ? iconContent : "<i class=\"" + iconClass + "\">" + iconContent + "</i>") + "</button>").trim();
    }

    self.params.buttons.forEach(function (button, buttonIndex) {
      if (Array.isArray(button)) {
        button.forEach(function (b) {
          html += renderButton(b);
        });

        if (buttonIndex < self.params.buttons.length - 1 && self.params.dividers) {
          html += '<div class="text-editor-button-divider"></div>';
        }
      } else {
        html += renderButton(button);
      }
    });
    return html;
  };

  _proto.createToolbar = function createToolbar() {
    var self = this;
    self.$el.prepend("<div class=\"text-editor-toolbar\">" + self.renderButtons() + "</div>");
  };

  _proto.createKeyboardToolbar = function createKeyboardToolbar() {
    var self = this;
    var device = getDevice();
    var isDark = self.$el.closest('.theme-dark').length > 0 || device.prefersColorScheme() === 'dark';
    self.$keyboardToolbarEl = $("<div class=\"toolbar toolbar-bottom text-editor-keyboard-toolbar " + (isDark ? 'theme-dark' : '') + "\"><div class=\"toolbar-inner\">" + self.renderButtons() + "</div></div>");
  };

  _proto.createPopover = function createPopover() {
    var self = this;
    var isDark = self.$el.closest('.theme-dark').length > 0;
    self.popover = self.app.popover.create({
      content: "\n        <div class=\"popover " + (isDark ? 'theme-light' : 'theme-dark') + " text-editor-popover\">\n          <div class=\"popover-inner\">" + self.renderButtons() + "</div>\n        </div>\n      ",
      closeByOutsideClick: false,
      backdrop: false
    });
  };

  _proto.openKeyboardToolbar = function openKeyboardToolbar() {
    var self = this;
    if (self.$keyboardToolbarEl.parent(self.app.$el).length) return;
    self.$el.trigger('texteditor:keyboardopen');
    self.emit('local::keyboardOpen textEditorKeyboardOpen', self);
    self.app.$el.append(self.$keyboardToolbarEl);
  };

  _proto.closeKeyboardToolbar = function closeKeyboardToolbar() {
    var self = this;
    self.$keyboardToolbarEl.remove();
    self.$el.trigger('texteditor:keyboardclose');
    self.emit('local::keyboardClose textEditorKeyboardClose', self);
  };

  _proto.openPopover = function openPopover(targetX, targetY, targetWidth, targetHeight) {
    var self = this;
    if (!self.popover) return;
    Object.assign(self.popover.params, {
      targetX: targetX,
      targetY: targetY,
      targetWidth: targetWidth,
      targetHeight: targetHeight
    });
    clearTimeout(self.popoverTimeout);
    self.popoverTimeout = setTimeout(function () {
      if (!self.popover) return;

      if (self.popover.opened) {
        self.popover.resize();
      } else {
        self.$el.trigger('texteditor:popoveropen');
        self.emit('local::popoverOpen textEditorPopoverOpen', self);
        self.popover.open();
      }
    }, 400);
  };

  _proto.closePopover = function closePopover() {
    var self = this;
    clearTimeout(self.popoverTimeout);
    if (!self.popover || !self.popover.opened) return;
    self.popoverTimeout = setTimeout(function () {
      if (!self.popover) return;
      self.$el.trigger('texteditor:popoverclose');
      self.emit('local::popoverClose textEditorPopoverClose', self);
      self.popover.close();
    }, 400);
  };

  _proto.init = function init() {
    var self = this;

    if (self.value) {
      self.$contentEl.html(self.value);
    } else {
      self.value = self.$contentEl.html();
    }

    if (self.params.placeholder && self.value === '') {
      self.insertPlaceholder();
    }

    if (self.params.mode === 'toolbar') {
      self.createToolbar();
    } else if (self.params.mode === 'popover') {
      self.createPopover();
    } else if (self.params.mode === 'keyboard-toolbar') {
      self.createKeyboardToolbar();
    }

    self.attachEvents();
    self.$el.trigger('texteditor:init');
    self.emit('local::init textEditorInit', self);
    return self;
  };

  _proto.destroy = function destroy() {
    var self = this;
    self.$el.trigger('texteditor:beforedestroy');
    self.emit('local::beforeDestroy textEditorBeforeDestroy', self);
    self.detachEvents();

    if (self.params.mode === 'keyboard-toolbar' && self.$keyboardToolbarEl) {
      self.$keyboardToolbarEl.remove();
    }

    if (self.popover) {
      self.popover.close(false);
      self.popover.destroy();
    }

    delete self.$el[0].f7TextEditor;
    deleteProps(self);
    self = null;
  };

  return TextEditor;
}(Framework7Class);

export default TextEditor;