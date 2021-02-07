/*
  Copyright 2018 David Healey

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

var dbHandler = {
  DB: {},

  initializeDb: function() {
    return new Promise(async function(resolve, reject) {
      //Open database
      var databaseName = 'waistlineDb';
      var databaseVersion = 30;
      var openRequest = indexedDB.open(databaseName, databaseVersion);

      //Error handler
      openRequest.onerror = function(e) {
        console.log("Error Opening DB", e);
      };

      //Success handler
      openRequest.onsuccess = function(e) {
        DB = openRequest.result;
        console.log("Success!!! Database opened");
        resolve();
      };

      //Only called when version number changed (or new database created)
      openRequest.onupgradeneeded = async function(e) {
        DB = e.target.result;
        let store;

        let upgradeTransaction = e.target.transaction;

        //Food list store
        if (!DB.objectStoreNames.contains("foodList")) {
          store = DB.createObjectStore('foodList', {
            keyPath: 'id',
            autoIncrement: true
          });
        } else {
          store = upgradeTransaction.objectStore('foodList');
        }

        // Date object, the last time this item was referenced (edited or added to the diary)
        if (!store.indexNames.contains("dateTime")) store.createIndex('dateTime', 'dateTime', {
          unique: false
        });

        if (!store.indexNames.contains("barcode")) store.createIndex('barcode', 'barcode', {
          unique: true
        });

        if (!store.indexNames.contains("name")) store.createIndex('name', 'name', {
          unique: false
        });

        if (!store.indexNames.contains("brand")) store.createIndex('brand', 'brand', {
          unique: false
        });

        if (!store.indexNames.contains("image_url")) store.createIndex('image_url', 'image_url', {
          unique: false
        });

        // Portion - including unit
        if (!store.indexNames.contains("portion")) store.createIndex('portion', 'portion', {
          unique: false
        });

        // Nutrition - per portion
        if (!store.indexNames.contains("nutrition")) store.createIndex('nutrition', 'nutrition', {
          unique: false
        });

        // Deleted foods are marked as archived
        if (!store.indexNames.contains("archived")) store.createIndex('archived', 'archived', {
          unique: false
        });

        //Diary Store - one entry per day
        if (!DB.objectStoreNames.contains("diary")) {
          store = DB.createObjectStore('diary', {
            keyPath: 'id',
            autoIncrement: true
          });
        } else {
          store = upgradeTransaction.objectStore('diary');
        }

        // Date object
        if (!store.indexNames.contains("dateTime")) store.createIndex('dateTime', 'dateTime', {
          unique: false
        });

        // Stats - weight, etc.
        if (!store.indexNames.contains("stats")) store.createIndex('stats', 'stats', {
          unique: false
        });

        // Items array -- foods, recipes, quick-add, etc.
        if (!store.indexNames.contains("items")) store.createIndex('items', 'items', {
          unique: false
        });

        //Meals store
        if (!DB.objectStoreNames.contains("meals")) {
          store = DB.createObjectStore("meals", {
            keyPath: 'id',
            autoIncrement: true
          });
        } else {
          store = upgradeTransaction.objectStore('meals');
        }

        // Datetime
        if (!store.indexNames.contains("dateTime")) store.createIndex('dateTime', 'dateTime', {
          unique: false
        });

        // Name
        if (!store.indexNames.contains("name")) store.createIndex('name', 'name', {
          unique: false
        });

        // Items
        if (!store.indexNames.contains("items")) store.createIndex('items', 'items', {
          unique: false
        });

        // Recipes store
        if (!DB.objectStoreNames.contains("recipes")) {
          store = DB.createObjectStore("recipes", {
            keyPath: 'id',
            autoIncrement: true
          });
        } else {
          store = upgradeTransaction.objectStore('recipes');
        }

        if (!store.indexNames.contains("dateTime")) store.createIndex('dateTime', 'dateTime', {
          unique: false
        });

        if (!store.indexNames.contains("name")) store.createIndex('name', 'name', {
          unique: false
        });

        // Portion - including unit
        if (!store.indexNames.contains("portion")) store.createIndex('portion', 'portion', {
          unique: false
        });

        // Foods
        if (!store.indexNames.contains("foods")) store.createIndex('foods', 'foods', {
          unique: false
        });

        // Useful to add notes to recipes
        if (!store.indexNames.contains("notes")) store.createIndex('notes', 'notes', {
          unique: false
        });

        await dbHandler.upgradeData(e.oldVersion, upgradeTransaction);

        console.log("DB Created/Updated");
        resolve();
      };
    });
  },

  upgradeData: function(oldVersion, transaction) {
    return new Promise(function(resolve, reject) {

      if (!oldVersion)
        resolve();

      if (oldVersion < 30) {
        console.log("Upgrading database");

        // Get weight by date
        let log = transaction.objectStore('log');
        let weights = {};

        log.openCursor().onsuccess = function(event) {
          let cursor = event.target.result;
          if (cursor) {
            let value = cursor.value;
            let date = value.dateTime;
            let index = date.toDateString();

            weights[index] = value;
            cursor.continue();
          }
        };

        // Convert old diary entries to new schema
        let diary = transaction.objectStore('diary');
        let entries = {};

        diary.openCursor().onsuccess = function(event) {
          let cursor = event.target.result;

          if (cursor) {
            let value = cursor.value;
            let date = value.dateTime;

            // Convert dates for those on versions < 25
            date.setUTCMinutes(date.getUTCMinutes() - date.getTimezoneOffset());

            let index = date.toDateString();

            // Create array for each date
            entries[index] = entries[index] || {
              dateTime: date,
              stats: {},
              items: [],
            };

            // Add weight 
            let weight = weights[index];

            if (weight !== undefined) {
              entires[index].stats.weight = {
                value: weight,
                unit: "kg"
              };
            }

            // Food/recipe item
            let item = {
              category: value.category,
              portion: value.portion,
              quantity: value.quantity || 1
            };

            if (value.foodId) {
              item.id = value.foodId;
              item.type = "food",
                entries[index].items.push(item);
            } else if (value.recipeId) {
              item.id = value.recipeId;
              item.type = "recipe",
                entries[index].items.push(item);
            }

            cursor.delete();
            cursor.continue();
          } else {

            // Insert new diary entries 
            let request;
            for (let e in entries) {
              request = diary.put(entries[e]);
            }

            request.onerror = function(e) {
              dbHandler.errorHandler();
            };

            request.onsuccess = () => {
              console.log("Database Update Complete");
              resolve();
            };
          }
        };
      }
    });
  },

  put: function(data, storeName, key) {
    let request = DB.transaction(storeName, "readwrite").objectStore(storeName).put(data, key);

    request.onerror = function(err) {
      dbHandler.errorHandler(err);
    };

    return request;
  },

  bulkInsert: function(data, storeName) {
    return new Promise(function(resolve, reject) {

      let request;
      let transaction = DB.transaction(storeName, "readwrite");
      let store = transaction.objectStore(storeName);

      function errorHandler(e) {
        console.log("Something went wrong", e);
      }

      for (let i = 0; i < data.length; ++i) {
        request = store.put(data[i]);
        request.onerror = errorHandler;
      }

      request.onsuccess = resolve(); //Only listen for last success callback
    });
  },

  update: function(data, storeName, key) {
    return new Promise(function(resolve, reject) {
      var objectStore = DB.transaction(storeName, "readwrite").objectStore(storeName);
      var request = objectStore.get(key);

      request.onsuccess = function(event) {

        var result = event.target.result; //Data from DB

        if (result) {
          //Update the result with values from the passed data object
          for (let k in data) //Each key in data
          {
            result[k] = data[k];
          }
        } else { //Valid key passed but no data found
          result = data; //Just insert data
        }
        //Insert the updated result
        var updateRequest = objectStore.put(result);
        updateRequest.onsuccess = function(e) {
          resolve();
        };
      };

      request.onerror = function(event) {
        console.log("DB Update Error");
        resolve();
      };

    });
  },

  deleteItem: function(key, storeName) {
    var request = DB.transaction(storeName, "readwrite").objectStore(storeName).delete(key);

    request.oncomplete = function(e) {
      console.log("Transaction Complete");
    };

    request.onerror = function(e) {
      console.log("Transaction Error!: " + e);
    };

    return request;
  },

  getAllItems: function(storeName) {
    return new Promise(function(resolve, reject) {
      var results = [];
      var objectStore = DB.transaction(storeName).objectStore(storeName);

      objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  },

  get: function(storeName, index, key) {
    return new Promise(function(resolve, reject) {
      let objectStore = DB.transaction(storeName).objectStore(storeName).index(index);

      let request = objectStore.get(key);

      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function(e) {
        dbHandler.errorHandler(e);
        reject(e);
      };
    });
  },

  getByKey: function(key, storeName) {
    return new Promise(function(resolve, reject) {
      let request = DB.transaction(storeName).objectStore(storeName).get(key);

      request.onsuccess = function() {
        resolve(request.result);
      };
    });
  },

  // Deprecated - use getByKey
  getItem: function(key, storeName) {
    return DB.transaction(storeName).objectStore(storeName).get(key);
  },

  getByMultipleKeys: function(keys, storeName) {
    return new Promise(function(resolve, reject) {

      var objectStore = DB.transaction(storeName).objectStore(storeName);
      var results = [];

      keys.forEach(function(key) {
        objectStore.get(key).onsuccess = function(e) {
          results.push(e.target.result);
          if (results.length === keys.length) {
            resolve(results);
          }
        };
      });
    });
  },

  getIndex: function(key, storeName) {
    return DB.transaction(storeName).objectStore(storeName).index(key);
  },

  getTransaction: function(storeName, access) {
    return DB.transaction(storeName, access);
  },

  getObjectStore: function(storeName, access) {
    return DB.transaction(storeName, access).objectStore(storeName);
  },

  getArrayFromObject: function(obj) {
    //Turn object into an array
    return $.map(obj, function(value, index) {
      return [value];
    });
  },

  exportToFile: function() {
    if (DB.objectStoreNames.length > 0) {
      var exportObject = {};
      var t = DB.transaction(DB.objectStoreNames, "readonly"); //Get transaction
      var storeNames = dbHandler.getArrayFromObject(DB.objectStoreNames);

      //Get data for each store
      storeNames.forEach(function(storeName) {
        var objects = [];

        t.objectStore(storeName).openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            objects.push(cursor.value);
            cursor.continue();
          } else {
            exportObject[storeName] = objects; //Each store's objects in a separate element

            //Append object store to file once all objects have been gathered
            if (Object.keys(exportObject).length == storeNames.length) {
              // this needs to be here because of the key count logic
              exportObject._version = DB.version;
              dbHandler.writeToFile(JSON.stringify(exportObject));
            }
          }
        };
      });
    }
  },

  importFromJson: function(jsonString) {
    var t = DB.transaction(DB.objectStoreNames, "readwrite"); //Get transaction

    t.onerror = function(e) {
      console.log("Error importing database. " + e.target.error.message);
      alert("Something went wrong, are you sure the file exists?");
    };

    t.oncomplete = function(e) {
      console.log("Database import success");
      alert("Database Import Complete");
    };

    var storeNames = dbHandler.getArrayFromObject(DB.objectStoreNames);
    var importObject = JSON.parse(jsonString); //Parse recieved JSON string

    var version = importObject._version;
    // this key needs to be deleted for the key counting logic
    delete importObject._version;
    // _version was added in 25, so we just assume it's 24
    if (version === undefined)
      version = 24;

    //Go through each object store and add the imported data
    storeNames.forEach(function(storeName) {
      //If there is no data to import for this object
      if (importObject[storeName].length == 0) {
        delete importObject[storeName];
      } else {
        t.objectStore(storeName).clear().onsuccess = function() //Clear object store
        {
          var count = 0;

          importObject[storeName].forEach(function(toAdd) {
            //Make sure dateTime entries are imported as date objects rather than strings
            if (toAdd.dateTime) {
              toAdd.dateTime = new Date(toAdd.dateTime);
            }

            var request = t.objectStore(storeName).add(toAdd);

            request.onsuccess = function(e) {
              count++;

              if (count == importObject[storeName].length) //added all objects for this store
              {
                delete importObject[storeName];

                if (Object.keys(importObject).length == 0) //added all object stores
                {
                  dbHandler.upgradeData(version, t);
                }
              }
            };
          });
        };
      }
    });
  },

  writeToFile: function(jsonString) {
    //Export the json to a file
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir)
      //window.requestFileSystem(PERSISTENT, 1024*1024, function(dir) //For browser testing
      {
        console.log("got main dir", dir);

        //Create the file
        dir.getFile("waistline_export.json", {
            create: true
          }, function(file)
          //dir.root.getFile("waistline_export.json", {create:true}, function(file)  //For browser testing
          {
            console.log("got the file", file.isFile.toString());

            //Write to the file - overwrite existing content
            file.createWriter(function(fileWriter) {
              var blob = new Blob([jsonString], {
                type: 'text/plain'
              });
              fileWriter.write(blob);

              fileWriter.onwriteend = function() {
                console.log("Successful file write.");
                alert("Database Export Complete");
              };

              fileWriter.onerror = function(e) {
                console.log("Failed file write: " + e.toString());
                alert("Something went wrong, you deserve a more detailed error message but I don't have one for you!");
              };
            });
          });
      });
  },

  readFromFile: function() {
    var jsonString;

    console.log("Called read from file");

    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, success, fail);
    //window.requestFileSystem(PERSISTENT, 1024*1024, success, fail); //For browser testing

    function fail(e) {
      console.log("FileSystem Error", e);
      alert("Something went wrong, are you sure the file exists?");
      return false;
    }

    function success(dir) {
      console.log("Got file system");

      dir.getFile('waistline_export.json', {}, function(file)
        //dir.root.getFile('waistline_export.json', {}, function(file) //For browser testing
        {
          console.log("Got the file", file.isFile.toString());

          file.file(function(file) {
            var reader = new FileReader();

            reader.readAsText(file);

            reader.onloadend = function(e) {
              jsonString = this.result;
              console.log("Successful file read: ", this.result);
              dbHandler.importFromJson(jsonString);
            };

            reader.onerror = function(e) {
              console.log("Read Error:", e);
              alert("Something went wrong, are you sure the file exists?");
            };
          });
        });
    }
  },

  errorHandler: function(err) {
    console.log(err.target.error);
  }
};