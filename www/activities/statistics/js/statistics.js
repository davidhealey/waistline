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

app.Stats = {

  el: {},
  chart: undefined,
  chartType: "bar",
  dbData: undefined,

  init: async function() {
    this.getComponents();
    this.bindUIActions();
    this.populateDropdownOptions();
    this.setChartTypeButtonVisbility();
    this.chart = undefined;
    this.dbData = await this.getDataFromDb();
    this.updateChart(app.Stats.el.stat.value);
  },

  getComponents: function() {
    app.Stats.el.range = document.querySelector(".page[data-name='statistics'] #range");
    app.Stats.el.stat = document.querySelector(".page[data-name='statistics'] #stat");
    app.Stats.el.chart = document.querySelector(".page[data-name='statistics'] #chart");
    app.Stats.el.barType = document.querySelector(".page[data-name='statistics'] #bar-type");
    app.Stats.el.lineType = document.querySelector(".page[data-name='statistics'] #line-type");
  },

  bindUIActions: function() {

    // Date range
    if (!app.Stats.el.range.hasChangedEvent) {
      app.Stats.el.range.addEventListener("change", async (e) => {
        app.Stats.dbData = await this.getDataFromDb();
        app.Stats.updateChart(app.Stats.el.stat.value);
      });
      app.Stats.el.range.hasChangedEvent = true;
    }

    // Stat field
    if (!app.Stats.el.stat.hasChangedEvent) {
      app.Stats.el.stat.addEventListener("change", (e) => {
        let value = e.target.value;
        app.Stats.updateChart(value);
      });
      app.Stats.el.stat.hasChangedEvent = true;
    }

    // Chart type
    let buttons = Array.from(document.getElementsByClassName("chart-type"));
    buttons.forEach((x, i) => {
      if (!x.hasClickEvent) {
        x.addEventListener("click", (e) => {
          let value = Number(i != 0);

          buttons[value].style.display = "none";
          buttons[1 - value].style.display = "block";

          value == 0 ? app.Stats.chartType = "bar" : app.Stats.chartType = "line";

          app.Stats.chart.destroy();
          app.Stats.chart = undefined;
          this.updateChart(app.Stats.el.stat.value);
        });
        x.hasClickEvent = true;
      }
    });
  },

  setChartTypeButtonVisbility: function() {
    let buttons = Array.from(document.getElementsByClassName("chart-type"));
    let value = Number(app.Stats.chartType != "bar");

    buttons[value].style.display = "none";
    buttons[1 - value].style.display = "block";
  },

  populateDropdownOptions: function() {
    let nutriments = app.nutriments;

    nutriments.forEach((x, i) => {
      let option = document.createElement("option");
      option.value = x;
      option.innerHTML = app.Utils.tidyText(x);
      app.Stats.el.stat.appendChild(option);
    });
  },

  updateChart: async function(field) {
    let data = await app.Stats.organiseData(app.Stats.dbData, field);

    if (app.Stats.chart == undefined) {
      app.Stats.renderChart(data);
    } else {
      app.Stats.chart.data.labels = data.dates;
      app.Stats.chart.data.datasets[0].label = data.dataset.label;
      app.Stats.chart.data.datasets[0].data = data.dataset.values;
      app.Stats.chart.update();
    }
  },

  organiseData: function(data, field) {
    return new Promise(async function(resolve, reject) {

      let result = {
        dates: [],
        dataset: {
          values: []
        }
      };

      // Format dates 
      for (let i in data.timestamps) {
        let timestamp = data.timestamps[i];
        let date = new Intl.DateTimeFormat('en-GB').format(timestamp);
        result.dates.push(date);
      }

      if (app.nutriments.indexOf(field) == -1) {
        for (let i in data.stats) {
          result.dataset.values.push(data.stats[i][field]);
        }
      } else {
        for (let i in data.items) {
          let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(data.items[i]);
          result.dataset.values.push(nutrition[field]);
        }
      }

      result.dataset.label = app.Utils.tidyText(field);

      resolve(result);
    }).catch(err => {
      throw (err);
    });
  },

  getDataFromDb: function() {
    return new Promise(async function(resolve, reject) {
      let result = {
        "timestamps": [],
        "items": [],
        "nutrition": [],
        "stats": []
      };

      let now = new Date();
      let fromDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      let toDate = new Date(fromDate);
      toDate.setUTCHours(toDate.getUTCHours() + 24);

      let range = app.Stats.el.range.value;
      range == 7 ? fromDate.setUTCDate(fromDate.getUTCDate() - 6) : fromDate.setUTCMonth(fromDate.getUTCMonth() - range);

      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.bound(fromDate, toDate, false, true)).onsuccess = function(e) {
        let cursor = e.target.result;

        if (cursor) {

          let value = cursor.value;

          if (value.items.length > 0 || value.stats.weight != undefined) {
            result.timestamps.push(value.dateTime);
            result.items.push(value.items);
            result.stats.push(value.stats);
          }

          cursor.continue();
        } else {
          resolve(result);
        }
      };
    }).catch(err => {
      throw (err);
    });
  },

  renderChart: function(data) {
    app.Stats.chart = new Chart(app.Stats.el.chart, {
      type: app.Stats.chartType,
      data: {
        labels: data.dates,
        datasets: [{
          label: data.dataset.label,
          data: data.dataset.values,
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='statistics']")) {
    app.Stats.init();
  }
});