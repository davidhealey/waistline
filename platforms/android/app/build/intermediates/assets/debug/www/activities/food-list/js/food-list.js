var foodList = {

  list:[],
  images:[], //Place to store image uris when uploading a product to Open Food Facts

  fillListFromDB : function()
  {
    return new Promise(function(resolve, reject){

      var date = new Date()
      var dateTime = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

      foodList.list = []; //Clear list

      dbHandler.getIndex("dateTime", "foodList").openCursor(IDBKeyRange.upperBound(dateTime), "prev").onsuccess = function(e)
      {
        var cursor = e.target.result;

        if (cursor)
        {
          foodList.list.push(cursor.value);
          cursor.continue();
        }
        else
        {
          resolve();
        }
      };
    });
  },

  filterList : function(term)
  {
    return filteredList = foodList.list.filter(function (el) {
      return (el.name.match(new RegExp(term, "i"))); //Allow partial match and case insensitive
    });
  },

  populate : function(list)
  {
    var html = "";

    for (var i = 0; i < list.length; i++)
    {
      if (list[i].id) //Item has an ID, then it must already be in the database
      {
        html += "<ons-list-item tappable modifier='longdivider' class='foodListItem' data='"+JSON.stringify(list[i])+"'>";
        html += "<label class='right'>";
        html += "<ons-checkbox name='food-item-checkbox' input-id='"+unescape(list[i].name)+"' data='"+JSON.stringify(list[i])+"'></ons-checkbox>";
        html += "</label>";
        html += "<label for='"+unescape(list[i].name)+"' class='left'>"+unescape(list[i].name);
        html += " - " + list[i].portion + "</label>";
      }
      else //Item doesn't have an id, must have been found by searching
      {
        html += "<ons-list-item modifier='chevron' tappable class='searchItem' data='"+JSON.stringify(list[i])+"'>";
        html += unescape(list[i].name);
      }

      html += "</ons-list-item>";
    }

    $("#food-list-page #food-list").html(html); //Insert into HTML
  },

  fillEditForm : function(data)
  {
    data.id ? $("#edit-food-item #title").html("Edit Food") : $("#edit-food-item #title").html("Add Food");
    $("#edit-food-item #id").val(data.id);
    $("#edit-food-item #barcode").val(data.barcode);
    $("#edit-food-item #name").val(unescape(data.name));
    $("#edit-food-item #brand").val(unescape(data.brand));
    $("#edit-food-item #portion").val(data.portion);
    $("#edit-food-item #calories").val(data.nutrition.calories);
    $("#edit-food-item #protein").val(data.nutrition.protein);
    $("#edit-food-item #carbs").val(data.nutrition.carbs);
    $("#edit-food-item #fat").val(data.nutrition.fat);
    $("#edit-food-item #sugar").val(data.nutrition.sugar);
    $("#edit-food-item #salt").val(data.nutrition.salt);

    //Display image
    if (data.image_url && navigator.connection.type != "none" && app.storage.getItem("show-images"))
    {
      $('#edit-food-item #foodImage').html("<ons-card><img style='display:block; height:auto; width:75%; margin:auto;'></img></ons-card>");
      $('#edit-food-item #foodImage img').attr("src", unescape(data.image_url));
    }
  },

  //Localises the placeholders of the form input boxes
  localizeEditForm:function()
  {
    var inputs = $("#edit-food-item ons-input");
    var placeholder = "";

    for (var i = 0; i < inputs.length; i++)
    {
      placeholder = app.strings["food-list"]["edit-item"]["placeholders"][$(inputs[i]).attr("id")];
      $(inputs[i]).attr("placeholder", placeholder);
    }
  },

  updateEntry : function()
  {
    var data = {}; //Data to insert/update in DB

    //Get form values
    var id = parseInt($("#edit-food-item #id").val()); //ID is hidden field
    data.barcode = $("#edit-food-item #barcode").val(); //Barcode is hidden field
    data.name = escape($('#edit-food-item #name').val());
    data.brand = escape($('#edit-food-item #brand').val());
    data.image_url = escape($('#edit-food-item #foodImage img').attr("src"));
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

    //Add/update food item
    data.id == undefined ? dbHandler.insert(data, "foodList") : dbHandler.update(data, "foodList", id);

    foodList.fillListFromDB()
    .then(nav.popPage());
  },

  deleteEntry : function(id)
  {
    //Remove the item from the diary table and get the request handler
    var request = dbHandler.deleteItem(parseInt(id), "foodList");

    //If the request was successful repopulate the list
    request.onsuccess = function(e) {
      foodList.fillListFromDB()
      .then(function(){foodList.populate(foodList.list)});
    };
  },

  scan : function()
  {
    //First check that there is an internet connection
    if (navigator.connection.type == "none")
    {
      ons.notification.alert(app.strings["no-internet"]);
      return false;
    }

    cordova.plugins.barcodeScanner.scan(function(scanData){

      //var code = "9310072001128"; //Test barcode
      var code = scanData.text;
      var request = new XMLHttpRequest();

      request.open("GET", "https://world.openfoodfacts.org/api/v0/product/"+code+".json", true);
      request.send();

      $("#food-list-page ons-progress-circular").show(); //Circular progress indicator

      request.onreadystatechange = function(){

        if (request.readyState == 4 && request.status == 200)
        {
          var result = jQuery.parseJSON(request.responseText);

          if (result.status == 0) //Product not found
          {
            //Ask the user if they would like to add the product to the open food facts database
            ons.notification.confirm("Would you like to add this product to the Open Food Facts database?", {"title":"Product not found", "cancelable":true})
            .then(function(input) {
              if (input == 1) {
                nav.pushPage("activities/food-list/views/upload-item.html", {"data":{"code":code}});
              }
            });

            $("#food-list-page ons-progress-circular").hide();
            return false;
          }

          //First check if the product has already been added to the food list - to avoid duplicates
          var item = {}
          var index = dbHandler.getIndex("barcode", "foodList");
          index.get(result.code).onsuccess = function(e)
          {
            e.target.result ? item = e.target.result : item = foodList.parseOFFProduct(result.product);

            //Go to food item edit form and fill in form with retrieved data
            nav.pushPage("activities/food-list/views/edit-item.html", {"data":item})
              .then(function() {foodList.fillEditForm(item)});
          }
        }
      };
    },
    function(e)
    {
      ons.notification.alert(app.strings["food-list"]["scan-failed"] + ": " + e);
      $("#food-list-page ons-progress-circular").hide(); //Circular progress indicator
      return false;
    });
  },

  search : function(term)
  {
    //First check that there is an internet connection
    if (navigator.connection.type == "none")
    {
      ons.notification.alert(app.strings["no-internet"]);
      return false;
    }

    var request = new XMLHttpRequest();

    request.open("GET", "https://world.openfoodfacts.org/cgi/search.pl?search_terms="+term+"&search_simple=1&page_size=100&action=process&json=1", true);
    request.send();

    $("#food-list-page ons-progress-circular").show(); //Circular progress indicator

    request.onreadystatechange = function(){

      if (request.readyState == 4 && request.status == 200)
      {
        var result = JSON.parse(request.responseText);

        if (result.products.length == 0)
        {
          ons.notification.alert(app.strings["food-list"]["no-results"]);
          $("#food-list-page ons-progress-circular").hide(); //Circular progress indicator
          return false;
        }
        else
        {
          var products = result.products;

          foodList.list = []; //Clear list
          var item = {};
          for (var i = 0; i <  products.length; i++)
          {
            item = foodList.parseOFFProduct(products[i]);
            foodList.list.push(item);
          }
          foodList.populate(foodList.list);
          $("#food-list-page ons-progress-circular").hide(); //Circular progress indicator
        }
      }
    };
  },

  //Open food facts product parser
  parseOFFProduct : function(product)
  {
    var item = {};

    //Get best match for portion/serving size
    if (product.serving_size)
    {
      item.portion = product.serving_size.replace(/\s+/g, ''); //Remove white space
    }
    else if (product.nutrition_data_per)
    {
      item.portion = product.nutrition_data_per;
    }
    else if (product.quantity)
    {
      item.portion = product.quantity;
    }

    item.name = escape(product.product_name);
    item.brand = escape(product.brands);
    item.image_url = escape(product.image_url);
    item.barcode = product.code;
    item.nutrition = {
      calories: parseInt(parseFloat(product.nutriments.energy_value) / 100 * parseFloat(item.portion)),
      protein: Math.round(parseFloat(product.nutriments.proteins) / 100 * parseFloat(item.portion) * 100) / 100,
      carbs: Math.round(parseFloat(product.nutriments.carbohydrates) / 100 * parseFloat(item.portion) * 100) / 100,
      fat: Math.round(parseFloat(product.nutriments.fat) / 100 * parseFloat(item.portion) * 100) / 100,
      salt: Math.round(parseFloat(product.nutriments.salt) / 100 * parseFloat(item.portion) * 100) / 100,
      sugar: Math.round(parseFloat(product.nutriments.sugars) / 100 * parseFloat(item.portion) * 100) / 100,
    }

    //Kilojules to kcalories
    if (product.nutriments.energy_unit == "kJ")
    {
      item.calories = parseInt(item.calories / 4.15);
    }
    return item;
  },

  takePicture : function()
  {
    var options = {"allowEdit":true, "saveToPhotoAlbum":false};

    var image = app.takePicture(options)
    .then(function(image){

      //Ask the user to select the type of image
      ons.openActionSheet({
        title: 'What is this image of?',
        buttons: ['Front Image', 'Ingredients', 'Nutrition']
      })
      .then(function(input){
        var imageTypes = ["front", "ingredients", "nutrition"]

        var imageData = {"imagefield":imageTypes[input], "path":image, "uploadType":"imgupload_"+imageTypes[input]};
        foodList.images[input] = imageData;

        $("#upload-food-item #images").show(); //Reveal image card
        $("#upload-food-item #images #"+input).html("<img style='width:95%;' src='"+image+"'></img>"); //Add image to carousel
        $("#upload-food-item #images #"+input).show(); //Display image

        //Reveal the submit button once a front image has been added
        if (imageTypes[input] == "front") $("#upload-food-item #submit").show();
      });
    });
  },

  uploadProductInfoToOFF : function(data)
  {
    return new Promise(function(resolve, reject){
      //Upload product info
      var request = new XMLHttpRequest();

      request.open("GET", "https://off:off@world.openfoodfacts.net/cgi/product_jqm2.pl?"+data, true);
      request.setRequestHeader("Content-Type", "multipart/form-data");
      request.withCredentials = true;

      request.onload = function() {
        if (this.status >= 200 && this.status < 300) {
         resolve(request.response);
        } else {
         reject({
           status: this.status,
           statusText: request.statusText
         });
        }
      };

      request.onerror = function() {
        reject({
          status: this.status,
          statusText: request.statusText
        });
      };

      request.send();
    });
  },

  uploadImagesToOFF : function(code, images, index)
  {
    console.log("INDEX IS: " + index + "TOTAL: " + images.length);
    return new Promise(function(resolve, reject){

      data = new FormData();
      data.append("code", code);
      data.append("imagefield", images[index].imagefield);

      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
          console.log('file system open: ' + fs.name);

          window.resolveLocalFileSystemURL(images[index].path, function (fileEntry) {

              console.log("Got the file: " + images[index].imagefield);

              fileEntry.file(function (file) {

                  var reader = new FileReader();
                  reader.onloadend = function() {
                      // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
                      var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });

                      data.append(images[index].uploadType, blob);

                      var request = new XMLHttpRequest();

                      request.open("POST", "https://off:off@world.openfoodfacts.net/cgi/product_image_upload.pl", true);
                      request.setRequestHeader("Content-Type", "multipart/form-data");
                      request.withCredentials = true;

                      request.onload = function (e) {

                          console.log("Image uploaded: " + images[index].imagefield + " Remaining: " + (images.length-1-index));

                          if (index < images.length-1)
                          {
                            foodList.uploadImagesToOFF(code, images, index+1); //Recursive call to upload next image
                          }
                          else {
                            resolve(); //All images uploaded
                          }
                      };
                      request.send(data);
                  };
                  // Read the file as an ArrayBuffer
                  reader.readAsArrayBuffer(file);
              }, function (err) { console.error('error getting fileentry file!' + err); reject();});
          }, function (err) { console.error('error getting file! ' + err); reject();});
        }, function (err) { console.error('error getting persistent fs! ' + err); reject();});
    });
  },

}


//Food list page display
$(document).on("show", "#food-list-page", function(e){
  $("#food-list-page ons-progress-circular").hide(); //Hide circular progress indicator
  $("#food-list-page ons-toolbar-button#submit").hide(); //Hide submit button until items are checked
  $("#food-list-page ons-toolbar-button#scan").show(); //show scan button
  foodList.populate(foodList.list);
});

$(document).on("init", "#food-list-page", function(e){
  foodList.fillListFromDB()
  .then(function(){
    foodList.populate(foodList.list);
  });
});

$(document).on("keyup", "#food-list-page #filter", function(e){

  if (this.value == "") //Search box cleared, reset the list
  {
    foodList.fillListFromDB()
    .then(function(){
      foodList.populate(foodList.list);
    });
  }
  else { //Filter the list
    var filteredList = foodList.filterList(this.value);
    foodList.populate(filteredList);
  }
});

//Delete item from food list by holding
$(document).on("hold", "#food-list-page #food-list ons-list-item", function(e) {

  var data = JSON.parse($(this).attr("data"));

  //Show confirmation dialog
  ons.notification.confirm(app.strings["dialogs"]["confirm-delete"])
  .then(function(input) {
    if (input == 1) {//Delete was confirmed
      foodList.deleteEntry(data.id);
    }
  });
});

$(document).on("change", "#food-list-page #food-list ons-checkbox", function(e){
  var checked = $('input[name=food-item-checkbox]:checked'); //Get all checked items
  if (checked.length > 0)
  {
    $("#food-list-page ons-toolbar-button#submit").show(); //show submit button
    $("#food-list-page ons-toolbar-button#scan").hide(); //hide scan button
  }
  else
  {
    $("#food-list-page ons-toolbar-button#submit").hide(); //hide submit button
    $("#food-list-page ons-toolbar-button#scan").show(); //show scan button
  }
});

//Add multiple items to diary by checking them and tapping the check button
$(document).on("tap", "#food-list-page #submit", function(e) {

  var checked = $('input[name=food-item-checkbox]:checked'); //Get all checked items

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

//Edit food item by double tapping
$(document).on("doubletap", "#food-list-page #food-list ons-list-item", function(e) {

  var data = JSON.parse($(this).attr("data"));

  //Go to edit food page then fill in form
  nav.pushPage("activities/food-list/views/edit-item.html", {"data":data})
    .then(function() {foodList.fillEditForm(data)});
});

//Same action as double tap on regular list items but this is for items found via search
$(document).on("tap", "#food-list-page #food-list .searchItem", function(e) {

  var data = JSON.parse($(this).attr("data"));

  //Go to edit food page then fill in form
  nav.pushPage("activities/food-list/views/edit-item.html", {"data":data})
    .then(function() {foodList.fillEditForm(data)});
});

$(document).on("init", "#edit-food-item", function(e){
  foodList.localizeEditForm()
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
    ons.notification.alert(app.strings["required-fields"]);
  }
});

$(document).on("show", "#upload-food-item", function(e){
  var data = this.data; //Get data thas was pushed to page
  data.code = "5010251790525"; //Testing
  $("ons-page#upload-food-item #barcode").val(data.code);

  //Reset the images object
  foodList.images = [];

  //Hide the submit button and images card - they will be displayed again once an image is added
  $("ons-page#upload-food-item #submit").hide();
  $("ons-page#upload-food-item #images").hide();
  $("#upload-food-item #images ons-carousel-item").hide(); //Hide all image carousel items until an image is added

});

$(document).on("tap", "#upload-food-item #submit", function(e){

  var data = $("#upload-food-item #upload-item-form").serialize(); //Get form data
  var code = $("ons-page#upload-food-item #barcode").val(); //Get barcode from form

  $("#upload-food-item ons-modal").show();
  foodList.uploadProductInfoToOFF(data)
  .then(function(response){
    foodList.uploadImagesToOFF(code, foodList.images, 0)
    .then(function(){$("#upload-food-item ons-modal").hide();});
  })
  .catch(function(err) {
    console.error('Augh, there was an error!', err.statusText);
    $("#upload-food-item ons-modal").hide();
    ons.notification.alert("Unfortunately the upload failed. Please try again or contact the developer.");
  });

});

//Delete an image
$(document).on("hold", "#upload-food-item #images ons-carousel-item", function(){

  var control = this;

  //Show confirmation dialog
  ons.notification.confirm(app.strings["dialogs"]["confirm-delete"])
  .then(function(input) {
    if (input == 1) {//Delete was confirmed

      foodList.images.splice(control.id, 1); //Remove item from images array

      $(control).hide();

      if (Object.keys(foodList.images).length == 0)
      {
        $("ons-page#upload-food-item #submit").hide();
        $("ons-page#upload-food-item #images").hide();
      }
    }
  });
});
