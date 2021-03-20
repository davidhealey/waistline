"use strict";

exports.__esModule = true;
exports.default = void 0;

var _dom = _interopRequireDefault(require("../../shared/dom7"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'subnavbar',
  on: {
    pageInit: function pageInit(page) {
      if (page.$navbarEl && page.$navbarEl.length && page.$navbarEl.find('.subnavbar').length) {
        page.$el.addClass('page-with-subnavbar');
      }

      var $innerSubnavbars = page.$el.find('.subnavbar').filter(function (subnavbarEl) {
        return (0, _dom.default)(subnavbarEl).parents('.page')[0] === page.$el[0];
      });

      if ($innerSubnavbars.length) {
        page.$el.addClass('page-with-subnavbar');
      }
    }
  }
};
exports.default = _default;