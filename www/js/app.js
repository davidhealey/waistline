var app = {

  storage:{}, //Local storage
  strings: {},

  // Application Constructor
  initialize: function()
  {
    this.storage = window.localStorage; //Simple storage object
    dbHandler.initializeDb(); //db-handler initialization

    //Localisation
    app.strings = defaultLocale; //Set fallback locale data

    var opts = {};
    opts.callback = function(data, defaultCallback) {
      defaultCallback(data);
      app.strings = $.localize.data["locales/locale"];
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

};

app.initialize();

ons.ready(function() {

  console.log("Cordova Ready");

  //Setup default goals in app storage if none have been set
  if (app.storage.getItem("goals") == undefined)
  {
    goals.setDefaults(); //Generate default goals
  }

  //Add goals object from app storage to the log if it isn't already there
  var now = new Date();
  var dateTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate());
  var request = dbHandler.getItem(dateTime, "log");

  request.onsuccess = function(e){
    if (e.target.result.goals == undefined){ //No goals have been logged for today
      goals.updateLog(); //Add goals to log*/
    }
  };

});
