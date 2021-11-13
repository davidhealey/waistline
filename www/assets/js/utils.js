app.Utils = {

  tidyText: function(text, maxLength) {

    if (text) {
      let t = unescape(text);

      if (text.length > maxLength)
        t = t.substring(0, maxLength - 2) + "..";

      return t;
    }
    return "";
  },

  deleteChildNodes: function(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  },

  isInternetConnected: function() {
    if (navigator.connection.type == "none") {
      let msg = app.strings.dialogs["no-internet"] || "No Internet Connection";
      app.Utils.toast(msg);
      return false;
    }
    return true;
  },

  showThumbnails: function(page) {
    if (app.Settings.get(page, "show-thumbnails")) {
      let wifiOnly = app.Settings.get(page, "wifi-thumbnails");
      if (app.mode == "development") wifiOnly = false;

      if (navigator.connection.type !== "none") {
        if ((wifiOnly && navigator.connection.type == "wifi") || !wifiOnly) {
          return true;
        }
      }
    }
    return false;
  },

  notify: function(text, icon) {
    // Create notification with click to close
    let notification = app.f7.notification.create({
      icon: '<i class="icon material-icons">' + icon + '</i>',
      title: 'Waistline',
      titleRightText: '',
      subtitle: '',
      text: text,
      closeButton: true,
    });

    notification.open();
  },

  toast: function(text, timeout, position) {
    let toast = app.f7.toast.create({
      text: text,
      position: position || 'center',
      closeTimeout: timeout || 2000,
    });

    toast.open();
  },

  concatObjects: function(...sources) {
    const target = {};
    sources.forEach(el => {
      Object.keys(el).forEach(key => {
        target[key] = el[key];
      });
    });
    return target;
  },

  hideKeyboard: function() {
    document.activeElement.blur();
    let inputs = document.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].blur();
    }
  },

  convertUnit: function(value, unit1, unit2, round=false) {

    if (unit1 !== undefined && typeof unit1.toLowerCase === "function")
      unit1 = unit1.toLowerCase();
    if (unit2 !== undefined && typeof unit2.toLowerCase === "function")
      unit2 = unit2.toLowerCase();

    if (unit1 == "ug")
      unit1 = "µg";
    if (unit2 == "ug")
      unit2 = "µg";

    let result;

    if (unit1 == unit2)
      result = value;

    // lb/kg
    else if (unit1 == "lb" && unit2 == "kg")
      result = value * 0.4535924;

    else if (unit1 == "kg" && unit2 == "lb")
      result = value / 0.4535924;

    // stones/kg
    else if (unit1 == "st" && unit2 == "kg")
      result = value * 6.350293;

    else if (unit1 == "kg" && unit2 == "st")
      result = value / 6.350293;

    // inches/cm
    else if (unit1 == "inch" && unit2 == "cm")
      result = value * 2.54;

    else if (unit1 == "cm" && unit2 == "inch")
      result = value / 2.54;

    // kj/kcal
    else if (unit1 == "kj" && unit2 == "kcal")
      result = value * 0.23900573614;

    else if (unit1 == "kcal" && unit2 == "kj")
      result = value / 0.23900573614;

    // mg/g
    else if (unit1 == "mg" && unit2 == "g")
      result = value * 0.001;

    else if (unit1 == "g" && unit2 == "mg")
      result = value / 0.001;

    // µg/g
    else if (unit1 == "µg" && unit2 == "g")
      result = value * 0.000001;

    else if (unit1 == "g" && unit2 == "µg")
      result = value / 0.000001;

    // µg/mg
    else if (unit1 == "µg" && unit2 == "mg")
      result = value * 0.001;

    else if (unit1 == "mg" && unit2 == "µg")
      result = value / 0.001;

    if (result !== undefined && round === true)
      result = Math.round(result);

    return result;
  },

  getEnergyUnitName: function(energyUnit) {
    return Object.keys(app.nutrimentUnits).find(key => app.nutrimentUnits[key] === energyUnit);
  },

  writeFile: function(data, filename) {
    return new Promise(function(resolve, reject) {
      if (app.mode !== "development" && device.platform !== "browser") {

        let base = cordova.file.externalRootDirectory;
        let path = base + "Android/media/com.waist.line/" + filename;

        console.log("Writing data to file: " + path);

        window.resolveLocalFileSystemURL(base, (baseDir) => {
          baseDir.getDirectory("Android", { create: true }, function (androidDir) {
            androidDir.getDirectory("media", { create: true }, function (mediaDir) {
              mediaDir.getDirectory("com.waist.line", { create: true }, function (appDir) {
                appDir.getFile(filename, { create: true }, (file) => {

                  // Write to the file, overwriting existing content
                  file.createWriter((fileWriter) => {
                    let blob = new Blob([data], {
                      type: "text/plain"
                    });

                    fileWriter.write(blob);

                    fileWriter.onwriteend = () => {
                      console.log("Successul file write.");
                      resolve(file.fullPath);
                    };

                    fileWriter.onerror = (e) => {
                      console.warn("Failed to write file", e.toString());
                      reject();
                    };
                  });

                });
              });
            });
          });
        }, (e) => {
          console.warn(e);
        });
      } else {
        console.log("Write to file doesn't work in browser");
      }
    });
  },

  readFile: function(filename) {
    return new Promise(function(resolve, reject) {
      if (app.mode !== "development" && device.platform !== "browser") {

        let base = cordova.file.externalRootDirectory;
        let path = base + "Android/media/com.waist.line/" + filename;

        console.log("Reading file: " + path);

        window.resolveLocalFileSystemURL(base, (baseDir) => {
          baseDir.getDirectory("Android", { create: true }, function (androidDir) {
            androidDir.getDirectory("media", { create: true }, function (mediaDir) {
              mediaDir.getDirectory("com.waist.line", { create: true }, function (appDir) {
                appDir.getFile(filename, {}, (file) => {

                  file.file((file) => {
                    let fileReader = new FileReader();

                    fileReader.readAsText(file);

                    fileReader.onloadend = (e) => {
                      console.log("Successful file read", e);
                      resolve(e.target.result);
                    };

                    fileReader.onerror = (e) => {
                      console.log("File read error", e);
                      reject({});
                    };
                  });

                }, (e) => {
                  console.log("FileSystem Error", e);

                  switch (e.code) {
                    case 1:
                      alert("File not found: " + path);
                      break;
                  }
                });
              });
            });
          });
        }, (e) => {
          console.log(e);
        });
      } else {
        console.log("Read file doesn't work in browser");
      }
    });
  },

  checkIfFileExists: function(path) {
    window.resolveLocalFileSystemURL(path, () => {
      return true;
    }, () => {
      return false;
    });
  }
};