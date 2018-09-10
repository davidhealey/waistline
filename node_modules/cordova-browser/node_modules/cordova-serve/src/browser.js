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

var child_process = require('child_process');
var fs = require('fs');
var open = require('open');
var exec = require('./exec');

var NOT_INSTALLED = 'The browser target is not installed: %target%';
var NOT_SUPPORTED = 'The browser target is not supported: %target%';

/**
 * Launches the specified browser with the given URL.
 * Based on https://github.com/domenic/opener
 * @param {{target: ?string, url: ?string, dataDir: ?string}} opts - parameters:
 *   target - the target browser - ie, chrome, safari, opera, firefox or chromium
 *   url - the url to open in the browser
 *   dataDir - a data dir to provide to Chrome (can be used to force it to open in a new window)
 * @return {Promise} Promise to launch the specified browser
 */
module.exports = function (opts) {

    opts = opts || {};
    var target = opts.target || 'default';
    var url = opts.url || '';

    target = target.toLowerCase();
    if (target === 'default') {
        open(url);
        return Promise.resolve();
    } else {
        return getBrowser(target, opts.dataDir).then(function (browser) {
            var args;
            var urlAdded = false;

            switch (process.platform) {
            case 'darwin':
                args = ['open'];
                if (target === 'chrome') {
                    // Chrome needs to be launched in a new window. Other browsers, particularly, opera does not work with this.
                    args.push('-n');
                }
                args.push('-a', browser);
                break;
            case 'win32':
                // On Windows, we really want to use the "start" command. But, the rules regarding arguments with spaces, and
                // escaping them with quotes, can get really arcane. So the easiest way to deal with this is to pass off the
                // responsibility to "cmd /c", which has that logic built in.
                //
                // Furthermore, if "cmd /c" double-quoted the first parameter, then "start" will interpret it as a window title,
                // so we need to add a dummy empty-string window title: http://stackoverflow.com/a/154090/3191

                if (target === 'edge') {
                    browser += ':' + url;
                    urlAdded = true;
                }

                args = ['cmd /c start ""', browser];
                break;
            case 'linux':
                // if a browser is specified, launch it with the url as argument
                // otherwise, use xdg-open.
                args = [browser];
                break;
            }

            if (!urlAdded) {
                args.push(url);
            }
            var command = args.join(' ');
            var result = exec(command);
            result.catch(function () {
                // Assume any error means that the browser is not installed and display that as a more friendly error.
                throw new Error(NOT_INSTALLED.replace('%target%', target));
            });
            return result;

            // return exec(command).catch(function (error) {
            //     // Assume any error means that the browser is not installed and display that as a more friendly error.
            //     throw new Error(NOT_INSTALLED.replace('%target%', target));
            // });
        });
    }
};

function getBrowser (target, dataDir) {
    dataDir = dataDir || 'temp_chrome_user_data_dir_for_cordova';

    var chromeArgs = ' --user-data-dir=/tmp/' + dataDir;
    var browsers = {
        'win32': {
            'ie': 'iexplore',
            'chrome': 'chrome --user-data-dir=%TEMP%\\' + dataDir,
            'safari': 'safari',
            'opera': 'opera',
            'firefox': 'firefox',
            'edge': 'microsoft-edge'
        },
        'darwin': {
            'chrome': '"Google Chrome" --args' + chromeArgs,
            'safari': 'safari',
            'firefox': 'firefox',
            'opera': 'opera'
        },
        'linux': {
            'chrome': 'google-chrome' + chromeArgs,
            'chromium': 'chromium-browser' + chromeArgs,
            'firefox': 'firefox',
            'opera': 'opera'
        }
    };

    if (target in browsers[process.platform]) {
        var browser = browsers[process.platform][target];
        return checkBrowserExistsWindows(browser, target).then(function () {
            return Promise.resolve(browser);
        });
    } else {
        return Promise.reject(NOT_SUPPORTED.replace('%target%', target));
    }

}

// err might be null, in which case defaultMsg is used.
// target MUST be defined or an error is thrown.
function getErrorMessage (err, target, defaultMsg) {
    var errMessage;
    if (err) {
        errMessage = err.toString();
    } else {
        errMessage = defaultMsg;
    }
    return errMessage.replace('%target%', target);
}

function checkBrowserExistsWindows (browser, target) {
    var promise = new Promise(function (resolve, reject) {
        // Windows displays a dialog if the browser is not installed. We'd prefer to avoid that.
        if (process.platform === 'win32') {
            if (target === 'edge') {
                edgeSupported().then(function () {
                    resolve();
                })
                    .catch(function (err) {
                        var errMessage = getErrorMessage(err, target, NOT_INSTALLED);
                        reject(errMessage);
                    });
            } else {
                browserInstalled(browser).then(function () {
                    resolve();
                })
                    .catch(function (err) {
                        var errMessage = getErrorMessage(err, target, NOT_INSTALLED);
                        reject(errMessage);
                    });
            }
        } else {
            resolve();
        }

    });
    return promise;
}

function edgeSupported () {
    var prom = new Promise(function (resolve, reject) {
        child_process.exec('ver', function (err, stdout, stderr) {
            if (err || stderr) {
                reject(err || stderr);
            } else {
                var windowsVersion = stdout.match(/([0-9.])+/g)[0];
                if (parseInt(windowsVersion) < 10) {
                    reject(new Error('The browser target is not supported on this version of Windows: %target%'));
                } else {
                    resolve();
                }
            }
        });
    });
    return prom;
}

var regItemPattern = /\s*\(Default\)\s+(REG_SZ)\s+([^\s].*)\s*/;
function browserInstalled (browser) {
    // On Windows, the 'start' command searches the path then 'App Paths' in the registry.
    // We do the same here. Note that the start command uses the PATHEXT environment variable
    // for the list of extensions to use if no extension is provided. We simplify that to just '.EXE'
    // since that is what all the supported browsers use. Check path (simple but usually won't get a hit)

    var promise = new Promise(function (resolve, reject) {
        if (require('shelljs').which(browser)) {
            return resolve();
        } else {
            var regQPre = 'reg QUERY "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\';
            var regQPost = '.EXE" /v ""';
            var regQuery = regQPre + browser.split(' ')[0] + regQPost;

            child_process.exec(regQuery, function (err, stdout, stderr) {
                if (err) {
                    // The registry key does not exist, which just means the app is not installed.
                    reject(err);
                } else {
                    var result = regItemPattern.exec(stdout);
                    if (fs.existsSync(trimRegPath(result[2]))) {
                        resolve();
                    } else {
                        // The default value is not a file that exists, which means the app is not installed.
                        reject(new Error(NOT_INSTALLED));
                    }
                }
            });
        }
    });
    return promise;
}

function trimRegPath (path) {
    // Trim quotes and whitespace
    return path.replace(/^[\s"]+|[\s"]+$/g, '');
}
