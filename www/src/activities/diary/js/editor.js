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

import * as Utils from "/www/assets/js/utils.js";

let item = {}; //The item being edited
const components = {};

function getComponents() {
  components.submit = document.querySelector('#diary-editor #submit');
  components.name = document.querySelector('#diary-editor #name');
  components.brand = document.querySelector('#diary-editor #brand');
  components.category = document.getElementById("category");
  components.unit = document.querySelector('#diary-editor #unit');
  components.portion = document.querySelector('#diary-editor #portion');
  components.quantity = document.querySelector('#diary-editor #quantity');
}

function bindUIActions() {

  //Submit
  components.submit.addEventListener("click", (e) => {
    update();
  });

  //Portion 
  components.portion.addEventListener("change", (e) => {
    changeServing("portion", e.target.value);
  });

  //Quantity 
  components.quantity.addEventListener("change", (e) => {
    changeServing("quantity", e.target.value);
  });
}

function init(data) {
  console.log(data);
  item = data;
  getComponents();
  bindUIActions();
  renderNutritionFields();
  populateFields();
}

/* Nutrition fields are dynamically created for the nutriments of the item */
function renderNutritionFields() {

  let units = waistline.nutrimentUnits;

  let ul = document.getElementById("nutrition");
  ul.innerHTML = ""; //Clear old form 

  for (let k in item.nutrition) {

    let li = document.createElement("li");
    li.className = "item-content item-input";
    ul.appendChild(li);

    let innerDiv = document.createElement("div");
    innerDiv.className = "item-inner";
    li.appendChild(innerDiv);

    let titleDiv = document.createElement("div");
    titleDiv.className = "item-input item-label";
    let text = waistline.strings[k] || k; //Localize
    titleDiv.innerText = (text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " ") + " (" + (units[k] || "g") + ")";
    innerDiv.appendChild(titleDiv);

    let inputWrapper = document.createElement("div");
    inputWrapper.className = "item-input-wrap";
    innerDiv.appendChild(inputWrapper);

    let input = document.createElement("input");
    input.id = k;
    input.type = "number";
    input.step = "0.01";
    input.min = "0";
    input.name = k;
    input.value = Math.round(item.nutrition[k] * 100) / 100;
    input.addEventListener("change", function() {
      changeServing(k, this.value);
    });
    inputWrapper.appendChild(input);
  }
}

function populateFields() {
  components.name.value = Utils.tidyText(item.name, 200);
  components.brand.value = Utils.tidyText(item.brand, 200);
  components.unit.value = item.portion.replace(/[^a-z]/gi, '');

  //Category 
  const mealNames = settings.get("diary", "meal-names");
  components.category.innerHTML = "";

  mealNames.forEach((x, i) => {
    if (x != "" && x != undefined) {
      let option = document.createElement("option");
      option.value = i;
      option.text = x;
      if (i == item.category) option.setAttribute("selected", "");
      components.category.append(option);
    }
  });

  //Portion (serving size)
  if (item.portion != undefined)
    components.portion.value = parseFloat(item.portion);
  else {
    components.portion.setAttribute("placeholder", "N/A");
    components.portion.disabled = true;
  }

  //Quantity (number of servings)
  components.quantity.value = item.quantity;
}

function changeServing(field, newValue) {

  let portion = components.portion.value;
  let quantity = components.quantity.value;

  let oldValue;
  if (item.nutrition[field] != undefined)
    oldValue = parseFloat(item.nutrition[field]);
  else if (item[field] != undefined)
    oldValue = parseFloat(item[field]);

  if (oldValue > 0 && newValue > 0) {
    let multiplier;

    if (field == "portion" || field == "quantity") {
      let portion = parseFloat(item.portion); //Remove unit
      let newPortion = components.portion.value;
      let newQuantity = components.quantity.value;
      multiplier = (newPortion / portion) * (newQuantity / item.quantity);
    } else {
      multiplier = newValue / oldValue;
      components.portion.value = Math.round(parseFloat(item.portion) * multiplier * 100) / 100;
    }

    //Nutrition 
    for (let k in item.nutrition) {
      if (k != field) {
        let input = document.querySelector("#diary-edit-form #" + k);
        input.value = Math.round(item.nutrition[k] * multiplier * 100) / 100;
      }
    }
  }
}

function update() {

  let data = item;

  //Get values from form and push to DB
  let inputs = document.querySelectorAll('#diary-editor input');
  const nutriments = waistline.nutriments;
  const mealNames = settings.get("diary", "meal-names");
  let unit = components.unit.value;

  if (f7.input.validateInputs("#diary-edit-form") == true) {

    //Category
    data.category = parseInt(components.category.value);
    data.category_name = mealNames[data.category];

    inputs.forEach((x, i) => {

      let id = x.id;
      let value = x.value;

      if (nutriments.indexOf(id) != -1) //Nutriments
        data.nutrition[id] = parseFloat(value);
      else {
        if (id != "unit") {
          if (id == "portion" && value != "NaN") {
            value = value + unit;
          }
          data[id] = value;
        }
      }
    });

    //Update the DB and return to diary
    dbHandler.put(data, "diary").onsuccess = function() {
      f7.views.main.router.navigate("/diary/");
    };
  }
}

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='diary-editor']")) {
    let data = f7.views.main.router.currentRoute.context.item;
    if (data)
      init(data);
  }
});