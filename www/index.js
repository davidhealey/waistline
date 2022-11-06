/*
  Copyright 2018, 2019, 2020, 2021 David Healey

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

const app = {
  mode: "release",
  version: "%%VERSION%%", // Will be set on build by Cordova hook
  data: {}, // App wide object that can be used to store stuff
  strings: {}, // Localization strings
  standardUnits: ["kcal", "kJ", "ug", "µg", "mg", "g", "kg", "ul", "µl", "ml", "dl", "dL", "cl", "cL", "l", "L"],
  bodyStats: ["weight", "neck", "waist", "hips", "body fat"],
  bodyStatsUnits: {
    "weight": "kg",
    "neck": "cm",
    "waist": "cm",
    "hips": "cm",
    "body fat": "%"
  },
  energyMacroNutriments: ["fat", "saturated-fat", "carbohydrates", "sugars", "proteins"],
  nutriments: ["kilojoules", "calories", "fat", "saturated-fat", "carbohydrates", "sugars", "fiber", "proteins", "salt", "sodium", "cholesterol", "trans-fat", "monounsaturated-fat", "polyunsaturated-fat", "omega-3-fat", "omega-6-fat", "omega-9-fat", "vitamin-a", "vitamin-b1", "vitamin-b2", "vitamin-pp", "pantothenic-acid", "vitamin-b6", "biotin", "vitamin-b9", "vitamin-b12", "vitamin-c", "vitamin-d", "vitamin-e", "vitamin-k", "potassium", "chloride", "calcium", "phosphorus", "iron", "magnesium", "zinc", "copper", "manganese", "fluoride", "selenium", "iodine", "caffeine", "alcohol", "sucrose", "glucose", "fructose", "lactose"],
  nutrimentUnits: {
    "kilojoules": "kJ",
    "calories": "kcal",
    "fat": "g",
    "saturated-fat": "g",
    "carbohydrates": "g",
    "sugars": "g",
    "fiber": "g",
    "proteins": "g",
    "salt": "g",
    "sodium": "mg",
    "cholesterol": "mg",
    "trans-fat": "g",
    "monounsaturated-fat": "g",
    "polyunsaturated-fat": "g",
    "omega-3-fat": "g",
    "omega-6-fat": "g",
    "omega-9-fat": "g",
    "vitamin-a": "µg",
    "vitamin-b1": "mg",
    "vitamin-b2": "mg",
    "vitamin-pp": "mg",
    "pantothenic-acid": "mg",
    "vitamin-b6": "mg",
    "biotin": "µg",
    "vitamin-b9": "µg",
    "vitamin-b12": "µg",
    "vitamin-c": "mg",
    "vitamin-d": "µg",
    "vitamin-e": "mg",
    "vitamin-k": "µg",
    "potassium": "mg",
    "chloride": "mg",
    "calcium": "mg",
    "phosphorus": "mg",
    "iron": "mg",
    "magnesium": "mg",
    "zinc": "mg",
    "copper": "mg",
    "manganese": "mg",
    "fluoride": "mg",
    "selenium": "µg",
    "iodine": "µg",
    "caffeine": "mg",
    "alcohol": "g",
    "sucrose": "g",
    "glucose": "g",
    "fructose": "g",
    "lactose": "g"
  },

  getLanguage: function(locale) {
    if (locale == undefined || locale == "auto") {
      locale = navigator.language.replace(/_/, '-').toLowerCase();

      if (locale.length > 3)
        locale = locale.substring(0, 3) + locale.substring(3, 5).toUpperCase();
    }
    return locale;
  },

  localize: function() {
    let lang = app.getLanguage(app.Settings.get("appearance", "locale"));

    // Get default/fallback locale data
    if (Object.keys(app.strings).length == 0) {
      $.getJSON("assets/locales/locale-en.json", function(data) {
        app.strings = data;
      });
    }

    $("[data-localize]").localize("assets/locales/locale", {
      language: lang,
      skipLanguage: /^en/,
      callback: function(data, defaultCallback) {

        // Get localized strings
        let locale = $.localize.data["assets/locales/locale"];

        // Merge the default strings with the locale in case there are any missing values
        app.strings = Object.assign(app.strings, locale);
        defaultCallback(data);
      }
    });
  },

  setRtlWritingDirection: function() {
    $("#app-panel").get(0).classList.replace("panel-left", "panel-right");
    $("#framework7").get(0).setAttribute("href", "assets/framework7/framework7-bundle-rtl.min.css");
    $("html").get(0).setAttribute("dir", "rtl");
  },

  f7: new Framework7({
    // App root element
    root: "#app",
    // App Name
    name: "Waistline",
    // App id
    id: "com.waist.line",
    version: "2.9.2",
    // Enable swipe panel
    panel: {
      swipe: true,
      swipeActiveArea: 30,
    },
    calendar: {
      url: 'calendar/',
      dateFormat: 'dd.mm.yyyy',
    },
    touch: {
      tapHold: true, //enable tap hold events
      disableContextMenu: false
    },
    // Add default routes
    routes: [{
        name: "Statistics",
        path: "/statistics/",
        url: "activities/statistics/views/statistics.html"
      },
      {
        name: "Diary",
        path: "/diary/",
        url: "activities/diary/views/diary.html",
        routes: [{
          name: "Chart",
          path: "/chart/",
          url: "activities/diary/views/diary-chart.html",
          options: {
            transition: "f7-parallax"
          }
        }]
      },
      {
        name: "Foods, Meals, Recipes",
        path: "/foods-meals-recipes/",
        url: "activities/foods-meals-recipes/views/foods-meals-recipes.html",
        tabs: [{
            path: '/',
            id: 'foodlist',
            url: 'activities/foodlist/views/foodlist.html',
          },
          {
            path: '/recipes/',
            id: 'recipes',
            url: 'activities/recipes/views/recipes.html'
          },
          {
            path: '/meals/',
            id: 'meals',
            url: 'activities/meals/views/meals.html'
          }
        ],
        routes: [{
            name: "Food Editor",
            path: "/food-editor/",
            url: "activities/foods-meals-recipes/views/food-editor.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            name: "Meal Editor",
            path: "/meal-editor/",
            url: "activities/meals/views/meal-editor.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            name: "Recipe Editor",
            path: "/recipe-editor/",
            url: "activities/recipes/views/recipe-editor.html",
            options: {
              transition: "f7-parallax"
            }
          }
        ]
      },
      {
        name: "Settings",
        path: "/settings/",
        url: "activities/settings/views/settings.html",
        routes: [{
            path: "appearance/",
            url: "activities/settings/views/appearance.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            path: "statistics/",
            url: "activities/settings/views/statistics.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            path: "diary/",
            url: "activities/settings/views/diary.html",
            options: {
              transition: "f7-parallax"
            },
            routes: [{
              path: "meal-names/",
              url: "activities/settings/views/diary-meal-names.html",
              options: {
                transition: "f7-parallax"
              },
            }]
          },
          {
            path: "foods/",
            url: "activities/settings/views/foods.html",
            options: {
              transition: "f7-parallax"
            },
            routes: [{
              path: "categories/",
              url: "activities/settings/views/foods-categories.html",
              options: {
                transition: "f7-parallax"
              },
            }]
          },
          {
            path: "goals/",
            url: "activities/settings/views/goals.html",
            options: {
              transition: "f7-parallax"
            }
          },,
          {
            path: "units/",
            url: "activities/settings/views/units.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            path: "nutriments/",
            url: "activities/settings/views/nutriments.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            path: "body-stats/",
            url: "activities/settings/views/body-stats.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            path: "integration/",
            url: "activities/settings/views/integration.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            path: "import-export/",
            url: "activities/settings/views/import-export.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            path: "developer/",
            url: "activities/settings/views/developer.html",
            options: {
              transition: "f7-parallax"
            }
          }
        ]
      },
      {
        name: "Goals",
        path: "/goals/",
        url: "activities/goals/views/goals.html",
        routes: [{
          name: "Goal Editor",
          path: "/goal-editor/",
          url: "activities/goals/views/goal-editor.html",
          options: {
            transition: "f7-parallax"
          }
        }]
      },
      {
        name: "About",
        path: "/about/",
        url: "activities/about/views/about.html"
      },
      {
        name: "Setup Wizard",
        path: "/setup-wizard/",
        url: "activities/setup-wizard/views/setup-wizard.html",
        routes: [{
            name: "Setup Wizard Target Weight",
            path: "/target-weight/",
            url: "activities/setup-wizard/views/setup-wizard-target-weight.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            name: "Setup Wizard Current Weight",
            path: "/current-weight/",
            url: "activities/setup-wizard/views/setup-wizard-current-weight.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            name: "Setup Wizard Height",
            path: "/height/",
            url: "activities/setup-wizard/views/setup-wizard-height.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            name: "Setup Wizard DOB",
            path: "/dob/",
            url: "activities/setup-wizard/views/setup-wizard-dob.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            name: "Setup Wizard Gender",
            path: "/gender/",
            url: "activities/setup-wizard/views/setup-wizard-gender.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            name: "Setup Wizard Activity Level",
            path: "/activity-level/",
            url: "activities/setup-wizard/views/setup-wizard-activity-level.html",
            options: {
              transition: "f7-parallax"
            }
          },
          {
            name: "Summary",
            path: "/summary/",
            url: "activities/setup-wizard/views/setup-wizard-summary.html",
            options: {
              transition: "f7-parallax"
            }
          }
        ]
      },
    ]
  })
};

// Create main view
let animate = true;
let rtl = false;
let settings = JSON.parse(window.localStorage.getItem("settings"));

if (settings != undefined && settings.appearance !== undefined) {
  if (settings.appearance.animations !== undefined)
    animate = !settings.appearance.animations;
  if (settings.appearance.locale !== undefined)
    rtl = app.getLanguage(settings.appearance.locale).startsWith("he");
}

let viewOptions = {
  animate: animate
};

if (rtl)
  app.setRtlWritingDirection();

const mainView = app.f7.views.create("#main-view", viewOptions);

let enableDisableSwipe = function(panel) {
  let pageName = app.f7.views.main.router.currentRoute.name || "";
  let history = app.f7.views.main.router.history || [];

  if (pageName.includes("Editor"))
    panel.disableSwipe();
  else if (pageName == "Chart")
    panel.disableSwipe();
  else if (pageName == "Foods, Meals, Recipes" && history.includes("/diary/"))
    panel.disableSwipe();
  else
    panel.enableSwipe();
};

document.addEventListener("page:init", function(event) {
  let panel = app.f7.panel.get("#app-panel");
  enableDisableSwipe(panel);

  // Close panel when switching pages
  if (panel)
    panel.close(animate);
});

document.addEventListener("page:reinit", function(event) {
  let panel = app.f7.panel.get("#app-panel");
  enableDisableSwipe(panel);
});

app.f7.on("init", async function(event) {});

app.f7.on("darkModeChange", function(isDark) {
  let appMode = isDark ? "dark" : "light";
  app.Settings.applyAppMode(appMode);
});

document.addEventListener("page:beforein", (e) => {
  app.localize();
});

document.addEventListener('deviceready', async function() {

  app.localize();

  // Database setup
  await dbHandler.initializeDb();

  if (settings == undefined || settings.firstTimeSetup == undefined) {
    app.Settings.firstTimeSetup();
    app.f7.views.main.router.navigate("/settings/");
  } else {
    settings = app.Settings.migrateSettings(settings);
    app.Settings.changeTheme(settings.appearance.mode, settings.appearance.theme);
    app.f7.views.main.router.navigate(settings.appearance["start-page"]);
  }

  // Backup database
  setTimeout(async () => {
    let autoBackup = app.Settings.get("import-export", "auto-backup");

    if (settings != undefined && settings.firstTimeSetup != undefined && autoBackup == true && device.platform !== "browser") {
      let data = await dbHandler.export();
      data.settings = settings;
      let json = JSON.stringify(data);

      let weekday = (new Date()).toLocaleDateString("en", {weekday: "long"}).toLowerCase();
      let filename = "waistline_backup_" + weekday + ".json";
      let path = await app.Utils.writeFile(json, filename);
    }
  }, 2000);
}, false);

// Prevent chrome displaying context menu on long click
window.addEventListener("contextmenu", (e) => {
  let target = e.target.nodeName.toLowerCase();
  if (target !== "input" && target !== "textarea")
    e.preventDefault();
});

// Auto-select text in input fields on focus
let focusedElement;
$(document).on("focus", "input.auto-select", (e) => {
  e.preventDefault();
  let target = e.target;
  if (focusedElement == target) return;
  focusedElement = target;
  focusedElement.select();
});
$(document).on("blur", "input.auto-select", (e) => {
  focusedElement = undefined;
});

// Android back button
let backButtonExitApp = false;
document.addEventListener("backbutton", (e) => {

  let dialogs = document.querySelectorAll(".dialog");
  if (dialogs.length) {
    app.f7.dialog.close(".dialog");
    return false;
  }

  let smartSelects = document.querySelectorAll(".smart-select-popover");
  if (smartSelects.length) {
    document.querySelectorAll(".smart-select").forEach((el) => { app.f7.smartSelect.close(el) });
    return false;
  }

  let actions = document.querySelectorAll(".actions-modal");
  if (actions.length) {
    app.f7.actions.close(".actions-modal");
    return false;
  }

  let calendar = document.querySelectorAll(".calendar");
  if (calendar.length) {
    app.f7.calendar.close(".calendar");
    return false;
  }

  let loginScreen = document.querySelectorAll(".login-screen.modal-in");
  if (loginScreen.length) {
    app.f7.loginScreen.close(".login-screen");
    return false;
  }

  let searchField = document.querySelector(".page-current input[type='search']");
  if (searchField && searchField.value) {
    $(".page-current .page-content").scrollTop(0);
    app.f7.searchbar.disable(".searchbar");
    return false;
  }

  let selection = app.FoodsMealsRecipes.selection;
  if (searchField && selection && selection.length) {
    app.FoodsMealsRecipes.clearSelection();
    return false;
  }

  let history = new Set(app.f7.views.main.history);
  if (history.size > 1) {
    app.f7.views.main.router.back();
  } else if (backButtonExitApp === true) {
    navigator.app.exitApp();
  } else {
    backButtonExitApp = true;
    let msg = app.strings.dialogs["press-back-again"] || "Press Back again to exit the app";
    app.Utils.toast(msg, 2500, "bottom", () => {
      backButtonExitApp = false;
    });
  }
});

// Defocus search field when Android keyboard is hidden
window.addEventListener("keyboardDidHide", (e) => {
  let searchField = document.querySelector("input[type='search']");
  if (searchField) {
    if (searchField.value)
      searchField.blur();
    else
      app.f7.searchbar.disable(".searchbar");
  }
});

window.addEventListener("keydown", (e) => {
	if (e.code == "AltRight" || e.code == "AltLeft") {
		e.preventDefault();
	}
});
