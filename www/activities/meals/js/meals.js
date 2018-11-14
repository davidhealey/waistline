/*
  Copyright 2018 David Healey

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

  list:[],

  fillList : function()
  {
    var items = $("#meals #meal-list ons-list-item"); //Get all list items

    for (var i = 0; i < items.length; i++)
    {
        var itemData = JSON.parse($(items[i]).attr("data"));
        meals.list.push(itemData);
    }
  },

  filterList : function(term)
  {
    return filteredList = meals.list.filter(function (el) {
      return (el.name.match(new RegExp(term, "i"))); //Allow partial match and case insensitive
    });
  },

  //Takes an array of foodIds and returns the food items from the database
  getFoods : function(foodIds)
  {
    return new Promise(function(resolve, reject){

      dbHandler.getByMultipleKeys(foodIds, "foodList")
      .then(function(results)
      {
        resolve(results);
      });
    });
  },

  //Takes data of a food item and adds it to the list
  renderFoodItem : function(data)
  {
    var html = "";
    html += "<ons-list-item tappable modifier='longdivider' id='"+data.id+"' data='"+JSON.stringify(data)+"'>";
    if (app.storage.getItem("brand-position") == "false")
    {
      html += "<ons-row>" + unescape(data.brand) + "</ons-row>";
      html += "<ons-row>" + unescape(data.name) + " - " + data.portion + "</ons-row>";
    }
    else
    {
      html += "<ons-row>" + unescape(data.name) + " - " + data.portion + "</ons-row>";
      html += "<ons-row>" + unescape(data.brand) + "</ons-row>";
    }
    html += "<ons-row style='color:#636363;'><i>" + parseInt(data.nutrition.calories) + " " + app.strings["calories"] + "</i></ons-row>";
    html += "</ons-list-item>";

    return html;
  },

  fillEditForm : function(data)
  {
    return new Promise(function(resolve, reject){
      $("#edit-meal #meal-data #id").val(data.id); //Hidden field
      $("#edit-meal #meal-data #name").val(unescape(data.name));
      $("#edit-meal #meal-data #notes").val(unescape(data.notes));

      var foods = data.foods;
      for (var i = 0; i < foods.length; i++)
      {
        //Display food items
        $("#edit-meal ons-list#foods").append(meals.renderFoodItem(foods[i]));
        meals.renderTotalNutrition(meals.getTotalNutrition());
      }
    });
  },

  //Grabs the onsen list of food items and saves them to the meals database store
  update : function()
  {
    return new Promise(function(resolve, reject){
      var dateTime = new Date()

      var id = parseInt($("#edit-meal #meal-data #id").val()); //Hidden field
      var nutrition = JSON.parse($("#edit-meal #meal-data #nutrition").val()); //Hidden field
      var name = escape($("#edit-meal #meal-data #name").val());
      var notes = escape($("#edit-meal #meal-data #notes").val());
      var foods = [];

      var listItems = $("#edit-meal #foods ons-list-item"); //Get food items list

      for (var i = 0; i < listItems.length; i++)
      {
        var foodData = JSON.parse($(listItems[i]).attr("data")); //Get food data from list item

        var foodItem = {  //Item to be inserted into foods array
          "id":foodData.id,
          "name":foodData.name,
          "brand":foodData.brand,
          "portion":foodData.portion,
          "nutrition":foodData.nutrition,
        };

        foods.push(foodItem);
      }

      var data = {"dateTime":dateTime, "name":name, "foods":foods, "notes":notes, "nutrition":nutrition};
      if (isNaN(id) == false) {data.id = id} //If there is an ID add it to the data object

      dbHandler.insert(data, "meals").onsuccess = function(){resolve();} //Insert/update the record
    });
  },

  //Passively validates the edit meal page
  validateEditForm : function()
  {
    $("#edit-meal #submit").hide(); //Hide submit button until form is complete
    if ($("#edit-meal #foods ons-list-item").length > 0 && $("#edit-meal #meal-data #name").val() != "")
    {
      $("#edit-meal #submit").show();
    }
  },

  fillListFromDB : function()
  {
    return new Promise(function(resolve, reject){
      dbHandler.getAllItems("meals")
      .then(function(items){
        meals.list = items;
        resolve();
      });
    });
  },

  //Gets all meals from the database and displays them as an onsen list
  renderMealsList : function(list)
  {
    var html = "";

    for (var i = 0; i < list.length; i++)
    {
      html += "<ons-list-item tappable modifier='longdivider' id='"+list[i].id+"' data='"+JSON.stringify(list[i])+"'>";
      html += "<label class='right'>";
      html += "<ons-checkbox name='meal-checkbox' input-id='meal"+i+"' data='"+JSON.stringify(list[i])+"'></ons-checkbox>";
      html += "</label>";
      html += "<label for='meal"+i+"' class='center'>";
      html += "<ons-row>" + unescape(list[i].name) + "</ons-row>";
      html += "<ons-row style='color:#636363;'><i>" + list[i].nutrition.calories.toFixed(0) + " " + app.strings["calories"] + "</i></ons-row>";
      html += "</label>";
      html += "</ons-list-item>";
    }

    $("#meals ons-list#meal-list").html(html);
  },

  changePortion : function(listItem, newPortion)
  {
    var data = JSON.parse($(listItem).attr("data"));
    var unit = data.portion.replace(/[^a-z]/gi, '');
    var nutrition = {};

    //Calculate nutritional data for new portion
    for (n in data.nutrition)
    {
      nutrition[n] = nutrition[n] || 0;
      nutrition[n] = (data.nutrition[n] / parseFloat(data.portion)) * parseFloat(newPortion);
    }

    data.portion = newPortion + unit;
    data.nutrition = nutrition; //Replace object with new one

    var html = meals.renderFoodItem(data); //Regenerate the html for this list item
    $(listItem).replaceWith(html); //Replace list item with updated html
  },

  //Totals up the nutritional value of all of the items in the edit list
  getTotalNutrition : function()
  {
    var listItems = $("#edit-meal #foods ons-list-item"); //Get all list items
    var nutrition = {};

    for (var i = 0; i < listItems.length; i++)
    {
      var data = JSON.parse($(listItems[i]).attr("data"));

      for (n in data.nutrition)
      {
        nutrition[n] = nutrition[n] || 0;
        nutrition[n] += data.nutrition[n];
      }
    }

    $("#edit-meal #meal-data #nutrition").val(JSON.stringify(nutrition)); //Store nutritional data in hidden form field
    return nutrition;
  },

  //Renders the passed nutrition object to the screen
  renderTotalNutrition : function(nutrition)
  {
    for (n in nutrition)
    {
      n == "calories" ? $("#edit-meal #"+n).html(nutrition[n].toFixed(0)) : $("#edit-meal #"+n).html(nutrition[n].toFixed(1) + "g");
    }
  },

  localize : function()
  {
    $("#meals #filter").attr("placeholder", app.strings["recipes"]["filter"]);
    $("#edit-meal #meal-data #name").attr("placeholder", app.strings["recipes"]["edit-recipe"]["placeholders"]["name"]);
    $("#edit-meal #meal-data #notes").attr("placeholder", app.strings["recipes"]["edit-recipe"]["placeholders"]["notes"]);
  }

}

//Show meals page
$(document).on("show", "ons-page#meals", function(){

  var lastPage = this.previousSibling || null; //Get ID of previous page
  lastPage != null ? $("#meals #menu-button").hide() : $("#meals ons-back-button").hide(); //Hide button based on context
  $("#meals #submit").hide(); //Hide submit button

  meals.localize();

  meals.fillListFromDB()
  .then(function(){meals.renderMealsList(meals.list)});
});

//@Todo Double tap on meal item
$(document).on("dblclick", "#meals #meal-list ons-list-item", function(){
  var control = this;
  var data = JSON.parse($(this).attr("data"));
});

//Delete/Edit meal
$(document).on("hold", "#meals #meal-list ons-list-item", function(){

  var control = this; //The control that triggered the callback
  var data = JSON.parse($(this).attr("data"));

  //Ask the user to select the type of image
  ons.openActionSheet({
    cancelable: true,
    buttons: ['Edit', 'Delete']
  })
  .then(function(input){
    if (input == 0) //Edit
    {
      nav.pushPage("activities/meals/views/edit-meal.html", {"data":data});
    }
    else if (input == 1) //Delete
    {
      //Show confirmation dialog
      ons.notification.confirm(app.strings["dialogs"]["confirm-delete"])
      .then(function(input) {
        if (input == 1) {//Delete was confirmed
          $(control).remove(); //Remove the list item
          meals.fillList(); //Update meals list
          var request = dbHandler.deleteItem(parseInt(control.id), "meals");
        }
      });
    }
  });
});

//Checkbox selection
$(document).on("change", "#meals #meal-list ons-checkbox", function(e){
  var checked = $("#meals #meal-list input[name=meal-checkbox]:checked"); //Get all checked items
  checked.length > 0 ? $("#meals #submit").show() : $("#meals #submit").hide();
});

//Add meals to diary
$(document).on("tap", "#meals #submit", function(){

  var meals = $("#meals #meal-list input[name=meal-checkbox]:checked"); //Get selected meal checkboxes

  if (meals.length > 0)
  {
    for (var i = 0; i < meals.length; i++) //Each meal
    {
      var foods = JSON.parse(meals[i].offsetParent.attributes.data.value)["foods"]; //Get food data from attribute

      for (var f = 0; f < foods.length; f++)
      {
        diary.addEntry(foods[f]);
      }
    }
    nav.resetToPage("activities/diary/views/diary.html"); //Switch to diary page
  }

});

//Initialise meal edit page
$(document).on("init", "ons-page#edit-meal", function(){
  $("#edit-meal ons-list#foods").append(""); //Clear list
});

//Show edit meal form
$(document).on("show", "#edit-meal", function(){

  meals.localize();
  meals.validateEditForm();
  $("#edit-meal #title").html(app.strings["recipes"]["edit-recipe"]["title1"]); //Default title

  if (this.data.foodIds) //Food ids passed from food list
  {
    meals.getFoods(this.data.foodIds)
    .then(function(foods)
    {
      for (var i = 0; i < foods.length; i++)
      {
        //Display food items
        $("#edit-meal ons-list#foods").append(meals.renderFoodItem(foods[i]));
        meals.renderTotalNutrition(meals.getTotalNutrition());
      }
      meals.validateEditForm();
    });
  }
  else if (this.data.id) //Meal data for existing meal
  {
    $("#edit-meal #title").html(app.strings["recipes"]["edit-recipe"]["title2"]);
    meals.fillEditForm(this.data) //Populate edit screen with data
    .then(() => meals.validateEditForm());
  }

  this.data = {};
});

//Edit meal name
$(document).on("keyup", "#edit-meal #name", function(){
  meals.validateEditForm();
});

//Delete food from meal
$(document).on("hold", "#edit-meal #foods ons-list-item", function(){

  var control = this; //The control that triggered the callback

  //Show confirmation dialog
  ons.notification.confirm(app.strings["dialogs"]["confirm-delete"])
  .then(function(input) {
    if (input == 1) {//Delete was confirmed
      $(control).remove(); //Remove the list item
      meals.renderTotalNutrition(meals.getTotalNutrition());
      meals.validateEditForm();
    }
  });
});

//Tap on food item
$(document).on("click", "#edit-meal #foods ons-list-item", function(e){

  var control = this;
  var data = JSON.parse($(this).attr("data"));
  var portion = parseFloat(data.portion);
  var unit = data.portion.replace(/[^a-z]/gi, '');

  //Show prompt
  ons.notification.prompt("Quantity (" + unit + ")", {"title":"Quantity", "inputType":"number", "defaultValue":portion, "cancelable":true})
  .then(function(input)
  {
    if (!isNaN(parseFloat(input)))
    {
      meals.changePortion(control, input, unit)
      meals.renderTotalNutrition(meals.getTotalNutrition());
    }
  });
});

//Submit edit form
$(document).on("tap", "#edit-meal #submit", function(){
  meals.update()
  .then(() => nav.popPage());
});

$(document).on("keyup", "#meals #filter", function(e){

  $("#meals #submit").hide();

  if (this.value == "") //Search box cleared, reset the list
  {
    meals.fillListFromDB()
    .then(function(){
      meals.renderMealsList(meals.list);
    });
  }
  else { //Filter the list
    var filteredList = meals.filterList(this.value);
    meals.renderMealsList(filteredList);
  }

});
