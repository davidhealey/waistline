"use strict";

exports.__esModule = true;
exports.default = void 0;

var _componentClass = _interopRequireDefault(require("./component-class"));

exports.Component = _componentClass.default;

var _parseComponent = _interopRequireDefault(require("./parse-component"));

var _customComponents = _interopRequireDefault(require("./custom-components"));

var _$jsx = _interopRequireDefault(require("./$jsx"));

exports.$jsx = _$jsx.default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerComponent(tagName, component) {
  _customComponents.default[tagName] = component;
}

function unregisterComponent(tagName) {
  delete _customComponents.default[tagName];
}

var _default = {
  name: 'component',
  static: {
    Component: _componentClass.default,
    registerComponent: registerComponent,
    unregisterComponent: unregisterComponent
  },
  create: function create() {
    var app = this;
    app.component = {
      registerComponent: registerComponent,
      unregisterComponent: unregisterComponent,
      parse: function parse(componentString) {
        return (0, _parseComponent.default)(componentString);
      },
      create: function create(component, props, _ref) {
        var root = _ref.root,
            el = _ref.el,
            context = _ref.context,
            children = _ref.children;
        return new _componentClass.default(app, component, props, {
          root: root,
          el: el,
          context: context,
          children: children
        });
      }
    };
  }
};
exports.default = _default;