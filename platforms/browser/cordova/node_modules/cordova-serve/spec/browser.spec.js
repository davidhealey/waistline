/**
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
var child_process = require('child_process');
var rewire = require('rewire');

var browser = rewire("../src/browser");

function expectPromise(obj){
    // 3 slightly different ways of verifying a promise
    expect(typeof obj.then).toBe('function');
    expect(obj instanceof Promise).toBe(true);
    expect(obj).toBe(Promise.resolve(obj));
}

describe('browser', function() {

    it('exists and has expected properties', function() {
        expect(browser).toBeDefined();
        expect(typeof browser).toBe('function');
    });

    it('should return a promise', function(done) {
        var result = browser();
        expect(result).toBeDefined();
        expectPromise(result);
        result.then(function(res) {
            done();
        });
        result.catch(function(err){
            done();
        });
    });

    it('should call open() when target is `default`', function(done) {

        var mockOpen = jasmine.createSpy('mockOpen');
        var origOpen = browser.__get__('open'); // so we can be nice and restore it later

        browser.__set__('open',mockOpen);

        var mockUrl = 'this is the freakin url';

        var result = browser({target:'default',url:mockUrl});
        expect(result).toBeDefined();
        expectPromise(result);
        result.then(function(res) {
            done();
        });

        expect(mockOpen).toHaveBeenCalledWith(mockUrl);
        browser.__set__('open', origOpen);

    });
});