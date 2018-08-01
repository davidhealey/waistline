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

  renderList : function(foods)
  {
    return new Promise(function(resolve, reject){
      var date = new Date()
      var dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

      var html = "";
      for (var i = 0; i < foods.length; i++)
      {
        html += "<ons-list-item id='"+i+"' data='"+JSON.stringify(foods[i])+"'>";
        html += "<ons-row>" + unescape(foods[i].brand) + "</ons-row>";
        html += "<ons-row>" + unescape(foods[i].name) + " - " + foods[i].portion + "</ons-row>";
        html += "<ons-row style='color:#636363;'><i>" + foods[i].nutrition.calories + " " + app.strings["calories"] + "</i></ons-row>";
        html += "</ons-list-item>";
      }

      $("#edit-meal ons-list#foods").html(html);

    });
  },

}

$(document).on("show", "#edit-meal", function(){

  $("#edit-meal #submit").hide(); //Hide submit button until foods are added
  if (this.data.foodIds)
  {
    $("#edit-meal #submit").show();
    meals.getFoods(this.data.foodIds)
    .then(foods => meals.renderList(foods));
  }

});
