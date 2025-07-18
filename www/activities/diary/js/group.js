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
    innerDiv.className = "item-title group-title";
    innerDiv.innerText = this.name;
    div.appendChild(innerDiv);

    app.Group.addActionMenu(self, div);

    let content = document.createElement("div");
    content.className = "accordion-item-content";

    li.appendChild(content);

    let innerList = document.createElement("div");
    innerList.className = "list media-list multi-line-titles";
    content.appendChild(innerList);

    let innerUl = document.createElement("ul");
    innerList.appendChild(innerUl);

    // Render items
    let showTimestamps = app.Settings.get("diary", "timestamps");
    let showBrand = app.Settings.get("diary", "show-brands");
    this.items.forEach((x) => {
      app.FoodsMealsRecipes.renderItem(x, innerUl, false, false, true, undefined, self.removeItem, undefined, showTimestamps, showBrand, "diary");
    });

    let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(this.items, "subtract");

    app.Group.renderFooter(ul, this.id, nutrition);
  },

  addActionMenu: function(self, div) {
    let rightIconDiv = document.createElement("div");
    rightIconDiv.className = "right";
    div.appendChild(rightIconDiv);

    let iconAnchor = document.createElement("a");
    iconAnchor.className = "link icon-only";
    rightIconDiv.appendChild(iconAnchor);

    let icon = document.createElement("i");
    icon.className = "icon material-icons";
    icon.textContent = "menu_open";
    iconAnchor.appendChild(icon);

    iconAnchor.addEventListener("touchstart", function(e) {
      e.preventDefault();
      app.Group.openActionMenu(self);
    });
  },

  openActionMenu: function(self) {
    let actions = [{
        name: app.strings.dialogs["clear-group-items"] || "Remove all items from meal",
        callback: app.Group.clearGroupItems,
        disabled: self.items.length == 0
      }, {
        name: app.strings.dialogs["move-group-items"] || "Move items to another meal",
        callback: app.Group.moveGroupItems,
        disabled: self.items.length == 0
      }
    ];

    let options = [];
    actions.forEach((action) => {
      options.push({
        text: action.name,
        onClick: () => { action.callback(self) },
        disabled: action.disabled
      });
    });

    let actionMenu = app.f7.actions.create({
      buttons: options,
      closeOnEscape: true,
      animate: !app.Settings.get("appearance", "animations")
    });

    actionMenu.open();
  },

  clearGroupItems: function(self) {
    let title = app.strings.dialogs["clear-meal-items"] || "Remove all items";
    let text = app.strings.dialogs["confirm"] || "Are you sure?";

    let confirmDialog = app.f7.dialog.create({
      title: title,
      content: app.Utils.getDialogTextDiv(text),
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: app.Utils.escapeKeyCode
        },
        {
          text: app.strings.dialogs.yes || "Yes",
          keyCodes: app.Utils.enterKeyCode,
          onClick: async () => {
            let entry = await app.Diary.getEntryFromDB();
            if (entry === undefined) {
              return;
            }

            self.items.forEach(item => {
              let index = entry.items.findIndex(x => x === item);
              if (index !== -1) {
                entry.items.splice(index, 1);
              }
            });

            await dbHandler.put(entry, "diary");
            let scrollPosition = { position: $(".page-current .page-content").scrollTop() };
            app.Diary.render(scrollPosition);
          }
        }]
    })
    
    confirmDialog.open();
  },

  moveGroupItems: function(self) {
    let mealNames = app.Settings.get("diary", "meal-names") || [];
    if (mealNames.length == 0) {
      return;
    }

    let validMealNames = mealNames.filter(mealName => mealName != "")
    let smartSelect = app.Group.createSelectStructure(self, validMealNames);
    let mealSelection = app.f7.smartSelect.create({
      el: smartSelect,
      openIn: "sheet",
      on: {
        closed: (selection) => {
          let selectedMealName = validMealNames[selection.$selectEl.val()];
          selection.destroy();
          smartSelect.remove();
          app.Group.updateItemGroup(self, mealNames, selectedMealName);
        }
      }
    });

    mealSelection.open();
  },

  createSelectStructure: function(self, mealNames) {
    let span = document.createElement("span");
    span.className = "item-link smart-select"

    let select = document.createElement("select");
    select.className = "group-select";
    span.appendChild(select);

    mealNames.forEach((mealName, index) => {
      let option = document.createElement("option");
      option.value = index;
      option.innerText = app.strings.diary["default-meals"][mealName.toLowerCase()] || mealName;
      if (mealName == self.name) {
        option.setAttribute("selected", "")
      };
      select.appendChild(option);
    });

    document.body.appendChild(span);
    return span;
  },

  updateItemGroup: async function(self, mealNames, targetMeal) {
    let currentMealIndex = mealNames.findIndex(mealName => mealName == self.name);
    let targetMealIndex = mealNames.findIndex(mealName => mealName == targetMeal);
    if (currentMealIndex == -1 || targetMealIndex == -1) {
      return;
    } 

    let entry = await app.Diary.getEntryFromDB();
    if (entry === undefined) {
      return;
    }

    let mealItems = entry.items.filter(item => item.category == currentMealIndex);
    mealItems.forEach(item => {
      item.category = targetMealIndex;
    });

    await dbHandler.put(entry, "diary");
    let scrollPosition = { position: $(".page-current .page-content").scrollTop() };
    app.Diary.render(scrollPosition);
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
    left.className = "add-button";
    left.id = "add-button-" + id;
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
    icon.innerText = "add";
    a.appendChild(icon);

    //Energy
    const energyUnit = app.Settings.get("units", "energy");
    const energyName = app.Utils.getEnergyUnitName(energyUnit);

    let right = document.createElement("div");
    right.className = "margin-horizontal group-energy link icon-only";
    let categoryEnergyTotal = nutrition[energyName] || 0;
    let energyUnitSymbol = app.strings["unit-symbols"][energyUnit] || energyUnit;

    right.addEventListener("click", function(e) {
      app.Diary.showCategoryNutriments(id, nutrition);
    });

    let categoryMacroNutriments = app.Settings.get("diary", "show-macro-nutriments-summary") ? [
      this.getMacroNutrimentFooterText('fat', nutrition.fat, categoryEnergyTotal),
      this.getMacroNutrimentFooterText('carbohydrates', nutrition.carbohydrates, categoryEnergyTotal),
      this.getMacroNutrimentFooterText('proteins', nutrition.proteins, categoryEnergyTotal)
    ].filter(text => text !== null) : [];

    right.innerText = categoryMacroNutriments.join(' / ') +
        (categoryMacroNutriments.length > 0 ? ' / ' : '') +
        app.Utils.tidyNumber(Math.round(categoryEnergyTotal), energyUnitSymbol);
    row.appendChild(right);
  },

  getMacroNutrimentFooterText: function (nutriment/*: string*/, grams/*: number | undefined*/, categoryEnergyTotal/*: number*/) {
    if (categoryEnergyTotal === 0) {
      return null;
    }
    if (!app.Goals.showInDiary(nutriment)) {
      return null;
    }
    if (grams === undefined || isNaN(grams)) {
      return null;
    } else {
      const nutrimentAbbreviation = app.strings["nutriments-abbreviations"][nutriment] || nutriment.charAt(0).toUpperCase();
      return  app.Utils.tidyNumber(Math.round(grams)) + ' ' + nutrimentAbbreviation;
    }
  },

  addItem: function(item) {
    this.items.push(item);
  },

  addItems: function(items) {
    items.forEach((x) => {
      this.addItem(x);
    });
  },

  removeItem: function(item, li) {
    app.Diary.deleteItem(item, li);
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
