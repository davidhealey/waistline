function clickMenuButton(name) {
  var menuButton = browser.element("ons-toolbar-button[onclick='menu.open()']");
  expect(menuButton.isVisible()).toBe(true);
  menuButton.click();
  var pageButton = browser.element("#menu ons-list-item[onclick*='" + name + "']");
  expect(pageButton.isVisible()).toBe(true);
  pageButton.click();
}

function testPage(name, pageName) {
  it('can be accessed by menu', () => {
    pageName = pageName || name;
    clickMenuButton(name);
    var page = browser.element("#" + pageName + ".page");
    expect(page.isVisible()).toBe(true);
  });
}

function dismissAlert() {
  var alertButton = browser.element('ons-alert-dialog-button');
  expect(alertButton.isVisible()).toBe(true);
  alertButton.click();
  expect(browser.isVisible('ons-alert-dialog-button')).toBe(false);
}

describe('statistics', () => {
  testPage('statistics');
});

describe('diary', () => {
  testPage('diary', 'diary-page');
});

describe('food list', () => {
  testPage('food-list', 'food-list-page');
});

describe('recipes', () => {
  testPage('meals');
});

describe('goals', () => {
  testPage('goals');
});

describe('settings', () => {
  testPage('settings', 'settings-page');
});

describe('user guide', () => {
  testPage('userguide');
});

describe('about', () => {
  it('can be shown', () => {
    clickMenuButton("about");
  });

  it('can be dismissed', () => {
    dismissAlert();
  });
});
