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

var server = require("../src/server");

function expectPromise(obj){
    // 3 slightly different ways of verifying a promise
    expect(typeof obj.then).toBe('function');
    expect(obj instanceof Promise).toBe(true);
    expect(obj).toBe(Promise.resolve(obj));
}

describe('server', function() {

    it('exists and has expected properties', function() {
        expect(server).toBeDefined();
        expect(typeof server).toBe('function');
    });

    it('should return a promise', function(done) {
        var result = server({port:8008,noServerInfo:1});
        expect(result).toBeDefined();
        expectPromise(result);
        result.then(function(res) {
            // console.log("success : " + res);
            done();
        });
        result.catch(function(err){
            // console.log("error : " + err);
            done();
        });
    });
});