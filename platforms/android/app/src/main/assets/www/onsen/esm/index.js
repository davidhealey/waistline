/* onsenui v2.10.6 - 2018-11-30 */

import ons from './ons/index.js';
import './ons/platform';
import './ons/microevent.js';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var fastclick = createCommonjsModule(function (module) {
	(function () {
		function FastClick(layer, options) {
			var oldOnClick;

			options = options || {};

			/**
    * Whether a click is currently being tracked.
    *
    * @type boolean
    */
			this.trackingClick = false;

			/**
    * Timestamp for when click tracking started.
    *
    * @type number
    */
			this.trackingClickStart = 0;

			/**
    * The element being tracked for a click.
    *
    * @type EventTarget
    */
			this.targetElement = null;

			/**
    * X-coordinate of touch start event.
    *
    * @type number
    */
			this.touchStartX = 0;

			/**
    * Y-coordinate of touch start event.
    *
    * @type number
    */
			this.touchStartY = 0;

			/**
    * ID of the last touch, retrieved from Touch.identifier.
    *
    * @type number
    */
			this.lastTouchIdentifier = 0;

			/**
    * Touchmove boundary, beyond which a click will be cancelled.
    *
    * @type number
    */
			this.touchBoundary = options.touchBoundary || 10;

			/**
    * The FastClick layer.
    *
    * @type Element
    */
			this.layer = layer;

			/**
    * The minimum time between tap(touchstart and touchend) events
    *
    * @type number
    */
			this.tapDelay = options.tapDelay || 200;

			/**
    * The maximum time for a tap
    *
    * @type number
    */
			this.tapTimeout = options.tapTimeout || 700;

			if (FastClick.notNeeded(layer)) {
				return;
			}

			// Some old versions of Android don't have Function.prototype.bind
			function bind(method, context) {
				return function () {
					return method.apply(context, arguments);
				};
			}

			var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
			var context = this;
			for (var i = 0, l = methods.length; i < l; i++) {
				context[methods[i]] = bind(context[methods[i]], context);
			}

			// Set up event handlers as required
			if (deviceIsAndroid) {
				layer.addEventListener('mouseover', this.onMouse, true);
				layer.addEventListener('mousedown', this.onMouse, true);
				layer.addEventListener('mouseup', this.onMouse, true);
			}

			layer.addEventListener('click', this.onClick, true);
			layer.addEventListener('touchstart', this.onTouchStart, false);
			layer.addEventListener('touchmove', this.onTouchMove, false);
			layer.addEventListener('touchend', this.onTouchEnd, false);
			layer.addEventListener('touchcancel', this.onTouchCancel, false);

			// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
			// layer when they are cancelled.
			if (!Event.prototype.stopImmediatePropagation) {
				layer.removeEventListener = function (type, callback, capture) {
					var rmv = Node.prototype.removeEventListener;
					if (type === 'click') {
						rmv.call(layer, type, callback.hijacked || callback, capture);
					} else {
						rmv.call(layer, type, callback, capture);
					}
				};

				layer.addEventListener = function (type, callback, capture) {
					var adv = Node.prototype.addEventListener;
					if (type === 'click') {
						adv.call(layer, type, callback.hijacked || (callback.hijacked = function (event) {
							if (!event.propagationStopped) {
								callback(event);
							}
						}), capture);
					} else {
						adv.call(layer, type, callback, capture);
					}
				};
			}

			// If a handler is already declared in the element's onclick attribute, it will be fired before
			// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
			// adding it as listener.
			if (typeof layer.onclick === 'function') {

				// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
				// - the old one won't work if passed to addEventListener directly.
				oldOnClick = layer.onclick;
				layer.addEventListener('click', function (event) {
					oldOnClick(event);
				}, false);
				layer.onclick = null;
			}
		}

		/**
  * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
  *
  * @type boolean
  */
		var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

		/**
   * Android requires exceptions.
   *
   * @type boolean
   */
		var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;

		/**
   * iOS requires exceptions.
   *
   * @type boolean
   */
		var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;

		/**
   * iOS 4 requires an exception for select elements.
   *
   * @type boolean
   */
		var deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);

		/**
   * iOS 6.0-7.* requires the target element to be manually derived
   *
   * @type boolean
   */
		var deviceIsIOSWithBadTarget = deviceIsIOS && /OS [6-7]_\d/.test(navigator.userAgent);

		/**
   * BlackBerry requires exceptions.
   *
   * @type boolean
   */
		var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

		/**
   * Valid types for text inputs
   *
   * @type array
   */
		var textFields = ['email', 'number', 'password', 'search', 'tel', 'text', 'url'];

		/**
   * Determine whether a given element requires a native click.
   *
   * @param {EventTarget|Element} target Target DOM element
   * @returns {boolean} Returns true if the element needs a native click
   */
		FastClick.prototype.needsClick = function (target) {
			switch (target.nodeName.toLowerCase()) {

				// Don't send a synthetic click to disabled inputs (issue #62)
				case 'button':
				case 'select':
				case 'textarea':
					if (target.disabled) {
						return true;
					}

					break;
				case 'input':

					// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
					if (deviceIsIOS && target.type === 'file' || target.disabled) {
						return true;
					}

					break;
				case 'label':
				case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
				case 'video':
					return true;
			}

			return (/\bneedsclick\b/.test(target.className)
			);
		};

		/**
   * Determine whether a given element requires a call to focus to simulate click into element.
   *
   * @param {EventTarget|Element} target Target DOM element
   * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
   */
		FastClick.prototype.needsFocus = function (target) {
			switch (target.nodeName.toLowerCase()) {
				case 'textarea':
					return true;
				case 'select':
					return !deviceIsAndroid;
				case 'input':
					switch (target.type) {
						case 'button':
						case 'checkbox':
						case 'file':
						case 'image':
						case 'radio':
						case 'submit':
							return false;
					}

					// No point in attempting to focus disabled inputs
					return !target.disabled && !target.readOnly;
				default:
					return (/\bneedsfocus\b/.test(target.className)
					);
			}
		};

		/**
   * Send a click event to the specified element.
   *
   * @param {EventTarget|Element} targetElement
   * @param {Event} event
   */
		FastClick.prototype.sendClick = function (targetElement, event) {
			var clickEvent, touch;

			// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
			if (document.activeElement && document.activeElement !== targetElement) {
				document.activeElement.blur();
			}

			touch = event.changedTouches[0];

			// Synthesise a click event, with an extra attribute so it can be tracked
			clickEvent = document.createEvent('MouseEvents');
			clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
			clickEvent.forwardedTouchEvent = true;
			targetElement.dispatchEvent(clickEvent);
		};

		FastClick.prototype.determineEventType = function (targetElement) {

			//Issue #159: Android Chrome Select Box does not open with a synthetic click event
			if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
				return 'mousedown';
			}

			return 'click';
		};

		/**
   * @param {EventTarget|Element} targetElement
   */
		FastClick.prototype.focus = function (targetElement) {
			var length;

			// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
			if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month' && targetElement.type !== 'email' && targetElement.type !== 'number') {
				length = targetElement.value.length;
				targetElement.setSelectionRange(length, length);
			} else {
				targetElement.focus();
			}
		};

		/**
   * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
   *
   * @param {EventTarget|Element} targetElement
   */
		FastClick.prototype.updateScrollParent = function (targetElement) {
			var scrollParent, parentElement;

			scrollParent = targetElement.fastClickScrollParent;

			// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
			// target element was moved to another parent.
			if (!scrollParent || !scrollParent.contains(targetElement)) {
				parentElement = targetElement;
				do {
					if (parentElement.scrollHeight > parentElement.offsetHeight) {
						scrollParent = parentElement;
						targetElement.fastClickScrollParent = parentElement;
						break;
					}

					parentElement = parentElement.parentElement;
				} while (parentElement);
			}

			// Always update the scroll top tracker if possible.
			if (scrollParent) {
				scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
			}
		};

		/**
   * @param {EventTarget} targetElement
   * @returns {Element|EventTarget}
   */
		FastClick.prototype.getTargetElementFromEventTarget = function (eventTarget) {

			// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
			if (eventTarget.nodeType === Node.TEXT_NODE) {
				return eventTarget.parentNode;
			}

			return eventTarget;
		};

		/**
   * @param {EventTarget} targetElement
   * @returns {boolean}
   */
		FastClick.prototype.isTextField = function (targetElement) {
			return targetElement.tagName.toLowerCase() === 'textarea' || textFields.indexOf(targetElement.type) !== -1;
		};

		/**
   * On touch start, record the position and scroll offset.
   *
   * @param {Event} event
   * @returns {boolean}
   */
		FastClick.prototype.onTouchStart = function (event) {
			var targetElement, touch;

			// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
			if (event.targetTouches.length > 1) {
				return true;
			}

			targetElement = this.getTargetElementFromEventTarget(event.target);
			touch = event.targetTouches[0];

			// Ignore touches on contenteditable elements to prevent conflict with text selection.
			// (For details: https://github.com/ftlabs/fastclick/pull/211 )
			if (targetElement.isContentEditable) {
				return true;
			}

			if (deviceIsIOS) {
				// Ignore touchstart in focused text field
				// Allows normal text selection and commands (select/paste/cut) when a field has focus, while still allowing fast tap-to-focus.
				// Without this fix, user needs to tap-and-hold a text field for context menu, and double-tap to select text doesn't work at all.
				if (targetElement === document.activeElement && this.isTextField(targetElement)) {
					return true;
				}

				if (!deviceIsIOS4) {

					// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
					// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
					// with the same identifier as the touch event that previously triggered the click that triggered the alert.
					// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
					// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
					// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
					// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
					// random integers, it's safe to to continue if the identifier is 0 here.
					if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
						event.preventDefault();
						return false;
					}

					this.lastTouchIdentifier = touch.identifier;

					// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
					// 1) the user does a fling scroll on the scrollable layer
					// 2) the user stops the fling scroll with another tap
					// then the event.target of the last 'touchend' event will be the element that was under the user's finger
					// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
					// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
					this.updateScrollParent(targetElement);
				}
			}

			this.trackingClick = true;
			this.trackingClickStart = event.timeStamp;
			this.targetElement = targetElement;

			this.touchStartX = touch.pageX;
			this.touchStartY = touch.pageY;

			// Prevent phantom clicks on fast double-tap (issue #36)
			if (event.timeStamp - this.lastClickTime < this.tapDelay && event.timeStamp - this.lastClickTime > -1) {
				event.preventDefault();
			}

			return true;
		};

		/**
   * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
   *
   * @param {Event} event
   * @returns {boolean}
   */
		FastClick.prototype.touchHasMoved = function (event) {
			var touch = event.changedTouches[0],
			    boundary = this.touchBoundary;

			if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
				return true;
			}

			return false;
		};

		/**
   * Update the last position.
   *
   * @param {Event} event
   * @returns {boolean}
   */
		FastClick.prototype.onTouchMove = function (event) {
			if (!this.trackingClick) {
				return true;
			}

			// If the touch has moved, cancel the click tracking
			if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
				this.trackingClick = false;
				this.targetElement = null;
			}

			return true;
		};

		/**
   * Attempt to find the labelled control for the given label element.
   *
   * @param {EventTarget|HTMLLabelElement} labelElement
   * @returns {Element|null}
   */
		FastClick.prototype.findControl = function (labelElement) {

			// Fast path for newer browsers supporting the HTML5 control attribute
			if (labelElement.control !== undefined) {
				return labelElement.control;
			}

			// All browsers under test that support touch events also support the HTML5 htmlFor attribute
			if (labelElement.htmlFor) {
				return document.getElementById(labelElement.htmlFor);
			}

			// If no for attribute exists, attempt to retrieve the first labellable descendant element
			// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
			return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
		};

		/**
   * On touch end, determine whether to send a click event at once.
   *
   * @param {Event} event
   * @returns {boolean}
   */
		FastClick.prototype.onTouchEnd = function (event) {
			var forElement,
			    trackingClickStart,
			    targetTagName,
			    scrollParent,
			    touch,
			    targetElement = this.targetElement;

			if (!this.trackingClick) {
				return true;
			}

			// Prevent phantom clicks on fast double-tap (issue #36)
			if (event.timeStamp - this.lastClickTime < this.tapDelay && event.timeStamp - this.lastClickTime > -1) {
				this.cancelNextClick = true;
				return true;
			}

			if (event.timeStamp - this.trackingClickStart > this.tapTimeout) {
				return true;
			}

			// Reset to prevent wrong click cancel on input (issue #156).
			this.cancelNextClick = false;

			this.lastClickTime = event.timeStamp;

			trackingClickStart = this.trackingClickStart;
			this.trackingClick = false;
			this.trackingClickStart = 0;

			// On some iOS devices, the targetElement supplied with the event is invalid if the layer
			// is performing a transition or scroll, and has to be re-detected manually. Note that
			// for this to function correctly, it must be called *after* the event target is checked!
			// See issue #57; also filed as rdar://13048589 .
			if (deviceIsIOSWithBadTarget) {
				touch = event.changedTouches[0];

				// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
				targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
				targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
			}

			targetTagName = targetElement.tagName.toLowerCase();
			if (targetTagName === 'label') {
				forElement = this.findControl(targetElement);
				if (forElement) {
					this.focus(targetElement);
					if (deviceIsAndroid) {
						return false;
					}

					targetElement = forElement;
				}
			} else if (this.needsFocus(targetElement)) {

				// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
				// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
				if (event.timeStamp - trackingClickStart > 100 || deviceIsIOS && window.top !== window && targetTagName === 'input') {
					this.targetElement = null;
					return false;
				}

				this.focus(targetElement);
				this.sendClick(targetElement, event);

				// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
				// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
				if (!deviceIsIOS4 || targetTagName !== 'select') {
					this.targetElement = null;
					event.preventDefault();
				}

				return false;
			}

			if (deviceIsIOS && !deviceIsIOS4) {

				// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
				// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
				scrollParent = targetElement.fastClickScrollParent;
				if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
					return true;
				}
			}

			// Prevent the actual click from going though - unless the target node is marked as requiring
			// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
			if (!this.needsClick(targetElement)) {
				event.preventDefault();
				this.sendClick(targetElement, event);
			}

			return false;
		};

		/**
   * On touch cancel, stop tracking the click.
   *
   * @returns {void}
   */
		FastClick.prototype.onTouchCancel = function () {
			this.trackingClick = false;
			this.targetElement = null;
		};

		/**
   * Determine mouse events which should be permitted.
   *
   * @param {Event} event
   * @returns {boolean}
   */
		FastClick.prototype.onMouse = function (event) {

			// If a target element was never set (because a touch event was never fired) allow the event
			if (!this.targetElement) {
				return true;
			}

			if (event.forwardedTouchEvent) {
				return true;
			}

			// Programmatically generated events targeting a specific element should be permitted
			if (!event.cancelable) {
				return true;
			}

			// Derive and check the target element to see whether the mouse event needs to be permitted;
			// unless explicitly enabled, prevent non-touch click events from triggering actions,
			// to prevent ghost/doubleclicks.
			if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

				// Prevent any user-added listeners declared on FastClick element from being fired.
				if (event.stopImmediatePropagation) {
					event.stopImmediatePropagation();
				} else {

					// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
					event.propagationStopped = true;
				}

				// Cancel the event
				event.stopPropagation();
				event.preventDefault();

				return false;
			}

			// If the mouse event is permitted, return true for the action to go through.
			return true;
		};

		/**
   * On actual clicks, determine whether this is a touch-generated click, a click action occurring
   * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
   * an actual click which should be permitted.
   *
   * @param {Event} event
   * @returns {boolean}
   */
		FastClick.prototype.onClick = function (event) {
			var permitted;

			// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
			if (this.trackingClick) {
				this.targetElement = null;
				this.trackingClick = false;
				return true;
			}

			// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
			if (event.target.type === 'submit' && event.detail === 0) {
				return true;
			}

			permitted = this.onMouse(event);

			// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
			if (!permitted) {
				this.targetElement = null;
			}

			// If clicks are permitted, return true for the action to go through.
			return permitted;
		};

		/**
   * Remove all FastClick's event listeners.
   *
   * @returns {void}
   */
		FastClick.prototype.destroy = function () {
			var layer = this.layer;

			if (deviceIsAndroid) {
				layer.removeEventListener('mouseover', this.onMouse, true);
				layer.removeEventListener('mousedown', this.onMouse, true);
				layer.removeEventListener('mouseup', this.onMouse, true);
			}

			layer.removeEventListener('click', this.onClick, true);
			layer.removeEventListener('touchstart', this.onTouchStart, false);
			layer.removeEventListener('touchmove', this.onTouchMove, false);
			layer.removeEventListener('touchend', this.onTouchEnd, false);
			layer.removeEventListener('touchcancel', this.onTouchCancel, false);
		};

		/**
   * Check whether FastClick is needed.
   *
   * @param {Element} layer The layer to listen on
   */
		FastClick.notNeeded = function (layer) {
			var metaViewport;
			var chromeVersion;
			var blackberryVersion;
			var firefoxVersion;

			// Devices that don't support touch don't need FastClick
			if (typeof window.ontouchstart === 'undefined') {
				return true;
			}

			// Chrome version - zero for other browsers
			chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

			if (chromeVersion) {

				if (deviceIsAndroid) {
					metaViewport = document.querySelector('meta[name=viewport]');

					if (metaViewport) {
						// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
						if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
							return true;
						}
						// Chrome 32 and above with width=device-width or less don't need FastClick
						if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
							return true;
						}
					}

					// Chrome desktop doesn't need FastClick (issue #15)
				} else {
					return true;
				}
			}

			if (deviceIsBlackBerry10) {
				blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

				// BlackBerry 10.3+ does not require Fastclick library.
				// https://github.com/ftlabs/fastclick/issues/251
				if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
					metaViewport = document.querySelector('meta[name=viewport]');

					if (metaViewport) {
						// user-scalable=no eliminates click delay.
						if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
							return true;
						}
						// width=device-width (or less than device-width) eliminates click delay.
						if (document.documentElement.scrollWidth <= window.outerWidth) {
							return true;
						}
					}
				}
			}

			// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
			if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
				return true;
			}

			// Firefox version - zero for other browsers
			firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

			if (firefoxVersion >= 27) {
				// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

				metaViewport = document.querySelector('meta[name=viewport]');
				if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
					return true;
				}
			}

			// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
			// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
			if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
				return true;
			}

			return false;
		};

		/**
   * Factory method for creating a FastClick object
   *
   * @param {Element} layer The layer to listen on
   * @param {Object} [options={}] The options to override the defaults
   */
		FastClick.attach = function (layer, options) {
			return new FastClick(layer, options);
		};

		if (typeof undefined === 'function' && _typeof(undefined.amd) === 'object' && undefined.amd) {

			// AMD. Register as an anonymous module.
			undefined(function () {
				return FastClick;
			});
		} else if ('object' !== 'undefined' && module.exports) {
			module.exports = FastClick.attach;
			module.exports.FastClick = FastClick;
		} else {
			window.FastClick = FastClick;
		}
	})();
});

var fastclick_1 = fastclick.FastClick;

// For @onsenui/custom-elements
if (window.customElements) {
    // even if native CE1 impl exists, use polyfill
    window.customElements.forcePolyfill = true;
}

var _global = createCommonjsModule(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
  var core = module.exports = { version: '2.5.1' };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});

var _core_1 = _core.version;

var _isObject = function _isObject(it) {
  return (typeof it === 'undefined' ? 'undefined' : _typeof(it)) === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function _anObject(it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function _fails(exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', { get: function get() {
      return 7;
    } }).a != 7;
});

var document$1 = _global.document;
// typeof document.createElement is 'object' in old IE
var is = _isObject(document$1) && _isObject(document$1.createElement);
var _domCreate = function _domCreate(it) {
  return is ? document$1.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', { get: function get() {
      return 7;
    } }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive = function _toPrimitive(it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) {/* empty */}
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp = {
  f: f
};

var _propertyDesc = function _propertyDesc(bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var hasOwnProperty = {}.hasOwnProperty;
var _has = function _has(it, key) {
  return hasOwnProperty.call(it, key);
};

var id = 0;
var px = Math.random();
var _uid = function _uid(key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _redefine = createCommonjsModule(function (module) {
  var SRC = _uid('src');
  var TO_STRING = 'toString';
  var $toString = Function[TO_STRING];
  var TPL = ('' + $toString).split(TO_STRING);

  _core.inspectSource = function (it) {
    return $toString.call(it);
  };

  (module.exports = function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
    if (O[key] === val) return;
    if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    if (O === _global) {
      O[key] = val;
    } else if (!safe) {
      delete O[key];
      _hide(O, key, val);
    } else if (O[key]) {
      O[key] = val;
    } else {
      _hide(O, key, val);
    }
    // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && this[SRC] || $toString.call(this);
  });
});

var _aFunction = function _aFunction(it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding

var _ctx = function _ctx(fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1:
      return function (a) {
        return fn.call(that, a);
      };
    case 2:
      return function (a, b) {
        return fn.call(that, a, b);
      };
    case 3:
      return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
  }
  return function () /* ...args */{
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE = 'prototype';

var $export = function $export(type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    // extend global
    if (target) _redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) _hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
_global.core = _core;
// type bitmap
$export.F = 1; // forced
$export.G = 2; // global
$export.S = 4; // static
$export.P = 8; // proto
$export.B = 16; // bind
$export.W = 32; // wrap
$export.U = 64; // safe
$export.R = 128; // real proto method for `library`
var _export = $export;

var f$2 = {}.propertyIsEnumerable;

var _objectPie = {
	f: f$2
};

var toString = {}.toString;

var _cof = function _cof(it) {
  return toString.call(it).slice(8, -1);
};

// fallback for non-array-like ES3 and non-enumerable old V8 strings

// eslint-disable-next-line no-prototype-builtins
var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function _defined(it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

// to indexed object, toObject with fallback for non-array-like ES3 strings


var _toIobject = function _toIobject(it) {
  return _iobject(_defined(it));
};

var gOPD = Object.getOwnPropertyDescriptor;

var f$1 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = _toIobject(O);
  P = _toPrimitive(P, true);
  if (_ie8DomDefine) try {
    return gOPD(O, P);
  } catch (e) {/* empty */}
  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
};

var _objectGopd = {
  f: f$1
};

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */

var check = function check(O, proto) {
  _anObject(O);
  if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
var _setProto = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
  function (test, buggy, set) {
    try {
      set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
      set(test, []);
      buggy = !(test instanceof Array);
    } catch (e) {
      buggy = true;
    }
    return function setPrototypeOf(O, proto) {
      check(O, proto);
      if (buggy) O.__proto__ = proto;else set(O, proto);
      return O;
    };
  }({}, false) : undefined),
  check: check
};

// 19.1.3.19 Object.setPrototypeOf(O, proto)

_export(_export.S, 'Object', { setPrototypeOf: _setProto.set });

var setPrototypeOf = _core.Object.setPrototypeOf;

var SHARED = '__core-js_shared__';
var store = _global[SHARED] || (_global[SHARED] = {});
var _shared = function _shared(key) {
  return store[key] || (store[key] = {});
};

var _wks = createCommonjsModule(function (module) {
  var store = _shared('wks');

  var _Symbol = _global.Symbol;
  var USE_SYMBOL = typeof _Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] = USE_SYMBOL && _Symbol[name] || (USE_SYMBOL ? _Symbol : _uid)('Symbol.' + name));
  };

  $exports.store = store;
});

// getting tag from 19.1.3.6 Object.prototype.toString()

var TAG = _wks('toStringTag');
// ES3 wrong here
var ARG = _cof(function () {
  return arguments;
}()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function tryGet(it, key) {
  try {
    return it[key];
  } catch (e) {/* empty */}
};

var _classof = function _classof(it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
  // @@toStringTag case
  : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
  // builtinTag case
  : ARG ? _cof(O)
  // ES3 arguments fallback
  : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

// 19.1.3.6 Object.prototype.toString()

var test = {};
test[_wks('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  _redefine(Object.prototype, 'toString', function toString() {
    return '[object ' + _classof(this) + ']';
  }, true);
}

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
var _toInteger = function _toInteger(it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

// true  -> String#at
// false -> String#codePointAt
var _stringAt = function _stringAt(TO_STRING) {
  return function (that, pos) {
    var s = String(_defined(that));
    var i = _toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

var _library = false;

var _iterators = {};

// 7.1.15 ToLength

var min = Math.min;
var _toLength = function _toLength(it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;
var _toAbsoluteIndex = function _toAbsoluteIndex(index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// false -> Array#indexOf
// true  -> Array#includes


var _arrayIncludes = function _arrayIncludes(IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
    } else for (; length > index; index++) {
      if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      }
    }return !IS_INCLUDES && -1;
  };
};

var shared = _shared('keys');

var _sharedKey = function _sharedKey(key) {
  return shared[key] || (shared[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO$1 = _sharedKey('IE_PROTO');

var _objectKeysInternal = function _objectKeysInternal(object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) {
    if (key != IE_PROTO$1) _has(O, key) && result.push(key);
  } // Don't enum bug & hidden keys
  while (names.length > i) {
    if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
  }return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = 'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'.split(',');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)


var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  _anObject(O);
  var keys = _objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) {
    _objectDp.f(O, P = keys[i++], Properties[P]);
  }return O;
};

var document$2 = _global.document;
var _html = document$2 && document$2.documentElement;

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])


var IE_PROTO = _sharedKey('IE_PROTO');
var Empty = function Empty() {/* empty */};
var PROTOTYPE$1 = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var _createDict = function createDict() {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _domCreate('iframe');
  var i = _enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  _html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  _createDict = iframeDocument.F;
  while (i--) {
    delete _createDict[PROTOTYPE$1][_enumBugKeys[i]];
  }return _createDict();
};

var _objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE$1] = _anObject(O);
    result = new Empty();
    Empty[PROTOTYPE$1] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = _createDict();
  return Properties === undefined ? result : _objectDps(result, Properties);
};

var def = _objectDp.f;

var TAG$1 = _wks('toStringTag');

var _setToStringTag = function _setToStringTag(it, tag, stat) {
  if (it && !_has(it = stat ? it : it.prototype, TAG$1)) def(it, TAG$1, { configurable: true, value: tag });
};

var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_hide(IteratorPrototype, _wks('iterator'), function () {
  return this;
});

var _iterCreate = function _iterCreate(Constructor, NAME, next) {
  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
  _setToStringTag(Constructor, NAME + ' Iterator');
};

// 7.1.13 ToObject(argument)

var _toObject = function _toObject(it) {
  return Object(_defined(it));
};

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


var IE_PROTO$2 = _sharedKey('IE_PROTO');
var ObjectProto = Object.prototype;

var _objectGpo = Object.getPrototypeOf || function (O) {
  O = _toObject(O);
  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  }return O instanceof Object ? ObjectProto : null;
};

var ITERATOR = _wks('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function returnThis() {
  return this;
};

var _iterDefine = function _iterDefine(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  _iterCreate(Constructor, NAME, next);
  var getMethod = function getMethod(kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS:
        return function keys() {
          return new Constructor(this, kind);
        };
      case VALUES:
        return function values() {
          return new Constructor(this, kind);
        };
    }return function entries() {
      return new Constructor(this, kind);
    };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      _setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!_library && !_has(IteratorPrototype, ITERATOR)) _hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() {
      return $native.call(this);
    };
  }
  // Define iterator
  if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    _hide(proto, ITERATOR, $default);
  }
  // Plug for library
  _iterators[NAME] = $default;
  _iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) _redefine(proto, key, methods[key]);
    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

var $at = _stringAt(true);

// 21.1.3.27 String.prototype[@@iterator]()
_iterDefine(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0; // next index
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = _wks('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});
var _addToUnscopables = function _addToUnscopables(key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

var _iterStep = function _iterStep(done, value) {
  return { value: value, done: !!done };
};

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
  this._t = _toIobject(iterated); // target
  this._i = 0; // next index
  this._k = kind; // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return _iterStep(1);
  }
  if (kind == 'keys') return _iterStep(0, index);
  if (kind == 'values') return _iterStep(0, O[index]);
  return _iterStep(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
_iterators.Arguments = _iterators.Array;

_addToUnscopables('keys');
_addToUnscopables('values');
_addToUnscopables('entries');

var ITERATOR$1 = _wks('iterator');
var TO_STRING_TAG = _wks('toStringTag');
var ArrayValues = _iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = _global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR$1]) _hide(proto, ITERATOR$1, ArrayValues);
    if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
    _iterators[NAME] = ArrayValues;
    if (explicit) for (key in es6_array_iterator) {
      if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
    }
  }
}

var _redefineAll = function _redefineAll(target, src, safe) {
  for (var key in src) {
    _redefine(target, key, src[key], safe);
  }return target;
};

var _anInstance = function _anInstance(it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || forbiddenField !== undefined && forbiddenField in it) {
    throw TypeError(name + ': incorrect invocation!');
  }return it;
};

// call something on iterator step with safe closing on error

var _iterCall = function _iterCall(iterator, fn, value, entries) {
  try {
    return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
    // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) _anObject(ret.call(iterator));
    throw e;
  }
};

// check on default Array iterator

var ITERATOR$2 = _wks('iterator');
var ArrayProto$1 = Array.prototype;

var _isArrayIter = function _isArrayIter(it) {
  return it !== undefined && (_iterators.Array === it || ArrayProto$1[ITERATOR$2] === it);
};

var ITERATOR$3 = _wks('iterator');

var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$3] || it['@@iterator'] || _iterators[_classof(it)];
};

var _forOf = createCommonjsModule(function (module) {
  var BREAK = {};
  var RETURN = {};
  var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
    var iterFn = ITERATOR ? function () {
      return iterable;
    } : core_getIteratorMethod(iterable);
    var f = _ctx(fn, that, entries ? 2 : 1);
    var index = 0;
    var length, step, iterator, result;
    if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
    // fast case for arrays with default iterator
    if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
      result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      if (result === BREAK || result === RETURN) return result;
    } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
      result = _iterCall(iterator, f, step.value, entries);
      if (result === BREAK || result === RETURN) return result;
    }
  };
  exports.BREAK = BREAK;
  exports.RETURN = RETURN;
});

var SPECIES = _wks('species');

var _setSpecies = function _setSpecies(KEY) {
  var C = _global[KEY];
  if (_descriptors && C && !C[SPECIES]) _objectDp.f(C, SPECIES, {
    configurable: true,
    get: function get() {
      return this;
    }
  });
};

var _meta = createCommonjsModule(function (module) {
  var META = _uid('meta');

  var setDesc = _objectDp.f;
  var id = 0;
  var isExtensible = Object.isExtensible || function () {
    return true;
  };
  var FREEZE = !_fails(function () {
    return isExtensible(Object.preventExtensions({}));
  });
  var setMeta = function setMeta(it) {
    setDesc(it, META, { value: {
        i: 'O' + ++id, // object ID
        w: {} // weak collections IDs
      } });
  };
  var fastKey = function fastKey(it, create) {
    // return primitive with prefix
    if (!_isObject(it)) return (typeof it === 'undefined' ? 'undefined' : _typeof(it)) == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F';
      // not necessary to add metadata
      if (!create) return 'E';
      // add missing metadata
      setMeta(it);
      // return object ID
    }return it[META].i;
  };
  var getWeak = function getWeak(it, create) {
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true;
      // not necessary to add metadata
      if (!create) return false;
      // add missing metadata
      setMeta(it);
      // return hash weak collections IDs
    }return it[META].w;
  };
  // add metadata on freeze-family methods calling
  var onFreeze = function onFreeze(it) {
    if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
    return it;
  };
  var meta = module.exports = {
    KEY: META,
    NEED: false,
    fastKey: fastKey,
    getWeak: getWeak,
    onFreeze: onFreeze
  };
});

var _meta_1 = _meta.KEY;
var _meta_2 = _meta.NEED;
var _meta_3 = _meta.fastKey;
var _meta_4 = _meta.getWeak;
var _meta_5 = _meta.onFreeze;

var _validateCollection = function _validateCollection(it, TYPE) {
  if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

var dP$1 = _objectDp.f;

var fastKey = _meta.fastKey;

var SIZE = _descriptors ? '_s' : 'size';

var getEntry = function getEntry(that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

var _collectionStrong = {
  getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      _anInstance(that, C, NAME, '_i');
      that._t = NAME; // collection type
      that._i = _objectCreate(null); // index
      that._f = undefined; // first entry
      that._l = undefined; // last entry
      that[SIZE] = 0; // size
      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
    });
    _redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function _delete(key) {
        var that = _validateCollection(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        }return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        _validateCollection(this, NAME);
        var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) {
            entry = entry.p;
          }
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(_validateCollection(this, NAME), key);
      }
    });
    if (_descriptors) dP$1(C.prototype, 'size', {
      get: function get() {
        return _validateCollection(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function def(that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
      // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key, // <- key
        v: value, // <- value
        p: prev = that._l, // <- previous entry
        n: undefined, // <- next entry
        r: false // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    }return that;
  },
  getEntry: getEntry,
  setStrong: function setStrong(C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    _iterDefine(C, NAME, function (iterated, kind) {
      this._t = _validateCollection(iterated, NAME); // target
      this._k = kind; // kind
      this._l = undefined; // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) {
        entry = entry.p;
      } // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return _iterStep(1);
      }
      // return step by kind
      if (kind == 'keys') return _iterStep(0, entry.k);
      if (kind == 'values') return _iterStep(0, entry.v);
      return _iterStep(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    _setSpecies(NAME);
  }
};

var ITERATOR$4 = _wks('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR$4]();
  riter['return'] = function () {
    SAFE_CLOSING = true;
  };
  // eslint-disable-next-line no-throw-literal
  
} catch (e) {/* empty */}

var _iterDetect = function _iterDetect(exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR$4]();
    iter.next = function () {
      return { done: safe = true };
    };
    arr[ITERATOR$4] = function () {
      return iter;
    };
    exec(arr);
  } catch (e) {/* empty */}
  return safe;
};

var setPrototypeOf$2 = _setProto.set;
var _inheritIfRequired = function _inheritIfRequired(that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf$2) {
    setPrototypeOf$2(that, P);
  }return that;
};

var _collection = function _collection(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = _global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  var fixMethod = function fixMethod(KEY) {
    var fn = proto[KEY];
    _redefine(proto, KEY, KEY == 'delete' ? function (a) {
      return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'has' ? function has(a) {
      return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'get' ? function get(a) {
      return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'add' ? function add(a) {
      fn.call(this, a === 0 ? 0 : a);return this;
    } : function set(a, b) {
      fn.call(this, a === 0 ? 0 : a, b);return this;
    });
  };
  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    _redefineAll(C.prototype, methods);
    _meta.NEED = true;
  } else {
    var instance = new C();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = _fails(function () {
      instance.has(1);
    });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    var ACCEPT_ITERABLES = _iterDetect(function (iter) {
      new C(iter);
    }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && _fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;
      while (index--) {
        $instance[ADDER](index, index);
      }return !$instance.has(-0);
    });
    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        _anInstance(target, C, NAME);
        var that = _inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
    // weak collections should not contains .clear method
    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  _setToStringTag(C, NAME);

  O[NAME] = C;
  _export(_export.G + _export.W + _export.F * (C != Base), O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

var SET = 'Set';

// 23.2 Set Objects
var es6_set = _collection(SET, function (get) {
  return function Set() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
  }
}, _collectionStrong);

var _arrayFromIterable = function _arrayFromIterable(iter, ITERATOR) {
  var result = [];
  _forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

// https://github.com/DavidBruant/Map-Set.prototype.toJSON


var _collectionToJson = function _collectionToJson(NAME) {
  return function toJSON() {
    if (_classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return _arrayFromIterable(this);
  };
};

// https://github.com/DavidBruant/Map-Set.prototype.toJSON


_export(_export.P + _export.R, 'Set', { toJSON: _collectionToJson('Set') });

// https://tc39.github.io/proposal-setmap-offrom/


var _setCollectionOf = function _setCollectionOf(COLLECTION) {
  _export(_export.S, COLLECTION, { of: function of() {
      var length = arguments.length;
      var A = Array(length);
      while (length--) {
        A[length] = arguments[length];
      }return new this(A);
    } });
};

// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
_setCollectionOf('Set');

// https://tc39.github.io/proposal-setmap-offrom/


var _setCollectionFrom = function _setCollectionFrom(COLLECTION) {
  _export(_export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
      var mapFn = arguments[1];
      var mapping, A, n, cb;
      _aFunction(this);
      mapping = mapFn !== undefined;
      if (mapping) _aFunction(mapFn);
      if (source == undefined) return new this();
      A = [];
      if (mapping) {
        n = 0;
        cb = _ctx(mapFn, arguments[2], 2);
        _forOf(source, false, function (nextItem) {
          A.push(cb(nextItem, n++));
        });
      } else {
        _forOf(source, false, A.push, A);
      }
      return new this(A);
    } });
};

// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
_setCollectionFrom('Set');

var set$1 = _core.Set;

var MAP = 'Map';

// 23.1 Map Objects
var es6_map = _collection(MAP, function (get) {
  return function Map() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = _collectionStrong.getEntry(_validateCollection(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return _collectionStrong.def(_validateCollection(this, MAP), key === 0 ? 0 : key, value);
  }
}, _collectionStrong, true);

// https://github.com/DavidBruant/Map-Set.prototype.toJSON


_export(_export.P + _export.R, 'Map', { toJSON: _collectionToJson('Map') });

// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
_setCollectionOf('Map');

// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
_setCollectionFrom('Map');

var map = _core.Map;

// 7.2.2 IsArray(argument)

var _isArray = Array.isArray || function isArray(arg) {
  return _cof(arg) == 'Array';
};

var SPECIES$1 = _wks('species');

var _arraySpeciesConstructor = function _arraySpeciesConstructor(original) {
  var C;
  if (_isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
    if (_isObject(C)) {
      C = C[SPECIES$1];
      if (C === null) C = undefined;
    }
  }return C === undefined ? Array : C;
};

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)


var _arraySpeciesCreate = function _arraySpeciesCreate(original, length) {
  return new (_arraySpeciesConstructor(original))(length);
};

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex


var _arrayMethods = function _arrayMethods(TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || _arraySpeciesCreate;
  return function ($this, callbackfn, that) {
    var O = _toObject($this);
    var self = _iobject(O);
    var f = _ctx(callbackfn, that, 3);
    var length = _toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (; length > index; index++) {
      if (NO_HOLES || index in self) {
        val = self[index];
        res = f(val, index, O);
        if (TYPE) {
          if (IS_MAP) result[index] = res; // map
          else if (res) switch (TYPE) {
              case 3:
                return true; // some
              case 5:
                return val; // find
              case 6:
                return index; // findIndex
              case 2:
                result.push(val); // filter
            } else if (IS_EVERY) return false; // every
        }
      }
    }return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

var f$3 = Object.getOwnPropertySymbols;

var _objectGops = {
	f: f$3
};

// 19.1.2.1 Object.assign(target, source, ...)


var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
var _objectAssign = !$assign || _fails(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) {
    B[k] = k;
  });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) {
  // eslint-disable-line no-unused-vars
  var T = _toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = _objectGops.f;
  var isEnum = _objectPie.f;
  while (aLen > index) {
    var S = _iobject(arguments[index++]);
    var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
    }
  }return T;
} : $assign;

var getWeak = _meta.getWeak;

var arrayFind = _arrayMethods(5);
var arrayFindIndex = _arrayMethods(6);
var id$1 = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function uncaughtFrozenStore(that) {
  return that._l || (that._l = new UncaughtFrozenStore());
};
var UncaughtFrozenStore = function UncaughtFrozenStore() {
  this.a = [];
};
var findUncaughtFrozen = function findUncaughtFrozen(store, key) {
  return arrayFind(store.a, function (it) {
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function get(key) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) return entry[1];
  },
  has: function has(key) {
    return !!findUncaughtFrozen(this, key);
  },
  set: function set(key, value) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) entry[1] = value;else this.a.push([key, value]);
  },
  'delete': function _delete(key) {
    var index = arrayFindIndex(this.a, function (it) {
      return it[0] === key;
    });
    if (~index) this.a.splice(index, 1);
    return !!~index;
  }
};

var _collectionWeak = {
  getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      _anInstance(that, C, NAME, '_i');
      that._t = NAME; // collection type
      that._i = id$1++; // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
    });
    _redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function _delete(key) {
        if (!_isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME))['delete'](key);
        return data && _has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key) {
        if (!_isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME)).has(key);
        return data && _has(data, this._i);
      }
    });
    return C;
  },
  def: function def(that, key, value) {
    var data = getWeak(_anObject(key), true);
    if (data === true) uncaughtFrozenStore(that).set(key, value);else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};

var es6_weakMap = createCommonjsModule(function (module) {
  var each = _arrayMethods(0);

  var WEAK_MAP = 'WeakMap';
  var getWeak = _meta.getWeak;
  var isExtensible = Object.isExtensible;
  var uncaughtFrozenStore = _collectionWeak.ufstore;
  var tmp = {};
  var InternalMap;

  var wrapper = function wrapper(get) {
    return function WeakMap() {
      return get(this, arguments.length > 0 ? arguments[0] : undefined);
    };
  };

  var methods = {
    // 23.3.3.3 WeakMap.prototype.get(key)
    get: function get(key) {
      if (_isObject(key)) {
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(_validateCollection(this, WEAK_MAP)).get(key);
        return data ? data[this._i] : undefined;
      }
    },
    // 23.3.3.5 WeakMap.prototype.set(key, value)
    set: function set(key, value) {
      return _collectionWeak.def(_validateCollection(this, WEAK_MAP), key, value);
    }
  };

  // 23.3 WeakMap Objects
  var $WeakMap = module.exports = _collection(WEAK_MAP, wrapper, methods, _collectionWeak, true, true);

  // IE11 WeakMap frozen keys fix
  if (_fails(function () {
    return new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7;
  })) {
    InternalMap = _collectionWeak.getConstructor(wrapper, WEAK_MAP);
    _objectAssign(InternalMap.prototype, methods);
    _meta.NEED = true;
    each(['delete', 'has', 'get', 'set'], function (key) {
      var proto = $WeakMap.prototype;
      var method = proto[key];
      _redefine(proto, key, function (a, b) {
        // store frozen objects on internal weakmap shim
        if (_isObject(a) && !isExtensible(a)) {
          if (!this._f) this._f = new InternalMap();
          var result = this._f[key](a, b);
          return key == 'set' ? this : result;
          // store all the rest on native weakmap
        }return method.call(this, a, b);
      });
    });
  }
});

// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
_setCollectionOf('WeakMap');

// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
_setCollectionFrom('WeakMap');

var weakMap = _core.WeakMap;

var _createProperty = function _createProperty(object, index, value) {
  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));else object[index] = value;
};

_export(_export.S + _export.F * !_iterDetect(function (iter) {
  
}), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = _toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = core_getIteratorMethod(O);
    var length, result, step, iterator;
    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = _toLength(O.length);
      for (result = new C(length); length > index; index++) {
        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

var from$1 = _core.Array.from;

var reservedTagList = new Set(['annotation-xml', 'color-profile', 'font-face', 'font-face-src', 'font-face-uri', 'font-face-format', 'font-face-name', 'missing-glyph']);

/**
 * @param {string} localName
 * @returns {boolean}
 */
function isValidCustomElementName(localName) {
  var reserved = reservedTagList.has(localName);
  var validForm = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(localName);
  return !reserved && validForm;
}

/**
 * @private
 * @param {!Node} node
 * @return {boolean}
 */
function isConnected(node) {
  // Use `Node#isConnected`, if defined.
  var nativeValue = node.isConnected;
  if (nativeValue !== undefined) {
    return nativeValue;
  }

  /** @type {?Node|undefined} */
  var current = node;
  while (current && !(current.__CE_isImportDocument || current instanceof Document)) {
    current = current.parentNode || (window.ShadowRoot && current instanceof ShadowRoot ? current.host : undefined);
  }
  return !!(current && (current.__CE_isImportDocument || current instanceof Document));
}

/**
 * @param {!Node} root
 * @param {!Node} start
 * @return {?Node}
 */
function nextSiblingOrAncestorSibling(root, start) {
  var node = start;
  while (node && node !== root && !node.nextSibling) {
    node = node.parentNode;
  }
  return !node || node === root ? null : node.nextSibling;
}

/**
 * @param {!Node} root
 * @param {!Node} start
 * @return {?Node}
 */
function nextNode(root, start) {
  return start.firstChild ? start.firstChild : nextSiblingOrAncestorSibling(root, start);
}

/**
 * @param {!Node} root
 * @param {!function(!Element)} callback
 * @param {!Set<Node>=} visitedImports
 */
function walkDeepDescendantElements(root, callback) {
  var visitedImports = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();

  var node = root;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      var element = /** @type {!Element} */node;

      callback(element);

      var localName = element.localName;
      if (localName === 'link' && element.getAttribute('rel') === 'import') {
        // If this import (polyfilled or not) has it's root node available,
        // walk it.
        var importNode = /** @type {!Node} */element.import;
        if (importNode instanceof Node && !visitedImports.has(importNode)) {
          // Prevent multiple walks of the same import root.
          visitedImports.add(importNode);

          for (var child = importNode.firstChild; child; child = child.nextSibling) {
            walkDeepDescendantElements(child, callback, visitedImports);
          }
        }

        // Ignore descendants of import links to prevent attempting to walk the
        // elements created by the HTML Imports polyfill that we just walked
        // above.
        node = nextSiblingOrAncestorSibling(root, element);
        continue;
      } else if (localName === 'template') {
        // Ignore descendants of templates. There shouldn't be any descendants
        // because they will be moved into `.content` during construction in
        // browsers that support template but, in case they exist and are still
        // waiting to be moved by a polyfill, they will be ignored.
        node = nextSiblingOrAncestorSibling(root, element);
        continue;
      }

      // Walk shadow roots.
      var shadowRoot = element.__CE_shadowRoot;
      if (shadowRoot) {
        for (var _child = shadowRoot.firstChild; _child; _child = _child.nextSibling) {
          walkDeepDescendantElements(_child, callback, visitedImports);
        }
      }
    }

    node = nextNode(root, node);
  }
}

/**
 * Used to suppress Closure's "Modifying the prototype is only allowed if the
 * constructor is in the same scope" warning without using
 * `@suppress {newCheckTypes, duplicate}` because `newCheckTypes` is too broad.
 *
 * @param {!Object} destination
 * @param {string} name
 * @param {*} value
 */
function setPropertyUnchecked(destination, name, value) {
  destination[name] = value;
}

/**
 * @enum {number}
 */
var CustomElementState = {
  custom: 1,
  failed: 2
};

var CustomElementInternals = function () {
  function CustomElementInternals() {
    classCallCheck(this, CustomElementInternals);

    /** @type {!Map<string, !CustomElementDefinition>} */
    this._localNameToDefinition = new Map();

    /** @type {!Map<!Function, !CustomElementDefinition>} */
    this._constructorToDefinition = new Map();

    /** @type {!Array<!function(!Node)>} */
    this._patches = [];

    /** @type {boolean} */
    this._hasPatches = false;
  }

  /**
   * @param {string} localName
   * @param {!CustomElementDefinition} definition
   */


  createClass(CustomElementInternals, [{
    key: 'setDefinition',
    value: function setDefinition(localName, definition) {
      this._localNameToDefinition.set(localName, definition);
      this._constructorToDefinition.set(definition.constructor, definition);
    }

    /**
     * @param {string} localName
     * @return {!CustomElementDefinition|undefined}
     */

  }, {
    key: 'localNameToDefinition',
    value: function localNameToDefinition(localName) {
      return this._localNameToDefinition.get(localName);
    }

    /**
     * @param {!Function} constructor
     * @return {!CustomElementDefinition|undefined}
     */

  }, {
    key: 'constructorToDefinition',
    value: function constructorToDefinition(constructor) {
      return this._constructorToDefinition.get(constructor);
    }

    /**
     * @param {!function(!Node)} listener
     */

  }, {
    key: 'addPatch',
    value: function addPatch(listener) {
      this._hasPatches = true;
      this._patches.push(listener);
    }

    /**
     * @param {!Node} node
     */

  }, {
    key: 'patchTree',
    value: function patchTree(node) {
      var _this = this;

      if (!this._hasPatches) return;

      walkDeepDescendantElements(node, function (element) {
        return _this.patch(element);
      });
    }

    /**
     * @param {!Node} node
     */

  }, {
    key: 'patch',
    value: function patch(node) {
      if (!this._hasPatches) return;

      if (node.__CE_patched) return;
      node.__CE_patched = true;

      for (var i = 0; i < this._patches.length; i++) {
        this._patches[i](node);
      }
    }

    /**
     * @param {!Node} root
     */

  }, {
    key: 'connectTree',
    value: function connectTree(root) {
      var elements = [];

      walkDeepDescendantElements(root, function (element) {
        return elements.push(element);
      });

      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.__CE_state === CustomElementState.custom) {
          if (isConnected(element)) {
            this.connectedCallback(element);
          }
        } else {
          this.upgradeElement(element);
        }
      }
    }

    /**
     * @param {!Node} root
     */

  }, {
    key: 'disconnectTree',
    value: function disconnectTree(root) {
      var elements = [];

      walkDeepDescendantElements(root, function (element) {
        return elements.push(element);
      });

      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.__CE_state === CustomElementState.custom) {
          this.disconnectedCallback(element);
        }
      }
    }

    /**
     * Upgrades all uncustomized custom elements at and below a root node for
     * which there is a definition. When custom element reaction callbacks are
     * assumed to be called synchronously (which, by the current DOM / HTML spec
     * definitions, they are *not*), callbacks for both elements customized
     * synchronously by the parser and elements being upgraded occur in the same
     * relative order.
     *
     * NOTE: This function, when used to simulate the construction of a tree that
     * is already created but not customized (i.e. by the parser), does *not*
     * prevent the element from reading the 'final' (true) state of the tree. For
     * example, the element, during truly synchronous parsing / construction would
     * see that it contains no children as they have not yet been inserted.
     * However, this function does not modify the tree, the element will
     * (incorrectly) have children. Additionally, self-modification restrictions
     * for custom element constructors imposed by the DOM spec are *not* enforced.
     *
     *
     * The following nested list shows the steps extending down from the HTML
     * spec's parsing section that cause elements to be synchronously created and
     * upgraded:
     *
     * The "in body" insertion mode:
     * https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
     * - Switch on token:
     *   .. other cases ..
     *   -> Any other start tag
     *      - [Insert an HTML element](below) for the token.
     *
     * Insert an HTML element:
     * https://html.spec.whatwg.org/multipage/syntax.html#insert-an-html-element
     * - Insert a foreign element for the token in the HTML namespace:
     *   https://html.spec.whatwg.org/multipage/syntax.html#insert-a-foreign-element
     *   - Create an element for a token:
     *     https://html.spec.whatwg.org/multipage/syntax.html#create-an-element-for-the-token
     *     - Will execute script flag is true?
     *       - (Element queue pushed to the custom element reactions stack.)
     *     - Create an element:
     *       https://dom.spec.whatwg.org/#concept-create-element
     *       - Sync CE flag is true?
     *         - Constructor called.
     *         - Self-modification restrictions enforced.
     *       - Sync CE flag is false?
     *         - (Upgrade reaction enqueued.)
     *     - Attributes appended to element.
     *       (`attributeChangedCallback` reactions enqueued.)
     *     - Will execute script flag is true?
     *       - (Element queue popped from the custom element reactions stack.
     *         Reactions in the popped stack are invoked.)
     *   - (Element queue pushed to the custom element reactions stack.)
     *   - Insert the element:
     *     https://dom.spec.whatwg.org/#concept-node-insert
     *     - Shadow-including descendants are connected. During parsing
     *       construction, there are no shadow-*excluding* descendants.
     *       However, the constructor may have validly attached a shadow
     *       tree to itself and added descendants to that shadow tree.
     *       (`connectedCallback` reactions enqueued.)
     *   - (Element queue popped from the custom element reactions stack.
     *     Reactions in the popped stack are invoked.)
     *
     * @param {!Node} root
     * @param {!Set<Node>=} visitedImports
     */

  }, {
    key: 'patchAndUpgradeTree',
    value: function patchAndUpgradeTree(root) {
      var _this2 = this;

      var visitedImports = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();

      var elements = [];

      var gatherElements = function gatherElements(element) {
        if (element.localName === 'link' && element.getAttribute('rel') === 'import') {
          // The HTML Imports polyfill sets a descendant element of the link to
          // the `import` property, specifically this is *not* a Document.
          var importNode = /** @type {?Node} */element.import;

          if (importNode instanceof Node && importNode.readyState === 'complete') {
            importNode.__CE_isImportDocument = true;

            // Connected links are associated with the registry.
            importNode.__CE_hasRegistry = true;
          } else {
            // If this link's import root is not available, its contents can't be
            // walked. Wait for 'load' and walk it when it's ready.
            element.addEventListener('load', function () {
              var importNode = /** @type {!Node} */element.import;

              if (importNode.__CE_documentLoadHandled) return;
              importNode.__CE_documentLoadHandled = true;

              importNode.__CE_isImportDocument = true;

              // Connected links are associated with the registry.
              importNode.__CE_hasRegistry = true;

              // Clone the `visitedImports` set that was populated sync during
              // the `patchAndUpgradeTree` call that caused this 'load' handler to
              // be added. Then, remove *this* link's import node so that we can
              // walk that import again, even if it was partially walked later
              // during the same `patchAndUpgradeTree` call.
              visitedImports.delete(importNode);

              _this2.patchAndUpgradeTree(importNode, visitedImports);
            });
          }
        } else {
          elements.push(element);
        }
      };

      // `walkDeepDescendantElements` populates (and internally checks against)
      // `visitedImports` when traversing a loaded import.
      walkDeepDescendantElements(root, gatherElements, visitedImports);

      if (this._hasPatches) {
        for (var i = 0; i < elements.length; i++) {
          this.patch(elements[i]);
        }
      }

      for (var _i = 0; _i < elements.length; _i++) {
        this.upgradeElement(elements[_i]);
      }
    }

    /**
     * @param {!Element} element
     */

  }, {
    key: 'upgradeElement',
    value: function upgradeElement(element) {
      var currentState = element.__CE_state;
      if (currentState !== undefined) return;

      var definition = this.localNameToDefinition(element.localName);
      if (!definition) return;

      definition.constructionStack.push(element);

      var constructor = definition.constructor;
      try {
        try {
          var result = new constructor();
          if (result !== element) {
            throw new Error('The custom element constructor did not produce the element being upgraded.');
          }
        } finally {
          definition.constructionStack.pop();
        }
      } catch (e) {
        element.__CE_state = CustomElementState.failed;
        throw e;
      }

      element.__CE_state = CustomElementState.custom;
      element.__CE_definition = definition;

      if (definition.attributeChangedCallback) {
        var observedAttributes = definition.observedAttributes;
        for (var i = 0; i < observedAttributes.length; i++) {
          var name = observedAttributes[i];
          var value = element.getAttribute(name);
          if (value !== null) {
            this.attributeChangedCallback(element, name, null, value, null);
          }
        }
      }

      if (isConnected(element)) {
        this.connectedCallback(element);
      }
    }

    /**
     * @param {!Element} element
     */

  }, {
    key: 'connectedCallback',
    value: function connectedCallback(element) {
      var definition = element.__CE_definition;
      if (definition.connectedCallback) {
        definition.connectedCallback.call(element);
      }

      element.__CE_isConnectedCallbackCalled = true;
    }

    /**
     * @param {!Element} element
     */

  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback(element) {
      if (!element.__CE_isConnectedCallbackCalled) {
        this.connectedCallback(element);
      }

      var definition = element.__CE_definition;
      if (definition.disconnectedCallback) {
        definition.disconnectedCallback.call(element);
      }

      element.__CE_isConnectedCallbackCalled = undefined;
    }

    /**
     * @param {!Element} element
     * @param {string} name
     * @param {?string} oldValue
     * @param {?string} newValue
     * @param {?string} namespace
     */

  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(element, name, oldValue, newValue, namespace) {
      var definition = element.__CE_definition;
      if (definition.attributeChangedCallback && definition.observedAttributes.indexOf(name) > -1) {
        definition.attributeChangedCallback.call(element, name, oldValue, newValue, namespace);
      }
    }
  }]);
  return CustomElementInternals;
}();

var DocumentConstructionObserver = function () {
  function DocumentConstructionObserver(internals, doc) {
    classCallCheck(this, DocumentConstructionObserver);

    /**
     * @type {!CustomElementInternals}
     */
    this._internals = internals;

    /**
     * @type {!Document}
     */
    this._document = doc;

    /**
     * @type {MutationObserver|undefined}
     */
    this._observer = undefined;

    // Simulate tree construction for all currently accessible nodes in the
    // document.
    this._internals.patchAndUpgradeTree(this._document);

    if (this._document.readyState === 'loading') {
      this._observer = new MutationObserver(this._handleMutations.bind(this));

      // Nodes created by the parser are given to the observer *before* the next
      // task runs. Inline scripts are run in a new task. This means that the
      // observer will be able to handle the newly parsed nodes before the inline
      // script is run.
      this._observer.observe(this._document, {
        childList: true,
        subtree: true
      });
    }
  }

  createClass(DocumentConstructionObserver, [{
    key: 'disconnect',
    value: function disconnect() {
      if (this._observer) {
        this._observer.disconnect();
      }
    }

    /**
     * @param {!Array<!MutationRecord>} mutations
     */

  }, {
    key: '_handleMutations',
    value: function _handleMutations(mutations) {
      // Once the document's `readyState` is 'interactive' or 'complete', all new
      // nodes created within that document will be the result of script and
      // should be handled by patching.
      var readyState = this._document.readyState;
      if (readyState === 'interactive' || readyState === 'complete') {
        this.disconnect();
      }

      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          this._internals.patchAndUpgradeTree(node);
        }
      }
    }
  }]);
  return DocumentConstructionObserver;
}();

/**
 * @template T
 */
var Deferred = function () {
  function Deferred() {
    var _this = this;

    classCallCheck(this, Deferred);

    /**
     * @private
     * @type {T|undefined}
     */
    this._value = undefined;

    /**
     * @private
     * @type {Function|undefined}
     */
    this._resolve = undefined;

    /**
     * @private
     * @type {!Promise<T>}
     */
    this._promise = new Promise(function (resolve) {
      _this._resolve = resolve;

      if (_this._value) {
        resolve(_this._value);
      }
    });
  }

  /**
   * @param {T} value
   */


  createClass(Deferred, [{
    key: 'resolve',
    value: function resolve(value) {
      if (this._value) {
        throw new Error('Already resolved.');
      }

      this._value = value;

      if (this._resolve) {
        this._resolve(value);
      }
    }

    /**
     * @return {!Promise<T>}
     */

  }, {
    key: 'toPromise',
    value: function toPromise() {
      return this._promise;
    }
  }]);
  return Deferred;
}();

/**
 * @unrestricted
 */

var CustomElementRegistry = function () {

  /**
   * @param {!CustomElementInternals} internals
   */
  function CustomElementRegistry(internals) {
    classCallCheck(this, CustomElementRegistry);

    /**
     * @private
     * @type {boolean}
     */
    this._elementDefinitionIsRunning = false;

    /**
     * @private
     * @type {!CustomElementInternals}
     */
    this._internals = internals;

    /**
     * @private
     * @type {!Map<string, !Deferred<undefined>>}
     */
    this._whenDefinedDeferred = new Map();

    /**
     * The default flush callback triggers the document walk synchronously.
     * @private
     * @type {!Function}
     */
    this._flushCallback = function (fn) {
      return fn();
    };

    /**
     * @private
     * @type {boolean}
     */
    this._flushPending = false;

    /**
     * @private
     * @type {!Array<string>}
     */
    this._unflushedLocalNames = [];

    /**
     * @private
     * @type {!DocumentConstructionObserver}
     */
    this._documentConstructionObserver = new DocumentConstructionObserver(internals, document);
  }

  /**
   * @param {string} localName
   * @param {!Function} constructor
   */


  createClass(CustomElementRegistry, [{
    key: 'define',
    value: function define(localName, constructor) {
      var _this = this;

      if (!(constructor instanceof Function)) {
        throw new TypeError('Custom element constructors must be functions.');
      }

      if (!isValidCustomElementName(localName)) {
        throw new SyntaxError('The element name \'' + localName + '\' is not valid.');
      }

      if (this._internals.localNameToDefinition(localName)) {
        throw new Error('A custom element with name \'' + localName + '\' has already been defined.');
      }

      if (this._elementDefinitionIsRunning) {
        throw new Error('A custom element is already being defined.');
      }
      this._elementDefinitionIsRunning = true;

      var connectedCallback = void 0;
      var disconnectedCallback = void 0;
      var adoptedCallback = void 0;
      var attributeChangedCallback = void 0;
      var observedAttributes = void 0;
      try {
        var getCallback = function getCallback(name) {
          var callbackValue = prototype[name];
          if (callbackValue !== undefined && !(callbackValue instanceof Function)) {
            throw new Error('The \'' + name + '\' callback must be a function.');
          }
          return callbackValue;
        };

        /** @type {!Object} */
        var prototype = constructor.prototype;
        if (!(prototype instanceof Object)) {
          throw new TypeError('The custom element constructor\'s prototype is not an object.');
        }

        connectedCallback = getCallback('connectedCallback');
        disconnectedCallback = getCallback('disconnectedCallback');
        adoptedCallback = getCallback('adoptedCallback');
        attributeChangedCallback = getCallback('attributeChangedCallback');
        observedAttributes = constructor['observedAttributes'] || [];
      } catch (e) {
        return;
      } finally {
        this._elementDefinitionIsRunning = false;
      }

      var definition = {
        localName: localName,
        constructor: constructor,
        connectedCallback: connectedCallback,
        disconnectedCallback: disconnectedCallback,
        adoptedCallback: adoptedCallback,
        attributeChangedCallback: attributeChangedCallback,
        observedAttributes: observedAttributes,
        constructionStack: []
      };

      this._internals.setDefinition(localName, definition);

      this._unflushedLocalNames.push(localName);

      // If we've already called the flush callback and it hasn't called back yet,
      // don't call it again.
      if (!this._flushPending) {
        this._flushPending = true;
        this._flushCallback(function () {
          return _this._flush();
        });
      }
    }
  }, {
    key: '_flush',
    value: function _flush() {
      // If no new definitions were defined, don't attempt to flush. This could
      // happen if a flush callback keeps the function it is given and calls it
      // multiple times.
      if (this._flushPending === false) return;

      this._flushPending = false;
      this._internals.patchAndUpgradeTree(document);

      while (this._unflushedLocalNames.length > 0) {
        var localName = this._unflushedLocalNames.shift();
        var deferred = this._whenDefinedDeferred.get(localName);
        if (deferred) {
          deferred.resolve(undefined);
        }
      }
    }

    /**
     * @param {string} localName
     * @return {Function|undefined}
     */

  }, {
    key: 'get',
    value: function get$$1(localName) {
      var definition = this._internals.localNameToDefinition(localName);
      if (definition) {
        return definition.constructor;
      }

      return undefined;
    }

    /**
     * @param {string} localName
     * @return {!Promise<undefined>}
     */

  }, {
    key: 'whenDefined',
    value: function whenDefined(localName) {
      if (!isValidCustomElementName(localName)) {
        return Promise.reject(new SyntaxError('\'' + localName + '\' is not a valid custom element name.'));
      }

      var prior = this._whenDefinedDeferred.get(localName);
      if (prior) {
        return prior.toPromise();
      }

      var deferred = new Deferred();
      this._whenDefinedDeferred.set(localName, deferred);

      var definition = this._internals.localNameToDefinition(localName);
      // Resolve immediately only if the given local name has a definition *and*
      // the full document walk to upgrade elements with that local name has
      // already happened.
      if (definition && this._unflushedLocalNames.indexOf(localName) === -1) {
        deferred.resolve(undefined);
      }

      return deferred.toPromise();
    }
  }, {
    key: 'polyfillWrapFlushCallback',
    value: function polyfillWrapFlushCallback(outer) {
      this._documentConstructionObserver.disconnect();
      var inner = this._flushCallback;
      this._flushCallback = function (flush) {
        return outer(function () {
          return inner(flush);
        });
      };
    }
  }]);
  return CustomElementRegistry;
}();

window['CustomElementRegistry'] = CustomElementRegistry;
CustomElementRegistry.prototype['define'] = CustomElementRegistry.prototype.define;
CustomElementRegistry.prototype['get'] = CustomElementRegistry.prototype.get;
CustomElementRegistry.prototype['whenDefined'] = CustomElementRegistry.prototype.whenDefined;
CustomElementRegistry.prototype['polyfillWrapFlushCallback'] = CustomElementRegistry.prototype.polyfillWrapFlushCallback;

var Native = {
  Document_createElement: window.Document.prototype.createElement,
  Document_createElementNS: window.Document.prototype.createElementNS,
  Document_importNode: window.Document.prototype.importNode,
  Document_prepend: window.Document.prototype['prepend'],
  Document_append: window.Document.prototype['append'],
  Node_cloneNode: window.Node.prototype.cloneNode,
  Node_appendChild: window.Node.prototype.appendChild,
  Node_insertBefore: window.Node.prototype.insertBefore,
  Node_removeChild: window.Node.prototype.removeChild,
  Node_replaceChild: window.Node.prototype.replaceChild,
  Node_textContent: Object.getOwnPropertyDescriptor(window.Node.prototype, 'textContent'),
  Element_attachShadow: window.Element.prototype['attachShadow'],
  Element_innerHTML: Object.getOwnPropertyDescriptor(window.Element.prototype, 'innerHTML'),
  Element_getAttribute: window.Element.prototype.getAttribute,
  Element_setAttribute: window.Element.prototype.setAttribute,
  Element_removeAttribute: window.Element.prototype.removeAttribute,
  Element_getAttributeNS: window.Element.prototype.getAttributeNS,
  Element_setAttributeNS: window.Element.prototype.setAttributeNS,
  Element_removeAttributeNS: window.Element.prototype.removeAttributeNS,
  Element_insertAdjacentElement: window.Element.prototype['insertAdjacentElement'],
  Element_prepend: window.Element.prototype['prepend'],
  Element_append: window.Element.prototype['append'],
  Element_before: window.Element.prototype['before'],
  Element_after: window.Element.prototype['after'],
  Element_replaceWith: window.Element.prototype['replaceWith'],
  Element_remove: window.Element.prototype['remove'],
  HTMLElement: window.HTMLElement,
  HTMLElement_innerHTML: Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'innerHTML'),
  HTMLElement_insertAdjacentElement: window.HTMLElement.prototype['insertAdjacentElement']
};

/**
 * This class exists only to work around Closure's lack of a way to describe
 * singletons. It represents the 'already constructed marker' used in custom
 * element construction stacks.
 *
 * https://html.spec.whatwg.org/#concept-already-constructed-marker
 */
var AlreadyConstructedMarker = function AlreadyConstructedMarker() {
  classCallCheck(this, AlreadyConstructedMarker);
};

var AlreadyConstructedMarker$1 = new AlreadyConstructedMarker();

/**
 * @param {!CustomElementInternals} internals
 */
var PatchHTMLElement = function (internals) {
  window['HTMLElement'] = function () {
    /**
     * @type {function(new: HTMLElement): !HTMLElement}
     */
    function HTMLElement() {
      // This should really be `new.target` but `new.target` can't be emulated
      // in ES5. Assuming the user keeps the default value of the constructor's
      // prototype's `constructor` property, this is equivalent.
      /** @type {!Function} */
      var constructor = this.constructor;

      var definition = internals.constructorToDefinition(constructor);
      if (!definition) {
        throw new Error('The custom element being constructed was not registered with `customElements`.');
      }

      var constructionStack = definition.constructionStack;

      if (constructionStack.length === 0) {
        var _element = Native.Document_createElement.call(document, definition.localName);
        Object.setPrototypeOf(_element, constructor.prototype);
        _element.__CE_state = CustomElementState.custom;
        _element.__CE_definition = definition;
        internals.patch(_element);
        return _element;
      }

      var lastIndex = constructionStack.length - 1;
      var element = constructionStack[lastIndex];
      if (element === AlreadyConstructedMarker$1) {
        throw new Error('The HTMLElement constructor was either called reentrantly for this constructor or called multiple times.');
      }
      constructionStack[lastIndex] = AlreadyConstructedMarker$1;

      Object.setPrototypeOf(element, constructor.prototype);
      internals.patch( /** @type {!HTMLElement} */element);

      return element;
    }

    HTMLElement.prototype = Native.HTMLElement.prototype;

    return HTMLElement;
  }();
};

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ParentNodeNativeMethods} builtIn
 */
var PatchParentNode = function (internals, destination, builtIn) {
  /**
   * @param {...(!Node|string)} nodes
   */
  destination['prepend'] = function () {
    for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
      nodes[_key] = arguments[_key];
    }

    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    var connectedBefore = /** @type {!Array<!Node>} */nodes.filter(function (node) {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    });

    builtIn.prepend.apply(this, nodes);

    for (var i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (isConnected(this)) {
      for (var _i = 0; _i < nodes.length; _i++) {
        var node = nodes[_i];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };

  /**
   * @param {...(!Node|string)} nodes
   */
  destination['append'] = function () {
    for (var _len2 = arguments.length, nodes = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      nodes[_key2] = arguments[_key2];
    }

    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    var connectedBefore = /** @type {!Array<!Node>} */nodes.filter(function (node) {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    });

    builtIn.append.apply(this, nodes);

    for (var i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (isConnected(this)) {
      for (var _i2 = 0; _i2 < nodes.length; _i2++) {
        var node = nodes[_i2];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchDocument = function (internals) {
  setPropertyUnchecked(Document.prototype, 'createElement',
  /**
   * @this {Document}
   * @param {string} localName
   * @return {!Element}
   */
  function (localName) {
    // Only create custom elements if this document is associated with the registry.
    if (this.__CE_hasRegistry) {
      var definition = internals.localNameToDefinition(localName);
      if (definition) {
        return new definition.constructor();
      }
    }

    var result = /** @type {!Element} */
    Native.Document_createElement.call(this, localName);
    internals.patch(result);
    return result;
  });

  setPropertyUnchecked(Document.prototype, 'importNode',
  /**
   * @this {Document}
   * @param {!Node} node
   * @param {boolean=} deep
   * @return {!Node}
   */
  function (node, deep) {
    var clone = Native.Document_importNode.call(this, node, deep);
    // Only create custom elements if this document is associated with the registry.
    if (!this.__CE_hasRegistry) {
      internals.patchTree(clone);
    } else {
      internals.patchAndUpgradeTree(clone);
    }
    return clone;
  });

  var NS_HTML = "http://www.w3.org/1999/xhtml";

  setPropertyUnchecked(Document.prototype, 'createElementNS',
  /**
   * @this {Document}
   * @param {?string} namespace
   * @param {string} localName
   * @return {!Element}
   */
  function (namespace, localName) {
    // Only create custom elements if this document is associated with the registry.
    if (this.__CE_hasRegistry && (namespace === null || namespace === NS_HTML)) {
      var definition = internals.localNameToDefinition(localName);
      if (definition) {
        return new definition.constructor();
      }
    }

    var result = /** @type {!Element} */
    Native.Document_createElementNS.call(this, namespace, localName);
    internals.patch(result);
    return result;
  });

  PatchParentNode(internals, Document.prototype, {
    prepend: Native.Document_prepend,
    append: Native.Document_append
  });
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchNode = function (internals) {
  // `Node#nodeValue` is implemented on `Attr`.
  // `Node#textContent` is implemented on `Attr`, `Element`.

  setPropertyUnchecked(Node.prototype, 'insertBefore',
  /**
   * @this {Node}
   * @param {!Node} node
   * @param {?Node} refNode
   * @return {!Node}
   */
  function (node, refNode) {
    if (node instanceof DocumentFragment) {
      var insertedNodes = Array.prototype.slice.apply(node.childNodes);
      var _nativeResult = Native.Node_insertBefore.call(this, node, refNode);

      // DocumentFragments can't be connected, so `disconnectTree` will never
      // need to be called on a DocumentFragment's children after inserting it.

      if (isConnected(this)) {
        for (var i = 0; i < insertedNodes.length; i++) {
          internals.connectTree(insertedNodes[i]);
        }
      }

      return _nativeResult;
    }

    var nodeWasConnected = isConnected(node);
    var nativeResult = Native.Node_insertBefore.call(this, node, refNode);

    if (nodeWasConnected) {
      internals.disconnectTree(node);
    }

    if (isConnected(this)) {
      internals.connectTree(node);
    }

    return nativeResult;
  });

  setPropertyUnchecked(Node.prototype, 'appendChild',
  /**
   * @this {Node}
   * @param {!Node} node
   * @return {!Node}
   */
  function (node) {
    if (node instanceof DocumentFragment) {
      var insertedNodes = Array.prototype.slice.apply(node.childNodes);
      var _nativeResult2 = Native.Node_appendChild.call(this, node);

      // DocumentFragments can't be connected, so `disconnectTree` will never
      // need to be called on a DocumentFragment's children after inserting it.

      if (isConnected(this)) {
        for (var i = 0; i < insertedNodes.length; i++) {
          internals.connectTree(insertedNodes[i]);
        }
      }

      return _nativeResult2;
    }

    var nodeWasConnected = isConnected(node);
    var nativeResult = Native.Node_appendChild.call(this, node);

    if (nodeWasConnected) {
      internals.disconnectTree(node);
    }

    if (isConnected(this)) {
      internals.connectTree(node);
    }

    return nativeResult;
  });

  setPropertyUnchecked(Node.prototype, 'cloneNode',
  /**
   * @this {Node}
   * @param {boolean=} deep
   * @return {!Node}
   */
  function (deep) {
    var clone = Native.Node_cloneNode.call(this, deep);
    // Only create custom elements if this element's owner document is
    // associated with the registry.
    if (!this.ownerDocument.__CE_hasRegistry) {
      internals.patchTree(clone);
    } else {
      internals.patchAndUpgradeTree(clone);
    }
    return clone;
  });

  setPropertyUnchecked(Node.prototype, 'removeChild',
  /**
   * @this {Node}
   * @param {!Node} node
   * @return {!Node}
   */
  function (node) {
    var nodeWasConnected = isConnected(node);
    var nativeResult = Native.Node_removeChild.call(this, node);

    if (nodeWasConnected) {
      internals.disconnectTree(node);
    }

    return nativeResult;
  });

  setPropertyUnchecked(Node.prototype, 'replaceChild',
  /**
   * @this {Node}
   * @param {!Node} nodeToInsert
   * @param {!Node} nodeToRemove
   * @return {!Node}
   */
  function (nodeToInsert, nodeToRemove) {
    if (nodeToInsert instanceof DocumentFragment) {
      var insertedNodes = Array.prototype.slice.apply(nodeToInsert.childNodes);
      var _nativeResult3 = Native.Node_replaceChild.call(this, nodeToInsert, nodeToRemove);

      // DocumentFragments can't be connected, so `disconnectTree` will never
      // need to be called on a DocumentFragment's children after inserting it.

      if (isConnected(this)) {
        internals.disconnectTree(nodeToRemove);
        for (var i = 0; i < insertedNodes.length; i++) {
          internals.connectTree(insertedNodes[i]);
        }
      }

      return _nativeResult3;
    }

    var nodeToInsertWasConnected = isConnected(nodeToInsert);
    var nativeResult = Native.Node_replaceChild.call(this, nodeToInsert, nodeToRemove);
    var thisIsConnected = isConnected(this);

    if (thisIsConnected) {
      internals.disconnectTree(nodeToRemove);
    }

    if (nodeToInsertWasConnected) {
      internals.disconnectTree(nodeToInsert);
    }

    if (thisIsConnected) {
      internals.connectTree(nodeToInsert);
    }

    return nativeResult;
  });

  function patch_textContent(destination, baseDescriptor) {
    Object.defineProperty(destination, 'textContent', {
      enumerable: baseDescriptor.enumerable,
      configurable: true,
      get: baseDescriptor.get,
      set: /** @this {Node} */function set(assignedValue) {
        // If this is a text node then there are no nodes to disconnect.
        if (this.nodeType === Node.TEXT_NODE) {
          baseDescriptor.set.call(this, assignedValue);
          return;
        }

        var removedNodes = undefined;
        // Checking for `firstChild` is faster than reading `childNodes.length`
        // to compare with 0.
        if (this.firstChild) {
          // Using `childNodes` is faster than `children`, even though we only
          // care about elements.
          var childNodes = this.childNodes;
          var childNodesLength = childNodes.length;
          if (childNodesLength > 0 && isConnected(this)) {
            // Copying an array by iterating is faster than using slice.
            removedNodes = new Array(childNodesLength);
            for (var i = 0; i < childNodesLength; i++) {
              removedNodes[i] = childNodes[i];
            }
          }
        }

        baseDescriptor.set.call(this, assignedValue);

        if (removedNodes) {
          for (var _i = 0; _i < removedNodes.length; _i++) {
            internals.disconnectTree(removedNodes[_i]);
          }
        }
      }
    });
  }

  if (Native.Node_textContent && Native.Node_textContent.get) {
    patch_textContent(Node.prototype, Native.Node_textContent);
  } else {
    internals.addPatch(function (element) {
      patch_textContent(element, {
        enumerable: true,
        configurable: true,
        // NOTE: This implementation of the `textContent` getter assumes that
        // text nodes' `textContent` getter will not be patched.
        get: /** @this {Node} */function get() {
          /** @type {!Array<string>} */
          var parts = [];

          for (var i = 0; i < this.childNodes.length; i++) {
            parts.push(this.childNodes[i].textContent);
          }

          return parts.join('');
        },
        set: /** @this {Node} */function set(assignedValue) {
          while (this.firstChild) {
            Native.Node_removeChild.call(this, this.firstChild);
          }
          Native.Node_appendChild.call(this, document.createTextNode(assignedValue));
        }
      });
    });
  }
};

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ChildNodeNativeMethods} builtIn
 */
var PatchChildNode = function (internals, destination, builtIn) {
  /**
   * @param {...(!Node|string)} nodes
   */
  destination['before'] = function () {
    for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
      nodes[_key] = arguments[_key];
    }

    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    var connectedBefore = /** @type {!Array<!Node>} */nodes.filter(function (node) {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    });

    builtIn.before.apply(this, nodes);

    for (var i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (isConnected(this)) {
      for (var _i = 0; _i < nodes.length; _i++) {
        var node = nodes[_i];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };

  /**
   * @param {...(!Node|string)} nodes
   */
  destination['after'] = function () {
    for (var _len2 = arguments.length, nodes = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      nodes[_key2] = arguments[_key2];
    }

    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    var connectedBefore = /** @type {!Array<!Node>} */nodes.filter(function (node) {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    });

    builtIn.after.apply(this, nodes);

    for (var i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (isConnected(this)) {
      for (var _i2 = 0; _i2 < nodes.length; _i2++) {
        var node = nodes[_i2];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };

  /**
   * @param {...(!Node|string)} nodes
   */
  destination['replaceWith'] = function () {
    for (var _len3 = arguments.length, nodes = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      nodes[_key3] = arguments[_key3];
    }

    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    var connectedBefore = /** @type {!Array<!Node>} */nodes.filter(function (node) {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    });

    var wasConnected = isConnected(this);

    builtIn.replaceWith.apply(this, nodes);

    for (var i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (wasConnected) {
      internals.disconnectTree(this);
      for (var _i3 = 0; _i3 < nodes.length; _i3++) {
        var node = nodes[_i3];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };

  destination['remove'] = function () {
    var wasConnected = isConnected(this);

    builtIn.remove.call(this);

    if (wasConnected) {
      internals.disconnectTree(this);
    }
  };
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchElement = function (internals) {
  if (Native.Element_attachShadow) {
    setPropertyUnchecked(Element.prototype, 'attachShadow',
    /**
     * @this {Element}
     * @param {!{mode: string}} init
     * @return {ShadowRoot}
     */
    function (init) {
      var shadowRoot = Native.Element_attachShadow.call(this, init);
      this.__CE_shadowRoot = shadowRoot;
      return shadowRoot;
    });
  } else {
    console.warn('Custom Elements: `Element#attachShadow` was not patched.');
  }

  function patch_innerHTML(destination, baseDescriptor) {
    Object.defineProperty(destination, 'innerHTML', {
      enumerable: baseDescriptor.enumerable,
      configurable: true,
      get: baseDescriptor.get,
      set: /** @this {Element} */function set(htmlString) {
        var _this = this;

        var isConnected$$1 = isConnected(this);

        // NOTE: In IE11, when using the native `innerHTML` setter, all nodes
        // that were previously descendants of the context element have all of
        // their children removed as part of the set - the entire subtree is
        // 'disassembled'. This work around walks the subtree *before* using the
        // native setter.
        /** @type {!Array<!Element>|undefined} */
        var removedElements = undefined;
        if (isConnected$$1) {
          removedElements = [];
          walkDeepDescendantElements(this, function (element) {
            if (element !== _this) {
              removedElements.push(element);
            }
          });
        }

        baseDescriptor.set.call(this, htmlString);

        if (removedElements) {
          for (var i = 0; i < removedElements.length; i++) {
            var element = removedElements[i];
            if (element.__CE_state === CustomElementState.custom) {
              internals.disconnectedCallback(element);
            }
          }
        }

        // Only create custom elements if this element's owner document is
        // associated with the registry.
        if (!this.ownerDocument.__CE_hasRegistry) {
          internals.patchTree(this);
        } else {
          internals.patchAndUpgradeTree(this);
        }
        return htmlString;
      }
    });
  }

  if (Native.Element_innerHTML && Native.Element_innerHTML.get) {
    patch_innerHTML(Element.prototype, Native.Element_innerHTML);
  } else if (Native.HTMLElement_innerHTML && Native.HTMLElement_innerHTML.get) {
    patch_innerHTML(HTMLElement.prototype, Native.HTMLElement_innerHTML);
  } else {

    /** @type {HTMLDivElement} */
    var rawDiv = Native.Document_createElement.call(document, 'div');

    internals.addPatch(function (element) {
      patch_innerHTML(element, {
        enumerable: true,
        configurable: true,
        // Implements getting `innerHTML` by performing an unpatched `cloneNode`
        // of the element and returning the resulting element's `innerHTML`.
        // TODO: Is this too expensive?
        get: /** @this {Element} */function get() {
          return Native.Node_cloneNode.call(this, true).innerHTML;
        },
        // Implements setting `innerHTML` by creating an unpatched element,
        // setting `innerHTML` of that element and replacing the target
        // element's children with those of the unpatched element.
        set: /** @this {Element} */function set(assignedValue) {
          // NOTE: re-route to `content` for `template` elements.
          // We need to do this because `template.appendChild` does not
          // route into `template.content`.
          /** @type {!Node} */
          var content = this.localName === 'template' ? /** @type {!HTMLTemplateElement} */this.content : this;
          rawDiv.innerHTML = assignedValue;

          while (content.childNodes.length > 0) {
            Native.Node_removeChild.call(content, content.childNodes[0]);
          }
          while (rawDiv.childNodes.length > 0) {
            Native.Node_appendChild.call(content, rawDiv.childNodes[0]);
          }
        }
      });
    });
  }

  setPropertyUnchecked(Element.prototype, 'setAttribute',
  /**
   * @this {Element}
   * @param {string} name
   * @param {string} newValue
   */
  function (name, newValue) {
    // Fast path for non-custom elements.
    if (this.__CE_state !== CustomElementState.custom) {
      return Native.Element_setAttribute.call(this, name, newValue);
    }

    var oldValue = Native.Element_getAttribute.call(this, name);
    Native.Element_setAttribute.call(this, name, newValue);
    newValue = Native.Element_getAttribute.call(this, name);
    internals.attributeChangedCallback(this, name, oldValue, newValue, null);
  });

  setPropertyUnchecked(Element.prototype, 'setAttributeNS',
  /**
   * @this {Element}
   * @param {?string} namespace
   * @param {string} name
   * @param {string} newValue
   */
  function (namespace, name, newValue) {
    // Fast path for non-custom elements.
    if (this.__CE_state !== CustomElementState.custom) {
      return Native.Element_setAttributeNS.call(this, namespace, name, newValue);
    }

    var oldValue = Native.Element_getAttributeNS.call(this, namespace, name);
    Native.Element_setAttributeNS.call(this, namespace, name, newValue);
    newValue = Native.Element_getAttributeNS.call(this, namespace, name);
    internals.attributeChangedCallback(this, name, oldValue, newValue, namespace);
  });

  setPropertyUnchecked(Element.prototype, 'removeAttribute',
  /**
   * @this {Element}
   * @param {string} name
   */
  function (name) {
    // Fast path for non-custom elements.
    if (this.__CE_state !== CustomElementState.custom) {
      return Native.Element_removeAttribute.call(this, name);
    }

    var oldValue = Native.Element_getAttribute.call(this, name);
    Native.Element_removeAttribute.call(this, name);
    if (oldValue !== null) {
      internals.attributeChangedCallback(this, name, oldValue, null, null);
    }
  });

  setPropertyUnchecked(Element.prototype, 'removeAttributeNS',
  /**
   * @this {Element}
   * @param {?string} namespace
   * @param {string} name
   */
  function (namespace, name) {
    // Fast path for non-custom elements.
    if (this.__CE_state !== CustomElementState.custom) {
      return Native.Element_removeAttributeNS.call(this, namespace, name);
    }

    var oldValue = Native.Element_getAttributeNS.call(this, namespace, name);
    Native.Element_removeAttributeNS.call(this, namespace, name);
    // In older browsers, `Element#getAttributeNS` may return the empty string
    // instead of null if the attribute does not exist. For details, see;
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS#Notes
    var newValue = Native.Element_getAttributeNS.call(this, namespace, name);
    if (oldValue !== newValue) {
      internals.attributeChangedCallback(this, name, oldValue, newValue, namespace);
    }
  });

  function patch_insertAdjacentElement(destination, baseMethod) {
    setPropertyUnchecked(destination, 'insertAdjacentElement',
    /**
     * @this {Element}
     * @param {string} where
     * @param {!Element} element
     * @return {?Element}
     */
    function (where, element) {
      var wasConnected = isConnected(element);
      var insertedElement = /** @type {!Element} */
      baseMethod.call(this, where, element);

      if (wasConnected) {
        internals.disconnectTree(element);
      }

      if (isConnected(insertedElement)) {
        internals.connectTree(element);
      }
      return insertedElement;
    });
  }

  if (Native.HTMLElement_insertAdjacentElement) {
    patch_insertAdjacentElement(HTMLElement.prototype, Native.HTMLElement_insertAdjacentElement);
  } else if (Native.Element_insertAdjacentElement) {
    patch_insertAdjacentElement(Element.prototype, Native.Element_insertAdjacentElement);
  } else {
    console.warn('Custom Elements: `Element#insertAdjacentElement` was not patched.');
  }

  PatchParentNode(internals, Element.prototype, {
    prepend: Native.Element_prepend,
    append: Native.Element_append
  });

  PatchChildNode(internals, Element.prototype, {
    before: Native.Element_before,
    after: Native.Element_after,
    replaceWith: Native.Element_replaceWith,
    remove: Native.Element_remove
  });
};

/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var priorCustomElements = window['customElements'];

if (!priorCustomElements || priorCustomElements['forcePolyfill'] || typeof priorCustomElements['define'] != 'function' || typeof priorCustomElements['get'] != 'function') {
  /** @type {!CustomElementInternals} */
  var internals = new CustomElementInternals();

  PatchHTMLElement(internals);
  PatchDocument(internals);
  PatchNode(internals);
  PatchElement(internals);

  // The main document is always associated with the registry.
  document.__CE_hasRegistry = true;

  /** @type {!CustomElementRegistry} */
  var customElements = new CustomElementRegistry(internals);

  Object.defineProperty(window, 'customElements', {
    configurable: true,
    enumerable: true,
    value: customElements
  });
}

/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.7.22

(function (global) {
  if (global.JsMutationObserver) {
    return;
  }
  var registrationsTable = new WeakMap();
  var setImmediate;
  if (/Trident|Edge/.test(navigator.userAgent)) {
    setImmediate = setTimeout;
  } else if (window.setImmediate) {
    setImmediate = window.setImmediate;
  } else {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener("message", function (e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function (func) {
          func();
        });
      }
    });
    setImmediate = function setImmediate(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, "*");
    };
  }
  var isScheduled = false;
  var scheduledObservers = [];
  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }
  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
  }
  function dispatchCallbacks() {
    isScheduled = false;
    var observers = scheduledObservers;
    scheduledObservers = [];
    observers.sort(function (o1, o2) {
      return o1.uid_ - o2.uid_;
    });
    var anyNonEmpty = false;
    observers.forEach(function (observer) {
      var queue = observer.takeRecords();
      removeTransientObserversFor(observer);
      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    });
    if (anyNonEmpty) dispatchCallbacks();
  }
  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function (node) {
      var registrations = registrationsTable.get(node);
      if (!registrations) return;
      registrations.forEach(function (registration) {
        if (registration.observer === observer) registration.removeTransientObservers();
      });
    });
  }
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);
      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          var record = callback(options);
          if (record) registration.enqueue(record);
        }
      }
    }
  }
  var uidCounter = 0;
  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }
  JsMutationObserver.prototype = {
    observe: function observe(target, options) {
      target = wrapIfNeeded(target);
      if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();
      }
      var registrations = registrationsTable.get(target);
      if (!registrations) registrationsTable.set(target, registrations = []);
      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      }
      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }
      registration.addListeners();
    },
    disconnect: function disconnect() {
      this.nodes_.forEach(function (node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registration.removeListeners();
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
      this.records_ = [];
    },
    takeRecords: function takeRecords() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  };
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }
  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  }
  var currentRecord, recordWithOldValue;
  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  }
  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue) return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }
  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  }
  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  }
  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord) return lastRecord;
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;
    return null;
  }
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }
  Registration.prototype = {
    enqueue: function enqueue(record) {
      var records = this.observer.records_;
      var length = records.length;
      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }
      records[length] = record;
    },
    addListeners: function addListeners() {
      this.addListeners_(this.target);
    },
    addListeners_: function addListeners_(node) {
      var options = this.options;
      if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
    },
    removeListeners: function removeListeners() {
      this.removeListeners_(this.target);
    },
    removeListeners_: function removeListeners_(node) {
      var options = this.options;
      if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
    },
    addTransientObserver: function addTransientObserver(node) {
      if (node === this.target) return;
      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations) registrationsTable.set(node, registrations = []);
      registrations.push(this);
    },
    removeTransientObservers: function removeTransientObservers() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];
      transientObservedNodes.forEach(function (node) {
        this.removeListeners_(node);
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i] === this) {
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
    },
    handleEvent: function handleEvent(e) {
      e.stopImmediatePropagation();
      switch (e.type) {
        case "DOMAttrModified":
          var name = e.attrName;
          var namespace = e.relatedNode.namespaceURI;
          var target = e.target;
          var record = new getRecord("attributes", target);
          record.attributeName = name;
          record.attributeNamespace = namespace;
          var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
          forEachAncestorAndObserverEnqueueRecord(target, function (options) {
            if (!options.attributes) return;
            if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
              return;
            }
            if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
            return record;
          });
          break;

        case "DOMCharacterDataModified":
          var target = e.target;
          var record = getRecord("characterData", target);
          var oldValue = e.prevValue;
          forEachAncestorAndObserverEnqueueRecord(target, function (options) {
            if (!options.characterData) return;
            if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
            return record;
          });
          break;

        case "DOMNodeRemoved":
          this.addTransientObserver(e.target);

        case "DOMNodeInserted":
          var changedNode = e.target;
          var addedNodes, removedNodes;
          if (e.type === "DOMNodeInserted") {
            addedNodes = [changedNode];
            removedNodes = [];
          } else {
            addedNodes = [];
            removedNodes = [changedNode];
          }
          var previousSibling = changedNode.previousSibling;
          var nextSibling = changedNode.nextSibling;
          var record = getRecord("childList", e.target.parentNode);
          record.addedNodes = addedNodes;
          record.removedNodes = removedNodes;
          record.previousSibling = previousSibling;
          record.nextSibling = nextSibling;
          forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function (options) {
            if (!options.childList) return;
            return record;
          });
      }
      clearRecords();
    }
  };
  global.JsMutationObserver = JsMutationObserver;
  if (!global.MutationObserver) {
    global.MutationObserver = JsMutationObserver;
    JsMutationObserver._isPolyfilled = true;
  }
})(self);

/*
Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
(function (global, undefined) {
    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function () {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                new Function("" + handler)();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function () {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function onGlobalMessage(event) {
            if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();
    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();
    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();
    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();
    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
})(self);

// Caution:
// Do not replace this import statement with codes.
//
// If you replace this import statement with codes,
// the codes will be executed after the following polyfills are imported
// because import statements are hoisted during compilation.
// Polyfill ECMAScript standard features with global namespace pollution
// Polyfill Custom Elements v1 with global namespace pollution
// Polyfill MutationObserver with global namespace pollution
// Polyfill setImmediate with global namespace pollution

(function () {
  var DEFAULT_VIEWPORT = 'width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no';

  var Viewport = {
    ensureViewportElement: function ensureViewportElement() {
      var viewportElement = document.querySelector('meta[name=viewport]');

      if (!viewportElement) {
        viewportElement = document.createElement('meta');
        viewportElement.name = 'viewport';
        document.head.appendChild(viewportElement);
      }

      return viewportElement;
    },

    setup: function setup() {
      var viewportElement = Viewport.ensureViewportElement();

      if (!viewportElement) {
        return;
      }

      if (!viewportElement.hasAttribute('content')) {
        viewportElement.setAttribute('content', DEFAULT_VIEWPORT);
      }
    }
  };

  window.Viewport = Viewport;
})();

function setup(ons$$1) {
  if (window._onsLoaded) {
    ons$$1._util.warn('Onsen UI is loaded more than once.');
  }
  window._onsLoaded = true;

  // fastclick
  window.addEventListener('load', function () {
    ons$$1.fastClick = fastclick_1.attach(document.body);

    var supportTouchAction = 'touch-action' in document.body.style;

    ons$$1.platform._runOnActualPlatform(function () {
      if (ons$$1.platform.isAndroid()) {
        // In Android4.4+, correct viewport settings can remove click delay.
        // So disable FastClick on Android.
        ons$$1.fastClick.destroy();
      } else if (ons$$1.platform.isIOS()) {
        if (supportTouchAction && (ons$$1.platform.isIOSSafari() || ons$$1.platform.isWKWebView())) {
          // If 'touch-action' supported in iOS Safari or WKWebView, disable FastClick.
          ons$$1.fastClick.destroy();
        } else {
          // Do nothing. 'touch-action: manipulation' has no effect on UIWebView.
        }
      }
    });
  }, false);

  ons$$1.ready(function () {
    ons$$1.enableDeviceBackButtonHandler();
    ons$$1._defaultDeviceBackButtonHandler = ons$$1._internal.dbbDispatcher.createHandler(window.document.body, function () {
      if (Object.hasOwnProperty.call(navigator, 'app')) {
        navigator.app.exitApp();
      } else {
        console.warn('Could not close the app. Is \'cordova.js\' included?\nError: \'window.navigator.app\' is undefined.');
      }
    });
    document.body._gestureDetector = new ons$$1.GestureDetector(document.body, { passive: true });

    // Simulate Device Back Button on ESC press
    if (!ons$$1.platform.isWebView()) {
      document.body.addEventListener('keydown', function (event) {
        if (event.keyCode === 27) {
          ons$$1.fireDeviceBackButtonEvent();
        }
      });
    }

    // setup loading placeholder
    ons$$1._setupLoadingPlaceHolders();
  });

  // viewport.js
  Viewport.setup();
}

setup(ons); // Setup initial listeners

export default ons;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9Ab25zZW51aS9mYXN0Y2xpY2svbGliL2Zhc3RjbGljay5qcyIsIi4uLy4uL2NvcmUvc3JjL3BvbHlmaWxscy9wb2x5ZmlsbC1zd2l0Y2hlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19mYWlscy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL191aWQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19yZWRlZmluZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jdHguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtcGllLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RlZmluZWQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zZXQtcHJvdG8uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc3RyaW5nLWF0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fbGlicmFyeS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXJhdG9ycy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWFic29sdXRlLWluZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYXJyYXktaW5jbHVkZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQta2V5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHBzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faHRtbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItY3JlYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tb2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdwby5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlci1zdGVwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19yZWRlZmluZS1hbGwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1pbnN0YW5jZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItY2FsbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLWFycmF5LWl0ZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2Zvci1vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NldC1zcGVjaWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fbWV0YS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3ZhbGlkYXRlLWNvbGxlY3Rpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb2xsZWN0aW9uLXN0cm9uZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItZGV0ZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faW5oZXJpdC1pZi1yZXF1aXJlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvbGxlY3Rpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zZXQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hcnJheS1mcm9tLWl0ZXJhYmxlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29sbGVjdGlvbi10by1qc29uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc2V0LnRvLWpzb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zZXQtY29sbGVjdGlvbi1vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnNldC5vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NldC1jb2xsZWN0aW9uLWZyb20uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zZXQuZnJvbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ZuL3NldC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcubWFwLm9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcubWFwLmZyb20uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9mbi9tYXAuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1hcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FycmF5LXNwZWNpZXMtY29uc3RydWN0b3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hcnJheS1zcGVjaWVzLWNyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FycmF5LW1ldGhvZHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1hc3NpZ24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb2xsZWN0aW9uLXdlYWsuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLW1hcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LndlYWstbWFwLm9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcud2Vhay1tYXAuZnJvbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ZuL3dlYWstbWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY3JlYXRlLXByb3BlcnR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ZuL2FycmF5L2Zyb20uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG9uc2VudWkvY3VzdG9tLWVsZW1lbnRzL3NyYy9VdGlsaXRpZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG9uc2VudWkvY3VzdG9tLWVsZW1lbnRzL3NyYy9DdXN0b21FbGVtZW50U3RhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG9uc2VudWkvY3VzdG9tLWVsZW1lbnRzL3NyYy9DdXN0b21FbGVtZW50SW50ZXJuYWxzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BvbnNlbnVpL2N1c3RvbS1lbGVtZW50cy9zcmMvRG9jdW1lbnRDb25zdHJ1Y3Rpb25PYnNlcnZlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Ab25zZW51aS9jdXN0b20tZWxlbWVudHMvc3JjL0RlZmVycmVkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BvbnNlbnVpL2N1c3RvbS1lbGVtZW50cy9zcmMvQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BvbnNlbnVpL2N1c3RvbS1lbGVtZW50cy9zcmMvUGF0Y2gvTmF0aXZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BvbnNlbnVpL2N1c3RvbS1lbGVtZW50cy9zcmMvQWxyZWFkeUNvbnN0cnVjdGVkTWFya2VyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BvbnNlbnVpL2N1c3RvbS1lbGVtZW50cy9zcmMvUGF0Y2gvSFRNTEVsZW1lbnQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG9uc2VudWkvY3VzdG9tLWVsZW1lbnRzL3NyYy9QYXRjaC9JbnRlcmZhY2UvUGFyZW50Tm9kZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Ab25zZW51aS9jdXN0b20tZWxlbWVudHMvc3JjL1BhdGNoL0RvY3VtZW50LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BvbnNlbnVpL2N1c3RvbS1lbGVtZW50cy9zcmMvUGF0Y2gvTm9kZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Ab25zZW51aS9jdXN0b20tZWxlbWVudHMvc3JjL1BhdGNoL0ludGVyZmFjZS9DaGlsZE5vZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQG9uc2VudWkvY3VzdG9tLWVsZW1lbnRzL3NyYy9QYXRjaC9FbGVtZW50LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0BvbnNlbnVpL2N1c3RvbS1lbGVtZW50cy9zcmMvY3VzdG9tLWVsZW1lbnRzLmpzIiwiLi4vLi4vY29yZS9zcmMvcG9seWZpbGxzL011dGF0aW9uT2JzZXJ2ZXJAMC43LjIyL011dGF0aW9uT2JzZXJ2ZXIuanMiLCIuLi8uLi9jb3JlL3NyYy9wb2x5ZmlsbHMvc2V0SW1tZWRpYXRlQDEuMC4yK21vZC9zZXRJbW1lZGlhdGUuanMiLCIuLi8uLi9jb3JlL3NyYy9wb2x5ZmlsbHMvaW5kZXguanMiLCIuLi8uLi9jb3JlL3NyYy92ZW5kb3Ivdmlld3BvcnQuanMiLCIuLi8uLi9jb3JlL3NyYy9zZXR1cC5qcyIsIi4uLy4uL2NvcmUvc3JjL2luZGV4LmVzbS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyI7KGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8qKlxuXHQgKiBAcHJlc2VydmUgRmFzdENsaWNrOiBwb2x5ZmlsbCB0byByZW1vdmUgY2xpY2sgZGVsYXlzIG9uIGJyb3dzZXJzIHdpdGggdG91Y2ggVUlzLlxuXHQgKlxuXHQgKiBAY29kaW5nc3RhbmRhcmQgZnRsYWJzLWpzdjJcblx0ICogQGNvcHlyaWdodCBUaGUgRmluYW5jaWFsIFRpbWVzIExpbWl0ZWQgW0FsbCBSaWdodHMgUmVzZXJ2ZWRdXG5cdCAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChzZWUgTElDRU5TRS50eHQpXG5cdCAqL1xuXG5cdC8qanNsaW50IGJyb3dzZXI6dHJ1ZSwgbm9kZTp0cnVlKi9cblx0LypnbG9iYWwgZGVmaW5lLCBFdmVudCwgTm9kZSovXG5cblxuXHQvKipcblx0ICogSW5zdGFudGlhdGUgZmFzdC1jbGlja2luZyBsaXN0ZW5lcnMgb24gdGhlIHNwZWNpZmllZCBsYXllci5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gbGF5ZXIgVGhlIGxheWVyIHRvIGxpc3RlbiBvblxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0c1xuXHQgKi9cblx0ZnVuY3Rpb24gRmFzdENsaWNrKGxheWVyLCBvcHRpb25zKSB7XG5cdFx0dmFyIG9sZE9uQ2xpY2s7XG5cblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdC8qKlxuXHRcdCAqIFdoZXRoZXIgYSBjbGljayBpcyBjdXJyZW50bHkgYmVpbmcgdHJhY2tlZC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIGJvb2xlYW5cblx0XHQgKi9cblx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblxuXG5cdFx0LyoqXG5cdFx0ICogVGltZXN0YW1wIGZvciB3aGVuIGNsaWNrIHRyYWNraW5nIHN0YXJ0ZWQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCA9IDA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBlbGVtZW50IGJlaW5nIHRyYWNrZWQgZm9yIGEgY2xpY2suXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBFdmVudFRhcmdldFxuXHRcdCAqL1xuXHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFgtY29vcmRpbmF0ZSBvZiB0b3VjaCBzdGFydCBldmVudC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudG91Y2hTdGFydFggPSAwO1xuXG5cblx0XHQvKipcblx0XHQgKiBZLWNvb3JkaW5hdGUgb2YgdG91Y2ggc3RhcnQgZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRvdWNoU3RhcnRZID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogSUQgb2YgdGhlIGxhc3QgdG91Y2gsIHJldHJpZXZlZCBmcm9tIFRvdWNoLmlkZW50aWZpZXIuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLmxhc3RUb3VjaElkZW50aWZpZXIgPSAwO1xuXG5cblx0XHQvKipcblx0XHQgKiBUb3VjaG1vdmUgYm91bmRhcnksIGJleW9uZCB3aGljaCBhIGNsaWNrIHdpbGwgYmUgY2FuY2VsbGVkLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50b3VjaEJvdW5kYXJ5ID0gb3B0aW9ucy50b3VjaEJvdW5kYXJ5IHx8IDEwO1xuXG5cblx0XHQvKipcblx0XHQgKiBUaGUgRmFzdENsaWNrIGxheWVyLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgRWxlbWVudFxuXHRcdCAqL1xuXHRcdHRoaXMubGF5ZXIgPSBsYXllcjtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBtaW5pbXVtIHRpbWUgYmV0d2VlbiB0YXAodG91Y2hzdGFydCBhbmQgdG91Y2hlbmQpIGV2ZW50c1xuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50YXBEZWxheSA9IG9wdGlvbnMudGFwRGVsYXkgfHwgMjAwO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG1heGltdW0gdGltZSBmb3IgYSB0YXBcblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudGFwVGltZW91dCA9IG9wdGlvbnMudGFwVGltZW91dCB8fCA3MDA7XG5cblx0XHRpZiAoRmFzdENsaWNrLm5vdE5lZWRlZChsYXllcikpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBTb21lIG9sZCB2ZXJzaW9ucyBvZiBBbmRyb2lkIGRvbid0IGhhdmUgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcblx0XHRmdW5jdGlvbiBiaW5kKG1ldGhvZCwgY29udGV4dCkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkgeyByZXR1cm4gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7IH07XG5cdFx0fVxuXG5cblx0XHR2YXIgbWV0aG9kcyA9IFsnb25Nb3VzZScsICdvbkNsaWNrJywgJ29uVG91Y2hTdGFydCcsICdvblRvdWNoTW92ZScsICdvblRvdWNoRW5kJywgJ29uVG91Y2hDYW5jZWwnXTtcblx0XHR2YXIgY29udGV4dCA9IHRoaXM7XG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBtZXRob2RzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0Y29udGV4dFttZXRob2RzW2ldXSA9IGJpbmQoY29udGV4dFttZXRob2RzW2ldXSwgY29udGV4dCk7XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IHVwIGV2ZW50IGhhbmRsZXJzIGFzIHJlcXVpcmVkXG5cdFx0aWYgKGRldmljZUlzQW5kcm9pZCkge1xuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHR9XG5cblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DbGljaywgdHJ1ZSk7XG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZSwgZmFsc2UpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblRvdWNoRW5kLCBmYWxzZSk7XG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLm9uVG91Y2hDYW5jZWwsIGZhbHNlKTtcblxuXHRcdC8vIEhhY2sgaXMgcmVxdWlyZWQgZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBFdmVudCNzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24gKGUuZy4gQW5kcm9pZCAyKVxuXHRcdC8vIHdoaWNoIGlzIGhvdyBGYXN0Q2xpY2sgbm9ybWFsbHkgc3RvcHMgY2xpY2sgZXZlbnRzIGJ1YmJsaW5nIHRvIGNhbGxiYWNrcyByZWdpc3RlcmVkIG9uIHRoZSBGYXN0Q2xpY2tcblx0XHQvLyBsYXllciB3aGVuIHRoZXkgYXJlIGNhbmNlbGxlZC5cblx0XHRpZiAoIUV2ZW50LnByb3RvdHlwZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24pIHtcblx0XHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjaywgY2FwdHVyZSkge1xuXHRcdFx0XHR2YXIgcm12ID0gTm9kZS5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblx0XHRcdFx0aWYgKHR5cGUgPT09ICdjbGljaycpIHtcblx0XHRcdFx0XHRybXYuY2FsbChsYXllciwgdHlwZSwgY2FsbGJhY2suaGlqYWNrZWQgfHwgY2FsbGJhY2ssIGNhcHR1cmUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJtdi5jYWxsKGxheWVyLCB0eXBlLCBjYWxsYmFjaywgY2FwdHVyZSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjaywgY2FwdHVyZSkge1xuXHRcdFx0XHR2YXIgYWR2ID0gTm9kZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcblx0XHRcdFx0aWYgKHR5cGUgPT09ICdjbGljaycpIHtcblx0XHRcdFx0XHRhZHYuY2FsbChsYXllciwgdHlwZSwgY2FsbGJhY2suaGlqYWNrZWQgfHwgKGNhbGxiYWNrLmhpamFja2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRcdGlmICghZXZlbnQucHJvcGFnYXRpb25TdG9wcGVkKSB7XG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrKGV2ZW50KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSwgY2FwdHVyZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YWR2LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLCBjYXB0dXJlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBJZiBhIGhhbmRsZXIgaXMgYWxyZWFkeSBkZWNsYXJlZCBpbiB0aGUgZWxlbWVudCdzIG9uY2xpY2sgYXR0cmlidXRlLCBpdCB3aWxsIGJlIGZpcmVkIGJlZm9yZVxuXHRcdC8vIEZhc3RDbGljaydzIG9uQ2xpY2sgaGFuZGxlci4gRml4IHRoaXMgYnkgcHVsbGluZyBvdXQgdGhlIHVzZXItZGVmaW5lZCBoYW5kbGVyIGZ1bmN0aW9uIGFuZFxuXHRcdC8vIGFkZGluZyBpdCBhcyBsaXN0ZW5lci5cblx0XHRpZiAodHlwZW9mIGxheWVyLm9uY2xpY2sgPT09ICdmdW5jdGlvbicpIHtcblxuXHRcdFx0Ly8gQW5kcm9pZCBicm93c2VyIG9uIGF0IGxlYXN0IDMuMiByZXF1aXJlcyBhIG5ldyByZWZlcmVuY2UgdG8gdGhlIGZ1bmN0aW9uIGluIGxheWVyLm9uY2xpY2tcblx0XHRcdC8vIC0gdGhlIG9sZCBvbmUgd29uJ3Qgd29yayBpZiBwYXNzZWQgdG8gYWRkRXZlbnRMaXN0ZW5lciBkaXJlY3RseS5cblx0XHRcdG9sZE9uQ2xpY2sgPSBsYXllci5vbmNsaWNrO1xuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRvbGRPbkNsaWNrKGV2ZW50KTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdGxheWVyLm9uY2xpY2sgPSBudWxsO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQqIFdpbmRvd3MgUGhvbmUgOC4xIGZha2VzIHVzZXIgYWdlbnQgc3RyaW5nIHRvIGxvb2sgbGlrZSBBbmRyb2lkIGFuZCBpUGhvbmUuXG5cdCpcblx0KiBAdHlwZSBib29sZWFuXG5cdCovXG5cdHZhciBkZXZpY2VJc1dpbmRvd3NQaG9uZSA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIldpbmRvd3MgUGhvbmVcIikgPj0gMDtcblxuXHQvKipcblx0ICogQW5kcm9pZCByZXF1aXJlcyBleGNlcHRpb25zLlxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNBbmRyb2lkID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdBbmRyb2lkJykgPiAwICYmICFkZXZpY2VJc1dpbmRvd3NQaG9uZTtcblxuXG5cdC8qKlxuXHQgKiBpT1MgcmVxdWlyZXMgZXhjZXB0aW9ucy5cblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzSU9TID0gL2lQKGFkfGhvbmV8b2QpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICFkZXZpY2VJc1dpbmRvd3NQaG9uZTtcblxuXG5cdC8qKlxuXHQgKiBpT1MgNCByZXF1aXJlcyBhbiBleGNlcHRpb24gZm9yIHNlbGVjdCBlbGVtZW50cy5cblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzSU9TNCA9IGRldmljZUlzSU9TICYmICgvT1MgNF9cXGQoX1xcZCk/LykudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuXG5cdC8qKlxuXHQgKiBpT1MgNi4wLTcuKiByZXF1aXJlcyB0aGUgdGFyZ2V0IGVsZW1lbnQgdG8gYmUgbWFudWFsbHkgZGVyaXZlZFxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNJT1NXaXRoQmFkVGFyZ2V0ID0gZGV2aWNlSXNJT1MgJiYgKC9PUyBbNi03XV9cXGQvKS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG5cdC8qKlxuXHQgKiBCbGFja0JlcnJ5IHJlcXVpcmVzIGV4Y2VwdGlvbnMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0JsYWNrQmVycnkxMCA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQkIxMCcpID4gMDtcblxuXHQvKipcblx0ICogVmFsaWQgdHlwZXMgZm9yIHRleHQgaW5wdXRzXG5cdCAqXG5cdCAqIEB0eXBlIGFycmF5XG5cdCAqL1xuXHR2YXIgdGV4dEZpZWxkcyA9IFsnZW1haWwnLCAnbnVtYmVyJywgJ3Bhc3N3b3JkJywgJ3NlYXJjaCcsICd0ZWwnLCAndGV4dCcsICd1cmwnXTtcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIHdoZXRoZXIgYSBnaXZlbiBlbGVtZW50IHJlcXVpcmVzIGEgbmF0aXZlIGNsaWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCBuZWVkcyBhIG5hdGl2ZSBjbGlja1xuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5uZWVkc0NsaWNrID0gZnVuY3Rpb24odGFyZ2V0KSB7XG5cdFx0c3dpdGNoICh0YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkge1xuXG5cdFx0Ly8gRG9uJ3Qgc2VuZCBhIHN5bnRoZXRpYyBjbGljayB0byBkaXNhYmxlZCBpbnB1dHMgKGlzc3VlICM2Milcblx0XHRjYXNlICdidXR0b24nOlxuXHRcdGNhc2UgJ3NlbGVjdCc6XG5cdFx0Y2FzZSAndGV4dGFyZWEnOlxuXHRcdFx0aWYgKHRhcmdldC5kaXNhYmxlZCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnaW5wdXQnOlxuXG5cdFx0XHQvLyBGaWxlIGlucHV0cyBuZWVkIHJlYWwgY2xpY2tzIG9uIGlPUyA2IGR1ZSB0byBhIGJyb3dzZXIgYnVnIChpc3N1ZSAjNjgpXG5cdFx0XHRpZiAoKGRldmljZUlzSU9TICYmIHRhcmdldC50eXBlID09PSAnZmlsZScpIHx8IHRhcmdldC5kaXNhYmxlZCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnbGFiZWwnOlxuXHRcdGNhc2UgJ2lmcmFtZSc6IC8vIGlPUzggaG9tZXNjcmVlbiBhcHBzIGNhbiBwcmV2ZW50IGV2ZW50cyBidWJibGluZyBpbnRvIGZyYW1lc1xuXHRcdGNhc2UgJ3ZpZGVvJzpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiAoL1xcYm5lZWRzY2xpY2tcXGIvKS50ZXN0KHRhcmdldC5jbGFzc05hbWUpO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIERldGVybWluZSB3aGV0aGVyIGEgZ2l2ZW4gZWxlbWVudCByZXF1aXJlcyBhIGNhbGwgdG8gZm9jdXMgdG8gc2ltdWxhdGUgY2xpY2sgaW50byBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCByZXF1aXJlcyBhIGNhbGwgdG8gZm9jdXMgdG8gc2ltdWxhdGUgbmF0aXZlIGNsaWNrLlxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5uZWVkc0ZvY3VzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG5cdFx0c3dpdGNoICh0YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdGNhc2UgJ3RleHRhcmVhJzpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGNhc2UgJ3NlbGVjdCc6XG5cdFx0XHRyZXR1cm4gIWRldmljZUlzQW5kcm9pZDtcblx0XHRjYXNlICdpbnB1dCc6XG5cdFx0XHRzd2l0Y2ggKHRhcmdldC50eXBlKSB7XG5cdFx0XHRjYXNlICdidXR0b24nOlxuXHRcdFx0Y2FzZSAnY2hlY2tib3gnOlxuXHRcdFx0Y2FzZSAnZmlsZSc6XG5cdFx0XHRjYXNlICdpbWFnZSc6XG5cdFx0XHRjYXNlICdyYWRpbyc6XG5cdFx0XHRjYXNlICdzdWJtaXQnOlxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5vIHBvaW50IGluIGF0dGVtcHRpbmcgdG8gZm9jdXMgZGlzYWJsZWQgaW5wdXRzXG5cdFx0XHRyZXR1cm4gIXRhcmdldC5kaXNhYmxlZCAmJiAhdGFyZ2V0LnJlYWRPbmx5O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gKC9cXGJuZWVkc2ZvY3VzXFxiLykudGVzdCh0YXJnZXQuY2xhc3NOYW1lKTtcblx0XHR9XG5cdH07XG5cblxuXHQvKipcblx0ICogU2VuZCBhIGNsaWNrIGV2ZW50IHRvIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXRFbGVtZW50XG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLnNlbmRDbGljayA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50KSB7XG5cdFx0dmFyIGNsaWNrRXZlbnQsIHRvdWNoO1xuXG5cdFx0Ly8gT24gc29tZSBBbmRyb2lkIGRldmljZXMgYWN0aXZlRWxlbWVudCBuZWVkcyB0byBiZSBibHVycmVkIG90aGVyd2lzZSB0aGUgc3ludGhldGljIGNsaWNrIHdpbGwgaGF2ZSBubyBlZmZlY3QgKCMyNClcblx0XHRpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0YXJnZXRFbGVtZW50KSB7XG5cdFx0XHRkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcblx0XHR9XG5cblx0XHR0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuXG5cdFx0Ly8gU3ludGhlc2lzZSBhIGNsaWNrIGV2ZW50LCB3aXRoIGFuIGV4dHJhIGF0dHJpYnV0ZSBzbyBpdCBjYW4gYmUgdHJhY2tlZFxuXHRcdGNsaWNrRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcblx0XHRjbGlja0V2ZW50LmluaXRNb3VzZUV2ZW50KHRoaXMuZGV0ZXJtaW5lRXZlbnRUeXBlKHRhcmdldEVsZW1lbnQpLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIHRvdWNoLnNjcmVlblgsIHRvdWNoLnNjcmVlblksIHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFksIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLCBudWxsKTtcblx0XHRjbGlja0V2ZW50LmZvcndhcmRlZFRvdWNoRXZlbnQgPSB0cnVlO1xuXHRcdHRhcmdldEVsZW1lbnQuZGlzcGF0Y2hFdmVudChjbGlja0V2ZW50KTtcblx0fTtcblxuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmRldGVybWluZUV2ZW50VHlwZSA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQpIHtcblxuXHRcdC8vSXNzdWUgIzE1OTogQW5kcm9pZCBDaHJvbWUgU2VsZWN0IEJveCBkb2VzIG5vdCBvcGVuIHdpdGggYSBzeW50aGV0aWMgY2xpY2sgZXZlbnRcblx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkICYmIHRhcmdldEVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0Jykge1xuXHRcdFx0cmV0dXJuICdtb3VzZWRvd24nO1xuXHRcdH1cblxuXHRcdHJldHVybiAnY2xpY2snO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5mb2N1cyA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQpIHtcblx0XHR2YXIgbGVuZ3RoO1xuXG5cdFx0Ly8gSXNzdWUgIzE2MDogb24gaU9TIDcsIHNvbWUgaW5wdXQgZWxlbWVudHMgKGUuZy4gZGF0ZSBkYXRldGltZSBtb250aCkgdGhyb3cgYSB2YWd1ZSBUeXBlRXJyb3Igb24gc2V0U2VsZWN0aW9uUmFuZ2UuIFRoZXNlIGVsZW1lbnRzIGRvbid0IGhhdmUgYW4gaW50ZWdlciB2YWx1ZSBmb3IgdGhlIHNlbGVjdGlvblN0YXJ0IGFuZCBzZWxlY3Rpb25FbmQgcHJvcGVydGllcywgYnV0IHVuZm9ydHVuYXRlbHkgdGhhdCBjYW4ndCBiZSB1c2VkIGZvciBkZXRlY3Rpb24gYmVjYXVzZSBhY2Nlc3NpbmcgdGhlIHByb3BlcnRpZXMgYWxzbyB0aHJvd3MgYSBUeXBlRXJyb3IuIEp1c3QgY2hlY2sgdGhlIHR5cGUgaW5zdGVhZC4gRmlsZWQgYXMgQXBwbGUgYnVnICMxNTEyMjcyNC5cblx0XHRpZiAoZGV2aWNlSXNJT1MgJiYgdGFyZ2V0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSAmJiB0YXJnZXRFbGVtZW50LnR5cGUuaW5kZXhPZignZGF0ZScpICE9PSAwICYmIHRhcmdldEVsZW1lbnQudHlwZSAhPT0gJ3RpbWUnICYmIHRhcmdldEVsZW1lbnQudHlwZSAhPT0gJ21vbnRoJyAmJiB0YXJnZXRFbGVtZW50LnR5cGUgIT09ICdlbWFpbCcgJiYgdGFyZ2V0RWxlbWVudC50eXBlICE9PSAnbnVtYmVyJykge1xuXHRcdFx0bGVuZ3RoID0gdGFyZ2V0RWxlbWVudC52YWx1ZS5sZW5ndGg7XG5cdFx0XHR0YXJnZXRFbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKGxlbmd0aCwgbGVuZ3RoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0RWxlbWVudC5mb2N1cygpO1xuXHRcdH1cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudCBpcyBhIGNoaWxkIG9mIGEgc2Nyb2xsYWJsZSBsYXllciBhbmQgaWYgc28sIHNldCBhIGZsYWcgb24gaXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS51cGRhdGVTY3JvbGxQYXJlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50KSB7XG5cdFx0dmFyIHNjcm9sbFBhcmVudCwgcGFyZW50RWxlbWVudDtcblxuXHRcdHNjcm9sbFBhcmVudCA9IHRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50O1xuXG5cdFx0Ly8gQXR0ZW1wdCB0byBkaXNjb3ZlciB3aGV0aGVyIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBjb250YWluZWQgd2l0aGluIGEgc2Nyb2xsYWJsZSBsYXllci4gUmUtY2hlY2sgaWYgdGhlXG5cdFx0Ly8gdGFyZ2V0IGVsZW1lbnQgd2FzIG1vdmVkIHRvIGFub3RoZXIgcGFyZW50LlxuXHRcdGlmICghc2Nyb2xsUGFyZW50IHx8ICFzY3JvbGxQYXJlbnQuY29udGFpbnModGFyZ2V0RWxlbWVudCkpIHtcblx0XHRcdHBhcmVudEVsZW1lbnQgPSB0YXJnZXRFbGVtZW50O1xuXHRcdFx0ZG8ge1xuXHRcdFx0XHRpZiAocGFyZW50RWxlbWVudC5zY3JvbGxIZWlnaHQgPiBwYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCkge1xuXHRcdFx0XHRcdHNjcm9sbFBhcmVudCA9IHBhcmVudEVsZW1lbnQ7XG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQgPSBwYXJlbnRFbGVtZW50O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cGFyZW50RWxlbWVudCA9IHBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudDtcblx0XHRcdH0gd2hpbGUgKHBhcmVudEVsZW1lbnQpO1xuXHRcdH1cblxuXHRcdC8vIEFsd2F5cyB1cGRhdGUgdGhlIHNjcm9sbCB0b3AgdHJhY2tlciBpZiBwb3NzaWJsZS5cblx0XHRpZiAoc2Nyb2xsUGFyZW50KSB7XG5cdFx0XHRzY3JvbGxQYXJlbnQuZmFzdENsaWNrTGFzdFNjcm9sbFRvcCA9IHNjcm9sbFBhcmVudC5zY3JvbGxUb3A7XG5cdFx0fVxuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IHRhcmdldEVsZW1lbnRcblx0ICogQHJldHVybnMge0VsZW1lbnR8RXZlbnRUYXJnZXR9XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmdldFRhcmdldEVsZW1lbnRGcm9tRXZlbnRUYXJnZXQgPSBmdW5jdGlvbihldmVudFRhcmdldCkge1xuXG5cdFx0Ly8gT24gc29tZSBvbGRlciBicm93c2VycyAobm90YWJseSBTYWZhcmkgb24gaU9TIDQuMSAtIHNlZSBpc3N1ZSAjNTYpIHRoZSBldmVudCB0YXJnZXQgbWF5IGJlIGEgdGV4dCBub2RlLlxuXHRcdGlmIChldmVudFRhcmdldC5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUpIHtcblx0XHRcdHJldHVybiBldmVudFRhcmdldC5wYXJlbnROb2RlO1xuXHRcdH1cblxuXHRcdHJldHVybiBldmVudFRhcmdldDtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRFbGVtZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5pc1RleHRGaWVsZCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0dGFyZ2V0RWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd0ZXh0YXJlYSdcblx0XHRcdHx8IHRleHRGaWVsZHMuaW5kZXhPZih0YXJnZXRFbGVtZW50LnR5cGUpICE9PSAtMVxuXHRcdCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIE9uIHRvdWNoIHN0YXJ0LCByZWNvcmQgdGhlIHBvc2l0aW9uIGFuZCBzY3JvbGwgb2Zmc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaFN0YXJ0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgdGFyZ2V0RWxlbWVudCwgdG91Y2gsIHNlbGVjdGlvbjtcblxuXHRcdC8vIElnbm9yZSBtdWx0aXBsZSB0b3VjaGVzLCBvdGhlcndpc2UgcGluY2gtdG8tem9vbSBpcyBwcmV2ZW50ZWQgaWYgYm90aCBmaW5nZXJzIGFyZSBvbiB0aGUgRmFzdENsaWNrIGVsZW1lbnQgKGlzc3VlICMxMTEpLlxuXHRcdGlmIChldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHRhcmdldEVsZW1lbnQgPSB0aGlzLmdldFRhcmdldEVsZW1lbnRGcm9tRXZlbnRUYXJnZXQoZXZlbnQudGFyZ2V0KTtcblx0XHR0b3VjaCA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF07XG5cblx0XHQvLyBJZ25vcmUgdG91Y2hlcyBvbiBjb250ZW50ZWRpdGFibGUgZWxlbWVudHMgdG8gcHJldmVudCBjb25mbGljdCB3aXRoIHRleHQgc2VsZWN0aW9uLlxuXHRcdC8vIChGb3IgZGV0YWlsczogaHR0cHM6Ly9naXRodWIuY29tL2Z0bGFicy9mYXN0Y2xpY2svcHVsbC8yMTEgKVxuXHRcdGlmICh0YXJnZXRFbGVtZW50LmlzQ29udGVudEVkaXRhYmxlKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoZGV2aWNlSXNJT1MpIHtcblx0XHRcdC8vIElnbm9yZSB0b3VjaHN0YXJ0IGluIGZvY3VzZWQgdGV4dCBmaWVsZFxuXHRcdFx0Ly8gQWxsb3dzIG5vcm1hbCB0ZXh0IHNlbGVjdGlvbiBhbmQgY29tbWFuZHMgKHNlbGVjdC9wYXN0ZS9jdXQpIHdoZW4gYSBmaWVsZCBoYXMgZm9jdXMsIHdoaWxlIHN0aWxsIGFsbG93aW5nIGZhc3QgdGFwLXRvLWZvY3VzLlxuXHRcdFx0Ly8gV2l0aG91dCB0aGlzIGZpeCwgdXNlciBuZWVkcyB0byB0YXAtYW5kLWhvbGQgYSB0ZXh0IGZpZWxkIGZvciBjb250ZXh0IG1lbnUsIGFuZCBkb3VibGUtdGFwIHRvIHNlbGVjdCB0ZXh0IGRvZXNuJ3Qgd29yayBhdCBhbGwuXG5cdFx0XHRpZiAodGFyZ2V0RWxlbWVudCA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiB0aGlzLmlzVGV4dEZpZWxkKHRhcmdldEVsZW1lbnQpKSB7XG5cdFx0XHQgIHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWRldmljZUlzSU9TNCkge1xuXG5cdFx0XHRcdC8vIFdlaXJkIHRoaW5ncyBoYXBwZW4gb24gaU9TIHdoZW4gYW4gYWxlcnQgb3IgY29uZmlybSBkaWFsb2cgaXMgb3BlbmVkIGZyb20gYSBjbGljayBldmVudCBjYWxsYmFjayAoaXNzdWUgIzIzKTpcblx0XHRcdFx0Ly8gd2hlbiB0aGUgdXNlciBuZXh0IHRhcHMgYW55d2hlcmUgZWxzZSBvbiB0aGUgcGFnZSwgbmV3IHRvdWNoc3RhcnQgYW5kIHRvdWNoZW5kIGV2ZW50cyBhcmUgZGlzcGF0Y2hlZFxuXHRcdFx0XHQvLyB3aXRoIHRoZSBzYW1lIGlkZW50aWZpZXIgYXMgdGhlIHRvdWNoIGV2ZW50IHRoYXQgcHJldmlvdXNseSB0cmlnZ2VyZWQgdGhlIGNsaWNrIHRoYXQgdHJpZ2dlcmVkIHRoZSBhbGVydC5cblx0XHRcdFx0Ly8gU2FkbHksIHRoZXJlIGlzIGFuIGlzc3VlIG9uIGlPUyA0IHRoYXQgY2F1c2VzIHNvbWUgbm9ybWFsIHRvdWNoIGV2ZW50cyB0byBoYXZlIHRoZSBzYW1lIGlkZW50aWZpZXIgYXMgYW5cblx0XHRcdFx0Ly8gaW1tZWRpYXRlbHkgcHJlY2VlZGluZyB0b3VjaCBldmVudCAoaXNzdWUgIzUyKSwgc28gdGhpcyBmaXggaXMgdW5hdmFpbGFibGUgb24gdGhhdCBwbGF0Zm9ybS5cblx0XHRcdFx0Ly8gSXNzdWUgMTIwOiB0b3VjaC5pZGVudGlmaWVyIGlzIDAgd2hlbiBDaHJvbWUgZGV2IHRvb2xzICdFbXVsYXRlIHRvdWNoIGV2ZW50cycgaXMgc2V0IHdpdGggYW4gaU9TIGRldmljZSBVQSBzdHJpbmcsXG5cdFx0XHRcdC8vIHdoaWNoIGNhdXNlcyBhbGwgdG91Y2ggZXZlbnRzIHRvIGJlIGlnbm9yZWQuIEFzIHRoaXMgYmxvY2sgb25seSBhcHBsaWVzIHRvIGlPUywgYW5kIGlPUyBpZGVudGlmaWVycyBhcmUgYWx3YXlzIGxvbmcsXG5cdFx0XHRcdC8vIHJhbmRvbSBpbnRlZ2VycywgaXQncyBzYWZlIHRvIHRvIGNvbnRpbnVlIGlmIHRoZSBpZGVudGlmaWVyIGlzIDAgaGVyZS5cblx0XHRcdFx0aWYgKHRvdWNoLmlkZW50aWZpZXIgJiYgdG91Y2guaWRlbnRpZmllciA9PT0gdGhpcy5sYXN0VG91Y2hJZGVudGlmaWVyKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLmxhc3RUb3VjaElkZW50aWZpZXIgPSB0b3VjaC5pZGVudGlmaWVyO1xuXG5cdFx0XHRcdC8vIElmIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBhIGNoaWxkIG9mIGEgc2Nyb2xsYWJsZSBsYXllciAodXNpbmcgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoKSBhbmQ6XG5cdFx0XHRcdC8vIDEpIHRoZSB1c2VyIGRvZXMgYSBmbGluZyBzY3JvbGwgb24gdGhlIHNjcm9sbGFibGUgbGF5ZXJcblx0XHRcdFx0Ly8gMikgdGhlIHVzZXIgc3RvcHMgdGhlIGZsaW5nIHNjcm9sbCB3aXRoIGFub3RoZXIgdGFwXG5cdFx0XHRcdC8vIHRoZW4gdGhlIGV2ZW50LnRhcmdldCBvZiB0aGUgbGFzdCAndG91Y2hlbmQnIGV2ZW50IHdpbGwgYmUgdGhlIGVsZW1lbnQgdGhhdCB3YXMgdW5kZXIgdGhlIHVzZXIncyBmaW5nZXJcblx0XHRcdFx0Ly8gd2hlbiB0aGUgZmxpbmcgc2Nyb2xsIHdhcyBzdGFydGVkLCBjYXVzaW5nIEZhc3RDbGljayB0byBzZW5kIGEgY2xpY2sgZXZlbnQgdG8gdGhhdCBsYXllciAtIHVubGVzcyBhIGNoZWNrXG5cdFx0XHRcdC8vIGlzIG1hZGUgdG8gZW5zdXJlIHRoYXQgYSBwYXJlbnQgbGF5ZXIgd2FzIG5vdCBzY3JvbGxlZCBiZWZvcmUgc2VuZGluZyBhIHN5bnRoZXRpYyBjbGljayAoaXNzdWUgIzQyKS5cblx0XHRcdFx0dGhpcy51cGRhdGVTY3JvbGxQYXJlbnQodGFyZ2V0RWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gdHJ1ZTtcblx0XHR0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCA9IGV2ZW50LnRpbWVTdGFtcDtcblx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSB0YXJnZXRFbGVtZW50O1xuXG5cdFx0dGhpcy50b3VjaFN0YXJ0WCA9IHRvdWNoLnBhZ2VYO1xuXHRcdHRoaXMudG91Y2hTdGFydFkgPSB0b3VjaC5wYWdlWTtcblxuXHRcdC8vIFByZXZlbnQgcGhhbnRvbSBjbGlja3Mgb24gZmFzdCBkb3VibGUtdGFwIChpc3N1ZSAjMzYpXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLmxhc3RDbGlja1RpbWUpIDwgdGhpcy50YXBEZWxheSAmJiAoZXZlbnQudGltZVN0YW1wIC0gdGhpcy5sYXN0Q2xpY2tUaW1lKSA+IC0xKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEJhc2VkIG9uIGEgdG91Y2htb3ZlIGV2ZW50IG9iamVjdCwgY2hlY2sgd2hldGhlciB0aGUgdG91Y2ggaGFzIG1vdmVkIHBhc3QgYSBib3VuZGFyeSBzaW5jZSBpdCBzdGFydGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUudG91Y2hIYXNNb3ZlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0sIGJvdW5kYXJ5ID0gdGhpcy50b3VjaEJvdW5kYXJ5O1xuXG5cdFx0aWYgKE1hdGguYWJzKHRvdWNoLnBhZ2VYIC0gdGhpcy50b3VjaFN0YXJ0WCkgPiBib3VuZGFyeSB8fCBNYXRoLmFicyh0b3VjaC5wYWdlWSAtIHRoaXMudG91Y2hTdGFydFkpID4gYm91bmRhcnkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgdGhlIGxhc3QgcG9zaXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYgKCF0aGlzLnRyYWNraW5nQ2xpY2spIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSB0b3VjaCBoYXMgbW92ZWQsIGNhbmNlbCB0aGUgY2xpY2sgdHJhY2tpbmdcblx0XHRpZiAodGhpcy50YXJnZXRFbGVtZW50ICE9PSB0aGlzLmdldFRhcmdldEVsZW1lbnRGcm9tRXZlbnRUYXJnZXQoZXZlbnQudGFyZ2V0KSB8fCB0aGlzLnRvdWNoSGFzTW92ZWQoZXZlbnQpKSB7XG5cdFx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblxuXHQvKipcblx0ICogQXR0ZW1wdCB0byBmaW5kIHRoZSBsYWJlbGxlZCBjb250cm9sIGZvciB0aGUgZ2l2ZW4gbGFiZWwgZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxIVE1MTGFiZWxFbGVtZW50fSBsYWJlbEVsZW1lbnRcblx0ICogQHJldHVybnMge0VsZW1lbnR8bnVsbH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZmluZENvbnRyb2wgPSBmdW5jdGlvbihsYWJlbEVsZW1lbnQpIHtcblxuXHRcdC8vIEZhc3QgcGF0aCBmb3IgbmV3ZXIgYnJvd3NlcnMgc3VwcG9ydGluZyB0aGUgSFRNTDUgY29udHJvbCBhdHRyaWJ1dGVcblx0XHRpZiAobGFiZWxFbGVtZW50LmNvbnRyb2wgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIGxhYmVsRWxlbWVudC5jb250cm9sO1xuXHRcdH1cblxuXHRcdC8vIEFsbCBicm93c2VycyB1bmRlciB0ZXN0IHRoYXQgc3VwcG9ydCB0b3VjaCBldmVudHMgYWxzbyBzdXBwb3J0IHRoZSBIVE1MNSBodG1sRm9yIGF0dHJpYnV0ZVxuXHRcdGlmIChsYWJlbEVsZW1lbnQuaHRtbEZvcikge1xuXHRcdFx0cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGxhYmVsRWxlbWVudC5odG1sRm9yKTtcblx0XHR9XG5cblx0XHQvLyBJZiBubyBmb3IgYXR0cmlidXRlIGV4aXN0cywgYXR0ZW1wdCB0byByZXRyaWV2ZSB0aGUgZmlyc3QgbGFiZWxsYWJsZSBkZXNjZW5kYW50IGVsZW1lbnRcblx0XHQvLyB0aGUgbGlzdCBvZiB3aGljaCBpcyBkZWZpbmVkIGhlcmU6IGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw1L2Zvcm1zLmh0bWwjY2F0ZWdvcnktbGFiZWxcblx0XHRyZXR1cm4gbGFiZWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbiwgaW5wdXQ6bm90KFt0eXBlPWhpZGRlbl0pLCBrZXlnZW4sIG1ldGVyLCBvdXRwdXQsIHByb2dyZXNzLCBzZWxlY3QsIHRleHRhcmVhJyk7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gdG91Y2ggZW5kLCBkZXRlcm1pbmUgd2hldGhlciB0byBzZW5kIGEgY2xpY2sgZXZlbnQgYXQgb25jZS5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uVG91Y2hFbmQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBmb3JFbGVtZW50LCB0cmFja2luZ0NsaWNrU3RhcnQsIHRhcmdldFRhZ05hbWUsIHNjcm9sbFBhcmVudCwgdG91Y2gsIHRhcmdldEVsZW1lbnQgPSB0aGlzLnRhcmdldEVsZW1lbnQ7XG5cblx0XHRpZiAoIXRoaXMudHJhY2tpbmdDbGljaykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gUHJldmVudCBwaGFudG9tIGNsaWNrcyBvbiBmYXN0IGRvdWJsZS10YXAgKGlzc3VlICMzNilcblx0XHRpZiAoKGV2ZW50LnRpbWVTdGFtcCAtIHRoaXMubGFzdENsaWNrVGltZSkgPCB0aGlzLnRhcERlbGF5ICYmIChldmVudC50aW1lU3RhbXAgLSB0aGlzLmxhc3RDbGlja1RpbWUpID4gLTEpIHtcblx0XHRcdHRoaXMuY2FuY2VsTmV4dENsaWNrID0gdHJ1ZTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICgoZXZlbnQudGltZVN0YW1wIC0gdGhpcy50cmFja2luZ0NsaWNrU3RhcnQpID4gdGhpcy50YXBUaW1lb3V0KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBSZXNldCB0byBwcmV2ZW50IHdyb25nIGNsaWNrIGNhbmNlbCBvbiBpbnB1dCAoaXNzdWUgIzE1NikuXG5cdFx0dGhpcy5jYW5jZWxOZXh0Q2xpY2sgPSBmYWxzZTtcblxuXHRcdHRoaXMubGFzdENsaWNrVGltZSA9IGV2ZW50LnRpbWVTdGFtcDtcblxuXHRcdHRyYWNraW5nQ2xpY2tTdGFydCA9IHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0O1xuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0ID0gMDtcblxuXHRcdC8vIE9uIHNvbWUgaU9TIGRldmljZXMsIHRoZSB0YXJnZXRFbGVtZW50IHN1cHBsaWVkIHdpdGggdGhlIGV2ZW50IGlzIGludmFsaWQgaWYgdGhlIGxheWVyXG5cdFx0Ly8gaXMgcGVyZm9ybWluZyBhIHRyYW5zaXRpb24gb3Igc2Nyb2xsLCBhbmQgaGFzIHRvIGJlIHJlLWRldGVjdGVkIG1hbnVhbGx5LiBOb3RlIHRoYXRcblx0XHQvLyBmb3IgdGhpcyB0byBmdW5jdGlvbiBjb3JyZWN0bHksIGl0IG11c3QgYmUgY2FsbGVkICphZnRlciogdGhlIGV2ZW50IHRhcmdldCBpcyBjaGVja2VkIVxuXHRcdC8vIFNlZSBpc3N1ZSAjNTc7IGFsc28gZmlsZWQgYXMgcmRhcjovLzEzMDQ4NTg5IC5cblx0XHRpZiAoZGV2aWNlSXNJT1NXaXRoQmFkVGFyZ2V0KSB7XG5cdFx0XHR0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuXG5cdFx0XHQvLyBJbiBjZXJ0YWluIGNhc2VzIGFyZ3VtZW50cyBvZiBlbGVtZW50RnJvbVBvaW50IGNhbiBiZSBuZWdhdGl2ZSwgc28gcHJldmVudCBzZXR0aW5nIHRhcmdldEVsZW1lbnQgdG8gbnVsbFxuXHRcdFx0dGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQodG91Y2gucGFnZVggLSB3aW5kb3cucGFnZVhPZmZzZXQsIHRvdWNoLnBhZ2VZIC0gd2luZG93LnBhZ2VZT2Zmc2V0KSB8fCB0YXJnZXRFbGVtZW50O1xuXHRcdFx0dGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQgPSB0aGlzLnRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50O1xuXHRcdH1cblxuXHRcdHRhcmdldFRhZ05hbWUgPSB0YXJnZXRFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRpZiAodGFyZ2V0VGFnTmFtZSA9PT0gJ2xhYmVsJykge1xuXHRcdFx0Zm9yRWxlbWVudCA9IHRoaXMuZmluZENvbnRyb2wodGFyZ2V0RWxlbWVudCk7XG5cdFx0XHRpZiAoZm9yRWxlbWVudCkge1xuXHRcdFx0XHR0aGlzLmZvY3VzKHRhcmdldEVsZW1lbnQpO1xuXHRcdFx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFyZ2V0RWxlbWVudCA9IGZvckVsZW1lbnQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0aGlzLm5lZWRzRm9jdXModGFyZ2V0RWxlbWVudCkpIHtcblxuXHRcdFx0Ly8gQ2FzZSAxOiBJZiB0aGUgdG91Y2ggc3RhcnRlZCBhIHdoaWxlIGFnbyAoYmVzdCBndWVzcyBpcyAxMDBtcyBiYXNlZCBvbiB0ZXN0cyBmb3IgaXNzdWUgIzM2KSB0aGVuIGZvY3VzIHdpbGwgYmUgdHJpZ2dlcmVkIGFueXdheS4gUmV0dXJuIGVhcmx5IGFuZCB1bnNldCB0aGUgdGFyZ2V0IGVsZW1lbnQgcmVmZXJlbmNlIHNvIHRoYXQgdGhlIHN1YnNlcXVlbnQgY2xpY2sgd2lsbCBiZSBhbGxvd2VkIHRocm91Z2guXG5cdFx0XHQvLyBDYXNlIDI6IFdpdGhvdXQgdGhpcyBleGNlcHRpb24gZm9yIGlucHV0IGVsZW1lbnRzIHRhcHBlZCB3aGVuIHRoZSBkb2N1bWVudCBpcyBjb250YWluZWQgaW4gYW4gaWZyYW1lLCB0aGVuIGFueSBpbnB1dHRlZCB0ZXh0IHdvbid0IGJlIHZpc2libGUgZXZlbiB0aG91Z2ggdGhlIHZhbHVlIGF0dHJpYnV0ZSBpcyB1cGRhdGVkIGFzIHRoZSB1c2VyIHR5cGVzIChpc3N1ZSAjMzcpLlxuXHRcdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0cmFja2luZ0NsaWNrU3RhcnQpID4gMTAwIHx8IChkZXZpY2VJc0lPUyAmJiB3aW5kb3cudG9wICE9PSB3aW5kb3cgJiYgdGFyZ2V0VGFnTmFtZSA9PT0gJ2lucHV0JykpIHtcblx0XHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmZvY3VzKHRhcmdldEVsZW1lbnQpO1xuXHRcdFx0dGhpcy5zZW5kQ2xpY2sodGFyZ2V0RWxlbWVudCwgZXZlbnQpO1xuXG5cdFx0XHQvLyBTZWxlY3QgZWxlbWVudHMgbmVlZCB0aGUgZXZlbnQgdG8gZ28gdGhyb3VnaCBvbiBpT1MgNCwgb3RoZXJ3aXNlIHRoZSBzZWxlY3RvciBtZW51IHdvbid0IG9wZW4uXG5cdFx0XHQvLyBBbHNvIHRoaXMgYnJlYWtzIG9wZW5pbmcgc2VsZWN0cyB3aGVuIFZvaWNlT3ZlciBpcyBhY3RpdmUgb24gaU9TNiwgaU9TNyAoYW5kIHBvc3NpYmx5IG90aGVycylcblx0XHRcdGlmICghZGV2aWNlSXNJT1M0IHx8IHRhcmdldFRhZ05hbWUgIT09ICdzZWxlY3QnKSB7XG5cdFx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAoZGV2aWNlSXNJT1MgJiYgIWRldmljZUlzSU9TNCkge1xuXG5cdFx0XHQvLyBEb24ndCBzZW5kIGEgc3ludGhldGljIGNsaWNrIGV2ZW50IGlmIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBjb250YWluZWQgd2l0aGluIGEgcGFyZW50IGxheWVyIHRoYXQgd2FzIHNjcm9sbGVkXG5cdFx0XHQvLyBhbmQgdGhpcyB0YXAgaXMgYmVpbmcgdXNlZCB0byBzdG9wIHRoZSBzY3JvbGxpbmcgKHVzdWFsbHkgaW5pdGlhdGVkIGJ5IGEgZmxpbmcgLSBpc3N1ZSAjNDIpLlxuXHRcdFx0c2Nyb2xsUGFyZW50ID0gdGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQ7XG5cdFx0XHRpZiAoc2Nyb2xsUGFyZW50ICYmIHNjcm9sbFBhcmVudC5mYXN0Q2xpY2tMYXN0U2Nyb2xsVG9wICE9PSBzY3JvbGxQYXJlbnQuc2Nyb2xsVG9wKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFByZXZlbnQgdGhlIGFjdHVhbCBjbGljayBmcm9tIGdvaW5nIHRob3VnaCAtIHVubGVzcyB0aGUgdGFyZ2V0IG5vZGUgaXMgbWFya2VkIGFzIHJlcXVpcmluZ1xuXHRcdC8vIHJlYWwgY2xpY2tzIG9yIGlmIGl0IGlzIGluIHRoZSB3aGl0ZWxpc3QgaW4gd2hpY2ggY2FzZSBvbmx5IG5vbi1wcm9ncmFtbWF0aWMgY2xpY2tzIGFyZSBwZXJtaXR0ZWQuXG5cdFx0aWYgKCF0aGlzLm5lZWRzQ2xpY2sodGFyZ2V0RWxlbWVudCkpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLnNlbmRDbGljayh0YXJnZXRFbGVtZW50LCBldmVudCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIE9uIHRvdWNoIGNhbmNlbCwgc3RvcCB0cmFja2luZyB0aGUgY2xpY2suXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoQ2FuY2VsID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgbW91c2UgZXZlbnRzIHdoaWNoIHNob3VsZCBiZSBwZXJtaXR0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vbk1vdXNlID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHRcdC8vIElmIGEgdGFyZ2V0IGVsZW1lbnQgd2FzIG5ldmVyIHNldCAoYmVjYXVzZSBhIHRvdWNoIGV2ZW50IHdhcyBuZXZlciBmaXJlZCkgYWxsb3cgdGhlIGV2ZW50XG5cdFx0aWYgKCF0aGlzLnRhcmdldEVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGlmIChldmVudC5mb3J3YXJkZWRUb3VjaEV2ZW50KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBQcm9ncmFtbWF0aWNhbGx5IGdlbmVyYXRlZCBldmVudHMgdGFyZ2V0aW5nIGEgc3BlY2lmaWMgZWxlbWVudCBzaG91bGQgYmUgcGVybWl0dGVkXG5cdFx0aWYgKCFldmVudC5jYW5jZWxhYmxlKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBEZXJpdmUgYW5kIGNoZWNrIHRoZSB0YXJnZXQgZWxlbWVudCB0byBzZWUgd2hldGhlciB0aGUgbW91c2UgZXZlbnQgbmVlZHMgdG8gYmUgcGVybWl0dGVkO1xuXHRcdC8vIHVubGVzcyBleHBsaWNpdGx5IGVuYWJsZWQsIHByZXZlbnQgbm9uLXRvdWNoIGNsaWNrIGV2ZW50cyBmcm9tIHRyaWdnZXJpbmcgYWN0aW9ucyxcblx0XHQvLyB0byBwcmV2ZW50IGdob3N0L2RvdWJsZWNsaWNrcy5cblx0XHRpZiAoIXRoaXMubmVlZHNDbGljayh0aGlzLnRhcmdldEVsZW1lbnQpIHx8IHRoaXMuY2FuY2VsTmV4dENsaWNrKSB7XG5cblx0XHRcdC8vIFByZXZlbnQgYW55IHVzZXItYWRkZWQgbGlzdGVuZXJzIGRlY2xhcmVkIG9uIEZhc3RDbGljayBlbGVtZW50IGZyb20gYmVpbmcgZmlyZWQuXG5cdFx0XHRpZiAoZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKSB7XG5cdFx0XHRcdGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBQYXJ0IG9mIHRoZSBoYWNrIGZvciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgRXZlbnQjc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIChlLmcuIEFuZHJvaWQgMilcblx0XHRcdFx0ZXZlbnQucHJvcGFnYXRpb25TdG9wcGVkID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2FuY2VsIHRoZSBldmVudFxuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgdGhlIG1vdXNlIGV2ZW50IGlzIHBlcm1pdHRlZCwgcmV0dXJuIHRydWUgZm9yIHRoZSBhY3Rpb24gdG8gZ28gdGhyb3VnaC5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBPbiBhY3R1YWwgY2xpY2tzLCBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgdG91Y2gtZ2VuZXJhdGVkIGNsaWNrLCBhIGNsaWNrIGFjdGlvbiBvY2N1cnJpbmdcblx0ICogbmF0dXJhbGx5IGFmdGVyIGEgZGVsYXkgYWZ0ZXIgYSB0b3VjaCAod2hpY2ggbmVlZHMgdG8gYmUgY2FuY2VsbGVkIHRvIGF2b2lkIGR1cGxpY2F0aW9uKSwgb3Jcblx0ICogYW4gYWN0dWFsIGNsaWNrIHdoaWNoIHNob3VsZCBiZSBwZXJtaXR0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vbkNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgcGVybWl0dGVkO1xuXG5cdFx0Ly8gSXQncyBwb3NzaWJsZSBmb3IgYW5vdGhlciBGYXN0Q2xpY2stbGlrZSBsaWJyYXJ5IGRlbGl2ZXJlZCB3aXRoIHRoaXJkLXBhcnR5IGNvZGUgdG8gZmlyZSBhIGNsaWNrIGV2ZW50IGJlZm9yZSBGYXN0Q2xpY2sgZG9lcyAoaXNzdWUgIzQ0KS4gSW4gdGhhdCBjYXNlLCBzZXQgdGhlIGNsaWNrLXRyYWNraW5nIGZsYWcgYmFjayB0byBmYWxzZSBhbmQgcmV0dXJuIGVhcmx5LiBUaGlzIHdpbGwgY2F1c2Ugb25Ub3VjaEVuZCB0byByZXR1cm4gZWFybHkuXG5cdFx0aWYgKHRoaXMudHJhY2tpbmdDbGljaykge1xuXHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gVmVyeSBvZGQgYmVoYXZpb3VyIG9uIGlPUyAoaXNzdWUgIzE4KTogaWYgYSBzdWJtaXQgZWxlbWVudCBpcyBwcmVzZW50IGluc2lkZSBhIGZvcm0gYW5kIHRoZSB1c2VyIGhpdHMgZW50ZXIgaW4gdGhlIGlPUyBzaW11bGF0b3Igb3IgY2xpY2tzIHRoZSBHbyBidXR0b24gb24gdGhlIHBvcC11cCBPUyBrZXlib2FyZCB0aGUgYSBraW5kIG9mICdmYWtlJyBjbGljayBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aXRoIHRoZSBzdWJtaXQtdHlwZSBpbnB1dCBlbGVtZW50IGFzIHRoZSB0YXJnZXQuXG5cdFx0aWYgKGV2ZW50LnRhcmdldC50eXBlID09PSAnc3VibWl0JyAmJiBldmVudC5kZXRhaWwgPT09IDApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHBlcm1pdHRlZCA9IHRoaXMub25Nb3VzZShldmVudCk7XG5cblx0XHQvLyBPbmx5IHVuc2V0IHRhcmdldEVsZW1lbnQgaWYgdGhlIGNsaWNrIGlzIG5vdCBwZXJtaXR0ZWQuIFRoaXMgd2lsbCBlbnN1cmUgdGhhdCB0aGUgY2hlY2sgZm9yICF0YXJnZXRFbGVtZW50IGluIG9uTW91c2UgZmFpbHMgYW5kIHRoZSBicm93c2VyJ3MgY2xpY2sgZG9lc24ndCBnbyB0aHJvdWdoLlxuXHRcdGlmICghcGVybWl0dGVkKSB7XG5cdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdH1cblxuXHRcdC8vIElmIGNsaWNrcyBhcmUgcGVybWl0dGVkLCByZXR1cm4gdHJ1ZSBmb3IgdGhlIGFjdGlvbiB0byBnbyB0aHJvdWdoLlxuXHRcdHJldHVybiBwZXJtaXR0ZWQ7XG5cdH07XG5cblxuXHQvKipcblx0ICogUmVtb3ZlIGFsbCBGYXN0Q2xpY2sncyBldmVudCBsaXN0ZW5lcnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxheWVyID0gdGhpcy5sYXllcjtcblxuXHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2ssIHRydWUpO1xuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uVG91Y2hTdGFydCwgZmFsc2UpO1xuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Ub3VjaE1vdmUsIGZhbHNlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Ub3VjaEVuZCwgZmFsc2UpO1xuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5vblRvdWNoQ2FuY2VsLCBmYWxzZSk7XG5cdH07XG5cblxuXHQvKipcblx0ICogQ2hlY2sgd2hldGhlciBGYXN0Q2xpY2sgaXMgbmVlZGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGxheWVyIFRoZSBsYXllciB0byBsaXN0ZW4gb25cblx0ICovXG5cdEZhc3RDbGljay5ub3ROZWVkZWQgPSBmdW5jdGlvbihsYXllcikge1xuXHRcdHZhciBtZXRhVmlld3BvcnQ7XG5cdFx0dmFyIGNocm9tZVZlcnNpb247XG5cdFx0dmFyIGJsYWNrYmVycnlWZXJzaW9uO1xuXHRcdHZhciBmaXJlZm94VmVyc2lvbjtcblxuXHRcdC8vIERldmljZXMgdGhhdCBkb24ndCBzdXBwb3J0IHRvdWNoIGRvbid0IG5lZWQgRmFzdENsaWNrXG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cub250b3VjaHN0YXJ0ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gQ2hyb21lIHZlcnNpb24gLSB6ZXJvIGZvciBvdGhlciBicm93c2Vyc1xuXHRcdGNocm9tZVZlcnNpb24gPSArKC9DaHJvbWVcXC8oWzAtOV0rKS8uZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50KSB8fCBbLDBdKVsxXTtcblxuXHRcdGlmIChjaHJvbWVWZXJzaW9uKSB7XG5cblx0XHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdFx0bWV0YVZpZXdwb3J0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPXZpZXdwb3J0XScpO1xuXG5cdFx0XHRcdGlmIChtZXRhVmlld3BvcnQpIHtcblx0XHRcdFx0XHQvLyBDaHJvbWUgb24gQW5kcm9pZCB3aXRoIHVzZXItc2NhbGFibGU9XCJub1wiIGRvZXNuJ3QgbmVlZCBGYXN0Q2xpY2sgKGlzc3VlICM4OSlcblx0XHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0LmNvbnRlbnQuaW5kZXhPZigndXNlci1zY2FsYWJsZT1ubycpICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIENocm9tZSAzMiBhbmQgYWJvdmUgd2l0aCB3aWR0aD1kZXZpY2Utd2lkdGggb3IgbGVzcyBkb24ndCBuZWVkIEZhc3RDbGlja1xuXHRcdFx0XHRcdGlmIChjaHJvbWVWZXJzaW9uID4gMzEgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoIDw9IHdpbmRvdy5vdXRlcldpZHRoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gQ2hyb21lIGRlc2t0b3AgZG9lc24ndCBuZWVkIEZhc3RDbGljayAoaXNzdWUgIzE1KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGRldmljZUlzQmxhY2tCZXJyeTEwKSB7XG5cdFx0XHRibGFja2JlcnJ5VmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1ZlcnNpb25cXC8oWzAtOV0qKVxcLihbMC05XSopLyk7XG5cblx0XHRcdC8vIEJsYWNrQmVycnkgMTAuMysgZG9lcyBub3QgcmVxdWlyZSBGYXN0Y2xpY2sgbGlicmFyeS5cblx0XHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mdGxhYnMvZmFzdGNsaWNrL2lzc3Vlcy8yNTFcblx0XHRcdGlmIChibGFja2JlcnJ5VmVyc2lvblsxXSA+PSAxMCAmJiBibGFja2JlcnJ5VmVyc2lvblsyXSA+PSAzKSB7XG5cdFx0XHRcdG1ldGFWaWV3cG9ydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT12aWV3cG9ydF0nKTtcblxuXHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0KSB7XG5cdFx0XHRcdFx0Ly8gdXNlci1zY2FsYWJsZT1ubyBlbGltaW5hdGVzIGNsaWNrIGRlbGF5LlxuXHRcdFx0XHRcdGlmIChtZXRhVmlld3BvcnQuY29udGVudC5pbmRleE9mKCd1c2VyLXNjYWxhYmxlPW5vJykgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gd2lkdGg9ZGV2aWNlLXdpZHRoIChvciBsZXNzIHRoYW4gZGV2aWNlLXdpZHRoKSBlbGltaW5hdGVzIGNsaWNrIGRlbGF5LlxuXHRcdFx0XHRcdGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93Lm91dGVyV2lkdGgpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIElFMTAgd2l0aCAtbXMtdG91Y2gtYWN0aW9uOiBub25lIG9yIG1hbmlwdWxhdGlvbiwgd2hpY2ggZGlzYWJsZXMgZG91YmxlLXRhcC10by16b29tIChpc3N1ZSAjOTcpXG5cdFx0aWYgKGxheWVyLnN0eWxlLm1zVG91Y2hBY3Rpb24gPT09ICdub25lJyB8fCBsYXllci5zdHlsZS50b3VjaEFjdGlvbiA9PT0gJ21hbmlwdWxhdGlvbicpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIEZpcmVmb3ggdmVyc2lvbiAtIHplcm8gZm9yIG90aGVyIGJyb3dzZXJzXG5cdFx0ZmlyZWZveFZlcnNpb24gPSArKC9GaXJlZm94XFwvKFswLTldKykvLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgWywwXSlbMV07XG5cblx0XHRpZiAoZmlyZWZveFZlcnNpb24gPj0gMjcpIHtcblx0XHRcdC8vIEZpcmVmb3ggMjcrIGRvZXMgbm90IGhhdmUgdGFwIGRlbGF5IGlmIHRoZSBjb250ZW50IGlzIG5vdCB6b29tYWJsZSAtIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTkyMjg5NlxuXG5cdFx0XHRtZXRhVmlld3BvcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9dmlld3BvcnRdJyk7XG5cdFx0XHRpZiAobWV0YVZpZXdwb3J0ICYmIChtZXRhVmlld3BvcnQuY29udGVudC5pbmRleE9mKCd1c2VyLXNjYWxhYmxlPW5vJykgIT09IC0xIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCA8PSB3aW5kb3cub3V0ZXJXaWR0aCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSUUxMTogcHJlZml4ZWQgLW1zLXRvdWNoLWFjdGlvbiBpcyBubyBsb25nZXIgc3VwcG9ydGVkIGFuZCBpdCdzIHJlY29tZW5kZWQgdG8gdXNlIG5vbi1wcmVmaXhlZCB2ZXJzaW9uXG5cdFx0Ly8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L3dpbmRvd3MvYXBwcy9IaDc2NzMxMy5hc3B4XG5cdFx0aWYgKGxheWVyLnN0eWxlLnRvdWNoQWN0aW9uID09PSAnbm9uZScgfHwgbGF5ZXIuc3R5bGUudG91Y2hBY3Rpb24gPT09ICdtYW5pcHVsYXRpb24nKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblxuXHQvKipcblx0ICogRmFjdG9yeSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgRmFzdENsaWNrIG9iamVjdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGxheWVyIFRoZSBsYXllciB0byBsaXN0ZW4gb25cblx0ICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdHNcblx0ICovXG5cdEZhc3RDbGljay5hdHRhY2ggPSBmdW5jdGlvbihsYXllciwgb3B0aW9ucykge1xuXHRcdHJldHVybiBuZXcgRmFzdENsaWNrKGxheWVyLCBvcHRpb25zKTtcblx0fTtcblxuXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIEZhc3RDbGljaztcblx0XHR9KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gRmFzdENsaWNrLmF0dGFjaDtcblx0XHRtb2R1bGUuZXhwb3J0cy5GYXN0Q2xpY2sgPSBGYXN0Q2xpY2s7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LkZhc3RDbGljayA9IEZhc3RDbGljaztcblx0fVxufSgpKTtcbiIsIi8vIEZvciBAb25zZW51aS9jdXN0b20tZWxlbWVudHNcbmlmICh3aW5kb3cuY3VzdG9tRWxlbWVudHMpIHsgLy8gZXZlbiBpZiBuYXRpdmUgQ0UxIGltcGwgZXhpc3RzLCB1c2UgcG9seWZpbGxcbiAgICB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZm9yY2VQb2x5ZmlsbCA9IHRydWU7XG59XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZiAodHlwZW9mIF9fZyA9PSAnbnVtYmVyJykgX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4iLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi41LjEnIH07XG5pZiAodHlwZW9mIF9fZSA9PSAnbnVtYmVyJykgX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG4iLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBTKSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZiAoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICghUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGRQID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcbiIsInZhciBpZCA9IDA7XG52YXIgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgU1JDID0gcmVxdWlyZSgnLi9fdWlkJykoJ3NyYycpO1xudmFyIFRPX1NUUklORyA9ICd0b1N0cmluZyc7XG52YXIgJHRvU3RyaW5nID0gRnVuY3Rpb25bVE9fU1RSSU5HXTtcbnZhciBUUEwgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbnJlcXVpcmUoJy4vX2NvcmUnKS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiAkdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWwsIHNhZmUpIHtcbiAgdmFyIGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsID09ICdmdW5jdGlvbic7XG4gIGlmIChpc0Z1bmN0aW9uKSBoYXModmFsLCAnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIGlmIChPW2tleV0gPT09IHZhbCkgcmV0dXJuO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgU1JDKSB8fCBoaWRlKHZhbCwgU1JDLCBPW2tleV0gPyAnJyArIE9ba2V5XSA6IFRQTC5qb2luKFN0cmluZyhrZXkpKSk7XG4gIGlmIChPID09PSBnbG9iYWwpIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSBpZiAoIXNhZmUpIHtcbiAgICBkZWxldGUgT1trZXldO1xuICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICB9IGVsc2UgaWYgKE9ba2V5XSkge1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIHtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfVxuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsIFRPX1NUUklORywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIHRoYXQsIGxlbmd0aCkge1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZiAodGhhdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZm47XG4gIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgvKiAuLi5hcmdzICovKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgY3R4ID0gcmVxdWlyZSgnLi9fY3R4Jyk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHNvdXJjZSkge1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRjtcbiAgdmFyIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0Lkc7XG4gIHZhciBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TO1xuICB2YXIgSVNfUFJPVE8gPSB0eXBlICYgJGV4cG9ydC5QO1xuICB2YXIgSVNfQklORCA9IHR5cGUgJiAkZXhwb3J0LkI7XG4gIHZhciB0YXJnZXQgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gfHwgKGdsb2JhbFtuYW1lXSA9IHt9KSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV07XG4gIHZhciBleHBvcnRzID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XG4gIHZhciBleHBQcm90byA9IGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pO1xuICB2YXIga2V5LCBvd24sIG91dCwgZXhwO1xuICBpZiAoSVNfR0xPQkFMKSBzb3VyY2UgPSBuYW1lO1xuICBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGV4cCA9IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZiAodGFyZ2V0KSByZWRlZmluZSh0YXJnZXQsIGtleSwgb3V0LCB0eXBlICYgJGV4cG9ydC5VKTtcbiAgICAvLyBleHBvcnRcbiAgICBpZiAoZXhwb3J0c1trZXldICE9IG91dCkgaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XG4gICAgaWYgKElTX1BST1RPICYmIGV4cFByb3RvW2tleV0gIT0gb3V0KSBleHBQcm90b1trZXldID0gb3V0O1xuICB9XG59O1xuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0O1xuIiwiZXhwb3J0cy5mID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG4iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG4iLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59O1xuIiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChpdCA9PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbiIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG4iLCJ2YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpO1xudmFyIGdPUEQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZ09QRCA6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKSB7XG4gIE8gPSB0b0lPYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBnT1BEKE8sIFApO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKGhhcyhPLCBQKSkgcmV0dXJuIGNyZWF0ZURlc2MoIXBJRS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsIi8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgY2hlY2sgPSBmdW5jdGlvbiAoTywgcHJvdG8pIHtcbiAgYW5PYmplY3QoTyk7XG4gIGlmICghaXNPYmplY3QocHJvdG8pICYmIHByb3RvICE9PSBudWxsKSB0aHJvdyBUeXBlRXJyb3IocHJvdG8gKyBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XG59O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8ICgnX19wcm90b19fJyBpbiB7fSA/IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBmdW5jdGlvbiAodGVzdCwgYnVnZ3ksIHNldCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi9fY3R4JykoRnVuY3Rpb24uY2FsbCwgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKS5mKE9iamVjdC5wcm90b3R5cGUsICdfX3Byb3RvX18nKS5zZXQsIDIpO1xuICAgICAgICBzZXQodGVzdCwgW10pO1xuICAgICAgICBidWdneSA9ICEodGVzdCBpbnN0YW5jZW9mIEFycmF5KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgYnVnZ3kgPSB0cnVlOyB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pIHtcbiAgICAgICAgY2hlY2soTywgcHJvdG8pO1xuICAgICAgICBpZiAoYnVnZ3kpIE8uX19wcm90b19fID0gcHJvdG87XG4gICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcbiAgICAgICAgcmV0dXJuIE87XG4gICAgICB9O1xuICAgIH0oe30sIGZhbHNlKSA6IHVuZGVmaW5lZCksXG4gIGNoZWNrOiBjaGVja1xufTtcbiIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7IHNldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuL19zZXQtcHJvdG8nKS5zZXQgfSk7XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0LnNldFByb3RvdHlwZU9mO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nO1xudmFyIHN0b3JlID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTtcbiIsInZhciBzdG9yZSA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbnZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2w7XG52YXIgVVNFX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcblxudmFyICRleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBVU0VfU1lNQk9MICYmIFN5bWJvbFtuYW1lXSB8fCAoVVNFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcblxuJGV4cG9ydHMuc3RvcmUgPSBzdG9yZTtcbiIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG4vLyBFUzMgd3JvbmcgaGVyZVxudmFyIEFSRyA9IGNvZihmdW5jdGlvbiAoKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL19jbGFzc29mJyk7XG52YXIgdGVzdCA9IHt9O1xudGVzdFtyZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKV0gPSAneic7XG5pZiAodGVzdCArICcnICE9ICdbb2JqZWN0IHpdJykge1xuICByZXF1aXJlKCcuL19yZWRlZmluZScpKE9iamVjdC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiAnW29iamVjdCAnICsgY2xhc3NvZih0aGlzKSArICddJztcbiAgfSwgdHJ1ZSk7XG59XG4iLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTtcbiIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbi8vIHRydWUgIC0+IFN0cmluZyNhdFxuLy8gZmFsc2UgLT4gU3RyaW5nI2NvZGVQb2ludEF0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUT19TVFJJTkcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0aGF0LCBwb3MpIHtcbiAgICB2YXIgcyA9IFN0cmluZyhkZWZpbmVkKHRoYXQpKTtcbiAgICB2YXIgaSA9IHRvSW50ZWdlcihwb3MpO1xuICAgIHZhciBsID0gcy5sZW5ndGg7XG4gICAgdmFyIGEsIGI7XG4gICAgaWYgKGkgPCAwIHx8IGkgPj0gbCkgcmV0dXJuIFRPX1NUUklORyA/ICcnIDogdW5kZWZpbmVkO1xuICAgIGEgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbCB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcbiAgICAgID8gVE9fU1RSSU5HID8gcy5jaGFyQXQoaSkgOiBhXG4gICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZhbHNlO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7fTtcbiIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcbiAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbn07XG4iLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4vX3RvLWFic29sdXRlLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0lPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTykge1xuICAgICAgaWYgKE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcbiIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciBhcnJheUluZGV4T2YgPSByZXF1aXJlKCcuL19hcnJheS1pbmNsdWRlcycpKGZhbHNlKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lcykge1xuICB2YXIgTyA9IHRvSU9iamVjdChvYmplY3QpO1xuICB2YXIgaSA9IDA7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGtleTtcbiAgZm9yIChrZXkgaW4gTykgaWYgKGtleSAhPSBJRV9QUk9UTykgaGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkgaWYgKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSkge1xuICAgIH5hcnJheUluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsdG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZidcbikuc3BsaXQoJywnKTtcbiIsIi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG4iLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBnZXRLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgdmFyIFA7XG4gIHdoaWxlIChsZW5ndGggPiBpKSBkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuIiwiLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBkUHMgPSByZXF1aXJlKCcuL19vYmplY3QtZHBzJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJyk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG52YXIgRW1wdHkgPSBmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH07XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBmYWtlIGBudWxsYCBwcm90b3R5cGU6IHVzZSBpZnJhbWUgT2JqZWN0IHdpdGggY2xlYXJlZCBwcm90b3R5cGVcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24gKCkge1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gcmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdpZnJhbWUnKTtcbiAgdmFyIGkgPSBlbnVtQnVnS2V5cy5sZW5ndGg7XG4gIHZhciBsdCA9ICc8JztcbiAgdmFyIGd0ID0gJz4nO1xuICB2YXIgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICByZXF1aXJlKCcuL19odG1sJykuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0Oic7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2NyaXB0LXVybFxuICAvLyBjcmVhdGVEaWN0ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuT2JqZWN0O1xuICAvLyBodG1sLnJlbW92ZUNoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUobHQgKyAnc2NyaXB0JyArIGd0ICsgJ2RvY3VtZW50LkY9T2JqZWN0JyArIGx0ICsgJy9zY3JpcHQnICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUgKGktLSkgZGVsZXRlIGNyZWF0ZURpY3RbUFJPVE9UWVBFXVtlbnVtQnVnS2V5c1tpXV07XG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKE8gIT09IG51bGwpIHtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5KCk7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IG51bGw7XG4gICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBwb2x5ZmlsbFxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xuICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xuICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZFBzKHJlc3VsdCwgUHJvcGVydGllcyk7XG59O1xuIiwidmFyIGRlZiA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCB0YWcsIHN0YXQpIHtcbiAgaWYgKGl0ICYmICFoYXMoaXQgPSBzdGF0ID8gaXQgOiBpdC5wcm90b3R5cGUsIFRBRykpIGRlZihpdCwgVEFHLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZyB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgY3JlYXRlID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpO1xudmFyIGRlc2NyaXB0b3IgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG5cbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuL19oaWRlJykoSXRlcmF0b3JQcm90b3R5cGUsIHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpIHtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7IG5leHQ6IGRlc2NyaXB0b3IoMSwgbmV4dCkgfSk7XG4gIHNldFRvU3RyaW5nVGFnKENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xufTtcbiIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuIiwiLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xudmFyIE9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gKE8pIHtcbiAgTyA9IHRvT2JqZWN0KE8pO1xuICBpZiAoaGFzKE8sIElFX1BST1RPKSkgcmV0dXJuIE9bSUVfUFJPVE9dO1xuICBpZiAodHlwZW9mIE8uY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgTElCUkFSWSA9IHJlcXVpcmUoJy4vX2xpYnJhcnknKTtcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG52YXIgJGl0ZXJDcmVhdGUgPSByZXF1aXJlKCcuL19pdGVyLWNyZWF0ZScpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4vX29iamVjdC1ncG8nKTtcbnZhciBJVEVSQVRPUiA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpO1xudmFyIEJVR0dZID0gIShbXS5rZXlzICYmICduZXh0JyBpbiBbXS5rZXlzKCkpOyAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG52YXIgRkZfSVRFUkFUT1IgPSAnQEBpdGVyYXRvcic7XG52YXIgS0VZUyA9ICdrZXlzJztcbnZhciBWQUxVRVMgPSAndmFsdWVzJztcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChCYXNlLCBOQU1FLCBDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VULCBGT1JDRUQpIHtcbiAgJGl0ZXJDcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICB2YXIgZ2V0TWV0aG9kID0gZnVuY3Rpb24gKGtpbmQpIHtcbiAgICBpZiAoIUJVR0dZICYmIGtpbmQgaW4gcHJvdG8pIHJldHVybiBwcm90b1traW5kXTtcbiAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKSB7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgICBjYXNlIFZBTFVFUzogcmV0dXJuIGZ1bmN0aW9uIHZhbHVlcygpIHsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCkgeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICB9O1xuICB2YXIgVEFHID0gTkFNRSArICcgSXRlcmF0b3InO1xuICB2YXIgREVGX1ZBTFVFUyA9IERFRkFVTFQgPT0gVkFMVUVTO1xuICB2YXIgVkFMVUVTX0JVRyA9IGZhbHNlO1xuICB2YXIgcHJvdG8gPSBCYXNlLnByb3RvdHlwZTtcbiAgdmFyICRuYXRpdmUgPSBwcm90b1tJVEVSQVRPUl0gfHwgcHJvdG9bRkZfSVRFUkFUT1JdIHx8IERFRkFVTFQgJiYgcHJvdG9bREVGQVVMVF07XG4gIHZhciAkZGVmYXVsdCA9ICRuYXRpdmUgfHwgZ2V0TWV0aG9kKERFRkFVTFQpO1xuICB2YXIgJGVudHJpZXMgPSBERUZBVUxUID8gIURFRl9WQUxVRVMgPyAkZGVmYXVsdCA6IGdldE1ldGhvZCgnZW50cmllcycpIDogdW5kZWZpbmVkO1xuICB2YXIgJGFueU5hdGl2ZSA9IE5BTUUgPT0gJ0FycmF5JyA/IHByb3RvLmVudHJpZXMgfHwgJG5hdGl2ZSA6ICRuYXRpdmU7XG4gIHZhciBtZXRob2RzLCBrZXksIEl0ZXJhdG9yUHJvdG90eXBlO1xuICAvLyBGaXggbmF0aXZlXG4gIGlmICgkYW55TmF0aXZlKSB7XG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90b3R5cGVPZigkYW55TmF0aXZlLmNhbGwobmV3IEJhc2UoKSkpO1xuICAgIGlmIChJdGVyYXRvclByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSAmJiBJdGVyYXRvclByb3RvdHlwZS5uZXh0KSB7XG4gICAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgICBzZXRUb1N0cmluZ1RhZyhJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcbiAgICAgIC8vIGZpeCBmb3Igc29tZSBvbGQgZW5naW5lc1xuICAgICAgaWYgKCFMSUJSQVJZICYmICFoYXMoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SKSkgaGlkZShJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IsIHJldHVyblRoaXMpO1xuICAgIH1cbiAgfVxuICAvLyBmaXggQXJyYXkje3ZhbHVlcywgQEBpdGVyYXRvcn0ubmFtZSBpbiBWOCAvIEZGXG4gIGlmIChERUZfVkFMVUVTICYmICRuYXRpdmUgJiYgJG5hdGl2ZS5uYW1lICE9PSBWQUxVRVMpIHtcbiAgICBWQUxVRVNfQlVHID0gdHJ1ZTtcbiAgICAkZGVmYXVsdCA9IGZ1bmN0aW9uIHZhbHVlcygpIHsgcmV0dXJuICRuYXRpdmUuY2FsbCh0aGlzKTsgfTtcbiAgfVxuICAvLyBEZWZpbmUgaXRlcmF0b3JcbiAgaWYgKCghTElCUkFSWSB8fCBGT1JDRUQpICYmIChCVUdHWSB8fCBWQUxVRVNfQlVHIHx8ICFwcm90b1tJVEVSQVRPUl0pKSB7XG4gICAgaGlkZShwcm90bywgSVRFUkFUT1IsICRkZWZhdWx0KTtcbiAgfVxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XG4gIEl0ZXJhdG9yc1tOQU1FXSA9ICRkZWZhdWx0O1xuICBJdGVyYXRvcnNbVEFHXSA9IHJldHVyblRoaXM7XG4gIGlmIChERUZBVUxUKSB7XG4gICAgbWV0aG9kcyA9IHtcbiAgICAgIHZhbHVlczogREVGX1ZBTFVFUyA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKFZBTFVFUyksXG4gICAgICBrZXlzOiBJU19TRVQgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICRlbnRyaWVzXG4gICAgfTtcbiAgICBpZiAoRk9SQ0VEKSBmb3IgKGtleSBpbiBtZXRob2RzKSB7XG4gICAgICBpZiAoIShrZXkgaW4gcHJvdG8pKSByZWRlZmluZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xuICAgIH0gZWxzZSAkZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuRiAqIChCVUdHWSB8fCBWQUxVRVNfQlVHKSwgTkFNRSwgbWV0aG9kcyk7XG4gIH1cbiAgcmV0dXJuIG1ldGhvZHM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICRhdCA9IHJlcXVpcmUoJy4vX3N0cmluZy1hdCcpKHRydWUpO1xuXG4vLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuL19pdGVyLWRlZmluZScpKFN0cmluZywgJ1N0cmluZycsIGZ1bmN0aW9uIChpdGVyYXRlZCkge1xuICB0aGlzLl90ID0gU3RyaW5nKGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4vLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbiAoKSB7XG4gIHZhciBPID0gdGhpcy5fdDtcbiAgdmFyIGluZGV4ID0gdGhpcy5faTtcbiAgdmFyIHBvaW50O1xuICBpZiAoaW5kZXggPj0gTy5sZW5ndGgpIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgcG9pbnQgPSAkYXQoTywgaW5kZXgpO1xuICB0aGlzLl9pICs9IHBvaW50Lmxlbmd0aDtcbiAgcmV0dXJuIHsgdmFsdWU6IHBvaW50LCBkb25lOiBmYWxzZSB9O1xufSk7XG4iLCIvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXG52YXIgVU5TQ09QQUJMRVMgPSByZXF1aXJlKCcuL193a3MnKSgndW5zY29wYWJsZXMnKTtcbnZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuaWYgKEFycmF5UHJvdG9bVU5TQ09QQUJMRVNdID09IHVuZGVmaW5lZCkgcmVxdWlyZSgnLi9faGlkZScpKEFycmF5UHJvdG8sIFVOU0NPUEFCTEVTLCB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgQXJyYXlQcm90b1tVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZG9uZSwgdmFsdWUpIHtcbiAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkb25lOiAhIWRvbmUgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYWRkVG9VbnNjb3BhYmxlcyA9IHJlcXVpcmUoJy4vX2FkZC10by11bnNjb3BhYmxlcycpO1xudmFyIHN0ZXAgPSByZXF1aXJlKCcuL19pdGVyLXN0ZXAnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24gKGl0ZXJhdGVkLCBraW5kKSB7XG4gIHRoaXMuX3QgPSB0b0lPYmplY3QoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbiAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24gKCkge1xuICB2YXIgTyA9IHRoaXMuX3Q7XG4gIHZhciBraW5kID0gdGhpcy5faztcbiAgdmFyIGluZGV4ID0gdGhpcy5faSsrO1xuICBpZiAoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpIHtcbiAgICB0aGlzLl90ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzdGVwKDEpO1xuICB9XG4gIGlmIChraW5kID09ICdrZXlzJykgcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xuICBpZiAoa2luZCA9PSAndmFsdWVzJykgcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbmFkZFRvVW5zY29wYWJsZXMoJ2tleXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ3ZhbHVlcycpO1xuYWRkVG9VbnNjb3BhYmxlcygnZW50cmllcycpO1xuIiwidmFyICRpdGVyYXRvcnMgPSByZXF1aXJlKCcuL2VzNi5hcnJheS5pdGVyYXRvcicpO1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyIHdrcyA9IHJlcXVpcmUoJy4vX3drcycpO1xudmFyIElURVJBVE9SID0gd2tzKCdpdGVyYXRvcicpO1xudmFyIFRPX1NUUklOR19UQUcgPSB3a3MoJ3RvU3RyaW5nVGFnJyk7XG52YXIgQXJyYXlWYWx1ZXMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbnZhciBET01JdGVyYWJsZXMgPSB7XG4gIENTU1J1bGVMaXN0OiB0cnVlLCAvLyBUT0RPOiBOb3Qgc3BlYyBjb21wbGlhbnQsIHNob3VsZCBiZSBmYWxzZS5cbiAgQ1NTU3R5bGVEZWNsYXJhdGlvbjogZmFsc2UsXG4gIENTU1ZhbHVlTGlzdDogZmFsc2UsXG4gIENsaWVudFJlY3RMaXN0OiBmYWxzZSxcbiAgRE9NUmVjdExpc3Q6IGZhbHNlLFxuICBET01TdHJpbmdMaXN0OiBmYWxzZSxcbiAgRE9NVG9rZW5MaXN0OiB0cnVlLFxuICBEYXRhVHJhbnNmZXJJdGVtTGlzdDogZmFsc2UsXG4gIEZpbGVMaXN0OiBmYWxzZSxcbiAgSFRNTEFsbENvbGxlY3Rpb246IGZhbHNlLFxuICBIVE1MQ29sbGVjdGlvbjogZmFsc2UsXG4gIEhUTUxGb3JtRWxlbWVudDogZmFsc2UsXG4gIEhUTUxTZWxlY3RFbGVtZW50OiBmYWxzZSxcbiAgTWVkaWFMaXN0OiB0cnVlLCAvLyBUT0RPOiBOb3Qgc3BlYyBjb21wbGlhbnQsIHNob3VsZCBiZSBmYWxzZS5cbiAgTWltZVR5cGVBcnJheTogZmFsc2UsXG4gIE5hbWVkTm9kZU1hcDogZmFsc2UsXG4gIE5vZGVMaXN0OiB0cnVlLFxuICBQYWludFJlcXVlc3RMaXN0OiBmYWxzZSxcbiAgUGx1Z2luOiBmYWxzZSxcbiAgUGx1Z2luQXJyYXk6IGZhbHNlLFxuICBTVkdMZW5ndGhMaXN0OiBmYWxzZSxcbiAgU1ZHTnVtYmVyTGlzdDogZmFsc2UsXG4gIFNWR1BhdGhTZWdMaXN0OiBmYWxzZSxcbiAgU1ZHUG9pbnRMaXN0OiBmYWxzZSxcbiAgU1ZHU3RyaW5nTGlzdDogZmFsc2UsXG4gIFNWR1RyYW5zZm9ybUxpc3Q6IGZhbHNlLFxuICBTb3VyY2VCdWZmZXJMaXN0OiBmYWxzZSxcbiAgU3R5bGVTaGVldExpc3Q6IHRydWUsIC8vIFRPRE86IE5vdCBzcGVjIGNvbXBsaWFudCwgc2hvdWxkIGJlIGZhbHNlLlxuICBUZXh0VHJhY2tDdWVMaXN0OiBmYWxzZSxcbiAgVGV4dFRyYWNrTGlzdDogZmFsc2UsXG4gIFRvdWNoTGlzdDogZmFsc2Vcbn07XG5cbmZvciAodmFyIGNvbGxlY3Rpb25zID0gZ2V0S2V5cyhET01JdGVyYWJsZXMpLCBpID0gMDsgaSA8IGNvbGxlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gIHZhciBOQU1FID0gY29sbGVjdGlvbnNbaV07XG4gIHZhciBleHBsaWNpdCA9IERPTUl0ZXJhYmxlc1tOQU1FXTtcbiAgdmFyIENvbGxlY3Rpb24gPSBnbG9iYWxbTkFNRV07XG4gIHZhciBwcm90byA9IENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGU7XG4gIHZhciBrZXk7XG4gIGlmIChwcm90bykge1xuICAgIGlmICghcHJvdG9bSVRFUkFUT1JdKSBoaWRlKHByb3RvLCBJVEVSQVRPUiwgQXJyYXlWYWx1ZXMpO1xuICAgIGlmICghcHJvdG9bVE9fU1RSSU5HX1RBR10pIGhpZGUocHJvdG8sIFRPX1NUUklOR19UQUcsIE5BTUUpO1xuICAgIEl0ZXJhdG9yc1tOQU1FXSA9IEFycmF5VmFsdWVzO1xuICAgIGlmIChleHBsaWNpdCkgZm9yIChrZXkgaW4gJGl0ZXJhdG9ycykgaWYgKCFwcm90b1trZXldKSByZWRlZmluZShwcm90bywga2V5LCAkaXRlcmF0b3JzW2tleV0sIHRydWUpO1xuICB9XG59XG4iLCJ2YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFyZ2V0LCBzcmMsIHNhZmUpIHtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgcmVkZWZpbmUodGFyZ2V0LCBrZXksIHNyY1trZXldLCBzYWZlKTtcbiAgcmV0dXJuIHRhcmdldDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgQ29uc3RydWN0b3IsIG5hbWUsIGZvcmJpZGRlbkZpZWxkKSB7XG4gIGlmICghKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHx8IChmb3JiaWRkZW5GaWVsZCAhPT0gdW5kZWZpbmVkICYmIGZvcmJpZGRlbkZpZWxkIGluIGl0KSkge1xuICAgIHRocm93IFR5cGVFcnJvcihuYW1lICsgJzogaW5jb3JyZWN0IGludm9jYXRpb24hJyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsIi8vIGNhbGwgc29tZXRoaW5nIG9uIGl0ZXJhdG9yIHN0ZXAgd2l0aCBzYWZlIGNsb3Npbmcgb24gZXJyb3JcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcykge1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICAgIGlmIChyZXQgIT09IHVuZGVmaW5lZCkgYW5PYmplY3QocmV0LmNhbGwoaXRlcmF0b3IpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwiLy8gY2hlY2sgb24gZGVmYXVsdCBBcnJheSBpdGVyYXRvclxudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyIElURVJBVE9SID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyk7XG52YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ICE9PSB1bmRlZmluZWQgJiYgKEl0ZXJhdG9ycy5BcnJheSA9PT0gaXQgfHwgQXJyYXlQcm90b1tJVEVSQVRPUl0gPT09IGl0KTtcbn07XG4iLCJ2YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKTtcbnZhciBJVEVSQVRPUiA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb3JlJykuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ICE9IHVuZGVmaW5lZCkgcmV0dXJuIGl0W0lURVJBVE9SXVxuICAgIHx8IGl0WydAQGl0ZXJhdG9yJ11cbiAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xufTtcbiIsInZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBjYWxsID0gcmVxdWlyZSgnLi9faXRlci1jYWxsJyk7XG52YXIgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuL19pcy1hcnJheS1pdGVyJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIGdldEl0ZXJGbiA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG52YXIgQlJFQUsgPSB7fTtcbnZhciBSRVRVUk4gPSB7fTtcbnZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0LCBJVEVSQVRPUikge1xuICB2YXIgaXRlckZuID0gSVRFUkFUT1IgPyBmdW5jdGlvbiAoKSB7IHJldHVybiBpdGVyYWJsZTsgfSA6IGdldEl0ZXJGbihpdGVyYWJsZSk7XG4gIHZhciBmID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpO1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgbGVuZ3RoLCBzdGVwLCBpdGVyYXRvciwgcmVzdWx0O1xuICBpZiAodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKSB0aHJvdyBUeXBlRXJyb3IoaXRlcmFibGUgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgLy8gZmFzdCBjYXNlIGZvciBhcnJheXMgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yXG4gIGlmIChpc0FycmF5SXRlcihpdGVyRm4pKSBmb3IgKGxlbmd0aCA9IHRvTGVuZ3RoKGl0ZXJhYmxlLmxlbmd0aCk7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKSB7XG4gICAgcmVzdWx0ID0gZW50cmllcyA/IGYoYW5PYmplY3Qoc3RlcCA9IGl0ZXJhYmxlW2luZGV4XSlbMF0sIHN0ZXBbMV0pIDogZihpdGVyYWJsZVtpbmRleF0pO1xuICAgIGlmIChyZXN1bHQgPT09IEJSRUFLIHx8IHJlc3VsdCA9PT0gUkVUVVJOKSByZXR1cm4gcmVzdWx0O1xuICB9IGVsc2UgZm9yIChpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKGl0ZXJhYmxlKTsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOykge1xuICAgIHJlc3VsdCA9IGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpO1xuICAgIGlmIChyZXN1bHQgPT09IEJSRUFLIHx8IHJlc3VsdCA9PT0gUkVUVVJOKSByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuZXhwb3J0cy5CUkVBSyA9IEJSRUFLO1xuZXhwb3J0cy5SRVRVUk4gPSBSRVRVUk47XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEtFWSkge1xuICB2YXIgQyA9IGdsb2JhbFtLRVldO1xuICBpZiAoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSkgZFAuZihDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG4iLCJ2YXIgTUVUQSA9IHJlcXVpcmUoJy4vX3VpZCcpKCdtZXRhJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBzZXREZXNjID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBpZCA9IDA7XG52YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBGUkVFWkUgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBpc0V4dGVuc2libGUoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKHt9KSk7XG59KTtcbnZhciBzZXRNZXRhID0gZnVuY3Rpb24gKGl0KSB7XG4gIHNldERlc2MoaXQsIE1FVEEsIHsgdmFsdWU6IHtcbiAgICBpOiAnTycgKyArK2lkLCAvLyBvYmplY3QgSURcbiAgICB3OiB7fSAgICAgICAgICAvLyB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IH0pO1xufTtcbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24gKGl0LCBjcmVhdGUpIHtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYgKCFoYXMoaXQsIE1FVEEpKSB7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShpdCkpIHJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gb2JqZWN0IElEXG4gIH0gcmV0dXJuIGl0W01FVEFdLmk7XG59O1xudmFyIGdldFdlYWsgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuIHRydWU7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBoYXNoIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gcmV0dXJuIGl0W01FVEFdLnc7XG59O1xuLy8gYWRkIG1ldGFkYXRhIG9uIGZyZWV6ZS1mYW1pbHkgbWV0aG9kcyBjYWxsaW5nXG52YXIgb25GcmVlemUgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKEZSRUVaRSAmJiBtZXRhLk5FRUQgJiYgaXNFeHRlbnNpYmxlKGl0KSAmJiAhaGFzKGl0LCBNRVRBKSkgc2V0TWV0YShpdCk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgbWV0YSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBLRVk6IE1FVEEsXG4gIE5FRUQ6IGZhbHNlLFxuICBmYXN0S2V5OiBmYXN0S2V5LFxuICBnZXRXZWFrOiBnZXRXZWFrLFxuICBvbkZyZWV6ZTogb25GcmVlemVcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBUWVBFKSB7XG4gIGlmICghaXNPYmplY3QoaXQpIHx8IGl0Ll90ICE9PSBUWVBFKSB0aHJvdyBUeXBlRXJyb3IoJ0luY29tcGF0aWJsZSByZWNlaXZlciwgJyArIFRZUEUgKyAnIHJlcXVpcmVkIScpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgcmVkZWZpbmVBbGwgPSByZXF1aXJlKCcuL19yZWRlZmluZS1hbGwnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKTtcbnZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xudmFyICRpdGVyRGVmaW5lID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKTtcbnZhciBzdGVwID0gcmVxdWlyZSgnLi9faXRlci1zdGVwJyk7XG52YXIgc2V0U3BlY2llcyA9IHJlcXVpcmUoJy4vX3NldC1zcGVjaWVzJyk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xudmFyIGZhc3RLZXkgPSByZXF1aXJlKCcuL19tZXRhJykuZmFzdEtleTtcbnZhciB2YWxpZGF0ZSA9IHJlcXVpcmUoJy4vX3ZhbGlkYXRlLWNvbGxlY3Rpb24nKTtcbnZhciBTSVpFID0gREVTQ1JJUFRPUlMgPyAnX3MnIDogJ3NpemUnO1xuXG52YXIgZ2V0RW50cnkgPSBmdW5jdGlvbiAodGhhdCwga2V5KSB7XG4gIC8vIGZhc3QgY2FzZVxuICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSk7XG4gIHZhciBlbnRyeTtcbiAgaWYgKGluZGV4ICE9PSAnRicpIHJldHVybiB0aGF0Ll9pW2luZGV4XTtcbiAgLy8gZnJvemVuIG9iamVjdCBjYXNlXG4gIGZvciAoZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKSB7XG4gICAgaWYgKGVudHJ5LmsgPT0ga2V5KSByZXR1cm4gZW50cnk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpIHtcbiAgICB2YXIgQyA9IHdyYXBwZXIoZnVuY3Rpb24gKHRoYXQsIGl0ZXJhYmxlKSB7XG4gICAgICBhbkluc3RhbmNlKHRoYXQsIEMsIE5BTUUsICdfaScpO1xuICAgICAgdGhhdC5fdCA9IE5BTUU7ICAgICAgICAgLy8gY29sbGVjdGlvbiB0eXBlXG4gICAgICB0aGF0Ll9pID0gY3JlYXRlKG51bGwpOyAvLyBpbmRleFxuICAgICAgdGhhdC5fZiA9IHVuZGVmaW5lZDsgICAgLy8gZmlyc3QgZW50cnlcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7ICAgIC8vIGxhc3QgZW50cnlcbiAgICAgIHRoYXRbU0laRV0gPSAwOyAgICAgICAgIC8vIHNpemVcbiAgICAgIGlmIChpdGVyYWJsZSAhPSB1bmRlZmluZWQpIGZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZWRlZmluZUFsbChDLnByb3RvdHlwZSwge1xuICAgICAgLy8gMjMuMS4zLjEgTWFwLnByb3RvdHlwZS5jbGVhcigpXG4gICAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIGNsZWFyOiBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICAgICAgZm9yICh2YXIgdGhhdCA9IHZhbGlkYXRlKHRoaXMsIE5BTUUpLCBkYXRhID0gdGhhdC5faSwgZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKSB7XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYgKGVudHJ5LnApIGVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhhdC5fZiA9IHRoYXQuX2wgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoYXRbU0laRV0gPSAwO1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy4zIE1hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcbiAgICAgIC8vIDIzLjIuMy40IFNldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB2YWxpZGF0ZSh0aGlzLCBOQU1FKTtcbiAgICAgICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KTtcbiAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uO1xuICAgICAgICAgIHZhciBwcmV2ID0gZW50cnkucDtcbiAgICAgICAgICBkZWxldGUgdGhhdC5faVtlbnRyeS5pXTtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZiAocHJldikgcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZiAobmV4dCkgbmV4dC5wID0gcHJldjtcbiAgICAgICAgICBpZiAodGhhdC5fZiA9PSBlbnRyeSkgdGhhdC5fZiA9IG5leHQ7XG4gICAgICAgICAgaWYgKHRoYXQuX2wgPT0gZW50cnkpIHRoYXQuX2wgPSBwcmV2O1xuICAgICAgICAgIHRoYXRbU0laRV0tLTtcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qICwgdGhhdCA9IHVuZGVmaW5lZCAqLykge1xuICAgICAgICB2YWxpZGF0ZSh0aGlzLCBOQU1FKTtcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpO1xuICAgICAgICB2YXIgZW50cnk7XG4gICAgICAgIHdoaWxlIChlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoaXMuX2YpIHtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlIChlbnRyeSAmJiBlbnRyeS5yKSBlbnRyeSA9IGVudHJ5LnA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuNyBNYXAucHJvdG90eXBlLmhhcyhrZXkpXG4gICAgICAvLyAyMy4yLjMuNyBTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSkge1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh2YWxpZGF0ZSh0aGlzLCBOQU1FKSwga2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoREVTQ1JJUFRPUlMpIGRQKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGUodGhpcywgTkFNRSlbU0laRV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24gKHRoYXQsIGtleSwgdmFsdWUpIHtcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xuICAgIHZhciBwcmV2LCBpbmRleDtcbiAgICAvLyBjaGFuZ2UgZXhpc3RpbmcgZW50cnlcbiAgICBpZiAoZW50cnkpIHtcbiAgICAgIGVudHJ5LnYgPSB2YWx1ZTtcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXQuX2wgPSBlbnRyeSA9IHtcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XG4gICAgICAgIGs6IGtleSwgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBrZXlcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICAgIHA6IHByZXYgPSB0aGF0Ll9sLCAgICAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxuICAgICAgICBuOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgLy8gPC0gbmV4dCBlbnRyeVxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxuICAgICAgfTtcbiAgICAgIGlmICghdGhhdC5fZikgdGhhdC5fZiA9IGVudHJ5O1xuICAgICAgaWYgKHByZXYpIHByZXYubiA9IGVudHJ5O1xuICAgICAgdGhhdFtTSVpFXSsrO1xuICAgICAgLy8gYWRkIHRvIGluZGV4XG4gICAgICBpZiAoaW5kZXggIT09ICdGJykgdGhhdC5faVtpbmRleF0gPSBlbnRyeTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBnZXRFbnRyeTogZ2V0RW50cnksXG4gIHNldFN0cm9uZzogZnVuY3Rpb24gKEMsIE5BTUUsIElTX01BUCkge1xuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgICAkaXRlckRlZmluZShDLCBOQU1FLCBmdW5jdGlvbiAoaXRlcmF0ZWQsIGtpbmQpIHtcbiAgICAgIHRoaXMuX3QgPSB2YWxpZGF0ZShpdGVyYXRlZCwgTkFNRSk7IC8vIHRhcmdldFxuICAgICAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgICAgICAgLy8ga2luZFxuICAgICAgdGhpcy5fbCA9IHVuZGVmaW5lZDsgICAgICAgICAgICAgICAgLy8gcHJldmlvdXNcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICB2YXIga2luZCA9IHRoYXQuX2s7XG4gICAgICB2YXIgZW50cnkgPSB0aGF0Ll9sO1xuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICB3aGlsZSAoZW50cnkgJiYgZW50cnkucikgZW50cnkgPSBlbnRyeS5wO1xuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcbiAgICAgIGlmICghdGhhdC5fdCB8fCAhKHRoYXQuX2wgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoYXQuX3QuX2YpKSB7XG4gICAgICAgIC8vIG9yIGZpbmlzaCB0aGUgaXRlcmF0aW9uXG4gICAgICAgIHRoYXQuX3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBzdGVwKDEpO1xuICAgICAgfVxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxuICAgICAgaWYgKGtpbmQgPT0gJ2tleXMnKSByZXR1cm4gc3RlcCgwLCBlbnRyeS5rKTtcbiAgICAgIGlmIChraW5kID09ICd2YWx1ZXMnKSByZXR1cm4gc3RlcCgwLCBlbnRyeS52KTtcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycsICFJU19NQVAsIHRydWUpO1xuXG4gICAgLy8gYWRkIFtAQHNwZWNpZXNdLCAyMy4xLjIuMiwgMjMuMi4yLjJcbiAgICBzZXRTcGVjaWVzKE5BTUUpO1xuICB9XG59O1xuIiwidmFyIElURVJBVE9SID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyk7XG52YXIgU0FGRV9DTE9TSU5HID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciByaXRlciA9IFs3XVtJVEVSQVRPUl0oKTtcbiAgcml0ZXJbJ3JldHVybiddID0gZnVuY3Rpb24gKCkgeyBTQUZFX0NMT1NJTkcgPSB0cnVlOyB9O1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdGhyb3ctbGl0ZXJhbFxuICBBcnJheS5mcm9tKHJpdGVyLCBmdW5jdGlvbiAoKSB7IHRocm93IDI7IH0pO1xufSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMsIHNraXBDbG9zaW5nKSB7XG4gIGlmICghc2tpcENsb3NpbmcgJiYgIVNBRkVfQ0xPU0lORykgcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgPSBbN107XG4gICAgdmFyIGl0ZXIgPSBhcnJbSVRFUkFUT1JdKCk7XG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4geyBkb25lOiBzYWZlID0gdHJ1ZSB9OyB9O1xuICAgIGFycltJVEVSQVRPUl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBpdGVyOyB9O1xuICAgIGV4ZWMoYXJyKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBzYWZlO1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIHNldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi9fc2V0LXByb3RvJykuc2V0O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGhhdCwgdGFyZ2V0LCBDKSB7XG4gIHZhciBTID0gdGFyZ2V0LmNvbnN0cnVjdG9yO1xuICB2YXIgUDtcbiAgaWYgKFMgIT09IEMgJiYgdHlwZW9mIFMgPT0gJ2Z1bmN0aW9uJyAmJiAoUCA9IFMucHJvdG90eXBlKSAhPT0gQy5wcm90b3R5cGUgJiYgaXNPYmplY3QoUCkgJiYgc2V0UHJvdG90eXBlT2YpIHtcbiAgICBzZXRQcm90b3R5cGVPZih0aGF0LCBQKTtcbiAgfSByZXR1cm4gdGhhdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciByZWRlZmluZUFsbCA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpO1xudmFyIG1ldGEgPSByZXF1aXJlKCcuL19tZXRhJyk7XG52YXIgZm9yT2YgPSByZXF1aXJlKCcuL19mb3Itb2YnKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbnZhciAkaXRlckRldGVjdCA9IHJlcXVpcmUoJy4vX2l0ZXItZGV0ZWN0Jyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIGluaGVyaXRJZlJlcXVpcmVkID0gcmVxdWlyZSgnLi9faW5oZXJpdC1pZi1yZXF1aXJlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOQU1FLCB3cmFwcGVyLCBtZXRob2RzLCBjb21tb24sIElTX01BUCwgSVNfV0VBSykge1xuICB2YXIgQmFzZSA9IGdsb2JhbFtOQU1FXTtcbiAgdmFyIEMgPSBCYXNlO1xuICB2YXIgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnO1xuICB2YXIgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlO1xuICB2YXIgTyA9IHt9O1xuICB2YXIgZml4TWV0aG9kID0gZnVuY3Rpb24gKEtFWSkge1xuICAgIHZhciBmbiA9IHByb3RvW0tFWV07XG4gICAgcmVkZWZpbmUocHJvdG8sIEtFWSxcbiAgICAgIEtFWSA9PSAnZGVsZXRlJyA/IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIHJldHVybiBJU19XRUFLICYmICFpc09iamVjdChhKSA/IGZhbHNlIDogZm4uY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEpO1xuICAgICAgfSA6IEtFWSA9PSAnaGFzJyA/IGZ1bmN0aW9uIGhhcyhhKSB7XG4gICAgICAgIHJldHVybiBJU19XRUFLICYmICFpc09iamVjdChhKSA/IGZhbHNlIDogZm4uY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEpO1xuICAgICAgfSA6IEtFWSA9PSAnZ2V0JyA/IGZ1bmN0aW9uIGdldChhKSB7XG4gICAgICAgIHJldHVybiBJU19XRUFLICYmICFpc09iamVjdChhKSA/IHVuZGVmaW5lZCA6IGZuLmNhbGwodGhpcywgYSA9PT0gMCA/IDAgOiBhKTtcbiAgICAgIH0gOiBLRVkgPT0gJ2FkZCcgPyBmdW5jdGlvbiBhZGQoYSkgeyBmbi5jYWxsKHRoaXMsIGEgPT09IDAgPyAwIDogYSk7IHJldHVybiB0aGlzOyB9XG4gICAgICAgIDogZnVuY3Rpb24gc2V0KGEsIGIpIHsgZm4uY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEsIGIpOyByZXR1cm4gdGhpczsgfVxuICAgICk7XG4gIH07XG4gIGlmICh0eXBlb2YgQyAhPSAnZnVuY3Rpb24nIHx8ICEoSVNfV0VBSyB8fCBwcm90by5mb3JFYWNoICYmICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgbmV3IEMoKS5lbnRyaWVzKCkubmV4dCgpO1xuICB9KSkpIHtcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3Iod3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUik7XG4gICAgcmVkZWZpbmVBbGwoQy5wcm90b3R5cGUsIG1ldGhvZHMpO1xuICAgIG1ldGEuTkVFRCA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGluc3RhbmNlID0gbmV3IEMoKTtcbiAgICAvLyBlYXJseSBpbXBsZW1lbnRhdGlvbnMgbm90IHN1cHBvcnRzIGNoYWluaW5nXG4gICAgdmFyIEhBU05UX0NIQUlOSU5HID0gaW5zdGFuY2VbQURERVJdKElTX1dFQUsgPyB7fSA6IC0wLCAxKSAhPSBpbnN0YW5jZTtcbiAgICAvLyBWOCB+ICBDaHJvbWl1bSA0MC0gd2Vhay1jb2xsZWN0aW9ucyB0aHJvd3Mgb24gcHJpbWl0aXZlcywgYnV0IHNob3VsZCByZXR1cm4gZmFsc2VcbiAgICB2YXIgVEhST1dTX09OX1BSSU1JVElWRVMgPSBmYWlscyhmdW5jdGlvbiAoKSB7IGluc3RhbmNlLmhhcygxKTsgfSk7XG4gICAgLy8gbW9zdCBlYXJseSBpbXBsZW1lbnRhdGlvbnMgZG9lc24ndCBzdXBwb3J0cyBpdGVyYWJsZXMsIG1vc3QgbW9kZXJuIC0gbm90IGNsb3NlIGl0IGNvcnJlY3RseVxuICAgIHZhciBBQ0NFUFRfSVRFUkFCTEVTID0gJGl0ZXJEZXRlY3QoZnVuY3Rpb24gKGl0ZXIpIHsgbmV3IEMoaXRlcik7IH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICAgIC8vIGZvciBlYXJseSBpbXBsZW1lbnRhdGlvbnMgLTAgYW5kICswIG5vdCB0aGUgc2FtZVxuICAgIHZhciBCVUdHWV9aRVJPID0gIUlTX1dFQUsgJiYgZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgICAgLy8gVjggfiBDaHJvbWl1bSA0Mi0gZmFpbHMgb25seSB3aXRoIDUrIGVsZW1lbnRzXG4gICAgICB2YXIgJGluc3RhbmNlID0gbmV3IEMoKTtcbiAgICAgIHZhciBpbmRleCA9IDU7XG4gICAgICB3aGlsZSAoaW5kZXgtLSkgJGluc3RhbmNlW0FEREVSXShpbmRleCwgaW5kZXgpO1xuICAgICAgcmV0dXJuICEkaW5zdGFuY2UuaGFzKC0wKTtcbiAgICB9KTtcbiAgICBpZiAoIUFDQ0VQVF9JVEVSQUJMRVMpIHtcbiAgICAgIEMgPSB3cmFwcGVyKGZ1bmN0aW9uICh0YXJnZXQsIGl0ZXJhYmxlKSB7XG4gICAgICAgIGFuSW5zdGFuY2UodGFyZ2V0LCBDLCBOQU1FKTtcbiAgICAgICAgdmFyIHRoYXQgPSBpbmhlcml0SWZSZXF1aXJlZChuZXcgQmFzZSgpLCB0YXJnZXQsIEMpO1xuICAgICAgICBpZiAoaXRlcmFibGUgIT0gdW5kZWZpbmVkKSBmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XG4gICAgICAgIHJldHVybiB0aGF0O1xuICAgICAgfSk7XG4gICAgICBDLnByb3RvdHlwZSA9IHByb3RvO1xuICAgICAgcHJvdG8uY29uc3RydWN0b3IgPSBDO1xuICAgIH1cbiAgICBpZiAoVEhST1dTX09OX1BSSU1JVElWRVMgfHwgQlVHR1lfWkVSTykge1xuICAgICAgZml4TWV0aG9kKCdkZWxldGUnKTtcbiAgICAgIGZpeE1ldGhvZCgnaGFzJyk7XG4gICAgICBJU19NQVAgJiYgZml4TWV0aG9kKCdnZXQnKTtcbiAgICB9XG4gICAgaWYgKEJVR0dZX1pFUk8gfHwgSEFTTlRfQ0hBSU5JTkcpIGZpeE1ldGhvZChBRERFUik7XG4gICAgLy8gd2VhayBjb2xsZWN0aW9ucyBzaG91bGQgbm90IGNvbnRhaW5zIC5jbGVhciBtZXRob2RcbiAgICBpZiAoSVNfV0VBSyAmJiBwcm90by5jbGVhcikgZGVsZXRlIHByb3RvLmNsZWFyO1xuICB9XG5cbiAgc2V0VG9TdHJpbmdUYWcoQywgTkFNRSk7XG5cbiAgT1tOQU1FXSA9IEM7XG4gICRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GICogKEMgIT0gQmFzZSksIE8pO1xuXG4gIGlmICghSVNfV0VBSykgY29tbW9uLnNldFN0cm9uZyhDLCBOQU1FLCBJU19NQVApO1xuXG4gIHJldHVybiBDO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXN0cm9uZycpO1xudmFyIHZhbGlkYXRlID0gcmVxdWlyZSgnLi9fdmFsaWRhdGUtY29sbGVjdGlvbicpO1xudmFyIFNFVCA9ICdTZXQnO1xuXG4vLyAyMy4yIFNldCBPYmplY3RzXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvbGxlY3Rpb24nKShTRVQsIGZ1bmN0aW9uIChnZXQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIFNldCgpIHsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7IH07XG59LCB7XG4gIC8vIDIzLjIuMy4xIFNldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSkge1xuICAgIHJldHVybiBzdHJvbmcuZGVmKHZhbGlkYXRlKHRoaXMsIFNFVCksIHZhbHVlID0gdmFsdWUgPT09IDAgPyAwIDogdmFsdWUsIHZhbHVlKTtcbiAgfVxufSwgc3Ryb25nKTtcbiIsInZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVyLCBJVEVSQVRPUikge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvck9mKGl0ZXIsIGZhbHNlLCByZXN1bHQucHVzaCwgcmVzdWx0LCBJVEVSQVRPUik7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL19jbGFzc29mJyk7XG52YXIgZnJvbSA9IHJlcXVpcmUoJy4vX2FycmF5LWZyb20taXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5BTUUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICBpZiAoY2xhc3NvZih0aGlzKSAhPSBOQU1FKSB0aHJvdyBUeXBlRXJyb3IoTkFNRSArIFwiI3RvSlNPTiBpc24ndCBnZW5lcmljXCIpO1xuICAgIHJldHVybiBmcm9tKHRoaXMpO1xuICB9O1xufTtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG5cbiRleHBvcnQoJGV4cG9ydC5QICsgJGV4cG9ydC5SLCAnU2V0JywgeyB0b0pTT046IHJlcXVpcmUoJy4vX2NvbGxlY3Rpb24tdG8tanNvbicpKCdTZXQnKSB9KTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vcHJvcG9zYWwtc2V0bWFwLW9mZnJvbS9cbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKENPTExFQ1RJT04pIHtcbiAgJGV4cG9ydCgkZXhwb3J0LlMsIENPTExFQ1RJT04sIHsgb2Y6IGZ1bmN0aW9uIG9mKCkge1xuICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHZhciBBID0gQXJyYXkobGVuZ3RoKTtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIEFbbGVuZ3RoXSA9IGFyZ3VtZW50c1tsZW5ndGhdO1xuICAgIHJldHVybiBuZXcgdGhpcyhBKTtcbiAgfSB9KTtcbn07XG4iLCIvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL3Byb3Bvc2FsLXNldG1hcC1vZmZyb20vI3NlYy1zZXQub2ZcbnJlcXVpcmUoJy4vX3NldC1jb2xsZWN0aW9uLW9mJykoJ1NldCcpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9wcm9wb3NhbC1zZXRtYXAtb2Zmcm9tL1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG52YXIgY3R4ID0gcmVxdWlyZSgnLi9fY3R4Jyk7XG52YXIgZm9yT2YgPSByZXF1aXJlKCcuL19mb3Itb2YnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQ09MTEVDVElPTikge1xuICAkZXhwb3J0KCRleHBvcnQuUywgQ09MTEVDVElPTiwgeyBmcm9tOiBmdW5jdGlvbiBmcm9tKHNvdXJjZSAvKiAsIG1hcEZuLCB0aGlzQXJnICovKSB7XG4gICAgdmFyIG1hcEZuID0gYXJndW1lbnRzWzFdO1xuICAgIHZhciBtYXBwaW5nLCBBLCBuLCBjYjtcbiAgICBhRnVuY3Rpb24odGhpcyk7XG4gICAgbWFwcGluZyA9IG1hcEZuICE9PSB1bmRlZmluZWQ7XG4gICAgaWYgKG1hcHBpbmcpIGFGdW5jdGlvbihtYXBGbik7XG4gICAgaWYgKHNvdXJjZSA9PSB1bmRlZmluZWQpIHJldHVybiBuZXcgdGhpcygpO1xuICAgIEEgPSBbXTtcbiAgICBpZiAobWFwcGluZykge1xuICAgICAgbiA9IDA7XG4gICAgICBjYiA9IGN0eChtYXBGbiwgYXJndW1lbnRzWzJdLCAyKTtcbiAgICAgIGZvck9mKHNvdXJjZSwgZmFsc2UsIGZ1bmN0aW9uIChuZXh0SXRlbSkge1xuICAgICAgICBBLnB1c2goY2IobmV4dEl0ZW0sIG4rKykpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvck9mKHNvdXJjZSwgZmFsc2UsIEEucHVzaCwgQSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgdGhpcyhBKTtcbiAgfSB9KTtcbn07XG4iLCIvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL3Byb3Bvc2FsLXNldG1hcC1vZmZyb20vI3NlYy1zZXQuZnJvbVxucmVxdWlyZSgnLi9fc2V0LWNvbGxlY3Rpb24tZnJvbScpKCdTZXQnKTtcbiIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zZXQnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnNldC50by1qc29uJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNy5zZXQub2YnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnNldC5mcm9tJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5TZXQ7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi9fY29sbGVjdGlvbi1zdHJvbmcnKTtcbnZhciB2YWxpZGF0ZSA9IHJlcXVpcmUoJy4vX3ZhbGlkYXRlLWNvbGxlY3Rpb24nKTtcbnZhciBNQVAgPSAnTWFwJztcblxuLy8gMjMuMSBNYXAgT2JqZWN0c1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uJykoTUFQLCBmdW5jdGlvbiAoZ2V0KSB7XG4gIHJldHVybiBmdW5jdGlvbiBNYXAoKSB7IHJldHVybiBnZXQodGhpcywgYXJndW1lbnRzLmxlbmd0aCA+IDAgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQpOyB9O1xufSwge1xuICAvLyAyMy4xLjMuNiBNYXAucHJvdG90eXBlLmdldChrZXkpXG4gIGdldDogZnVuY3Rpb24gZ2V0KGtleSkge1xuICAgIHZhciBlbnRyeSA9IHN0cm9uZy5nZXRFbnRyeSh2YWxpZGF0ZSh0aGlzLCBNQVApLCBrZXkpO1xuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xuICB9LFxuICAvLyAyMy4xLjMuOSBNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodmFsaWRhdGUodGhpcywgTUFQKSwga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcsIHRydWUpO1xuIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LlIsICdNYXAnLCB7IHRvSlNPTjogcmVxdWlyZSgnLi9fY29sbGVjdGlvbi10by1qc29uJykoJ01hcCcpIH0pO1xuIiwiLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9wcm9wb3NhbC1zZXRtYXAtb2Zmcm9tLyNzZWMtbWFwLm9mXG5yZXF1aXJlKCcuL19zZXQtY29sbGVjdGlvbi1vZicpKCdNYXAnKTtcbiIsIi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vcHJvcG9zYWwtc2V0bWFwLW9mZnJvbS8jc2VjLW1hcC5mcm9tXG5yZXF1aXJlKCcuL19zZXQtY29sbGVjdGlvbi1mcm9tJykoJ01hcCcpO1xuIiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm1hcCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcubWFwLnRvLWpzb24nKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3Lm1hcC5vZicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcubWFwLmZyb20nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLk1hcDtcbiIsIi8vIDcuMi4yIElzQXJyYXkoYXJndW1lbnQpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vX2lzLWFycmF5Jyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9yaWdpbmFsKSB7XG4gIHZhciBDO1xuICBpZiAoaXNBcnJheShvcmlnaW5hbCkpIHtcbiAgICBDID0gb3JpZ2luYWwuY29uc3RydWN0b3I7XG4gICAgLy8gY3Jvc3MtcmVhbG0gZmFsbGJhY2tcbiAgICBpZiAodHlwZW9mIEMgPT0gJ2Z1bmN0aW9uJyAmJiAoQyA9PT0gQXJyYXkgfHwgaXNBcnJheShDLnByb3RvdHlwZSkpKSBDID0gdW5kZWZpbmVkO1xuICAgIGlmIChpc09iamVjdChDKSkge1xuICAgICAgQyA9IENbU1BFQ0lFU107XG4gICAgICBpZiAoQyA9PT0gbnVsbCkgQyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gcmV0dXJuIEMgPT09IHVuZGVmaW5lZCA/IEFycmF5IDogQztcbn07XG4iLCIvLyA5LjQuMi4zIEFycmF5U3BlY2llc0NyZWF0ZShvcmlnaW5hbEFycmF5LCBsZW5ndGgpXG52YXIgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi9fYXJyYXktc3BlY2llcy1jb25zdHJ1Y3RvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcmlnaW5hbCwgbGVuZ3RoKSB7XG4gIHJldHVybiBuZXcgKHNwZWNpZXNDb25zdHJ1Y3RvcihvcmlnaW5hbCkpKGxlbmd0aCk7XG59O1xuIiwiLy8gMCAtPiBBcnJheSNmb3JFYWNoXG4vLyAxIC0+IEFycmF5I21hcFxuLy8gMiAtPiBBcnJheSNmaWx0ZXJcbi8vIDMgLT4gQXJyYXkjc29tZVxuLy8gNCAtPiBBcnJheSNldmVyeVxuLy8gNSAtPiBBcnJheSNmaW5kXG4vLyA2IC0+IEFycmF5I2ZpbmRJbmRleFxudmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuL190by1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIGFzYyA9IHJlcXVpcmUoJy4vX2FycmF5LXNwZWNpZXMtY3JlYXRlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUWVBFLCAkY3JlYXRlKSB7XG4gIHZhciBJU19NQVAgPSBUWVBFID09IDE7XG4gIHZhciBJU19GSUxURVIgPSBUWVBFID09IDI7XG4gIHZhciBJU19TT01FID0gVFlQRSA9PSAzO1xuICB2YXIgSVNfRVZFUlkgPSBUWVBFID09IDQ7XG4gIHZhciBJU19GSU5EX0lOREVYID0gVFlQRSA9PSA2O1xuICB2YXIgTk9fSE9MRVMgPSBUWVBFID09IDUgfHwgSVNfRklORF9JTkRFWDtcbiAgdmFyIGNyZWF0ZSA9ICRjcmVhdGUgfHwgYXNjO1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBjYWxsYmFja2ZuLCB0aGF0KSB7XG4gICAgdmFyIE8gPSB0b09iamVjdCgkdGhpcyk7XG4gICAgdmFyIHNlbGYgPSBJT2JqZWN0KE8pO1xuICAgIHZhciBmID0gY3R4KGNhbGxiYWNrZm4sIHRoYXQsIDMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChzZWxmLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgcmVzdWx0ID0gSVNfTUFQID8gY3JlYXRlKCR0aGlzLCBsZW5ndGgpIDogSVNfRklMVEVSID8gY3JlYXRlKCR0aGlzLCAwKSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgdmFsLCByZXM7XG4gICAgZm9yICg7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIGlmIChOT19IT0xFUyB8fCBpbmRleCBpbiBzZWxmKSB7XG4gICAgICB2YWwgPSBzZWxmW2luZGV4XTtcbiAgICAgIHJlcyA9IGYodmFsLCBpbmRleCwgTyk7XG4gICAgICBpZiAoVFlQRSkge1xuICAgICAgICBpZiAoSVNfTUFQKSByZXN1bHRbaW5kZXhdID0gcmVzOyAgIC8vIG1hcFxuICAgICAgICBlbHNlIGlmIChyZXMpIHN3aXRjaCAoVFlQRSkge1xuICAgICAgICAgIGNhc2UgMzogcmV0dXJuIHRydWU7ICAgICAgICAgICAgIC8vIHNvbWVcbiAgICAgICAgICBjYXNlIDU6IHJldHVybiB2YWw7ICAgICAgICAgICAgICAvLyBmaW5kXG4gICAgICAgICAgY2FzZSA2OiByZXR1cm4gaW5kZXg7ICAgICAgICAgICAgLy8gZmluZEluZGV4XG4gICAgICAgICAgY2FzZSAyOiByZXN1bHQucHVzaCh2YWwpOyAgICAgICAgLy8gZmlsdGVyXG4gICAgICAgIH0gZWxzZSBpZiAoSVNfRVZFUlkpIHJldHVybiBmYWxzZTsgLy8gZXZlcnlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIElTX0ZJTkRfSU5ERVggPyAtMSA6IElTX1NPTUUgfHwgSVNfRVZFUlkgPyBJU19FVkVSWSA6IHJlc3VsdDtcbiAgfTtcbn07XG4iLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xudmFyIGdPUFMgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpO1xudmFyIHBJRSA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpO1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgJGFzc2lnbiA9IE9iamVjdC5hc3NpZ247XG5cbi8vIHNob3VsZCB3b3JrIHdpdGggc3ltYm9scyBhbmQgc2hvdWxkIGhhdmUgZGV0ZXJtaW5pc3RpYyBwcm9wZXJ0eSBvcmRlciAoVjggYnVnKVxubW9kdWxlLmV4cG9ydHMgPSAhJGFzc2lnbiB8fCByZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgdmFyIEEgPSB7fTtcbiAgdmFyIEIgPSB7fTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gIHZhciBTID0gU3ltYm9sKCk7XG4gIHZhciBLID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0JztcbiAgQVtTXSA9IDc7XG4gIEsuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGspIHsgQltrXSA9IGs7IH0pO1xuICByZXR1cm4gJGFzc2lnbih7fSwgQSlbU10gIT0gNyB8fCBPYmplY3Qua2V5cygkYXNzaWduKHt9LCBCKSkuam9pbignJykgIT0gSztcbn0pID8gZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgdmFyIFQgPSB0b09iamVjdCh0YXJnZXQpO1xuICB2YXIgYUxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHZhciBpbmRleCA9IDE7XG4gIHZhciBnZXRTeW1ib2xzID0gZ09QUy5mO1xuICB2YXIgaXNFbnVtID0gcElFLmY7XG4gIHdoaWxlIChhTGVuID4gaW5kZXgpIHtcbiAgICB2YXIgUyA9IElPYmplY3QoYXJndW1lbnRzW2luZGV4KytdKTtcbiAgICB2YXIga2V5cyA9IGdldFN5bWJvbHMgPyBnZXRLZXlzKFMpLmNvbmNhdChnZXRTeW1ib2xzKFMpKSA6IGdldEtleXMoUyk7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciBqID0gMDtcbiAgICB2YXIga2V5O1xuICAgIHdoaWxlIChsZW5ndGggPiBqKSBpZiAoaXNFbnVtLmNhbGwoUywga2V5ID0ga2V5c1tqKytdKSkgVFtrZXldID0gU1trZXldO1xuICB9IHJldHVybiBUO1xufSA6ICRhc3NpZ247XG4iLCIndXNlIHN0cmljdCc7XG52YXIgcmVkZWZpbmVBbGwgPSByZXF1aXJlKCcuL19yZWRlZmluZS1hbGwnKTtcbnZhciBnZXRXZWFrID0gcmVxdWlyZSgnLi9fbWV0YScpLmdldFdlYWs7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGFuSW5zdGFuY2UgPSByZXF1aXJlKCcuL19hbi1pbnN0YW5jZScpO1xudmFyIGZvck9mID0gcmVxdWlyZSgnLi9fZm9yLW9mJyk7XG52YXIgY3JlYXRlQXJyYXlNZXRob2QgPSByZXF1aXJlKCcuL19hcnJheS1tZXRob2RzJyk7XG52YXIgJGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHZhbGlkYXRlID0gcmVxdWlyZSgnLi9fdmFsaWRhdGUtY29sbGVjdGlvbicpO1xudmFyIGFycmF5RmluZCA9IGNyZWF0ZUFycmF5TWV0aG9kKDUpO1xudmFyIGFycmF5RmluZEluZGV4ID0gY3JlYXRlQXJyYXlNZXRob2QoNik7XG52YXIgaWQgPSAwO1xuXG4vLyBmYWxsYmFjayBmb3IgdW5jYXVnaHQgZnJvemVuIGtleXNcbnZhciB1bmNhdWdodEZyb3plblN0b3JlID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgcmV0dXJuIHRoYXQuX2wgfHwgKHRoYXQuX2wgPSBuZXcgVW5jYXVnaHRGcm96ZW5TdG9yZSgpKTtcbn07XG52YXIgVW5jYXVnaHRGcm96ZW5TdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hID0gW107XG59O1xudmFyIGZpbmRVbmNhdWdodEZyb3plbiA9IGZ1bmN0aW9uIChzdG9yZSwga2V5KSB7XG4gIHJldHVybiBhcnJheUZpbmQoc3RvcmUuYSwgZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XG4gIH0pO1xufTtcblVuY2F1Z2h0RnJvemVuU3RvcmUucHJvdG90eXBlID0ge1xuICBnZXQ6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZW50cnkgPSBmaW5kVW5jYXVnaHRGcm96ZW4odGhpcywga2V5KTtcbiAgICBpZiAoZW50cnkpIHJldHVybiBlbnRyeVsxXTtcbiAgfSxcbiAgaGFzOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuICEhZmluZFVuY2F1Z2h0RnJvemVuKHRoaXMsIGtleSk7XG4gIH0sXG4gIHNldDogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgZW50cnkgPSBmaW5kVW5jYXVnaHRGcm96ZW4odGhpcywga2V5KTtcbiAgICBpZiAoZW50cnkpIGVudHJ5WzFdID0gdmFsdWU7XG4gICAgZWxzZSB0aGlzLmEucHVzaChba2V5LCB2YWx1ZV0pO1xuICB9LFxuICAnZGVsZXRlJzogZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBpbmRleCA9IGFycmF5RmluZEluZGV4KHRoaXMuYSwgZnVuY3Rpb24gKGl0KSB7XG4gICAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcbiAgICB9KTtcbiAgICBpZiAofmluZGV4KSB0aGlzLmEuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gISF+aW5kZXg7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpIHtcbiAgICB2YXIgQyA9IHdyYXBwZXIoZnVuY3Rpb24gKHRoYXQsIGl0ZXJhYmxlKSB7XG4gICAgICBhbkluc3RhbmNlKHRoYXQsIEMsIE5BTUUsICdfaScpO1xuICAgICAgdGhhdC5fdCA9IE5BTUU7ICAgICAgLy8gY29sbGVjdGlvbiB0eXBlXG4gICAgICB0aGF0Ll9pID0gaWQrKzsgICAgICAvLyBjb2xsZWN0aW9uIGlkXG4gICAgICB0aGF0Ll9sID0gdW5kZWZpbmVkOyAvLyBsZWFrIHN0b3JlIGZvciB1bmNhdWdodCBmcm96ZW4gb2JqZWN0c1xuICAgICAgaWYgKGl0ZXJhYmxlICE9IHVuZGVmaW5lZCkgZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgIH0pO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4zLjMuMiBXZWFrTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuNC4zLjMgV2Vha1NldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKCFpc09iamVjdChrZXkpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBkYXRhID0gZ2V0V2VhayhrZXkpO1xuICAgICAgICBpZiAoZGF0YSA9PT0gdHJ1ZSkgcmV0dXJuIHVuY2F1Z2h0RnJvemVuU3RvcmUodmFsaWRhdGUodGhpcywgTkFNRSkpWydkZWxldGUnXShrZXkpO1xuICAgICAgICByZXR1cm4gZGF0YSAmJiAkaGFzKGRhdGEsIHRoaXMuX2kpICYmIGRlbGV0ZSBkYXRhW3RoaXMuX2ldO1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjMuMy40IFdlYWtNYXAucHJvdG90eXBlLmhhcyhrZXkpXG4gICAgICAvLyAyMy40LjMuNCBXZWFrU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpIHtcbiAgICAgICAgaWYgKCFpc09iamVjdChrZXkpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBkYXRhID0gZ2V0V2VhayhrZXkpO1xuICAgICAgICBpZiAoZGF0YSA9PT0gdHJ1ZSkgcmV0dXJuIHVuY2F1Z2h0RnJvemVuU3RvcmUodmFsaWRhdGUodGhpcywgTkFNRSkpLmhhcyhrZXkpO1xuICAgICAgICByZXR1cm4gZGF0YSAmJiAkaGFzKGRhdGEsIHRoaXMuX2kpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uICh0aGF0LCBrZXksIHZhbHVlKSB7XG4gICAgdmFyIGRhdGEgPSBnZXRXZWFrKGFuT2JqZWN0KGtleSksIHRydWUpO1xuICAgIGlmIChkYXRhID09PSB0cnVlKSB1bmNhdWdodEZyb3plblN0b3JlKHRoYXQpLnNldChrZXksIHZhbHVlKTtcbiAgICBlbHNlIGRhdGFbdGhhdC5faV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhhdDtcbiAgfSxcbiAgdWZzdG9yZTogdW5jYXVnaHRGcm96ZW5TdG9yZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBlYWNoID0gcmVxdWlyZSgnLi9fYXJyYXktbWV0aG9kcycpKDApO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBtZXRhID0gcmVxdWlyZSgnLi9fbWV0YScpO1xudmFyIGFzc2lnbiA9IHJlcXVpcmUoJy4vX29iamVjdC1hc3NpZ24nKTtcbnZhciB3ZWFrID0gcmVxdWlyZSgnLi9fY29sbGVjdGlvbi13ZWFrJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG52YXIgdmFsaWRhdGUgPSByZXF1aXJlKCcuL192YWxpZGF0ZS1jb2xsZWN0aW9uJyk7XG52YXIgV0VBS19NQVAgPSAnV2Vha01hcCc7XG52YXIgZ2V0V2VhayA9IG1ldGEuZ2V0V2VhaztcbnZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlO1xudmFyIHVuY2F1Z2h0RnJvemVuU3RvcmUgPSB3ZWFrLnVmc3RvcmU7XG52YXIgdG1wID0ge307XG52YXIgSW50ZXJuYWxNYXA7XG5cbnZhciB3cmFwcGVyID0gZnVuY3Rpb24gKGdldCkge1xuICByZXR1cm4gZnVuY3Rpb24gV2Vha01hcCgpIHtcbiAgICByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTtcbiAgfTtcbn07XG5cbnZhciBtZXRob2RzID0ge1xuICAvLyAyMy4zLjMuMyBXZWFrTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpIHtcbiAgICBpZiAoaXNPYmplY3Qoa2V5KSkge1xuICAgICAgdmFyIGRhdGEgPSBnZXRXZWFrKGtleSk7XG4gICAgICBpZiAoZGF0YSA9PT0gdHJ1ZSkgcmV0dXJuIHVuY2F1Z2h0RnJvemVuU3RvcmUodmFsaWRhdGUodGhpcywgV0VBS19NQVApKS5nZXQoa2V5KTtcbiAgICAgIHJldHVybiBkYXRhID8gZGF0YVt0aGlzLl9pXSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0sXG4gIC8vIDIzLjMuMy41IFdlYWtNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHdlYWsuZGVmKHZhbGlkYXRlKHRoaXMsIFdFQUtfTUFQKSwga2V5LCB2YWx1ZSk7XG4gIH1cbn07XG5cbi8vIDIzLjMgV2Vha01hcCBPYmplY3RzXG52YXIgJFdlYWtNYXAgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvbGxlY3Rpb24nKShXRUFLX01BUCwgd3JhcHBlciwgbWV0aG9kcywgd2VhaywgdHJ1ZSwgdHJ1ZSk7XG5cbi8vIElFMTEgV2Vha01hcCBmcm96ZW4ga2V5cyBmaXhcbmlmIChmYWlscyhmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgJFdlYWtNYXAoKS5zZXQoKE9iamVjdC5mcmVlemUgfHwgT2JqZWN0KSh0bXApLCA3KS5nZXQodG1wKSAhPSA3OyB9KSkge1xuICBJbnRlcm5hbE1hcCA9IHdlYWsuZ2V0Q29uc3RydWN0b3Iod3JhcHBlciwgV0VBS19NQVApO1xuICBhc3NpZ24oSW50ZXJuYWxNYXAucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgbWV0YS5ORUVEID0gdHJ1ZTtcbiAgZWFjaChbJ2RlbGV0ZScsICdoYXMnLCAnZ2V0JywgJ3NldCddLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHByb3RvID0gJFdlYWtNYXAucHJvdG90eXBlO1xuICAgIHZhciBtZXRob2QgPSBwcm90b1trZXldO1xuICAgIHJlZGVmaW5lKHByb3RvLCBrZXksIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAvLyBzdG9yZSBmcm96ZW4gb2JqZWN0cyBvbiBpbnRlcm5hbCB3ZWFrbWFwIHNoaW1cbiAgICAgIGlmIChpc09iamVjdChhKSAmJiAhaXNFeHRlbnNpYmxlKGEpKSB7XG4gICAgICAgIGlmICghdGhpcy5fZikgdGhpcy5fZiA9IG5ldyBJbnRlcm5hbE1hcCgpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fZltrZXldKGEsIGIpO1xuICAgICAgICByZXR1cm4ga2V5ID09ICdzZXQnID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgIC8vIHN0b3JlIGFsbCB0aGUgcmVzdCBvbiBuYXRpdmUgd2Vha21hcFxuICAgICAgfSByZXR1cm4gbWV0aG9kLmNhbGwodGhpcywgYSwgYik7XG4gICAgfSk7XG4gIH0pO1xufVxuIiwiLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9wcm9wb3NhbC1zZXRtYXAtb2Zmcm9tLyNzZWMtd2Vha21hcC5vZlxucmVxdWlyZSgnLi9fc2V0LWNvbGxlY3Rpb24tb2YnKSgnV2Vha01hcCcpO1xuIiwiLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9wcm9wb3NhbC1zZXRtYXAtb2Zmcm9tLyNzZWMtd2Vha21hcC5mcm9tXG5yZXF1aXJlKCcuL19zZXQtY29sbGVjdGlvbi1mcm9tJykoJ1dlYWtNYXAnKTtcbiIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYud2Vhay1tYXAnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LndlYWstbWFwLm9mJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNy53ZWFrLW1hcC5mcm9tJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5XZWFrTWFwO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgaW5kZXgsIHZhbHVlKSB7XG4gIGlmIChpbmRleCBpbiBvYmplY3QpICRkZWZpbmVQcm9wZXJ0eS5mKG9iamVjdCwgaW5kZXgsIGNyZWF0ZURlc2MoMCwgdmFsdWUpKTtcbiAgZWxzZSBvYmplY3RbaW5kZXhdID0gdmFsdWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpO1xudmFyIGNhbGwgPSByZXF1aXJlKCcuL19pdGVyLWNhbGwnKTtcbnZhciBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vX2lzLWFycmF5LWl0ZXInKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIGNyZWF0ZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fY3JlYXRlLXByb3BlcnR5Jyk7XG52YXIgZ2V0SXRlckZuID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhcmVxdWlyZSgnLi9faXRlci1kZXRlY3QnKShmdW5jdGlvbiAoaXRlcikgeyBBcnJheS5mcm9tKGl0ZXIpOyB9KSwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gIGZyb206IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlIC8qICwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQgKi8pIHtcbiAgICB2YXIgTyA9IHRvT2JqZWN0KGFycmF5TGlrZSk7XG4gICAgdmFyIEMgPSB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5O1xuICAgIHZhciBhTGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB2YXIgbWFwZm4gPSBhTGVuID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWQ7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgaXRlckZuID0gZ2V0SXRlckZuKE8pO1xuICAgIHZhciBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYgKG1hcHBpbmcpIG1hcGZuID0gY3R4KG1hcGZuLCBhTGVuID4gMiA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZCwgMik7XG4gICAgLy8gaWYgb2JqZWN0IGlzbid0IGl0ZXJhYmxlIG9yIGl0J3MgYXJyYXkgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yIC0gdXNlIHNpbXBsZSBjYXNlXG4gICAgaWYgKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKSB7XG4gICAgICBmb3IgKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoTyksIHJlc3VsdCA9IG5ldyBDKCk7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKykge1xuICAgICAgICBjcmVhdGVQcm9wZXJ0eShyZXN1bHQsIGluZGV4LCBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgbWFwZm4sIFtzdGVwLnZhbHVlLCBpbmRleF0sIHRydWUpIDogc3RlcC52YWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICAgIGZvciAocmVzdWx0ID0gbmV3IEMobGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgY3JlYXRlUHJvcGVydHkocmVzdWx0LCBpbmRleCwgbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuQXJyYXkuZnJvbTtcbiIsImNvbnN0IHJlc2VydmVkVGFnTGlzdCA9IG5ldyBTZXQoW1xuICAnYW5ub3RhdGlvbi14bWwnLFxuICAnY29sb3ItcHJvZmlsZScsXG4gICdmb250LWZhY2UnLFxuICAnZm9udC1mYWNlLXNyYycsXG4gICdmb250LWZhY2UtdXJpJyxcbiAgJ2ZvbnQtZmFjZS1mb3JtYXQnLFxuICAnZm9udC1mYWNlLW5hbWUnLFxuICAnbWlzc2luZy1nbHlwaCcsXG5dKTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gbG9jYWxOYW1lXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRDdXN0b21FbGVtZW50TmFtZShsb2NhbE5hbWUpIHtcbiAgY29uc3QgcmVzZXJ2ZWQgPSByZXNlcnZlZFRhZ0xpc3QuaGFzKGxvY2FsTmFtZSk7XG4gIGNvbnN0IHZhbGlkRm9ybSA9IC9eW2Etel1bLjAtOV9hLXpdKi1bXFwtLjAtOV9hLXpdKiQvLnRlc3QobG9jYWxOYW1lKTtcbiAgcmV0dXJuICFyZXNlcnZlZCAmJiB2YWxpZEZvcm07XG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Nvbm5lY3RlZChub2RlKSB7XG4gIC8vIFVzZSBgTm9kZSNpc0Nvbm5lY3RlZGAsIGlmIGRlZmluZWQuXG4gIGNvbnN0IG5hdGl2ZVZhbHVlID0gbm9kZS5pc0Nvbm5lY3RlZDtcbiAgaWYgKG5hdGl2ZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbmF0aXZlVmFsdWU7XG4gIH1cblxuICAvKiogQHR5cGUgez9Ob2RlfHVuZGVmaW5lZH0gKi9cbiAgbGV0IGN1cnJlbnQgPSBub2RlO1xuICB3aGlsZSAoY3VycmVudCAmJiAhKGN1cnJlbnQuX19DRV9pc0ltcG9ydERvY3VtZW50IHx8IGN1cnJlbnQgaW5zdGFuY2VvZiBEb2N1bWVudCkpIHtcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnROb2RlIHx8ICh3aW5kb3cuU2hhZG93Um9vdCAmJiBjdXJyZW50IGluc3RhbmNlb2YgU2hhZG93Um9vdCA/IGN1cnJlbnQuaG9zdCA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmV0dXJuICEhKGN1cnJlbnQgJiYgKGN1cnJlbnQuX19DRV9pc0ltcG9ydERvY3VtZW50IHx8IGN1cnJlbnQgaW5zdGFuY2VvZiBEb2N1bWVudCkpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IU5vZGV9IHJvb3RcbiAqIEBwYXJhbSB7IU5vZGV9IHN0YXJ0XG4gKiBAcmV0dXJuIHs/Tm9kZX1cbiAqL1xuZnVuY3Rpb24gbmV4dFNpYmxpbmdPckFuY2VzdG9yU2libGluZyhyb290LCBzdGFydCkge1xuICBsZXQgbm9kZSA9IHN0YXJ0O1xuICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSByb290ICYmICFub2RlLm5leHRTaWJsaW5nKSB7XG4gICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgfVxuICByZXR1cm4gKCFub2RlIHx8IG5vZGUgPT09IHJvb3QpID8gbnVsbCA6IG5vZGUubmV4dFNpYmxpbmc7XG59XG5cbi8qKlxuICogQHBhcmFtIHshTm9kZX0gcm9vdFxuICogQHBhcmFtIHshTm9kZX0gc3RhcnRcbiAqIEByZXR1cm4gez9Ob2RlfVxuICovXG5mdW5jdGlvbiBuZXh0Tm9kZShyb290LCBzdGFydCkge1xuICByZXR1cm4gc3RhcnQuZmlyc3RDaGlsZCA/IHN0YXJ0LmZpcnN0Q2hpbGQgOiBuZXh0U2libGluZ09yQW5jZXN0b3JTaWJsaW5nKHJvb3QsIHN0YXJ0KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFOb2RlfSByb290XG4gKiBAcGFyYW0geyFmdW5jdGlvbighRWxlbWVudCl9IGNhbGxiYWNrXG4gKiBAcGFyYW0geyFTZXQ8Tm9kZT49fSB2aXNpdGVkSW1wb3J0c1xuICovXG5leHBvcnQgZnVuY3Rpb24gd2Fsa0RlZXBEZXNjZW5kYW50RWxlbWVudHMocm9vdCwgY2FsbGJhY2ssIHZpc2l0ZWRJbXBvcnRzID0gbmV3IFNldCgpKSB7XG4gIGxldCBub2RlID0gcm9vdDtcbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSAvKiogQHR5cGUgeyFFbGVtZW50fSAqLyhub2RlKTtcblxuICAgICAgY2FsbGJhY2soZWxlbWVudCk7XG5cbiAgICAgIGNvbnN0IGxvY2FsTmFtZSA9IGVsZW1lbnQubG9jYWxOYW1lO1xuICAgICAgaWYgKGxvY2FsTmFtZSA9PT0gJ2xpbmsnICYmIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2ltcG9ydCcpIHtcbiAgICAgICAgLy8gSWYgdGhpcyBpbXBvcnQgKHBvbHlmaWxsZWQgb3Igbm90KSBoYXMgaXQncyByb290IG5vZGUgYXZhaWxhYmxlLFxuICAgICAgICAvLyB3YWxrIGl0LlxuICAgICAgICBjb25zdCBpbXBvcnROb2RlID0gLyoqIEB0eXBlIHshTm9kZX0gKi8gKGVsZW1lbnQuaW1wb3J0KTtcbiAgICAgICAgaWYgKGltcG9ydE5vZGUgaW5zdGFuY2VvZiBOb2RlICYmICF2aXNpdGVkSW1wb3J0cy5oYXMoaW1wb3J0Tm9kZSkpIHtcbiAgICAgICAgICAvLyBQcmV2ZW50IG11bHRpcGxlIHdhbGtzIG9mIHRoZSBzYW1lIGltcG9ydCByb290LlxuICAgICAgICAgIHZpc2l0ZWRJbXBvcnRzLmFkZChpbXBvcnROb2RlKTtcblxuICAgICAgICAgIGZvciAobGV0IGNoaWxkID0gaW1wb3J0Tm9kZS5maXJzdENoaWxkOyBjaGlsZDsgY2hpbGQgPSBjaGlsZC5uZXh0U2libGluZykge1xuICAgICAgICAgICAgd2Fsa0RlZXBEZXNjZW5kYW50RWxlbWVudHMoY2hpbGQsIGNhbGxiYWNrLCB2aXNpdGVkSW1wb3J0cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWdub3JlIGRlc2NlbmRhbnRzIG9mIGltcG9ydCBsaW5rcyB0byBwcmV2ZW50IGF0dGVtcHRpbmcgdG8gd2FsayB0aGVcbiAgICAgICAgLy8gZWxlbWVudHMgY3JlYXRlZCBieSB0aGUgSFRNTCBJbXBvcnRzIHBvbHlmaWxsIHRoYXQgd2UganVzdCB3YWxrZWRcbiAgICAgICAgLy8gYWJvdmUuXG4gICAgICAgIG5vZGUgPSBuZXh0U2libGluZ09yQW5jZXN0b3JTaWJsaW5nKHJvb3QsIGVsZW1lbnQpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAobG9jYWxOYW1lID09PSAndGVtcGxhdGUnKSB7XG4gICAgICAgIC8vIElnbm9yZSBkZXNjZW5kYW50cyBvZiB0ZW1wbGF0ZXMuIFRoZXJlIHNob3VsZG4ndCBiZSBhbnkgZGVzY2VuZGFudHNcbiAgICAgICAgLy8gYmVjYXVzZSB0aGV5IHdpbGwgYmUgbW92ZWQgaW50byBgLmNvbnRlbnRgIGR1cmluZyBjb25zdHJ1Y3Rpb24gaW5cbiAgICAgICAgLy8gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IHRlbXBsYXRlIGJ1dCwgaW4gY2FzZSB0aGV5IGV4aXN0IGFuZCBhcmUgc3RpbGxcbiAgICAgICAgLy8gd2FpdGluZyB0byBiZSBtb3ZlZCBieSBhIHBvbHlmaWxsLCB0aGV5IHdpbGwgYmUgaWdub3JlZC5cbiAgICAgICAgbm9kZSA9IG5leHRTaWJsaW5nT3JBbmNlc3RvclNpYmxpbmcocm9vdCwgZWxlbWVudCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBXYWxrIHNoYWRvdyByb290cy5cbiAgICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSBlbGVtZW50Ll9fQ0Vfc2hhZG93Um9vdDtcbiAgICAgIGlmIChzaGFkb3dSb290KSB7XG4gICAgICAgIGZvciAobGV0IGNoaWxkID0gc2hhZG93Um9vdC5maXJzdENoaWxkOyBjaGlsZDsgY2hpbGQgPSBjaGlsZC5uZXh0U2libGluZykge1xuICAgICAgICAgIHdhbGtEZWVwRGVzY2VuZGFudEVsZW1lbnRzKGNoaWxkLCBjYWxsYmFjaywgdmlzaXRlZEltcG9ydHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbm9kZSA9IG5leHROb2RlKHJvb3QsIG5vZGUpO1xuICB9XG59XG5cbi8qKlxuICogVXNlZCB0byBzdXBwcmVzcyBDbG9zdXJlJ3MgXCJNb2RpZnlpbmcgdGhlIHByb3RvdHlwZSBpcyBvbmx5IGFsbG93ZWQgaWYgdGhlXG4gKiBjb25zdHJ1Y3RvciBpcyBpbiB0aGUgc2FtZSBzY29wZVwiIHdhcm5pbmcgd2l0aG91dCB1c2luZ1xuICogYEBzdXBwcmVzcyB7bmV3Q2hlY2tUeXBlcywgZHVwbGljYXRlfWAgYmVjYXVzZSBgbmV3Q2hlY2tUeXBlc2AgaXMgdG9vIGJyb2FkLlxuICpcbiAqIEBwYXJhbSB7IU9iamVjdH0gZGVzdGluYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9wZXJ0eVVuY2hlY2tlZChkZXN0aW5hdGlvbiwgbmFtZSwgdmFsdWUpIHtcbiAgZGVzdGluYXRpb25bbmFtZV0gPSB2YWx1ZTtcbn1cbiIsIi8qKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuY29uc3QgQ3VzdG9tRWxlbWVudFN0YXRlID0ge1xuICBjdXN0b206IDEsXG4gIGZhaWxlZDogMixcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEN1c3RvbUVsZW1lbnRTdGF0ZTtcbiIsImltcG9ydCAqIGFzIFV0aWxpdGllcyBmcm9tICcuL1V0aWxpdGllcy5qcyc7XG5pbXBvcnQgQ0VTdGF0ZSBmcm9tICcuL0N1c3RvbUVsZW1lbnRTdGF0ZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEN1c3RvbUVsZW1lbnRJbnRlcm5hbHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiogQHR5cGUgeyFNYXA8c3RyaW5nLCAhQ3VzdG9tRWxlbWVudERlZmluaXRpb24+fSAqL1xuICAgIHRoaXMuX2xvY2FsTmFtZVRvRGVmaW5pdGlvbiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKiBAdHlwZSB7IU1hcDwhRnVuY3Rpb24sICFDdXN0b21FbGVtZW50RGVmaW5pdGlvbj59ICovXG4gICAgdGhpcy5fY29uc3RydWN0b3JUb0RlZmluaXRpb24gPSBuZXcgTWFwKCk7XG5cbiAgICAvKiogQHR5cGUgeyFBcnJheTwhZnVuY3Rpb24oIU5vZGUpPn0gKi9cbiAgICB0aGlzLl9wYXRjaGVzID0gW107XG5cbiAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5faGFzUGF0Y2hlcyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhbE5hbWVcbiAgICogQHBhcmFtIHshQ3VzdG9tRWxlbWVudERlZmluaXRpb259IGRlZmluaXRpb25cbiAgICovXG4gIHNldERlZmluaXRpb24obG9jYWxOYW1lLCBkZWZpbml0aW9uKSB7XG4gICAgdGhpcy5fbG9jYWxOYW1lVG9EZWZpbml0aW9uLnNldChsb2NhbE5hbWUsIGRlZmluaXRpb24pO1xuICAgIHRoaXMuX2NvbnN0cnVjdG9yVG9EZWZpbml0aW9uLnNldChkZWZpbml0aW9uLmNvbnN0cnVjdG9yLCBkZWZpbml0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYWxOYW1lXG4gICAqIEByZXR1cm4geyFDdXN0b21FbGVtZW50RGVmaW5pdGlvbnx1bmRlZmluZWR9XG4gICAqL1xuICBsb2NhbE5hbWVUb0RlZmluaXRpb24obG9jYWxOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2FsTmFtZVRvRGVmaW5pdGlvbi5nZXQobG9jYWxOYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFGdW5jdGlvbn0gY29uc3RydWN0b3JcbiAgICogQHJldHVybiB7IUN1c3RvbUVsZW1lbnREZWZpbml0aW9ufHVuZGVmaW5lZH1cbiAgICovXG4gIGNvbnN0cnVjdG9yVG9EZWZpbml0aW9uKGNvbnN0cnVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cnVjdG9yVG9EZWZpbml0aW9uLmdldChjb25zdHJ1Y3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshZnVuY3Rpb24oIU5vZGUpfSBsaXN0ZW5lclxuICAgKi9cbiAgYWRkUGF0Y2gobGlzdGVuZXIpIHtcbiAgICB0aGlzLl9oYXNQYXRjaGVzID0gdHJ1ZTtcbiAgICB0aGlzLl9wYXRjaGVzLnB1c2gobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAgICovXG4gIHBhdGNoVHJlZShub2RlKSB7XG4gICAgaWYgKCF0aGlzLl9oYXNQYXRjaGVzKSByZXR1cm47XG5cbiAgICBVdGlsaXRpZXMud2Fsa0RlZXBEZXNjZW5kYW50RWxlbWVudHMobm9kZSwgZWxlbWVudCA9PiB0aGlzLnBhdGNoKGVsZW1lbnQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gICAqL1xuICBwYXRjaChub2RlKSB7XG4gICAgaWYgKCF0aGlzLl9oYXNQYXRjaGVzKSByZXR1cm47XG5cbiAgICBpZiAobm9kZS5fX0NFX3BhdGNoZWQpIHJldHVybjtcbiAgICBub2RlLl9fQ0VfcGF0Y2hlZCA9IHRydWU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3BhdGNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3BhdGNoZXNbaV0obm9kZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IU5vZGV9IHJvb3RcbiAgICovXG4gIGNvbm5lY3RUcmVlKHJvb3QpIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IFtdO1xuXG4gICAgVXRpbGl0aWVzLndhbGtEZWVwRGVzY2VuZGFudEVsZW1lbnRzKHJvb3QsIGVsZW1lbnQgPT4gZWxlbWVudHMucHVzaChlbGVtZW50KSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICBpZiAoZWxlbWVudC5fX0NFX3N0YXRlID09PSBDRVN0YXRlLmN1c3RvbSkge1xuICAgICAgICBpZiAoVXRpbGl0aWVzLmlzQ29ubmVjdGVkKGVsZW1lbnQpKSB7XG4gICAgICAgICAgdGhpcy5jb25uZWN0ZWRDYWxsYmFjayhlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cGdyYWRlRWxlbWVudChlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshTm9kZX0gcm9vdFxuICAgKi9cbiAgZGlzY29ubmVjdFRyZWUocm9vdCkge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gW107XG5cbiAgICBVdGlsaXRpZXMud2Fsa0RlZXBEZXNjZW5kYW50RWxlbWVudHMocm9vdCwgZWxlbWVudCA9PiBlbGVtZW50cy5wdXNoKGVsZW1lbnQpKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcbiAgICAgIGlmIChlbGVtZW50Ll9fQ0Vfc3RhdGUgPT09IENFU3RhdGUuY3VzdG9tKSB7XG4gICAgICAgIHRoaXMuZGlzY29ubmVjdGVkQ2FsbGJhY2soZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZ3JhZGVzIGFsbCB1bmN1c3RvbWl6ZWQgY3VzdG9tIGVsZW1lbnRzIGF0IGFuZCBiZWxvdyBhIHJvb3Qgbm9kZSBmb3JcbiAgICogd2hpY2ggdGhlcmUgaXMgYSBkZWZpbml0aW9uLiBXaGVuIGN1c3RvbSBlbGVtZW50IHJlYWN0aW9uIGNhbGxiYWNrcyBhcmVcbiAgICogYXNzdW1lZCB0byBiZSBjYWxsZWQgc3luY2hyb25vdXNseSAod2hpY2gsIGJ5IHRoZSBjdXJyZW50IERPTSAvIEhUTUwgc3BlY1xuICAgKiBkZWZpbml0aW9ucywgdGhleSBhcmUgKm5vdCopLCBjYWxsYmFja3MgZm9yIGJvdGggZWxlbWVudHMgY3VzdG9taXplZFxuICAgKiBzeW5jaHJvbm91c2x5IGJ5IHRoZSBwYXJzZXIgYW5kIGVsZW1lbnRzIGJlaW5nIHVwZ3JhZGVkIG9jY3VyIGluIHRoZSBzYW1lXG4gICAqIHJlbGF0aXZlIG9yZGVyLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGZ1bmN0aW9uLCB3aGVuIHVzZWQgdG8gc2ltdWxhdGUgdGhlIGNvbnN0cnVjdGlvbiBvZiBhIHRyZWUgdGhhdFxuICAgKiBpcyBhbHJlYWR5IGNyZWF0ZWQgYnV0IG5vdCBjdXN0b21pemVkIChpLmUuIGJ5IHRoZSBwYXJzZXIpLCBkb2VzICpub3QqXG4gICAqIHByZXZlbnQgdGhlIGVsZW1lbnQgZnJvbSByZWFkaW5nIHRoZSAnZmluYWwnICh0cnVlKSBzdGF0ZSBvZiB0aGUgdHJlZS4gRm9yXG4gICAqIGV4YW1wbGUsIHRoZSBlbGVtZW50LCBkdXJpbmcgdHJ1bHkgc3luY2hyb25vdXMgcGFyc2luZyAvIGNvbnN0cnVjdGlvbiB3b3VsZFxuICAgKiBzZWUgdGhhdCBpdCBjb250YWlucyBubyBjaGlsZHJlbiBhcyB0aGV5IGhhdmUgbm90IHlldCBiZWVuIGluc2VydGVkLlxuICAgKiBIb3dldmVyLCB0aGlzIGZ1bmN0aW9uIGRvZXMgbm90IG1vZGlmeSB0aGUgdHJlZSwgdGhlIGVsZW1lbnQgd2lsbFxuICAgKiAoaW5jb3JyZWN0bHkpIGhhdmUgY2hpbGRyZW4uIEFkZGl0aW9uYWxseSwgc2VsZi1tb2RpZmljYXRpb24gcmVzdHJpY3Rpb25zXG4gICAqIGZvciBjdXN0b20gZWxlbWVudCBjb25zdHJ1Y3RvcnMgaW1wb3NlZCBieSB0aGUgRE9NIHNwZWMgYXJlICpub3QqIGVuZm9yY2VkLlxuICAgKlxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIG5lc3RlZCBsaXN0IHNob3dzIHRoZSBzdGVwcyBleHRlbmRpbmcgZG93biBmcm9tIHRoZSBIVE1MXG4gICAqIHNwZWMncyBwYXJzaW5nIHNlY3Rpb24gdGhhdCBjYXVzZSBlbGVtZW50cyB0byBiZSBzeW5jaHJvbm91c2x5IGNyZWF0ZWQgYW5kXG4gICAqIHVwZ3JhZGVkOlxuICAgKlxuICAgKiBUaGUgXCJpbiBib2R5XCIgaW5zZXJ0aW9uIG1vZGU6XG4gICAqIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI3BhcnNpbmctbWFpbi1pbmJvZHlcbiAgICogLSBTd2l0Y2ggb24gdG9rZW46XG4gICAqICAgLi4gb3RoZXIgY2FzZXMgLi5cbiAgICogICAtPiBBbnkgb3RoZXIgc3RhcnQgdGFnXG4gICAqICAgICAgLSBbSW5zZXJ0IGFuIEhUTUwgZWxlbWVudF0oYmVsb3cpIGZvciB0aGUgdG9rZW4uXG4gICAqXG4gICAqIEluc2VydCBhbiBIVE1MIGVsZW1lbnQ6XG4gICAqIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2luc2VydC1hbi1odG1sLWVsZW1lbnRcbiAgICogLSBJbnNlcnQgYSBmb3JlaWduIGVsZW1lbnQgZm9yIHRoZSB0b2tlbiBpbiB0aGUgSFRNTCBuYW1lc3BhY2U6XG4gICAqICAgaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjaW5zZXJ0LWEtZm9yZWlnbi1lbGVtZW50XG4gICAqICAgLSBDcmVhdGUgYW4gZWxlbWVudCBmb3IgYSB0b2tlbjpcbiAgICogICAgIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NyZWF0ZS1hbi1lbGVtZW50LWZvci10aGUtdG9rZW5cbiAgICogICAgIC0gV2lsbCBleGVjdXRlIHNjcmlwdCBmbGFnIGlzIHRydWU/XG4gICAqICAgICAgIC0gKEVsZW1lbnQgcXVldWUgcHVzaGVkIHRvIHRoZSBjdXN0b20gZWxlbWVudCByZWFjdGlvbnMgc3RhY2suKVxuICAgKiAgICAgLSBDcmVhdGUgYW4gZWxlbWVudDpcbiAgICogICAgICAgaHR0cHM6Ly9kb20uc3BlYy53aGF0d2cub3JnLyNjb25jZXB0LWNyZWF0ZS1lbGVtZW50XG4gICAqICAgICAgIC0gU3luYyBDRSBmbGFnIGlzIHRydWU/XG4gICAqICAgICAgICAgLSBDb25zdHJ1Y3RvciBjYWxsZWQuXG4gICAqICAgICAgICAgLSBTZWxmLW1vZGlmaWNhdGlvbiByZXN0cmljdGlvbnMgZW5mb3JjZWQuXG4gICAqICAgICAgIC0gU3luYyBDRSBmbGFnIGlzIGZhbHNlP1xuICAgKiAgICAgICAgIC0gKFVwZ3JhZGUgcmVhY3Rpb24gZW5xdWV1ZWQuKVxuICAgKiAgICAgLSBBdHRyaWJ1dGVzIGFwcGVuZGVkIHRvIGVsZW1lbnQuXG4gICAqICAgICAgIChgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrYCByZWFjdGlvbnMgZW5xdWV1ZWQuKVxuICAgKiAgICAgLSBXaWxsIGV4ZWN1dGUgc2NyaXB0IGZsYWcgaXMgdHJ1ZT9cbiAgICogICAgICAgLSAoRWxlbWVudCBxdWV1ZSBwb3BwZWQgZnJvbSB0aGUgY3VzdG9tIGVsZW1lbnQgcmVhY3Rpb25zIHN0YWNrLlxuICAgKiAgICAgICAgIFJlYWN0aW9ucyBpbiB0aGUgcG9wcGVkIHN0YWNrIGFyZSBpbnZva2VkLilcbiAgICogICAtIChFbGVtZW50IHF1ZXVlIHB1c2hlZCB0byB0aGUgY3VzdG9tIGVsZW1lbnQgcmVhY3Rpb25zIHN0YWNrLilcbiAgICogICAtIEluc2VydCB0aGUgZWxlbWVudDpcbiAgICogICAgIGh0dHBzOi8vZG9tLnNwZWMud2hhdHdnLm9yZy8jY29uY2VwdC1ub2RlLWluc2VydFxuICAgKiAgICAgLSBTaGFkb3ctaW5jbHVkaW5nIGRlc2NlbmRhbnRzIGFyZSBjb25uZWN0ZWQuIER1cmluZyBwYXJzaW5nXG4gICAqICAgICAgIGNvbnN0cnVjdGlvbiwgdGhlcmUgYXJlIG5vIHNoYWRvdy0qZXhjbHVkaW5nKiBkZXNjZW5kYW50cy5cbiAgICogICAgICAgSG93ZXZlciwgdGhlIGNvbnN0cnVjdG9yIG1heSBoYXZlIHZhbGlkbHkgYXR0YWNoZWQgYSBzaGFkb3dcbiAgICogICAgICAgdHJlZSB0byBpdHNlbGYgYW5kIGFkZGVkIGRlc2NlbmRhbnRzIHRvIHRoYXQgc2hhZG93IHRyZWUuXG4gICAqICAgICAgIChgY29ubmVjdGVkQ2FsbGJhY2tgIHJlYWN0aW9ucyBlbnF1ZXVlZC4pXG4gICAqICAgLSAoRWxlbWVudCBxdWV1ZSBwb3BwZWQgZnJvbSB0aGUgY3VzdG9tIGVsZW1lbnQgcmVhY3Rpb25zIHN0YWNrLlxuICAgKiAgICAgUmVhY3Rpb25zIGluIHRoZSBwb3BwZWQgc3RhY2sgYXJlIGludm9rZWQuKVxuICAgKlxuICAgKiBAcGFyYW0geyFOb2RlfSByb290XG4gICAqIEBwYXJhbSB7IVNldDxOb2RlPj19IHZpc2l0ZWRJbXBvcnRzXG4gICAqL1xuICBwYXRjaEFuZFVwZ3JhZGVUcmVlKHJvb3QsIHZpc2l0ZWRJbXBvcnRzID0gbmV3IFNldCgpKSB7XG4gICAgY29uc3QgZWxlbWVudHMgPSBbXTtcblxuICAgIGNvbnN0IGdhdGhlckVsZW1lbnRzID0gZWxlbWVudCA9PiB7XG4gICAgICBpZiAoZWxlbWVudC5sb2NhbE5hbWUgPT09ICdsaW5rJyAmJiBlbGVtZW50LmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdpbXBvcnQnKSB7XG4gICAgICAgIC8vIFRoZSBIVE1MIEltcG9ydHMgcG9seWZpbGwgc2V0cyBhIGRlc2NlbmRhbnQgZWxlbWVudCBvZiB0aGUgbGluayB0b1xuICAgICAgICAvLyB0aGUgYGltcG9ydGAgcHJvcGVydHksIHNwZWNpZmljYWxseSB0aGlzIGlzICpub3QqIGEgRG9jdW1lbnQuXG4gICAgICAgIGNvbnN0IGltcG9ydE5vZGUgPSAvKiogQHR5cGUgez9Ob2RlfSAqLyAoZWxlbWVudC5pbXBvcnQpO1xuXG4gICAgICAgIGlmIChpbXBvcnROb2RlIGluc3RhbmNlb2YgTm9kZSAmJiBpbXBvcnROb2RlLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICBpbXBvcnROb2RlLl9fQ0VfaXNJbXBvcnREb2N1bWVudCA9IHRydWU7XG5cbiAgICAgICAgICAvLyBDb25uZWN0ZWQgbGlua3MgYXJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgcmVnaXN0cnkuXG4gICAgICAgICAgaW1wb3J0Tm9kZS5fX0NFX2hhc1JlZ2lzdHJ5ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIGxpbmsncyBpbXBvcnQgcm9vdCBpcyBub3QgYXZhaWxhYmxlLCBpdHMgY29udGVudHMgY2FuJ3QgYmVcbiAgICAgICAgICAvLyB3YWxrZWQuIFdhaXQgZm9yICdsb2FkJyBhbmQgd2FsayBpdCB3aGVuIGl0J3MgcmVhZHkuXG4gICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1wb3J0Tm9kZSA9IC8qKiBAdHlwZSB7IU5vZGV9ICovIChlbGVtZW50LmltcG9ydCk7XG5cbiAgICAgICAgICAgIGlmIChpbXBvcnROb2RlLl9fQ0VfZG9jdW1lbnRMb2FkSGFuZGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgaW1wb3J0Tm9kZS5fX0NFX2RvY3VtZW50TG9hZEhhbmRsZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpbXBvcnROb2RlLl9fQ0VfaXNJbXBvcnREb2N1bWVudCA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIENvbm5lY3RlZCBsaW5rcyBhcmUgYXNzb2NpYXRlZCB3aXRoIHRoZSByZWdpc3RyeS5cbiAgICAgICAgICAgIGltcG9ydE5vZGUuX19DRV9oYXNSZWdpc3RyeSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIENsb25lIHRoZSBgdmlzaXRlZEltcG9ydHNgIHNldCB0aGF0IHdhcyBwb3B1bGF0ZWQgc3luYyBkdXJpbmdcbiAgICAgICAgICAgIC8vIHRoZSBgcGF0Y2hBbmRVcGdyYWRlVHJlZWAgY2FsbCB0aGF0IGNhdXNlZCB0aGlzICdsb2FkJyBoYW5kbGVyIHRvXG4gICAgICAgICAgICAvLyBiZSBhZGRlZC4gVGhlbiwgcmVtb3ZlICp0aGlzKiBsaW5rJ3MgaW1wb3J0IG5vZGUgc28gdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIHdhbGsgdGhhdCBpbXBvcnQgYWdhaW4sIGV2ZW4gaWYgaXQgd2FzIHBhcnRpYWxseSB3YWxrZWQgbGF0ZXJcbiAgICAgICAgICAgIC8vIGR1cmluZyB0aGUgc2FtZSBgcGF0Y2hBbmRVcGdyYWRlVHJlZWAgY2FsbC5cbiAgICAgICAgICAgIGNvbnN0IGNsb25lZFZpc2l0ZWRJbXBvcnRzID0gbmV3IFNldCh2aXNpdGVkSW1wb3J0cyk7XG4gICAgICAgICAgICB2aXNpdGVkSW1wb3J0cy5kZWxldGUoaW1wb3J0Tm9kZSk7XG5cbiAgICAgICAgICAgIHRoaXMucGF0Y2hBbmRVcGdyYWRlVHJlZShpbXBvcnROb2RlLCB2aXNpdGVkSW1wb3J0cyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIGB3YWxrRGVlcERlc2NlbmRhbnRFbGVtZW50c2AgcG9wdWxhdGVzIChhbmQgaW50ZXJuYWxseSBjaGVja3MgYWdhaW5zdClcbiAgICAvLyBgdmlzaXRlZEltcG9ydHNgIHdoZW4gdHJhdmVyc2luZyBhIGxvYWRlZCBpbXBvcnQuXG4gICAgVXRpbGl0aWVzLndhbGtEZWVwRGVzY2VuZGFudEVsZW1lbnRzKHJvb3QsIGdhdGhlckVsZW1lbnRzLCB2aXNpdGVkSW1wb3J0cyk7XG5cbiAgICBpZiAodGhpcy5faGFzUGF0Y2hlcykge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnBhdGNoKGVsZW1lbnRzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnVwZ3JhZGVFbGVtZW50KGVsZW1lbnRzW2ldKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgdXBncmFkZUVsZW1lbnQoZWxlbWVudCkge1xuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IGVsZW1lbnQuX19DRV9zdGF0ZTtcbiAgICBpZiAoY3VycmVudFN0YXRlICE9PSB1bmRlZmluZWQpIHJldHVybjtcblxuICAgIGNvbnN0IGRlZmluaXRpb24gPSB0aGlzLmxvY2FsTmFtZVRvRGVmaW5pdGlvbihlbGVtZW50LmxvY2FsTmFtZSk7XG4gICAgaWYgKCFkZWZpbml0aW9uKSByZXR1cm47XG5cbiAgICBkZWZpbml0aW9uLmNvbnN0cnVjdGlvblN0YWNrLnB1c2goZWxlbWVudCk7XG5cbiAgICBjb25zdCBjb25zdHJ1Y3RvciA9IGRlZmluaXRpb24uY29uc3RydWN0b3I7XG4gICAgdHJ5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCByZXN1bHQgPSBuZXcgKGNvbnN0cnVjdG9yKSgpO1xuICAgICAgICBpZiAocmVzdWx0ICE9PSBlbGVtZW50KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY3VzdG9tIGVsZW1lbnQgY29uc3RydWN0b3IgZGlkIG5vdCBwcm9kdWNlIHRoZSBlbGVtZW50IGJlaW5nIHVwZ3JhZGVkLicpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBkZWZpbml0aW9uLmNvbnN0cnVjdGlvblN0YWNrLnBvcCgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVsZW1lbnQuX19DRV9zdGF0ZSA9IENFU3RhdGUuZmFpbGVkO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBlbGVtZW50Ll9fQ0Vfc3RhdGUgPSBDRVN0YXRlLmN1c3RvbTtcbiAgICBlbGVtZW50Ll9fQ0VfZGVmaW5pdGlvbiA9IGRlZmluaXRpb247XG5cbiAgICBpZiAoZGVmaW5pdGlvbi5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IG9ic2VydmVkQXR0cmlidXRlcyA9IGRlZmluaXRpb24ub2JzZXJ2ZWRBdHRyaWJ1dGVzO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvYnNlcnZlZEF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IG9ic2VydmVkQXR0cmlidXRlc1tpXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soZWxlbWVudCwgbmFtZSwgbnVsbCwgdmFsdWUsIG51bGwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKFV0aWxpdGllcy5pc0Nvbm5lY3RlZChlbGVtZW50KSkge1xuICAgICAgdGhpcy5jb25uZWN0ZWRDYWxsYmFjayhlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgY29ubmVjdGVkQ2FsbGJhY2soZWxlbWVudCkge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBlbGVtZW50Ll9fQ0VfZGVmaW5pdGlvbjtcbiAgICBpZiAoZGVmaW5pdGlvbi5jb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgZGVmaW5pdGlvbi5jb25uZWN0ZWRDYWxsYmFjay5jYWxsKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIGVsZW1lbnQuX19DRV9pc0Nvbm5lY3RlZENhbGxiYWNrQ2FsbGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBkaXNjb25uZWN0ZWRDYWxsYmFjayhlbGVtZW50KSB7XG4gICAgaWYgKCFlbGVtZW50Ll9fQ0VfaXNDb25uZWN0ZWRDYWxsYmFja0NhbGxlZCkge1xuICAgICAgdGhpcy5jb25uZWN0ZWRDYWxsYmFjayhlbGVtZW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWZpbml0aW9uID0gZWxlbWVudC5fX0NFX2RlZmluaXRpb247XG4gICAgaWYgKGRlZmluaXRpb24uZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGRlZmluaXRpb24uZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChlbGVtZW50KTtcbiAgICB9XG5cbiAgICBlbGVtZW50Ll9fQ0VfaXNDb25uZWN0ZWRDYWxsYmFja0NhbGxlZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gb2xkVmFsdWVcbiAgICogQHBhcmFtIHs/c3RyaW5nfSBuZXdWYWx1ZVxuICAgKiBAcGFyYW0gez9zdHJpbmd9IG5hbWVzcGFjZVxuICAgKi9cbiAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGVsZW1lbnQsIG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSwgbmFtZXNwYWNlKSB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IGVsZW1lbnQuX19DRV9kZWZpbml0aW9uO1xuICAgIGlmIChcbiAgICAgIGRlZmluaXRpb24uYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrICYmXG4gICAgICBkZWZpbml0aW9uLm9ic2VydmVkQXR0cmlidXRlcy5pbmRleE9mKG5hbWUpID4gLTFcbiAgICApIHtcbiAgICAgIGRlZmluaXRpb24uYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrLmNhbGwoZWxlbWVudCwgbmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlLCBuYW1lc3BhY2UpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IEN1c3RvbUVsZW1lbnRJbnRlcm5hbHMgZnJvbSAnLi9DdXN0b21FbGVtZW50SW50ZXJuYWxzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jdW1lbnRDb25zdHJ1Y3Rpb25PYnNlcnZlciB7XG4gIGNvbnN0cnVjdG9yKGludGVybmFscywgZG9jKSB7XG4gICAgLyoqXG4gICAgICogQHR5cGUgeyFDdXN0b21FbGVtZW50SW50ZXJuYWxzfVxuICAgICAqL1xuICAgIHRoaXMuX2ludGVybmFscyA9IGludGVybmFscztcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHshRG9jdW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2M7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TXV0YXRpb25PYnNlcnZlcnx1bmRlZmluZWR9XG4gICAgICovXG4gICAgdGhpcy5fb2JzZXJ2ZXIgPSB1bmRlZmluZWQ7XG5cblxuICAgIC8vIFNpbXVsYXRlIHRyZWUgY29uc3RydWN0aW9uIGZvciBhbGwgY3VycmVudGx5IGFjY2Vzc2libGUgbm9kZXMgaW4gdGhlXG4gICAgLy8gZG9jdW1lbnQuXG4gICAgdGhpcy5faW50ZXJuYWxzLnBhdGNoQW5kVXBncmFkZVRyZWUodGhpcy5fZG9jdW1lbnQpO1xuXG4gICAgaWYgKHRoaXMuX2RvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcih0aGlzLl9oYW5kbGVNdXRhdGlvbnMuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIE5vZGVzIGNyZWF0ZWQgYnkgdGhlIHBhcnNlciBhcmUgZ2l2ZW4gdG8gdGhlIG9ic2VydmVyICpiZWZvcmUqIHRoZSBuZXh0XG4gICAgICAvLyB0YXNrIHJ1bnMuIElubGluZSBzY3JpcHRzIGFyZSBydW4gaW4gYSBuZXcgdGFzay4gVGhpcyBtZWFucyB0aGF0IHRoZVxuICAgICAgLy8gb2JzZXJ2ZXIgd2lsbCBiZSBhYmxlIHRvIGhhbmRsZSB0aGUgbmV3bHkgcGFyc2VkIG5vZGVzIGJlZm9yZSB0aGUgaW5saW5lXG4gICAgICAvLyBzY3JpcHQgaXMgcnVuLlxuICAgICAgdGhpcy5fb2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLl9kb2N1bWVudCwge1xuICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGlmICh0aGlzLl9vYnNlcnZlcikge1xuICAgICAgdGhpcy5fb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBcnJheTwhTXV0YXRpb25SZWNvcmQ+fSBtdXRhdGlvbnNcbiAgICovXG4gIF9oYW5kbGVNdXRhdGlvbnMobXV0YXRpb25zKSB7XG4gICAgLy8gT25jZSB0aGUgZG9jdW1lbnQncyBgcmVhZHlTdGF0ZWAgaXMgJ2ludGVyYWN0aXZlJyBvciAnY29tcGxldGUnLCBhbGwgbmV3XG4gICAgLy8gbm9kZXMgY3JlYXRlZCB3aXRoaW4gdGhhdCBkb2N1bWVudCB3aWxsIGJlIHRoZSByZXN1bHQgb2Ygc2NyaXB0IGFuZFxuICAgIC8vIHNob3VsZCBiZSBoYW5kbGVkIGJ5IHBhdGNoaW5nLlxuICAgIGNvbnN0IHJlYWR5U3RhdGUgPSB0aGlzLl9kb2N1bWVudC5yZWFkeVN0YXRlO1xuICAgIGlmIChyZWFkeVN0YXRlID09PSAnaW50ZXJhY3RpdmUnIHx8IHJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgIHRoaXMuZGlzY29ubmVjdCgpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbXV0YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhZGRlZE5vZGVzID0gbXV0YXRpb25zW2ldLmFkZGVkTm9kZXM7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGFkZGVkTm9kZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGFkZGVkTm9kZXNbal07XG4gICAgICAgIHRoaXMuX2ludGVybmFscy5wYXRjaEFuZFVwZ3JhZGVUcmVlKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBAdGVtcGxhdGUgVFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWZlcnJlZCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge1R8dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHRoaXMuX3ZhbHVlID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb258dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHRoaXMuX3Jlc29sdmUgPSB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHshUHJvbWlzZTxUPn1cbiAgICAgKi9cbiAgICB0aGlzLl9wcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLl9yZXNvbHZlID0gcmVzb2x2ZTtcblxuICAgICAgaWYgKHRoaXMuX3ZhbHVlKSB7XG4gICAgICAgIHJlc29sdmUodGhpcy5fdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VH0gdmFsdWVcbiAgICovXG4gIHJlc29sdmUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fdmFsdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWxyZWFkeSByZXNvbHZlZC4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMuX3Jlc29sdmUpIHtcbiAgICAgIHRoaXMuX3Jlc29sdmUodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxUPn1cbiAgICovXG4gIHRvUHJvbWlzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvbWlzZTtcbiAgfVxufVxuIiwiaW1wb3J0IEN1c3RvbUVsZW1lbnRJbnRlcm5hbHMgZnJvbSAnLi9DdXN0b21FbGVtZW50SW50ZXJuYWxzLmpzJztcbmltcG9ydCBEb2N1bWVudENvbnN0cnVjdGlvbk9ic2VydmVyIGZyb20gJy4vRG9jdW1lbnRDb25zdHJ1Y3Rpb25PYnNlcnZlci5qcyc7XG5pbXBvcnQgRGVmZXJyZWQgZnJvbSAnLi9EZWZlcnJlZC5qcyc7XG5pbXBvcnQgKiBhcyBVdGlsaXRpZXMgZnJvbSAnLi9VdGlsaXRpZXMuanMnO1xuXG4vKipcbiAqIEB1bnJlc3RyaWN0ZWRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5IHtcblxuICAvKipcbiAgICogQHBhcmFtIHshQ3VzdG9tRWxlbWVudEludGVybmFsc30gaW50ZXJuYWxzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihpbnRlcm5hbHMpIHtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuX2VsZW1lbnREZWZpbml0aW9uSXNSdW5uaW5nID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHshQ3VzdG9tRWxlbWVudEludGVybmFsc31cbiAgICAgKi9cbiAgICB0aGlzLl9pbnRlcm5hbHMgPSBpbnRlcm5hbHM7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHshTWFwPHN0cmluZywgIURlZmVycmVkPHVuZGVmaW5lZD4+fVxuICAgICAqL1xuICAgIHRoaXMuX3doZW5EZWZpbmVkRGVmZXJyZWQgPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBmbHVzaCBjYWxsYmFjayB0cmlnZ2VycyB0aGUgZG9jdW1lbnQgd2FsayBzeW5jaHJvbm91c2x5LlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUgeyFGdW5jdGlvbn1cbiAgICAgKi9cbiAgICB0aGlzLl9mbHVzaENhbGxiYWNrID0gZm4gPT4gZm4oKTtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5fZmx1c2hQZW5kaW5nID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHshQXJyYXk8c3RyaW5nPn1cbiAgICAgKi9cbiAgICB0aGlzLl91bmZsdXNoZWRMb2NhbE5hbWVzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHshRG9jdW1lbnRDb25zdHJ1Y3Rpb25PYnNlcnZlcn1cbiAgICAgKi9cbiAgICB0aGlzLl9kb2N1bWVudENvbnN0cnVjdGlvbk9ic2VydmVyID0gbmV3IERvY3VtZW50Q29uc3RydWN0aW9uT2JzZXJ2ZXIoaW50ZXJuYWxzLCBkb2N1bWVudCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsTmFtZVxuICAgKiBAcGFyYW0geyFGdW5jdGlvbn0gY29uc3RydWN0b3JcbiAgICovXG4gIGRlZmluZShsb2NhbE5hbWUsIGNvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCEoY29uc3RydWN0b3IgaW5zdGFuY2VvZiBGdW5jdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0N1c3RvbSBlbGVtZW50IGNvbnN0cnVjdG9ycyBtdXN0IGJlIGZ1bmN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAoIVV0aWxpdGllcy5pc1ZhbGlkQ3VzdG9tRWxlbWVudE5hbWUobG9jYWxOYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBUaGUgZWxlbWVudCBuYW1lICcke2xvY2FsTmFtZX0nIGlzIG5vdCB2YWxpZC5gKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5faW50ZXJuYWxzLmxvY2FsTmFtZVRvRGVmaW5pdGlvbihsb2NhbE5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgY3VzdG9tIGVsZW1lbnQgd2l0aCBuYW1lICcke2xvY2FsTmFtZX0nIGhhcyBhbHJlYWR5IGJlZW4gZGVmaW5lZC5gKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudERlZmluaXRpb25Jc1J1bm5pbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQSBjdXN0b20gZWxlbWVudCBpcyBhbHJlYWR5IGJlaW5nIGRlZmluZWQuJyk7XG4gICAgfVxuICAgIHRoaXMuX2VsZW1lbnREZWZpbml0aW9uSXNSdW5uaW5nID0gdHJ1ZTtcblxuICAgIGxldCBjb25uZWN0ZWRDYWxsYmFjaztcbiAgICBsZXQgZGlzY29ubmVjdGVkQ2FsbGJhY2s7XG4gICAgbGV0IGFkb3B0ZWRDYWxsYmFjaztcbiAgICBsZXQgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrO1xuICAgIGxldCBvYnNlcnZlZEF0dHJpYnV0ZXM7XG4gICAgdHJ5IHtcbiAgICAgIC8qKiBAdHlwZSB7IU9iamVjdH0gKi9cbiAgICAgIGNvbnN0IHByb3RvdHlwZSA9IGNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICAgIGlmICghKHByb3RvdHlwZSBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGN1c3RvbSBlbGVtZW50IGNvbnN0cnVjdG9yXFwncyBwcm90b3R5cGUgaXMgbm90IGFuIG9iamVjdC4nKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZ2V0Q2FsbGJhY2sobmFtZSkge1xuICAgICAgICBjb25zdCBjYWxsYmFja1ZhbHVlID0gcHJvdG90eXBlW25hbWVdO1xuICAgICAgICBpZiAoY2FsbGJhY2tWYWx1ZSAhPT0gdW5kZWZpbmVkICYmICEoY2FsbGJhY2tWYWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlICcke25hbWV9JyBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24uYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrVmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGNvbm5lY3RlZENhbGxiYWNrID0gZ2V0Q2FsbGJhY2soJ2Nvbm5lY3RlZENhbGxiYWNrJyk7XG4gICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayA9IGdldENhbGxiYWNrKCdkaXNjb25uZWN0ZWRDYWxsYmFjaycpO1xuICAgICAgYWRvcHRlZENhbGxiYWNrID0gZ2V0Q2FsbGJhY2soJ2Fkb3B0ZWRDYWxsYmFjaycpO1xuICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrID0gZ2V0Q2FsbGJhY2soJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaycpO1xuICAgICAgb2JzZXJ2ZWRBdHRyaWJ1dGVzID0gY29uc3RydWN0b3JbJ29ic2VydmVkQXR0cmlidXRlcyddIHx8IFtdO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fZWxlbWVudERlZmluaXRpb25Jc1J1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWZpbml0aW9uID0ge1xuICAgICAgbG9jYWxOYW1lLFxuICAgICAgY29uc3RydWN0b3IsXG4gICAgICBjb25uZWN0ZWRDYWxsYmFjayxcbiAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrLFxuICAgICAgYWRvcHRlZENhbGxiYWNrLFxuICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrLFxuICAgICAgb2JzZXJ2ZWRBdHRyaWJ1dGVzLFxuICAgICAgY29uc3RydWN0aW9uU3RhY2s6IFtdLFxuICAgIH07XG5cbiAgICB0aGlzLl9pbnRlcm5hbHMuc2V0RGVmaW5pdGlvbihsb2NhbE5hbWUsIGRlZmluaXRpb24pO1xuXG4gICAgdGhpcy5fdW5mbHVzaGVkTG9jYWxOYW1lcy5wdXNoKGxvY2FsTmFtZSk7XG5cbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGNhbGxlZCB0aGUgZmx1c2ggY2FsbGJhY2sgYW5kIGl0IGhhc24ndCBjYWxsZWQgYmFjayB5ZXQsXG4gICAgLy8gZG9uJ3QgY2FsbCBpdCBhZ2Fpbi5cbiAgICBpZiAoIXRoaXMuX2ZsdXNoUGVuZGluZykge1xuICAgICAgdGhpcy5fZmx1c2hQZW5kaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2ZsdXNoQ2FsbGJhY2soKCkgPT4gdGhpcy5fZmx1c2goKSk7XG4gICAgfVxuICB9XG5cbiAgX2ZsdXNoKCkge1xuICAgIC8vIElmIG5vIG5ldyBkZWZpbml0aW9ucyB3ZXJlIGRlZmluZWQsIGRvbid0IGF0dGVtcHQgdG8gZmx1c2guIFRoaXMgY291bGRcbiAgICAvLyBoYXBwZW4gaWYgYSBmbHVzaCBjYWxsYmFjayBrZWVwcyB0aGUgZnVuY3Rpb24gaXQgaXMgZ2l2ZW4gYW5kIGNhbGxzIGl0XG4gICAgLy8gbXVsdGlwbGUgdGltZXMuXG4gICAgaWYgKHRoaXMuX2ZsdXNoUGVuZGluZyA9PT0gZmFsc2UpIHJldHVybjtcblxuICAgIHRoaXMuX2ZsdXNoUGVuZGluZyA9IGZhbHNlO1xuICAgIHRoaXMuX2ludGVybmFscy5wYXRjaEFuZFVwZ3JhZGVUcmVlKGRvY3VtZW50KTtcblxuICAgIHdoaWxlICh0aGlzLl91bmZsdXNoZWRMb2NhbE5hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGxvY2FsTmFtZSA9IHRoaXMuX3VuZmx1c2hlZExvY2FsTmFtZXMuc2hpZnQoKTtcbiAgICAgIGNvbnN0IGRlZmVycmVkID0gdGhpcy5fd2hlbkRlZmluZWREZWZlcnJlZC5nZXQobG9jYWxOYW1lKTtcbiAgICAgIGlmIChkZWZlcnJlZCkge1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhbE5hbWVcbiAgICogQHJldHVybiB7RnVuY3Rpb258dW5kZWZpbmVkfVxuICAgKi9cbiAgZ2V0KGxvY2FsTmFtZSkge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSB0aGlzLl9pbnRlcm5hbHMubG9jYWxOYW1lVG9EZWZpbml0aW9uKGxvY2FsTmFtZSk7XG4gICAgaWYgKGRlZmluaXRpb24pIHtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uLmNvbnN0cnVjdG9yO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsTmFtZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTx1bmRlZmluZWQ+fVxuICAgKi9cbiAgd2hlbkRlZmluZWQobG9jYWxOYW1lKSB7XG4gICAgaWYgKCFVdGlsaXRpZXMuaXNWYWxpZEN1c3RvbUVsZW1lbnROYW1lKGxvY2FsTmFtZSkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgU3ludGF4RXJyb3IoYCcke2xvY2FsTmFtZX0nIGlzIG5vdCBhIHZhbGlkIGN1c3RvbSBlbGVtZW50IG5hbWUuYCkpO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW9yID0gdGhpcy5fd2hlbkRlZmluZWREZWZlcnJlZC5nZXQobG9jYWxOYW1lKTtcbiAgICBpZiAocHJpb3IpIHtcbiAgICAgIHJldHVybiBwcmlvci50b1Byb21pc2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIHRoaXMuX3doZW5EZWZpbmVkRGVmZXJyZWQuc2V0KGxvY2FsTmFtZSwgZGVmZXJyZWQpO1xuXG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHRoaXMuX2ludGVybmFscy5sb2NhbE5hbWVUb0RlZmluaXRpb24obG9jYWxOYW1lKTtcbiAgICAvLyBSZXNvbHZlIGltbWVkaWF0ZWx5IG9ubHkgaWYgdGhlIGdpdmVuIGxvY2FsIG5hbWUgaGFzIGEgZGVmaW5pdGlvbiAqYW5kKlxuICAgIC8vIHRoZSBmdWxsIGRvY3VtZW50IHdhbGsgdG8gdXBncmFkZSBlbGVtZW50cyB3aXRoIHRoYXQgbG9jYWwgbmFtZSBoYXNcbiAgICAvLyBhbHJlYWR5IGhhcHBlbmVkLlxuICAgIGlmIChkZWZpbml0aW9uICYmIHRoaXMuX3VuZmx1c2hlZExvY2FsTmFtZXMuaW5kZXhPZihsb2NhbE5hbWUpID09PSAtMSkge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIHJldHVybiBkZWZlcnJlZC50b1Byb21pc2UoKTtcbiAgfVxuXG4gIHBvbHlmaWxsV3JhcEZsdXNoQ2FsbGJhY2sob3V0ZXIpIHtcbiAgICB0aGlzLl9kb2N1bWVudENvbnN0cnVjdGlvbk9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICBjb25zdCBpbm5lciA9IHRoaXMuX2ZsdXNoQ2FsbGJhY2s7XG4gICAgdGhpcy5fZmx1c2hDYWxsYmFjayA9IGZsdXNoID0+IG91dGVyKCgpID0+IGlubmVyKGZsdXNoKSk7XG4gIH1cbn1cblxuLy8gQ2xvc3VyZSBjb21waWxlciBleHBvcnRzLlxud2luZG93WydDdXN0b21FbGVtZW50UmVnaXN0cnknXSA9IEN1c3RvbUVsZW1lbnRSZWdpc3RyeTtcbkN1c3RvbUVsZW1lbnRSZWdpc3RyeS5wcm90b3R5cGVbJ2RlZmluZSddID0gQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5LnByb3RvdHlwZS5kZWZpbmU7XG5DdXN0b21FbGVtZW50UmVnaXN0cnkucHJvdG90eXBlWydnZXQnXSA9IEN1c3RvbUVsZW1lbnRSZWdpc3RyeS5wcm90b3R5cGUuZ2V0O1xuQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5LnByb3RvdHlwZVsnd2hlbkRlZmluZWQnXSA9IEN1c3RvbUVsZW1lbnRSZWdpc3RyeS5wcm90b3R5cGUud2hlbkRlZmluZWQ7XG5DdXN0b21FbGVtZW50UmVnaXN0cnkucHJvdG90eXBlWydwb2x5ZmlsbFdyYXBGbHVzaENhbGxiYWNrJ10gPSBDdXN0b21FbGVtZW50UmVnaXN0cnkucHJvdG90eXBlLnBvbHlmaWxsV3JhcEZsdXNoQ2FsbGJhY2s7XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIERvY3VtZW50X2NyZWF0ZUVsZW1lbnQ6IHdpbmRvdy5Eb2N1bWVudC5wcm90b3R5cGUuY3JlYXRlRWxlbWVudCxcbiAgRG9jdW1lbnRfY3JlYXRlRWxlbWVudE5TOiB3aW5kb3cuRG9jdW1lbnQucHJvdG90eXBlLmNyZWF0ZUVsZW1lbnROUyxcbiAgRG9jdW1lbnRfaW1wb3J0Tm9kZTogd2luZG93LkRvY3VtZW50LnByb3RvdHlwZS5pbXBvcnROb2RlLFxuICBEb2N1bWVudF9wcmVwZW5kOiB3aW5kb3cuRG9jdW1lbnQucHJvdG90eXBlWydwcmVwZW5kJ10sXG4gIERvY3VtZW50X2FwcGVuZDogd2luZG93LkRvY3VtZW50LnByb3RvdHlwZVsnYXBwZW5kJ10sXG4gIE5vZGVfY2xvbmVOb2RlOiB3aW5kb3cuTm9kZS5wcm90b3R5cGUuY2xvbmVOb2RlLFxuICBOb2RlX2FwcGVuZENoaWxkOiB3aW5kb3cuTm9kZS5wcm90b3R5cGUuYXBwZW5kQ2hpbGQsXG4gIE5vZGVfaW5zZXJ0QmVmb3JlOiB3aW5kb3cuTm9kZS5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlLFxuICBOb2RlX3JlbW92ZUNoaWxkOiB3aW5kb3cuTm9kZS5wcm90b3R5cGUucmVtb3ZlQ2hpbGQsXG4gIE5vZGVfcmVwbGFjZUNoaWxkOiB3aW5kb3cuTm9kZS5wcm90b3R5cGUucmVwbGFjZUNoaWxkLFxuICBOb2RlX3RleHRDb250ZW50OiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHdpbmRvdy5Ob2RlLnByb3RvdHlwZSwgJ3RleHRDb250ZW50JyksXG4gIEVsZW1lbnRfYXR0YWNoU2hhZG93OiB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGVbJ2F0dGFjaFNoYWRvdyddLFxuICBFbGVtZW50X2lubmVySFRNTDogT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUsICdpbm5lckhUTUwnKSxcbiAgRWxlbWVudF9nZXRBdHRyaWJ1dGU6IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5nZXRBdHRyaWJ1dGUsXG4gIEVsZW1lbnRfc2V0QXR0cmlidXRlOiB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuc2V0QXR0cmlidXRlLFxuICBFbGVtZW50X3JlbW92ZUF0dHJpYnV0ZTogd2luZG93LkVsZW1lbnQucHJvdG90eXBlLnJlbW92ZUF0dHJpYnV0ZSxcbiAgRWxlbWVudF9nZXRBdHRyaWJ1dGVOUzogd2luZG93LkVsZW1lbnQucHJvdG90eXBlLmdldEF0dHJpYnV0ZU5TLFxuICBFbGVtZW50X3NldEF0dHJpYnV0ZU5TOiB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuc2V0QXR0cmlidXRlTlMsXG4gIEVsZW1lbnRfcmVtb3ZlQXR0cmlidXRlTlM6IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5yZW1vdmVBdHRyaWJ1dGVOUyxcbiAgRWxlbWVudF9pbnNlcnRBZGphY2VudEVsZW1lbnQ6IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZVsnaW5zZXJ0QWRqYWNlbnRFbGVtZW50J10sXG4gIEVsZW1lbnRfcHJlcGVuZDogd2luZG93LkVsZW1lbnQucHJvdG90eXBlWydwcmVwZW5kJ10sXG4gIEVsZW1lbnRfYXBwZW5kOiB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGVbJ2FwcGVuZCddLFxuICBFbGVtZW50X2JlZm9yZTogd2luZG93LkVsZW1lbnQucHJvdG90eXBlWydiZWZvcmUnXSxcbiAgRWxlbWVudF9hZnRlcjogd2luZG93LkVsZW1lbnQucHJvdG90eXBlWydhZnRlciddLFxuICBFbGVtZW50X3JlcGxhY2VXaXRoOiB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGVbJ3JlcGxhY2VXaXRoJ10sXG4gIEVsZW1lbnRfcmVtb3ZlOiB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGVbJ3JlbW92ZSddLFxuICBIVE1MRWxlbWVudDogd2luZG93LkhUTUxFbGVtZW50LFxuICBIVE1MRWxlbWVudF9pbm5lckhUTUw6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iod2luZG93LkhUTUxFbGVtZW50LnByb3RvdHlwZSwgJ2lubmVySFRNTCcpLFxuICBIVE1MRWxlbWVudF9pbnNlcnRBZGphY2VudEVsZW1lbnQ6IHdpbmRvdy5IVE1MRWxlbWVudC5wcm90b3R5cGVbJ2luc2VydEFkamFjZW50RWxlbWVudCddLFxufTtcbiIsIi8qKlxuICogVGhpcyBjbGFzcyBleGlzdHMgb25seSB0byB3b3JrIGFyb3VuZCBDbG9zdXJlJ3MgbGFjayBvZiBhIHdheSB0byBkZXNjcmliZVxuICogc2luZ2xldG9ucy4gSXQgcmVwcmVzZW50cyB0aGUgJ2FscmVhZHkgY29uc3RydWN0ZWQgbWFya2VyJyB1c2VkIGluIGN1c3RvbVxuICogZWxlbWVudCBjb25zdHJ1Y3Rpb24gc3RhY2tzLlxuICpcbiAqIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2NvbmNlcHQtYWxyZWFkeS1jb25zdHJ1Y3RlZC1tYXJrZXJcbiAqL1xuY2xhc3MgQWxyZWFkeUNvbnN0cnVjdGVkTWFya2VyIHt9XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBBbHJlYWR5Q29uc3RydWN0ZWRNYXJrZXIoKTtcbiIsImltcG9ydCBOYXRpdmUgZnJvbSAnLi9OYXRpdmUuanMnO1xuaW1wb3J0IEN1c3RvbUVsZW1lbnRJbnRlcm5hbHMgZnJvbSAnLi4vQ3VzdG9tRWxlbWVudEludGVybmFscy5qcyc7XG5pbXBvcnQgQ0VTdGF0ZSBmcm9tICcuLi9DdXN0b21FbGVtZW50U3RhdGUuanMnO1xuaW1wb3J0IEFscmVhZHlDb25zdHJ1Y3RlZE1hcmtlciBmcm9tICcuLi9BbHJlYWR5Q29uc3RydWN0ZWRNYXJrZXIuanMnO1xuXG4vKipcbiAqIEBwYXJhbSB7IUN1c3RvbUVsZW1lbnRJbnRlcm5hbHN9IGludGVybmFsc1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnRlcm5hbHMpIHtcbiAgd2luZG93WydIVE1MRWxlbWVudCddID0gKGZ1bmN0aW9uKCkge1xuICAgIC8qKlxuICAgICAqIEB0eXBlIHtmdW5jdGlvbihuZXc6IEhUTUxFbGVtZW50KTogIUhUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEhUTUxFbGVtZW50KCkge1xuICAgICAgLy8gVGhpcyBzaG91bGQgcmVhbGx5IGJlIGBuZXcudGFyZ2V0YCBidXQgYG5ldy50YXJnZXRgIGNhbid0IGJlIGVtdWxhdGVkXG4gICAgICAvLyBpbiBFUzUuIEFzc3VtaW5nIHRoZSB1c2VyIGtlZXBzIHRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBjb25zdHJ1Y3RvcidzXG4gICAgICAvLyBwcm90b3R5cGUncyBgY29uc3RydWN0b3JgIHByb3BlcnR5LCB0aGlzIGlzIGVxdWl2YWxlbnQuXG4gICAgICAvKiogQHR5cGUgeyFGdW5jdGlvbn0gKi9cbiAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvcjtcblxuICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGludGVybmFscy5jb25zdHJ1Y3RvclRvRGVmaW5pdGlvbihjb25zdHJ1Y3Rvcik7XG4gICAgICBpZiAoIWRlZmluaXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY3VzdG9tIGVsZW1lbnQgYmVpbmcgY29uc3RydWN0ZWQgd2FzIG5vdCByZWdpc3RlcmVkIHdpdGggYGN1c3RvbUVsZW1lbnRzYC4nKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29uc3RydWN0aW9uU3RhY2sgPSBkZWZpbml0aW9uLmNvbnN0cnVjdGlvblN0YWNrO1xuXG4gICAgICBpZiAoY29uc3RydWN0aW9uU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBOYXRpdmUuRG9jdW1lbnRfY3JlYXRlRWxlbWVudC5jYWxsKGRvY3VtZW50LCBkZWZpbml0aW9uLmxvY2FsTmFtZSk7XG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihlbGVtZW50LCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuICAgICAgICBlbGVtZW50Ll9fQ0Vfc3RhdGUgPSBDRVN0YXRlLmN1c3RvbTtcbiAgICAgICAgZWxlbWVudC5fX0NFX2RlZmluaXRpb24gPSBkZWZpbml0aW9uO1xuICAgICAgICBpbnRlcm5hbHMucGF0Y2goZWxlbWVudCk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsYXN0SW5kZXggPSBjb25zdHJ1Y3Rpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgY29uc3QgZWxlbWVudCA9IGNvbnN0cnVjdGlvblN0YWNrW2xhc3RJbmRleF07XG4gICAgICBpZiAoZWxlbWVudCA9PT0gQWxyZWFkeUNvbnN0cnVjdGVkTWFya2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIEhUTUxFbGVtZW50IGNvbnN0cnVjdG9yIHdhcyBlaXRoZXIgY2FsbGVkIHJlZW50cmFudGx5IGZvciB0aGlzIGNvbnN0cnVjdG9yIG9yIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy4nKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0cnVjdGlvblN0YWNrW2xhc3RJbmRleF0gPSBBbHJlYWR5Q29uc3RydWN0ZWRNYXJrZXI7XG5cbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihlbGVtZW50LCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuICAgICAgaW50ZXJuYWxzLnBhdGNoKC8qKiBAdHlwZSB7IUhUTUxFbGVtZW50fSAqLyAoZWxlbWVudCkpO1xuXG4gICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICBIVE1MRWxlbWVudC5wcm90b3R5cGUgPSBOYXRpdmUuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuXG4gICAgcmV0dXJuIEhUTUxFbGVtZW50O1xuICB9KSgpO1xufTtcbiIsImltcG9ydCBDdXN0b21FbGVtZW50SW50ZXJuYWxzIGZyb20gJy4uLy4uL0N1c3RvbUVsZW1lbnRJbnRlcm5hbHMuanMnO1xuaW1wb3J0ICogYXMgVXRpbGl0aWVzIGZyb20gJy4uLy4uL1V0aWxpdGllcy5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgcHJlcGVuZDogIWZ1bmN0aW9uKC4uLighTm9kZXxzdHJpbmcpKSxcbiAgKiAgYXBwZW5kOiAhZnVuY3Rpb24oLi4uKCFOb2RlfHN0cmluZykpLFxuICogfX1cbiAqL1xubGV0IFBhcmVudE5vZGVOYXRpdmVNZXRob2RzO1xuXG4vKipcbiAqIEBwYXJhbSB7IUN1c3RvbUVsZW1lbnRJbnRlcm5hbHN9IGludGVybmFsc1xuICogQHBhcmFtIHshT2JqZWN0fSBkZXN0aW5hdGlvblxuICogQHBhcmFtIHshUGFyZW50Tm9kZU5hdGl2ZU1ldGhvZHN9IGJ1aWx0SW5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW50ZXJuYWxzLCBkZXN0aW5hdGlvbiwgYnVpbHRJbikge1xuICAvKipcbiAgICogQHBhcmFtIHsuLi4oIU5vZGV8c3RyaW5nKX0gbm9kZXNcbiAgICovXG4gIGRlc3RpbmF0aW9uWydwcmVwZW5kJ10gPSBmdW5jdGlvbiguLi5ub2Rlcykge1xuICAgIC8vIFRPRE86IEZpeCB0aGlzIGZvciB3aGVuIG9uZSBvZiBgbm9kZXNgIGlzIGEgRG9jdW1lbnRGcmFnbWVudCFcbiAgICBjb25zdCBjb25uZWN0ZWRCZWZvcmUgPSAvKiogQHR5cGUgeyFBcnJheTwhTm9kZT59ICovIChub2Rlcy5maWx0ZXIobm9kZSA9PiB7XG4gICAgICAvLyBEb2N1bWVudEZyYWdtZW50cyBhcmUgbm90IGNvbm5lY3RlZCBhbmQgd2lsbCBub3QgYmUgYWRkZWQgdG8gdGhlIGxpc3QuXG4gICAgICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIE5vZGUgJiYgVXRpbGl0aWVzLmlzQ29ubmVjdGVkKG5vZGUpO1xuICAgIH0pKTtcblxuICAgIGJ1aWx0SW4ucHJlcGVuZC5hcHBseSh0aGlzLCBub2Rlcyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbm5lY3RlZEJlZm9yZS5sZW5ndGg7IGkrKykge1xuICAgICAgaW50ZXJuYWxzLmRpc2Nvbm5lY3RUcmVlKGNvbm5lY3RlZEJlZm9yZVtpXSk7XG4gICAgfVxuXG4gICAgaWYgKFV0aWxpdGllcy5pc0Nvbm5lY3RlZCh0aGlzKSkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgIGludGVybmFscy5jb25uZWN0VHJlZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIHsuLi4oIU5vZGV8c3RyaW5nKX0gbm9kZXNcbiAgICovXG4gIGRlc3RpbmF0aW9uWydhcHBlbmQnXSA9IGZ1bmN0aW9uKC4uLm5vZGVzKSB7XG4gICAgLy8gVE9ETzogRml4IHRoaXMgZm9yIHdoZW4gb25lIG9mIGBub2Rlc2AgaXMgYSBEb2N1bWVudEZyYWdtZW50IVxuICAgIGNvbnN0IGNvbm5lY3RlZEJlZm9yZSA9IC8qKiBAdHlwZSB7IUFycmF5PCFOb2RlPn0gKi8gKG5vZGVzLmZpbHRlcihub2RlID0+IHtcbiAgICAgIC8vIERvY3VtZW50RnJhZ21lbnRzIGFyZSBub3QgY29ubmVjdGVkIGFuZCB3aWxsIG5vdCBiZSBhZGRlZCB0byB0aGUgbGlzdC5cbiAgICAgIHJldHVybiBub2RlIGluc3RhbmNlb2YgTm9kZSAmJiBVdGlsaXRpZXMuaXNDb25uZWN0ZWQobm9kZSk7XG4gICAgfSkpO1xuXG4gICAgYnVpbHRJbi5hcHBlbmQuYXBwbHkodGhpcywgbm9kZXMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25uZWN0ZWRCZWZvcmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGludGVybmFscy5kaXNjb25uZWN0VHJlZShjb25uZWN0ZWRCZWZvcmVbaV0pO1xuICAgIH1cblxuICAgIGlmIChVdGlsaXRpZXMuaXNDb25uZWN0ZWQodGhpcykpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICBpbnRlcm5hbHMuY29ubmVjdFRyZWUobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuIiwiaW1wb3J0IE5hdGl2ZSBmcm9tICcuL05hdGl2ZS5qcyc7XG5pbXBvcnQgQ3VzdG9tRWxlbWVudEludGVybmFscyBmcm9tICcuLi9DdXN0b21FbGVtZW50SW50ZXJuYWxzLmpzJztcbmltcG9ydCAqIGFzIFV0aWxpdGllcyBmcm9tICcuLi9VdGlsaXRpZXMuanMnO1xuXG5pbXBvcnQgUGF0Y2hQYXJlbnROb2RlIGZyb20gJy4vSW50ZXJmYWNlL1BhcmVudE5vZGUuanMnO1xuXG4vKipcbiAqIEBwYXJhbSB7IUN1c3RvbUVsZW1lbnRJbnRlcm5hbHN9IGludGVybmFsc1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnRlcm5hbHMpIHtcbiAgVXRpbGl0aWVzLnNldFByb3BlcnR5VW5jaGVja2VkKERvY3VtZW50LnByb3RvdHlwZSwgJ2NyZWF0ZUVsZW1lbnQnLFxuICAgIC8qKlxuICAgICAqIEB0aGlzIHtEb2N1bWVudH1cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYWxOYW1lXG4gICAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAgICovXG4gICAgZnVuY3Rpb24obG9jYWxOYW1lKSB7XG4gICAgICAvLyBPbmx5IGNyZWF0ZSBjdXN0b20gZWxlbWVudHMgaWYgdGhpcyBkb2N1bWVudCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIHJlZ2lzdHJ5LlxuICAgICAgaWYgKHRoaXMuX19DRV9oYXNSZWdpc3RyeSkge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gaW50ZXJuYWxzLmxvY2FsTmFtZVRvRGVmaW5pdGlvbihsb2NhbE5hbWUpO1xuICAgICAgICBpZiAoZGVmaW5pdGlvbikge1xuICAgICAgICAgIHJldHVybiBuZXcgKGRlZmluaXRpb24uY29uc3RydWN0b3IpKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0ID0gLyoqIEB0eXBlIHshRWxlbWVudH0gKi9cbiAgICAgICAgKE5hdGl2ZS5Eb2N1bWVudF9jcmVhdGVFbGVtZW50LmNhbGwodGhpcywgbG9jYWxOYW1lKSk7XG4gICAgICBpbnRlcm5hbHMucGF0Y2gocmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgVXRpbGl0aWVzLnNldFByb3BlcnR5VW5jaGVja2VkKERvY3VtZW50LnByb3RvdHlwZSwgJ2ltcG9ydE5vZGUnLFxuICAgIC8qKlxuICAgICAqIEB0aGlzIHtEb2N1bWVudH1cbiAgICAgKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gZGVlcFxuICAgICAqIEByZXR1cm4geyFOb2RlfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uKG5vZGUsIGRlZXApIHtcbiAgICAgIGNvbnN0IGNsb25lID0gTmF0aXZlLkRvY3VtZW50X2ltcG9ydE5vZGUuY2FsbCh0aGlzLCBub2RlLCBkZWVwKTtcbiAgICAgIC8vIE9ubHkgY3JlYXRlIGN1c3RvbSBlbGVtZW50cyBpZiB0aGlzIGRvY3VtZW50IGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUgcmVnaXN0cnkuXG4gICAgICBpZiAoIXRoaXMuX19DRV9oYXNSZWdpc3RyeSkge1xuICAgICAgICBpbnRlcm5hbHMucGF0Y2hUcmVlKGNsb25lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGludGVybmFscy5wYXRjaEFuZFVwZ3JhZGVUcmVlKGNsb25lKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjbG9uZTtcbiAgICB9KTtcblxuICBjb25zdCBOU19IVE1MID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI7XG5cbiAgVXRpbGl0aWVzLnNldFByb3BlcnR5VW5jaGVja2VkKERvY3VtZW50LnByb3RvdHlwZSwgJ2NyZWF0ZUVsZW1lbnROUycsXG4gICAgLyoqXG4gICAgICogQHRoaXMge0RvY3VtZW50fVxuICAgICAqIEBwYXJhbSB7P3N0cmluZ30gbmFtZXNwYWNlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsTmFtZVxuICAgICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uKG5hbWVzcGFjZSwgbG9jYWxOYW1lKSB7XG4gICAgICAvLyBPbmx5IGNyZWF0ZSBjdXN0b20gZWxlbWVudHMgaWYgdGhpcyBkb2N1bWVudCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIHJlZ2lzdHJ5LlxuICAgICAgaWYgKHRoaXMuX19DRV9oYXNSZWdpc3RyeSAmJiAobmFtZXNwYWNlID09PSBudWxsIHx8IG5hbWVzcGFjZSA9PT0gTlNfSFRNTCkpIHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGludGVybmFscy5sb2NhbE5hbWVUb0RlZmluaXRpb24obG9jYWxOYW1lKTtcbiAgICAgICAgaWYgKGRlZmluaXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gbmV3IChkZWZpbml0aW9uLmNvbnN0cnVjdG9yKSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IC8qKiBAdHlwZSB7IUVsZW1lbnR9ICovXG4gICAgICAgIChOYXRpdmUuRG9jdW1lbnRfY3JlYXRlRWxlbWVudE5TLmNhbGwodGhpcywgbmFtZXNwYWNlLCBsb2NhbE5hbWUpKTtcbiAgICAgIGludGVybmFscy5wYXRjaChyZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICBQYXRjaFBhcmVudE5vZGUoaW50ZXJuYWxzLCBEb2N1bWVudC5wcm90b3R5cGUsIHtcbiAgICBwcmVwZW5kOiBOYXRpdmUuRG9jdW1lbnRfcHJlcGVuZCxcbiAgICBhcHBlbmQ6IE5hdGl2ZS5Eb2N1bWVudF9hcHBlbmQsXG4gIH0pO1xufTtcbiIsImltcG9ydCBOYXRpdmUgZnJvbSAnLi9OYXRpdmUuanMnO1xuaW1wb3J0IEN1c3RvbUVsZW1lbnRJbnRlcm5hbHMgZnJvbSAnLi4vQ3VzdG9tRWxlbWVudEludGVybmFscy5qcyc7XG5pbXBvcnQgKiBhcyBVdGlsaXRpZXMgZnJvbSAnLi4vVXRpbGl0aWVzLmpzJztcblxuLyoqXG4gKiBAcGFyYW0geyFDdXN0b21FbGVtZW50SW50ZXJuYWxzfSBpbnRlcm5hbHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW50ZXJuYWxzKSB7XG4gIC8vIGBOb2RlI25vZGVWYWx1ZWAgaXMgaW1wbGVtZW50ZWQgb24gYEF0dHJgLlxuICAvLyBgTm9kZSN0ZXh0Q29udGVudGAgaXMgaW1wbGVtZW50ZWQgb24gYEF0dHJgLCBgRWxlbWVudGAuXG5cbiAgVXRpbGl0aWVzLnNldFByb3BlcnR5VW5jaGVja2VkKE5vZGUucHJvdG90eXBlLCAnaW5zZXJ0QmVmb3JlJyxcbiAgICAvKipcbiAgICAgKiBAdGhpcyB7Tm9kZX1cbiAgICAgKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gICAgICogQHBhcmFtIHs/Tm9kZX0gcmVmTm9kZVxuICAgICAqIEByZXR1cm4geyFOb2RlfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uKG5vZGUsIHJlZk5vZGUpIHtcbiAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudCkge1xuICAgICAgICBjb25zdCBpbnNlcnRlZE5vZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgIGNvbnN0IG5hdGl2ZVJlc3VsdCA9IE5hdGl2ZS5Ob2RlX2luc2VydEJlZm9yZS5jYWxsKHRoaXMsIG5vZGUsIHJlZk5vZGUpO1xuXG4gICAgICAgIC8vIERvY3VtZW50RnJhZ21lbnRzIGNhbid0IGJlIGNvbm5lY3RlZCwgc28gYGRpc2Nvbm5lY3RUcmVlYCB3aWxsIG5ldmVyXG4gICAgICAgIC8vIG5lZWQgdG8gYmUgY2FsbGVkIG9uIGEgRG9jdW1lbnRGcmFnbWVudCdzIGNoaWxkcmVuIGFmdGVyIGluc2VydGluZyBpdC5cblxuICAgICAgICBpZiAoVXRpbGl0aWVzLmlzQ29ubmVjdGVkKHRoaXMpKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnNlcnRlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpbnRlcm5hbHMuY29ubmVjdFRyZWUoaW5zZXJ0ZWROb2Rlc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5hdGl2ZVJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgbm9kZVdhc0Nvbm5lY3RlZCA9IFV0aWxpdGllcy5pc0Nvbm5lY3RlZChub2RlKTtcbiAgICAgIGNvbnN0IG5hdGl2ZVJlc3VsdCA9IE5hdGl2ZS5Ob2RlX2luc2VydEJlZm9yZS5jYWxsKHRoaXMsIG5vZGUsIHJlZk5vZGUpO1xuXG4gICAgICBpZiAobm9kZVdhc0Nvbm5lY3RlZCkge1xuICAgICAgICBpbnRlcm5hbHMuZGlzY29ubmVjdFRyZWUobm9kZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChVdGlsaXRpZXMuaXNDb25uZWN0ZWQodGhpcykpIHtcbiAgICAgICAgaW50ZXJuYWxzLmNvbm5lY3RUcmVlKG5vZGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmF0aXZlUmVzdWx0O1xuICAgIH0pO1xuXG4gIFV0aWxpdGllcy5zZXRQcm9wZXJ0eVVuY2hlY2tlZChOb2RlLnByb3RvdHlwZSwgJ2FwcGVuZENoaWxkJyxcbiAgICAvKipcbiAgICAgKiBAdGhpcyB7Tm9kZX1cbiAgICAgKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gICAgICogQHJldHVybiB7IU5vZGV9XG4gICAgICovXG4gICAgZnVuY3Rpb24obm9kZSkge1xuICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50KSB7XG4gICAgICAgIGNvbnN0IGluc2VydGVkTm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgY29uc3QgbmF0aXZlUmVzdWx0ID0gTmF0aXZlLk5vZGVfYXBwZW5kQ2hpbGQuY2FsbCh0aGlzLCBub2RlKTtcblxuICAgICAgICAvLyBEb2N1bWVudEZyYWdtZW50cyBjYW4ndCBiZSBjb25uZWN0ZWQsIHNvIGBkaXNjb25uZWN0VHJlZWAgd2lsbCBuZXZlclxuICAgICAgICAvLyBuZWVkIHRvIGJlIGNhbGxlZCBvbiBhIERvY3VtZW50RnJhZ21lbnQncyBjaGlsZHJlbiBhZnRlciBpbnNlcnRpbmcgaXQuXG5cbiAgICAgICAgaWYgKFV0aWxpdGllcy5pc0Nvbm5lY3RlZCh0aGlzKSkge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5zZXJ0ZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaW50ZXJuYWxzLmNvbm5lY3RUcmVlKGluc2VydGVkTm9kZXNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuYXRpdmVSZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5vZGVXYXNDb25uZWN0ZWQgPSBVdGlsaXRpZXMuaXNDb25uZWN0ZWQobm9kZSk7XG4gICAgICBjb25zdCBuYXRpdmVSZXN1bHQgPSBOYXRpdmUuTm9kZV9hcHBlbmRDaGlsZC5jYWxsKHRoaXMsIG5vZGUpO1xuXG4gICAgICBpZiAobm9kZVdhc0Nvbm5lY3RlZCkge1xuICAgICAgICBpbnRlcm5hbHMuZGlzY29ubmVjdFRyZWUobm9kZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChVdGlsaXRpZXMuaXNDb25uZWN0ZWQodGhpcykpIHtcbiAgICAgICAgaW50ZXJuYWxzLmNvbm5lY3RUcmVlKG5vZGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmF0aXZlUmVzdWx0O1xuICAgIH0pO1xuXG4gIFV0aWxpdGllcy5zZXRQcm9wZXJ0eVVuY2hlY2tlZChOb2RlLnByb3RvdHlwZSwgJ2Nsb25lTm9kZScsXG4gICAgLyoqXG4gICAgICogQHRoaXMge05vZGV9XG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gZGVlcFxuICAgICAqIEByZXR1cm4geyFOb2RlfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uKGRlZXApIHtcbiAgICAgIGNvbnN0IGNsb25lID0gTmF0aXZlLk5vZGVfY2xvbmVOb2RlLmNhbGwodGhpcywgZGVlcCk7XG4gICAgICAvLyBPbmx5IGNyZWF0ZSBjdXN0b20gZWxlbWVudHMgaWYgdGhpcyBlbGVtZW50J3Mgb3duZXIgZG9jdW1lbnQgaXNcbiAgICAgIC8vIGFzc29jaWF0ZWQgd2l0aCB0aGUgcmVnaXN0cnkuXG4gICAgICBpZiAoIXRoaXMub3duZXJEb2N1bWVudC5fX0NFX2hhc1JlZ2lzdHJ5KSB7XG4gICAgICAgIGludGVybmFscy5wYXRjaFRyZWUoY2xvbmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJuYWxzLnBhdGNoQW5kVXBncmFkZVRyZWUoY2xvbmUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNsb25lO1xuICAgIH0pO1xuXG4gIFV0aWxpdGllcy5zZXRQcm9wZXJ0eVVuY2hlY2tlZChOb2RlLnByb3RvdHlwZSwgJ3JlbW92ZUNoaWxkJyxcbiAgICAvKipcbiAgICAgKiBAdGhpcyB7Tm9kZX1cbiAgICAgKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gICAgICogQHJldHVybiB7IU5vZGV9XG4gICAgICovXG4gICAgZnVuY3Rpb24obm9kZSkge1xuICAgICAgY29uc3Qgbm9kZVdhc0Nvbm5lY3RlZCA9IFV0aWxpdGllcy5pc0Nvbm5lY3RlZChub2RlKTtcbiAgICAgIGNvbnN0IG5hdGl2ZVJlc3VsdCA9IE5hdGl2ZS5Ob2RlX3JlbW92ZUNoaWxkLmNhbGwodGhpcywgbm9kZSk7XG5cbiAgICAgIGlmIChub2RlV2FzQ29ubmVjdGVkKSB7XG4gICAgICAgIGludGVybmFscy5kaXNjb25uZWN0VHJlZShub2RlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5hdGl2ZVJlc3VsdDtcbiAgICB9KTtcblxuICBVdGlsaXRpZXMuc2V0UHJvcGVydHlVbmNoZWNrZWQoTm9kZS5wcm90b3R5cGUsICdyZXBsYWNlQ2hpbGQnLFxuICAgIC8qKlxuICAgICAqIEB0aGlzIHtOb2RlfVxuICAgICAqIEBwYXJhbSB7IU5vZGV9IG5vZGVUb0luc2VydFxuICAgICAqIEBwYXJhbSB7IU5vZGV9IG5vZGVUb1JlbW92ZVxuICAgICAqIEByZXR1cm4geyFOb2RlfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uKG5vZGVUb0luc2VydCwgbm9kZVRvUmVtb3ZlKSB7XG4gICAgICBpZiAobm9kZVRvSW5zZXJ0IGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudCkge1xuICAgICAgICBjb25zdCBpbnNlcnRlZE5vZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KG5vZGVUb0luc2VydC5jaGlsZE5vZGVzKTtcbiAgICAgICAgY29uc3QgbmF0aXZlUmVzdWx0ID0gTmF0aXZlLk5vZGVfcmVwbGFjZUNoaWxkLmNhbGwodGhpcywgbm9kZVRvSW5zZXJ0LCBub2RlVG9SZW1vdmUpO1xuXG4gICAgICAgIC8vIERvY3VtZW50RnJhZ21lbnRzIGNhbid0IGJlIGNvbm5lY3RlZCwgc28gYGRpc2Nvbm5lY3RUcmVlYCB3aWxsIG5ldmVyXG4gICAgICAgIC8vIG5lZWQgdG8gYmUgY2FsbGVkIG9uIGEgRG9jdW1lbnRGcmFnbWVudCdzIGNoaWxkcmVuIGFmdGVyIGluc2VydGluZyBpdC5cblxuICAgICAgICBpZiAoVXRpbGl0aWVzLmlzQ29ubmVjdGVkKHRoaXMpKSB7XG4gICAgICAgICAgaW50ZXJuYWxzLmRpc2Nvbm5lY3RUcmVlKG5vZGVUb1JlbW92ZSk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnNlcnRlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpbnRlcm5hbHMuY29ubmVjdFRyZWUoaW5zZXJ0ZWROb2Rlc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5hdGl2ZVJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgbm9kZVRvSW5zZXJ0V2FzQ29ubmVjdGVkID0gVXRpbGl0aWVzLmlzQ29ubmVjdGVkKG5vZGVUb0luc2VydCk7XG4gICAgICBjb25zdCBuYXRpdmVSZXN1bHQgPSBOYXRpdmUuTm9kZV9yZXBsYWNlQ2hpbGQuY2FsbCh0aGlzLCBub2RlVG9JbnNlcnQsIG5vZGVUb1JlbW92ZSk7XG4gICAgICBjb25zdCB0aGlzSXNDb25uZWN0ZWQgPSBVdGlsaXRpZXMuaXNDb25uZWN0ZWQodGhpcyk7XG5cbiAgICAgIGlmICh0aGlzSXNDb25uZWN0ZWQpIHtcbiAgICAgICAgaW50ZXJuYWxzLmRpc2Nvbm5lY3RUcmVlKG5vZGVUb1JlbW92ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChub2RlVG9JbnNlcnRXYXNDb25uZWN0ZWQpIHtcbiAgICAgICAgaW50ZXJuYWxzLmRpc2Nvbm5lY3RUcmVlKG5vZGVUb0luc2VydCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzSXNDb25uZWN0ZWQpIHtcbiAgICAgICAgaW50ZXJuYWxzLmNvbm5lY3RUcmVlKG5vZGVUb0luc2VydCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuYXRpdmVSZXN1bHQ7XG4gICAgfSk7XG5cblxuICBmdW5jdGlvbiBwYXRjaF90ZXh0Q29udGVudChkZXN0aW5hdGlvbiwgYmFzZURlc2NyaXB0b3IpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdGluYXRpb24sICd0ZXh0Q29udGVudCcsIHtcbiAgICAgIGVudW1lcmFibGU6IGJhc2VEZXNjcmlwdG9yLmVudW1lcmFibGUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGJhc2VEZXNjcmlwdG9yLmdldCxcbiAgICAgIHNldDogLyoqIEB0aGlzIHtOb2RlfSAqLyBmdW5jdGlvbihhc3NpZ25lZFZhbHVlKSB7XG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSB0ZXh0IG5vZGUgdGhlbiB0aGVyZSBhcmUgbm8gbm9kZXMgdG8gZGlzY29ubmVjdC5cbiAgICAgICAgaWYgKHRoaXMubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICAgICAgYmFzZURlc2NyaXB0b3Iuc2V0LmNhbGwodGhpcywgYXNzaWduZWRWYWx1ZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlbW92ZWROb2RlcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gQ2hlY2tpbmcgZm9yIGBmaXJzdENoaWxkYCBpcyBmYXN0ZXIgdGhhbiByZWFkaW5nIGBjaGlsZE5vZGVzLmxlbmd0aGBcbiAgICAgICAgLy8gdG8gY29tcGFyZSB3aXRoIDAuXG4gICAgICAgIGlmICh0aGlzLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAvLyBVc2luZyBgY2hpbGROb2Rlc2AgaXMgZmFzdGVyIHRoYW4gYGNoaWxkcmVuYCwgZXZlbiB0aG91Z2ggd2Ugb25seVxuICAgICAgICAgIC8vIGNhcmUgYWJvdXQgZWxlbWVudHMuXG4gICAgICAgICAgY29uc3QgY2hpbGROb2RlcyA9IHRoaXMuY2hpbGROb2RlcztcbiAgICAgICAgICBjb25zdCBjaGlsZE5vZGVzTGVuZ3RoID0gY2hpbGROb2Rlcy5sZW5ndGg7XG4gICAgICAgICAgaWYgKGNoaWxkTm9kZXNMZW5ndGggPiAwICYmIFV0aWxpdGllcy5pc0Nvbm5lY3RlZCh0aGlzKSkge1xuICAgICAgICAgICAgLy8gQ29weWluZyBhbiBhcnJheSBieSBpdGVyYXRpbmcgaXMgZmFzdGVyIHRoYW4gdXNpbmcgc2xpY2UuXG4gICAgICAgICAgICByZW1vdmVkTm9kZXMgPSBuZXcgQXJyYXkoY2hpbGROb2Rlc0xlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkTm9kZXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICByZW1vdmVkTm9kZXNbaV0gPSBjaGlsZE5vZGVzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJhc2VEZXNjcmlwdG9yLnNldC5jYWxsKHRoaXMsIGFzc2lnbmVkVmFsdWUpO1xuXG4gICAgICAgIGlmIChyZW1vdmVkTm9kZXMpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbW92ZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaW50ZXJuYWxzLmRpc2Nvbm5lY3RUcmVlKHJlbW92ZWROb2Rlc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgaWYgKE5hdGl2ZS5Ob2RlX3RleHRDb250ZW50ICYmIE5hdGl2ZS5Ob2RlX3RleHRDb250ZW50LmdldCkge1xuICAgIHBhdGNoX3RleHRDb250ZW50KE5vZGUucHJvdG90eXBlLCBOYXRpdmUuTm9kZV90ZXh0Q29udGVudCk7XG4gIH0gZWxzZSB7XG4gICAgaW50ZXJuYWxzLmFkZFBhdGNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHBhdGNoX3RleHRDb250ZW50KGVsZW1lbnQsIHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAvLyBOT1RFOiBUaGlzIGltcGxlbWVudGF0aW9uIG9mIHRoZSBgdGV4dENvbnRlbnRgIGdldHRlciBhc3N1bWVzIHRoYXRcbiAgICAgICAgLy8gdGV4dCBub2RlcycgYHRleHRDb250ZW50YCBnZXR0ZXIgd2lsbCBub3QgYmUgcGF0Y2hlZC5cbiAgICAgICAgZ2V0OiAvKiogQHRoaXMge05vZGV9ICovIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8qKiBAdHlwZSB7IUFycmF5PHN0cmluZz59ICovXG4gICAgICAgICAgY29uc3QgcGFydHMgPSBbXTtcblxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHRoaXMuY2hpbGROb2Rlc1tpXS50ZXh0Q29udGVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oJycpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IC8qKiBAdGhpcyB7Tm9kZX0gKi8gZnVuY3Rpb24oYXNzaWduZWRWYWx1ZSkge1xuICAgICAgICAgIHdoaWxlICh0aGlzLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIE5hdGl2ZS5Ob2RlX3JlbW92ZUNoaWxkLmNhbGwodGhpcywgdGhpcy5maXJzdENoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgTmF0aXZlLk5vZGVfYXBwZW5kQ2hpbGQuY2FsbCh0aGlzLCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhc3NpZ25lZFZhbHVlKSk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufTtcbiIsImltcG9ydCBDdXN0b21FbGVtZW50SW50ZXJuYWxzIGZyb20gJy4uLy4uL0N1c3RvbUVsZW1lbnRJbnRlcm5hbHMuanMnO1xuaW1wb3J0ICogYXMgVXRpbGl0aWVzIGZyb20gJy4uLy4uL1V0aWxpdGllcy5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgYmVmb3JlOiAhZnVuY3Rpb24oLi4uKCFOb2RlfHN0cmluZykpLFxuICogICBhZnRlcjogIWZ1bmN0aW9uKC4uLighTm9kZXxzdHJpbmcpKSxcbiAqICAgcmVwbGFjZVdpdGg6ICFmdW5jdGlvbiguLi4oIU5vZGV8c3RyaW5nKSksXG4gKiAgIHJlbW92ZTogIWZ1bmN0aW9uKCksXG4gKiB9fVxuICovXG5sZXQgQ2hpbGROb2RlTmF0aXZlTWV0aG9kcztcblxuLyoqXG4gKiBAcGFyYW0geyFDdXN0b21FbGVtZW50SW50ZXJuYWxzfSBpbnRlcm5hbHNcbiAqIEBwYXJhbSB7IU9iamVjdH0gZGVzdGluYXRpb25cbiAqIEBwYXJhbSB7IUNoaWxkTm9kZU5hdGl2ZU1ldGhvZHN9IGJ1aWx0SW5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW50ZXJuYWxzLCBkZXN0aW5hdGlvbiwgYnVpbHRJbikge1xuICAvKipcbiAgICogQHBhcmFtIHsuLi4oIU5vZGV8c3RyaW5nKX0gbm9kZXNcbiAgICovXG4gIGRlc3RpbmF0aW9uWydiZWZvcmUnXSA9IGZ1bmN0aW9uKC4uLm5vZGVzKSB7XG4gICAgLy8gVE9ETzogRml4IHRoaXMgZm9yIHdoZW4gb25lIG9mIGBub2Rlc2AgaXMgYSBEb2N1bWVudEZyYWdtZW50IVxuICAgIGNvbnN0IGNvbm5lY3RlZEJlZm9yZSA9IC8qKiBAdHlwZSB7IUFycmF5PCFOb2RlPn0gKi8gKG5vZGVzLmZpbHRlcihub2RlID0+IHtcbiAgICAgIC8vIERvY3VtZW50RnJhZ21lbnRzIGFyZSBub3QgY29ubmVjdGVkIGFuZCB3aWxsIG5vdCBiZSBhZGRlZCB0byB0aGUgbGlzdC5cbiAgICAgIHJldHVybiBub2RlIGluc3RhbmNlb2YgTm9kZSAmJiBVdGlsaXRpZXMuaXNDb25uZWN0ZWQobm9kZSk7XG4gICAgfSkpO1xuXG4gICAgYnVpbHRJbi5iZWZvcmUuYXBwbHkodGhpcywgbm9kZXMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25uZWN0ZWRCZWZvcmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGludGVybmFscy5kaXNjb25uZWN0VHJlZShjb25uZWN0ZWRCZWZvcmVbaV0pO1xuICAgIH1cblxuICAgIGlmIChVdGlsaXRpZXMuaXNDb25uZWN0ZWQodGhpcykpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICBpbnRlcm5hbHMuY29ubmVjdFRyZWUobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Li4uKCFOb2RlfHN0cmluZyl9IG5vZGVzXG4gICAqL1xuICBkZXN0aW5hdGlvblsnYWZ0ZXInXSA9IGZ1bmN0aW9uKC4uLm5vZGVzKSB7XG4gICAgLy8gVE9ETzogRml4IHRoaXMgZm9yIHdoZW4gb25lIG9mIGBub2Rlc2AgaXMgYSBEb2N1bWVudEZyYWdtZW50IVxuICAgIGNvbnN0IGNvbm5lY3RlZEJlZm9yZSA9IC8qKiBAdHlwZSB7IUFycmF5PCFOb2RlPn0gKi8gKG5vZGVzLmZpbHRlcihub2RlID0+IHtcbiAgICAgIC8vIERvY3VtZW50RnJhZ21lbnRzIGFyZSBub3QgY29ubmVjdGVkIGFuZCB3aWxsIG5vdCBiZSBhZGRlZCB0byB0aGUgbGlzdC5cbiAgICAgIHJldHVybiBub2RlIGluc3RhbmNlb2YgTm9kZSAmJiBVdGlsaXRpZXMuaXNDb25uZWN0ZWQobm9kZSk7XG4gICAgfSkpO1xuXG4gICAgYnVpbHRJbi5hZnRlci5hcHBseSh0aGlzLCBub2Rlcyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbm5lY3RlZEJlZm9yZS5sZW5ndGg7IGkrKykge1xuICAgICAgaW50ZXJuYWxzLmRpc2Nvbm5lY3RUcmVlKGNvbm5lY3RlZEJlZm9yZVtpXSk7XG4gICAgfVxuXG4gICAgaWYgKFV0aWxpdGllcy5pc0Nvbm5lY3RlZCh0aGlzKSkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgIGludGVybmFscy5jb25uZWN0VHJlZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIHsuLi4oIU5vZGV8c3RyaW5nKX0gbm9kZXNcbiAgICovXG4gIGRlc3RpbmF0aW9uWydyZXBsYWNlV2l0aCddID0gZnVuY3Rpb24oLi4ubm9kZXMpIHtcbiAgICAvLyBUT0RPOiBGaXggdGhpcyBmb3Igd2hlbiBvbmUgb2YgYG5vZGVzYCBpcyBhIERvY3VtZW50RnJhZ21lbnQhXG4gICAgY29uc3QgY29ubmVjdGVkQmVmb3JlID0gLyoqIEB0eXBlIHshQXJyYXk8IU5vZGU+fSAqLyAobm9kZXMuZmlsdGVyKG5vZGUgPT4ge1xuICAgICAgLy8gRG9jdW1lbnRGcmFnbWVudHMgYXJlIG5vdCBjb25uZWN0ZWQgYW5kIHdpbGwgbm90IGJlIGFkZGVkIHRvIHRoZSBsaXN0LlxuICAgICAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBOb2RlICYmIFV0aWxpdGllcy5pc0Nvbm5lY3RlZChub2RlKTtcbiAgICB9KSk7XG5cbiAgICBjb25zdCB3YXNDb25uZWN0ZWQgPSBVdGlsaXRpZXMuaXNDb25uZWN0ZWQodGhpcyk7XG5cbiAgICBidWlsdEluLnJlcGxhY2VXaXRoLmFwcGx5KHRoaXMsIG5vZGVzKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29ubmVjdGVkQmVmb3JlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpbnRlcm5hbHMuZGlzY29ubmVjdFRyZWUoY29ubmVjdGVkQmVmb3JlW2ldKTtcbiAgICB9XG5cbiAgICBpZiAod2FzQ29ubmVjdGVkKSB7XG4gICAgICBpbnRlcm5hbHMuZGlzY29ubmVjdFRyZWUodGhpcyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgaW50ZXJuYWxzLmNvbm5lY3RUcmVlKG5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGRlc3RpbmF0aW9uWydyZW1vdmUnXSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHdhc0Nvbm5lY3RlZCA9IFV0aWxpdGllcy5pc0Nvbm5lY3RlZCh0aGlzKTtcblxuICAgIGJ1aWx0SW4ucmVtb3ZlLmNhbGwodGhpcyk7XG5cbiAgICBpZiAod2FzQ29ubmVjdGVkKSB7XG4gICAgICBpbnRlcm5hbHMuZGlzY29ubmVjdFRyZWUodGhpcyk7XG4gICAgfVxuICB9O1xufTtcbiIsImltcG9ydCBOYXRpdmUgZnJvbSAnLi9OYXRpdmUuanMnO1xuaW1wb3J0IEN1c3RvbUVsZW1lbnRJbnRlcm5hbHMgZnJvbSAnLi4vQ3VzdG9tRWxlbWVudEludGVybmFscy5qcyc7XG5pbXBvcnQgQ0VTdGF0ZSBmcm9tICcuLi9DdXN0b21FbGVtZW50U3RhdGUuanMnO1xuaW1wb3J0ICogYXMgVXRpbGl0aWVzIGZyb20gJy4uL1V0aWxpdGllcy5qcyc7XG5cbmltcG9ydCBQYXRjaFBhcmVudE5vZGUgZnJvbSAnLi9JbnRlcmZhY2UvUGFyZW50Tm9kZS5qcyc7XG5pbXBvcnQgUGF0Y2hDaGlsZE5vZGUgZnJvbSAnLi9JbnRlcmZhY2UvQ2hpbGROb2RlLmpzJztcblxuLyoqXG4gKiBAcGFyYW0geyFDdXN0b21FbGVtZW50SW50ZXJuYWxzfSBpbnRlcm5hbHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW50ZXJuYWxzKSB7XG4gIGlmIChOYXRpdmUuRWxlbWVudF9hdHRhY2hTaGFkb3cpIHtcbiAgICBVdGlsaXRpZXMuc2V0UHJvcGVydHlVbmNoZWNrZWQoRWxlbWVudC5wcm90b3R5cGUsICdhdHRhY2hTaGFkb3cnLFxuICAgICAgLyoqXG4gICAgICAgKiBAdGhpcyB7RWxlbWVudH1cbiAgICAgICAqIEBwYXJhbSB7IXttb2RlOiBzdHJpbmd9fSBpbml0XG4gICAgICAgKiBAcmV0dXJuIHtTaGFkb3dSb290fVxuICAgICAgICovXG4gICAgICBmdW5jdGlvbihpbml0KSB7XG4gICAgICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSBOYXRpdmUuRWxlbWVudF9hdHRhY2hTaGFkb3cuY2FsbCh0aGlzLCBpbml0KTtcbiAgICAgICAgdGhpcy5fX0NFX3NoYWRvd1Jvb3QgPSBzaGFkb3dSb290O1xuICAgICAgICByZXR1cm4gc2hhZG93Um9vdDtcbiAgICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUud2FybignQ3VzdG9tIEVsZW1lbnRzOiBgRWxlbWVudCNhdHRhY2hTaGFkb3dgIHdhcyBub3QgcGF0Y2hlZC4nKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gcGF0Y2hfaW5uZXJIVE1MKGRlc3RpbmF0aW9uLCBiYXNlRGVzY3JpcHRvcikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkZXN0aW5hdGlvbiwgJ2lubmVySFRNTCcsIHtcbiAgICAgIGVudW1lcmFibGU6IGJhc2VEZXNjcmlwdG9yLmVudW1lcmFibGUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGJhc2VEZXNjcmlwdG9yLmdldCxcbiAgICAgIHNldDogLyoqIEB0aGlzIHtFbGVtZW50fSAqLyBmdW5jdGlvbihodG1sU3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGlzQ29ubmVjdGVkID0gVXRpbGl0aWVzLmlzQ29ubmVjdGVkKHRoaXMpO1xuXG4gICAgICAgIC8vIE5PVEU6IEluIElFMTEsIHdoZW4gdXNpbmcgdGhlIG5hdGl2ZSBgaW5uZXJIVE1MYCBzZXR0ZXIsIGFsbCBub2Rlc1xuICAgICAgICAvLyB0aGF0IHdlcmUgcHJldmlvdXNseSBkZXNjZW5kYW50cyBvZiB0aGUgY29udGV4dCBlbGVtZW50IGhhdmUgYWxsIG9mXG4gICAgICAgIC8vIHRoZWlyIGNoaWxkcmVuIHJlbW92ZWQgYXMgcGFydCBvZiB0aGUgc2V0IC0gdGhlIGVudGlyZSBzdWJ0cmVlIGlzXG4gICAgICAgIC8vICdkaXNhc3NlbWJsZWQnLiBUaGlzIHdvcmsgYXJvdW5kIHdhbGtzIHRoZSBzdWJ0cmVlICpiZWZvcmUqIHVzaW5nIHRoZVxuICAgICAgICAvLyBuYXRpdmUgc2V0dGVyLlxuICAgICAgICAvKiogQHR5cGUgeyFBcnJheTwhRWxlbWVudD58dW5kZWZpbmVkfSAqL1xuICAgICAgICBsZXQgcmVtb3ZlZEVsZW1lbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoaXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICByZW1vdmVkRWxlbWVudHMgPSBbXTtcbiAgICAgICAgICBVdGlsaXRpZXMud2Fsa0RlZXBEZXNjZW5kYW50RWxlbWVudHModGhpcywgZWxlbWVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCAhPT0gdGhpcykge1xuICAgICAgICAgICAgICByZW1vdmVkRWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJhc2VEZXNjcmlwdG9yLnNldC5jYWxsKHRoaXMsIGh0bWxTdHJpbmcpO1xuXG4gICAgICAgIGlmIChyZW1vdmVkRWxlbWVudHMpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbW92ZWRFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IHJlbW92ZWRFbGVtZW50c1tpXTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fQ0Vfc3RhdGUgPT09IENFU3RhdGUuY3VzdG9tKSB7XG4gICAgICAgICAgICAgIGludGVybmFscy5kaXNjb25uZWN0ZWRDYWxsYmFjayhlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmx5IGNyZWF0ZSBjdXN0b20gZWxlbWVudHMgaWYgdGhpcyBlbGVtZW50J3Mgb3duZXIgZG9jdW1lbnQgaXNcbiAgICAgICAgLy8gYXNzb2NpYXRlZCB3aXRoIHRoZSByZWdpc3RyeS5cbiAgICAgICAgaWYgKCF0aGlzLm93bmVyRG9jdW1lbnQuX19DRV9oYXNSZWdpc3RyeSkge1xuICAgICAgICAgIGludGVybmFscy5wYXRjaFRyZWUodGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW50ZXJuYWxzLnBhdGNoQW5kVXBncmFkZVRyZWUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWxTdHJpbmc7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgaWYgKE5hdGl2ZS5FbGVtZW50X2lubmVySFRNTCAmJiBOYXRpdmUuRWxlbWVudF9pbm5lckhUTUwuZ2V0KSB7XG4gICAgcGF0Y2hfaW5uZXJIVE1MKEVsZW1lbnQucHJvdG90eXBlLCBOYXRpdmUuRWxlbWVudF9pbm5lckhUTUwpO1xuICB9IGVsc2UgaWYgKE5hdGl2ZS5IVE1MRWxlbWVudF9pbm5lckhUTUwgJiYgTmF0aXZlLkhUTUxFbGVtZW50X2lubmVySFRNTC5nZXQpIHtcbiAgICBwYXRjaF9pbm5lckhUTUwoSFRNTEVsZW1lbnQucHJvdG90eXBlLCBOYXRpdmUuSFRNTEVsZW1lbnRfaW5uZXJIVE1MKTtcbiAgfSBlbHNlIHtcblxuICAgIC8qKiBAdHlwZSB7SFRNTERpdkVsZW1lbnR9ICovXG4gICAgY29uc3QgcmF3RGl2ID0gTmF0aXZlLkRvY3VtZW50X2NyZWF0ZUVsZW1lbnQuY2FsbChkb2N1bWVudCwgJ2RpdicpO1xuXG4gICAgaW50ZXJuYWxzLmFkZFBhdGNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHBhdGNoX2lubmVySFRNTChlbGVtZW50LCB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgLy8gSW1wbGVtZW50cyBnZXR0aW5nIGBpbm5lckhUTUxgIGJ5IHBlcmZvcm1pbmcgYW4gdW5wYXRjaGVkIGBjbG9uZU5vZGVgXG4gICAgICAgIC8vIG9mIHRoZSBlbGVtZW50IGFuZCByZXR1cm5pbmcgdGhlIHJlc3VsdGluZyBlbGVtZW50J3MgYGlubmVySFRNTGAuXG4gICAgICAgIC8vIFRPRE86IElzIHRoaXMgdG9vIGV4cGVuc2l2ZT9cbiAgICAgICAgZ2V0OiAvKiogQHRoaXMge0VsZW1lbnR9ICovIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBOYXRpdmUuTm9kZV9jbG9uZU5vZGUuY2FsbCh0aGlzLCB0cnVlKS5pbm5lckhUTUw7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIEltcGxlbWVudHMgc2V0dGluZyBgaW5uZXJIVE1MYCBieSBjcmVhdGluZyBhbiB1bnBhdGNoZWQgZWxlbWVudCxcbiAgICAgICAgLy8gc2V0dGluZyBgaW5uZXJIVE1MYCBvZiB0aGF0IGVsZW1lbnQgYW5kIHJlcGxhY2luZyB0aGUgdGFyZ2V0XG4gICAgICAgIC8vIGVsZW1lbnQncyBjaGlsZHJlbiB3aXRoIHRob3NlIG9mIHRoZSB1bnBhdGNoZWQgZWxlbWVudC5cbiAgICAgICAgc2V0OiAvKiogQHRoaXMge0VsZW1lbnR9ICovIGZ1bmN0aW9uKGFzc2lnbmVkVmFsdWUpIHtcbiAgICAgICAgICAvLyBOT1RFOiByZS1yb3V0ZSB0byBgY29udGVudGAgZm9yIGB0ZW1wbGF0ZWAgZWxlbWVudHMuXG4gICAgICAgICAgLy8gV2UgbmVlZCB0byBkbyB0aGlzIGJlY2F1c2UgYHRlbXBsYXRlLmFwcGVuZENoaWxkYCBkb2VzIG5vdFxuICAgICAgICAgIC8vIHJvdXRlIGludG8gYHRlbXBsYXRlLmNvbnRlbnRgLlxuICAgICAgICAgIC8qKiBAdHlwZSB7IU5vZGV9ICovXG4gICAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMubG9jYWxOYW1lID09PSAndGVtcGxhdGUnID8gKC8qKiBAdHlwZSB7IUhUTUxUZW1wbGF0ZUVsZW1lbnR9ICovICh0aGlzKSkuY29udGVudCA6IHRoaXM7XG4gICAgICAgICAgcmF3RGl2LmlubmVySFRNTCA9IGFzc2lnbmVkVmFsdWU7XG5cbiAgICAgICAgICB3aGlsZSAoY29udGVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIE5hdGl2ZS5Ob2RlX3JlbW92ZUNoaWxkLmNhbGwoY29udGVudCwgY29udGVudC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgd2hpbGUgKHJhd0Rpdi5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIE5hdGl2ZS5Ob2RlX2FwcGVuZENoaWxkLmNhbGwoY29udGVudCwgcmF3RGl2LmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cblxuICBVdGlsaXRpZXMuc2V0UHJvcGVydHlVbmNoZWNrZWQoRWxlbWVudC5wcm90b3R5cGUsICdzZXRBdHRyaWJ1dGUnLFxuICAgIC8qKlxuICAgICAqIEB0aGlzIHtFbGVtZW50fVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld1ZhbHVlXG4gICAgICovXG4gICAgZnVuY3Rpb24obmFtZSwgbmV3VmFsdWUpIHtcbiAgICAgIC8vIEZhc3QgcGF0aCBmb3Igbm9uLWN1c3RvbSBlbGVtZW50cy5cbiAgICAgIGlmICh0aGlzLl9fQ0Vfc3RhdGUgIT09IENFU3RhdGUuY3VzdG9tKSB7XG4gICAgICAgIHJldHVybiBOYXRpdmUuRWxlbWVudF9zZXRBdHRyaWJ1dGUuY2FsbCh0aGlzLCBuYW1lLCBuZXdWYWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gTmF0aXZlLkVsZW1lbnRfZ2V0QXR0cmlidXRlLmNhbGwodGhpcywgbmFtZSk7XG4gICAgICBOYXRpdmUuRWxlbWVudF9zZXRBdHRyaWJ1dGUuY2FsbCh0aGlzLCBuYW1lLCBuZXdWYWx1ZSk7XG4gICAgICBuZXdWYWx1ZSA9IE5hdGl2ZS5FbGVtZW50X2dldEF0dHJpYnV0ZS5jYWxsKHRoaXMsIG5hbWUpO1xuICAgICAgaW50ZXJuYWxzLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayh0aGlzLCBuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUsIG51bGwpO1xuICAgIH0pO1xuXG4gIFV0aWxpdGllcy5zZXRQcm9wZXJ0eVVuY2hlY2tlZChFbGVtZW50LnByb3RvdHlwZSwgJ3NldEF0dHJpYnV0ZU5TJyxcbiAgICAvKipcbiAgICAgKiBAdGhpcyB7RWxlbWVudH1cbiAgICAgKiBAcGFyYW0gez9zdHJpbmd9IG5hbWVzcGFjZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5ld1ZhbHVlXG4gICAgICovXG4gICAgZnVuY3Rpb24obmFtZXNwYWNlLCBuYW1lLCBuZXdWYWx1ZSkge1xuICAgICAgLy8gRmFzdCBwYXRoIGZvciBub24tY3VzdG9tIGVsZW1lbnRzLlxuICAgICAgaWYgKHRoaXMuX19DRV9zdGF0ZSAhPT0gQ0VTdGF0ZS5jdXN0b20pIHtcbiAgICAgICAgcmV0dXJuIE5hdGl2ZS5FbGVtZW50X3NldEF0dHJpYnV0ZU5TLmNhbGwodGhpcywgbmFtZXNwYWNlLCBuYW1lLCBuZXdWYWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gTmF0aXZlLkVsZW1lbnRfZ2V0QXR0cmlidXRlTlMuY2FsbCh0aGlzLCBuYW1lc3BhY2UsIG5hbWUpO1xuICAgICAgTmF0aXZlLkVsZW1lbnRfc2V0QXR0cmlidXRlTlMuY2FsbCh0aGlzLCBuYW1lc3BhY2UsIG5hbWUsIG5ld1ZhbHVlKTtcbiAgICAgIG5ld1ZhbHVlID0gTmF0aXZlLkVsZW1lbnRfZ2V0QXR0cmlidXRlTlMuY2FsbCh0aGlzLCBuYW1lc3BhY2UsIG5hbWUpO1xuICAgICAgaW50ZXJuYWxzLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayh0aGlzLCBuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUsIG5hbWVzcGFjZSk7XG4gICAgfSk7XG5cbiAgVXRpbGl0aWVzLnNldFByb3BlcnR5VW5jaGVja2VkKEVsZW1lbnQucHJvdG90eXBlLCAncmVtb3ZlQXR0cmlidXRlJyxcbiAgICAvKipcbiAgICAgKiBAdGhpcyB7RWxlbWVudH1cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIC8vIEZhc3QgcGF0aCBmb3Igbm9uLWN1c3RvbSBlbGVtZW50cy5cbiAgICAgIGlmICh0aGlzLl9fQ0Vfc3RhdGUgIT09IENFU3RhdGUuY3VzdG9tKSB7XG4gICAgICAgIHJldHVybiBOYXRpdmUuRWxlbWVudF9yZW1vdmVBdHRyaWJ1dGUuY2FsbCh0aGlzLCBuYW1lKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb2xkVmFsdWUgPSBOYXRpdmUuRWxlbWVudF9nZXRBdHRyaWJ1dGUuY2FsbCh0aGlzLCBuYW1lKTtcbiAgICAgIE5hdGl2ZS5FbGVtZW50X3JlbW92ZUF0dHJpYnV0ZS5jYWxsKHRoaXMsIG5hbWUpO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgIGludGVybmFscy5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sodGhpcywgbmFtZSwgb2xkVmFsdWUsIG51bGwsIG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIFV0aWxpdGllcy5zZXRQcm9wZXJ0eVVuY2hlY2tlZChFbGVtZW50LnByb3RvdHlwZSwgJ3JlbW92ZUF0dHJpYnV0ZU5TJyxcbiAgICAvKipcbiAgICAgKiBAdGhpcyB7RWxlbWVudH1cbiAgICAgKiBAcGFyYW0gez9zdHJpbmd9IG5hbWVzcGFjZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICovXG4gICAgZnVuY3Rpb24obmFtZXNwYWNlLCBuYW1lKSB7XG4gICAgICAvLyBGYXN0IHBhdGggZm9yIG5vbi1jdXN0b20gZWxlbWVudHMuXG4gICAgICBpZiAodGhpcy5fX0NFX3N0YXRlICE9PSBDRVN0YXRlLmN1c3RvbSkge1xuICAgICAgICByZXR1cm4gTmF0aXZlLkVsZW1lbnRfcmVtb3ZlQXR0cmlidXRlTlMuY2FsbCh0aGlzLCBuYW1lc3BhY2UsIG5hbWUpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IE5hdGl2ZS5FbGVtZW50X2dldEF0dHJpYnV0ZU5TLmNhbGwodGhpcywgbmFtZXNwYWNlLCBuYW1lKTtcbiAgICAgIE5hdGl2ZS5FbGVtZW50X3JlbW92ZUF0dHJpYnV0ZU5TLmNhbGwodGhpcywgbmFtZXNwYWNlLCBuYW1lKTtcbiAgICAgIC8vIEluIG9sZGVyIGJyb3dzZXJzLCBgRWxlbWVudCNnZXRBdHRyaWJ1dGVOU2AgbWF5IHJldHVybiB0aGUgZW1wdHkgc3RyaW5nXG4gICAgICAvLyBpbnN0ZWFkIG9mIG51bGwgaWYgdGhlIGF0dHJpYnV0ZSBkb2VzIG5vdCBleGlzdC4gRm9yIGRldGFpbHMsIHNlZTtcbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L2dldEF0dHJpYnV0ZU5TI05vdGVzXG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IE5hdGl2ZS5FbGVtZW50X2dldEF0dHJpYnV0ZU5TLmNhbGwodGhpcywgbmFtZXNwYWNlLCBuYW1lKTtcbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgaW50ZXJuYWxzLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayh0aGlzLCBuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUsIG5hbWVzcGFjZSk7XG4gICAgICB9XG4gICAgfSk7XG5cblxuICBmdW5jdGlvbiBwYXRjaF9pbnNlcnRBZGphY2VudEVsZW1lbnQoZGVzdGluYXRpb24sIGJhc2VNZXRob2QpIHtcbiAgICBVdGlsaXRpZXMuc2V0UHJvcGVydHlVbmNoZWNrZWQoZGVzdGluYXRpb24sICdpbnNlcnRBZGphY2VudEVsZW1lbnQnLFxuICAgICAgLyoqXG4gICAgICAgKiBAdGhpcyB7RWxlbWVudH1cbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3aGVyZVxuICAgICAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgICAgICogQHJldHVybiB7P0VsZW1lbnR9XG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uKHdoZXJlLCBlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHdhc0Nvbm5lY3RlZCA9IFV0aWxpdGllcy5pc0Nvbm5lY3RlZChlbGVtZW50KTtcbiAgICAgICAgY29uc3QgaW5zZXJ0ZWRFbGVtZW50ID0gLyoqIEB0eXBlIHshRWxlbWVudH0gKi9cbiAgICAgICAgICAoYmFzZU1ldGhvZC5jYWxsKHRoaXMsIHdoZXJlLCBlbGVtZW50KSk7XG5cbiAgICAgICAgaWYgKHdhc0Nvbm5lY3RlZCkge1xuICAgICAgICAgIGludGVybmFscy5kaXNjb25uZWN0VHJlZShlbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChVdGlsaXRpZXMuaXNDb25uZWN0ZWQoaW5zZXJ0ZWRFbGVtZW50KSkge1xuICAgICAgICAgIGludGVybmFscy5jb25uZWN0VHJlZShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zZXJ0ZWRFbGVtZW50O1xuICAgICAgfSk7XG4gIH1cblxuICBpZiAoTmF0aXZlLkhUTUxFbGVtZW50X2luc2VydEFkamFjZW50RWxlbWVudCkge1xuICAgIHBhdGNoX2luc2VydEFkamFjZW50RWxlbWVudChIVE1MRWxlbWVudC5wcm90b3R5cGUsIE5hdGl2ZS5IVE1MRWxlbWVudF9pbnNlcnRBZGphY2VudEVsZW1lbnQpO1xuICB9IGVsc2UgaWYgKE5hdGl2ZS5FbGVtZW50X2luc2VydEFkamFjZW50RWxlbWVudCkge1xuICAgIHBhdGNoX2luc2VydEFkamFjZW50RWxlbWVudChFbGVtZW50LnByb3RvdHlwZSwgTmF0aXZlLkVsZW1lbnRfaW5zZXJ0QWRqYWNlbnRFbGVtZW50KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLndhcm4oJ0N1c3RvbSBFbGVtZW50czogYEVsZW1lbnQjaW5zZXJ0QWRqYWNlbnRFbGVtZW50YCB3YXMgbm90IHBhdGNoZWQuJyk7XG4gIH1cblxuXG4gIFBhdGNoUGFyZW50Tm9kZShpbnRlcm5hbHMsIEVsZW1lbnQucHJvdG90eXBlLCB7XG4gICAgcHJlcGVuZDogTmF0aXZlLkVsZW1lbnRfcHJlcGVuZCxcbiAgICBhcHBlbmQ6IE5hdGl2ZS5FbGVtZW50X2FwcGVuZCxcbiAgfSk7XG5cbiAgUGF0Y2hDaGlsZE5vZGUoaW50ZXJuYWxzLCBFbGVtZW50LnByb3RvdHlwZSwge1xuICAgIGJlZm9yZTogTmF0aXZlLkVsZW1lbnRfYmVmb3JlLFxuICAgIGFmdGVyOiBOYXRpdmUuRWxlbWVudF9hZnRlcixcbiAgICByZXBsYWNlV2l0aDogTmF0aXZlLkVsZW1lbnRfcmVwbGFjZVdpdGgsXG4gICAgcmVtb3ZlOiBOYXRpdmUuRWxlbWVudF9yZW1vdmUsXG4gIH0pO1xufTtcbiIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNiBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuXG5pbXBvcnQgQ3VzdG9tRWxlbWVudEludGVybmFscyBmcm9tICcuL0N1c3RvbUVsZW1lbnRJbnRlcm5hbHMuanMnO1xuaW1wb3J0IEN1c3RvbUVsZW1lbnRSZWdpc3RyeSBmcm9tICcuL0N1c3RvbUVsZW1lbnRSZWdpc3RyeS5qcyc7XG5cbmltcG9ydCBQYXRjaEhUTUxFbGVtZW50IGZyb20gJy4vUGF0Y2gvSFRNTEVsZW1lbnQuanMnO1xuaW1wb3J0IFBhdGNoRG9jdW1lbnQgZnJvbSAnLi9QYXRjaC9Eb2N1bWVudC5qcyc7XG5pbXBvcnQgUGF0Y2hOb2RlIGZyb20gJy4vUGF0Y2gvTm9kZS5qcyc7XG5pbXBvcnQgUGF0Y2hFbGVtZW50IGZyb20gJy4vUGF0Y2gvRWxlbWVudC5qcyc7XG5cbmNvbnN0IHByaW9yQ3VzdG9tRWxlbWVudHMgPSB3aW5kb3dbJ2N1c3RvbUVsZW1lbnRzJ107XG5cbmlmICghcHJpb3JDdXN0b21FbGVtZW50cyB8fFxuICAgICBwcmlvckN1c3RvbUVsZW1lbnRzWydmb3JjZVBvbHlmaWxsJ10gfHxcbiAgICAgKHR5cGVvZiBwcmlvckN1c3RvbUVsZW1lbnRzWydkZWZpbmUnXSAhPSAnZnVuY3Rpb24nKSB8fFxuICAgICAodHlwZW9mIHByaW9yQ3VzdG9tRWxlbWVudHNbJ2dldCddICE9ICdmdW5jdGlvbicpKSB7XG4gIC8qKiBAdHlwZSB7IUN1c3RvbUVsZW1lbnRJbnRlcm5hbHN9ICovXG4gIGNvbnN0IGludGVybmFscyA9IG5ldyBDdXN0b21FbGVtZW50SW50ZXJuYWxzKCk7XG5cbiAgUGF0Y2hIVE1MRWxlbWVudChpbnRlcm5hbHMpO1xuICBQYXRjaERvY3VtZW50KGludGVybmFscyk7XG4gIFBhdGNoTm9kZShpbnRlcm5hbHMpO1xuICBQYXRjaEVsZW1lbnQoaW50ZXJuYWxzKTtcblxuICAvLyBUaGUgbWFpbiBkb2N1bWVudCBpcyBhbHdheXMgYXNzb2NpYXRlZCB3aXRoIHRoZSByZWdpc3RyeS5cbiAgZG9jdW1lbnQuX19DRV9oYXNSZWdpc3RyeSA9IHRydWU7XG5cbiAgLyoqIEB0eXBlIHshQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5fSAqL1xuICBjb25zdCBjdXN0b21FbGVtZW50cyA9IG5ldyBDdXN0b21FbGVtZW50UmVnaXN0cnkoaW50ZXJuYWxzKTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LCAnY3VzdG9tRWxlbWVudHMnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgdmFsdWU6IGN1c3RvbUVsZW1lbnRzLFxuICB9KTtcbn1cbiIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNCBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLy8gQHZlcnNpb24gMC43LjIyXG5cbihmdW5jdGlvbihnbG9iYWwpIHtcbiAgaWYgKGdsb2JhbC5Kc011dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIHJlZ2lzdHJhdGlvbnNUYWJsZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHZhciBzZXRJbW1lZGlhdGU7XG4gIGlmICgvVHJpZGVudHxFZGdlLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG4gICAgc2V0SW1tZWRpYXRlID0gc2V0VGltZW91dDtcbiAgfSBlbHNlIGlmICh3aW5kb3cuc2V0SW1tZWRpYXRlKSB7XG4gICAgc2V0SW1tZWRpYXRlID0gd2luZG93LnNldEltbWVkaWF0ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2V0SW1tZWRpYXRlUXVldWUgPSBbXTtcbiAgICB2YXIgc2VudGluZWwgPSBTdHJpbmcoTWF0aC5yYW5kb20oKSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLmRhdGEgPT09IHNlbnRpbmVsKSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IHNldEltbWVkaWF0ZVF1ZXVlO1xuICAgICAgICBzZXRJbW1lZGlhdGVRdWV1ZSA9IFtdO1xuICAgICAgICBxdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgICBmdW5jKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNldEltbWVkaWF0ZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgIHNldEltbWVkaWF0ZVF1ZXVlLnB1c2goZnVuYyk7XG4gICAgICB3aW5kb3cucG9zdE1lc3NhZ2Uoc2VudGluZWwsIFwiKlwiKTtcbiAgICB9O1xuICB9XG4gIHZhciBpc1NjaGVkdWxlZCA9IGZhbHNlO1xuICB2YXIgc2NoZWR1bGVkT2JzZXJ2ZXJzID0gW107XG4gIGZ1bmN0aW9uIHNjaGVkdWxlQ2FsbGJhY2sob2JzZXJ2ZXIpIHtcbiAgICBzY2hlZHVsZWRPYnNlcnZlcnMucHVzaChvYnNlcnZlcik7XG4gICAgaWYgKCFpc1NjaGVkdWxlZCkge1xuICAgICAgaXNTY2hlZHVsZWQgPSB0cnVlO1xuICAgICAgc2V0SW1tZWRpYXRlKGRpc3BhdGNoQ2FsbGJhY2tzKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gd3JhcElmTmVlZGVkKG5vZGUpIHtcbiAgICByZXR1cm4gd2luZG93LlNoYWRvd0RPTVBvbHlmaWxsICYmIHdpbmRvdy5TaGFkb3dET01Qb2x5ZmlsbC53cmFwSWZOZWVkZWQobm9kZSkgfHwgbm9kZTtcbiAgfVxuICBmdW5jdGlvbiBkaXNwYXRjaENhbGxiYWNrcygpIHtcbiAgICBpc1NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIHZhciBvYnNlcnZlcnMgPSBzY2hlZHVsZWRPYnNlcnZlcnM7XG4gICAgc2NoZWR1bGVkT2JzZXJ2ZXJzID0gW107XG4gICAgb2JzZXJ2ZXJzLnNvcnQoZnVuY3Rpb24obzEsIG8yKSB7XG4gICAgICByZXR1cm4gbzEudWlkXyAtIG8yLnVpZF87XG4gICAgfSk7XG4gICAgdmFyIGFueU5vbkVtcHR5ID0gZmFsc2U7XG4gICAgb2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24ob2JzZXJ2ZXIpIHtcbiAgICAgIHZhciBxdWV1ZSA9IG9ic2VydmVyLnRha2VSZWNvcmRzKCk7XG4gICAgICByZW1vdmVUcmFuc2llbnRPYnNlcnZlcnNGb3Iob2JzZXJ2ZXIpO1xuICAgICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBvYnNlcnZlci5jYWxsYmFja18ocXVldWUsIG9ic2VydmVyKTtcbiAgICAgICAgYW55Tm9uRW1wdHkgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChhbnlOb25FbXB0eSkgZGlzcGF0Y2hDYWxsYmFja3MoKTtcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVUcmFuc2llbnRPYnNlcnZlcnNGb3Iob2JzZXJ2ZXIpIHtcbiAgICBvYnNlcnZlci5ub2Rlc18uZm9yRWFjaChmdW5jdGlvbihub2RlKSB7XG4gICAgICB2YXIgcmVnaXN0cmF0aW9ucyA9IHJlZ2lzdHJhdGlvbnNUYWJsZS5nZXQobm9kZSk7XG4gICAgICBpZiAoIXJlZ2lzdHJhdGlvbnMpIHJldHVybjtcbiAgICAgIHJlZ2lzdHJhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihyZWdpc3RyYXRpb24pIHtcbiAgICAgICAgaWYgKHJlZ2lzdHJhdGlvbi5vYnNlcnZlciA9PT0gb2JzZXJ2ZXIpIHJlZ2lzdHJhdGlvbi5yZW1vdmVUcmFuc2llbnRPYnNlcnZlcnMoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIGZvckVhY2hBbmNlc3RvckFuZE9ic2VydmVyRW5xdWV1ZVJlY29yZCh0YXJnZXQsIGNhbGxiYWNrKSB7XG4gICAgZm9yICh2YXIgbm9kZSA9IHRhcmdldDsgbm9kZTsgbm9kZSA9IG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgdmFyIHJlZ2lzdHJhdGlvbnMgPSByZWdpc3RyYXRpb25zVGFibGUuZ2V0KG5vZGUpO1xuICAgICAgaWYgKHJlZ2lzdHJhdGlvbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByZWdpc3RyYXRpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgdmFyIHJlZ2lzdHJhdGlvbiA9IHJlZ2lzdHJhdGlvbnNbal07XG4gICAgICAgICAgdmFyIG9wdGlvbnMgPSByZWdpc3RyYXRpb24ub3B0aW9ucztcbiAgICAgICAgICBpZiAobm9kZSAhPT0gdGFyZ2V0ICYmICFvcHRpb25zLnN1YnRyZWUpIGNvbnRpbnVlO1xuICAgICAgICAgIHZhciByZWNvcmQgPSBjYWxsYmFjayhvcHRpb25zKTtcbiAgICAgICAgICBpZiAocmVjb3JkKSByZWdpc3RyYXRpb24uZW5xdWV1ZShyZWNvcmQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHZhciB1aWRDb3VudGVyID0gMDtcbiAgZnVuY3Rpb24gSnNNdXRhdGlvbk9ic2VydmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5jYWxsYmFja18gPSBjYWxsYmFjaztcbiAgICB0aGlzLm5vZGVzXyA9IFtdO1xuICAgIHRoaXMucmVjb3Jkc18gPSBbXTtcbiAgICB0aGlzLnVpZF8gPSArK3VpZENvdW50ZXI7XG4gIH1cbiAgSnNNdXRhdGlvbk9ic2VydmVyLnByb3RvdHlwZSA9IHtcbiAgICBvYnNlcnZlOiBmdW5jdGlvbih0YXJnZXQsIG9wdGlvbnMpIHtcbiAgICAgIHRhcmdldCA9IHdyYXBJZk5lZWRlZCh0YXJnZXQpO1xuICAgICAgaWYgKCFvcHRpb25zLmNoaWxkTGlzdCAmJiAhb3B0aW9ucy5hdHRyaWJ1dGVzICYmICFvcHRpb25zLmNoYXJhY3RlckRhdGEgfHwgb3B0aW9ucy5hdHRyaWJ1dGVPbGRWYWx1ZSAmJiAhb3B0aW9ucy5hdHRyaWJ1dGVzIHx8IG9wdGlvbnMuYXR0cmlidXRlRmlsdGVyICYmIG9wdGlvbnMuYXR0cmlidXRlRmlsdGVyLmxlbmd0aCAmJiAhb3B0aW9ucy5hdHRyaWJ1dGVzIHx8IG9wdGlvbnMuY2hhcmFjdGVyRGF0YU9sZFZhbHVlICYmICFvcHRpb25zLmNoYXJhY3RlckRhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCk7XG4gICAgICB9XG4gICAgICB2YXIgcmVnaXN0cmF0aW9ucyA9IHJlZ2lzdHJhdGlvbnNUYWJsZS5nZXQodGFyZ2V0KTtcbiAgICAgIGlmICghcmVnaXN0cmF0aW9ucykgcmVnaXN0cmF0aW9uc1RhYmxlLnNldCh0YXJnZXQsIHJlZ2lzdHJhdGlvbnMgPSBbXSk7XG4gICAgICB2YXIgcmVnaXN0cmF0aW9uO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpc3RyYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyZWdpc3RyYXRpb25zW2ldLm9ic2VydmVyID09PSB0aGlzKSB7XG4gICAgICAgICAgcmVnaXN0cmF0aW9uID0gcmVnaXN0cmF0aW9uc1tpXTtcbiAgICAgICAgICByZWdpc3RyYXRpb24ucmVtb3ZlTGlzdGVuZXJzKCk7XG4gICAgICAgICAgcmVnaXN0cmF0aW9uLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIXJlZ2lzdHJhdGlvbikge1xuICAgICAgICByZWdpc3RyYXRpb24gPSBuZXcgUmVnaXN0cmF0aW9uKHRoaXMsIHRhcmdldCwgb3B0aW9ucyk7XG4gICAgICAgIHJlZ2lzdHJhdGlvbnMucHVzaChyZWdpc3RyYXRpb24pO1xuICAgICAgICB0aGlzLm5vZGVzXy5wdXNoKHRhcmdldCk7XG4gICAgICB9XG4gICAgICByZWdpc3RyYXRpb24uYWRkTGlzdGVuZXJzKCk7XG4gICAgfSxcbiAgICBkaXNjb25uZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubm9kZXNfLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgcmVnaXN0cmF0aW9ucyA9IHJlZ2lzdHJhdGlvbnNUYWJsZS5nZXQobm9kZSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaXN0cmF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciByZWdpc3RyYXRpb24gPSByZWdpc3RyYXRpb25zW2ldO1xuICAgICAgICAgIGlmIChyZWdpc3RyYXRpb24ub2JzZXJ2ZXIgPT09IHRoaXMpIHtcbiAgICAgICAgICAgIHJlZ2lzdHJhdGlvbi5yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgICAgICAgICAgIHJlZ2lzdHJhdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICAgIHRoaXMucmVjb3Jkc18gPSBbXTtcbiAgICB9LFxuICAgIHRha2VSZWNvcmRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb3B5T2ZSZWNvcmRzID0gdGhpcy5yZWNvcmRzXztcbiAgICAgIHRoaXMucmVjb3Jkc18gPSBbXTtcbiAgICAgIHJldHVybiBjb3B5T2ZSZWNvcmRzO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gTXV0YXRpb25SZWNvcmQodHlwZSwgdGFyZ2V0KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB0aGlzLmFkZGVkTm9kZXMgPSBbXTtcbiAgICB0aGlzLnJlbW92ZWROb2RlcyA9IFtdO1xuICAgIHRoaXMucHJldmlvdXNTaWJsaW5nID0gbnVsbDtcbiAgICB0aGlzLm5leHRTaWJsaW5nID0gbnVsbDtcbiAgICB0aGlzLmF0dHJpYnV0ZU5hbWUgPSBudWxsO1xuICAgIHRoaXMuYXR0cmlidXRlTmFtZXNwYWNlID0gbnVsbDtcbiAgICB0aGlzLm9sZFZhbHVlID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBjb3B5TXV0YXRpb25SZWNvcmQob3JpZ2luYWwpIHtcbiAgICB2YXIgcmVjb3JkID0gbmV3IE11dGF0aW9uUmVjb3JkKG9yaWdpbmFsLnR5cGUsIG9yaWdpbmFsLnRhcmdldCk7XG4gICAgcmVjb3JkLmFkZGVkTm9kZXMgPSBvcmlnaW5hbC5hZGRlZE5vZGVzLnNsaWNlKCk7XG4gICAgcmVjb3JkLnJlbW92ZWROb2RlcyA9IG9yaWdpbmFsLnJlbW92ZWROb2Rlcy5zbGljZSgpO1xuICAgIHJlY29yZC5wcmV2aW91c1NpYmxpbmcgPSBvcmlnaW5hbC5wcmV2aW91c1NpYmxpbmc7XG4gICAgcmVjb3JkLm5leHRTaWJsaW5nID0gb3JpZ2luYWwubmV4dFNpYmxpbmc7XG4gICAgcmVjb3JkLmF0dHJpYnV0ZU5hbWUgPSBvcmlnaW5hbC5hdHRyaWJ1dGVOYW1lO1xuICAgIHJlY29yZC5hdHRyaWJ1dGVOYW1lc3BhY2UgPSBvcmlnaW5hbC5hdHRyaWJ1dGVOYW1lc3BhY2U7XG4gICAgcmVjb3JkLm9sZFZhbHVlID0gb3JpZ2luYWwub2xkVmFsdWU7XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuICB2YXIgY3VycmVudFJlY29yZCwgcmVjb3JkV2l0aE9sZFZhbHVlO1xuICBmdW5jdGlvbiBnZXRSZWNvcmQodHlwZSwgdGFyZ2V0KSB7XG4gICAgcmV0dXJuIGN1cnJlbnRSZWNvcmQgPSBuZXcgTXV0YXRpb25SZWNvcmQodHlwZSwgdGFyZ2V0KTtcbiAgfVxuICBmdW5jdGlvbiBnZXRSZWNvcmRXaXRoT2xkVmFsdWUob2xkVmFsdWUpIHtcbiAgICBpZiAocmVjb3JkV2l0aE9sZFZhbHVlKSByZXR1cm4gcmVjb3JkV2l0aE9sZFZhbHVlO1xuICAgIHJlY29yZFdpdGhPbGRWYWx1ZSA9IGNvcHlNdXRhdGlvblJlY29yZChjdXJyZW50UmVjb3JkKTtcbiAgICByZWNvcmRXaXRoT2xkVmFsdWUub2xkVmFsdWUgPSBvbGRWYWx1ZTtcbiAgICByZXR1cm4gcmVjb3JkV2l0aE9sZFZhbHVlO1xuICB9XG4gIGZ1bmN0aW9uIGNsZWFyUmVjb3JkcygpIHtcbiAgICBjdXJyZW50UmVjb3JkID0gcmVjb3JkV2l0aE9sZFZhbHVlID0gdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIHJlY29yZFJlcHJlc2VudHNDdXJyZW50TXV0YXRpb24ocmVjb3JkKSB7XG4gICAgcmV0dXJuIHJlY29yZCA9PT0gcmVjb3JkV2l0aE9sZFZhbHVlIHx8IHJlY29yZCA9PT0gY3VycmVudFJlY29yZDtcbiAgfVxuICBmdW5jdGlvbiBzZWxlY3RSZWNvcmQobGFzdFJlY29yZCwgbmV3UmVjb3JkKSB7XG4gICAgaWYgKGxhc3RSZWNvcmQgPT09IG5ld1JlY29yZCkgcmV0dXJuIGxhc3RSZWNvcmQ7XG4gICAgaWYgKHJlY29yZFdpdGhPbGRWYWx1ZSAmJiByZWNvcmRSZXByZXNlbnRzQ3VycmVudE11dGF0aW9uKGxhc3RSZWNvcmQpKSByZXR1cm4gcmVjb3JkV2l0aE9sZFZhbHVlO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIFJlZ2lzdHJhdGlvbihvYnNlcnZlciwgdGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdGhpcy5vYnNlcnZlciA9IG9ic2VydmVyO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy50cmFuc2llbnRPYnNlcnZlZE5vZGVzID0gW107XG4gIH1cbiAgUmVnaXN0cmF0aW9uLnByb3RvdHlwZSA9IHtcbiAgICBlbnF1ZXVlOiBmdW5jdGlvbihyZWNvcmQpIHtcbiAgICAgIHZhciByZWNvcmRzID0gdGhpcy5vYnNlcnZlci5yZWNvcmRzXztcbiAgICAgIHZhciBsZW5ndGggPSByZWNvcmRzLmxlbmd0aDtcbiAgICAgIGlmIChyZWNvcmRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGxhc3RSZWNvcmQgPSByZWNvcmRzW2xlbmd0aCAtIDFdO1xuICAgICAgICB2YXIgcmVjb3JkVG9SZXBsYWNlTGFzdCA9IHNlbGVjdFJlY29yZChsYXN0UmVjb3JkLCByZWNvcmQpO1xuICAgICAgICBpZiAocmVjb3JkVG9SZXBsYWNlTGFzdCkge1xuICAgICAgICAgIHJlY29yZHNbbGVuZ3RoIC0gMV0gPSByZWNvcmRUb1JlcGxhY2VMYXN0O1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NoZWR1bGVDYWxsYmFjayh0aGlzLm9ic2VydmVyKTtcbiAgICAgIH1cbiAgICAgIHJlY29yZHNbbGVuZ3RoXSA9IHJlY29yZDtcbiAgICB9LFxuICAgIGFkZExpc3RlbmVyczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFkZExpc3RlbmVyc18odGhpcy50YXJnZXQpO1xuICAgIH0sXG4gICAgYWRkTGlzdGVuZXJzXzogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICBpZiAob3B0aW9ucy5hdHRyaWJ1dGVzKSBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJET01BdHRyTW9kaWZpZWRcIiwgdGhpcywgdHJ1ZSk7XG4gICAgICBpZiAob3B0aW9ucy5jaGFyYWN0ZXJEYXRhKSBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJET01DaGFyYWN0ZXJEYXRhTW9kaWZpZWRcIiwgdGhpcywgdHJ1ZSk7XG4gICAgICBpZiAob3B0aW9ucy5jaGlsZExpc3QpIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTU5vZGVJbnNlcnRlZFwiLCB0aGlzLCB0cnVlKTtcbiAgICAgIGlmIChvcHRpb25zLmNoaWxkTGlzdCB8fCBvcHRpb25zLnN1YnRyZWUpIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTU5vZGVSZW1vdmVkXCIsIHRoaXMsIHRydWUpO1xuICAgIH0sXG4gICAgcmVtb3ZlTGlzdGVuZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzXyh0aGlzLnRhcmdldCk7XG4gICAgfSxcbiAgICByZW1vdmVMaXN0ZW5lcnNfOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIGlmIChvcHRpb25zLmF0dHJpYnV0ZXMpIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTUF0dHJNb2RpZmllZFwiLCB0aGlzLCB0cnVlKTtcbiAgICAgIGlmIChvcHRpb25zLmNoYXJhY3RlckRhdGEpIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTUNoYXJhY3RlckRhdGFNb2RpZmllZFwiLCB0aGlzLCB0cnVlKTtcbiAgICAgIGlmIChvcHRpb25zLmNoaWxkTGlzdCkgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NTm9kZUluc2VydGVkXCIsIHRoaXMsIHRydWUpO1xuICAgICAgaWYgKG9wdGlvbnMuY2hpbGRMaXN0IHx8IG9wdGlvbnMuc3VidHJlZSkgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NTm9kZVJlbW92ZWRcIiwgdGhpcywgdHJ1ZSk7XG4gICAgfSxcbiAgICBhZGRUcmFuc2llbnRPYnNlcnZlcjogZnVuY3Rpb24obm9kZSkge1xuICAgICAgaWYgKG5vZGUgPT09IHRoaXMudGFyZ2V0KSByZXR1cm47XG4gICAgICB0aGlzLmFkZExpc3RlbmVyc18obm9kZSk7XG4gICAgICB0aGlzLnRyYW5zaWVudE9ic2VydmVkTm9kZXMucHVzaChub2RlKTtcbiAgICAgIHZhciByZWdpc3RyYXRpb25zID0gcmVnaXN0cmF0aW9uc1RhYmxlLmdldChub2RlKTtcbiAgICAgIGlmICghcmVnaXN0cmF0aW9ucykgcmVnaXN0cmF0aW9uc1RhYmxlLnNldChub2RlLCByZWdpc3RyYXRpb25zID0gW10pO1xuICAgICAgcmVnaXN0cmF0aW9ucy5wdXNoKHRoaXMpO1xuICAgIH0sXG4gICAgcmVtb3ZlVHJhbnNpZW50T2JzZXJ2ZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0cmFuc2llbnRPYnNlcnZlZE5vZGVzID0gdGhpcy50cmFuc2llbnRPYnNlcnZlZE5vZGVzO1xuICAgICAgdGhpcy50cmFuc2llbnRPYnNlcnZlZE5vZGVzID0gW107XG4gICAgICB0cmFuc2llbnRPYnNlcnZlZE5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyc18obm9kZSk7XG4gICAgICAgIHZhciByZWdpc3RyYXRpb25zID0gcmVnaXN0cmF0aW9uc1RhYmxlLmdldChub2RlKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWdpc3RyYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHJlZ2lzdHJhdGlvbnNbaV0gPT09IHRoaXMpIHtcbiAgICAgICAgICAgIHJlZ2lzdHJhdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuICAgIGhhbmRsZUV2ZW50OiBmdW5jdGlvbihlKSB7XG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgc3dpdGNoIChlLnR5cGUpIHtcbiAgICAgICBjYXNlIFwiRE9NQXR0ck1vZGlmaWVkXCI6XG4gICAgICAgIHZhciBuYW1lID0gZS5hdHRyTmFtZTtcbiAgICAgICAgdmFyIG5hbWVzcGFjZSA9IGUucmVsYXRlZE5vZGUubmFtZXNwYWNlVVJJO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIHZhciByZWNvcmQgPSBuZXcgZ2V0UmVjb3JkKFwiYXR0cmlidXRlc1wiLCB0YXJnZXQpO1xuICAgICAgICByZWNvcmQuYXR0cmlidXRlTmFtZSA9IG5hbWU7XG4gICAgICAgIHJlY29yZC5hdHRyaWJ1dGVOYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgICAgIHZhciBvbGRWYWx1ZSA9IGUuYXR0ckNoYW5nZSA9PT0gTXV0YXRpb25FdmVudC5BRERJVElPTiA/IG51bGwgOiBlLnByZXZWYWx1ZTtcbiAgICAgICAgZm9yRWFjaEFuY2VzdG9yQW5kT2JzZXJ2ZXJFbnF1ZXVlUmVjb3JkKHRhcmdldCwgZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICAgIGlmICghb3B0aW9ucy5hdHRyaWJ1dGVzKSByZXR1cm47XG4gICAgICAgICAgaWYgKG9wdGlvbnMuYXR0cmlidXRlRmlsdGVyICYmIG9wdGlvbnMuYXR0cmlidXRlRmlsdGVyLmxlbmd0aCAmJiBvcHRpb25zLmF0dHJpYnV0ZUZpbHRlci5pbmRleE9mKG5hbWUpID09PSAtMSAmJiBvcHRpb25zLmF0dHJpYnV0ZUZpbHRlci5pbmRleE9mKG5hbWVzcGFjZSkgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcHRpb25zLmF0dHJpYnV0ZU9sZFZhbHVlKSByZXR1cm4gZ2V0UmVjb3JkV2l0aE9sZFZhbHVlKG9sZFZhbHVlKTtcbiAgICAgICAgICByZXR1cm4gcmVjb3JkO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgICBjYXNlIFwiRE9NQ2hhcmFjdGVyRGF0YU1vZGlmaWVkXCI6XG4gICAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgICAgdmFyIHJlY29yZCA9IGdldFJlY29yZChcImNoYXJhY3RlckRhdGFcIiwgdGFyZ2V0KTtcbiAgICAgICAgdmFyIG9sZFZhbHVlID0gZS5wcmV2VmFsdWU7XG4gICAgICAgIGZvckVhY2hBbmNlc3RvckFuZE9ic2VydmVyRW5xdWV1ZVJlY29yZCh0YXJnZXQsIGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgICBpZiAoIW9wdGlvbnMuY2hhcmFjdGVyRGF0YSkgcmV0dXJuO1xuICAgICAgICAgIGlmIChvcHRpb25zLmNoYXJhY3RlckRhdGFPbGRWYWx1ZSkgcmV0dXJuIGdldFJlY29yZFdpdGhPbGRWYWx1ZShvbGRWYWx1ZSk7XG4gICAgICAgICAgcmV0dXJuIHJlY29yZDtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAgY2FzZSBcIkRPTU5vZGVSZW1vdmVkXCI6XG4gICAgICAgIHRoaXMuYWRkVHJhbnNpZW50T2JzZXJ2ZXIoZS50YXJnZXQpO1xuXG4gICAgICAgY2FzZSBcIkRPTU5vZGVJbnNlcnRlZFwiOlxuICAgICAgICB2YXIgY2hhbmdlZE5vZGUgPSBlLnRhcmdldDtcbiAgICAgICAgdmFyIGFkZGVkTm9kZXMsIHJlbW92ZWROb2RlcztcbiAgICAgICAgaWYgKGUudHlwZSA9PT0gXCJET01Ob2RlSW5zZXJ0ZWRcIikge1xuICAgICAgICAgIGFkZGVkTm9kZXMgPSBbIGNoYW5nZWROb2RlIF07XG4gICAgICAgICAgcmVtb3ZlZE5vZGVzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkZWROb2RlcyA9IFtdO1xuICAgICAgICAgIHJlbW92ZWROb2RlcyA9IFsgY2hhbmdlZE5vZGUgXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJldmlvdXNTaWJsaW5nID0gY2hhbmdlZE5vZGUucHJldmlvdXNTaWJsaW5nO1xuICAgICAgICB2YXIgbmV4dFNpYmxpbmcgPSBjaGFuZ2VkTm9kZS5uZXh0U2libGluZztcbiAgICAgICAgdmFyIHJlY29yZCA9IGdldFJlY29yZChcImNoaWxkTGlzdFwiLCBlLnRhcmdldC5wYXJlbnROb2RlKTtcbiAgICAgICAgcmVjb3JkLmFkZGVkTm9kZXMgPSBhZGRlZE5vZGVzO1xuICAgICAgICByZWNvcmQucmVtb3ZlZE5vZGVzID0gcmVtb3ZlZE5vZGVzO1xuICAgICAgICByZWNvcmQucHJldmlvdXNTaWJsaW5nID0gcHJldmlvdXNTaWJsaW5nO1xuICAgICAgICByZWNvcmQubmV4dFNpYmxpbmcgPSBuZXh0U2libGluZztcbiAgICAgICAgZm9yRWFjaEFuY2VzdG9yQW5kT2JzZXJ2ZXJFbnF1ZXVlUmVjb3JkKGUucmVsYXRlZE5vZGUsIGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgICBpZiAoIW9wdGlvbnMuY2hpbGRMaXN0KSByZXR1cm47XG4gICAgICAgICAgcmV0dXJuIHJlY29yZDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBjbGVhclJlY29yZHMoKTtcbiAgICB9XG4gIH07XG4gIGdsb2JhbC5Kc011dGF0aW9uT2JzZXJ2ZXIgPSBKc011dGF0aW9uT2JzZXJ2ZXI7XG4gIGlmICghZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciA9IEpzTXV0YXRpb25PYnNlcnZlcjtcbiAgICBKc011dGF0aW9uT2JzZXJ2ZXIuX2lzUG9seWZpbGxlZCA9IHRydWU7XG4gIH1cbn0pKHNlbGYpO1xuIiwiLypcbkNvcHlyaWdodCAoYykgMjAxMiBCYXJuZXNhbmRub2JsZS5jb20sIGxsYywgRG9uYXZvbiBXZXN0LCBhbmQgRG9tZW5pYyBEZW5pY29sYVxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbmEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG53aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG5kaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbnBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xudGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbk1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXG5MSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXG5PRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbldJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4qL1xuKGZ1bmN0aW9uIChnbG9iYWwsIHVuZGVmaW5lZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKGdsb2JhbC5zZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBuZXh0SGFuZGxlID0gMTsgLy8gU3BlYyBzYXlzIGdyZWF0ZXIgdGhhbiB6ZXJvXG4gICAgdmFyIHRhc2tzQnlIYW5kbGUgPSB7fTtcbiAgICB2YXIgY3VycmVudGx5UnVubmluZ0FUYXNrID0gZmFsc2U7XG4gICAgdmFyIGRvYyA9IGdsb2JhbC5kb2N1bWVudDtcbiAgICB2YXIgc2V0SW1tZWRpYXRlO1xuXG4gICAgZnVuY3Rpb24gYWRkRnJvbVNldEltbWVkaWF0ZUFyZ3VtZW50cyhhcmdzKSB7XG4gICAgICAgIHRhc2tzQnlIYW5kbGVbbmV4dEhhbmRsZV0gPSBwYXJ0aWFsbHlBcHBsaWVkLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICAgIHJldHVybiBuZXh0SGFuZGxlKys7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBhY2NlcHRzIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBzZXRJbW1lZGlhdGUsIGJ1dFxuICAgIC8vIHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHJlcXVpcmVzIG5vIGFyZ3VtZW50cy5cbiAgICBmdW5jdGlvbiBwYXJ0aWFsbHlBcHBsaWVkKGhhbmRsZXIpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAobmV3IEZ1bmN0aW9uKFwiXCIgKyBoYW5kbGVyKSkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBydW5JZlByZXNlbnQoaGFuZGxlKSB7XG4gICAgICAgIC8vIEZyb20gdGhlIHNwZWM6IFwiV2FpdCB1bnRpbCBhbnkgaW52b2NhdGlvbnMgb2YgdGhpcyBhbGdvcml0aG0gc3RhcnRlZCBiZWZvcmUgdGhpcyBvbmUgaGF2ZSBjb21wbGV0ZWQuXCJcbiAgICAgICAgLy8gU28gaWYgd2UncmUgY3VycmVudGx5IHJ1bm5pbmcgYSB0YXNrLCB3ZSdsbCBuZWVkIHRvIGRlbGF5IHRoaXMgaW52b2NhdGlvbi5cbiAgICAgICAgaWYgKGN1cnJlbnRseVJ1bm5pbmdBVGFzaykge1xuICAgICAgICAgICAgLy8gRGVsYXkgYnkgZG9pbmcgYSBzZXRUaW1lb3V0LiBzZXRJbW1lZGlhdGUgd2FzIHRyaWVkIGluc3RlYWQsIGJ1dCBpbiBGaXJlZm94IDcgaXQgZ2VuZXJhdGVkIGFcbiAgICAgICAgICAgIC8vIFwidG9vIG11Y2ggcmVjdXJzaW9uXCIgZXJyb3IuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KHBhcnRpYWxseUFwcGxpZWQocnVuSWZQcmVzZW50LCBoYW5kbGUpLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0YXNrID0gdGFza3NCeUhhbmRsZVtoYW5kbGVdO1xuICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50bHlSdW5uaW5nQVRhc2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2soKTtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckltbWVkaWF0ZShoYW5kbGUpO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50bHlSdW5uaW5nQVRhc2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGVhckltbWVkaWF0ZShoYW5kbGUpIHtcbiAgICAgICAgZGVsZXRlIHRhc2tzQnlIYW5kbGVbaGFuZGxlXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsTmV4dFRpY2tJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgc2V0SW1tZWRpYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlID0gYWRkRnJvbVNldEltbWVkaWF0ZUFyZ3VtZW50cyhhcmd1bWVudHMpO1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhwYXJ0aWFsbHlBcHBsaWVkKHJ1bklmUHJlc2VudCwgaGFuZGxlKSk7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhblVzZVBvc3RNZXNzYWdlKCkge1xuICAgICAgICAvLyBUaGUgdGVzdCBhZ2FpbnN0IGBpbXBvcnRTY3JpcHRzYCBwcmV2ZW50cyB0aGlzIGltcGxlbWVudGF0aW9uIGZyb20gYmVpbmcgaW5zdGFsbGVkIGluc2lkZSBhIHdlYiB3b3JrZXIsXG4gICAgICAgIC8vIHdoZXJlIGBnbG9iYWwucG9zdE1lc3NhZ2VgIG1lYW5zIHNvbWV0aGluZyBjb21wbGV0ZWx5IGRpZmZlcmVudCBhbmQgY2FuJ3QgYmUgdXNlZCBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgICBpZiAoZ2xvYmFsLnBvc3RNZXNzYWdlICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cykge1xuICAgICAgICAgICAgdmFyIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIG9sZE9uTWVzc2FnZSA9IGdsb2JhbC5vbm1lc3NhZ2U7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2VJc0FzeW5jaHJvbm91cyA9IGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShcIlwiLCBcIipcIik7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gb2xkT25NZXNzYWdlO1xuICAgICAgICAgICAgcmV0dXJuIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgLy8gSW5zdGFsbHMgYW4gZXZlbnQgaGFuZGxlciBvbiBgZ2xvYmFsYCBmb3IgdGhlIGBtZXNzYWdlYCBldmVudDogc2VlXG4gICAgICAgIC8vICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vRE9NL3dpbmRvdy5wb3N0TWVzc2FnZVxuICAgICAgICAvLyAqIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL2NvbW1zLmh0bWwjY3Jvc3NEb2N1bWVudE1lc3NhZ2VzXG5cbiAgICAgICAgdmFyIG1lc3NhZ2VQcmVmaXggPSBcInNldEltbWVkaWF0ZSRcIiArIE1hdGgucmFuZG9tKCkgKyBcIiRcIjtcbiAgICAgICAgdmFyIG9uR2xvYmFsTWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBnbG9iYWwgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgZXZlbnQuZGF0YSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXhPZihtZXNzYWdlUHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJ1bklmUHJlc2VudCgrZXZlbnQuZGF0YS5zbGljZShtZXNzYWdlUHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsLmF0dGFjaEV2ZW50KFwib25tZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRJbW1lZGlhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGUgPSBhZGRGcm9tU2V0SW1tZWRpYXRlQXJndW1lbnRzKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBnbG9iYWwucG9zdE1lc3NhZ2UobWVzc2FnZVByZWZpeCArIGhhbmRsZSwgXCIqXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsTWVzc2FnZUNoYW5uZWxJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZSA9IGV2ZW50LmRhdGE7XG4gICAgICAgICAgICBydW5JZlByZXNlbnQoaGFuZGxlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzZXRJbW1lZGlhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGUgPSBhZGRGcm9tU2V0SW1tZWRpYXRlQXJndW1lbnRzKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKGhhbmRsZSk7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgc2V0SW1tZWRpYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlID0gYWRkRnJvbVNldEltbWVkaWF0ZUFyZ3VtZW50cyhhcmd1bWVudHMpO1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgPHNjcmlwdD4gZWxlbWVudDsgaXRzIHJlYWR5c3RhdGVjaGFuZ2UgZXZlbnQgd2lsbCBiZSBmaXJlZCBhc3luY2hyb25vdXNseSBvbmNlIGl0IGlzIGluc2VydGVkXG4gICAgICAgICAgICAvLyBpbnRvIHRoZSBkb2N1bWVudC4gRG8gc28sIHRodXMgcXVldWluZyB1cCB0aGUgdGFzay4gUmVtZW1iZXIgdG8gY2xlYW4gdXAgb25jZSBpdCdzIGJlZW4gY2FsbGVkLlxuICAgICAgICAgICAgdmFyIHNjcmlwdCA9IGRvYy5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBydW5JZlByZXNlbnQoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICAgICAgc2NyaXB0ID0gbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBodG1sLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxTZXRUaW1lb3V0SW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHNldEltbWVkaWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZSA9IGFkZEZyb21TZXRJbW1lZGlhdGVBcmd1bWVudHMoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQocGFydGlhbGx5QXBwbGllZChydW5JZlByZXNlbnQsIGhhbmRsZSksIDApO1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBJZiBzdXBwb3J0ZWQsIHdlIHNob3VsZCBhdHRhY2ggdG8gdGhlIHByb3RvdHlwZSBvZiBnbG9iYWwsIHNpbmNlIHRoYXQgaXMgd2hlcmUgc2V0VGltZW91dCBldCBhbC4gbGl2ZS5cbiAgICB2YXIgYXR0YWNoVG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKGdsb2JhbCk7XG4gICAgYXR0YWNoVG8gPSBhdHRhY2hUbyAmJiBhdHRhY2hUby5zZXRUaW1lb3V0ID8gYXR0YWNoVG8gOiBnbG9iYWw7XG5cbiAgICAvLyBEb24ndCBnZXQgZm9vbGVkIGJ5IGUuZy4gYnJvd3NlcmlmeSBlbnZpcm9ubWVudHMuXG4gICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoZ2xvYmFsLnByb2Nlc3MpID09PSBcIltvYmplY3QgcHJvY2Vzc11cIikge1xuICAgICAgICAvLyBGb3IgTm9kZS5qcyBiZWZvcmUgMC45XG4gICAgICAgIGluc3RhbGxOZXh0VGlja0ltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGNhblVzZVBvc3RNZXNzYWdlKCkpIHtcbiAgICAgICAgLy8gRm9yIG5vbi1JRTEwIG1vZGVybiBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChnbG9iYWwuTWVzc2FnZUNoYW5uZWwpIHtcbiAgICAgICAgLy8gRm9yIHdlYiB3b3JrZXJzLCB3aGVyZSBzdXBwb3J0ZWRcbiAgICAgICAgaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoZG9jICYmIFwib25yZWFkeXN0YXRlY2hhbmdlXCIgaW4gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIikpIHtcbiAgICAgICAgLy8gRm9yIElFIDbigJM4XG4gICAgICAgIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvciBvbGRlciBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsU2V0VGltZW91dEltcGxlbWVudGF0aW9uKCk7XG4gICAgfVxuXG4gICAgYXR0YWNoVG8uc2V0SW1tZWRpYXRlID0gc2V0SW1tZWRpYXRlO1xuICAgIGF0dGFjaFRvLmNsZWFySW1tZWRpYXRlID0gY2xlYXJJbW1lZGlhdGU7XG59KHNlbGYpKTtcbiIsIi8vIENhdXRpb246XG4vLyBEbyBub3QgcmVwbGFjZSB0aGlzIGltcG9ydCBzdGF0ZW1lbnQgd2l0aCBjb2Rlcy5cbi8vXG4vLyBJZiB5b3UgcmVwbGFjZSB0aGlzIGltcG9ydCBzdGF0ZW1lbnQgd2l0aCBjb2Rlcyxcbi8vIHRoZSBjb2RlcyB3aWxsIGJlIGV4ZWN1dGVkIGFmdGVyIHRoZSBmb2xsb3dpbmcgcG9seWZpbGxzIGFyZSBpbXBvcnRlZFxuLy8gYmVjYXVzZSBpbXBvcnQgc3RhdGVtZW50cyBhcmUgaG9pc3RlZCBkdXJpbmcgY29tcGlsYXRpb24uXG5pbXBvcnQgJy4vcG9seWZpbGwtc3dpdGNoZXMnO1xuXG4vLyBQb2x5ZmlsbCBFQ01BU2NyaXB0IHN0YW5kYXJkIGZlYXR1cmVzIHdpdGggZ2xvYmFsIG5hbWVzcGFjZSBwb2xsdXRpb25cbmltcG9ydCAnY29yZS1qcy9mbi9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZic7XG5pbXBvcnQgJ2NvcmUtanMvZm4vc2V0JztcbmltcG9ydCAnY29yZS1qcy9mbi9tYXAnO1xuaW1wb3J0ICdjb3JlLWpzL2ZuL3dlYWstbWFwJztcbmltcG9ydCAnY29yZS1qcy9mbi9hcnJheS9mcm9tJztcblxuLy8gUG9seWZpbGwgQ3VzdG9tIEVsZW1lbnRzIHYxIHdpdGggZ2xvYmFsIG5hbWVzcGFjZSBwb2xsdXRpb25cbmltcG9ydCAnQG9uc2VudWkvY3VzdG9tLWVsZW1lbnRzL3NyYy9jdXN0b20tZWxlbWVudHMnO1xuXG4vLyBQb2x5ZmlsbCBNdXRhdGlvbk9ic2VydmVyIHdpdGggZ2xvYmFsIG5hbWVzcGFjZSBwb2xsdXRpb25cbmltcG9ydCAnLi9NdXRhdGlvbk9ic2VydmVyQDAuNy4yMi9NdXRhdGlvbk9ic2VydmVyLmpzJztcblxuLy8gUG9seWZpbGwgc2V0SW1tZWRpYXRlIHdpdGggZ2xvYmFsIG5hbWVzcGFjZSBwb2xsdXRpb25cbmltcG9ydCAnLi9zZXRJbW1lZGlhdGVAMS4wLjIrbW9kL3NldEltbWVkaWF0ZS5qcyc7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBERUZBVUxUX1ZJRVdQT1JUID0gJ3dpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEsbWF4aW11bS1zY2FsZT0xLG1pbmltdW0tc2NhbGU9MSx1c2VyLXNjYWxhYmxlPW5vJztcblxuICB2YXIgVmlld3BvcnQgPSB7IFxuICAgIGVuc3VyZVZpZXdwb3J0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmlld3BvcnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPXZpZXdwb3J0XScpO1xuXG4gICAgICBpZiAoIXZpZXdwb3J0RWxlbWVudCkge1xuICAgICAgICB2aWV3cG9ydEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtZXRhJyk7XG4gICAgICAgIHZpZXdwb3J0RWxlbWVudC5uYW1lID0gJ3ZpZXdwb3J0JztcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh2aWV3cG9ydEVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmlld3BvcnRFbGVtZW50O1xuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmlld3BvcnRFbGVtZW50ID0gVmlld3BvcnQuZW5zdXJlVmlld3BvcnRFbGVtZW50KCk7XG5cbiAgICAgIGlmICghdmlld3BvcnRFbGVtZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF2aWV3cG9ydEVsZW1lbnQuaGFzQXR0cmlidXRlKCdjb250ZW50JykpIHtcbiAgICAgICAgdmlld3BvcnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnY29udGVudCcsIERFRkFVTFRfVklFV1BPUlQpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB3aW5kb3cuVmlld3BvcnQgPSBWaWV3cG9ydDtcbn0pKCk7XG4iLCJpbXBvcnQgeyBGYXN0Q2xpY2sgfSBmcm9tICdAb25zZW51aS9mYXN0Y2xpY2snO1xuaW1wb3J0ICcuL29ucy9wbGF0Zm9ybSc7IC8vIFRoaXMgZmlsZSBtdXN0IGJlIGxvYWRlZCBiZWZvcmUgQ3VzdG9tIEVsZW1lbnRzIHBvbHlmaWxscy5cbmltcG9ydCAnLi9wb2x5ZmlsbHMvaW5kZXguanMnO1xuaW1wb3J0ICcuL3ZlbmRvci9pbmRleC5qcyc7XG5pbXBvcnQgJy4vb25zL21pY3JvZXZlbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZXR1cChvbnMpIHtcbiAgaWYgKHdpbmRvdy5fb25zTG9hZGVkKSB7XG4gICAgb25zLl91dGlsLndhcm4oJ09uc2VuIFVJIGlzIGxvYWRlZCBtb3JlIHRoYW4gb25jZS4nKTtcbiAgfVxuICB3aW5kb3cuX29uc0xvYWRlZCA9IHRydWU7XG5cbiAgLy8gZmFzdGNsaWNrXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgIG9ucy5mYXN0Q2xpY2sgPSBGYXN0Q2xpY2suYXR0YWNoKGRvY3VtZW50LmJvZHkpO1xuXG4gICAgY29uc3Qgc3VwcG9ydFRvdWNoQWN0aW9uID0gJ3RvdWNoLWFjdGlvbicgaW4gZG9jdW1lbnQuYm9keS5zdHlsZTtcblxuICAgIG9ucy5wbGF0Zm9ybS5fcnVuT25BY3R1YWxQbGF0Zm9ybSgoKSA9PiB7XG4gICAgICBpZiAob25zLnBsYXRmb3JtLmlzQW5kcm9pZCgpKSB7XG4gICAgICAgIC8vIEluIEFuZHJvaWQ0LjQrLCBjb3JyZWN0IHZpZXdwb3J0IHNldHRpbmdzIGNhbiByZW1vdmUgY2xpY2sgZGVsYXkuXG4gICAgICAgIC8vIFNvIGRpc2FibGUgRmFzdENsaWNrIG9uIEFuZHJvaWQuXG4gICAgICAgIG9ucy5mYXN0Q2xpY2suZGVzdHJveSgpO1xuICAgICAgfSBlbHNlIGlmIChvbnMucGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICAgICBpZiAoc3VwcG9ydFRvdWNoQWN0aW9uICYmIChvbnMucGxhdGZvcm0uaXNJT1NTYWZhcmkoKSB8fCBvbnMucGxhdGZvcm0uaXNXS1dlYlZpZXcoKSkpIHtcbiAgICAgICAgICAvLyBJZiAndG91Y2gtYWN0aW9uJyBzdXBwb3J0ZWQgaW4gaU9TIFNhZmFyaSBvciBXS1dlYlZpZXcsIGRpc2FibGUgRmFzdENsaWNrLlxuICAgICAgICAgIG9ucy5mYXN0Q2xpY2suZGVzdHJveSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIERvIG5vdGhpbmcuICd0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbicgaGFzIG5vIGVmZmVjdCBvbiBVSVdlYlZpZXcuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSwgZmFsc2UpO1xuXG4gIG9ucy5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBvbnMuZW5hYmxlRGV2aWNlQmFja0J1dHRvbkhhbmRsZXIoKTtcbiAgICBvbnMuX2RlZmF1bHREZXZpY2VCYWNrQnV0dG9uSGFuZGxlciA9IG9ucy5faW50ZXJuYWwuZGJiRGlzcGF0Y2hlci5jcmVhdGVIYW5kbGVyKHdpbmRvdy5kb2N1bWVudC5ib2R5LCAoKSA9PiB7XG4gICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobmF2aWdhdG9yLCAnYXBwJykpIHtcbiAgICAgICAgbmF2aWdhdG9yLmFwcC5leGl0QXBwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBjbG9zZSB0aGUgYXBwLiBJcyBcXCdjb3Jkb3ZhLmpzXFwnIGluY2x1ZGVkP1xcbkVycm9yOiBcXCd3aW5kb3cubmF2aWdhdG9yLmFwcFxcJyBpcyB1bmRlZmluZWQuJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZG9jdW1lbnQuYm9keS5fZ2VzdHVyZURldGVjdG9yID0gbmV3IG9ucy5HZXN0dXJlRGV0ZWN0b3IoZG9jdW1lbnQuYm9keSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuXG4gICAgLy8gU2ltdWxhdGUgRGV2aWNlIEJhY2sgQnV0dG9uIG9uIEVTQyBwcmVzc1xuICAgIGlmICghb25zLnBsYXRmb3JtLmlzV2ViVmlldygpKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMjcpIHtcbiAgICAgICAgICBvbnMuZmlyZURldmljZUJhY2tCdXR0b25FdmVudCgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIHNldHVwIGxvYWRpbmcgcGxhY2Vob2xkZXJcbiAgICBvbnMuX3NldHVwTG9hZGluZ1BsYWNlSG9sZGVycygpO1xuICB9KTtcblxuICAvLyB2aWV3cG9ydC5qc1xuICBWaWV3cG9ydC5zZXR1cCgpO1xufVxuIiwiaW1wb3J0IG9ucyBmcm9tICcuL29ucyc7IC8vIEV4dGVybmFsIGRlcGVuZGVuY3ksIGFsd2F5cyBob2lzdGVkXG5pbXBvcnQgc2V0dXAgZnJvbSAnLi9zZXR1cCc7IC8vIEFkZCBwb2x5ZmlsbHNcblxuc2V0dXAob25zKTsgLy8gU2V0dXAgaW5pdGlhbCBsaXN0ZW5lcnNcblxuZXhwb3J0IGRlZmF1bHQgb25zO1xuIl0sIm5hbWVzIjpbIkZhc3RDbGljayIsImxheWVyIiwib3B0aW9ucyIsIm9sZE9uQ2xpY2siLCJ0cmFja2luZ0NsaWNrIiwidHJhY2tpbmdDbGlja1N0YXJ0IiwidGFyZ2V0RWxlbWVudCIsInRvdWNoU3RhcnRYIiwidG91Y2hTdGFydFkiLCJsYXN0VG91Y2hJZGVudGlmaWVyIiwidG91Y2hCb3VuZGFyeSIsInRhcERlbGF5IiwidGFwVGltZW91dCIsIm5vdE5lZWRlZCIsImJpbmQiLCJtZXRob2QiLCJjb250ZXh0IiwiYXBwbHkiLCJhcmd1bWVudHMiLCJtZXRob2RzIiwiaSIsImwiLCJsZW5ndGgiLCJkZXZpY2VJc0FuZHJvaWQiLCJhZGRFdmVudExpc3RlbmVyIiwib25Nb3VzZSIsIm9uQ2xpY2siLCJvblRvdWNoU3RhcnQiLCJvblRvdWNoTW92ZSIsIm9uVG91Y2hFbmQiLCJvblRvdWNoQ2FuY2VsIiwiRXZlbnQiLCJwcm90b3R5cGUiLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidHlwZSIsImNhbGxiYWNrIiwiY2FwdHVyZSIsInJtdiIsIk5vZGUiLCJjYWxsIiwiaGlqYWNrZWQiLCJhZHYiLCJldmVudCIsInByb3BhZ2F0aW9uU3RvcHBlZCIsIm9uY2xpY2siLCJkZXZpY2VJc1dpbmRvd3NQaG9uZSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImluZGV4T2YiLCJkZXZpY2VJc0lPUyIsInRlc3QiLCJkZXZpY2VJc0lPUzQiLCJkZXZpY2VJc0lPU1dpdGhCYWRUYXJnZXQiLCJkZXZpY2VJc0JsYWNrQmVycnkxMCIsInRleHRGaWVsZHMiLCJuZWVkc0NsaWNrIiwidGFyZ2V0Iiwibm9kZU5hbWUiLCJ0b0xvd2VyQ2FzZSIsImRpc2FibGVkIiwiY2xhc3NOYW1lIiwibmVlZHNGb2N1cyIsInJlYWRPbmx5Iiwic2VuZENsaWNrIiwiY2xpY2tFdmVudCIsInRvdWNoIiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50IiwiYmx1ciIsImNoYW5nZWRUb3VjaGVzIiwiY3JlYXRlRXZlbnQiLCJpbml0TW91c2VFdmVudCIsImRldGVybWluZUV2ZW50VHlwZSIsIndpbmRvdyIsInNjcmVlblgiLCJzY3JlZW5ZIiwiY2xpZW50WCIsImNsaWVudFkiLCJmb3J3YXJkZWRUb3VjaEV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsInRhZ05hbWUiLCJmb2N1cyIsInNldFNlbGVjdGlvblJhbmdlIiwidmFsdWUiLCJ1cGRhdGVTY3JvbGxQYXJlbnQiLCJzY3JvbGxQYXJlbnQiLCJwYXJlbnRFbGVtZW50IiwiZmFzdENsaWNrU2Nyb2xsUGFyZW50IiwiY29udGFpbnMiLCJzY3JvbGxIZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJmYXN0Q2xpY2tMYXN0U2Nyb2xsVG9wIiwic2Nyb2xsVG9wIiwiZ2V0VGFyZ2V0RWxlbWVudEZyb21FdmVudFRhcmdldCIsImV2ZW50VGFyZ2V0Iiwibm9kZVR5cGUiLCJURVhUX05PREUiLCJwYXJlbnROb2RlIiwiaXNUZXh0RmllbGQiLCJ0YXJnZXRUb3VjaGVzIiwiaXNDb250ZW50RWRpdGFibGUiLCJpZGVudGlmaWVyIiwicHJldmVudERlZmF1bHQiLCJ0aW1lU3RhbXAiLCJwYWdlWCIsInBhZ2VZIiwibGFzdENsaWNrVGltZSIsInRvdWNoSGFzTW92ZWQiLCJib3VuZGFyeSIsIk1hdGgiLCJhYnMiLCJmaW5kQ29udHJvbCIsImxhYmVsRWxlbWVudCIsImNvbnRyb2wiLCJ1bmRlZmluZWQiLCJodG1sRm9yIiwiZ2V0RWxlbWVudEJ5SWQiLCJxdWVyeVNlbGVjdG9yIiwiZm9yRWxlbWVudCIsInRhcmdldFRhZ05hbWUiLCJjYW5jZWxOZXh0Q2xpY2siLCJlbGVtZW50RnJvbVBvaW50IiwicGFnZVhPZmZzZXQiLCJwYWdlWU9mZnNldCIsInRvcCIsImNhbmNlbGFibGUiLCJzdG9wUHJvcGFnYXRpb24iLCJwZXJtaXR0ZWQiLCJkZXRhaWwiLCJkZXN0cm95IiwibWV0YVZpZXdwb3J0IiwiY2hyb21lVmVyc2lvbiIsImJsYWNrYmVycnlWZXJzaW9uIiwiZmlyZWZveFZlcnNpb24iLCJvbnRvdWNoc3RhcnQiLCJleGVjIiwiY29udGVudCIsImRvY3VtZW50RWxlbWVudCIsInNjcm9sbFdpZHRoIiwib3V0ZXJXaWR0aCIsIm1hdGNoIiwic3R5bGUiLCJtc1RvdWNoQWN0aW9uIiwidG91Y2hBY3Rpb24iLCJhdHRhY2giLCJkZWZpbmUiLCJiYWJlbEhlbHBlcnMudHlwZW9mIiwiYW1kIiwibW9kdWxlIiwiZXhwb3J0cyIsImN1c3RvbUVsZW1lbnRzIiwiZm9yY2VQb2x5ZmlsbCIsImdsb2JhbCIsInNlbGYiLCJGdW5jdGlvbiIsIl9fZyIsImNvcmUiLCJ2ZXJzaW9uIiwiX19lIiwiaXQiLCJpc09iamVjdCIsIlR5cGVFcnJvciIsImUiLCJyZXF1aXJlJCQwIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJnZXQiLCJhIiwiaXMiLCJjcmVhdGVFbGVtZW50IiwicmVxdWlyZSQkMSIsInJlcXVpcmUkJDIiLCJTIiwiZm4iLCJ2YWwiLCJ0b1N0cmluZyIsInZhbHVlT2YiLCJkUCIsIk8iLCJQIiwiQXR0cmlidXRlcyIsInRvUHJpbWl0aXZlIiwiSUU4X0RPTV9ERUZJTkUiLCJiaXRtYXAiLCJvYmplY3QiLCJrZXkiLCJmIiwiY3JlYXRlRGVzYyIsImhhc093blByb3BlcnR5IiwiaWQiLCJweCIsInJhbmRvbSIsImNvbmNhdCIsIlNSQyIsIlRPX1NUUklORyIsIiR0b1N0cmluZyIsIlRQTCIsInNwbGl0IiwiaW5zcGVjdFNvdXJjZSIsInNhZmUiLCJpc0Z1bmN0aW9uIiwiaGFzIiwiaGlkZSIsImpvaW4iLCJTdHJpbmciLCJ0aGF0IiwiYiIsImMiLCJQUk9UT1RZUEUiLCIkZXhwb3J0IiwibmFtZSIsInNvdXJjZSIsIklTX0ZPUkNFRCIsIkYiLCJJU19HTE9CQUwiLCJHIiwiSVNfU1RBVElDIiwiSVNfUFJPVE8iLCJJU19CSU5EIiwiQiIsImV4cFByb3RvIiwib3duIiwib3V0IiwiZXhwIiwiY3R4IiwicmVkZWZpbmUiLCJVIiwiVyIsIlIiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsInNsaWNlIiwiY29mIiwiSU9iamVjdCIsImRlZmluZWQiLCJnT1BEIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwidG9JT2JqZWN0IiwicElFIiwiY2hlY2siLCJwcm90byIsInNldFByb3RvdHlwZU9mIiwiYnVnZ3kiLCJzZXQiLCJBcnJheSIsIl9fcHJvdG9fXyIsIlNIQVJFRCIsInN0b3JlIiwiU3ltYm9sIiwiVVNFX1NZTUJPTCIsIiRleHBvcnRzIiwidWlkIiwiVEFHIiwiQVJHIiwidHJ5R2V0IiwiVCIsImNhbGxlZSIsImNsYXNzb2YiLCJjZWlsIiwiZmxvb3IiLCJpc05hTiIsInBvcyIsInMiLCJ0b0ludGVnZXIiLCJjaGFyQ29kZUF0IiwiY2hhckF0IiwibWluIiwibWF4IiwiaW5kZXgiLCJJU19JTkNMVURFUyIsIiR0aGlzIiwiZWwiLCJmcm9tSW5kZXgiLCJ0b0xlbmd0aCIsInRvQWJzb2x1dGVJbmRleCIsInNoYXJlZCIsImFycmF5SW5kZXhPZiIsIklFX1BST1RPIiwibmFtZXMiLCJyZXN1bHQiLCJwdXNoIiwia2V5cyIsIiRrZXlzIiwiZW51bUJ1Z0tleXMiLCJkZWZpbmVQcm9wZXJ0aWVzIiwiUHJvcGVydGllcyIsImdldEtleXMiLCJFbXB0eSIsImNyZWF0ZURpY3QiLCJpZnJhbWUiLCJsdCIsImd0IiwiaWZyYW1lRG9jdW1lbnQiLCJkaXNwbGF5IiwiYXBwZW5kQ2hpbGQiLCJzcmMiLCJjb250ZW50V2luZG93Iiwib3BlbiIsIndyaXRlIiwiY2xvc2UiLCJjcmVhdGUiLCJhbk9iamVjdCIsImRQcyIsImRlZiIsInRhZyIsInN0YXQiLCJjb25maWd1cmFibGUiLCJJdGVyYXRvclByb3RvdHlwZSIsIkNvbnN0cnVjdG9yIiwiTkFNRSIsIm5leHQiLCJkZXNjcmlwdG9yIiwiT2JqZWN0UHJvdG8iLCJnZXRQcm90b3R5cGVPZiIsInRvT2JqZWN0IiwiY29uc3RydWN0b3IiLCJJVEVSQVRPUiIsIkJVR0dZIiwiRkZfSVRFUkFUT1IiLCJLRVlTIiwiVkFMVUVTIiwicmV0dXJuVGhpcyIsIkJhc2UiLCJERUZBVUxUIiwiSVNfU0VUIiwiRk9SQ0VEIiwiZ2V0TWV0aG9kIiwia2luZCIsInZhbHVlcyIsImVudHJpZXMiLCJERUZfVkFMVUVTIiwiVkFMVUVTX0JVRyIsIiRuYXRpdmUiLCIkZGVmYXVsdCIsIiRlbnRyaWVzIiwiJGFueU5hdGl2ZSIsIkxJQlJBUlkiLCIkYXQiLCJpdGVyYXRlZCIsIl90IiwiX2kiLCJwb2ludCIsImRvbmUiLCJVTlNDT1BBQkxFUyIsIkFycmF5UHJvdG8iLCJfayIsInN0ZXAiLCJJdGVyYXRvcnMiLCJBcmd1bWVudHMiLCJhZGRUb1Vuc2NvcGFibGVzIiwid2tzIiwiVE9fU1RSSU5HX1RBRyIsIkFycmF5VmFsdWVzIiwiRE9NSXRlcmFibGVzIiwiY29sbGVjdGlvbnMiLCJleHBsaWNpdCIsIkNvbGxlY3Rpb24iLCIkaXRlcmF0b3JzIiwiZm9yYmlkZGVuRmllbGQiLCJpdGVyYXRvciIsInJldCIsImdldEl0ZXJhdG9yTWV0aG9kIiwiQlJFQUsiLCJSRVRVUk4iLCJpdGVyYWJsZSIsIml0ZXJGbiIsImdldEl0ZXJGbiIsImlzQXJyYXlJdGVyIiwiU1BFQ0lFUyIsIktFWSIsIkMiLCJERVNDUklQVE9SUyIsIk1FVEEiLCJzZXREZXNjIiwiaXNFeHRlbnNpYmxlIiwiRlJFRVpFIiwicHJldmVudEV4dGVuc2lvbnMiLCJzZXRNZXRhIiwiZmFzdEtleSIsImdldFdlYWsiLCJ3Iiwib25GcmVlemUiLCJtZXRhIiwiTkVFRCIsIlRZUEUiLCJTSVpFIiwiZ2V0RW50cnkiLCJlbnRyeSIsIl9mIiwibiIsImsiLCJ3cmFwcGVyIiwiSVNfTUFQIiwiQURERVIiLCJfbCIsImZvck9mIiwiY2xlYXIiLCJ2YWxpZGF0ZSIsImRhdGEiLCJyIiwicCIsInByZXYiLCJmb3JFYWNoIiwiY2FsbGJhY2tmbiIsInYiLCJTQUZFX0NMT1NJTkciLCJyaXRlciIsInNraXBDbG9zaW5nIiwiYXJyIiwiaXRlciIsImNvbW1vbiIsIklTX1dFQUsiLCJmaXhNZXRob2QiLCJhZGQiLCJmYWlscyIsImdldENvbnN0cnVjdG9yIiwiaW5zdGFuY2UiLCJIQVNOVF9DSEFJTklORyIsIlRIUk9XU19PTl9QUklNSVRJVkVTIiwiQUNDRVBUX0lURVJBQkxFUyIsIiRpdGVyRGV0ZWN0IiwiQlVHR1lfWkVSTyIsIiRpbnN0YW5jZSIsImluaGVyaXRJZlJlcXVpcmVkIiwic2V0U3Ryb25nIiwiU0VUIiwiU2V0Iiwic3Ryb25nIiwidG9KU09OIiwiZnJvbSIsIkNPTExFQ1RJT04iLCJvZiIsIkEiLCJtYXBGbiIsIm1hcHBpbmciLCJjYiIsImFGdW5jdGlvbiIsIm5leHRJdGVtIiwicmVxdWlyZSQkNyIsIk1BUCIsIk1hcCIsImlzQXJyYXkiLCJhcmciLCJvcmlnaW5hbCIsInNwZWNpZXNDb25zdHJ1Y3RvciIsIiRjcmVhdGUiLCJJU19GSUxURVIiLCJJU19TT01FIiwiSVNfRVZFUlkiLCJJU19GSU5EX0lOREVYIiwiTk9fSE9MRVMiLCJhc2MiLCJyZXMiLCJnZXRPd25Qcm9wZXJ0eVN5bWJvbHMiLCIkYXNzaWduIiwiYXNzaWduIiwiSyIsImFMZW4iLCJnZXRTeW1ib2xzIiwiZ09QUyIsImlzRW51bSIsImoiLCJhcnJheUZpbmQiLCJjcmVhdGVBcnJheU1ldGhvZCIsImFycmF5RmluZEluZGV4IiwidW5jYXVnaHRGcm96ZW5TdG9yZSIsIlVuY2F1Z2h0RnJvemVuU3RvcmUiLCJmaW5kVW5jYXVnaHRGcm96ZW4iLCJzcGxpY2UiLCIkaGFzIiwiZWFjaCIsIldFQUtfTUFQIiwid2VhayIsInVmc3RvcmUiLCJ0bXAiLCJJbnRlcm5hbE1hcCIsIldlYWtNYXAiLCIkV2Vha01hcCIsImZyZWV6ZSIsInJlcXVpcmUkJDUiLCIkZGVmaW5lUHJvcGVydHkiLCJhcnJheUxpa2UiLCJtYXBmbiIsInJlc2VydmVkVGFnTGlzdCIsImlzVmFsaWRDdXN0b21FbGVtZW50TmFtZSIsImxvY2FsTmFtZSIsInJlc2VydmVkIiwidmFsaWRGb3JtIiwiaXNDb25uZWN0ZWQiLCJub2RlIiwibmF0aXZlVmFsdWUiLCJjdXJyZW50IiwiX19DRV9pc0ltcG9ydERvY3VtZW50IiwiRG9jdW1lbnQiLCJTaGFkb3dSb290IiwiaG9zdCIsIm5leHRTaWJsaW5nT3JBbmNlc3RvclNpYmxpbmciLCJyb290Iiwic3RhcnQiLCJuZXh0U2libGluZyIsIm5leHROb2RlIiwiZmlyc3RDaGlsZCIsIndhbGtEZWVwRGVzY2VuZGFudEVsZW1lbnRzIiwidmlzaXRlZEltcG9ydHMiLCJFTEVNRU5UX05PREUiLCJlbGVtZW50IiwiZ2V0QXR0cmlidXRlIiwiaW1wb3J0Tm9kZSIsImltcG9ydCIsImNoaWxkIiwic2hhZG93Um9vdCIsIl9fQ0Vfc2hhZG93Um9vdCIsInNldFByb3BlcnR5VW5jaGVja2VkIiwiZGVzdGluYXRpb24iLCJDdXN0b21FbGVtZW50U3RhdGUiLCJDdXN0b21FbGVtZW50SW50ZXJuYWxzIiwiX2xvY2FsTmFtZVRvRGVmaW5pdGlvbiIsIl9jb25zdHJ1Y3RvclRvRGVmaW5pdGlvbiIsIl9wYXRjaGVzIiwiX2hhc1BhdGNoZXMiLCJkZWZpbml0aW9uIiwibGlzdGVuZXIiLCJwYXRjaCIsIl9fQ0VfcGF0Y2hlZCIsImVsZW1lbnRzIiwiX19DRV9zdGF0ZSIsIkNFU3RhdGUiLCJjdXN0b20iLCJVdGlsaXRpZXMiLCJjb25uZWN0ZWRDYWxsYmFjayIsInVwZ3JhZGVFbGVtZW50IiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJnYXRoZXJFbGVtZW50cyIsInJlYWR5U3RhdGUiLCJfX0NFX2hhc1JlZ2lzdHJ5IiwiX19DRV9kb2N1bWVudExvYWRIYW5kbGVkIiwiZGVsZXRlIiwicGF0Y2hBbmRVcGdyYWRlVHJlZSIsImN1cnJlbnRTdGF0ZSIsImxvY2FsTmFtZVRvRGVmaW5pdGlvbiIsImNvbnN0cnVjdGlvblN0YWNrIiwiRXJyb3IiLCJwb3AiLCJmYWlsZWQiLCJfX0NFX2RlZmluaXRpb24iLCJhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2siLCJvYnNlcnZlZEF0dHJpYnV0ZXMiLCJfX0NFX2lzQ29ubmVjdGVkQ2FsbGJhY2tDYWxsZWQiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIiwibmFtZXNwYWNlIiwiRG9jdW1lbnRDb25zdHJ1Y3Rpb25PYnNlcnZlciIsImludGVybmFscyIsImRvYyIsIl9pbnRlcm5hbHMiLCJfZG9jdW1lbnQiLCJfb2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwiX2hhbmRsZU11dGF0aW9ucyIsIm9ic2VydmUiLCJkaXNjb25uZWN0IiwibXV0YXRpb25zIiwiYWRkZWROb2RlcyIsIkRlZmVycmVkIiwiX3ZhbHVlIiwiX3Jlc29sdmUiLCJfcHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5IiwiX2VsZW1lbnREZWZpbml0aW9uSXNSdW5uaW5nIiwiX3doZW5EZWZpbmVkRGVmZXJyZWQiLCJfZmx1c2hDYWxsYmFjayIsIl9mbHVzaFBlbmRpbmciLCJfdW5mbHVzaGVkTG9jYWxOYW1lcyIsIl9kb2N1bWVudENvbnN0cnVjdGlvbk9ic2VydmVyIiwiU3ludGF4RXJyb3IiLCJhZG9wdGVkQ2FsbGJhY2siLCJnZXRDYWxsYmFjayIsImNhbGxiYWNrVmFsdWUiLCJzZXREZWZpbml0aW9uIiwiX2ZsdXNoIiwic2hpZnQiLCJkZWZlcnJlZCIsInJlamVjdCIsInByaW9yIiwidG9Qcm9taXNlIiwib3V0ZXIiLCJpbm5lciIsImZsdXNoIiwid2hlbkRlZmluZWQiLCJwb2x5ZmlsbFdyYXBGbHVzaENhbGxiYWNrIiwiY3JlYXRlRWxlbWVudE5TIiwiY2xvbmVOb2RlIiwiaW5zZXJ0QmVmb3JlIiwicmVtb3ZlQ2hpbGQiLCJyZXBsYWNlQ2hpbGQiLCJFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlTlMiLCJzZXRBdHRyaWJ1dGVOUyIsInJlbW92ZUF0dHJpYnV0ZU5TIiwiSFRNTEVsZW1lbnQiLCJBbHJlYWR5Q29uc3RydWN0ZWRNYXJrZXIiLCJjb25zdHJ1Y3RvclRvRGVmaW5pdGlvbiIsIk5hdGl2ZSIsIkRvY3VtZW50X2NyZWF0ZUVsZW1lbnQiLCJsYXN0SW5kZXgiLCJidWlsdEluIiwibm9kZXMiLCJjb25uZWN0ZWRCZWZvcmUiLCJmaWx0ZXIiLCJwcmVwZW5kIiwiZGlzY29ubmVjdFRyZWUiLCJjb25uZWN0VHJlZSIsImFwcGVuZCIsImRlZXAiLCJjbG9uZSIsIkRvY3VtZW50X2ltcG9ydE5vZGUiLCJwYXRjaFRyZWUiLCJOU19IVE1MIiwiRG9jdW1lbnRfY3JlYXRlRWxlbWVudE5TIiwiRG9jdW1lbnRfcHJlcGVuZCIsIkRvY3VtZW50X2FwcGVuZCIsInJlZk5vZGUiLCJEb2N1bWVudEZyYWdtZW50IiwiaW5zZXJ0ZWROb2RlcyIsImNoaWxkTm9kZXMiLCJuYXRpdmVSZXN1bHQiLCJOb2RlX2luc2VydEJlZm9yZSIsIm5vZGVXYXNDb25uZWN0ZWQiLCJOb2RlX2FwcGVuZENoaWxkIiwiTm9kZV9jbG9uZU5vZGUiLCJvd25lckRvY3VtZW50IiwiTm9kZV9yZW1vdmVDaGlsZCIsIm5vZGVUb0luc2VydCIsIm5vZGVUb1JlbW92ZSIsIk5vZGVfcmVwbGFjZUNoaWxkIiwibm9kZVRvSW5zZXJ0V2FzQ29ubmVjdGVkIiwidGhpc0lzQ29ubmVjdGVkIiwicGF0Y2hfdGV4dENvbnRlbnQiLCJiYXNlRGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJhc3NpZ25lZFZhbHVlIiwicmVtb3ZlZE5vZGVzIiwiY2hpbGROb2Rlc0xlbmd0aCIsIk5vZGVfdGV4dENvbnRlbnQiLCJhZGRQYXRjaCIsInBhcnRzIiwidGV4dENvbnRlbnQiLCJjcmVhdGVUZXh0Tm9kZSIsImJlZm9yZSIsImFmdGVyIiwid2FzQ29ubmVjdGVkIiwicmVwbGFjZVdpdGgiLCJyZW1vdmUiLCJFbGVtZW50X2F0dGFjaFNoYWRvdyIsImluaXQiLCJ3YXJuIiwicGF0Y2hfaW5uZXJIVE1MIiwiaHRtbFN0cmluZyIsInJlbW92ZWRFbGVtZW50cyIsIkVsZW1lbnRfaW5uZXJIVE1MIiwiSFRNTEVsZW1lbnRfaW5uZXJIVE1MIiwicmF3RGl2IiwiaW5uZXJIVE1MIiwiRWxlbWVudF9zZXRBdHRyaWJ1dGUiLCJFbGVtZW50X2dldEF0dHJpYnV0ZSIsIkVsZW1lbnRfc2V0QXR0cmlidXRlTlMiLCJFbGVtZW50X2dldEF0dHJpYnV0ZU5TIiwiRWxlbWVudF9yZW1vdmVBdHRyaWJ1dGUiLCJFbGVtZW50X3JlbW92ZUF0dHJpYnV0ZU5TIiwicGF0Y2hfaW5zZXJ0QWRqYWNlbnRFbGVtZW50IiwiYmFzZU1ldGhvZCIsIndoZXJlIiwiaW5zZXJ0ZWRFbGVtZW50IiwiSFRNTEVsZW1lbnRfaW5zZXJ0QWRqYWNlbnRFbGVtZW50IiwiRWxlbWVudF9pbnNlcnRBZGphY2VudEVsZW1lbnQiLCJFbGVtZW50X3ByZXBlbmQiLCJFbGVtZW50X2FwcGVuZCIsIkVsZW1lbnRfYmVmb3JlIiwiRWxlbWVudF9hZnRlciIsIkVsZW1lbnRfcmVwbGFjZVdpdGgiLCJFbGVtZW50X3JlbW92ZSIsInByaW9yQ3VzdG9tRWxlbWVudHMiLCJKc011dGF0aW9uT2JzZXJ2ZXIiLCJyZWdpc3RyYXRpb25zVGFibGUiLCJzZXRJbW1lZGlhdGUiLCJzZXRUaW1lb3V0Iiwic2V0SW1tZWRpYXRlUXVldWUiLCJzZW50aW5lbCIsInF1ZXVlIiwiZnVuYyIsInBvc3RNZXNzYWdlIiwiaXNTY2hlZHVsZWQiLCJzY2hlZHVsZWRPYnNlcnZlcnMiLCJzY2hlZHVsZUNhbGxiYWNrIiwib2JzZXJ2ZXIiLCJkaXNwYXRjaENhbGxiYWNrcyIsIndyYXBJZk5lZWRlZCIsIlNoYWRvd0RPTVBvbHlmaWxsIiwib2JzZXJ2ZXJzIiwic29ydCIsIm8xIiwibzIiLCJ1aWRfIiwiYW55Tm9uRW1wdHkiLCJ0YWtlUmVjb3JkcyIsImNhbGxiYWNrXyIsInJlbW92ZVRyYW5zaWVudE9ic2VydmVyc0ZvciIsIm5vZGVzXyIsInJlZ2lzdHJhdGlvbnMiLCJyZWdpc3RyYXRpb24iLCJyZW1vdmVUcmFuc2llbnRPYnNlcnZlcnMiLCJmb3JFYWNoQW5jZXN0b3JBbmRPYnNlcnZlckVucXVldWVSZWNvcmQiLCJzdWJ0cmVlIiwicmVjb3JkIiwiZW5xdWV1ZSIsInVpZENvdW50ZXIiLCJyZWNvcmRzXyIsImNoaWxkTGlzdCIsImF0dHJpYnV0ZXMiLCJjaGFyYWN0ZXJEYXRhIiwiYXR0cmlidXRlT2xkVmFsdWUiLCJhdHRyaWJ1dGVGaWx0ZXIiLCJjaGFyYWN0ZXJEYXRhT2xkVmFsdWUiLCJyZW1vdmVMaXN0ZW5lcnMiLCJSZWdpc3RyYXRpb24iLCJhZGRMaXN0ZW5lcnMiLCJjb3B5T2ZSZWNvcmRzIiwiTXV0YXRpb25SZWNvcmQiLCJwcmV2aW91c1NpYmxpbmciLCJhdHRyaWJ1dGVOYW1lIiwiYXR0cmlidXRlTmFtZXNwYWNlIiwiY29weU11dGF0aW9uUmVjb3JkIiwiY3VycmVudFJlY29yZCIsInJlY29yZFdpdGhPbGRWYWx1ZSIsImdldFJlY29yZCIsImdldFJlY29yZFdpdGhPbGRWYWx1ZSIsImNsZWFyUmVjb3JkcyIsInJlY29yZFJlcHJlc2VudHNDdXJyZW50TXV0YXRpb24iLCJzZWxlY3RSZWNvcmQiLCJsYXN0UmVjb3JkIiwibmV3UmVjb3JkIiwidHJhbnNpZW50T2JzZXJ2ZWROb2RlcyIsInJlY29yZHMiLCJyZWNvcmRUb1JlcGxhY2VMYXN0IiwiYWRkTGlzdGVuZXJzXyIsInJlbW92ZUxpc3RlbmVyc18iLCJhdHRyTmFtZSIsInJlbGF0ZWROb2RlIiwibmFtZXNwYWNlVVJJIiwiYXR0ckNoYW5nZSIsIk11dGF0aW9uRXZlbnQiLCJBRERJVElPTiIsInByZXZWYWx1ZSIsImFkZFRyYW5zaWVudE9ic2VydmVyIiwiY2hhbmdlZE5vZGUiLCJfaXNQb2x5ZmlsbGVkIiwibmV4dEhhbmRsZSIsInRhc2tzQnlIYW5kbGUiLCJjdXJyZW50bHlSdW5uaW5nQVRhc2siLCJhZGRGcm9tU2V0SW1tZWRpYXRlQXJndW1lbnRzIiwiYXJncyIsInBhcnRpYWxseUFwcGxpZWQiLCJoYW5kbGVyIiwicnVuSWZQcmVzZW50IiwiaGFuZGxlIiwidGFzayIsImNsZWFySW1tZWRpYXRlIiwiaW5zdGFsbE5leHRUaWNrSW1wbGVtZW50YXRpb24iLCJuZXh0VGljayIsImNhblVzZVBvc3RNZXNzYWdlIiwiaW1wb3J0U2NyaXB0cyIsInBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMiLCJvbGRPbk1lc3NhZ2UiLCJvbm1lc3NhZ2UiLCJpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbiIsIm1lc3NhZ2VQcmVmaXgiLCJvbkdsb2JhbE1lc3NhZ2UiLCJhdHRhY2hFdmVudCIsImluc3RhbGxNZXNzYWdlQ2hhbm5lbEltcGxlbWVudGF0aW9uIiwiY2hhbm5lbCIsIk1lc3NhZ2VDaGFubmVsIiwicG9ydDEiLCJwb3J0MiIsImluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24iLCJodG1sIiwic2NyaXB0Iiwib25yZWFkeXN0YXRlY2hhbmdlIiwiaW5zdGFsbFNldFRpbWVvdXRJbXBsZW1lbnRhdGlvbiIsImF0dGFjaFRvIiwicHJvY2VzcyIsIkRFRkFVTFRfVklFV1BPUlQiLCJWaWV3cG9ydCIsInZpZXdwb3J0RWxlbWVudCIsImhlYWQiLCJlbnN1cmVWaWV3cG9ydEVsZW1lbnQiLCJoYXNBdHRyaWJ1dGUiLCJzZXR1cCIsIm9ucyIsIl9vbnNMb2FkZWQiLCJfdXRpbCIsImZhc3RDbGljayIsImJvZHkiLCJzdXBwb3J0VG91Y2hBY3Rpb24iLCJwbGF0Zm9ybSIsIl9ydW5PbkFjdHVhbFBsYXRmb3JtIiwiaXNBbmRyb2lkIiwiaXNJT1MiLCJpc0lPU1NhZmFyaSIsImlzV0tXZWJWaWV3IiwicmVhZHkiLCJlbmFibGVEZXZpY2VCYWNrQnV0dG9uSGFuZGxlciIsIl9kZWZhdWx0RGV2aWNlQmFja0J1dHRvbkhhbmRsZXIiLCJfaW50ZXJuYWwiLCJkYmJEaXNwYXRjaGVyIiwiY3JlYXRlSGFuZGxlciIsImFwcCIsImV4aXRBcHAiLCJfZ2VzdHVyZURldGVjdG9yIiwiR2VzdHVyZURldGVjdG9yIiwicGFzc2l2ZSIsImlzV2ViVmlldyIsImtleUNvZGUiLCJmaXJlRGV2aWNlQmFja0J1dHRvbkV2ZW50IiwiX3NldHVwTG9hZGluZ1BsYWNlSG9sZGVycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQUUsYUFBWTtXQXNCSkEsU0FBVCxDQUFtQkMsS0FBbkIsRUFBMEJDLE9BQTFCLEVBQW1DO09BQzlCQyxVQUFKOzthQUVVRCxXQUFXLEVBQXJCOzs7Ozs7O1FBT0tFLGFBQUwsR0FBcUIsS0FBckI7Ozs7Ozs7UUFRS0Msa0JBQUwsR0FBMEIsQ0FBMUI7Ozs7Ozs7UUFRS0MsYUFBTCxHQUFxQixJQUFyQjs7Ozs7OztRQVFLQyxXQUFMLEdBQW1CLENB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
