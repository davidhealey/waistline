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

  addActionMenu: function(self, leftDiv) {
    let iconAnchor = document.createElement("a");
    iconAnchor.style = "margin-left: 15px";
    leftDiv.appendChild(iconAnchor);

    let icon = document.createElement("i");
    icon.className = "icon material-icons";
    icon.textContent = "more_horiz";
    iconAnchor.appendChild(icon);

    iconAnchor.addEventListener("touchstart", function(e) {
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
    let targetMealIndex = mealNames.findIndex(mealName => mealName == targetMeal);
    if (targetMealIndex == -1) {
      return;
    } 

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
    let formatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
    let hourCycle = formatter.resolvedOptions().hourCycle;
    switch (hourCycle) {
      case "h11": 
        app.Group.openTimePicker(self, formatter, 0, 11);
        break;
      case "h12":
        app.Group.openTimePicker(self, formatter, 1, 12);
        break;
      case "h24":
        app.Group.openTimePicker(self, formatter, 1, 24);
        break;
      case "h23":
      default:
        app.Group.openTimePicker(self, formatter, 0, 23);
        break;
    };
  },

  openTimePicker: function(self, formatter, minHour, maxHour) {
    let dateNow = Date.now();
    let parts = formatter.formatToParts(dateNow)
    let currentHour = parts.find(part => part.type == "hour").value;
    let currentMinute = parts.find(part => part.type == "minute").value;
    let currentTime = [currentHour, currentMinute];

    let hourValues = Array.from({ length: (maxHour - minHour) + 1 }, (_, i) => (minHour + i).toString().padStart(2, "0"));
    let minuteValues = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
    let columns = [{
        values: hourValues
      }, {
        divider: true,
        content: ':'
      }, {
        values: minuteValues
    }];

    if (hourValues.length == 12) {
      let dayPeriod = parts.find(part => part.type == "dayPeriod")?.value || "AM";
      currentTime.push(dayPeriod);
      columns.push({
        values: ["AM", "PM"]
      });
    }

    let picker = app.f7.picker.create({
      rotateEffect: true,
      value: currentTime,
      cols: columns,
      on: {
        closed: (selection) => {
          let input = selection.value;
          selection.destroy();
          app.Group.updateTimestamps(self, formatter, input);
        }
      }
    });

    picker.open();
  },

  updateTimestamps: async function(self, formatter, selection) {
    let entry = await app.Diary.getEntryFromDB();
    if (entry === undefined) {
      return;
    }

    let dateStr = app.Group.getDateString(entry.dateTime);
    let timeStr = app.Group.getTimeString(formatter, selection);
    let newDate = new Date(dateStr + "T" + timeStr);
    let mealItems = entry.items.filter(item => item.category == self.id);
    mealItems.forEach(item => {
      item.dateTime = newDate;
    });

    await dbHandler.put(entry, "diary");
    let scrollPosition = { position: $(".page-current .page-content").scrollTop() };
    app.Diary.render(scrollPosition);
  },

  getDateString: function(dateTime) {
    let year = dateTime.getFullYear();
    let month = dateTime.getMonth() + 1;
    let day = dateTime.getDate();
    return year + "-" + month.toString().padStart(2, "0") + "-" + day.toString().padStart(2, "0");
  },

  getTimeString: function(formatter, parts) {
    let hour = parseInt(parts[0], 10);
    let minute = parseInt(parts[1], 10);
    let dayPeriod = parts[2];

    let hourCycle = formatter.resolvedOptions().hourCycle;
    switch (hourCycle) {
      case "h11": 
        if (hour == 0 && dayPeriod == "PM") {
          hour = 12;
        } else if (dayPeriod == "PM") {
          hour += 12;
        }
        
        break;
      case "h12":
        if (hour == 12 && dayPeriod == "AM") {
          hour = 0;
        } else if (hour != 12 && dayPeriod == "PM") {
          hour += 12;
        }

        break;
      case "h24":
        hour--;
        break;
    };

    return hour.toString().padStart(2, "0") + ":" + minute.toString().padStart(2, "0") + ":00";
  },

  renderFooter: function(self, ul, id, nutrition) {

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

    // Action Menu
    app.Group.addActionMenu(self, left);

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
