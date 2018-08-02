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
    html += "<ons-row>" + unescape(data.brand) + "</ons-row>";
    html += "<ons-row>" + unescape(data.name) + " - " + data.portion + "</ons-row>";
    html += "<ons-row style='color:#636363;'><i>" + parseInt(data.nutrition.calories) + " " + app.strings["calories"] + "</i></ons-row>";
    html += "</ons-list-item>";

    return html;
  },

  //Grabs the onsen list of food items and saves them to the meals database store
  update : function()
  {
    return new Promise(function(resolve, reject){
      var date = new Date()
      var dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

      var id = $("#edit-meal #meal-data #id").val(); //Hidden field
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
      if (id != "") {data.id = id} //If there is an ID add it to the data object

      //Add/update food item
      if (data.id == undefined){
        dbHandler.insert(data, "meals").onsuccess = function(){resolve();}
      }
      else {
        dbHandler.update(data, "meals", id)
        .then(resolve());
      }
    });
  },

  //Passively validates the edit meal page
  validateEditForm : function()
  {
    $("#edit-meal #submit").hide(); //Hide submit button until form is complete
    if ($("#edit-meal #foods ons-list-item").length > 0 && $("#edit-meal #name").val() != "")
    {
      $("#edit-meal #submit").show();
    }
  },

  //Gets all meals from the database and displays them as an onsen list
  renderMealsList : function()
  {
    dbHandler.getAllItems("meals")
    .then(function(mealItems){

      var html = "";
      for (var i = 0; i < mealItems.length; i++)
      {
        html += "<ons-list-item tappable modifier='longdivider' id='"+mealItems[i].id+"' data='"+JSON.stringify(mealItems[i])+"'>";
        html += "<ons-row>" + unescape(mealItems[i].name) + "</ons-row>";
        html += "<ons-row style='color:#636363;'><i>" + mealItems[i].nutrition.calories.toFixed(0) + " " + app.strings["calories"] + "</i></ons-row>";
        html += "</ons-list-item>";
      }

      $("#meals ons-list#meal-list").html(html);
    });
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

}

//Show meals page
$(document).on("show", "ons-page#meals", function(){
  $("#meals ons-progress-circular").hide(); //Hide progress indicator by default
  meals.renderMealsList();
});

$(document).on("init", "ons-page#edit-meal", function(){
  $("#edit-meal ons-list#foods").append(""); //Clear list
});

//Show edit meal form
$(document).on("show", "#edit-meal", function(){

  meals.validateEditForm();

  if (this.data.foodIds)
  {
    meals.getFoods(this.data.foodIds)
    .then(function(foods)
    {
      for (var i = 0; i < foods.length; i++)
      {
        //Display food items
        var html = meals.renderFoodItem(foods[i]);
        $("#edit-meal ons-list#foods").append(html);

        //Update nutrition display
        var nutrition = meals.getTotalNutrition();
        meals.renderTotalNutrition(nutrition);
      }
    });
  }
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
  .then(nav.popPage());
});
