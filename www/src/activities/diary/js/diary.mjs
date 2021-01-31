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
import * as Group from "./group.js";
import * as Editor from "/www/src/activities/foods-meals-recipes/js/food-editor.js";

var s;
waistline.Diary = {

  settings: {
    ready: false,
    calendar: undefined,
    el: {}
  },

  init: async function(context) {
    s = this.settings; //Assign settings object

    this.getComponents();
    this.bindUIActions();

    s.calendar = this.createCalendar(); //Setup calendar
    this.bindCalendarControls();

    //If items have been passed, add them to the db
    if (context) {

      if (context.items || context.item) {

        if (context.items)
          await this.addItems(context.items, context.category);
        else
          await this.updateItem(context.item);

        s.ready = false; //Trigger fresh render
      }
    }

    if (!s.ready) {
      s.groups = this.createMealGroups(); //Create meal groups
      this.render();
      s.ready = true;
    }
  },

  getComponents: function() {
    s.el.logWeight = document.querySelector(".page[data-name='diary'] #log-weight");
  },

  bindUIActions: function() {

    // logWeight
    if (!s.el.logWeight.hasClickEvent) {
      s.el.logWeight.addEventListener("click", (e) => {
        waistline.Diary.logWeight();
      });
      s.el.logWeight.hasClickEvent = true;
    }

  },

  setReadyState: function(state) {
    if (state) {
      s.ready = state;
    }
  },

  createCalendar: function() {

    //Setup calendar object
    let result = f7.calendar.create({
      inputEl: "#diary-date",
      openIn: "customModal",
      on: {
        init: function(c) {
          if (s.date)
            c.setValue([s.date]);
          else {
            let now = new Date();
            let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            c.setValue([today]);
            s.date = c.getValue();
          }
        },
        change: function(c) {
          s.date = c.getValue();
          if (s.ready)
            waistline.Diary.render();
          c.close();
        }
      }
    });

    return result;
  },

  bindCalendarControls: function() {
    //Bind actions for previous/next buttons
    const buttons = document.getElementsByClassName("change-date");
    Array.from(buttons).forEach((x, i) => {

      if (!x.hasClickEvent) {
        x.addEventListener("click", (e) => {
          let date = new Date(s.calendar.getValue());
          i == 0 ? date.setDate(date.getDate() - 1) : date.setDate(date.getDate() + 1);
          s.calendar.setValue([date]);
        });
        x.hasClickEvent = true;
      }
    });
  },

  resetDate: function() {
    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    s.date = today;
  },

  render: async function() {

    let entry = await this.getEntryFromDB(); // Get diary entry from DB
    let totalNutrition;

    //Clear groups
    for (let i = 0; i < s.groups.length; i++)
      s.groups[i].reset();

    // Populate groups and get overal nutrition
    if (entry) {
      await this.populateGroups(entry);
      totalNutrition = await waistline.FoodsMealsRecipes.getTotalNutrition(entry.items);
    }

    // Render category groups
    let container = document.getElementById("diary-day");
    container.innerHTML = "";

    s.groups.forEach((x) => {
      x.render(container);
    });

    // Render nutrition swiper card
    let swiper = f7.swiper.get('#diary-nutrition .swiper-container');
    let swiperWrapper = document.querySelector('#diary-nutrition .swiper-wrapper');
    swiperWrapper.innerHTML = "";

    await waistline.FoodsMealsRecipes.renderNutritionCard(totalNutrition, new Date(s.date), swiper);
  },

  createMealGroups: function() {
    const mealNames = waistline.Settings.get("diary", "meal-names");
    let groups = [];

    mealNames.forEach((x, i) => {
      if (x != "") {
        let g = Group.create(x, i);
        groups.push(g);
      }
    });

    return groups;
  },

  getEntryFromDB: function() {
    return new Promise(async function(resolve, reject) {
      if (s.date !== undefined) {
        let entry = await dbHandler.get("diary", "dateTime", new Date(s.date));
        resolve(entry);
      }
    }).catch(err => {
      throw (err);
    });
  },

  getNewEntry: function() {
    let entry = {
      dateTime: new Date(s.date),
      items: [],
      stats: {},
    };
    return entry;
  },

  populateGroups: function(entry) {
    return new Promise(async function(resolve, reject) {

      // Get details and nutritional data for each food
      entry.items.forEach(async (x, i) => {
        let item = x;

        if (x.id !== undefined)
          item = await waistline.FoodsMealsRecipes.getItem(x.id, x.portion, x.quantity);

        item.type = x.type;
        item.category = x.category;
        item.index = i; // Index in array, not stored in DB
        s.groups[x.category].addItem(item);
      });
      resolve();
    }).catch(err => {
      throw (err);
    });
  },

  addItems: function(items, category) {
    return new Promise(async function(resolve, reject) {

      // Get current entry or create a new one
      let entry = await waistline.Diary.getEntryFromDB() || waistline.Diary.getNewEntry();

      items.forEach((x) => {
        let item = {};

        item.category = category;
        item.type = x.type || "food";

        if (x.id) item.id = x.id;
        if (x.name) item.name = x.name;
        if (x.portion !== undefined) item.portion = x.portion;
        if (x.quantity !== undefined) item.quantity = x.quantity || 1;
        if (x.nutrition) item.nutrition = x.nutrition;

        entry.items.push(item);
      });

      await dbHandler.put(entry, "diary");

      resolve();
    }).catch(err => {
      throw (err);
    });
  },

  updateItem: function(data) {
    return new Promise(async function(resolve, reject) {

      let entry = await waistline.Diary.getEntryFromDB();

      if (entry) {
        let item = {
          id: data.id,
          category: parseInt(data.category),
          portion: data.portion,
          quantity: parseFloat(data.quantity) || 1,
          type: data.type
        };

        entry.items.splice(data.index, 1, item);

        dbHandler.put(entry, "diary").onsuccess = function() {
          resolve();
        };
      } else {
        resolve();
      }
    }).catch(err => {
      throw (err);
    });
  },

  deleteItem: function(item) {
    let title = waistline.strings["confirm-delete-title"] || "Delete";
    let text = waistline.strings["confirm-delete"] || "Are you sure?";

    let dialog = f7.dialog.confirm(text, title, async () => {

      let entry = await waistline.Diary.getEntryFromDB();

      if (entry !== undefined)
        entry.items.splice(item.index, 1);

      dbHandler.put(entry, "diary").onsuccess = function(e) {
        f7.views.main.router.refreshPage();
      };
    });
  },

  quickAdd: function(category) {
    let title = waistline.strings["quick-add"] || "Quick Add";
    let text = waistline.strings["calories"] || "Calories";

    let dialog = f7.dialog.prompt(text, title, async function(value) {
      let entry = await waistline.Diary.getEntryFromDB() || waistline.Diary.getNewEntry();

      let energy = parseInt(value);

      if (!isNaN(energy)) {

        let energyUnit = waistline.Settings.get("nutrition", "energy-unit");

        if (energyUnit == "kJ")
          energy = Math.round(energy / 4.1868); // Convert kJ to kcal

        let food = {
          name: "Quick Add",
          type: "quick-add",
          category: category,
          nutrition: {
            calories: energy
          }
        };

        entry.items.push(food);

        dbHandler.put(entry, "diary").onsuccess = function(e) {
          f7.views.main.router.refreshPage();
        };
      }
    });
  },

  logWeight: function() {
    let title = waistline.strings["record-weight"] || "Record Weight";
    let text = waistline.strings["weight"] || "Weight";
    let lastWeight = window.localStorage.getItem("weight") || 0;

    let dialog = f7.dialog.prompt(text, title, this.setWeight, null, lastWeight);
  },

  setWeight: async function(value) {

    let entry = await waistline.Diary.getEntryFromDB() || waistline.Diary.getNewEntry();

    entry.stats.weight = {
      value: value,
      unit: "kg"
    };

    dbHandler.put(entry, "diary").onsuccess = function(e) {
      window.localStorage.setItem("weight", value);
      Utils.toast("Saved");
    };
  },

  gotoFoodlist: function(category) {
    f7.views.main.router.navigate("/foods-meals-recipes/", {
      "context": {
        origin: "/diary/",
        category: category,
        date: new Date(s.calendar.getValue())
      }
    });
  },
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='diary']")) {
    let context = f7.data.context;
    f7.data.context = undefined;
    waistline.Diary.init(context);
  }
});

document.addEventListener("page:reinit", function(event) {
  if (event.target.matches(".page[data-name='diary']")) {
    let context = f7.data.context;
    f7.data.context = undefined;
    waistline.Diary.init(context);
  }
});