#!/usr/bin/env node

var fs = require("fs");

module.exports = function (context) {
  var rootdir = context.opts.projectRoot;

  var android_dir = `${rootdir}/platforms/android`;
  var gradle_filename = "build-extras.gradle";
  var gradle_file = `${rootdir}/${gradle_filename}`;
  if (!fs.existsSync(android_dir)) {
    throw new Error(`Android dir ${android_dir} doesn't exist`);
  }
  if (!fs.existsSync(gradle_file)) {
    throw new Error(`gradle file ${gradle_file} doesn't exist`);
  }
  fs.createReadStream(gradle_file).pipe(
    fs.createWriteStream(`${android_dir}/${gradle_filename}`)
  );
};
