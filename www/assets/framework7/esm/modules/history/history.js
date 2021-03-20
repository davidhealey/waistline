import History from '../../shared/history';
export default {
  name: 'history',
  static: {
    history: History
  },
  on: {
    init: function init() {
      History.init(this);
    }
  }
};