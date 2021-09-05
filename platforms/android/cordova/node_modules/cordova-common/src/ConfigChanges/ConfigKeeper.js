/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

const path = require('path');
const ConfigFile = require('./ConfigFile');

/******************************************************************************
* ConfigKeeper class
*
* Used to load and store config files to avoid re-parsing and writing them out
* multiple times.
*
* The config files are referred to by a fake path constructed as
* project_dir/platform/file
* where file is the name used for the file in config munges.
******************************************************************************/
class ConfigKeeper {
    constructor (project_dir, plugins_dir) {
        this.project_dir = project_dir;
        this.plugins_dir = plugins_dir;
        this._cache = new Map();
    }

    get (project_dir, platform, file) {
        // This fixes a bug with older plugins - when specifying config xml instead of res/xml/config.xml
        // https://issues.apache.org/jira/browse/CB-6414
        if (file === 'config.xml' && platform === 'android') {
            file = 'res/xml/config.xml';
        }

        const fake_path = path.join(project_dir, platform, file);

        if (!this._cache.has(fake_path)) {
            // File was not cached, need to load.
            const config_file = new ConfigFile(project_dir, platform, file);
            this._cache.set(fake_path, config_file);
        }

        return this._cache.get(fake_path);
    }

    save_all () {
        this._cache.forEach(config_file => {
            if (config_file.is_changed) config_file.save();
        });
    }
}

module.exports = ConfigKeeper;
