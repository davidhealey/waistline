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

/**
 * contains XML utility functions, some of which are specific to elementtree
 */

const fs = require('fs-extra');
const path = require('path');
const _ = require('underscore');
const et = require('elementtree');
const stripBom = require('strip-bom');

module.exports = {
    // compare two et.XML nodes, see if they match
    // compares tagName, text, attributes and children (recursively)
    equalNodes: function (one, two) {
        return one.tag === two.tag &&
            one.len() === two.len() &&
            one.text.trim() === two.text.trim() &&
            attribMatch(one, two) &&
            _.zip(one.getchildren(), two.getchildren())
                .every(([c1, c2]) => module.exports.equalNodes(c1, c2));
    },

    // adds node to doc at selector, creating parent if it doesn't exist
    graftXML: function (doc, nodes, selector, after) {
        let parent = module.exports.resolveParent(doc, selector);

        if (!parent) {
            // Try to create the parent recursively if necessary
            try {
                const parentToCreate = et.XML(`<${path.basename(selector)}/>`);
                const parentSelector = path.dirname(selector);

                this.graftXML(doc, [parentToCreate], parentSelector);
            } catch (e) {
                return false;
            }

            parent = module.exports.resolveParent(doc, selector);

            if (!parent) return false;
        }

        nodes.forEach(node => {
            // skip if an equal element already exists in parent
            if (findChild(node, parent)) return;

            const children = parent.getchildren();
            const insertIdx = after ? findInsertIdx(children, after) : children.length;

            // TODO: replace with parent.insert after the bug in ElementTree is fixed
            parent.getchildren().splice(insertIdx, 0, node);
        });

        return true;
    },

    // adds new attributes to doc at selector
    // Will only merge if attribute has not been modified already or --force is used
    graftXMLMerge: function (doc, nodes, selector, xml) {
        return graftXMLAttrs(doc, nodes, selector, xml);
    },

    // overwrite all attributes to doc at selector with new attributes
    // Will only overwrite if attribute has not been modified already or --force is used
    graftXMLOverwrite: function (doc, nodes, selector, xml) {
        return graftXMLAttrs(doc, nodes, selector, xml, { overwrite: true });
    },

    // removes node from doc at selector
    pruneXML: function (doc, nodes, selector) {
        const parent = module.exports.resolveParent(doc, selector);
        if (!parent) return false;

        nodes.forEach(node => {
            const matchingKid = findChild(node, parent);
            if (matchingKid) parent.remove(matchingKid);
        });

        return true;
    },

    // restores attributes from doc at selector
    pruneXMLRestore: function (doc, selector, xml) {
        const target = module.exports.resolveParent(doc, selector);
        if (!target) return false;

        if (xml.oldAttrib) {
            target.attrib = _.extend({}, xml.oldAttrib);
        }

        return true;
    },

    pruneXMLRemove: function (doc, selector, nodes) {
        const target = module.exports.resolveParent(doc, selector);
        if (!target) return false;

        nodes.forEach(node => {
            for (const attribute in node.attrib) {
                delete target.attrib[attribute];
            }
        });

        return true;
    },

    parseElementtreeSync: function (filename) {
        return et.parse(stripBom(fs.readFileSync(filename, 'utf-8')));
    },

    resolveParent: function (doc, selector) {
        if (!selector.startsWith('/')) return doc.find(selector);

        // elementtree does not implement absolute selectors so we build an
        // extended tree where we can use an equivalent relative selector
        const metaRoot = et.Element('meta-root');
        metaRoot.append(doc.getroot());
        return metaRoot.find(`.${selector}`);
    }
};

function graftXMLAttrs (doc, nodes, selector, xml, { overwrite = false } = {}) {
    const target = module.exports.resolveParent(doc, selector);
    if (!target) return false;

    // saves the attributes of the original xml before making changes
    xml.oldAttrib = Object.assign({}, target.attrib);

    if (overwrite) target.attrib = {};
    Object.assign(target.attrib, ...nodes.map(n => n.attrib));

    return true;
}

function findChild (node, parent) {
    const matches = parent.findall(node.tag);
    return matches.find(m => module.exports.equalNodes(node, m));
}

// Find the index at which to insert an entry. After is a ;-separated priority list
// of tags after which the insertion should be made. E.g. If we need to
// insert an element C, and the rule is that the order of children has to be
// As, Bs, Cs. After will be equal to "C;B;A".
function findInsertIdx (children, after) {
    const childrenTags = children.map(child => child.tag);
    const foundIndex = after.split(';')
        .map(tag => childrenTags.lastIndexOf(tag))
        .find(index => index !== -1);

    // add to the beginning if no matching nodes are found
    return foundIndex === undefined ? 0 : foundIndex + 1;
}

const BLACKLIST = ['platform', 'feature', 'plugin', 'engine'];
const SINGLETONS = ['content', 'author', 'name'];

function mergeXml (src, dest, platform, clobber) {
    // Do nothing for blacklisted tags.
    if (BLACKLIST.includes(src.tag)) return;

    // Handle attributes
    const omitAttrs = new Set(clobber ? [] : dest.keys());
    const xferAttrs = src.keys().filter(k => !omitAttrs.has(k));
    xferAttrs.forEach(attr => { dest.attrib[attr] = src.attrib[attr]; });

    // Handle text
    if (src.text && (clobber || !dest.text)) {
        dest.text = src.text;
    }
    // Handle children
    src.getchildren().forEach(mergeChild);

    // Handle platform
    if (platform) {
        src.findall(`platform[@name="${platform}"]`).forEach(platformElement => {
            platformElement.getchildren().forEach(mergeChild);
        });
    }

    // Handle duplicate preference tags (by name attribute)
    removeDuplicatePreferences(dest);

    function mergeChild (srcChild) {
        const srcTag = srcChild.tag;
        const query = srcTag + '';
        let destChild;
        let shouldMerge = true;

        if (BLACKLIST.includes(srcTag)) return;

        if (SINGLETONS.includes(srcTag)) {
            destChild = dest.find(query);
        } else {
            // Check for an exact match and if you find one don't add
            destChild = dest.findall(query).find(el =>
                textMatch(srcChild, el) && attribMatch(srcChild, el)
            );
            if (destChild) shouldMerge = false;
        }

        if (destChild) {
            dest.remove(destChild);
        } else {
            destChild = new et.Element(srcTag);
        }
        mergeXml(srcChild, destChild, platform, clobber && shouldMerge);
        dest.append(destChild);
    }

    function removeDuplicatePreferences (xml) {
        const prefs = xml.findall('preference[@name][@value]');

        // reduce preference tags to a hashtable to remove dupes
        const prefMap = new Map(
            prefs.map(({ attrib: { name, value } }) => [name, value])
        );

        // remove all preferences
        prefs.forEach(pref => xml.remove(pref));

        // write new preferences
        prefMap.forEach((value, name) => {
            et.SubElement(xml, 'preference', { name, value });
        });
    }
}

// Expose for testing.
module.exports.mergeXml = mergeXml;

function textMatch (elm1, elm2) {
    const format = text => text ? text.replace(/\s+/, '') : '';
    const text1 = format(elm1.text);
    const text2 = format(elm2.text);
    return (text1 === '' || text1 === text2);
}

function attribMatch (a, b) {
    const aKeys = a.keys();
    return aKeys.length === b.keys().length &&
        aKeys.every(key => a.get(key) === b.get(key));
}
