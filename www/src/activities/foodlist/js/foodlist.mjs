/*
  Copyright 2020 David Healey

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

import * as Tests from "./tests.js";
import * as Utils from "/www/assets/js/utils.js";
import * as Off from "./open-food-facts.js";
import * as Editor from "/www/src/activities/foods-meals-recipes/js/food-editor.js";

var s;
waistline.Foodlist = {

  settings: {
    list: [], //Main list of foods
    filterList: [], //Copy of the list for filtering
    el: {} //UI elements
  },

  init: async function(context) {
    s = this.settings; //Assign settings object

    if (context) {
      if (context.item) {
        if (context.item.id)
          await this.updateItem(context.item);
        else
          await this.addItem(context.item);
      }
    }

    this.getComponents();
    this.bindUIActions();
    this.createFilterBar();

    if (!s.ready) {
      f7.infiniteScroll.create(s.el.infinite); //Setup infinite list
      s.ready = true;
    }

    //if (s.list.length == 0) {
    s.list = await this.getListFromDB();
    s.filterList = s.list;
    //}

    this.renderList(true);
  },

  getComponents: function() {
    s.el.submit = document.querySelector(".page[data-name='foods-meals-recipes'] #submit");
    s.el.scan = document.querySelector(".page[data-name='foods-meals-recipes'] #scan");
    s.el.search = document.querySelector(".page[data-name='foods-meals-recipes'] #search");
    s.el.searchForm = document.querySelector(".page[data-name='foods-meals-recipes'] #food-search");
    s.el.fab = document.querySelector(".page[data-name='foods-meals-recipes'] #add-item");
    s.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #foodlist"); //Infinite list container
    s.el.list = document.querySelector(".page[data-name='foods-meals-recipes'] #foodlist ul"); //Infinite list container
    s.el.spinner = document.querySelector(".page[data-name='foods-meals-recipes'] #spinner");
  },

  bindUIActions: function() {

    //Submit button 
    s.el.submit.addEventListener("click", (e) => {
      this.submitButtonAction();
    });

    //Fab button 
    s.el.fab.addEventListener("click", (e) => {
      //f7.views.main.router.navigate("./foodlist-editor/");
      this.gotoEditor();
    });

    //Infinite list 
    s.el.infinite.addEventListener("infinite", (e) => {
      this.renderList();
    });

    //Search form 
    s.el.searchForm.addEventListener("submit", (e) => {
      this.search(s.el.search.value);
    });
  },

  search: async function(query) {
    if (query != "") {
      s.el.spinner.style.display = "block";
      let result = await Off.search(query);
      s.el.spinner.style.display = "none";

      s.list = result;
      s.filterList = s.list;
    }

    this.renderList(true);
  },

  renderList: async function(clear) {

    if (clear) Utils.deleteChildNodes(s.el.list);

    //List settings 
    let maxItems = 200; //Max items to load
    let itemsPerLoad = 20; //Number of items to append at a time
    let lastIndex = document.querySelectorAll("#foodlist-container li").length;

    if (lastIndex <= s.list.length) {
      //Render next set of items to list
      for (let i = lastIndex; i <= lastIndex + itemsPerLoad; i++) {
        if (i >= s.list.length) break; //Exit after all items in list
        waistline.Foodlist.renderItem(s.list[i], s.el.list);
      }
    }
  },

  renderItem: function(item, el) {

    if (item) {
      let li = document.createElement("li");

      let content = document.createElement("div");
      content.className = "item-inner";
      li.appendChild(content);

      let title = document.createElement("div");
      title.className = "item-title";
      title.innerText = Utils.tidyText(item.name, 30);
      title.style.width = "100%";

      //Open item editor event 
      title.addEventListener("click", (e) => {
        this.gotoEditor(item);
      });

      //Delete item event
      if (item.id != undefined) {
        title.addEventListener("taphold", (e) => {
          this.deleteItem(item);
        });
      }

      content.appendChild(title);

      let after = document.createElement("div");
      after.className = "item-after";
      content.appendChild(after);

      let label = document.createElement("label");
      label.className = "item-checkbox item-content";
      after.appendChild(label);

      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "food-item-checkbox";
      checkbox.itemId = item.id;
      checkbox.data = JSON.stringify(item);

      //Checkbox action 
      checkbox.addEventListener("change", (e) => {
        waistline.Foodlist.checkboxChanged();
      });

      label.appendChild(checkbox);

      let icon = document.createElement("i");
      icon.className = "icon icon-checkbox";
      icon.style.margin = "0";
      label.appendChild(icon);

      s.el.list.appendChild(li);
    }
  },

  getListFromDB: function() {
    return new Promise(async function(resolve, reject) {
      let sort = waistline.Settings.get("foodlist", "sort");
      let result = await waistline.FoodsMealsRecipes.getFromDB("foodList", sort);
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
      dbHandler.put(item, "foodList").onsuccess = function() {
        resolve();
      };
    }).catch(err => {
      throw (err);
    });
  },

  deleteItem: function(item) {
    return new Promise(function(resolve, reject) {

      let title = waistline.strings["confirm-delete-title"] || "Delete";
      let msg = waistline.strings["confirm-delete"] || "Are you sure?";

      let dialog = f7.dialog.confirm(msg, title, () => {

        let request = dbHandler.deleteItem(item.id, "foodList");

        request.onsuccess = function(e) {
          f7.views.main.router.refreshPage();
        };
      });
    }).catch(err => {
      throw (err);
    });
  },

  checkboxChanged: function() {
    let checkedboxes = document.querySelectorAll("input[type=checkbox]:checked"); //All checked boxes

    if (!checkedboxes.length) {
      s.el.scan.style.display = "block";
      s.el.submit.style.display = "none";
    } else {
      s.el.scan.style.display = "none";
      s.el.submit.style.display = "block";
    }
  },

  createFilterBar: function() {

    const filterBar = f7.searchbar.create({
      el: ".searchbar",
      customSearch: true,
      on: {
        search(sb, query, previousQuery) {
          s.list = waistline.FoodsMealsRecipes.filterList(query, s.filterList);
          waistline.Foodlist.renderList(true);
        },
        async disable(searchbar, previousQuery) {
          s.list = await waistline.Foodlist.getListFromDB();
          s.filterList = s.list;
          waistline.Foodlist.renderList(true);
        }
      }
    });
  },

  gotoEditor: function(item) {
    f7.views.main.router.navigate("./food-editor/", {
      "context": {
        item: item,
        origin: "/foods-meals-recipes/",
        allNutriments: true
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

  submitButtonAction: function() {

    const checked = Array.from(document.querySelectorAll('input[type=checkbox]:checked')); //Get all checked items

    if (checked.length > 0) { //Safety check

      let items = [];

      checked.forEach(async (x) => {

        let item = JSON.parse(x.data);

        if (item.id == undefined) { //No ID, must be a search result 

          if (item.barcode) { //If item has barcode it must be from online service
            //Check to see if item is already in DB 
            let data = await waistline.Foodlist.searchByBarcode(item.barcode);

            //If item is in DB use retrieved data, otherwise add item to DB and get new ID
            if (data)
              item = data;
            else
              item.id = await waistline.Foodlist.addItem(item);
          } else { //No barcode, must be from a different API, insert into DB and leave duplicates for user to deal with
            item.id = await waistline.Foodlist.addItem(item);
          }
        }
        items.push(item);
      });
      waistline.FoodsMealsRecipes.returnItems(items);
    }
  }
};


document.addEventListener("tab:init", function(e) {
  if (e.target.id == "foodlist") {
    let context = f7.views.main.router.currentRoute.context;
    waistline.Foodlist.init(context);
  }
});