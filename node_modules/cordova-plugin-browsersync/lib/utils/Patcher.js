var path = require('path');
var fs = require('fs');
var url = require('url');

var glob = require('glob');
var et = require('elementtree');
var cheerio = require('cheerio');
var Policy = require('csp-parse');
var plist = require('plist');


var WWW_FOLDER = {
    android: 'assets/www',
    ios: 'www',
    browser:'www'
};

var CONFIG_LOCATION = {
    android: 'res/xml',
    ios: '.',
    browser:'.'
};

var START_PAGE = 'browser-sync-start.html';

function parseXml(filename) {
    return new et.ElementTree(et.XML(fs.readFileSync(filename, "utf-8").replace(/^\uFEFF/, "")));
}

function Patcher(projectRoot, platforms) {
    this.projectRoot = projectRoot || '.';
    if (typeof platforms === 'string') {
        platforms = platforms.split(',');
    }
    this.platforms = platforms || ['android', 'ios'];
}

Patcher.prototype.__forEachFile = function(pattern, location, fn) {
    this.platforms.forEach(function(platform) {
        glob.sync(pattern, {
            cwd: path.join(this.projectRoot, 'platforms', platform, location[platform]),
            ignore: '*build/**'
        }).forEach(function(filename) {
            filename = path.join(this.projectRoot, 'platforms', platform, location[platform], filename);
            fn.apply(this, [filename, platform]);
        }, this);
    }, this);
};

Patcher.prototype.addCSP = function(opts) {
    this.__forEachFile('**/index.html', WWW_FOLDER, function(filename, platform) {
        var pageContent = fs.readFileSync(filename, 'utf-8');
        var $ = cheerio.load(pageContent, {
            decodeEntities: false
        });
        var cspTag = $('meta[http-equiv=Content-Security-Policy]');
        var policy = new Policy(cspTag.attr('content'));
        policy.add('default-src', 'ws:');
        policy.add('default-src', "'unsafe-inline'");
        cspTag.attr('content', function() {
            return policy.toString();
        });
        fs.writeFileSync(filename, $.html());
        //console.log('Added CSP for ', filename);
    });
};

Patcher.prototype.copyStartPage = function(opts) {
    var html = fs.readFileSync(path.join(__dirname, START_PAGE), 'utf-8');
    this.__forEachFile('**/index.html', WWW_FOLDER, function(filename, platform) {
        var dest = path.join(path.dirname(filename), START_PAGE);
        var data = {};
        for (var key in opts.servers) {
            if (typeof opts.servers[key] !== 'undefined') {
                data[key] = url.resolve(opts.servers[key], this.getWWWFolder(platform) + '/' + opts.index);
            }
        }
        fs.writeFileSync(dest, html.replace(/__SERVERS__/, JSON.stringify(data)));
        // console.log('Copied start page ', opts.servers);
    });
};

Patcher.prototype.updateConfigXml = function() {
    return this.__forEachFile('**/config.xml', CONFIG_LOCATION, function(filename, platform) {
        configXml = parseXml(filename);
        var contentTag = configXml.find('content[@src]');
        if (contentTag) {
            contentTag.attrib.src = START_PAGE;
        }
        // Also add allow nav in case of
        var allowNavTag = et.SubElement(configXml.find('.'), 'allow-navigation');
        allowNavTag.set('href', '*');
        fs.writeFileSync(filename, configXml.write({
            indent: 4
        }), "utf-8");
        //console.log('Set start page for %s', filename);
    });
};

Patcher.prototype.fixATS = function() {
    return this.__forEachFile('**/*Info.plist', CONFIG_LOCATION, function(filename) {
        try {
            var data = plist.parse(fs.readFileSync(filename, 'utf-8'));
            data.NSAppTransportSecurity = {
                NSAllowsArbitraryLoads: true
            };
            fs.writeFileSync(filename, plist.build(data));
            //console.log('Fixed ATS in ', filename);
        } catch (err) {
            console.log('Error when parsing', filename, err);
        }
    });
};

Patcher.prototype.patch = function(opts) {
    opts = opts || {};
    this.copyStartPage(opts);
    this.updateConfigXml();
    this.fixATS();
    this.addCSP(opts);
};

Patcher.prototype.getWWWFolder = function(platform) {
    return path.join('platforms', platform, WWW_FOLDER[platform]);
};

module.exports = Patcher;
