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
const readChunk = require('read-chunk');

// Use delay loading to ensure plist and other node modules to not get loaded
// on Android, Windows platforms
const modules = {
    get bplist () { return require('bplist-parser'); },
    get et () { return require('elementtree'); },
    get glob () { return require('glob'); },
    get plist () { return require('plist'); },
    get plist_helpers () { return require('../util/plist-helpers'); },
    get xml_helpers () { return require('../util/xml-helpers'); }
};

/******************************************************************************
* ConfigFile class
*
* Can load and keep various types of config files. Provides some functionality
* specific to some file types such as grafting XML children. In most cases it
* should be instantiated by ConfigKeeper.
*
* For plugin.xml files use as:
* plugin_config = this.config_keeper.get(plugin_dir, '', 'plugin.xml');
*
* TODO: Consider moving it out to a separate file and maybe partially with
* overrides in platform handlers.
******************************************************************************/
class ConfigFile {
    constructor (project_dir, platform, file_tag) {
        this.project_dir = project_dir;
        this.platform = platform;
        this.file_tag = file_tag;
        this.is_changed = false;

        this.load();
    }

    load () {
        // config file may be in a place not exactly specified in the target
        const filepath = this.filepath = resolveConfigFilePath(this.project_dir, this.platform, this.file_tag);

        if (!filepath || !fs.existsSync(filepath)) {
            this.exists = false;
            return;
        }

        this.exists = true;
        this.mtime = fs.statSync(this.filepath).mtime;

        const ext = path.extname(filepath);
        // Windows8 uses an appxmanifest, and wp8 will likely use
        // the same in a future release
        if (ext === '.xml' || ext === '.appxmanifest' || ext === '.storyboard' || ext === '.jsproj') {
            this.type = 'xml';
            this.data = modules.xml_helpers.parseElementtreeSync(filepath);
        } else {
            // plist file
            this.type = 'plist';
            // TODO: isBinaryPlist() reads the file and then parse re-reads it again.
            //       We always write out text plist, not binary.
            //       Do we still need to support binary plist?
            //       If yes, use plist.parseStringSync() and read the file once.
            this.data = isBinaryPlist(filepath)
                ? modules.bplist.parseBuffer(fs.readFileSync(filepath))[0]
                : modules.plist.parse(fs.readFileSync(filepath, 'utf8'));
        }
    }

    save () {
        if (this.type === 'xml') {
            fs.writeFileSync(this.filepath, this.data.write({ indent: 4 }), 'utf-8');
        } else {
            // plist
            const regExp = /<string>[ \t\r\n]+?<\/string>/g;
            fs.writeFileSync(this.filepath, modules.plist.build(this.data, { indent: '\t', offset: -1 }).replace(regExp, '<string></string>'));
        }
        this.is_changed = false;
    }

    graft_child (selector, xml_child) {
        let result;
        if (this.type === 'xml') {
            const xml_to_graft = [modules.et.XML(xml_child.xml)];

            switch (xml_child.mode) {
            case 'merge':
                result = modules.xml_helpers.graftXMLMerge(this.data, xml_to_graft, selector, xml_child);
                break;
            case 'overwrite':
                result = modules.xml_helpers.graftXMLOverwrite(this.data, xml_to_graft, selector, xml_child);
                break;
            case 'remove':
                result = modules.xml_helpers.pruneXMLRemove(this.data, selector, xml_to_graft);
                break;
            default:
                result = modules.xml_helpers.graftXML(this.data, xml_to_graft, selector, xml_child.after);
            }

            if (!result) {
                throw new Error(`Unable to graft xml at selector "${selector}" from "${this.filepath}" during config install`);
            }
        } else {
            // plist file
            result = modules.plist_helpers.graftPLIST(this.data, xml_child.xml, selector);

            if (!result) {
                throw new Error(`Unable to graft plist "${this.filepath}" during config install`);
            }
        }
        this.is_changed = true;
    }

    prune_child (selector, xml_child) {
        let result;

        if (this.type === 'xml') {
            const xml_to_graft = [modules.et.XML(xml_child.xml)];

            switch (xml_child.mode) {
            case 'merge':
            case 'overwrite':
                result = modules.xml_helpers.pruneXMLRestore(this.data, selector, xml_child);
                break;
            case 'remove':
                result = modules.xml_helpers.pruneXMLRemove(this.data, selector, xml_to_graft);
                break;
            default:
                result = modules.xml_helpers.pruneXML(this.data, xml_to_graft, selector);
            }
        } else {
            // plist file
            result = modules.plist_helpers.prunePLIST(this.data, xml_child.xml, selector);
        }
        if (!result) {
            throw new Error(`Pruning at selector "${selector}" from "${this.filepath}" went bad.`);
        }

        this.is_changed = true;
    }
}

// Some config-file target attributes are not qualified with a full leading directory, or contain wildcards.
// Resolve to a real path in this function.
// TODO: getIOSProjectname is slow because of glob, try to avoid calling it several times per project.
function resolveConfigFilePath (project_dir, platform, file) {
    let filepath = path.join(project_dir, file);
    let matches;

    file = path.normalize(file);

    if (file.includes('*')) {
        // handle wildcards in targets using glob.
        matches = modules.glob.sync(path.join(project_dir, '**', file))
            .map(p => path.normalize(p));

        if (matches.length) filepath = matches[0];

        // [CB-5989] multiple Info.plist files may exist. default to $PROJECT_NAME-Info.plist
        if (matches.length > 1 && file.includes('-Info.plist')) {
            const projName = getIOSProjectname(project_dir);
            const plistName = `${projName}-Info.plist`;
            const plistPath = path.join(project_dir, projName, plistName);
            if (matches.includes(plistPath)) return plistPath;
        }
        return filepath;
    }

    // XXX this checks for android studio projects
    // only if none of the options above are satisfied does this get called
    // TODO: Move this out of cordova-common and into the platforms somehow
    if (platform === 'android' && !fs.existsSync(filepath)) {
        let config_file;

        if (file === 'AndroidManifest.xml') {
            filepath = path.join(project_dir, 'app', 'src', 'main', 'AndroidManifest.xml');
        } else if (file.endsWith('config.xml')) {
            filepath = path.join(project_dir, 'app', 'src', 'main', 'res', 'xml', 'config.xml');
        } else if (file.endsWith('strings.xml')) {
            // Plugins really shouldn't mess with strings.xml, since it's able to be localized
            filepath = path.join(project_dir, 'app', 'src', 'main', 'res', 'values', 'strings.xml');
        } else if (file.includes(path.join('res', 'values'))) {
            config_file = path.basename(file);
            filepath = path.join(project_dir, 'app', 'src', 'main', 'res', 'values', config_file);
        } else if (file.includes(path.join('res', 'xml'))) {
            // Catch-all for all other stored XML configuration in legacy plugins
            config_file = path.basename(file);
            filepath = path.join(project_dir, 'app', 'src', 'main', 'res', 'xml', config_file);
        }
        return filepath;
    }

    // special-case config.xml target that is just "config.xml" for other platforms. This should
    // be resolved to the real location of the file.
    // TODO: Move this out of cordova-common into platforms
    if (file === 'config.xml') {
        if (platform === 'ios' || platform === 'osx') {
            filepath = path.join(
                project_dir,
                module.exports.getIOSProjectname(project_dir),
                'config.xml'
            );
        } else {
            matches = modules.glob.sync(path.join(project_dir, '**', 'config.xml'));
            if (matches.length) filepath = matches[0];
        }

        return filepath;
    }

    // None of the special cases matched, returning project_dir/file.
    return filepath;
}

// Find out the real name of an iOS or OSX project
// TODO: glob is slow, need a better way or caching, or avoid using more than once.
function getIOSProjectname (project_dir) {
    const matches = modules.glob.sync('*.xcodeproj', { cwd: project_dir });

    if (matches.length !== 1) {
        const msg = matches.length === 0
            ? 'Does not appear to be an xcode project, no xcode project file'
            : 'There are multiple *.xcodeproj dirs';

        throw new Error(`${msg} in ${project_dir}`);
    }

    return path.basename(matches[0], '.xcodeproj');
}

// determine if a plist file is binary
// i.e. they start with the magic header "bplist"
function isBinaryPlist (filename) {
    return readChunk.sync(filename, 0, 6).toString() === 'bplist';
}

module.exports = ConfigFile;
module.exports.isBinaryPlist = isBinaryPlist;
module.exports.getIOSProjectname = getIOSProjectname;
module.exports.resolveConfigFilePath = resolveConfigFilePath;
