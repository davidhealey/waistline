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
      let unitSymbol = app.strings["unit-symbols"][unit] || unit;

      let li = document.createElement("li");
      app.Goals.el.list.appendChild(li);

      let a = document.createElement("a");
      a.href = "#";

      let text = app.strings.nutriments[x] || app.strings.statistics[x] || x;
      a.innerHTML = app.Utils.tidyText(text, 50) + " (" + unitSymbol + ")";
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

  get: async function(stat, date) {
    let goal = await app.Goals.getDayGoal(stat, date);

    if (!app.Goals.autoAdjustGoal(stat))
      return goal;

    let weekStatSum = 0;
    let weekGoalSum = 0;
    let day = date.getDay();
    for (let d = 0; d < day; d++) {
      let dayDelta = day - d;
      let currentDate = new Date(date.getTime());
      currentDate.setDate(currentDate.getDate() - dayDelta);

      let diaryEntry = await app.Goals.getDiaryEntryFromDB(currentDate);

      if (diaryEntry !== undefined && diaryEntry.items !== undefined && diaryEntry.items.length > 0) {
        let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(diaryEntry.items);

        let dayStat = nutrition[stat] || 0;
        weekStatSum += dayStat;

        let dayGoal = await app.Goals.getDayGoal(stat, currentDate);
        if (dayGoal !== undefined && dayGoal !== "")
          weekGoalSum += parseFloat(dayGoal);
      }
    }

    let weekGoalDelta = weekStatSum - weekGoalSum;
    let weekDaysLeft = 7 - day;
    let delta = weekGoalDelta / weekDaysLeft;

    let result = Math.round(goal - delta);
    if (result < 0)
      return 0;
    return result;
  },

  getDayGoal: async function(stat, date) {
    let day = date.getDay();
    let goals = app.Settings.get("goals", stat);
    let goal;

    if (app.Goals.sharedGoal(stat) || app.measurements.includes(stat))
      goal = goals[0];
    else
      goal = goals[day];

    if (app.Goals.isPercentGoal(stat)) {
      const energyUnit = app.Settings.get("units", "energy");
      const energyName = Object.keys(app.nutrimentUnits).find(key => app.nutrimentUnits[key] === energyUnit);
      const energyGoal = await app.Goals.get(energyName, date);
      goal = app.Goals.getEnergyPercentGoal(stat, goal, energyUnit, energyGoal);
    }

    return goal;
  },

  getEnergyPercentGoal: function(stat, percentGoal, energyUnit, energyGoal) {
    // Convert energy goal to calories
    if (energyUnit == app.nutrimentUnits.kilojoules)
      energyGoal = app.Utils.convertUnit(energyGoal, app.nutrimentUnits.kilojoules, app.nutrimentUnits.calories);

    let caloriesPerUnit = app.Goals.getMacroNutrimentCalories(stat);
    let result = Math.round(percentGoal / 100 * energyGoal / caloriesPerUnit);

    if (!isNaN(result))
      return result;
    return undefined;
  },

  getMacroNutrimentCalories: function(nutriment) {
    if (!app.energyMacroNutriments.includes(nutriment))
      return 0;
    // Each gram of carbohydrates, sugars and proteins has 4 calories
    if (nutriment == "carbohydrates" || nutriment == "sugars" || nutriment == "proteins")
      return 4;
    // Each gram of fat, saturated-fat has 9 calories
    if (nutriment == "fat" || nutriment == "saturated-fat")
      return 9;
  },

  getDiaryEntryFromDB: function(date) {
    return new Promise(async function(resolve, reject) {
      let entry = await dbHandler.get("diary", "dateTime", new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
      resolve(entry);
    }).catch(err => {
      throw (err);
    });
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