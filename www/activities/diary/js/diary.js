var diary = {

  category:"breakfast",
  date: new Date(),

  populateDiary : function()
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
      breakfast:"<ons-list-header id=breakfast>Breakfast<span></span></ons-list-header>",
      lunch:"<ons-list-header id=lunch>Lunch<span></span></ons-list-header>",
      dinner:"<ons-list-header id=dinner>Dinner<span></span></ons-list-header>",
      snacks:"<ons-list-header id=snacks>Snacks<span></span></ons-list-header>",
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
        html += "<ons-list-item class='diaryItem' id='"+cursor.value.id+"' category='"+cursor.value.category+"'>";
        html += "<a data-details='"+JSON.stringify(cursor.value)+"'>"+unescape(cursor.value.name) + " - " + unescape(cursor.value.portion);
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
  }
}

$(document).on("init", "#diary-page", function(event) {
  diary.setDate();
  diary.populateDiary();
});

$(document).on("focusout", "#diary-page #date", function(){
  diary.setDate();
  diary.populateDiary();
});
