var app = {

  storage:{}, //Local storage
  strings: {},

  // Application Constructor
  initialize: function()
  {
    this.storage = window.localStorage; //Simple storage object

    //Setup default goals and weight in app storage if none have been set
    if (app.storage.getItem("goals") == undefined)
    {
      goals.setDefaults(); //Generate default goals
    }

    if (app.storage.getItem("weight") == undefined)
    {
      app.storage.setItem("weight", 70);
    }

    dbHandler.initializeDb() //db-handler initialization
    .then(function(){
      //Add a log entry for the current date if there isn't one already
      var now = new Date();
      var date = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate());
      app.addDefaultLogEntry(date);
    });

    //Localisation
    this.strings = defaultLocale; //Set fallback locale data

    var opts = {};
    opts.callback = function(data, defaultCallback) {
      defaultCallback(data);
      this.strings = $.localize.data["locales/locale"];
    }

    $("[data-localize]").localize("locales/locale", opts)
    console.log($.localize);

    //Theme handler
    /*if (this.storage.getItem("theme") == undefined)
    {
       this.storage.setItem("theme", "default");
    }*/

    //$("#settingsPage #theme").val(this.storage.getItem("theme")); //Restore theme selection
    //setTheme(this.storage.getItem("theme")); //Set theme CSS
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

};

app.initialize();

ons.ready(function() {
  console.log("Cordova Ready");
  ons.disableAnimations(); //Disable all animations

  console.log(network = navigator.network.connection.type);
});
