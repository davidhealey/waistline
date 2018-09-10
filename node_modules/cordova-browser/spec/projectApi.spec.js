/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

var Api = require('../bin/template/cordova/Api');
var shell = require('shelljs');
var path = require('path');
var tmpDir = path.join(__dirname, './temp');

describe('can get the Api', function () {

    it('should be defined', function () {
        expect(Api).toBeDefined();
    });

    it('should export static createPlatform function', function (done) {
        expect(Api.createPlatform).toBeDefined();
        expect(typeof Api.createPlatform).toBe('function');

        // TODO: make this do something real
        var promise = Api.createPlatform(tmpDir);
        expect(promise).toBeDefined();
        expect(promise.then).toBeDefined();
        promise.then(function (res) {
            console.log('result = ' + res);
            shell.rm('-rf', tmpDir);
            done();
        },
        function (err) {
            console.log('spec-error ' + err);
            shell.rm('-rf', tmpDir);
            done();
        });
    });

    it('should export static updatePlatform function', function () {
        expect(Api.updatePlatform).toBeDefined();
        expect(typeof Api.updatePlatform).toBe('function');
    });

});

describe('project level Api', function () {

    var testApi = new Api();

    it('can be created', function () {
        expect(testApi).toBeDefined();
    });

    it('has a requirements method', function () {
        expect(testApi.requirements).toBeDefined();
        expect(typeof testApi.requirements).toBe('function');
    });

    it('has a clean method', function () {
        expect(testApi.clean).toBeDefined();
        expect(typeof testApi.clean).toBe('function');
    });

    it('has a run method', function () {
        expect(testApi.run).toBeDefined();
        expect(typeof testApi.run).toBe('function');
    });

    it('has a build method', function () {
        expect(testApi.build).toBeDefined();
        expect(typeof testApi.build).toBe('function');
    });

    it('has a removePlugin method', function () {
        expect(testApi.removePlugin).toBeDefined();
        expect(typeof testApi.removePlugin).toBe('function');
    });

    it('has a addPlugin method', function () {
        expect(testApi.addPlugin).toBeDefined();
        expect(typeof testApi.addPlugin).toBe('function');
    });

    it('has a prepare method', function () {
        expect(testApi.prepare).toBeDefined();
        expect(typeof testApi.prepare).toBe('function');
    });

    it('has a getPlatformInfo method', function () {
        expect(testApi.getPlatformInfo).toBeDefined();
        expect(typeof testApi.getPlatformInfo).toBe('function');
    });

});

// Static methods
// Static method: createPlatform
// returns promise fulfilled with Api
// emits error using provided emmitter on error

// Static method: updatePlatform
// returns a promise fulfilled with an Api
// emits error using provided emmitter on error

// Instance methods
// requirements, clean, run, build, removePlugin, addPlugin, prepare, getPlatformInfo
