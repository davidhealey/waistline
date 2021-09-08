#!/bin/sh

cordova platform add browser || true
cordova build browser
cordova run browser
