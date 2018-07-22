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
  //Setup default goals if none have been set
  if (app.storage.getItem("goals") == undefined)
  {
    goals.setDefaults(); //Generate default goals
    goals.updateLog(); //Add goals to log
  }
});
