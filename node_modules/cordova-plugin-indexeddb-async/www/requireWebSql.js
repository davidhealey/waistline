if (navigator.appVersion.indexOf('Windows Phone') >= 0) {
    // Only add the WebSQL plug-in for Windows Phone
    window.openDatabase = window.openDatabase || require('cordova-plugin-websql-async.WebSQL').openDatabase;
}
