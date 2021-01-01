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

const s = {
  item: undefined,
  origin: undefined,
  allNutriments: false,
  linked: true,
  el: {}
};

function init(context) {
  if (context) {
    if (context.item)
      s.item = context.item;
    else
      s.linked = false; //Unlinked by default for adding new items

    s.origin = context.origin;
    s.allNutriments = context.allNutriments != undefined;
  }

  getComponents();
  bindUIActions();
  updateTitle();
  renderNutritionFields(s.item, s.allNutriments);

  if (s.item)
    populateFields(s.item);

  setLinkButtonIcon();
  setFabVisibility(s.item == undefined);

  if (s.el.category)
    populateCategoryField(s.item);
}

function getComponents() {
  s.el.title = document.querySelector(".page[data-name='food-editor'] #title");
  s.el.link = document.querySelector(".page[data-name='food-editor'] #link");
  s.el.submit = document.querySelector(".page[data-name='food-editor'] #submit");
  s.el.name = document.querySelector(".page[data-name='food-editor'] #name");
  s.el.brand = document.querySelector(".page[data-name='food-editor'] #brand");
  s.el.category = document.querySelector(".page[data-name='food-editor'] #category");
  s.el.unit = document.querySelector(".page[data-name='food-editor'] #unit");
  s.el.portion = document.querySelector(".page[data-name='food-editor'] #portion");
  s.el.quantity = document.querySelector(".page[data-name='food-editor'] #quantity");
  s.el.fab = document.querySelector(".page[data-name='food-editor'] #add-photo");
}

function bindUIActions() {
  s.el.submit.addEventListener("click", (e) => {
    returnItem(s.item);
  });

  s.el.portion.addEventListener("change", (e) => {
    changeServing(s.item, "portion", e.target.value);
  });

  s.el.quantity.addEventListener("change", (e) => {
    changeServing(s.item, "quantity", e.target.value);
  });

  s.el.link.addEventListener("click", (e) => {
    s.linked = 1 - s.linked;
    setLinkButtonIcon();
  });

  s.el.link.addEventListener("click", (e) => {

  });
}

function setLinkButtonIcon() {
  if (s.linked)
    s.el.link.innerHTML = "link";
  else
    s.el.link.innerHTML = "link_off";
}

function setFabVisibility(showControl) {
  if (showControl)
    s.el.fab.style.display = "block";
  else
    s.el.fab.style.display = "none";
}

function updateTitle() {
  if (!s.item) s.el.title.innerHTML = waistline.strings["add-new-item"] || "Add New Item";
}

/* Nutrition fields are dynamically created for the nutriments of the item */
function renderNutritionFields(item, all) {

  const nutriments = waistline.nutriments;
  const units = waistline.nutrimentUnits;

  let ul = document.getElementById("nutrition");
  ul.innerHTML = ""; //Clear old form 

  for (let k of nutriments) {

    if (all || (!all && item && item.nutrition[k])) { //All nutriments or only items nutriments
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
      if (item)
        input.value = Math.round(item.nutrition[k] * 100) / 100 || 0;
      else
        input.value = 0;

      input.addEventListener("change", function() {
        changeServing(item, k, this.value);
      });
      inputWrapper.appendChild(input);
    }
  }
}

function populateCategoryField(item) {
  //Category 
  const mealNames = waistline.Settings.get("diary", "meal-names");
  s.el.category.innerHTML = "";

  mealNames.forEach((x, i) => {
    if (x != "" && x != undefined) {
      let option = document.createElement("option");
      option.value = i;
      option.text = x;
      if (i == item.category) option.setAttribute("selected", "");
      s.el.category.append(option);
    }
  });
}

function populateFields(item) {
  s.el.name.value = Utils.tidyText(item.name, 200);
  s.el.brand.value = Utils.tidyText(item.brand, 200);
  s.el.unit.value = item.portion.replace(/[^a-z]/gi, '');

  //Portion (serving size)
  if (item.portion != undefined)
    s.el.portion.value = parseFloat(item.portion);
  else {
    s.el.portion.setAttribute("placeholder", "N/A");
    s.el.portion.disabled = true;
  }

  //Quantity (number of servings)
  item.quantity = item.quantity || 1;
  s.el.quantity.value = item.quantity;
}

function changeServing(item, field, newValue) {

  if (s.linked) {
    let portion = s.el.portion.value;
    let quantity = s.el.quantity.value;

    let oldValue;
    if (item.nutrition[field] != undefined)
      oldValue = parseFloat(item.nutrition[field]);
    else if (item[field] != undefined)
      oldValue = parseFloat(item[field]);

    if (oldValue > 0 && newValue > 0) {
      let multiplier;

      if (field == "portion" || field == "quantity") {
        let portion = parseFloat(item.portion); //Remove unit
        let newPortion = s.el.portion.value;
        let newQuantity = s.el.quantity.value;
        multiplier = (newPortion / portion) * (newQuantity / item.quantity);
      } else {
        multiplier = newValue / oldValue;
        s.el.portion.value = Math.round(parseFloat(item.portion) * multiplier * 100) / 100;
      }

      //Nutrition 
      const nutriments = waistline.nutriments;
      for (let k of nutriments) {
        if (k != field) {
          let input = document.querySelector("#food-edit-form #" + k);
          if (input) {
            input.value = Math.round(item.nutrition[k] * multiplier * 100) / 100 || 0;
          }
        }
      }
    }
  }
}

function returnItem(item) {

  let data = item || {
    "nutrition": {}
  };

  //Get values from form and return to origin
  const nutriments = waistline.nutriments;
  const inputs = document.querySelectorAll("#food-edit-form input");
  const unit = s.el.unit.value;

  if (f7.input.validateInputs("#food-edit-form") == true) {

    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    data.dateTime = today;

    //Category
    if (s.el.category) {
      const mealNames = waistline.Settings.get("diary", "meal-names");
      data.category = parseInt(s.el.category.value);
      data.category_name = mealNames[data.category];
    }

    inputs.forEach((x, i) => {

      let id = x.id;
      let value = x.value;

      if (value) {
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
      }
    });

    f7.views.main.router.navigate(s.origin, {
      "context": {
        item: data
      }
    });
  }
}

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='food-editor']")) {
    let context = f7.views.main.router.currentRoute.context;
    init(context);
  }
});