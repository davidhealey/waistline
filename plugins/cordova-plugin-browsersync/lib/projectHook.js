/**
 * A project hook is built from this file using browserify
 * Copy this to your cordova project and add the following to config.xml
 * <hook type="after_prepare" src="browserSync.hook.js" /> 
 */
module.exports = function(context) {
	var pluginHook = require('./pluginHook');
	var npmInstall = require('./npmInstall');

	return npmInstall(context).then(function() {
		return pluginHook(context);
	});
}