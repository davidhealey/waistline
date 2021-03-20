import * as methods from 'dom7';
Object.keys(methods).forEach(function (methodName) {
  if (methodName === '$') return;
  methods.$.fn[methodName] = methods[methodName];
});
export default methods.$;