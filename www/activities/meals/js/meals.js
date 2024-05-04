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
  isRendering: false,
  el: {}, //UI elements

  init: async function(context) {

    if (context && context.meal)
      app.FoodsMealsRecipes.unselectOldItem(context.meal);

    app.Meals.getComponents();
    app.Meals.createSearchBar();
    app.Meals.bindUIActions();
    app.Meals.setComponentVisibility();

    if (!app.Meals.ready) {
      app.f7.infiniteScroll.create(app.Meals.el.infinite); //Setup infinite list
      app.Meals.ready = true;
    }

    app.Meals.filterList = await app.Meals.getListFromDB();
    app.Meals.list = app.FoodsMealsRecipes.filterList("", undefined, app.Meals.filterList);

    await app.Meals.renderList(true);

    if (context)
      app.FoodsMealsRecipes.resetSearchForm(app.Meals.el.searchForm, app.Meals.el.searchFilter, app.Meals.el.searchFilterIcon);
  },

  getComponents: function() {
    app.Meals.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    app.Meals.el.search = document.querySelector("#meals-tab #meal-search");
    app.Meals.el.searchForm = document.querySelector("#meals-tab #meal-search-form");
    app.Meals.el.searchFilter = document.querySelector("#meals-tab #meal-search-filter");
    app.Meals.el.searchFilterIcon = document.querySelector("#meals-tab #meal-search-filter-icon");
    app.Meals.el.searchFilterContainer = document.querySelector("#meals-tab #meal-search-filter-container");
    app.Meals.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #meals"); //Infinite list container
    app.Meals.el.list = document.querySelector("#meal-list-container ul"); //Infinite list
  },

  bindUIActions: function() {

    // Infinite list - render more items
    if (!app.Meals.el.infinite.hasInfiniteEvent) {
      app.Meals.el.infinite.addEventListener("infinite", (e) => {
        if (!app.Meals.isRendering)
          app.Meals.renderList();
      });
      app.Meals.el.infinite.hasInfiniteEvent = true;
    }

    // Search filter - reset category filter on long press
    if (!app.Meals.el.searchFilter.hasTapholdEvent) {
      app.Meals.el.searchFilter.addEventListener("taphold", (e) => {
        app.FoodsMealsRecipes.clearSelectedCategories(app.Meals.el.searchFilter, app.Meals.el.searchFilterIcon);
        app.Meals.list = app.FoodsMealsRecipes.filterList(app.Meals.el.search.value, undefined, app.Meals.filterList);
        app.Meals.renderList(true);
      });
      app.Meals.el.searchFilter.hasTapholdEvent = true;
    }
  },

  setComponentVisibility: function() {
    app.Meals.el.scan.style.display = "none";

    if (app.FoodsMealsRecipes.editItems != "enabled")
      app.FoodsMealsRecipes.el.fab.style.display = "none";
    else
      app.FoodsMealsRecipes.el.fab.style.display = "block";
  },

  renderList: async function(clear) {
    app.Meals.isRendering = true;

    if (clear) app.Utils.deleteChildNodes(app.Meals.el.list);

    //List settings 
    let itemsPerLoad = 20; //Number of items to append at a time
    let lastIndex = document.querySelectorAll("#meal-list-container li").length;

    let clickable = (app.FoodsMealsRecipes.editItems != "disabled");

    if (lastIndex <= app.Meals.list.length) {
      //Render next set of items to list
      for (let i = lastIndex; i < lastIndex + itemsPerLoad; i++) {
        if (i >= app.Meals.list.length) break; //Exit after all items in list

        let item = app.Meals.list[i];

        item.nutrition = await app.FoodsMealsRecipes.getTotalNutrition(item.items, "subtract");
        app.FoodsMealsRecipes.renderItem(item, app.Meals.el.list, true, false, clickable, app.Meals.gotoEditor, app.Meals.handleTapHold, undefined, false, false, "foodlist");
      }
    }

    app.Meals.isRendering = false;
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

  handleTapHold: function(item, li) {
    // Ask user for action
    const actions = ["delete-item", "clone-item"];
    let options = [];

    actions.forEach((action) => {
      let choice = {
        text: app.strings.dialogs[action] || action,
        onClick: () => { app.Meals.handleTapHoldAction(action, item, li) }
      };
      options.push(choice);
    });

    let ac = app.f7.actions.create({
      buttons: options,
      closeOnEscape: true,
      animate: !app.Settings.get("appearance", "animations")
    });
    ac.open();
  },

  handleTapHoldAction: function(action, item, li) {
    let title = app.strings.dialogs[action] || action;
    let text = app.strings.dialogs.confirm || "Are you sure?";

    let dialog = app.f7.dialog.create({
      title: title,
      content: app.Utils.getDialogTextDiv(text),
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: app.Utils.escapeKeyCode
        },
        {
          text: app.strings.dialogs.yes || "Yes",
          keyCodes: app.Utils.enterKeyCode,
          onClick: async () => {
            switch (action) {
              case "delete-item":
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
                break;

              case "clone-item":
                await app.FoodsMealsRecipes.cloneItem(item, "meal");
                app.Meals.filterList = await app.Meals.getListFromDB();
                app.Meals.renderFilteredList();
                break;
            }
          }
        }
      ]
    }).open();
  },

  gotoEditor: function(meal) {
    app.data.context = {
      meal: meal,
      origin: "/foods-meals-recipes/"
    };
    app.f7.views.main.router.navigate("./meal-editor/");
  },

  renderFilteredList: function() {
    let query = app.Meals.el.search.value;
    let categories = app.FoodsMealsRecipes.getSelectedCategories(app.Meals.el.searchFilter);
    app.Meals.list = app.FoodsMealsRecipes.filterList(query, categories, app.Meals.filterList);
    app.Meals.renderList(true);
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
    app.FoodsMealsRecipes.populateCategoriesField(app.Meals.el.searchFilter, undefined, true, false, true, false, {
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