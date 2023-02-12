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

  enterKeyCode: [13],
  escapeKeyCode: [27],

  getDialogTextDiv: function(text) {
    let div = document.createElement("div");
    div.className = "dialog-text";
    div.innerText = text;
    return div.outerHTML;
  },

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
      text += "\u200E" + number.toLocaleString([], { useGrouping: false }).replace("-", "\u2212");
    }
    if (unit !== undefined) {
      if (app.standardUnits.includes(unit))
        text += "\u2009" + unit; // Thin Space
      else
        text += " " + unit;
    }
    return text;
  },

  dateToLocaleDateString: function(date) {
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC"
    });
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

  timeoutFetch: function(url, options, ms) {
    return new Promise(function(resolve, reject) {
      let timeout = ms || 10000;
      let timeoutId = setTimeout(() => {
        reject(new Error("timeout"))
      }, timeout);

      fetch(url, options)
        .then((res) => {
          clearTimeout(timeoutId);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });
  },

  isInternetConnected: function() {
    if (navigator.connection.type == "none") {
      let msg = app.strings.dialogs["no-internet"] || "No Internet Connection";
      app.Utils.toast(msg);
      return false;
    }
    return true;
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
    let target = {};
    sources.forEach((object) => {
      Object.keys(object).forEach((key) => {
        const targetValue = target[key];
        const objectValue = object[key];
        if (typeof targetValue === "object" && typeof objectValue === "object")
          target[key] = app.Utils.concatObjects(targetValue, objectValue);
        else
          target[key] = objectValue;
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

  convertUnit: function(value, unit1, unit2, roundFactor) {

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

    // ml/l
    else if (unit1 == "ml" && unit2 == "l")
      result = value * 0.001;

    else if (unit1 == "l" && unit2 == "ml")
      result = value / 0.001;

    // ml/cl
    else if (unit1 == "ml" && unit2 == "cl")
      result = value * 0.1;

    else if (unit1 == "cl" && unit2 == "ml")
      result = value / 0.1;

    // cl/l
    else if (unit1 == "cl" && unit2 == "l")
      result = value * 0.01;

    else if (unit1 == "l" && unit2 == "cl")
      result = value / 0.01;

    if (result !== undefined && roundFactor !== undefined)
      result = Math.round(result * roundFactor) / roundFactor;

    return result;
  },

  convertAlcoholVolPercentToGrams: function(percentValue, quantityValue, quantityUnit) {

    if (percentValue == undefined || quantityValue == undefined || quantityUnit == undefined)
      return undefined;

    let multiplier = percentValue / 100;

    let mlValue = app.Utils.convertUnit(quantityValue, quantityUnit, "ml");

    if (mlValue == undefined)
      mlValue = quantityValue; // if conversion failed, assume quantity was already specified in ml

    return mlValue * multiplier * 0.7893; // density of ethanol is 0.7893 g/ml
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
  },

  fileToBlob: function(path) {
    return new Promise(function(resolve, reject) {
      window.resolveLocalFileSystemURL(path, (fileEntry) => {
        fileEntry.file((file) => {
          let reader = new FileReader();

          reader.onloadend = function() {
            // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
            let blob = new Blob([new Uint8Array(this.result)], {
              type: "image/jpeg"
            });
            resolve(blob);
          };

          reader.readAsArrayBuffer(file);
        }, (err) => {
          console.error("Error getting file entry", err);
          reject();
        });
      }, (err) => {
        console.error("Error getting file", err);
        reject();
      });
    });
  },

  cropImage: function(path) {
    return new Promise(function(resolve, reject) {
      plugins.crop.promise(path, {keepAspectRatio: 0})
        .then((newPath) => {
          resolve(newPath);
        })
        .catch((err) => {
          console.error("Error cropping image", err);
          reject();
        });
    });
  },

  resizeImageBlob: function(blob, type, maxBytes=20000) {
    return new Promise(function(resolve, reject) {
      const img = new Image();
      img.src = URL.createObjectURL(blob);

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;
        let start = 0;
        let end = 1;
        let last, accepted, newblob;

        // Scale image to max 640x640 while keeping aspect ratio
        const maxWidth = 640;
        const maxHeight = 640;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        newblob = await new Promise((rs) => canvas.toBlob(rs, "image/"+type, 1));
        accepted = newblob;

        if (newblob.size < maxBytes)
          resolve(newblob); // No size change needed

        // Binary search for the right size
        while (true) {
          const mid = Math.round( ((start + end) / 2) * 100 ) / 100;
          if (mid === last) break;
          last = mid;
          newblob = await new Promise((rs) => canvas.toBlob(rs, "image/"+type, mid));

          if (newblob.size < maxBytes) {
            start = mid;
            accepted = newblob;
          } else {
            end = mid;
          }
        }

        resolve(accepted);
      };
    });
  },

  blobToBase64: function(blob) {
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
};