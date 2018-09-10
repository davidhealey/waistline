#!/usr/bin/env node

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var fs = require('fs');
var shell = require('shelljs');
var path = require('path');
var ROOT = path.join(__dirname, '..', '..');
var events = require('cordova-common').events;
var check_reqs = require('./check_reqs');

// exported method to create a project, returns a promise that resolves with null
module.exports.createProject = function (project_path, package_name, project_name) {
/*
    // create the dest and the standard place for our api to live
    // platforms/platformName/cordova/Api.js
*/

    events.emit('log', 'Creating Cordova project for cordova-browser:');
    events.emit('log', '\tPath: ' + project_path);
    events.emit('log', '\tName: ' + project_name);

    // Set default values for path, package and name
    project_path = project_path || 'CordovaExample';

    // Check if project already exists
    if (fs.existsSync(project_path)) {
        events.emit('error', 'Oops, destination already exists! Delete it and try again');
    }

    // Check that requirements are met and proper targets are installed
    if (!check_reqs.run()) {
        // TODO: use events.emit
        events.emit('error', 'Please make sure you meet the software requirements in order to build a browser cordova project');
    }

    // copy template/cordova directory ( recursive )
    shell.cp('-r', path.join(ROOT, 'bin/template/cordova'), project_path);

    // copy template/www directory ( recursive )
    shell.cp('-r', path.join(ROOT, 'bin/template/www'), project_path);

    // recreate our node_modules structure in the new project
    shell.cp('-r', path.join(ROOT, 'node_modules'),
        path.join(project_path, 'cordova'));

    // copy check_reqs file
    shell.cp(path.join(ROOT, 'bin/lib/check_reqs.js'),
        path.join(project_path, 'cordova/lib'));

    var platform_www = path.join(project_path, 'platform_www');

    // copy cordova-js-src directory
    shell.cp('-rf', path.join(ROOT, 'cordova-js-src'), platform_www);

    // copy cordova js file to platform_www
    shell.cp(path.join(ROOT, 'cordova-lib', 'cordova.js'), platform_www);

    // copy favicon file to platform_www
    shell.cp(path.join(ROOT, 'bin/template/www/favicon.ico'), platform_www);

    // load manifest to write name/shortname
    var manifest = require(path.join(ROOT, 'bin/template/www', 'manifest.json'));
    manifest.name = project_name;
    manifest.short_name = project_name;
    // copy manifest file to platform_www
    fs.writeFileSync(path.join(platform_www, 'manifest.json'),
        JSON.stringify(manifest, null, 2), 'utf-8');

    return Promise.resolve();
};
