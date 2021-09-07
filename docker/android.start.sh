#!/bin/sh

cordova platform add android || true
cordova prepare android
cordova build android
