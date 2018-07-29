var app = {

  storage:{}, //Local storage
  strings: {},

  // Application Constructor
  initialize: function()
  {
    this.storage = window.localStorage; //Simple storage object

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

    dbHandler.initializeDb() //db-handler initialization
    .then(function(){
      //Add a log entry for the current date if there isn't one already
      var now = new Date();
      var date = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate());
      date.setHours(0);
      app.addDefaultLogEntry(date);
    });

    //Localisation - get localized strings object
    this.strings = defaultLocale; //Set fallback locale data

    $("[data-localize]").localize("locales/locale", {
      callback: function(data, defaultCallback){
        defaultCallback(data);
        app.strings = $.localize.data["locales/locale"];
      }
    });
    console.log($.localize);

    //Theme handler
    if (app.storage.getItem("theme") == undefined)
    {
      app.storage.setItem("theme", 0); //Set defualt theme
    }

    app.setTheme(this.storage.getItem("theme")); //Set theme CSS
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

  addDefaultLogEntry : function(date)
  {
    return new Promise(function(resolve, reject){
      var request = dbHandler.getItem(date, "log");

      request.onsuccess = function(e){

        if (e.target.result == undefined) //No log entry for given date
        {
            var data = {"dateTime":date, "goals":{}, "weight":app.storage.getItem("weight")};
            var goals = JSON.parse(app.storage.getItem("goals"));
            var day = date.getDay(); //Week starts on Sunday

            //Get just the goals for the current day
            for (g in goals)
            {
              if (g == "weight") continue; //Weight handled separately
              data.goals[g] = goals[g][day];
            }

            data.goals["weight"] = goals.weight;

            var insertRequest = dbHandler.insert(data, "log");
            insertRequest.onsuccess = function(e){resolve();}
        }
        else {
          resolve();
        }
      }
    });
  },

  getDateAtMidnight : function(date)
  {
    newDate = new Date(date);
    newDate.setHours(0-(newDate.getTimezoneOffset()/60), 0, 0, 0);
    return newDate;
  },
};

ons.ready(function() {
  console.log("Cordova Ready");
  app.initialize();
  if (app.storage.getItem("disable-animation")) ons.disableAnimations(); //Disable all animations if setting enabled
  nav.resetToPage("activities/diary/views/diary.html");
});

//Localize when any page is initialized
$(document).on("init", "ons-page", function(e){
  $("[data-localize]").localize("locales/locale");
});


// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
