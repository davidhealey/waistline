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

const path = require('path');
const fs = require('fs-extra');
const { parseElementtreeSync } = require('../util/xml-helpers');
const CordovaError = require('../CordovaError');

/**
 * A class for holding the information currently stored in plugin.xml
 *
 * It should also be able to answer questions like whether the plugin
 * is compatible with a given engine version.
 */
class PluginInfo {
    constructor (dirname) {
        this.dir = dirname;
        this.filepath = path.join(dirname, 'plugin.xml');

        if (!fs.existsSync(this.filepath)) {
            throw new CordovaError(`Cannot find plugin.xml for plugin "${path.basename(dirname)}". Please try adding it again.`);
        }

        this._et = parseElementtreeSync(this.filepath);
        const root = this._et.getroot();

        this.id = root.attrib.id;
        this.version = root.attrib.version;

        // Optional fields
        const optTags = 'name description license repo issue info'.split(' ');
        for (const tag of optTags) {
            this[tag] = root.findtext(tag);
        }

        const keywordText = root.findtext('keywords');
        this.keywords = keywordText && keywordText.split(',').map(s => s.trim());
    }

    /**
     * <preference> tag
     *
     * Used to require a variable to be specified via --variable when installing the plugin.
     *
     * @example <preference name="API_KEY" />
     *
     * @param {string} platform
     * @return {Object} { key : default | null}
    */
    getPreferences (platform) {
        return this._getTags('preference', platform).map(({ attrib }) => ({
            [attrib.name.toUpperCase()]: attrib.default || null
        }))
            .reduce((acc, pref) => Object.assign(acc, pref), {});
    }

    /**
     * <asset>
     *
     * @param {string} platform
     */
    getAssets (platform) {
        return this._getTags('asset', platform).map(({ attrib }) => {
            const src = attrib.src;
            const target = attrib.target;

            if (!src || !target) {
                throw new Error(`Malformed <asset> tag. Both "src" and "target" attributes must be specified in ${this.filepath}`);
            }

            return { itemType: 'asset', src, target };
        });
    }

    /**
     * <dependency>
     *
     * @example
     * <dependency id="com.plugin.id"
     *  url="https://github.com/myuser/someplugin"
     *  commit="428931ada3891801"
     *  subdir="some/path/here" />
     *
     * @param {string} platform
     */
    getDependencies (platform) {
        return this._getTags('dependency', platform).map(({ attrib }) => {
            if (!attrib.id) {
                throw new CordovaError(`<dependency> tag is missing id attribute in ${this.filepath}`);
            }

            return {
                id: attrib.id,
                version: attrib.version || '',
                url: attrib.url || '',
                subdir: attrib.subdir || '',
                commit: attrib.commit,
                git_ref: attrib.commit
            };
        });
    }

    /**
     * <config-file> tag
     *
     * @param {string} platform
     */
    getConfigFiles (platform) {
        return this._getTags('config-file', platform).map(tag => ({
            target: tag.attrib.target,
            parent: tag.attrib.parent,
            after: tag.attrib.after,
            xmls: tag.getchildren(),
            // To support demuxing via versions
            versions: tag.attrib.versions,
            deviceTarget: tag.attrib['device-target']
        }));
    }

    /**
     * <edit-config> tag
     *
     * @param {string} platform
     */
    getEditConfigs (platform) {
        return this._getTags('edit-config', platform).map(tag => ({
            file: tag.attrib.file,
            target: tag.attrib.target,
            mode: tag.attrib.mode,
            xmls: tag.getchildren()
        }));
    }

    /**
     * <info> tags, both global and within a <platform>
     *
     * @param {string} platform
     */
    // TODO (kamrik): Do we ever use <info> under <platform>? Example wanted.
    getInfo (platform) {
        return this._getTags('info', platform).map(elem => elem.text)
            // Filter out any undefined or empty strings.
            .filter(Boolean);
    }

    /**
     * <source-file>
     *
     * @example
     * <source-file src="src/ios/someLib.a" framework="true" />
     * <source-file src="src/ios/someLib.a" compiler-flags="-fno-objc-arc" />
     *
     * @param {string} platform
     */
    getSourceFiles (platform) {
        return this._getTagsInPlatform('source-file', platform).map(({ attrib }) => ({
            itemType: 'source-file',
            src: attrib.src,
            framework: isStrTrue(attrib.framework),
            weak: isStrTrue(attrib.weak),
            compilerFlags: attrib['compiler-flags'],
            targetDir: attrib['target-dir']
        }));
    }

    /**
     * <header-file>
     *
     * @example <header-file src="CDVFoo.h" />
     *
     * @param {string} platform
     */
    getHeaderFiles (platform) {
        return this._getTagsInPlatform('header-file', platform).map(({ attrib }) => ({
            itemType: 'header-file',
            src: attrib.src,
            targetDir: attrib['target-dir'],
            type: attrib.type
        }));
    }

    /**
     * <resource-file>
     *
     * @example
     * <resource-file
     *     src="FooPluginStrings.xml"
     *     target="res/values/FooPluginStrings.xml"
     *     device-target="win"
     *     arch="x86"
     *     versions=">=8.1"
     * />
     *
     * @param {string} platform
     */
    getResourceFiles (platform) {
        return this._getTagsInPlatform('resource-file', platform).map(({ attrib }) => ({
            itemType: 'resource-file',
            src: attrib.src,
            target: attrib.target,
            versions: attrib.versions,
            deviceTarget: attrib['device-target'],
            arch: attrib.arch,
            reference: attrib.reference
        }));
    }

    /**
     * <lib-file>
     *
     * @example
     * <lib-file src="src/BlackBerry10/native/device/libfoo.so" arch="device" />
     *
     * @param {string} platform
     */
    getLibFiles (platform) {
        return this._getTagsInPlatform('lib-file', platform).map(({ attrib }) => ({
            itemType: 'lib-file',
            src: attrib.src,
            arch: attrib.arch,
            Include: attrib.Include,
            versions: attrib.versions,
            deviceTarget: attrib['device-target'] || attrib.target
        }));
    }

    /**
     * <podspec>
     *
     * @example
     *  <podspec>
     *      <config>
     *          <source url="https://github.com/brightcove/BrightcoveSpecs.git" />
     *          <source url="https://github.com/CocoaPods/Specs.git"/>
     *      </config>
     *      <pods use-frameworks="true" inhibit-all-warnings="true">
     *          <pod name="PromiseKit" />
     *          <pod name="Foobar1" spec="~> 2.0.0" />
     *          <pod name="Foobar2" git="git@github.com:hoge/foobar1.git" />
     *          <pod name="Foobar3" git="git@github.com:hoge/foobar2.git" branch="next" />
     *          <pod name="Foobar4" swift-version="4.1" />
     *          <pod name="Foobar5" swift-version="3.0" />
     *      </pods>
     *  </podspec>
     *
     * @param {string} platform
     */
    getPodSpecs (platform) {
        return this._getTagsInPlatform('podspec', platform).map(tag => {
            const config = tag.find('config');
            const pods = tag.find('pods');

            const sources = config && config.findall('source')
                .map(el => ({ source: el.attrib.url }))
                .reduce((acc, val) => Object.assign(acc, { [val.source]: val }), {});

            const declarations = pods && pods.attrib;

            const libraries = pods && pods.findall('pod')
                .map(t => t.attrib)
                .reduce((acc, val) => Object.assign(acc, { [val.name]: val }), {});

            return { declarations, sources, libraries };
        });
    }

    /**
     * <hook>
     *
     * @example
     * <hook type="before_build" src="scripts/beforeBuild.js" />
     *
     * @param {string} hook
     * @param {string} platforms
     */
    getHookScripts (hook, platforms) {
        return this._getTags('hook', platforms)
            .filter(({ attrib }) =>
                attrib.src && attrib.type &&
                attrib.type.toLowerCase() === hook
            );
    }

    /**
     * <js-module>
     *
     * @param {string} platform
     */
    getJsModules (platform) {
        return this._getTags('js-module', platform).map(tag => ({
            itemType: 'js-module',
            name: tag.attrib.name,
            src: tag.attrib.src,
            clobbers: tag.findall('clobbers').map(tag => ({ target: tag.attrib.target })),
            merges: tag.findall('merges').map(tag => ({ target: tag.attrib.target })),
            runs: tag.findall('runs').length > 0
        }));
    }

    getEngines () {
        return this._et.findall('engines/engine').map(({ attrib }) => ({
            name: attrib.name,
            version: attrib.version,
            platform: attrib.platform,
            scriptSrc: attrib.scriptSrc
        }));
    }

    getPlatforms () {
        return this._et.findall('platform').map(n => ({ name: n.attrib.name }));
    }

    getPlatformsArray () {
        return this._et.findall('platform').map(n => n.attrib.name);
    }

    getFrameworks (platform, options) {
        const { cli_variables = {} } = options || {};

        const vars = Object.keys(cli_variables).length === 0
            ? this.getPreferences(platform)
            : cli_variables;

        const varExpansions = Object.entries(vars)
            .filter(([, value]) => value)
            .map(([name, value]) =>
                s => s.replace(new RegExp(`\\$${name}`, 'g'), value)
            );

        // Replaces plugin variables in s if they exist
        const expandVars = s => varExpansions.reduce((acc, fn) => fn(acc), s);

        return this._getTags('framework', platform).map(({ attrib }) => ({
            itemType: 'framework',
            type: attrib.type,
            parent: attrib.parent,
            custom: isStrTrue(attrib.custom),
            embed: isStrTrue(attrib.embed),
            src: expandVars(attrib.src),
            spec: attrib.spec,
            weak: isStrTrue(attrib.weak),
            versions: attrib.versions,
            targetDir: attrib['target-dir'],
            deviceTarget: attrib['device-target'] || attrib.target,
            arch: attrib.arch,
            implementation: attrib.implementation
        }));
    }

    getFilesAndFrameworks (platform, options) {
        // Please avoid changing the order of the calls below, files will be
        // installed in this order.
        return [].concat(
            this.getSourceFiles(platform),
            this.getHeaderFiles(platform),
            this.getResourceFiles(platform),
            this.getFrameworks(platform, options),
            this.getLibFiles(platform)
        );
    }

    getKeywordsAndPlatforms () {
        return (this.keywords || [])
            .concat('ecosystem:cordova')
            .concat(this.getPlatformsArray().map(p => `cordova-${p}`));
    }

    /**
     * Helper method used by most of the getSomething methods of PluginInfo.
     *
     * Get all elements of a given name. Both in root and in platform sections
     * for the given platform.
     *
     * @private
     *
     * @param {string} tag
     * @param {string|string[]} platform
     */
    _getTags (tag, platform) {
        return this._et.findall(tag)
            .concat(this._getTagsInPlatform(tag, platform));
    }

    /**
     * Same as _getTags() but only looks inside a platform section.
     *
     * @private
     *
     * @param {string} tag
     * @param {string|string[]} platform
     */
    _getTagsInPlatform (tag, platform) {
        const platforms = [].concat(platform);

        return [].concat(...platforms.map(platform => {
            const platformTag = this._et.find(`./platform[@name="${platform}"]`);
            return platformTag ? platformTag.findall(tag) : [];
        }));
    }
}

// Check if x is a string 'true'.
function isStrTrue (x) {
    return String(x).toLowerCase() === 'true';
}

module.exports = PluginInfo;

// Backwards compat:
PluginInfo.PluginInfo = PluginInfo;
PluginInfo.loadPluginsDir = dir => {
    const PluginInfoProvider = require('./PluginInfoProvider');
    return new PluginInfoProvider().getAllWithinSearchPath(dir);
};
