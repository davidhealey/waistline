var foodList = {

  populate : function()
  {
    $("#food-list-page #food-filter").focus();

    var html = "";
    var date = new Date()
    var dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())); //JS dates are s**t

    //Create list of food items (sorted by timestamp) and insert into HTML
    var index = dbHandler.getIndex("dateTime", "foodList"); //Get timestamp index

    index.openCursor(IDBKeyRange.upperBound(dateTime), "prev").onsuccess = function(e)
    {
      var cursor = e.target.result;

      if (cursor)
      {
        html += "<ons-list-item tappable class='foodListItem' data='"+ JSON.stringify(cursor.value) + "'>";
        html += "<label class='left'>";
        html += "<ons-checkbox input-id='" + cursor.value.id + "'></ons-checkbox>";
        html += "</label>";
        html += "<label for='" + cursor.value.id + "' class='center'>" + cursor.value.name + "</label>";
        html += "</ons-list-item>";

        cursor.continue();
      }
      else
      {
        $("#food-list-page #food-list").html(html); //Insert into HTML
      }
    };
  },
}

//Food list page display
$(document).on("show", "#food-list-page", function(e) {
  foodList.populate();
});

//Delete item from food list by holding
$(document).on("hold", "#food-list-page #food-list ons-list-item", function(e){
});

//Add single item to diary by double tapping it
$(document).on("doubletap", "#food-list-page #food-list ons-list-item", function(e){
  var data = JSON.parse($(this).attr("data"));
  diary.addEntry(data);
  page.reset("activities/diary/views/diary.html"); //Switch to diary page
});
