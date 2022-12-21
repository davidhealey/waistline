import Component from './component-class';
import parseComponent from './parse-component';
import customComponents from './custom-components';
import $jsx from './$jsx';

function registerComponent(tagName, component) {
  customComponents[tagName] = component;
}

function unregisterComponent(tagName) {
  delete customComponents[tagName];
}

export { Component, $jsx };
export default {
  name: 'component',
  static: {
    Component: Component,
    registerComponent: registerComponent,
    unregisterComponent: unregisterComponent
  },
  create: function create() {
    var app = this;
    app.component = {
      registerComponent: registerComponent,
      unregisterComponent: unregisterComponent,
      parse: function parse(componentString) {
        return parseComponent(componentString);
      },
      create: function create(component, props, _ref) {
        var root = _ref.root,
            el = _ref.el,
            context = _ref.context,
            children = _ref.children;
        return new Component(app, component, props, {
          root: root,
          el: el,
          context: context,
          children: children
        });
      }
    };
  }
};