---
title: Network Information
description: Get information about wireless connectivity.
---
<!--
# license: Licensed to the Apache Software Foundation (ASF) under one
#         or more contributor license agreements.  See the NOTICE file
#         distributed with this work for additional information
#         regarding copyright ownership.  The ASF licenses this file
#         to you under the Apache License, Version 2.0 (the
#         "License"); you may not use this file except in compliance
#         with the License.  You may obtain a copy of the License at
#
#           http://www.apache.org/licenses/LICENSE-2.0
#
#         Unless required by applicable law or agreed to in writing,
#         software distributed under the License is distributed on an
#         "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#         KIND, either express or implied.  See the License for the
#         specific language governing permissions and limitations
#         under the License.
-->

|AppVeyor|Travis CI|
|:-:|:-:|
|[![Build status](https://ci.appveyor.com/api/projects/status/github/apache/cordova-plugin-network-information?branch=master)](https://ci.appveyor.com/project/ApacheSoftwareFoundation/cordova-plugin-network-information)|[![Build Status](https://travis-ci.org/apache/cordova-plugin-network-information.svg?branch=master)](https://travis-ci.org/apache/cordova-plugin-network-information)|

# cordova-plugin-network-information


This plugin provides an implementation of an old version of the
[Network Information API](http://www.w3.org/TR/2011/WD-netinfo-api-20110607/).
It provides information about the device's cellular and
wifi connection, and whether the device has an internet connection.

> To get a few ideas how to use the plugin, check out the [sample](#sample) at the bottom of this page or go straight to the [reference](#reference) content.

Report issues with this plugin on the [Apache Cordova issue tracker][Apache Cordova issue tracker].

##<a name="reference"></a>Reference

## Installation

    cordova plugin add cordova-plugin-network-information

## Supported Platforms

- Android
- Browser
- iOS
- Windows

# Connection

> The `connection` object, exposed via `navigator.connection`,  provides information about the device's cellular and wifi connection.

## Properties

- connection.type

## Constants

- Connection.UNKNOWN
- Connection.ETHERNET
- Connection.WIFI
- Connection.CELL_2G
- Connection.CELL_3G
- Connection.CELL_4G
- Connection.CELL
- Connection.NONE

## connection.type

This property offers a fast way to determine the device's network
connection state, and type of connection.

### Quick Example

```js
function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);
}

checkConnection();
```

### API Change

Until Cordova 2.3.0, the `Connection` object was accessed via
`navigator.network.connection`, after which it was changed to
`navigator.connection` to match the W3C specification.  It's still
available at its original location, but is deprecated and will
eventually be removed.

### iOS Quirks

- <iOS7 can't detect the type of cellular network connection.
    - `navigator.connection.type` is set to `Connection.CELL` for all cellular data.

### Windows Quirks

- When running in the Phone 8.1 emulator, always detects `navigator.connection.type` as `Connection.ETHERNET`.

### Browser Quirks

- Browser can't detect the type of network connection.
`navigator.connection.type` is always set to `Connection.UNKNOWN` when online.

# Network-related Events

## offline

The event fires when an application goes offline, and the device is
not connected to the Internet.

    document.addEventListener("offline", yourCallbackFunction, false);

### Details

The `offline` event fires when a previously connected device loses a
network connection so that an application can no longer access the
Internet.  It relies on the same information as the Connection API,
and fires when the value of `connection.type` becomes `NONE`.

Applications typically should use `document.addEventListener` to
attach an event listener once the `deviceready` event fires.

### Quick Example

```js
document.addEventListener("offline", onOffline, false);

function onOffline() {
    // Handle the offline event
}
```

### iOS Quirks

During initial startup, the first offline event (if applicable) takes at least a second to fire.

## online

This event fires when an application goes online, and the device
becomes connected to the Internet.

    document.addEventListener("online", yourCallbackFunction, false);

### Details

The `online` event fires when a previously unconnected device receives
a network connection to allow an application access to the Internet.
It relies on the same information as the Connection API,
and fires when the `connection.type` changes from `NONE` to any other
value.

Applications typically should use `document.addEventListener` to
attach an event listener once the `deviceready` event fires.

### Quick Example

```js
document.addEventListener("online", onOnline, false);

function onOnline() {
    // Handle the online event
}
```

### iOS Quirks

During initial startup, the first `online` event (if applicable) takes
at least a second to fire, prior to which `connection.type` is
`UNKNOWN`.

## Sample: Upload a File Depending on your Network State <a name="sample"></a>

The code examples in this section show examples of changing app behavior using the online and offline events and your network connection status.

To start with, create a new FileEntry object (data.txt) to use for sample data. Call this function from the `deviceready` handler.

>*Note* This code example requires the File plugin.

```js
var dataFileEntry;

function createSomeData() {

    window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {

        console.log('file system open: ' + fs.name);
        // Creates a new file or returns an existing file.
        fs.root.getFile("data.txt", { create: true, exclusive: false }, function (fileEntry) {

          dataFileEntry = fileEntry;

        }, onErrorCreateFile);

    }, onErrorLoadFs);
}
```

Next, add listeners for the online and offline events in the `deviceready` handler.

```js
document.addEventListener("offline", onOffline, false);
document.addEventListener("online", onOnline, false);
```

The app's `onOnline` function handles the online event. In the event handler, check the current network state. In this app, treat any connection type as good except Connection.NONE. If you have a connection, you try to upload a file.

```js
function onOnline() {
    // Handle the online event
    var networkState = navigator.connection.type;

    if (networkState !== Connection.NONE) {
        if (dataFileEntry) {
            tryToUploadFile();
        }
    }
    display('Connection type: ' + networkState);
}
```

When the online event fires in the preceding code, call the app's `tryToUploadFile` function.

If the FileTransfer object's upload function fails, call the app's `offlineWrite` function to save the current data somewhere.

>*Note* This example requires the FileTransfer plugin.

```js
function tryToUploadFile() {
    // !! Assumes variable fileURL contains a valid URL to a text file on the device,
    var fileURL = getDataFileEntry().toURL();

    var success = function (r) {
        console.log("Response = " + r.response);
        display("Uploaded. Response: " + r.response);
    }

    var fail = function (error) {
        console.log("An error has occurred: Code = " + error.code);
        offlineWrite("Failed to upload: some offline data");
    }

    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = "text/plain";

    var ft = new FileTransfer();
    // Make sure you add the domain of your server URL to the
    // Content-Security-Policy <meta> element in index.html.
    ft.upload(fileURL, encodeURI(SERVER), success, fail, options);
};
```

Here is the code for the `offlineWrite` function.

>*Note* This code examples requires the File plugin.

```js
function offlineWrite(offlineData) {
    // Create a FileWriter object for our FileEntry.
    dataFileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function () {
            console.log("Successful file write...");
            display(offlineData);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        fileWriter.write(offlineData);
    });
}
```

If the offline event occurs, just do something like notify the user (for this example, just log it).

```js
function onOffline() {
    // Handle the offline event
    console.log("lost connection");
}
```
 
[Apache Cordova issue tracker]: https://issues.apache.org/jira/issues/?jql=project%20%3D%20CB%20AND%20status%20in%20%28Open%2C%20%22In%20Progress%22%2C%20Reopened%29%20AND%20resolution%20%3D%20Unresolved%20AND%20component%20%3D%20%22Plugin%20Network%20Information%22%20ORDER%20BY%20priority%20DESC%2C%20summary%20ASC%2C%20updatedDate%20DESC
