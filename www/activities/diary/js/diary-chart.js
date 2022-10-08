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

app.DiaryChart = {

  chart: undefined,
  chartColours: [
    'rgba(170, 9, 9, 0.5)',
    'rgba(213, 11, 11, 0.5)',
    'rgba(8, 118, 184, 0.5)',
    'rgba(0, 151, 225, 0.5)',
    'rgba(255, 206, 86, 0.5)'
  ],
  chartType: "pie",
  dbData: undefined,
  el: {},

  init: async function(context) {
    this.getComponents();
    this.bindUIActions();

    let date = context.date;

    this.dbData = await app.Stats.getDataFromDb(date, 0);

    if (this.dbData.timestamps.length > 0) {
      let data = await this.organiseData(this.dbData);
      this.renderPage(data);
    }
  },

  getComponents: function() {
    app.DiaryChart.el.chart = document.querySelector(".page[data-name='diary-chart'] #chart");
    app.DiaryChart.el.macrosList = document.querySelector(".page[data-name='diary-chart'] #macros-list");
    app.DiaryChart.el.totalsList = document.querySelector(".page[data-name='diary-chart'] #totals-list");
  },

  bindUIActions: function() {},

  organiseData: function(data) {
    return new Promise(async function(resolve, reject) {

      const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
      const units = app.Nutriments.getNutrimentUnits();
      const visible = app.Settings.getField("nutrimentVisibility");
      const showAll = app.Settings.get("diary", "show-all-nutriments");

      let result = {
        "labels": [],
        "values": [],
        "colours": [],
        "macros": [],
        "totals": []
      };

      const nutrition = await app.FoodsMealsRecipes.getTotalNutrition(data.items[0], "ignore");
      const macros = app.energyMacroNutriments;

      let energy = {};
      let energyTotal = 0;

      // Chart
      macros.forEach((x, i) => {

        let amount = nutrition[x] || 0;
        let caloriesPerUnit = app.Goals.getMacroNutrimentCalories(x);
        energy[x] = amount * caloriesPerUnit;

        if (x == "fat")
          amount -= nutrition["saturated-fat"] || 0;
        else if (x == "carbohydrates")
          amount -= nutrition["sugars"] || 0;

        let value = amount * caloriesPerUnit;
        energyTotal += value;

        if (value > 0) {
          let name = app.strings.nutriments[x] || x;
          result.labels.push(app.Utils.tidyText(name, 50));
          result.values.push(Math.round(value * 100) / 100);
          result.colours.push(app.DiaryChart.chartColours[i]);
        }
      });

      // Macros
      macros.forEach((x) => {
        if (x == "saturated-fat" || x == "sugars") return;
        if (!nutrition[x]) return;

        let percent = energy[x] / energyTotal * 100;
        let name = app.strings.nutriments[x] || x;

        if (x == "fat" && nutrition["saturated-fat"] !== undefined && nutrition["saturated-fat"] !== 0) {
          const including = app.strings["diary-chart"]["including-saturated-fat"] || "including sat fat";
          name += " (" + including + ")";
        }
        else if (x == "carbohydrates" && nutrition["sugars"] !== undefined && nutrition["sugars"] !== 0) {
          const including = app.strings["diary-chart"]["including-sugars"] || "including sugars";
          name += " (" + including + ")";
        }

        let value = app.Utils.tidyNumber(Math.round(percent * 100) / 100) + "%";

        let entry = {
          name: app.Utils.tidyText(name, 50),
          value: value
        }
        result.macros.push(entry);
      });

      // Totals
      nutriments.forEach((x) => {
        if (x == "calories" || x == "kilojoules") return;
        if (showAll !== true && visible[x] !== true) return;
        if (!nutrition[x]) return;

        let name = app.strings.nutriments[x] || x;
        let unit = app.strings["unit-symbols"][units[x]] || units[x];

        let value = app.Utils.tidyNumber((Math.round(nutrition[x] * 100) / 100), unit);

        let entry = {
          name: app.Utils.tidyText(name, 50),
          value: value
        }
        result.totals.push(entry);
      });

      resolve(result);
    });
  },

  renderPage: function(data) {
    // Chart
    app.DiaryChart.chart = new Chart(app.DiaryChart.el.chart, {
      type: app.DiaryChart.chartType,
      data: {
        datasets: [{
          data: data.values,
          backgroundColor: data.colours,
          borderColor: data.colours,
          borderWidth: 1
        }],
        labels: data.labels
      },
      options: {
        events: [],
        tooltips: {
          enabled: false
        },
        legend: {
          labels: {
            fontSize: 18
          }
        },
        animation: {
          duration: 1000 * !app.Settings.get("appearance", "animations"),
        },
      }
    });

    // Macros
    data.macros.forEach((x) => {
      let li = document.createElement("li");
      li.className = "item-content item-inner";

      let name = document.createElement("div");
      name.className = "item-title";
      let t = document.createTextNode(x.name);
      name.appendChild(t);

      let value = document.createElement("div");
      value.className = "flex-shrink-0";
      t = document.createTextNode(x.value);
      value.appendChild(t);

      li.appendChild(name);
      li.appendChild(value);
      app.DiaryChart.el.macrosList.appendChild(li);
    });

    // Totals
    data.totals.forEach((x) => {
      let li = document.createElement("li");
      li.className = "item-content item-inner";

      let name = document.createElement("div");
      name.className = "item-title";
      let t = document.createTextNode(x.name);
      name.appendChild(t);

      let value = document.createElement("div");
      value.className = "flex-shrink-0";
      t = document.createTextNode(x.value);
      value.appendChild(t);

      li.appendChild(name);
      li.appendChild(value);
      app.DiaryChart.el.totalsList.appendChild(li);
    });
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='diary-chart']")) {
    let context = app.data.context;
    app.data.context = undefined;
    app.DiaryChart.init(context);
  }
});