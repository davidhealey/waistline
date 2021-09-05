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

const fs = require('fs-extra');
const path = require('path');

function isRootDir (dir) {
    if (fs.existsSync(path.join(dir, 'www'))) {
        if (fs.existsSync(path.join(dir, 'config.xml'))) {
            // For sure is.
            return fs.existsSync(path.join(dir, 'platforms')) ? 2 : 1;
        }
        // Might be (or may be under platforms/).
        if (fs.existsSync(path.join(dir, 'www', 'config.xml'))) {
            return 1;
        }
    }

    return 0;
}

// Runs up the directory chain looking for a .cordova directory.
// IF it is found we are in a Cordova project.
// Omit argument to use CWD.
function isCordova (dir) {
    if (!dir) {
        // Prefer PWD over cwd so that symlinked dirs within your PWD work correctly (CB-5687).
        const pwd = process.env.PWD;
        const cwd = process.cwd();
        const hasPwd = pwd && pwd !== cwd && pwd !== 'undefined';

        return (hasPwd && isCordova(pwd)) || isCordova(cwd);
    }

    let bestReturnValueSoFar = false;

    for (let i = 0; i < 1000; ++i) {
        const result = isRootDir(dir);

        if (result === 2) {
            return dir;
        }

        if (result === 1) {
            bestReturnValueSoFar = dir;
        }

        const parentDir = path.normalize(path.join(dir, '..'));
        // Detect fs root.
        if (parentDir === dir) {
            return bestReturnValueSoFar;
        }

        dir = parentDir;
    }

    console.error('Hit an unhandled case in CordovaCheck.isCordova');
    return false;
}

module.exports = {
    findProjectRoot: isCordova
};
