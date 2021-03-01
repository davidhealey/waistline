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
app.RecipeEditor = {

  settings: {
    recipe: {},
    el: {}
  },

  init: async function(context) {
    s = this.settings; //Assign settings object
    app.Recipes.getComponents();

    if (context) {

      // From recipe list
      if (context.recipe) {
        s.recipe = context.recipe;
        app.Recipes.populateInputs(recipe);
      }

      // From food list
      if (context.items)
        app.Recipes.addItems(context.items);

      // From recipe editor
      if (context.item)
        app.Recipes.replaceListItem(context.item);

      app.Recipes.renderNutrition();
      await app.Recipes.renderItems();
    }

    app.Recipes.bindUIActions();
  },

  getComponents: function() {
    s.el.submit = document.querySelector(".page[data-name='recipe-editor'] #submit");
    s.el.nameInput = document.querySelector(".page[data-name='recipe-editor'] #name");
    s.el.foodlist = document.querySelector(".page[data-name='recipe-editor'] #recipe-food-list");
    s.el.fab = document.querySelector(".page[data-name='recipe-editor'] #add-food");
    s.el.nutrition = document.querySelector(".page[data-name='recipe-editor'] #recipe-nutrition");
    s.el.swiperWrapper = document.querySelector(".page[data-name='recipe-editor'] .swiper-wrapper");
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
          origin: "./recipe-editor/",
          recipe: recipe
        };

        app.f7.views.main.router.navigate("/foods-meals-recipes/", {
          context: app.f7.data.context
        });
      });
      s.el.fab.hasClickEvent = true;
    }
  },

  populateInputs: function(recipe) {
    let inputs = document.querySelectorAll(".page[data-name='recipe-editor'] input, .page[data-name='recipe-editor'] textarea");

    inputs.forEach((x) => {
      if (recipe[x.name] !== undefined)
        x.value = recipe[x.name];
    });
  },

  addItems: function(data) {

    let result = s.recipe.items;

    data.forEach((x) => {
      let item = {
        id: x.id,
        portion: x.portion,
        quantity: 1,
        type: x.type
      };
      result.push(item);
    });
    s.recipe.items = result;
  },

  removeItem: function(item, li) {
    let title = app.strings["confirm-delete-title"] || "Delete";
    let text = app.strings["confirm-delete"] || "Are you sure?";
    let dialog = app.f7.dialog.confirm(text, title, callbackOk);

    function callbackOk() {
      s.recipe.items.splice(item.index, 1);
      li.parentNode.removeChild(li);
      renderNutrition();
    }
  },

  save: async function() {

    let data = {};

    if (s.recipe.id !== undefined) data.id = s.recipe.id;
    if (s.recipe.items !== undefined) data.items = s.recipe.items;

    let now = new Date();
    data.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    let inputs = document.querySelectorAll(".page[data-name='recipe-editor'] input");

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

    if (s.recipe.items.length > 0)
      data.nutrition = await app.FoodsMealsRecipes.getTotalNutrition(s.recipe.items);

    dbHandler.put(data, "recipes").onsuccess = () => {
      app.f7.views.main.router.navigate("/foods-meals-recipes/recipes/");
    };
  },

  replaceListItem: function(item) {
    s.recipe.items.splice(item.index, 1, item);
  },

  renderNutrition: async function() {
    let now = new Date();
    let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(s.recipe.items);

    let swiper = app.swiper.get("#recipe-nutrition-swiper");
    s.el.swiperWrapper.innerHTML = "";
    app.FoodsMealsRecipes.renderNutritionCard(nutrition, now, swiper);
  },

  renderItems: function() {
    return new Promise(async function(resolve, reject) {

      // Render the food list 
      s.el.foodlist.innerHTML = "";

      s.recipe.items.forEach(async (x, i) => {
        x.index = i;
        app.FoodsMealsRecipes.renderItem(x, s.el.foodlist, false, undefined, removeItem);
      });

      resolve();
    });
  }
};

document.addEventListener("page:init", function(event) {
  if (event.detail.name == "recipe-editor") {
    let context = app.f7.data.context;
    app.f7.data.context = undefined;
    // Clear old recipe
    recipe = {
      items: []
    };

    app.Recipes.init(context);
  }
});

document.addEventListener("page:reinit", function(event) {
  if (event.detail.name == "recipe-editor") {
    let context = app.f7.data.context;
    app.f7.data.context = undefined;
    app.Recipes.init(context);
  }
});