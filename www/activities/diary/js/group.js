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
  along with app.  If not, see <http://www.gnu.org/licenses/>.
*/

app.Group = {

  render: async function(container) {

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

    // Render items
    let timestamps = app.Settings.get("diary", "timestamps");
    this.items.forEach((x) => {
      app.FoodsMealsRecipes.renderItem(x, innerUl, false, undefined, self.removeItem, undefined, timestamps);
    });

    let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(this.items);

    app.Group.renderFooter(ul, this.id, nutrition);
  },

  renderFooter: function(ul, id, nutrition) {

    let li = document.createElement("li");
    li.className = "noselect";
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
      app.Diary.gotoFoodlist(id);
    });

    left.addEventListener("taphold", function(e) {
      app.Diary.quickAdd(id);
    });

    left.appendChild(a);

    let icon = document.createElement("i");
    icon.className = "icon material-icons ripple";
    icon.innerHTML = "add";
    a.appendChild(icon);

    //Energy 
    let energyUnit = app.Settings.get("units", "energy");

    let right = document.createElement("div");
    right.className = "col-25 energy";
    let value = parseInt(nutrition.calories) || 0;

    if (energyUnit == "kJ")
      value = Math.round(value * 4.1868);

    right.innerHTML = value + " " + energyUnit;
    row.appendChild(right);
  },

  addItem: function(item) {
    this.items.push(item);
  },

  addItems: function(items) {
    items.forEach((x) => {
      this.addItem(x);
    });
  },

  removeItem: function(item) {
    app.Diary.deleteItem(item);
  },

  reset: function() {
    this.items = [];
    this.nutrition = {};
  },

  create: function(name, id) {
    return {
      name: name,
      id: id,
      collapsed: false,
      items: [],
      render: app.Group.render,
      addItem: app.Group.addItem,
      addItems: app.Group.addItems,
      removeItem: app.Group.removeItem,
      reset: app.Group.reset,
    };
  }
};