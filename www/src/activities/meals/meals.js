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

var meals = {

  initialize: function() {

    this.page = document.querySelector('ons-page#meals');
    this.list = [];
    this.listCopy = []; //A backup copy of the list is always maintained for filtering

    //Setup lazy list
    this.infiniteList = this.page.querySelector('#infinite-list');

    //Show/Hide back button
    let menuButton = this.page.querySelector("#menu-button");
    let backButton = this.page.querySelector("#back-button");
    backButton.style.display = "none"; //Hide back button by default
    if (nav.pages.length > 1) {
      backButton.style.display = "block";
      menuButton.style.display = "none";
    }
  },

  renderListItem: function(index) {

    let meal = this.list[index];

    let li = document.createElement("ons-list-item");
    if (meal == undefined) return li; //If meal is undefined just return an empty li
    if (meal.id) li.id = "meal" + meal.id;
    li.addEventListener("hold", meals.deleteMeal);

    //Name and info
    let gd = document.createElement("ons-gesture-detector");
    gd.appendChild(li);

    let center = document.createElement("div");
    center.className = "center";
    center.addEventListener("tap", function(){ meals.mealEditor(meal); });
    li.appendChild(center);

    let name = document.createElement("ons-row");
    name.innerText = unescape(meal.name);
    center.appendChild(name);

    let info = document.createElement("ons-row");
    info.innerText += meal.nutrition.calories + " Calories";
    center.appendChild(info);

    //Checkbox
    let right = document.createElement("div");
    right.className = "right";
    li.appendChild(right);

    let checkbox = document.createElement("ons-checkbox");
    checkbox.setAttribute("name", "meal-checkbox");
    checkbox.setAttribute("data", JSON.stringify(meal)); //Add list item as checkbox parent's data attribute
    checkbox.addEventListener('change', this.checkboxChange); //Attach event
    right.appendChild(checkbox);

    return li;
  },

  //Checkbox change event callback function
  checkboxChange: function() {

    let btnCheck = meals.page.querySelector('#submit');
    let checkedboxes = meals.page.querySelectorAll('input[type=checkbox]:checked'); //All checked boxes

    if (checkedboxes.length == 0)
      btnCheck.style.display = "none";
    else
      btnCheck.style.display = "block";
  },

  deleteMeal: function() {
    let id = this.id;
    ons.notification.confirm("Delete this item?")
    .then(function(input) {

      if (input == 1) { //Delete was confirmed
        let request = dbHandler.deleteItem(parseInt(id.replace("meal", "")), "meals");

        //If the request was successful remove the list item
        request.onsuccess = function(e) {
          let child = document.querySelector('#meals #' + id);
          let parent = child.parentElement;
          parent.removeChild(child);
        };
      }
    });
  },

  mealEditor: function(meal) {

    let nutrition = {};
    let foods = [];

    nav.pushPage("src/activities/meals/views/meal-editor.html")
    .then(function() {

      //If a meal has been passed to the editor
      if (meal) {
        foods = meal.foods;
        document.querySelector('#meal-editor #title').innerText = unescape(meal.name);
        document.querySelector('#meal-editor #name').value = unescape(meal.name);
        populateEditor();
        renderNutrition();
      }

      document.querySelector('ons-page#meal-editor #submit').addEventListener("tap", processEditor);
      document.querySelector('#meal-editor ons-input#name').addEventListener("keyup", function(){
        if (foods.length > 0)
          document.querySelector('ons-page#meal-editor #submit').style.display = "block";
      });

      document.querySelector('ons-page#meal-editor ons-fab').addEventListener("tap", function() {
        nav.bringPageTop("src/activities/foods-meals-recipes/views/foods-recipes.html"); //Go to the food/recipe page
      });

      //Page show event
      document.querySelector('ons-page#meal-editor').addEventListener("show", function(e) {

        //If items have been passed to the page, add them to the meal
        if (this.data && this.data.items) {
          foods = foods.concat(this.data.items); //Add to editor's foods array
          document.querySelector('ons-page#meal-editor #submit').style.display = "block";
          populateEditor();
          renderNutrition();
          delete this.data.items; //Unset page data.items
        }
      });
    });

    function populateEditor() {

      //Food items
      let foodul = document.querySelector('#meal-editor ons-list#foods');
      foodul.innerText = "";
      for (let i = 0; i < foods.length; i++) {
        let food = foods[i];

        if (food == undefined) continue; //Skip deleted items

        let li = document.createElement("ons-list-item");
        li.id = "foodID" + food.id;
        li.className = "food-item";
        li.setAttribute("index", i); //Food's index in data.foods array
        li.addEventListener("hold", deleteFood);
        li.addEventListener("tap", changePortion);

        let gd = document.createElement("ons-gesture-detector");
        gd.appendChild(li);
        foodul.appendChild(gd);

        let row = document.createElement("ons-row");
        li.appendChild(row);

        let col = document.createElement("ons-col");
        col.innerText = unescape(food.name);
        row.appendChild(col);

        row = document.createElement("ons-row");
        li.appendChild(row);

        col = document.createElement("ons-col");
        col.innerText = unescape(food.portion) + ", " + food.nutrition.calories + " Calories";
        row.appendChild(col);
      }
    }

    function renderNutrition() {

      nutrition = {};

      for (let i = 0; i < foods.length; i++) { //Each food
        let food = foods[i];
        if (food == undefined) continue; //Skip removed items

        //Total nutritional data
        for (let n in food.nutrition) {
          nutrition[n] = nutrition[n] || 0;
          nutrition[n] += food.nutrition[n];
        }
      }

      //Render nutritional data
      let units = app.nutrimentUnits;
      let nutritionul = document.querySelector('#meal-editor #nutrition');
      nutritionul.innerText = "";
      for (let n in nutrition) {
        let li = document.createElement("ons-list-item");
        nutritionul.appendChild(li);

        let center = document.createElement("div");
        center.className = "center";
        let text = app.strings[n] || n; //Localize
        center.innerText = text.charAt(0).toUpperCase() + text.slice(1);
        li.appendChild(center);

        let right = document.createElement("div");
        right.className = "right";
        let v = parseFloat(parseFloat(nutrition[n]).toFixed(2));
        if (nutrition[n] < 0)
          v = parseFloat(parseFloat(nutrition[n]).toFixed(4));
        right.innerText = v + (units[n] || "g");

        li.appendChild(right);
      }
    }

    function changePortion() {

      let index = this.getAttribute("index"); //Food array index
      let food = foods[index];
      let portion = parseFloat(parseFloat(food.portion).toFixed(2));
      let unit = food.portion.replace(/[^a-z]/gi, '');

      ons.notification.prompt({message:"Enter a new portion (" + unit + ")", title:"Change Portion", defaultValue:portion, cancelable:true})
        .then(function(input) {

          if (!isNaN(parseFloat(input))) {

            //Update food's nutrition
            for (var n in food.nutrition) {
              food.nutrition[n] = (food.nutrition[n] / portion) * parseFloat(input);
            }

            //Update food's portion
            food.portion = parseFloat(input) + unit;
            foods[index] = food; //Replace old food item in the array with the updated one

            //Refresh editor
            populateEditor();
            renderNutrition();
          }
        });
    }

    function processEditor() {

      //Make sure there is data object set up correctly
      data = meal || {};
      data.nutrition = nutrition;
      data.foods = foods;

      let inputs = document.querySelectorAll('#meal-editor input');
      let validation = app.validateInputs(inputs);
      if (validation == true) {

        //Add timestamp
        let now = new Date();
        data.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        //Set name from DOM
        data.name = document.querySelector('#meal-editor ons-input#name').value;

        //Remove notes key which may exist from earlier versions
        delete data.notes;

        //Remove undefined foods
        for (let i = 0; i < data.foods.length; i++) {
          if (data.foods[i] == undefined) data.foods.splice(i, 1);
        }

        //Update the DB
        dbHandler.put(data, "meals").onsuccess = function() {
          nav.resetToPage('src/activities/meals/views/meals.html');
        };
      }
      else {
        //Display validation messages
        let message = "Please add values to the following fields: <br><ul>";
        for (let i = 0; i < validation.length; i++) {
          message += "<li>" + validation[i].charAt(0).toUpperCase() + validation[i].slice(1) + "</li>";
        }
        message += "<ul>";
        ons.notification.alert(message, {"messageHTML":true});
      }
    }

    function deleteFood() {
      let id = this.id;
      let that = this;
      let index = this.getAttribute("index"); //Index of food in data array

      ons.notification.confirm("Delete this item?")
      .then(function(input) {
        if (input == 1) { //Delete was confirmed
          //Remove li from DOM
          that.removeEventListener("hold", deleteFood);
          that.parentElement.removeChild(that);
          foods[index] = undefined; //Set food in item to undefined - this maintains other food indexes
          renderNutrition(); //Rerender nutrition
          document.querySelector('ons-page#meal-editor #submit').style.display = "block"; //Display submit button
        }
      });
    }
  },
};

//Page initialization
document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#meals')) {

    //Initialize module
    meals.initialize();

    //Populate initial list from DB
    foodsMealsRecipes.getFromDB("meals", window.localStorage.getItem("sort-foods"))
    .then(function(list){
      meals.list = list;
      meals.listCopy = list;

      //Setup lazy list delegate callbacks
      meals.infiniteList.delegate = {
        createItemContent: function(index, template) {
            return meals.renderListItem(index);
        },

        countItems: function() {
          return meals.list.length;
        },

        /*calculateItemHeight: function(index) {
          // Optional: return the height of the item at position `index`.
          // This can enhance calculations and allow better scrolling.
        },*/

        destroyItem: function(index, e) {
          if (meals.list[index] == undefined) return true; //If list is empty just return
          //Remove item event listeners
          e.element.querySelector("ons-checkbox").removeEventListener('change', meals.checkboxChange);
          e.element.removeEventListener("hold", meals.deleteMeal);
        }
      };
    });

    //List filter
    const filter = document.querySelector('ons-page#meals #filter');
    filter.addEventListener("input", function(event){
      let value = event.target.value;
      meals.list = foodsMealsRecipes.setFilter(value, meals.listCopy);
      meals.infiniteList.refresh();
    });

    //Fab button to add new food
    const fab = meals.page.querySelector('ons-fab');
    fab.addEventListener("tap", function(event) {
      meals.mealEditor();
    });
  }
});
