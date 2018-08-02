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

  //Takes an array of food items and displays them as an onsen list
  renderFoodList : function(foods)
  {
    return new Promise(function(resolve, reject){

      var html = "";
      for (var i = 0; i < foods.length; i++)
      {
        html += "<ons-list-item id='"+foods[i].id+"' data='"+JSON.stringify(foods[i])+"'>";
        html += "<ons-row>" + unescape(foods[i].brand) + "</ons-row>";
        html += "<ons-row>" + unescape(foods[i].name) + " - " + foods[i].portion + "</ons-row>";
        html += "<ons-row style='color:#636363;'><i>" + foods[i].nutrition.calories + " " + app.strings["calories"] + "</i></ons-row>";
        html += "</ons-list-item>";
      }

      $("#edit-meal ons-list#foods").html(html);

    });
  },

  //Grabs the onsen list of food items and saves them to the meals database store
  update : function()
  {
    return new Promise(function(resolve, reject){
      var date = new Date()
      var dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

      var id = $("#edit-meal #name").val();
      var name = $("#edit-meal #name").val();
      var foodIds = [];

      var listItems = $("#edit-meal #foods ons-list-item"); //Get food items list
      var nutrition = {};

      for (var i = 0; i < listItems.length; i++)
      {
        foodIds.push(listItems[i].id);
        var foodData = JSON.parse($(listItems[i]).attr("data")); //Get food data from list item

        for (n in foodData.nutrition)
        {
          nutrition[n] = nutrition[n] || 0;
          nutrition[n] += foodData.nutrition[n];
        }
      }

      console.log(nutrition);

      var data = {"dateTime":dateTime, "name":name, "foodIds":foodIds};
      if (!isNaN(id)) {data.id = id} //If there is an ID add it to the data object

      //Add/update food item
      /*if (data.id == undefined){
        dbHandler.insert(data, "meals").onsuccess = function(){resolve();}
      }
      else {
        dbHandler.update(data, "meals", id)
        .then(resolve());
      }*/
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
        html += "<ons-list-item id='"+mealItems[i].id+"' data='"+JSON.stringify(mealItems[i])+"'>";
        html += "<ons-row>" + unescape(mealItems[i].name) + "</ons-row>";
      //  html += "<ons-row style='color:#636363;'><i>" + mealItems[i].nutrition.calories + " " + app.strings["calories"] + "</i></ons-row>";
        html += "</ons-list-item>";
      }

      $("#meals ons-list#meal-list").html(html);
    });
  }

}

//Show meals page
$(document).on("show", "ons-page#meals", function(){

  $("#meals ons-progress-circular").hide(); //Hide progress indicator by default

  meals.renderMealsList();

});

//Show edit meal form
$(document).on("show", "#edit-meal", function(){

  meals.validateEditForm();

  if (this.data.foodIds)
  {
    $("#edit-meal #submit").show();
    meals.getFoods(this.data.foodIds)
    .then(foods => meals.renderFoodList(foods));
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

//Submit edit form
$(document).on("click", "#edit-meal #submit", function(){
  meals.update()
  .then(nav.popPage());
});
