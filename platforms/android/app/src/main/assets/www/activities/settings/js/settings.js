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
  along with app.  If not, see <http://www.gnu.org/licenses/>.
*/

var s;
app.Settings = {

  settings: {},
  nutrimentSortLock: 1,

  init: function() {
    s = this.settings; //Assign settings object
    if (!s.ready) {
      s.ready = true;
    }
    app.Settings.bindUIActions();

    const inputs = Array.from(document.querySelectorAll("input, select"));
    app.Settings.restoreInputValues(inputs);
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
      return settings[field];
    }
    return undefined;
  },

  putField: function(field) {
    let settings = JSON.parse(window.localStorage.getItem("settings")) || {};
    settings[field] = settings[field] || {};
    settings[field] = value;
    window.localStorage.setItem("settings", JSON.stringify(settings));
  },

  restoreInputValues: function(inputs) {
    for (let i = 0; i < inputs.length; i++) {
      let x = inputs[i];
      let field = x.getAttribute("field");
      let setting = x.getAttribute("name");

      if (field && setting) {
        let value = this.get(field, setting); //Get value from storage

        if (value) {
          if (Array.isArray(value)) { // Deal with array values            
            value.forEach((y, j) => {
              for (let k = 0; k < inputs.length; k++) {
                let z = inputs[k];

                if (z.name == x.name) { // If the input matches the name of the original input
                  if (z.type == "checkbox")
                    z.checked = y;
                  else
                    z.value = y;

                  inputs.splice(k, 1); // Remove input from array because we've done this one
                  break; // Exit inner loop
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
    }
  },

  bindUIActions: function() {

    // Input fields (including selects)
    const inputs = Array.from(document.querySelectorAll("input:not(.manual-bind), select"));

    inputs.forEach((x, i) => {
      x.addEventListener("change", (e) => {
        app.Settings.saveInputs(inputs);
        app.Settings.resetModuleReadyStates(); //Reset modules for changes to take effect
      });
    });

    // Open food facts credentials login button
    let offLogin = document.getElementById("off-login");
    if (offLogin) {
      offLogin.addEventListener("click", function(e) {
        let username = document.querySelector(".off-login #off-username").value;
        let password = document.querySelector(".off-login #off-password").value;
        app.Settings.saveOFFCredentials(username, password);
      });
    }

    // USDA API Key save link
    let usdaSave = document.getElementById("usda-save");
    if (usdaSave) {
      usdaSave.addEventListener("click", function(e) {
        let key = document.querySelector(".usda-login #usda-key").value;
        app.Settings.saveUSDAKey(key);
      });
    }

    // Import/Export 
    let exportDb = document.getElementById("export-db");
    if (exportDb) {
      exportDb.addEventListener("click", function(e) {
        app.Settings.exportDatabase();
      });
    }

    let importDb = document.getElementById("import-db");
    if (importDb) {
      importDb.addEventListener("click", function(e) {
        app.Settings.importDatabase();
      });
    }

    // Dark mode
    let darkMode = document.querySelector(".page[data-name='settings-theme'] #dark-mode");

    if (darkMode != undefined && !darkMode.hasClickEvent) {
      darkMode.addEventListener("click", (e) => {
        app.Settings.changeTheme(e.target.checked, themeSelect.value);
      });
      darkMode.hasClickEvent = true;
    }

    // Theme
    let themeSelect = document.querySelector(".page[data-name='settings-theme'] #theme");

    if (themeSelect != undefined && !themeSelect.hasChangeEvent) {
      themeSelect.addEventListener("change", (e) => {
        app.Settings.changeTheme(darkMode.checked, e.target.value);
      });
      themeSelect.hasChangeEvent = true;
    }

    // Preferred Language
    let locale = document.querySelector(".page[data-name='settings-theme'] #locale");

    if (locale != undefined && !locale.hasChangeEvent) {
      locale.addEventListener("change", (e) => {
        let msg = app.strings.settings["needs-restart"] || "Restart app to apply changes.";
        app.Utils.toast(msg);
      });
      locale.hasChangeEvent = true;
    }

    // Animations 
    let toggleAnimations = document.getElementById("toggle-animations");
    if (toggleAnimations != undefined) {
      toggleAnimations.addEventListener("click", (e) => {
        let msg = app.strings.settings["needs-restart"] || "Restart app to apply changes.";
        app.Utils.toast(msg);
      });
    }

    // Nutriment list 
    let nutrimentList = document.getElementById("nutriment-list");
    if (nutrimentList != undefined) {
      app.f7.on("sortableSort", (e, data) => {
        let li = nutrimentList.getElementsByTagName("li");
        let newOrder = [];
        for (let i = 0; i < li.length; i++) {
          newOrder.push(li[i].id);
        }
        app.Settings.put("nutriments", "order", newOrder);
      });
    }
  },

  changeTheme: function(darkMode, colourTheme) {
    let body = document.getElementsByTagName("body")[0];
    let panel = document.getElementById("left-panel");

    if (darkMode === true) {
      body.className = colourTheme + " theme-dark";
      panel.style["background-color"] = "black";
      Chart.defaults.global.defaultFontColor = 'white';
    } else {
      body.className = colourTheme;
      panel.style["background-color"] = "white";
      Chart.defaults.global.defaultFontColor = 'black';
    }
  },

  saveInputs: function(inputs) {
    inputs.forEach((x) => {
      // If input has same name as other inputs group them into an array
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

      app.Settings.put(field, setting, value);
    });
  },

  resetModuleReadyStates: function() {
    app.Diary.setReadyState(false);
  },

  saveOFFCredentials: async function(username, password) {
    let screen = document.querySelector(".off-login");
    if (app.Utils.isInternetConnected()) {
      if ((username == "" && password == "") || await app.OpenFoodFacts.testCredentials(username, password)) {
        this.put("integration", "off-username", username);
        this.put("integration", "off-password", password);
        app.f7.loginScreen.close(screen);
        app.Utils.toast(app.strings.settings.integration["login-success"] || "Login Successful");
      } else {
        let msg = app.strings.settings.integration["invalid-credentials"] || "Invalid Credentials";
        app.Utils.toast(msg);
      }
    }
  },

  saveUSDAKey: async function(key) {
    let screen = document.querySelector(".usda-login");
    if (app.Utils.isInternetConnected()) {
      if (key == "" || await app.USDA.testApiKey(key)) {
        this.put("integration", "usda-key", key);
        app.f7.loginScreen.close(screen);
        app.Utils.toast(app.strings.settings.integration["login-success"] || "Login Successful");
      } else {
        let msg = app.strings.settings.integration["invalid-credentials"] || "API Key Invalid";
        app.Utils.toast(msg);
      }
    }
  },

  exportDatabase: async function() {
    app.f7.preloader.show("red");

    let data = await dbHandler.export();
    data.settings = JSON.parse(window.localStorage.getItem("settings"));
    let json = JSON.stringify(data);

    let filename = "waistline_export.json";
    let path = await app.Utils.writeFile(json, filename);

    app.f7.preloader.hide();

    if (path !== undefined) {
      let msg = app.strings.settings.integration["export-success"] || "Database Exported";
      app.Utils.notify(msg + ": " + path);
    } else {
      let msg = app.strings.settings.integration["export-fail"] || "Export Failed";
      app.Utils.toast(msg);
    }
  },

  importDatabase: function() {
    let title = app.strings.settings.integration.import || "Import";
    let msg = app.strings.settings.integration["confirm-import"] || "Are you sure? This will overwrite your current database.";

    let dialog = app.f7.dialog.confirm(msg, title, async () => {
      let filename = "waistline_export.json";
      let data = JSON.parse(await app.Utils.readFile(filename));

      await dbHandler.import(data);

      if (data.settings) {
        window.localStorage.setItem("settings", JSON.stringify(data.settings));
        this.changeTheme(data.settings.theme["dark-mode"], data.settings.theme["theme"]);
      }
    });
  },

  populateNutrimentList: function() {
    let nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    let ul = document.querySelector("#nutriment-list");

    for (let i in nutriments) {
      let n = nutriments[i];

      if (n == "calories" || n == "kilojoules") continue;

      let li = document.createElement("li");
      li.id = n;
      ul.appendChild(li);

      let content = document.createElement("div");
      content.className = "item-content";
      li.appendChild(content);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      content.appendChild(inner);

      let text = app.strings.nutriments[n] || n;
      let title = document.createElement("div");
      title.className = "item-title";
      title.innerHTML = app.Utils.tidyText(text, 50, true);
      inner.appendChild(title);

      let after = document.createElement("div");
      after.className = "item-after";
      inner.appendChild(after);

      let label = document.createElement("label");
      label.className = "toggle toggle-init";
      after.appendChild(label);

      let input = document.createElement("input");
      input.type = "checkbox";
      input.name = n;
      input.setAttribute('field', 'nutrimentVisibility');
      label.appendChild(input);

      let span = document.createElement("span");
      span.className = "toggle-icon";
      label.appendChild(span);

      let sortHandler = document.createElement("div");
      sortHandler.className = "sortable-handler";
      li.appendChild(sortHandler);
    }
  },

  firstTimeSetup: function() {
    let defaults = {
      statistics: {
        "y-zero": false,
        "average-line": true,
        "goal-line": true
      },
      diary: {
        "meal-names": ["Breakfast", "Lunch", "Dinner", "Snacks", "", "", ""],
        "show-nutrition-units": false,
        "show-thumbnails": false,
        timestamps: false,
        "wifi-thumbnails": true
      },
      foodlist: {
        "show-images": true,
        sort: "alpha",
        "wifi-images": true
      },
      integration: {
        "edit-images": false,
        "search-country": "United Kingdom",
        usda: false
      },
      theme: {
        animations: true,
        "dark-mode": false,
        "start-page": "/settings/",
        theme: "color-theme-red",
        locale: "auto"
      },
      units: {
        energy: "kcal",
        "energy-unit": "kcal",
        length: "cm",
        weight: "kg",
      },
      goals: {
        calories: ["2000", "", "", "", "", "", ""],
        "calories-shared-goal": true,
        "calories-show-in-diary": true,
        "calories-show-in-stats": true,
        proteins: ["50", "", "", "", "", "", ""],
        "proteins-shared-goal": true,
        "proteins-show-in-diary": true,
        "proteins-show-in-stats": true,
        carbohydrates: ["250", "", "", "", "", "", ""],
        "carbohydrates-shared-goal": true,
        "carbohydrates-show-in-diary": true,
        "carbohydrates-show-in-stats": true,
        fat: ["65", "", "", "", "", "", ""],
        "fat-shared-goal": true,
        "fat-show-in-diary": true,
        "fat-show-in-stats": true,
      },
      nutriments: {
        order: ["calories", "kilojoules", "fat", "saturated-fat", "carbohydrates", "sugars", "fiber", "proteins", "salt", "monounsaturated-fat", "polyunsaturated-fat", "trans-fat", "omega-3-fat", "cholesterol", "sodium", "potassium", "vitamin-a", "vitamin-d", "vitamin-e", "vitamin-k", "vitamin-c", "vitamin-b1", "vitamin-b2", "vitamin-b6", "vitamin-b9", "vitamin-b12", "chloride", "calcium", "iron", "magnesium", "zinc", "caffeine", "alcohol", "sucrose", "glucose", "fructose", "lactose"]
      },
      nutrimentVisibility: {
        "fat": true,
        "carbohydrates": true,
        "proteins": true,
        "salt": true,
        "sugars": true
      },
      firstTimeSetup: true
    };

    window.localStorage.setItem("settings", JSON.stringify(defaults));
  }
};

document.addEventListener("page:init", async function(e) {
  const pageName = e.target.attributes["data-name"].value;

  if (pageName == "settings-nutriments")
    app.Settings.populateNutrimentList();

  //Settings and all settings subpages
  if (pageName.indexOf("settings") != -1) {
    app.Settings.init();
  }
});