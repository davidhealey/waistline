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

var meals = {

  initialize: function() {

    this.page = document.querySelector('ons-page#meals');
    this.list = [];
    this.listCopy = []; //A backup copy of the list is always maintained for filtering

    //Setup lazy list
    this.infiniteList = this.page.querySelector('#infinite-list');

    //Show/Hide back button
    let menuButton = this.page.querySelector("#menu-button");
    let backButton = this.page.querySelector("#back-button");
    backButton.style.display = "none"; //Hide back button by default
    if (nav.pages.length > 1) {
      backButton.style.display = "block";
      menuButton.style.display = "none";
    }
  },

  renderListItem: function(index) {

    let meal = this.list[index];

    let li = document.createElement("ons-list-item");
    if (meal == undefined) return li; //If meal is undefined just return an empty li
    if (meal.id) li.id = "meal" + meal.id;
    li.addEventListener("hold", meals.deleteMeal);

    //Name and info
    let gd = document.createElement("ons-gesture-detector");
    gd.appendChild(li);

    let center = document.createElement("div");
    center.className = "center";
    center.addEventListener("tap", function(){ mealEditor.open(meal); });
    li.appendChild(center);

    let name = document.createElement("ons-row");
    name.innerText = unescape(meal.name);
    center.appendChild(name);

    let info = document.createElement("ons-row");
    info.innerText += meal.nutrition.calories + " Calories";
    center.appendChild(info);

    //Checkbox
    let right = document.createElement("div");
    right.className = "right";
    li.appendChild(right);

    let checkbox = document.createElement("ons-checkbox");
    checkbox.setAttribute("name", "meal-checkbox");
    checkbox.setAttribute("data", JSON.stringify(meal)); //Add list item as checkbox parent's data attribute
    checkbox.addEventListener('change', this.checkboxChange); //Attach event
    right.appendChild(checkbox);

    return li;
  },

  //Checkbox change event callback function
  checkboxChange: function() {

    let btnCheck = meals.page.querySelector('#submit');
    let checkedboxes = meals.page.querySelectorAll('input[type=checkbox]:checked'); //All checked boxes

    if (checkedboxes.length == 0)
      btnCheck.style.display = "none";
    else
      btnCheck.style.display = "block";
  },

  deleteMeal: function() {
    let id = this.id;
    ons.notification.confirm("Delete this item?")
    .then(function(input) {

      if (input == 1) { //Delete was confirmed
        let request = dbHandler.deleteItem(parseInt(id.replace("meal", "")), "meals");

        //If the request was successful remove the list item
        request.onsuccess = function(e) {
          let child = document.querySelector('#meals #' + id);
          let parent = child.parentElement;
          parent.removeChild(child);
        };
      }
    });
  },
};

//Page initialization
document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#meals')) {

    //Initialize module
    meals.initialize();

    //Populate initial list from DB
    foodsMealsRecipes.getFromDB("meals", window.localStorage.getItem("sort-foods"))
    .then(function(list){
      meals.list = list;
      meals.listCopy = list;

      //Setup lazy list delegate callbacks
      meals.infiniteList.delegate = {
        createItemContent: function(index, template) {
            return meals.renderListItem(index);
        },

        countItems: function() {
          return meals.list.length;
        },

        /*calculateItemHeight: function(index) {
          // Optional: return the height of the item at position `index`.
          // This can enhance calculations and allow better scrolling.
        },*/

        destroyItem: function(index, e) {
          if (meals.list[index] == undefined) return true; //If list is empty just return
          //Remove item event listeners
          e.element.querySelector("ons-checkbox").removeEventListener('change', meals.checkboxChange);
          e.element.removeEventListener("hold", meals.deleteMeal);
        }
      };
    });

    //List filter
    const filter = document.querySelector('ons-page#meals #filter');
    filter.addEventListener("input", function(event){
      let value = event.target.value;
      meals.list = foodsMealsRecipes.setFilter(value, meals.listCopy);
      meals.infiniteList.refresh();
    });

    //Fab button to add new food
    const fab = meals.page.querySelector('ons-fab');
    fab.addEventListener("tap", function(event) {
      mealEditor.open();
    });
  }
});
