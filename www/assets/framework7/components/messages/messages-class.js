function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import $ from '../../shared/dom7.js';
import { extend, deleteProps } from '../../shared/utils.js';
import Framework7Class from '../../shared/class.js';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx.js';

class Messages extends Framework7Class {
  constructor(app, params) {
    if (params === void 0) {
      params = {};
    }

    super(params, [app]);
    const m = this;
    const defaults = {
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
    m.params = extend(defaults, params);
    const $el = $(params.el).eq(0);
    if ($el.length === 0) return m;
    if ($el[0].f7Messages) return $el[0].f7Messages;
    $el[0].f7Messages = m;
    const $pageContentEl = $el.closest('.page-content').eq(0);
    extend(m, {
      messages: m.params.messages,
      $el,
      el: $el[0],
      $pageContentEl,
      pageContentEl: $pageContentEl[0]
    }); // Install Modules

    m.useModules(); // Init

    m.init();
    return m;
  } // eslint-disable-next-line


  getMessageData(messageEl) {
    const $messageEl = $(messageEl);
    const data = {
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
      data.text = data.text.replace(`<div class="message-text-header">${data.textHeader}</div>`, '');
    }

    if (data.text && data.textFooter) {
      data.text = data.text.replace(`<div class="message-text-footer">${data.textFooter}</div>`, '');
    }

    let avatar = $messageEl.find('.message-avatar').css('background-image');
    if (avatar === 'none' || avatar === '') avatar = undefined;

    if (avatar && typeof avatar === 'string') {
      avatar = avatar.replace('url(', '').replace(')', '').replace(/"/g, '').replace(/'/g, '');
    } else {
      avatar = undefined;
    }

    data.avatar = avatar;
    return data;
  }

  getMessagesData() {
    const m = this;
    const data = [];
    m.$el.find('.message, .messages-title').each(messageEl => {
      data.push(m.getMessageData(messageEl));
    });
    return data;
  }

  renderMessage(messageToRender) {
    const m = this;
    const message = extend({
      type: 'sent',
      attrs: {}
    }, messageToRender);

    if (m.params.renderMessage) {
      return m.params.renderMessage.call(m, message);
    }

    if (message.isTitle) {
      return `<div class="messages-title">${message.text}</div>`;
    }

    return $jsx("div", _extends({
      class: `message message-${message.type} ${message.isTyping ? 'message-typing' : ''} ${message.cssClass || ''}`
    }, message.attrs), message.avatar && $jsx("div", {
      class: "message-avatar",
      style: `background-image:url(${message.avatar})`
    }), $jsx("div", {
      class: "message-content"
    }, message.name && $jsx("div", {
      class: "message-name"
    }, message.name), message.header && $jsx("div", {
      class: "message-header"
    }, message.header), $jsx("div", {
      class: "message-bubble"
    }, message.textHeader && $jsx("div", {
      class: "message-text-header"
    }, message.textHeader), message.image && $jsx("div", {
      class: "message-image"
    }, message.image), message.imageSrc && !message.image && $jsx("div", {
      class: "message-image"
    }, $jsx("img", {
      src: message.imageSrc
    })), (message.text || message.isTyping) && $jsx("div", {
      class: "message-text"
    }, message.text || '', message.isTyping && $jsx("div", {
      class: "message-typing-indicator"
    }, $jsx("div", null), $jsx("div", null), $jsx("div", null))), message.textFooter && $jsx("div", {
      class: "message-text-footer"
    }, message.textFooter)), message.footer && $jsx("div", {
      class: "message-footer"
    }, message.footer)));
  }

  renderMessages(messagesToRender, method) {
    if (messagesToRender === void 0) {
      messagesToRender = this.messages;
    }

    if (method === void 0) {
      method = this.params.newMessagesFirst ? 'prepend' : 'append';
    }

    const m = this;
    const html = messagesToRender.map(message => m.renderMessage(message)).join('');
    m.$el[method](html);
  }

  isFirstMessage() {
    const m = this;
    if (m.params.firstMessageRule) return m.params.firstMessageRule(...arguments);
    return false;
  }

  isLastMessage() {
    const m = this;
    if (m.params.lastMessageRule) return m.params.lastMessageRule(...arguments);
    return false;
  }

  isTailMessage() {
    const m = this;
    if (m.params.tailMessageRule) return m.params.tailMessageRule(...arguments);
    return false;
  }

  isSameNameMessage() {
    const m = this;
    if (m.params.sameNameMessageRule) return m.params.sameNameMessageRule(...arguments);
    return false;
  }

  isSameHeaderMessage() {
    const m = this;
    if (m.params.sameHeaderMessageRule) return m.params.sameHeaderMessageRule(...arguments);
    return false;
  }

  isSameFooterMessage() {
    const m = this;
    if (m.params.sameFooterMessageRule) return m.params.sameFooterMessageRule(...arguments);
    return false;
  }

  isSameAvatarMessage() {
    const m = this;
    if (m.params.sameAvatarMessageRule) return m.params.sameAvatarMessageRule(...arguments);
    return false;
  }

  isCustomClassMessage() {
    const m = this;
    if (m.params.customClassMessageRule) return m.params.customClassMessageRule(...arguments);
    return undefined;
  }

  layout() {
    const m = this;
    m.$el.find('.message, .messages-title').each((messageEl, index) => {
      const $messageEl = $(messageEl);

      if (!m.messages) {
        m.messages = m.getMessagesData();
      }

      const classes = [];
      const message = m.messages[index];
      const previousMessage = m.messages[index - 1];
      const nextMessage = m.messages[index + 1];

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

      let customMessageClasses = m.isCustomClassMessage(message, previousMessage, nextMessage);

      if (customMessageClasses && customMessageClasses.length) {
        if (typeof customMessageClasses === 'string') {
          customMessageClasses = customMessageClasses.split(' ');
        }

        customMessageClasses.forEach(customClass => {
          classes.push(customClass);
        });
      }

      $messageEl.removeClass('message-first message-last message-tail message-same-name message-same-header message-same-footer message-same-avatar');
      classes.forEach(className => {
        $messageEl.addClass(className);
      });
    });
  }

  clear() {
    const m = this;
    m.messages = [];
    m.$el.html('');
  }

  removeMessage(messageToRemove, layout) {
    if (layout === void 0) {
      layout = true;
    }

    const m = this; // Index or El

    let index;
    let $el;

    if (typeof messageToRemove === 'number') {
      index = messageToRemove;
      $el = m.$el.find('.message, .messages-title').eq(index);
    } else if (m.messages && m.messages.indexOf(messageToRemove) >= 0) {
      index = m.messages.indexOf(messageToRemove);
      $el = m.$el.children().eq(index);
    } else {
      $el = $(messageToRemove);
      index = $el.index();
    }

    if ($el.length === 0) {
      return m;
    }

    $el.remove();
    m.messages.splice(index, 1);
    if (m.params.autoLayout && layout) m.layout();
    return m;
  }

  removeMessages(messagesToRemove, layout) {
    if (layout === void 0) {
      layout = true;
    }

    const m = this;

    if (Array.isArray(messagesToRemove)) {
      const messagesToRemoveEls = [];
      messagesToRemove.forEach(messageToRemoveIndex => {
        messagesToRemoveEls.push(m.$el.find('.message, .messages-title').eq(messageToRemoveIndex));
      });
      messagesToRemoveEls.forEach(messageToRemove => {
        m.removeMessage(messageToRemove, false);
      });
    } else {
      $(messagesToRemove).each(messageToRemove => {
        m.removeMessage(messageToRemove, false);
      });
    }

    if (m.params.autoLayout && layout) m.layout();
    return m;
  }

  addMessage() {
    const m = this;
    let messageToAdd;
    let animate;
    let method;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (typeof args[1] === 'boolean') {
      [messageToAdd, animate, method] = args;
    } else {
      [messageToAdd, method, animate] = args;
    }

    if (typeof animate === 'undefined') {
      animate = true;
    }

    if (typeof method === 'undefined') {
      method = m.params.newMessagesFirst ? 'prepend' : 'append';
    }

    return m.addMessages([messageToAdd], animate, method);
  }

  setScrollData() {
    const m = this; // Define scroll positions before new messages added

    const scrollHeightBefore = m.pageContentEl.scrollHeight;
    const heightBefore = m.pageContentEl.offsetHeight;
    const scrollBefore = m.pageContentEl.scrollTop;
    m.scrollData = {
      scrollHeightBefore,
      heightBefore,
      scrollBefore
    };
    return {
      scrollHeightBefore,
      heightBefore,
      scrollBefore
    };
  }

  addMessages() {
    const m = this;
    let messagesToAdd;
    let animate;
    let method;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (typeof args[1] === 'boolean') {
      [messagesToAdd, animate, method] = args;
    } else {
      [messagesToAdd, method, animate] = args;
    }

    if (typeof animate === 'undefined') {
      animate = true;
    }

    if (typeof method === 'undefined') {
      method = m.params.newMessagesFirst ? 'prepend' : 'append';
    }

    const {
      scrollHeightBefore,
      scrollBefore
    } = m.setScrollData(); // Add message to DOM and data

    let messagesHTML = '';
    const typingMessage = m.messages.filter(el => el.isTyping)[0];
    messagesToAdd.forEach(messageToAdd => {
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
    const $messagesEls = $(messagesHTML);

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
      m.scrollWithEdgeCheck(animate);
    }

    return m;
  }

  showTyping(message) {
    if (message === void 0) {
      message = {};
    }

    const m = this;
    const typingMessage = m.messages.filter(el => el.isTyping)[0];

    if (typingMessage) {
      m.removeMessage(m.messages.indexOf(typingMessage));
    }

    m.addMessage(extend({
      type: 'received',
      isTyping: true
    }, message));
    return m;
  }

  hideTyping() {
    const m = this;
    let typingMessageIndex;
    let typingFound;
    m.messages.forEach((message, index) => {
      if (message.isTyping) typingMessageIndex = index;
    });

    if (typeof typingMessageIndex !== 'undefined') {
      if (m.$el.find('.message').eq(typingMessageIndex).hasClass('message-typing')) {
        typingFound = true;
        m.removeMessage(typingMessageIndex);
      }
    }

    if (!typingFound) {
      const $typingMessageEl = m.$el.find('.message-typing');

      if ($typingMessageEl.length) {
        m.removeMessage($typingMessageEl);
      }
    }

    return m;
  }

  scrollWithEdgeCheck(animate) {
    const m = this;
    const {
      scrollBefore,
      scrollHeightBefore,
      heightBefore
    } = m.scrollData;

    if (m.params.scrollMessagesOnEdge) {
      let onEdge = false;

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

  scroll(duration, scrollTop) {
    if (duration === void 0) {
      duration = 300;
    }

    const m = this;
    const currentScroll = m.pageContentEl.scrollTop;
    let newScrollTop;
    if (typeof scrollTop !== 'undefined') newScrollTop = scrollTop;else {
      newScrollTop = m.params.newMessagesFirst ? 0 : m.pageContentEl.scrollHeight - m.pageContentEl.offsetHeight;
      if (newScrollTop === currentScroll) return m;
    }
    m.$pageContentEl.scrollTop(newScrollTop, duration);
    return m;
  }

  init() {
    const m = this;

    if (!m.messages || m.messages.length === 0) {
      m.messages = m.getMessagesData();
    }

    if (m.params.messages && m.params.messages.length) {
      m.renderMessages();
    }

    if (m.params.autoLayout) m.layout();
    if (m.params.scrollMessages) m.scroll(0);
  }

  destroy() {
    const m = this;
    m.emit('local::beforeDestroy messagesBeforeDestroy', m);
    m.$el.trigger('messages:beforedestroy');

    if (m.$el[0]) {
      m.$el[0].f7Messages = null;
      delete m.$el[0].f7Messages;
    }

    deleteProps(m);
  }

}

export default Messages;