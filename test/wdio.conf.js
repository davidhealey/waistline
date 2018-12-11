var timeout = 15 * 60 * 1000;

exports.config = {
  port: 4723,
  logLevel: 'verbose',
  connectionRetryTimeout: timeout,

  capabilities: [{
    platformName: 'Android',
    deviceName: 'any',
    app: '../platforms/android/app/build/outputs/apk/debug/app-debug.apk',
    autoWebview: true,
    autoGrantPermissions: true,
    newCommandTimeout: timeout,
    appWaitDuration: timeout,
    deviceReadyTimeout: timeout,
    androidDeviceReadyTimeout: timeout,
    androidInstallTimeout: timeout,
    avdLaunchTimeout: timeout,
    avdReadyTimeout: timeout,
    autoWebviewTimeout: timeout,
    uiautomator2ServerLaunchTimeout: timeout,
    uiautomator2ServerInstallTimeout: timeout,
    adbExecTimeout: timeout,
  }],

  specs: ['./spec/**/*.js'],
  services: ['appium'],
  reporters: ['spec'],
  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: timeout,
  },

  before: function(capabilities, specs) {
    browser.timeouts('implicit', 60 * 1000);
    browser.waitForVisible("ons-toolbar-button[onclick='menu.open()']", timeout);
  },
};
