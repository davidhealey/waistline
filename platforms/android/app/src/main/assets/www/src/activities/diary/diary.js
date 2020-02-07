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
    this.mealNames = settings.get("diary", "meal-names");
    let now = new Date();
    this.date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));

    console.log("Diary Initialized");
  },

  getDate: function() {

    if (diary.date)
      return diary.date;
    else {
      let now = new Date();
      return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
    }
  },

  getCategory: function() {
    return diary.currentCategory;
  },

  getEntriesFromDB: function(date)
  {
    return new Promise(function(resolve, reject){

      let from = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); //Discard time

      let to = new Date(from);
      to.setUTCHours(to.getUTCHours()+24);

      var data = {"entries":{}, "nutrition":{}, "nutritionTotals":{}};

      //Diary entries and nutrition
      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.bound(from, to, false, true)).onsuccess = function(e)
      {
        let cursor = e.target.result;

        if (cursor) {
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
            data.nutritionTotals[nutriment] += Number(item.nutrition[nutriment]);
          }

          cursor.continue();
        }
        else {
          resolve(data);
        }
      };
    });
  },

  render: function() {
    const entries = diary.data.entries; //Diary food entries
    const nutrition = diary.data.nutrition; //Nutritional nutrition by category
    const totals = diary.data.nutritionTotals; //Nutrition totals
    const lists = [];

    const container = document.getElementById("diary-day");
    container.innerHTML = "";

    //Setup lists for each category
    for (let i = 0; i < diary.mealNames.length; i++) {

      if (diary.mealNames[i] == "") continue;

      //One expandable list per meal
      let ul = document.createElement("ons-list");
      
      //Expandable list item
      let li = document.createElement("ons-list-item");
      li.setAttribute("expandable", "");
      li.setAttribute("category", i);
      li.className = "meal-heading";
      li.addEventListener("doubletap", this.goToFoodList);

      let span = document.createElement("span"); //Populated by renderNutrition function
      span.className = "header-text";
      span.addEventListener("hold", this.quickAdd);
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
      
      //Add food button
      /*let addLi = document.createElement("ons-list-item");
      addLi.innerText = "+ Add Food";
      ul.appendChild(addLi);*/
      
      container.appendChild(ul);
    }

    //Render entries
    for (let category in entries) {

      if (diary.mealNames[category] == "") continue;

      //List for each category card
      let ul = document.createElement("ons-list");
      ul.id = diary.mealNames[category] + "-list";

      //Render entries
      for (let i = 0; i < entries[category].length; i++) {
        let entry = entries[category][i];

        let li = document.createElement("ons-list-item");
        li.id = "entry-" + entry.id;
        if (entry.foodId) li.setAttribute("foodId", entry.foodId);
        if (entry.recipeId) li.setAttribute("recipeId", entry.recipeId);
        li.className = "entry";
        li.setAttribute("data", JSON.stringify(entry));

        //Gesture detector
        let gd = document.createElement("ons-gesture-detector");
        gd.appendChild(li);

        let name = document.createElement("ons-row");
        name.className = "diary-entry-name";
        name.innerText = foodsMealsRecipes.formatItemText(entry.name, 30);
        li.appendChild(name);
        li.addEventListener("hold", this.deleteItem);
        li.addEventListener("tap", this.itemEditor);

        if (entry.brand && entry.brand != "") {
          let brand = document.createElement("ons-row");
          brand.className = "diary-entry-brand";
          brand.innerHTML = foodsMealsRecipes.formatItemText(entry.brand, 20).italics();
          li.appendChild(brand);
        }

        //Entry info
        let info = document.createElement("ons-row");
        info.className = "diary-entry-info";
        info.innerText = entry.portion + ", " + parseInt(entry.nutrition.calories * entry.quantity) + " Calories";
        li.appendChild(info);

        //Timestamp
        if (settings.get("diary", "show-timestamps") == true) {
          let timestamp = document.createElement("ons-row");
          timestamp.className = "diary-entry-info";
          timestamp.innerHTML = entry.dateTime.toLocaleString();
          li.appendChild(timestamp);
        }

        lists[category].appendChild(li);
      }
    }
  },

  renderNutrition: function() {

    //Gather data from DOM
    let entries = document.getElementsByClassName('entry'); //Get all entries
    let nutrition = diary.data.nutrition; //nutritionData.byCategory;
    let totals = diary.data.nutritionTotals; //nutritionData.totals;
    let goalData = goals.getGoalsByDate(diary.date);
    delete goalData.weight; //Not needed here

    //Render category calorie count
    const headings = document.querySelectorAll('.meal-heading[category]'); //Category heading list items

    for (let i = 0; i < headings.length; i++) {
      let category = headings[i].getAttribute("category");
      let calories = 0; //Per category calorie count
      if (nutrition[category]) calories = nutrition[category].calories;

      //Set category heading text
      let headingText = headings[i].getElementsByClassName("header-text")[0];
      headingText.innerText = diary.mealNames[category] + " - " + parseInt(calories);

      if (settings.get("diary", "expand-meals") == true && calories > 0)
       headings[i].showExpansion(); //Expand lists that have entires
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

    for (let n in goalData) {

      if (goals.shouldShowInDiary(n) == true) {
        if (count % 3 == 0) {
          carouselItem = document.createElement("ons-carousel-item");
          rows[0] = document.createElement("ons-row");
          rows[0].className = "nutrition-total-values";
          rows[1] = document.createElement("ons-row");
          rows[1].className = "nutrition-total-title";
          carouselItem.appendChild(rows[0]);
          carouselItem.appendChild(rows[1]);
          carousel.appendChild(carouselItem);
        }

        let goal = goalData[n];
        if (goals.isGoalWeekly(n) == true) {
          goal = goals.getWeeklyGoal(n) / 7;
        }

        let col = document.createElement("ons-col");
        col.id = n + "-value";

        //Value/goals text
        let t = document.createTextNode("");
        if (totals[n] != undefined)
          t.nodeValue = parseFloat(totals[n].toFixed(2)) + "/" + parseFloat(goal.toFixed(2));
        else
          t.nodeValue = "0/" + parseFloat(goal.toFixed(2));

        col.appendChild(t);
        rows[0].appendChild(col);

        //Title
        col = document.createElement("ons-col");
        col.id = n + "-title";
        let text = app.strings[n] || n; //Localize
        let tnode = document.createTextNode((text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " "));
        col.appendChild(tnode);
        rows[1].appendChild(col);

        count++;
      }
    }
  },

  itemEditor: function()
  {
    let itemdata = JSON.parse(this.getAttribute("data"));

    nav.pushPage("src/activities/diary/views/edit-item.html", {"data":itemdata})
    .then(function() {
      populateEditor(itemdata);
      document.querySelector('ons-page#diary-edit-item #submit').addEventListener("tap", function(){ processEditor(itemdata);});
      document.querySelector('ons-page#diary-edit-item #quantity').addEventListener("input", function(){ changeServing(itemdata);});
      document.querySelector('ons-page#diary-edit-item #portion').addEventListener("input", function(){ changeServing(itemdata);});
    });

    function populateEditor(data) {

      //Item info
      const info = document.querySelector("ons-page#diary-edit-item #info");
      let name = document.createElement("h3");
      name.innerText = foodsMealsRecipes.formatItemText(data.name, 30);
      info.appendChild(name);

      if (data.brand && data.brand != "") {
        let brand = document.createElement("h4");
        brand.innerHTML = foodsMealsRecipes.formatItemText(data.brand, 20).italics();
        info.appendChild(brand);
      }

      //Category selection menu
      const select = document.querySelector('ons-page#diary-edit-item #category');

      for (let i = 0; i < diary.mealNames.length; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = diary.mealNames[i];
        if (i == data.category) option.setAttribute("selected", "");
        select.append(option);
      }

      //Serving
      let unit = data.portion.replace(/[^a-z]/gi, ''); //Exctract unit from portion
      document.querySelector('#diary-edit-item #quantity').value = data.quantity;
      document.querySelector('#diary-edit-item #portion').value = parseFloat(data.portion);
      document.querySelector('#diary-edit-item #unit').innerText = unit;

      //Nutrition
      let units = app.nutrimentUnits;
      const nutritionList = document.querySelector("ons-page#diary-edit-item #nutrition");
      for (let n in data.nutrition) {

        if (data.nutrition[n] == null) continue;

        let li = document.createElement("ons-list-item");
        nutritionList.appendChild(li);

        let center = document.createElement("div");
        center.className = "center";
        li.appendChild(center);

        let text = app.strings[n] || n; //Localize
        center.innerText = (text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " ");

        let right = document.createElement("div");
        right.className = "right";
        right.id = n;
        right.innerText = (parseFloat((data.nutrition[n] * data.quantity).toFixed(2)) || 0) + (units[n] || "g");
        li.appendChild(right);
      }
    }

    function processEditor(data) {
      //Get values from form and push to DB
      let unit = document.getElementById('unit').innerText;
      data.category = parseInt(document.getElementById('category').value);
      data.category_name = diary.mealNames[data.category];
      data.quantity = parseFloat(document.getElementById('quantity').value);
      data.portion = document.getElementById('portion').value + unit;
      data.dateTime = new Date(data.dateTime); //dateTime must be a Date object

      for (let nutriment in data.nutrition) {
        if (data.nutrition[nutriment] == null) continue; //Skip empty values - sanity test
        let t = document.querySelector("#diary-edit-item #"+nutriment);
        data.nutrition[nutriment] = parseFloat(t.innerText / data.quantity);
      }

      //Update the DB and return to diary
      dbHandler.put(data, "diary").onsuccess = function() {
        nav.resetToPage('src/activities/diary/views/diary.html');
      };
    }

    function changeServing(data) {

      let oldP = parseFloat(data.portion); //Get original portion
      let newP = document.querySelector('#diary-edit-item #portion').value; //New portion
      let newQ = document.querySelector('#diary-edit-item #quantity').value; //New quantity

      if (oldP > 0 && newP > 0) {
        for (let nutriment in data.nutrition) {
          let v = (data.nutrition[nutriment] / oldP) * newP;
          let t = document.querySelector("#diary-edit-item #"+nutriment);
          t.innerText = parseFloat((v*newQ).toFixed(2));
        }
      }
    }
  },

  goToFoodList: function() {
    diary.currentCategory = this.getAttribute("category");
    nav.pushPage("src/activities/foods-meals-recipes/views/foods-meals-recipes.html"); //Go to the food list page
  },

  loadDiary: function() {
    return new Promise(function(resolve, reject) {
      //Update date display
      diary.page.querySelector('#date-picker').value = diary.date; //Update displayed date

      //Get diary entries for date and render
      diary.getEntriesFromDB(diary.date)
      .then(function(data){
        diary.data = data;
        diary.render();
        diary.renderNutrition();
        resolve();
      });
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
          diary.loadDiary()
          .then(function() {
            diary.updateLog();
          });
          //If there are no items left in the category then close the expanded list
          if (parent.children.length == 0)
            parent.closest(".meal-heading[category]").hideExpansion();
        };
      }
    });
  },

  //Bulk Insert/Update
  pushItemsToDB: function(items) {
    return new Promise(function(resolve, reject){

      //Meal category names
      for (let i = 0; i < items.length; i++) {
        let item = items[i];

        item.dateTime = diary.date;
        item.category = diary.currentCategory;
        item.category_name = diary.mealNames[diary.currentCategory];
        item.quantity = 1;

        //If there is no food id set, use the item's ID as the food id
        if (item.foodId == undefined && item.id) {
          item.foodId = item.id;
          delete item.id;
        }
      }
      //Insert the items
      dbHandler.bulkInsert(items, "diary").then(resolve());
    });
  },

  quickAdd: function() {

    diary.current_category = this.getAttribute("category");

    ons.createElement('src/activities/diary/views/quick-add.html', { append: true }) //Load dialog from file
    .then(function(dialog) {
      dialog.show();

      dialog.querySelector('#cancel').addEventListener("tap", function(){dialog.hide();}); //Cancel button
      dialog.querySelector('#ok').addEventListener("tap", function() { //Ok button
        let inputs = dialog.querySelectorAll('input'); //Get input fields
        let validation = app.validateInputs(inputs); //Validate inputs

        //If inputs are valid
        if (validation == true) {
          let data = {"portion":"Quick Add", "nutrition":{}}; //Set up object to insert into diary

          //Calories
          data.nutrition.calories = Number(dialog.querySelector('#calories').value);

          //Name
          name = dialog.querySelector('#name').value;
          data.name = name || "Quick Add Calories";

          //Add to diary
          diary.pushItemsToDB([data])
          .then(function() {
            dialog.hide();
            diary.loadDiary() //Refresh the display
            .then(function() {
              diary.updateLog();
            });
          });
        }
      });
    });
  },

  updateLog: function() {
    log.update(diary.date, {"nutrition":diary.data.nutritionTotals}); //Update the log
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
        }
        else
          resolve(entries);
      };
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
      if (this.data && this.data.items) {
        if (this.data.category != undefined)
          diary.currentCategory = this.data.category; //Update current category if passed with data

        let that = this;
        diary.pushItemsToDB(this.data.items)
        .then(function(){
          diary.loadDiary() //Refresh the display
          .then(function() {
            diary.updateLog();
            delete that.data.items; //Unset data
          });
        });
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
        document.querySelector('#diary #log-weight').setAttribute("dateTime", diary.date);
        diary.loadDiary();
      });
    });

    //Date picker
    const datePicker = document.querySelector('#diary-date #date-picker');
    datePicker.addEventListener("change", function(event){
      diary.date = new Date(this.value);
      diary.loadDiary();
    });

    //Fab button
    const fab = diary.page.querySelector('ons-fab');
    fab.addEventListener("tap", function(event){
      nav.resetToPage("src/activities/foods-meals-recipes/views/foods-meals-recipes.html"); //Go to the food list page
    });
 }
});
