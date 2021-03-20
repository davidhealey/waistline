"use strict";

exports.__esModule = true;
exports.default = void 0;

var _ssrWindow = require("ssr-window");

var _dom = _interopRequireDefault(require("../../shared/dom7"));

var _utils = require("../../shared/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseComponent(componentString) {
  var window = (0, _ssrWindow.getWindow)();
  var document = (0, _ssrWindow.getDocument)();
  var componentId = (0, _utils.id)();
  var callbackCreateName = "f7_component_create_callback_" + componentId; // Template

  var template;
  var hasTemplate = componentString.match(/<template([ ]?)([a-z0-9-]*)>/);

  if (hasTemplate) {
    template = componentString.split(/<template[ ]?[a-z0-9-]*>/).filter(function (item, index) {
      return index > 0;
    }).join('<template>').split('</template>').filter(function (item, index, arr) {
      return index < arr.length - 1;
    }).join('</template>').replace(/{{#raw}}([ \n]*)<template/g, '{{#raw}}<template').replace(/\/template>([ \n]*){{\/raw}}/g, '/template>{{/raw}}').replace(/([ \n])<template/g, '$1{{#raw}}<template').replace(/\/template>([ \n])/g, '/template>{{/raw}}$1');
  } // Parse Styles


  var style = null;

  if (componentString.indexOf('<style>') >= 0) {
    style = componentString.split('<style>')[1].split('</style>')[0];
  }

  if (componentString.indexOf('<style scoped>') >= 0) {
    style = componentString.split('<style scoped>')[1].split('</style>')[0];
  } // Parse Script


  var scriptContent;

  if (componentString.indexOf('<script>') >= 0) {
    var scripts = componentString.split('<script>');
    scriptContent = scripts[scripts.length - 1].split('</script>')[0].trim();
  } else {
    scriptContent = 'return () => {return $render}';
  }

  if (!scriptContent || !scriptContent.trim()) scriptContent = 'return () => {return $render}'; // Parse Template

  if (template) {
    scriptContent = scriptContent.replace('$render', "function ($$ctx) {\n          var $ = $$ctx.$$;\n          var $h = $$ctx.$h;\n          var $root = $$ctx.$root;\n          var $f7 = $$ctx.$f7;\n          var $f7route = $$ctx.$f7route;\n          var $f7router = $$ctx.$f7router;\n          var $theme = $$ctx.$theme;\n          var $update = $$ctx.$update;\n          var $store = $$ctx.$store;\n\n          return $h`" + template + "`\n        }\n        ").replace(/export default/g, 'return');
  } // Execute Script


  scriptContent = "window." + callbackCreateName + " = function () {" + scriptContent + "}"; // Insert Script El

  var scriptEl = document.createElement('script');
  scriptEl.innerHTML = scriptContent;
  (0, _dom.default)('head').append(scriptEl);
  var component = window[callbackCreateName](); // Remove Script El

  (0, _dom.default)(scriptEl).remove();
  window[callbackCreateName] = null;
  delete window[callbackCreateName]; // Assign Style

  if (style) {
    component.style = style;
  } // Component ID


  component.id = componentId;
  return component;
}

var _default = parseComponent;
exports.default = _default;