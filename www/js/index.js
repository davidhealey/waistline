/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

  storage:{}, //Local storage
  date: new Date(), //Diary date selected by user
  caloriesConsumed:0, //Calories consumed for selected date

  // Application Constructor
  initialize: function() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

      this.storage = window.localStorage; //Simple storage object
      dbHandler.initializeDb(); //db-handler initialization

      //Set default values for weight and calorie goal
      if (this.storage.getItem("weight") == undefined)
      {
        this.storage.setItem("weight", 65);
      }

      if (this.storage.getItem("calorieGoal") == undefined)
      {
        this.storage.setItem("calorieGoal", 2000);
      }
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    changeDate(app.date); //Default to current date
  },
};

app.initialize();

/***** MISC FUNCTIONS *****/
//Takes a date or date string and returns date object with time set to midnight, accounting for time zone
function getDateAtMidnight(date)
{
  newDate = new Date(date);
  newDate.setHours(0-(newDate.getTimezoneOffset()/60), 0, 0, 0);
  return newDate;
}

function updateProgress()
{
    var goal = parseFloat(app.storage.getItem("calorieGoal"));
    var calories = parseFloat(app.caloriesConsumed);
    var percentage = Math.min(100, calories * 100 / goal);
    var progressBar = $(".calorieCount");

    //Progress bar
    if (app.storage.getItem("goalIsMin") == "false")
    {
      calories > goal ? progressBar.css("background-color", "red") : progressBar.css("background-color", "green");
      calories > goal ? $(".statusBar .ui-block-c.stat").css("color", "red") : $(".statusBar .ui-block-c.stat").css("color", "green")
    }
    else
    {
      calories < goal ? progressBar.css("background-color", "red") : progressBar.css("background-color", "green");
      calories < goal ? $(".statusBar .ui-block-c.stat").css("color", "red") : $(".statusBar .ui-block-c.stat").css("color", "green")
    }

    progressBar.css("width", percentage+"%");

    //Footer stats
    $(".statusBar .ui-block-a.stat").html(goal);
    $(".statusBar .ui-block-b.stat").html(calories);
    $(".statusBar .ui-block-c.stat").html(goal-calories);

    //Store consumed calories in local storage for restore next time app is opened
    app.storage.setItem("calories", calories);
}

function updateLog()
{
  var dateTime = getDateAtMidnight(app.date); //Primary key - always set to midnight: one log per day
  var calories = parseFloat(app.caloriesConsumed);
  var calorieGoal = parseInt(app.storage.getItem("calorieGoal"));
  var caloriesLeft = parseFloat(calorieGoal - calories);
  var weight = parseFloat(app.storage.getItem("weight"));

  var data = {"dateTime":dateTime, "calories":calories, "calorieGoal":calorieGoal, "caloriesLeft":caloriesLeft, "weight":weight};
  var request = dbHandler.insert(data, "log"); //Add/update log entry

  request.onsuccess = function(e){
    console.log("Log updated");
  };
}

function changeDate(date)
{
  app.date = new Date(date);

  $("#diaryDate").html("<h4>"+app.date.toDateString()+"</h4>"); //Update date display

  //Update the app.caloriesConsumed variable for the new date
  var date = getDateAtMidnight(app.date);
  var request = dbHandler.getItem(date, "log");

  request.onsuccess = function(e)
  {
    app.caloriesConsumed = 0; //Reset
    if (e.target.result) {app.caloriesConsumed = e.target.result.calories;}
    updateProgress();
  }
}

/***** STATISTICS PAGE *****/
$("#statsPage").on("pagebeforeshow", function(){
  updateStats();
})

$("#statsPage #range").on("change", function(){
  updateStats();
})

/*Clear the weight log list when moving away from the stats page*/
$("#statsPage").on("pagehide", function(e){
  $("#statsPage #weightLog").html("");
  $("#statsPage #weightLog").listview("refresh");
});

function updateStats()
{
  var range = $("#statsPage #range").val();
  var fromDate = new Date();
  var toDate = new Date(Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), fromDate.getHours(), fromDate.getMinutes(), fromDate.getSeconds())); //JS dates are shit

  switch (range)
  {
    case "week": fromDate.setDate(fromDate.getDate()-7); break;
    case "month": fromDate.setMonth(fromDate.getMonth()-1); break;
    case "3month": fromDate.setMonth(fromDate.getMonth()-3); break;
    case "6month": fromDate.setMonth(fromDate.getMonth()-6); break;
    case "12month": fromDate.setMonth(fromDate.getMonth()-12); break;
  }

  var os = dbHandler.getObjectStore("log"); //Get date index from log store

  var dates = [];
  var weights = [];
  var calories = [];
  var html = "";

  os.openCursor(IDBKeyRange.bound(fromDate, toDate), "prev").onsuccess = function(e)
  {
    var cursor = e.target.result;
    if (cursor)
    {
      dates.push(cursor.value.dateTime.toLocaleDateString());
      weights.push(cursor.value.weight);
      calories.push(cursor.value.calories);

      //Build list view
      html += "<li>" + cursor.value.dateTime.toLocaleDateString();
      html += "<p>" + cursor.value.weight + " kg</p>";
      html += "<p>" + cursor.value.calories + " Calories</p>";
      html += "</li>";

      cursor.continue();
    }
    else
    {
      //Draw chart
      var ctx = $("#weightChart");
      var weightChart = new Chart(ctx, {
        type:"line",
        data:
        {
          labels:dates,
          datasets: [
          {
            label:"Weight (kg)",
            data: weights,
            backgroundColor: "rgba(255,13,0,0.4)"
          },
          {
            label:"Calories (kcal)",
            data: calories,
            backgroundColor: "rgba(255,153,0,0.4)",
            hidden:true
          }]
        }
      });

      //Populate listview
      $("#weightLog").html(html); //Insert into HTML
      $("#weightLog").listview("refresh");
    }
  };
}

/***** DIARY PAGE *****/
function populateDiary()
{
  //Get selected date (app.date) at midnight
  var fromDate = getDateAtMidnight(app.date);

  //Get day after selected date at midnight
  var toDate = new Date(fromDate);
  toDate.setDate(toDate.getDate()+1);

  //Pull record from the database for the selected date and add items to the list
  var index = dbHandler.getIndex("dateTime", "diary"); //Get date index from diary store
  var calorieGoal = app.storage.getItem("calorieGoal");
  var html = "";

  //Strings of html for each category - prepopulated with category dividers
  var list = {
    breakfast:"<li class='diaryDivider' id='Breakfast' data-role='list-divider'>Breakfast<span></span></li>",
    lunch:"<li class='diaryDivider' id='Lunch' data-role='list-divider'>Lunch<span></span></li>",
    dinner:"<li class='diaryDivider' id='Dinner' data-role='list-divider'>Dinner<span></span></li>",
    snacks:"<li class='diaryDivider' id='Snacks' data-role='list-divider'>Snacks<span></span></li>"
  };

  var calorieCount = {"breakfast":0, "lunch":0, "dinner":0, "snacks":0}; //Calorie count for breakfast, lunch, dinner, snacks

  index.openCursor(IDBKeyRange.bound(fromDate, toDate)).onsuccess = function(e)
  {
    var cursor = e.target.result;
    if (cursor)
    {
      //Build HTML
      html = ""; //Reset variable
      html += "<li class='diaryItem' id='"+cursor.value.id+"' category='"+cursor.value.category+"'>";
      html += "<a data-details='"+JSON.stringify(cursor.value)+"'>"+cursor.value.name + " - " + cursor.value.portion;
      html += "<p>"+cursor.value.quantity + " Servings, " + cursor.value.quantity * cursor.value.calories+" Calories" + "</p>";
      html += "</a>";
      html += "</li>";

      switch (cursor.value.category)
      {
        case "Breakfast":
          list.breakfast += html;
          calorieCount.breakfast += cursor.value.calories * cursor.value.quantity;
          break;
        case "Lunch":
          list.lunch += html;
          calorieCount.lunch += cursor.value.calories * cursor.value.quantity;
          break;
        case "Dinner":
          list.dinner += html;
          calorieCount.dinner += cursor.value.calories * cursor.value.quantity;
          break;
        default: //Snacks
          list.snacks += html;
          calorieCount.snacks += cursor.value.calories * cursor.value.quantity;
        break;
      }
      cursor.continue();
    }
    else
    {
      $("#diaryListview").html(list.breakfast + list.lunch + list.dinner + list.snacks); //Insert into HTML
      $("#diaryListview #Breakfast span").html(" - " + calorieCount.breakfast + " Calories");
      $("#diaryListview #Lunch span").html(" - " + calorieCount.lunch + " Calories");
      $("#diaryListview #Dinner span").html(" - " + calorieCount.dinner + " Calories");
      $("#diaryListview #Snacks span").html(" - " + calorieCount.snacks + " Calories");
      $("#diaryListview").listview("refresh");
    }
  };
}

//When the date on the diary page is clicked, go to the current date
$("#diaryPage #diaryDate").on("click", function(e){
  var date = new Date();
  changeDate(date);
  populateDiary();
});

$("#diaryPage").on("pagebeforeshow", function(e){
  populateDiary();
});

//Bind diary category items
$("#diaryPage").on("click", ".diaryDivider", function(e){
  $("#foodListPage #category").val($(this).attr("id")); //Set hidden field on food list page
  $(":mobile-pagecontainer").pagecontainer("change", "#foodListPage");
});

//Bind on swipeleft to diaryPage
$("#diaryPage").on("swipeleft", function(e){
  app.date.setDate(app.date.getDate()+1);
  changeDate(app.date);
  populateDiary();
});

//Bind on swiperight to diary page
$("#diaryPage").on("swiperight", function(e){
  app.date.setDate(app.date.getDate()-1);
  changeDate(app.date);
  populateDiary();
});

//Bind on taphold to diary list item link
$("#diaryListview").on("taphold", ".diaryItem a", function(e){
  var details = $(this).data("details");

  $("#deleteDiaryListItemPopup button").attr("id", details.id); //Set delete button's ID to foot item ID
  $("#deleteDiaryListItemPopup button").attr("calories", details.calories); //Set delete button's ID to foot item ID
  $("#deleteDiaryListItemPopup").popup("open");
});

//Bind to diary popup delete button
$("#deleteDiaryListItemPopup button").click(function(){
  var id = $(this).attr("id"); //Get the diary item ID from the delete button ID
  app.caloriesConsumed -= parseFloat($(this).attr("calories")); //Update app-wide caloriesConsumed variable

  var request = dbHandler.deleteItem(parseInt(id), "diary"); //Remove the item from the foodList table and get the request handler

  //If the request was successful repopulate the list
  request.onsuccess = function(e) {
    populateDiary();
    updateLog(); //Update the log entry
    updateProgress();
  };

  $("#deleteDiaryListItemPopup").popup("close"); //Close the popup (regardless of if the deletion was successul)
});

//Bind on click to diary list item link to open edit page
$("#diaryListview").on("click", ".diaryItem a", function(e){
  var details = $(this).data("details");

  //Populate diary item edit form
  $("#editDiaryItemPage #id").val(details.id); //Add item id to hidden field
  $("#editDiaryItemPage #diaryItemName").html(details.name + " - " + details.portion);
  $("#editDiaryItemPage #portion").val(details.portion);
  $("#editDiaryItemPage #caloriesDisplay").html(details.calories * details.quantity);
  $("#editDiaryItemPage #caloriesPerPortion").html(details.portion + " = " + details.calories + " Calories");
  $("#editDiaryItemPage #calories").val(details.calories);
  $("#editDiaryItemPage #quantity").val(details.quantity);
  $("#editDiaryItemPage #category").val(details.category);

  $(":mobile-pagecontainer").pagecontainer("change", "#editDiaryItemPage"); //Go to edit food page
});

//Bind to quanity box on diaryItemEditForm
$("#editDiaryItemForm #quantity").on("change paste keyup", function(e){
  var calories = $("#editDiaryItemForm #calories").val(); //Pull calories from hidden field
  var quantity = $("#editDiaryItemForm #quantity").val();

  $("#editDiaryItemPage #caloriesDisplay").text(parseFloat(calories * quantity)); //Update calories display
});

function editDiaryItemFormAction()
{
  var id = parseInt($("#editDiaryItemForm #id").val()); //Get item id from hidden field
  var quantity = parseFloat($("#editDiaryItemForm #quantity").val());
  var category = $("#editDiaryItemForm #category").val();

  var getRequest = dbHandler.getItem(id, "diary"); //Pull record from DB

  getRequest.onsuccess = function(e) //Once we get the db result
  {
    var item = e.target.result; //Get the item from the request
    var oldCalorieCount = item.calories * item.quantity; //The old calorie count, to be removed from the global count if everything goes well

    //Update the values in the item
    item.quantity = quantity;
    item.category = category;

    var putRequest = dbHandler.insert(item, "diary"); //Update the item in the db

    putRequest.onsuccess = function(e) //The item was upated
    {
      app.caloriesConsumed -= oldCalorieCount; //Decrement the old values from the calorie count
      app.caloriesConsumed += item.calories * quantity; //Add on new calories

      populateDiary(); //Repopulate the diary
      updateLog();
      updateProgress();

      $(":mobile-pagecontainer").pagecontainer("change", "#diaryPage"); //Go to diary page
    }
  }
}

/***** FOOD LIST PAGE *****/
//Initialize page
$("#foodListPage").on("pagebeforeshow", function(event, ui)
{
  var html = "";
  var date = new Date()
  var dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())); //JS dates are shit

  //Create list of food items (sorted by timestamp) and insert into HTML
  var index = dbHandler.getIndex("dateTime", "foodList"); //Get timestamp index
  index.openCursor(IDBKeyRange.upperBound(dateTime), "prev").onsuccess = function(e)
  {
    var cursor = e.target.result;

    if (cursor)
    {
      cursor.continue();

      html += "<li class='foodListItem' id='"+cursor.value.id+"'>"; //Add class and ID
      html += "<a class='addToDiary' data-details='"+ JSON.stringify(cursor.value) +"'>"+cursor.value.name + " - " + cursor.value.portion;
      html += "<p>" + cursor.value.calories+" Calories</p>";
      html += "</a>";
      html += "<a class='editFood' data-details='"+ JSON.stringify(cursor.value) +"'></a>";
      html += "</li>";
    }
    else
    {
      $("#foodListview").html(html); //Insert into HTML
      $("#foodListview").listview("refresh");
    }
  };
});

/*Clear the list when moving away from the food list page*/
$("#foodListPage").on("pagehide", function(e){
  $("#foodListPage #foodListview").html("");
  $("#foodListview").listview("refresh");
});

//Bind on click to food item's addToDiary links in the listview
$("#foodListview").on("click", ".addToDiary", function(e){

  var details = $(this).data("details");

  //Add the food to the diary store
  var dateTime = new Date(Date.UTC(app.date.getFullYear(), app.date.getMonth(), app.date.getDate(), app.date.getHours(), app.date.getMinutes(), app.date.getSeconds())); //JS dates are shit
  var foodId = details.id;
  var name = details.name;
  var portion = details.portion;
  var quantity = parseFloat(details.quantity);
  var calories = parseFloat(details.calories);
  var category = $("#foodListPage #category").val(); //Hidden field

  console.log(dateTime);

  //If no category is provided, determine it based on time of day
  if (category == "")
  {
    var hour = app.date.getHours();
    switch (true)
    {
      case ((hour > 5) && (hour < 12)):
        category = "Breakfast";
      break;

      case ((hour > 11) && (hour < 15)):
        category = "Lunch";
      break;

      case ((hour > 14) && (hour < 17)):
        category = "Snacks";
      break;

      case ((hour > 16) && (hour < 20)):
        category = "Dinner";
      break;

      case ((hour > 19) || (hour < 6)):
        category = "Snacks";
      break;
    }
  }

  var diaryData = {"dateTime":dateTime, "name":name, "portion":portion, "quantity":quantity, "calories":calories, "category":category, "foodId":foodId};
  var request = dbHandler.insert(diaryData, "diary"); //Add item to diary

  request.onsuccess = function(e)
  {
    populateDiary();

    //Update app variable and log
    app.caloriesConsumed += calories*quantity;

    updateLog();
    updateProgress();

    //Update food item's dateTime (to show when food was last referenced)
    var foodData = {"id":foodId, "dateTime":new Date(), "name":name, "portion":portion, "quantity":quantity, "calories":calories};
    dbHandler.insert(foodData, "foodList");

    //Reset category field
    $("#foodListPage #category").val("");
  }

  $(":mobile-pagecontainer").pagecontainer("change", "#diaryPage");
});

//Bind on taphold to food item's addToDiary links in the listview
$("#foodListview").on("taphold", ".addToDiary", function(e){
  var details = $(this).data("details");
  $("#deleteFoodListItemPopup button").attr("id", details.id); //Set delete button's ID to food item ID
  $("#deleteFoodListItemPopup").popup("open");
});

//Bind on click to food item's delete button
$("#deleteFoodListItemPopup button").click(function(){
  var id = $(this).attr("id"); //Get the food item ID from the delete button ID

  var request = dbHandler.deleteItem(parseInt(id), "foodList"); //Remove the item from the foodList table and get the request handler

  //If the request was successful remove the item from the list
  request.onsuccess = function(e) {
    $("#"+id+".foodListItem").remove(); //Remove the item from the list
    $("#foodListview").listview("refresh");
  };

  $("#deleteFoodListItemPopup").popup("close"); //Close the popup (regardless of if the deletion was successul)
});

//Bind on click to food item's editFood links in the listview
$("#foodListview").on("click", ".editFood", function(e){
  var details = $(this).data("details");
  $("#editFoodPage h1").text("Edit Food"); //Change page title
  populateEditFoodForm(details);
  $(":mobile-pagecontainer").pagecontainer("change", "#editFoodPage", {'details': details}); //Pass data to edit food page
});

//Bind on click to food item's addFood to diary link
$("#foodListPage").on("click", "#addFood", function(e){
  $("#editFoodPage h1").text("Add Food"); //Change page title
  populateEditFoodForm({"quantity":1}); //Clear the edit form - default quantity = 1
  $(":mobile-pagecontainer").pagecontainer("change", "#editFoodPage"); //Go to edit food page
});

/***** EDIT FOOD PAGE *****/
function addFoodFormAction()
{
  //Get form values
  var id = parseInt($("#editFoodForm #foodId").val()); //Id is hidden field
  var date = new Date()
  var dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())); //JS dates are shit
  var name = $('#editFoodPage #foodName').val();
  var portion = $('#editFoodPage #foodPortion').val();
  var quantity = 1;
  var calories = parseFloat($('#editFoodPage #foodCalories').val());

  var data = {"dateTime":dateTime, "name":name, "portion":portion, "quantity":quantity, "calories":calories};

  if (isNaN(id) == false) {data.id = id}; //Add ID for existing items

  var request = dbHandler.insert(data, "foodList"); //Add/update food item

  $(":mobile-pagecontainer").pagecontainer("change", "#foodListPage"); //Go to food list
}

function populateEditFoodForm(data)
{
  //Populate the edit form with passed data
  $('#editFoodPage #foodId').val(data.id);
  $('#editFoodPage #foodName').val(data.name);
  $('#editFoodPage #foodPortion').val(data.portion);
  $('#editFoodPage #foodCalories').val(data.calories);
  if (app.storage.getItem("scanImages") == "true") {$('#editFoodPage img').attr("src", data.image_url);}

  //Only show scan button when adding a new food
  var scanButton = $("#editFoodPage .ui-icon-camera");
  isNaN(data.id) == false ? scanButton.css("display", "none") : scanButton.css("display", "block");
}

//For scanning barcodes
function scan()
{
  cordova.plugins.barcodeScanner.scan(
     function (result) {

       var code = result.text;
       var request = new XMLHttpRequest();

       request.open("GET", "https://world.openfoodfacts.org/api/v0/product/"+code+".json", true);
       request.send();

       request.onreadystatechange = function(){
         processBarcodeResponse(request);
       };
     },
     function (e) {
         alert("Scanning failed: " + error);
     }
  );
}

//For testing the barcode scanner manually
function testscan()
{
  var code = "3366321051983";

  var request = new XMLHttpRequest();

  request.open("GET", "https://world.openfoodfacts.org/api/v0/product/"+code+".json", true);
  request.send();

  request.onreadystatechange = function(){
    processBarcodeResponse(request);
  };
}

function processBarcodeResponse(request)
{
  if (request.readyState == 4 && request.status == 200)
  {
    var result = jQuery.parseJSON(request.responseText);
    console.log(result);

    if (result.status == 0) //Product not found
    {
      alert("Product not found. You can add it with the Open Food Facts app");
    }
    else if (result.status == 1) //Product found
    {
      //Get the data for the add food form
      var product = result.product;

      var data = {"name":product.product_name, "quantity":1, "calories":parseInt(product.nutriments.energy_value), "image_url":product.image_url};

      //Get best match for portion/serving size
      if (product.serving_size)
      {
        data.portion = product.serving_size.replace(/\s+/g, ''); //Remove white space
        data.calories = parseInt(parseFloat(product.nutriments.energy_value) / 100 * parseFloat(product.serving_size)); //Get calories for portion
      }
      else if (product.nutrition_data_per)
      {
        data.portion = product.nutrition_data_per;
      }
      else if (product.quantity)
      {
        data.portion = product.quantity;
      }

      //If energy is given in kJ convert to kcal
      if (product.nutriments.energy_unit == "kJ")
      {
        data.calories = parseInt(data.calories / 4.15);
      }

      populateEditFoodForm(data);
    }
  }
}

/***** SETTINGS PAGE *****/
//Initialize settings page
$("#settingsPage").on("pagebeforeshow", function(event, ui)
{
  //Populate settings form from local storage
  $('#settingsPage #weight').val(app.storage.getItem("weight"));
  $('#settingsPage #calorieGoal').val(app.storage.getItem("calorieGoal"));
  $('#settingsPage #goalIsMin').prop("checked", app.storage.getItem("goalIsMin") == "true").checkboxradio('refresh');
  $('#settingsPage #scanImages').prop("checked", app.storage.getItem("scanImages") == "true").checkboxradio('refresh');
});

//Save user's settings
function saveUserSettings()
{
  app.storage.setItem("weight", $('#settingsPage #weight').val());
  app.storage.setItem("calorieGoal", $('#settingsPage #calorieGoal').val());
  app.storage.setItem("goalIsMin", $("#settingsPage #goalIsMin").prop("checked"));
  app.storage.setItem("scanImages", $("#settingsPage #scanImages").prop("checked"));

  updateLog();
  updateProgress();

  $(":mobile-pagecontainer").pagecontainer("change", "#home");
}
