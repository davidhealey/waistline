"use strict";

exports.__esModule = true;
exports.primitive = primitive;
exports.array = void 0;
var array = Array.isArray;
exports.array = array;

function primitive(s) {
  return typeof s === 'string' || typeof s === 'number';
}