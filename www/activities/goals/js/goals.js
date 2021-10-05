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
    app.Goals.el.list.innerHTML = "";

    const measurements = app.measurements;
    const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    const stats = measurements.concat(nutriments);
    const nutrimentUnits = app.nutrimentUnits;
    const energyUnit = app.Settings.get("units", "energy");

    for (let i in stats) {
      let x = stats[i];

      if ((x == "calories" || x == "kilojoules") && nutrimentUnits[x] != energyUnit) continue;

      let unit = app.Goals.getGoalUnit(x);

      let li = document.createElement("li");
      app.Goals.el.list.appendChild(li);

      let a = document.createElement("a");
      a.href = "#";

      let text = app.strings.nutriments[x] || app.strings.statistics[x] || x;
      a.innerHTML = app.Utils.tidyText(text, 50, true) + " (" + unit + ")";
      li.appendChild(a);

      li.addEventListener("click", (e) => {
        app.Goals.gotoEditor(x);
      });
    }
  },

  gotoEditor: function(stat) {
    app.data.context = {
      stat: stat
    };

    app.f7.views.main.router.navigate("./goal-editor/");
  },

  getGoalUnit(stat, checkPercentGoal=true) {
    const units = Object.assign(app.Settings.getField("units"), app.nutrimentUnits);

    if (stat == "body fat")
      return "%";
    if (app.measurements.includes(stat))
      return (stat == "weight") ? units.weight : units.length;
    if (checkPercentGoal && app.Goals.isPercentGoal(stat))
      return "%"
    else
      return units[stat] || "g";
  },

  get: function(stat, date) {
    let day = date.getUTCDay();
    let goal = app.Settings.get("goals", stat);

    if (app.Goals.sharedGoal(stat) || app.measurements.includes(stat))
      return goal[0];

    return goal[day];
  },

  showInDiary: function(stat) {
    return app.Settings.get("goals", stat + "-show-in-diary");
  },

  showInStats: function(stat) {
    return app.Settings.get("goals", stat + "-show-in-stats");
  },

  sharedGoal: function(stat) {
    return app.Settings.get("goals", stat + "-shared-goal");
  },

  autoAdjustGoal: function(stat) {
    return app.Settings.get("goals", stat + "-auto-adjust");
  },

  isMinimumGoal: function(stat) {
    return app.Settings.get("goals", stat + "-minimum-goal");
  },

  isPercentGoal: function(stat) {
    return app.Settings.get("goals", stat + "-percent-goal");
  }
};

document.addEventListener("page:init", function(e) {
  if (e.target.matches(".page[data-name='goals']")) {
    app.Goals.init();
  }
});

document.addEventListener("page:reinit", function(e) {
  if (e.target.matches(".page[data-name='goals']")) {
    app.Goals.init();
  }
});