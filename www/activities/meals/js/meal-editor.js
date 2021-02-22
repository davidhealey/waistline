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

var s;
app.MealEditor = {
  settings: {
    meal: {},
    el: {}
  },

  init: async function(context) {
    s = this.settings; //Assign settings object
    app.MealEditor.getComponents();

    if (context) {

      // From meal list or food list
      if (context.meal) {
        s.meal = context.meal;
        app.MealEditor.populateInputs(meal);
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
    s.el.submit = document.querySelector(".page[data-name='meal-editor'] #submit");
    s.el.nameInput = document.querySelector(".page[data-name='meal-editor'] #name");
    s.el.foodlist = document.querySelector(".page[data-name='meal-editor'] #meal-food-list");
    s.el.fab = document.querySelector(".page[data-name='meal-editor'] #add-food");
    s.el.nutrition = document.querySelector(".page[data-name='meal-editor'] #meal-nutrition");
    s.el.swiperWrapper = document.querySelector(".page[data-name='meal-editor'] .swiper-wrapper");
  },

  bindUIActions: function() {

    // Submit
    if (!s.el.submit.hasClickEvent) {
      s.el.submit.addEventListener("click", (e) => {
        save();
      });
      s.el.submit.hasClickEvent = true;
    }

    // Fab
    if (!s.el.fab.hasClickEvent) {
      s.el.fab.addEventListener("click", (e) => {
        app.f7.data.context = {
          origin: "./meal-editor/",
          meal: s.meal
        };

        app.f7.views.main.router.navigate("/foods-meals-recipes/", {
          context: app.f7.data.context
        });
      });
      s.el.fab.hasClickEvent = true;
    }
  },

  populateInputs: function(meal) {
    let inputs = document.querySelectorAll(".page[data-name='meal-editor'] input");

    inputs.forEach((x) => {
      if (meal[x.name] !== undefined)
        x.value = meal[x.name];
    });
  },

  addItems: function(data) {

    let result = s.meal.items;

    data.forEach((x) => {
      let item = {
        id: x.id,
        portion: x.portion,
        quantity: 1,
        type: x.type
      };
      result.push(item);
    });
    s.meal.items = result;
  },

  removeItem: function(item, li) {
    let title = app.strings["confirm-delete-title"] || "Delete";
    let text = app.strings["confirm-delete"] || "Are you sure?";
    let dialog = app.f7.dialog.confirm(text, title, callbackOk);

    function callbackOk() {
      s.meal.items.splice(item.index, 1);
      li.parentNode.removeChild(li);
      renderNutrition();
    }
  },

  save: function() {

    let data = {};

    if (s.meal.id !== undefined) data.id = s.meal.id;
    if (s.meal.items !== undefined) data.items = s.meal.items;

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
  },

  replaceListItem: function(item) {
    s.meal.items.splice(item.index, 1, item);
  },

  renderNutrition: async function() {
    let now = new Date();
    let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(s.meal.items);

    let swiper = app.swiper.get("#meal-nutrition-swiper");
    s.el.swiperWrapper.innerHTML = "";
    app.FoodsMealsRecipes.renderNutritionCard(nutrition, now, swiper);
  },

  renderItems: function() {
    return new Promise(async function(resolve, reject) {

      s.el.foodlist.innerHTML = "";

      s.meal.items.forEach(async (x, i) => {
        x.index = i;
        app.FoodsMealsRecipes.renderItem(x, s.el.foodlist, false, undefined, removeItem);
      });

      resolve();
    });
  }
};

document.addEventListener("page:init", function(event) {
  if (event.detail.name == "meal-editor") {
    let context = app.f7.data.context;
    app.f7.data.context = undefined;

    // Clear old meal
    s.meal = {
      items: []
    };

    init(context);
  }
});

document.addEventListener("page:reinit", function(event) {
  if (event.detail.name == "meal-editor") {
    let context = app.f7.data.context;
    app.f7.data.context = undefined;
    init(context);
  }
});