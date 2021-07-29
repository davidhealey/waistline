"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _getSupport = require("../../shared/get-support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Navbar = {
  size: function size(el) {
    var app = this;
    var $el = (0, _dom.default)(el);

    if ($el.hasClass('navbars')) {
      $el = $el.children('.navbar').each(function (navbarEl) {
        app.navbar.size(navbarEl);
      });
      return;
    }

    var $innerEl = $el.children('.navbar-inner');
    if (!$innerEl.length) return;
    var needCenterTitle = $innerEl.hasClass('navbar-inner-centered-title') || app.params.navbar[app.theme + "CenterTitle"];
    var needLeftTitle = app.theme === 'ios' && !app.params.navbar[app.theme + "CenterTitle"];
    if (!needCenterTitle && !needLeftTitle) return;

    if ($el.hasClass('stacked') || $el.parents('.stacked').length > 0 || $el.parents('.tab:not(.tab-active)').length > 0 || $el.parents('.popup:not(.modal-in)').length > 0) {
      return;
    }

    if (app.theme !== 'ios' && app.params.navbar[app.theme + "CenterTitle"]) {
      $innerEl.addClass('navbar-inner-centered-title');
    }

    if (app.theme === 'ios' && !app.params.navbar.iosCenterTitle) {
      $innerEl.addClass('navbar-inner-left-title');
    }

    var $viewEl = $el.parents('.view').eq(0);
    var left = app.rtl ? $innerEl.children('.right') : $innerEl.children('.left');
    var right = app.rtl ? $innerEl.children('.left') : $innerEl.children('.right');
    var title = $innerEl.children('.title');
    var subnavbar = $innerEl.children('.subnavbar');
    var noLeft = left.length === 0;
    var noRight = right.length === 0;
    var leftWidth = noLeft ? 0 : left.outerWidth(true);
    var rightWidth = noRight ? 0 : right.outerWidth(true);
    var titleWidth = title.outerWidth(true);
    var navbarStyles = $innerEl.styles();
    var navbarWidth = $innerEl[0].offsetWidth;
    var navbarInnerWidth = navbarWidth - parseInt(navbarStyles.paddingLeft, 10) - parseInt(navbarStyles.paddingRight, 10);
    var isPrevious = $el.hasClass('navbar-previous');
    var sliding = $innerEl.hasClass('sliding');
    var router;
    var dynamicNavbar;

    if ($viewEl.length > 0 && $viewEl[0].f7View) {
      router = $viewEl[0].f7View.router;
      dynamicNavbar = router && router.dynamicNavbar;
    }

    var currLeft;
    var diff;

    if (noRight) {
      currLeft = navbarInnerWidth - titleWidth;
    }

    if (noLeft) {
      currLeft = 0;
    }

    if (!noLeft && !noRight) {
      currLeft = (navbarInnerWidth - rightWidth - titleWidth + leftWidth) / 2;
    }

    var requiredLeft = (navbarInnerWidth - titleWidth) / 2;

    if (navbarInnerWidth - leftWidth - rightWidth > titleWidth) {
      if (requiredLeft < leftWidth) {
        requiredLeft = leftWidth;
      }

      if (requiredLeft + titleWidth > navbarInnerWidth - rightWidth) {
        requiredLeft = navbarInnerWidth - rightWidth - titleWidth;
      }

      diff = requiredLeft - currLeft;
    } else {
      diff = 0;
    } // RTL inverter


    var inverter = app.rtl ? -1 : 1;

    if (dynamicNavbar && app.theme === 'ios') {
      if (title.hasClass('sliding') || title.length > 0 && sliding) {
        var titleLeftOffset = -(currLeft + diff) * inverter;
        var titleRightOffset = (navbarInnerWidth - currLeft - diff - titleWidth) * inverter;

        if (isPrevious) {
          if (router && router.params.iosAnimateNavbarBackIcon) {
            var activeNavbarBackLink = $el.parent().find('.navbar-current').children('.left.sliding').find('.back .icon ~ span');

            if (activeNavbarBackLink.length > 0) {
              titleLeftOffset += activeNavbarBackLink[0].offsetLeft;
            }
          }
        }

        title[0].f7NavbarLeftOffset = titleLeftOffset;
        title[0].f7NavbarRightOffset = titleRightOffset;
      }

      if (!noLeft && (left.hasClass('sliding') || sliding)) {
        if (app.rtl) {
          left[0].f7NavbarLeftOffset = -(navbarInnerWidth - left[0].offsetWidth) / 2 * inverter;
          left[0].f7NavbarRightOffset = leftWidth * inverter;
        } else {
          left[0].f7NavbarLeftOffset = -leftWidth;
          left[0].f7NavbarRightOffset = (navbarInnerWidth - left[0].offsetWidth) / 2;

          if (router && router.params.iosAnimateNavbarBackIcon && left.find('.back .icon').length > 0) {
            if (left.find('.back .icon ~ span').length) {
              var leftOffset = left[0].f7NavbarLeftOffset;
              var rightOffset = left[0].f7NavbarRightOffset;
              left[0].f7NavbarLeftOffset = 0;
              left[0].f7NavbarRightOffset = 0;
              left.find('.back .icon ~ span')[0].f7NavbarLeftOffset = leftOffset;
              left.find('.back .icon ~ span')[0].f7NavbarRightOffset = rightOffset - left.find('.back .icon')[0].offsetWidth;
            }
          }
        }
      }

      if (!noRight && (right.hasClass('sliding') || sliding)) {
        if (app.rtl) {
          right[0].f7NavbarLeftOffset = -rightWidth * inverter;
          right[0].f7NavbarRightOffset = (navbarInnerWidth - right[0].offsetWidth) / 2 * inverter;
        } else {
          right[0].f7NavbarLeftOffset = -(navbarInnerWidth - right[0].offsetWidth) / 2;
          right[0].f7NavbarRightOffset = rightWidth;
        }
      }

      if (subnavbar.length && (subnavbar.hasClass('sliding') || sliding)) {
        subnavbar[0].f7NavbarLeftOffset = app.rtl ? subnavbar[0].offsetWidth : -subnavbar[0].offsetWidth;
        subnavbar[0].f7NavbarRightOffset = -subnavbar[0].f7NavbarLeftOffset;
      }
    } // Center title


    if (needCenterTitle) {
      var titleLeft = diff;
      if (app.rtl && noLeft && noRight && title.length > 0) titleLeft = -titleLeft;
      title.css({
        left: titleLeft + "px"
      });
    }
  },
  hide: function hide(el, animate, hideStatusbar, hideOnlyCurrent) {
    if (animate === void 0) {
      animate = true;
    }

    if (hideStatusbar === void 0) {
      hideStatusbar = false;
    }

    if (hideOnlyCurrent === void 0) {
      hideOnlyCurrent = false;
    }

    var app = this;
    var $el = (0, _dom.default)(el);
    var isDynamic = $el.hasClass('navbar') && $el.parent('.navbars').length && !hideOnlyCurrent;
    if (isDynamic) $el = $el.parents('.navbars');
    if (!$el.length) return;
    if ($el.hasClass('navbar-hidden')) return;
    var className = "navbar-hidden" + (animate ? ' navbar-transitioning' : '');
    var currentIsLarge = isDynamic ? $el.find('.navbar-current .title-large').length : $el.find('.title-large').length;

    if (currentIsLarge) {
      className += ' navbar-large-hidden';
    }

    if (hideStatusbar) {
      className += ' navbar-hidden-statusbar';
    }

    $el.transitionEnd(function () {
      $el.removeClass('navbar-transitioning');
    });
    $el.addClass(className);

    if (isDynamic) {
      $el.children('.navbar').each(function (subEl) {
        (0, _dom.default)(subEl).trigger('navbar:hide');
        app.emit('navbarHide', subEl);
      });
    } else {
      $el.trigger('navbar:hide');
      app.emit('navbarHide', $el[0]);
    }
  },
  show: function show(el, animate, hideOnlyCurrent) {
    if (el === void 0) {
      el = '.navbar-hidden';
    }

    if (animate === void 0) {
      animate = true;
    }

    if (hideOnlyCurrent === void 0) {
      hideOnlyCurrent = false;
    }

    var app = this;
    var $el = (0, _dom.default)(el);
    var isDynamic = $el.hasClass('navbar') && $el.parent('.navbars').length && !hideOnlyCurrent;
    if (isDynamic) $el = $el.parents('.navbars');
    if (!$el.length) return;
    if (!$el.hasClass('navbar-hidden')) return;

    if (animate) {
      $el.addClass('navbar-transitioning');
      $el.transitionEnd(function () {
        $el.removeClass('navbar-transitioning');
      });
    }

    $el.removeClass('navbar-hidden navbar-large-hidden navbar-hidden-statusbar');

    if (isDynamic) {
      $el.children('.navbar').each(function (subEl) {
        (0, _dom.default)(subEl).trigger('navbar:show');
        app.emit('navbarShow', subEl);
      });
    } else {
      $el.trigger('navbar:show');
      app.emit('navbarShow', $el[0]);
    }
  },
  getElByPage: function getElByPage(page) {
    var $pageEl;
    var $navbarEl;
    var pageData;

    if (page.$navbarEl || page.$el) {
      pageData = page;
      $pageEl = page.$el;
    } else {
      $pageEl = (0, _dom.default)(page);
      if ($pageEl.length > 0) pageData = $pageEl[0].f7Page;
    }

    if (pageData && pageData.$navbarEl && pageData.$navbarEl.length > 0) {
      $navbarEl = pageData.$navbarEl;
    } else if ($pageEl) {
      $navbarEl = $pageEl.children('.navbar');
    }

    if (!$navbarEl || $navbarEl && $navbarEl.length === 0) return undefined;
    return $navbarEl[0];
  },
  getPageByEl: function getPageByEl(navbarEl) {
    var $navbarEl = (0, _dom.default)(navbarEl);

    if ($navbarEl.parents('.page').length) {
      return $navbarEl.parents('.page')[0];
    }

    var pageEl;
    $navbarEl.parents('.view').find('.page').each(function (el) {
      if (el && el.f7Page && el.f7Page.navbarEl && $navbarEl[0] === el.f7Page.navbarEl) {
        pageEl = el;
      }
    });
    return pageEl;
  },
  collapseLargeTitle: function collapseLargeTitle(navbarEl) {
    var app = this;
    var $navbarEl = (0, _dom.default)(navbarEl);

    if ($navbarEl.hasClass('navbars')) {
      $navbarEl = $navbarEl.find('.navbar');

      if ($navbarEl.length > 1) {
        $navbarEl = (0, _dom.default)(navbarEl).find('.navbar-large.navbar-current');
      }

      if ($navbarEl.length > 1 || !$navbarEl.length) {
        return;
      }
    }

    var $pageEl = (0, _dom.default)(app.navbar.getPageByEl($navbarEl));
    $navbarEl.addClass('navbar-large-collapsed');
    $pageEl.eq(0).addClass('page-with-navbar-large-collapsed').trigger('page:navbarlargecollapsed');
    app.emit('pageNavbarLargeCollapsed', $pageEl[0]);
    $navbarEl.trigger('navbar:collapse');
    app.emit('navbarCollapse', $navbarEl[0]);
  },
  expandLargeTitle: function expandLargeTitle(navbarEl) {
    var app = this;
    var $navbarEl = (0, _dom.default)(navbarEl);

    if ($navbarEl.hasClass('navbars')) {
      $navbarEl = $navbarEl.find('.navbar-large');

      if ($navbarEl.length > 1) {
        $navbarEl = (0, _dom.default)(navbarEl).find('.navbar-large.navbar-current');
      }

      if ($navbarEl.length > 1 || !$navbarEl.length) {
        return;
      }
    }

    var $pageEl = (0, _dom.default)(app.navbar.getPageByEl($navbarEl));
    $navbarEl.removeClass('navbar-large-collapsed');
    $pageEl.eq(0).removeClass('page-with-navbar-large-collapsed').trigger('page:navbarlargeexpanded');
    app.emit('pageNavbarLargeExpanded', $pageEl[0]);
    $navbarEl.trigger('navbar:expand');
    app.emit('navbarExpand', $navbarEl[0]);
  },
  toggleLargeTitle: function toggleLargeTitle(navbarEl) {
    var app = this;
    var $navbarEl = (0, _dom.default)(navbarEl);

    if ($navbarEl.hasClass('navbars')) {
      $navbarEl = $navbarEl.find('.navbar-large');

      if ($navbarEl.length > 1) {
        $navbarEl = (0, _dom.default)(navbarEl).find('.navbar-large.navbar-current');
      }

      if ($navbarEl.length > 1 || !$navbarEl.length) {
        return;
      }
    }

    if ($navbarEl.hasClass('navbar-large-collapsed')) {
      app.navbar.expandLargeTitle($navbarEl);
    } else {
      app.navbar.collapseLargeTitle($navbarEl);
    }
  },
  initNavbarOnScroll: function initNavbarOnScroll(pageEl, navbarEl, needHide, needCollapse, needTransparent) {
    var app = this;
    var support = (0, _getSupport.getSupport)();
    var $pageEl = (0, _dom.default)(pageEl);
    var $navbarEl = (0, _dom.default)(navbarEl);
    var $titleLargeEl = $navbarEl.find('.title-large');
    var isLarge = $titleLargeEl.length || $navbarEl.hasClass('.navbar-large');
    var navbarHideHeight = 44;
    var snapPageScrollToLargeTitle = app.params.navbar.snapPageScrollToLargeTitle;
    var snapPageScrollToTransparentNavbar = app.params.navbar.snapPageScrollToTransparentNavbar;
    var previousScrollTop;
    var currentScrollTop;
    var scrollHeight;
    var offsetHeight;
    var reachEnd;
    var action;
    var navbarHidden;
    var navbarCollapsed;
    var navbarTitleLargeHeight;
    var navbarOffsetHeight;

    if (needCollapse || needHide && isLarge) {
      navbarTitleLargeHeight = $navbarEl.css('--f7-navbar-large-title-height');

      if (navbarTitleLargeHeight && navbarTitleLargeHeight.indexOf('px') >= 0) {
        navbarTitleLargeHeight = parseInt(navbarTitleLargeHeight, 10);

        if (Number.isNaN(navbarTitleLargeHeight) && $titleLargeEl.length) {
          navbarTitleLargeHeight = $titleLargeEl[0].offsetHeight;
        } else if (Number.isNaN(navbarTitleLargeHeight)) {
          if (app.theme === 'ios') navbarTitleLargeHeight = 52;else if (app.theme === 'md') navbarTitleLargeHeight = 48;else if (app.theme === 'aurora') navbarTitleLargeHeight = 38;
        }
      } else if ($titleLargeEl.length) {
        navbarTitleLargeHeight = $titleLargeEl[0].offsetHeight;
      } else {
        // eslint-disable-next-line
        if (app.theme === 'ios') navbarTitleLargeHeight = 52;else if (app.theme === 'md') navbarTitleLargeHeight = 48;else if (app.theme === 'aurora') navbarTitleLargeHeight = 38;
      }
    }

    if (needHide && isLarge) {
      navbarHideHeight += navbarTitleLargeHeight;
    }

    var scrollChanged;
    var scrollContent;
    var scrollTimeoutId;
    var touchEndTimeoutId;
    var touchSnapTimeout = 70;
    var desktopSnapTimeout = 300;

    function snapLargeNavbar() {
      var inSearchbarExpanded = $navbarEl.hasClass('with-searchbar-expandable-enabled');
      if (inSearchbarExpanded) return;
      if (!scrollContent || currentScrollTop < 0) return;

      if (currentScrollTop >= navbarTitleLargeHeight / 2 && currentScrollTop < navbarTitleLargeHeight) {
        (0, _dom.default)(scrollContent).scrollTop(navbarTitleLargeHeight, 100);
      } else if (currentScrollTop < navbarTitleLargeHeight) {
        (0, _dom.default)(scrollContent).scrollTop(0, 200);
      }
    }

    function snapTransparentNavbar() {
      var inSearchbarExpanded = $navbarEl.hasClass('with-searchbar-expandable-enabled');
      if (inSearchbarExpanded) return;
      if (!scrollContent || currentScrollTop < 0) return;

      if (currentScrollTop >= navbarOffsetHeight / 2 && currentScrollTop < navbarOffsetHeight) {
        (0, _dom.default)(scrollContent).scrollTop(navbarOffsetHeight, 100);
      } else if (currentScrollTop < navbarOffsetHeight) {
        (0, _dom.default)(scrollContent).scrollTop(0, 200);
      }
    }

    function handleNavbarTransparent() {
      var isHidden = $navbarEl.hasClass('navbar-hidden') || $navbarEl.parent('.navbars').hasClass('navbar-hidden');
      var inSearchbarExpanded = $navbarEl.hasClass('with-searchbar-expandable-enabled');
      if (inSearchbarExpanded || isHidden) return;

      if (!navbarOffsetHeight) {
        navbarOffsetHeight = navbarEl.offsetHeight;
      }

      var opacity = currentScrollTop / navbarOffsetHeight;
      var notTransparent = $navbarEl.hasClass('navbar-transparent-visible');
      opacity = Math.max(Math.min(opacity, 1), 0);

      if (notTransparent && opacity === 1 || !notTransparent && opacity === 0) {
        $navbarEl.find('.navbar-bg, .title').css('opacity', '');
        return;
      }

      if (notTransparent && opacity === 0) {
        $navbarEl.trigger('navbar:transparenthide');
        app.emit('navbarTransparentHide', $navbarEl[0]);
        $navbarEl.removeClass('navbar-transparent-visible');
        $navbarEl.find('.navbar-bg, .title').css('opacity', '');
        return;
      }

      if (!notTransparent && opacity === 1) {
        $navbarEl.trigger('navbar:transparentshow');
        app.emit('navbarTransparentShow', $navbarEl[0]);
        $navbarEl.addClass('navbar-transparent-visible');
        $navbarEl.find('.navbar-bg, .title').css('opacity', '');
        return;
      }

      $navbarEl.find('.navbar-bg, .title').css('opacity', opacity);

      if (snapPageScrollToTransparentNavbar) {
        if (!support.touch) {
          clearTimeout(scrollTimeoutId);
          scrollTimeoutId = setTimeout(function () {
            snapTransparentNavbar();
          }, desktopSnapTimeout);
        } else if (touchEndTimeoutId) {
          clearTimeout(touchEndTimeoutId);
          touchEndTimeoutId = null;
          touchEndTimeoutId = setTimeout(function () {
            snapTransparentNavbar();
            clearTimeout(touchEndTimeoutId);
            touchEndTimeoutId = null;
          }, touchSnapTimeout);
        }
      }
    }

    var previousCollapseProgress = null;
    var collapseProgress = null;

    function handleLargeNavbarCollapse() {
      var isHidden = $navbarEl.hasClass('navbar-hidden') || $navbarEl.parent('.navbars').hasClass('navbar-hidden');
      if (isHidden) return;
      var isLargeTransparent = $navbarEl.hasClass('navbar-large-transparent') || $navbarEl.hasClass('navbar-large') && $navbarEl.hasClass('navbar-transparent');
      previousCollapseProgress = collapseProgress;
      collapseProgress = Math.min(Math.max(currentScrollTop / navbarTitleLargeHeight, 0), 1);
      var previousCollapseWasInMiddle = previousCollapseProgress > 0 && previousCollapseProgress < 1;
      var inSearchbarExpanded = $navbarEl.hasClass('with-searchbar-expandable-enabled');
      if (inSearchbarExpanded) return;
      navbarCollapsed = $navbarEl.hasClass('navbar-large-collapsed');

      if (collapseProgress === 0 && navbarCollapsed) {
        app.navbar.expandLargeTitle($navbarEl[0]);
      } else if (collapseProgress === 1 && !navbarCollapsed) {
        app.navbar.collapseLargeTitle($navbarEl[0]);
      }

      if (collapseProgress === 0 && navbarCollapsed || collapseProgress === 0 && previousCollapseWasInMiddle || collapseProgress === 1 && !navbarCollapsed || collapseProgress === 1 && previousCollapseWasInMiddle) {
        if (app.theme === 'md') {
          $navbarEl.find('.navbar-inner').css('overflow', '');
        }

        $navbarEl.find('.title').css('opacity', '');
        $navbarEl.find('.title-large-text, .subnavbar').css('transform', '');

        if (isLargeTransparent) {
          $navbarEl.find('.navbar-bg').css('opacity', '');
        } else {
          $navbarEl.find('.navbar-bg').css('transform', '');
        }
      } else if (collapseProgress > 0 && collapseProgress < 1) {
        if (app.theme === 'md') {
          $navbarEl.find('.navbar-inner').css('overflow', 'visible');
        }

        $navbarEl.find('.title').css('opacity', collapseProgress);
        $navbarEl.find('.title-large-text, .subnavbar').css('transform', "translate3d(0px, " + -1 * collapseProgress * navbarTitleLargeHeight + "px, 0)");

        if (isLargeTransparent) {
          $navbarEl.find('.navbar-bg').css('opacity', collapseProgress);
        } else {
          $navbarEl.find('.navbar-bg').css('transform', "translate3d(0px, " + -1 * collapseProgress * navbarTitleLargeHeight + "px, 0)");
        }
      }

      if (snapPageScrollToLargeTitle) {
        if (!support.touch) {
          clearTimeout(scrollTimeoutId);
          scrollTimeoutId = setTimeout(function () {
            snapLargeNavbar();
          }, desktopSnapTimeout);
        } else if (touchEndTimeoutId) {
          clearTimeout(touchEndTimeoutId);
          touchEndTimeoutId = null;
          touchEndTimeoutId = setTimeout(function () {
            snapLargeNavbar();
            clearTimeout(touchEndTimeoutId);
            touchEndTimeoutId = null;
          }, touchSnapTimeout);
        }
      }
    }

    function handleTitleHideShow() {
      if ($pageEl.hasClass('page-with-card-opened')) return;
      scrollHeight = scrollContent.scrollHeight;
      offsetHeight = scrollContent.offsetHeight;
      reachEnd = currentScrollTop + offsetHeight >= scrollHeight;
      navbarHidden = $navbarEl.hasClass('navbar-hidden') || $navbarEl.parent('.navbars').hasClass('navbar-hidden');

      if (reachEnd) {
        if (app.params.navbar.showOnPageScrollEnd) {
          action = 'show';
        }
      } else if (previousScrollTop > currentScrollTop) {
        if (app.params.navbar.showOnPageScrollTop || currentScrollTop <= navbarHideHeight) {
          action = 'show';
        } else {
          action = 'hide';
        }
      } else if (currentScrollTop > navbarHideHeight) {
        action = 'hide';
      } else {
        action = 'show';
      }

      if (action === 'show' && navbarHidden) {
        app.navbar.show($navbarEl, true, true);
        navbarHidden = false;
      } else if (action === 'hide' && !navbarHidden) {
        app.navbar.hide($navbarEl, true, false, true);
        navbarHidden = true;
      }

      previousScrollTop = currentScrollTop;
    }

    function handleScroll(e) {
      scrollContent = this;

      if (e && e.target && e.target !== scrollContent) {
        return;
      }

      currentScrollTop = scrollContent.scrollTop;
      scrollChanged = currentScrollTop;

      if (needCollapse) {
        handleLargeNavbarCollapse();
      } else if (needTransparent) {
        handleNavbarTransparent();
      }

      if ($pageEl.hasClass('page-previous')) return;

      if (needHide) {
        handleTitleHideShow();
      }
    }

    function handeTouchStart() {
      scrollChanged = false;
    }

    function handleTouchEnd() {
      clearTimeout(touchEndTimeoutId);
      touchEndTimeoutId = null;
      touchEndTimeoutId = setTimeout(function () {
        if (scrollChanged !== false) {
          if (needTransparent && !needCollapse) {
            snapTransparentNavbar();
          } else {
            snapLargeNavbar();
          }

          clearTimeout(touchEndTimeoutId);
          touchEndTimeoutId = null;
        }
      }, touchSnapTimeout);
    }

    $pageEl.on('scroll', '.page-content', handleScroll, true);

    if (support.touch && (needCollapse && snapPageScrollToLargeTitle || needTransparent && snapPageScrollToTransparentNavbar)) {
      app.on('touchstart:passive', handeTouchStart);
      app.on('touchend:passive', handleTouchEnd);
    }

    if (needCollapse) {
      $pageEl.find('.page-content').each(function (pageContentEl) {
        if (pageContentEl.scrollTop > 0) handleScroll.call(pageContentEl);
      });
    } else if (needTransparent) {
      $pageEl.find('.page-content').each(function (pageContentEl) {
        if (pageContentEl.scrollTop > 0) handleScroll.call(pageContentEl);
      });
    }

    $pageEl[0].f7DetachNavbarScrollHandlers = function f7DetachNavbarScrollHandlers() {
      delete $pageEl[0].f7DetachNavbarScrollHandlers;
      $pageEl.off('scroll', '.page-content', handleScroll, true);

      if (support.touch && (needCollapse && snapPageScrollToLargeTitle || needTransparent && snapPageScrollToTransparentNavbar)) {
        app.off('touchstart:passive', handeTouchStart);
        app.off('touchend:passive', handleTouchEnd);
      }
    };
  }
};
var _default = {
  name: 'navbar',
  create: function create() {
    var app = this;
    (0, _utils.bindMethods)(app, {
      navbar: Navbar
    });
  },
  params: {
    navbar: {
      scrollTopOnTitleClick: true,
      iosCenterTitle: true,
      mdCenterTitle: false,
      auroraCenterTitle: true,
      hideOnPageScroll: false,
      showOnPageScrollEnd: true,
      showOnPageScrollTop: true,
      collapseLargeTitleOnScroll: true,
      snapPageScrollToLargeTitle: true,
      snapPageScrollToTransparentNavbar: true
    }
  },
  on: {
    'panelBreakpoint panelCollapsedBreakpoint panelResize viewResize resize viewMasterDetailBreakpoint': function onPanelResize() {
      var app = this;
      (0, _dom.default)('.navbar').each(function (navbarEl) {
        app.navbar.size(navbarEl);
      });
    },
    pageBeforeRemove: function pageBeforeRemove(page) {
      if (page.$el[0].f7DetachNavbarScrollHandlers) {
        page.$el[0].f7DetachNavbarScrollHandlers();
      }
    },
    pageBeforeIn: function pageBeforeIn(page) {
      var app = this;
      if (app.theme !== 'ios') return;
      var $navbarsEl;
      var view = page.$el.parents('.view')[0].f7View;
      var navbarEl = app.navbar.getElByPage(page);

      if (!navbarEl) {
        $navbarsEl = page.$el.parents('.view').children('.navbars');
      } else {
        $navbarsEl = (0, _dom.default)(navbarEl).parents('.navbars');
      }

      if (page.$el.hasClass('no-navbar') || view.router.dynamicNavbar && !navbarEl) {
        var animate = !!(page.pageFrom && page.router.history.length > 0);
        app.navbar.hide($navbarsEl, animate);
      } else {
        app.navbar.show($navbarsEl);
      }
    },
    pageReinit: function pageReinit(page) {
      var app = this;
      var $navbarEl = (0, _dom.default)(app.navbar.getElByPage(page));
      if (!$navbarEl || $navbarEl.length === 0) return;
      app.navbar.size($navbarEl);
    },
    pageInit: function pageInit(page) {
      var app = this;
      var $navbarEl = (0, _dom.default)(app.navbar.getElByPage(page));
      if (!$navbarEl || $navbarEl.length === 0) return; // Size

      app.navbar.size($navbarEl); // Need Collapse On Scroll

      var needCollapseOnScrollHandler;

      if ($navbarEl.find('.title-large').length > 0) {
        $navbarEl.addClass('navbar-large');
      }

      if ($navbarEl.hasClass('navbar-large')) {
        if (app.params.navbar.collapseLargeTitleOnScroll) needCollapseOnScrollHandler = true;
        page.$el.addClass('page-with-navbar-large');
      } // Need transparent on scroll


      var needTransparentOnScroll;

      if (!needCollapseOnScrollHandler && $navbarEl.hasClass('navbar-transparent')) {
        needTransparentOnScroll = true;
      } // Need Hide On Scroll


      var needHideOnScrollHandler;

      if (app.params.navbar.hideOnPageScroll || page.$el.find('.hide-navbar-on-scroll').length || page.$el.hasClass('hide-navbar-on-scroll') || page.$el.find('.hide-bars-on-scroll').length || page.$el.hasClass('hide-bars-on-scroll')) {
        if (page.$el.find('.keep-navbar-on-scroll').length || page.$el.hasClass('keep-navbar-on-scroll') || page.$el.find('.keep-bars-on-scroll').length || page.$el.hasClass('keep-bars-on-scroll')) {
          needHideOnScrollHandler = false;
        } else {
          needHideOnScrollHandler = true;
        }
      }

      if (needCollapseOnScrollHandler || needHideOnScrollHandler || needTransparentOnScroll) {
        app.navbar.initNavbarOnScroll(page.el, $navbarEl[0], needHideOnScrollHandler, needCollapseOnScrollHandler, needTransparentOnScroll);
      }
    },
    'panelOpen panelSwipeOpen modalOpen': function onPanelModalOpen(instance) {
      var app = this;
      instance.$el.find('.navbar:not(.navbar-previous):not(.stacked)').each(function (navbarEl) {
        app.navbar.size(navbarEl);
      });
    },
    tabShow: function tabShow(tabEl) {
      var app = this;
      (0, _dom.default)(tabEl).find('.navbar:not(.navbar-previous):not(.stacked)').each(function (navbarEl) {
        app.navbar.size(navbarEl);
      });
    }
  },
  clicks: {
    '.navbar .title': function onTitleClick($clickedEl) {
      var app = this;
      if (!app.params.navbar.scrollTopOnTitleClick) return;

      if ($clickedEl.closest('a').length > 0) {
        return;
      }

      var $pageContentEl; // Find active page

      var $navbarEl = $clickedEl.parents('.navbar');
      var $navbarsEl = $navbarEl.parents('.navbars'); // Static Layout

      $pageContentEl = $navbarEl.parents('.page-content');

      if ($pageContentEl.length === 0) {
        // Fixed Layout
        if ($navbarEl.parents('.page').length > 0) {
          $pageContentEl = $navbarEl.parents('.page').find('.page-content');
        } // Through Layout iOS


        if ($pageContentEl.length === 0 && $navbarsEl.length) {
          if ($navbarsEl.nextAll('.page-current:not(.stacked)').length > 0) {
            $pageContentEl = $navbarsEl.nextAll('.page-current:not(.stacked)').find('.page-content');
          }
        } // Through Layout


        if ($pageContentEl.length === 0) {
          if ($navbarEl.nextAll('.page-current:not(.stacked)').length > 0) {
            $pageContentEl = $navbarEl.nextAll('.page-current:not(.stacked)').find('.page-content');
          }
        }
      }

      if ($pageContentEl && $pageContentEl.length > 0) {
        // Check for tab
        if ($pageContentEl.hasClass('tab')) {
          $pageContentEl = $pageContentEl.parent('.tabs').children('.page-content.tab-active');
        }

        if ($pageContentEl.length > 0) $pageContentEl.scrollTop(0, 300);
      }
    }
  },
  vnode: {
    navbar: {
      postpatch: function postpatch(vnode) {
        var app = this;
        app.navbar.size(vnode.elm);
      }
    }
  }
};
exports.default = _default;