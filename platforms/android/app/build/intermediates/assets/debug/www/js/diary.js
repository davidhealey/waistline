var diary = {

  category:"breakfast",

  populateDiary : function()
  {
    //Get selected date (app.date) at midnight
    var fromDate = new Date(); //getDateAtMidnight(app.date);

    //Get day after selected date at midnight
    var toDate = new Date(fromDate);
    toDate.setDate(toDate.getDate()+1);

    //Pull record from the database for the selected date and add items to the list
    var index = dbHandler.getIndex("dateTime", "diary"); //Get date index from diary store
    var calorieGoal = app.storage.getItem("calorieGoal");
    var html = "";

    //Strings of html for each category - prepopulated with category dividers
    var list = {
      breakfast:"<ons-list-header id=breakfast>Breakfast</ons-list-header>",
      lunch:"<ons-list-header id=lunch>Lunch</ons-list-header>",
      dinner:"<ons-list-header id=dinner>Dinner</ons-list-header>",
      snacks:"<ons-list-header id=snacks>Snacks</ons-list-header>",
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
        $("#diary-page #list").html(list.breakfast + list.lunch + list.dinner + list.snacks); //Insert into HTML
        /*$("#diaryListview #Breakfast span").html(" - " + calorieCount.breakfast + " " + app.strings['calories']);
        $("#diaryListview #Lunch span").html(" - " + calorieCount.lunch + " " + app.strings['calories']);
        $("#diaryListview #Dinner span").html(" - " + calorieCount.dinner + " " + app.strings['calories']);
        $("#diaryListview #Snacks span").html(" - " + calorieCount.snacks + " " + app.strings['calories']);
        $("#diaryListview").listview("refresh");*/
      }
    };
  }
}

$(document).on("init", "#diary-page", function(event) {
  diary.populateDiary();
});
