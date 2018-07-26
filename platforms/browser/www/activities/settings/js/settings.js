var settings = {

  saveSwitches : function(control)
  {
    app.storage.setItem(control.id, control.checked);
  },

  loadSwitches : function()
  {
    var switches = $("#settings-page ons-switch");

    for (var i = 0; i < switches.length; i++)
    {
      switches[i].checked = app.storage.getItem(switches[i].id);
    }
  },

  saveDiarySettings : function()
  {
    var inputs = $("#diary-settings ons-input");
    var mealNames = [];

    for (var i = 0; i < inputs.length; i++)
    {
      mealNames.push(inputs[i].value);
    }

    app.storage.setItem("meal-names", JSON.stringify(mealNames));
  },

  loadDiarySettings : function()
  {
    var mealNames = JSON.parse(app.storage.getItem("meal-names"));

    if (mealNames)
    {
      var inputs = $("#diary-settings ons-input");

      for (var i = 0; i < mealNames.length; i++)
      {
        inputs[i].value = mealNames[i];
      }
    }
  }
}

$(document).on("show", "#settings-page", function(e){
  settings.loadSwitches();
});

$(document).on("show", "#diary-settings", function(e){
  settings.loadDiarySettings();
});

$(document).on("tap", "#diary-settings #submit", function(e){
  settings.saveDiarySettings();
  nav.popPage();
});

$(document).on("doubletap", "#settings-page #import", function(e){
  ons.notification.confirm("Are you sure you want to import? Doing so will overwrite your existing data.", {"title":"Confirm Import"})
  .then(function(input) {
    if (input == 1)
    {
      dbHandler.readFromFile();
    }
  });
});

$(document).on("tap", "#settings-page #export", function(e){
  ons.notification.confirm("This action will overwrite any previously exported data. Do you want to continue?", {"title":"Confirm Export"})
  .then(function(input) {
    if (input == 1)
    {
      dbHandler.exportToFile();
    }
  });
});
