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

  put: function(field, setting, value) {
    let settings = JSON.parse(window.localStorage.getItem("settings")) || {};
    settings[field] = settings[field] || {};
    settings[field][setting] = value;
    window.localStorage.setItem("settings", JSON.stringify(settings));
  },

  get: function(field, setting) {
    let settings = JSON.parse(window.localStorage.getItem("settings"));
    if (settings && settings[field] && settings[field][setting]) {
      return settings[field][setting];
    }
    return undefined;
  },

  getField: function(field) {
    let settings = JSON.parse(window.localStorage.getItem("settings"));
    if (settings && settings[field]) {
      return settings[field];
    }
    return undefined;
  },

  putField: function(field, value) {
    let settings = JSON.parse(window.localStorage.getItem("settings")) || {};
    settings[field] = settings[field] || {};
    settings[field] = value;
    window.localStorage.setItem("settings", JSON.stringify(settings));
  },

  //Save value of drop down menu
  saveSelect: function() {
    let selected = this.options[this.selectedIndex];
    let field = selected.closest("ons-select").getAttribute("field");
    let setting = selected.closest("ons-select").getAttribute("name");
    settings.putSetting(field, setting, selected.value);
  },

  //Save value of checkboxes and checkboxes
  saveCheckbox: function() {
    let field = this.getAttribute("field");
    let setting = this.getAttribute("name");
    settings.putSetting(field, setting, this.checked);
  },

  //Restore values of dropdown boxes
  restoreSelects: function() {
    const selects = document.querySelectorAll('ons-select');
    for (let i = 0; i < selects.length; i++) {
      let field = selects[i].getAttribute("field");
      let setting = selects[i].getAttribute("name");
      let selected = settings.get(field, setting);
      if (selected) selects[i].value = selected;
    }
  },

  //Restore values of checkboxes and switches
  restoreCheckboxes: function() {
    const switches = document.querySelectorAll('ons-switch');
    for (let i = 0; i < switches.length; i++) {
      let field = switches[i].getAttribute("field");
      let setting = switches[i].getAttribute("name");
      let value = settings.get(field, setting);
      if (value) switches[i].checked = value;
    }
  },

  //Open Food Facts Integration
  offIntegration: function() {
    let dialog = document.getElementById("off-credentials-dialog");
    dialog.show();

    //Fill dialog inputs on show
    dialog.addEventListener("postshow", function() {
      let username = settings.get("integrations", "off-username");
      let password = settings.get("integrations", "off-password");
      dialog.querySelector('#username').value = username;
      dialog.querySelector('#password').value = password;
    });

    //Save and cancel buttons
    dialog.querySelector('#cancel').addEventListener("tap", function() {dialog.hide();});
    dialog.querySelector('#save').addEventListener("tap", saveOffCredentials);

    //Save button action
    function saveOffCredentials() {
      let username = dialog.querySelector('#username').value;
      let password = dialog.querySelector('#password').value;

      if (username != "" && password != "") {
        settings.putSetting("integrations", "off-username", username);
        settings.putSetting("integrations", "off-password", password);
      }
      dialog.hide();
    }
  },

  //Diary Meal Name Headings
  mealNames: function() {
    let dialog = document.getElementById("meal-names-dialog");
    let inputs = dialog.querySelectorAll('ons-input');

    dialog.show();

    //Fill dialog inputs on show
    dialog.addEventListener("postshow", function() {
      let mealNames = settings.get("diary", "meal-names");
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = mealNames[i];
      }
    });

    //Save and cancel buttons
    dialog.querySelector('#cancel').addEventListener("tap", function() {dialog.hide();});
    dialog.querySelector('#save').addEventListener("tap", saveMealNames);

    //Save button action
    function saveMealNames() {
      let mealNames = [];
      for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        mealNames.push(input.value);
      }
      settings.putSetting("diary", "meal-names", mealNames);
      dialog.hide();
    }
  },
};


//Page initialization
document.addEventListener("init", function(event){

  //All settings sub-pages
  if (event.target.id.indexOf("settings") != -1 && event.target.id != "settings") {

    settings.restoreSelects();
    settings.restoreCheckboxes();

    //Drop down menus
    const selects = document.querySelectorAll('ons-select');
    for (let i = 0; i < selects.length; i++) {
      selects[i].addEventListener("change", settings.saveSelect);
    }

    //Switches
    const switches = document.querySelectorAll('ons-switch');
    for (let i = 0; i < switches.length; i++) {
      switches[i].addEventListener("change", settings.saveCheckbox);
    }
  }

  //Theme settings
  if (event.target.matches("ons-page#theme-settings")) {

    document.querySelector('#colour-scheme').addEventListener("change", function() {
      settings.putSetting("theme", "colour-scheme", this.options[this.selectedIndex].value);
      app.setTheme(this.options[this.selectedIndex].value);
    });
  }

  //Diary settings
  if (event.target.matches("ons-page#diary-settings")) {

    //Meal names dialog
    document.querySelector('#open-meal-names-dialog').addEventListener("tap", function() {
      settings.mealNames();
    });
  }

  //Integration settings
  if (event.target.matches("ons-page#integration-settings")) {

    //OFF Credentials dialog
    document.querySelector('#open-off-settings').addEventListener("tap", function() {
      settings.offIntegration();
    });
  }
});
