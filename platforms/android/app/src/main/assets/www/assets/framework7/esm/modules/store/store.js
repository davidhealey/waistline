import createStore from './create-store';
export { createStore };
export default {
  name: 'store',
  static: {
    createStore: createStore
  },
  proto: {
    createStore: createStore
  }
};