var diary = {

  category:"Breakfast",
  date: new Date(),

  populate : function()
  {
    //Get selected date (app.date) at midnight
    var fromDate = diary.date;

    //Get day after selected date at midnight
    var toDate = new Date(fromDate);
    toDate.setDate(toDate.getDate()+1);

    //Pull record from the database for the selected date and add items to the list
    var index = dbHandler.getIndex("dateTime", "diary"); //Get date index from diary store
    var calorieGoal = app.storage.getItem("calorieGoal");
    var html = "";

    //Strings of html for each category - prepopulated with category dividers
    var list = {
      breakfast:"<ons-list-header id=Breakfast>Breakfast<span></span></ons-list-header>",
      lunch:"<ons-list-header id=Lunch>Lunch<span></span></ons-list-header>",
      dinner:"<ons-list-header id=Dinner>Dinner<span></span></ons-list-header>",
      snacks:"<ons-list-header id=Snacks>Snacks<span></span></ons-list-header>",
    };

    var calorieCount = {"breakfast":0, "lunch":0, "dinner":0, "snacks":0}; //Calorie count for breakfast, lunch, dinner, snacks

    index.openCursor(IDBKeyRange.bound(fromDate, toDate)).onsuccess = function(e)
    {
      var cursor = e.target.result;

      if (cursor)
      {
        var calories = cursor.value.calories;

        //Build HTML
        html = ""; //Reset variable
        html += "<ons-list-item class='diaryItem' data='"+JSON.stringify(cursor.value)+"' id='"+cursor.value.id+"' category='"+cursor.value.category+"' tappable='true'>";
        html += "<a>"+unescape(cursor.value.name) + " - " + unescape(cursor.value.portion);

        if (cursor.value.quantity == 1)
        {
          html += "<p>"+cursor.value.quantity + " " + app.strings['serving'] + ", " + Math.round(cursor.value.quantity * cursor.value.calories) + " " + app.strings['calories'] + "</p>";
        }
        else
        {
          html += "<p>"+cursor.value.quantity + " " + app.strings['servings'] + ", " + Math.round(cursor.value.quantity * cursor.value.calories) + " " + app.strings['calories'] + "</p>";
        }
        html += "</a>";
        html += "</ons-list-item>";

        switch (cursor.value.category)
        {
          case "Breakfast":
            list.breakfast += html;
            calorieCount.breakfast += Math.round(cursor.value.calories * cursor.value.quantity);
            break;
          case "Lunch":
            list.lunch += html;
            calorieCount.lunch += Math.round(cursor.value.calories * cursor.value.quantity);
            break;
          case "Dinner":
            list.dinner += html;
            calorieCount.dinner += Math.round(cursor.value.calories * cursor.value.quantity);
            break;
          default: //Snacks
            list.snacks += html;
            calorieCount.snacks += Math.round(cursor.value.calories * cursor.value.quantity);
          break;
        }
        cursor.continue();
      }
      else
      {
        $("#diary-page #list1").html(list.breakfast); //Insert into HTML
        $("#diary-page #list2").html(list.lunch); //Insert into HTML
        $("#diary-page #list3").html(list.dinner); //Insert into HTML
        $("#diary-page #list4").html(list.snacks); //Insert into HTML
        $("#diary-page #list1 ons-list-header span").html(" - " + calorieCount.breakfast + " " + app.strings['calories']);
        $("#diary-page #list2 ons-list-header span").html(" - " + calorieCount.lunch + " " + app.strings['calories']);
        $("#diary-page #list3 ons-list-header span").html(" - " + calorieCount.dinner + " " + app.strings['calories']);
        $("#diary-page #list4 ons-list-header span").html(" - " + calorieCount.snacks + " " + app.strings['calories']);
      }
    };
  },

  setDate : function()
  {
    //If date is blank set date to current date
    if ($("#diary-page #date").val() == "")
    {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();

      //Add leading 0s
      if (dd < 10) mm = "0"+mm;
      if (mm < 10) mm = "0"+mm;

      $("#diary-page #date").val(yyyy + "-" + mm + "-" + dd);
    }
    diary.date = new Date($("#diary-page #date").val()); //Set diary date object to date picker date
  },

  fillEditForm : function(data)
  {
    $("#edit-diary-item #id").val(data.id); //Add to hidden field
    $("#edit-diary-item #name").html(unescape(data.name) + " - " + unescape(data.portion));
    $("#edit-diary-item #portion").val(unescape(data.portion));
    $("#edit-diary-item #caloriesDisplay").html(Math.round(data.calories * data.quantity));
    $("#edit-diary-item #caloriesPerPortion").html(unescape(data.portion) + " = " + data.calories + " Calories");
    $("#edit-diary-item #calories").val(data.calories);
    $("#edit-diary-item #quantity").val(data.quantity);
    $("#edit-diary-item #category").val(data.category).change();
  },

  addEntry : function(data)
  {
    //Add the food to the diary store
    var dateTime = diary.date;
    var foodId = data.id;
    var name = data.name;
    var portion = data.portion;
    var quantity = parseFloat(data.quantity);
    var calories = parseFloat(data.calories);

    var diaryData = {"dateTime":dateTime, "name":name, "portion":portion, "quantity":quantity, "calories":calories, "category":diary.category, "foodId":foodId};
    var request = dbHandler.insert(diaryData, "diary"); //Add item to diary

    request.onsuccess = function(e)
    {
      console.log(diaryData);
      diary.populate();

      //Update app variable and log
      app.caloriesConsumed += calories*quantity;

//      updateLog();
  //    updateProgress();

      //Update food item's dateTime (to show when food was last referenced)
      var foodData = {"id":foodId, "dateTime":new Date(), "name":name, "portion":portion, "quantity":quantity, "calories":calories};
      dbHandler.insert(foodData, "foodList");
    }
  },

  deleteEntry : function(id)
  {
    //Update app-wide caloriesConsumed variable
    //app.caloriesConsumed -= parseFloat(data.calories);

    //Remove the item from the diary table and get the request handler
    var request = dbHandler.deleteItem(parseInt(id), "diary");

    //If the request was successful repopulate the list
    request.onsuccess = function(e) {
      diary.populate();
      //updateLog(); //Update the log entry
      //updateProgress();
    };
  },

  updateEntry : function()
  {
    var id = parseInt($("#edit-diary-item #id").val()); //Get item id from hidden field
    var quantity = parseFloat($("#edit-diary-item #quantity").val());
    var category = $("#edit-diary-item #category").val();

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

        //updateLog();
        //updateProgress();
      }
    }
    page.pop();
  },
}

//Diary page display
$(document).on("show", "#diary-page", function(e) {
  diary.setDate();
  diary.populate();
});

//Change date
$(document).on("focusout", "#diary-page #date", function(e) {
  diary.setDate();
  diary.populate();
});

//Deleting an item
$(document).on("hold", "#diary-page ons-list-item", function(e) {

  var data = JSON.parse($(this).attr("data"));

  //Show confirmation dialog
  ons.notification.confirm("Delete this item?")
  .then(function(input) {
    if (input == 1) {//Delete was confirmed
      diary.deleteEntry(data.id);
    }
  });
});

//Item tap action
$(document).on("tap", "#diary-page ons-list-item", function(e) {
  var data = JSON.parse($(this).attr("data"));
  page.push("activities/diary/views/edit-item.html", {"data":data});
});

//Header tap action
$(document).on("tap", "#diary-page ons-list-header", function(e) {
  diary.category = $(this).attr("id"); //Assign category from header ID
  page.push("activities/food-list/views/food-list.html", {}); //Go to the food list page
});

//Edit form init
$(document).on("init", "#edit-diary-item", function(e) {
  diary.fillEditForm(page.getData());
});

//Edit form submit button action
$(document).on("tap", "#edit-diary-item #submit", function(e){
  $("#edit-diary-item #edit-item-form").submit();
});
