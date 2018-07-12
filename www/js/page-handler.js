window.page = {};

window.page.open = function() {
  var menu = document.getElementById('menu');
  menu.open();
};

window.page.push = function(page) {
  var menu = document.getElementById('menu');
  var nav = document.getElementById('mainNavigator');

  nav.pushPage(page)
    .then(menu.close.bind(menu));
}

window.page.load = function(page) {
  var content = document.getElementById('content');
  var menu = document.getElementById('menu');

  content.load(page)
    .then(menu.close.bind(menu));
};
