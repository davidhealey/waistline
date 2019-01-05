var exec = require('cordova/exec');

exports.exportWaistlineData = function (arg0, success, error) {
    exec(success, error, 'openscale', 'exportWaistlineData', [arg0]);
};
