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

  list: [], //Main list of meals
  filterList: [], //Copy of the list for filtering
  el: {}, //UI elements

  init: async function(context) {

    if (context)
      app.FoodsMealsRecipes.clearSearchSelection();

    app.Meals.getComponents();
    app.Meals.createSearchBar();
    app.Meals.bindUIActions();

    app.Meals.el.scan.style.display = "none";

    if (!app.Meals.ready) {
      app.f7.infiniteScroll.create(app.Meals.el.infinite); //Setup infinite list
      app.Meals.ready = true;
    }

    app.Meals.list = await app.Meals.getListFromDB();
    app.Meals.filterList = app.Meals.list;

    await app.Meals.renderList(true);

    if (context)
      app.FoodsMealsRecipes.resetSearchForm(app.Meals.el.searchForm, app.Meals.el.searchFilter, app.Meals.el.searchFilterIcon);
  },

  getComponents: function() {
    app.Meals.el.submit = document.querySelector(".page[data-name='foods-meals-recipes'] #submit");
    app.Meals.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    app.Meals.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    app.Meals.el.search = document.querySelector("#meals-tab #meal-search");
    app.Meals.el.searchForm = document.querySelector("#meals-tab #meal-search-form");
    app.Meals.el.searchFilter = document.querySelector("#meals-tab #meal-search-filter");
    app.Meals.el.searchFilterIcon = document.querySelector("#meals-tab #meal-search-filter-icon");
    app.Meals.el.searchFilterContainer = document.querySelector("#meals-tab #meal-search-filter-container");
    app.Meals.el.fab = document.querySelector("#add-meal");
    app.Meals.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #meals"); //Infinite list container
    app.Meals.el.list = document.querySelector("#meal-list-container ul"); //Infinite list
  },

  bindUIActions: function() {

    // Infinite list - render more items
    if (!app.Meals.el.infinite.hasInfiniteEvent) {
      app.Meals.el.infinite.addEventListener("infinite", (e) => {
        app.Meals.renderList();
      });
      app.Meals.el.infinite.hasInfiniteEvent = true;
    }

    // Search filter - reset category filter on long press
    if (!app.Meals.el.searchFilter.hasTapholdEvent) {
      app.Meals.el.searchFilter.addEventListener("taphold", async (e) => {
        app.FoodsMealsRecipes.clearSelectedCategories(app.Meals.el.searchFilter, app.Meals.el.searchFilterIcon);
        app.Meals.list = app.FoodsMealsRecipes.filterList(app.Meals.el.search.value, undefined, app.Meals.filterList);
        app.Meals.renderList(true);
      });
      app.Meals.el.searchFilter.hasTapholdEvent = true;
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

        item.nutrition = await app.FoodsMealsRecipes.getTotalNutrition(item.items);
        app.FoodsMealsRecipes.renderItem(item, app.Meals.el.list, true, false, app.Meals.gotoEditor, app.Meals.deleteMeal);
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
        const mealName = mealNames[category];

        const yesterdays = app.strings.diary["yesterdays-meal"] || "Yesterday's %s";
        const meal = app.strings.diary["default-meals"][mealName.toLowerCase()] || mealName;

        let result = {
          name: yesterdays.replace("%s", meal),
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

  deleteMeal: function(item, li) {
    let title = app.strings.dialogs.delete || "Delete";
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
          onClick: async () => {
            let request = dbHandler.deleteItem(item.id, "meals");

            request.onsuccess = function(e) {
              let index = app.Meals.filterList.indexOf(item);
              if (index != -1)
                app.Meals.filterList.splice(index, 1);
              index = app.Meals.list.indexOf(item);
              if (index != -1)
                app.Meals.list.splice(index, 1);
              li.remove();
            };
          }
        }
      ]
    }).open();
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
    app.FoodsMealsRecipes.initializeSearchBar(app.Meals.el.searchForm, {
      searchbarSearch: async (searchbar, query, previousQuery) => {
        if (query == "")
          app.Meals.filterList = await app.Meals.getListFromDB();
        let categories = app.FoodsMealsRecipes.getSelectedCategories(app.Meals.el.searchFilter);
        app.Meals.list = app.FoodsMealsRecipes.filterList(query, categories, app.Meals.filterList);
        app.Meals.renderList(true);
      }
    });
    app.FoodsMealsRecipes.populateCategoriesField(app.Meals.el.searchFilter, undefined, true, false, {
      beforeOpen: (smartSelect, prevent) => {
        smartSelect.selectEl.selectedIndex = -1;
      },
      close: (smartSelect) => {
        let query = app.Meals.el.search.value;
        let categories = app.FoodsMealsRecipes.getSelectedCategories(app.Meals.el.searchFilter);
        if (categories !== undefined)
          app.Meals.el.searchFilterIcon.classList.add(".color-theme");
        else
          app.Meals.el.searchFilterIcon.classList.remove(".color-theme");
        app.Meals.list = app.FoodsMealsRecipes.filterList(query, categories, app.Meals.filterList);
        app.Meals.renderList(true);
      }
    });
    app.FoodsMealsRecipes.setCategoriesVisibility(app.Meals.el.searchFilterContainer);
  },
};

document.addEventListener("tab:init", function(e) {
  if (e.target.id == "meals") {
    let context = app.data.context;
    app.data.context = undefined;
    app.Meals.init(context);
  }
});