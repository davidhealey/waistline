var exec = require('cordova/exec');

exports.requestOpenScalePermission = function (success, error) {
    exec(success, error, 'openscale', 'requestPermission', []);
};

exports.exportWaistlineData = function (arg0, success, error) {
    exec(success, error, 'openscale', 'exportWaistlineData', [arg0]);
};

exports.importOpenScaleData = function (success, error) {
    exec(success, error, 'openscale', 'importOpenScaleData', []);
};
