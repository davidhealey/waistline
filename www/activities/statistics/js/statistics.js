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
  data: {},

  init: async function() {
    this.getComponents();
    this.bindUIActions();
    this.populateDropdownOptions();

    let ct = app.Settings.get("statistics", "chart-type");
    ct == 0 ? app.Stats.chartType = "bar" : app.Stats.chartType = "line";

    this.setChartTypeButtonVisibility();
    this.chart = undefined;
    this.dbData = await this.getDataFromDb();

    if (this.dbData !== undefined) {
      let laststat = window.localStorage.getItem("last-stat");

      if (laststat != undefined && laststat != "")
        app.Stats.el.stat.value = laststat;

      // Organise db data and render chart
      this.data = await this.organiseData(this.dbData, this.el.stat.value);
      window.localStorage.setItem("last-stat", this.el.stat.value);

      this.updateChart();
      this.renderStatLog();
    }
  },

  getComponents: function() {
    app.Stats.el.range = document.querySelector(".page[data-name='statistics'] #range");
    app.Stats.el.stat = document.querySelector(".page[data-name='statistics'] #stat");
    app.Stats.el.chart = document.querySelector(".page[data-name='statistics'] #chart");
    app.Stats.el.barType = document.querySelector(".page[data-name='statistics'] #bar-type");
    app.Stats.el.lineType = document.querySelector(".page[data-name='statistics'] #line-type");
    app.Stats.el.timeline = document.querySelector(".page[data-name='statistics'] #timeline");
  },

  bindUIActions: function() {

    // Date range
    if (!app.Stats.el.range.hasChangedEvent) {
      app.Stats.el.range.addEventListener("change", async (e) => {
        app.Stats.dbData = await this.getDataFromDb();
        if (app.Stats.dbData !== undefined) {
          app.Stats.data = await app.Stats.organiseData(app.Stats.dbData, app.Stats.el.stat.value);
          app.Stats.updateChart();
          app.Stats.renderStatLog();
        }
      });
      app.Stats.el.range.hasChangedEvent = true;
    }

    // Stat field
    if (!app.Stats.el.stat.hasChangedEvent) {
      app.Stats.el.stat.addEventListener("change", async (e) => {
        let value = e.target.value;
        if (app.Stats.dbData !== undefined) {
          app.Stats.data = await app.Stats.organiseData(app.Stats.dbData, value);
          window.localStorage.setItem("last-stat", value);
          app.Stats.updateChart();
          app.Stats.renderStatLog();
        }
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

          app.Settings.put("statistics", "chart-type", value);

          app.Stats.chart.destroy();
          app.Stats.chart = undefined;
          app.Stats.updateChart();
        });
        x.hasClickEvent = true;
      }
    });

    // Dropdown swipe events
    app.Stats.el.range.addEventListener("touchstart", (e) => {
      touchstartX = e.changedTouches[0].screenX;
    }, false);

    app.Stats.el.stat.addEventListener("touchstart", (e) => {
      touchstartX = e.changedTouches[0].screenX;
    }, false);

    app.Stats.el.range.addEventListener("touchend", (e) => {
      touchendX = e.changedTouches[0].screenX;
      app.Stats.handleSwipeGesture(app.Stats.el.range);
    }, false);

    app.Stats.el.stat.addEventListener("touchend", (e) => {
      touchendX = e.changedTouches[0].screenX;
      app.Stats.handleSwipeGesture(app.Stats.el.stat);
    }, false);
  },

  handleSwipeGesture: function(select) {
    const buffer = 50;

    // Swiped right
    if (touchendX > touchstartX + buffer) {
      if ($("html").get(0).getAttribute("dir") === "rtl")
        app.Stats.selectNext(select);
      else
        app.Stats.selectPrevious(select);
    }

    // Swiped left
    if (touchendX + buffer < touchstartX) {
      if ($("html").get(0).getAttribute("dir") === "rtl")
        app.Stats.selectPrevious(select);
      else
        app.Stats.selectNext(select);
    }
  },

  selectNext: function(select) {
    if (select.selectedIndex < select.length - 1) {
      select.selectedIndex += 1;
      select.dispatchEvent(new Event("change"));
    }
  },

  selectPrevious: function(select) {
    if (select.selectedIndex > 0) {
      select.selectedIndex -= 1;
      select.dispatchEvent(new Event("change"));
    }
  },

  setChartTypeButtonVisibility: function() {
    let buttons = Array.from(document.getElementsByClassName("chart-type"));
    let value = Number(app.Stats.chartType != "bar");

    buttons[value].style.display = "none";
    buttons[1 - value].style.display = "block";
  },

  populateDropdownOptions: function() {
    const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    const energyUnit = app.Settings.get("units", "energy");
    const measurements = app.measurements;
    const stats = measurements.concat(nutriments);

    stats.forEach((x, i) => {
      if ((x == "calories" || x == "kilojoules") && app.nutrimentUnits[x] != energyUnit) return;
      if (!app.Goals.showInStats(x)) return;

      let option = document.createElement("option");
      option.value = x;
      let text = app.strings.nutriments[x] || app.strings.statistics[x] || x;
      option.innerText = app.Utils.tidyText(text, 50);
      app.Stats.el.stat.appendChild(option);
    });

    app.Stats.el.stat.selectedIndex = 0;
  },

  updateChart: function() {

    if (app.Stats.chart == undefined) {
      app.Stats.renderChart(app.Stats.data);
    } else {
      app.Stats.chart.data.labels = app.Stats.data.dates;
      app.Stats.chart.data.datasets[0].label = app.Stats.data.dataset.label;
      app.Stats.chart.data.datasets[0].data = app.Stats.data.dataset.values;
    }

    app.Stats.chart.annotation.elements = [];
    app.Stats.chart.options.annotation.annotations = [];

    if (app.Settings.get("statistics", "average-line") == true) {
      app.Stats.chart.options.annotation.annotations.push({
        id: "average",
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: app.Stats.data.average,
        borderColor: 'red',
        borderWidth: 2
      });
    }

    if (app.Settings.get("statistics", "goal-line") == true) {
      app.Stats.chart.options.annotation.annotations.push({
        id: "goal",
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: app.Stats.data.goal,
        borderColor: 'green',
        borderWidth: 3
      });
    }

    app.Stats.chart.update();
  },

  renderStatLog: function() {
    this.el.timeline.innerHTML = "";

    // Build list from bottom to top
    for (let i = 0; i < app.Stats.data.dates.length; i++) {
      let li = document.createElement("li");
      app.Stats.el.timeline.prepend(li);

      let content = document.createElement("div");
      content.className = "item-content";
      li.appendChild(content);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      content.appendChild(inner);

      let title = document.createElement("div");
      title.className = "item-title";
      title.innerText = app.Stats.data.dates[i];
      inner.appendChild(title);

      let after = document.createElement("div");
      after.className = "item-after";
      after.innerText = app.Utils.tidyNumber(app.Stats.data.dataset.values[i], app.Stats.data.dataset.unit);
      inner.appendChild(after);
    }

    let avg = this.renderAverage(this.data.average, this.data.dataset.unit);
    this.el.timeline.prepend(avg);
  },

  renderAverage: function(average, unit) {
    let roundedAverage = Math.round(average * 100) / 100;

    let li = document.createElement("li");

    let content = document.createElement("div");
    content.className = "item-content";
    li.appendChild(content);

    let inner = document.createElement("div");
    inner.className = "item-inner";
    content.appendChild(inner);

    let title = document.createElement("div");
    title.className = "item-title";
    title.innerText = app.strings.statistics["average"] || "Average";
    inner.appendChild(title);

    let after = document.createElement("div");
    after.className = "item-after";
    after.innerText = app.Utils.tidyNumber(roundedAverage, unit);
    inner.appendChild(after);

    return li;
  },

  organiseData: function(data, field) {
    return new Promise(async function(resolve, reject) {

      let unit = app.Goals.getGoalUnit(field, false);
      let unitSymbol = app.strings["unit-symbols"][unit] || unit;

      let result = {
        dates: [],
        dataset: {
          values: [],
          unit: unitSymbol
        },
        average: 0
      };

      for (let i = 0; i < data.timestamps.length; i++) {
        let value;

        if (app.measurements.includes(field)) {
          value = app.Utils.convertUnit(data.stats[i][field], app.measurementUnits[field], unit);
        } else {
          let nutrition = await app.FoodsMealsRecipes.getTotalNutrition(data.items[i], "ignore");
          value = nutrition[field];
        }

        if (value != undefined && value != 0 && !isNaN(value)) {
          let timestamp = data.timestamps[i];
          let date = timestamp.toLocaleDateString([], {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "UTC"
          });
          result.dates.push(date);
          result.dataset.values.push(Math.round(value * 100) / 100);
          result.average = result.average + value;
        }
      }

      let title = app.strings.nutriments[field] || app.strings.statistics[field] || field;
      let goal = app.Goals.getAverageGoal(field);

      result.dataset.label = app.Utils.tidyText(title, 50);
      if (unitSymbol !== undefined)
        result.dataset.label += " (" + unitSymbol + ")";
      result.average = result.average / result.dates.length || 0;
      result.goal = goal;

      resolve(result);
    }).catch(err => {
      throw (err);
    });
  },

  getDataFromDb: function(from, range) {
    return new Promise(async function(resolve, reject) {
      let result = {
        "timestamps": [],
        "items": [],
        "stats": []
      };

      let now = from || new Date();
      let fromDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      fromDate.setHours(0, 0, 0, 0);
      let toDate = new Date(fromDate);
      toDate.setUTCHours(toDate.getUTCHours() + 24);

      let rangeValue = 0;

      if (range !== undefined)
        rangeValue = range;
      else if (app.Stats.el.range !== undefined)
        rangeValue = app.Stats.el.range.value;

      rangeValue == 7 ? fromDate.setUTCDate(fromDate.getUTCDate() - 6) : fromDate.setUTCMonth(fromDate.getUTCMonth() - rangeValue);

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
          borderWidth: 2,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 0.5)'
        }]
      },
      options: {
        animation: {
          duration: 1000 * !app.Settings.get("appearance", "animations"),
        },
        annotation: {
          annotations: []
        },
        legend: {
          labels: {
            font: {
              size: 16,
              weight: "bold"
            }
          },
          onClick: (e) => {}
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: app.Settings.get("statistics", "y-zero")
            }
          }]
        }
      }
    });
  },
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='statistics']")) {
    app.Stats.init();
  }
});