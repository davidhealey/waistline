# Cordova Browser-Sync Plugin

Integrating [BrowserSync](http://browsersync.io) into your Cordova workflow.

- Watch files in the `www` folder and automatically reload HTML and CSS in all connected devices
- Use BrowserSync's dashboard to control devices and reload them.
- Synchronize scrolls, clicks and form inputs across multiple devices.
- Supports real devices and emulators for iOS and Android platforms

## Demo
Here is a [blog post](http://blog.nparashuram.com/2015/08/using-browser-sync-with-cordova.html) explaining the plugin and its internals.

[![Cordova Browser-Sync Plugin demo video](http://img.youtube.com/vi/XTXYhYS2m0c/0.jpg)](http://www.youtube.com/watch?v=XTXYhYS2m0c)

## Usage

There are three ways to use the code in this plugin. Ensure that you have added the `ws:` and `unsafe-inline` CSP policies to your `default-src` section of the CSP meta tag (`<meta content=...>`) in index.html file.

> Note that a `-- --live-reload` may need to be passed to `cordova run` command.

The presence of this `--live-reload` flag triggers the live reload workflow. Without this flag, the project remains unchanged. This way, the plugin does not have to be removed before packaging it for final deployment.

### As a Cordova plugin (easiest)
This simplest way to integrate this in your Cordova workflow is to add it as a plugin

```
cordova plugin add cordova-plugin-browsersync
```

and then run run the cordova with `cordova run -- --live-reload`.

### As a Cordova project hook
Clone this repo and run `npm run createHook` to get a `after_prepare.js`. Add this file as an `after_prepare` [hook](http://cordova.apache.org/docs/en/edge/guide_appdev_hooks_index.md.html) to your config.xml. For example:

```
<hook type="after_prepare" src="scripts/after_prepare.js" />
```

### Integrate into your workflow
You can also `require('cordova-plugin-browsersync')` in your node module and use the `changeHost` function and `browserSyncServer` directly in your existing workflow.

## Options

### Ignoring files
In many cases other hooks may copy over JS, CSS or image assets into folders like `www\lib`, typically from locations like `bower_components`. These hooks may run at `after_prepare` and hence should be ignored in the live reload workflow. To achieve this, run the command as

```
cordova run -- --live-reload --ignore=lib/**/*.*
```

The `--ignore` commands takes an [anymatch](https://github.com/es128/anymatch) compatible destination relative to the `www` folder.

### Setting custom hostname
Sometimes, depending on your network, your OS will report multiple external IP addresses. If this happens, by default browsersync just picks the first one and hopes for the best.

To override this behaviour and manually select which host you want to use for the external interface, use the `--host` option, for example:

```
cordova run -- --live-reload --host=192.168.1.1
```

### Setting custom port
If you need to forward ports from your local computer to the device because the device is not in the same network as your device then you may getting an error or red circle.
If this happens the problem could be the `3000` port. Then you can try another one for example `8090` which should work then.

```
cordova run -- --live-reload --port=8090
```

### Setting custom index file
If you do not have "index.html" in your `config.xml` under `content` node then you need to set this option to the value.
Please use the `--index` option.

```
cordova run -- --live-reload --index=content.html
```