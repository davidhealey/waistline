/*
  Copyright 2021 David Healey

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

app.MealEditor = {
  meal: {},
  el: {},

  init: async function(context) {
    app.MealEditor.getComponents();

    if (context) {
      // From meal list or food list
      if (context.meal) {
        app.MealEditor.meal = context.meal;
        app.MealEditor.populateInputs(context.meal);
      }

      if (context.items)
        app.MealEditor.addItems(context.items);

      // Returned from meal editor
      if (context.item)
        app.MealEditor.replaceListItem(context.item);

      app.MealEditor.renderNutrition();
      await app.MealEditor.renderItems();
    }

    app.MealEditor.bindUIActions();
  },

  getComponents: function() {
    app.MealEditor.el.submit = document.querySelector(".page[data-name='meal-editor'] #submit");
    app.MealEditor.el.nameInput = document.querySelector(".page[data-name='meal-editor'] #name");
    app.MealEditor.el.foodlist = document.querySelector(".page[data-name='meal-editor'] #meal-food-list");
    app.MealEditor.el.add = document.querySelector(".page[data-name='meal-editor'] #add-food");
    app.MealEditor.el.nutrition = document.querySelector(".page[data-name='meal-editor'] #nutrition");
  },

  bindUIActions: function() {

    // Submit
    if (!app.MealEditor.el.submit.hasClickEvent) {
      app.MealEditor.el.submit.addEventListener("click", (e) => {
        app.MealEditor.save();
      });
      app.MealEditor.el.submit.hasClickEvent = true;
    }

    // Add food button
    if (!app.MealEditor.el.add.hasClickEvent) {
      app.MealEditor.el.add.addEventListener("click", (e) => {
        app.data.context = {
          origin: "./meal-editor/",
          meal: app.MealEditor.meal
        };

        app.f7.views.main.router.navigate("/foods-meals-recipes/", {
          context: app.data.context
        });
      });
      app.MealEditor.el.add.hasClickEvent = true;
    }
  },

  populateInputs: function(meal) {
    let inputs = document.querySelectorAll(".page[data-name='meal-editor'] input");

    inputs.forEach((x) => {
      if (meal[x.name] !== undefined)
        x.value = unescape(meal[x.name]);
    });
  },

  addItems: function(data) {
    let result = app.MealEditor.meal.items;

    data.forEach((x) => {
      let item = {
        id: x.id,
        portion: x.portion,
        quantity: 1,
        type: x.type
      };
      result.push(item);
    });
    app.MealEditor.meal.items = result;
  },

  removeItem: function(item, li) {
    let title = app.strings.dialogs.delete || "Delete";
    let text = app.strings.dialogs["confirm-delete"] || "Are you sure?";
    let dialog = app.f7.dialog.confirm(text, title, callbackOk);

    function callbackOk() {
      app.MealEditor.meal.items.splice(item.index, 1);
      li.parentNode.removeChild(li);
      app.MealEditor.renderNutrition();
    }
  },

  save: function() {
    if (app.f7.input.validateInputs("#meal-edit-form") == true) {
      let data = {};

      if (app.MealEditor.meal.id !== undefined) data.id = app.MealEditor.meal.id;
      if (app.MealEditor.meal.items !== undefined) data.items = app.MealEditor.meal.items;

      let now = new Date();
      data.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

      let inputs = document.querySelectorAll(".page[data-name='meal-editor'] input");

      inputs.forEach((x) => {
        if (x.value !== undefined && x.value != "")
          data[x.name] = x.value;
      });

      // Array index should not be saved with items
      if (data.items !== undefined) {
        data.items.forEach((x) => {
          if (x.index !== undefined)
            delete x.index;
        });
      }

      dbHandler.put(data, "meals").onsuccess = () => {
        app.f7.views.main.router.navigate("/foods-meals-recipes/meals/");
      };
    }
  },

  replaceListItem: function(item) {
    app.MealEditor.meal.items.splice(item.index, 1, item);
  },

  renderNutrition: async function() {
    const nutrition = await app.FoodsMealsRecipes.getTotalNutrition(app.MealEditor.meal.items);
    const nutrimentUnits = app.nutrimentUnits;
    const energyUnit = app.Settings.get("units", "energy");
    const nutrimentVisibility = app.Settings.getField("nutrimentVisibility");
    const ul = app.MealEditor.el.nutrition;
    ul.innerHTML = "";

    for (let n in nutrition) {
      if (nutrition[n] !== 0) {

        if (n == "calories" && energyUnit !== "kcal") continue;
        if (n == "kilojoules" && energyUnit == "kcal") continue;
        if (nutrimentVisibility[n] !== true && !["calories", "kilojoules"].includes(n)) continue;

        let unit = "g";
        if (nutrimentUnits[n] !== undefined)
          unit = nutrimentUnits[n];

        let li = document.createElement("li");
        li.className = "item-content item-input";
        ul.appendChild(li);

        let innerDiv = document.createElement("div");
        innerDiv.className = "item-inner";
        li.appendChild(innerDiv);

        let title = document.createElement("div");
        title.className = "item-title item-label";
        let text = app.strings.nutriments[n] || n;
        title.innerHTML = app.Utils.tidyText(text, 30, true) + " (" + unit + ")";
        innerDiv.appendChild(title);

        let after = document.createElement("div");
        after.className = "item-after";
        after.innerHTML = Math.round(nutrition[n] * 100) / 100;
        innerDiv.appendChild(after);
      }
    }
  },

  renderItems: function() {
    return new Promise(function(resolve, reject) {
      app.MealEditor.el.foodlist.innerHTML = "";
      app.FoodsMealsRecipes.disableEdit = false;

      for (let i = 0; i < app.MealEditor.meal.items.length; i++) {
        let x = app.MealEditor.meal.items[i];
        x.index = i;
        app.FoodsMealsRecipes.renderItem(x, app.MealEditor.el.foodlist, false, undefined, app.MealEditor.removeItem);
      }

      resolve();
    });
  }
};

document.addEventListener("page:init", function(event) {
  if (event.detail.name == "meal-editor") {
    let context = app.data.context;
    app.data.context = undefined;

    // Clear old meal
    app.MealEditor.meal = {
      items: []
    };

    app.MealEditor.init(context);
  }
});

document.addEventListener("page:reinit", function(event) {
  if (event.detail.name == "meal-editor") {
    let context = app.data.context;
    app.data.context = undefined;
    app.MealEditor.init(context);
  }
});