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
    $("#edit-food-item #calories").val(data.nutrition.calories);
    $("#edit-food-item #protein").val(data.nutrition.protein);
    $("#edit-food-item #carbs").val(data.nutrition.carbs);
    $("#edit-food-item #fat").val(data.nutrition.fat);
    $("#edit-food-item #sugar").val(data.nutrition.sugar);
    $("#edit-food-item #salt").val(data.nutrition.salt);
  },

  updateEntry : function()
  {
    var data = {}; //Data to insert/update in DB

    //Get form values
    var id = parseInt($("#edit-food-item #id").val()); //ID is hidden field
    data.barcode = $("#edit-food-item #barcode").val(); //Barcode is hidden field
    data.name = $('#edit-food-item #name').val();
    data.portion = $('#edit-food-item #portion').val();
    data.nutrition = {
      "calories":parseFloat($('#edit-food-item #calories').val()),
      "protein":parseFloat($('#edit-food-item #protein').val()),
      "carbs":parseFloat($('#edit-food-item #carbs').val()),
      "fat":parseFloat($('#edit-food-item #fat').val()),
      "sugar":parseFloat($('#edit-food-item #sugar').val()),
      "salt":parseFloat($('#edit-food-item #salt').val()),
    };

    var date = new Date()
    data.dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

    if (isNaN(id) == false) {data.id = id}; //Add ID for existing items

    //var request = dbHandler.insert(data, "foodList"); //Add/update food item
    dbHandler.update(data, "foodList", id);

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

  scan : function()
  {
    cordova.plugins.barcodeScanner.scan(
       function (result) {

         var code = result.text;
         var request = new XMLHttpRequest();

         request.open("GET", "https://world.openfoodfacts.org/api/v0/product/"+code+".json", true);
         request.send();

         request.onreadystatechange = function(){
           foodList.processBarcodeResponse(request);
         };
       },
       function (e) {
           alert("Scanning failed: " + error);
       }
    );
  },

  processBarcodeResponse : function(request)
  {
    if (request.readyState == 4 && request.status == 200)
    {
      var result = jQuery.parseJSON(request.responseText);

      if (result.status == 0) //Product not found
      {
        alert("Product not found. You can add it with the Open Food Facts app");
      }
      else
      {
        //First check if the product has already been added to the food list - to avoid duplicates
        var index = dbHandler.getIndex("barcode", "foodList");
        var request = index.count(result.code);

        request.onsuccess = function(e)
        {
          if (e.target.result > 0)
          {
            alert("This product is already is already in your food list.");
          }
          else //Product is not in the db yet so we can add it now
          {
            //Get the data for the add food form
            var product = result.product;

            var data = {"name":escape(product.product_name), "calories":parseInt(product.nutriments.energy_value), "image_url":product.image_url, "barcode":result.code};

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

            escape(data.portion);

            //Go to food item edit form and fill in form with retrieved data
            nav.pushPage("activities/food-list/views/edit-item.html", {"data":data})
              .then(function() {foodList.fillEditForm(data)});
          }
        }
      }
    }
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
  nav.resetToPage("activities/diary/views/diary.html"); //Switch to diary page
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
    nav.resetToPage("activities/diary/views/diary.html"); //Switch to diary page
  }
});

//Floating action button action
$(document).on("tap", "#food-list-page ons-fab", function(e) {
  nav.pushPage("activities/food-list/views/edit-item.html")
});

$(document).on("tap", "#food-list-page #food-list ons-checkbox", function(e) {
  e.stopPropagation(); //Prevent button triggering when checkbox is selected
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
$(document).on("tap", "#edit-food-item #submit", function(e) {

  var name = $('#edit-food-item #name').val();
  var portion = $('#edit-food-item #portion').val();
  var calories = parseFloat($('#edit-food-item #calories').val());

  //Form validation
  if (name != "" && portion != "" && !isNaN(calories))
  {
    $("#edit-food-item #edit-item-form").submit();
  }
  else
  {
    ons.notification.alert('Please complete all required fields.');
  }
});

//Barcode scanner button
$(document).on("tap", "#food-list-page #btn-barcode", function(e) {
  foodList.scan();
});
