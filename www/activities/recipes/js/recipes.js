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
var recipes = {

  list:[],

  fillList : function()
  {
    var items = $("#recipes #recipe-list ons-list-item"); //Get all list items

    for (var i = 0; i < items.length; i++)
    {
        var itemData = JSON.parse($(items[i]).attr("data"));
        recipes.list.push(itemData);
    }
  },

  filterList : function(term)
  {
    return list = recipes.list.filter(function (el) {
      if (el.name) return (el.name.match(new RegExp(term, "i"))); //Allow partial match and case insensitive
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

  //Takes data of a food item and adds it to the recipe's list
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
      $("#edit-recipe #recipe-data #id").val(data.id); //Hidden field
      $("#edit-recipe #recipe-data #name").val(unescape(data.name));
      $("#edit-recipe #recipe-data #quantity").val(parseFloat(data.portion));
      $("#edit-recipe #recipe-data #unit").val(data.portion.replace(/[0-9]/g, ''));
      $("#edit-recipe #recipe-data #notes").val(unescape(data.notes));

      var foods = data.foods;
      for (var i = 0; i < foods.length; i++)
      {
        //Display food items
        $("#edit-recipe ons-list#foods").append(recipes.renderFoodItem(foods[i]));
        recipes.renderTotalNutrition(recipes.getTotalNutrition());
      }
    });
  },

  //Grabs the onsen list of food items and saves them to the recipes database store
  update : function()
  {
    return new Promise(function(resolve, reject){
      var dateTime = new Date()

      var id = parseInt($("#edit-recipe #recipe-data #id").val()); //Hidden field
      var nutrition = JSON.parse($("#edit-recipe #recipe-data #nutrition").val()); //Hidden field
      var name = escape($("#edit-recipe #recipe-data #name").val());
      var quantity = escape($("#edit-recipe #recipe-data #quantity").val());
      var unit = escape($("#edit-recipe #recipe-data #unit").val());
      var notes = escape($("#edit-recipe #recipe-data #notes").val());
      var foods = [];

      //Add a space at the begining of unit, unless it is usually displayed without a leading space
      unit = unit.trim(); //Remove any whitespace
      if (app.standardUnits.indexOf(unit) == -1) unit = " " + unit; //Add space if unit is not standard

      var listItems = $("#edit-recipe #foods ons-list-item"); //Get food items list

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

      var data = {"dateTime":dateTime, "name":name, "foods":foods, "portion":quantity+unit,"notes":notes, "nutrition":nutrition};
      if (isNaN(id) == false) {data.id = id} //If there is an ID add it to the data object

      dbHandler.insert(data, "recipes").onsuccess = function(){resolve();} //Insert/update the record
    });
  },

  //Validates the edit recipe page
  validateEditForm : function()
  {
    if ($("#edit-recipe #foods ons-list-item").length > 0 &&
    $("#edit-recipe #recipe-data #name").val() != "" &&
    $("#edit-recipe #recipe-data #quantity").val() > 0 &&
    $("#edit-recipe #recipe-data #unit").val() != "")
    {
      $("#edit-recipe #submit").show();
    }
    else
    {
      $("#edit-recipe #submit").hide();
    }
  },

  fillListFromDB : function()
  {
    return new Promise(function(resolve, reject){
      dbHandler.getAllItems("recipes")
      .then(function(items){
        recipes.list = items;
        resolve();
      });
    });
  },

  //Gets all recipes from the database and displays them as an onsen list
  renderRecipesList : function(list)
  {
    var html = "";

    for (var i = 0; i < list.length; i++)
    {
      html += "<ons-list-item tappable modifier='longdivider' id='"+list[i].id+"' data='"+JSON.stringify(list[i])+"'>";
      html += "<label class='right'>";
      html += "<ons-checkbox name='recipe-checkbox' input-id='recipe"+i+"' data='"+JSON.stringify(list[i])+"'></ons-checkbox>";
      html += "</label>";
      html += "<label for='recipe"+i+"' class='center'>";
      html += "<ons-row>" + unescape(list[i].name) + "</ons-row>";
      html += "<ons-row style='color:#636363;'><i>" + list[i].portion + ", " + list[i].nutrition.calories.toFixed(0) + " " + app.strings["calories"] + "</i></ons-row>";
      html += "</label>";
      html += "</ons-list-item>";
    }

    $("#recipes ons-list#recipe-list").html(html);
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

    var html = recipes.renderFoodItem(data); //Regenerate the html for this list item
    $(listItem).replaceWith(html); //Replace list item with updated html
  },

  //Totals up the nutritional value of all of the items in the edit list
  getTotalNutrition : function()
  {
    var listItems = $("#edit-recipe #foods ons-list-item"); //Get all list items
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

    $("#edit-recipe #recipe-data #nutrition").val(JSON.stringify(nutrition)); //Store nutritional data in hidden form field
    return nutrition;
  },

  //Renders the passed nutrition object to the screen
  renderTotalNutrition : function(nutrition)
  {
    for (n in nutrition)
    {
      n == "calories" ? $("#edit-recipe #"+n).html(nutrition[n].toFixed(0)) : $("#edit-recipe #"+n).html(nutrition[n].toFixed(1) + "g");
    }
  },

  localize : function()
  {
    $("#recipes #filter").attr("placeholder", app.strings["recipes"]["filter"]);
    $("#edit-recipe #recipe-data #name").attr("placeholder", app.strings["recipes"]["edit-recipe"]["placeholders"]["name"]);
    $("#edit-recipe #recipe-data #notes").attr("placeholder", app.strings["recipes"]["edit-recipe"]["placeholders"]["notes"]);
  }
}

//Show recipes page
$(document).on("show", "ons-page#recipes", function(){

  //Hide the menu button or back button depending on where the page is in the navigator stack
  nav.pages.length > 1 ? $("#recipes #menu-button").hide() : $("#recipes ons-back-button").hide(); //Hide button based on context

  //Hide submit button
  $("#recipes #submit").hide();

  recipes.localize();

  recipes.fillListFromDB()
  .then(function(){recipes.renderRecipesList(recipes.list)});
});

//@Todo Double tap on recipe item
$(document).on("dblclick", "#recipes #recipe-list ons-list-item", function(){
  var control = this;
  var data = JSON.parse($(this).attr("data"));
});

//Delete/Edit recipe
$(document).on("hold", "#recipes #recipe-list ons-list-item", function(){

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
      nav.pushPage("activities/recipes/views/edit-recipe.html", {"data":data});
    }
    else if (input == 1) //Delete
    {
      //Show confirmation dialog
      ons.notification.confirm(app.strings["dialogs"]["confirm-delete"])
      .then(function(input) {
        if (input == 1) {//Delete was confirmed
          $(control).remove(); //Remove the list item
          recipes.fillList(); //Update recipes list
          var request = dbHandler.deleteItem(parseInt(control.id), "recipes");
        }
      });
    }
  });
});

//Checkbox selection
$(document).on("change", "#recipes #recipe-list ons-checkbox", function(e){
  var checked = $("#recipes #recipe-list input[name=recipe-checkbox]:checked"); //Get all checked items
  checked.length > 0 ? $("#recipes #submit").show() : $("#recipes #submit").hide();
});

//Add recipes to diary
$(document).on("tap", "#recipes #submit", function(){

  var recipes = $("#recipes #recipe-list input[name=recipe-checkbox]:checked"); //Get selected recipe checkboxes

  if (recipes.length > 0)
  {
    for (var i = 0; i < recipes.length; i++) //Each recipe
    {
      var data = JSON.parse(recipes[i].offsetParent.attributes.data.value); //Recipe data

      var item = {
        "name":data.name,
        "recipeId":data.id,
        "nutrition":data.nutrition,
        "portion":data.portion,
        "quantity":1
      };

      diary.addEntry(item);
    }
    nav.resetToPage("activities/diary/views/diary.html"); //Switch to diary page
  }

});

//Initialise recipe edit page
$(document).on("init", "ons-page#edit-recipe", function(){
  $("#edit-recipe ons-list#foods").append(""); //Clear list
});

//Show edit recipe form
$(document).on("show", "#edit-recipe", function(){

  recipes.localize();
  recipes.validateEditForm();
  $("#edit-recipe #title").html(app.strings["recipes"]["edit-recipe"]["title1"]); //Default title

  if (this.data.foodIds) //Food ids passed from food list
  {
    recipes.getFoods(this.data.foodIds)
    .then(function(foods)
    {
      for (var i = 0; i < foods.length; i++)
      {
        //Display food items
        $("#edit-recipe ons-list#foods").append(recipes.renderFoodItem(foods[i]));
        recipes.renderTotalNutrition(recipes.getTotalNutrition());
      }
      recipes.validateEditForm();
    });
  }
  else if (this.data.id) //Recipe data for existing recipe
  {
    $("#edit-recipe #title").html(app.strings["recipes"]["edit-recipe"]["title2"]);
    recipes.fillEditForm(this.data) //Populate edit screen with data
    .then(() => recipes.validateEditForm());
  }

  this.data = {};
});

//Delete food from recipe
$(document).on("hold", "#edit-recipe #foods ons-list-item", function(){

  var control = this; //The control that triggered the callback

  //Show confirmation dialog
  ons.notification.confirm(app.strings["dialogs"]["confirm-delete"])
  .then(function(input) {
    if (input == 1) {//Delete was confirmed
      $(control).remove(); //Remove the list item
      recipes.renderTotalNutrition(recipes.getTotalNutrition());
      recipes.validateEditForm();
    }
  });
});

//Tap on food item
$(document).on("click", "#edit-recipe #foods ons-list-item", function(e){

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
      recipes.changePortion(control, input, unit)
      recipes.renderTotalNutrition(recipes.getTotalNutrition());
    }
  });
});

//Submit edit form
$(document).on("tap", "#edit-recipe #submit", function(){
  recipes.update()
  .then(() => nav.popPage());
});

//List filter
$(document).on("keyup", "#recipes #filter", function(e){

  $("#recipes #submit").hide();

  if (this.value == "") //Search box cleared, reset the list
  {
    recipes.fillListFromDB()
    .then(function(){
      recipes.renderRecipesList(recipes.list);
    });
  }
  else { //Filter the list
    var filteredList = recipes.filterList(this.value);
    recipes.renderRecipesList(filteredList);
  }

});
