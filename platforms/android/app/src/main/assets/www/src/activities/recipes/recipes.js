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

var recipes = {

  initialize: function() {

    this.page = document.querySelector('ons-page#recipes');
    this.list = [];
    this.listCopy = []; //A backup copy of the list is always maintained for filtering

    //Setup lazy list
    this.infiniteList = this.page.querySelector('#recipe-list');

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

    let recipe = this.list[index];

    let li = document.createElement("ons-list-item");
    if (recipe == undefined) return li; //If recipe is undefined just return an empty li
    if (recipe.id) li.id = "recipe" + recipe.id;
    li.setAttribute("name", recipe.name);
    li.setAttribute("nutrition", JSON.stringify(recipe.nutrition));
    li.setAttribute("portion", recipe.portion);
    li.addEventListener("hold", recipes.deleteMeal);

    //Name and info
    let gd = document.createElement("ons-gesture-detector");
    gd.appendChild(li);

    let center = document.createElement("div");
    center.className = "center";
    center.addEventListener("tap", function(){ recipeEditor.open(recipe); });
    li.appendChild(center);

    let name = document.createElement("ons-row");
    name.innerText = unescape(recipe.name);
    center.appendChild(name);

    let info = document.createElement("ons-row");
    info.innerText += recipe.nutrition.calories + " Calories";
    center.appendChild(info);

    //Checkbox
    let right = document.createElement("div");
    right.className = "right";
    li.appendChild(right);

    let checkbox = document.createElement("ons-checkbox");
    checkbox.setAttribute("name", "recipe-checkbox");
    checkbox.setAttribute("data", JSON.stringify(recipe)); //Add list item as checkbox parent's data attribute
    checkbox.addEventListener('change', this.checkboxChange); //Attach event
    right.appendChild(checkbox);

    return li;
  },

  //Checkbox change event callback function
  checkboxChange: function() {

    let btnCheck = recipes.page.querySelector('#submit');
    let checkedboxes = recipes.page.querySelectorAll('input[type=checkbox]:checked'); //All checked boxes

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
        let request = dbHandler.deleteItem(parseInt(id.replace("recipe", "")), "recipes");

        //If the request was successful remove the list item
        request.onsuccess = function(e) {
          let child = document.querySelector('#recipes #' + id);
          let parent = child.parentElement;
          parent.removeChild(child);
        };
      }
    });
  },

  submitButtonAction: function() {

    const checked = this.page.querySelectorAll('input[type=checkbox]:checked'); //Get all checked items

    if (checked.length > 0) { //Sanity test

      //Add timestamp
      let now = new Date();
      let dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

      //Convert recipe data into a format the diary can understand - pseudo food items
      let items = [];
      for (var i = 0; i < checked.length; i++) { //Each selected recipe
        let li = checked[i].closest("ons-list-item");
        let item = {};
        item.dateTime = dateTime;
        item.name = li.getAttribute("name");
        item.nutrition = JSON.parse(li.getAttribute("nutrition"));
        item.portion = li.getAttribute("portion");
        item.recipeId = li.id.replace("recipe", "");
        items.push(item);
      }

      foodsMealsRecipes.returnItems(items); //Return items[] to last page
    }
  }
};

//Page initialization
document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#recipes')) {

    //Initialize module
    recipes.initialize();

    //Populate initial list from DB
    foodsMealsRecipes.getFromDB("recipes", window.localStorage.getItem("sort-foods"))
    .then(function(list){
      recipes.list = list;
      recipes.listCopy = list;

      //Setup lazy list delegate callbacks
      recipes.infiniteList.delegate = {
        createItemContent: function(index, template) {
            return recipes.renderListItem(index);
        },

        countItems: function() {
          return recipes.list.length;
        },

        /*calculateItemHeight: function(index) {
          // Optional: return the height of the item at position `index`.
          // This can enhance calculations and allow better scrolling.
        },*/

        destroyItem: function(index, e) {
          if (recipes.list[index] == undefined) return true; //If list is empty just return
          //Remove item event listeners
          e.element.querySelector("ons-checkbox").removeEventListener('change', recipes.checkboxChange);
          e.element.removeEventListener("hold", recipes.deleteMeal);
        }
      };

    });

    //Submit button
    const submit = recipes.page.querySelector('#submit');
    submit.addEventListener("tap", function(event){
      recipes.submitButtonAction();
    });

    //List filter
    const filter = document.querySelector('ons-page#recipes #filter');
    filter.addEventListener("input", function(event){
      let value = event.target.value;
      recipes.list = foodsMealsRecipes.setFilter(value, recipes.listCopy);
      recipes.infiniteList.refresh();
    });

    //Fab button to add new food
    const fab = recipes.page.querySelector('ons-fab');
    fab.addEventListener("tap", function(event) {
      recipeEditor.open();
    });
  }
});
