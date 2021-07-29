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

    const measurements = ["weight", "neck", "waist", "hips", "body fat"];
    const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    const stats = measurements.concat(nutriments);
    const units = Object.assign(app.Settings.getField("units"), app.nutrimentUnits);

    for (let i in stats) {
      let x = stats[i];

      if (x == "calories" && units.energy !== "kcal") continue;
      if (x == "kilojoules" && units.energy == "kcal") continue;

      let unit = "";
      if (units[x] !== undefined)
        unit = "(" + units[x] + ")";
      else if (measurements.includes(x))
        unit = "(" + units.length + ")";
      else if (nutriments.includes(x))
        unit = "(g)";

      let li = document.createElement("li");
      app.Goals.el.list.appendChild(li);

      let a = document.createElement("a");
      a.href = "#";

      let text = app.strings.nutriments[x] || app.strings.statistics[x] || x;
      a.innerHTML = app.Utils.tidyText(text, 50, true) + " " + unit;
      li.appendChild(a);

      li.addEventListener("click", (e) => {
        app.Goals.gotoEditor(x);
      });
    }
  },

  gotoEditor: function(item) {
    app.data.context = {
      item: item
    };

    app.f7.views.main.router.navigate("./goal-editor/");
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