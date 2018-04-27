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
  selectedDate: new Date(), //Diary date selected by user
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
    if (this.storage.getItem("calories") != null) this.caloriesConsumed = this.storage.getItem("calories"); //Restore calories consumed
    $("#diaryDate").html(this.selectedDate.toDateString()); //Default diary date
    updateProgress();
  },
};

app.initialize();

/***** MISC FUNCTIONS *****/
function updateProgress()
{
    var goal = parseFloat(app.storage.getItem("calorieGoal"));
    var calories = parseFloat(app.caloriesConsumed);
    var percentage = Math.min(100, calories * 100 / goal);
    var progressBar = $(".calorieCount");

    //Progress bar
    calories > goal ? progressBar.css("background-color", "red") : progressBar.css("background-color", "green");
    progressBar.css("width", percentage+"%");

    //Footer stats
    $("#statusBar .ui-block-a.stat").html(goal);
    $("#statusBar .ui-block-b.stat").html(calories);
    $("#statusBar .ui-block-c.stat").html(goal-calories);

    calories > goal ? $("#statusBar .ui-block-c.stat").css("color", "red") : $("#statusBar .ui-block-c.stat").css("color", "green")

    //Store consumed calories in local storage for restore next time app is opened
    app.storage.setItem("calories", calories);
}

function updateLog()
{
  var date = app.selectedDate.toLocaleDateString(); //Primary key
  var calories = parseFloat(app.caloriesConsumed);
  var calorieGoal = parseInt(app.storage.getItem("calorieGoal"));
  var caloriesLeft = parseFloat(calorieGoal - calories);
  var weight = parseFloat(app.storage.getItem("weight"));

  var data = {"date":date, "calories":calories, "calorieGoal":calorieGoal, "caloriesLeft":caloriesLeft, "weight":weight};
  var request = dbHandler.insert(data, "log"); //Add/update log entry

  request.onsuccess = function(e){
    console.log("Log updated");
  };
}

/***** STATISTICS PAGE *****/
$("#statsPage").on("pagecreate", function(e){

  var ctx = document.getElementById("canvas").getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [{
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });

});

/***** DIARY PAGE *****/
//Page create action
$("#diaryPage" ).on("pagecreate", function(e){
    populateDiary();
})

function populateDiary()
{
  var date = app.selectedDate.toDateString(); //Format the currently selected date for db selection

  //Pull record from the database for the selected date and add items to the list
  var index = dbHandler.getIndex("date", "diary"); //Get date index from diary store
  var html = "";
  app.caloriesConsumed = 0; //Reset calorie consumption count
  var calorieGoal = app.storage.getItem("calorieGoal");

  index.openCursor(IDBKeyRange.only(date)).onsuccess = function(e)
  {
    var cursor = e.target.result;
    if (cursor)
    {
      html += "<li class='diaryItem' id='"+cursor.value.id+"'>";
      html += "<a data-details='"+JSON.stringify(cursor.value)+"'>"+cursor.value.name;
      html += "<p>"+cursor.value.quantity * cursor.value.calories+" Calories</p>";
      html += "</a>";
      html += "</li>";

      app.caloriesConsumed += cursor.value.quantity * cursor.value.calories; //Add up calories consumed
      cursor.continue();
    }
    else
    {
      updateProgress();
      $("#diaryListview").html(html); //Insert into HTML
      $("#diaryListview").listview("refresh");
    }
  };
}

//Diary page before show
//Bind on swipeleft to diaryPage
$("#diaryPage").on("swipeleft", function(e){
  app.selectedDate.setDate(app.selectedDate.getDate()+1);
  $("#diaryDate").html(app.selectedDate.toDateString());
  populateDiary();
});

//Bind on swiperight to diary page
$("#diaryPage").on("swiperight", function(e){
  app.selectedDate.setDate(app.selectedDate.getDate()-1);
  $("#diaryDate").html(app.selectedDate.toDateString());
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

  //If the request was successful remove the item from the list
  request.onsuccess = function(e) {
    $("#"+id+".diaryItem").remove(); //Remove the item from the list
    $("#diaryListview").listview("refresh");
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
  $("#editDiaryItemPage h1").html(details.name);
  $("#editDiaryItemPage #portion").html(details.portion);
  $("#editDiaryItemPage #caloriesDisplay").html(details.calories * details.quantity);
  $("#editDiaryItemPage #calories").val(details.calories);
  $("#editDiaryItemPage #quantity").val(details.quantity);
  $("#editDiaryItemPage #category").val(details.category);

  $(":mobile-pagecontainer").pagecontainer("change", "#editDiaryItemPage"); //Go to edit food page
});

//Bind to quanity and calories boxes on diaryItemEditForm
$("#editDiaryItemForm #quantity, #editDiaryItemForm #calories").on("change paste keyup", function(e){
  var calories = $("#editDiaryItemForm #calories").val(); //Get calories for item
  var quantity = $("#editDiaryItemForm #quantity").val();
  $("#editDiaryItemPage #caloriesDisplay").html(calories * quantity); //Update calories display
});

function editDiaryItem()
{
  var id = parseInt($("#editDiaryItemForm #id").val()); //Get item id from hidden field
  var quantity = parseFloat($("#editDiaryItemForm #quantity").val());
  var calories = parseFloat($("#editDiaryItemForm #calories").val());
  var category = $("#editDiaryItemForm #category").val();

  var getRequest = dbHandler.getItem(id, "diary"); //Pull record from DB

  getRequest.onsuccess = function(e) //Once we get the db result
  {
    var item = e.target.result; //Get the item from the request
    var oldCalorieCount = item.calories * item.quantity; //The old calorie count, to be removed from the global count if everything goes well

    //Update the values in the item
    item.quantity = quantity;
    item.calories = calories;
    item.category = category;

    var putRequest = dbHandler.insert(item, "diary"); //Update the item in the db

    putRequest.onsuccess = function(e) //The item was upated
    {
      app.caloriesConsumed -= oldCalorieCount; //Decrement the old values from the calorie count
      app.caloriesConsumed += calories * quantity; //Add on new calories

      updateLog();
      populateDiary(); //Repopulate the diary

      $(":mobile-pagecontainer").pagecontainer("change", "#diaryPage"); //Go to diary page
    }
  }
}

/***** FOOD LIST PAGE *****/
//Initialize page
$("#foodListPage").on("pagebeforeshow", function(event, ui)
{
  var os = dbHandler.getObjectStore("foodList"); //Get object store
  var html = "";

  //Create list of food items and insert into HTML
  os.openCursor().onsuccess = function(e)
  {
    var cursor = e.target.result;

    if (cursor)
    {
      cursor.continue();

      html += "<li class='foodListItem' id='"+cursor.value.id+"'>"; //Add class and ID
      html += "<a id='addToDiary' data-details='"+ JSON.stringify(cursor.value) +"'>"+cursor.value.name + " - " + cursor.value.portion;
      html += "<p>Quantity: "+cursor.value.quantity + "</p>";
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

//Bind on click to food item's addToDiary links in the listview
$("#foodListview").on("click", "#addToDiary", function(e){

  var details = $(this).data("details");

  //Add the food to the diary store
  var date = app.selectedDate.toDateString();
  var name = details.name;
  var portion = details.portion;
  var quantity = parseFloat(details.quantity);
  var calories = parseFloat(details.calories);
  var category = "Breakfast";

  var diaryData = {"date":date, "name":name, "portion":portion, "quantity":quantity, "calories":calories, "category":category};
  var request = dbHandler.insert(diaryData, "diary"); //Add item to diary

  request.onsuccess = function(e)
  {
    diaryData.id = e.target.result;

    //Add item to diary list view
    var html = "<li class='diaryItem' id='"+diaryData.id+"'>";
    html += "<a data-details='"+JSON.stringify(diaryData)+"'>"+details.name;
    html += "<p>"+details.quantity * details.calories+" Calories</p>";
    html += "</a>";
    html += "</li>";

    $("#diaryListview").append(html);
    $("#diaryListview").listview("refresh");

    //Update app variable and log
    app.caloriesConsumed += calories*quantity;
    updateLog();
    updateProgress();
  }

  //Update food item's dateTime (to show when food was last refferenced)
  var foodData = {"id":details.id, "dateTime":new Date(), "name":name, "portion":portion, "quantity":quantity, "calories":calories};
  dbHandler.insert(foodData, "foodList");

  $(":mobile-pagecontainer").pagecontainer("change", "#diaryPage");
});

//Bind on taphold to food item's addToDiary links in the listview
$("#foodListview").on("taphold", "#addToDiary", function(e){
  var details = $(this).data("details");
  $("#deleteFoodListItemPopup button").attr("id", details.id); //Set delete button's ID to foot item ID
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

  //Populate the edit form with passed data
  $('#editFoodPage #foodId').val(details.id);
  $('#editFoodPage #foodName').val(details.name);
  $('#editFoodPage #foodQuantity').val(details.quantity);
  $('#editFoodPage #foodPortion').val(details.portion);
  $('#editFoodPage #foodCalories').val(details.calories);

  $(":mobile-pagecontainer").pagecontainer("change", "#editFoodPage", {'details': details}); //Pass data to edit food page
});

//Bind on click to food item's addFood to diary link
$("#foodListPage").on("click", "#addFood", function(e){

  $("#editFoodPage h1").text("Add Food"); //Change page title

  //Clear the edit form
  $('#editFoodPage #foodId').val("");
  $('#editFoodPage #foodName').val("");
  $('#editFoodPage #foodPortion').val("");
  $('#editFoodPage #foodQuantity').val(1);
  $('#editFoodPage #foodCalories').val("");

  $(":mobile-pagecontainer").pagecontainer("change", "#editFoodPage"); //Go to edit food page
});

/***** EDIT FOOD PAGE *****/
function addFoodFormAction()
{
  //Get form values
  var id = parseInt($("#editFoodForm #foodId").val()); //Id is hidden field
  var dateTime = new Date(); //Time stamp
  var name = $('#editFoodPage #foodName').val();
  var portion = $('#editFoodPage #foodPortion').val();
  var quantity = parseFloat($('#editFoodPage #foodQuantity').val());
  var calories = parseFloat($('#editFoodPage #foodCalories').val());

  var data = {"dateTime":dateTime, "name":name, "portion":portion, "quantity":quantity, "calories":calories};

  if (id != "") {data.id = id}; //Add ID for existing items

  var request = dbHandler.insert(data, "foodList"); //Add/update food item

  $(":mobile-pagecontainer").pagecontainer("change", "#foodListPage"); //Go to food list
}

//For scanning barcodes
function scan()
{
  console.log("scanner");
  /*cordova.plugins.barcodeScanner.scan(
     function (result) {
         alert("We got a barcode\n" +
               "Result: " + result.text + "\n" +
               "Format: " + result.format + "\n" +
               "Cancelled: " + result.cancelled);
     },
     function (error) {
         alert("Scanning failed: " + error);
     }
  );*/
}

/***** SETTINGS PAGE *****/
//Initialize settings page
$("#settingsPage").on("pagebeforeshow", function(event, ui)
{
  //Populate settings form from local storage
  $('#weight').val(app.storage.getItem("weight"));
  $('#calorieGoal').val(app.storage.getItem("calorieGoal"));
});

//Save user's settings
function saveUserSettings()
{
  var weight = $('#weight').val();
  var calorieGoal = $('#calorieGoal').val();

  app.storage.setItem("weight", weight);
  app.storage.setItem("calorieGoal", calorieGoal);

  updateLog();
  updateProgress();
  $(":mobile-pagecontainer").pagecontainer("change", "#home");
}
