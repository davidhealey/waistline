"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

var _class = _interopRequireDefault(require("../../shared/class"));

var _$jsx = _interopRequireDefault(require("../../shared/$jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var SmartSelect = /*#__PURE__*/function (_Framework7Class) {
  _inheritsLoose(SmartSelect, _Framework7Class);

  function SmartSelect(app, params) {
    var _this;

    if (params === void 0) {
      params = {};
    }

    _this = _Framework7Class.call(this, params, [app]) || this;

    var ss = _assertThisInitialized(_this);

    var defaults = (0, _utils.extend)({
      on: {}
    }, app.params.smartSelect);

    if (typeof defaults.searchbarDisableButton === 'undefined') {
      defaults.searchbarDisableButton = app.theme !== 'aurora';
    } // Extend defaults with modules params


    ss.useModulesParams(defaults);
    ss.params = (0, _utils.extend)({}, defaults, params);
    ss.app = app;
    var $el = (0, _dom.default)(ss.params.el).eq(0);
    if ($el.length === 0) return ss || _assertThisInitialized(_this);
    if ($el[0].f7SmartSelect) return $el[0].f7SmartSelect || _assertThisInitialized(_this);
    var $selectEl = $el.find('select').eq(0);
    if ($selectEl.length === 0) return ss || _assertThisInitialized(_this);
    var $valueEl;

    if (ss.params.setValueText) {
      $valueEl = (0, _dom.default)(ss.params.valueEl);

      if ($valueEl.length === 0) {
        $valueEl = $el.find('.item-after');
      }

      if ($valueEl.length === 0) {
        $valueEl = (0, _dom.default)('<div class="item-after"></div>');
        $valueEl.insertAfter($el.find('.item-title'));
      }
    } // Url


    var url = params.url;

    if (!url) {
      if ($el.attr('href') && $el.attr('href') !== '#') url = $el.attr('href');else if ($selectEl.attr('name')) url = $selectEl.attr('name').toLowerCase() + "-select/";
    }

    if (!url) url = ss.params.url;
    var multiple = $selectEl[0].multiple;
    var inputType = multiple ? 'checkbox' : 'radio';
    var selectId = (0, _utils.id)();
    (0, _utils.extend)(ss, {
      $el: $el,
      el: $el[0],
      $selectEl: $selectEl,
      selectEl: $selectEl[0],
      $valueEl: $valueEl,
      valueEl: $valueEl && $valueEl[0],
      url: url,
      multiple: multiple,
      inputType: inputType,
      id: selectId,
      inputName: inputType + "-" + selectId,
      selectName: $selectEl.attr('name'),
      maxLength: $selectEl.attr('maxlength') || params.maxLength
    });
    $el[0].f7SmartSelect = ss; // Events

    function onClick() {
      ss.open();
    }

    function onChange() {
      var value = ss.$selectEl.val();
      ss.$el.trigger('smartselect:change', value);
      ss.emit('local::change smartSelectChange', ss, value);

      if (ss.vl) {
        ss.vl.clearCache();
      }

      ss.setValueText();
    }

    ss.attachEvents = function attachEvents() {
      $el.on('click', onClick);
      $el.on('change', 'select', onChange);
    };

    ss.detachEvents = function detachEvents() {
      $el.off('click', onClick);
      $el.off('change', 'select', onChange);
    };

    function handleInputChange() {
      var optionEl;
      var text;
      var inputEl = this;
      var value = inputEl.value;
      var optionText = [];
      var displayAs;

      if (inputEl.type === 'checkbox') {
        for (var i = 0; i < ss.selectEl.options.length; i += 1) {
          optionEl = ss.selectEl.options[i];

          if (optionEl.value === value) {
            optionEl.selected = inputEl.checked;
          }

          if (optionEl.selected) {
            displayAs = optionEl.dataset ? optionEl.dataset.displayAs : (0, _dom.default)(optionEl).data('display-value-as');
            text = displayAs && typeof displayAs !== 'undefined' ? displayAs : optionEl.textContent;
            optionText.push(text.trim());
          }
        }

        if (ss.maxLength) {
          ss.checkMaxLength();
        }
      } else {
        optionEl = ss.$selectEl.find("option[value=\"" + value + "\"]")[0];

        if (!optionEl) {
          optionEl = ss.$selectEl.find('option').filter(function (optEl) {
            return optEl.value === value;
          })[0];
        }

        displayAs = optionEl.dataset ? optionEl.dataset.displayAs : (0, _dom.default)(optionEl).data('display-as');
        text = displayAs && typeof displayAs !== 'undefined' ? displayAs : optionEl.textContent;
        optionText = [text];
        ss.selectEl.value = value;
      }

      ss.$selectEl.trigger('change');

      if (ss.params.setValueText) {
        ss.$valueEl.text(ss.formatValueText(optionText));
      }

      if (ss.params.closeOnSelect && ss.inputType === 'radio') {
        ss.close();
      }
    }

    ss.attachInputsEvents = function attachInputsEvents() {
      ss.$containerEl.on('change', 'input[type="checkbox"], input[type="radio"]', handleInputChange);
    };

    ss.detachInputsEvents = function detachInputsEvents() {
      ss.$containerEl.off('change', 'input[type="checkbox"], input[type="radio"]', handleInputChange);
    }; // Install Modules


    ss.useModules(); // Init

    ss.init();
    return ss || _assertThisInitialized(_this);
  }

  var _proto = SmartSelect.prototype;

  _proto.setValue = function setValue(value) {
    var ss = this;
    var newValue = value;
    var optionText = [];
    var optionEl;
    var displayAs;
    var text;

    if (ss.multiple) {
      if (!Array.isArray(newValue)) newValue = [newValue];

      for (var i = 0; i < ss.selectEl.options.length; i += 1) {
        optionEl = ss.selectEl.options[i];

        if (newValue.indexOf(optionEl.value) >= 0) {
          optionEl.selected = true;
        } else {
          optionEl.selected = false;
        }

        if (optionEl.selected) {
          displayAs = optionEl.dataset ? optionEl.dataset.displayAs : (0, _dom.default)(optionEl).data('display-value-as');
          text = displayAs && typeof displayAs !== 'undefined' ? displayAs : optionEl.textContent;
          optionText.push(text.trim());
        }
      }
    } else {
      optionEl = ss.$selectEl.find("option[value=\"" + newValue + "\"]")[0];

      if (optionEl) {
        displayAs = optionEl.dataset ? optionEl.dataset.displayAs : (0, _dom.default)(optionEl).data('display-as');
        text = displayAs && typeof displayAs !== 'undefined' ? displayAs : optionEl.textContent;
        optionText = [text];
      }

      ss.selectEl.value = newValue;
    }

    if (ss.params.setValueText) {
      ss.$valueEl.text(ss.formatValueText(optionText));
    }

    ss.$selectEl.trigger('change');
    return ss;
  };

  _proto.unsetValue = function unsetValue() {
    var ss = this;

    if (ss.params.setValueText) {
      ss.$valueEl.text(ss.formatValueText([]));
    }

    ss.$selectEl.find('option').each(function (optionEl) {
      optionEl.selected = false;
      optionEl.checked = false;
    });
    ss.$selectEl[0].value = null;

    if (ss.$containerEl) {
      ss.$containerEl.find("input[name=\"" + ss.inputName + "\"][type=\"checkbox\"], input[name=\"" + ss.inputName + "\"][type=\"radio\"]").prop('checked', false);
    }

    ss.$selectEl.trigger('change');
  };

  _proto.getValue = function getValue() {
    var ss = this;
    return ss.$selectEl.val();
  };

  _proto.checkMaxLength = function checkMaxLength() {
    var ss = this;
    var $containerEl = ss.$containerEl;

    if (ss.selectEl.selectedOptions.length >= ss.maxLength) {
      $containerEl.find('input[type="checkbox"]').each(function (inputEl) {
        if (!inputEl.checked) {
          (0, _dom.default)(inputEl).parents('li').addClass('disabled');
        } else {
          (0, _dom.default)(inputEl).parents('li').removeClass('disabled');
        }
      });
    } else {
      $containerEl.find('.disabled').removeClass('disabled');
    }
  };

  _proto.formatValueText = function formatValueText(values) {
    var ss = this;
    var textValue;

    if (ss.params.formatValueText) {
      textValue = ss.params.formatValueText.call(ss, values, ss);
    } else {
      textValue = values.join(', ');
    }

    return textValue;
  };

  _proto.setValueText = function setValueText(value) {
    var ss = this;
    var valueArray = [];

    if (typeof value !== 'undefined') {
      if (Array.isArray(value)) {
        valueArray = value;
      } else {
        valueArray = [value];
      }
    } else {
      ss.$selectEl.find('option').each(function (optionEl) {
        var $optionEl = (0, _dom.default)(optionEl);

        if (optionEl.selected) {
          var displayAs = optionEl.dataset ? optionEl.dataset.displayAs : $optionEl.data('display-value-as');

          if (displayAs && typeof displayAs !== 'undefined') {
            valueArray.push(displayAs);
          } else {
            valueArray.push(optionEl.textContent.trim());
          }
        }
      });
    }

    if (ss.params.setValueText) {
      ss.$valueEl.text(ss.formatValueText(valueArray));
    }
  };

  _proto.getItemsData = function getItemsData() {
    var ss = this;
    var theme = ss.app.theme;
    var items = [];
    var previousGroupEl;
    ss.$selectEl.find('option').each(function (optionEl) {
      var $optionEl = (0, _dom.default)(optionEl);
      var optionData = $optionEl.dataset();
      var optionImage = optionData.optionImage || ss.params.optionImage;
      var optionIcon = optionData.optionIcon || ss.params.optionIcon;
      var optionIconIos = theme === 'ios' && (optionData.optionIconIos || ss.params.optionIconIos);
      var optionIconMd = theme === 'md' && (optionData.optionIconMd || ss.params.optionIconMd);
      var optionIconAurora = theme === 'aurora' && (optionData.optionIconAurora || ss.params.optionIconAurora);
      var optionHasMedia = optionImage || optionIcon || optionIconIos || optionIconMd || optionIconAurora;
      var optionColor = optionData.optionColor;
      var optionClassName = optionData.optionClass || '';
      if ($optionEl[0].disabled) optionClassName += ' disabled';
      var optionGroupEl = $optionEl.parent('optgroup')[0];
      var optionGroupLabel = optionGroupEl && optionGroupEl.label;
      var optionIsLabel = false;

      if (optionGroupEl && optionGroupEl !== previousGroupEl) {
        optionIsLabel = true;
        previousGroupEl = optionGroupEl;
        items.push({
          groupLabel: optionGroupLabel,
          isLabel: optionIsLabel
        });
      }

      items.push({
        value: $optionEl[0].value,
        text: $optionEl[0].textContent.trim(),
        selected: $optionEl[0].selected,
        groupEl: optionGroupEl,
        groupLabel: optionGroupLabel,
        image: optionImage,
        icon: optionIcon,
        iconIos: optionIconIos,
        iconMd: optionIconMd,
        iconAurora: optionIconAurora,
        color: optionColor,
        className: optionClassName,
        disabled: $optionEl[0].disabled,
        id: ss.id,
        hasMedia: optionHasMedia,
        checkbox: ss.inputType === 'checkbox',
        radio: ss.inputType === 'radio',
        inputName: ss.inputName,
        inputType: ss.inputType
      });
    });
    ss.items = items;
    return items;
  };

  _proto.renderSearchbar = function renderSearchbar() {
    var ss = this;
    if (ss.params.renderSearchbar) return ss.params.renderSearchbar.call(ss);
    return (0, _$jsx.default)("form", {
      class: "searchbar"
    }, (0, _$jsx.default)("div", {
      class: "searchbar-inner"
    }, (0, _$jsx.default)("div", {
      class: "searchbar-input-wrap"
    }, (0, _$jsx.default)("input", {
      type: "search",
      spellcheck: ss.params.searchbarSpellcheck || 'false',
      placeholder: ss.params.searchbarPlaceholder
    }), (0, _$jsx.default)("i", {
      class: "searchbar-icon"
    }), (0, _$jsx.default)("span", {
      class: "input-clear-button"
    })), ss.params.searchbarDisableButton && (0, _$jsx.default)("span", {
      class: "searchbar-disable-button"
    }, ss.params.searchbarDisableText)));
  };

  _proto.renderItem = function renderItem(item, index) {
    var ss = this;
    if (ss.params.renderItem) return ss.params.renderItem.call(ss, item, index);

    function getIconContent(iconValue) {
      if (iconValue === void 0) {
        iconValue = '';
      }

      if (iconValue.indexOf(':') >= 0) {
        return iconValue.split(':')[1];
      }

      return '';
    }

    function getIconClass(iconValue) {
      if (iconValue === void 0) {
        iconValue = '';
      }

      if (iconValue.indexOf(':') >= 0) {
        var className = iconValue.split(':')[0];
        if (className === 'f7') className = 'f7-icons';
        if (className === 'material') className = 'material-icons';
        return className;
      }

      return iconValue;
    }

    var itemHtml;

    if (item.isLabel) {
      itemHtml = "<li class=\"item-divider\">" + item.groupLabel + "</li>";
    } else {
      var selected = item.selected;
      var disabled;

      if (ss.params.virtualList) {
        var ssValue = ss.getValue();
        selected = ss.multiple ? ssValue.indexOf(item.value) >= 0 : ssValue === item.value;

        if (ss.multiple) {
          disabled = ss.multiple && !selected && ssValue.length === parseInt(ss.maxLength, 10);
        }
      }

      var icon = item.icon,
          iconIos = item.iconIos,
          iconMd = item.iconMd,
          iconAurora = item.iconAurora;
      var hasIcon = icon || iconIos || iconMd || iconAurora;
      var iconContent = getIconContent(icon || iconIos || iconMd || iconAurora || '');
      var iconClass = getIconClass(icon || iconIos || iconMd || iconAurora || '');
      itemHtml = (0, _$jsx.default)("li", {
        class: "" + (item.className || '') + (disabled ? ' disabled' : '')
      }, (0, _$jsx.default)("label", {
        class: "item-" + item.inputType + " item-content"
      }, (0, _$jsx.default)("input", {
        type: item.inputType,
        name: item.inputName,
        value: item.value,
        _checked: selected
      }), (0, _$jsx.default)("i", {
        class: "icon icon-" + item.inputType
      }), item.hasMedia && (0, _$jsx.default)("div", {
        class: "item-media"
      }, hasIcon && (0, _$jsx.default)("i", {
        class: "icon " + iconClass
      }, iconContent), item.image && (0, _$jsx.default)("img", {
        src: item.image
      })), (0, _$jsx.default)("div", {
        class: "item-inner"
      }, (0, _$jsx.default)("div", {
        class: "item-title" + (item.color ? " text-color-" + item.color : '')
      }, item.text))));
    }

    return itemHtml;
  };

  _proto.renderItems = function renderItems() {
    var ss = this;
    if (ss.params.renderItems) return ss.params.renderItems.call(ss, ss.items);
    var itemsHtml = "\n      " + ss.items.map(function (item, index) {
      return "" + ss.renderItem(item, index);
    }).join('') + "\n    ";
    return itemsHtml;
  };

  _proto.renderPage = function renderPage() {
    var ss = this;
    if (ss.params.renderPage) return ss.params.renderPage.call(ss, ss.items);
    var pageTitle = ss.params.pageTitle;

    if (typeof pageTitle === 'undefined') {
      var $itemTitleEl = ss.$el.find('.item-title');
      pageTitle = $itemTitleEl.length ? $itemTitleEl.text().trim() : '';
    }

    var cssClass = ss.params.cssClass;
    return (0, _$jsx.default)("div", {
      class: "page smart-select-page " + cssClass,
      "data-name": "smart-select-page",
      "data-select-name": ss.selectName
    }, (0, _$jsx.default)("div", {
      class: "navbar " + (ss.params.navbarColorTheme ? "color-" + ss.params.navbarColorTheme : '')
    }, (0, _$jsx.default)("div", {
      class: "navbar-bg"
    }), (0, _$jsx.default)("div", {
      class: "navbar-inner sliding " + (ss.params.navbarColorTheme ? "color-" + ss.params.navbarColorTheme : '')
    }, (0, _$jsx.default)("div", {
      class: "left"
    }, (0, _$jsx.default)("a", {
      class: "link back"
    }, (0, _$jsx.default)("i", {
      class: "icon icon-back"
    }), (0, _$jsx.default)("span", {
      class: "if-not-md"
    }, ss.params.pageBackLinkText))), pageTitle && (0, _$jsx.default)("div", {
      class: "title"
    }, pageTitle), ss.params.searchbar && (0, _$jsx.default)("div", {
      class: "subnavbar"
    }, ss.renderSearchbar()))), ss.params.searchbar && (0, _$jsx.default)("div", {
      class: "searchbar-backdrop"
    }), (0, _$jsx.default)("div", {
      class: "page-content"
    }, (0, _$jsx.default)("div", {
      class: "list smart-select-list-" + ss.id + " " + (ss.params.virtualList ? ' virtual-list' : '') + " " + (ss.params.formColorTheme ? "color-" + ss.params.formColorTheme : '')
    }, (0, _$jsx.default)("ul", null, !ss.params.virtualList && ss.renderItems(ss.items)))));
  };

  _proto.renderPopup = function renderPopup() {
    var ss = this;
    if (ss.params.renderPopup) return ss.params.renderPopup.call(ss, ss.items);
    var pageTitle = ss.params.pageTitle;

    if (typeof pageTitle === 'undefined') {
      var $itemTitleEl = ss.$el.find('.item-title');
      pageTitle = $itemTitleEl.length ? $itemTitleEl.text().trim() : '';
    }

    var cssClass = ss.params.cssClass || '';
    return (0, _$jsx.default)("div", {
      class: "popup smart-select-popup " + cssClass + " " + (ss.params.popupTabletFullscreen ? 'popup-tablet-fullscreen' : ''),
      "data-select-name": ss.selectName
    }, (0, _$jsx.default)("div", {
      class: "view"
    }, (0, _$jsx.default)("div", {
      class: "page smart-select-page " + (ss.params.searchbar ? 'page-with-subnavbar' : ''),
      "data-name": "smart-select-page"
    }, (0, _$jsx.default)("div", {
      class: "navbar " + (ss.params.navbarColorTheme ? "color-" + ss.params.navbarColorTheme : '')
    }, (0, _$jsx.default)("div", {
      class: "navbar-bg"
    }), (0, _$jsx.default)("div", {
      class: "navbar-inner sliding"
    }, pageTitle && (0, _$jsx.default)("div", {
      class: "title"
    }, pageTitle), (0, _$jsx.default)("div", {
      class: "right"
    }, (0, _$jsx.default)("a", {
      class: "link popup-close",
      "data-popup": ".smart-select-popup[data-select-name='" + ss.selectName + "']"
    }, ss.params.popupCloseLinkText)), ss.params.searchbar && (0, _$jsx.default)("div", {
      class: "subnavbar"
    }, ss.renderSearchbar()))), ss.params.searchbar && (0, _$jsx.default)("div", {
      class: "searchbar-backdrop"
    }), (0, _$jsx.default)("div", {
      class: "page-content"
    }, (0, _$jsx.default)("div", {
      class: "list smart-select-list-" + ss.id + " " + (ss.params.virtualList ? ' virtual-list' : '') + " " + (ss.params.formColorTheme ? "color-" + ss.params.formColorTheme : '')
    }, (0, _$jsx.default)("ul", null, !ss.params.virtualList && ss.renderItems(ss.items)))))));
  };

  _proto.renderSheet = function renderSheet() {
    var ss = this;
    if (ss.params.renderSheet) return ss.params.renderSheet.call(ss, ss.items);
    var cssClass = ss.params.cssClass; // prettier-ignore

    return (0, _$jsx.default)("div", {
      class: "sheet-modal smart-select-sheet " + cssClass,
      "data-select-name": ss.selectName
    }, (0, _$jsx.default)("div", {
      class: "toolbar toolbar-top " + (ss.params.toolbarColorTheme ? "color-" + ss.params.toolbarColorTheme : '')
    }, (0, _$jsx.default)("div", {
      class: "toolbar-inner"
    }, (0, _$jsx.default)("div", {
      class: "left"
    }), (0, _$jsx.default)("div", {
      class: "right"
    }, (0, _$jsx.default)("a", {
      class: "link sheet-close"
    }, ss.params.sheetCloseLinkText)))), (0, _$jsx.default)("div", {
      class: "sheet-modal-inner"
    }, (0, _$jsx.default)("div", {
      class: "page-content"
    }, (0, _$jsx.default)("div", {
      class: "list smart-select-list-" + ss.id + " " + (ss.params.virtualList ? ' virtual-list' : '') + " " + (ss.params.formColorTheme ? "color-" + ss.params.formColorTheme : '')
    }, (0, _$jsx.default)("ul", null, !ss.params.virtualList && ss.renderItems(ss.items))))));
  };

  _proto.renderPopover = function renderPopover() {
    var ss = this;
    if (ss.params.renderPopover) return ss.params.renderPopover.call(ss, ss.items);
    var cssClass = ss.params.cssClass; // prettier-ignore

    return (0, _$jsx.default)("div", {
      class: "popover smart-select-popover " + cssClass,
      "data-select-name": ss.selectName
    }, (0, _$jsx.default)("div", {
      class: "popover-inner"
    }, (0, _$jsx.default)("div", {
      class: "list smart-select-list-" + ss.id + " " + (ss.params.virtualList ? ' virtual-list' : '') + " " + (ss.params.formColorTheme ? "color-" + ss.params.formColorTheme : '')
    }, (0, _$jsx.default)("ul", null, !ss.params.virtualList && ss.renderItems(ss.items)))));
  };

  _proto.scrollToSelectedItem = function scrollToSelectedItem() {
    var ss = this;
    var params = ss.params,
        $containerEl = ss.$containerEl;
    if (!ss.opened) return ss;

    if (params.virtualList) {
      var selectedIndex;
      ss.vl.items.forEach(function (item, index) {
        if (typeof selectedIndex === 'undefined' && item.selected) {
          selectedIndex = index;
        }
      });

      if (typeof selectedIndex !== 'undefined') {
        ss.vl.scrollToItem(selectedIndex);
      }
    } else {
      var $selectedItemEl = $containerEl.find('input:checked').parents('li');
      if (!$selectedItemEl.length) return ss;
      var $pageContentEl = $containerEl.find('.page-content');
      $pageContentEl.scrollTop($selectedItemEl.offset().top - $pageContentEl.offset().top - parseInt($pageContentEl.css('padding-top'), 10));
    }

    return ss;
  };

  _proto.onOpen = function onOpen(type, containerEl) {
    var ss = this;
    var app = ss.app;
    var $containerEl = (0, _dom.default)(containerEl);
    ss.$containerEl = $containerEl;
    ss.openedIn = type;
    ss.opened = true; // Init VL

    if (ss.params.virtualList) {
      ss.vl = app.virtualList.create({
        el: $containerEl.find('.virtual-list'),
        items: ss.items,
        renderItem: ss.renderItem.bind(ss),
        height: ss.params.virtualListHeight,
        searchByItem: function searchByItem(query, item) {
          if (item.text && item.text.toLowerCase().indexOf(query.trim().toLowerCase()) >= 0) return true;
          return false;
        }
      });
    }

    if (ss.params.scrollToSelectedItem) {
      ss.scrollToSelectedItem();
    } // Init SB


    if (ss.params.searchbar) {
      var $searchbarEl = $containerEl.find('.searchbar');

      if (type === 'page' && app.theme === 'ios') {
        $searchbarEl = (0, _dom.default)(app.navbar.getElByPage($containerEl)).find('.searchbar');
      }

      if (ss.params.appendSearchbarNotFound && (type === 'page' || type === 'popup')) {
        var $notFoundEl = null;

        if (typeof ss.params.appendSearchbarNotFound === 'string') {
          $notFoundEl = (0, _dom.default)("<div class=\"block searchbar-not-found\">" + ss.params.appendSearchbarNotFound + "</div>");
        } else if (typeof ss.params.appendSearchbarNotFound === 'boolean') {
          $notFoundEl = (0, _dom.default)('<div class="block searchbar-not-found">Nothing found</div>');
        } else {
          $notFoundEl = ss.params.appendSearchbarNotFound;
        }

        if ($notFoundEl) {
          $containerEl.find('.page-content').append($notFoundEl[0]);
        }
      }

      var searchbarParams = (0, _utils.extend)({
        el: $searchbarEl,
        backdropEl: $containerEl.find('.searchbar-backdrop'),
        searchContainer: ".smart-select-list-" + ss.id,
        searchIn: '.item-title'
      }, typeof ss.params.searchbar === 'object' ? ss.params.searchbar : {});
      ss.searchbar = app.searchbar.create(searchbarParams);
    } // Check for max length


    if (ss.maxLength) {
      ss.checkMaxLength();
    } // Close on select


    if (ss.params.closeOnSelect) {
      ss.$containerEl.find("input[type=\"radio\"][name=\"" + ss.inputName + "\"]:checked").parents('label').once('click', function () {
        ss.close();
      });
    } // Attach input events


    ss.attachInputsEvents();
    ss.$el.trigger('smartselect:open');
    ss.emit('local::open smartSelectOpen', ss);
  };

  _proto.onOpened = function onOpened() {
    var ss = this;
    ss.$el.trigger('smartselect:opened');
    ss.emit('local::opened smartSelectOpened', ss);
  };

  _proto.onClose = function onClose() {
    var ss = this;
    if (ss.destroyed) return; // Destroy VL

    if (ss.vl && ss.vl.destroy) {
      ss.vl.destroy();
      ss.vl = null;
      delete ss.vl;
    } // Destroy SB


    if (ss.searchbar && ss.searchbar.destroy) {
      ss.searchbar.destroy();
      ss.searchbar = null;
      delete ss.searchbar;
    } // Detach events


    ss.detachInputsEvents();
    ss.$el.trigger('smartselect:close');
    ss.emit('local::close smartSelectClose', ss);
  };

  _proto.onClosed = function onClosed() {
    var ss = this;
    if (ss.destroyed) return;
    ss.opened = false;
    ss.$containerEl = null;
    delete ss.$containerEl;
    ss.$el.trigger('smartselect:closed');
    ss.emit('local::closed smartSelectClosed', ss);
  };

  _proto.openPage = function openPage() {
    var ss = this;
    if (ss.opened) return ss;
    ss.getItemsData();
    var pageHtml = ss.renderPage(ss.items);
    ss.view.router.navigate({
      url: ss.url,
      route: {
        content: pageHtml,
        path: ss.url,
        on: {
          pageBeforeIn: function pageBeforeIn(e, page) {
            ss.onOpen('page', page.el);
          },
          pageAfterIn: function pageAfterIn(e, page) {
            ss.onOpened('page', page.el);
          },
          pageBeforeOut: function pageBeforeOut(e, page) {
            ss.onClose('page', page.el);
          },
          pageAfterOut: function pageAfterOut(e, page) {
            ss.onClosed('page', page.el);
          }
        }
      }
    });
    return ss;
  };

  _proto.openPopup = function openPopup() {
    var ss = this;
    if (ss.opened) return ss;
    ss.getItemsData();
    var popupHtml = ss.renderPopup(ss.items);
    var popupParams = {
      content: popupHtml,
      push: ss.params.popupPush,
      swipeToClose: ss.params.popupSwipeToClose,
      on: {
        popupOpen: function popupOpen(popup) {
          ss.onOpen('popup', popup.el);
        },
        popupOpened: function popupOpened(popup) {
          ss.onOpened('popup', popup.el);
        },
        popupClose: function popupClose(popup) {
          ss.onClose('popup', popup.el);
        },
        popupClosed: function popupClosed(popup) {
          ss.onClosed('popup', popup.el);
        }
      }
    };

    if (ss.params.routableModals && ss.view) {
      ss.view.router.navigate({
        url: ss.url,
        route: {
          path: ss.url,
          popup: popupParams
        }
      });
    } else {
      ss.modal = ss.app.popup.create(popupParams).open();
    }

    return ss;
  };

  _proto.openSheet = function openSheet() {
    var ss = this;
    if (ss.opened) return ss;
    ss.getItemsData();
    var sheetHtml = ss.renderSheet(ss.items);
    var sheetParams = {
      content: sheetHtml,
      backdrop: false,
      scrollToEl: ss.$el,
      closeByOutsideClick: true,
      push: ss.params.sheetPush,
      swipeToClose: ss.params.sheetSwipeToClose,
      on: {
        sheetOpen: function sheetOpen(sheet) {
          ss.onOpen('sheet', sheet.el);
        },
        sheetOpened: function sheetOpened(sheet) {
          ss.onOpened('sheet', sheet.el);
        },
        sheetClose: function sheetClose(sheet) {
          ss.onClose('sheet', sheet.el);
        },
        sheetClosed: function sheetClosed(sheet) {
          ss.onClosed('sheet', sheet.el);
        }
      }
    };

    if (ss.params.routableModals && ss.view) {
      ss.view.router.navigate({
        url: ss.url,
        route: {
          path: ss.url,
          sheet: sheetParams
        }
      });
    } else {
      ss.modal = ss.app.sheet.create(sheetParams).open();
    }

    return ss;
  };

  _proto.openPopover = function openPopover() {
    var ss = this;
    if (ss.opened) return ss;
    ss.getItemsData();
    var popoverHtml = ss.renderPopover(ss.items);
    var popoverParams = {
      content: popoverHtml,
      targetEl: ss.$el,
      on: {
        popoverOpen: function popoverOpen(popover) {
          ss.onOpen('popover', popover.el);
        },
        popoverOpened: function popoverOpened(popover) {
          ss.onOpened('popover', popover.el);
        },
        popoverClose: function popoverClose(popover) {
          ss.onClose('popover', popover.el);
        },
        popoverClosed: function popoverClosed(popover) {
          ss.onClosed('popover', popover.el);
        }
      }
    };

    if (ss.params.routableModals && ss.view) {
      ss.view.router.navigate({
        url: ss.url,
        route: {
          path: ss.url,
          popover: popoverParams
        }
      });
    } else {
      ss.modal = ss.app.popover.create(popoverParams).open();
    }

    return ss;
  };

  _proto.open = function open(type) {
    var ss = this;
    if (ss.opened) return ss;
    var prevented = false;

    function prevent() {
      prevented = true;
    }

    if (ss.$el) {
      ss.$el.trigger('smartselect:beforeopen', {
        prevent: prevent
      });
    }

    ss.emit('local::beforeOpen smartSelectBeforeOpen', ss, prevent);
    if (prevented) return ss;
    var openIn = type || ss.params.openIn;
    ss["open" + openIn.split('').map(function (el, index) {
      if (index === 0) return el.toUpperCase();
      return el;
    }).join('')]();
    return ss;
  };

  _proto.close = function close() {
    var ss = this;
    if (!ss.opened) return ss;

    if (ss.params.routableModals && ss.view || ss.openedIn === 'page') {
      ss.view.router.back();
    } else {
      ss.modal.once('modalClosed', function () {
        (0, _utils.nextTick)(function () {
          if (ss.destroyed) return;
          ss.modal.destroy();
          delete ss.modal;
        });
      });
      ss.modal.close();
    }

    return ss;
  };

  _proto.init = function init() {
    var ss = this;
    ss.attachEvents();
    ss.setValueText();
  };

  _proto.destroy = function destroy() {
    var ss = this;
    ss.emit('local::beforeDestroy smartSelectBeforeDestroy', ss);
    ss.$el.trigger('smartselect:beforedestroy');
    ss.detachEvents();
    delete ss.$el[0].f7SmartSelect;
    (0, _utils.deleteProps)(ss);
    ss.destroyed = true;
  };

  _createClass(SmartSelect, [{
    key: "view",
    get: function get() {
      var params = this.params,
          $el = this.$el;
      var view;

      if (params.view) {
        view = params.view;
      }

      if (!view) {
        view = $el.parents('.view').length && $el.parents('.view')[0].f7View;
      }

      if (!view && params.openIn === 'page') {
        throw Error('Smart Select requires initialized View');
      }

      return view;
    }
  }]);

  return SmartSelect;
}(_class.default);

var _default = SmartSelect;
exports.default = _default;