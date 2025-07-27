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

    app.Group.renderFooter(self, ul, this.id, nutrition);
  },

  addActionMenu: function(self, buttonsDiv) {
    let actionMenuDiv = document.createElement("div");
    actionMenuDiv.className = "action-menu margin-horizontal-half";
    buttonsDiv.appendChild(actionMenuDiv);

    let iconAnchor = document.createElement("a");
    actionMenuDiv.appendChild(iconAnchor);

    let icon = document.createElement("i");
    icon.className = "icon material-icons";
    icon.textContent = "more_horiz";
    iconAnchor.appendChild(icon);

    actionMenuDiv.addEventListener("click", function(e) {
      e.preventDefault();
      app.Group.openActionMenu(self);
    });
  },

  openActionMenu: function(self) {
    let isGroupEmpty = self.items.length == 0;
    let actions = [{
        name: app.strings.diary["quick-add"] || "Quick Add",
        callback: app.Group.quickAddAction,
        disabled: false
      }, {
        name: app.strings.dialogs["clear-group-items"] || "Remove all items from meal",
        callback: app.Group.clearGroupItems,
        disabled: isGroupEmpty
      }, {
        name: app.strings.dialogs["move-group-items"] || "Move items to another meal",
        callback: app.Group.moveGroupItems,
        disabled: isGroupEmpty
      }
    ];

    if (app.Settings.get("diary", "timestamps") == true) {
      actions.push({
        name: app.strings.dialogs["set-meal-time"] || "Update timestamps",
        callback: app.Group.setGroupTimestamps,
        disabled: isGroupEmpty
      });
    }

    let options = [];
    actions.filter(action => action.disabled == false).forEach((action) => {
      options.push({
        text: action.name,
        onClick: () => { action.callback(self) }
      });
    });

    let actionMenu = app.f7.actions.create({
      buttons: options,
      closeOnEscape: true,
      animate: !app.Settings.get("appearance", "animations")
    });

    actionMenu.open();
  },

  quickAddAction: function(self) {
    // wrapping quick add call since actions only receive `self`
    app.Diary.quickAdd(self.id);
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

            entry.items = entry.items.filter(item => item.category != self.id);

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

    let smartSelect = app.Group.createSelectStructure(self, mealNames);
    let hasUserConfirmedSelection = false;
    let mealSelection = app.f7.smartSelect.create({
      el: smartSelect,
      openIn: "sheet",
      sheetBackdrop: true,
      sheetCloseLinkText: app.strings.dialogs["ok"] || "OK",
      on: {
        open: (selection) => {
          let smartSelectContainers = selection.$containerEl[0];
          let leftToolbar = smartSelectContainers.querySelector(".left");
          if (leftToolbar != null) {
            let cancelButton = document.createElement("a");
            cancelButton.className = "link sheet-close";
            cancelButton.innerText = app.strings.dialogs["cancel"] || "Cancel";
            leftToolbar.appendChild(cancelButton);

            leftToolbar.addEventListener("click", () => {
              selection.close();
            });
          }

          let rightToolbar = smartSelectContainers.querySelector(".right");
          if (leftToolbar != null) {
            rightToolbar.addEventListener("click", () => {
              hasUserConfirmedSelection = true;
              selection.close();
            });
          }
        },
        closed: (selection) => {
          let selectedMealIndex = selection.$selectEl.val();
          selection.destroy();
          smartSelect.remove();

          if (selectedMealIndex != self.id && hasUserConfirmedSelection == true) {
            app.Group.updateItemGroup(self, selectedMealIndex);
          }
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
      if(mealName == null || mealName == "") {
        return;
      }

      let option = document.createElement("option");
      option.value = index;
      option.innerText = app.strings.diary["default-meals"][mealName.toLowerCase()] || mealName;
      if (index == self.id) {
        option.setAttribute("selected", "")
      };
      select.appendChild(option);
    });

    document.body.appendChild(span);
    return span;
  },

  updateItemGroup: async function(self, targetMealIndex) {
    let entry = await app.Diary.getEntryFromDB();
    if (entry === undefined) {
      return;
    }

    entry.items.forEach(item => {
      if (item.category == self.id) {
        item.category = targetMealIndex;
      }
    });

    await dbHandler.put(entry, "diary");
    let scrollPosition = { position: $(".page-current .page-content").scrollTop() };
    app.Diary.render(scrollPosition);
  },

  setGroupTimestamps: function(self) {
    let locale = app.Settings.get("appearance", "locale");
    if (locale == "auto") {
      locale = app.getLanguage();
    }

    let mealDate = app.Group.getEntryDateWithCurrentTime();
    let hasUserConfirmedSelection = false;
    let timePicker = app.f7.calendar.create({
      locale: locale,
      backdrop: true,
      animate: !app.Settings.get("appearance", "animations"),
      timePicker: true,
      value: [mealDate],
      on: {
        open: (calendar) => {
          // force the time picker to open to hide the calender
          calendar.openTimePicker();

          let timePicker = document.querySelector(".calendar-time-picker");
          let left = timePicker.querySelector(".left");
          let cancelButton = document.createElement("a");
          cancelButton.innerText = app.strings.dialogs["cancel"] || "Cancel";
          cancelButton.className = "link calendar-time-picker-close"
          left.appendChild(cancelButton);
          left.addEventListener("click", () => {
            calendar.closeTimePicker();
            calendar.close();
          });

          let okButton = timePicker.querySelector(".right .link.calendar-time-picker-close");
          okButton.innerText = app.strings.dialogs["ok"] || "OK";
          okButton.parentElement.addEventListener("click", () => {
            hasUserConfirmedSelection = true;
            calendar.closeTimePicker();
            calendar.close();
          });

          if (calendar.inverter == -1) {
            // app is in rtl mode, we still need to display time in ltr
            let columnWrapper = timePicker.querySelector(".picker-columns");
            columnWrapper.style.direction = "ltr";

            // change the last and first class, so the scroll events get passed to the correct column
            let columns = timePicker.querySelectorAll(".picker-column");
            columns[0].className = "picker-column picker-column-last";
            columns[columns.length - 1].className = "picker-column picker-column-first";
          }
        },
        close: (calendar) => {
          if (hasUserConfirmedSelection == true) {
            app.Group.updateTimestamps(self, calendar.value[0]);
          }
        }
      }
    });

    timePicker.open();
  },

  getEntryDateWithCurrentTime: function() {
    if (app.Diary == null || app.Diary.date == null) {
      return new Date();
    }

    let entryDate = app.Diary.date;
    let currentTime = new Date();
    currentTime.setFullYear(entryDate.getFullYear());
    currentTime.setMonth(entryDate.getMonth());
    currentTime.setDate(entryDate.getDate());
    return currentTime;
  },

  updateTimestamps: async function(self, newDate) {
    let entry = await app.Diary.getEntryFromDB();
    if (entry === undefined) {
      return;
    }

    let mealItems = entry.items.filter(item => item.category == self.id);
    mealItems.forEach(item => {
      item.dateTime = newDate;
    });

    await dbHandler.put(entry, "diary");
    let scrollPosition = { position: $(".page-current .page-content").scrollTop() };
    app.Diary.render(scrollPosition);
  },

  renderFooter: function(self, ul, id, nutrition) {

    let li = document.createElement("li");
    li.className = "noselect";
    ul.appendChild(li);

    let row = document.createElement("div");
    row.className = "row item-content";
    li.appendChild(row);

    let buttons = document.createElement("div");
    buttons.className = "display-inline-flex";
    row.appendChild(buttons);

    //Add button
    let left = document.createElement("div");
    left.className = "add-button";
    left.id = "add-button-" + id;
    buttons.appendChild(left);

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

    // Action Menu
    app.Group.addActionMenu(self, buttons);

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
