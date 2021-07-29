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
  item: "",

  init: function(context) {
    this.getComponents();
    this.bindUIActions();

    if (context.item !== undefined) {
      const inputs = Array.from(document.querySelectorAll("input"));
      this.el.title.innerText = app.Utils.tidyText(context.item, 50, true);
      this.setInputNames(context.item);
      app.Settings.restoreInputValues(inputs);
      this.setGoalSharing();
      this.item = context.item;
    }

    this.hideShowComponents();
  },

  getComponents: function() {
    app.GoalEditor.el.title = document.querySelector(".page[data-name='goal-editor'] #goal-editor-title");
    app.GoalEditor.el.showInDiary = document.querySelector(".page[data-name='goal-editor'] #diary");
    app.GoalEditor.el.sharedGoal = document.querySelector(".page[data-name='goal-editor'] #shared-goal");
    app.GoalEditor.el.minimumGoal = document.querySelector(".page[data-name='goal-editor'] #minimum-goal");
  },

  bindUIActions: function() {
    // Input boxes
    const inputs = Array.from(document.querySelectorAll("input:not(.manual-bind)"));

    inputs.forEach((x, i) => {
      if (!x.hasChangeEvent) {
        x.addEventListener("change", (e) => {
          app.Settings.saveInputs(inputs);
        });
        x.hasChangeEvent = true;
      }
    });

    // Shared goal toggle 
    if (!app.GoalEditor.el.sharedGoal.hasChangeEvent) {
      app.GoalEditor.el.sharedGoal.addEventListener("change", (e) => {
        app.GoalEditor.setGoalSharing();
        app.Settings.saveInputs([app.GoalEditor.el.sharedGoal]);
      });
      app.GoalEditor.el.sharedGoal.hasChangeEvent = true;
    }

    // Minimum goal toggle 
    if (!app.GoalEditor.el.minimumGoal.hasChangeEvent) {
      app.GoalEditor.el.minimumGoal.addEventListener("change", (e) => {
        app.GoalEditor.setGoalSharing();
        app.Settings.saveInputs([app.GoalEditor.el.minimumGoal]);
      });
      app.GoalEditor.el.minimumGoal.hasChangeEvent = true;
    }
  },

  hideShowComponents: function() {
    const measurements = ["weight", "neck", "waist", "hips", "body fat"];
    if (measurements.includes(app.GoalEditor.item))
      app.GoalEditor.el.showInDiary.style.display = "none";
  },

  setInputNames: function(name) {
    const inputs = Array.from(document.querySelectorAll("input"));

    inputs.forEach((x) => {
      if (x.id == "shared-goal")
        x.name = name + "-shared-goal";
      else if (x.id == "minimum-goal")
        x.name = name + "-minimum-goal";
      else if (x.id == "show-in-diary")
        x.name = name + "-show-in-diary";
      else if (x.id == "show-in-stats")
        x.name = name + "-show-in-stats";
      else
        x.name = name;
    });
  },

  setGoalSharing: function() {
    const inputs = Array.from(document.querySelectorAll("input[type=number]"));
    const state = app.GoalEditor.el.sharedGoal.checked;

    inputs.forEach((x, i) => {
      if (i !== 0) {
        if (state == true) {
          x.disabled = true;
          x.style.color = "grey";
        } else {
          x.disabled = false;
          x.style.color = "black";
        }
      }
    });
  }
};

document.addEventListener("page:init", function(e) {
  if (e.target.matches(".page[data-name='goal-editor']")) {
    let context = app.data.context;
    app.data.context = undefined;
    app.GoalEditor.init(context);
  }
});