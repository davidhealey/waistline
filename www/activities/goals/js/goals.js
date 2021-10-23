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

  getGoals: async function(stats, date) {
    const energyUnit = app.Settings.get("units", "energy");
    const energyName = Object.keys(app.nutrimentUnits).find(key => app.nutrimentUnits[key] === energyUnit);
    const day = date.getDay();

    // Check if some goals are defined to auto adjust or defined as percentage of energy
    let includesAutoAdjustGoal = false;
    let includesPercentGoal = false;
    stats.forEach((stat) => {
      if (app.Goals.autoAdjustGoal(stat))
        includesAutoAdjustGoal = true;
      if (app.Goals.isPercentGoal(stat))
        includesPercentGoal = true;
    });

    let nutritionTotals = [];
    let daysWithDiaryEntries = [];
    let energyGoals = {};

    // If some goals are defined to auto adjust, fetch the nutrition totals for the current week
    if (includesAutoAdjustGoal) {
      for (let d = 0; d < day; d++) {
        let dayDelta = day - d;
        let currentDate = new Date(date.getTime());
        currentDate.setDate(currentDate.getDate() - dayDelta);

        let diaryEntry = await app.Goals.getDiaryEntryFromDB(currentDate);

        if (diaryEntry !== undefined && diaryEntry.items !== undefined && diaryEntry.items.length > 0) {
          let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(diaryEntry.items);
          nutritionTotals.push(nutrition);
          daysWithDiaryEntries.push(d);
        }

        // If some goals are defined as percentage of energy, also get the energy goal for each day of the current week
        if (includesPercentGoal)
          energyGoals[d] = app.Goals.getGoal(energyName, d, nutritionTotals, daysWithDiaryEntries);
      }
    }

    // If some goals are defined as percentage of energy, also get the energy goal for the requested day
    if (includesPercentGoal)
      energyGoals[day] = app.Goals.getGoal(energyName, day, nutritionTotals, daysWithDiaryEntries);

    // Convert the energy goals to calories, if necessary
    if (energyUnit == app.nutrimentUnits.kilojoules)
      for (const d in energyGoals)
        energyGoals[d] = app.Utils.convertUnit(energyGoals[d], app.nutrimentUnits.kilojoules, app.nutrimentUnits.calories);

    // Get goals for the requested stats
    let goals = {};
    stats.forEach((stat) => {
      goals[stat] = app.Goals.getGoal(stat, day, nutritionTotals, daysWithDiaryEntries, energyGoals);
    });

    return goals;
  },

  getGoal: function(stat, day, nutritionTotals, daysWithDiaryEntries, energyGoals) {
    let goal = app.Goals.getDayGoal(stat, day, energyGoals);

    if (app.Goals.autoAdjustGoal(stat)) {
      let weekStatSum = 0;
      let weekGoalSum = 0;

      // Compute the sum of the nutrition intake for the current week
      nutritionTotals.forEach((nutrition) => {
        let dayStat = nutrition[stat] || 0;
        weekStatSum += dayStat;
      });

      // Compute the sum of the nutrition goals for the current week
      daysWithDiaryEntries.forEach((d) => {
        let dayGoal = app.Goals.getDayGoal(stat, d, energyGoals);
        if (dayGoal !== undefined && dayGoal !== "")
          weekGoalSum += parseFloat(dayGoal);
      });
  
      // Split the difference among the remaining days of the current week
      let weekGoalDelta = weekStatSum - weekGoalSum;
      let weekDaysLeft = 7 - day;
      let delta = weekGoalDelta / weekDaysLeft;
  
      // Calculate the adjusted goal
      goal = Math.round(goal - delta);
      if (goal < 0)
        goal = 0;
    }

    return goal;
  },

  getDayGoal: function(stat, day, energyGoals) {
    let goals = app.Settings.get("goals", stat);
    let goal;

    if (app.Goals.sharedGoal(stat) || app.measurements.includes(stat))
      goal = goals[0];
    else
      goal = goals[day];

    if (app.Goals.isPercentGoal(stat))
      goal = app.Goals.getEnergyPercentGoal(stat, goal, energyGoals[day]);

    return goal;
  },

  getEnergyPercentGoal: function(stat, percentGoal, energyGoal) {
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
    // Each gram of fat and saturated-fat has 9 calories
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