import { getWindow, getDocument } from 'ssr-window';
import $ from '../../shared/dom7';
import { bindMethods } from '../../shared/utils';
import { getDevice } from '../../shared/get-device';
var Input = {
  ignoreTypes: ['checkbox', 'button', 'submit', 'range', 'radio', 'image'],
  createTextareaResizableShadow: function createTextareaResizableShadow() {
    var document = getDocument();
    var $shadowEl = $(document.createElement('textarea'));
    $shadowEl.addClass('textarea-resizable-shadow');
    $shadowEl.prop({
      disabled: true,
      readonly: true
    });
    Input.textareaResizableShadow = $shadowEl;
  },
  textareaResizableShadow: undefined,
  resizeTextarea: function resizeTextarea(textareaEl) {
    var app = this;
    var window = getWindow();
    var $textareaEl = $(textareaEl);

    if (!Input.textareaResizableShadow) {
      Input.createTextareaResizableShadow();
    }

    var $shadowEl = Input.textareaResizableShadow;
    if (!$textareaEl.length) return;
    if (!$textareaEl.hasClass('resizable')) return;

    if (Input.textareaResizableShadow.parents().length === 0) {
      app.$el.append($shadowEl);
    }

    var styles = window.getComputedStyle($textareaEl[0]);
    'padding-top padding-bottom padding-left padding-right margin-left margin-right margin-top margin-bottom width font-size font-family font-style font-weight line-height font-variant text-transform letter-spacing border box-sizing display'.split(' ').forEach(function (style) {
      var styleValue = styles[style];

      if ('font-size line-height letter-spacing width'.split(' ').indexOf(style) >= 0) {
        styleValue = styleValue.replace(',', '.');
      }

      $shadowEl.css(style, styleValue);
    });
    var currentHeight = $textareaEl[0].clientHeight;
    $shadowEl.val('');
    var initialHeight = $shadowEl[0].scrollHeight;
    $shadowEl.val($textareaEl.val());
    $shadowEl.css('height', 0);
    var scrollHeight = $shadowEl[0].scrollHeight;

    if (currentHeight !== scrollHeight) {
      if (scrollHeight > initialHeight) {
        $textareaEl.css('height', scrollHeight + "px");
      } else if (scrollHeight < currentHeight) {
        $textareaEl.css('height', '');
      }

      if (scrollHeight > initialHeight || scrollHeight < currentHeight) {
        $textareaEl.trigger('textarea:resize', {
          initialHeight: initialHeight,
          currentHeight: currentHeight,
          scrollHeight: scrollHeight
        });
        app.emit('textareaResize', {
          initialHeight: initialHeight,
          currentHeight: currentHeight,
          scrollHeight: scrollHeight
        });
      }
    }
  },
  validate: function validate(inputEl) {
    var $inputEl = $(inputEl);
    if (!$inputEl.length) return true;
    var $itemInputEl = $inputEl.parents('.item-input');
    var $inputWrapEl = $inputEl.parents('.input');

    function unsetReadonly() {
      if ($inputEl[0].f7ValidateReadonly) {
        $inputEl[0].readOnly = false;
      }
    }

    function setReadonly() {
      if ($inputEl[0].f7ValidateReadonly) {
        $inputEl[0].readOnly = true;
      }
    }

    unsetReadonly();
    var validity = $inputEl[0].validity;
    var validationMessage = $inputEl.dataset().errorMessage || $inputEl[0].validationMessage || '';

    if (!validity) {
      setReadonly();
      return true;
    }

    if (!validity.valid) {
      var $errorEl = $inputEl.nextAll('.item-input-error-message, .input-error-message');

      if (validationMessage) {
        if ($errorEl.length === 0) {
          $errorEl = $("<div class=\"" + ($inputWrapEl.length ? 'input-error-message' : 'item-input-error-message') + "\"></div>");
          $errorEl.insertAfter($inputEl);
        }

        $errorEl.text(validationMessage);
      }

      if ($errorEl.length > 0) {
        $itemInputEl.addClass('item-input-with-error-message');
        $inputWrapEl.addClass('input-with-error-message');
      }

      $itemInputEl.addClass('item-input-invalid');
      $inputWrapEl.addClass('input-invalid');
      $inputEl.addClass('input-invalid');
      setReadonly();
      return false;
    }

    $itemInputEl.removeClass('item-input-invalid item-input-with-error-message');
    $inputWrapEl.removeClass('input-invalid input-with-error-message');
    $inputEl.removeClass('input-invalid');
    setReadonly();
    return true;
  },
  validateInputs: function validateInputs(el) {
    var app = this;
    var validates = $(el).find('input, textarea, select').map(function (inputEl) {
      return app.input.validate(inputEl);
    });
    return validates.indexOf(false) < 0;
  },
  focus: function focus(inputEl) {
    var $inputEl = $(inputEl);
    var type = $inputEl.attr('type');
    if (Input.ignoreTypes.indexOf(type) >= 0) return;
    $inputEl.parents('.item-input').addClass('item-input-focused');
    $inputEl.parents('.input').addClass('input-focused');
    $inputEl.addClass('input-focused');
  },
  blur: function blur(inputEl) {
    var $inputEl = $(inputEl);
    $inputEl.parents('.item-input').removeClass('item-input-focused');
    $inputEl.parents('.input').removeClass('input-focused');
    $inputEl.removeClass('input-focused');
  },
  checkEmptyState: function checkEmptyState(inputEl) {
    var app = this;
    var $inputEl = $(inputEl);

    if (!$inputEl.is('input, select, textarea, .item-input [contenteditable]')) {
      $inputEl = $inputEl.find('input, select, textarea, .item-input [contenteditable]').eq(0);
    }

    if (!$inputEl.length) return;
    var isContentEditable = $inputEl[0].hasAttribute('contenteditable');
    var value;

    if (isContentEditable) {
      if ($inputEl.find('.text-editor-placeholder').length) value = '';else value = $inputEl.html();
    } else {
      value = $inputEl.val();
    }

    var $itemInputEl = $inputEl.parents('.item-input');
    var $inputWrapEl = $inputEl.parents('.input');

    if (value && typeof value === 'string' && value.trim() !== '' || Array.isArray(value) && value.length > 0) {
      $itemInputEl.addClass('item-input-with-value');
      $inputWrapEl.addClass('input-with-value');
      $inputEl.addClass('input-with-value');
      $inputEl.trigger('input:notempty');
      app.emit('inputNotEmpty', $inputEl[0]);
    } else {
      $itemInputEl.removeClass('item-input-with-value');
      $inputWrapEl.removeClass('input-with-value');
      $inputEl.removeClass('input-with-value');
      $inputEl.trigger('input:empty');
      app.emit('inputEmpty', $inputEl[0]);
    }
  },
  scrollIntoView: function scrollIntoView(inputEl, duration, centered, force) {
    if (duration === void 0) {
      duration = 0;
    }

    var $inputEl = $(inputEl);
    var $scrollableEl = $inputEl.parents('.page-content, .panel, .card-expandable .card-content').eq(0);

    if (!$scrollableEl.length) {
      return false;
    }

    var contentHeight = $scrollableEl[0].offsetHeight;
    var contentScrollTop = $scrollableEl[0].scrollTop;
    var contentPaddingTop = parseInt($scrollableEl.css('padding-top'), 10);
    var contentPaddingBottom = parseInt($scrollableEl.css('padding-bottom'), 10);
    var contentOffsetTop = $scrollableEl.offset().top - contentScrollTop;
    var inputOffsetTop = $inputEl.offset().top - contentOffsetTop;
    var inputHeight = $inputEl[0].offsetHeight;
    var min = inputOffsetTop + contentScrollTop - contentPaddingTop;
    var max = inputOffsetTop + contentScrollTop - contentHeight + contentPaddingBottom + inputHeight;
    var centeredPosition = min + (max - min) / 2;

    if (contentScrollTop > min) {
      $scrollableEl.scrollTop(centered ? centeredPosition : min, duration);
      return true;
    }

    if (contentScrollTop < max) {
      $scrollableEl.scrollTop(centered ? centeredPosition : max, duration);
      return true;
    }

    if (force) {
      $scrollableEl.scrollTop(centered ? centeredPosition : max, duration);
    }

    return false;
  },
  init: function init() {
    var app = this;
    var device = getDevice();
    var window = getWindow();
    var document = getDocument();
    Input.createTextareaResizableShadow();

    function onFocus() {
      var inputEl = this;

      if (app.params.input.scrollIntoViewOnFocus) {
        if (device.android) {
          $(window).once('resize', function () {
            if (document && document.activeElement === inputEl) {
              app.input.scrollIntoView(inputEl, app.params.input.scrollIntoViewDuration, app.params.input.scrollIntoViewCentered, app.params.input.scrollIntoViewAlways);
            }
          });
        } else {
          app.input.scrollIntoView(inputEl, app.params.input.scrollIntoViewDuration, app.params.input.scrollIntoViewCentered, app.params.input.scrollIntoViewAlways);
        }
      }

      app.input.focus(inputEl);
    }

    function onBlur() {
      var $inputEl = $(this);
      var tag = $inputEl[0].nodeName.toLowerCase();
      app.input.blur($inputEl);

      if ($inputEl.dataset().validate || $inputEl.attr('validate') !== null || $inputEl.attr('data-validate-on-blur') !== null) {
        app.input.validate($inputEl);
      } // Resize textarea


      if (tag === 'textarea' && $inputEl.hasClass('resizable')) {
        if (Input.textareaResizableShadow) Input.textareaResizableShadow.remove();
      }
    }

    function onChange() {
      var $inputEl = $(this);
      var type = $inputEl.attr('type');
      var tag = $inputEl[0].nodeName.toLowerCase();
      var isContentEditable = $inputEl[0].hasAttribute('contenteditable');
      if (Input.ignoreTypes.indexOf(type) >= 0) return; // Check Empty State

      app.input.checkEmptyState($inputEl);
      if (isContentEditable) return; // Check validation

      if ($inputEl.attr('data-validate-on-blur') === null && ($inputEl.dataset().validate || $inputEl.attr('validate') !== null)) {
        app.input.validate($inputEl);
      } // Resize textarea


      if (tag === 'textarea' && $inputEl.hasClass('resizable')) {
        app.input.resizeTextarea($inputEl);
      }
    }

    function onInvalid(e) {
      var $inputEl = $(this);

      if ($inputEl.attr('data-validate-on-blur') === null && ($inputEl.dataset().validate || $inputEl.attr('validate') !== null)) {
        e.preventDefault();
        app.input.validate($inputEl);
      }
    }

    function clearInput() {
      var $clicked = $(this);
      var $inputEl = $clicked.siblings('input, textarea').eq(0);
      var previousValue = $inputEl.val();
      $inputEl.val('').trigger('input change').focus().trigger('input:clear', previousValue);
      app.emit('inputClear', previousValue);
    }

    function preventDefault(e) {
      e.preventDefault();
    }

    $(document).on('click', '.input-clear-button', clearInput);
    $(document).on('mousedown', '.input-clear-button', preventDefault);
    $(document).on('change input', 'input, textarea, select, .item-input [contenteditable]', onChange, true);
    $(document).on('focus', 'input, textarea, select, .item-input [contenteditable]', onFocus, true);
    $(document).on('blur', 'input, textarea, select, .item-input [contenteditable]', onBlur, true);
    $(document).on('invalid', 'input, textarea, select', onInvalid, true);
  }
};
export default {
  name: 'input',
  params: {
    input: {
      scrollIntoViewOnFocus: undefined,
      scrollIntoViewCentered: false,
      scrollIntoViewDuration: 0,
      scrollIntoViewAlways: false
    }
  },
  create: function create() {
    var app = this;

    if (typeof app.params.input.scrollIntoViewOnFocus === 'undefined') {
      app.params.input.scrollIntoViewOnFocus = getDevice().android;
    }

    bindMethods(app, {
      input: Input
    });
  },
  on: {
    init: function init() {
      var app = this;
      app.input.init();
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      var $tabEl = $(tabEl);
      $tabEl.find('.item-input, .input').each(function (itemInputEl) {
        var $itemInputEl = $(itemInputEl);
        $itemInputEl.find('input, select, textarea, [contenteditable]').each(function (inputEl) {
          var $inputEl = $(inputEl);
          if (Input.ignoreTypes.indexOf($inputEl.attr('type')) >= 0) return;
          app.input.checkEmptyState($inputEl);
        });
      });
      $tabEl.find('textarea.resizable').each(function (textareaEl) {
        app.input.resizeTextarea(textareaEl);
      });
    },
    pageInit: function pageInit(page) {
      var app = this;
      var $pageEl = page.$el;
      $pageEl.find('.item-input, .input').each(function (itemInputEl) {
        var $itemInputEl = $(itemInputEl);
        $itemInputEl.find('input, select, textarea, [contenteditable]').each(function (inputEl) {
          var $inputEl = $(inputEl);
          if (Input.ignoreTypes.indexOf($inputEl.attr('type')) >= 0) return;
          app.input.checkEmptyState($inputEl);
        });
      });
      $pageEl.find('textarea.resizable').each(function (textareaEl) {
        app.input.resizeTextarea(textareaEl);
      });
    },
    'panelBreakpoint panelCollapsedBreakpoint panelResize panelOpen panelSwipeOpen resize viewMasterDetailBreakpoint': function onPanelOpen(instance) {
      var app = this;

      if (instance && instance.$el) {
        instance.$el.find('textarea.resizable').each(function (textareaEl) {
          app.input.resizeTextarea(textareaEl);
        });
      } else {
        $('textarea.resizable').each(function (textareaEl) {
          app.input.resizeTextarea(textareaEl);
        });
      }
    }
  }
};