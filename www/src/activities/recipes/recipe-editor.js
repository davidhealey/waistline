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

var recipeEditor = {

  open: function(recipe) {

    nav.pushPage("src/activities/recipes/views/recipe-editor.html")
    .then(function() {

      //Setup initial values
      recipeEditor.nutrition = {}; //Total nutrition for the recipe
      recipeEditor.foods = []; //Food/recipe items in the recipe
      recipeEditor.recipe = undefined;

      //If a recipe has been passed to the editor
      if (recipe) {
        recipeEditor.recipe = recipe;
        recipeEditor.foods = recipe.foods;
        document.querySelector('#recipe-editor #title').innerText = unescape(recipe.name);
        document.querySelector('#recipe-editor #name').value = unescape(recipe.name);
        document.querySelector('#recipe-editor #portion').value = parseFloat(recipe.portion);
        document.querySelector('#recipe-editor #unit').value = recipe.portion.replace(/[^a-z]/gi, '');
        document.querySelector('#recipe-editor #notes').value = unescape(recipe.notes);
        recipeEditor.renderFoodList();
        recipeEditor.renderNutrition();
      }

      //Submit button
      document.querySelector('ons-page#recipe-editor #submit').addEventListener("tap", recipeEditor.processEditor);

      //Show submit button when input boxes edited
      document.querySelector('#recipe-editor #name').addEventListener("keyup", recipeEditor.showhideSubmitButton);
      document.querySelector('#recipe-editor #portion').addEventListener("keyup", recipeEditor.showhideSubmitButton);
      document.querySelector('#recipe-editor #unit').addEventListener("keyup", recipeEditor.showhideSubmitButton);
      document.querySelector('#recipe-editor #notes').addEventListener("keyup", recipeEditor.showhideSubmitButton);

      //Fab button
      document.querySelector('#recipe-editor ons-fab').addEventListener("tap", function() {
        nav.bringPageTop("src/activities/foodlist/views/foodlist.html"); //Go to the foods
      });

      //Page show event
      document.querySelector('ons-page#recipe-editor').addEventListener("show", function(e) {

        //If items have been passed to the page, add them to the recipe
        if (this.data && this.data.items) {
          recipeEditor.foods = recipeEditor.foods.concat(this.data.items); //Add to editor's foods array
          recipeEditor.showhideSubmitButton();
          recipeEditor.renderFoodList();
          recipeEditor.renderNutrition();
          delete this.data.items; //Unset page data.items
        }
      });
    });
  },

  showhideSubmitButton: function() {
    if (recipeEditor.foods.length > 0 && (this.value != "" || this.getAttribute("required") != true))
      document.querySelector('ons-page#recipe-editor #submit').style.display = "block";
    else
      document.querySelector('ons-page#recipe-editor #submit').style.display = "none";
  },

  renderFoodList: function() {

    //Food items
    let foodul = document.querySelector('#recipe-editor ons-list#foods');

    foodul.innerText = "";
    for (let i = 0; i < recipeEditor.foods.length; i++) {
      let food = recipeEditor.foods[i];

      if (food == undefined) continue; //Skip deleted items

      let li = document.createElement("ons-list-item");
      li.id = "foodID" + food.id;
      li.className = "food-item";
      li.setAttribute("index", i); //Food's index in data.foods array
      li.addEventListener("hold", recipeEditor.deleteFood);
      li.addEventListener("tap", recipeEditor.changePortion);

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

    recipeEditor.nutrition = {};

    for (let i = 0; i < recipeEditor.foods.length; i++) { //Each food
      let food = recipeEditor.foods[i];
      if (food == undefined) continue; //Skip removed items

      //Total nutritional data
      for (let n in food.nutrition) {
        recipeEditor.nutrition[n] = recipeEditor.nutrition[n] || 0;
        recipeEditor.nutrition[n] += food.nutrition[n];
      }
    }

    //Render nutritional data
    let units = app.nutrimentUnits;
    let nutritionul = document.querySelector('#recipe-editor #nutrition');
    nutritionul.innerText = "";
    for (let n in recipeEditor.nutrition) {
      let li = document.createElement("ons-list-item");
      nutritionul.appendChild(li);

      let center = document.createElement("div");
      center.className = "center";
      let text = app.strings[n] || n; //Localize
      center.innerText = text.charAt(0).toUpperCase() + text.slice(1);
      li.appendChild(center);

      let right = document.createElement("div");
      right.className = "right";
      let v = parseFloat(parseFloat(recipeEditor.nutrition[n]).toFixed(2));
      if (recipeEditor.nutrition[n] < 0)
        v = parseFloat(parseFloat(recipeEditor.nutrition[n]).toFixed(4));
      right.innerText = v + (units[n] || "g");

      li.appendChild(right);
    }
  },

  changePortion: function() {

    let index = this.getAttribute("index"); //Food array index
    let food = recipeEditor.foods[index];
    let portion = parseFloat(parseFloat(food.portion).toFixed(2));
    let unit = food.portion.replace(/[^a-z]/gi, '');
    recipeEditor.showhideSubmitButton();

    ons.notification.prompt({message:"Enter a new portion (" + unit + ")", title:"Change Portion", defaultValue:portion, cancelable:true})
    .then(function(input) {

      if (!isNaN(parseFloat(input))) {

        //Update food's nutrition
        for (var n in food.nutrition) {
          food.nutrition[n] = (food.nutrition[n] / portion) * parseFloat(input);
        }

        //Update food's portion
        food.portion = parseFloat(input) + unit;
        recipeEditor.foods[index] = food; //Replace old food item in the array with the updated one

        //Refresh editor
        recipeEditor.renderFoodList();
        recipeEditor.renderNutrition();
      }
    });
  },

  processEditor: function() {

    //Setup data object
    data = recipeEditor.recipe || {};
    data.nutrition = recipeEditor.nutrition;
    data.foods = recipeEditor.foods;

    let inputs = document.querySelectorAll('#recipe-editor input');
    let validation = app.validateInputs(inputs);
    if (validation == true) {

      //Add timestamp
      let now = new Date();
      data.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

      //Set data values from DOM
      data.name = escape(document.querySelector('#recipe-editor #item-data #name').value);
      let portion = parseFloat(document.querySelector('#recipe-editor #item-data #portion').value);
      let unit = document.querySelector('#recipe-editor #item-data #unit').value;
      data.portion = portion + unit;
      data.notes = document.querySelector('#recipe-editor #item-data #notes').value;

      //Remove undefined foods
      for (let i = 0; i < data.foods.length; i++) {
        if (data.foods[i] == undefined) data.foods.splice(i, 1);
      }

      //Update the DB
      dbHandler.put(data, "recipes").onsuccess = function() {
        nav.resetToPage('src/activities/recipes/views/recipes.html');
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
        that.removeEventListener("hold", recipeEditor.deleteFood);
        that.parentElement.removeChild(that);

        recipeEditor.foods[index] = undefined; //Set food in item to undefined - this maintains other food indexes
        recipeEditor.renderNutrition(); //Rerender nutrition
        recipeEditor.showhideSubmitButton();
      }
    });
  }
};
