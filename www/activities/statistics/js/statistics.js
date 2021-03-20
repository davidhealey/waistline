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

  init: function(context) {
    this.getComponents();
    this.bindUIActions();
    this.renderChart();
  },

  getComponents: function() {
    app.Stats.el.stat = document.querySelector(".page[data-name='statistics'] #stat");
    app.Stats.el.chart = document.querySelector(".page[data-name='statistics'] #chart");
  },

  bindUIActions: function() {

  },

  renderChart: function() {
    console.log(app.f7);
    let chart = app.f7.areaChart.create({
      el: ".page[data-name='statistics'] #chart",
      datasets: [{
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          label: "Data set 1"
        },
        {
          values: [10, 20, 30, 40, 50, 60, 70, 80, 90],
          label: "Data set 2"
        }
      ]
    });
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='statistics']")) {
    let context = app.data.context;
    app.data.context = undefined;
    app.Stats.init(context);
  }
});