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
    app.FoodsMealsRecipes.el.title.innerText = this.tabTitle;
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
      let entries = {};
      let result = {
        calories: 0
      };

      // Get item ids and quick-add items
      items.forEach((item) => {
        let type = item.type || "food";

        if (item.id !== undefined && ("category" in item == false || item.category !== undefined)) {
          ids[type] = ids[type] || [];
          ids[type].push(item.id);
        }
      });

      // Get relevant database entries
      entries["food"] = [];
      if (ids.food !== undefined && ids.food.length > 0)
        entries["food"] = await dbHandler.getByMultipleKeys(ids.food, "foodList");

      entries["recipe"] = [];
      if (ids.recipe !== undefined && ids.recipe.length > 0)
        entries["recipe"] = await dbHandler.getByMultipleKeys(ids.recipe, "recipes");

      // Prepare a list of items to be summed
      let data = [];
      items.forEach((item) => {
        let type = item.type || "food";
        let match = entries[type].find(x => x !== undefined && x.id === item.id);
        data.push(match);
      });

      const units = app.nutrimentUnits;
      if (data.length > 0) {
        // Sum item nutrition
        data.forEach((x, i) => {
          if (x !== undefined) {
            let dataPortion = parseFloat(x.portion);
            let itemPortion = parseFloat(items[i].portion);
            let itemQuantity = parseFloat(items[i].quantity) || 0;
            let multiplier = (itemPortion / dataPortion) * itemQuantity;

            for (let n in x.nutrition) {
              result[n] = result[n] || 0;
              result[n] += Math.round(x.nutrition[n] * multiplier * 100) / 100;
              if (n === "calories" && x.nutrition["kilojoules"] === undefined) {
                let kilojoules = app.Utils.convertUnit(x.nutrition.calories, units.calories, units.kilojoules);
                result["kilojoules"] = result["kilojoules"] || 0;
                result["kilojoules"] += Math.round(kilojoules * multiplier * 100) / 100;
              }
            }
          }
        });
      }

      resolve(result);
    });
  },

  filterList: function(query, categories, list) {
    let result = list;

    if (query !== "" || categories !== undefined) {
      let queryRegExp = new RegExp(query, "i");
      let categoriesFilter = categories || [];

      // Filter by name, brand and categories
      result = result.filter((item) => {
        if (item) {
          if (item.name && item.brand) {
            if (!item.name.match(queryRegExp) && !item.brand.match(queryRegExp))
              return false;
          } else if (item.name) {
            if (!item.name.match(queryRegExp))
              return false;
          }
          for (let category of categoriesFilter) {
            if (item.categories) {
              if (!item.categories.includes(category))
                return false;
            } else {
              return false;
            }
          }
          return true;
        }
        return false;
      });
    }
    return result;
  },

  getItem: function(id, type, portion, quantity) {
    return new Promise(async function(resolve, reject) {

      let store;

      if (type == "food") store = "foodList";
      if (type == "recipe") store = "recipes";

      let data = await dbHandler.getByKey(id, store);

      if (data !== undefined) {
        // Get nutriments for given portion/quantity
        let foodPortion = parseFloat(data.portion);
        let multiplier = (parseFloat(portion) / foodPortion) * (quantity || 1);

        for (let n in data.nutrition) {
          data.nutrition[n] = Math.round(data.nutrition[n] * multiplier * 100) / 100;
        }

        resolve(data);
      } else {
        resolve();
      }
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
            text: app.strings.diary["default-meals"][x.toLowerCase()] || x,
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
        animate: !app.Settings.get("appearance", "animations")
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
    if (items[0].type == "food") {
      items.forEach(async (x, i) => {
        let data = await dbHandler.getByKey(x.id, "foodList");
        if (data != undefined)
          app.Foodlist.putItem(data);
      });
    }
  },

  flattenItem: function(item) {
    return {
      id: item.id,
      portion: item.portion,
      quantity: item.quantity || "1",
      type: item.type
    };
  },

  getItemEnergy: function(nutrition) {
    let energy = nutrition.calories;

    if (energy !== undefined && !isNaN(energy)) {
      const units = app.nutrimentUnits;
      const energyUnit = app.Settings.get("units", "energy");

      if (energyUnit == units.kilojoules)
        energy = nutrition.kilojoules || app.Utils.convertUnit(energy, units.calories, units.kilojoules);

      return energy;
    }
    return 0;
  },

  renderItem: async function(data, el, checkbox, clickCallback, tapholdCallback, checkboxCallback, timestamp, thumbnail) {

    if (data !== undefined) {

      let item;

      if (data.name == undefined && data.nutrition == undefined) {
        item = await app.FoodsMealsRecipes.getItem(data.id, data.type, data.portion, data.quantity);
        if (item !== undefined) {
          delete data.unit; // Always use item unit from database
          item = app.Utils.concatObjects(item, data);
        }
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
        if (checkbox) {
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
        }

        //Thumbnail
        if (thumbnail == true) {
          let img = app.FoodsMealsRecipes.getItemThumbnail(item.image_url);

          if (img !== undefined)
            label.appendChild(img);
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
        if (item.name == "Quick Add") {
          title.innerText = app.strings.diary["quick-add"] || "Quick Add";
        } else {
          let text = "";
          if (item.categories !== undefined && app.Settings.get("foodlist", "show-category-labels") == true) {
            const labels = app.Settings.get("foodlist", "labels") || [];
            text += labels.filter((label) => {
              return item.categories.includes(label);
            }).join(" ") + " ";
          }
          text += item.name;
          title.innerText = app.Utils.tidyText(text, 50);
        }
        row.appendChild(title);

        //Energy
        if (item.nutrition !== undefined) {
          let energy = app.FoodsMealsRecipes.getItemEnergy(item.nutrition);

          const energyUnit = app.Settings.get("units", "energy");
          const energyUnitSymbol = app.strings["unit-symbols"][energyUnit] || energyUnit;

          let after = document.createElement("div");
          after.className = "item-after";
          after.innerText = Math.round(energy) + " " + energyUnitSymbol;
          row.appendChild(after);
        }

        //Brand
        if (item.brand && item.brand != "" && item.brand != "undefined") {
          let subtitle = document.createElement("div");
          subtitle.className = "item-subtitle";
          subtitle.innerText = app.Utils.tidyText(item.brand, 50);
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
            if (app.standardUnits.includes(item.unit))
              text += item.unit;
            else
              text += " " + app.Utils.escapeHtml(item.unit);
          }

          if (item.quantity !== undefined && item.quantity != 1)
            text += " &times;" + app.Utils.escapeHtml(item.quantity);
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

  getItemThumbnail: function(url) {
    if (url !== undefined && url !== "" && url !== "undefined") {
      let img = document.createElement("img");
      img.src = unescape(url);
      img.className = "food-thumbnail";
      return img;
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

  updateSelectionCount: async function() {
    if (!app.FoodsMealsRecipes.selection.length) {
      if (app.FoodsMealsRecipes.tab == "foodlist")
        app.FoodsMealsRecipes.el.scan.style.display = "block";

      app.FoodsMealsRecipes.el.submit.style.display = "none";
      app.FoodsMealsRecipes.el.title.innerText = app.FoodsMealsRecipes.tabTitle;
    } else {
      app.FoodsMealsRecipes.el.scan.style.display = "none";
      app.FoodsMealsRecipes.el.submit.style.display = "block";

      // Get energy for selection
      const energyUnit = app.Settings.get("units", "energy");
      const energyUnitSymbol = app.strings["unit-symbols"][energyUnit] || energyUnit;
      let energySum = 0;

      this.selection.forEach((x) => {
        let item = JSON.parse(x);
        if (item.nutrition !== undefined)
          energySum += app.FoodsMealsRecipes.getItemEnergy(item.nutrition);
      });

      // Title bar text
      let text = app.strings["foods-meals-recipes"].selected || "Selected";

      if (energySum !== 0)
        text += " | " + Math.round(energySum) + " " + energyUnitSymbol;

      app.FoodsMealsRecipes.el.title.innerText = app.FoodsMealsRecipes.selection.length + " " + text;
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

  initializeSearchBar: function(element, eventHandlers) {
    app.f7.searchbar.create({
      el: element,
      backdrop: false,
      customSearch: true,
      on: eventHandlers
    });
  },

  populateCategoriesField: function(element, item, enablePicker, enableRipple, pickerEventHandlers) {
    const labels = app.Settings.get("foodlist", "labels") || [];
    const categories = app.Settings.get("foodlist", "categories") || {};

    if (enablePicker) {
      let select = document.createElement("select");
      select.setAttribute("multiple", "");
      element.firstElementChild.append(select);

      labels.forEach((label) => {
        let option = document.createElement("option");
        option.value = label;
        option.setAttribute("data-display-as", label);
        option.innerText = app.Utils.escapeHtml(label) + " " + app.Utils.escapeHtml(categories[label] || "");
        if (item !== undefined && item.categories !== undefined && item.categories.includes(label))
          option.setAttribute("selected", "");
        select.append(option);
      });

      if (enableRipple)
        element.className = "item-link smart-select";
      else
        element.className = "item-link no-ripple smart-select";

      app.f7.smartSelect.create({
        el: element,
        openIn: "popover",
        on: pickerEventHandlers
      });
    } else {
      let field = element.querySelector("#categories-list");
      field.setAttribute("disabled", "");
      if (item !== undefined && item.categories !== undefined) {
        field.innerText = labels.filter((label) => {
          return item.categories.includes(label);
        }).join(", ");
      }
    }
  },

  getSelectedCategories: function(element) {
    let smartSelect = app.f7.smartSelect.get(element);
    let select = smartSelect.selectEl;
    let categories = [...select.options].filter((option) => option.selected).map((option) => option.value);
    if (categories.length > 0)
      return categories;
    return undefined;
  },

  clearSelectedCategories: function(element, filterIcon) {
    let smartSelect = app.f7.smartSelect.get(element);
    smartSelect.selectEl.selectedIndex = -1;
    filterIcon.classList.remove(".color-theme");
  },

  setCategoriesVisibility: function(container) {
    const labels = app.Settings.get("foodlist", "labels") || [];
    if (labels.length == 0)
      container.style.display = "none";
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