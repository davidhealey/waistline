function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/* eslint "no-useless-escape": "off" */
import $ from '../../shared/dom7';
import { extend, id, nextTick, deleteProps, iosPreloaderContent, mdPreloaderContent, auroraPreloaderContent } from '../../shared/utils';
import { getDevice } from '../../shared/get-device';
import Framework7Class from '../../shared/class';
/** @jsx $jsx */

import $jsx from '../../shared/$jsx';

var Autocomplete = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(Autocomplete, _Framework7Class);

  function Autocomplete(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var ac = _assertThisInitialized(_this);

    ac.app = app;
    var device = getDevice();
    var defaults = extend({
      on: {}
    }, app.params.autocomplete);

    if (typeof defaults.searchbarDisableButton === 'undefined') {
      defaults.searchbarDisableButton = app.theme !== 'aurora';
    } // Extend defaults with modules params


    ac.useModulesParams(defaults);
    ac.params = extend(defaults, params);
    var $openerEl;

    if (ac.params.openerEl) {
      $openerEl = $(ac.params.openerEl);
      if ($openerEl.length) $openerEl[0].f7Autocomplete = ac;
    }

    var $inputEl;

    if (ac.params.inputEl) {
      $inputEl = $(ac.params.inputEl);
      if ($inputEl.length) $inputEl[0].f7Autocomplete = ac;
    }

    var uniqueId = id();
    var url = params.url;

    if (!url && $openerEl && $openerEl.length) {
      if ($openerEl.attr('href')) url = $openerEl.attr('href');else if ($openerEl.find('a').length > 0) {
        url = $openerEl.find('a').attr('href');
      }
    }

    if (!url || url === '#' || url === '') url = ac.params.url;
    var inputType = ac.params.multiple ? 'checkbox' : 'radio';
    extend(ac, {
      $openerEl: $openerEl,
      openerEl: $openerEl && $openerEl[0],
      $inputEl: $inputEl,
      inputEl: $inputEl && $inputEl[0],
      id: uniqueId,
      url: url,
      value: ac.params.value || [],
      inputType: inputType,
      inputName: inputType + "-" + uniqueId,
      $modalEl: undefined,
      $dropdownEl: undefined
    });
    var previousQuery = '';

    function onInputChange() {
      var query = ac.$inputEl.val().trim();
      if (!ac.params.source) return;
      ac.params.source.call(ac, query, function (items) {
        var itemsHTML = '';
        var limit = ac.params.limit ? Math.min(ac.params.limit, items.length) : items.length;
        ac.items = items;
        var regExp;

        if (ac.params.highlightMatches) {
          query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
          regExp = new RegExp("(" + query + ")", 'i');
        }

        var firstValue;
        var firstItem;

        for (var i = 0; i < limit; i += 1) {
          var itemValue = typeof items[i] === 'object' ? items[i][ac.params.valueProperty] : items[i];
          var itemText = typeof items[i] === 'object' ? items[i][ac.params.textProperty] : items[i];

          if (i === 0) {
            firstValue = itemValue;
            firstItem = ac.items[i];
          }

          itemsHTML += ac.renderItem({
            value: itemValue,
            text: ac.params.highlightMatches ? itemText.replace(regExp, '<b>$1</b>') : itemText
          }, i);
        }

        if (itemsHTML === '' && query === '' && ac.params.dropdownPlaceholderText) {
          itemsHTML += ac.renderItem({
            placeholder: true,
            text: ac.params.dropdownPlaceholderText
          });
        }

        ac.$dropdownEl.find('ul').html(itemsHTML);

        if (ac.params.typeahead) {
          if (!firstValue || !firstItem) {
            return;
          }

          if (firstValue.toLowerCase().indexOf(query.toLowerCase()) !== 0) {
            return;
          }

          if (previousQuery.toLowerCase() === query.toLowerCase()) {
            ac.value = [];
            return;
          }

          if (previousQuery.toLowerCase().indexOf(query.toLowerCase()) === 0) {
            previousQuery = query;
            ac.value = [];
            return;
          }

          $inputEl.val(firstValue);
          $inputEl[0].setSelectionRange(query.length, firstValue.length);
          var previousValue = typeof ac.value[0] === 'object' ? ac.value[0][ac.params.valueProperty] : ac.value[0];

          if (!previousValue || firstValue.toLowerCase() !== previousValue.toLowerCase()) {
            ac.value = [firstItem];
            ac.emit('local::change autocompleteChange', [firstItem]);
          }
        }

        previousQuery = query;
      });
    }

    function onPageInputChange() {
      var inputEl = this;
      var value = inputEl.value;
      var isValues = $(inputEl).parents('.autocomplete-values').length > 0;
      var item;
      var itemValue;
      var aValue;

      if (isValues) {
        if (ac.inputType === 'checkbox' && !inputEl.checked) {
          for (var i = 0; i < ac.value.length; i += 1) {
            aValue = typeof ac.value[i] === 'string' ? ac.value[i] : ac.value[i][ac.params.valueProperty];

            if (aValue === value || aValue * 1 === value * 1) {
              ac.value.splice(i, 1);
            }
          }

          ac.updateValues();
          ac.emit('local::change autocompleteChange', ac.value);
        }

        return;
      } // Find Related Item


      for (var _i = 0; _i < ac.items.length; _i += 1) {
        itemValue = typeof ac.items[_i] === 'object' ? ac.items[_i][ac.params.valueProperty] : ac.items[_i];
        if (itemValue === value || itemValue * 1 === value * 1) item = ac.items[_i];
      }

      if (ac.inputType === 'radio') {
        ac.value = [item];
      } else if (inputEl.checked) {
        ac.value.push(item);
      } else {
        for (var _i2 = 0; _i2 < ac.value.length; _i2 += 1) {
          aValue = typeof ac.value[_i2] === 'object' ? ac.value[_i2][ac.params.valueProperty] : ac.value[_i2];

          if (aValue === value || aValue * 1 === value * 1) {
            ac.value.splice(_i2, 1);
          }
        }
      } // Update Values Block


      ac.updateValues(); // On Select Callback

      if (ac.inputType === 'radio' && inputEl.checked || ac.inputType === 'checkbox') {
        ac.emit('local::change autocompleteChange', ac.value);
      }
    }

    function onHtmlClick(e) {
      var $targetEl = $(e.target);
      if ($targetEl.is(ac.$inputEl[0]) || ac.$dropdownEl && $targetEl.closest(ac.$dropdownEl[0]).length) return;
      ac.close();
    }

    function onOpenerClick() {
      ac.open();
    }

    function onInputFocus() {
      ac.open();
    }

    function onInputBlur() {
      if (ac.$dropdownEl.find('label.active-state').length > 0) return;
      setTimeout(function () {
        ac.close();
      }, 0);
    }

    function onResize() {
      ac.positionDropdown();
    }

    function onKeyDown(e) {
      if (!ac.opened) return;

      if (e.keyCode === 27) {
        // ESC
        e.preventDefault();
        ac.$inputEl.blur();
        return;
      }

      if (e.keyCode === 13) {
        // Enter
        var $selectedItemLabel = ac.$dropdownEl.find('.autocomplete-dropdown-selected label');

        if ($selectedItemLabel.length) {
          e.preventDefault();
          $selectedItemLabel.trigger('click');
          ac.$inputEl.blur();
          return;
        }

        if (ac.params.typeahead) {
          e.preventDefault();
          ac.$inputEl.blur();
        }

        return;
      }

      if (e.keyCode !== 40 && e.keyCode !== 38) return;
      e.preventDefault();
      var $selectedItem = ac.$dropdownEl.find('.autocomplete-dropdown-selected');
      var $newItem;

      if ($selectedItem.length) {
        $newItem = $selectedItem[e.keyCode === 40 ? 'next' : 'prev']('li');

        if (!$newItem.length) {
          $newItem = ac.$dropdownEl.find('li').eq(e.keyCode === 40 ? 0 : ac.$dropdownEl.find('li').length - 1);
        }
      } else {
        $newItem = ac.$dropdownEl.find('li').eq(e.keyCode === 40 ? 0 : ac.$dropdownEl.find('li').length - 1);
      }

      if ($newItem.hasClass('autocomplete-dropdown-placeholder')) return;
      $selectedItem.removeClass('autocomplete-dropdown-selected');
      $newItem.addClass('autocomplete-dropdown-selected');
    }

    function onDropdownClick() {
      var $clickedEl = $(this);
      var clickedItem;

      for (var i = 0; i < ac.items.length; i += 1) {
        var itemValue = typeof ac.items[i] === 'object' ? ac.items[i][ac.params.valueProperty] : ac.items[i];
        var value = $clickedEl.attr('data-value');

        if (itemValue === value || itemValue * 1 === value * 1) {
          clickedItem = ac.items[i];
        }
      }

      if (ac.params.updateInputValueOnSelect) {
        ac.$inputEl.val(typeof clickedItem === 'object' ? clickedItem[ac.params.valueProperty] : clickedItem);
        ac.$inputEl.trigger('input change');
      }

      ac.value = [clickedItem];
      ac.emit('local::change autocompleteChange', [clickedItem]);
      ac.close();
    }

    ac.attachEvents = function attachEvents() {
      if (ac.params.openIn !== 'dropdown' && ac.$openerEl) {
        ac.$openerEl.on('click', onOpenerClick);
      }

      if (ac.params.openIn === 'dropdown' && ac.$inputEl) {
        ac.$inputEl.on('focus', onInputFocus);
        ac.$inputEl.on(ac.params.inputEvents, onInputChange);

        if (device.android) {
          $('html').on('click', onHtmlClick);
        } else {
          ac.$inputEl.on('blur', onInputBlur);
        }

        ac.$inputEl.on('keydown', onKeyDown);
      }
    };

    ac.detachEvents = function attachEvents() {
      if (ac.params.openIn !== 'dropdown' && ac.$openerEl) {
        ac.$openerEl.off('click', onOpenerClick);
      }

      if (ac.params.openIn === 'dropdown' && ac.$inputEl) {
        ac.$inputEl.off('focus', onInputFocus);
        ac.$inputEl.off(ac.params.inputEvents, onInputChange);

        if (device.android) {
          $('html').off('click', onHtmlClick);
        } else {
          ac.$inputEl.off('blur', onInputBlur);
        }

        ac.$inputEl.off('keydown', onKeyDown);
      }
    };

    ac.attachDropdownEvents = function attachDropdownEvents() {
      ac.$dropdownEl.on('click', 'label', onDropdownClick);
      app.on('resize', onResize);
    };

    ac.detachDropdownEvents = function detachDropdownEvents() {
      ac.$dropdownEl.off('click', 'label', onDropdownClick);
      app.off('resize', onResize);
    };

    ac.attachPageEvents = function attachPageEvents() {
      ac.$el.on('change', 'input[type="radio"], input[type="checkbox"]', onPageInputChange);

      if (ac.params.closeOnSelect && !ac.params.multiple) {
        ac.$el.once('click', '.list label', function () {
          nextTick(function () {
            ac.close();
          });
        });
      }
    };

    ac.detachPageEvents = function detachPageEvents() {
      ac.$el.off('change', 'input[type="radio"], input[type="checkbox"]', onPageInputChange);
    }; // Install Modules


    ac.useModules(); // Init

    ac.init();
    return ac || _assertThisInitialized(_this);
  }

  var _proto = Autocomplete.prototype;

  _proto.positionDropdown = function positionDropdown() {
    var _$dropdownEl$children;

    var ac = this;
    var $inputEl = ac.$inputEl,
        app = ac.app,
        $dropdownEl = ac.$dropdownEl;
    var $pageContentEl = $inputEl.parents('.page-content');
    if ($pageContentEl.length === 0) return;
    var inputOffset = $inputEl.offset();
    var inputOffsetWidth = $inputEl[0].offsetWidth;
    var inputOffsetHeight = $inputEl[0].offsetHeight;
    var $listEl = $inputEl.parents('.list');
    var $listParent;
    $listEl.parents().each(function (parentEl) {
      if ($listParent) return;
      var $parentEl = $(parentEl);
      if ($parentEl.parent($pageContentEl).length) $listParent = $parentEl;
    });
    var listOffset = $listEl.offset();
    var paddingBottom = parseInt($pageContentEl.css('padding-bottom'), 10);
    var listOffsetLeft = $listEl.length > 0 ? listOffset.left - $pageContentEl.offset().left : 0;
    var inputOffsetLeft = inputOffset.left - ($listEl.length > 0 ? listOffset.left : 0) - (app.rtl ? 0 : 0);
    var inputOffsetTop = inputOffset.top - ($pageContentEl.offset().top - $pageContentEl[0].scrollTop);
    var maxHeight = $pageContentEl[0].scrollHeight - paddingBottom - (inputOffsetTop + $pageContentEl[0].scrollTop) - $inputEl[0].offsetHeight;
    var paddingProp = app.rtl ? 'padding-right' : 'padding-left';
    var paddingValue;

    if ($listEl.length && !ac.params.expandInput) {
      paddingValue = (app.rtl ? $listEl[0].offsetWidth - inputOffsetLeft - inputOffsetWidth : inputOffsetLeft) - (app.theme === 'md' ? 16 : 15);
    }

    $dropdownEl.css({
      left: ($listEl.length > 0 ? listOffsetLeft : inputOffsetLeft) + "px",
      top: inputOffsetTop + $pageContentEl[0].scrollTop + inputOffsetHeight + "px",
      width: ($listEl.length > 0 ? $listEl[0].offsetWidth : inputOffsetWidth) + "px"
    });
    $dropdownEl.children('.autocomplete-dropdown-inner').css((_$dropdownEl$children = {
      maxHeight: maxHeight + "px"
    }, _$dropdownEl$children[paddingProp] = $listEl.length > 0 && !ac.params.expandInput ? paddingValue + "px" : '', _$dropdownEl$children));
  };

  _proto.focus = function focus() {
    var ac = this;
    ac.$el.find('input[type=search]').focus();
  };

  _proto.source = function source(query) {
    var ac = this;
    if (!ac.params.source) return;
    var $el = ac.$el;
    ac.params.source.call(ac, query, function (items) {
      var itemsHTML = '';
      var limit = ac.params.limit ? Math.min(ac.params.limit, items.length) : items.length;
      ac.items = items;

      for (var i = 0; i < limit; i += 1) {
        var selected = false;
        var itemValue = typeof items[i] === 'object' ? items[i][ac.params.valueProperty] : items[i];

        for (var j = 0; j < ac.value.length; j += 1) {
          var aValue = typeof ac.value[j] === 'object' ? ac.value[j][ac.params.valueProperty] : ac.value[j];
          if (aValue === itemValue || aValue * 1 === itemValue * 1) selected = true;
        }

        itemsHTML += ac.renderItem({
          value: itemValue,
          text: typeof items[i] === 'object' ? items[i][ac.params.textProperty] : items[i],
          inputType: ac.inputType,
          id: ac.id,
          inputName: ac.inputName,
          selected: selected
        }, i);
      }

      $el.find('.autocomplete-found ul').html(itemsHTML);

      if (items.length === 0) {
        if (query.length !== 0) {
          $el.find('.autocomplete-not-found').show();
          $el.find('.autocomplete-found, .autocomplete-values').hide();
        } else {
          $el.find('.autocomplete-values').show();
          $el.find('.autocomplete-found, .autocomplete-not-found').hide();
        }
      } else {
        $el.find('.autocomplete-found').show();
        $el.find('.autocomplete-not-found, .autocomplete-values').hide();
      }
    });
  };

  _proto.updateValues = function updateValues() {
    var ac = this;
    var valuesHTML = '';

    for (var i = 0; i < ac.value.length; i += 1) {
      valuesHTML += ac.renderItem({
        value: typeof ac.value[i] === 'object' ? ac.value[i][ac.params.valueProperty] : ac.value[i],
        text: typeof ac.value[i] === 'object' ? ac.value[i][ac.params.textProperty] : ac.value[i],
        inputType: ac.inputType,
        id: ac.id,
        inputName: ac.inputName + "-checked}",
        selected: true
      }, i);
    }

    ac.$el.find('.autocomplete-values ul').html(valuesHTML);
  };

  _proto.preloaderHide = function preloaderHide() {
    var ac = this;

    if (ac.params.openIn === 'dropdown' && ac.$dropdownEl) {
      ac.$dropdownEl.find('.autocomplete-preloader').removeClass('autocomplete-preloader-visible');
    } else {
      $('.autocomplete-preloader').removeClass('autocomplete-preloader-visible');
    }
  };

  _proto.preloaderShow = function preloaderShow() {
    var ac = this;

    if (ac.params.openIn === 'dropdown' && ac.$dropdownEl) {
      ac.$dropdownEl.find('.autocomplete-preloader').addClass('autocomplete-preloader-visible');
    } else {
      $('.autocomplete-preloader').addClass('autocomplete-preloader-visible');
    }
  };

  _proto.renderPreloader = function renderPreloader() {
    var ac = this;
    var preloaders = {
      iosPreloaderContent: iosPreloaderContent,
      mdPreloaderContent: mdPreloaderContent,
      auroraPreloaderContent: auroraPreloaderContent
    };
    return $jsx("div", {
      class: "autocomplete-preloader preloader " + (ac.params.preloaderColor ? "color-" + ac.params.preloaderColor : '')
    }, preloaders[ac.app.theme + "PreloaderContent"] || '');
  };

  _proto.renderSearchbar = function renderSearchbar() {
    var ac = this;
    if (ac.params.renderSearchbar) return ac.params.renderSearchbar.call(ac);
    return $jsx("form", {
      class: "searchbar"
    }, $jsx("div", {
      class: "searchbar-inner"
    }, $jsx("div", {
      class: "searchbar-input-wrap"
    }, $jsx("input", {
      type: "search",
      spellcheck: ac.params.searchbarSpellcheck || 'false',
      placeholder: ac.params.searchbarPlaceholder
    }), $jsx("i", {
      class: "searchbar-icon"
    }), $jsx("span", {
      class: "input-clear-button"
    })), ac.params.searchbarDisableButton && $jsx("span", {
      class: "searchbar-disable-button"
    }, ac.params.searchbarDisableText)));
  };

  _proto.renderItem = function renderItem(item, index) {
    var ac = this;
    if (ac.params.renderItem) return ac.params.renderItem.call(ac, item, index);
    var itemValue = item.value && typeof item.value === 'string' ? item.value.replace(/"/g, '&quot;') : item.value;

    if (ac.params.openIn !== 'dropdown') {
      return $jsx("li", null, $jsx("label", {
        class: "item-" + item.inputType + " item-content"
      }, $jsx("input", {
        type: item.inputType,
        name: item.inputName,
        value: itemValue,
        _checked: item.selected
      }), $jsx("i", {
        class: "icon icon-" + item.inputType
      }), $jsx("div", {
        class: "item-inner"
      }, $jsx("div", {
        class: "item-title"
      }, item.text))));
    } // Dropdown


    if (!item.placeholder) {
      return $jsx("li", null, $jsx("label", {
        class: "item-radio item-content",
        "data-value": itemValue
      }, $jsx("div", {
        class: "item-inner"
      }, $jsx("div", {
        class: "item-title"
      }, item.text))));
    } // Dropwdown placeholder


    return $jsx("li", {
      class: "autocomplete-dropdown-placeholder"
    }, $jsx("label", {
      class: "item-content"
    }, $jsx("div", {
      class: "item-inner"
    }, $jsx("div", {
      class: "item-title"
    }, item.text))));
  };

  _proto.renderNavbar = function renderNavbar() {
    var ac = this;
    if (ac.params.renderNavbar) return ac.params.renderNavbar.call(ac);
    var pageTitle = ac.params.pageTitle;

    if (typeof pageTitle === 'undefined' && ac.$openerEl && ac.$openerEl.length) {
      pageTitle = ac.$openerEl.find('.item-title').text().trim();
    }

    var inPopup = ac.params.openIn === 'popup'; // eslint-disable-next-line

    var navbarLeft = inPopup ? ac.params.preloader && $jsx("div", {
      class: "left"
    }, ac.renderPreloader()) : $jsx("div", {
      class: "left sliding"
    }, $jsx("a", {
      class: "link back"
    }, $jsx("i", {
      class: "icon icon-back"
    }), $jsx("span", {
      class: "if-not-md"
    }, ac.params.pageBackLinkText)));
    var navbarRight = inPopup ? $jsx("div", {
      class: "right"
    }, $jsx("a", {
      class: "link popup-close",
      "data-popup": ".autocomplete-popup"
    }, ac.params.popupCloseLinkText)) : ac.params.preloader && $jsx("div", {
      class: "right"
    }, ac.renderPreloader());
    return $jsx("div", {
      class: "navbar " + (ac.params.navbarColorTheme ? "color-" + ac.params.navbarColorTheme : '')
    }, $jsx("div", {
      class: "navbar-bg"
    }), $jsx("div", {
      class: "navbar-inner " + (ac.params.navbarColorTheme ? "color-" + ac.params.navbarColorTheme : '')
    }, navbarLeft, pageTitle && $jsx("div", {
      class: "title sliding"
    }, pageTitle), navbarRight, $jsx("div", {
      class: "subnavbar sliding"
    }, ac.renderSearchbar())));
  };

  _proto.renderDropdown = function renderDropdown() {
    var ac = this;
    if (ac.params.renderDropdown) return ac.params.renderDropdown.call(ac, ac.items);
    return $jsx("div", {
      class: "autocomplete-dropdown"
    }, $jsx("div", {
      class: "autocomplete-dropdown-inner"
    }, $jsx("div", {
      class: "list " + (!ac.params.expandInput ? 'no-safe-areas' : '')
    }, $jsx("ul", null))), ac.params.preloader && ac.renderPreloader());
  };

  _proto.renderPage = function renderPage(inPopup) {
    var ac = this;
    if (ac.params.renderPage) return ac.params.renderPage.call(ac, ac.items);
    return $jsx("div", {
      class: "page page-with-subnavbar autocomplete-page",
      "data-name": "autocomplete-page"
    }, ac.renderNavbar(inPopup), $jsx("div", {
      class: "searchbar-backdrop"
    }), $jsx("div", {
      class: "page-content"
    }, $jsx("div", {
      class: "list autocomplete-list autocomplete-found autocomplete-list-" + ac.id + " " + (ac.params.formColorTheme ? "color-" + ac.params.formColorTheme : '')
    }, $jsx("ul", null)), $jsx("div", {
      class: "list autocomplete-not-found"
    }, $jsx("ul", null, $jsx("li", {
      class: "item-content"
    }, $jsx("div", {
      class: "item-inner"
    }, $jsx("div", {
      class: "item-title"
    }, ac.params.notFoundText))))), $jsx("div", {
      class: "list autocomplete-values"
    }, $jsx("ul", null))));
  };

  _proto.renderPopup = function renderPopup() {
    var ac = this;
    if (ac.params.renderPopup) return ac.params.renderPopup.call(ac, ac.items);
    return $jsx("div", {
      class: "popup autocomplete-popup"
    }, $jsx("div", {
      class: "view"
    }, ac.renderPage(true), ";"));
  };

  _proto.onOpen = function onOpen(type, el) {
    var ac = this;
    var app = ac.app;
    var $el = $(el);
    ac.$el = $el;
    ac.el = $el[0];
    ac.openedIn = type;
    ac.opened = true;

    if (ac.params.openIn === 'dropdown') {
      ac.attachDropdownEvents();
      ac.$dropdownEl.addClass('autocomplete-dropdown-in');
      ac.$inputEl.trigger('input');
    } else {
      // Init SB
      var $searchbarEl = $el.find('.searchbar');

      if (ac.params.openIn === 'page' && app.theme === 'ios' && $searchbarEl.length === 0) {
        $searchbarEl = $(app.navbar.getElByPage($el)).find('.searchbar');
      }

      ac.searchbar = app.searchbar.create({
        el: $searchbarEl,
        backdropEl: $el.find('.searchbar-backdrop'),
        customSearch: true,
        on: {
          search: function search(sb, query) {
            if (query.length === 0 && ac.searchbar.enabled) {
              ac.searchbar.backdropShow();
            } else {
              ac.searchbar.backdropHide();
            }

            ac.source(query);
          }
        }
      }); // Attach page events

      ac.attachPageEvents(); // Update Values On Page Init

      ac.updateValues(); // Source on load

      if (ac.params.requestSourceOnOpen) ac.source('');
    }

    ac.emit('local::open autocompleteOpen', ac);
  };

  _proto.autoFocus = function autoFocus() {
    var ac = this;

    if (ac.searchbar && ac.searchbar.$inputEl) {
      ac.searchbar.$inputEl.focus();
    }

    return ac;
  };

  _proto.onOpened = function onOpened() {
    var ac = this;

    if (ac.params.openIn !== 'dropdown' && ac.params.autoFocus) {
      ac.autoFocus();
    }

    ac.emit('local::opened autocompleteOpened', ac);
  };

  _proto.onClose = function onClose() {
    var ac = this;
    if (ac.destroyed) return; // Destroy SB

    if (ac.searchbar && ac.searchbar.destroy) {
      ac.searchbar.destroy();
      ac.searchbar = null;
      delete ac.searchbar;
    }

    if (ac.params.openIn === 'dropdown') {
      ac.detachDropdownEvents();
      ac.$dropdownEl.removeClass('autocomplete-dropdown-in').remove();
      ac.$inputEl.parents('.item-content-dropdown-expanded').removeClass('item-content-dropdown-expanded');
    } else {
      ac.detachPageEvents();
    }

    ac.emit('local::close autocompleteClose', ac);
  };

  _proto.onClosed = function onClosed() {
    var ac = this;
    if (ac.destroyed) return;
    ac.opened = false;
    ac.$el = null;
    ac.el = null;
    delete ac.$el;
    delete ac.el;
    ac.emit('local::closed autocompleteClosed', ac);
  };

  _proto.openPage = function openPage() {
    var ac = this;
    if (ac.opened) return ac;
    var pageHtml = ac.renderPage();
    ac.view.router.navigate({
      url: ac.url,
      route: {
        content: pageHtml,
        path: ac.url,
        on: {
          pageBeforeIn: function pageBeforeIn(e, page) {
            ac.onOpen('page', page.el);
          },
          pageAfterIn: function pageAfterIn(e, page) {
            ac.onOpened('page', page.el);
          },
          pageBeforeOut: function pageBeforeOut(e, page) {
            ac.onClose('page', page.el);
          },
          pageAfterOut: function pageAfterOut(e, page) {
            ac.onClosed('page', page.el);
          }
        },
        options: {
          animate: ac.params.animate
        }
      }
    });
    return ac;
  };

  _proto.openPopup = function openPopup() {
    var ac = this;
    if (ac.opened) return ac;
    var popupHtml = ac.renderPopup();
    var popupParams = {
      content: popupHtml,
      animate: ac.params.animate,
      push: ac.params.popupPush,
      swipeToClose: ac.params.popupSwipeToClose,
      on: {
        popupOpen: function popupOpen(popup) {
          ac.onOpen('popup', popup.el);
        },
        popupOpened: function popupOpened(popup) {
          ac.onOpened('popup', popup.el);
        },
        popupClose: function popupClose(popup) {
          ac.onClose('popup', popup.el);
        },
        popupClosed: function popupClosed(popup) {
          ac.onClosed('popup', popup.el);
        }
      }
    };

    if (ac.params.routableModals && ac.view) {
      ac.view.router.navigate({
        url: ac.url,
        route: {
          path: ac.url,
          popup: popupParams
        }
      });
    } else {
      ac.modal = ac.app.popup.create(popupParams).open(ac.params.animate);
    }

    return ac;
  };

  _proto.openDropdown = function openDropdown() {
    var ac = this;

    if (!ac.$dropdownEl) {
      ac.$dropdownEl = $(ac.renderDropdown());
    }

    var $listEl = ac.$inputEl.parents('.list');

    if ($listEl.length && ac.$inputEl.parents('.item-content').length > 0 && ac.params.expandInput) {
      ac.$inputEl.parents('.item-content').addClass('item-content-dropdown-expanded');
    }

    var $pageContentEl = ac.$inputEl.parents('.page-content');

    if (ac.params.dropdownContainerEl) {
      $(ac.params.dropdownContainerEl).append(ac.$dropdownEl);
    } else if ($pageContentEl.length === 0) {
      ac.$dropdownEl.insertAfter(ac.$inputEl);
    } else {
      ac.positionDropdown();
      $pageContentEl.append(ac.$dropdownEl);
    }

    ac.onOpen('dropdown', ac.$dropdownEl);
    ac.onOpened('dropdown', ac.$dropdownEl);
  };

  _proto.open = function open() {
    var ac = this;
    if (ac.opened) return ac;
    var openIn = ac.params.openIn;
    ac["open" + openIn.split('').map(function (el, index) {
      if (index === 0) return el.toUpperCase();
      return el;
    }).join('')]();
    return ac;
  };

  _proto.close = function close() {
    var ac = this;
    if (!ac.opened) return ac;

    if (ac.params.openIn === 'dropdown') {
      ac.onClose();
      ac.onClosed();
    } else if (ac.params.routableModals && ac.view || ac.openedIn === 'page') {
      ac.view.router.back({
        animate: ac.params.animate
      });
    } else {
      ac.modal.once('modalClosed', function () {
        nextTick(function () {
          if (ac.destroyed) return;
          ac.modal.destroy();
          delete ac.modal;
        });
      });
      ac.modal.close();
    }

    return ac;
  };

  _proto.init = function init() {
    var ac = this;
    ac.attachEvents();
  };

  _proto.destroy = function destroy() {
    var ac = this;
    ac.emit('local::beforeDestroy autocompleteBeforeDestroy', ac);
    ac.detachEvents();

    if (ac.$inputEl && ac.$inputEl[0]) {
      delete ac.$inputEl[0].f7Autocomplete;
    }

    if (ac.$openerEl && ac.$openerEl[0]) {
      delete ac.$openerEl[0].f7Autocomplete;
    }

    deleteProps(ac);
    ac.destroyed = true;
  };

  _createClass(Autocomplete, [{
    key: "view",
    get: function get() {
      var ac = this;
      var $openerEl = ac.$openerEl,
          $inputEl = ac.$inputEl,
          app = ac.app;
      var view;

      if (ac.params.view) {
        view = ac.params.view;
      } else if ($openerEl || $inputEl) {
        var $el = $openerEl || $inputEl;
        view = $el.closest('.view').length && $el.closest('.view')[0].f7View;
      }

      if (!view) view = app.views.main;
      return view;
    }
  }]);

  return Autocomplete;
}(Framework7Class);

export default Autocomplete;