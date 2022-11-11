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
  along with app.  If not, see <http://www.gnu.org/licenses/>.
*/

app.GoalEditor = {

  el: {},
  stat: "",
  index: 0,

  init: function(context) {
    this.getComponents();

    if (context.stat !== undefined) {
      this.stat = context.stat;
      this.setPageTitle(this.stat);
      this.populateStatGoals();
      this.setInputValues();
      this.setGoalSharing();
    }

    this.bindUIActions();
    this.hideShowComponents();
  },

  setPageTitle: function(stat, percentGoalState) {
    const title = app.strings["goal-editor"]["title"] || "Set Goals";
    const name = app.strings.nutriments[stat] || app.strings.statistics[stat] || stat;
    let unit;
    if (percentGoalState === undefined)
      unit = app.Goals.getGoalUnit(stat, true);
    else if (percentGoalState === false)
      unit = app.Goals.getGoalUnit(stat, false);
    else if (percentGoalState === true)
      unit = "%";
    let unitSymbol = app.strings["unit-symbols"][unit] || unit;

    let text = title + ": " + app.Utils.tidyText(name, 50);
    if (unitSymbol !== undefined)
      text += " (" + unitSymbol + ")";
    app.GoalEditor.el.title.innerText = text;
  },

  getComponents: function() {
    app.GoalEditor.el.title = document.querySelector(".page[data-name='goal-editor'] #goal-editor-title");
    app.GoalEditor.el.showInDiaryOption = document.querySelector(".page[data-name='goal-editor'] #diary");
    app.GoalEditor.el.sharedGoalOption = document.querySelector(".page[data-name='goal-editor'] #shared");
    app.GoalEditor.el.autoAdjustOption = document.querySelector(".page[data-name='goal-editor'] #adjust");
    app.GoalEditor.el.minimumGoalOption = document.querySelector(".page[data-name='goal-editor'] #minimum");
    app.GoalEditor.el.percentGoalOption = document.querySelector(".page[data-name='goal-editor'] #percent");
    app.GoalEditor.el.showOptionsContainer = document.querySelector(".page[data-name='goal-editor'] #goal-show-options-container");
    app.GoalEditor.el.showInDiary = document.querySelector(".page[data-name='goal-editor'] #show-in-diary");
    app.GoalEditor.el.showInStats = document.querySelector(".page[data-name='goal-editor'] #show-in-stats");
    app.GoalEditor.el.sharedGoal = document.querySelector(".page[data-name='goal-editor'] #shared-goal");
    app.GoalEditor.el.autoAdjust = document.querySelector(".page[data-name='goal-editor'] #auto-adjust");
    app.GoalEditor.el.minimumGoal = document.querySelector(".page[data-name='goal-editor'] #minimum-goal");
    app.GoalEditor.el.percentGoal = document.querySelector(".page[data-name='goal-editor'] #percent-goal");
    app.GoalEditor.el.selectGoal = document.querySelector(".page[data-name='goal-editor'] #select-goal");
    app.GoalEditor.el.deleteGoal = document.querySelector(".page[data-name='goal-editor'] #delete-goal");
  },

  bindUIActions: function() {
    // Show in diary toggle
    if (!app.GoalEditor.el.showInDiary.hasChangeEvent) {
      app.GoalEditor.el.showInDiary.addEventListener("change", (e) => {
        app.GoalEditor.saveInputValue(e.target.id, e.target.checked);
      });
      app.GoalEditor.el.showInDiary.hasChangeEvent = true;
    }

    // Show in stats toggle
    if (!app.GoalEditor.el.showInStats.hasChangeEvent) {
      app.GoalEditor.el.showInStats.addEventListener("change", (e) => {
        app.GoalEditor.saveInputValue(e.target.id, e.target.checked);
      });
      app.GoalEditor.el.showInStats.hasChangeEvent = true;
    }

    // Shared goal toggle
    if (!app.GoalEditor.el.sharedGoal.hasChangeEvent) {
      app.GoalEditor.el.sharedGoal.addEventListener("change", (e) => {
        app.GoalEditor.setGoalSharing();
        app.GoalEditor.saveInputValue(e.target.id, e.target.checked);
      });
      app.GoalEditor.el.sharedGoal.hasChangeEvent = true;
    }

    // Auto adjust toggle
    if (!app.GoalEditor.el.autoAdjust.hasChangeEvent) {
      app.GoalEditor.el.autoAdjust.addEventListener("change", (e) => {
        app.GoalEditor.saveInputValue(e.target.id, e.target.checked);
      });
      app.GoalEditor.el.autoAdjust.hasChangeEvent = true;
    }

    // Minimum goal toggle
    if (!app.GoalEditor.el.minimumGoal.hasChangeEvent) {
      app.GoalEditor.el.minimumGoal.addEventListener("change", (e) => {
        app.GoalEditor.saveInputValue(e.target.id, e.target.checked);
      });
      app.GoalEditor.el.minimumGoal.hasChangeEvent = true;
    }

    // Percent goal toggle
    if (!app.GoalEditor.el.percentGoal.hasChangeEvent) {
      app.GoalEditor.el.percentGoal.addEventListener("change", (e) => {
        app.GoalEditor.setPercentGoal();
        app.GoalEditor.saveInputValue(e.target.id, e.target.checked);
      });
      app.GoalEditor.el.percentGoal.hasChangeEvent = true;
    }

    // Goal inputs
    const inputs = Array.from(document.querySelectorAll(".page[data-name='goal-editor'] input[type=number]"));
    inputs.forEach((x, i) => {
      if (!x.hasChangeEvent) {
        x.addEventListener("change", (e) => {
          let goalArray = inputs.map((input) => input.value);
          app.GoalEditor.saveInputValue("goal", goalArray);
        });
        x.hasChangeEvent = true;
      }
    });

    // Goal select menu
    if (!app.GoalEditor.el.selectGoal.hasChangedEvent) {
      app.GoalEditor.el.selectGoal.addEventListener("change", async (e) => {
        if (e.target.value === "new") {
          app.GoalEditor.addGoal();
        } else {
          app.GoalEditor.index = e.target.selectedIndex;
        }
        app.GoalEditor.setInputValues();
        app.GoalEditor.hideShowDeleteButton();
      });
      app.GoalEditor.el.selectGoal.hasChangedEvent = true;
    }

    // Delete goal button
    if (!app.GoalEditor.el.deleteGoal.hasClickEvent) {
      app.GoalEditor.el.deleteGoal.addEventListener("click", (e) => {
        app.GoalEditor.deleteGoal();
      });
      app.GoalEditor.el.deleteGoal.hasClickEvent = true;
    }
  },

  hideShowComponents: function() {
    const bodyStats = app.BodyStats.getBodyStats();

    if (bodyStats.includes(app.GoalEditor.stat)) {
      app.GoalEditor.el.showOptionsContainer.style.display = "none";
      app.GoalEditor.el.sharedGoalOption.style.display = "none";
      app.GoalEditor.el.autoAdjustOption.style.display = "none";
      app.GoalEditor.el.minimumGoalOption.style.display = "none";
      app.GoalEditor.el.percentGoalOption.style.display = "none";
      document.querySelector(".page[data-name='goal-editor'] #goal-0").innerText = app.strings["goal-editor"]["goal"] || "Goal";
      const extraGoals = Array.from(document.querySelectorAll("li.extra-goal"));
      extraGoals.forEach((x) => {
        x.style.display = "none";
      });
    } else {
      const firstDayOfWeek = app.Settings.get("goals", "first-day-of-week") || 0;
      for (let i = 0; i < 7; i++) {
        const d = (Number(firstDayOfWeek) + i) % 7;
        document.querySelector(".page[data-name='goal-editor'] #goal-" + i).innerText = app.strings["days"][d] || d;
      }
      if (!app.energyMacroNutriments.includes(app.GoalEditor.stat))
        app.GoalEditor.el.percentGoalOption.style.display = "none";
    }

    app.GoalEditor.hideShowDeleteButton();
  },

  hideShowDeleteButton: function() {
    if (app.GoalEditor.index === 0)
      app.GoalEditor.el.deleteGoal.style.display = "none";
    else
      app.GoalEditor.el.deleteGoal.style.display = "block";
  },

  populateStatGoals: function(selectedIndex) {
    let statGoalSettings = app.Goals.getStatGoalSettings(app.GoalEditor.stat);
    let statGoals = [{}];

    app.GoalEditor.index = 0;

    if (statGoalSettings["goal-list"] !== undefined && statGoalSettings["goal-list"].length) {
      statGoals = statGoalSettings["goal-list"];

      if (selectedIndex !== undefined)
        app.GoalEditor.index = selectedIndex;
      else
        app.GoalEditor.index = statGoals.length - 1;
    }

    // Populate select menu with goals
    app.GoalEditor.el.selectGoal.innerHTML = "";
    statGoals.forEach((goal, i) => {
      let option = app.GoalEditor.createGoalOptionElement(goal, i);
      app.GoalEditor.el.selectGoal.appendChild(option);
    });

    let option = document.createElement("option");
    option.value = "new";
    option.innerText = app.strings["goal-editor"]["new-goal"] || "New Goal";
    app.GoalEditor.el.selectGoal.appendChild(option);
  },

  setInputValues: function() {
    let statGoalSettings = app.Goals.getStatGoalSettings(app.GoalEditor.stat);

    app.GoalEditor.el.showInDiary.checked = statGoalSettings["show-in-diary"];
    app.GoalEditor.el.showInStats.checked = statGoalSettings["show-in-stats"];

    let statGoalList = statGoalSettings["goal-list"] || [{}];
    let statGoal = statGoalList[app.GoalEditor.index] || {};
    let statGoalValues = statGoal["goal"] || [];

    app.GoalEditor.el.sharedGoal.checked = statGoal["shared-goal"];
    app.GoalEditor.el.autoAdjust.checked = statGoal["auto-adjust"];
    app.GoalEditor.el.minimumGoal.checked = statGoal["minimum-goal"];
    app.GoalEditor.el.percentGoal.checked = statGoal["percent-goal"];

    const inputs = Array.from(document.querySelectorAll(".page[data-name='goal-editor'] input[type=number]"));
    inputs.forEach((x, i) => {
      x.value = statGoalValues[i] || "";
    });

    app.GoalEditor.setGoalSharing();
    app.GoalEditor.setPageTitle(app.GoalEditor.stat, app.GoalEditor.el.percentGoal.checked);
  },

  saveInputValue: function(name, value) {
    let statGoalSettings = app.Goals.getStatGoalSettings(app.GoalEditor.stat);

    if (["show-in-diary", "show-in-stats"].includes(name)) {
      statGoalSettings[name] = value;
    } else if (["shared-goal", "auto-adjust", "minimum-goal", "percent-goal", "goal"].includes(name)) {
      statGoalSettings["goal-list"] = statGoalSettings["goal-list"] || [{}];
      statGoalSettings["goal-list"][app.GoalEditor.index] = statGoalSettings["goal-list"][app.GoalEditor.index] || {};
      statGoalSettings["goal-list"][app.GoalEditor.index][name] = value;
    }

    app.Settings.put("goals", app.GoalEditor.stat, statGoalSettings);
  },

  addGoal: function() {
    let statGoalSettings = app.Goals.getStatGoalSettings(app.GoalEditor.stat);

    let now = new Date();
    let today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    let newGoal = {
      "effective-from": today
    };

    // Add to goal list in settings
    statGoalSettings["goal-list"] = statGoalSettings["goal-list"] || [{}];
    statGoalSettings["goal-list"].push(newGoal);
    app.Settings.put("goals", app.GoalEditor.stat, statGoalSettings);

    // Reinitialize goal select menu
    app.GoalEditor.populateStatGoals();
  },

  deleteGoal: function() {
    let title = app.strings.dialogs.delete || "Delete";
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
            let statGoalSettings = app.Goals.getStatGoalSettings(app.GoalEditor.stat);

            if (statGoalSettings["goal-list"] !== undefined && statGoalSettings["goal-list"][app.GoalEditor.index] !== undefined) {
              // Delete from goal list in settings
              statGoalSettings["goal-list"].splice(app.GoalEditor.index, 1);
              app.Settings.put("goals", app.GoalEditor.stat, statGoalSettings);

              // Reinitialize goal select menu
              app.GoalEditor.populateStatGoals(app.GoalEditor.index - 1);

              app.GoalEditor.setInputValues();
              app.GoalEditor.hideShowDeleteButton();

              let msg = app.strings["goal-editor"]["goal-deleted"] || "Goal Deleted";
              app.Utils.toast(msg);
            }
          }
        }
      ]
    }).open();
  },

  createGoalOptionElement: function(goal, i) {
    let goalString = app.strings["goal-editor"]["goal"] || "Goal";
    let effectiveFromString = app.strings["goal-editor"]["effective-from"] || "Effective from";

    let option = document.createElement("option");
    option.value = i;

    if (i == app.GoalEditor.index)
      option.setAttribute("selected", "");

    let text = goalString + " " + (i + 1);
    if (goal["effective-from"] !== undefined) {
      let date = new Date(goal["effective-from"]);
      let dateString = app.Utils.dateToLocaleDateString(date);
      text += " - " + effectiveFromString + " " + dateString;
    }
    option.innerText = app.Utils.tidyText(text, 50);

    return option;
  },

  setGoalSharing: function() {
    const inputs = Array.from(document.querySelectorAll(".page[data-name='goal-editor'] input[type=number]"));
    const state = app.GoalEditor.el.sharedGoal.checked;

    inputs.forEach((x, i) => {
      if (i !== 0) {
        if (state == true) {
          x.disabled = true;
          x.classList.add("disabled");
        } else {
          x.disabled = false;
          x.classList.remove("disabled");
        }
      }
    });
  },

  setPercentGoal: function() {
    const inputs = Array.from(document.querySelectorAll(".page[data-name='goal-editor'] input[type=number]"));
    const state = app.GoalEditor.el.percentGoal.checked;
    const event = new Event("change");

    inputs.forEach((x) => {
      x.value = "";
      x.dispatchEvent(event);
    });

    app.GoalEditor.setPageTitle(app.GoalEditor.stat, state);
  }
};

document.addEventListener("page:init", function(e) {
  if (e.target.matches(".page[data-name='goal-editor']")) {
    let context = app.data.context;
    app.data.context = undefined;
    app.GoalEditor.init(context);
  }
});