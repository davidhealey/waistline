<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->

[![Build status](https://ci.appveyor.com/api/projects/status/ewv1mhbvms0bfm26?svg=true)](https://ci.appveyor.com/project/ApacheSoftwareFoundation/cordova-serve/branch/master)
[![Build Status](https://travis-ci.org/apache/cordova-serve.svg?branch=master)](https://travis-ci.org/apache/cordova-serve)
[![NPM](https://nodei.co/npm/cordova-serve.png)](https://nodei.co/npm/cordova-serve/)

# cordova-serve
This module can be used to serve up a Cordova application in the browser. It has no command-line, but rather is intended
to be called using the following API:

``` js
var cordovaServe = require('cordova-serve')();
cordovaServe.launchServer(opts);
cordovaServe.servePlatform(platform, opts);
cordovaServe.launchBrowser(ops);
```

## launchServer()

``` js
var cordovaServe = require('cordova-serve')();
cordovaServe.launchServer(opts).then(function () {
    var server = cordovaServe.server;
    var root = cordovaServe.root;
    var port = cordovaServe.port;

    ...
}, function (error) {
    console.log('An error occurred: ' + error);
});
```

Launches a server with the specified options. Parameters:

* **opts**: Options, as described below.

Returns a promise that is fulfilled once the server has launched, or rejected if the server fails to launch. Once the
promise is fulfilled, the following properties are available on the `cordovaServe` object:
 
 * **cordovaServe.serve**: The Node http.Server instance.
 * **cordovaServe.root**: The root that was specified, or cwd if none specified.
 * **cordovaServe.port**: The port that was used (could be the requested port, the default port, or some incremented
   value if the chosen port was in use).

## servePlatform()

``` js
var cordovaServe = require('cordova-serve')();
cordovaServe.servePlatform(platform, opts).then(function () {
    var server = cordovaServe.server;
    var port = cordovaServe.port;
    var projectRoot = cordovaServe.projectRoot;
    var platformRoot = cordovaServe.root;

    ...
}, function (error) {
    console.log('An error occurred: ' + error);
});
```

Launches a server that serves up any Cordova platform (e.g. `browser`, `android` etc) from the current project.
Parameters:

* **opts**: Options, as described below. Note that for `servePlatform()`, the `root` value should be a Cordova project's
  root folder, or any folder within it - `servePlatform()` will replace it with the platform's `www_dir` folder. If this
  value is not specified, the *cwd* will be used.

Returns a promise that is fulfilled once the server has launched, or rejected if the server fails to launch. Once the
promise is fulfilled, the following properties are available on the `cordovaServe` object:
 
 * **cordovaServe.serve**: The Node http.Server instance.
 * **cordovaServe.root**: The requested platform's `www` folder.
 * **cordovaServe.projectRoot**: The root folder of the Cordova project.
 * **cordovaServe.port**: The port that was used (could be the requested port, the default port, or some incremented
   value if the chosen port was in use).

## launchBrowser()

``` js
var cordovaServe = require('cordova-serve')();
cordovaServe.launchBrowser(opts).then(function (stdout) {
    console.log('Browser was launched successfully: ' + stdout);
}, function (error) {
    console.log('An error occurred: ' + error);
});
```

Launches a browser window pointing to the specified URL. The single parameter is an options object that supports the
following values (both optional):

* **url**: The URL to open in the browser.
* **target**: The name of the browser to launch. Can be any of the following: `chrome`, `chromium`, `firefox`, `ie`,
  `opera`, `safari`. Defaults to `chrome` if no browser is specified.

Returns a promise that is fulfilled once the browser has been launched, or rejected if an error occurs.

## The *opts* Options Object
The opts object passed to `launchServer()` and `servePlatform()` supports the following values (all optional):

* **root**: The file path on the local file system that is used as the root for the server, for default mapping of URL
  path to local file system path.   
* **port**: The port for the server. Note that if this port is already in use, it will be incremented until a free port
  is found.
* **router**: An `ExpressJS` router. If provided, this will be attached *before* default static handling.
* **noLogOutput**: If `true`, turns off all log output. 
* **noServerInfo**: If `true`, cordova-serve won't output `Static file server running on...` message.
* **events**: An `EventEmitter` to use for logging. If provided, logging will be output using `events.emit('log', msg)`.
  If not provided, `console.log()` will be used. Note that nothing will be output in either case if `noLogOutput` is `true`.
