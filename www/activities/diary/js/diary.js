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
  processingContext: false,
  calendar: undefined,
  lastScrollPosition: 0,
  el: {},
  groups: {},

  init: async function(context) {

    this.getComponents();
    this.bindUIActions();
    this.setComponentVisibility();

    let render = false;
    let scrollPosition;

    // If items have been passed, add them to the DB and render
    if (context) {
      if (context.items) {
        await this.addItems(context.items, context.category);
        scrollPosition = { category: context.category };
      } else if (context.item) {
        await this.updateItem(context.item);
        scrollPosition = { position: app.Diary.lastScrollPosition };
      }
      app.Diary.processingContext = false; // Clear processingContext flag
      render = true;
    }

    // If the meal groups aren't ready, create them and render
    if (!app.Diary.ready) {
      app.Diary.groups = this.createMealGroups();
      app.Diary.ready = true; // Set ready flag
      render = true;
    }

    if (render)
      app.Diary.render(scrollPosition)

    if (document.querySelector(".page-current[data-name='diary']") != null)
      app.Diary.lastScrollPosition = 0; // Reset last scroll position
  },

  getComponents: function() {
    app.Diary.el.log = document.querySelector(".page[data-name='diary'] #log");
    app.Diary.el.date = document.querySelector(".page[data-name='diary'] #diary-date");
    app.Diary.el.showChart = document.querySelector(".page[data-name='diary'] #show-chart");
    app.Diary.el.diaryNutrition = document.querySelector(".page[data-name='diary'] #diary-nutrition");
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

    // Toggle nutrition swiper card
    if (!app.Diary.el.diaryNutrition.hasClickEvent) {
      app.Diary.el.diaryNutrition.addEventListener("click", (e) => {
        if (app.Diary.el.diaryNutrition.classList.contains("show-values")) {
          app.Diary.el.diaryNutrition.classList.remove("show-values");
          app.Diary.el.diaryNutrition.classList.add("show-remaining");
        } else {
          app.Diary.el.diaryNutrition.classList.remove("show-remaining");
          app.Diary.el.diaryNutrition.classList.add("show-values");
        }
      });
      app.Diary.el.diaryNutrition.hasClickEvent = true;
    }
  },

  setComponentVisibility: function() {
    const bodyStatsVisibility = app.Settings.getField("bodyStatsVisibility");
    let logButtonVisible = false;

    for (stat in bodyStatsVisibility) {
      if (bodyStatsVisibility[stat] === true) {
        logButtonVisible = true;
        break;
      }
    }

    if (!logButtonVisible)
      app.Diary.el.log.style.display = "none";
  },

  resetReadyState: function() {
    app.Diary.ready = false;
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
            app.Diary.date = new Date(c.getValue());
          }
          app.Diary.updateDateDisplay();
        },
        change: function(c) {
          app.Diary.date = new Date(c.getValue());
          if (app.Diary.ready == true && app.Diary.processingContext == false)
            app.Diary.render();
          c.close();
          app.Diary.updateDateDisplay();
        }
      }
    });
    return result;
  },

  bindCalendarControls: function() {
    // Bind actions for previous/next buttons
    const buttons = document.querySelectorAll(".page[data-name='diary'] .change-date");
    buttons.forEach((x, i) => {
      if (!x.hasClickEvent) {
        x.addEventListener("click", (e) => {
          let date = new Date(app.Diary.calendar.getValue());
          i == 0 ? date.setDate(date.getDate() - 1) : date.setDate(date.getDate() + 1);
          app.Diary.calendar.setValue([date]);
        });
        x.hasClickEvent = true;
      }
    });

    const el = document.querySelector(".page[data-name='diary'] #diary-date");
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
    let dateString = app.Diary.date.toLocaleDateString([], {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
    el.innerText = dateString;
  },

  sendStatistics: async function () {
    let address = app.Settings.get("developer", "data-sharing-address");
    let wifiOnly = app.Settings.get("developer", "data-sharing-wifi-only");

    if (app.Settings.get("developer", "data-sharing-active") == true && !!address) {
      if ((wifiOnly && navigator.connection.type == "wifi") || !wifiOnly) {
        let entry = await this.getEntryFromDB(); // Get diary entry from DB
        if (entry) {
          let totalNutrition = await app.FoodsMealsRecipes.getTotalNutrition(entry.items, "ignore");

          let entryDetails = await Promise.all(entry.items.map(async (data) => {
            return await app.FoodsMealsRecipes.getItem(data.id, data.type, data.portion, data.quantity);
          }));

          // Send nutrition and diary to target service
          await app.Utils.timeoutFetch(address, {
            headers: {
              "User-Agent": "Waistline - Android - Version " + app.version + " - https://github.com/davidhealey/waistline",
              "Authorization": app.Settings.get("developer", "data-sharing-authorization")
            },
            method: 'POST',
            body: JSON.stringify({"nutrition": totalNutrition, "entryDetails": entryDetails, "entry": entry})
          });
        }
      }
    }
  },

  render: async function(scrollPosition) {
    let entry = await this.getEntryFromDB(); // Get diary entry from DB
    let totalNutrition;

    // Remember page height and scroll position
    let pageHeight = $(".page[data-name='diary'] .page-content").height();
    let pagePosition = $(".page[data-name='diary'] .page-content").scrollTop();

    // Clear groups
    for (group in app.Diary.groups)
      app.Diary.groups[group].reset();

    // Populate groups and get overal nutrition
    if (entry) {
      await this.populateGroups(entry);
      totalNutrition = await app.FoodsMealsRecipes.getTotalNutrition(entry.items, "ignore");
    }

    // Render category groups
    let container = document.querySelector("#diary-day");
    container.innerHTML = "";

    for (group in app.Diary.groups)
      await app.Diary.groups[group].render(container);

    // Nutrition swiper card
    let swiper = app.f7.swiper.get("#diary-nutrition .swiper");
    swiper.removeAllSlides();

    await app.Diary.renderNutritionCard(totalNutrition, new Date(app.Diary.date), swiper);

    // Automatically scroll to requested position
    let requestedScrollPosition;
    if (scrollPosition !== undefined) {
      if (scrollPosition.category !== undefined) {
        let buffer = 50;
        let addButton = document.querySelector(".page[data-name='diary'] #add-button-" + scrollPosition.category);
        let addButtonPosition = app.Utils.getElementOffsetTop(addButton);
        if (addButtonPosition > pagePosition + pageHeight + buffer)
          requestedScrollPosition = addButtonPosition - pageHeight - buffer; // Scroll category add button back into view
        else
          requestedScrollPosition = pagePosition; // Category add button is already visible from page position
      } else if (scrollPosition.position !== undefined) {
        requestedScrollPosition = scrollPosition.position; // Scroll to specified position
      }
    }
    if (requestedScrollPosition !== undefined) {
      $(".page[data-name='diary'] .page-content").scrollTop(requestedScrollPosition);
    }

    this.sendStatistics();
  },

  renderNutritionCard: async function(nutrition, date, swiper) {
    const nutriments = app.Nutriments.getNutriments();
    const units = app.Nutriments.getNutrimentUnits();
    const energyUnit = app.Settings.get("units", "energy");

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
      if ((x == "calories" || x == "kilojoules") && units[x] != energyUnit) return;
      if (!app.Goals.showInDiary(x)) return;
      nutrimentsToShow.push(x);
    });
    let goals = await app.Goals.getGoals(nutrimentsToShow, date);

    nutrimentsToShow.forEach((x) => {
      let nutrimentGoal = goals[x];

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

        rows[2] = document.createElement("div");
        rows[2].className = "row nutrition-total-remaining";
        slide.appendChild(rows[2]);
      }

      // Title
      let title = document.createElement("div");
      title.className = "col";
      title.id = x + "-title";

      let text = app.strings.nutriments[x] || x;
      let t = document.createTextNode(app.Utils.tidyText(text, 50));
      title.appendChild(t);
      rows[0].appendChild(title);

      // Value
      let values = document.createElement("div");
      values.className = "col";
      values.id = x + "-value";

      let valueSpan = document.createElement("span");
      let valueText = document.createTextNode("");
      let value = 0;

      if (nutrition !== undefined && nutrition[x] !== undefined) {
        if (x !== "calories" && x !== "kilojoules")
          value = (Math.round(nutrition[x] * 100) / 100);
        else
          value = (Math.round(nutrition[x]));
      }
      valueText.nodeValue = app.Utils.tidyNumber(value);

      // Remaining and progress
      let remaining = document.createElement("div");
      remaining.className = "col";
      remaining.id = x + "-remaining";

      let progressCanvas = document.createElement("canvas");
      progressCanvas.style.display = "inline";
      progressCanvas.style.width = "0";
      progressCanvas.style.height = "0";
      let remainingSpan = document.createElement("span");
      let remainingText = document.createTextNode("");

      // Value colour and goal
      let goal = nutrimentGoal.goal;
      let isMin = nutrimentGoal.isMin;

      if (goal !== undefined && !isNaN(goal)) {
        let colour;

        if ((isMin !== true && value > goal) || (isMin === true && value < goal))
          colour = "red";
        else
          colour = "green";

        valueSpan.style.color = colour;
        remainingSpan.style.color = colour;

        // Goal
        valueText.nodeValue += " / " + app.Utils.tidyNumber(Math.round(goal * 100) / 100);

        // Remaining value
        let remainingValue = Math.round((value - goal) * 100) / 100;
        if (remainingValue > 0)
          remainingText.nodeValue = "\u200E+" + app.Utils.tidyNumber(remainingValue);
        else
          remainingText.nodeValue = app.Utils.tidyNumber(remainingValue);

        // Progress ring
        let percentProgress = value / goal;
        let overshot = false;
        if (percentProgress > 1) {
          overshot = true;
          if (percentProgress < 2)
            percentProgress -= 1;
          else
            percentProgress = 1;
        }

        // Progress ring colours
        let backgroundColours = [];
        if (overshot) {
          backgroundColours.push(colour);
          backgroundColours.push(Chart.defaults.global.defaultFontColor);
        } else {
          backgroundColours.push(Chart.defaults.global.defaultFontColor);
          if (Chart.defaults.global.defaultFontColor == "black")
            backgroundColours.push("lightgrey");
          else
            backgroundColours.push("dimgrey");
        }

        progressCanvas.style.width = "2em";
        progressCanvas.style.height = "1em";

        // Draw progress ring
        let chart = new Chart(progressCanvas, {
          type: "doughnut",
          data: {
            datasets: [{
              data: [percentProgress, (1 - percentProgress)],
              backgroundColor: backgroundColours,
              borderWidth: 0
            }]
          },
          options: {
            cutoutPercentage: 60,
            responsive: false,
            tooltips: {
              enabled: false
            },
            animation: {
              animateRotate: false
            }
          }
        });
      } else {
        remainingText.nodeValue = app.Utils.tidyNumber(value);
      }

      // Unit
      if (app.Settings.get("diary", "show-nutrition-units")) {
        let unit = app.strings["unit-symbols"][units[x]] || units[x];
        valueText.nodeValue += app.Utils.tidyNumber(undefined, unit);
        remainingText.nodeValue += app.Utils.tidyNumber(undefined, unit);
      }

      valueSpan.appendChild(valueText);
      values.appendChild(valueSpan);
      rows[1].appendChild(values);

      remainingSpan.appendChild(remainingText);
      remaining.appendChild(progressCanvas);
      remaining.appendChild(remainingSpan);
      rows[2].appendChild(remaining);

      count++;
    });
  },

  createMealGroups: function() {
    const mealNames = app.Settings.get("diary", "meal-names");
    let groups = {};

    if (mealNames !== undefined) {
      mealNames.forEach((x, i) => {
        if (x != "") {
          let text = app.strings.diary["default-meals"][x.toLowerCase()] || x;
          let group = app.Group.create(text, i);
          groups[i] = group;
        }
      });
    }

    if (Object.keys(groups).length == 0) {
      let group = app.Group.create("", 0);
      groups[0] = group;
    }

    return groups;
  },

  getEntryFromDB: function() {
    return new Promise(async function(resolve, reject) {
      if (app.Diary.date !== undefined) {
        let date = app.Diary.date;
        let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        let entry = await dbHandler.get("diary", "dateTime", d);
        resolve(entry);
      }
    }).catch(err => {
      throw (err);
    });
  },

  getNewEntry: function() {
    let date = app.Diary.date;
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
          if (app.Diary.groups[x.category] !== undefined)
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
          app.Diary.promptAddItems(items, category, entry, 0, false);
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

  promptAddItems: async function(items, category, entry, index, renderAfterwards) {
    let item = items[index];

    if (item !== undefined) {
      if (item.name !== undefined && item.unit !== undefined) {

        // Re-render diary when prompts are done
        renderAfterwards = true;

        // Create dialog content
        let title = app.Utils.escapeHtml(app.Utils.tidyText(item.name, 50));

        let div = document.createElement("div");
        div.className = "dialog-text";

        if (item.notes && app.Settings.get("foodlist", "show-notes") == true)
          div.innerText = app.Utils.tidyText(item.notes, 50);

        // Input fields
        let inputs = document.createElement("form");
        inputs.className = "list no-hairlines scroll-dialog";
        let ul = document.createElement("ul");
        inputs.appendChild(ul);

        ["serving-size", "number-of-servings"].forEach((field) => {
          let li = document.createElement("li");
          li.className = "item-content item-input";
          if (field == "number-of-servings" && item.type == "recipe")
            li.style.display = "none"; // number of servings field not needed for recipes
          ul.appendChild(li);

          let inner = document.createElement("div");
          inner.className = "item-inner";
          li.appendChild(inner);

          let fieldTitle = document.createElement("div");
          fieldTitle.className = "item-title item-label";
          fieldTitle.innerText = app.strings["food-editor"][field] || field;
          if (field == "serving-size")
            fieldTitle.innerText += " (" + item.unit + ")";
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
              app.Diary.promptAddItems(items, category, entry, index + 1, renderAfterwards);
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
              app.Diary.promptAddItems(items, category, entry, index + 1, renderAfterwards);
            }
          }
          ]
        }).open();

      } else {
        // Item has no name (is a meal item) -> add it as is without prompt
        app.Diary.addItemToEntry(item, category, entry);
        app.Diary.promptAddItems(items, category, entry, index + 1, renderAfterwards);
      }
    } else {
      // No more items to process -> write entry to DB and render
      await dbHandler.put(entry, "diary");
      if (renderAfterwards) {
        let scrollPosition = { category: category };
        app.Diary.render(scrollPosition);
      }
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

        await dbHandler.put(entry, "diary");

        resolve();
      } else {
        resolve();
      }
    }).catch(err => {
      throw (err);
    });
  },

  deleteItem: function(item, li) {
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

            await dbHandler.put(entry, "diary");
            let scrollPosition = { position: $(".page-current .page-content").scrollTop() };
            app.Diary.render(scrollPosition);
          }
        }
      ]
    }).open();
  },

  quickAdd: function(category) {
    let title = app.strings.diary["quick-add"] || "Quick Add";
    let energyUnit = app.Settings.get("units", "energy");

    let energyUnitText;
    if (energyUnit == app.nutrimentUnits.calories)
      energyUnitText = app.strings.nutriments["calories"] || "Calories";
    else
      energyUnitText = app.strings.nutriments["kilojoules"] || "Kilojoules";

    // Create dialog content
    let inputs = document.createElement("form");
    inputs.className = "list no-hairlines scroll-dialog";
    let ul = document.createElement("ul");
    inputs.appendChild(ul);

    ["energy", "description"].forEach((field) => {
      let li = document.createElement("li");
      li.className = "item-content item-input";
      ul.appendChild(li);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      li.appendChild(inner);

      let fieldTitle = document.createElement("div");
      fieldTitle.className = "item-title item-label";
      if (field == "energy")
        fieldTitle.innerText = energyUnitText;
      else
        fieldTitle.innerText = app.strings.diary["quick-add-description"] || "Description (optional)";
      inner.appendChild(fieldTitle);

      let inputWrap = document.createElement("div");
      inputWrap.className = "item-input-wrap";
      inner.appendChild(inputWrap);

      let input = document.createElement("input");
      input.className = "dialog-input";
      if (field == "energy")
        input.type = "number";
      else
        input.type = "text";
      inputWrap.appendChild(input);
    });

    // Open dialog
    let dialog = app.f7.dialog.create({
      title: title,
      content: inputs.outerHTML,
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: [27]
        },
        {
          text: app.strings.dialogs.ok || "OK",
          keyCodes: [13],
          onClick: async function(dialog) {
            let inputs = Array.from(dialog.el.getElementsByTagName("input"));
            let energy = inputs[0].value;
            let description = inputs[1].value;

            let entry = await app.Diary.getEntryFromDB() || app.Diary.getNewEntry();

            if (energyUnit == app.nutrimentUnits.kilojoules)
              energy = app.Utils.convertUnit(energy, app.nutrimentUnits.kilojoules, app.nutrimentUnits.calories);

            if (!isNaN(energy)) {
              let item = await app.Foodlist.getQuickAddItem(); // Get food item

              if (item !== undefined) {
                item.dateTime = new Date();
                item.category = category;
                item.quantity = parseFloat(energy);
                if (description !== "")
                  item.description = description;

                entry.items.push(item);

                await dbHandler.put(entry, "diary");
                let scrollPosition = { category: category };
                app.Diary.render(scrollPosition);
              }
            }
          }
        }
      ],
      on: {
        opened: function (dialog) {
          dialog.el.getElementsByTagName("input")[0].focus();
        }
      }
    }).open();
  },

  log: async function() {
    const title = app.strings.diary["log-title"] || "Today's Stats";
    const fields = app.BodyStats.getBodyStats();
    const internalUnits = app.BodyStats.getBodyStatsUnits();
    const bodyStatsVisibility = app.Settings.getField("bodyStatsVisibility");

    // Look for stats in the past 15 diary entries starting from the current date
    const date = app.Diary.date;
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const lastStats = await app.Diary.getLastStats(d, 15);

    // Create dialog inputs
    let inputs = document.createElement("form");
    inputs.className = "list no-hairlines scroll-dialog";

    let ul = document.createElement("ul");
    inputs.appendChild(ul);

    for (let i = 0; i < fields.length; i++) {
      let x = fields[i];

      if (!bodyStatsVisibility[x]) continue;

      let unit = app.Goals.getGoalUnit(x, false);
      let value = app.Utils.convertUnit(lastStats[x], internalUnits[x], unit, 100);

      let name = app.strings.statistics[x] || x;
      let unitSymbol = app.strings["unit-symbols"][unit] || unit;

      let li = document.createElement("li");
      li.className = "item-content item-input";
      ul.appendChild(li);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      li.appendChild(inner);

      let title = document.createElement("div");
      title.className = "item-title item-label";
      title.innerText = app.Utils.tidyText(name, 50);
      if (unitSymbol !== undefined)
        title.innerText += " (" + unitSymbol + ")";
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
      content: inputs.outerHTML,
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

  getLastStats: async function(date, limit) {
    return new Promise(function(resolve, reject) {
      let index = dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.upperBound(date), "prev");
      let counter = 0;

      index.onsuccess = function(e) {
        let cursor = e.target.result;
        if (cursor) {
          counter++;
          if (cursor.value && cursor.value.stats && Object.keys(cursor.value.stats).length != 0)
            resolve(cursor.value.stats);
          else if (counter < limit)
            cursor.continue();
          else
            resolve({});
        } else {
          resolve({});
        }
      };
    });
  },

  saveStats: async function(dialog) {
    let entry = await app.Diary.getEntryFromDB() || app.Diary.getNewEntry();
    let inputs = Array.from(dialog.el.getElementsByTagName("input"));

    const internalUnits = app.BodyStats.getBodyStatsUnits();

    let stats = {};

    for (let i = 0; i < inputs.length; i++) {
      let x = inputs[i];

      let unit = app.Goals.getGoalUnit(x.id, false);
      let value = app.Utils.convertUnit(parseFloat(x.value), unit, internalUnits[x.id], 100);

      if (!isNaN(value))
        stats[x.id] = value;
    }

    entry.stats = stats;

    dbHandler.put(entry, "diary").onsuccess = function(e) {
      let msg = app.strings.diary["log-saved"] || "Saved";
      app.Utils.toast(msg);
    };
  },

  showCategoryNutriments: function(category, nutrition) {
    const mealNames = app.Settings.get("diary", "meal-names");
    const mealName = mealNames[category];
    const dialogTitle = app.Utils.escapeHtml(app.strings.diary["default-meals"][mealName.toLowerCase()] || mealName);

    const nutriments = app.Nutriments.getNutriments();
    const units = app.Nutriments.getNutrimentUnits();
    const energyUnit = app.Settings.get("units", "energy");
    const visible = app.Settings.getField("nutrimentVisibility");
    const showAll = app.Settings.get("diary", "show-all-nutriments");

    // Create dialog
    let div = document.createElement("div");
    div.className = "list scroll-dialog";

    let ul = document.createElement("ul");
    div.appendChild(ul);

    for (i = 0; i < nutriments.length; i++) {

      let x = nutriments[i];

      if (x == "calories" || x == "kilojoules") {
        if (units[x] != energyUnit) continue;
      } else {
        if (showAll !== true && visible[x] !== true) continue;
      }

      // Get name, unit and value
      let name = app.strings.nutriments[x] || x;
      let unit = app.strings["unit-symbols"][units[x]] || units[x];
      let value = 0;

      if (nutrition !== undefined && nutrition[x] !== undefined) {
        if (x !== "calories" && x !== "kilojoules")
          value = Math.round(nutrition[x] * 100) / 100;
        else
          value = Math.round(nutrition[x]);
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
      text = app.Utils.tidyNumber(value, unit);
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
      date: app.Diary.date
    };

    app.f7.views.main.router.navigate("/foods-meals-recipes/");
  },

  showChart: async function() {
    let entry = await app.Diary.getEntryFromDB();

    if (entry != undefined && entry.items.length > 0) {
      app.data.context = {
        date: app.Diary.date
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

    if (context)
      app.Diary.processingContext = true;
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