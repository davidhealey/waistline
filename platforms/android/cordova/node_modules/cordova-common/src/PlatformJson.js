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

const fs = require('fs-extra');
const path = require('path');
const endent = require('endent');
const mungeutil = require('./ConfigChanges/munge-util');

class PlatformJson {
    constructor (filePath, platform, root) {
        this.filePath = filePath;
        this.platform = platform;
        this.root = fix_munge(root || {});
    }

    static load (plugins_dir, platform) {
        const filePath = path.join(plugins_dir, `${platform}.json`);
        const root = fs.existsSync(filePath)
            ? fs.readJsonSync(filePath)
            : null;

        return new PlatformJson(filePath, platform, root);
    }

    save () {
        fs.outputJsonSync(this.filePath, this.root, { spaces: 2 });
    }

    /**
     * Indicates whether the specified plugin is installed as a top-level (not as
     * dependency to others)
     *
     * @param  {String} pluginId A plugin id to check for.
     * @return {Boolean} true if plugin installed as top-level, otherwise false.
     */
    isPluginTopLevel (pluginId) {
        return this.root.installed_plugins[pluginId];
    }

    /**
     * Indicates whether the specified plugin is installed as a dependency to other
     * plugin.
     *
     * @param  {String} pluginId A plugin id to check for.
     * @return {Boolean} true if plugin installed as a dependency, otherwise false.
     */
    isPluginDependent (pluginId) {
        return this.root.dependent_plugins[pluginId];
    }

    /**
     * Indicates whether plugin is installed either as top-level or as dependency.
     *
     * @param  {String} pluginId A plugin id to check for.
     * @return {Boolean} true if plugin installed, otherwise false.
     */
    isPluginInstalled (pluginId) {
        return this.isPluginTopLevel(pluginId) ||
            this.isPluginDependent(pluginId);
    }

    addPlugin (pluginId, variables, isTopLevel) {
        const pluginsList = isTopLevel
            ? this.root.installed_plugins
            : this.root.dependent_plugins;

        pluginsList[pluginId] = variables;

        return this;
    }

    /**
     * @chaining
     * Generates and adds metadata for provided plugin into associated <platform>.json file
     *
     * @param   {PluginInfo}  pluginInfo  A pluginInfo instance to add metadata from
     * @returns {this} Current PlatformJson instance to allow calls chaining
     */
    addPluginMetadata (pluginInfo) {
        const installedModules = this.root.modules || [];
        const installedPaths = installedModules.map(m => m.file);
        const modulesToInstall = pluginInfo.getJsModules(this.platform)
            .map(module => new ModuleMetadata(pluginInfo.id, module))
            // Filter out modules which are already added to metadata
            .filter(metadata => !installedPaths.includes(metadata.file));

        this.root.modules = installedModules.concat(modulesToInstall);
        this.root.plugin_metadata = this.root.plugin_metadata || {};
        this.root.plugin_metadata[pluginInfo.id] = pluginInfo.version;

        return this;
    }

    removePlugin (pluginId, isTopLevel) {
        const pluginsList = isTopLevel
            ? this.root.installed_plugins
            : this.root.dependent_plugins;

        delete pluginsList[pluginId];

        return this;
    }

    /**
     * @chaining
     * Removes metadata for provided plugin from associated file
     *
     * @param   {PluginInfo}  pluginInfo A PluginInfo instance to which modules' metadata
     *   we need to remove
     *
     * @returns {this} Current PlatformJson instance to allow calls chaining
     */
    removePluginMetadata (pluginInfo) {
        const installedModules = this.root.modules || [];
        const modulesToRemove = pluginInfo.getJsModules(this.platform)
            .map(jsModule => ['plugins', pluginInfo.id, jsModule.src].join('/'));

        // Leave only those metadatas which 'file' is not in removed modules
        this.root.modules = installedModules
            .filter(m => !modulesToRemove.includes(m.file));

        if (this.root.plugin_metadata) {
            delete this.root.plugin_metadata[pluginInfo.id];
        }

        return this;
    }

    addInstalledPluginToPrepareQueue (pluginDirName, vars, is_top_level, force) {
        this.root.prepare_queue.installed.push({ plugin: pluginDirName, vars, topLevel: is_top_level, force });
    }

    addUninstalledPluginToPrepareQueue (pluginId, is_top_level) {
        this.root.prepare_queue.uninstalled.push({ plugin: pluginId, id: pluginId, topLevel: is_top_level });
    }

    /**
     * Moves plugin, specified by id to top-level plugins. If plugin is top-level
     *  already, then does nothing.
     *
     * @param  {String} pluginId A plugin id to make top-level.
     * @return {PlatformJson} PlatformJson instance.
     */
    makeTopLevel (pluginId) {
        const plugin = this.root.dependent_plugins[pluginId];

        if (plugin) {
            delete this.root.dependent_plugins[pluginId];
            this.root.installed_plugins[pluginId] = plugin;
        }

        return this;
    }

    /**
     * Generates a metadata for all installed plugins and js modules. The resultant
     *   string is ready to be written to 'cordova_plugins.js'
     *
     * @returns {String} cordova_plugins.js contents
     */
    generateMetadata () {
        const stringify = o => JSON.stringify(o, null, 2);
        return endent`
            cordova.define('cordova/plugin_list', function(require, exports, module) {
              module.exports = ${stringify(this.root.modules)};
              module.exports.metadata = ${stringify(this.root.plugin_metadata)};
            });
        `;
    }

    /**
     * @chaining
     * Generates and then saves metadata to specified file. Doesn't check if file exists.
     *
     * @param {String} destination  File metadata will be written to
     * @return {PlatformJson} PlatformJson instance
     */
    generateAndSaveMetadata (destination) {
        fs.outputFileSync(destination, this.generateMetadata());

        return this;
    }
}

// convert a munge from the old format ([file][parent][xml] = count) to the current one
function fix_munge (root) {
    root.prepare_queue = root.prepare_queue || { installed: [], uninstalled: [] };
    root.config_munge = root.config_munge || { files: {} };
    root.installed_plugins = root.installed_plugins || {};
    root.dependent_plugins = root.dependent_plugins || {};

    const munge = root.config_munge;
    if (!munge.files) {
        const new_munge = { files: {} };

        for (const file in munge) {
            for (const selector in munge[file]) {
                for (const xml_child in munge[file][selector]) {
                    const val = parseInt(munge[file][selector][xml_child]);
                    for (let i = 0; i < val; i++) {
                        mungeutil.deep_add(new_munge, [file, selector, { xml: xml_child, count: val }]);
                    }
                }
            }
        }

        root.config_munge = new_munge;
    }

    return root;
}

class ModuleMetadata {
    /**
     * Creates a ModuleMetadata object that represents module entry in 'cordova_plugins.js'
     * file at run time
     *
     * @param {String}  pluginId  Plugin id where this module installed from
     * @param (JsModule|Object)  jsModule  A js-module entry from PluginInfo class to generate metadata for
     */
    constructor (pluginId, jsModule) {
        if (!pluginId) throw new TypeError('pluginId argument must be a valid plugin id');
        if (!jsModule.src && !jsModule.name) throw new TypeError('jsModule argument must contain src or/and name properties');

        this.id = `${pluginId}.${jsModule.name || jsModule.src.match(/([^/]+)\.js/)[1]}`;
        this.file = ['plugins', pluginId, jsModule.src].join('/');
        this.pluginId = pluginId;

        if (jsModule.clobbers && jsModule.clobbers.length > 0) {
            this.clobbers = jsModule.clobbers.map(o => o.target);
        }

        if (jsModule.merges && jsModule.merges.length > 0) {
            this.merges = jsModule.merges.map(o => o.target);
        }

        if (jsModule.runs) {
            this.runs = true;
        }
    }
}

module.exports = PlatformJson;
