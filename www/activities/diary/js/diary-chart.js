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

    let date = new Date(context.date);

    this.dbData = await app.Stats.getDataFromDb(date, 0);

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

      let visible = app.Settings.getField("nutrimentVisibility");
      delete visible.calories;
      delete visible.kilojoules;

      let nutriments = app.nutriments;
      let nutrimentUnits = app.nutrimentUnits;

      let result = {
        "labels": [],
        "values": []
      };

      let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(data.items[0]);

      for (let n in nutrition) {

        if (!visible[n]) continue;

        let unit = nutrimentUnits[n] || "g";
        let name = app.strings.nutriments[n] || n;
        let label = app.Utils.tidyText(name, 50, true) + " (" + unit + ")";

        result.labels.push(label);
        result.values.push(Math.round(nutrition[n] * 100) / 100);
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
            fontSize: 18
          }
        },
        animation: {
          duration: 1000 * !app.Settings.get("theme", "animations"),
        },
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