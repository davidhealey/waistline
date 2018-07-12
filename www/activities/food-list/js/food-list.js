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
        html += "<ons-checkbox name='food-item-checkbox' input-id='" + cursor.value.id + "' data='"+ JSON.stringify(cursor.value) + "'></ons-checkbox>";
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

  deleteEntry : function(id)
  {
    //Remove the item from the diary table and get the request handler
    var request = dbHandler.deleteItem(parseInt(id), "foodList");

    //If the request was successful repopulate the list
    request.onsuccess = function(e) {
      foodList.populate();
    };
  },
}

//Food list page display
$(document).on("show", "#food-list-page", function(e) {
  foodList.populate();
});

//Delete item from food list by holding
$(document).on("hold", "#food-list-page #food-list ons-list-item", function(e) {

  var data = JSON.parse($(this).attr("data"));

  //Show confirmation dialog
  ons.notification.confirm("Delete this item?")
  .then(function(input) {
    if (input == 1) {//Delete was confirmed
      foodList.deleteEntry(data.id);
    }
  });
});

//Add single item to diary by double tapping it
$(document).on("doubletap", "#food-list-page #food-list ons-list-item", function(e) {
  var data = JSON.parse($(this).attr("data"));
  diary.addEntry(data);
  page.reset("activities/diary/views/diary.html"); //Switch to diary page
});

//Add multiple items to diary by checking them and tapping the check button
$(document).on("tap", "#food-list-page #submit", function(e) {

  //Get all checked items
  var checked = $('input[name=food-item-checkbox]:checked');

  if (checked.length > 0) //At least 1 item was selected
  {
    //Add each item to diary
    for (var i = 0; i < checked.length; i++)
    {
      var data = JSON.parse(checked[i].offsetParent.attributes.data.value); //Parse data from checkbox attribute
      diary.addEntry(data);
    }
    page.reset("activities/diary/views/diary.html"); //Switch to diary page
  }

});
