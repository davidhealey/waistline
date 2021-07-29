app.Utils = {

  tidyText: function(text, maxLength, titleCase) {

    if (text) {
      let t = unescape(text);

      if (text.length > maxLength)
        t = t.substring(0, maxLength - 2) + "..";

      //Format to title case
      if (titleCase === true) {
        return t.replace(/\w\S*/g, function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      }

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
      let msg = app.strings["no-internet"] || "Internet connection required.";
      app.Utils.notify(msg, "error");
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

  writeFile: function(data, filename) {
    return new Promise(function(resolve, reject) {
      if (app.mode !== "development" && device.platform !== "browser") {

        let base = cordova.file.externalDataDirectory;

        console.log("Writing data to file: " + base + filename);

        window.resolveLocalFileSystemURL(base, dir => {
          dir.getFile(filename, {
            create: true
          }, file => {

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
        }, (e) => {
          console.warn(e);
        });
      } else {
        console.log("Write to file doesn't work in browser");
      }
    });
  },

  readFile(filename) {
    return new Promise(function(resolve, reject) {
      if (app.mode !== "development" && device.platform !== "browser") {

        let base = cordova.file.externalDataDirectory;
        let path = filename;

        console.log("Reading file: " + base + path);

        window.resolveLocalFileSystemURL(base, (dir) => {
          dir.getFile(path, {}, (file) => {

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
                alert("File not found: /" + path);
                break;
            }
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