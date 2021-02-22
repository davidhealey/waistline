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

  settings: {
    list: [], //Main list of foods
    filterList: [], //Copy of the list for filtering
    selection: [], //Items that have been checked, even if list has been changed
    el: {} //UI elements
  },

  init: async function(context) {
    this.settings.selection = []; //Clear out selection when page is reloaded

    if (context !== undefined) {
      if (context.recipe)
        this.settings.recipe = context.recipe;
    } else {
      this.settings.recipe = undefined;
    }

    this.getComponents();
    this.createSearchBar();
    this.bindUIActions();

    if (!this.settings.ready) {
      app.f7.infiniteScroll.create(this.settings.el.infinite); //Setup infinite list
      this.settings.ready = true;
    }

    this.settings.list = await this.getListFromDB();
    this.settings.filterList = this.settings.list;

    this.renderList(true);
  },

  getComponents: function() {
    this.settings.el.submit = document.querySelector(".page[data-name='foods-meals-recipes'] #submit");
    this.settings.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    this.settings.el.scan.style.display = "none";
    this.settings.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    this.settings.el.search = document.querySelector("#recipes-tab #recipe-search");
    this.settings.el.searchForm = document.querySelector("#recipes-tab #recipe-search-form");
    this.settings.el.fab = document.querySelector("#add-recipe");
    this.settings.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #recipes"); //Infinite list container
    this.settings.el.list = document.querySelector("#recipe-list-container ul"); //Infinite list
    this.settings.el.spinner = document.querySelector("#recipes-tab #spinner");
  },

  bindUIActions: function() {

    //Infinite list 
    if (!this.settings.el.infinite.hasInfiniteEvent) {
      this.settings.el.infinite.addEventListener("infinite", (e) => {
        this.renderList();
      });
      this.settings.el.infinite.hasInfiniteEvent = true;
    }
  },

  renderList: async function(clear) {
    if (clear) app.Utils.deleteChildNodes(this.settings.el.list);

    //List settings 
    let maxItems = 200; //Max items to load
    let itemsPerLoad = 20; //Number of items to append at a time
    let lastIndex = document.querySelectorAll("#recipe-list-container li").length;

    if (lastIndex <= this.settings.list.length) {
      //Render next set of items to list
      for (let i = lastIndex; i < lastIndex + itemsPerLoad; i++) {
        if (i >= this.settings.list.length) break; //Exit after all items in list

        let item = this.settings.list[i];

        // Don't show item that is being edited, otherwise endless loop will ensue
        if (this.settings.recipe !== undefined && this.settings.recipe.id == item.id) continue;

        if (item.archived !== true) {
          item.nutrition = await app.FoodsMealsRecipes.getTotalNutrition(item.items);
          app.FoodsMealsRecipes.renderItem(item, this.settings.el.list, true, app.Recipes.gotoEditor, app.Recipes.removeItem);
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
    let title = app.strings["confirm-delete-title"] || "Delete";
    let text = app.strings["confirm-delete"] || "Are you sure?";

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
    app.f7.data.context = {
      recipe: recipe,
      origin: "/foods-meals-recipes/",
      allNutriments: true
    };
    app.f7.views.main.router.navigate("./recipe-editor/");
  },

  createSearchBar: function() {
    const searchBar = app.f7.searchbar.create({
      el: this.settings.el.searchForm,
      backdrop: false,
      customSearch: true,
      on: {
        async search(sb, query, previousQuery) {
          if (query != "") {
            this.settings.list = app.FoodsMealsRecipethis.settings.filterList(query, this.settings.filterList);
          } else {
            this.settings.list = await app.Recipes.getListFromDB();
            this.settings.filterList = this.settings.list;
            app.f7.searchbar.disable(this);
          }
          app.Recipes.renderList(true);
        },
      }
    });
  },
};

document.addEventListener("tab:init", function(e) {
  if (e.target.id == "recipes") {
    let context = app.f7.data.context;
    app.f7.data.context = undefined;
    app.Recipes.init(context);
  }
});