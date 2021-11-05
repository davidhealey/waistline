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

app.Diary = {

  ready: false,
  calendar: undefined,
  el: {},
  groups: [],

  init: async function(context) {

    this.getComponents();
    this.bindUIActions();

    //If items have been passed, add them to the db
    if (context) {
      if (context.items || context.item) {
        if (context.items)
          await this.addItems(context.items, context.category);
        else
          await this.updateItem(context.item);

        app.Diary.ready = false; //Trigger fresh render
      }
    }

    if (!app.Diary.ready) {
      app.Diary.groups = this.createMealGroups(); //Create meal groups
      this.render();
      app.Diary.ready = true;
    }
  },

  getComponents: function() {
    app.Diary.el.log = document.querySelector(".page[data-name='diary'] #log");
    app.Diary.el.date = document.querySelector(".page[data-name='diary'] #diary-date");
    app.Diary.el.showChart = document.querySelector(".page[data-name='diary'] #show-chart");
  },

  bindUIActions: function() {

    // Log button
    if (!app.Diary.el.log.hasClickEvent) {
      app.Diary.el.log.addEventListener("click", (e) => {
        app.Diary.log();
      });
      app.Diary.el.log.hasClickEvent = true;
    }

    // Show chart 
    if (!app.Diary.el.showChart.hasClickEvent) {
      app.Diary.el.showChart.addEventListener("click", (e) => {
        app.Diary.showChart();
      });
      app.Diary.el.showChart.hasClickEvent = true;
    }
  },

  setReadyState: function(state) {
    if (state) {
      app.Diary.ready = state;
    }
  },

  createCalendar: function() {
    let result = app.f7.calendar.create({
      inputEl: "#diary-date",
      openIn: "customModal",
      on: {
        init: function(c) {
          if (app.Diary.date)
            c.setValue([app.Diary.date]);
          else {
            let now = new Date();
            let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            c.setValue([today]);
            app.Diary.date = c.getValue();
          }
          app.Diary.updateDateDisplay();
        },
        change: function(c) {
          app.Diary.date = c.getValue();
          if (app.Diary.ready)
            app.Diary.render();
          c.close();
          app.Diary.updateDateDisplay();
        }
      }
    });
    return result;
  },

  bindCalendarControls: function() {
    //Bind actions for previous/next buttons
    const buttons = document.getElementsByClassName("change-date");
    Array.from(buttons).forEach((x, i) => {
      if (!x.hasClickEvent) {
        x.addEventListener("click", (e) => {
          let date = new Date(app.Diary.calendar.getValue());
          i == 0 ? date.setDate(date.getDate() - 1) : date.setDate(date.getDate() + 1);
          app.Diary.calendar.setValue([date]);
        });
        x.hasClickEvent = true;
      }
    });

    let el = document.querySelector(".page[data-name='diary'] #diary-date");

    if (!el.hasClickEvent) {
      el.addEventListener("click", (e) => {
        app.Diary.calendar.open();
      });
      el.hasClickEvent = true;
    }
  },

  resetDate: function() {
    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    app.Diary.date = today;
    app.Diary.updateDateDisplay();
  },

  updateDateDisplay: function() {
    let el = document.querySelector(".page[data-name='diary'] #diary-date");
    let date = new Date(app.Diary.date);
    let dateString = date.toLocaleDateString([], {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
    el.innerText = dateString;
  },

  render: async function() {
    let entry = await this.getEntryFromDB(); // Get diary entry from DB
    let totalNutrition;

    //Clear groups
    for (let i = 0; i < app.Diary.groups.length; i++)
      app.Diary.groups[i].reset();

    // Populate groups and get overal nutrition
    if (entry) {
      await this.populateGroups(entry);
      totalNutrition = await app.FoodsMealsRecipes.getTotalNutrition(entry.items);
    }

    // Render category groups
    let container = document.getElementById("diary-day");
    container.innerHTML = "";

    app.Diary.groups.forEach((x) => {
      x.render(container);
    });

    // Render nutrition swiper card
    let swiper = app.f7.swiper.get('#diary-nutrition .swiper-container');
    let swiperWrapper = document.querySelector('#diary-nutrition .swiper-wrapper');
    swiperWrapper.innerHTML = "";

    await app.Diary.renderNutritionCard(totalNutrition, new Date(app.Diary.date), swiper);
  },

  renderNutritionCard: async function(nutrition, date, swiper) {
    let nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    let nutrimentUnits = app.nutrimentUnits;
    let energyUnit = app.Settings.get("units", "energy");
    let rows = [];
    let count = 0;

    // Optimize column count for screen width
    let columnsToShow = 4;

    if (window.innerWidth > 500)
      columnsToShow = 5;

    if (window.innerWidth < 400)
      columnsToShow--;

    if (app.Settings.get("diary", "show-nutrition-units"))
      columnsToShow--;

    // Determine which nutriments need to be shown and calculate the goals
    nutrimentsToShow = [];
    nutriments.forEach((x) => {
      if ((x == "calories" || x == "kilojoules") && nutrimentUnits[x] != energyUnit) return;
      if (!app.Goals.showInDiary(x)) return;
      nutrimentsToShow.push(x);
    });
    let goals = await app.Goals.getGoals(nutrimentsToShow, date);

    nutrimentsToShow.forEach((x) => {
      let goal = goals[x];

      // Show n nutriments at a time
      if (count % columnsToShow == 0) {
        let slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.style.height = "auto";
        swiper.appendSlide(slide);

        rows[0] = document.createElement("div");
        rows[0].className = "row nutrition-total-title";
        slide.appendChild(rows[0]);

        rows[1] = document.createElement("div");
        rows[1].className = "row nutrition-total-values";
        slide.appendChild(rows[1]);
      }

      // Title
      let title = document.createElement("div");
      title.className = "col";
      title.id = x + "-title";

      let text = app.strings.nutriments[x] || x;
      let t = document.createTextNode(app.Utils.tidyText(text, 50));
      title.appendChild(t);
      rows[0].appendChild(title);

      // Values and goal text
      let values = document.createElement("div");
      values.className = "col keep-ltr";
      values.id = x + "-value";

      let span = document.createElement("span");
      t = document.createTextNode("0");

      if (nutrition !== undefined && nutrition[x] !== undefined) {
        if (x !== "calories" && x !== "kilojoules")
          t.nodeValue = parseFloat(nutrition[x].toFixed(2));
        else
          t.nodeValue = nutrition[x].toFixed(0);
      }

      // Set value text colour
      if (goal !== undefined && goal !== "") {

        let isMin = app.Goals.isMinimumGoal(x);
        let v = parseFloat(t.nodeValue);

        if ((!isMin && v > goal) || (isMin == true && v < goal))
          span.style.color = "red";
        else
          span.style.color = "green";

        t.nodeValue += " / " + goal;
      }

      // Unit
      if (app.Settings.get("diary", "show-nutrition-units")) {
        let unit = app.strings["unit-symbols"][nutrimentUnits[x]];
        if (unit !== undefined)
          t.nodeValue += " " + unit;
      }

      span.appendChild(t);
      values.appendChild(span);
      rows[1].appendChild(values);

      count++;
    });
  },

  createMealGroups: function() {
    const mealNames = app.Settings.get("diary", "meal-names");
    let groups = [];

    if (mealNames !== undefined) {
      mealNames.forEach((x, i) => {
        if (x != "") {
          let t = app.strings.diary["default-meals"][x.toLowerCase()] || x;
          let g = app.Group.create(t, i);
          groups.push(g);
        }
      });
    }

    return groups;
  },

  getEntryFromDB: function() {
    return new Promise(async function(resolve, reject) {
      if (app.Diary.date !== undefined) {
        let date = new Date(app.Diary.date);
        let entry = await dbHandler.get("diary", "dateTime", new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
        resolve(entry);
      }
    }).catch(err => {
      throw (err);
    });
  },

  getNewEntry: function() {
    let date = new Date(app.Diary.date);
    let entry = {
      dateTime: new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
      items: [],
      stats: {},
    };
    return entry;
  },

  populateGroups: function(entry) {
    return new Promise(async function(resolve, reject) {
      entry.items.forEach(async (x, i) => {
        if (x.category !== undefined) {
          x.index = i; // Index in array, not stored in DB
          app.Diary.groups[x.category].addItem(x);
        }
      });

      resolve();
    }).catch(err => {
      throw (err);
    });
  },

  addItems: function(items, category) {
    return new Promise(async function(resolve, reject) {
      if (category !== undefined) {
        // Get current entry or create a new one
        let entry = await app.Diary.getEntryFromDB() || app.Diary.getNewEntry();

        if (app.Settings.get("diary", "prompt-add-items") == true) {
          app.Diary.promptAddItems(items, category, entry, 0);
        } else {
          items.forEach((x) => {
            app.Diary.addItemToEntry(x, category, entry);
          });
          await dbHandler.put(entry, "diary");
        }

        resolve();
      }
      reject();
    }).catch(err => {
      throw (err);
    });
  },

  promptAddItems: async function(items, category, entry, index) {
    let item = items[index];

    if (item !== undefined) {
      if (item.name !== undefined && item.unit !== undefined) {

        // Create dialog content
        let title = app.Utils.tidyText(item.name, 50);

        let div = document.createElement("div");
        div.className = "dialog-text";

        if (item.notes && app.Settings.get("foodlist", "show-notes") == true)
          div.innerText = app.Utils.tidyText(item.notes, 50);

        // Input fields
        let inputs = document.createElement("div");
        inputs.className = "list scroll-dialog";
        let ul = document.createElement("ul");
        inputs.appendChild(ul);

        ["serving-size", "number-of-servings"].forEach((field) => {
          let li = document.createElement("li");
          li.className = "item-content item-input";
          ul.appendChild(li);

          let inner = document.createElement("div");
          inner.className = "item-inner";
          li.appendChild(inner);

          let fieldTitle = document.createElement("div");
          fieldTitle.className = "item-title item-label";
          fieldTitle.innerHTML = app.strings["food-editor"][field] || field;
          if (field == "serving-size")
            fieldTitle.innerHTML += " (" + item.unit + ")";
          inner.appendChild(fieldTitle);

          let inputWrap = document.createElement("div");
          inputWrap.className = "item-input-wrap";
          inner.appendChild(inputWrap);

          let input = document.createElement("input");
          input.className = "dialog-input auto-select";
          input.type = "number";
          if (field == "serving-size")
            input.setAttribute("value", item.portion || "");
          else
            input.setAttribute("value", "1");
          inputWrap.appendChild(input);
        });

        // Open dialog
        let dialog = app.f7.dialog.create({
          title: title,
          content: div.outerHTML + inputs.outerHTML,
          buttons: [{
            text: app.strings.dialogs.skip || "Skip",
            keyCodes: [27],
            onClick: async function(dialog) {
              app.Diary.promptAddItems(items, category, entry, index + 1);
            }
          },
          {
            text: app.strings.dialogs.add || "Add",
            keyCodes: [13],
            onClick: async function(dialog) {
              let inputs = Array.from(dialog.el.getElementsByTagName("input"));
              let portion = inputs[0].value;
              let quantity = inputs[1].value;

              if (portion !== "" && portion >= 0 && !isNaN(portion))
                item.portion = portion;
              if (quantity !== "" && quantity >= 0 && !isNaN(quantity))
                item.quantity = quantity;

              app.Diary.addItemToEntry(item, category, entry);
              app.Diary.promptAddItems(items, category, entry, index + 1);
            }
          }
          ]
        }).open();

      } else {
        // Item has no name (is a meal item) -> add it as is without prompt
        app.Diary.addItemToEntry(item, category, entry);
        app.Diary.promptAddItems(items, category, entry, index + 1);
      }
    } else {
      // No more items to process -> write entry to DB and refresh page
      await dbHandler.put(entry, "diary");
      app.Diary.render();
    }
  },

  addItemToEntry: function(item, category, entry) {
    let newItem = app.FoodsMealsRecipes.flattenItem(item);
    newItem.dateTime = new Date();
    newItem.category = category;
    entry.items.push(newItem);
  },

  updateItem: function(item) {
    return new Promise(async function(resolve, reject) {
      let entry = await app.Diary.getEntryFromDB();

      if (entry) {
        let updatedItem = app.FoodsMealsRecipes.flattenItem(item);
        updatedItem.dateTime = item.dateTime;
        updatedItem.category = item.category;
        entry.items.splice(item.index, 1, updatedItem);

        dbHandler.put(entry, "diary").onsuccess = function() {
          resolve();
        };
      } else {
        resolve();
      }
    }).catch(err => {
      throw (err);
    });
  },

  deleteItem: function(item) {
    let title = app.strings.dialogs["delete-title"] || "Delete Entry";
    let text = app.strings.dialogs["confirm-delete"] || "Are you sure you want to delete this?";

    let div = document.createElement("div");
    div.className = "dialog-text";
    div.innerText = text;

    let dialog = app.f7.dialog.create({
      title: title,
      content: div.outerHTML,
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: [27]
        },
        {
          text: app.strings.dialogs.delete || "Delete",
          keyCodes: [13],
          onClick: async () => {
            let entry = await app.Diary.getEntryFromDB();

            if (entry !== undefined)
              entry.items.splice(item.index, 1);

            dbHandler.put(entry, "diary").onsuccess = function(e) {
              app.f7.views.main.router.refreshPage();
            };
          }
        }
      ]
    }).open();
  },

  quickAdd: function(category) {
    let title = app.strings.diary["quick-add"] || "Quick Add";
    let units = app.nutrimentUnits;
    let energyUnit = app.Settings.get("units", "energy");

    let text;
    if (energyUnit == units.calories)
      text = app.strings.nutriments["calories"] || "Calories";
    else
      text = app.strings.nutriments["kilojoules"] || "Kilojoules";

    // Create dialog content
    let div = document.createElement("div");
    div.className = "dialog-text";
    div.innerText = text;

    let field = document.createElement("div");
    field.className = "dialog-input-field input";

    let input = document.createElement("input");
    input.className = "dialog-input";
    input.id = "energy";
    input.name = "energy";
    input.type = "number";
    field.appendChild(input);

    // Open dialog
    let dialog = app.f7.dialog.create({
      title: title,
      content: div.outerHTML + field.outerHTML,
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: [27]
        },
        {
          text: app.strings.dialogs.ok || "OK",
          keyCodes: [13],
          onClick: async function(dialog) {
            let entry = await app.Diary.getEntryFromDB() || app.Diary.getNewEntry();

            let quantity = Array.from(dialog.el.getElementsByTagName("input"))[0].value;

            if (energyUnit == units.kilojoules)
              quantity = app.Utils.convertUnit(quantity, units.kilojoules, units.calories);

            if (!isNaN(quantity)) {
              let item = await app.Foodlist.getQuickAddItem(); // Get food item

              if (item !== undefined) {
                item.dateTime = new Date();
                item.category = category;
                item.quantity = parseFloat(quantity);

                entry.items.push(item);

                dbHandler.put(entry, "diary").onsuccess = function(e) {
                  app.f7.views.main.router.refreshPage();
                };
              }
            }
          }
        }
      ]
    }).open();
  },

  log: function() {
    const title = app.strings.diary["log-title"] || "Today's Stats";
    const stats = JSON.parse(window.localStorage.getItem("stats")) || {};
    const units = app.Settings.getField("units");
    const fields = app.measurements;

    // Create dialog inputs
    let div = document.createElement("div");
    div.className = "list scroll-dialog";

    let ul = document.createElement("ul");
    div.appendChild(ul);

    for (let i = 0; i < fields.length; i++) {
      let x = fields[i];

      if (x !== "weight" && !app.Goals.showInStats(x)) continue;

      let unit;

      if (x == "body fat")
        unit = "%";
      else
        x == "weight" ? unit = units.weight : unit = units.length;

      let value = stats[x];

      if (value != undefined && x != "body fat") {
        if (x == "weight") {
          if (unit == "lb")
            value = Math.round(stats[x] / 0.45359237 * 100) / 100;
          else if (unit == "st")
            value = Math.round(stats[x] / 6.35029318 * 100) / 100;
        } else {
          if (unit == "inch")
            value = Math.round(stats[x] / 2.54 * 100) / 100;
        }
      }

      let name = app.strings.statistics[x] || x;
      let unitSymbol = app.strings["unit-symbols"][unit] || "";

      let li = document.createElement("li");
      li.className = "item-content item-input";
      ul.appendChild(li);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      li.appendChild(inner);

      let title = document.createElement("div");
      title.className = "item-title item-label";
      title.innerHTML = app.Utils.tidyText(name, 50);
      title.innerHTML += " (" + unitSymbol + ")";
      inner.appendChild(title);

      let inputWrap = document.createElement("div");
      inputWrap.className = "item-input-wrap";
      inner.appendChild(inputWrap);

      let input = document.createElement("input");
      input.className = "dialog-input";
      input.id = x;
      input.name = x;
      input.type = "number";
      input.step = "any";
      input.setAttribute("value", value || "");
      input.placeholder = value || 0;
      inputWrap.appendChild(input);
    }

    let dialog = app.f7.dialog.create({
      title: title,
      content: div.outerHTML,
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: [27]
        },
        {
          text: app.strings.dialogs.ok || "OK",
          keyCodes: [13],
          onClick: function(dialog, e) {
            app.Diary.saveStats(dialog, e);
          }
        }
      ]
    }).open();
  },

  saveStats: async function(dialog) {
    let entry = await app.Diary.getEntryFromDB() || app.Diary.getNewEntry();
    let inputs = Array.from(dialog.el.getElementsByTagName("input"));
    let units = app.Settings.getField("units");

    let stats = {};

    for (let i = 0; i < inputs.length; i++) {
      let x = inputs[i];

      let value = x.value;

      if (x.id !== "body fat") {
        if (x.id == "weight") {
          if (units.weight == "lb")
            value = Math.round(x.value * 0.45359237 * 100) / 100;
          else if (units.weight == "st")
            value = Math.round(x.value * 6.35029318 * 100) / 100;
        } else {
          if (units.length == "inch")
            value = Math.round(x.value * 2.54 * 100) / 100;
        }
      }

      stats[x.id] = parseFloat(value);
    }

    entry.stats = stats;
    window.localStorage.setItem("stats", JSON.stringify(stats));

    dbHandler.put(entry, "diary").onsuccess = function(e) {
      app.Utils.toast("Saved");
    };
  },

  showCategoryNutriments: function(category, nutrition) {
    const mealNames = app.Settings.get("diary", "meal-names");
    const mealName = mealNames[category];
    const dialogTitle = app.strings.diary["default-meals"][mealName.toLowerCase()] || mealName;

    const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    const visible = app.Settings.getField("nutrimentVisibility");
    const nutrimentUnits = app.nutrimentUnits;
    const energyUnit = app.Settings.get("units", "energy");

    // Create dialog
    let div = document.createElement("div");
    div.className = "list scroll-dialog";

    let ul = document.createElement("ul");
    div.appendChild(ul);

    for (i = 0; i < nutriments.length; i++) {

      let x = nutriments[i];

      if (x == "calories" || x == "kilojoules") {
        if (nutrimentUnits[x] != energyUnit) continue;
      } else {
        if (!visible[x]) continue;
      }

      // Get name, unit and value
      let name = app.strings.nutriments[x] || x;
      let unit = app.strings["unit-symbols"][nutrimentUnits[x]] || "g";
      let value = 0;

      if (nutrition !== undefined && nutrition[x] !== undefined) {
        if (x !== "calories" && x !== "kilojoules")
          value = parseFloat(nutrition[x].toFixed(2));
        else
          value = nutrition[x].toFixed(0);
      }

      if (value == 0) continue;

      // List item
      let li = document.createElement("li");
      let div = document.createElement("div");
      div.className = "item-content item-inner";

      // Name
      let title = document.createElement("div");
      title.className = "item-title";
      let text = app.Utils.tidyText(name, 50);
      let t = document.createTextNode(text);
      title.appendChild(t);

      // Value and Unit
      let content = document.createElement("div");
      content.className = "flex-shrink-0";
      text = value + " " + unit;
      t = document.createTextNode(text);
      content.appendChild(t);

      div.appendChild(title);
      div.appendChild(content);
      li.appendChild(div);
      ul.appendChild(li);
    }

    if (ul.childElementCount > 0) {
      let dialog = app.f7.dialog.create({
        title: dialogTitle,
        content: div.outerHTML,
        buttons: [{
            text: app.strings.dialogs.ok || "OK",
            keyCodes: [13]
          }
        ]
      }).open();
    }
  },

  gotoFoodlist: function(category) {
    app.data.context = {
      origin: "/diary/",
      category: category,
      date: new Date(app.Diary.calendar.getValue())
    };

    app.f7.views.main.router.navigate("/foods-meals-recipes/");
  },

  showChart: async function() {
    let entry = await app.Diary.getEntryFromDB();

    if (entry != undefined && entry.items.length > 0) {
      app.data.context = {
        date: app.Diary.calendar.getValue()
      };
      app.f7.views.main.router.navigate("/diary/chart/");
    } else {
      let msg = app.strings.diary["no-data"] || "No Data";
      app.Utils.toast(msg);
    }
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='diary']")) {
    let context = app.data.context;
    app.data.context = undefined;
    app.Diary.bindCalendarControls();
    app.Diary.calendar = app.Diary.createCalendar();
    app.Diary.init(context);
  }
});

document.addEventListener("page:reinit", function(event) {
  if (event.target.matches(".page[data-name='diary']")) {
    let context = app.data.context;
    app.data.context = undefined;
    app.Diary.init(context);
  }
});

document.addEventListener("page:afterout", function(event) {
  if (event.target.matches(".page[data-name='diary']")) {
    if (app.Diary.el.date != undefined)
      app.f7.calendar.destroy(app.Diary.el.date);
  }
});