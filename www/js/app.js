var app = {

  storage:{}, //Local storage
  caloriesConsumed:0, //Calories consumed for selected date
  strings: {},

  // Application Constructor
  initialize: function() {
    $(document).ready(function()
    {
      document.addEventListener('deviceready', app.onDeviceReady.bind(app), false);
    });
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

    //Set default values for weight and calorie goal
    if (this.storage.getItem("weight") == undefined)
    {
      this.storage.setItem("weight", 65);
    }

    if (this.storage.getItem("calorieGoal") == undefined)
    {
      this.storage.setItem("calorieGoal", 2000);
    }

    //Theme handler
    /*if (this.storage.getItem("theme") == undefined)
    {
       this.storage.setItem("theme", "default");
    }*/

    //$("#settingsPage #theme").val(this.storage.getItem("theme")); //Restore theme selection
    //setTheme(this.storage.getItem("theme")); //Set theme CSS
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {

    //changeDate(this.date); //Default to current date
  },
};

app.initialize();
