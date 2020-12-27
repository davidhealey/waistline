/*
  Copyright 2018, 2019 David Healey

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

/*jshint -W083 */

const diary = {

  data: undefined,
  currentCategory: undefined,
  currentDate: undefined,

  initialize: function() {

    return new Promise(function(resolve, reject) {

      //Initialize date picker
      diary.calendar = f7.calendar.create({
        inputEl: "#diary-date",
        openIn: "customModal",
        on: {
          "init": function(c) {

            if (diary.currentDate == undefined) {
              let now = new Date();
              let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

              if (c.getValue() == undefined)
                c.setValue([today]);

              diary.currentDate = c.getValue()[0];
            } else {
              c.setValue([diary.currentDate]);
            }
            diary.initializeCalendarButtons(c);
          },
          "change": function(c) {
            diary.currentDate = c.getValue()[0];
            diary.currentCategory = undefined;
            diary.loadDiary();
            c.close();
          }
        }
      });

      resolve();
    });
  },

  initializeCalendarButtons: function(calendar) {
    /*  //Previous/Next date buttons
      const btnDate = document.getElementsByClassName("change-date");

      Array.from(btnDate).forEach(function(element) {
        element.addEventListener("click", function(event) {

          let d = new Date(diary.currentDate);

          if (this == btnDate[0])
            d.setDate(d.getDate() - 1);
          else
            d.setDate(d.getDate() + 1);

          calendar.setValue([d]);

          //document.querySelector('#diary #log-weight').setAttribute("dateTime", diary.date);
        });
      });*/
  },

  getDate: function() {

    if (diary.calendar && diary.calendar.getValue() !== undefined)
      return diary.currentDate;
    else {
      let now = new Date();
      return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
    }
  },

  getCategory: function() {
    return diary.currentCategory;
  },

  getEntriesFromDB: function(date) {
    return new Promise(function(resolve, reject) {

      let from = new Date(date);
      let to = new Date(from);
      to.setUTCHours(to.getUTCHours() + 24);

      var data = {
        "entries": [],
        "nutrition": {},
        "nutritionTotals": {}
      };

      //Diary entries and nutrition
      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.bound(from, to, false, true)).onsuccess = function(e) {
        let cursor = e.target.result;

        if (cursor) {
          let item = cursor.value;

          //Diary food entries
          data.entries[item.category] = data.entries[item.category] || []; //Organize by category ID
          data.entries[item.category].push(item);

          //Nutrition
          data.nutrition[item.category] = data.nutrition[item.category] || {}; //Nutrition per category

          for (let n in item.nutrition) {

            data.nutrition[item.category][n] = data.nutrition[item.category][n] || 0;
            data.nutrition[item.category][n] += item.nutrition[n] * item.quantity;

            //Nutrition totals
            data.nutritionTotals[n] = data.nutritionTotals[n] || 0;
            data.nutritionTotals[n] += Number(item.nutrition[n]);
          }

          cursor.continue();
        } else {
          resolve(data);
        }
      };
    });
  },

  render: function() {
    const mealNames = settings.get("diary", "meal-names");
    const entries = diary.data.entries; //Diary food entries
    const nutrition = diary.data.nutrition; //Nutrition by category
    const totals = diary.data.nutritionTotals; //Nutrition totals
    const lists = [];

    const container = document.getElementById("diary-day");
    container.innerHTML = "";

    //Setup lists for each category - one per meal
    for (let i = 0; i < mealNames.length; i++) {

      if (mealNames[i] == "") continue;

      let list = document.createElement("div");
      list.className = "list card card-outline";

      container.appendChild(list);

      let ul = document.createElement("ul");

      list.appendChild(ul);

      //Collapsable list item
      let li = document.createElement("li");
      li.className = "accordion-item";

      //Auto expand list if setting is true or current category is i
      if (nutrition[i] != undefined) {
        if (settings.get("diary", "expand-meals") == true || i == diary.currentCategory)
          li.classList.add("accordion-item-opened");
      }

      ul.appendChild(li);

      let a = document.createElement("a");
      a.className = "item-link item-content";
      a.innerHTML = "<div class='item-inner'><div class='item-title'>" + mealNames[i] + "</div></div>";

      li.appendChild(a);

      let content = document.createElement("div");
      content.className = "accordion-item-content";

      lists[i] = content; //Expanded content list

      li.appendChild(content);

      //List footer
      let ft = document.createElement("li");

      ul.appendChild(ft);

      let row = document.createElement("div");
      row.className = "row item-content";

      ft.appendChild(row);

      //Add food button
      let left = document.createElement("div");
      left.className = "col-10 add-button";
      left.setAttribute("category", i);

      let button = document.createElement("button");
      button.className = "button button-md add-button disable-long-tap";

      left.appendChild(button);

      let icon = document.createElement("i");
      icon.className = "fas fa-plus";

      button.appendChild(icon);

      left.addEventListener("click", function(e) {
        diary.currentCategory = this.getAttribute("category");
        f7.views.main.router.navigate("/foods-meals-recipes/", {
          "context": {
            "origin": "/diary/"
          }
        });
      });

      left.addEventListener("taphold", function(e) {
        diary.quickAdd(this.getAttribute("category"));
      });

      row.appendChild(left);

      //Calorie count
      let right = document.createElement("div");
      right.className = "col-25 calorie-count";

      if (nutrition[i] != undefined)
        right.innerHTML = parseInt(nutrition[i].calories) + " Cal";
      else
        right.innerHTML = "0 Cal";

      row.appendChild(right);
    }

    //Render entries
    for (let category in entries) {

      if (mealNames[category] == "") continue;

      //List for each category card
      let div = document.createElement("div");
      div.className = "list";

      let ul = document.createElement("ul");

      div.appendChild(ul);

      for (let i = 0; i < entries[category].length; i++) {

        let entry = entries[category][i];

        let li = document.createElement("li");
        li.id = entry.id;
        if (entry.foodId) li.setAttribute("foodId", entry.foodId);
        if (entry.recipeId) li.setAttribute("recipeId", entry.recipeId);
        li.className = "item-content entry disable-long-tap ripple";
        li.setAttribute("data", JSON.stringify(entry));
        li.addEventListener("taphold", function(e) {
          diary.deleteItem(li);
        });
        li.addEventListener("click", function(e) {
          f7.views.main.router.navigate("/diary/edit/", {
            "context": {
              "itemId": entry.id
            }
          });
        });

        ul.appendChild(li);

        let content = document.createElement("div");
        content.className = "item-inner item-cell";

        li.appendChild(content);

        //Item name
        let nameRow = document.createElement("div");
        nameRow.className = "item-row";

        content.appendChild(nameRow);

        let name = document.createElement("div");
        name.className = "item-cell diary-entry-name";
        name.innerHTML = foodsMealsRecipes.formatItemText(entry.name, 30);

        nameRow.appendChild(name);

        //Item brand
        if (entry.brand && entry.brand != "") {
          let brandRow = document.createElement("div");
          brandRow.className = "item-row";

          content.appendChild(brandRow);

          let brand = document.createElement("div");
          brand.className = "item-cell diary-entry-brand";
          brand.innerHTML = foodsMealsRecipes.formatItemText(entry.brand, 20).italics();

          brandRow.appendChild(brand);
        }

        //Item calorie count
        let infoRow = document.createElement("div");
        infoRow.className = "item-row";

        content.appendChild(infoRow);

        let info = document.createElement("div");
        info.className = "item-cell diary-entry-info";

        if (entry.portion != undefined && entry.portion != "" && entry.portion.indexOf("NaN") == -1)
          info.innerText = entry.portion + ", " + parseInt(entry.nutrition.calories * entry.quantity) + " Calories";
        else
          info.innerText = parseInt(entry.nutrition.calories * entry.quantity) + " Calories";

        infoRow.appendChild(info);

        //Timestamp
        if (settings.get("diary", "show-timestamps") == true) {
          let timestampRow = document.createElement("div");
          timestampRow.className = "item-row";

          content.appendChild(timestampRow);

          let timestamp = document.createElement("div");
          timestamp.className = "item-cell diary-entry-info";
          timestamp.innerHTML = entry.dateTime.toLocaleString();
          timestampRow.appendChild(timestamp);
        }

        lists[category].appendChild(div);
      }
    }
  },

  renderNutrition: function() {

    //Gather data
    let date = diary.currentDate;
    let entries = document.getElementsByClassName('entry'); //Get all entries from DOM
    let nutrition = diary.data.nutrition; //nutritionData.byCategory;
    let totals = diary.data.nutritionTotals; //nutritionData.totals;
    let goalData = goals.getGoalsByDate(date);

    //Render total nutrition / goals
    let rows = [];
    let swiper = f7.swiper.get('#diary-nutrition .swiper-container');
    let swiperWrapper = document.querySelector('#diary-nutrition .swiper-wrapper');
    swiperWrapper.innerHTML = "";

    goalData.forEach((x, i) => {
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
          if (goals.isGoalWeekly(x.name))
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
  },

  //Get diary entries for current date and render
  loadDiary: function() {
    if (diary.calendar) {
      return new Promise(async function(resolve, reject) {
        diary.data = await diary.getEntriesFromDB(diary.currentDate);
        //diary.render();
        //diary.renderNutrition();
        resolve();
      });
    }
  },

  deleteItem: function(item) {

    let data = JSON.parse(item.attributes.data.value);
    let title = waistline.strings["confirm-delete-title"] || "Delete";
    let msg = waistline.strings["confirm-delete"] || "Are you sure?";
    let dialog = f7.dialog.confirm(msg, title, () => {

      //Remove from the db
      let request = dbHandler.deleteItem(parseInt(data.id), "diary");

      //If the request was successful remove the list item
      request.onsuccess = async function(e) {
        diary.currentCategory = data.category;
        await diary.loadDiary();
        //updateLog();
      };
    });
  },

  //Bulk Insert/Update
  pushItemsToDB: function(items) {
    return new Promise(function(resolve, reject) {

      const mealNames = settings.get("diary", "meal-names");

      //Meal category names
      for (let i = 0; i < items.length; i++) {
        items[i].dateTime = diary.currentDate;
        items[i].category = items[i].category || diary.currentCategory;
        items[i].category_name = mealNames[items[i].category];
        items[i].quantity = 1;

        //If there is no food id set, use the item's ID as the food id
        if (items[i].foodId == undefined && items[i].id) {
          items[i].foodId = items[i].id;
          delete items[i].id;
        }

        //Temp
        items[i].category = 0;
        items[i].category_name = "breakfast";

        if (items[i].category == undefined) {
          delete items[i];
          console.log("Category is undefined");
        }
      }

      //Insert the items
      dbHandler.bulkInsert(items, "diary").then(resolve());
    });
  },

  quickAdd: function(category) {

    let dialog = f7.dialog.create({
      title: "Quick Add",
      text: "Calories",
      content: '<div id="quick-add" class="dialog-input-field item-input"><div class="item-input-wrap"><input type="number" class="dialog-input"></div></div>',
      buttons: [{
          text: "Cancel",
          keyCodes: [27],
          close: true
        },
        {
          text: "Ok",
          bold: true,
          keyCodes: [13]
        }
      ],
      onClick(dialog, index) {
        const inputValue = document.querySelector('#quick-add .dialog-input').value;
        if (index === 1 && callbackOk) callbackOk("Quick Add", inputValue);
      },
      destroyOnClose: true,
    }).open();

    function callbackOk(name, value) {

      let data = {
        "name": name,
        "category": category,
        "portion": "",
        "nutrition": {
          "calories": parseInt(value)
        }
      }; //Set up object to insert into diary

      //Add to diary
      diary.pushItemsToDB([data])
        .then(function() {
          diary.loadDiary() //Refresh display
            .then(function() {
              diary.updateLog();
            });
        });
    }
  },

  updateLog: function() {
    log.update(diary.date, {
      "nutrition": diary.data.nutritionTotals
    }); //Update the log
  },

  //Return all the items in a category from the specified date
  getEntries: function(dateTime, category) {
    return new Promise(function(resolve, reject) {
      let entries = [];

      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.only(dateTime)).onsuccess = function(e) { //Filter by date
        var cursor = e.target.result;
        if (cursor) {
          if (cursor.value.category == category) //Filter by category
            entries.push(cursor.value);
          cursor.continue();
        } else
          resolve(entries);
      };
    });
  },

  initializeSettings: function() {
    //Meal names
    if (JSON.parse(window.localStorage.getItem("meal-names") == undefined))
      settings.put("diary", "meal-names", ["Breakfast", "Lunch", "Dinner", "Snacks"]);
  }
};

//Page initialization
document.addEventListener("page:init", async function(event) {
  if (event.target.matches(".page[data-name='diary']") && f7.views.main.router.currentRoute.name == "Diary") {

    await diary.initialize();

    //If data passed from foodlist
    if (f7.views.main.router.currentRoute.context) {
      let items = f7.views.main.router.currentRoute.context.items;
      let category = f7.views.main.router.currentRoute.context.category;

      //Update current category if passed with data
      if (category) diary.currentCategory = category;
      await diary.pushItemsToDB(items);
    }

    diary.loadDiary();
  }
});