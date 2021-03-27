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
  chartType: "pie",
  dbData: undefined,
  el: {},

  init: async function(context) {
    this.getComponents();
    this.bindUIActions();

    let d = new Date(context.date);
    this.dbData = await app.Stats.getDataFromDb(d, 0);

    if (this.dbData.timestamps.length > 0) {
      let data = await this.organiseData(this.dbData);
      this.renderChart(data);
    }
  },

  getComponents: function() {
    app.DiaryChart.el.chart = document.querySelector(".page[data-name='diary-chart'] #chart");
  },

  bindUIActions: function() {},

  organiseData: function(data) {
    return new Promise(async function(resolve, reject) {

      let nutriments = app.nutriments;
      let nutrimentUnits = app.nutrimentUnits;
      let shortNames = app.nutrimentShortNames;
      let energyUnit = app.Settings.get("units", "energy");

      let result = {
        "labels": [],
        "values": []
      };

      let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(data.items[0]);

      // Sort nutrition by value
      nutrition = Object
        .entries(nutrition)
        .sort((a, b) => b[1] - a[1])
        .reduce((_sortedObj, [k, v]) => ({
          ..._sortedObj,
          [k]: v
        }), {});

      let i = 0;
      for (let n in nutrition) {
        if (energyUnit == "kJ" && n == "calories") continue;
        if (energyUnit == "kcal" && n == "kilojoules") continue;

        let unit = nutrimentUnits[n] || "g";
        let label = app.Utils.tidyText(shortNames[nutriments.indexOf(n)]) + " (" + unit + ")";

        result.labels.push(label);
        result.values.push(Math.round(nutrition[n] * 100) / 100);
        i++;

        if (i > 9)
          break;
      }

      resolve(result);
    });
  },

  renderChart: function(data) {
    app.DiaryChart.chart = new Chart(app.DiaryChart.el.chart, {
      type: app.DiaryChart.chartType,
      data: {
        datasets: [{
          data: data.values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(13, 102, 255, 0.5)',
            'rgba(223, 102, 255, 0.5)',
            'rgba(113, 102, 255, 0.5)',
            'rgba(168, 102, 255, 0.5)',
            'rgba(53, 102, 255, 0.5)',
            'rgba(145, 159, 64, 0.5)',
            'rgba(45, 159, 64, 0.5)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(13, 102, 255, 0.5)',
            'rgba(223, 102, 255, 0.5)',
            'rgba(113, 102, 255, 0.5)',
            'rgba(168, 102, 255, 0.5)',
            'rgba(53, 102, 255, 0.5)',
            'rgba(145, 159, 64, 0.5)',
            'rgba(45, 159, 64, 0.5)'
          ],
          borderWidth: 1
        }],
        labels: data.labels
      },
      options: {
        legend: {
          labels: {
            fontColor: 'black',
            fontSize: 18
          }
        }
      }
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