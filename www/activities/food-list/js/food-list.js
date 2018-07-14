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
        html += "<label class='right'>";
        html += "<ons-checkbox name='food-item-checkbox' idnput-id='" + cursor.value.id + "' data='"+ JSON.stringify(cursor.value) + "'></ons-checkbox>";
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

  fillEditForm : function(data)
  {
    $("#edit-food-item #id").val(data.id);
    $("#edit-food-item #barcode").val(data.barcode);
    $("#edit-food-item #name").val(data.name);
    $("#edit-food-item #portion").val(data.portion);
    $("#edit-food-item #calories").val(data.calories);
    $("#edit-food-item #protein").val(data.protein);
    $("#edit-food-item #carbs").val(data.carbs);
    $("#edit-food-item #fat").val(data.fat);
    $("#edit-food-item #sugar").val(data.sugar);
    $("#edit-food-item #salt").val(data.salt);
  },

  updateEntry : function()
  {
    var data = {}; //Data to insert/update in DB

    //Get form values
    var id = parseInt($("#edit-food-item #id").val()); //ID is hidden field
    data.barcode = $("#edit-food-item #barcode").val(); //Barcode is hidden field
    data.name = $('#edit-food-item #name').val();
    data.portion = $('#edit-food-item #portion').val();
    data.calories = parseFloat($('#edit-food-item #calories').val());
    data.protein = parseFloat($('#edit-food-item #protein').val());
    data.carbs = parseFloat($('#edit-food-item #carbs').val());
    data.fat = parseFloat($('#edit-food-item #fat').val());
    data.sugar = parseFloat($('#edit-food-item #sugar').val());
    data.salt = parseFloat($('#edit-food-item #salt').val());

    var date = new Date()
    data.dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

    if (isNaN(id) == false) {data.id = id}; //Add ID for existing items

    var request = dbHandler.insert(data, "foodList"); //Add/update food item

    nav.popPage();
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

//Floating action button action
$(document).on("tap", "#food-list-page ons-fab", function(e) {
  page.push("activities/food-list/views/edit-item.html"); //Go to the food item edit page
});

//Edit food item by single tapping
$(document).on("tap", "#food-list-page #food-list ons-list-item", function(e) {

  var data = JSON.parse($(this).attr("data"));

  //Go to edit food page then fill in form
  nav.pushPage("activities/food-list/views/edit-item.html", {"data":data})
    .then(function() {foodList.fillEditForm(data)});
});

//Edit food page display
$(document).on("show", "#edit-food-item", function(e) {
  //Set title of page depending on if adding a new food item or editing an existing one. If no page data is passed then must be new.
  $.isEmptyObject(nav.topPage.data) ? $("#edit-food-item #title").html("Add Food") : $("#edit-food-item #title").html("Edit Food");
});

//Edit form submit button action
$(document).on("tap", "#edit-food-item #submit", function(e){
  $("#edit-food-item #edit-item-form").submit();
});
