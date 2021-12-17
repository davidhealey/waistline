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
  el: {}, //UI elements

  init: async function(context) {

    if (context) {
      if (context.item)
        await this.putItem(context.item);

      app.FoodsMealsRecipes.clearSearchSelection();
      app.f7.searchbar.clear("#food-search-form");
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
    app.Foodlist.el.scan.style.display = "block";

    this.renderList(true);
  },

  getComponents: function() {
    app.Foodlist.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    app.Foodlist.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    app.Foodlist.el.search = document.querySelector("#foods-tab #food-search");
    app.Foodlist.el.searchForm = document.querySelector("#foods-tab #food-search-form");
    app.Foodlist.el.searchFilter = document.querySelector("#foods-tab #food-search-filter");
    app.Foodlist.el.searchFilterIcon = document.querySelector("#foods-tab #food-search-filter-icon");
    app.Foodlist.el.searchFilterContainer = document.querySelector("#foods-tab #food-search-filter-container");
    app.Foodlist.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #foodlist"); //Infinite list container
    app.Foodlist.el.list = document.querySelector(".page[data-name='foods-meals-recipes'] #foodlist ul"); //Infinite list
  },

  bindUIActions: function() {

    // Infinite list - render more items
    app.Foodlist.el.infinite.addEventListener("infinite", (e) => {
      this.renderList();
    });

    // Search form - search online
    app.Foodlist.el.searchForm.addEventListener("submit", (e) => {
      app.Utils.hideKeyboard();
      if (app.Utils.isInternetConnected())
        this.search(app.Foodlist.el.search.value);
    });

    // Search filter - reset category filter on long press
    app.Foodlist.el.searchFilter.addEventListener("taphold", async (e) => {
      app.FoodsMealsRecipes.clearSelectedCategories(app.Foodlist.el.searchFilter, app.Foodlist.el.searchFilterIcon);
      app.Foodlist.list = app.FoodsMealsRecipes.filterList(app.Foodlist.el.search.value, undefined, app.Foodlist.filterList);
      app.Foodlist.renderList(true);
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
      app.f7.preloader.show();

      app.FoodsMealsRecipes.clearSelectedCategories(app.Foodlist.el.searchFilter, app.Foodlist.el.searchFilterIcon);

      let offList = [];
      let usdaList = [];

      let offEnabled = app.Settings.get("integration", "off") || true;
      let usdaEnabled = app.Settings.get("integration", "usda") && (app.Settings.get("integration", "usda-key") != "");

      if (offEnabled == true || usdaEnabled == true) {

        if (offEnabled)
          offList = await app.OpenFoodFacts.search(query);

        if (usdaEnabled)
          usdaList = await app.USDA.search(query);

        let result;

        if (usdaList != undefined && usdaList != false)
          result = usdaList.concat(offList);
        else
          result = offList;

        if (result.length > 0) {
          app.Foodlist.list = result;
          app.Foodlist.filterList = app.Foodlist.list;
        } else {
          let msg = app.strings.dialogs["no-results"] || "No matching results";
          app.Utils.toast(msg);
        }
      } else {
        let msg = app.strings.dialogs["no-search-providers"] || "No search providers are enabled";
        app.Utils.toast(msg);
      }
    }

    app.f7.preloader.hide();

    this.renderList(true);
  },

  renderList: async function(clear) {
    if (clear) app.Utils.deleteChildNodes(app.Foodlist.el.list);

    //List settings
    let maxItems = 300; // Max items to load
    let itemsPerLoad = 20; // Number of items to append at a time
    let lastIndex = document.querySelectorAll(".page[data-name='foods-meals-recipes'] #foodlist-container li").length;

    if (lastIndex <= app.Foodlist.list.length) {
      //Render next set of items to list
      for (let i = lastIndex; i <= lastIndex + itemsPerLoad; i++) {
        if (i >= app.Foodlist.list.length) break; //Exit after all items in list

        let item = app.Foodlist.list[i];

        if (item != undefined) {
          item.type = "food";
          let showThumbnail = app.Utils.showThumbnails("foodlist");
          app.FoodsMealsRecipes.renderItem(item, app.Foodlist.el.list, true, undefined, this.removeItem, undefined, false, showThumbnail);
        }
      }
    }
    app.f7.preloader.hide();
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

  putItem: function(item) {
    return new Promise(async function(resolve, reject) {

      // Check if search result already exists in the db
      if (item.id == undefined && item.barcode !== undefined) {
        let dbRecord = await dbHandler.get("foodList", "barcode", item.barcode);

        if (dbRecord !== undefined)
          item.id = dbRecord.id;
      }

      item.dateTime = new Date();

      dbHandler.put(item, "foodList").onsuccess = (e) => {
        resolve(e.target.result);
      };
    }).catch(err => {
      throw (err);
    });
  },

  updateItems: function(items) {
    items.forEach((x) => {
      this.putItem(x);
    });
  },

  removeItem: function(item) {
    return new Promise(function(resolve, reject) {
      let title = app.strings.dialogs.delete || "Delete";
      let text = app.strings.dialogs["confirm-delete"] || "Are you sure you want to delete this?";

      let div = document.createElement("div");
      div.className = "dialog-text";
      div.innerText = text;

      let dialog = app.f7.dialog.create({
        title: title,
        content: div.outerHTML,
        buttons: [{
            text: app.strings.dialogs.cancel || "Cancel",
            keyCodes: [27]
          },
          {
            text: app.strings.dialogs.delete || "Delete",
            keyCodes: [13],
            onClick: async () => {
              await app.FoodsMealsRecipes.removeItem(item.id, "food");
              app.Foodlist.list = [];
              app.f7.views.main.router.refreshPage();
            }
          }
        ]
      }).open();
    }).catch(err => {
      throw (err);
    });
  },

  createSearchBar: function() {
    app.FoodsMealsRecipes.initializeSearchBar(app.Foodlist.el.searchForm, {
      searchbarSearch: async (searchbar, query, previousQuery) => {
        if (query == "")
          app.Foodlist.filterList = await app.Foodlist.getListFromDB();
        let categories = app.FoodsMealsRecipes.getSelectedCategories(app.Foodlist.el.searchFilter);
        app.Foodlist.list = app.FoodsMealsRecipes.filterList(query, categories, app.Foodlist.filterList);
        app.Foodlist.renderList(true);
      }
    });
    app.FoodsMealsRecipes.populateCategoriesField(app.Foodlist.el.searchFilter, undefined, true, false, {
      beforeOpen: (smartSelect, prevent) => {
        smartSelect.selectEl.selectedIndex = -1;
      },
      close: (smartSelect) => {
        let query = app.Foodlist.el.search.value;
        let categories = app.FoodsMealsRecipes.getSelectedCategories(app.Foodlist.el.searchFilter);
        if (categories !== undefined)
          app.Foodlist.el.searchFilterIcon.classList.add(".color-theme");
        else
          app.Foodlist.el.searchFilterIcon.classList.remove(".color-theme");
        app.Foodlist.list = app.FoodsMealsRecipes.filterList(query, categories, app.Foodlist.filterList);
        app.Foodlist.renderList(true);
      }
    });
    app.FoodsMealsRecipes.setCategoriesVisibility(app.Foodlist.el.searchFilterContainer);
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
              data.archived = false; // Unarchive the food if it has been archived
              await app.Foodlist.putItem(data);
            }
          }

          // Doesn't have barcode or could not be found with barcode search
          if (data.id == undefined)
            data.id = await app.Foodlist.putItem(data);
        }

        result.items.push(data);
        result.ids.push(data.id);
      }

      resolve(result);
    });
  },

  gotoEditor: function(item) {
    app.data.context = {
      item: item,
      origin: "foodlist"
    };

    app.f7.views.main.router.navigate("./food-editor/");
  },

  getQuickAddItem: function() {
    return new Promise(async function(resolve, reject) {
      let item = await dbHandler.get("foodList", "barcode", "quick-add");

      if (item == undefined)
        item = await app.Foodlist.createQuickAddItem();

      let result = {
        id: item.id,
        portion: item.portion,
        type: "food"
      };

      resolve(result);
    });
  },

  getQuickAddItemDefinition: function() {
    let result = {
      name: "Quick Add",
      barcode: "quick-add",
      portion: 1,
      nutrition: {
        calories: 1
      },
      archived: true
    };

    return result;
  },

  createQuickAddItem: function() {
    return new Promise(function(resolve, reject) {

      item = app.Foodlist.getQuickAddItemDefinition();

      let request = dbHandler.put(item, "foodList");

      request.onsuccess = () => {
        item.id = request.result;
        resolve(item);
      };
    });
  },

  scan: function() {
    return new Promise(function(resolve, reject) {
      cordova.plugins.barcodeScanner.scan(async (data) => {
          let code = data.text;

          if (code !== undefined && !data.cancelled) {
            // Check if the item is already in the foodlist
            let item = await dbHandler.get("foodList", "barcode", code);

            // Not already in foodlist so search OFF 
            if (item === undefined || (item.archived !== undefined && item.archived == true)) {

              if (!app.Utils.isInternetConnected()) {
                resolve(undefined);
              } else {
                // Display loading image
                app.f7.preloader.show();
                let result = await app.OpenFoodFacts.search(code);
                app.f7.preloader.hide();

                // When downloading data for archived items reuse the same id
                if (item !== undefined && item.id !== undefined)
                  result[0].id = item.id;

                if (result !== undefined && result[0] !== undefined)
                  item = result[0];
                else
                  app.Foodlist.gotoUploadEditor(code);
              }
            }
            resolve(item);
          } else {
            resolve(undefined);
          }
        },
        async (error) => {
          resolve(undefined);
        }, {
          showTorchButton: true,
          disableSuccessBeep: !app.Settings.get("integration", "barcode-sound"),
          prompt: app.strings["foods-meals-recipes"]["scan-prompt"] || "Place a barcode inside the scan area"
        });
    });
  },

  gotoUploadEditor: function(code) {
    let title = app.strings.dialogs["no-results"] || "No matching results";
    let text = app.strings.dialogs["add-to-off"] || "Would you like to add this product to the Open Food Facts database?";

    let div = document.createElement("div");
    div.className = "dialog-text";
    div.innerText = text;

    app.data.context = {
      origin: "foodlist",
      scan: true,
      item: undefined,
      barcode: code
    };

    let callbackYes = function() {
      app.f7.views.main.router.navigate("/foods-meals-recipes/food-editor/");
    };

    let dialog = app.f7.dialog.create({
      title: title,
      content: div.outerHTML,
      buttons: [{
          text: app.strings.dialogs.no || "No",
          keyCodes: [27]
        },
        {
          text: app.strings.dialogs.yes || "Yes",
          keyCodes: [13],
          onClick: callbackYes
        }
      ]
    }).open();
  }
};

document.addEventListener("tab:init", function(e) {
  if (e.target.id == "foodlist") {
    let context = app.data.context;
    app.data.context = undefined;
    app.Foodlist.init(context);
  }
});