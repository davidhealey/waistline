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

/* globals Promise: true */

var chalk = require('chalk');
var express = require('express');

/**
 * @desc Launches a server with the specified options and optional custom handlers.
 * @param {{root: ?string, port: ?number, noLogOutput: ?bool, noServerInfo: ?bool, router: ?express.Router, events: EventEmitter}} opts
 * @returns {*|promise}
 */
module.exports = function (opts) {

    var that = this;
    var promise = new Promise(function (resolve, reject) {

        opts = opts || {};
        var port = opts.port || 8000;

        var log = module.exports.log = function (msg) {
            if (!opts.noLogOutput) {
                if (opts.events) {
                    opts.events.emit('log', msg);
                } else {
                    console.log(msg);
                }
            }
        };

        var app = that.app;
        var server = require('http').Server(app);
        that.server = server;

        if (opts.router) {
            app.use(opts.router);
        }

        if (opts.root) {
            that.root = opts.root;
            app.use(express.static(opts.root));
        }

        // If we have a project root, make that available as a static root also. This can be useful in cases where source
        // files that have been transpiled (such as TypeScript) are located under the project root on a path that mirrors
        // the the transpiled file's path under the platform root and is pointed to by a map file.
        if (that.projectRoot) {
            app.use(express.static(that.projectRoot));
        }

        var listener = server.listen(port);
        listener.on('listening', function () {
            that.port = port;
            var message = 'Static file server running on: ' + chalk.green('http://localhost:' + port) + ' (CTRL + C to shut down)';
            if (!opts.noServerInfo) {
                log(message);
            }
            resolve(message);
        });
        listener.on('error', function (e) {
            if (e && e.toString().indexOf('EADDRINUSE') > -1) {
                port++;
                server.listen(port);
            } else {
                reject(e);
            }
        });
    });
    return promise;
};
