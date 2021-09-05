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

// @ts-check

/**
 * @typedef {Object} MungeElement
 * @property {String} xml
 * @property {Number} count
 * @property {import('elementtree').Attributes} [oldAttrib]
 *
 * @property {'merge' | 'overwrite' | 'remove'} [mode] edit-config only
 *
 * @property {String} [id] 'config.xml' or the id of the plugin from whose
 * plugin.xml this was taken; edit-config only
 * @property {String} [after] a ;-separated priority list of tags after which
 * the insertion should be made. E.g. if we need to insert an element C, and the
 * order of children has to be As, Bs, Cs then `after` will be equal to "C;B;A".
 * config-file only
 */

/**
 * @typedef {Object} FileMunge
 * @property {Object.<string, MungeElement[]>} parents
 */

/**
 * @typedef {Object} Munge
 * @property {Object.<string, FileMunge>} files
 */

/**
 * Adds element.count to obj[file][selector][element]
 *
 * @return {Boolean} true iff it didn't exist before
 */
exports.deep_add = (...args) => {
    const { element, siblings } = processArgs(...args, { create: true });
    const matchingSibling = siblings.find(sibling => sibling.xml === element.xml);

    if (matchingSibling) {
        matchingSibling.after = matchingSibling.after || element.after;
        matchingSibling.count += element.count;
    } else {
        siblings.push(element);
    }

    return !matchingSibling;
};

/**
 * Subtracts element.count from obj[file][selector][element]
 *
 * @return {Boolean} true iff element was removed or not found
 */
exports.deep_remove = (...args) => {
    const { element, siblings } = processArgs(...args);
    const index = siblings.findIndex(sibling => sibling.xml === element.xml);

    if (index < 0) return true;

    const matchingSibling = siblings[index];

    if (matchingSibling.oldAttrib) {
        element.oldAttrib = Object.assign({}, matchingSibling.oldAttrib);
    }
    matchingSibling.count -= element.count;

    if (matchingSibling.count > 0) return false;

    siblings.splice(index, 1);
    return true;
};

/**
 * Find element with given key in obj
 *
 * @return {MungeElement} the sought-after object or undefined if not found
 */
exports.deep_find = (...args) => {
    const { element, siblings } = processArgs(...args);

    const elementXml = (element.xml || element);
    return siblings.find(sibling => sibling.xml === elementXml);
};

function processArgs (obj, fileName, selector, element, opts) {
    if (Array.isArray(fileName)) {
        opts = selector;
        [fileName, selector, element] = fileName;
    }

    const siblings = getElements(obj, [fileName, selector], opts);
    return { element, siblings };
}

/**
 * Get the element array for given keys
 *
 * If a key entry is missing, create it if opts.create is true else return []
 *
 * @param {Munge} obj
 * @param {String[]} keys [fileName, selector]
 * @param {{create: Boolean}} [opts]
 * @return {MungeElement[]}
 */
function getElements ({ files }, [fileName, selector], opts = { create: false }) {
    if (!files[fileName] && !opts.create) return [];

    const { parents: fileChanges } = (files[fileName] = files[fileName] || { parents: {} });
    if (!fileChanges[selector] && !opts.create) return [];

    return (fileChanges[selector] = fileChanges[selector] || []);
}

/**
 * All values from munge are added to base as
 *   base[file][selector][child] += munge[file][selector][child]
 *
 * @param {Munge} base
 * @param {Munge} munge
 * @return {Munge} A munge object containing values that exist in munge but not
 * in base.
 */
exports.increment_munge = (base, munge) => {
    return mungeItems(base, munge, exports.deep_add);
};

/**
 * Update the base munge object as
 *   base[file][selector][child] -= munge[file][selector][child]
 *
 * @param {Munge} base
 * @param {Munge} munge
 * @return {Munge} nodes that reached zero value are removed from base and added
 * to the returned munge object
 */
exports.decrement_munge = (base, munge) => {
    return mungeItems(base, munge, exports.deep_remove);
};

/**
 * For every key [file, selector, element] in munge run mungeOperation on base.
 *
 * @param {Munge} base
 * @param {Munge} munge
 * @param {typeof exports.deep_add} mungeOperation - TODO how can I constrain
 * that to an enum of functions
 * @return {Munge} - the union of all changes for which mungeOperation returned
 * true
 */
function mungeItems (base, { files }, mungeOperation) {
    const diff = { files: {} };

    for (const file in files) {
        for (const selector in files[file].parents) {
            for (const element of files[file].parents[selector]) {
                // if node not in base, add it to diff and base
                // else increment it's value in base without adding to diff

                const hasChanges = mungeOperation(base, [file, selector, element]);
                if (hasChanges) exports.deep_add(diff, [file, selector, element]);
            }
        }
    }

    return diff;
}

/**
 * Clones given munge
 *
 * @param {Munge} munge
 * @return {Munge} clone of munge
 */
exports.clone_munge = munge => exports.increment_munge({ files: {} }, munge);
