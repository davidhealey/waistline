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

  let innerList = document.createElement("div");
  innerList.className = "list media-list";
  content.appendChild(innerList);

  let innerUl = document.createElement("ul");
  innerList.appendChild(innerUl);

  this.items.forEach((x) => {
    renderItem(x, innerUl, self);
  });

  renderFooter(ul, this.id, this.nutrition);
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

  //Energy 
  let energyUnit = waistline.Settings.get("nutrition", "energy-unit");

  let right = document.createElement("div");
  right.className = "col-25 energy";
  let value = parseInt(nutrition.calories) || 0;

  if (energyUnit == "kJ")
    value = Math.round(value * 4.1868);

  right.innerHTML = value + " " + energyUnit;
  row.appendChild(right);
};

const renderItem = function(item, el, group) {

  let li = document.createElement("li");
  li.setAttribute("data", JSON.stringify(item));
  el.appendChild(li);

  let a = document.createElement("a");
  a.className = "item-link item-content";
  a.href = "#";

  a.addEventListener("taphold", function(e) {
    group.removeItem(item);
  });

  a.addEventListener("click", function(e) {
    waistline.Diary.gotoEditor(item);
  });

  li.appendChild(a);

  let itemInner = document.createElement("div");
  itemInner.className = "item-inner";
  a.appendChild(itemInner);

  let itemTitleRow = document.createElement("div");
  itemTitleRow.className = "item-title-row";
  itemInner.appendChild(itemTitleRow);

  // Name
  let itemTitle = document.createElement("div");
  itemTitle.className = "item-title";
  itemTitle.innerHTML = Utils.tidyText(item.name, 30);
  itemTitleRow.appendChild(itemTitle);

  // Energy
  let itemAfter = document.createElement("div");
  itemAfter.className = "item-after";

  let energyUnit = waistline.Settings.get("nutrition", "energy-unit");
  let energy = parseInt(item.nutrition.calories);

  if (energyUnit == "kJ")
    energy = Math.round(energy * 4.1868);

  itemAfter.innerHTML = energy + " " + energyUnit;
  itemTitleRow.appendChild(itemAfter);

  // Brand
  let itemSubtitle = document.createElement("div");
  itemSubtitle.className = "item-subtitle";
  itemSubtitle.innerHTML = Utils.tidyText(item.brand, 30).italics();
  itemInner.appendChild(itemSubtitle);

  let itemText = document.createElement("div");
  itemText.className = "item-text";
  itemText.innerHTML = "";
  itemInner.appendChild(itemText);
};

const addItem = function(item) {
  this.items.push(item);

  //Sum item nutrition for group
  for (let k in item.nutrition) {
    this.nutrition[k] = this.nutrition[k] || 0;
    this.nutrition[k] += item.nutrition[k];
  }
};

const addItems = function(items) {
  items.forEach((x) => {
    this.addItem(x);
  });
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
    addItem: addItem,
    addItems: addItems,
    removeItem: removeItem,
    reset: reset,
  };
};