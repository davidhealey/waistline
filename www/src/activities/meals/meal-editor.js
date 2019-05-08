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

var mealEditor = {

  open: function(meal) {

    nav.pushPage("src/activities/meals/views/meal-editor.html")
    .then(function() {

      //Setup initial values
      mealEditor.nutrition = {}; //Total nutrition for the meal
      mealEditor.foods = []; //Food/recipe items in the meal
      mealEditor.meal = undefined;

      //If a meal has been passed to the editor
      if (meal) {
        mealEditor.meal = meal;
        mealEditor.foods = meal.foods;
        document.querySelector('#meal-editor #title').innerText = unescape(meal.name);
        document.querySelector('#meal-editor #name').value = unescape(meal.name);
        mealEditor.renderFoodList();
        mealEditor.renderNutrition();
      }

      //Submit button
      document.querySelector('ons-page#meal-editor #submit').addEventListener("tap", mealEditor.processEditor);

      //Name input box
      document.querySelector('#meal-editor ons-input#name').addEventListener("keyup", function(){
        if (mealEditor.foods.length > 0)
          document.querySelector('ons-page#meal-editor #submit').style.display = "block";
      });

      //Fab button
      document.querySelector('ons-page#meal-editor ons-fab').addEventListener("tap", function() {
        //nav.bringPageTop("src/activities/foods-meals-recipes/views/foods-recipes.html"); //Go to the food/recipe page
        nav.bringPageTop("src/activities/foodlist/views/foodlist.html"); //Go to the food/recipe page
      });

      //Page show event
      document.querySelector('ons-page#meal-editor').addEventListener("show", function(e) {

        //If items have been passed to the page, add them to the meal
        if (this.data && this.data.items) {
          mealEditor.foods = mealEditor.foods.concat(this.data.items); //Add to editor's foods array
          document.querySelector('ons-page#meal-editor #submit').style.display = "block";
          mealEditor.renderFoodList();
          mealEditor.renderNutrition();
          delete this.data.items; //Unset page data.items
        }
      });
    });
  },

  renderFoodList: function() {

    //Food items
    let foodul = document.querySelector('#meal-editor ons-list#foods');

    foodul.innerText = "";
    for (let i = 0; i < mealEditor.foods.length; i++) {
      let food = mealEditor.foods[i];

      if (food == undefined) continue; //Skip deleted items

      let li = document.createElement("ons-list-item");
      li.id = "foodID" + food.id;
      li.className = "food-item";
      li.setAttribute("index", i); //Food's index in data.foods array
      li.addEventListener("hold", mealEditor.deleteFood);
      li.addEventListener("tap", mealEditor.changePortion);

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
  },

  renderNutrition: function() {

    mealEditor.nutrition = {};

    for (let i = 0; i < mealEditor.foods.length; i++) { //Each food
      let food = mealEditor.foods[i];
      if (food == undefined) continue; //Skip removed items

      //Total nutritional data
      for (let n in food.nutrition) {
        mealEditor.nutrition[n] = mealEditor.nutrition[n] || 0;
        mealEditor.nutrition[n] += food.nutrition[n];
      }
    }

    //Render nutritional data
    let units = app.nutrimentUnits;
    let nutritionul = document.querySelector('#meal-editor #nutrition');
    nutritionul.innerText = "";
    for (let n in mealEditor.nutrition) {
      let li = document.createElement("ons-list-item");
      nutritionul.appendChild(li);

      let center = document.createElement("div");
      center.className = "center";
      let text = app.strings[n] || n; //Localize
      center.innerText = text.charAt(0).toUpperCase() + text.slice(1);
      li.appendChild(center);

      let right = document.createElement("div");
      right.className = "right";
      let v = parseFloat(parseFloat(mealEditor.nutrition[n]).toFixed(2));
      if (mealEditor.nutrition[n] < 0)
        v = parseFloat(parseFloat(mealEditor.nutrition[n]).toFixed(4));
      right.innerText = v + (units[n] || "g");

      li.appendChild(right);
    }
  },

  changePortion: function() {

    let index = this.getAttribute("index"); //Food array index
    let food = mealEditor.foods[index];
    let portion = parseFloat(parseFloat(food.portion).toFixed(2));
    let unit = food.portion.replace(/[^a-z]/gi, '');
    document.querySelector('ons-page#meal-editor #submit').style.display = "block";

    ons.notification.prompt({message:"Enter a new portion (" + unit + ")", title:"Change Portion", defaultValue:portion, cancelable:true})
    .then(function(input) {

      if (!isNaN(parseFloat(input))) {

        //Update food's nutrition
        for (var n in food.nutrition) {
          food.nutrition[n] = (food.nutrition[n] / portion) * parseFloat(input);
        }

        //Update food's portion
        food.portion = parseFloat(input) + unit;
        mealEditor.foods[index] = food; //Replace old food item in the array with the updated one

        //Refresh editor
        mealEditor.renderFoodList();
        mealEditor.renderNutrition();
      }
    });
  },

  processEditor: function() {

    //Setup data object
    data = mealEditor.meal || {};
    data.nutrition = mealEditor.nutrition;
    data.foods = mealEditor.foods;

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
  },

  deleteFood: function() {
    let id = this.id;
    let that = this;
    let index = this.getAttribute("index"); //Index of food in data array

    ons.notification.confirm("Delete this item?")
    .then(function(input) {
      if (input == 1) { //Delete was confirmed
        //Remove li from DOM
        that.removeEventListener("hold", mealEditor.deleteFood);
        that.parentElement.removeChild(that);

        mealEditor.foods[index] = undefined; //Set food in item to undefined - this maintains other food indexes
        mealEditor.renderNutrition(); //Rerender nutrition
        document.querySelector('ons-page#meal-editor #submit').style.display = "block"; //Display submit button
      }
    });
  }
};
