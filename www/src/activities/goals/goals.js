/*
  Copyright 2018, 2019 David Healey

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
  along with Waistline.  If not, see <http://www.gnu.org/licenses/>.
*/

var goals = {

  //Helper function, gets day from dateTime and calls getGoalsByDay
  getGoalsByDate: function(dateTime) {
    let day = dateTime.getUTCDay();
    return goals.getGoalsByDay(day);
  },

  //Returns the goals that have been set for the given day (0-6)
  getGoalsByDay: function(day) {
    let data = JSON.parse(window.localStorage.getItem("goals"));
    let result = {};

    for (let g in data) {
      if (g == "weight") continue; //Weight handled separately
      result[g] = result[g] || 0;
      result[g] = data[g][day];
    }

    result.weight = data.weight;
    return result;
  },

  populateList: function() {

    let goalTypes = app.nutriments;
    goalTypes.unshift("weight");
    let ul = document.querySelector('ons-page#goals #goals-list');
    ul.innerText = "";

    for (let i = 0; i < goalTypes.length; i++) {
      let g = goalTypes[i];

      let li = document.createElement("ons-list-item");
      li.id = g;
      li.className = "nutrition";
      li.setAttribute("modifier", "chevron");
      li.setAttribute("tappable", true);
      li.addEventListener("tap", goalEditor.open);
      ul.appendChild(li);

      let span = document.createElement("span");
      span.setAttribute("data-localize", g);
      span.innerText = g.charAt(0).toUpperCase() + g.slice(1);
      li.appendChild(span);
    }
  },
};

//Page initialization
document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#goals')) {

    goals.populateList();

  }
});
