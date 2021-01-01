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

const render = function(container) {

  let self = this;

  let list = document.createElement("div");
  list.className = "list card card-outline";
  container.appendChild(list);

  let ul = document.createElement("ul");
  list.appendChild(ul);

  //Collapsable list item 
  let li = document.createElement("li");
  li.className = "accordion-item";

  if (this.collapsed == false)
    li.classList.add("accordion-item-opened");

  li.addEventListener("accordion:opened", function(e) {
    self.collapsed = false;
  });

  li.addEventListener("accordion:closed", function(e) {
    self.collapsed = true;
  });

  ul.appendChild(li);

  let a = document.createElement("a");
  a.className = "item-link item-content";
  li.appendChild(a);

  let div = document.createElement("div");
  div.className = "item-inner";
  a.appendChild(div);

  let innerDiv = document.createElement("div");
  innerDiv.className = "item-title";
  innerDiv.innerHTML = this.name;
  div.appendChild(innerDiv);

  let content = document.createElement("div");
  content.className = "accordion-item-content";

  li.appendChild(content);

  renderFooter(ul, this.id, this.nutrition);
  this.renderItems(content);
};

const renderFooter = function(ul, id, nutrition) {

  let li = document.createElement("li");
  ul.appendChild(li);

  let row = document.createElement("div");
  row.className = "row item-content";

  li.appendChild(row);

  //Add button 
  let left = document.createElement("div");
  left.className = "col-10 add-button";
  row.appendChild(left);

  let a = document.createElement("a");
  left.addEventListener("click", function(e) {
    waistline.Diary.gotoFoodlist(id);
  });

  left.appendChild(a);

  let icon = document.createElement("i");
  icon.className = "icon material-icons";
  icon.innerHTML = "add";
  a.appendChild(icon);

  //Calorie count 
  let right = document.createElement("div");
  right.className = "col-25 calorie-count";
  let value = parseInt(nutrition.calories) || 0;
  right.innerHTML = value + " Cal";
  row.appendChild(right);
};

const renderItems = function(el) {

  let self = this;

  this.items.forEach((item, i) => {

    let div = document.createElement("div");
    div.className = "list";

    let ul = document.createElement("ul");
    div.appendChild(ul);

    let li = document.createElement("li");
    li.className = "item-content entry disable-long-tap ripple";
    li.id = item.id;
    if (item.foodId) li.setAttribute("foodId", item.foodId);
    if (item.recipeId) li.setAttribute("recipeId", item.recipeId);
    li.setAttribute("data", JSON.stringify(item));

    li.addEventListener("taphold", function(e) {
      self.removeItem(item);
    });

    li.addEventListener("click", function(e) {
      waistline.Diary.gotoEditor(item);
    });

    ul.appendChild(li);

    let content = document.createElement("div");
    content.className = "item-inner item-cell";
    li.appendChild(content);

    //Name
    let row = document.createElement("div");
    row.className = "item-row";
    content.appendChild(row);

    let name = document.createElement("div");
    name.className = "item-cell diary-entry-name";
    name.innerHTML = Utils.tidyText(item.name, 30);
    row.appendChild(name);

    //Brand
    if (item.brand && item.brand != "") {

      row = document.createElement("div");
      row.className = "item-row";
      content.appendChild(row);

      let brand = document.createElement("div");
      brand.className = "item-cell diary-entry-brand";
      brand.innerHTML = Utils.tidyText(item.brand, 20).italics();
      row.appendChild(brand);
    }

    //Calorie count 
    row = document.createElement("div");
    row.className = "item-row";
    content.appendChild(row);

    let info = document.createElement("div");
    info.className = "item-cell diary-entry-info";
    info.innerText = parseInt(item.nutrition.calories);
    row.appendChild(info);

    el.appendChild(div);
  });
};

const addItem = function(item) {
  this.items.push(item);

  //Sum item nutrition for group
  for (let k in item.nutrition) {
    this.nutrition[k] = this.nutrition[k] || 0;
    this.nutrition[k] += item.nutrition[k];
  }
};

const removeItem = function(item) {
  this.nutrition = {}; //Reset nutrition object
  waistline.Diary.deleteItem(item);
};

const reset = function() {
  this.items = [];
  this.nutrition = {};
};

export const create = function(name, id) {
  return {
    name: name,
    id: id,
    collapsed: false,
    items: [],
    nutrition: {},
    render: render,
    renderItems: renderItems,
    addItem: addItem,
    removeItem: removeItem,
    reset: reset,
  };
};