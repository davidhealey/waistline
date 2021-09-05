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

# cordova-common

[![NPM](https://nodei.co/npm/cordova-common.png)](https://nodei.co/npm/cordova-common/)

[![Node CI](https://github.com/apache/cordova-common/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/apache/cordova-common/actions?query=branch%3Amaster)

Exposes shared functionality used by [cordova-lib](https://github.com/apache/cordova-lib/) and Cordova platforms.

## Exposed APIs

### `events`

Represents special instance of NodeJS `EventEmitter` which is intended to be used to post events to `cordova-lib` and `cordova-cli`

Usage:

```js
const { events } = require('cordova-common');
events.emit('warn', 'Some warning message')
```

Here are the following supported events by `cordova-cli`:

* `verbose`
* `log`
* `info`
* `warn`
* `error`

### `CordovaError`

An error class used by Cordova to throw cordova-specific errors. The `CordovaError` class is inherited from `Error`, so it is a valid instance of `Error`. (`instanceof` check succeeds).

Usage:

```js
const { CordovaError } = require('cordova-common');
throw new CordovaError('Some error message', SOME_ERR_CODE);
```

See [CordovaError](src/CordovaError/CordovaError.js) for supported error codes.

### `ConfigParser`

Exposes functionality to deal with cordova project `config.xml` files. For `ConfigParser` API reference check [ConfigParser Readme](src/ConfigParser/README.md).

Usage:

```js
const { ConfigParser } = require('cordova-common');
const appConfig = new ConfigParser('path/to/cordova-app/config.xml');
console.log(`${appconfig.name()}:${appConfig.version()}`);
```

### `PluginInfoProvider` and `PluginInfo`

`PluginInfo` is a wrapper for cordova plugins' `plugin.xml` files. This class may be instantiated directly or via `PluginInfoProvider`. The difference is that `PluginInfoProvider` caches `PluginInfo` instances based on plugin source directory.

Usage:

```js
const { PluginInfo, PluginInfoProvider }  = require('cordova-common');

// The following instances are equal
const plugin1 = new PluginInfo('path/to/plugin_directory');
const plugin2 = new PluginInfoProvider().get('path/to/plugin_directory');

console.log(`The plugin ${plugin1.id} has version ${plugin1.version}`)
```

### `ActionStack`

Utility module for dealing with sequential tasks. Provides a set of tasks that are needed to be done and reverts all tasks that are already completed if one of those tasks fail to complete. Used internally by `cordova-lib` and platform's plugin installation routines.

Usage:

```js
const { ActionStack } = require('cordova-common');

const stack = new ActionStack();
const action1 = stack.createAction(task1, [<task parameters>], task1_reverter, [<reverter_parameters>]);
const action2 = stack.createAction(task2, [<task parameters>], task2_reverter, [<reverter_parameters>]);

stack.push(action1);
stack.push(action2);

stack.process()
    .then(() => {
        // all actions succeded
    })
    .catch(error => {
        // One of actions failed with error
    });
```

### `superspawn`

Module for spawning child processes with some advanced logic.

Usage:

```js
const { superspawn } = require('cordova-common');

superspawn.spawn('adb', ['devices'])
    .progress(data => {
        if (data.stderr) console.error(`"adb devices" raised an error: ${data.stderr}`);
    })
    .then(devices => {
        // Do something...
    });
```

### `xmlHelpers`

A set of utility methods for dealing with XML files.

Usage:

```js
const { xmlHelpers } = require('cordova-common');

const doc1 = xmlHelpers.parseElementtreeSync('some/xml/file');
const doc2 = xmlHelpers.parseElementtreeSync('another/xml/file');

xmlHelpers.mergeXml(doc1, doc2); // doc2 now contains all the nodes from doc1
```

### Other APIs

The APIs listed below are also exposed but are intended to be only used internally by cordova plugin installation routines.

* `PlatformJson`
* `ConfigChanges`
* `ConfigKeeper`
* `ConfigFile`

## Setup

* Clone this repository onto your local machine

    ```bash
    git clone https://github.com/apache/cordova-common.git
    ```

* Navigate to cordova-common directory, install dependencies and npm-link

    ```bash
    cd cordova-common && npm install && npm link
    ```

* Navigate to cordova-lib directory and link cordova-common

    ```bash
    cd <cordova-lib directory> && npm link cordova-common && npm install
    ```
