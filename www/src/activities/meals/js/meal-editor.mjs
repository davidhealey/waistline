/*
  Copyright 2021 David Healey

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
import {
  renderItem
} from "/www/src/activities/foods-meals-recipes/foods-meals-recipes.mjs";

// The item being edited
let meal;

const components = {};

async function init(context) {

  getComponents();

  if (context) {

    // From meal list or food list
    if (context.meal) {
      meal = context.meal;
      populateInputs(meal);
    }

    if (context.items)
      addItems(context.items);

    // Returned from meal editor
    if (context.item)
      replaceListItem(context.item);

    renderNutrition();
    await renderItems();
  }

  bindUIActions();
}

function getComponents() {
  components.submit = document.querySelector(".page[data-name='meal-editor'] #submit");
  components.nameInput = document.querySelector(".page[data-name='meal-editor'] #name");
  components.foodlist = document.querySelector(".page[data-name='meal-editor'] #meal-food-list");
  components.fab = document.querySelector(".page[data-name='meal-editor'] #add-food");
  components.nutrition = document.querySelector(".page[data-name='meal-editor'] #meal-nutrition");
  components.swiperWrapper = document.querySelector(".page[data-name='meal-editor'] .swiper-wrapper");
}

function bindUIActions() {

  // Submit
  if (!components.submit.hasClickEvent) {
    components.submit.addEventListener("click", (e) => {
      save();
    });
    components.submit.hasClickEvent = true;
  }

  // Fab
  if (!components.fab.hasClickEvent) {
    components.fab.addEventListener("click", (e) => {
      f7.data.context = {
        origin: "./meal-editor/",
        meal: meal
      };

      f7.views.main.router.navigate("/foods-meals-recipes/", {
        context: f7.data.context
      });
    });
    components.fab.hasClickEvent = true;
  }
}

function populateInputs(meal) {
  let inputs = document.querySelectorAll(".page[data-name='meal-editor'] input");

  inputs.forEach((x) => {
    if (meal[x.name] !== undefined)
      x.value = meal[x.name];
  });
}

function addItems(data) {

  let result = meal.items;

  data.forEach((x) => {
    let item = {
      id: x.id,
      portion: x.portion,
      quantity: 1,
      type: x.type
    };
    result.push(item);
  });
  meal.items = result;
}

function removeItem(item, li) {
  let title = waistline.strings["confirm-delete-title"] || "Delete";
  let text = waistline.strings["confirm-delete"] || "Are you sure?";
  let dialog = f7.dialog.confirm(text, title, callbackOk);

  function callbackOk() {
    meal.items.splice(item.index, 1);
    li.parentNode.removeChild(li);
    renderNutrition();
  }
}

function save() {

  let data = {};

  if (meal.id !== undefined) data.id = meal.id;
  if (meal.items !== undefined) data.items = meal.items;

  let now = new Date();
  data.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  let inputs = document.querySelectorAll(".page[data-name='meal-editor'] input");

  inputs.forEach((x) => {
    if (x.value !== undefined && x.value != "")
      data[x.name] = x.value;
  });

  // Array index should not be saved with items
  if (data.items !== undefined) {
    data.items.forEach((x) => {
      if (x.index !== undefined)
        delete x.index;
    });
  }

  dbHandler.put(data, "meals").onsuccess = () => {
    f7.views.main.router.navigate("/foods-meals-recipes/meals/");
  };
}

function replaceListItem(item) {
  meal.items.splice(item.index, 1, item);
}

async function renderNutrition() {
  let now = new Date();
  let nutrition = await waistline.FoodsMealsRecipes.getTotalNutrition(meal.items);

  let swiper = f7.swiper.get("#meal-nutrition-swiper");
  components.swiperWrapper.innerHTML = "";
  waistline.FoodsMealsRecipes.renderNutritionCard(nutrition, now, swiper);
}

function renderItems() {
  return new Promise(async function(resolve, reject) {

    components.foodlist.innerHTML = "";

    meal.items.forEach(async (x, i) => {
      x.index = i;
      renderItem(x, components.foodlist, false, undefined, removeItem);
    });

    resolve();
  });
}

document.addEventListener("page:init", function(event) {
  if (event.detail.name == "meal-editor") {
    let context = f7.data.context;
    f7.data.context = undefined;

    // Clear old meal
    meal = {
      items: []
    };

    init(context);
  }
});

document.addEventListener("page:reinit", function(event) {
  if (event.detail.name == "meal-editor") {
    let context = f7.data.context;
    f7.data.context = undefined;
    init(context);
  }
});