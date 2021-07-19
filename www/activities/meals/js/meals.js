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

app.Meals = {

  list: [], //Main list of foods
  filterList: [], //Copy of the list for filtering
  selection: [], //Items that have been checked, even if list has been changed
  el: {}, //UI elements

  init: async function(context) {
    app.Meals.selection = []; //Clear out selection when page is reloaded

    if (context !== undefined) {
      if (context.meal)
        app.Meals.meal = context.meal;
    } else {
      app.Meals.meal = undefined;
    }

    app.Meals.getComponents();
    app.Meals.createSearchBar();
    app.Meals.bindUIActions();

    if (!app.Meals.ready) {
      app.f7.infiniteScroll.create(app.Meals.el.infinite); //Setup infinite list
      app.Meals.ready = true;
    }

    app.Meals.list = await app.Meals.getListFromDB();
    app.Meals.filterList = app.Meals.list;

    app.Meals.renderList(true);
  },

  getComponents: function() {
    app.Meals.el.submit = document.querySelector(".page[data-name='foods-meals-recipes'] #submit");
    app.Meals.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    app.Meals.el.scan.style.display = "none";
    app.Meals.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    app.Meals.el.search = document.querySelector("#meals-tab #meal-search");
    app.Meals.el.searchForm = document.querySelector("#meals-tab #meal-search-form");
    app.Meals.el.fab = document.querySelector("#add-meal");
    app.Meals.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #meals"); //Infinite list container
    app.Meals.el.list = document.querySelector("#meal-list-container ul"); //Infinite list
    app.Meals.el.spinner = document.querySelector("#meals-tab #spinner");
  },

  bindUIActions: function() {

    //Infinite list 
    if (!app.Meals.el.infinite.hasInfiniteEvent) {
      app.Meals.el.infinite.addEventListener("infinite", (e) => {
        this.renderList();
      });
      app.Meals.el.infinite.hasInfiniteEvent = true;
    }
  },

  renderList: async function(clear) {

    if (clear) app.Utils.deleteChildNodes(app.Meals.el.list);

    //List settings 
    let maxItems = 200; //Max items to load
    let itemsPerLoad = 20; //Number of items to append at a time
    let lastIndex = document.querySelectorAll("#meal-list-container li").length;

    if (lastIndex <= app.Meals.list.length) {
      //Render next set of items to list
      for (let i = lastIndex; i < lastIndex + itemsPerLoad; i++) {
        if (i >= app.Meals.list.length) break; //Exit after all items in list

        let item = app.Meals.list[i];

        // Don't show item that is being edited, otherwise endless loop will ensue
        if (app.Meals.meal !== undefined && app.Meals.meal.id == item.id) continue;

        item.nutrition = await app.FoodsMealsRecipes.getTotalNutrition(item.items);
        app.FoodsMealsRecipes.renderItem(item, app.Meals.el.list, true, app.Meals.gotoEditor, app.Meals.deleteMeal);
      }
    }
  },

  getListFromDB: function() {
    return new Promise(async function(resolve, reject) {
      let sort = app.Settings.get("foodlist", "sort");
      let list = await app.FoodsMealsRecipes.getFromDB("meals", sort) || [];

      // Get yesterday's meal if there is a diary category
      let category = app.FoodsMealsRecipes.getCategory();
      let yesterdaysMeal = false;

      if (category !== false) {
        yesterdaysMeal = await app.Meals.getYesterdaysMeal(category);

        // Add meal to top of list
        if (yesterdaysMeal)
          list.unshift(yesterdaysMeal);
      }

      resolve(list);
    }).catch(err => {
      throw (err);
    });
  },

  getYesterdaysMeal: function(category) {
    return new Promise(async function(resolve, reject) {
      if (category !== false && category !== undefined) {

        // Get yesterdays dateTime
        let now = new Date();
        let yesterday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        yesterday.setUTCHours(yesterday.getUTCHours() - 24);

        const mealNames = app.Settings.get("diary", "meal-names");

        let result = {
          name: "Yesterday's " + mealNames[category],
          items: []
        };

        let entry = await dbHandler.get("diary", "dateTime", yesterday);

        if (entry !== undefined) {
          entry.items.forEach((x) => {
            if (x.category == category) {
              result.items.push(x);
            }
          });

          if (result.items.length > 0)
            resolve(result);
        }
        resolve();
      }
      resolve(false);
    }).catch(err => {
      throw (err);
    });
  },

  deleteMeal: function(item) {
    let title = app.strings.dialogs.delete || "Delete";
    let text = app.strings.dialogs["confirm-delete"] || "Are you sure?";

    let dialog = app.f7.dialog.confirm(text, title, async () => {
      let request = dbHandler.deleteItem(item.id, "meals");

      request.onsuccess = function(e) {
        app.f7.views.main.router.refreshPage();
      };
    });
  },

  submitButtonAction: function(selection) {
    let result = [];

    selection.forEach((x) => {
      let meal = JSON.parse(x);
      meal.items.forEach((f) => {
        result.push(f);
      });
    });

    app.FoodsMealsRecipes.returnItems(result);
  },

  gotoEditor: function(meal) {
    app.data.context = {
      meal: meal,
      origin: "/foods-meals-recipes/",
      allNutriments: true
    };

    app.f7.views.main.router.navigate("./meal-editor/");
  },

  createSearchBar: function() {
    const searchBar = app.f7.searchbar.create({
      el: app.Meals.el.searchForm,
      backdrop: false,
      customSearch: true,
      on: {
        async search(sb, query, previousQuery) {
          if (query != "") {
            app.Meals.list = app.FoodsMealsRecipes.filterList(query, app.Meals.filterList);
          } else {
            app.Meals.list = await app.Meals.getListFromDB();
            app.Meals.filterList = app.Meals.list;
          }
          app.Meals.renderList(true);
        },
      }
    });
  },
};

document.addEventListener("tab:init", function(e) {
  if (e.target.id == "meals") {
    let context = app.data.context;
    app.data.context = undefined;
    app.Meals.init(context);
  }
});