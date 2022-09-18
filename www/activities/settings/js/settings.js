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

// After a breaking change to the settings schema, increment this constant
// and implement the migration in the migrateSettings() function below
const currentSettingsSchemaVersion = 6;

app.Settings = {

  settings: {},

  init: function() {
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

  putField: function(field, value) {
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
        let value = this.get(field, setting); // Get value from storage

        if (value) {
          if (Array.isArray(value)) { // Deal with array values
            value.forEach((y, j) => {
              if (setting == "meal-names") // Meal names must be localized
                y = app.strings.diary["default-meals"][y.toLowerCase()] || y;

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
      if (x.hasAttribute("field") && x.hasAttribute("name") && !x.hasChangeEvent) {
        x.addEventListener("change", (e) => {
          app.Settings.saveInputs(inputs);
          if (x.classList.contains("reset-modules"))
            app.Settings.resetModuleReadyStates(); // Reset modules for changes to take effect
        });
        x.hasChangeEvent = true;
      }
    });

    // Open Food Facts credentials login button
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

    let importFoods = document.getElementById("import-foods");
    if (importFoods) {
      importFoods.addEventListener("click", function(e) {
        app.Settings.importFoods();
      });
      app.FoodsMealsRecipes.populateCategoriesField(document.getElementById("categories"), {}, false, true, true);
    }

    let exportDiary = document.getElementById("export-diary");
    if (exportDiary) {
      exportDiary.addEventListener("click", function(e) {
        app.Settings.exportDiary();
      });
    }

    // Mode
    let modeSelect = document.querySelector(".page[data-name='settings-appearance'] #mode");

    if (modeSelect != undefined && !modeSelect.hasSecondaryChangeEvent) {
      modeSelect.addEventListener("change", (e) => {
        app.Settings.changeTheme(e.target.value, themeSelect.value);
      });
      modeSelect.hasSecondaryChangeEvent = true;
    }

    // Theme
    let themeSelect = document.querySelector(".page[data-name='settings-appearance'] #theme");

    if (themeSelect != undefined && !themeSelect.hasSecondaryChangeEvent) {
      themeSelect.addEventListener("change", (e) => {
        app.Settings.changeTheme(modeSelect.value, e.target.value);
      });
      themeSelect.hasSecondaryChangeEvent = true;
    }

    // Preferred Language
    let locale = document.querySelector(".page[data-name='settings-appearance'] #locale");

    if (locale != undefined && !locale.hasSecondaryChangeEvent) {
      locale.addEventListener("change", (e) => {
        let msg = app.strings.settings["needs-restart"] || "Restart app to apply changes.";
        app.Utils.toast(msg);
      });
      locale.hasSecondaryChangeEvent = true;
    }

    // Animations 
    let toggleAnimations = document.querySelector(".page[data-name='settings-appearance'] #toggle-animations");

    if (toggleAnimations != undefined && !toggleAnimations.hasSecondaryChangeEvent) {
      toggleAnimations.addEventListener("change", (e) => {
        let msg = app.strings.settings["needs-restart"] || "Restart app to apply changes.";
        app.Utils.toast(msg);
      });
      toggleAnimations.hasSecondaryChangeEvent = true;
    }

    // Nutriment list 
    let nutrimentList = document.getElementById("nutriment-list");
    if (nutrimentList != undefined) {
      nutrimentList.addEventListener("sortable:sort", (li) => {
        let items = nutrimentList.getElementsByTagName("li");
        let newOrder = [];
        for (let i = 0; i < items.length - 1; i++) {
          newOrder.push(items[i].id);
        }
        app.Settings.put("nutriments", "order", newOrder);
      });
    }

    // Food labels/categories list
    let categoriesList = document.getElementById("food-categories-list");
    if (categoriesList != undefined) {
      categoriesList.addEventListener("sortable:sort", (li) => {
        let items = categoriesList.getElementsByTagName("li");
        let newOrder = [];
        for (let i = 0; i < items.length - 1; i++) {
          newOrder.push(items[i].id);
        }
        app.Settings.put("foodlist", "labels", newOrder);
      });
    }
  },

  changeTheme: function(appMode, colourTheme) {
    let body = document.getElementsByTagName("body")[0];
    body.className = colourTheme;

    if (appMode === "system") {
      app.f7.enableAutoDarkMode(); // darkModeChange event will handle the rest
    } else {
      app.f7.disableAutoDarkMode();
      app.Settings.applyAppMode(appMode);
    }
  },

  applyAppMode: function(appMode) {
    let html = document.getElementsByTagName("html")[0];
    let panel = document.getElementById("app-panel");

    if (appMode === "dark") {
      html.classList.add("dark");
      panel.style["background-color"] = "black";
      Chart.defaults.global.defaultFontColor = "white";
    } else if (appMode === "light") {
      html.classList.remove("dark");
      panel.style["background-color"] = "white";
      Chart.defaults.global.defaultFontColor = "black";
    }
  },

  saveInputs: function(inputs) {
    inputs.forEach((x) => {
      // If input has same name as other inputs group them into an array
      let value = inputs.reduce((result, y) => {
        if (y.name == x.name) {
          if (y.type == "checkbox")
            result.push(y.checked);
          else if ((y.type == "radio" && y.checked) || y.type != "radio")
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
    app.Diary.resetReadyState();
  },

  saveOFFCredentials: async function(username, password) {
    let screen = document.querySelector(".off-login");
    if (app.Utils.isInternetConnected()) {
      if ((username == "" && password == "") || await app.OpenFoodFacts.testCredentials(username, password)) {
        this.put("integration", "off-username", username);
        this.put("integration", "off-password", password);
        app.f7.loginScreen.close(screen);
        let msg = app.strings.settings.integration["login-success"] || "Login Successful";
        app.Utils.toast(msg);
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
        let msg = app.strings.settings.integration["login-success"] || "Login Successful";
        app.Utils.toast(msg);
      } else {
        let msg = app.strings.settings.integration["invalid-api-key"] || "API Key Invalid";
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

  importDatabase: async function() {
    let file = await chooser.getFile();

    if (file !== undefined && file.data !== undefined) {
      let data;
      try {
        let content = new TextDecoder("utf-8").decode(file.data);
        data = JSON.parse(content);
      } catch (e) {
        let msg = app.strings.settings.integration["import-fail"] || "Import Failed";
        app.Utils.toast(msg);
      }

      if (data !== undefined) {
        let title = app.strings.settings.integration.import || "Import";
        let text = app.strings.settings.integration["confirm-import"] || "Are you sure? This will overwrite your current database.";

        let div = document.createElement("div");
        div.className = "dialog-text";
        div.innerText = text;

        let dialog = app.f7.dialog.create({
          title: title,
          content: div.outerHTML,
          buttons: [{
              text: app.strings.dialogs.cancel || "Cancel",
              keyCodes: [27]
            },
            {
              text: app.strings.dialogs.ok || "OK",
              keyCodes: [13],
              onClick: async () => {
                await dbHandler.import(data);

                if (data.settings !== undefined) {
                  let settings = app.Settings.migrateSettings(data.settings, false);
                  window.localStorage.setItem("settings", JSON.stringify(settings));
                  this.changeTheme(settings.appearance.mode, settings.appearance.theme);
                  app.f7.views.main.router.refreshPage();
                }
              }
            }
          ]
        }).open();
      }
    }
  },

  exportDiary: async function() {
    app.f7.preloader.show("red");

    const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    const units = app.Nutriments.getNutrimentUnits();
    const energyUnit = app.Settings.get("units", "energy");
    const energyName = app.Utils.getEnergyUnitName(energyUnit);
    const visible = app.Settings.getField("nutrimentVisibility");

    // Collect relevant nutriments and stats to be included in the CSV
    let relevantFields = [];

    nutriments.forEach((x) => {
      if (x !== energyName && visible[x] !== true) return;

      let displayName = app.strings.nutriments[x] || x;
      let unitSymbol = app.strings["unit-symbols"][units[x]] || units[x];

      let nutriment = {
        name: x,
        unit: units[x],
        displayName: displayName,
        unitSymbol: unitSymbol
      }
      relevantFields.push(nutriment);
    });

    app.measurements.forEach((x) => {
      let displayName = app.strings.statistics[x] || x;
      let unit = app.Goals.getGoalUnit(x, false);
      let unitSymbol = app.strings["unit-symbols"][unit] || unit;

      let stat = {
        name: x,
        unit: unit,
        displayName: displayName,
        unitSymbol: unitSymbol
      }
      relevantFields.push(stat);
    });

    // Get diary data
    let diaryData = await app.Stats.getDataFromDb(new Date(), undefined);
    let csv = "";

    // CSV header row
    csv += app.strings.settings["import-export"]["date"] || "Date";
    relevantFields.forEach((field) => {
      csv += ";" + field.displayName + " (" + field.unitSymbol + ")";
    });

    // CSV data rows
    for (let i = 0; i < diaryData.timestamps.length; i++) {
      csv += "\n";

      let timestamp = diaryData.timestamps[i];
      csv += timestamp.toLocaleDateString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC"
      });

      let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(diaryData.items[i], "ignore");
      relevantFields.forEach((x) => {
        csv += ";"

        let field = x.name;
        let unit = x.unit;

        let value;
        if (app.measurements.includes(field))
          value = app.Utils.convertUnit(diaryData.stats[i][field], app.measurementUnits[field], unit);
        else
          value = nutrition[field];

        if (value !== undefined)
          csv += (Math.round(value * 100) / 100).toLocaleString([], { useGrouping: false });
      });
    }

    // Write CSV to file
    let filename = "diary_export.csv";
    let path = await app.Utils.writeFile(csv, filename);

    app.f7.preloader.hide();

    if (path !== undefined) {
      let msg = app.strings.settings.integration["export-success"] || "Database Exported";
      app.Utils.notify(msg + ": " + path);
    } else {
      let msg = app.strings.settings.integration["export-fail"] || "Export Failed";
      app.Utils.toast(msg);
    }
  },

  putFoodItem: function(item) {
    return new Promise(async function(resolve, reject) {
      if (item.id == undefined) {
        item.hidden = true; // Hide newly imported items by default

        if (item.barcode !== undefined) {
          let dbRecord = await dbHandler.getFirstNonArchived("foodList", "barcode", item.barcode);

          if (dbRecord !== undefined) {
            item.id = dbRecord.id; // Use ID of existing item
            item.hidden = dbRecord.hidden;
          }
        }
      }

      item.dateTime = new Date();

      dbHandler.put(item, "foodList").onsuccess = (e) => {
        resolve(e.target.result);
      };
    })
  },

  updateFoodItems: function(items) {
    items.forEach((x) => {
      this.putFoodItem(x);
    });
  },

  importFoods: async function() {
    let categories = app.FoodsMealsRecipes.getSelectedCategories(document.getElementById("categories"));

    if (categories == undefined) {
      let msg = app.strings.settings.integration["import-foods-category-fail"] || "Please select at least one category";
      app.Utils.toast(msg);
      return;
    }

    let file = await chooser.getFile();

    if (file !== undefined && file.data !== undefined) {
      let data;
      try {
        let content = new TextDecoder("utf-8").decode(file.data);
        data = JSON.parse(content);
        if (data.version !== 1)
          throw "Wrong food list version";
        for (let i = 0; i < data.foodList.length; i++) {
          if (data.foodList[i].name == undefined)
            throw "Missing name";
          if (data.foodList[i].unit == undefined)
            throw "Missing unit";
          if (data.foodList[i].portion == undefined)
            throw "Missing portion";
        }
      } catch (e) {
        console.log(e);
        let msg = app.strings.settings.integration["import-fail"] || "Import Failed";
        app.Utils.toast(msg);
        return;
      }

      if (data !== undefined) {
        for (let i = 0; i < data.foodList.length; i++) {
          // Add selected catogories
          data.foodList[i].categories = categories;
          // Add a pseudo-barcode to prevent duplicate imports
          if (data.foodList[i].id == undefined && data.foodList[i].uniqueId !== undefined)
            data.foodList[i].barcode = "custom_" + data.foodList[i].uniqueId.toString();
        }

        let title = app.strings.settings.integration.import || "Import";
        let text = app.strings.settings["integration"]["confirm-import-foods"] || "Are you sure? This action cannot be undone. Please backup your database first.";

        let div = document.createElement("div");
        div.className = "dialog-text";
        div.innerText = text;

        let dialog = app.f7.dialog.create({
          title: title,
          content: div.outerHTML,
          buttons: [{
              text: app.strings.dialogs.cancel || "Cancel",
              keyCodes: [27]
            },
            {
              text: app.strings.dialogs.ok || "OK",
              keyCodes: [13],
              onClick: async () => {
                await this.updateFoodItems(data.foodList);
                let msg = app.strings.settings.integration["import-success-message"] || "Import Complete";
                app.Utils.toast(msg);
              }
            }
          ]
        }).open();
      }
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
        timestamps: false,
        "show-thumbnails": false,
        "wifi-thumbnails": true,
        "show-all-nutriments": false,
        "show-nutrition-units": false,
        "prompt-add-items": false
      },
      foodlist: {
        labels: app.FoodsCategories.defaultLabels,
        categories: app.FoodsCategories.defaultCategories,
        sort: "alpha",
        "show-category-labels": false,
        "show-thumbnails": false,
        "wifi-thumbnails": true,
        "show-images": true,
        "wifi-images": true,
        "show-notes": false
      },
      integration: {
        "barcode-sound": false,
        "edit-images": false,
        "search-language": "Default",
        "search-country": "All",
        "upload-country": "Auto",
        usda: false
      },
      appearance: {
        mode: "light",
        theme: "color-theme-red",
        animations: false,
        locale: "auto",
        "start-page": "/settings/"
      },
      units: {
        energy: "kcal",
        weight: "kg",
        length: "cm"
      },
      goals: {
        migrated: true,
        "first-day-of-week": "0",
        "average-goal-base": "week",
        kilojoules: {
          "show-in-diary": true,
          "show-in-stats": true,
          "goal-list": [{
            "shared-goal": true,
            "goal": ["8400", "", "", "", "", "", ""]
          }]
        },
        calories: {
          "show-in-diary": true,
          "show-in-stats": true,
          "goal-list": [{
            "shared-goal": true,
            "goal": ["2000", "", "", "", "", "", ""]
          }]
        },
        fat: {
          "show-in-diary": true,
          "show-in-stats": true,
          "goal-list": [{
            "shared-goal": true,
            "goal": ["70", "", "", "", "", "", ""]
          }]
        },
        carbohydrates: {
          "show-in-diary": true,
          "show-in-stats": true,
          "goal-list": [{
            "shared-goal": true,
            "goal": ["260", "", "", "", "", "", ""]
          }]
        },
        proteins: {
          "show-in-diary": true,
          "show-in-stats": true,
          "goal-list": [{
            "shared-goal": true,
            "goal": ["50", "", "", "", "", "", ""]
          }]
        }
      },
      nutriments: {
        order: ["kilojoules", "calories", "fat", "saturated-fat", "carbohydrates", "sugars", "fiber", "proteins", "salt", "sodium", "cholesterol", "trans-fat", "monounsaturated-fat", "polyunsaturated-fat", "omega-3-fat", "omega-6-fat", "omega-9-fat", "vitamin-a", "vitamin-b1", "vitamin-b2", "vitamin-pp", "pantothenic-acid", "vitamin-b6", "biotin", "vitamin-b9", "vitamin-b12", "vitamin-c", "vitamin-d", "vitamin-e", "vitamin-k", "potassium", "chloride", "calcium", "phosphorus", "iron", "magnesium", "zinc", "copper", "manganese", "fluoride", "selenium", "iodine", "caffeine", "alcohol", "sucrose", "glucose", "fructose", "lactose"],
        units: {}
      },
      nutrimentVisibility: {
        "fat": true,
        "saturated-fat": true,
        "carbohydrates": true,
        "sugars": true,
        "proteins": true,
        "salt": true
      },
      developer: {
        "data-sharing-active": false,
        "data-sharing-wifi-only": true,
        "data-sharing-address": "",
        "data-sharing-authorization": ""
      },
      firstTimeSetup: true,
      schemaVersion: currentSettingsSchemaVersion
    };

    window.localStorage.setItem("settings", JSON.stringify(defaults));
  },

  migrateSettings: function(settings, saveChanges = true) {
    if (settings !== undefined && (settings.schemaVersion === undefined || settings.schemaVersion < currentSettingsSchemaVersion)) {

      // Theme settings must be renamed to Appearance
      if (settings.theme !== undefined && settings.appearance === undefined) {
        settings.appearance = settings.theme;
        delete settings.theme;
      }

      // New nutriments must be added
      if (settings.nutriments !== undefined && settings.nutriments.order !== undefined) {
        app.nutriments.forEach((x) => {
          if (!settings.nutriments.order.includes(x))
            settings.nutriments.order.push(x);
        });
      }

      // Default food labels and categories must be added
      if (settings.foodlist !== undefined && settings.foodlist.labels === undefined && settings.foodlist.categories === undefined) {
        settings.foodlist.labels = app.FoodsCategories.defaultLabels;
        settings.foodlist.categories = app.FoodsCategories.defaultCategories;
      }

      // First Day of Week and Average Base settings must be added
      if (settings.goals !== undefined && settings.goals["first-day-of-week"] === undefined && settings.goals["average-goal-base"] === undefined) {
        settings.goals["first-day-of-week"] = "0";
        settings.goals["average-goal-base"] = "week";
      }

      // Goals must be migrated to new format
      if (settings.goals !== undefined && settings.goals.migrated === undefined) {
        let oldGoals = settings.goals;
        let nutriments = app.nutriments;
        if (settings.nutriments !== undefined && settings.nutriments.order !== undefined)
          nutriments = settings.nutriments.order;
        settings.goals = app.Settings.migrateGoalSettings(oldGoals, nutriments);
      }

      // Boolean value for dark-mode must be replaced with string value
      if (settings.appearance !== undefined) {
        if (settings.appearance["dark-mode"] === true)
          settings.appearance.mode = "dark";
        else
          settings.appearance.mode = "light";
        delete settings.appearance["dark-mode"];
      }

      settings.schemaVersion = currentSettingsSchemaVersion;

      if (saveChanges)
        window.localStorage.setItem("settings", JSON.stringify(settings));
    }

    return settings;
  },

  migrateGoalSettings: function (oldGoals, nutriments) {

    let newGoals = {
      migrated: true
    };

    for (let key in oldGoals) {
      for (let setting of ["first-day-of-week", "average-goal-base"]) {
        if (key == setting) {
          newGoals[setting] = oldGoals[key];
          continue;
        }
      }
      for (let setting of ["-show-in-diary", "-show-in-stats"]) {
        if (key.endsWith(setting)) {
          let stat = key.replace(setting, "");
          let settingName = setting.substring(1);
          newGoals[stat] = newGoals[stat] || {};
          newGoals[stat][settingName] = oldGoals[key];
          continue;
        }
      }
      for (let setting of ["-shared-goal", "-auto-adjust", "-minimum-goal", "-percent-goal"]) {
        if (key.endsWith(setting)) {
          let stat = key.replace(setting, "");
          let settingName = setting.substring(1);
          newGoals[stat] = newGoals[stat] || {};
          newGoals[stat]["goal-list"] = newGoals[stat]["goal-list"] || [{}];
          newGoals[stat]["goal-list"][0][settingName] = oldGoals[key];
          continue;
        }
      }
      if (nutriments.includes(key) || app.measurements.includes(key)) {
        newGoals[key] = newGoals[key] || {};
        newGoals[key]["goal-list"] = newGoals[key]["goal-list"] || [{}];
        newGoals[key]["goal-list"][0]["goal"] = oldGoals[key];
        continue;
      }
    }

    return newGoals;
  }
};

document.addEventListener("page:init", async function(e) {
  const pageName = e.target.attributes["data-name"].value;

  if (pageName == "settings-nutriments")
    app.Nutriments.populateNutrimentList();

  if (pageName == "settings-foods-categories")
    app.FoodsCategories.populateFoodCategoriesList();

  //Settings and all settings subpages
  if (pageName.indexOf("settings") != -1) {
    app.Settings.init();
  }
});
