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

// contains PLIST utility functions
const _ = require('underscore');
const plist = require('plist');

// adds node to doc at selector
module.exports.graftPLIST = graftPLIST;
function graftPLIST (doc, xml, selector) {
    const obj = plist.parse(`<plist>${xml}</plist>`);
    const node = doc[selector];

    if (node && Array.isArray(node) && Array.isArray(obj)) {
        const isNew = item => !node.some(nodeChild => nodeEqual(item, nodeChild));
        doc[selector] = node.concat(obj.filter(isNew));
    } else {
        // plist uses objects for <dict>. If we have two dicts we merge them instead of
        // overriding the old one. See CB-6472
        const isDict = o => _.isObject(o) && !_.isDate(o); // arrays checked above
        if (isDict(node) && isDict(obj)) _.extend(obj, node);

        doc[selector] = obj;
    }

    return true;
}

// removes node from doc at selector
module.exports.prunePLIST = prunePLIST;
function prunePLIST (doc, xml, selector) {
    const obj = plist.parse(`<plist>${xml}</plist>`);

    pruneObject(doc, selector, obj);

    return true;
}

function pruneObject (doc, selector, fragment) {
    if (Array.isArray(fragment) && Array.isArray(doc[selector])) {
        let empty = true;

        for (const i in fragment) {
            for (const j in doc[selector]) {
                empty = pruneObject(doc[selector], j, fragment[i]) && empty;
            }
        }

        if (empty) {
            delete doc[selector];
            return true;
        }
    } else if (nodeEqual(doc[selector], fragment)) {
        delete doc[selector];
        return true;
    }

    return false;
}

function nodeEqual (node1, node2) {
    if (typeof node1 !== typeof node2) {
        return false;
    } else if (typeof node1 === 'string') {
        node2 = escapeRE(node2).replace(/\\\$\(\S+\)/gm, '(.*?)');
        return new RegExp(`^${node2}$`).test(node1);
    } else {
        for (const key in node2) {
            if (!nodeEqual(node1[key], node2[key])) return false;
        }

        return true;
    }
}

// escape string for use in regex
function escapeRE (str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}
