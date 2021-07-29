import { getWindow } from 'ssr-window';
import $ from '../../shared/dom7';
import { bindMethods } from '../../shared/utils';
import { getSupport } from '../../shared/get-support';
var Lazy = {
  destroy: function destroy(pageEl) {
    var $pageEl = $(pageEl).closest('.page');
    if (!$pageEl.length) return;

    if ($pageEl[0].f7LazyDestroy) {
      $pageEl[0].f7LazyDestroy();
    }
  },
  create: function create(pageEl) {
    var app = this;
    var window = getWindow();
    var support = getSupport();
    var $pageEl = $(pageEl).closest('.page').eq(0); // Lazy images

    var $lazyLoadImages = $pageEl.find('.lazy');
    if ($lazyLoadImages.length === 0 && !$pageEl.hasClass('lazy')) return; // Placeholder

    var placeholderSrc = app.params.lazy.placeholder;

    if (placeholderSrc !== false) {
      $lazyLoadImages.each(function (lazyEl) {
        if ($(lazyEl).attr('data-src') && !$(lazyEl).attr('src')) $(lazyEl).attr('src', placeholderSrc);
      });
    } // load image


    var imagesSequence = [];
    var imageIsLoading = false;

    function onImageComplete(lazyEl) {
      if (imagesSequence.indexOf(lazyEl) >= 0) {
        imagesSequence.splice(imagesSequence.indexOf(lazyEl), 1);
      }

      imageIsLoading = false;

      if (app.params.lazy.sequential && imagesSequence.length > 0) {
        imageIsLoading = true;
        app.lazy.loadImage(imagesSequence[0], onImageComplete);
      }
    }

    function observerCallback(entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (app.params.lazy.sequential && imageIsLoading) {
            if (imagesSequence.indexOf(entry.target) < 0) imagesSequence.push(entry.target);
            return;
          } // Load image


          imageIsLoading = true;
          app.lazy.loadImage(entry.target, onImageComplete); // Detach

          observer.unobserve(entry.target);
        }
      });
    }

    if (app.params.lazy.observer && support.intersectionObserver) {
      var observer = $pageEl[0].f7LazyObserver;

      if (!observer) {
        observer = new window.IntersectionObserver(observerCallback, {
          root: $pageEl[0]
        });
      }

      $lazyLoadImages.each(function (el) {
        if (el.f7LazyObserverAdded) return;
        el.f7LazyObserverAdded = true;
        observer.observe(el);
      });

      if (!$pageEl[0].f7LazyDestroy) {
        $pageEl[0].f7LazyDestroy = function () {
          observer.disconnect();
          delete $pageEl[0].f7LazyDestroy;
          delete $pageEl[0].f7LazyObserver;
        };
      }

      return;
    }

    function lazyHandler() {
      app.lazy.load($pageEl, function (lazyEl) {
        if (app.params.lazy.sequential && imageIsLoading) {
          if (imagesSequence.indexOf(lazyEl) < 0) imagesSequence.push(lazyEl);
          return;
        }

        imageIsLoading = true;
        app.lazy.loadImage(lazyEl, onImageComplete);
      });
    }

    function attachEvents() {
      $pageEl[0].f7LazyAttached = true;
      $pageEl.on('lazy', lazyHandler);
      $pageEl.on('scroll', lazyHandler, true);
      $pageEl.find('.tab').on('tab:mounted tab:show', lazyHandler);
      app.on('resize', lazyHandler);
    }

    function detachEvents() {
      $pageEl[0].f7LazyAttached = false;
      delete $pageEl[0].f7LazyAttached;
      $pageEl.off('lazy', lazyHandler);
      $pageEl.off('scroll', lazyHandler, true);
      $pageEl.find('.tab').off('tab:mounted tab:show', lazyHandler);
      app.off('resize', lazyHandler);
    } // Store detach function


    if (!$pageEl[0].f7LazyDestroy) {
      $pageEl[0].f7LazyDestroy = detachEvents;
    } // Attach events


    if (!$pageEl[0].f7LazyAttached) {
      attachEvents();
    } // Run loader on page load/init


    lazyHandler();
  },
  isInViewport: function isInViewport(lazyEl) {
    var app = this;
    var rect = lazyEl.getBoundingClientRect();
    var threshold = app.params.lazy.threshold || 0;
    return rect.top >= 0 - threshold && rect.left >= 0 - threshold && rect.top <= app.height + threshold && rect.left <= app.width + threshold;
  },
  loadImage: function loadImage(imageEl, callback) {
    var app = this;
    var window = getWindow();
    var $imageEl = $(imageEl);
    var bg = $imageEl.attr('data-background');
    var src = bg || $imageEl.attr('data-src');

    function onLoad() {
      $imageEl.removeClass('lazy').addClass('lazy-loaded');

      if (bg) {
        $imageEl.css('background-image', "url(" + src + ")");
      } else if (src) {
        $imageEl.attr('src', src);
      }

      if (callback) callback(imageEl);
      $imageEl.trigger('lazy:loaded');
      app.emit('lazyLoaded', $imageEl[0]);
    }

    if (!src) {
      $imageEl.trigger('lazy:load');
      app.emit('lazyLoad', $imageEl[0]);
      onLoad();
      return;
    }

    function onError() {
      $imageEl.removeClass('lazy').addClass('lazy-loaded');

      if (bg) {
        $imageEl.css('background-image', "url(" + (app.params.lazy.placeholder || '') + ")");
      } else {
        $imageEl.attr('src', app.params.lazy.placeholder || '');
      }

      if (callback) callback(imageEl);
      $imageEl.trigger('lazy:error');
      app.emit('lazyError', $imageEl[0]);
    }

    var image = new window.Image();
    image.onload = onLoad;
    image.onerror = onError;
    image.src = src;
    $imageEl.removeAttr('data-src').removeAttr('data-background'); // Add loaded callback and events

    $imageEl.trigger('lazy:load');
    app.emit('lazyLoad', $imageEl[0]);
  },
  load: function load(pageEl, callback) {
    var app = this;
    var $pageEl = $(pageEl);
    if (!$pageEl.hasClass('page')) $pageEl = $pageEl.parents('.page').eq(0);

    if ($pageEl.length === 0) {
      return;
    }

    $pageEl.find('.lazy').each(function (lazyEl) {
      var $lazyEl = $(lazyEl);

      if ($lazyEl.parents('.tab:not(.tab-active)').length > 0) {
        return;
      }

      if (app.lazy.isInViewport(lazyEl)) {
        if (callback) callback(lazyEl);else app.lazy.loadImage(lazyEl);
      }
    });
  }
};
export default {
  name: 'lazy',
  params: {
    lazy: {
      placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEXCwsK592mkAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==',
      threshold: 0,
      sequential: true,
      observer: true
    }
  },
  create: function create() {
    var app = this;
    bindMethods(app, {
      lazy: Lazy
    });
  },
  on: {
    pageInit: function pageInit(page) {
      var app = this;

      if (page.$el.find('.lazy').length > 0 || page.$el.hasClass('lazy')) {
        app.lazy.create(page.$el);
      }
    },
    pageAfterIn: function pageAfterIn(page) {
      var app = this;
      var support = getSupport();
      if (app.params.lazy.observer && support.intersectionObserver) return;

      if (page.$el.find('.lazy').length > 0 || page.$el.hasClass('lazy')) {
        app.lazy.create(page.$el);
      }
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      var app = this;

      if (page.$el.find('.lazy').length > 0 || page.$el.hasClass('lazy')) {
        app.lazy.destroy(page.$el);
      }
    },
    tabMounted: function tabMounted(tabEl) {
      var app = this;
      var $tabEl = $(tabEl);

      if ($tabEl.find('.lazy').length > 0 || $tabEl.hasClass('lazy')) {
        app.lazy.create($tabEl);
      }
    },
    tabBeforeRemove: function tabBeforeRemove(tabEl) {
      var app = this;
      var support = getSupport();
      if (app.params.lazy.observer && support.intersectionObserver) return;
      var $tabEl = $(tabEl);

      if ($tabEl.find('.lazy').length > 0 || $tabEl.hasClass('lazy')) {
        app.lazy.destroy($tabEl);
      }
    }
  }
};