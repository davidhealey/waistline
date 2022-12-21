function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/* eslint indent: ["off"] */
import { getWindow } from 'ssr-window';
import $ from '../../shared/dom7';
import { extend, now, nextTick, deleteProps } from '../../shared/utils';
import Framework7Class from '../../shared/class';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx';

var PhotoBrowser = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(PhotoBrowser, _Framework7Class);

  function PhotoBrowser(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var pb = _assertThisInitialized(_this);

    pb.app = app;
    var defaults = extend({
      on: {}
    }, app.params.photoBrowser); // Extend defaults with modules params

    pb.useModulesParams(defaults);
    pb.params = extend(defaults, params);
    extend(pb, {
      exposed: false,
      opened: false,
      activeIndex: pb.params.swiper.initialSlide,
      url: pb.params.url,
      swipeToClose: {
        allow: true,
        isTouched: false,
        diff: undefined,
        start: undefined,
        current: undefined,
        started: false,
        activeSlide: undefined,
        timeStart: undefined
      }
    }); // Install Modules

    pb.useModules(); // Init

    pb.init();
    return _this;
  }

  var _proto = PhotoBrowser.prototype;

  _proto.onSlideChange = function onSlideChange(swiper) {
    var pb = this;
    pb.activeIndex = swiper.activeIndex;
    var current = swiper.activeIndex + 1;
    var total = pb.params.virtualSlides ? pb.params.photos.length : swiper.slides.length;

    if (swiper.params.loop) {
      total -= 2;
      current -= swiper.loopedSlides;
      if (current < 1) current = total + current;
      if (current > total) current -= total;
    }

    var $activeSlideEl = pb.params.virtualSlides ? swiper.$wrapperEl.find(".swiper-slide[data-swiper-slide-index=\"" + swiper.activeIndex + "\"]") : swiper.slides.eq(swiper.activeIndex);
    var $previousSlideEl = pb.params.virtualSlides ? swiper.$wrapperEl.find(".swiper-slide[data-swiper-slide-index=\"" + swiper.previousIndex + "\"]") : swiper.slides.eq(swiper.previousIndex);
    var $currentEl = pb.$el.find('.photo-browser-current');
    var $totalEl = pb.$el.find('.photo-browser-total');
    var navbarEl;

    if (pb.params.type === 'page' && pb.params.navbar && $currentEl.length === 0 && pb.app.theme === 'ios') {
      navbarEl = pb.app.navbar.getElByPage(pb.$el);

      if (navbarEl) {
        $currentEl = $(navbarEl).find('.photo-browser-current');
        $totalEl = $(navbarEl).find('.photo-browser-total');
      }
    }

    if ($currentEl.length && $totalEl.length) {
      $currentEl.text(current);
      $totalEl.text(total);
      if (!navbarEl) navbarEl = $currentEl.parents('.navbar')[0];

      if (navbarEl) {
        pb.app.navbar.size(navbarEl);
      }
    } // Update captions


    if (pb.captions.length > 0) {
      var captionIndex = swiper.params.loop ? $activeSlideEl.attr('data-swiper-slide-index') : pb.activeIndex;
      pb.$captionsContainerEl.find('.photo-browser-caption-active').removeClass('photo-browser-caption-active');
      pb.$captionsContainerEl.find("[data-caption-index=\"" + captionIndex + "\"]").addClass('photo-browser-caption-active');
    } // Stop Video


    var previousSlideVideo = $previousSlideEl.find('video');

    if (previousSlideVideo.length > 0) {
      if ('pause' in previousSlideVideo[0]) previousSlideVideo[0].pause();
    }
  };

  _proto.onTouchStart = function onTouchStart() {
    var pb = this;
    var swipeToClose = pb.swipeToClose;
    if (!swipeToClose.allow) return;
    swipeToClose.isTouched = true;
  };

  _proto.onTouchMove = function onTouchMove(e) {
    var pb = this;
    var swipeToClose = pb.swipeToClose;
    if (!swipeToClose.isTouched) return;

    if (!swipeToClose.started) {
      swipeToClose.started = true;
      swipeToClose.start = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

      if (pb.params.virtualSlides) {
        swipeToClose.activeSlide = pb.swiper.$wrapperEl.children('.swiper-slide-active');
      } else {
        swipeToClose.activeSlide = pb.swiper.slides.eq(pb.swiper.activeIndex);
      }

      swipeToClose.timeStart = now();
    }

    e.preventDefault();
    swipeToClose.current = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
    swipeToClose.diff = swipeToClose.start - swipeToClose.current;
    pb.$el.transition(0).transform("translate3d(0," + -swipeToClose.diff + "px,0)");
  };

  _proto.onTouchEnd = function onTouchEnd() {
    var pb = this;
    var swipeToClose = pb.swipeToClose;
    swipeToClose.isTouched = false;

    if (!swipeToClose.started) {
      swipeToClose.started = false;
      return;
    }

    swipeToClose.started = false;
    swipeToClose.allow = false;
    var diff = Math.abs(swipeToClose.diff);
    var timeDiff = new Date().getTime() - swipeToClose.timeStart;

    if (timeDiff < 300 && diff > 20 || timeDiff >= 300 && diff > 100) {
      nextTick(function () {
        if (pb.$el) {
          if (swipeToClose.diff < 0) pb.$el.addClass('swipe-close-to-bottom');else pb.$el.addClass('swipe-close-to-top');
        }

        pb.emit('local::swipeToClose', pb);
        pb.$el.transform('').transition('');
        pb.close();
        swipeToClose.allow = true;
      });
      return;
    }

    if (diff !== 0) {
      pb.$el.addClass('photo-browser-transitioning').transitionEnd(function () {
        swipeToClose.allow = true;
        pb.$el.removeClass('photo-browser-transitioning');
      });
    } else {
      swipeToClose.allow = true;
    }

    nextTick(function () {
      pb.$el.transform('').transition('');
    });
  } // Render Functions
  ;

  _proto.renderNavbar = function renderNavbar() {
    var pb = this;
    if (pb.params.renderNavbar) return pb.params.renderNavbar.call(pb);
    var iconsColor = pb.params.iconsColor;
    if (!pb.params.iconsColor && pb.params.theme === 'dark') iconsColor = 'white';
    var pageBackLinkText = (pb.app.theme === 'ios' || pb.app.theme === 'aurora') && pb.params.pageBackLinkText ? pb.params.pageBackLinkText : '';
    var renderNavbarCount = typeof pb.params.navbarShowCount === 'undefined' ? pb.params.photos.length > 1 : pb.params.navbarShowCount;
    var isPopup = pb.params.type !== 'page';
    return $jsx("div", {
      class: "navbar navbar-photo-browser " + (pb.params.theme === 'dark' ? 'navbar-photo-browser-dark' : '')
    }, $jsx("div", {
      class: "navbar-bg"
    }), $jsx("div", {
      class: "navbar-inner navbar-inner-centered-title sliding"
    }, !isPopup && $jsx("div", {
      class: "left"
    }, $jsx("a", {
      class: "link " + (!pageBackLinkText ? 'icon-only' : '') + " back"
    }, $jsx("i", {
      class: "icon icon-back " + (iconsColor ? "color-" + iconsColor : '')
    }), pageBackLinkText && $jsx("span", null, pageBackLinkText))), renderNavbarCount && $jsx("div", {
      class: "title"
    }, $jsx("span", {
      class: "photo-browser-current"
    }), $jsx("span", {
      class: "photo-browser-of"
    }, pb.params.navbarOfText), $jsx("span", {
      class: "photo-browser-total"
    })), isPopup && $jsx("div", {
      class: "right"
    }, $jsx("a", {
      class: "link popup-close",
      "data-popup": ".photo-browser-popup"
    }, $jsx("span", null, pb.params.popupCloseLinkText)))));
  };

  _proto.renderToolbar = function renderToolbar() {
    var pb = this;
    if (pb.params.renderToolbar) return pb.params.renderToolbar.call(pb);
    var iconsColor = pb.params.iconsColor;
    if (!pb.params.iconsColor && pb.params.theme === 'dark') iconsColor = 'white';
    return $jsx("div", {
      class: "toolbar toolbar-bottom tabbar"
    }, $jsx("div", {
      class: "toolbar-inner"
    }, $jsx("a", {
      class: "link photo-browser-prev"
    }, $jsx("i", {
      class: "icon icon-back " + (iconsColor ? "color-" + iconsColor : '')
    })), $jsx("a", {
      class: "link photo-browser-next"
    }, $jsx("i", {
      class: "icon icon-forward " + (iconsColor ? "color-" + iconsColor : '')
    }))));
  };

  _proto.renderCaption = function renderCaption(caption, index) {
    var pb = this;
    if (pb.params.renderCaption) return pb.params.renderCaption.call(pb, caption, index);
    return $jsx("div", {
      class: "photo-browser-caption",
      "data-caption-index": index
    }, caption);
  };

  _proto.renderObject = function renderObject(photo, index) {
    var pb = this;
    if (pb.params.renderObject) return pb.params.renderObject.call(pb, photo, index);
    return $jsx("div", {
      class: "photo-browser-slide photo-browser-object-slide swiper-slide",
      "data-swiper-slide-index": index
    }, photo.html ? photo.html : photo);
  };

  _proto.renderLazyPhoto = function renderLazyPhoto(photo, index) {
    var pb = this;
    if (pb.params.renderLazyPhoto) return pb.params.renderLazyPhoto.call(pb, photo, index);
    return $jsx("div", {
      class: "photo-browser-slide photo-browser-slide-lazy swiper-slide",
      "data-swiper-slide-index": index
    }, $jsx("div", {
      class: "swiper-lazy-preloader"
    }), $jsx("span", {
      class: "swiper-zoom-container"
    }, $jsx("img", {
      "data-src": photo.url ? photo.url : photo,
      class: "swiper-lazy"
    })));
  };

  _proto.renderPhoto = function renderPhoto(photo, index) {
    var pb = this;
    if (pb.params.renderPhoto) return pb.params.renderPhoto.call(pb, photo, index);
    return $jsx("div", {
      class: "photo-browser-slide swiper-slide",
      "data-swiper-slide-index": index
    }, $jsx("span", {
      class: "swiper-zoom-container"
    }, $jsx("img", {
      src: photo.url ? photo.url : photo
    })));
  };

  _proto.render = function render() {
    var pb = this;
    if (pb.params.render) return pb.params.render.call(pb, pb.params);
    return $jsx("div", {
      class: "photo-browser photo-browser-" + pb.params.theme
    }, $jsx("div", {
      class: "view"
    }, $jsx("div", {
      class: "page photo-browser-page photo-browser-page-" + pb.params.theme + " no-toolbar " + (!pb.params.navbar ? 'no-navbar' : ''),
      "data-name": "photo-browser-page"
    }, pb.params.navbar && pb.renderNavbar(), pb.params.toolbar && pb.renderToolbar(), $jsx("div", {
      class: "photo-browser-captions photo-browser-captions-" + (pb.params.captionsTheme || pb.params.theme)
    }, pb.params.photos.map(function (photo, index) {
      if (photo.caption) return pb.renderCaption(photo.caption, index);
      return '';
    })), $jsx("div", {
      class: "photo-browser-swiper-container swiper-container"
    }, $jsx("div", {
      class: "photo-browser-swiper-wrapper swiper-wrapper"
    }, !pb.params.virtualSlides && pb.params.photos.map(function (photo, index) {
      if (photo.html || (typeof photo === 'string' || photo instanceof String) && photo.indexOf('<') >= 0 && photo.indexOf('>') >= 0) {
        return pb.renderObject(photo, index);
      }

      if (pb.params.swiper.lazy === true || pb.params.swiper.lazy && pb.params.swiper.lazy.enabled) {
        return pb.renderLazyPhoto(photo, index);
      }

      return pb.renderPhoto(photo, index);
    }))))));
  };

  _proto.renderStandalone = function renderStandalone() {
    var pb = this;
    if (pb.params.renderStandalone) return pb.params.renderStandalone.call(pb);
    var standaloneHtml = "<div class=\"popup photo-browser-popup photo-browser-standalone popup-tablet-fullscreen\">" + pb.render() + "</div>";
    return standaloneHtml;
  };

  _proto.renderPage = function renderPage() {
    var pb = this;
    if (pb.params.renderPage) return pb.params.renderPage.call(pb);
    var pageHtml = pb.render();
    return pageHtml;
  };

  _proto.renderPopup = function renderPopup() {
    var pb = this;
    if (pb.params.renderPopup) return pb.params.renderPopup.call(pb);
    var popupHtml = "<div class=\"popup photo-browser-popup\">" + pb.render() + "</div>";
    return popupHtml;
  } // Callbacks
  ;

  _proto.onOpen = function onOpen(type, el) {
    var pb = this;
    var app = pb.app;
    var $el = $(el);
    $el[0].f7PhotoBrowser = pb;
    pb.$el = $el;
    pb.el = $el[0];
    pb.openedIn = type;
    pb.opened = true;
    pb.$swiperContainerEl = pb.$el.find('.photo-browser-swiper-container');
    pb.$swiperWrapperEl = pb.$el.find('.photo-browser-swiper-wrapper');
    pb.slides = pb.$el.find('.photo-browser-slide');
    pb.$captionsContainerEl = pb.$el.find('.photo-browser-captions');
    pb.captions = pb.$el.find('.photo-browser-caption'); // Init Swiper

    var clickTimeout;
    var swiperParams = extend({}, pb.params.swiper, {
      initialSlide: pb.activeIndex,
      on: {
        click: function click(e) {
          clearTimeout(clickTimeout);

          if (pb.params.exposition) {
            clickTimeout = setTimeout(function () {
              pb.expositionToggle();
            }, 350);
          }

          pb.emit('local::tap', e);
          pb.emit('local::click', e);
        },
        doubleClick: function doubleClick(e) {
          clearTimeout(clickTimeout);
          pb.emit('local::doubleTap', e);
          pb.emit('local::doubleClick', e);
        },
        slideChange: function slideChange() {
          var swiper = this;
          pb.onSlideChange(swiper);

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          pb.emit.apply(pb, ['local::slideChange'].concat(args));
        },
        transitionStart: function transitionStart() {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          pb.emit.apply(pb, ['local::transitionStart'].concat(args));
        },
        transitionEnd: function transitionEnd() {
          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          pb.emit.apply(pb, ['local::transitionEnd'].concat(args));
        },
        slideChangeTransitionStart: function slideChangeTransitionStart() {
          var swiper = this;
          pb.onSlideChange(swiper);

          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          pb.emit.apply(pb, ['local::slideChangeTransitionStart'].concat(args));
        },
        slideChangeTransitionEnd: function slideChangeTransitionEnd() {
          for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
          }

          pb.emit.apply(pb, ['local::slideChangeTransitionEnd'].concat(args));
        },
        lazyImageLoad: function lazyImageLoad() {
          for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
          }

          pb.emit.apply(pb, ['local::lazyImageLoad'].concat(args));
        },
        lazyImageReady: function lazyImageReady() {
          for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
            args[_key7] = arguments[_key7];
          }

          var slideEl = args[0];
          $(slideEl).removeClass('photo-browser-slide-lazy');
          pb.emit.apply(pb, ['local::lazyImageReady'].concat(args));
        }
      }
    });

    if (pb.params.swipeToClose && pb.params.type !== 'page') {
      extend(swiperParams.on, {
        touchStart: function touchStart(swiper, e) {
          pb.onTouchStart(e);
          pb.emit('local::touchStart', e);
        },
        touchMoveOpposite: function touchMoveOpposite(swiper, e) {
          pb.onTouchMove(e);
          pb.emit('local::touchMoveOpposite', e);
        },
        touchEnd: function touchEnd(swiper, e) {
          pb.onTouchEnd(e);
          pb.emit('local::touchEnd', e);
        }
      });
    }

    if (pb.params.virtualSlides) {
      extend(swiperParams, {
        virtual: {
          slides: pb.params.photos,
          renderSlide: function renderSlide(photo, index) {
            if (photo.html || (typeof photo === 'string' || photo instanceof String) && photo.indexOf('<') >= 0 && photo.indexOf('>') >= 0) {
              return pb.renderObject(photo, index);
            }

            if (pb.params.swiper.lazy === true || pb.params.swiper.lazy && pb.params.swiper.lazy.enabled) {
              return pb.renderLazyPhoto(photo, index);
            }

            return pb.renderPhoto(photo, index);
          }
        }
      });
    }

    var window = getWindow();
    pb.swiper = app.swiper ? app.swiper.create(pb.$swiperContainerEl, swiperParams) : new window.Swiper(pb.$swiperContainerEl, swiperParams);

    if (pb.activeIndex === 0) {
      pb.onSlideChange(pb.swiper);
    }

    if (pb.$el) {
      pb.$el.trigger('photobrowser:open');
    }

    pb.emit('local::open photoBrowserOpen', pb);
  };

  _proto.onOpened = function onOpened() {
    var pb = this;

    if (pb.$el && pb.params.type === 'standalone') {
      pb.$el.css('animation', 'none');
    }

    if (pb.$el) {
      pb.$el.trigger('photobrowser:opened');
    }

    pb.emit('local::opened photoBrowserOpened', pb);
  };

  _proto.onClose = function onClose() {
    var pb = this;
    if (pb.destroyed) return; // Destroy Swiper

    if (pb.swiper && pb.swiper.destroy) {
      pb.swiper.destroy(true, false);
      pb.swiper = null;
      delete pb.swiper;
    }

    if (pb.$el) {
      pb.$el.trigger('photobrowser:close');
    }

    pb.emit('local::close photoBrowserClose', pb);
  };

  _proto.onClosed = function onClosed() {
    var pb = this;
    if (pb.destroyed) return;
    pb.opened = false;
    pb.$el = null;
    pb.el = null;
    delete pb.$el;
    delete pb.el;

    if (pb.$el) {
      pb.$el.trigger('photobrowser:closed');
    }

    pb.emit('local::closed photoBrowserClosed', pb);
  } // Open
  ;

  _proto.openPage = function openPage() {
    var pb = this;
    if (pb.opened) return pb;
    var pageHtml = pb.renderPage();
    pb.view.router.navigate({
      url: pb.url,
      route: {
        content: pageHtml,
        path: pb.url,
        on: {
          pageBeforeIn: function pageBeforeIn(e, page) {
            pb.view.$el.addClass("with-photo-browser-page with-photo-browser-page-" + pb.params.theme);
            pb.onOpen('page', page.el);
          },
          pageAfterIn: function pageAfterIn(e, page) {
            pb.onOpened('page', page.el);
          },
          pageBeforeOut: function pageBeforeOut(e, page) {
            pb.view.$el.removeClass("with-photo-browser-page with-photo-browser-page-exposed with-photo-browser-page-" + pb.params.theme);
            pb.onClose('page', page.el);
          },
          pageAfterOut: function pageAfterOut(e, page) {
            pb.onClosed('page', page.el);
          }
        }
      }
    });
    return pb;
  };

  _proto.openStandalone = function openStandalone() {
    var pb = this;
    if (pb.opened) return pb;
    var standaloneHtml = pb.renderStandalone();
    var popupParams = {
      backdrop: false,
      content: standaloneHtml,
      on: {
        popupOpen: function popupOpen(popup) {
          pb.onOpen('popup', popup.el);
        },
        popupOpened: function popupOpened(popup) {
          pb.onOpened('popup', popup.el);
        },
        popupClose: function popupClose(popup) {
          pb.onClose('popup', popup.el);
        },
        popupClosed: function popupClosed(popup) {
          pb.onClosed('popup', popup.el);
        }
      }
    };

    if (pb.params.routableModals && pb.view) {
      pb.view.router.navigate({
        url: pb.url,
        route: {
          path: pb.url,
          popup: popupParams
        }
      });
    } else {
      pb.modal = pb.app.popup.create(popupParams).open();
    }

    return pb;
  };

  _proto.openPopup = function openPopup() {
    var pb = this;
    if (pb.opened) return pb;
    var popupHtml = pb.renderPopup();
    var popupParams = {
      content: popupHtml,
      push: pb.params.popupPush,
      on: {
        popupOpen: function popupOpen(popup) {
          pb.onOpen('popup', popup.el);
        },
        popupOpened: function popupOpened(popup) {
          pb.onOpened('popup', popup.el);
        },
        popupClose: function popupClose(popup) {
          pb.onClose('popup', popup.el);
        },
        popupClosed: function popupClosed(popup) {
          pb.onClosed('popup', popup.el);
        }
      }
    };

    if (pb.params.routableModals && pb.view) {
      pb.view.router.navigate({
        url: pb.url,
        route: {
          path: pb.url,
          popup: popupParams
        }
      });
    } else {
      pb.modal = pb.app.popup.create(popupParams).open();
    }

    return pb;
  } // Exposition
  ;

  _proto.expositionEnable = function expositionEnable() {
    var pb = this;

    if (pb.params.type === 'page') {
      pb.view.$el.addClass('with-photo-browser-page-exposed');
    }

    if (pb.$el) pb.$el.addClass('photo-browser-exposed');
    if (pb.params.expositionHideCaptions) pb.$captionsContainerEl.addClass('photo-browser-captions-exposed');
    pb.exposed = true;
    return pb;
  };

  _proto.expositionDisable = function expositionDisable() {
    var pb = this;

    if (pb.params.type === 'page') {
      pb.view.$el.removeClass('with-photo-browser-page-exposed');
    }

    if (pb.$el) pb.$el.removeClass('photo-browser-exposed');
    if (pb.params.expositionHideCaptions) pb.$captionsContainerEl.removeClass('photo-browser-captions-exposed');
    pb.exposed = false;
    return pb;
  };

  _proto.expositionToggle = function expositionToggle() {
    var pb = this;

    if (pb.params.type === 'page') {
      pb.view.$el.toggleClass('with-photo-browser-page-exposed');
    }

    if (pb.$el) pb.$el.toggleClass('photo-browser-exposed');
    if (pb.params.expositionHideCaptions) pb.$captionsContainerEl.toggleClass('photo-browser-captions-exposed');
    pb.exposed = !pb.exposed;
    return pb;
  };

  _proto.open = function open(index) {
    var pb = this;
    var type = pb.params.type;

    if (pb.opened) {
      if (pb.swiper && typeof index !== 'undefined') {
        pb.swiper.slideTo(parseInt(index, 10));
      }

      return pb;
    }

    if (typeof index !== 'undefined') {
      pb.activeIndex = index;
    }

    if (type === 'standalone') {
      pb.openStandalone();
    }

    if (type === 'page') {
      pb.openPage();
    }

    if (type === 'popup') {
      pb.openPopup();
    }

    return pb;
  };

  _proto.close = function close() {
    var pb = this;
    if (!pb.opened) return pb;

    if (pb.params.routableModals && pb.view || pb.openedIn === 'page') {
      pb.view.router.back();
    } else {
      pb.modal.once('modalClosed', function () {
        nextTick(function () {
          if (pb.destroyed) return;
          pb.modal.destroy();
          delete pb.modal;
        });
      });
      pb.modal.close();
    }

    return pb;
  } // eslint-disable-next-line
  ;

  _proto.init = function init() {};

  _proto.destroy = function destroy() {
    var pb = this;
    pb.emit('local::beforeDestroy photoBrowserBeforeDestroy', pb);

    if (pb.$el) {
      pb.$el.trigger('photobrowser:beforedestroy');
      pb.$el[0].f7PhotoBrowser = null;
      delete pb.$el[0].f7PhotoBrowser;
    }

    deleteProps(pb);
    pb.destroyed = true;
    pb = null;
  };

  _createClass(PhotoBrowser, [{
    key: "view",
    get: function get() {
      var params = this.params,
          app = this.app;
      return params.view || app.views.main;
    }
  }]);

  return PhotoBrowser;
}(Framework7Class);

export default PhotoBrowser;