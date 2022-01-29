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

    const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    const units = app.Nutriments.getNutrimentUnits();
    const energyUnit = app.Settings.get("units", "energy");
    const measurements = app.measurements;
    const stats = measurements.concat(nutriments);

    for (let i in stats) {
      let x = stats[i];

      if ((x == "calories" || x == "kilojoules") && units[x] != energyUnit) continue;

      let unit = app.Goals.getGoalUnit(x);
      let unitSymbol = app.strings["unit-symbols"][unit] || unit;

      let li = document.createElement("li");
      app.Goals.el.list.appendChild(li);

      let a = document.createElement("a");
      a.href = "#";

      let text = app.strings.nutriments[x] || app.strings.statistics[x] || x;
      a.innerText = app.Utils.tidyText(text, 50);
      if (unitSymbol !== undefined)
        a.innerText += " (" + unitSymbol + ")";
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
    const preferredUnits = app.Settings.getField("units") || {};
    const units = app.Utils.concatObjects(app.Nutriments.getNutrimentUnits(), preferredUnits);

    if (stat == "body fat")
      return "%";
    if (app.measurements.includes(stat))
      return (stat == "weight") ? units.weight : units.length;
    if (checkPercentGoal && app.Goals.isPercentGoal(stat))
      return "%"
    else
      return units[stat];
  },

  getGoals: async function(stats, date) {
    const energyUnit = app.Settings.get("units", "energy");
    const energyName = app.Utils.getEnergyUnitName(energyUnit);
    const firstDayOfWeek = app.Settings.get("goals", "first-day-of-week") || 0;
    const averageGoalBase = app.Settings.get("goals", "average-goal-base");

    let day = (date.getDay() - Number(firstDayOfWeek) + 7) % 7;
    let averageBaseDay = day;

    if (averageGoalBase === "3-days")
      averageBaseDay = 3;
    else if (averageGoalBase === "5-days")
      averageBaseDay = 5;
    else if (averageGoalBase === "7-days")
      averageBaseDay = 7;
    else if (averageGoalBase === "10-days")
      averageBaseDay = 10;

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
    let energyGoals = [];

    // If some goals are defined to auto adjust, fetch the nutrition totals for the current average base period
    if (includesAutoAdjustGoal) {
      for (let d = 0; d < averageBaseDay; d++) {
        let dayDelta = averageBaseDay - d;
        let currentDate = new Date(date.getTime());
        currentDate.setDate(currentDate.getDate() - dayDelta);
        let currentDay = (currentDate.getDay() - Number(firstDayOfWeek) + 7) % 7;

        let diaryEntry = await app.Goals.getDiaryEntryFromDB(currentDate);

        if (diaryEntry !== undefined && diaryEntry.items !== undefined && diaryEntry.items.length > 0) {
          let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(diaryEntry.items);
          nutritionTotals.push(nutrition);
          daysWithDiaryEntries.push(currentDay);
        }

        // If some goals are defined as percentage of energy, also get the energy goal for each day of the current average base period
        if (includesPercentGoal)
          energyGoals.push(app.Goals.getGoal(energyName, currentDay, averageGoalBase, nutritionTotals, daysWithDiaryEntries));
      }
    }

    // If some goals are defined as percentage of energy, also get the energy goal for the requested day
    if (includesPercentGoal)
      energyGoals.push(app.Goals.getGoal(energyName, day, averageGoalBase, nutritionTotals, daysWithDiaryEntries));

    // Convert the energy goals to calories, if necessary
    if (energyUnit == app.nutrimentUnits.kilojoules) {
      energyGoals.forEach((goal, i) => {
        energyGoals[i] = app.Utils.convertUnit(goal, app.nutrimentUnits.kilojoules, app.nutrimentUnits.calories);
      });
    }

    // Get goals for the requested stats
    let goals = {};
    stats.forEach((stat) => {
      goals[stat] = app.Goals.getGoal(stat, day, averageGoalBase, nutritionTotals, daysWithDiaryEntries, energyGoals);
    });

    return goals;
  },

  getGoal: function(stat, day, averageGoalBase, nutritionTotals, daysWithDiaryEntries, energyGoals) {
    let energyGoal;
    if (energyGoals !== undefined)
      energyGoal = energyGoals[energyGoals.length - 1]; // Last item in the list is for the requested day

    let goal = app.Goals.getDayGoal(stat, day, energyGoal);

    if (app.Goals.autoAdjustGoal(stat)) {
      let statSum = 0;
      let goalSum = 0;

      // Compute the sum of the nutrition intake for the current average base period
      nutritionTotals.forEach((nutrition) => {
        let dayStat = nutrition[stat] || 0;
        statSum += dayStat;
      });

      // Compute the sum of the nutrition goals for the current average base period
      daysWithDiaryEntries.forEach((d, i) => {
        let dayEnergyGoal;
        if (energyGoals !== undefined)
          dayEnergyGoal = energyGoals[i];
        let dayGoal = app.Goals.getDayGoal(stat, d, dayEnergyGoal);
        if (dayGoal !== undefined && dayGoal !== "")
          goalSum += parseFloat(dayGoal);
      });

      // Split the difference among the remaining days of the current average base period
      let goalDelta = statSum - goalSum;
      let daysLeft;
      if (averageGoalBase === "week")
        daysLeft = 7 - day;
      else
        daysLeft = 2; // Always assume two days left for rolling average
      let delta = goalDelta / daysLeft;

      // Calculate the adjusted goal
      goal = Math.round(goal - delta);
      if (goal < 0)
        goal = 0;
    }

    return goal;
  },

  getDayGoal: function(stat, day, energyGoal) {
    let goals = app.Settings.get("goals", stat);
    let goal;

    if (app.Goals.sharedGoal(stat) || app.measurements.includes(stat))
      goal = parseFloat(goals[0]);
    else
      goal = parseFloat(goals[day]);

    if (app.Goals.isPercentGoal(stat))
      goal = app.Goals.getEnergyPercentGoal(stat, goal, energyGoal);

    return goal;
  },

  getAverageGoal: function(stat) {
    let goals = app.Settings.get("goals", stat);
    let averageGoal;

    if (app.Goals.sharedGoal(stat) || app.measurements.includes(stat)) {
      averageGoal = parseFloat(goals[0]);
    } else {
      let goalSum = goals.reduce((a, b) => parseFloat(a) + parseFloat(b));
      averageGoal = goalSum / 7;
    }

    if (app.Goals.isPercentGoal(stat)) {
      const energyUnit = app.Settings.get("units", "energy");
      const energyName = app.Utils.getEnergyUnitName(energyUnit);
      let averageEnergyGoal = app.Goals.getAverageGoal(energyName);

      if (energyUnit == app.nutrimentUnits.kilojoules)
        averageEnergyGoal = app.Utils.convertUnit(averageEnergyGoal, app.nutrimentUnits.kilojoules, app.nutrimentUnits.calories);

      averageGoal = app.Goals.getEnergyPercentGoal(stat, averageGoal, averageEnergyGoal);
    }

    return averageGoal;
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
  },

  migrateStatGoalSettings: function(oldStat, newStat) {
    let goals = app.Settings.getField("goals");

    ["", "-show-in-diary", "-show-in-stats", "-shared-goal", "-auto-adjust", "-minimum-goal", "-percent-goal"].forEach((setting) => {
      if (oldStat + setting in goals) {
        if (newStat !== undefined)
          goals[newStat + setting] = goals[oldStat + setting];
        delete goals[oldStat + setting];
      }
    });

    app.Settings.putField("goals", goals);
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