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

app.Recipes = {

  list: [], //Main list of foods
  filterList: [], //Copy of the list for filtering
  selection: [], //Items that have been checked, even if list has been changed
  el: {}, //UI elements

  init: async function(context) {
    app.Recipes.selection = []; //Clear out selection when page is reloaded

    if (context !== undefined) {
      if (context.recipe)
        app.Recipes.recipe = context.recipe;
    } else {
      app.Recipes.recipe = undefined;
    }

    app.Recipes.getComponents();
    app.Recipes.createSearchBar();
    app.Recipes.bindUIActions();

    if (!app.Recipes.ready) {
      app.f7.infiniteScroll.create(app.Recipes.el.infinite); //Setup infinite list
      app.Recipes.ready = true;
    }

    app.Recipes.list = await app.Recipes.getListFromDB();
    app.Recipes.filterList = app.Recipes.list;

    app.Recipes.renderList(true);
  },

  getComponents: function() {
    app.Recipes.el.submit = document.querySelector(".page[data-name='foods-meals-recipes'] #submit");
    app.Recipes.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    app.Recipes.el.scan.style.display = "none";
    app.Recipes.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    app.Recipes.el.search = document.querySelector("#recipes-tab #recipe-search");
    app.Recipes.el.searchForm = document.querySelector("#recipes-tab #recipe-search-form");
    app.Recipes.el.fab = document.querySelector("#add-recipe");
    app.Recipes.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #recipes"); //Infinite list container
    app.Recipes.el.list = document.querySelector("#recipe-list-container ul"); //Infinite list
    app.Recipes.el.spinner = document.querySelector("#recipes-tab #spinner");
  },

  bindUIActions: function() {

    //Infinite list 
    if (!app.Recipes.el.infinite.hasInfiniteEvent) {
      app.Recipes.el.infinite.addEventListener("infinite", (e) => {
        app.Recipes.renderList();
      });
      app.Recipes.el.infinite.hasInfiniteEvent = true;
    }
  },

  renderList: async function(clear) {
    if (clear) app.Utils.deleteChildNodes(app.Recipes.el.list);

    //List settings 
    let maxItems = 200; //Max items to load
    let itemsPerLoad = 20; //Number of items to append at a time
    let lastIndex = document.querySelectorAll("#recipe-list-container li").length;

    if (lastIndex <= app.Recipes.list.length) {
      //Render next set of items to list
      for (let i = lastIndex; i < lastIndex + itemsPerLoad; i++) {
        if (i >= app.Recipes.list.length) break; //Exit after all items in list

        let item = app.Recipes.list[i];
        // Don't show item that is being edited, otherwise endless loop will ensue
        if (app.Recipes.recipe !== undefined && app.Recipes.recipe.id == item.id) continue;

        if (item.archived !== true) {
          item.nutrition = await app.FoodsMealsRecipes.getTotalNutrition(item.items);
          app.FoodsMealsRecipes.renderItem(item, app.Recipes.el.list, true, app.Recipes.gotoEditor, app.Recipes.removeItem);
        }
      }
    }
  },

  getListFromDB: function() {
    return new Promise(async function(resolve, reject) {
      let sort = app.Settings.get("foodlist", "sort");
      let list = await app.FoodsMealsRecipes.getFromDB("recipes", sort) || [];
      resolve(list);
    }).catch(err => {
      throw (err);
    });
  },

  removeItem: function(item) {
    let title = app.strings.dialogs.delete || "Delete";
    let text = app.strings.dialogs["confirm-delete"] || "Are you sure?";

    let dialog = app.f7.dialog.confirm(text, title, async () => {
      await app.FoodsMealsRecipes.removeItem(item.id, "recipe");
      app.f7.views.main.router.refreshPage();
    });
  },

  submitButtonAction: function(selection) {
    let result = [];

    selection.forEach((x) => {
      let recipe = JSON.parse(x);
      result.push(app.Recipes.flattenRecipe(recipe));
    });

    app.FoodsMealsRecipes.returnItems(result);
  },

  flattenRecipe: function(recipe) {
    let item = {
      id: recipe.id,
      portion: recipe.portion,
      type: "recipe"
    };

    return item;
  },

  gotoEditor: function(recipe) {
    app.data.context = {
      recipe: recipe,
      origin: "/foods-meals-recipes/",
      allNutriments: true
    };
    app.f7.views.main.router.navigate("./recipe-editor/");
  },

  createSearchBar: function() {
    const searchBar = app.f7.searchbar.create({
      el: app.Recipes.el.searchForm,
      backdrop: false,
      customSearch: true,
      on: {
        async search(sb, query, previousQuery) {
          if (query != "") {
            app.Recipes.list = app.FoodsMealsRecipes.filterList(query, app.Recipes.filterList);
          } else {
            app.Recipes.list = await app.Recipes.getListFromDB();
            app.Recipes.filterList = app.Recipes.list;
          }
          app.Recipes.renderList(true);
        },
      }
    });
  },
};

document.addEventListener("tab:init", function(e) {
  if (e.target.id == "recipes") {
    let context = app.data.context;
    app.data.context = undefined;
    app.Recipes.init(context);
  }
});