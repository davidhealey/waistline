/*
  Copyright 2018, 2019, 2020, 2021 David Healey

  This file is part of Waistline.

  Waistline is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Waistline is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Waistline.  If not, see <http://www.gnu.org/licenses/>.
*/

app.Utils = {

  tidyText: function(text, maxLength) {
    if (text) {
      if (text.length > maxLength)
        text = text.substring(0, maxLength - 2) + "..";
      return text;
    }
    return "";
  },

  tidyNumber: function(number, unit) {
    let text = "";
    if (number !== undefined) {
      text += number.toLocaleString([], { useGrouping: false }).replace("-", "\u2212");
    }
    if (unit !== undefined) {
      if (app.standardUnits.includes(unit))
        text += "\u2009" + unit; // Thin Space
      else
        text += " " + unit;
    }
    return text;
  },

  escapeHtml: function(text) {
    let div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  },

  deleteChildNodes: function(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  },

  getElementOffsetTop: function(element) {
    var offsetTop = 0;
    if (element) {
      do {
        if (!isNaN(element.offsetTop))
          offsetTop += element.offsetTop;
      } while (element = element.offsetParent);
    }
    return offsetTop;
  },

  nonLettersRegExp: function() {
    try {
      return new RegExp(/\P{Letter}/, "gu");
    } catch (e) {
      return new RegExp(/[^a-z]/, "gi");
    }
  },

  unitTextRegExp: function() {
    try {
      return new RegExp(/\d+\P{Letter}*(\p{Letter}[\p{Letter}'\-\s]*)/, "u");
    } catch (e) {
      return new RegExp(/\d+[^a-z]*([a-z][a-z'\-\s]*)/, "i");
    }
  },

  decimalRegExp: function() {
    return new RegExp(/[\d\.,]+/);
  },

  fractionRegExp: function() {
    return new RegExp(/^\D*(\d+)\s*\/\s*(\d+)/);
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

  toast: function(text, timeout, position, closeCallback) {
    let toast = app.f7.toast.create({
      text: text,
      position: position || 'center',
      closeTimeout: timeout || 2000,
      on: {
        close: closeCallback
      }
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

    if (value == undefined)
      result = undefined;

    else if (unit1 == unit2)
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

  getBackupDirectoryName: function() {
    let dirname = window.localStorage.getItem("backup-dir");

    if (dirname == undefined) {
      dirname = Math.floor(Date.now() / 1000).toString();
      window.localStorage.setItem("backup-dir", dirname);
    }

    return dirname;
  },

  writeFile: function(data, filename) {
    return new Promise(function(resolve, reject) {
      if (app.mode !== "development" && device.platform !== "browser") {

        let base = cordova.file.externalRootDirectory;
        let dirname = app.Utils.getBackupDirectoryName();
        let path = base + `Documents/Waistline/${dirname}/${filename}`;

        console.log("Writing data to file: " + path);

        window.resolveLocalFileSystemURL(base, (baseDir) => {
          baseDir.getDirectory("Documents", { create: true }, function (documentsDir) {
            documentsDir.getDirectory("Waistline", { create: true }, function (waistlineDir) {
              waistlineDir.getDirectory(dirname, { create: true }, function (backupDir) {
                backupDir.getFile(filename, { create: true }, (file) => {

                  // Write to the file, overwriting existing content
                  file.createWriter((fileWriter) => {
                    let blob = new Blob([data], {
                      type: "text/plain"
                    });

                    fileWriter.write(blob);

                    fileWriter.onwriteend = () => {
                      console.log("Successul file write");
                      resolve(file.fullPath);
                    };

                    fileWriter.onerror = (e) => {
                      console.warn("Failed to write file", e);
                      resolve();
                    };
                  });

                }, (e) => {
                  resolve();
                });
              }, (e) => {
                resolve();
              });
            }, (e) => {
              resolve();
            });
          }, (e) => {
            resolve();
          });
        }, (e) => {
          resolve();
        });
      } else {
        console.warn("Write to file doesn't work in browser");
        resolve();
      }
    });
  },

  readFile: function(filename) {
    return new Promise(function(resolve, reject) {
      if (app.mode !== "development" && device.platform !== "browser") {

        let base = cordova.file.externalRootDirectory;
        let dirname = app.Utils.getBackupDirectoryName();
        let path = base + `Documents/Waistline/${dirname}/${filename}`;

        console.log("Reading file: " + path);

        window.resolveLocalFileSystemURL(base, (baseDir) => {
          baseDir.getDirectory("Documents", { create: true }, function (documentsDir) {
            documentsDir.getDirectory("Waistline", { create: true }, function (waistlineDir) {
              waistlineDir.getDirectory(dirname, { create: true }, function (backupDir) {
                backupDir.getFile(filename, {}, (file) => {

                  file.file((file) => {
                    let fileReader = new FileReader();

                    fileReader.readAsText(file);

                    fileReader.onloadend = (e) => {
                      console.log("Successful file read", e);
                      resolve(e.target.result);
                    };

                    fileReader.onerror = (e) => {
                      console.warn("Failed to read file", e);
                      resolve();
                    };
                  });

                }, (e) => {
                  console.warn("Failed to access file", e);
                  switch (e.code) {
                    case 1:
                      alert("File not found: " + path);
                      break;
                  }
                  resolve();
                });
              }, (e) => {
                resolve();
              });
            }, (e) => {
              resolve();
            });
          }, (e) => {
            resolve();
          });
        }, (e) => {
          resolve();
        });
      } else {
        console.warn("Read file doesn't work in browser");
        resolve();
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