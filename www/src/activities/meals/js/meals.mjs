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
  along with Waistline.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as Utils from "/www/assets/js/utils.js";
import * as Editor from "/www/src/activities/meals/js/meal-editor.mjs";
import {
  renderItem
} from "/www/src/activities/foods-meals-recipes/foods-meals-recipes.mjs";

var s;
waistline.Meals = {

  settings: {
    list: [], //Main list of foods
    filterList: [], //Copy of the list for filtering
    selection: [], //Items that have been checked, even if list has been changed
    el: {} //UI elements
  },

  init: async function(context) {
    s = this.settings; //Assign settings object
    s.selection = []; //Clear out selection when page is reloaded

    this.getComponents();
    this.createSearchBar();
    this.bindUIActions();

    if (!s.ready) {
      f7.infiniteScroll.create(s.el.infinite); //Setup infinite list
      s.ready = true;
    }

    s.list = await this.getListFromDB();
    s.filterList = s.list;

    this.renderList(true);
  },

  getComponents: function() {
    s.el.submit = document.querySelector(".page[data-name='foods-meals-recipes'] #submit");
    s.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    s.el.scan.style.display = "none";
    s.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    s.el.search = document.querySelector("#meals-tab #meal-search");
    s.el.searchForm = document.querySelector("#meals-tab #meal-search-form");
    s.el.fab = document.querySelector("#add-meal");
    s.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #meals"); //Infinite list container
    s.el.list = document.querySelector("#meal-list-container ul"); //Infinite list
    s.el.spinner = document.querySelector("#meals-tab #spinner");
  },

  bindUIActions: function() {

    //Infinite list 
    if (!s.el.infinite.hasInfiniteEvent) {
      s.el.infinite.addEventListener("infinite", (e) => {
        this.renderList();
      });
      s.el.infinite.hasInfiniteEvent = true;
    }
  },

  renderList: async function(clear) {

    if (clear) Utils.deleteChildNodes(s.el.list);

    //List settings 
    let maxItems = 200; //Max items to load
    let itemsPerLoad = 20; //Number of items to append at a time
    let lastIndex = document.querySelectorAll("#meal-list-container div").length;

    if (lastIndex <= s.list.length) {
      //Render next set of items to list
      for (let i = lastIndex; i <= lastIndex + itemsPerLoad; i++) {
        let meal = s.list[i];
        if (meal == undefined) continue;

        meal.nutrition = await waistline.FoodsMealsRecipes.getTotalNutrition(meal.foods);
        renderItem(meal, s.el.list, true, waistline.Meals.gotoEditor, waistline.Meals.deleteMeal);
      }
    }
  },

  getListFromDB: function() {
    return new Promise(async function(resolve, reject) {
      let sort = waistline.Settings.get("foodlist", "sort");
      let list = await waistline.FoodsMealsRecipes.getFromDB("meals", sort) || [];

      // Get yesterday's meal if there is a diary category
      let category = waistline.FoodsMealsRecipes.getCategory();
      let yesterdaysMeal = false;

      if (category !== false) {
        yesterdaysMeal = await waistline.Meals.getYesterdaysMeal(category);

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

      if (category !== false) {

        // Get yesterdays dateTime
        /*  let now = new Date();
          let yesterday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
          yesterday.setUTCHours(yesterday.getUTCHours() - 24);

          const mealNames = waistline.Settings.get("diary", "meal-names");

          let result = {
            items: [],
            nutrition: {},
            name: "Yesterday's " + mealNames[category]
          };

          let diaryEntry = await waistline.Diary.getItemsFromDB(yesterday, category);

          if (diaryEntry) {
            diaryEntry.forEach((x) => {
              let item = x;
              item.id = x.foodId;
              delete item.foodId;
              delete item.category;
              result.items.push(item);
            });
          }
          resolve(result);*/
      }
      resolve(false);
    }).catch(err => {
      throw (err);
    });
  },

  deleteMeal: function(item) {
    let title = waistline.strings["confirm-delete-title"] || "Delete";
    let text = waistline.strings["confirm-delete"] || "Are you sure?";

    let dialog = f7.dialog.confirm(text, title, async () => {
      let request = dbHandler.deleteItem(item.id, "meals");

      request.onsuccess = function(e) {
        f7.views.main.router.refreshPage();
      };
    });
  },

  submitButtonAction: function(selection) {
    let result = [];

    selection.forEach((x) => {
      let item = JSON.parse(x);
      item.foods.forEach((f) => {
        result.push(f);
      });
    });

    waistline.FoodsMealsRecipes.returnItems(result);
  },

  gotoEditor: function(meal) {
    f7.data.context = {
      meal: meal,
      origin: "/foods-meals-recipes/",
      allNutriments: true
    };

    f7.views.main.router.navigate("./meal-editor/");
  },

  createSearchBar: function() {
    const searchBar = f7.searchbar.create({
      el: ".searchbar",
      backdrop: false,
      customSearch: true,
      on: {
        search(sb, query, previousQuery) {
          if (query != "") {
            s.list = waistline.FoodsMealsRecipes.filterList(query, s.filterList);
            waistline.Meals.renderList(true);
          } else {
            f7.searchbar.disable(this);
          }
        },
        async disable(searchbar, previousQuery) {
          waistline.Meals.unselectCheckedItems();
          s.list = await waistline.Meals.getListFromDB();
          s.filterList = s.list;
          waistline.Meals.renderList(true);
        }
      }
    });
  },

  unselectCheckedItems: function() {

    //Remove any selected search items from the selection array
    const checked = Array.from(document.querySelectorAll('input[type=checkbox]:checked'));

    checked.forEach((x, i) => {
      let itemIndex = s.selection.indexOf(x.data);
      if (itemIndex != -1)
        s.selection.splice(itemIndex, 1);
    });

    this.updateSelectionCount();
  },

  updateSelectionCount: function() {
    if (!s.selection.length) {
      s.el.scan.style.display = "block";
      s.el.submit.style.display = "none";
      s.el.title.innerHTML = "Meals";
    } else {
      s.el.scan.style.display = "none";
      s.el.submit.style.display = "block";
      s.el.title.innerHTML = s.selection.length + " Selected";
    }
  }
};

document.addEventListener("tab:init", function(e) {
  if (e.target.id == "meals") {
    let context = f7.views.main.router.currentRoute.context;
    waistline.Meals.init(context);
  }
});