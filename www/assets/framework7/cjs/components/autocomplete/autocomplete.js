"use strict";

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../../shared/utils");

var _autocompleteClass = _interopRequireDefault(require("./autocomplete-class"));

var _constructorMethods = _interopRequireDefault(require("../../shared/constructor-methods"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'autocomplete',
  params: {
    autocomplete: {
      openerEl: undefined,
      inputEl: undefined,
      view: undefined,
      // DropDown
      dropdownContainerEl: undefined,
      dropdownPlaceholderText: undefined,
      typeahead: false,
      highlightMatches: true,
      expandInput: false,
      updateInputValueOnSelect: true,
      inputEvents: 'input',
      value: undefined,
      multiple: false,
      source: undefined,
      limit: undefined,
      valueProperty: 'id',
      textProperty: 'text',
      openIn: 'page',
      // or 'popup' or 'dropdown'
      pageBackLinkText: 'Back',
      popupCloseLinkText: 'Close',
      pageTitle: undefined,
      searchbarPlaceholder: 'Search...',
      searchbarDisableText: 'Cancel',
      searchbarDisableButton: undefined,
      searchbarSpellcheck: false,
      popupPush: false,
      popupSwipeToClose: undefined,
      animate: true,
      autoFocus: false,
      closeOnSelect: false,
      notFoundText: 'Nothing found',
      requestSourceOnOpen: false,
      // Preloader
      preloaderColor: undefined,
      preloader: false,
      // Colors
      formColorTheme: undefined,
      navbarColorTheme: undefined,
      // Routing
      routableModals: false,
      url: 'select/',
      // Custom render functions
      renderDropdown: undefined,
      renderPage: undefined,
      renderPopup: undefined,
      renderItem: undefined,
      renderSearchbar: undefined,
      renderNavbar: undefined
    }
  },
  static: {
    Autocomplete: _autocompleteClass.default
  },
  create: function create() {
    var app = this;
    app.autocomplete = (0, _utils.extend)((0, _constructorMethods.default)({
      defaultSelector: undefined,
      constructor: _autocompleteClass.default,
      app: app,
      domProp: 'f7Autocomplete'
    }), {
      open: function open(autocompleteEl) {
        var ac = app.autocomplete.get(autocompleteEl);
        if (ac && ac.open) return ac.open();
        return undefined;
      },
      close: function close(autocompleteEl) {
        var ac = app.autocomplete.get(autocompleteEl);
        if (ac && ac.close) return ac.close();
        return undefined;
      }
    });
  }
};
exports.default = _default;