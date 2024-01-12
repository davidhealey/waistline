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

    if (context && context.item) {
      await this.putItem(context.item);
      app.FoodsMealsRecipes.unselectOldItem(context.item);
    }

    this.getComponents();
    this.createSearchBar();
    this.bindUIActions();
    this.setComponentVisibility();

    if (!app.Foodlist.ready) {
      app.f7.infiniteScroll.create(app.Foodlist.el.infinite); //Setup infinite list
      app.Foodlist.ready = true;
    }

    app.Foodlist.filterList = await this.getListFromDB();
    app.Foodlist.list = app.FoodsMealsRecipes.filterList("", undefined, app.Foodlist.filterList);

    await this.renderList(true);

    if (context)
      app.FoodsMealsRecipes.resetSearchForm(app.Foodlist.el.searchForm, app.Foodlist.el.searchFilter, app.Foodlist.el.searchFilterIcon);
  },

  getComponents: function() {
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
    if (!app.Foodlist.el.infinite.hasInfiniteEvent) {
      app.Foodlist.el.infinite.addEventListener("infinite", (e) => {
        this.renderList();
      });
      app.Foodlist.el.infinite.hasInfiniteEvent = true;
    }

    // Search form - search online
    if (!app.Foodlist.el.searchForm.hasSubmitEvent) {
      app.Foodlist.el.searchForm.addEventListener("submit", (e) => {
        app.Utils.hideKeyboard();
        if (app.Utils.isInternetConnected())
          this.search(app.Foodlist.el.search.value);
      });
      app.Foodlist.el.searchForm.hasSubmitEvent = true;
    }

    // Search filter - reset category filter on long press
    if (!app.Foodlist.el.searchFilter.hasTapholdEvent) {
      app.Foodlist.el.searchFilter.addEventListener("taphold", async (e) => {
        app.FoodsMealsRecipes.clearSelectedCategories(app.Foodlist.el.searchFilter, app.Foodlist.el.searchFilterIcon);
        app.Foodlist.list = app.FoodsMealsRecipes.filterList(app.Foodlist.el.search.value, undefined, app.Foodlist.filterList);
        app.Foodlist.renderList(true);
      });
      app.Foodlist.el.searchFilter.hasTapholdEvent = true;
    }

    if (!app.Foodlist.el.scan.hasClickEvent) {
      app.Foodlist.el.scan.addEventListener("click", async (e) => {
        let item = await this.scan();

        if (item !== undefined) {
          let itemData = JSON.stringify(item);

          if ((item.id == undefined && app.FoodsMealsRecipes.editItems != "disabled") || app.FoodsMealsRecipes.editItems == "enabled") {
            // scanned item is new or editing is enabled -> open food editor for the item
            app.FoodsMealsRecipes.gotoEditor(item);
          } else if (!app.FoodsMealsRecipes.selection.includes(itemData)) {
            // scanned item is not yet selected -> add to selection
            app.FoodsMealsRecipes.selection.push(itemData);
            app.FoodsMealsRecipes.updateSelectionCount();
            app.Foodlist.renderList(true);

            let msg = app.strings["foods-meals-recipes"]["added-to-selection"] || "Scanned item added to selection";
            app.Utils.toast(msg);
          }
        }
      });
      app.Foodlist.el.scan.hasClickEvent = true;
    }
  },

  setComponentVisibility: function() {
    app.Foodlist.el.scan.style.display = "block";

    if (app.FoodsMealsRecipes.editItems == "disabled")
      app.FoodsMealsRecipes.el.fab.style.display = "none";
    else
      app.FoodsMealsRecipes.el.fab.style.display = "block";
  },

  search: async function(query) {
    if (query != "") {
      app.f7.preloader.show();

      app.FoodsMealsRecipes.clearSelectedCategories(app.Foodlist.el.searchFilter, app.Foodlist.el.searchFilterIcon);

      let offList;
      let usdaList;

      let offEnabled = app.Settings.get("integration", "off") || true;
      let usdaEnabled = app.Settings.get("integration", "usda") && (app.Settings.get("integration", "usda-key") != "");

      if (offEnabled == true || usdaEnabled == true) {

        if (offEnabled)
          offList = await app.OpenFoodFacts.search(query);

        if (usdaEnabled)
          usdaList = await app.USDA.search(query);

        let result = [];

        if (usdaList !== undefined)
          result = result.concat(usdaList);

        if (offList !== undefined)
          result = result.concat(offList);

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
    let itemsPerLoad = 20; // Number of items to append at a time
    let lastIndex = document.querySelectorAll(".page[data-name='foods-meals-recipes'] #foodlist-container li").length;

    let clickable = (app.FoodsMealsRecipes.editItems != "disabled");

    if (lastIndex <= app.Foodlist.list.length) {
      //Render next set of items to list
      for (let i = lastIndex; i < lastIndex + itemsPerLoad; i++) {
        if (i >= app.Foodlist.list.length) break; //Exit after all items in list

        let item = app.Foodlist.list[i];

        if (item != undefined) {
          app.FoodsMealsRecipes.renderItem(item, app.Foodlist.el.list, true, false, clickable, undefined, app.Foodlist.handleTapHold, undefined, false, true, "foodlist");
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

      // Check if search result already exists in the DB
      if (item.id == undefined && item.barcode != undefined) {
        let dbRecord = await dbHandler.getFirstNonArchived("foodList", "barcode", item.barcode);

        if (dbRecord != undefined)
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

  handleTapHold: function(item, li) {
    if (item.archived === true) {
      // Offer to restore archived food
      app.Foodlist.handleTapHoldAction("restore-item", item, li);
    } else {
      // Ask user for action
      const actions = ["archive-item", "clone-item", "clone-and-archive"];
      let options = [];

      actions.forEach((action) => {
        let choice = {
          text: app.strings.dialogs[action] || action,
          onClick: () => { app.Foodlist.handleTapHoldAction(action, item, li) }
        };
        options.push(choice);
      });

      let ac = app.f7.actions.create({
        buttons: options,
        closeOnEscape: true,
        animate: !app.Settings.get("appearance", "animations")
      });
      ac.open();
    }
  },

  handleTapHoldAction: function(action, item, li) {
    let title = app.strings.dialogs[action] || action;
    let text = app.strings.dialogs.confirm || "Are you sure?";

    let dialog = app.f7.dialog.create({
      title: title,
      content: app.Utils.getDialogTextDiv(text),
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: app.Utils.escapeKeyCode
        },
        {
          text: app.strings.dialogs.yes || "Yes",
          keyCodes: app.Utils.enterKeyCode,
          onClick: async () => {
            switch (action) {
              case "archive-item":
                await app.FoodsMealsRecipes.archiveItem(item.id, "food", true);
                app.Foodlist.filterList = await app.Foodlist.getListFromDB();
                let index = app.Foodlist.list.indexOf(item);
                if (index != -1)
                  app.Foodlist.list.splice(index, 1);
                li.remove();
                break;

              case "clone-item":
                await app.FoodsMealsRecipes.cloneItem(item, "food");
                app.Foodlist.filterList = await app.Foodlist.getListFromDB();
                app.Foodlist.renderFilteredList();
                break;

              case "clone-and-archive":
                await app.FoodsMealsRecipes.archiveItem(item.id, "food", true);
                await app.FoodsMealsRecipes.cloneItem(item, "food");
                app.Foodlist.filterList = await app.Foodlist.getListFromDB();
                app.Foodlist.renderFilteredList();
                break;

              case "restore-item":
                await app.FoodsMealsRecipes.archiveItem(item.id, "food", false);
                app.Foodlist.filterList = await app.Foodlist.getListFromDB();
                app.Foodlist.renderFilteredList();
                break;
            }
          }
        }
      ]
    }).open();
  },

  renderFilteredList: function() {
    let query = app.Foodlist.el.search.value;
    let categories = app.FoodsMealsRecipes.getSelectedCategories(app.Foodlist.el.searchFilter);
    app.Foodlist.list = app.FoodsMealsRecipes.filterList(query, categories, app.Foodlist.filterList);
    app.Foodlist.renderList(true);
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
    app.FoodsMealsRecipes.populateCategoriesField(app.Foodlist.el.searchFilter, undefined, true, true, false, {
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
  },

  getItemFromSelectedData: function(data) {
    return new Promise(async function(resolve, reject) {
      if (data.id != undefined && data.hidden == true) {
        // Item has ID, but is hidden -> get item from DB and unhide it
        let dbData = await dbHandler.getByKey(data.id, "foodList");

        if (dbData) {
          data = dbData;
          data.hidden = false;
          await app.Foodlist.putItem(data);
        }
      }

      if (data.id == undefined && data.barcode != undefined) {
        // Item has no ID, but has a barcode (must be an online search result) -> check if item is already in DB
        let dbData = await dbHandler.getFirstNonArchived("foodList", "barcode", data.barcode);

        if (dbData) {
          data = dbData;
        }
      }

      if (data.id == undefined) {
        // Add item to DB and get new ID for it
        data.id = await app.Foodlist.putItem(data);
      }

      resolve(data);
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
            let item = await dbHandler.getFirstNonArchived("foodList", "barcode", code);

            // Not already in foodlist so search OFF 
            if (item === undefined) {

              if (!app.Utils.isInternetConnected()) {
                resolve(undefined);
              } else {
                // Display loading image
                app.f7.preloader.show();
                let result = await app.OpenFoodFacts.search(code);
                app.f7.preloader.hide();

                if (result !== undefined && result[0] !== undefined) {
                  item = result[0];
                } else if (result !== undefined && app.FoodsMealsRecipes.editItems != "disabled") {
                  app.Foodlist.gotoUploadEditor(code);
                } else {
                  let msg = app.strings.dialogs["no-results"] || "No matching results";
                  app.Utils.toast(msg);
                }
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

    app.data.context = {
      origin: "foodlist",
      scan: true,
      item: {
        barcode: code,
        nutrition: {}
      },
    };

    let callbackYes = function() {
      app.f7.views.main.router.navigate("/foods-meals-recipes/food-editor/");
    };

    let dialog = app.f7.dialog.create({
      title: title,
      content: app.Utils.getDialogTextDiv(text),
      buttons: [{
          text: app.strings.dialogs.no || "No",
          keyCodes: app.Utils.escapeKeyCode
        },
        {
          text: app.strings.dialogs.yes || "Yes",
          keyCodes: app.Utils.enterKeyCode,
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