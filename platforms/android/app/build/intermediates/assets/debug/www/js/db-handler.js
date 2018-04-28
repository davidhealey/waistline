var dbHandler =
{
  DB:{},

  initializeDb: function()
  {
    //Open database
    var databaseName = 'libreDietDb';
    var databaseVersion = 3;
    var openRequest = indexedDB.open(databaseName, databaseVersion);

    //Error handler
    openRequest.onerror = function(e)
    {
        console.log(openRequest.errorCode);
    };

    //Success handler
    openRequest.onsuccess = function(e)
    {
        DB = openRequest.result;
        console.log("Success!!! Database opened");
    };

    //Only called when version number changed (or new database created)
    openRequest.onupgradeneeded = function(e)
    {
        var DB = e.target.result;

        DB.onerror = function () {console.log(DB.errorCode);};

        //Log store
        var store = DB.createObjectStore('log', {keyPath:'date'});
        store.createIndex('calories', 'calories', {unique:false}); //Calories consumed for the date
        store.createIndex('calorieGoal', 'calorieGoal', {unique:false}); //Target calories for the day
        store.createIndex('caloriesLeft', 'caloriesLeft', {unique:false}); //Calories remaining - calorieGoal-calories
        store.createIndex('weight', 'weight', {unique:false}); //Current weight

        //Food list store
        var store = DB.createObjectStore('foodList', {keyPath:'id', autoIncrement:true});
        store.createIndex('dateTime', 'dateTime', {unique:false}); //Timestamp, the last time this item was referenced (edited or added to the diary)
        store.createIndex('name', 'name', {unique:false});
        store.createIndex('portion', 'portion', {unique:false}); //Serving size - e.g. 100g, 1 slice, 1 pie, etc.
        store.createIndex('quantity', 'quantity', {unique:false}); //Default quantity
        store.createIndex('calories', 'calories', {unique:false}); //Calories in portion

        //Diary Store - a kind of mini food list, independent of the main food list
        var store = DB.createObjectStore('diary', {keyPath:'id', autoIncrement:true});
        store.createIndex('date', 'date', {unique:false}); //Date in dd-mm-yy format
        store.createIndex('name', 'name', {unique:false});
        store.createIndex('portion', 'portion', {unique:false});
        store.createIndex('quantity', 'quantity', {unique:false}); //The number of portions
        store.createIndex('calories', 'calories', {unique:false}); //Calories in the portion
        store.createIndex('category', 'category', {unique:false}); //Breakfast, lunch dinner, etc..

        console.log("DB Created/Updated");
    };
  },

  insert: function(data, storeName)
  {
    var request = DB.transaction(storeName, "readwrite").objectStore(storeName).put(data); //Add/update data

    request.onerror = function(e)
    {
      console.log("Transaction Error!");
    };

    return request;
  },

  deleteItem: function(key, storeName)
  {
    var request = DB.transaction(storeName, "readwrite").objectStore(storeName).delete(key);

    request.oncomplete = function(e)
    {
      console.log("Transaction Complete");
    }

    request.onerror = function(e)
    {
      console.log("Transaction Error!: " + e);
    };

    return request;
  },

  getItem: function(key, storeName)
  {
    return DB.transaction(storeName).objectStore(storeName).get(key);
  },

  getCursor: function(keyRange, direction, storeName)
  {
    return DB.transaction(storeName).objectStore(storeName).openCursor(keyRange, direction);
  },

  getIndex: function(key, storeName)
  {
    return DB.transaction(storeName).objectStore(storeName).index(key);
  },

  getObjectStore: function(storeName)
  {
    return DB.transaction(storeName).objectStore(storeName);
  },

  exportToFile:function()
  {
    if (DB.objectStoreNames.length > 0)
    {
      var exportObject = {};
      var t = DB.transaction(DB.objectStoreNames, "readonly"); //Get transaction

      //Get array of objectStoreNames
      var storeNames = $.map(DB.objectStoreNames, function(value, index) {
          return [value];
      });

      //Get data for each store
      storeNames.forEach(function(storeName)
      {
        var objects = [];

        t.objectStore(storeName).openCursor().onsuccess = function(event)
        {
          var cursor = event.target.result;
          if (cursor)
          {
            objects.push(cursor.value);
            cursor.continue();
          }
          else
          {
            exportObject[storeName] = objects; //Each store's objects in a separate element

            //Append object store to file once all objects have been gathered
            if (Object.keys(exportObject).length == storeNames.length)
            {
              console.log("JSON: " + JSON.stringify(exportObject));
              dbHandler.writeToFile(JSON.stringify(exportObject));
            }
          }
        }
      });
    }
  },

  importFromFile: function(jsonString)
  {
    var t = DB.transaction(DB.objectStoreNames, "readwrite"); //Get transaction
    var objects = JSON.parse(jsonString);

    //Go through each object store and add the imported data
    for (var i = 0; i < DB.objectStoreNames.length; i++)
    {
      var storeName = DB.objectStoreNames[i];

      var toAdd = objects[storeName];
      console.log(toAdd);
      //var request = t.objectStore(storeName).add(toAdd);
    }
  },

  writeToFile: function(jsonString)
  {
    //Export the json to a file
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir)
    //window.requestFileSystem(PERSISTENT, 1024*1024, function(dir)
    {
      console.log("got main dir",dir);

      //Create the file
      dir.getFile("database_export.json", {create:true}, function(file) {

        console.log("got the file", file);

        //Write to the file
        file.createWriter(function(fileWriter)
        {
          //fileWriter.seek(0);

          var blob = new Blob([jsonString], {type:'text/plain'});
          fileWriter.write(blob);

          fileWriter.onwriteend = function()
          {
            console.log("Successful file write.");
          };

          fileWriter.onerror = function (e)
          {
            console.log("Failed file write: " + e.toString());
            alert("Something went wrong, you deserve a more detailed error message but I don't have one for you!");
          };
        });
      });
    });
  },

  readFromFile: function()
  {
    var jsonString;

    //window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir)
    window.requestFileSystem(PERSISTENT, 1024*1024, function(dir)
    {
      dir.getFile('database_export.json', {}, function(file)
      {
          file.file(function (file) {

            var reader = new FileReader();

            reader.readAsText(file);

            reader.onloadend = function(e) {
              jsonString = this.result;
              console.log("Successful file read: " + this.result);
              alert("Success");
              dbHandler.importFromFile(jsonString);
            };

            reader.onerror = function(e)
            {
              console.log("Read Error: " + e);
            };
          });
      },
      function(e)
      {
        console.log("File Error: " + e.code);
        alert("No datafile found. Import Aborted");
        return false;
      });
    });
  },
}
