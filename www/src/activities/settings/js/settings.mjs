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

    //Input fields (including selects)
    const inputs = Array.from(document.querySelectorAll("input, select"));

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

        //Input is not part of an array so just get first element
        if (value.length == 1) value = value[0];

        let field = x.getAttribute("field");
        let setting = x.getAttribute("name");

        this.put(field, setting, value);
        this.resetModuleReadyStates(); //Reset modules for changes to take effect
      });
    });
  },

  resetModuleReadyStates: function() {
    waistline.Diary.setReadyState(false);
  }

};

document.addEventListener("page:init", function(e) {
  const pageName = e.target.attributes["data-name"].value;

  //Settings and all settings subpages
  if (pageName.indexOf("settings") != -1) {
    waistline.Settings.init();
  }
});