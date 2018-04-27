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

}
