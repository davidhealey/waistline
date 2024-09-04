#!/usr/bin/env node

var wwwFilesToReplace = ["activities/foodlist/js/open-food-facts.js", 
    "activities/foodlist/js/usda.js"];

var fs = require('fs');
var path = require('path');

function fileStringReplace(filename, search, replace) {
    var content = fs.readFileSync(filename, 'utf8');
    content = content.replace(new RegExp(search, "g"), replace);
    fs.writeFileSync(filename, content, 'utf8');
}

module.exports = function (context) {

    var proxy = "http://localhost:8001/";

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
            wwwFilesToReplace.forEach((wwwFile) => {
                var fullfilename = path.join(rootdir, wwwPath + wwwFile);
                if (fs.existsSync(fullfilename)) {
                    switch (val) {
			case "browser":
			    fileStringReplace(fullfilename, "%%PROXY%%", proxy);
			    console.log("Replaced proxy: " + fullfilename);
			    break;
			case "android":
			    fileStringReplace(fullfilename, "%%PROXY%%", "");
			    console.log("Replaced proxy: " + fullfilename);
			    break;
			default:
			    console.log("Warning: Unknown build platform: " + val);
	 
		    }
                }
            });
        });
    }
}
