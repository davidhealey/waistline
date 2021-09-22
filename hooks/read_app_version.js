#!/usr/bin/env node

var wwwFileToReplace = "activities/about/views/about.html";

var fs = require('fs');
var path = require('path');

function fileStringReplace(filename, search, replace) {
    var content = fs.readFileSync(filename, 'utf8');
    content = content.replace(new RegExp(search, "g"), replace);
    fs.writeFileSync(filename, content, 'utf8');
}

module.exports = function (context) {

    var rawConfig = fs.readFileSync("config.xml", 'utf8');
    var match = /^<widget.+version="([\d\.]+)".+?>$/gm.exec(rawConfig);

    if (!match || match.length != 2) {
        console.log("Warning: Version parse failed");
        return
    }

    var version = match[1];

    var rootdir = context.opts.projectRoot;
    var currentBuildPlatforms = context.opts.cordova.platforms;

    if (rootdir) {
        currentBuildPlatforms.forEach(function (val, index, array) {
            var wwwPath = "";
            switch (val) {
                case "browser":
                    wwwPath = "platforms/browser/www/";
                    break;
                case "android":
                    wwwPath = "platforms/android/app/src/main/assets/www/";
                    break;
                default:
                    console.log("Warning: Unknown build platform: " + val);
            }
            var fullfilename = path.join(rootdir, wwwPath + wwwFileToReplace);
            if (fs.existsSync(fullfilename)) {
                fileStringReplace(fullfilename, "%%VERSION%%", version);
                console.log("Replaced version in file: " + fullfilename);
            }
        });
    }
}