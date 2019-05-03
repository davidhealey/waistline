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

var diary = {

  initialize: function() {

    this.page = document.querySelector('ons-page#diary');
    this.data = {};
    this.currentCategory = 0;
    var now = new Date();
    this.date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    console.log("Diary Initialized");
  },

  changeDay: function(date) {
    var previousDate = diary.date;
    diary.date = date;

  },

  getDailyGoals:function()
  {
    const goals = JSON.parse(window.localStorage.getItem("goals"));
    let data = {};

    for (let item in goals) {
      if (item == "weight") continue;
      data[item] = goals[item][diary.date.getDay()];
    }
    return data;
  },

  getEntriesFromDB: function(date)
  {
    return new Promise(function(resolve, reject){

      let to = new Date(date);
      to.setUTCHours(to.getUTCHours()+24);
      diary.getDailyGoals();
      var data = {"entries":{}, "nutrition":{}, "nutritionTotals":{}};

      //Diary entries and nutrition
      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.bound(date, to, false, true)).onsuccess = function(e)
      {
        let cursor = e.target.result;

        if (cursor)
        {
          let item = cursor.value;

          //Diary food entries
          data.entries[item.category] = data.entries[item.category] || []; //Organize by category ID
          data.entries[item.category].push(item);

          //Nutrition
          data.nutrition[item.category] = data.nutrition[item.category] || {}; //Nutrition per category

          for (let nutriment in item.nutrition) {

            data.nutrition[item.category][nutriment] = data.nutrition[item.category][nutriment] || 0;
            data.nutrition[item.category][nutriment] += item.nutrition[nutriment];

            //Nutrition totals
            data.nutritionTotals[nutriment] = data.nutritionTotals[nutriment] || 0;
            data.nutritionTotals[nutriment] += item.nutrition[nutriment];
          }

          cursor.continue();
        }
        else {
          resolve(data);
        }
      };
    });
  },

  render: function()
  {
    const entries = diary.data.entries; //Diary food entries
    const nutrition = diary.data.nutrition; //Nutritional nutrition by category
    const totals = diary.data.nutritionTotals; //Nutrition totals
    const goals = diary.data.goals;
    const cards = [];
    const lists = [];

    const container = document.getElementById("diary-day");
    container.innerHTML = "";

    //Setup meal cards for carousel item
    const mealNames = JSON.parse(window.localStorage.getItem("meal-names"));

    for (let i = 0; i < mealNames.length; i++) {

      if (mealNames[i] == "") continue;

      //One card per meal - breakfast, lunch, dinner, etc.
      cards[i] = document.createElement("ons-card");

      //One expandable list per card
      let ul = document.createElement("ons-list");
      let li = document.createElement("ons-list-item");
      li.setAttribute("expandable", "");
      li.setAttribute("category", i);
      li.className = "meal-heading";
      li.addEventListener("doubletap", this.goToFoodList);

      let span = document.createElement("span"); //Populated by renderNutrition function
      span.className = "header-text";
      li.appendChild(span);

      //Gesture detector
      let gd = document.createElement("ons-gesture-detector");
      gd.appendChild(li);

      //Expandable content holder
      let content = document.createElement("div");
      content.className = "expandable-content";

      //The expanded list that will contain diary entries
      let innerUl = document.createElement("ons-list");
      content.appendChild(innerUl);
      lists[i] = innerUl; //Expanded content list

      li.appendChild(content);
      ul.appendChild(li);
      cards[i].appendChild(ul); //Attach list to card
      container.appendChild(cards[i]); //Attach card to carousel item
    }

    //Render entries
    for (let category in entries) {

      //List for each category card
      var ul = document.createElement("ons-list");
      ul.id = mealNames[category] + "-list";
      cards[category].appendChild(ul);

      //Render entries
      for (let i = 0; i < entries[category].length; i++) {
        let entry = entries[category][i];

        let li = document.createElement("ons-list-item");
        li.id = "entry-" + entry.id;
        li.className = "entry";
        li.setAttribute("data", JSON.stringify(entry));

        //Gesture detector
        let gd = document.createElement("ons-gesture-detector");
        gd.appendChild(li);

        let name = document.createElement("ons-row");
        name.className = "diary-entry-name";
        name.innerText = unescape(entry.name);
        li.appendChild(name);
        li.addEventListener("hold", this.deleteItem);

        if (entry.brand != "") {
          let brand = document.createElement("ons-row");
          brand.className = "diary-entry-brand";
          brand.innerHTML = unescape(entry.brand).italics();
          li.appendChild(brand);
        }

        let info = document.createElement("ons-row");
        info.className = "diary-entry-info";
        info.innerText = entry.portion + ", " + entry.nutrition.calories + " Calories";
        li.appendChild(info);

        lists[category].appendChild(li);
      }
    }
  },

  renderNutrition: function() {

    //Gather data from DOM
    let entries = document.getElementsByClassName('entry'); //Get all entries
    let nutrition = {};
    let totals = {};
    let goals = this.getDailyGoals();

    for (let i = 0; i < entries.length; i++) {
      let item = JSON.parse(entries[i].getAttribute("data")); //Get data object for each entry

      nutrition[item.category] = nutrition[item.category] || {}; //Nutrition per category

      for (let nutriment in item.nutrition) {
        nutrition[item.category][nutriment] = nutrition[item.category][nutriment] || 0;
        nutrition[item.category][nutriment] += item.nutrition[nutriment];

        //Nutrition totals
        totals[nutriment] = totals[nutriment] || 0;
        totals[nutriment] += item.nutrition[nutriment];
      }
    }

    //Render category calorie count
    const mealNames = JSON.parse(window.localStorage.getItem("meal-names"));
    const headings = document.querySelectorAll('.meal-heading[category]'); //Category heading list items

    for (let i = 0; i < headings.length; i++) {
      let category = headings[i].getAttribute("category");
      let calories = 0; //Per category calorie count
      if (nutrition[category]) calories = nutrition[category].calories;

      //Set category heading text
      let headingText = headings[i].getElementsByClassName("header-text")[0];
      headingText.innerText = mealNames[category] + " - " + calories;

      if (calories > 0) headings[i].showExpansion(); //Expand lists that have entires*/
    }

    //Render total nutrition / goals
    let count = 0;
    let carouselItem;
    let rows = [];
    let carousel = document.createElement("ons-carousel");
    carousel.id = "nutrition-carousel";
    carousel.setAttribute("swipeable", "");
    carousel.setAttribute("auto-scroll", "");

    let nutritionContainer = document.getElementById("diary-nutrition");
    nutritionContainer.firstChild.remove();
    nutritionContainer.appendChild(carousel);

    for (let nutriment in goals) {
      if (count % 3 == 0) { //Every third nutriment gets a new carousel item
        carouselItem = document.createElement("ons-carousel-item");
        rows[0] = document.createElement("ons-row");
        rows[0].className = "nutrition-total-values";
        rows[1] = document.createElement("ons-row");
        rows[1].className = "nutrition-total-title";
        carouselItem.appendChild(rows[0]);
        carouselItem.appendChild(rows[1]);
        carousel.appendChild(carouselItem);
      }

      let col = document.createElement("ons-col");
      col.id = nutriment + "-value";

      //Value/goals text
      let t = document.createTextNode("");
      if (totals[nutriment] != undefined)
        t.nodeValue = parseFloat(totals[nutriment].toFixed(2)) + "/" + goals[nutriment];
      else
        t.nodeValue = "0/" + goals[nutriment];

      col.appendChild(t);
      rows[0].appendChild(col);

      col = document.createElement("ons-col");
      col.id = nutriment + "-title";
      let tt = document.createTextNode(nutriment);
      col.appendChild(tt);
      rows[1].appendChild(col);

      count++;
    }
  },

  goToFoodList: function(e) {
    diary.currentCategory = this.getAttribute("category");
    nav.pushPage("src/activities/foodlist/views/foodlist.html"); //Go to the food list page
  },

  loadDiary: function() {
    //Update date display
    this.page.querySelector('#date-picker').value = diary.date; //Update displayed date

    //Get diary entries for date and render
    diary.getEntriesFromDB(diary.date)
    .then(function(data){
      diary.data = data;
      diary.render();
      diary.renderNutrition();
    });
  },

  deleteItem: function() {

    let id = this.id;

    ons.notification.confirm("Delete this item?")
    .then(function(input) {
      if (input == 1) {//Delete was confirmed

        let request = dbHandler.deleteItem(parseInt(id.replace(/[^0-9.]+/g, '')), "diary");

        //If the request was successful remove the list item
        request.onsuccess = function(e) {
          let child = document.querySelector('#diary-day #' + id);
          let parent = child.parentElement;
          parent.removeChild(child);
          diary.renderNutrition();
        };
      }
    });
  },

  //Bulk Insert/Update
  pushItemsToDB: function(items) {
    return new Promise(function(resolve, reject){

      //Meal category names
      const mealNames = JSON.parse(window.localStorage.getItem("meal-names"));

      for (let i = 0; i < items.length; i++) {
        let item = items[i];

        item.dateTime = diary.date;
        item.category = diary.currentCategory;
        item.category_name = mealNames[diary.currentCategory];
        item.quantity = 1;

        //If there is no food id set, use the item's ID as the food id
        if (item.foodId == undefined) {
          item.foodId = item.id;
          delete item.id;
        }
      }

      //Insert/update the record
      dbHandler.bulkPut(items, "diary").then(resolve());
    });
  },
};

//Page initialization
document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#diary')) {

    //Call constructor
    diary.initialize();

    //Page show event
    diary.page.addEventListener("show", function(e){

      //If items have been passed to the page, add them to the diary
      if (this.data.items) {
        if (this.data.category != undefined)
          diary.currentCategory = this.data.category; //Update current category if passed with data

        diary.pushItemsToDB(this.data.items)
        .then(diary.loadDiary()); //Refresh the display
      }
      else {
        diary.loadDiary();
      }
    });

    //Previous & Next date buttons
    const btnDate = document.getElementsByClassName("adjacent-date");
    Array.from(btnDate).forEach(function(element) {
      element.addEventListener('tap', function(event){
        if (this == btnDate[0]) diary.date.setUTCHours(diary.date.getUTCHours()-24); //Previous day
        if (this == btnDate[1]) diary.date.setUTCHours(diary.date.getUTCHours()+24); //Next day
        diary.loadDiary();
      });
    });

    //Date picker
    const datePicker = document.querySelector('#diary-date #date-picker');
    datePicker.addEventListener("change", function(event){
      diary.date = new Date(this.value);
      diary.loadDiary();
    });
 }
});
