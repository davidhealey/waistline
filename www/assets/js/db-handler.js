/*
  Copyright 2018, 2021 David Healey

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
      var databaseVersion = 31;
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

        // Items
        if (!store.indexNames.contains("items")) store.createIndex('items', 'items', {
          unique: false
        });

        await dbHandler.upgradeDatabase(e.oldVersion, upgradeTransaction);

        upgradeTransaction.oncomplete = () => {
          console.log("DB Created/Updated");
          resolve();
        };
      };
    });
  },

  upgradeDatabase: function(oldVersion, transaction) {
    return new Promise(async function(resolve, reject) {

      if (!oldVersion)
        resolve();

      if (oldVersion < 31) {
        console.log("Upgrading database");

        // set hours and minutes of diary dateTime to 00:00 in UTC
        await new Promise(function(resolve, reject) {
          try {
            store = transaction.objectStore('diary');

            store.openCursor().onsuccess = function(event) {
              let cursor = event.target.result;
              if (cursor) {
                let value = cursor.value;

                let date = new Date(value.dateTime)
                value.dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

                cursor.update(value);
                cursor.continue();
              } else {
                resolve();
              }
            };
          } catch (e) {
            console.log("No Diary store present (safe to ignore this)", e);
            resolve();
          }
        });
      }

      if (oldVersion < 30) {
        let promises = [];
        let store;

        // Get weight by date
        let weights = {};

        await new Promise(function(resolve, reject) {
          try {
            store = transaction.objectStore('log');

            store.openCursor().onsuccess = function(event) {
              let cursor = event.target.result;
              if (cursor && cursor.value && cursor.value.weight) {
                let value = cursor.value;
                let dateTime = value.dateTime.toDateString();

                weights[dateTime] = value.weight;
                cursor.continue();
              } else {
                resolve();
              }
            };
          } catch (e) {
            console.log("No Log store present (safe to ignore this)", e);
            resolve();
          }
        });

        // Convert old diary entries to new schema
        await new Promise(function(resolve, reject) {
          store = transaction.objectStore('diary');
          let entries = {};

          store.openCursor().onsuccess = function(event) {

            let cursor = event.target.result;

            if (cursor) {
              let value = cursor.value;
              let date = value.dateTime;

              // Convert dates for those on versions < 25
              date.setUTCMinutes(date.getUTCMinutes() - date.getTimezoneOffset());

              // Create object for each date
              let index = date.toDateString();

              entries[index] = entries[index] || {
                dateTime: date,
                stats: {},
                items: [],
              };

              // Add weight 
              let weight = weights[index];

              if (weight !== undefined) {
                entries[index].stats.weight = weight;
              }

              // Foods/recipes
              let item = {
                category: value.category,
                portion: parseInt(value.portion),
                unit: value.portion.replace(/[^a-z]/g, ""),
                quantity: value.quantity || "1"
              };

              if (value.foodId !== undefined) {
                item.id = value.foodId;
                item.type = "food";
              } else if (value.recipeId !== undefined) {
                item.id = value.recipeId;
                item.type = "recipe";
              }

              entries[index].items.push(item);

              cursor.delete();
              cursor.continue();
            } else {

              for (let e in entries) {
                promises.push(new Promise(function(resolve, reject) {
                  store.put(entries[e]).onsuccess = () => {
                    resolve("Diary upgraded");
                  };
                }));
              }
              resolve();
            }
          };
        });

        // Convert old foodlist entries to new schema
        await new Promise(function(resolve, reject) {
          store = transaction.objectStore('foodList');
          let foods = [];

          store.openCursor().onsuccess = function(event) {

            let cursor = event.target.result;

            if (cursor) {
              let item = cursor.value;

              if (item.portion !== undefined) {
                item.portion = parseInt(cursor.value.portion);

                if (typeof item.unit == "string")
                  item.unit = cursor.value.portion.replace(/[^a-z]/g, "");
              }

              item.type = "food";

              foods.push(item);

              cursor.delete();
              cursor.continue();
            } else {

              for (let f in foods) {
                promises.push(new Promise(function(resolve, reject) {
                  store.put(foods[f]).onsuccess = () => {
                    resolve("Foodlist upgraded");
                  };
                }));
              }
              resolve();
            }
          };
        });

        // Convert old meal entries to new schema
        await new Promise(function(resolve, reject) {
          store = transaction.objectStore('meals');
          let meals = [];

          store.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;

            if (cursor) {
              let value = cursor.value;

              let meal = {
                id: value.id,
                dateTime: value.dateTime,
                name: value.name,
                type: "food",
                items: []
              };

              if (value.foods !== undefined) {
                for (let f in value.foods) {
                  let item = {
                    id: f.id,
                    quantity: "1"
                  };

                  if (f.portion !== undefined) {
                    item.portion == parseInt(f.portion);
                    if (typeof f.portion == "string")
                      item.unit = f.portion.replace(/[^a-z]/g, "");
                  }

                  meal.items.push(item);
                }
              }

              meals.push(meal);

              cursor.delete();
              cursor.continue();
            } else {

              for (let m in meals) {
                promises.push(new Promise(function(resolve, reject) {
                  store.put(meals[m]).onsuccess = () => {
                    resolve("Meals upgraded");
                  };
                }));
              }
              resolve();
            }
          };
        });

        // Convert old recipe entries to new schema
        await new Promise(function(resolve, reject) {
          store = transaction.objectStore('recipes');
          let recipes = [];

          store.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;

            if (cursor) {
              let value = cursor.value;

              let recipe = {
                id: value.id,
                dateTime: value.dateTime,
                name: value.name,
                portion: parseInt(value.portion),
                quantity: "1",
                notes: value.notes,
                type: "food",
                items: []
              };

              if (typeof value.portion == "string")
                recipe.unit = value.portion.replace(/[^a-z]/g, "");

              if (value.foods !== undefined) {
                for (let f in value.foods) {
                  let item = {
                    id: f.id
                  };

                  if (f.portion !== undefined) {
                    item.portion == parseInt(f.portion);
                    if (typeof f.portion == "string")
                      item.unit = f.portion.replace(/[^a-z]/g, "");
                  }

                  recipe.items.push(item);
                }
              }

              recipes.push(recipe);

              cursor.delete();
              cursor.continue();
            } else {

              for (let r in recipes) {
                promises.push(new Promise(function(resolve, reject) {
                  store.put(recipes[r]).onsuccess = () => {
                    resolve("Recipes upgraded");
                  };
                }));
              }
            }
            resolve();
          };
        });

        await Promise.all(promises).then((values) => {
          console.log(values);
          resolve();
        });
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

  export: function() {
    return new Promise(function(resolve, reject) {
      if (DB.objectStoreNames.length > 0) {
        let result = {};
        let t = DB.transaction(DB.objectStoreNames, "readonly");
        let storeNames = Array.from(DB.objectStoreNames);

        if (storeNames.length > 0) {

          // Remove log storeName if it's present
          if (storeNames.includes("log")) {
            let index = storeNames.indexOf("log");
            storeNames.splice(index, 1);
          }

          // Get values from each store 
          storeNames.forEach(function(x) {
            let data = [];

            t.objectStore(x).openCursor().onsuccess = function(event) {
              let cursor = event.target.result;
              if (cursor) {
                data.push(cursor.value);
                cursor.continue();
              } else {
                result[x] = data;

                if (storeNames.length === Object.keys(result).length) {
                  result.version = DB.version;
                  resolve(result);
                }
              }
            };
          });
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  },

  import: function(data) {
    return new Promise(function(resolve, reject) {

      let t = DB.transaction(DB.objectStoreNames, "readwrite");

      t.onerror = (e) => {
        console.log("Error importing data.", e.target.error.message);
        reject(e);
      };

      t.oncomplete = (e) => {
        console.log("Database import successful");
        resolve(e);
      };

      let storeNames = Array.from(DB.objectStoreNames);
      let version = data.version; // Get version from json data 

      // If no version is found then JSON must be from older version export
      if (version === undefined) {
        if (data._version !== undefined)
          version = 27;
        else
          version = 24;
      }

      delete data.version; // Remove version key from import data 
      delete data._version; // Remove old version key 

      // Go through each object store and add the imported data
      storeNames.forEach((x) => {
        if (data[x] !== undefined && data[x].length > 0) {

          // Clear the object store to remove old data
          t.objectStore(x).clear().onsuccess = () => {

            let count = 0;

            data[x].forEach((d) => {

              // Convert dateTime entries to Date objects
              if (d.dateTime !== undefined)
                d.dateTime = new Date(d.dateTime);

              let request = t.objectStore(x).add(d);

              request.onsuccess = async (e) => {
                count++;

                // Added all object for this store
                if (count === data[x].length)
                  delete data[x];

                // Added all objects
                if (Object.keys(data).length == 0) {
                  await dbHandler.upgradeDatabase(version, t);
                }
              };

              request.onerror = (e) => {
                dbHandler.errorHandler(e);
              };
            });
          };
        }
      });
    });
  },

  errorHandler: function(err) {
    console.log(err.target.error);
  }
};