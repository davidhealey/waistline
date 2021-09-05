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

const Q = require('q');
const fs = require('fs-extra');
const path = require('path');

const ActionStack = require('./ActionStack');
const PlatformJson = require('./PlatformJson');
const CordovaError = require('./CordovaError');
const PlatformMunger = require('./ConfigChanges/ConfigChanges').PlatformMunger;
const PluginInfoProvider = require('./PluginInfo/PluginInfoProvider');

/**
 * Represents an entity for adding/removing plugins for platforms
 */
class PluginManager {
    /**
     * @param {String} platform Platform name
     * @param {Object} locations - Platform files and directories
     * @param {IDEProject} ideProject The IDE project to add/remove plugin changes to/from
     */
    constructor (platform, locations, ideProject) {
        this.platform = platform;
        this.locations = locations;
        this.project = ideProject;

        const platformJson = PlatformJson.load(locations.root, platform);
        this.munger = new PlatformMunger(platform, locations.root, platformJson, new PluginInfoProvider());
    }

    /**
     * @constructs PluginManager
     * A convenience shortcut to new PluginManager(...)
     *
     * @param {String} platform Platform name
     * @param {Object} locations - Platform files and directories
     * @param {IDEProject} ideProject The IDE project to add/remove plugin changes to/from
     * @returns new PluginManager instance
     */
    static get (platform, locations, ideProject) {
        return new PluginManager(platform, locations, ideProject);
    }

    static get INSTALL () { return 'install'; }

    static get UNINSTALL () { return 'uninstall'; }

    /**
     * Describes and implements common plugin installation/uninstallation routine. The flow is the following:
     *  * Validate and set defaults for options. Note that options are empty by default. Everything
     *    needed for platform IDE project must be passed from outside. Plugin variables (which
     *    are the part of the options) also must be already populated with 'PACKAGE_NAME' variable.
     *  * Collect all plugin's native and web files, get installers/uninstallers and process
     *    all these via ActionStack.
     *  * Save the IDE project, so the changes made by installers are persisted.
     *  * Generate config changes munge for plugin and apply it to all required files
     *  * Generate metadata for plugin and plugin modules and save it to 'cordova_plugins.js'
     *
     * @param {PluginInfo} plugin A PluginInfo structure representing plugin to install
     * @param {Object} [options={}] An installation options. It is expected but is not necessary
     *   that options would contain 'variables' inner object with 'PACKAGE_NAME' field set by caller.
     *
     * @returns {Promise} Returns a Q promise, either resolved in case of success, rejected otherwise.
     */
    doOperation (operation, plugin, options) {
        if (operation !== PluginManager.INSTALL && operation !== PluginManager.UNINSTALL) { return Q.reject(new CordovaError('The parameter is incorrect. The opeation must be either "add" or "remove"')); }

        if (!plugin || plugin.constructor.name !== 'PluginInfo') { return Q.reject(new CordovaError('The parameter is incorrect. The first parameter should be a PluginInfo instance')); }

        // Set default to empty object to play safe when accesing properties
        options = options || {};

        const actions = new ActionStack();

        // gather all files need to be handled during operation ...
        plugin.getFilesAndFrameworks(this.platform, options)
            .concat(plugin.getAssets(this.platform))
            .concat(plugin.getJsModules(this.platform))
            // ... put them into stack ...
            .forEach(item => {
                const installer = this.project.getInstaller(item.itemType);
                const uninstaller = this.project.getUninstaller(item.itemType);
                const actionArgs = [item, plugin, this.project, options];

                let action;
                if (operation === PluginManager.INSTALL) {
                    action = actions.createAction(installer, actionArgs, uninstaller, actionArgs);
                } else /* op === PluginManager.UNINSTALL */{
                    action = actions.createAction(uninstaller, actionArgs, installer, actionArgs);
                }
                actions.push(action);
            });

        // ... and run through the action stack
        return actions.process(this.platform)
            .then(() => {
                if (this.project.write) {
                    this.project.write();
                }

                if (operation === PluginManager.INSTALL) {
                    // Ignore passed `is_top_level` option since platform itself doesn't know
                    // anything about managing dependencies - it's responsibility of caller.
                    this.munger.add_plugin_changes(plugin, options.variables, /* is_top_level= */true, /* should_increment= */true, options.force);
                    this.munger.platformJson.addPluginMetadata(plugin);
                } else {
                    this.munger.remove_plugin_changes(plugin, /* is_top_level= */true);
                    this.munger.platformJson.removePluginMetadata(plugin);
                }

                // Save everything (munge and plugin/modules metadata)
                this.munger.save_all();

                const metadata = this.munger.platformJson.generateMetadata();
                fs.writeFileSync(path.join(this.locations.www, 'cordova_plugins.js'), metadata, 'utf-8');

                // CB-11022 save plugin metadata to both www and platform_www if options.usePlatformWww is specified
                if (options.usePlatformWww) {
                    fs.writeFileSync(path.join(this.locations.platformWww, 'cordova_plugins.js'), metadata, 'utf-8');
                }
            });
    }

    addPlugin (plugin, installOptions) {
        return this.doOperation(PluginManager.INSTALL, plugin, installOptions);
    }

    removePlugin (plugin, uninstallOptions) {
        return this.doOperation(PluginManager.UNINSTALL, plugin, uninstallOptions);
    }
}

module.exports = PluginManager;
