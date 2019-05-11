/*
  Copyright 2018, 2019 David Healey

  This file is part of Waistline.

  Waistline is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Waistline is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Waistline.  If not, see <http://www.gnu.org/licenses/>.
*/

var foodlist = {

  initialize: function() {

    this.page = document.querySelector('ons-page#foodlist');
    this.list = [];
    this.listCopy = []; //A backup copy of the list is always maintained for filtering

    //Setup lazy list
    this.infiniteList = this.page.querySelector('#food-list');

    //Show/Hide back button
    let menuButton = document.querySelector("ons-page#foodlist #menu-button");
    let backButton = document.querySelector("ons-page#foodlist #back-button");
    backButton.style.display = "none"; //Hide back button by default
    if (nav.pages.length > 1) {
      backButton.style.display = "block";
      menuButton.style.display = "none";
    }
  },

  setFilter : function(term) {
    var list = this.listCopy; //Search is performed on copy of list

    if (term) {
      var exp = new RegExp(term, "i");

      //Filter by name and brand
      list = list.filter(function (el) {
        if (el.name || el.brand) return el.name.match(exp) || el.brand.match(exp);
      });
    }
    this.list = list; //Replace master copy with filtered list
    this.infiniteList.refresh();
  },

  search : function(term) {
    //First check that there is an internet connection
    if (navigator.connection.type == "none") {
      ons.notification.alert(app.strings["no-internet"]);
      return false;
    }

      //Get country name
    //var country = app.storage.getItem("food-list-country");

    //Build search string
    let query = "https://world.openfoodfacts.org/cgi/search.pl?search_terms="+term+"&search_simple=1&page_size=500";

    //Filter by selected country
    //var searchCountry = app.storage.getItem("food-list-country");

    //if (searchCountry != "All" && searchCountry != null)
      //query += "&tagtype_0=countries&tag_contains_0=contains&tag_0=" + escape(country); //Limit search to selected country

    //Complete query
    query += "&sort_by=last_modified_t&action=process&json=1";

    //Create request
    let request = new XMLHttpRequest();
    request.open("GET", query, true);
    request.send();

    //Show circular progress indicator
    document.querySelector('ons-page#foodlist ons-progress-circular').style.display = "inline-block";

    //Test data
    //let result = testOFFResult;

    request.onreadystatechange = function() {

      if (request.readyState == 4 && request.status == 200) {

        document.querySelector('ons-page#foodlist ons-progress-circular').style.display = "none"; //Hide progress indicator

        let result = JSON.parse(request.responseText);

        if (result.products.length == 0) {
          ons.notification.alert(/*app.strings["food-list"]["no-results"]*/ "No results found.");
          return false;
        }
        else {
          let products = result.products;

          let list = [];
          for (let i = 0; i < products.length; i++) {
            let item = foodlist.parseOFFProduct(products[i]);
            if (item) list.push(item);
          }
          foodlist.list = list;
          foodlist.listCopy = list;
          foodlist.infiniteList.refresh();
        }

      }
    };
  },

  scan : function() {

    return new Promise(function(resolve, reject) {

    //  cordova.plugins.barcodeScanner.scan(function(scanData){

        //let code = "3596710443307"; //Test barcode
        let code = "35967104433071"; //Test barcode - no results
        //var code = scanData.text;
        let request = new XMLHttpRequest();
        let item = {};

        //Check if item is already in food list - only one item so not great overhead
        let index = dbHandler.getIndex("barcode", "foodList");
        index.get(code).onsuccess = function(e) /*{
          if (e.target.result) {
            console.log("Result found in local DB");
            item = e.target.result;
            return resolve(item); //Return the version from the database
          }
          else*/ { //Not in foodlist already so search OFF
            //First check that there is an internet connection
            if (navigator.connection.type == "none") {
              ons.notification.alert(app.strings["no-internet"] || "No Internet");
              return reject(new Error("No Internet Connection"));
            }

            //Show progress indicator
            document.querySelector('ons-page#foodlist ons-progress-circular').style.display = "inline-block";

            request.open("GET", "https://world.openfoodfacts.org/api/v0/product/"+code+".json", true);
            request.send();
            request.onreadystatechange = function(){

              if (request.readyState == 4 && request.status == 200) {

                //Hide progress indicator
                document.querySelector('ons-page#foodlist ons-progress-circular').style.display = "none";

                let result = JSON.parse(request.responseText);

                if (result.status == 0) { //Product not found

                  //Ask the user if they would like to add the product to the open food facts database
                  ons.notification.confirm("Would you like to add this product to the Open Food Facts database?", {"title":"Product not found", "cancelable":true})
                  .then(function(input) {
                    if (input == 1) {
                      item.barcode = code;
                      return resolve(item);
                    }
                    else
                      return reject(new Error("Product not found"));
                  });
                }
                else { //Product found
                    item = foodlist.parseOFFProduct(result.product); //Return the item
                    return resolve(item);
                }
              }
            };
      //    }
        };
      //}
    });
  },

  parseOFFProduct: function(product) {

    const nutriments = app.nutriments; //Get array of nutriment names (which correspond to OFF nutriment names)
    let item = {"nutrition":{}};

    item.name = escape(product.product_name);
    item.image_url = escape(product.image_url);
    item.barcode = product.code;

    let now = new Date();
    item.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    //Get first brand if there is more than one
    let brands = product.brands || "";
    let n = brands.indexOf(',');
    item.brand = escape(brands.substring(0, n != -1 ? n : brands.length));

    //Nutrition
    let perTag = "";
    if (product.serving_size && (product.nutrition_data_per == "serving" || product.nutriments.energy_serving)) {

      item.portion = product.serving_size.replace(" ", "");
      item.nutrition.calories = parseInt(product.nutriments.energy_serving / 4.15);
      perTag = "_serving";
    }
    else if (product.nutrition_data_per == "100g" && product.nutriments.energy_100g) {
      item.portion = "100g";
      item.nutrition.calories = parseInt(product.nutriments.energy_100g / 4.15);
      perTag = "_100g";
    }
    else if (product.quantity) { //If all else fails
      item.portion = product.quantity;
      item.nutrition.calories = product.nutriments.energy_value;
    }

    //Each nutriment
    for (let i = 0; i < nutriments.length; i++) {
      let nutriment = nutriments[i];
      if (nutriment == "calories") continue;
      item.nutrition[nutriment] = product.nutriments[nutriment + perTag];
    }

    //Kilojules to kcalories
    if (product.nutriments.energy_unit == "kJ") parseInt(item.nutrition.calories = item.nutrition.calories / 4.15);

    //Don't return results with no calories or missing portion
    if (item.nutrition.calories == 0 || item.portion == undefined)
      return undefined;
    else
      return item;
  },

  renderListItem: function(index) {
    let item = this.list[index];

    let li = document.createElement("ons-list-item");
    if (item == undefined) return li; //If item is undefined just return an empty li
    if (item.id) li.id = "food-item" + item.id;
    li.addEventListener("hold", foodlist.deleteItem);

    //Name and info
    let gd = document.createElement("ons-gesture-detector");
    gd.appendChild(li);

    let center = document.createElement("div");
    center.className = "center";
    center.addEventListener("tap", function(){ foodEditor.open(item); });
    li.appendChild(center);

    let name = document.createElement("ons-row");
    name.innerText = unescape(item.name);
    center.appendChild(name);

    let calories = 0;
    if (item.nutrition != undefined) calories = item.nutrition.calories || 0;

    let info = document.createElement("ons-row");
    if (item.brand) info.innerText = unescape(item.brand) + ", ";
    info.innerText += item.portion + ", " + calories + "kcal";
    center.appendChild(info);

    //Checkbox
    let right = document.createElement("div");
    right.className = "right";
    li.appendChild(right);

    let checkbox = document.createElement("ons-checkbox");
    checkbox.setAttribute("name", "food-item-checkbox");
    checkbox.setAttribute("data", JSON.stringify(item)); //Add list item as checkbox parent's data attribute
    checkbox.addEventListener('change', this.checkboxChange); //Attach event
    right.appendChild(checkbox);

    return li;
  },

  //Checkbox change event callback function
  checkboxChange: function() {

    let btnScan = foodlist.page.querySelector('#scan');
    let btnCheck = foodlist.page.querySelector('#submit');
    let checkedboxes = foodlist.page.querySelectorAll('input[name=food-item-checkbox]:checked'); //All checked boxes

    if (checkedboxes.length == 0) {
      btnScan.style.display = "initial";
      btnCheck.style.display = "none";
    }
    else {
      btnScan.style.display = "none";
      btnCheck.style.display = "block";
    }
  },

  submitButtonAction: function() {

    const checked = this.page.querySelectorAll('input[name=food-item-checkbox]:checked'); //Get all checked items

    if (checked.length > 0) { //Sanity test
      //Get data from checked items
      let items = [];
      let searchResult = false;

      //For searching and inserting into the DB
      let transaction = dbHandler.getTransaction("foodList", "readwrite");
      let store = transaction.objectStore("foodList");

      for (let i = 0; i < checked.length; i++) {
        items[i] = JSON.parse(checked[i].offsetParent.getAttribute("data")); //Add food items' data to array

        //If the item doesn't have an ID it must be from a search result
        //Check if item is already in table, if not add it and retrieve ID. Otherwise get existing ID.
        //Do this here and not when processing the search result to reduce overhead. Here we only process checked items not all results
        if (items[i].id == undefined) {
          searchResult = true; //Set flag

          /*jshint loopfunc: true */
          store.index("barcode").get(items[i].barcode).onsuccess = function(e) {
            if (e.target.result)
              items[i] = e.target.result;
            else
              store.put(items[i]).onsuccess = function(e){items[i].id = e.target.result;};
          };
        }
      }

      if (searchResult == true) { //Items were from search result
        transaction.oncomplete = function(){
          console.log("Transaction complete");
          foodsMealsRecipes.returnItems(items);
        };
      }
      else {
        foodsMealsRecipes.returnItems(items);
      }
    }
  },

  deleteItem: function() {

    let id = this.id;

    ons.notification.confirm("Delete this item?")
    .then(function(input) {

      if (input == 1) { //Delete was confirmed
        let request = dbHandler.deleteItem(parseInt(id.replace("food-item", "")), "foodList");

        //If the request was successful remove the list item
        request.onsuccess = function(e) {
          let child = document.querySelector('#foodlist #' + id);
          let parent = child.parentElement;
          parent.removeChild(child);
        };
      }
    });
  },
};

//Page initialization
document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#foodlist')) {

    //Call constructor
    foodlist.initialize();

    //Populate initial list from DB
    foodsMealsRecipes.getFromDB("foodList", window.localStorage.getItem("sort-foods"))
    .then(function(list){
      foodlist.list = list;
      foodlist.listCopy = list;

      //Setup lazy list delegate callbacks
      foodlist.infiniteList.delegate = {
        createItemContent: function(index, template) {
            return foodlist.renderListItem(index);
        },

        countItems: function() {
          return foodlist.list.length;
        },

        /*calculateItemHeight: function(index) {
          // Optional: return the height of the item at position `index`.
          // This can enhance calculations and allow better scrolling.
        },*/

        destroyItem: function(index, e) {
          if (foodlist.list[index] == undefined) return true; //If list is empty just return
          //Remove item event listeners
          e.element.querySelector("ons-checkbox").removeEventListener('change', foodlist.checkboxChange);
          e.element.removeEventListener("hold", foodlist.deleteItem);
        }
      };
    });

    //Search/filter form
    const filter = document.querySelector('ons-page#foodlist #filter');
    filter.addEventListener("input", function(event){
      let value = event.target.value;
      foodlist.list = foodsMealsRecipes.setFilter(value, foodlist.listCopy);
      foodlist.infiniteList.refresh();
    });

    const filterForm = foodlist.page.querySelector("#filter-container");
    filterForm.addEventListener("submit", function(e){
      e.preventDefault();
      foodlist.search(filter.value);
    });

    //Food list submit button
    const submit = foodlist.page.querySelector('#submit');
    submit.addEventListener("tap", function(event){
      foodlist.submitButtonAction();
    });

    //Barcode scan button
    const btnScan = foodlist.page.querySelector("#scan");
    btnScan.addEventListener("tap", function(event) {
      foodlist.scan()
      .then(function(item){
        if (item) {
          if (item.name)
            foodEditor.open(item); //Existing item so open editor as usual
          else
            foodEditor.open(item, true); //No name so must be scanned item for upload
        }
      }, function(err){console.log(err);});
    });

    //Fab button to add new food
    const fab = foodlist.page.querySelector('ons-fab');
    fab.addEventListener("tap", function(event){
      foodEditor.open();
    });
 }
});
