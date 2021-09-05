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

// @ts-check

const { VError } = require('@netflix/nerror');

/**
 * @public
 * @typedef {Object} CordovaErrorOptions
 * @param {String} [name] - Name of the error.
 * @param {Error} [cause] - Indicates that the new error was caused by `cause`.
 * @param {Object} [info] - Specifies arbitrary informational properties.
 */

/**
 * A custom exception class derived from VError
 */
class CordovaError extends VError {
    /**
     * @param {String} message - Error message
     * @param {Error|CordovaErrorOptions} [causeOrOpts] - The Error that caused
     * this to be thrown or a CordovaErrorOptions object.
     */
    constructor (message, causeOrOpts = {}) {
        const defaults = { name: 'CordovaError' };
        const overrides = { strict: false, skipPrintf: true };
        const userOpts = causeOrOpts instanceof Error
            ? { cause: causeOrOpts }
            : causeOrOpts;
        const opts = Object.assign(defaults, userOpts, overrides);

        super(opts, message);
    }
}

module.exports = CordovaError;
