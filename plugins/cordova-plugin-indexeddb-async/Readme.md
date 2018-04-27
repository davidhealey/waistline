Asynchronous IndexedDB plugin for Cordova
================================

[![Dependencies](https://img.shields.io/david/ABB-Austin/cordova-plugin-indexeddb-async.svg)](https://david-dm.org/ABB-Austin/cordova-plugin-indexeddb-async)
[![npm](http://img.shields.io/npm/v/cordova-plugin-indexeddb-async.svg)](https://www.npmjs.com/package/cordova-plugin-indexeddb-async)
[![License](https://img.shields.io/npm/l/cordova-plugin-indexeddb-async.svg)](LICENSE)


Features
--------------------------
* Uses [IndexedDBShim](https://github.com/axemclion/IndexedDBShim) to polyfill devices that don't support IndexedDB
* Uses the [__asynchronous__ WebSql plugin](https://github.com/Thinkwise/cordova-plugin-websql) on Windows devices
* Can _optionally replace_ native IndexedDB on devices with [buggy implementations](http://www.raymondcamden.com/2014/9/25/IndexedDB-on-iOS-8--Broken-Bad)
* Can _optionally enhance_ native IndexedDB on devices that are [missing certain features](http://codepen.io/cemerick/pen/Itymi)
* This plugin is basically an IndexedDB-to-WebSql adapter


Installation
--------------------------
Install via the [Cordova CLI](https://cordova.apache.org/docs/en/edge/guide_cli_index.md.html).

For __Cordova CLI 4.x__, use the GIT URL syntax:

````bash
cordova plugin add https://github.com/ABB-Austin/cordova-plugin-indexeddb-async.git
````

For __Cordova CLI 5.x__, use the [new npm syntax](https://github.com/cordova/apache-blog-posts/blob/master/2015-04-15-plugins-release-and-move-to-npm.md):

````bash
cordova plugin add cordova-plugin-indexeddb-async
````


Using the Plugin
--------------------------
Cordova will automatically load the plugin and run it.  So all you need to do is use IndexedDB just like normal.

[Here's an example](https://gist.github.com/BigstickCarpet/a0d6389a5d0e3a24814b)



Supported Platforms
--------------------------
This plugin supports `ios`, `android`, and `windows` (phone and desktop), as well as the new `browser` platform.

### Android
Android 4.3 and earlier do not support IndexedDB, so this plugin will automatically add IndexedDB support.  On Android 4.4 and later, the plugin does nothing, since IndexedDB is already natively supported.


### Browser
All modern browsers [natively support IndexedDB](http://caniuse.com/#search=indexeddb), so the plugin won't do anything.  But for older browsers that [support WebSQL](http://caniuse.com/#search=websql), this plugin will automatically add IndexedDB support.


### iOS
iOS 7 and earlier do not support IndexedDB, so this plugin will automatically add IndexedDB support.  On iOS 8 and later, the plugin does nothing, since IndexedDB is already natively supported.

iOS 8's implementation of IndexedDB is [very buggy](http://www.raymondcamden.com/2014/9/25/IndexedDB-on-iOS-8--Broken-Bad).  So, you may want to use this plugin rather than the native implementation.  To do that, add the following line of code to your app:

````javascript
window.shimIndexedDB.__useShim()
````

##### Known Issue on iOS
Due to a [bug in WebKit](https://bugs.webkit.org/show_bug.cgi?id=137034), the `window.indexedDB` property is read-only and cannot be overridden by IndexedDBShim.  Until the bug is fixed, the only workaround is to create an `indexedDB` variable in your closure.  That way, all code within that closure will use the variable instead of the `window.indexedDB` property.  For example:

````javascript
(function() {
    // This works on all devices/browsers, and only uses IndexedDBShim as a final fallback 
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // This code will use the native IndexedDB if it exists, or the shim otherwise
    indexedDB.open("MyDatabase", 1);
})();
````


### Windows
Windows 8 and 8.1 support IndexedDB natively, so the plugin won't do anything by default.  

Windows 8.x's implementation of IndexedDB is [mising some features](http://codepen.io/cemerick/pen/Itymi), such as compound keys and compound indexes. If you need those features in your app, then you may want to use this plugin rather than the native implementation.  To do that, add the following line of cose to your app:

````javascript
window.shimIndexedDB.__useShim()
````


### Windows Phone
Windows Phone does not support IndexedDB or WebSQL, so this plugin will automatically load the [asynchronous WebSQL plugin](https://github.com/Thinkwise/cordova-plugin-websql) to add WebSQL support, and then use [IndexedDBShim](https://github.com/axemclion/IndexedDBShim) to expose WebSQL to your app via the IndexedDB API.  It's complicated, but it works.  :)

The WebSQL plugin is specifically written for Windows Phone, so it only supports the two processor architectures that Windows Phone supports (`x86` and `arm`).  This means that you need to specify an extra flag when building your Windows Phone app via Cordova:

````bash
cordova build windows --archs="x86 arm" -- --phone
````
