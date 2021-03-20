import $ from '../../shared/dom7';
import { bindMethods, iosPreloaderContent, mdPreloaderContent, auroraPreloaderContent } from '../../shared/utils';
var Treeview = {
  open: function open(itemEl) {
    var app = this;
    var $itemEl = $(itemEl).eq(0);
    if (!$itemEl.length) return;
    $itemEl.addClass('treeview-item-opened');
    $itemEl.trigger('treeview:open');
    app.emit('treeviewOpen', $itemEl[0]);

    function done(cancel) {
      if (cancel) {
        $itemEl.removeClass('treeview-item-opened');
        $itemEl.trigger('treeview:close');
        app.emit('treeviewClose', $itemEl[0]);
      } else {
        $itemEl[0].f7TreeviewChildrenLoaded = true;
      }

      $itemEl.find('.treeview-toggle').removeClass('treeview-toggle-hidden');
      $itemEl.find('.treeview-preloader').remove();
    }

    if ($itemEl.hasClass('treeview-load-children') && !$itemEl[0].f7TreeviewChildrenLoaded) {
      var preloaders = {
        iosPreloaderContent: iosPreloaderContent,
        mdPreloaderContent: mdPreloaderContent,
        auroraPreloaderContent: auroraPreloaderContent
      };
      $itemEl.trigger('treeview:loadchildren', done);
      app.emit('treeviewLoadChildren', $itemEl[0], done);
      $itemEl.find('.treeview-toggle').addClass('treeview-toggle-hidden');
      $itemEl.find('.treeview-item-root').prepend("<div class=\"preloader treeview-preloader\">" + preloaders[app.theme + "PreloaderContent"] + "</div>");
    }
  },
  close: function close(itemEl) {
    var app = this;
    var $itemEl = $(itemEl).eq(0);
    if (!$itemEl.length) return;
    $itemEl.removeClass('treeview-item-opened');
    $itemEl.trigger('treeview:close');
    app.emit('treeviewClose', $itemEl[0]);
  },
  toggle: function toggle(itemEl) {
    var app = this;
    var $itemEl = $(itemEl).eq(0);
    if (!$itemEl.length) return;
    var wasOpened = $itemEl.hasClass('treeview-item-opened');
    app.treeview[wasOpened ? 'close' : 'open']($itemEl);
  }
};
export default {
  name: 'treeview',
  create: function create() {
    var app = this;
    bindMethods(app, {
      treeview: Treeview
    });
  },
  clicks: {
    '.treeview-toggle': function toggle($clickedEl, clickedData, e) {
      var app = this;
      if ($clickedEl.parents('.treeview-item-toggle').length) return;
      var $treeviewItemEl = $clickedEl.parents('.treeview-item').eq(0);
      if (!$treeviewItemEl.length) return;
      e.preventF7Router = true;
      app.treeview.toggle($treeviewItemEl[0]);
    },
    '.treeview-item-toggle': function toggle($clickedEl, clickedData, e) {
      var app = this;
      var $treeviewItemEl = $clickedEl.closest('.treeview-item').eq(0);
      if (!$treeviewItemEl.length) return;
      e.preventF7Router = true;
      app.treeview.toggle($treeviewItemEl[0]);
    }
  }
};