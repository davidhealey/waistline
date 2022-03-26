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
    app.Goals.el.list = document.querySelector(".page[data-name='goals'] #goal-list");
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

      let unit = app.Goals.getGoalUnit(x, true);
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

  getGoalUnit(stat, checkPercentGoal) {
    const preferredUnits = app.Settings.getField("units") || {};
    const units = app.Utils.concatObjects(app.Nutriments.getNutrimentUnits(), preferredUnits);

    if (stat == "body fat")
      return "%";
    if (app.measurements.includes(stat))
      return (stat == "weight") ? units.weight : units.length;
    if (checkPercentGoal == true && app.Goals.isPercentGoal(stat))
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
      let statDateGoal = app.Goals.getStatDateGoal(stat, date);
      if (statDateGoal["auto-adjust"] == true)
        includesAutoAdjustGoal = true;
      if (statDateGoal["percent-goal"] == true)
        includesPercentGoal = true;
    });

    let averageBasePeriodInfo = [];
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
          let totalNutrition = await app.FoodsMealsRecipes.getTotalNutrition(diaryEntry.items);
          let info = {
            nutrition: totalNutrition,
            date: currentDate,
            day: currentDay
          };
          averageBasePeriodInfo.push(info);
        }

        // If some goals are defined as percentage of energy, also get the energy goal for each day of the current average base period
        if (includesPercentGoal) {
          let energyGoal = app.Goals.getGoal(energyName, currentDate, currentDay, averageGoalBase, averageBasePeriodInfo);
          energyGoals.push(energyGoal.goal);
        }
      }
    }

    // If some goals are defined as percentage of energy, also get the energy goal for the requested date
    if (includesPercentGoal) {
      let energyGoal = app.Goals.getGoal(energyName, date, day, averageGoalBase, averageBasePeriodInfo);
      energyGoals.push(energyGoal.goal);
    }

    // Convert the energy goals to calories, if necessary
    if (energyUnit == app.nutrimentUnits.kilojoules) {
      energyGoals.forEach((goal, i) => {
        energyGoals[i] = app.Utils.convertUnit(goal, app.nutrimentUnits.kilojoules, app.nutrimentUnits.calories);
      });
    }

    // Get goals for the requested stats
    let goals = {};
    stats.forEach((stat) => {
      goals[stat] = app.Goals.getGoal(stat, date, day, averageGoalBase, averageBasePeriodInfo, energyGoals);
    });

    return goals;
  },

  getGoal: function(stat, date, day, averageGoalBase, averageBasePeriodInfo, energyGoals) {
    let energyGoal;
    if (energyGoals !== undefined)
      energyGoal = energyGoals[energyGoals.length - 1]; // Last item in the list is for the requested date

    let statDateGoal = app.Goals.getStatDateGoal(stat, date);
    let goal = app.Goals.getDayGoal(stat, statDateGoal, day, energyGoal);

    if (statDateGoal["auto-adjust"] == true) {
      let statSum = 0;
      let goalSum = 0;

      // Compute the sums of the nutrition intake and of the nutrition goals for the current average base period
      averageBasePeriodInfo.forEach((info, i) => {
        let dayStat = info.nutrition[stat] || 0;
        statSum += dayStat;

        let dayEnergyGoal;
        if (energyGoals !== undefined)
          dayEnergyGoal = energyGoals[i];

        let dateGoal = app.Goals.getStatDateGoal(stat, info.date);
        let dayGoal = app.Goals.getDayGoal(stat, dateGoal, info.day, dayEnergyGoal);
        if (dayGoal !== undefined && !isNaN(dayGoal))
          goalSum += dayGoal;
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

    return {
      goal: goal,
      isMin: statDateGoal["minimum-goal"]
    }
  },

  getDayGoal: function(stat, statGoal, day, energyGoal) {
    let statGoalValues = statGoal["goal"] || [];
    let goal;

    if (statGoal["shared-goal"] == true || app.measurements.includes(stat))
      goal = parseFloat(statGoalValues[0]);
    else
      goal = parseFloat(statGoalValues[day]);

    if (statGoal["percent-goal"] == true)
      goal = app.Goals.getEnergyPercentGoal(stat, goal, energyGoal);

    return goal;
  },

  getAverageGoal: function(stat) {
    let statGoal = app.Goals.getStatDateGoal(stat);
    let statGoalValues = statGoal["goal"] || [];
    let averageGoal;

    if (statGoalValues.length) {
      if (statGoal["shared-goal"] == true || app.measurements.includes(stat)) {
        averageGoal = parseFloat(statGoalValues[0]);
      } else {
        let goalSum = statGoalValues.reduce((a, b) => parseFloat(a) + parseFloat(b));
        averageGoal = goalSum / 7;
      }
    }

    if (statGoal["percent-goal"] == true) {
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
    return result;
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
      let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      let entry = await dbHandler.get("diary", "dateTime", d);
      resolve(entry);
    }).catch(err => {
      throw (err);
    });
  },

  getStatGoalSettings: function(stat) {
    return app.Settings.get("goals", stat) || {};
  },

  getStatDateGoal: function(stat, date) {
    let statGoalSettings = app.Goals.getStatGoalSettings(stat);
    let statGoalList = statGoalSettings["goal-list"] || [];
    if (statGoalList.length) {
      statGoalList.reverse(); // Reverse list so last (= most recent) goal comes first
      for (let goal of statGoalList) {
        if (goal != undefined) {
          if (date == undefined)
            return goal; // Immediately return last (= most recent) goal from the list

          if (goal.effectiveFrom != undefined) {
            let effectiveFromDate = new Date(goal.effectiveFrom);
            let requestedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            if (effectiveFromDate <= requestedDate)
              return goal; // Return goal if it became effective before the requested date
          } else {
            return goal; // Goal has no effectiveFrom date so just return it
          }
        }
      }
    }
    return {};
  },

  showInDiary: function(stat) {
    let statGoalSettings = app.Goals.getStatGoalSettings(stat);
    return statGoalSettings["show-in-diary"];
  },

  showInStats: function(stat) {
    let statGoalSettings = app.Goals.getStatGoalSettings(stat);
    return statGoalSettings["show-in-stats"];
  },

  sharedGoal: function(stat, date) {
    let statDateGoal = app.Goals.getStatDateGoal(stat, date);
    return statDateGoal["shared-goal"];
  },

  autoAdjustGoal: function(stat, date) {
    let statDateGoal = app.Goals.getStatDateGoal(stat, date);
    return statDateGoal["auto-adjust"];
  },

  isMinimumGoal: function(stat, date) {
    let statDateGoal = app.Goals.getStatDateGoal(stat, date);
    return statDateGoal["minimum-goal"];
  },

  isPercentGoal: function(stat, date) {
    let statDateGoal = app.Goals.getStatDateGoal(stat, date);
    return statDateGoal["percent-goal"];
  },

  migrateStatGoalSettings: function(oldStat, newStat) {
    let goals = app.Settings.getField("goals");

    if (oldStat in goals) {
      if (newStat !== undefined)
        goals[newStat] = goals[oldStat];
      delete goals[oldStat];
    }

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