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

import * as Utils from "/www/assets/js/utils.js";
import {
  runTests
} from "./js/tests.mjs";

var s;
waistline.FoodsMealsRecipes = {

  settings: {
    tab: undefined,
    el: {},
    selection: []
  },

  init: function(context) {

    s = this.settings; //Assign settings object
    this.getComponents();
    this.bindUIActions();

    if (context) {
      s.category = context.category; //Category of calling page (i.e diary category)

      if (context.origin) {
        this.showBackButton();
        s.origin = context.origin; //Page that called up the foodlist

        switch (s.origin) {
          case "/diary/":
            s.date = context.date; //Date from diary
            break;

          case "./meal-editor/":
            s.el.fab.style.display = "none";
            s.el.scan.style.display = "none";
            break;

          case "./recipe-editor/":
            s.el.fab.style.display = "none";
            s.el.scan.style.display = "none";
            break;

          default:
            s.el.fab.style.display = "block";
            s.el.scan.style.display = "block";
        }
      }
    } else {
      s.category = undefined;
      s.origin = undefined;
    }

    if (!s.ready) {
      s.ready = true;
    }
  },

  tabInit: function() {
    s.el.title.innerHTML = s.tabTitle;
    s.el.submit.style.display = "none";
  },

  getComponents: function() {
    s.el.menu = document.querySelector(".page[data-name='foods-meals-recipes'] #menu");
    s.el.back = document.querySelector(".page[data-name='foods-meals-recipes'] #back");
    s.el.submit = document.querySelector(".page[data-name='foods-meals-recipes'] #submit");
    s.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    s.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    s.el.fab = document.querySelector(".page[data-name='foods-meals-recipes'] #add-item");
    s.el.mealTabButton = document.querySelector(".page[data-name='foods-meals-recipes'] #meals-tab-button");
    s.el.recipeTabButton = document.querySelector(".page[data-name='foods-meals-recipes'] #recipe-tab-button");
  },

  bindUIActions: function() {

    // Submit button - event handler is separate function to avoid duplicates
    s.el.submit.addEventListener("click", this.submitButtonClickEventHandler);

    // Fab button 
    s.el.fab.addEventListener("click", function(e) {
      switch (s.tab) {
        case "foodlist":
          waistline.Foodlist.gotoEditor();
          break;

        case "meals":
          waistline.Meals.gotoEditor();
          break;

        case "recipes":
          waistline.Recipes.gotoEditor();
          break;
      }
    });
  },

  submitButtonClickEventHandler: function(e) {
    if (s.selection.length > 0) {
      switch (s.tab) {
        case "foodlist":
          waistline.Foodlist.submitButtonAction(s.selection);
          break;

        case "meals":
          waistline.Meals.submitButtonAction(s.selection);
          break;

        case "recipes":
          waistline.Recipes.submitButtonAction(s.selection);
          break;
      }
    }
  },

  getCategory: function() {
    if (s.category !== undefined)
      return s.category;

    return false;
  },

  showBackButton: function() {
    s.el.menu.style.display = "none";
    s.el.back.style.display = "block";
  },

  getFromDB: function(store, sort) {
    return new Promise(function(resolve, reject) {

      let list = [];

      if (sort == "alpha")
        dbHandler.getIndex("name", store).openCursor(null).onsuccess = processResult; //Sort foods alphabetically
      else
        dbHandler.getIndex("dateTime", store).openCursor(null, "prev").onsuccess = processResult; //Sort foods by date

      function processResult(e) {
        var cursor = e.target.result;

        if (cursor) {
          list.push(cursor.value);
          cursor.continue();
        } else {
          resolve(list);
        }
      }
    });
  },

  /* CAN PROBABLY DELETE*/
  /*getFood: function(id) {
    return new Promise(function(resolve, reject) {
      let request = dbHandler.getItem(id, "foodList");

      request.onsuccess = function(e) {
        resolve(e.target.result);
      };
    });
  },

  getRecipe: function(id) {
    return new Promise(function(resolve, reject) {
      let request = dbHandler.getItem(id, "recipe");

      request.onsuccess = function(e) {
        resolve(e.target.result);
      };
    });
  },*/

  getNutrition: function(item, type) {
    return new Promise(function(resolve, reject) {
      let request;

      if (item.recipe || type == "recipe")
        request = dbHandler.getItem(item.id, "recipe");
      else
        request = dbHandler.getItem(item.id, "foodList");

      request.onsuccess = function(e) {
        let x = e.target.result;
        let result = {};
        let foodPortion = parseFloat(x.portion);
        let itemPortion = parseFloat(item.portion);
        let itemQuantity = parseFloat(item.quantity) || 1;
        let multiplier = (itemPortion / foodPortion) * itemQuantity;

        for (let n in x.nutrition) {
          result[n] = Math.round(x.nutrition[n] * multiplier * 100) / 100;
        }
        resolve(result);
      };
    });
  },
  /* -----------------------------------------*/

  getTotalNutrition: function(items) {
    return new Promise(async function(resolve, reject) {
      let ids = [];
      let result = {
        calories: 0
      };

      // Get item ids and quick-add items
      items.forEach((x) => {
        if (x.id !== undefined)
          ids.push(x.id);
        if (x.type == "quick-add")
          result.calories += x.nutrition.calories;
      });

      if (ids.length > 0) {
        let foods = await dbHandler.getByMultipleKeys(ids, "foodList");

        //Sum item nutrition
        foods.forEach((x, i) => {

          if (x !== undefined) {

            let foodPortion = parseFloat(x.portion);
            let itemPortion = parseFloat(items[i].portion);
            let itemQuantity = parseFloat(items[i].quantity) || 1;
            let multiplier = (itemPortion / foodPortion) * itemQuantity;

            for (let n in x.nutrition) {
              result[n] = result[n] || 0;
              result[n] += Math.round(x.nutrition[n] * multiplier * 100) / 100;
            }
          }
        });
      }
      resolve(result);

    });
  },

  setFilter: function(term, listCopy) {

    let list = listCopy;

    if (term != "") {
      let exp = new RegExp(term, "i");

      //Filter by name and brand
      list = list.filter(function(el) {
        if (el.name && el.brand)
          return el.name.match(exp) || el.brand.match(exp);
        else if (el.name)
          return el.name.match(exp);
        else
          return false;
      });
    }
    return list; //Replace master copy with filtered list
  },

  filterList: function(term, list) {

    let result = list;

    if (term != "") {
      let exp = new RegExp(term, "i");

      //Filter by name and brand
      result = result.filter(function(el) {
        if (el) {
          if (el.name && el.brand)
            return el.name.match(exp) || el.brand.match(exp);
          else if (el.name)
            return el.name.match(exp);
        }
        return false;
      });
    }
    return result;
  },

  getItem: function(id, type, portion, quantity) {
    return new Promise(function(resolve, reject) {

      let store;

      if (type == "food") store = "foodList";
      if (type == "recipe") store = "recipes";

      let request = dbHandler.getItem(id, store);

      request.onsuccess = function(e) {
        let result = e.target.result;

        // Get nutriments for given portion/quantity
        let foodPortion = result.portion;
        let multiplier = (portion / foodPortion) * (quantity || 1);

        for (let n in result.nutrition) {
          result.nutrition[n] = Math.round(result.nutrition[n] * multiplier * 100) / 100;
        }

        resolve(result);
      };

      request.onerror = function(e) {
        reject(e);
      };
    });
  },

  returnItems: function(items) {

    let origin = s.origin;

    f7.data.context = {
      items: items,
    };

    if (origin == undefined) {

      //Setup action sheet to ask user for category
      const mealNames = waistline.Settings.get("diary", "meal-names");
      let options = [{
        text: "What meal is this?",
        label: true
      }];

      mealNames.forEach((x, i) => {
        if (x != "") {
          let choice = {
            text: x,
            onClick: function(action, e) {
              f7.data.context.category = i;
              f7.views.main.router.navigate("/diary/", {
                reloadCurrent: true,
                clearPreviousHistory: true
              });
            }
          };
          options.push(choice);
        }
      });

      //Create and show the action sheet
      let ac = f7.actions.create({
        buttons: options
      });

      ac.open();
    } else {

      if (s.category !== undefined)
        f7.data.context.category = s.category;

      f7.views.main.router.back();
    }
  },

  renderItem: async function(data, el, checkboxes, clickCallback, tapholdCallback, checkboxCallback) {

    if (data !== undefined) {

      let item;

      if (data.name == undefined && data.nutrition == undefined) {
        item = await waistline.FoodsMealsRecipes.getItem(data.id, data.type, data.portion, data.quantity);
        item = Utils.concatObjects(item, data);
      } else {
        item = data;
      }

      let li = document.createElement("li");
      li.data = JSON.stringify(item);
      el.appendChild(li);

      let label = document.createElement("label");
      label.className = "item-checkbox item-content";
      li.appendChild(label);

      //Checkbox
      if (checkboxes) {
        let input = document.createElement("input");
        input.type = "checkbox";
        input.name = "food-item-checkbox";
        input.data = JSON.stringify(item);
        input.checked = s.selection.includes(JSON.stringify(item));
        label.appendChild(input);

        input.addEventListener("change", (e) => {
          if (checkboxCallback !== undefined)
            checkboxCallback(input.checked, item);
          else
            waistline.FoodsMealsRecipes.checkboxChanged(input.checked, item);
        });

        let icon = document.createElement("i");
        icon.className = "icon icon-checkbox";
        label.appendChild(icon);
      }

      //Inner container
      let inner = document.createElement("div");
      inner.className = "item-inner food-item-inner";
      label.appendChild(inner);

      if (item.id !== undefined) {
        inner.addEventListener("click", function(e) {
          e.preventDefault();
          if (clickCallback !== undefined)
            clickCallback(item);
          else
            waistline.FoodsMealsRecipes.gotoEditor(item);
        });
      }

      if (tapholdCallback !== undefined) {
        inner.addEventListener("taphold", function(e) {
          e.preventDefault();
          tapholdCallback(item, li);
        });
      }

      //Item proper
      let row = document.createElement("div");
      row.className = "item-title-row";
      inner.appendChild(row);

      //Title
      let title = document.createElement("div");
      title.className = "item-title";
      title.innerHTML = Utils.tidyText(item.name, 25);
      row.appendChild(title);

      //Energy
      let energy = parseInt(item.nutrition.calories);

      if (energy !== undefined && !isNaN(energy)) {
        let energyUnit = waistline.Settings.get("nutrition", "energy-unit");

        if (energyUnit == "kJ")
          energy = Math.round(energy * 4.1868);

        let after = document.createElement("div");
        after.className = "item-after";
        after.innerHTML = energy + " " + energyUnit;
        row.appendChild(after);
      }

      //Brand 
      if (item.brand && item.brand != "") {
        let subtitle = document.createElement("div");
        subtitle.className = "item-subtitle";
        subtitle.innerHTML = Utils.tidyText(item.brand, 35).italics();
        inner.appendChild(subtitle);
      }

      //Item details 
      let details = document.createElement("div");
      details.className = "item-text";

      //Portion
      if (item.portion !== undefined) {
        let text = item.portion;

        if (item.unit !== undefined) // If unit is separate from portion
          text += item.unit;

        if (item.quantity !== undefined && item.quantity > 1)
          text += " x" + item.quantity;

        details.innerHTML = text;
        inner.appendChild(details);
      }
    }
  },

  renderNutritionCard: function(nutrition, date, swiper) {

    let goals = waistline.Goals.getGoalsByDate(date);
    let nutriments = waistline.nutriments;
    let nutrimentUnits = waistline.nutrimentUnits;

    let rows = [];
    let energyUnit = waistline.Settings.get("nutrition", "energy-unit");

    let count = 0;
    nutriments.forEach((x, i) => {

      if (((x == "kilojoules" && energyUnit == "kj") || x != "kilojoules")) {

        // Show n nutriments at a time 
        if (count % 3 == 0) {
          let slide = document.createElement("div");
          slide.className = "swiper-slide";
          swiper.appendSlide(slide);

          rows[0] = document.createElement("div");
          rows[0].className = "row nutrition-total-values";
          slide.appendChild(rows[0]);

          rows[1] = document.createElement("div");
          rows[1].className = "row nutrition-total-title";
          slide.appendChild(rows[1]);
        }

        // Values and goal text
        let values = document.createElement("div");
        values.className = "col";
        values.id = x + "-value";

        let span = document.createElement("span");
        let t = document.createTextNode("");

        if (nutrition && nutrition[x] !== undefined) {

          if (x !== "calories" && x !== "kilojoules")
            t.nodeValue = parseFloat(nutrition[x].toFixed(2));
          else {
            let energy = parseInt(nutrition[x]);

            if (x == "calories" && energyUnit == "kJ")
              energy = Math.round(energy * 4.1868);

            t.nodeValue = parseInt(energy) + " ";
          }
        } else
          t.nodeValue = "0";

        // Unit
        let unit = nutrimentUnits[x];
        if (unit !== undefined)
          t.nodeValue += unit;

        span.appendChild(t);

        // Colour value text
        values.appendChild(span);
        rows[0].appendChild(values);

        // Title
        let title = document.createElement("div");
        title.className = "col";
        title.id = x + "-title";

        let text = waistline.strings[x] || x;
        t = document.createTextNode((text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " "));
        title.appendChild(t);
        rows[1].appendChild(title);

        count++;
      }
    });
  },

  checkboxChanged: function(state, item) {

    if (state === true) {
      s.selection.push(JSON.stringify(item));
    } else {
      let itemIndex = s.selection.indexOf(JSON.stringify(item));
      if (itemIndex != -1)
        s.selection.splice(itemIndex, 1);
    }

    this.updateSelectionCount();
  },

  updateSelectionCount: function() {
    if (!s.selection.length) {
      if (s.tab == "foodlist")
        s.el.scan.style.display = "block";

      s.el.submit.style.display = "none";
      s.el.title.innerHTML = s.tabTitle;
    } else {
      s.el.scan.style.display = "none";
      s.el.submit.style.display = "block";
      s.el.title.innerHTML = s.selection.length + " Selected";
    }
  },

  clearSearchSelection: function() {

    //Remove any selected search items from the selection array
    const checked = Array.from(document.querySelectorAll('input[type=checkbox]:checked'));

    checked.forEach((x, i) => {
      let itemIndex = s.selection.indexOf(x.data);
      if (itemIndex != -1)
        s.selection.splice(itemIndex, 1);
    });

    this.updateSelectionCount();
  },

  getSelection: function() {
    return s.selection;
  },

  gotoEditor: function(item) {
    if (item.id !== undefined && item.type == "food") {

      let origin;
      if (s !== undefined && s.tab !== undefined)
        origin = s.tab;

      f7.views.main.router.navigate("/foods-meals-recipes/food-editor/", {
        context: {
          item: item,
          origin: origin
        }
      });
    }
  }
};

export const renderItem = waistline.FoodsMealsRecipes.renderItem;

//----OLD----

var foodsMealsRecipes = {

  sortingOptions: function(caller) {

    return new Promise(function(resolve, reject) {
      let settings = JSON.parse(window.localStorage.getItem("settings")) || {}; //Get settings object

      ons.createElement('src/activities/foods-meals-recipes/views/sort-options.html', {
          append: true
        }) //Load dialog from file
        .then(function(dialog) {

          dialog.show();

          dialog.addEventListener("postshow", function() {
            let option = settings[caller].sort;
            document.querySelector("#sort-options #" + option).checked = true;

            //If existing setting, set it in the dialog
            if (settings && settings[caller] && settings[caller].sort) {
              let option = settings[caller].sort;
              document.querySelector("#sort-options #" + option).checked = true;
            }

            //Attach event handlers to dialog buttons
            dialog.querySelector('#sort-options #cancel').addEventListener("tap", function cancel() {
              dialog.hide();
            }); //Cancel button
            dialog.querySelector('#sort-options #ok').addEventListener("tap", saveSortSetting); //Ok button
          });

          //Remove from DOM on hide
          dialog.addEventListener("posthide", function() {
            dialog.querySelector('#sort-options #cancel').removeEventListener("tap", cancel);
            dialog.querySelector('#sort-options #ok').removeEventListener("tap", saveSortSetting);
            dialog.parentNode.removeChild(dialog);
            resolve();
          });

          //Save selected setting in localStorage
          function saveSortSetting() {
            let option = document.querySelector('#sort-options input[name="sorting"]:checked').id; //Get the selected radio button
            settings[caller] = settings[caller] || {};
            settings[caller].sort = option;
            window.localStorage.setItem("settings", JSON.stringify(settings));
            dialog.hide();
          }
        });
    });
  }
};

document.addEventListener("page:init", function(e) {
  if (e.target.matches(".page[data-name='foods-meals-recipes']")) {
    let context = f7.views.main.router.currentRoute.context;
    waistline.FoodsMealsRecipes.init(context);

    if (waistline.mode == "development")
      runTests();
  }
});

document.addEventListener("page:reinit", function(e) {
  if (e.target.matches(".page[data-name='foods-meals-recipes']")) {
    let context = f7.data.context;
    f7.data.context = undefined;

    if (context !== undefined && context.item !== undefined) {
      if (waistline.FoodsMealsRecipes.settings.tab == "foodlist") {
        waistline.Foodlist.init(context);
      }
    }
  }
});

document.addEventListener("page:beforeremove", function(e) {
  if (e.target.matches(".page[data-name='foods-meals-recipes']")) {
    waistline.FoodsMealsRecipes.settings.tab = undefined;
  }
});

document.addEventListener("tab:init", function(e) {
  waistline.FoodsMealsRecipes.settings.tab = e.target.id;
  waistline.FoodsMealsRecipes.settings.tabTitle = e.target.title;
  waistline.FoodsMealsRecipes.settings.selection = [];
  waistline.FoodsMealsRecipes.tabInit();
});