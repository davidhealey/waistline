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

    let date = new Date(context.date);

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
      const visible = app.Settings.getField("nutrimentVisibility");
      const nutrimentUnits = app.nutrimentUnits;

      let result = {
        "labels": [],
        "values": [],
        "colours": [],
        "macros": [],
        "totals": []
      };

      const nutrition = await app.FoodsMealsRecipes.getTotalNutrition(data.items[0]);
      const macros = ["fat", "saturated-fat", "carbohydrates", "sugars", "proteins"];
      let sum = 0;

      // Chart
      macros.forEach((x, i) => {

        let value = nutrition[x] || 0;
        if (x == "fat")
          value -= nutrition["saturated-fat"] || 0;
        else if (x == "carbohydrates")
          value -= nutrition["sugars"] || 0;
        sum += value;

        if (value > 0) {
          let name = app.strings.nutriments[x] || x;
          result.labels.push(app.Utils.tidyText(name, 50, true));
          result.values.push(Math.round(value * 100) / 100);
          result.colours.push(app.DiaryChart.chartColours[i]);
        }
      });

      // Macros
      macros.forEach((x) => {
        if (x == "saturated-fat" || x == "sugars") return;

        let value = nutrition[x] || 0;
        let percent = value / sum * 100;
        let name = app.strings.nutriments[x] || x;

        let entry = {
          name: app.Utils.tidyText(name, 50, true),
          value: (Math.round(percent * 100) / 100) + "%"
        }
        result.macros.push(entry);
      });

      // Totals
      nutriments.forEach((x) => {
        if (x == "calories" || x == "kilojoules") return;
        if (!visible[x]) return;
        if (!nutrition[x]) return;

        let name = app.strings.nutriments[x] || x;
        let unit = nutrimentUnits[x] || "g";

        let entry = {
          name: app.Utils.tidyText(name, 50, true),
          value: (Math.round(nutrition[x] * 100) / 100) + " " + unit
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
      li.className = "item-inner";

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
      li.className = "item-inner";

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