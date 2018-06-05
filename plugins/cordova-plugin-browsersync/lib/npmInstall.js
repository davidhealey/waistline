var path = require('path');
var fs = require('fs');

/**
 * Installs the dependencies when this is installed as a Cordova plugin hook 
 * or as a project hook
 **/
module.exports = function(context) {
    var Q = context.requireCordovaModule('q');
    var npm = context.requireCordovaModule('npm');

    var package = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

    return Q.ninvoke(npm, 'load', {
        loaded: false
    }).then(function() {
        return Q.ninvoke(npm.commands, 'install', Object.keys(package.dependencies).map(function(p) {
            return p + '@' + package.dependencies[p];
        }));
    });
};
