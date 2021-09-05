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

/*
 * This module deals with shared configuration / dependency "stuff". That is:
 * - XML configuration files such as config.xml, AndroidManifest.xml or WMAppManifest.xml.
 * - plist files in iOS
 * Essentially, any type of shared resources that we need to handle with awareness
 * of how potentially multiple plugins depend on a single shared resource, should be
 * handled in this module.
 *
 * The implementation uses an object as a hash table, with "leaves" of the table tracking
 * reference counts.
 */

const path = require('path');
const et = require('elementtree');
const ConfigKeeper = require('./ConfigKeeper');
const events = require('../events');
const mungeutil = require('./munge-util');
const xml_helpers = require('../util/xml-helpers');

exports.process = (plugins_dir, project_dir, platform, platformJson, pluginInfoProvider) => {
    const munger = new PlatformMunger(platform, project_dir, platformJson, pluginInfoProvider);
    munger.process(plugins_dir);
    munger.save_all();
};

/******************************************************************************
* PlatformMunger class
*
* Can deal with config file of a single project.
* Parsed config files are cached in a ConfigKeeper object.
******************************************************************************/
class PlatformMunger {
    constructor (platform, project_dir, platformJson, pluginInfoProvider) {
        this.platform = platform;
        this.project_dir = project_dir;
        this.config_keeper = new ConfigKeeper(project_dir);
        this.platformJson = platformJson;
        this.pluginInfoProvider = pluginInfoProvider;
    }

    // Write out all unsaved files.
    save_all () {
        this.config_keeper.save_all();
        this.platformJson.save();
    }

    // Apply a munge object to a single config file.
    // The remove parameter tells whether to add the change or remove it.
    apply_file_munge (file, munge, remove) {
        for (const selector in munge.parents) {
            for (const xml_child in munge.parents[selector]) {
                // this xml child is new, graft it (only if config file exists)
                const config_file = this.config_keeper.get(this.project_dir, this.platform, file);

                if (config_file.exists) {
                    const operation = remove ? 'prune_child' : 'graft_child';
                    config_file[operation](selector, munge.parents[selector][xml_child]);
                } else {
                    events.emit('warn', `config file ${file} requested for changes not found at ${config_file.filepath}, ignoring`);
                }
            }
        }
    }

    remove_plugin_changes (pluginInfo, is_top_level) {
        const platform_config = this.platformJson.root;
        const plugin_vars = is_top_level
            ? platform_config.installed_plugins[pluginInfo.id]
            : platform_config.dependent_plugins[pluginInfo.id];
        let edit_config_changes = null;

        if (pluginInfo.getEditConfigs) {
            edit_config_changes = pluginInfo.getEditConfigs(this.platform);
        }

        // get config munge, aka how did this plugin change various config files
        const config_munge = this.generate_plugin_config_munge(pluginInfo, plugin_vars, edit_config_changes);
        // global munge looks at all plugins' changes to config files
        const global_munge = platform_config.config_munge;
        const munge = mungeutil.decrement_munge(global_munge, config_munge);

        for (const file in munge.files) {
            this.apply_file_munge(file, munge.files[file], /* remove = */ true);
        }

        // Remove from installed_plugins
        this.platformJson.removePlugin(pluginInfo.id, is_top_level);

        return this;
    }

    add_plugin_changes (pluginInfo, plugin_vars, is_top_level, should_increment, plugin_force) {
        const platform_config = this.platformJson.root;
        let config_munge;
        let edit_config_changes = null;

        if (pluginInfo.getEditConfigs) {
            edit_config_changes = pluginInfo.getEditConfigs(this.platform);
        }

        if (!edit_config_changes || edit_config_changes.length === 0) {
            // get config munge, aka how should this plugin change various config files
            config_munge = this.generate_plugin_config_munge(pluginInfo, plugin_vars);
        } else {
            const isConflictingInfo = this._is_conflicting(edit_config_changes, platform_config.config_munge, plugin_force);

            if (isConflictingInfo.conflictWithConfigxml) {
                throw new Error(`${pluginInfo.id} cannot be added. <edit-config> changes in this plugin conflicts with <edit-config> changes in config.xml. Conflicts must be resolved before plugin can be added.`);
            }
            if (plugin_force) {
                events.emit('warn', '--force is used. edit-config will overwrite conflicts if any. Conflicting plugins may not work as expected.');

                // remove conflicting munges
                const conflict_munge = mungeutil.decrement_munge(platform_config.config_munge, isConflictingInfo.conflictingMunge);
                for (const conflict_file in conflict_munge.files) {
                    this.apply_file_munge(conflict_file, conflict_munge.files[conflict_file], /* remove = */ true);
                }

                // force add new munges
                config_munge = this.generate_plugin_config_munge(pluginInfo, plugin_vars, edit_config_changes);
            } else if (isConflictingInfo.conflictFound) {
                throw new Error(`There was a conflict trying to modify attributes with <edit-config> in plugin ${pluginInfo.id}. The conflicting plugin, ${isConflictingInfo.conflictingPlugin}, already modified the same attributes. The conflict must be resolved before ${pluginInfo.id} can be added. You may use --force to add the plugin and overwrite the conflicting attributes.`);
            } else {
                // no conflicts, will handle edit-config
                config_munge = this.generate_plugin_config_munge(pluginInfo, plugin_vars, edit_config_changes);
            }
        }

        this._munge_helper(should_increment, platform_config, config_munge);

        // Move to installed/dependent_plugins
        this.platformJson.addPlugin(pluginInfo.id, plugin_vars || {}, is_top_level);

        return this;
    }

    // Handle edit-config changes from config.xml
    add_config_changes (config, should_increment) {
        const platform_config = this.platformJson.root;
        let changes = [];

        if (config.getEditConfigs) {
            const edit_config_changes = config.getEditConfigs(this.platform);
            if (edit_config_changes) {
                changes = changes.concat(edit_config_changes);
            }
        }

        if (config.getConfigFiles) {
            const config_files_changes = config.getConfigFiles(this.platform);
            if (config_files_changes) {
                changes = changes.concat(config_files_changes);
            }
        }

        if (changes && changes.length > 0) {
            const isConflictingInfo = this._is_conflicting(changes, platform_config.config_munge, true /* always force overwrite other edit-config */);
            if (isConflictingInfo.conflictFound) {
                if (Object.keys(isConflictingInfo.configxmlMunge.files).length !== 0) {
                    // silently remove conflicting config.xml munges so new munges can be added
                    const conflict_munge = mungeutil.decrement_munge(platform_config.config_munge, isConflictingInfo.configxmlMunge);
                    for (const conflict_file in conflict_munge.files) {
                        this.apply_file_munge(conflict_file, conflict_munge.files[conflict_file], /* remove = */ true);
                    }
                }

                if (Object.keys(isConflictingInfo.conflictingMunge.files).length !== 0) {
                    events.emit('warn', 'Conflict found, edit-config changes from config.xml will overwrite plugin.xml changes');

                    // remove conflicting plugin.xml munges
                    const conflict_munge = mungeutil.decrement_munge(platform_config.config_munge, isConflictingInfo.conflictingMunge);
                    for (const conflict_file in conflict_munge.files) {
                        this.apply_file_munge(conflict_file, conflict_munge.files[conflict_file], /* remove = */ true);
                    }
                }
            }
        }

        // Add config.xml edit-config and config-file munges
        const config_munge = this.generate_config_xml_munge(config, changes, 'config.xml');
        this._munge_helper(should_increment, platform_config, config_munge);

        // Move to installed/dependent_plugins
        return this;
    }

    /** @private */
    _munge_helper (should_increment, platform_config, config_munge) {
        // global munge looks at all changes to config files
        // TODO: The should_increment param is only used by cordova-cli and is going away soon.
        // If should_increment is set to false, avoid modifying the global_munge (use clone)
        // and apply the entire config_munge because it's already a proper subset of the global_munge.

        const global_munge = platform_config.config_munge;
        const munge = should_increment
            ? mungeutil.increment_munge(global_munge, config_munge)
            : config_munge;

        for (const file in munge.files) {
            this.apply_file_munge(file, munge.files[file]);
        }

        return this;
    }

    // Load the global munge from platform json and apply all of it.
    // Used by cordova prepare to re-generate some config file from platform
    // defaults and the global munge.
    reapply_global_munge () {
        const platform_config = this.platformJson.root;
        const global_munge = platform_config.config_munge;
        for (const file in global_munge.files) {
            this.apply_file_munge(file, global_munge.files[file]);
        }

        return this;
    }

    // generate_config_xml_munge
    // Generate the munge object from config.xml
    generate_config_xml_munge (config, config_changes, type) {
        const munge = { files: {} };

        if (!config_changes) return munge;

        const id = type === 'config.xml' ? type : config.id;

        config_changes.forEach(change => {
            change.xmls.forEach(xml => {
                // 1. stringify each xml
                const stringified = (new et.ElementTree(xml)).write({ xml_declaration: false });
                // 2. add into munge
                if (change.mode) {
                    mungeutil.deep_add(munge, change.file, change.target, { xml: stringified, count: 1, mode: change.mode, id });
                } else {
                    mungeutil.deep_add(munge, change.target, change.parent, { xml: stringified, count: 1, after: change.after });
                }
            });
        });

        return munge;
    }

    // generate_plugin_config_munge
    // Generate the munge object from plugin.xml + vars
    generate_plugin_config_munge (pluginInfo, vars, edit_config_changes) {
        vars = vars || {};
        const munge = { files: {} };
        const changes = pluginInfo.getConfigFiles(this.platform);

        if (edit_config_changes) {
            Array.prototype.push.apply(changes, edit_config_changes);
        }

        changes.forEach(change => {
            change.xmls.forEach(xml => {
                // 1. stringify each xml
                let stringified = (new et.ElementTree(xml)).write({ xml_declaration: false });
                // interp vars
                Object.keys(vars).forEach(key => {
                    const regExp = new RegExp(`\\$${key}`, 'g');
                    stringified = stringified.replace(regExp, vars[key]);
                });
                // 2. add into munge
                if (change.mode) {
                    if (change.mode !== 'remove') {
                        mungeutil.deep_add(munge, change.file, change.target, { xml: stringified, count: 1, mode: change.mode, plugin: pluginInfo.id });
                    }
                } else {
                    mungeutil.deep_add(munge, change.target, change.parent, { xml: stringified, count: 1, after: change.after });
                }
            });
        });

        return munge;
    }

    /** @private */
    _is_conflicting (editchanges, config_munge, force) {
        const files = config_munge.files;
        let conflictFound = false;
        let conflictWithConfigxml = false;
        const conflictingMunge = { files: {} };
        const configxmlMunge = { files: {} };
        let conflictingParent;
        let conflictingPlugin;

        editchanges.forEach(editchange => {
            if (files[editchange.file]) {
                const parents = files[editchange.file].parents;
                let target = parents[editchange.target];

                // Check if the edit target will resolve to an existing target
                if (!target || target.length === 0) {
                    const file_xml = this.config_keeper.get(this.project_dir, this.platform, editchange.file).data;
                    const resolveEditTarget = xml_helpers.resolveParent(file_xml, editchange.target);
                    let resolveTarget;

                    if (resolveEditTarget) {
                        for (const parent in parents) {
                            resolveTarget = xml_helpers.resolveParent(file_xml, parent);
                            if (resolveEditTarget === resolveTarget) {
                                conflictingParent = parent;
                                target = parents[parent];
                                break;
                            }
                        }
                    }
                } else {
                    conflictingParent = editchange.target;
                }

                if (target && target.length !== 0) {
                    // conflict has been found
                    conflictFound = true;

                    if (editchange.id === 'config.xml') {
                        if (target[0].id === 'config.xml') {
                            // Keep track of config.xml/config.xml edit-config conflicts
                            mungeutil.deep_add(configxmlMunge, editchange.file, conflictingParent, target[0]);
                        } else {
                            // Keep track of config.xml x plugin.xml edit-config conflicts
                            mungeutil.deep_add(conflictingMunge, editchange.file, conflictingParent, target[0]);
                        }
                    } else {
                        if (target[0].id === 'config.xml') {
                            // plugin.xml cannot overwrite config.xml changes even if --force is used
                            conflictWithConfigxml = true;
                            return;
                        }

                        if (force) {
                            // Need to find all conflicts when --force is used, track conflicting munges
                            mungeutil.deep_add(conflictingMunge, editchange.file, conflictingParent, target[0]);
                        } else {
                            // plugin cannot overwrite other plugin changes without --force
                            conflictingPlugin = target[0].plugin;
                        }
                    }
                }
            }
        });

        return {
            conflictFound,
            conflictingPlugin,
            conflictingMunge,
            configxmlMunge,
            conflictWithConfigxml
        };
    }

    // Go over the prepare queue and apply the config munges for each plugin
    // that has been (un)installed.
    process (plugins_dir) {
        const platform_config = this.platformJson.root;

        // Uninstallation first
        platform_config.prepare_queue.uninstalled.forEach(u => {
            const pluginInfo = this.pluginInfoProvider.get(path.join(plugins_dir, u.plugin));
            this.remove_plugin_changes(pluginInfo, u.topLevel);
        });

        // Now handle installation
        platform_config.prepare_queue.installed.forEach(u => {
            const pluginInfo = this.pluginInfoProvider.get(path.join(plugins_dir, u.plugin));
            this.add_plugin_changes(pluginInfo, u.vars, u.topLevel, true, u.force);
        });

        // Empty out installed/ uninstalled queues.
        platform_config.prepare_queue.uninstalled = [];
        platform_config.prepare_queue.installed = [];
    }
}

exports.PlatformMunger = PlatformMunger;
