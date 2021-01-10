/*
  Copyright 2020, 2021 David Healey

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

import * as Utils from "/www/assets/js/utils.js";
import * as OFF from "/www/src/activities/foodlist/js/open-food-facts.js";
import * as USDA from "/www/src/activities/foodlist/js/usda.js";

var s;
waistline.Settings = {

  settings: {},

  init: function() {
    s = this.settings; //Assign settings object
    if (!s.ready) {
      s.ready = true;
    }
    this.bindUIActions();
    this.restoreInputValues();
  },

  put: function(field, setting, value) {
    let settings = JSON.parse(window.localStorage.getItem("settings")) || {};
    settings[field] = settings[field] || {};
    settings[field][setting] = value;
    window.localStorage.setItem("settings", JSON.stringify(settings));
  },

  get: function(field, setting) {
    let settings = JSON.parse(window.localStorage.getItem("settings"));
    if (settings && settings[field] && settings[field][setting] !== undefined) {
      return settings[field][setting];
    }
    return undefined;
  },

  getField: function(field) {
    let settings = JSON.parse(window.localStorage.getItem("settings"));
    if (settings && settings[field] !== undefined) {
      return JSON.parse(settings[field]);
    }
    return undefined;
  },

  putField: function(field) {
    let settings = JSON.parse(window.localStorage.getItem("settings")) || {};
    settings[field] = settings[field] || {};
    settings[field] = value;
    window.localStorage.setItem("settings", JSON.stringify(settings));
  },

  restoreInputValues: function() {
    const inputs = Array.from(document.querySelectorAll("input, select"));

    inputs.forEach((x, i) => {

      let field = x.getAttribute("field");
      let setting = x.getAttribute("name");

      if (field && setting) {
        let value = this.get(field, setting); //Get value from storage

        if (value) {

          if (Array.isArray(value)) { //Deal with array values
            value.forEach((y, j) => { //Each value
              for (let k = 0; k < inputs.length; k++) { //Each input
                let z = inputs[k];
                if (z.name == x.name) { //If the input matches the name of the original input
                  if (z.type == "checkbox")
                    z.checked = y;
                  else
                    z.value = y;
                  inputs.splice(k, 1); //Remove input from array because we've done this one
                  break; //Exit inner loop
                }
              }
            });
          } else {
            if (x.type == "checkbox")
              x.checked = value;
            else
              x.value = value;
          }
        }
      }
    });
  },

  bindUIActions: function() {

    // Input fields (including selects)
    const inputs = Array.from(document.querySelectorAll("input:not(.manual-bind), select"));

    inputs.forEach((x, i) => {
      x.addEventListener("change", (e) => {

        //If input has same name as other inputs group them into an array
        let value = inputs.reduce((result, y) => {
          if (y.name == x.name) {
            if (y.type == "checkbox")
              result.push(y.checked);
            else
              result.push(y.value);
          }
          return result;
        }, []);

        // Input is not part of an array so just get first element
        if (value.length == 1) value = value[0];

        let field = x.getAttribute("field");
        let setting = x.getAttribute("name");

        this.put(field, setting, value);
        this.resetModuleReadyStates(); //Reset modules for changes to take effect
      });
    });

    // Open food facts credentials login button
    let offLogin = document.getElementById("off-login");
    if (offLogin) {
      offLogin.addEventListener("click", function(e) {
        let username = document.querySelector(".off-login #off-username").value;
        let password = document.querySelector(".off-login #off-password").value;
        waistline.Settings.saveOFFCredentials(username, password);
      });
    }

    // USDA API Key save link
    let usdaSave = document.getElementById("usda-save");
    if (usdaSave) {
      usdaSave.addEventListener("click", function(e) {
        let key = document.querySelector(".usda-login #usda-key").value;
        waistline.Settings.saveUSDAKey(key);
      });
    }
  },

  resetModuleReadyStates: function() {
    waistline.Diary.setReadyState(false);
  },

  saveOFFCredentials: async function(username, password) {
    let screen = document.querySelector(".off-login");
    if (Utils.isInternetConnected()) {
      if ((username == "" && password == "") || await OFF.testCredentials(username, password)) {
        this.put("integration", "off-username", username);
        this.put("integration", "off-password", password);
        f7.loginScreen.close(screen);
      } else {
        Utils.notification("Invalid Credentials", "error");
      }
    } else {
      f7.loginScreen.close(screen);
    }
  },

  saveUSDAKey: async function(key) {
    let screen = document.querySelector(".usda-login");
    if (Utils.isInternetConnected()) {
      if (key == "" || await USDA.testApiKey(key)) {
        this.put("integration", "usda-key", key);
        f7.loginScreen.close(screen);
      } else {
        Utils.notification("API Key Invalid", "error");
      }
    } else {
      f7.loginScreen.close(screen);
    }
  },
};

document.addEventListener("page:init", async function(e) {
  const pageName = e.target.attributes["data-name"].value;

  //Settings and all settings subpages
  if (pageName.indexOf("settings") != -1) {
    waistline.Settings.init();
  }
});