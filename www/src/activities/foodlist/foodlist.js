/*
  Copyright 2018, 2019, 2020 David Healey

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

/*jshint -W083 */

var foodlist = {

  initialize: function() {
//console.log(f7.views.main.router);

    const history = f7.views.main.router.history;

  /*  if (history[history.length-2] != "/foods-meals-recipes/")
      console.log("DIARY");
    else {
      console.log("NOT DIARY");
    }*/

    this.tab = document.getElementById("foodlist-tab");
    this.list = [];
    this.filterCopy = []; //A backup copy of the list is always maintained for filtering
    this.setupInfiniteList();


    //Attach event handler to submit button
    let submitButton = document.getElementById("submit");
    submitButton.addEventListener("click", function(event) {
      foodlist.submitButtonAction();
    });

    //Attach event handler to fab button
    let fab = document.getElementById("add-item");
    fab.addEventListener("click", function(event) {
      f7.views.main.router.navigate("./foodlist-editor/");
    });

    //Add food button event listener
    /*document.getElementById("add-food").addEventListener("click", function(){
      foodEditor.open();
    });*/


    /*return new Promise(function(resolve, reject) {
      foodlist.page = document.querySelector('ons-page#foodlist');
      foodlist.list = [];
      foodlist.filterCopy = []; //A backup copy of the list is always maintained for filtering

      //Setup lazy list
      foodlist.infiniteList = foodlist.page.querySelector('#food-list');

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

        /*destroyItem: function(index, e) {
          if (foodlist.list[index] == undefined) return true; //If list is empty just return
          //Remove item event listeners
          e.element.querySelector("ons-checkbox").removeEventListener('change', foodlist.checkboxChange);
          e.element.removeEventListener("hold", foodlist.deleteItem);
        }
      };

      //Show/Hide back button
      let menuButton = document.querySelector("ons-page#foodlist #menu-button");
      let backButton = document.querySelector("ons-page#foodlist #back-button");
      backButton.style.display = "none"; //Hide back button by default
      if (nav.pages.length > 1) {
        backButton.style.display = "block";
        menuButton.style.display = "none";
      }
      resolve();
    });*/
  },

  setupInfiniteList: function() {

    let infinite = document.querySelector('#foodlist');
    f7.infiniteScroll.create(infinite);

    //get spinner and hide by default
    spinner = document.getElementById("spinner");
    spinner.style.display = "none";

    // Loading flag
    let allowInfinite = true;

    // Max items to load
    let maxItems = 200;

    // Append items per load
    let itemsPerLoad = 20;

    // Attach 'infinite' event handler
    infinite.addEventListener("infinite", function() {

      // Last loaded index
      let lastItemIndex = document.querySelectorAll("#foodlist-container li").length;

      if (lastItemIndex < foodlist.list.length) {

        // Exit, if loading in progress
        if (!allowInfinite) return;

        allowInfinite = false; // Set loading flag
        spinner.style.display = "none";

        // Emulate 1s loading
        setTimeout(function () {

          allowInfinite = true; // Reset loading flag

          // Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
          if (lastItemIndex >= maxItems || lastItemIndex >= foodlist.list.length-1) {
            spinner.style.display = "none";
            return;
          }
          else
            spinner.style.display = "block";

          // Generate new items HTML and append to list
          let ul = document.querySelector("#foodlist-container ul");

          for (let i = lastItemIndex + 1; i <= lastItemIndex + itemsPerLoad; i++) {
            if (i >= foodlist.list.length) break; //Exit after all items in list

            //Get item html and append to list
            let li = foodlist.getListItemHTML(i);
            ul.appendChild(li);
          }
        }, 500);
      }
    });
  },

  populateListFromDB: function() {

    return new Promise(function(resolve, reject) {
      let sort = settings.get("foodlist", "sort");

      foodsMealsRecipes.getFromDB("foodList", sort)
      .then(function(list) {
        foodlist.list = list;
        foodlist.filterCopy = list;
        resolve();
      });
    });
  },

  renderList: function() {

    //Add up to first 20 items to list
    let ul = document.querySelector("#foodlist-container ul");
    ul.innerHTML = "";

    let max;
    foodlist.list.length > 20 ? max = 20 : max = foodlist.list.length; // jshint ignore:line

    for (let i = 0; i < max; i++) {
      let li = foodlist.getListItemHTML(i);
      ul.appendChild(li);
    }

  },

  getListItemHTML: function(index) {
    let item = this.list[index];

    if (item) {
      let li = document.createElement("li");
      li.data = JSON.stringify(item);

      let inner = document.createElement("div");
      inner.className = "item-inner";

      li.appendChild(inner);

      let title = document.createElement("div");
      title.className = "item-title disable-long-tap ripple";
      title.innerText = foodsMealsRecipes.formatItemText(item.name, 30);
      title.style.width = "100%";

      //Edit trigger
      title.addEventListener("click", function(event) {
        f7.views.main.router.navigate("./foodlist-editor/", {"context":{"itemId":item.id, "item":JSON.stringify(item)}});
      });

      //Delete trigger
      if (item.id != undefined)
        title.addEventListener("taphold", function() {foodlist.deleteItem(item.id);});

      inner.appendChild(title);

      let after = document.createElement("div");
      after.className = "item-after";

      inner.appendChild(after);

      let label = document.createElement("label");
      label.className = "item-checkbox item-content";

      after.appendChild(label);

      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "food-item-checkbox";
      checkbox.itemId = item.id;
      checkbox.addEventListener("change", function(e) {foodlist.checkboxChange();});

      label.appendChild(checkbox);

      let icon = document.createElement("i");
      icon.className = "icon icon-checkbox";
      icon.style.margin = "0";

      label.appendChild(icon);

      return li;
    }
    return false;
  },

  getImages: function(code, field) {
    return new Promise(function(resolve, reject) {
      if (navigator.connection.type == "none" && app.mode != "development") {return reject(false);}

      let endPoint;
      if (app.mode == "development")
        endPoint = "https://off:off@world.openfoodfacts.net/api/v0/product/"+code+".json?fields=" + field; //Testing server
      else
        endPoint = "https://world.openfoodfacts.org/api/v0/product/"+code+".json?fields=images" + field; //Real server

      let request = new XMLHttpRequest();
      request.open("GET", endPoint, true);
      request.send();
      request.onreadystatechange = function(){

        if (request.readyState == 4 && request.status == 200) {
          let result = JSON.parse(request.responseText);
          if (result && result.product)
            resolve(result.product[field]);
          else
            resolve(undefined);
        }
      };
    });
  },

  search: function(term) {
    return new Promise(function(resolve, reject) {
      //First check that there is an internet connection
      if (navigator.connection.type == "none") {
        ons.notification.alert(app.strings["no-internet"]);
        return false;
      }

      let list = [];
      let promises = [];

      //Show circular progress indicator
      spinner = document.getElementById("spinner");
      spinner.style.display = "block";

      //Search OFF database
      promises[0] = foodlist.searchOFF(term)
      .then(function(items){
        list = list.concat(items);
      });

      //Search USDA if enabled
      if (settings.get("foodlist", "usda-search")) {
        promises[1] = foodlist.searchUSDA(term)
        .then(function(items) {
          list = list.concat(items);
        });
      }

      //Wait for all promises to resolve
      Promise.all(promises).then(function(values) {
        spinner.style.display = "none"; //Hide progress indicator
        if (list.length == 0) {
          let t = waistline.strings["no-results"] || "No results found";
          let toast = f7.toast.create({
            text: t,
            position: 'center',
            closeTimeout: 2000,
          });
          toast.open();
          resolve(false);
        }
        else {
          resolve(list);
        }
      });
    });
  },

  searchOFF : function(term) {
    return new Promise(function(resolve, reject) {
      //Build search string
      let query = "https://world.openfoodfacts.org/cgi/search.pl?search_terms="+term+"&search_simple=1&page_size=100&sort_by=last_modified_t&action=process&json=1";

      //Get country name
      let country = settings.get("foodlist", "country") || undefined;

      if (country && country != "All")
        query += "&tagtype_0=countries&tag_contains_0=contains&tag_0=" + escape(country); //Limit search to selected country

      //Create request
      let request = new XMLHttpRequest();
      request.open("GET", query, true);
      request.send();

      request.onreadystatechange = function() {

        if (request.readyState == 4 && request.status == 200) {

          let result = JSON.parse(request.responseText);
          let list = [];

          if (result && result.products && result.products.length != 0) {

            let products = result.products;

            for (let i = 0; i < products.length; i++) {
              let item = foodlist.parseOFFProduct(products[i]);
              if (item) list.push(item);
            }
          }
          return resolve(list);
        }
      };
    });
  },

  searchUSDA: function(term) {

    let list = [];

    return new Promise(function(resolve, reject) {
      let api_key = "TZG6aFDSBJlTFBhKVpsUXy9lLoeHYknISWmRvJXJ"; //USDA Gov API key

      //Build query
      let query = "https://api.nal.usda.gov/ndb/search/?format=json&q=" + term + "&sort=r&max=50&api_key=" + api_key;

      //Create request
      let request = new XMLHttpRequest();
      request.open("GET", query, true);
      request.send();

      request.onreadystatechange = function() {

        if (request.readyState == 4 && request.status == 200) {

          let result = JSON.parse(request.responseText).list;

          if (result && result.item) {

            let items = result.item;
            let promises = [];

            for (let i = 0; i < items.length; i++) {
              promises.push(foodlist.parseUSDAItem(items[i], api_key).then(addFoodToList));
            }

            //Wait for all promises to resolve
            Promise.all(promises).then(function(values) {
              return resolve(list);
            });
          }
          else {
            return resolve(list);
          }
        }
        else if (request.status == 400) {
          return resolve(list);
        }
      };
    });

    function addFoodToList(item) {
      //Check if an item with the same name is already in the list, if it is then don't add the passed item (avoid duplicates!)
      for (let i = 0; i < list.length; i++) {
        if (list[i].name == item.name) return false;
      }
      if (item) list.push(item);
    }
  },

  parseUSDAItem: function(product, api_key) {

    return new Promise(function(resolve, reject) {

      //Build query
      let query = "https://api.nal.usda.gov/ndb/reports/?format=json&ndbno=" + product.ndbno +"&api_key=" + api_key;

      //Create request
      let request = new XMLHttpRequest();
      request.open("GET", query, true);
      request.send();

      request.onreadystatechange = function() {

        if (request.readyState == 4 && request.status == 200) {

          let food = JSON.parse(request.responseText).report.food;

          if (food && food.name != "") {
            const nutriments = app.nutriments; //Get array of nutriment names (which correspond to OFF nutriment names)
            let item = {"nutrition":{}};

            let now = new Date();
            item.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

              item.name = escape(food.name);
              item.barcode = "usda_" + food.ndbno; //Use ndb number as barcode
              item.brand = food.manu || "";
              item.portion = "100" + food.ru;

              //Nutrition
              for (let i = 0; i < food.nutrients.length; i++) {
                let n = food.nutrients[i]; //Nutrient
                let nName = n.name; //Nutrient name, as lowercase

                switch (nName) {
                  case "Energy":
                    item.nutrition.calories = n.value;
                    break;
                  case "Total lipid (fat)":
                    item.nutrition.fat = n.value;
                    break;
                  case "Fatty acids, total saturated":
                    item.nutrition["saturated-fat"] = n.value;
                    break;
                  case "Fatty acids, total trans":
                    item.nutrition["trans-fat"] = n.value;
                    break;
                  default:
                    //Remove commas and anything after from nutrient name
                    if (nName.indexOf(",") != -1) nName = nName.substring(0, nName.indexOf(","));
                    nName.replace(" ", "-"); //We use "-" instead of spaces in off nutriment names
                    nName = nName.toLowerCase(); //Make it lowercase

                    if (nutriments.indexOf(nName) != -1) {
                      item.nutrition[nName] = n.value;
                    }
                }
              }
              return resolve(item);
          }
          return resolve(undefined);
        }
        else if (request.status == 400) {
          return resolve(undefined);
        }
      };
    });
  },

  scan : function() {

    return new Promise(function(resolve, reject) {

      cordova.plugins.barcodeScanner.scan(function(scanData) {

        //let code = "3596710443307"; //Test barcode
        var code = scanData.text;
        let request = new XMLHttpRequest();
        let item = {};

        //Check if item is already in food list - only one item so not great overhead
        let index = dbHandler.getIndex("barcode", "foodList");
        index.get(code).onsuccess = function(e) {
          if (e.target.result) {
            console.log("Result found in local DB");
            item = e.target.result;
            return resolve(item); //Return the version from the database
          }
          else { //Not in foodlist already so search OFF
            //First check that there is an internet connection
            if (navigator.connection.type == "none") {
              ons.notification.alert(app.strings["no-internet"] || "No Internet");
              return reject(new Error("No Internet Connection"));
            }

            //Show progress indicator
            document.querySelector('ons-page#foodlist ons-progress-circular').style.display = "inline-block";

            request.open("GET", "https://world.openfoodfacts.org/api/v0/product/"+code+".json", true);
            request.send();
            request.onreadystatechange = function() {

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
          }
        };
      });
    });
  },

  parseOFFProduct: function(product) {

    const nutriments = waistline.nutriments; //Get array of nutriment names (which correspond to OFF nutriment names)
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
    if (item.name == "" || item.nutrition.calories == undefined || item.nutrition.calories == 0 || item.portion == undefined)
      return undefined;
    else
      return item;
  },

  //Checkbox change event callback function
  checkboxChange: function() {

    let scan = document.getElementById("scan");
    let submit = document.getElementById("submit");
    let checkedboxes = document.querySelectorAll("input[type=checkbox]:checked"); //All checked boxes

    if (checkedboxes.length == 0) {
      scan.style.display = "block";
      submit.style.display = "none";
    }
    else {
      scan.style.display = "none";
      submit.style.display = "block";
    }
  },

  submitButtonAction: function() {

    const checked = document.querySelectorAll('input[type=checkbox]:checked'); //Get all checked items

    if (checked.length > 0) { //Sanity test
      //Get data from checked items
      let items = [];
      let searchResult = false;

      //For searching and inserting into the DB
      let transaction = dbHandler.getTransaction("foodList", "readwrite");
      let store = transaction.objectStore("foodList");

      for (let i = 0; i < checked.length; i++) {
        items[i] = JSON.parse(checked[i].closest("li").data); //Add food items' data to array

        //If the item doesn't have an ID it must be from a search result
        //Check if item is already in table, if not add it and retrieve ID. Otherwise get existing ID.
        //Do this here and not when processing the search result to reduce overhead. Here we only process checked items not all results
        if (items[i].id == undefined) {
          searchResult = true; //Set flag

          if (items[i].barcode) { //If the item has a barcode then it's a result from OFF or USDA (ndb#)
            //Check the database, see if the item already exists - search by barcode
            store.index("barcode").get(items[i].barcode).onsuccess = function(e) {
              if (e.target.result)
                items[i] = e.target.result;
              else
                store.put(items[i]).onsuccess = function(e){items[i].id = e.target.result;};
            };
          }
          else { //No barcode, result must be from a different API. Can't check for this in the DB so just insert and leave duplicates up to the user
            store.put(items[i]).onsuccess = function(e){items[i].id = e.target.result;};
          }
        }
      }

      if (searchResult == true) { //Items were from search result
        transaction.oncomplete = function() {
          console.log("Transaction complete");
          foodsMealsRecipes.returnItems(items);
        };
      }
      else {
        foodsMealsRecipes.returnItems(items);
      }
    }
  },

  deleteItem: function(id) {

    let title = waistline.strings["confirm-delete-title"] || "Delete";
    let msg = waistline.strings["confirm-delete"] || "Are you sure?";
    let dialog = f7.dialog.confirm(msg, title, callbackOk);

    function callbackOk()
    {
      let request = dbHandler.deleteItem(id, "foodList");

      //If the request was successful rerender the list
      request.onsuccess = function(e) {
        foodlist.populateListFromDB()
        .then (function(){
          foodlist.renderList();
        });
      };
    }
  },

  //Sorts the foodlist.list array by the currently selected sort option
  sortList: function() {

    if (settings.get("foodlist", "sort") == "alpha")
      foodlist.list.sort(foodlist.dynamicSort("name"));
    else
      foodlist.list.sort(foodlist.dynamicSort("dateTime", "date"));

    foodlist.filterCopy = foodlist.list;
  },

  // Function to sort ascending an array of objects by some specific key.
  dynamicSort: function(property, type) {

    if (type == "date")
      return function (a,b) {return new Date(b[property]).getTime() - new Date(a[property]).getTime();};
    else
      return function (a,b) {return a[property].localeCompare(b[property]);};
  },

  setupSearchbar: function()
  {
    // create searchbar
    const searchbar = f7.searchbar.create({
      el: '.searchbar',
      customSearch: true,
      on: {
        search(sb, query, previousQuery) {
          const searchInput = document.getElementById("search");
          if (searchInput.value != "") {
              foodlist.list = foodsMealsRecipes.setFilter(searchInput.value, foodlist.filterCopy);
              foodlist.renderList();
          }
          else {
            foodlist.populateListFromDB()
            .then (function(){
              foodlist.renderList();
            });
          }
        },
      },
    });

    document.getElementById("food-search").addEventListener("submit", function(q){
      const searchInput = document.getElementById("search");
      if (searchInput.value != "") {
          foodlist.search(searchInput.value)
          .then(function(list){
            if (list != false) {
              foodlist.list = list;
              foodlist.sortList();
              foodlist.renderList();
            }
          });
      }
    });
  }
};

//Page initialization
document.addEventListener("tab:init", function(event){
  if (event.target.id == "foodlist") {

    foodlist.setupSearchbar();
    foodlist.initialize();
    foodlist.populateListFromDB()
    .then (function(){
      foodlist.renderList();
    });
  }
});


    //Call constructor
    /*foodlist.initialize()
    .then(foodlist.populate);

    //Search/filter form
    const filter = document.querySelector('ons-page#foodlist #filter');
    filter.addEventListener("input", function(event){
      let value = event.target.value;
      if (value != "") {
        foodlist.list = foodsMealsRecipes.setFilter(value, foodlist.filterCopy);
        foodlist.infiniteList.refresh();
      }
      else
        foodlist.populate();
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

    //Sort button
    let sort = foodlist.page.querySelector('ons-toolbar-button#sort');
    sort.addEventListener("tap", function() {
      foodsMealsRecipes.sortingOptions("foodlist")
      .then(foodlist.sortList());
    });
 }*/
//});
