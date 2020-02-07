/*
  Copyright 2018, 2019 David Healey

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

  saveSelect : function(controlId, value)
  {
    app.storage.setItem(controlId, value);
  },

  loadSelects : function(pageId)
  {
    var selects = $("#" + pageId + " ons-select");

    for (var i = 0; i < selects.length; i++)
    {
      selects[i].value = app.storage.getItem(selects[i].id);
    }
  },

  saveSwitches : function(control)
  {
    app.storage.setItem(control.id, control.checked);
  },

  loadSwitches : function(pageId)
  {
    var switches = $("#" + pageId + " ons-switch");

    for (var i = 0; i < switches.length; i++)
    {
      switches[i].checked = (app.storage.getItem(switches[i].id) === "true");
    }
  },

  saveOffSettings : function(form)
  {
    //Get form data
    var data = {};
    $.each($(form).serializeArray(), function(i, field) {
        data[field.name] = field.value;
    });
    app.storage.setItem("off_credentials", JSON.stringify(data));
  },

  loadOffSettings : function()
  {
    var data = app.storage.getItem("off_credentials");

    if (data)
    {
      data = JSON.parse(data);
      $("#off-settings-form #user_id").val(data.user_id);
      $("#off-settings-form #password").val(data.password);
    }
  },

  saveDiarySettings : function(form)
  {
    //Get form data
    var data = [];
    $.each($(form).serializeArray(), function(i, field) {
        data.push(field.value.trim());
    });
    app.storage.setItem("meal-names", JSON.stringify(data));
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

  loadHomescreenSettings : function()
  {
    var options = $("#settings-page #homescreen option");

    for (i = 0; i < options.length; i++)
    {
      if (options[i].value == app.storage.getItem("homescreen"))
      $(options[i]).attr("selected", "selected");
    }
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

//Main settings screen
$(document).on("show", "#settings-page", function(e){
  settings.loadSwitches("settings-page");
  settings.loadThemeSettings();
  settings.loadHomescreenSettings();
});

//Food list settings
$(document).on("show", "#food-list-settings", function(e){
  settings.loadSwitches("food-list-settings");
  settings.loadSelects("food-list-settings");
});

//Diary settings
$(document).on("show", "#diary-settings", function(e){
  settings.localizeDiarySettingsForm();
  settings.loadDiarySettings();
});

//Form submission via checkmark button
$(document).on("tap", "#diary-settings #submit, #off-settings", function(e){
  $("form").submit();
  nav.popPage();
});

//Open food facts account
$(document).on("show", "#off-settings", function(e){
  settings.loadOffSettings();
});

//Theme
$(document).on("change", "#settings-page #theme", function(e){
  app.storage.setItem("theme", this.value);
  app.setTheme(this.value);
});

//Homescreen
$(document).on("change", "#settings-page #homescreen", function(e){
  app.storage.setItem("homescreen", this.value);
  app.setTheme(this.value);
});

//Import/Export
$(document).on("tap", "#settings-page #import", function(e){
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
