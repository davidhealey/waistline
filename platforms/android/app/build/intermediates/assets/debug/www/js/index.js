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
  var date = app.date.toLocaleDateString(); //Primary key
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

function changeDate(date)
{
  app.date = date;
  populateDiary();
  $("#diaryDate").html(date.toDateString()); //Update date display

  //Update the app.caloriesConsumed variable for the new date
  var request = dbHandler.getItem(date.toLocaleDateString(), "log");

  request.onsuccess = function(e)
  {
    app.caloriesConsumed = 0; //Reset
    if (e.target.result) {app.caloriesConsumed = e.target.result.calories;}
    updateProgress();
  }
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
  var date = app.date.toDateString(); //Format the currently selected date for db selection

  //Pull record from the database for the selected date and add items to the list
  var index = dbHandler.getIndex("date", "diary"); //Get date index from diary store
  var calorieGoal = app.storage.getItem("calorieGoal");

  var html = ""; //Variable to generate HTML

  //Strings of html for each category - prepopulated with category dividers
  var list = {
    breakfast:"<li class='diaryDivider' id='Breakfast' data-role='list-divider'><h4>Breakfast</h4></li>",
    lunch:"<li class='diaryDivider' id='Lunch' data-role='list-divider'><h4>Lunch</h4></li>",
    dinner:"<li class='diaryDivider' id='Dinner' data-role='list-divider'><h4>Dinner</h4></li>",
    snacks:"<li class='diaryDivider' id='Snacks' data-role='list-divider'><h4>Snacks</h4></li>"
  };

  index.openCursor(IDBKeyRange.only(date)).onsuccess = function(e)
  {
    var cursor = e.target.result;
    if (cursor)
    {
      //Build HTML
      html = ""; //Reset variable
      html += "<li class='diaryItem' id='"+cursor.value.id+"' category='"+cursor.value.category+"'>";
      html += "<a data-details='"+JSON.stringify(cursor.value)+"'>"+cursor.value.name;
      html += "<p>"+cursor.value.quantity * cursor.value.calories+" Calories</p>";
      html += "</a>";
      html += "</li>";

      switch (cursor.value.category)
      {
        case "Breakfast":
          list.breakfast += html;
          break;
        case "Lunch":
          list.lunch += html;
          break;
        case "Dinner":
          list.dinner += html;
          break;
        default: //Snacks
          list.snacks += html;
        break;
      }
      cursor.continue();
    }
    else
    {
      $("#diaryListview").html(list.breakfast + list.lunch + list.dinner + list.snacks); //Insert into HTML
      $("#diaryListview").listview({autodividersSelector:function(li){return li.attr("category")}}); //Divide list based on food category
      $("#diaryListview").listview("refresh");
    }
  };
}

//Bind diary category items
$("#diaryPage").on("click", ".diaryDivider", function(e){
  $("#foodListPage #category").val($(this).attr("id")); //Set hidden field on food list page
  $(":mobile-pagecontainer").pagecontainer("change", "#foodListPage");
});

//Bind on swipeleft to diaryPage
$("#diaryPage").on("swipeleft", function(e){
  app.date.setDate(app.date.getDate()+1);
  changeDate(app.date);
});

//Bind on swiperight to diary page
$("#diaryPage").on("swiperight", function(e){
  app.date.setDate(app.date.getDate()-1);
  changeDate(app.date);
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
  $("#editDiaryItemPage #portion").val(details.portion);
  $("#editDiaryItemPage #caloriesDisplay").text(details.calories * details.quantity);
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
      html += "<a class='addToDiary' data-details='"+ JSON.stringify(cursor.value) +"'>"+cursor.value.name + " - " + cursor.value.portion;
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
$("#foodListview").on("click", ".addToDiary", function(e){

  var details = $(this).data("details");

  //Add the food to the diary store
  var date = app.date.toDateString(); //Currently selected date
  var name = details.name;
  var portion = details.portion;
  var quantity = parseFloat(details.quantity);
  var calories = parseFloat(details.calories);
  var category = $("#foodListPage #category").val(); //Hidden field

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

  var diaryData = {"date":date, "name":name, "portion":portion, "quantity":quantity, "calories":calories, "category":category};
  var request = dbHandler.insert(diaryData, "diary"); //Add item to diary

  request.onsuccess = function(e)
  {
    populateDiary();

    //Update app variable and log
    app.caloriesConsumed += calories*quantity;

    updateLog();
    updateProgress();

    //Update food item's dateTime (to show when food was last refferenced)
    var foodData = {"id":details.id, "dateTime":new Date(), "name":name, "portion":portion, "quantity":quantity, "calories":calories};
    dbHandler.insert(foodData, "foodList");

    //Reset category field
    $("#foodListPage #category").val("");
  }

  $(":mobile-pagecontainer").pagecontainer("change", "#diaryPage");
});

//Bind on taphold to food item's addToDiary links in the listview
$("#foodListview").on("taphold", "#addToDiary", function(e){
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
  var dateTime = new Date(); //Time stamp
  var name = $('#editFoodPage #foodName').val();
  var portion = $('#editFoodPage #foodPortion').val();
  var quantity = parseFloat($('#editFoodPage #foodQuantity').val());
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
  $('#editFoodPage #foodQuantity').val(data.quantity);
  $('#editFoodPage #foodPortion').val(data.portion);
  $('#editFoodPage #foodCalories').val(data.calories);
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

      var data = {"name":product.product_name, "quantity":1, "calories":product.nutriments.energy_value};

      //Get best match for portion/serving size
      if (product.nutrition_data_per)
      {
        data.portion = product.nutrition_data_per;
      }
      else if (product.serving_size)
      {
        data.portion = product.serving_size;
      }
      else if (product.quantity)
      {
        data.portion = product.quantity;
      }


      //If energy is given in kl convert to kcal
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

/**** IMPORT AND EXPORT ****/
function exportData()
{
  dbHandler.exportToFile(); //Jsonify the database
}
