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
      switches[i].checked = (app.storage.getItem(switches[i].id) === "true");
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
  },

  loadThemeSettings : function()
  {
    var options = $("#settings-page #theme option");
    $(options[app.storage.getItem("theme")]).attr("selected", "selected");
  },

  //Localises the placeholders of the forms input boxes
  localizeDiarySettingsForm : function()
  {
    var inputs = $("#diary-settings ons-input");
    var placeholder = "";

    for (var i = 0; i < inputs.length; i++)
    {
      placeholder = app.strings["settings"]["diary"]["meal"];
      $(inputs[i]).attr("placeholder", placeholder + " " + (i+1));
    }
  },
}

$(document).on("show", "#settings-page", function(e){
  settings.loadSwitches();
  settings.loadThemeSettings();
});

$(document).on("show", "#diary-settings", function(e){
  settings.localizeDiarySettingsForm();
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

$(document).on("change", "#settings-page #theme", function(e){
  app.storage.setItem("theme", this.value);
  app.setTheme(this.value);
});
