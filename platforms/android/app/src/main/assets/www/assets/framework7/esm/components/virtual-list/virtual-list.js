import VirtualList from './virtual-list-class';
import ConstructorMethods from '../../shared/constructor-methods';
export default {
  name: 'virtualList',
  static: {
    VirtualList: VirtualList
  },
  create: function create() {
    var app = this;
    app.virtualList = ConstructorMethods({
      defaultSelector: '.virtual-list',
      constructor: VirtualList,
      app: app,
      domProp: 'f7VirtualList'
    });
  }
};