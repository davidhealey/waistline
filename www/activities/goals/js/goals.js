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

app.Goals = {

  el: {},

  init: function() {
    this.getComponents();
    this.populateGoalList();
  },

  getComponents: function() {
    app.Goals.el.list = document.getElementById("goal-list");
  },

  populateGoalList: function() {
    let nutriments = app.nutriments;
    let units = app.nutrimentUnits;
    let energy_unit = app.Settings.get("nutrition", "energy-unit");

    for (let i in nutriments) {
      let n = nutriments[i];

      if (n == "calories" && energy_unit !== "kcal") continue;
      if (n == "kilojoules" && energy_unit == "kcal") continue;

      let unit = "g";
      if (units[n] !== undefined)
        unit = units[n];

      let li = document.createElement("li");
      app.Goals.el.list.appendChild(li);

      let a = document.createElement("a");
      a.href = "#";
      a.innerHTML = app.Utils.tidyText(n, 50) + " (" + unit + ")";
      li.appendChild(a);

      li.addEventListener("click", (e) => {
        app.Goals.gotoEditor(n);
      });
    }
  },

  gotoEditor: function(item) {
    app.f7.views.main.router.navigate("./goal-editor/", {
      "context": {
        item: item
      }
    });
  },

  get: function(item, date) {
    let day = date.getUTCDay();
    let goal = app.Settings.get("goals", item);

    if (app.Settings.get("goals", item + "-shared-goal"))
      return goal[0];

    return goal[day];
  },

  showInDiary: function(item) {
    return app.Settings.get("goals", item + "-show-in-diary");
  }
};

document.addEventListener("page:init", function(e) {
  if (e.target.matches(".page[data-name='goals']")) {
    app.Goals.init();
  }
});