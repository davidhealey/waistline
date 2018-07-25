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
