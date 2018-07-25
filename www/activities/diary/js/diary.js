var diary = {

  category:"0", //Category index
  date: undefined,
  consumption:{}, //Nutrition consumed for current diary date

  populate : function()
  {
    return new Promise(function(resolve, reject){
      diary.consumption = {}; //Reset object

      //Get selected date (app.date) at midnight
      var fromDate = diary.date;

      //Get day after selected date at midnight
      var toDate = new Date(fromDate);
      toDate.setHours(toDate.getHours()+24);
      toDate.setMinutes(toDate.getMinutes()-1);

      var meals = []; //Each diary item is part of a meal (category)
      var calorieCount = []; //Calorie count for each meal

      //Add user defined meal names as list headings
      var mealNames = JSON.parse(app.storage.getItem("meal-names"));
      for (var i = 0; i < mealNames.length; i++)
      {
        if (mealNames[i] == "") continue; //Skip unset meal names
        meals[i] = "<ons-list-header id='"+mealNames[i]+"' category-idx='"+i+"'>"+mealNames[i]+"<span></span></ons-list-header>";
        calorieCount[i] = 0;
      }

      var html = "";

      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.bound(fromDate, toDate)).onsuccess = function(e)
      {
        var cursor = e.target.result;

        if (cursor)
        {
          var value = cursor.value;
          var calories = value.nutrition.calories;

          //Calorie count for each category
          calorieCount[value.category] = calorieCount[value.category] || 0;
          calorieCount[value.category] += calories * value.quantity;

          //If a user changes the names of their meals then existing diary items won't have a meal category, this line solves that
          meals[value.category] = meals[value.category] || "<ons-list-header id='"+mealNames[value.category]+"' category-idx='"+value.category+"'>"+value.category_name+"<span></span></ons-list-header>";

          //Build HTML
          html = ""; //Reset variable
          html += "<ons-list-item class='diaryItem' data='"+JSON.stringify(value)+"' id='"+value.id+"' category='"+value.category+"' tappable>";
          html += "<a>"+unescape(value.name) + " - " + unescape(value.portion);

          if (value.quantity == 1)
          {
            html += "<p>"+value.quantity + " " + app.strings['serving'] + ", " + Math.round(value.quantity * calories) + " " + app.strings['calories'] + "</p>";
          }
          else
          {
            html += "<p>"+value.quantity + " " + app.strings['servings'] + ", " + Math.round(value.quantity * calories) + " " + app.strings['calories'] + "</p>";
          }
          html += "</a>";
          html += "</ons-list-item>";

          meals[value.category] += html;

          //Add up total consumption
          for (k in value.nutrition)
          {
            diary.consumption[k] = diary.consumption[k] || 0; //Use existing object or create new one for each item
            diary.consumption[k] += value.nutrition[k] * value.quantity;
          }

          cursor.continue();
        }
        else
        {
          $("#diary-page #diary-lists").html(""); //Clear old items

          //One list per meal
          for (var i = 0; i < meals.length; i++)
          {
            html = "";
            html += "<ons-list modifier='inset'>";
            html += meals[i];
            html += "</ons-list>";
            $("#diary-page #diary-lists").append(html); //Add HTML to DOM
            $("#diary-page #diary-lists #"+mealNames[i] + " span").html(" - " + Math.round(calorieCount[i]));
          }

          diary.updateLog()
          .then(result => diary.getStats(diary.date))
          .then(result => diary.renderStats(result))
          .catch();
        }
      };
    });
  },

  updateLog : function()
  {
    return new Promise(function(resolve, reject){
      var request = dbHandler.getItem(diary.date, "log"); //Get existing data from the log (if any)

      request.onsuccess = function(e)
      {
        var data = e.target.result || {};
        data.dateTime = diary.date;
        data.nutrition = diary.consumption; //Update consumption value

        var insertRequest = dbHandler.insert(data, "log");

        insertRequest.onsuccess = function(e)
        {
          resolve();
        }
      };
    });
  },

  setDate : function(date)
  {
    return new Promise(function(resolve, reject){

      //If diary date is undefined set it to today
      if (diary.date == undefined)
      {
        var now = new Date();
        diary.date = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate());
      }

      //If date is blank set date to diary date if a date was passed as a parameter set the date picker to that date
      if ($("#diary-page #date").val() == "" || date != undefined)
      {
        if (date) diary.date = date;
        var dd = diary.date.getDate();
        var mm = diary.date.getMonth()+1; //January is 0!
        var yyyy = diary.date.getFullYear();

        //Add leading 0s
        if (dd < 10) mm = "0"+mm;
        if (mm < 10) mm = "0"+mm;

        $("#diary-page #date").val(yyyy + "-" + mm + "-" + dd);
      }
      else //If a date was selected then set diary date to the selected date
      {
        diary.date = new Date($("#diary-page #date").val()); //Set diary date object to date picker date
      }

      //Check if there is a log entry for the selected date, if there isn't, add one
      app.addDefaultLogEntry(diary.date)
      .then(resolve());
    });

  },

  fillEditForm : function(data)
  {
    $("#edit-diary-item #id").val(data.id); //Add to hidden field
    $("#edit-diary-item #data").attr("data", JSON.stringify(data)); //Add data to form for access by other functions
    $("#edit-diary-item #name").html(unescape(data.name) + " - " + unescape(data.portion));
    $("#edit-diary-item #portion").val(unescape(data.portion));
    $("#edit-diary-item #quantity").val(data.quantity);

    for (n in data.nutrition)
    {
      $("#edit-diary-item #"+n).val(Math.round(data.nutrition[n] * data.quantity));
    }
    $("#edit-diary-item #category-idx").val(data.category).change();
  },

  addEntry : function(data)
  {
    //Add the food to the diary store
    if (diary.date == undefined)
    {
      var now = new Date();
      diary.date = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate());
    }

    var categories = JSON.parse(app.storage.getItem("meal-names")); //User defined meal names are used as category names
    var foodId = data.id;

    var entryData = {
      "dateTime":diary.date,
      "name":data.name,
      "portion":data.portion,
      "quantity":1,
      "nutrition":data.nutrition,
      "category":diary.category,
      "category_name":categories[diary.category],
      "foodId":foodId
    };


    var request = dbHandler.insert(entryData, "diary"); //Add item to diary

    request.onsuccess = function(e)
    {
      //Update food item's dateTime (to show when food was last referenced)
      var foodData = {"id":foodId, "dateTime":new Date()};
      dbHandler.update(foodData, "foodList", foodId);
    }
  },

  deleteEntry : function(id)
  {
    return new Promise(function(resolve, reject){
      //Remove the item from the diary table and get the request handler
      var request = dbHandler.deleteItem(parseInt(id), "diary");

      //If the request was successful repopulate the list
      request.onsuccess = function(e) {
        resolve(id);
      };
    });
  },

  updateEntry : function()
  {
    var id = parseInt($("#edit-diary-item #id").val()); //Get item id from hidden field
    var quantity = parseFloat($("#edit-diary-item #quantity").val());
    var categoryidx = $("#edit-diary-item #category-idx").val();
    var categories = JSON.parse(app.storage.getItem("meal-names")); //User defined meal names are used as category names
    var calories = $("#edit-diary-item #calories").val();

    var getRequest = dbHandler.getItem(id, "diary"); //Pull record from DB

    getRequest.onsuccess = function(e) //Once we get the db result
    {
      var item = e.target.result; //Get the item from the request

      //Update the values in the item
      item.quantity = quantity;
      item.category = categoryidx;
      item.category_name = categories[categoryidx];

      var putRequest = dbHandler.insert(item, "diary"); //Update the item in the db
    }
    nav.popPage();
  },

  recordWeight: function(date, weight)
  {
    var data = {"dateTime":date, "weight":weight};
    var request = dbHandler.update(data, "log", date); //Add/update log entry

    app.storage.setItem("weight", weight);

    request.onsuccess = function(e){
      console.log("Log updated");
    };
  },

  getStats : function(date)
  {
    return new Promise(function(resolve, reject){
      var request = dbHandler.getItem(date, "log");

      request.onsuccess = function(e)
      {
        if (e.target.result)
        {
          var data = e.target.result;

          data.remaining = {};

          for (g in data.goals) //Each goal
          {
            data.nutrition = data.nutrition || {};
            if (data.nutrition[g] == undefined) data.nutrition[g] = 0; //If there is no consumption data default to 0
            data.remaining[g] = data.goals[g] - data.nutrition[g]; //Subtract nutrition from goal to get remining
          }
          resolve(data);
        }
      }
    });
  },

  renderStats : function(data)
  {
    var colour = "";

    data.nutrition.calories < data.goals.calories ? colour = "green" : colour = "red";
    if (data.goals.weight && data.goals.weight.gain == true) //Flip colours if user wants to gain weight
    {
      data.nutrition[g] > data.goals[g] ? colour = "green" : colour = "red";
    }
    $("#diary-page #stat-bar #remaining").css("color", colour); //Set text colour for remaining
    $("#diary-page .progressBar").css("background-color", colour);

    var percentage = Math.min(100, data.nutrition.calories * 100 / data.goals.calories);
    $("#diary-page .progressBar").css("width", percentage+"%");

    $("#diary-page #stat-bar #goal").html(data.goals.calories);
    $("#diary-page #stat-bar #used").html(Math.round(data.nutrition.calories));
    $("#diary-page #stat-bar #remaining").html(Math.round(data.remaining.calories));
  },
}

//Diary page display
$(document).on("show", "#diary-page", function(e){
  diary.setDate()
  .then(diary.populate());
});

//Change date
$(document).on("change", "#diary-page #date", function(e){
  diary.setDate()
  .then(diary.populate());
});

//Deleting an item
$(document).on("hold", "#diary-page ons-list-item", function(e) {

  var data = JSON.parse($(this).attr("data"));

  //Show confirmation dialog
  ons.notification.confirm("Delete this item?")
  .then(function(input) {
    if (input == 1) {//Delete was confirmed
      diary.deleteEntry(data.id)
      .then(diary.populate());
    }
  });
});

//Item tap action
$(document).on("tap", "#diary-page ons-list-item", function(e) {
  var data = JSON.parse($(this).attr("data"));
  nav.pushPage("activities/diary/views/edit-item.html", {"data":data})
  .then(function() {diary.fillEditForm(data)});
});

//Header tap action
$(document).on("tap", "#diary-page ons-list-header", function(e) {
  diary.category = $(this).attr("category-idx"); //Assign category from header ID
  nav.pushPage("activities/food-list/views/food-list.html"); //Go to the food list page
});

//Edit form submit button action
$(document).on("tap", "#edit-diary-item #submit", function(e) {
  $("#edit-diary-item #edit-item-form").submit();
});

$(document).on("init", "#edit-diary-item", function(e){
  //Create and populate category selections
  var categories = JSON.parse(app.storage.getItem("meal-names"));
  var html = "<ons-select name='category-idx' id='category-idx' data-native-menu='false'>";
  for (var i = 0; i < categories.length; i++)
  {
    if (categories[i] == "") continue;
    html += "<option value='"+i+"'>"+categories[i]+"</option>";
  }
  html += "</ons-select>";

  $("#edit-diary-item form").append(html);
});

//Update displayed values as quantity is changed
$(document).on("keyup", "#edit-diary-item #quantity", function(e){
  var data = JSON.parse($("#edit-diary-item #data").attr("data"));
  for (n in data.nutrition)
  {
    $("#edit-diary-item #"+n).val(Math.round(data.nutrition[n] * this.value));
  }
});

//Weight button tap
$(document).on("tap", "#diary-page #record-weight", function(e){

  var lastWeight = app.storage.getItem("weight") || ""; //Get last recorded weight, if any

  //Show prompt
  ons.notification.prompt("Current weight (kg)", {"title":"Weight", "inputType":"number", "defaultValue":lastWeight})
  .then(function(input) {if (!isNaN(parseFloat(input))) {diary.recordWeight(diary.date, input);}});
});

$(document).on("tap", "#diary-page #previousDate", function(e){
  diary.date.setDate(diary.date.getDate()-1);
  diary.setDate(diary.date)
  .then(diary.populate());
});

$(document).on("tap", "#diary-page #nextDate", function(e){
  diary.date.setDate(diary.date.getDate()+1);
  diary.setDate(diary.date)
  .then(diary.populate());
});
