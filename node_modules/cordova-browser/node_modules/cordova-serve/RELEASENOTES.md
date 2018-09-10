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
# Cordova-serve Release Notes

### 2.0.0 (Aug 24, 2017)
* [CB-13188](https://issues.apache.org/jira/browse/CB-13188) set serve to use default system browser if none is provided.
* Change to `eslint` instead of `jshint`
* remove `q` dependence completely. Added `server.spec`
* added browser tests
* Convert `src/browser` to use Promise api
* Add License, Contributing, Notice, pr-template, ...
* [CB-12785](https://issues.apache.org/jira/browse/CB-12785) added travis and appveyor
* [CB-12762](https://issues.apache.org/jira/browse/CB-12762): updated common, fetch, and serve pkgJson to point pkgJson repo items to github mirrors
* [CB-12665](https://issues.apache.org/jira/browse/CB-12665) removed enginestrict since it is deprecated
* [CB-11977](https://issues.apache.org/jira/browse/CB-11977): updated engines and enginescript for common, fetch, and serve

### 1.0.1 (Jan 17, 2017)
* [CB-12284](https://issues.apache.org/jira/browse/CB-12284) Include project root as additional root for static router
* Some corrections and enhancements for cordova-serve readme.
* On Windows, verify browsers installed before launching.

### 1.0.0 (Oct 05, 2015)
* Refactor cordova-serve to use Express.

### 0.1.3 (Aug 22, 2015)
* Clean up cordova-serve console output.
* [CB-9546](https://issues.apache.org/jira/browse/CB-9546) cordova-serve.servePlatform() should provide project folders
* [CB-9545](https://issues.apache.org/jira/browse/CB-9545) Cordova-serve's 'noCache' option does not work in IE.
* Add support for --target=edge to launch app in Edge browser.

### 0.1.2 (June 15, 2015)
Initial release
