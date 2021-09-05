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
# cordova-common Release Notes

### 4.0.2 (Jul 01, 2020)

* [GH-144](https://github.com/apache/cordova-common/pull/144) fix(ios): resolve correct path to app info `plist` when multiple `plist` files are present
* [GH-147](https://github.com/apache/cordova-common/pull/147) chore: remove trailing whitespace
* [GH-146](https://github.com/apache/cordova-common/pull/146) chore: bump `devDependencies` `nyc` -> `^15.1.0`
* [GH-145](https://github.com/apache/cordova-common/pull/145) test: remove unused test fixtures

### 4.0.1 (May 14, 2020)

* [GH-141](https://github.com/apache/cordova-common/pull/141) chore: apply random missing minor changes
* [GH-143](https://github.com/apache/cordova-common/pull/143) fix: typo in access & allow navigation
* [GH-142](https://github.com/apache/cordova-common/pull/142) fix(`ConfigParser`): `ImageResources` constructor

### 4.0.0 (Mar 26, 2020)

* [GH-140](https://github.com/apache/cordova-common/pull/140) breaking: bump all dependencies to latest
  * bump `fs-extra@^9.0.0`
  * bump `@cordova/eslint-config@^3.0.0`
  * bump `jasmine-spec-reporter@^5.0.1`
  * bump Github Actions `actions/checkout@v2`
* [GH-139](https://github.com/apache/cordova-common/pull/139) chore: various cleanup tasks
* [GH-138](https://github.com/apache/cordova-common/pull/138) chore(dependency): update dev & non-dev dependencies
* [GH-137](https://github.com/apache/cordova-common/pull/137) refactor: transform `var` to `let`/`const`
* [GH-136](https://github.com/apache/cordova-common/pull/136) ci: final migration to actions
* [GH-85](https://github.com/apache/cordova-common/pull/85) style: improve line spacing & group like items
* [GH-124](https://github.com/apache/cordova-common/pull/124) fix(`ConfigFile`): correctly resolve *-Info.plist file path
* [GH-135](https://github.com/apache/cordova-common/pull/135) fix(`ConfigFile`): Normalize globbed file paths
* [GH-134](https://github.com/apache/cordova-common/pull/134) test(`ConfigFile`): minor improvements
* [GH-121](https://github.com/apache/cordova-common/pull/121) feat(`CordovaError`): support for error cause & more
* [GH-133](https://github.com/apache/cordova-common/pull/133) refactor(`ConfigParser`): cleanup & simplify
* [GH-132](https://github.com/apache/cordova-common/pull/132) refactor(`PluginInfo`): cleanup & simplify
* [GH-131](https://github.com/apache/cordova-common/pull/131) refactor(misc): cleanup & simplify
* [GH-130](https://github.com/apache/cordova-common/pull/130) refactor(`ConfigChanges`): simplify
* [GH-128](https://github.com/apache/cordova-common/pull/128) refactor(`xml-helpers`): DRY & simplify
* [GH-129](https://github.com/apache/cordova-common/pull/129) fix: broken lock file from [#95](https://github.com/apache/cordova-common/pu#95)
* [GH-127](https://github.com/apache/cordova-common/pull/127) refactor(`munge-util`): DRY & simplify
* [GH-95](https://github.com/apache/cordova-common/pull/95) TEST: Test using GitHub workflows for CI
* [GH-125](https://github.com/apache/cordova-common/pull/125) test(`ConfigFile`): group & cleanup tests
* [GH-126](https://github.com/apache/cordova-common/pull/126) chore!: remove main export `mungeUtil`
* [GH-123](https://github.com/apache/cordova-common/pull/123) refactor: `FileUpdater`
* [GH-119](https://github.com/apache/cordova-common/pull/119) refactor: use ES6 classes where applicable
* [GH-118](https://github.com/apache/cordova-common/pull/118) refactor: use template strings where applicable
* [GH-116](https://github.com/apache/cordova-common/pull/116) refactor: use property shorthand notation
* [GH-115](https://github.com/apache/cordova-common/pull/115) refactor: transform `var` to `let`/`const`
* [GH-114](https://github.com/apache/cordova-common/pull/114) refactor: do not alias `this`
* [GH-113](https://github.com/apache/cordova-common/pull/113) refactor: use arrow functions where applicable
* [GH-120](https://github.com/apache/cordova-common/pull/120) refactor: move `CordovaError` module up
* [GH-117](https://github.com/apache/cordova-common/pull/117) refactor(`CordovaError`)!: remove unused features
* [GH-111](https://github.com/apache/cordova-common/pull/111) chore: remove support for ubuntu platform
* [GH-109](https://github.com/apache/cordova-common/pull/109) chore: consolidate eslint configs
* [GH-108](https://github.com/apache/cordova-common/pull/108) style: drop jasmine env workaround
* [GH-105](https://github.com/apache/cordova-common/pull/105) refactor: eslint setup
* [GH-107](https://github.com/apache/cordova-common/pull/107) test: always run code coverage during `npm test`
* [GH-106](https://github.com/apache/cordova-common/pull/106) ci(travis): run codecov using npx in `after_success`
* [GH-103](https://github.com/apache/cordova-common/pull/103) chore: bump production dependencies
* [GH-101](https://github.com/apache/cordova-common/pull/101) chore: update jasmine dependencies & config
* [GH-100](https://github.com/apache/cordova-common/pull/100) chore: replace `instanbul` w/ `nyc`
* [GH-102](https://github.com/apache/cordova-common/pull/102) chore: drop unused & unneeded dependencies
* [GH-104](https://github.com/apache/cordova-common/pull/104) chore: improve npm ignore list
* [GH-96](https://github.com/apache/cordova-common/pull/96) feat: Replace `addProperty` with ES6 getters
* [GH-94](https://github.com/apache/cordova-common/pull/94) fix: `PluginInfoProvider` for scoped plugins
* [GH-71](https://github.com/apache/cordova-common/pull/71) chore: update `strip-bom@4`
* [GH-90](https://github.com/apache/cordova-common/pull/90) chore: drop node 6 and 8 support
* [GH-97](https://github.com/apache/cordova-common/pull/97) Use `Array.prototype.find` in `CordovaError`
* [GH-93](https://github.com/apache/cordova-common/pull/93) Re-apply fix for failing `CordovaError` test
* [GH-92](https://github.com/apache/cordova-common/pull/92) Remove obsolete JSHint comments
* [GH-87](https://github.com/apache/cordova-common/pull/87) Convert `CordovaError` to ES6 class

### 3.2.1 (Oct 28, 2019)

* [GH-78](https://github.com/apache/cordova-common/pull/78) (windows) Add `.jsproj` as file extension for XML files ([GH-62](https://github.com/apache/cordova-common/pull/62))
* [GH-89](https://github.com/apache/cordova-common/pull/89) revert: ([GH-24](https://github.com/apache/cordova-common/pull/24)) [CB-14108](https://issues.apache.org/jira/browse/CB-14108) fix incorrect count in `config_munge`
* [GH-82](https://github.com/apache/cordova-common/pull/82) General cleanup with eslint updates
* [GH-86](https://github.com/apache/cordova-common/pull/86) eslint cleanup fixes: `operator-linebreak`
* [GH-81](https://github.com/apache/cordova-common/pull/81) remove `no-throw-literal` lint exception not needed
* [GH-83](https://github.com/apache/cordova-common/pull/83) Fix ESLint violations where applicable
* [GH-80](https://github.com/apache/cordova-common/pull/80) Update to jasmine 3.4 & fix resulting spec failures
* [GH-79](https://github.com/apache/cordova-common/pull/79) Promise handling cleanup in specs
* [GH-77](https://github.com/apache/cordova-common/pull/77) Do not ignore AppVeyor failures on Node.js 12

### 3.2.0 (Jun 12, 2019)
* (ios) plist document not indented with tabs ([#69](https://github.com/apache/cordova-common/pull/69))
* Update fs-extra to v8 ([#70](https://github.com/apache/cordova-common/pull/70))
* Add example usage of podspec declarations ([#67](https://github.com/apache/cordova-common/pull/67))
* implement setPreference and setPlatformPreference ([#63](https://github.com/apache/cordova-common/pull/63))
* Catch leaked exceptions in superspawn and convert them to rejections ([#66](https://github.com/apache/cordova-common/pull/66))

### 3.1.0 (Dec 24, 2018)
* Update Cordova events into a real singleton class ([#60](https://github.com/apache/cordova-common/pull/60))
* Refactor CordovaLogger to singleton class ([#53](https://github.com/apache/cordova-common/pull/53))

### 3.0.0 (Nov 05, 2018)
* [CB-14166](https://issues.apache.org/jira/browse/CB-14166) Use `cross-spawn` for platform-independent spawning
* add `PluginInfo.getPodSpecs` method
* [CB-13496](https://issues.apache.org/jira/browse/CB-13496) Fix greedy regex in plist-helpers
* [CB-14108](https://issues.apache.org/jira/browse/CB-14108) fix incorrect count in config_munge in ios.json and android.json
* [CB-13685](https://issues.apache.org/jira/browse/CB-13685) **Android**: Update ConfigParser for Adaptive Icons
* [CB-10071](https://issues.apache.org/jira/browse/CB-10071) Add BridgingHeader type attributes for header-file
* [CB-12016](https://issues.apache.org/jira/browse/CB-12016) Removed cordova-registry-mapper dependency
* [CB-14099](https://issues.apache.org/jira/browse/CB-14099) **osx**: Fixed Resolve Config Path for OSX
* [CB-14140](https://issues.apache.org/jira/browse/CB-14140) Replace shelljs calls with fs-extra & which

### 2.2.2 (May 30, 2018)
* [CB-13979](https://issues.apache.org/jira/browse/CB-13979) More consistency for `config.xml` lookups
* [CB-14064](https://issues.apache.org/jira/browse/CB-14064) Remove Node 4 from CI matrix
* [CB-14088](https://issues.apache.org/jira/browse/CB-14088) Update dependencies
* [CB-11691](https://issues.apache.org/jira/browse/CB-11691) Fix for modifying binary plists
* [CB-13770](https://issues.apache.org/jira/browse/CB-13770) Warn when <edit-config> or <config-file> not found
* [CB-13471](https://issues.apache.org/jira/browse/CB-13471) Fix tests and path issues for **Windows**
* [CB-13471](https://issues.apache.org/jira/browse/CB-13471) added unit test for config file provider
* [CB-13744](https://issues.apache.org/jira/browse/CB-13744) Recognize storyboards as XML files
* [CB-13674](https://issues.apache.org/jira/browse/CB-13674) Incremented package version to -dev

### 2.2.1 (Dec 14, 2017)
* [CB-13674](https://issues.apache.org/jira/browse/CB-13674): updated dependencies

### 2.2.0 (Nov 22, 2017)
* [CB-13471](https://issues.apache.org/jira/browse/CB-13471) File Provider fix belongs in cordova-common
* [CB-11244](https://issues.apache.org/jira/browse/CB-11244) Spot fix for upcoming `cordova-android@7` changes. https://github.com/apache/cordova-android/pull/389

### 2.1.1 (Oct 04, 2017)
* [CB-13145](https://issues.apache.org/jira/browse/CB-13145) added `getFrameworks` to unit tests
* [CB-13145](https://issues.apache.org/jira/browse/CB-13145) added variable replacing to framework tag

### 2.1.0 (August 30, 2017)
* [CB-13145](https://issues.apache.org/jira/browse/CB-13145) added variable replacing to `framework` tag
* [CB-13211](https://issues.apache.org/jira/browse/CB-13211) Add `allows-arbitrary-loads-for-media` attribute parsing for `getAccesses`
* [CB-11968](https://issues.apache.org/jira/browse/CB-11968) Added support for `<config-file>` in `config.xml`
* [CB-12895](https://issues.apache.org/jira/browse/CB-12895) set up `eslint` and removed `jshint`
* [CB-12785](https://issues.apache.org/jira/browse/CB-12785) added `.gitignore`, `travis`, and `appveyor` support
* [CB-12250](https://issues.apache.org/jira/browse/CB-12250) & [CB-12409](https://issues.apache.org/jira/browse/CB-12409) *iOS*: Fix bug with escaping properties from `plist` file
* [CB-12762](https://issues.apache.org/jira/browse/CB-12762) updated `common`, `fetch`, and `serve` `pkgJson` to point `pkgJson` repo items to github mirrors
* [CB-12766](https://issues.apache.org/jira/browse/CB-12766) Consistently write `JSON` with 2 spaces indentation

### 2.0.3 (May 02, 2017)
* [CB-8978](https://issues.apache.org/jira/browse/CB-8978) Add option to get `resource-file` from `root`
* [CB-11908](https://issues.apache.org/jira/browse/CB-11908) Add tests for `edit-config` in `config.xml`
* [CB-12665](https://issues.apache.org/jira/browse/CB-12665) removed `enginestrict` since it is deprecated

### 2.0.2 (Apr 14, 2017)
* [CB-11233](https://issues.apache.org/jira/browse/CB-11233) - Support installing frameworks into 'Embedded Binaries' section of the Xcode project
* [CB-10438](https://issues.apache.org/jira/browse/CB-10438) - Install correct dependency version. Removed shell.remove, added pkg.json to dependency tests 1-3, and updated install.js (.replace) to fix tests in uninstall.spec.js and update to workw with jasmine 2.0
* [CB-11120](https://issues.apache.org/jira/browse/CB-11120) - Allow short/display name in config.xml
* [CB-11346](https://issues.apache.org/jira/browse/CB-11346) - Remove known platforms check
* [CB-11977](https://issues.apache.org/jira/browse/CB-11977) - updated engines and enginescript for common, fetch, and serve

### 2.0.1 (Mar 09, 2017)
* [CB-12557](https://issues.apache.org/jira/browse/CB-12557) add both stdout and stderr properties to the error object passed to superspawn reject handler.

### 2.0.0 (Jan 17, 2017)
* [CB-8978](https://issues.apache.org/jira/browse/CB-8978) Add `resource-file` parsing to `config.xml`
* [CB-12018](https://issues.apache.org/jira/browse/CB-12018): updated `jshint` and updated tests to work with `jasmine@2` instead of `jasmine-node`
* [CB-12163](https://issues.apache.org/jira/browse/CB-12163) Add reference attrib to `resource-file` for **Windows**
* Move windows-specific logic to `cordova-windows`
* [CB-12189](https://issues.apache.org/jira/browse/CB-12189) Add implementation attribute to framework

### 1.5.1 (Oct 12, 2016)
* [CB-12002](https://issues.apache.org/jira/browse/CB-12002) Add `getAllowIntents()` to `ConfigParser`
* [CB-11998](https://issues.apache.org/jira/browse/CB-11998) `cordova platform add` error with `cordova-common@1.5.0`

### 1.5.0 (Oct 06, 2016)
* [CB-11776](https://issues.apache.org/jira/browse/CB-11776) Add test case for different `edit-config` targets
* [CB-11908](https://issues.apache.org/jira/browse/CB-11908) Add `edit-config` to `config.xml`
* [CB-11936](https://issues.apache.org/jira/browse/CB-11936) Support four new **App Transport Security (ATS)** keys
* update `config.xml` location if it is a **Android Studio** project.
* use `array` methods and `object.keys` for iterating. avoiding `for-in` loops
* [CB-11517](https://issues.apache.org/jira/browse/CB-11517) Allow `.folder` matches
* [CB-11776](https://issues.apache.org/jira/browse/CB-11776) check `edit-config` target exists

### 1.4.1 (Aug 09, 2016)
* Add general purpose `ConfigParser.getAttribute` API
* [CB-11653](https://issues.apache.org/jira/browse/CB-11653) moved `findProjectRoot` from `cordova-lib` to `cordova-common`
* [CB-11636](https://issues.apache.org/jira/browse/CB-11636) Handle attributes with quotes correctly
* [CB-11645](https://issues.apache.org/jira/browse/CB-11645) added check to see if `getEditConfig` exists before trying to use it
* [CB-9825](https://issues.apache.org/jira/browse/CB-9825) framework tag spec parsing

### 1.4.0 (Jul 12, 2016)
* [CB-11023](https://issues.apache.org/jira/browse/CB-11023) Add edit-config functionality

### 1.3.0 (May 12, 2016)
* [CB-11259](https://issues.apache.org/jira/browse/CB-11259): Improving prepare and build logging
* [CB-11194](https://issues.apache.org/jira/browse/CB-11194) Improve cordova load time
* [CB-1117](https://issues.apache.org/jira/browse/CB-1117) Add `FileUpdater` module to `cordova-common`.
* [CB-11131](https://issues.apache.org/jira/browse/CB-11131) Fix `TypeError: message.toUpperCase` is not a function in `CordovaLogger`

### 1.2.0 (Apr 18, 2016)
* [CB-11022](https://issues.apache.org/jira/browse/CB-11022) Save modulesMetadata to both www and platform_www when necessary
* [CB-10833](https://issues.apache.org/jira/browse/CB-10833) Deduplicate common logic for plugin installation/uninstallation
* [CB-10822](https://issues.apache.org/jira/browse/CB-10822) Manage plugins/modules metadata using PlatformJson
* [CB-10940](https://issues.apache.org/jira/browse/CB-10940) Can't add Android platform from path
* [CB-10965](https://issues.apache.org/jira/browse/CB-10965) xml helper allows multiple instances to be merge in config.xml

### 1.1.1 (Mar 18, 2016)
* [CB-10694](https://issues.apache.org/jira/browse/CB-10694) Update test to reflect merging of [CB-9264](https://issues.apache.org/jira/browse/CB-9264) fix
* [CB-10694](https://issues.apache.org/jira/browse/CB-10694) Platform-specific configuration preferences don't override global settings
* [CB-9264](https://issues.apache.org/jira/browse/CB-9264) Duplicate entries in `config.xml`
* [CB-10791](https://issues.apache.org/jira/browse/CB-10791) Add `adjustLoggerLevel` to `cordova-common.CordovaLogger`
* [CB-10662](https://issues.apache.org/jira/browse/CB-10662) Add tests for `ConfigParser.getStaticResources`
* [CB-10622](https://issues.apache.org/jira/browse/CB-10622) fix target attribute being ignored for images in `config.xml`.
* [CB-10583](https://issues.apache.org/jira/browse/CB-10583) Protect plugin preferences from adding extra Array properties.

### 1.1.0 (Feb 16, 2016)
* [CB-10482](https://issues.apache.org/jira/browse/CB-10482) Remove references to windows8 from cordova-lib/cli
* [CB-10430](https://issues.apache.org/jira/browse/CB-10430) Adds forwardEvents method to easily connect two EventEmitters
* [CB-10176](https://issues.apache.org/jira/browse/CB-10176) Adds CordovaLogger class, based on logger module from cordova-cli
* [CB-10052](https://issues.apache.org/jira/browse/CB-10052) Expose child process' io streams via promise progress notification
* [CB-10497](https://issues.apache.org/jira/browse/CB-10497) Prefer .bat over .cmd on windows platform
* [CB-9984](https://issues.apache.org/jira/browse/CB-9984) Bumps plist version and fixes failing cordova-common test

### 1.0.0 (Oct 29, 2015)

* [CB-9890](https://issues.apache.org/jira/browse/CB-9890) Documents cordova-common
* [CB-9598](https://issues.apache.org/jira/browse/CB-9598) Correct cordova-lib -> cordova-common in README
* Pick ConfigParser changes from apache@0c3614e
* [CB-9743](https://issues.apache.org/jira/browse/CB-9743) Removes system frameworks handling from ConfigChanges
* [CB-9598](https://issues.apache.org/jira/browse/CB-9598) Cleans out code which has been moved to `cordova-common`
* Pick ConfigParser changes from apache@ddb027b
* Picking CordovaError changes from apache@a3b1fca
* [CB-9598](https://issues.apache.org/jira/browse/CB-9598) Adds tests and fixtures based on existing cordova-lib ones
* [CB-9598](https://issues.apache.org/jira/browse/CB-9598) Initial implementation for cordova-common

