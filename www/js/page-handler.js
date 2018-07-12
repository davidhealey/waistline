window.page = {};

window.page.open = function() {
  var menu = document.getElementById('menu');
  menu.open();
};

window.page.push = function(page, options) {
  var menu = document.getElementById('menu');
  var nav = document.getElementById('mainNavigator');

  nav.pushPage(page, options)
    .then(menu.close.bind(menu));
};

window.page.load = function(page, options) {
  var content = document.getElementById('content');
  var menu = document.getElementById('menu');

  content.load(page, options)
    .then(menu.close.bind(menu));
};

window.page.pop = function() {
  var nav = document.getElementById('mainNavigator');
  return nav.popPage();
}

window.page.getData = function() {
  var nav = document.getElementById('mainNavigator');
  return nav.topPage.data;
};
