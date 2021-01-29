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

function init(context) {

  getComponents();

  if (context) {

    // From meal list or food list
    if (context.meal) {
      meal = context.meal;

      if (context.items)
        addItems(context.items);
    }

    // Returned from food editor
    if (context.item) {
      replaceListItem(context.item);
    }

    renderMeal();
  }

  bindUIActions();
}

function getComponents() {
  components.submit = document.querySelector(".page[data-name='meal-editor'] #submit");
  components.nameInput = document.querySelector(".page[data-name='meal-editor'] #name");
  components.foodList = document.querySelector(".page[data-name='meal-editor'] #meal-food-list");
  components.fab = document.querySelector(".page[data-name='meal-editor'] #add-food");
  components.nutrition = document.querySelector(".page[data-name='meal-editor'] #meal-nutrition");
  components.swiperWrapper = document.querySelector(".page[data-name='meal-editor'] .swiper-wrapper");
}

function bindUIActions() {

  // Submit
  if (!components.submit.hasClickEvent) {
    components.submit.addEventListener("click", (e) => {
      saveMeal();
    });
    components.submit.hasClickEvent = true;
  }

  // Fab
  if (!components.fab.hasClickEvent) {
    components.fab.addEventListener("click", (e) => {
      f7.views.main.router.navigate("/foods-meals-recipes/", {
        context: {
          origin: "./meal-editor/",
          meal: meal
        },
      });
    });
    components.fab.hasClickEvent = true;
  }

  // Name input
  if (!components.nameInput.hasClickEvent) {
    components.nameInput.addEventListener("change", (e) => {
      meal.name = e.target.value;
    });
    components.nameInput.hasClickEvent = true;
  }

  // Food items 
  const items = Array.from(document.querySelectorAll(".page[data-name='meal-editor'] li"));

  items.forEach((x, i) => {
    if (!x.hastapHoldEvent) {
      x.addEventListener("taphold", (e) => {
        removeItem(x);
      });
      x.hastapHoldEvent = true;
    }
  });
}

function addItems(items) {
  meal.foods = meal.foods.concat(items);
}

function removeItem(x) {
  let title = waistline.strings["confirm-delete-title"] || "Delete";
  let msg = waistline.strings["confirm-delete"] || "Are you sure?";
  let dialog = f7.dialog.confirm(msg, title, callbackOk);

  function callbackOk() {
    x.parentNode.removeChild(x);
  }
}

function saveMeal() {

  let inputs = document.querySelectorAll(".page[data-name='meal-editor'] input");

  let now = new Date();
  meal.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  dbHandler.put(meal, "meals").onsuccess = () => {
    f7.views.main.router.navigate("/foods-meals-recipes/meals/");
  };
}

function replaceListItem(item) {

  for (let i = 0; i < meal.foods.length; i++) {
    if (meal.foods[i] == undefined) continue;

    if (meal.foods[i].id == item.id)
      meal.foods.splice(i, 1, item);
  }
}

async function renderMeal() {

  let now = new Date();
  let nutrition = await waistline.FoodsMealsRecipes.getTotalNutrition(meal.foods);

  let swiper = f7.swiper.get("#meal-nutrition-swiper");
  components.swiperWrapper.innerHTML = "";
  waistline.FoodsMealsRecipes.renderNutritionCard(nutrition, now, swiper);

  components.nameInput.value = meal.name || "";
  renderFoodList();
}

function renderFoodList() {
  components.foodList.innerHTML = "";

  meal.foods.forEach((x) => {
    renderItem(x, components.foodList, false);
  });
}

document.addEventListener("page:init", function(event) {
  if (event.detail.name == "meal-editor") {
    let context = f7.data.context;
    f7.data.context = undefined;

    // Clear old meal
    meal = {
      foods: []
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