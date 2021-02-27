/*
  Copyright 2020, 2021 David Healey

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
  along with app.  If not, see <http://www.gnu.org/licenses/>.
*/

app.Foodlist = {

  list: [], //Main list of foods
  filterList: [], //Copy of the list for filtering
  selection: [],
  el: {}, //UI elements

  init: async function(context) {

    this.selection = []; //Clear out selection when page is reloaded

    if (context) {

      if (context.item) {
        if (context.item.id)
          await this.updateItem(context.item);
        else
          await this.addItem(context.item);
      }
    }

    this.getComponents();
    this.createSearchBar();
    this.bindUIActions();

    if (!app.Foodlist.ready) {
      app.f7.infiniteScroll.create(app.Foodlist.el.infinite); //Setup infinite list
      app.Foodlist.ready = true;
    }

    app.Foodlist.list = await this.getListFromDB();
    app.Foodlist.filterList = app.Foodlist.list;

    // Set scan button visibility
    if (app.Settings.get("integration", "off") == true)
      app.Foodlist.el.scan.style.display = "block";
    else
      app.Foodlist.el.scan.style.display = "none";

    this.renderList(true);
  },

  getComponents: function() {
    app.Foodlist.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    app.Foodlist.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    app.Foodlist.el.search = document.querySelector("#foods-tab #food-search");
    app.Foodlist.el.searchForm = document.querySelector("#foods-tab #food-search-form");
    app.Foodlist.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #foodlist"); //Infinite list container
    app.Foodlist.el.list = document.querySelector(".page[data-name='foods-meals-recipes'] #foodlist ul"); //Infinite list
    app.Foodlist.el.spinner = document.querySelector("#foods-tab #spinner");
  },

  bindUIActions: function() {

    //Infinite list 
    app.Foodlist.el.infinite.addEventListener("infinite", (e) => {
      this.renderList();
    });

    //Search form 
    app.Foodlist.el.searchForm.addEventListener("submit", (e) => {
      this.search(app.Foodlist.el.search.value);
    });

    if (!app.Foodlist.el.scan.hasClickEvent) {
      app.Foodlist.el.scan.addEventListener("click", async (e) => {
        let item = await this.scan();
        if (item !== undefined) {
          app.FoodsMealsRecipes.gotoEditor(item);
        }
      });
      app.Foodlist.el.scan.hasClickEvent = true;
    }
  },

  search: async function(query) {
    if (query != "") {
      app.Foodlist.el.spinner.style.display = "block";
      let offList = [];
      let usdaList = [];

      let offEnabled = app.Settings.get("integration", "off");
      let usdaEnabled = app.Settings.get("integration", "usda") && (app.Settings.get("integration", "usda-key") != "");

      if (offEnabled == true || usdaEnabled == true) {

        if (offEnabled)
          offList = await app.OpenFoodFacts.search(query);

        if (usdaEnabled)
          usdaList = await app.USDA.search(query);

        let result = offList.concat(usdaList);

        if (result.length > 0) {
          app.Foodlist.list = result;
          app.Foodlist.filterList = app.Foodlist.list;
        } else {
          app.Utils.toast("No results");
        }
      } else {
        app.Utils.toast("No search providers are enabled", 2000);
      }
    }

    app.Foodlist.el.spinner.style.display = "none";

    this.renderList(true);
  },

  renderList: async function(clear) {

    if (clear) app.Utils.deleteChildNodes(app.Foodlist.el.list);

    //List settings 
    let maxItems = 300; //Max items to load
    let itemsPerLoad = 20; //Number of items to append at a time
    let lastIndex = document.querySelectorAll(".page[data-name='foods-meals-recipes'] #foodlist-container li").length;

    if (lastIndex <= app.Foodlist.list.length) {
      //Render next set of items to list
      for (let i = lastIndex; i <= lastIndex + itemsPerLoad; i++) {
        if (i >= app.Foodlist.list.length) break; //Exit after all items in list
        let item = app.Foodlist.list[i];
        item.type = "food";

        if (!item.archived)
          app.FoodsMealsRecipes.renderItem(item, app.Foodlist.el.list, true, undefined, this.removeItem);
      }
    }
  },

  getListFromDB: function() {
    return new Promise(async function(resolve, reject) {
      let sort = app.Settings.get("foodlist", "sort");
      let result = await app.FoodsMealsRecipes.getFromDB("foodList", sort);
      resolve(result);
    }).catch(err => {
      throw (err);
    });
  },

  addItem: function(item) {
    return new Promise(function(resolve, reject) {
      dbHandler.put(item, "foodList").onsuccess = (e) => {
        resolve(e.target.result);
      };
    }).catch(err => {
      throw (err);
    });
  },

  updateItem: function(item) {
    return new Promise(function(resolve, reject) {
      let now = new Date();

      item.dateTime = now;

      dbHandler.put(item, "foodList").onsuccess = function() {
        resolve();
      };
    }).catch(err => {
      throw (err);
    });
  },

  updateItems: function(items) {
    items.forEach((x) => {
      this.updateItem(x);
    });
  },

  updateDateTimes: async function(itemIds) {
    let items = [];

    itemIds.forEach(async (x) => {
      let item = await dbHandler.getItem(x, "foodList");
      item.dateTime = new Date();
      items.push(item);
    });

    await dbHandler.bulkInsert(items, "foodList");
  },

  removeItem: function(item) {
    return new Promise(function(resolve, reject) {
      let title = app.strings["confirm-delete-title"] || "Delete";
      let msg = app.strings["confirm-delete"] || "Are you sure?";

      let dialog = app.f7.dialog.confirm(msg, title, async () => {
        await app.FoodsMealsRecipes.removeItem(item.id, "food");
        app.Foodlist.list = [];
        app.f7.views.main.router.refreshPage();
      });
    }).catch(err => {
      throw (err);
    });
  },

  createSearchBar: function() {
    const searchBar = app.f7.searchbar.create({
      el: app.Foodlist.el.searchForm,
      backdrop: false,
      customSearch: true,
      on: {
        async search(sb, query, previousQuery) {
          if (query != "") {
            app.Foodlist.list = app.FoodsMealsRecipes.filterList(query, app.Foodlist.filterList);
            app.Foodlist.renderList(true);
          } else {
            app.FoodsMealsRecipes.clearSearchSelection();
            app.Foodlist.list = await app.Foodlist.getListFromDB();
            app.Foodlist.filterList = app.Foodlist.list;
            app.Foodlist.el.spinner.style.display = "none";
            app.f7.searchbar.disable(this);
          }
          app.Foodlist.renderList(true);
        },
      }
    });
  },

  searchByBarcode: function(code) {
    return new Promise(function(resolve, reject) {
      dbHandler.getIndex("barcode", "foodList").get(code).onsuccess = (e) => {
        resolve(e.target.result);
      };
    }).catch(err => {
      throw (err);
    });
  },

  submitButtonAction: async function(selection) {
    let data = await this.getItemsFromSelection(selection);
    this.updateDateTimes(data.ids);
    app.FoodsMealsRecipes.returnItems(data.items);
  },

  getItemsFromSelection: function(selection) {
    return new Promise(async function(resolve, reject) {
      let result = {
        items: [],
        ids: []
      };

      for (let i = 0; i < selection.length; i++) {
        let data = JSON.parse(selection[i]);

        if (data.id == undefined) { //No ID, must be a search result 

          if (data.barcode) { //If item has barcode it must be from online service

            //Check to see if item is already in DB 
            let dbData = await app.Foodlist.searchByBarcode(data.barcode);

            //If item is in DB use retrieved data, otherwise add item to DB and get new ID
            if (dbData) {
              data = dbData;

              // Unarchive the food if it has been archived
              if (data.archived == true) {
                data.archived = false;
                await app.Foodlist.updateItem(data);
              }
            }
          }
          // Doesn't have barcode or could not be found with barcode search
          if (data.id == undefined)
            data.id = await app.Foodlist.addItem(data);
        }

        let item = {
          id: data.id,
          portion: data.portion,
          unit: data.unit,
          type: data.type,
        };

        result.items.push(item);
        result.ids.push(item.id);
      }

      resolve(result);
    });
  },

  gotoEditor: function(item) {
    app.f7.views.main.router.navigate("./food-editor/", {
      "context": {
        item: item,
        origin: "foodlist"
      }
    });
  },

  getQuickAddItem: function() {
    return new Promise(async function(resolve, reject) {
      let item = await dbHandler.get("foodList", "barcode", "quick-add");

      let result = {
        id: item.id,
        portion: item.portion,
        type: "food"
      };

      resolve(result);
    });
  },

  createQuickAddItem: async function() {
    let item = await dbHandler.get("foodList", "barcode", "quick-add");

    if (item == undefined) {
      item = {
        name: "Quick Add",
        barcode: "quick-add",
        "portion": 1,
        nutrition: {
          "calories": 1
        },
        archived: true
      };
      dbHandler.put(item, "foodList");
    }
  },

  scan: function() {
    return new Promise(function(resolve, reject) {
      cordova.plugins.barcodeScanner.scan(async (data) => {

        let code = data.text;

        if (code !== undefined) {
          // Check if the item is already in the foodlist
          let item = await dbHandler.get("foodList", "barcode", code);

          if (item === undefined) {

            // Not already in foodlist so search OFF 
            if (navigator.connection.type == "none") {
              app.Utils.notify(app.strings["no-internet"] || "No internet connection");
              reject();
            }

            // Display loading image
            app.Foodlist.el.spinner.style.display = "block";
            let result = await app.OpenFoodFactssearch(code);

            // Return result from OFF
            if (result[0] !== undefined) {
              item = result[0];
            } else {
              app.Foodlist.gotoUploadEditor(code);
            }
          }
          resolve(item);
        } else {
          reject();
        }
      });
    });
  },

  gotoUploadEditor: function(code) {
    let title = app.strings["product-not-found"] || "Product not found";
    let text = app.strings["add-to-off"] || "Would you like to add this product to the Open Food Facts database?";

    let callbackOk = function() {
      app.f7.views.main.router.navigate("/foods-meals-recipes/food-editor/", {
        context: {
          origin: "foodlist",
          scan: true,
          item: undefined,
          barcode: code
        }
      });
    };

    let dialog = app.f7.dialog.confirm(text, title, callbackOk);
  }
};

document.addEventListener("tab:init", function(e) {
  if (e.target.id == "foodlist") {
    let context = app.f7.views.main.router.currentRoute.context;
    app.Foodlist.init(context);
  }
});