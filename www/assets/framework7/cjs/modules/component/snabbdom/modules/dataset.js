"use strict";

exports.__esModule = true;
exports.default = exports.datasetModule = void 0;
var CAPS_REGEX = /[A-Z]/g;

function updateDataset(oldVnode, vnode) {
  var elm = vnode.elm,
      oldDataset = oldVnode.data.dataset,
      dataset = vnode.data.dataset,
      key;
  if (!oldDataset && !dataset) return;
  if (oldDataset === dataset) return;
  oldDataset = oldDataset || {};
  dataset = dataset || {};
  var d = elm.dataset;

  for (key in oldDataset) {
    if (!dataset[key]) {
      if (d) {
        if (key in d) {
          delete d[key];
        }
      } else {
        elm.removeAttribute('data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase());
      }
    }
  }

  for (key in dataset) {
    if (oldDataset[key] !== dataset[key]) {
      if (d) {
        d[key] = dataset[key];
      } else {
        elm.setAttribute('data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase(), dataset[key]);
      }
    }
  }
}

var datasetModule = {
  create: updateDataset,
  update: updateDataset
};
exports.datasetModule = datasetModule;
var _default = datasetModule;
exports.default = _default;