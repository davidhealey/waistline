"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

var _$jsx = _interopRequireDefault(require("../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var Messages = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Messages, _Framework7Class);

  function Messages(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var m = _assertThisInitialized(_this);

    var defaults = {
      autoLayout: true,
      messages: [],
      newMessagesFirst: false,
      scrollMessages: true,
      scrollMessagesOnEdge: true,
      firstMessageRule: undefined,
      lastMessageRule: undefined,
      tailMessageRule: undefined,
      sameNameMessageRule: undefined,
      sameHeaderMessageRule: undefined,
      sameFooterMessageRule: undefined,
      sameAvatarMessageRule: undefined,
      customClassMessageRule: undefined,
      renderMessage: undefined
    }; // Extend defaults with modules params

    m.useModulesParams(defaults);
    m.params = (0, _utils.extend)(defaults, params);
    var $el = (0, _dom.default)(params.el).eq(0);
    if ($el.length === 0) return m || _assertThisInitialized(_this);
    if ($el[0].f7Messages) return $el[0].f7Messages || _assertThisInitialized(_this);
    $el[0].f7Messages = m;
    var $pageContentEl = $el.closest('.page-content').eq(0);
    (0, _utils.extend)(m, {
      messages: m.params.messages,
      $el: $el,
      el: $el[0],
      $pageContentEl: $pageContentEl,
      pageContentEl: $pageContentEl[0]
    }); // Install Modules

    m.useModules(); // Init

    m.init();
    return m || _assertThisInitialized(_this);
  } // eslint-disable-next-line


  var _proto = Messages.prototype;

  _proto.getMessageData = function getMessageData(messageEl) {
    var $messageEl = (0, _dom.default)(messageEl);
    var data = {
      name: $messageEl.find('.message-name').html(),
      header: $messageEl.find('.message-header').html(),
      textHeader: $messageEl.find('.message-text-header').html(),
      textFooter: $messageEl.find('.message-text-footer').html(),
      footer: $messageEl.find('.message-footer').html(),
      isTitle: $messageEl.hasClass('messages-title'),
      type: $messageEl.hasClass('message-sent') ? 'sent' : 'received',
      text: $messageEl.find('.message-text').html(),
      image: $messageEl.find('.message-image').html(),
      imageSrc: $messageEl.find('.message-image img').attr('src'),
      typing: $messageEl.hasClass('message-typing')
    };

    if (data.isTitle) {
      data.text = $messageEl.html();
    }

    if (data.text && data.textHeader) {
      data.text = data.text.replace("<div class=\"message-text-header\">" + data.textHeader + "</div>", '');
    }

    if (data.text && data.textFooter) {
      data.text = data.text.replace("<div class=\"message-text-footer\">" + data.textFooter + "</div>", '');
    }

    var avatar = $messageEl.find('.message-avatar').css('background-image');
    if (avatar === 'none' || avatar === '') avatar = undefined;

    if (avatar && typeof avatar === 'string') {
      avatar = avatar.replace('url(', '').replace(')', '').replace(/"/g, '').replace(/'/g, '');
    } else {
      avatar = undefined;
    }

    data.avatar = avatar;
    return data;
  };

  _proto.getMessagesData = function getMessagesData() {
    var m = this;
    var data = [];
    m.$el.find('.message, .messages-title').each(function (messageEl) {
      data.push(m.getMessageData(messageEl));
    });
    return data;
  };

  _proto.renderMessage = function renderMessage(messageToRender) {
    var m = this;
    var message = (0, _utils.extend)({
      type: 'sent',
      attrs: {}
    }, messageToRender);

    if (m.params.renderMessage) {
      return m.params.renderMessage.call(m, message);
    }

    if (message.isTitle) {
      return "<div class=\"messages-title\">" + message.text + "</div>";
    }

    var attrs = Object.keys(message.attrs).map(function (attr) {
      return attr + "=\"" + message.attrs[attr] + "\"";
    }).join(' ');
    return (0, _$jsx.default)("div", _extends({
      class: "message message-" + message.type + " " + (message.isTyping ? 'message-typing' : '') + " " + (message.cssClass || '')
    }, attrs), message.avatar && (0, _$jsx.default)("div", {
      class: "message-avatar",
      style: "background-image:url(" + message.avatar + ")"
    }), (0, _$jsx.default)("div", {
      class: "message-content"
    }, message.name && (0, _$jsx.default)("div", {
      class: "message-name"
    }, message.name), message.header && (0, _$jsx.default)("div", {
      class: "message-header"
    }, message.header), (0, _$jsx.default)("div", {
      class: "message-bubble"
    }, message.textHeader && (0, _$jsx.default)("div", {
      class: "message-text-header"
    }, message.textHeader), message.image && (0, _$jsx.default)("div", {
      class: "message-image"
    }, message.image), message.imageSrc && !message.image && (0, _$jsx.default)("div", {
      class: "message-image"
    }, (0, _$jsx.default)("img", {
      src: message.imageSrc
    })), (message.text || message.isTyping) && (0, _$jsx.default)("div", {
      class: "message-text"
    }, message.text || '', message.isTyping && (0, _$jsx.default)("div", {
      class: "message-typing-indicator"
    }, (0, _$jsx.default)("div", null), (0, _$jsx.default)("div", null), (0, _$jsx.default)("div", null))), message.textFooter && (0, _$jsx.default)("div", {
      class: "message-text-footer"
    }, message.textFooter)), message.footer && (0, _$jsx.default)("div", {
      class: "message-footer"
    }, message.footer)));
  };

  _proto.renderMessages = function renderMessages(messagesToRender, method) {
    if (messagesToRender === void 0) {
      messagesToRender = this.messages;
    }

    if (method === void 0) {
      method = this.params.newMessagesFirst ? 'prepend' : 'append';
    }

    var m = this;
    var html = messagesToRender.map(function (message) {
      return m.renderMessage(message);
    }).join('');
    m.$el[method](html);
  };

  _proto.isFirstMessage = function isFirstMessage() {
    var _m$params;

    var m = this;
    if (m.params.firstMessageRule) return (_m$params = m.params).firstMessageRule.apply(_m$params, arguments);
    return false;
  };

  _proto.isLastMessage = function isLastMessage() {
    var _m$params2;

    var m = this;
    if (m.params.lastMessageRule) return (_m$params2 = m.params).lastMessageRule.apply(_m$params2, arguments);
    return false;
  };

  _proto.isTailMessage = function isTailMessage() {
    var _m$params3;

    var m = this;
    if (m.params.tailMessageRule) return (_m$params3 = m.params).tailMessageRule.apply(_m$params3, arguments);
    return false;
  };

  _proto.isSameNameMessage = function isSameNameMessage() {
    var _m$params4;

    var m = this;
    if (m.params.sameNameMessageRule) return (_m$params4 = m.params).sameNameMessageRule.apply(_m$params4, arguments);
    return false;
  };

  _proto.isSameHeaderMessage = function isSameHeaderMessage() {
    var _m$params5;

    var m = this;
    if (m.params.sameHeaderMessageRule) return (_m$params5 = m.params).sameHeaderMessageRule.apply(_m$params5, arguments);
    return false;
  };

  _proto.isSameFooterMessage = function isSameFooterMessage() {
    var _m$params6;

    var m = this;
    if (m.params.sameFooterMessageRule) return (_m$params6 = m.params).sameFooterMessageRule.apply(_m$params6, arguments);
    return false;
  };

  _proto.isSameAvatarMessage = function isSameAvatarMessage() {
    var _m$params7;

    var m = this;
    if (m.params.sameAvatarMessageRule) return (_m$params7 = m.params).sameAvatarMessageRule.apply(_m$params7, arguments);
    return false;
  };

  _proto.isCustomClassMessage = function isCustomClassMessage() {
    var _m$params8;

    var m = this;
    if (m.params.customClassMessageRule) return (_m$params8 = m.params).customClassMessageRule.apply(_m$params8, arguments);
    return undefined;
  };

  _proto.layout = function layout() {
    var m = this;
    m.$el.find('.message, .messages-title').each(function (messageEl, index) {
      var $messageEl = (0, _dom.default)(messageEl);

      if (!m.messages) {
        m.messages = m.getMessagesData();
      }

      var classes = [];
      var message = m.messages[index];
      var previousMessage = m.messages[index - 1];
      var nextMessage = m.messages[index + 1];

      if (m.isFirstMessage(message, previousMessage, nextMessage)) {
        classes.push('message-first');
      }

      if (m.isLastMessage(message, previousMessage, nextMessage)) {
        classes.push('message-last');
      }

      if (m.isTailMessage(message, previousMessage, nextMessage)) {
        classes.push('message-tail');
      }

      if (m.isSameNameMessage(message, previousMessage, nextMessage)) {
        classes.push('message-same-name');
      }

      if (m.isSameHeaderMessage(message, previousMessage, nextMessage)) {
        classes.push('message-same-header');
      }

      if (m.isSameFooterMessage(message, previousMessage, nextMessage)) {
        classes.push('message-same-footer');
      }

      if (m.isSameAvatarMessage(message, previousMessage, nextMessage)) {
        classes.push('message-same-avatar');
      }

      var customMessageClasses = m.isCustomClassMessage(message, previousMessage, nextMessage);

      if (customMessageClasses && customMessageClasses.length) {
        if (typeof customMessageClasses === 'string') {
          customMessageClasses = customMessageClasses.split(' ');
        }

        customMessageClasses.forEach(function (customClass) {
          classes.push(customClass);
        });
      }

      $messageEl.removeClass('message-first message-last message-tail message-same-name message-same-header message-same-footer message-same-avatar');
      classes.forEach(function (className) {
        $messageEl.addClass(className);
      });
    });
  };

  _proto.clear = function clear() {
    var m = this;
    m.messages = [];
    m.$el.html('');
  };

  _proto.removeMessage = function removeMessage(messageToRemove, layout) {
    if (layout === void 0) {
      layout = true;
    }

    var m = this; // Index or El

    var index;
    var $el;

    if (typeof messageToRemove === 'number') {
      index = messageToRemove;
      $el = m.$el.find('.message, .messages-title').eq(index);
    } else if (m.messages && m.messages.indexOf(messageToRemove) >= 0) {
      index = m.messages.indexOf(messageToRemove);
      $el = m.$el.children().eq(index);
    } else {
      $el = (0, _dom.default)(messageToRemove);
      index = $el.index();
    }

    if ($el.length === 0) {
      return m;
    }

    $el.remove();
    m.messages.splice(index, 1);
    if (m.params.autoLayout && layout) m.layout();
    return m;
  };

  _proto.removeMessages = function removeMessages(messagesToRemove, layout) {
    if (layout === void 0) {
      layout = true;
    }

    var m = this;

    if (Array.isArray(messagesToRemove)) {
      var messagesToRemoveEls = [];
      messagesToRemove.forEach(function (messageToRemoveIndex) {
        messagesToRemoveEls.push(m.$el.find('.message, .messages-title').eq(messageToRemoveIndex));
      });
      messagesToRemoveEls.forEach(function (messageToRemove) {
        m.removeMessage(messageToRemove, false);
      });
    } else {
      (0, _dom.default)(messagesToRemove).each(function (messageToRemove) {
        m.removeMessage(messageToRemove, false);
      });
    }

    if (m.params.autoLayout && layout) m.layout();
    return m;
  };

  _proto.addMessage = function addMessage() {
    var m = this;
    var messageToAdd;
    var animate;
    var method;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (typeof args[1] === 'boolean') {
      messageToAdd = args[0];
      animate = args[1];
      method = args[2];
    } else {
      messageToAdd = args[0];
      method = args[1];
      animate = args[2];
    }

    if (typeof animate === 'undefined') {
      animate = true;
    }

    if (typeof method === 'undefined') {
      method = m.params.newMessagesFirst ? 'prepend' : 'append';
    }

    return m.addMessages([messageToAdd], animate, method);
  };

  _proto.addMessages = function addMessages() {
    var m = this;
    var messagesToAdd;
    var animate;
    var method;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (typeof args[1] === 'boolean') {
      messagesToAdd = args[0];
      animate = args[1];
      method = args[2];
    } else {
      messagesToAdd = args[0];
      method = args[1];
      animate = args[2];
    }

    if (typeof animate === 'undefined') {
      animate = true;
    }

    if (typeof method === 'undefined') {
      method = m.params.newMessagesFirst ? 'prepend' : 'append';
    } // Define scroll positions before new messages added


    var scrollHeightBefore = m.pageContentEl.scrollHeight;
    var heightBefore = m.pageContentEl.offsetHeight;
    var scrollBefore = m.pageContentEl.scrollTop; // Add message to DOM and data

    var messagesHTML = '';
    var typingMessage = m.messages.filter(function (el) {
      return el.isTyping;
    })[0];
    messagesToAdd.forEach(function (messageToAdd) {
      if (typingMessage) {
        if (method === 'append') {
          m.messages.splice(m.messages.indexOf(typingMessage), 0, messageToAdd);
        } else {
          m.messages.splice(m.messages.indexOf(typingMessage) + 1, 0, messageToAdd);
        }
      } else {
        m.messages[method === 'append' ? 'push' : 'unshift'](messageToAdd);
      }

      messagesHTML += m.renderMessage(messageToAdd);
    });
    var $messagesEls = (0, _dom.default)(messagesHTML);

    if (animate) {
      if (method === 'append' && !m.params.newMessagesFirst) {
        $messagesEls.addClass('message-appear-from-bottom');
      }

      if (method === 'prepend' && m.params.newMessagesFirst) {
        $messagesEls.addClass('message-appear-from-top');
      }
    }

    if (typingMessage) {
      if (method === 'append') {
        $messagesEls.insertBefore(m.$el.find('.message-typing'));
      } else {
        $messagesEls.insertAfter(m.$el.find('.message-typing'));
      }
    } else {
      m.$el[method]($messagesEls);
    } // Layout


    if (m.params.autoLayout) m.layout();

    if (method === 'prepend' && !typingMessage) {
      m.pageContentEl.scrollTop = scrollBefore + (m.pageContentEl.scrollHeight - scrollHeightBefore);
    }

    if (m.params.scrollMessages && (method === 'append' && !m.params.newMessagesFirst || method === 'prepend' && m.params.newMessagesFirst && !typingMessage)) {
      if (m.params.scrollMessagesOnEdge) {
        var onEdge = false;

        if (m.params.newMessagesFirst && scrollBefore === 0) {
          onEdge = true;
        }

        if (!m.params.newMessagesFirst && scrollBefore - (scrollHeightBefore - heightBefore) >= -10) {
          onEdge = true;
        }

        if (onEdge) m.scroll(animate ? undefined : 0);
      } else {
        m.scroll(animate ? undefined : 0);
      }
    }

    return m;
  };

  _proto.showTyping = function showTyping(message) {
    if (message === void 0) {
      message = {};
    }

    var m = this;
    var typingMessage = m.messages.filter(function (el) {
      return el.isTyping;
    })[0];

    if (typingMessage) {
      m.removeMessage(m.messages.indexOf(typingMessage));
    }

    m.addMessage((0, _utils.extend)({
      type: 'received',
      isTyping: true
    }, message));
    return m;
  };

  _proto.hideTyping = function hideTyping() {
    var m = this;
    var typingMessageIndex;
    var typingFound;
    m.messages.forEach(function (message, index) {
      if (message.isTyping) typingMessageIndex = index;
    });

    if (typeof typingMessageIndex !== 'undefined') {
      if (m.$el.find('.message').eq(typingMessageIndex).hasClass('message-typing')) {
        typingFound = true;
        m.removeMessage(typingMessageIndex);
      }
    }

    if (!typingFound) {
      var $typingMessageEl = m.$el.find('.message-typing');

      if ($typingMessageEl.length) {
        m.removeMessage($typingMessageEl);
      }
    }

    return m;
  };

  _proto.scroll = function scroll(duration, scrollTop) {
    if (duration === void 0) {
      duration = 300;
    }

    var m = this;
    var currentScroll = m.pageContentEl.scrollTop;
    var newScrollTop;
    if (typeof scrollTop !== 'undefined') newScrollTop = scrollTop;else {
      newScrollTop = m.params.newMessagesFirst ? 0 : m.pageContentEl.scrollHeight - m.pageContentEl.offsetHeight;
      if (newScrollTop === currentScroll) return m;
    }
    m.$pageContentEl.scrollTop(newScrollTop, duration);
    return m;
  };

  _proto.init = function init() {
    var m = this;

    if (!m.messages || m.messages.length === 0) {
      m.messages = m.getMessagesData();
    }

    if (m.params.messages && m.params.messages.length) {
      m.renderMessages();
    }

    if (m.params.autoLayout) m.layout();
    if (m.params.scrollMessages) m.scroll(0);
  };

  _proto.destroy = function destroy() {
    var m = this;
    m.emit('local::beforeDestroy messagesBeforeDestroy', m);
    m.$el.trigger('messages:beforedestroy');

    if (m.$el[0]) {
      m.$el[0].f7Messages = null;
      delete m.$el[0].f7Messages;
    }

    (0, _utils.deleteProps)(m);
  };

  return Messages;
}(_class.default);

var _default = Messages;
exports.default = _default;