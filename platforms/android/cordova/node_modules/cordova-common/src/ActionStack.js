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

const events = require('./events');
const Q = require('q');

class ActionStack {
    constructor () {
        this.stack = [];
        this.completed = [];
    }

    createAction (handler, action_params, reverter, revert_params) {
        return {
            handler: {
                run: handler,
                params: action_params
            },
            reverter: {
                run: reverter,
                params: revert_params
            }
        };
    }

    push (tx) {
        this.stack.push(tx);
    }

    // Returns a promise.
    process (platform) {
        events.emit('verbose', `Beginning processing of action stack for ${platform} project...`);

        while (this.stack.length) {
            const action = this.stack.shift();
            const handler = action.handler.run;
            const action_params = action.handler.params;

            try {
                handler.apply(null, action_params);
            } catch (e) {
                events.emit('warn', 'Error during processing of action! Attempting to revert...');
                this.stack.unshift(action);
                let issue = 'Uh oh!\n';
                // revert completed tasks
                while (this.completed.length) {
                    const undo = this.completed.shift();
                    const revert = undo.reverter.run;
                    const revert_params = undo.reverter.params;

                    try {
                        revert.apply(null, revert_params);
                    } catch (err) {
                        events.emit('warn', 'Error during reversion of action! We probably really messed up your project now, sorry! D:');
                        issue += `A reversion action failed: ${err.message}\n`;
                    }
                }
                e.message = issue + e.message;
                return Q.reject(e);
            }
            this.completed.push(action);
        }
        events.emit('verbose', 'Action stack processing complete.');

        return Q();
    }
}

module.exports = ActionStack;
