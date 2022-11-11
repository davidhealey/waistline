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

  editingEnabled: undefined,
  meal: {},
  el: {},

  init: async function(context) {
    app.MealEditor.getComponents();

    if (context) {

      // From meal list
      if (context.meal) {
        app.MealEditor.meal = context.meal;
        app.MealEditor.populateInputs(context.meal);
      }

      app.FoodsMealsRecipes.populateCategoriesField(app.MealEditor.el.categories, app.MealEditor.meal, false, true, true);

      // From food list
      if (context.items)
        app.MealEditor.addItems(context.items);

      // Returned from food editor
      if (context.item && context.index != undefined)
        app.MealEditor.replaceListItem(context.item, context.index);

      app.MealEditor.renderNutrition();
      await app.MealEditor.renderItems();
    }

    app.MealEditor.setRequiredFieldErrorMessage();
    app.MealEditor.bindUIActions();
    app.MealEditor.setComponentVisibility();
  },

  getComponents: function() {
    app.MealEditor.el.submit = document.querySelector(".page[data-name='meal-editor'] #submit");
    app.MealEditor.el.sort = document.querySelector(".page[data-name='meal-editor'] #sort");
    app.MealEditor.el.categoriesContainer = document.querySelector(".page[data-name='meal-editor'] #categories-container");
    app.MealEditor.el.categories = document.querySelector(".page[data-name='meal-editor'] #categories");
    app.MealEditor.el.nameInput = document.querySelector(".page[data-name='meal-editor'] #name");
    app.MealEditor.el.foodlist = document.querySelector(".page[data-name='meal-editor'] #meal-food-list");
    app.MealEditor.el.add = document.querySelector(".page[data-name='meal-editor'] #add-food");
    app.MealEditor.el.nutrition = document.querySelector(".page[data-name='meal-editor'] #nutrition");
    app.MealEditor.el.nutritionButton = document.querySelector(".page[data-name='meal-editor'] #nutrition-button");
  },

  setComponentVisibility: function() {
    app.FoodsMealsRecipes.setCategoriesVisibility(app.MealEditor.el.categoriesContainer);

    if (app.MealEditor.editingEnabled == false) {
      app.MealEditor.el.sort.style.display = "none";
      app.MealEditor.el.add.style.display = "none";
    }
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

    // Nutrition fields visibility toggle button
    if (!app.MealEditor.el.nutritionButton.hasClickEvent) {
      app.MealEditor.el.nutritionButton.addEventListener("click", async (e) => {
        app.FoodsMealsRecipes.toggleNutritionFieldsVisibility(app.MealEditor.el.nutrition, app.MealEditor.el.nutritionButton);
      });
      app.MealEditor.el.nutritionButton.hasClickEvent = true;
    }

    // Item list sort
    if (!app.MealEditor.el.foodlist.hasSortableEvent) {
      app.MealEditor.el.foodlist.addEventListener("sortable:sort", (li) => {
        let items = app.MealEditor.el.foodlist.getElementsByTagName("li");
        app.MealEditor.meal.items = [];
        for (let i = 0; i < items.length; i++) {
          let item = app.FoodsMealsRecipes.flattenItem(JSON.parse(items[i].data));
          app.MealEditor.meal.items.push(item);
        }
      });
      app.MealEditor.el.foodlist.hasSortableEvent = true;
    }
  },

  setRequiredFieldErrorMessage: function() {
    const error_message = app.strings["food-editor"]["required-field-message"] || "Please fill out this field.";
    let inputs = Array.from(document.getElementsByTagName("input"));
    inputs.forEach((x) => {
      if (x.hasAttribute("required") && x.hasAttribute("validate")) {
        x.setAttribute("data-error-message", error_message);
      }
    });
  },

  populateInputs: function(meal) {
    let inputs = document.querySelectorAll(".page[data-name='meal-editor'] input");

    inputs.forEach((x) => {
      if (meal[x.name] !== undefined)
        x.value = meal[x.name];
    });
  },

  addItems: function(data) {
    let result = app.MealEditor.meal.items;

    data.forEach((x) => {
      let item = app.FoodsMealsRecipes.flattenItem(x);
      result.push(item);
    });
    app.MealEditor.meal.items = result;
  },

  removeItem: function(item, li) {
    let title = app.strings.dialogs["delete-title"] || "Delete Entry";
    let text = app.strings.dialogs["confirm-delete"] || "Are you sure you want to delete this?";

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
          text: app.strings.dialogs.delete || "Delete",
          keyCodes: [13],
          onClick: () => {
            let index = $(li).index();
            app.MealEditor.meal.items.splice(index, 1);
            app.MealEditor.renderNutrition();
            li.remove();
          }
        }
      ]
    }).open();
  },

  save: function() {
    if (app.f7.input.validateInputs("#meal-edit-form") == true) {

      let data = {};

      if (app.MealEditor.meal.id !== undefined) data.id = app.MealEditor.meal.id;
      if (app.MealEditor.meal.items !== undefined) data.items = app.MealEditor.meal.items;

      data.dateTime = new Date();

      let inputs = document.querySelectorAll(".page[data-name='meal-editor'] input");

      inputs.forEach((x) => {
        if (x.value !== undefined && x.value != "")
          data[x.name] = x.value;
      });

      let categories = app.FoodsMealsRecipes.getSelectedCategories(app.MealEditor.el.categories);
      if (categories !== undefined)
        data.categories = categories;

      app.data.context = {
        meal: data
      };

      dbHandler.put(data, "meals").onsuccess = () => {
        app.f7.views.main.router.back();
      };
    }
  },

  mealItemClickHandler: function(item, li) {
    let index = $(li).index();
    app.FoodsMealsRecipes.gotoEditor(item, index);
  },

  replaceListItem: function(item, index) {
    let updatedItem = app.FoodsMealsRecipes.flattenItem(item);
    app.MealEditor.meal.items.splice(index, 1, updatedItem);
  },

  renderNutrition: async function() {
    const nutrition = await app.FoodsMealsRecipes.getTotalNutrition(app.MealEditor.meal.items, "subtract");

    const nutriments = app.Nutriments.getNutriments();
    const units = app.Nutriments.getNutrimentUnits();

    const ul = app.MealEditor.el.nutrition;
    ul.innerHTML = "";

    nutriments.forEach((x) => {

      if (nutrition[x] == undefined || nutrition[x] == 0) return;

      let unit = app.strings["unit-symbols"][units[x]] || units[x];

      let li = document.createElement("li");
      li.className = "item-content item-input";
      ul.appendChild(li);

      let innerDiv = document.createElement("div");
      innerDiv.className = "item-inner";
      li.appendChild(innerDiv);

      let title = document.createElement("div");
      title.className = "item-title item-label";
      let text = app.strings.nutriments[x] || x;
      title.innerText = app.Utils.tidyText(text, 25);
      if (unit !== undefined)
        title.innerText += " (" + unit + ")";
      innerDiv.appendChild(title);

      let after = document.createElement("div");
      after.className = "item-after nutrition-field";
      after.id = x;
      after.innerText = app.Utils.tidyNumber(Math.round(nutrition[x] * 100) / 100);
      innerDiv.appendChild(after);
    });

    app.FoodsMealsRecipes.setNutritionFieldsVisibility(ul, app.MealEditor.el.nutritionButton);
  },

  renderItems: function() {
    return new Promise(function(resolve, reject) {
      app.MealEditor.el.foodlist.innerHTML = "";

      let clickable = (app.MealEditor.editingEnabled == true);

      app.MealEditor.meal.items.forEach(async (x, i) => {
        app.FoodsMealsRecipes.renderItem(x, app.MealEditor.el.foodlist, false, true, clickable, app.MealEditor.mealItemClickHandler, app.MealEditor.removeItem, undefined, false, "foodlist");
      });
      app.f7.sortable.disable(app.MealEditor.el.foodlist);

      resolve();
    });
  }
};

document.addEventListener("page:init", function(event) {
  if (event.detail.name == "meal-editor") {
    let context = app.data.context;
    app.data.context = undefined;

    app.MealEditor.editingEnabled = (app.FoodsMealsRecipes.editItems == "enabled");

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