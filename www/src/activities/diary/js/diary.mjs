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

import * as Group from "./group.js";
import * as Editor from "/www/src/activities/foods-meals-recipes/js/food-editor.js";

var s;
waistline.Diary = {

  settings: {
    ready: false,
    calendar: undefined
  },

  init: async function(context) {
    s = this.settings; //Assign settings object

    //If items have been passed, add them to the db
    if (context) {
      if (context.items || context.item) {
        this.resetDate();
        if (context.items)
          await this.addItems(context.items, context.category);
        else
          await this.updateItem(context.item);

        s.ready = false; //Trigger fresh render
      }
    }

    s.calendar = this.createCalendar(); //Setup calendar
    this.bindCalendarControls();

    if (!s.ready) {
      s.groups = this.createMealGroups(); //Create meal groups
      this.render();
      s.ready = true;
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

  resetDate: function() {
    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    s.date = today;
  },

  bindCalendarControls: function() {
    //Bind actions for previous/next buttons
    const buttons = document.getElementsByClassName("change-date");
    Array.from(buttons).forEach((x, i) => {
      x.addEventListener("click", (e) => {
        let date = new Date(s.calendar.getValue());
        i == 0 ? date.setDate(date.getDate() - 1) : date.setDate(date.getDate() + 1);
        s.calendar.setValue([date]);
      });
    });
  },

  render: async function() {

    await this.populateGroups(); //Gets items from db

    let container = document.getElementById("diary-day");
    container.innerHTML = "";

    //Render each group
    s.groups.forEach((x) => {
      x.render(container);
    });

    this.renderStatus();
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

  populateGroups: function() {
    return new Promise(function(resolve, reject) {

      if (s.date != undefined) {

        let from = new Date(s.date);
        let to = new Date(from);
        to.setUTCHours(to.getUTCHours() + 24);

        //Clear groups' items and nutrition
        for (let i = 0; i < s.groups.length; i++)
          s.groups[i].reset();

        dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.bound(from, to, false, true)).onsuccess = function(e) {
          let cursor = e.target.result;

          if (cursor) {
            let item = cursor.value;

            s.groups[item.category].addItem(item);
            cursor.continue();
          } else {
            resolve();
          }
        };
      }
    }).catch(err => {
      throw (err);
    });
  },

  getItemsFromDB: function(dateTime, category) {
    return new Promise(function(resolve, reject) {
      let result = [];

      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.only(dateTime)).onsuccess = function(e) { //Filter by date
        var cursor = e.target.result;
        if (cursor) {
          if (cursor.value.category == category) //Filter by category
            result.push(cursor.value);
          cursor.continue();
        } else
          resolve(result);
      };
    });
  },

  addItems: function(items, category) {
    return new Promise(async function(resolve, reject) {

      let data = items;
      const mealNames = waistline.Settings.get("diary", "meal-names");

      data.forEach((x, i) => {
        x.dateTime = s.date;
        x.category = category;

        //If there is no foodId then ID must be the ID from the foodlist so use that
        if (x.foodId == undefined && x.id) {
          x.foodId = x.id;
          delete x.id; //Item will be assigned an ID when added to DB
        }
      });

      await dbHandler.bulkInsert(data, "diary");
      resolve();
    }).catch(err => {
      throw (err);
    });
  },

  updateItem: function(item) {
    return new Promise(function(resolve, reject) {
      console.log(item);
      dbHandler.put(item, "diary").onsuccess = function() {
        resolve();
      };
    }).catch(err => {
      throw (err);
    });
  },

  deleteItem: function(item) {
    let title = waistline.strings["confirm-delete-title"] || "Delete";
    let msg = waistline.strings["confirm-delete"] || "Are you sure?";

    let dialog = f7.dialog.confirm(msg, title, () => {

      let request = dbHandler.deleteItem(item.id, "diary");

      //If the request was successful remove the list item
      request.onsuccess = function(e) {
        f7.views.main.router.refreshPage();
        //updateLog();
      };
    });
  },

  gotoFoodlist: function(category) {
    f7.views.main.router.navigate("/foods-meals-recipes/", {
      "context": {
        origin: "/diary/",
        category: category
      }
    });
  },

  gotoEditor: function(item) {
    f7.views.main.router.navigate("/foods-meals-recipes/food-editor/", {
      "context": {
        item: item,
        origin: "/diary/"
      }
    });
  },

  /* Sum the nutrition values for all groups */
  getNutritionTotals: function() {
    let result = {};
    s.groups.forEach((x, i) => {
      for (let k in x.nutrition) {
        result[k] = result[k] || 0;
        result[k] += x.nutrition[k];
      }
    });
    return result;
  },

  /* Displays nutrition status across top of dairy */
  renderStatus: function() {
    if (s.calendar != undefined) {
      let date = new Date(s.calendar.getValue());

      let totals = this.getNutritionTotals();
      let goals = waistline.Goals.getGoalsByDate(date);

      let rows = [];
      let swiper = f7.swiper.get('#diary-nutrition .swiper-container');
      let swiperWrapper = document.querySelector('#diary-nutrition .swiper-wrapper');
      swiperWrapper.innerHTML = "";

      goals.forEach((x, i) => {
        if (x.diaryDisplay && x.name !== "weight") {

          //Show 3 nutriments at a time
          if (i % 3 == 0) {

            let slide = document.createElement("div");
            slide.className = "swiper-slide";
            swiper.appendSlide(slide);

            rows[0] = document.createElement("div");
            rows[0].className = "row nutrition-total-values";
            slide.appendChild(rows[0]);

            rows[1] = document.createElement("div");
            rows[1].className = "row nutrition-total-title";
            slide.appendChild(rows[1]);

            //Get daily value for weekly goal
            if (x.weekly)
              x.target = goals.getWeeklyGoal(x.name) / 7;
          }

          let values = document.createElement("div");
          values.className = "col";
          values.id = x.name + "-value";

          //Value/goal text
          let span = document.createElement("span");
          let t = document.createTextNode("");

          if (totals[x.name] != undefined) {
            if (x.name != "calories")
              t.nodeValue = parseFloat(totals[x.name].toFixed(2)) + "/" + parseFloat(x.target.toFixed(2));
            else
              t.nodeValue = parseInt(totals[x.name]) + "/" + parseInt(x.target);
          } else
            t.nodeValue = "0/" + parseFloat(x.target.toFixed(2));

          span.appendChild(t);

          //Colour value text
          totals[x.name] > x.target ? span.style.color = "red" : span.style.color = "green";

          values.appendChild(span);
          rows[0].appendChild(values);

          //Title
          let title = document.createElement("div");
          title.className = "col";
          title.id = x.name + "-title";

          let text = waistline.strings[x.name] || x.name; //Localize name
          t = document.createTextNode((text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " "));
          title.appendChild(t);
          rows[1].appendChild(title);
        }
      });
    }
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='diary']")) {
    let context = f7.views.main.router.currentRoute.context;
    waistline.Diary.init(context);
  }
});