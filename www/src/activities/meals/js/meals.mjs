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
  along with Waistline.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as Utils from "/www/assets/js/utils.js";


var s;
waistline.Meals = {

  settings: {
    list: [], //Main list of foods
    filterList: [], //Copy of the list for filtering
    selection: [], //Items that have been checked, even if list has been changed
    el: {} //UI elements
  },

  init: async function(context) {
    s = this.settings; //Assign settings object
    s.selection = []; //Clear out selection when page is reloaded

    this.getComponents();
    this.createSearchBar();
    this.bindUIActions();

    if (!s.ready) {
      f7.infiniteScroll.create(s.el.infinite); //Setup infinite list
      s.ready = true;
    }

    s.list = await this.getListFromDB();
    s.filterList = s.list;

    this.renderList(true);
  },

  getComponents: function() {
    s.el.submit = document.querySelector(".page[data-name='foods-meals-recipes'] #submit");
    s.el.title = document.querySelector(".page[data-name='foods-meals-recipes'] #title");
    s.el.search = document.querySelector("#meals-tab #meal-search");
    s.el.searchForm = document.querySelector("#meals-tab #meal-search-form");
    s.el.fab = document.querySelector("#add-meal");
    s.el.infinite = document.querySelector(".page[data-name='foods-meals-recipes'] #meals"); //Infinite list container
    s.el.list = document.querySelector(".page[data-name='foods-meals-recipes'] #meals ul"); //Infinite list
    s.el.spinner = document.querySelector("#meals-tab #spinner");
  },

  bindUIActions: function() {

    //Infinite list 
    s.el.infinite.addEventListener("infinite", (e) => {
      this.renderList();
    });
  },

  renderList: function() {

  },

  renderItem: function() {

  },

  getListFromDB: function() {

  },

  getYesterdaysMeal: function(category) {

  },

  addMeal: function(name) {

  },

  updateMeal: function(meal) {

  },

  deleteMeal: function(id) {

  },

  addItem: function(item) {

  },

  deleteItem: function(item) {

  },

  editQuantity: function(item, field, value) {

  },

  changeName: function(meal, name) {

  },

  gotoEditor: function(item) {

  },

  createSearchBar: function() {
    const searchBar = f7.searchbar.create({
      el: ".searchbar",
      backdrop: false,
      customSearch: true,
      on: {
        search(sb, query, previousQuery) {
          if (query != "") {
            s.list = waistline.FoodsMealsRecipes.filterList(query, s.filterList);
            waistline.Meals.renderList(true);
          } else {
            f7.searchbar.disable(this);
          }
        },
        async disable(searchbar, previousQuery) {
          waistline.Meals.unselectCheckedItems();
          s.list = await waistline.Meals.getListFromDB();
          s.filterList = s.list;
          waistline.Meals.renderList(true);
        }
      }
    });
  },

  unselectCheckedItems: function() {

    //Remove any selected search items from the selection array
    const checked = Array.from(document.querySelectorAll('input[type=checkbox]:checked'));

    checked.forEach((x, i) => {
      let itemIndex = s.selection.indexOf(x.data);
      if (itemIndex != -1)
        s.selection.splice(itemIndex, 1);
    });

    this.updateSelectionCount();
  },

  updateSelectionCount: function() {
    if (!s.selection.length) {
      s.el.scan.style.display = "block";
      s.el.submit.style.display = "none";
      s.el.title.innerHTML = "Meals";
    } else {
      s.el.scan.style.display = "none";
      s.el.submit.style.display = "block";
      s.el.title.innerHTML = s.selection.length + " Selected";
    }
  },

};

document.addEventListener("tab:init", function(e) {
  if (e.target.id == "meals") {
    let context = f7.views.main.router.currentRoute.context;
    waistline.Meals.init(context);
  }
});