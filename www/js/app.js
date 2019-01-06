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

var app = {

  storage:{}, //Local storage
  strings: {},
  standardUnits: ["ug", "μg", "mg", "g", "kg", "ul", "μl", "ml", "dl", "dL", "cl", "cL", "l", "L"],

  // Application Constructor
  initialize: function()
  {
    return new Promise(function(resolve, reject){

      app.storage = window.localStorage; //Simple storage object

      //Set some default settings
      if (app.storage.getItem("goals") == undefined)
      {
        goals.setDefaults(); //Generate default goals
      }

      if (app.storage.getItem("weight") == undefined)
      {
        app.storage.setItem("weight", 70);
      }

      if (app.storage.getItem("meal-names") == undefined)
      {
        app.storage.setItem("meal-names", JSON.stringify(["Breakfast", "Lunch", "Dinner", "Snacks"]));
      }

      if (app.storage.getItem("homescreen") == undefined)
      {
        app.storage.setItem("homescreen", "userguide");
      }

      //Each install gets a UUID that is added to the comments when uploading to the OFF database, to prevent trolls
      if (app.storage.getItem("uuid") == undefined)
      {
        app.storage.setItem("uuid", app.uuidv4());
      }

      //Theme handler
      if (app.storage.getItem("theme") == undefined)
      {
        app.storage.setItem("theme", 0); //Set defualt theme
      }

      app.setTheme(app.storage.getItem("theme")); //Set theme CSS

      //Localisation

      //Set fallback locale data
      $.getJSON("locales/locale-en.json", function(data) {
          app.strings = data;
      })
      .then(function(){
        $("[data-localize]").localize("locales/locale", {
          callback: function(data, defaultCallback){
            defaultCallback(data);

            var locale = $.localize.data["locales/locale"]; //Get localized strings

            //Merge the localized strings with the default locale in case there are any missing values
            app.strings = Object.assign(app.strings, locale);
          }
        });

        dbHandler.initializeDb() //db-handler initialization
        .then(resolve);
      });
    });
  },

  //UUID generator
  uuidv4 : function()
  {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  },

  setTheme : function(theme)
  {
    switch(theme)
    {
      case "0":
        $("#themecss").attr("href", "onsen/css/light-onsen-css-components.min.css");
      break;
      case "1":
        $("#themecss").attr("href", "onsen/css/dark-onsen-css-components.min.css");
      break;
    }
  },

  takePicture : function(options)
  {
    return new Promise(function(resolve, reject){
      navigator.camera.getPicture(function(image_uri){
        resolve(image_uri)
      },
      function(){
        console.log("Camera problem");
        reject();
      }, options);
    });
  },

  getDateAtMidnight : function()
  {
    var now = new Date();
    // use UTC midnight of the current day for the diary
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  },
};

window.requestOpenScalePermission = function(callback) {
    cordova.exec(callback, function(errMsg) {
        console.log(errMsg);
    }, "openscale", "requestPermission", []);
};

window.exportDataToOpenScale = function(timestamp, calories, callback) {
    cordova.exec(callback, function(errMsg) {
        console.log('error exporting waistline data to openScale (' + errMsg +')');
    }, "openscale", "exportWaistlineData", [timestamp, calories]);
};

window.importOpenScaleData = function(callback) {
    cordova.exec(callback, function(errMsg) {
        console.log('error importing openScale data to waistline (' + errMsg +')');
    }, "openscale", "importOpenScaleData", []);
};

ons.ready(function() {
  console.log("Cordova Ready");
  navigator.camera.cleanup(function(){console.log("Camera cleanup success")}); //Remove any old camera cache files
  app.initialize()
  .then(function(){
    console.log("App Initialized");

    console.log("openScale Initializing");

    window.requestOpenScalePermission(function(msg) {
        console.log(msg);
    });

    window.importOpenScaleData(function(values) {
      for (var i =0; i<values.length; i++) {
        console.log("imported openScale data timestamp: " + values[i].timestamp + " weight: " + values[i].weight);
      }
    });

    dbHandler.getObjectStore("log").openCursor().onsuccess = function(e)
    {
      var cursor = e.target.result;

      if (cursor)
      {
        if (cursor.value.nutrition != undefined && cursor.value.nutrition.calories != undefined)
        {
          var date = cursor.value.dateTime;
          date.setUTCHours(0); //Get date, ignoring time

          if (date != undefined) {
            //console.log(date + " weight " + cursor.value.weight + " callo " + cursor.value.nutrition.calories);

            window.exportDataToOpenScale(date.getTime(), cursor.value.nutrition.calories, function(echoValue) {
                console.log(echoValue);
            });
          }
        }

        cursor.continue();
      }
    };

    if (app.storage.getItem("disable-animation") == "true") ons.disableAnimations(); //Disable all animations if setting enabled
    var homescreen = app.storage.getItem("homescreen");
    nav.resetToPage("activities/"+homescreen+"/views/"+homescreen+".html");
  });
});

//Localize when any page is initialized
$(document).on("init", "ons-page", function(e){
  $("[data-localize]").localize("locales/locale");
});
