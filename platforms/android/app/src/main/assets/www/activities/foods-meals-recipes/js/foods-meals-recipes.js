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
  along with app.  If not, see <http://www.gnu.org/licenses/>.
*/

app.FoodsMealsRecipes = {

  tab: undefined,
  el: {},
  selection: [],
  origin: undefined,
  disableEdit: false,

  init: function(context) {
    this.disableEdit = false;

    this.getComponents();
    this.bindUIActions();

    if (context) {
      this.category = context.category; //Category of calling page (i.e diary category)

      if (context.origin) {
        this.showBackButton();
        this.origin = context.origin; //Page that called up the foodlist

        switch (app.FoodsMealsRecipes.origin) {
          case "/diary/":
            this.date = context.date; //Date from diary
            break;

          case "./meal-editor/":
            this.disableEdit = true;
            this.el.fab.style.display = "none";
            this.el.scan.style.display = "none";
            break;

          case "./recipe-editor/":
            this.disableEdit = true;
            this.el.fab.style.display = "none";
            this.el.scan.style.display = "none";
            break;

          default:
            this.el.fab.style.display = "block";
        }
      }
    } else {
      this.category = undefined;
      this.origin = undefined;
    }

    if (!this.ready) {
      this.ready = true;
    }
  },

  tabInit: function() {
    app.FoodsMealsRecipes.el.title.innerHTML = this.tabTitle;
    app.FoodsMealsRecipes.el.submit.style.display = "none";
    app.FoodsMealsRecipes.localizeSearchPlaceholder();
  },

  getComponents: function() {
    app.FoodsMealsRecipes.el.menu = document.querySelector(".page[data-name='foods-meals-recipes'] #menu");
    app.FoodsMealsRecipes.el.back = document.querySelector(".page[data-name='foods-meals-recipes'] #back");
    app.FoodsMealsRecipes.el.submit = document.querySelector(".page[data-name='foods-meals-recipes'] #submit");
    app.FoodsMealsRecipes.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    app.FoodsMealsRecipes.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    app.FoodsMealsRecipes.el.fab = document.querySelector(".page[data-name='foods-meals-recipes'] #add-item");
    app.FoodsMealsRecipes.el.mealTabButton = document.querySelector(".page[data-name='foods-meals-recipes'] #meals-tab-button");
    app.FoodsMealsRecipes.el.recipeTabButton = document.querySelector(".page[data-name='foods-meals-recipes'] #recipe-tab-button");
  },

  bindUIActions: function() {
    // Submit button - event handler is separate function to avoid duplicates
    if (!app.FoodsMealsRecipes.el.submit.hasClickEvent) {
      app.FoodsMealsRecipes.el.submit.addEventListener("click", app.FoodsMealsRecipes.submitButtonClickEventHandler);
      app.FoodsMealsRecipes.el.submit.hasClickEvent = true;
    }

    // Fab button 
    app.FoodsMealsRecipes.el.fab.addEventListener("click", function(e) {
      switch (app.FoodsMealsRecipes.tab) {
        case "foodlist":
          app.Foodlist.gotoEditor();
          break;

        case "meals":
          app.Meals.gotoEditor();
          break;

        case "recipes":
          app.Recipes.gotoEditor();
          break;
      }
    });
  },

  localizeSearchPlaceholder: function() {
    const el = document.getElementsByClassName("searchbar-input-wrap");
    const text = app.strings["foods-meals-recipes"]["search"] || "Search";

    if (el.length > 0) {
      for (let x of el) {
        x.children[0].placeholder = text;
      }
    }
  },

  submitButtonClickEventHandler: function(e) {
    if (app.FoodsMealsRecipes.selection.length > 0) {
      switch (app.FoodsMealsRecipes.tab) {
        case "foodlist":
          app.Foodlist.submitButtonAction(app.FoodsMealsRecipes.selection);
          break;

        case "meals":
          app.Meals.submitButtonAction(app.FoodsMealsRecipes.selection);
          break;

        case "recipes":
          app.Recipes.submitButtonAction(app.FoodsMealsRecipes.selection);
          break;
      }
    }
  },

  getCategory: function() {
    if (app.FoodsMealsRecipes.category !== undefined)
      return app.FoodsMealsRecipes.category;

    return false;
  },

  showBackButton: function() {
    app.FoodsMealsRecipes.el.menu.style.display = "none";
    app.FoodsMealsRecipes.el.back.style.display = "block";
  },

  getFromDB: function(store, sort, includeArchived) {
    return new Promise(function(resolve, reject) {

      let list = [];

      if (sort == "alpha")
        dbHandler.getIndex("name", store).openCursor(null).onsuccess = processResult; //Sort foods alphabetically
      else
        dbHandler.getIndex("dateTime", store).openCursor(null, "prev").onsuccess = processResult; //Sort foods by date

      function processResult(e) {
        var cursor = e.target.result;

        if (cursor) {
          if (!cursor.value.archived || includeArchived == true) {
            list.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(list);
        }
      }
    });
  },

  getTotalNutrition: function(items) {
    return new Promise(async function(resolve, reject) {
      let ids = {};
      let result = {
        calories: 0
      };

      // Get item ids and quick-add items
      items.forEach((x) => {
        let type = x.type || "food";

        if (x.id !== undefined && ("category" in x == false || x.category !== undefined)) {
          ids[type] = ids[type] || [];
          ids[type].push(x.id);
        }
      });

      let foods = [];
      if (ids.food !== undefined && ids.food.length > 0)
        foods = await dbHandler.getByMultipleKeys(ids.food, "foodList");

      let recipes = [];
      if (ids.recipe !== undefined && ids.recipe.length > 0)
        recipes = await dbHandler.getByMultipleKeys(ids.recipe, "recipes");

      let data = [];
      items.forEach((item) => {
        let match = recipes.find(x => x !== undefined && x.id === item.id) || foods.find(x => x !== undefined && x.id === item.id);
        data.push(match);
      });

      if (data.length > 0) {
        //Sum item nutrition
        data.forEach((x, i) => {
          if (x !== undefined) {
            let dataPortion = parseFloat(x.portion);
            let itemPortion = parseFloat(items[i].portion);
            let itemQuantity = parseFloat(items[i].quantity) || 0;
            let multiplier = (itemPortion / dataPortion) * itemQuantity;

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

        if (result !== undefined) {
          // Get nutriments for given portion/quantity
          let foodPortion = parseFloat(result.portion);
          let multiplier = (parseFloat(portion) / foodPortion) * (quantity || 1);

          for (let n in result.nutrition) {
            result.nutrition[n] = Math.round(result.nutrition[n] * multiplier * 100) / 100;
          }

          resolve(result);
        } else {
          resolve();
        }
      };

      request.onerror = function(e) {
        reject(e);
      };
    });
  },

  returnItems: function(items) {

    let origin = app.FoodsMealsRecipes.origin;

    app.data.context = {};

    if (origin == undefined) {

      //Setup action sheet to ask user for category
      const mealNames = app.Settings.get("diary", "meal-names");
      let options = [{
        text: app.strings.dialogs["what-meal"] || "What meal is this?",
        label: true
      }];

      mealNames.forEach((x, i) => {
        if (x != "") {
          let choice = {
            text: x,
            onClick: function(action, e) {
              app.FoodsMealsRecipes.updateDateTimes(items);
              app.data.context.items = items;
              app.data.context.category = i;
              app.f7.views.main.router.navigate("/diary/", {
                reloadCurrent: true,
                clearPreviousHistory: true
              });
            }
          };
          options.push(choice);
        }
      });

      //Create and show the action sheet
      let ac = app.f7.actions.create({
        buttons: options,
        closeOnEscape: true,
        animate: !app.Settings.get("theme", "animations")
      });

      ac.open();
    } else {
      app.FoodsMealsRecipes.updateDateTimes(items);

      if (app.FoodsMealsRecipes.category !== undefined)
        app.data.context.category = app.FoodsMealsRecipes.category;

      app.data.context.items = items;
      app.f7.views.main.router.back();
    }
  },

  updateDateTimes: function(items) {
    let result = [];

    if (items[0].type == "food") {
      items.forEach(async (x, i) => {
        let data = await dbHandler.getByKey(x.id, "foodList");
        app.Foodlist.putItem(data);
      });
    }
  },

  renderItem: async function(data, el, checkboxes, clickCallback, tapholdCallback, checkboxCallback, timestamp) {

    if (data !== undefined) {

      let item;

      if (data.name == undefined && data.nutrition == undefined) {
        item = await app.FoodsMealsRecipes.getItem(data.id, data.type, data.portion, data.quantity);
        if (item !== undefined)
          item = app.Utils.concatObjects(item, data);
      } else {
        item = data;
      }

      if (item !== undefined) {

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
          input.checked = app.FoodsMealsRecipes.selection.includes(JSON.stringify(item));
          label.appendChild(input);

          input.addEventListener("change", (e) => {
            if (checkboxCallback !== undefined)
              checkboxCallback(input.checked, item);
            else
              app.FoodsMealsRecipes.checkboxChanged(input.checked, item);
          });

          let icon = document.createElement("i");
          icon.className = "icon icon-checkbox";
          label.appendChild(icon);
        } else {
          // Image 
          if (item.image_url !== undefined) {
            let img = app.FoodsMealsRecipes.getItemImage(item.image_url);

            if (img !== undefined)
              label.appendChild(img);
          }
        }

        //Inner container
        let inner = document.createElement("div");
        inner.className = "item-inner food-item-inner noselect";
        label.appendChild(inner);

        if (app.FoodsMealsRecipes.disableEdit == false && item.name !== "Quick Add") {
          inner.addEventListener("click", function(e) {
            e.preventDefault();
            if (clickCallback !== undefined)
              clickCallback(item);
            else
              app.FoodsMealsRecipes.gotoEditor(item);
          });
        }

        if (tapholdCallback !== undefined && item.id !== undefined) {
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
        title.innerHTML = app.Utils.tidyText(item.name, 25);
        row.appendChild(title);

        //Energy
        if (item.nutrition !== undefined) {
          let energy = item.nutrition.calories;

          if (energy !== undefined && !isNaN(energy)) {
            let energyUnit = app.Settings.get("units", "energy");

            if (energyUnit == "kJ")
              energy = item.nutrition.kilojoules || energy * 4.1868;

            let after = document.createElement("div");
            after.className = "item-after";
            after.innerHTML = Math.round(energy).toFixed(0) + " " + energyUnit;
            row.appendChild(after);
          }
        }

        //Brand 
        if (item.brand && item.brand != "") {
          let subtitle = document.createElement("div");
          subtitle.className = "item-subtitle";
          subtitle.innerHTML = app.Utils.tidyText(item.brand, 35).italics();
          inner.appendChild(subtitle);
        }

        //Item details 
        let details = document.createElement("div");
        details.className = "item-text";

        //Portion
        let text = "";

        if (item.name != "Quick Add" && item.portion !== undefined && !isNaN(item.portion)) {
          text = parseFloat(item.portion);

          if (item.unit !== undefined) {
            let units = app.standardUnits;
            if (units.includes(item.unit))
              text += item.unit;
            else
              text += " " + item.unit;
          }

          if (item.quantity !== undefined && item.quantity != 1)
            text += " x" + item.quantity;
        }

        if (timestamp == true && item.dateTime !== undefined) {
          let dateTime = new Date(item.dateTime);
          if (text != "") text += "<br>";
          text += dateTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });
        }

        details.innerHTML = text;
        inner.appendChild(details);
      }
    }
  },

  getItemImage: function(url) {
    if (app.Settings.get("diary", "show-thumbnails")) {

      let wifiOnly = app.Settings.get("diary", "wifi-images");

      if (app.mode == "development") wifiOnly = false;

      if (navigator.connection.type !== "none") {
        if ((wifiOnly && navigator.connection.type == "wifi") || !wifiOnly) {
          let img = document.createElement("img");
          img.src = unescape(url);
          img.style.width = "20%";
          img.style["padding-right"] = "1em";

          return img;
        }
      }
    }
    return undefined;
  },

  checkboxChanged: function(state, item) {

    if (state === true) {
      app.FoodsMealsRecipes.selection.push(JSON.stringify(item));
    } else {
      let itemIndex = app.FoodsMealsRecipes.selection.indexOf(JSON.stringify(item));
      if (itemIndex != -1)
        app.FoodsMealsRecipes.selection.splice(itemIndex, 1);
    }

    app.FoodsMealsRecipes.updateSelectionCount();
  },

  updateSelectionCount: function() {
    if (!app.FoodsMealsRecipes.selection.length) {
      if (app.FoodsMealsRecipes.tab == "foodlist")
        app.FoodsMealsRecipes.el.scan.style.display = "block";

      app.FoodsMealsRecipes.el.submit.style.display = "none";
      app.FoodsMealsRecipes.el.title.innerHTML = app.FoodsMealsRecipes.tabTitle;
    } else {
      app.FoodsMealsRecipes.el.scan.style.display = "none";
      app.FoodsMealsRecipes.el.submit.style.display = "block";
      let text = app.strings["foods-meals-recipes"].selected || "Selected";
      app.FoodsMealsRecipes.el.title.innerHTML = app.FoodsMealsRecipes.selection.length + " " + text;
    }
  },

  clearSearchSelection: function() {

    //Remove any selected search items from the selection array
    const checked = Array.from(document.querySelectorAll('input[type=checkbox]:checked'));

    checked.forEach((x, i) => {
      let itemIndex = app.FoodsMealsRecipes.selection.indexOf(x.data);
      if (itemIndex != -1)
        app.FoodsMealsRecipes.selection.splice(itemIndex, 1);
    });

    app.FoodsMealsRecipes.updateSelectionCount();
  },

  getSelection: function() {
    return app.FoodsMealsRecipes.selection;
  },

  gotoEditor: function(item) {
    let origin;
    if (app.FoodsMealsRecipes.tab !== undefined)
      origin = app.FoodsMealsRecipes.tab;
    else
      origin = "diary";

    app.data.context = {
      item: item,
      origin: origin
    };

    app.f7.views.main.router.navigate("/foods-meals-recipes/food-editor/");
  },

  removeItem: function(id, type) {
    let store = app.FoodsMealsRecipes.getStoreForItemType(type);

    return new Promise(async function(resolve, reject) {
      let data = await dbHandler.getByKey(id, store);

      if (data) {
        data.archived = true;

        let request = dbHandler.put(data, store);

        request.onsuccess = function(e) {
          resolve();
        };
      } else {
        resolve();
      }
    });
  },

  getStoreForItemType: function(type) {
    switch (type) {
      case "food":
        return "foodList";
      case "recipe":
        return "recipes";
      default:
    }
  },
};

document.addEventListener("page:init", function(e) {
  if (e.target.matches(".page[data-name='foods-meals-recipes']")) {
    let context = app.data.context;
    app.data.context = undefined;
    app.FoodsMealsRecipes.init(context);
  }
});

document.addEventListener("page:reinit", function(e) {
  if (e.target.matches(".page[data-name='foods-meals-recipes']")) {
    let context = app.data.context;
    app.data.context = undefined;

    if (context !== undefined && context.item !== undefined) {
      if (app.FoodsMealsRecipes.tab == "foodlist") {
        app.Foodlist.init(context);
      }
    }
  }
});

document.addEventListener("page:beforeremove", function(e) {
  if (e.target.matches(".page[data-name='foods-meals-recipes']")) {
    app.FoodsMealsRecipes.tab = undefined;
  }
});

document.addEventListener("tab:init", function(e) {
  app.FoodsMealsRecipes.tab = e.target.id;
  app.FoodsMealsRecipes.tabTitle = app.strings["foods-meals-recipes"][e.target.title.toLowerCase()] || e.target.title;
  app.FoodsMealsRecipes.selection = [];
  app.FoodsMealsRecipes.tabInit();
});