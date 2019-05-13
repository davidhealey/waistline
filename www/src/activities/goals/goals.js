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

  shouldShowInDiary: function(type) {
    let data = JSON.parse(window.localStorage.getItem("goals"));

    if (data && data[type]) {
      return data[type].diaryDisplay;
    }
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

  setDefaultGoals : function() //Set stored goals to default
  {
    var types = ["weight", "calories", "protein", "carbs", "fat", "saturated-fat", "sugar", "fiber", "sodium", "salt"];
    var values = [0, 2000, 45, 230, 70, 20, 90, 24, 6, 2200, 2.4]; //Womens RDAs
    var data = {};

    for (let i = 0; i < types.length; i++) //Each type
    {
      data[types[i]] = data[types[i]] || {};

      if (types[i] == "weight") continue; //Weight is handled separately

      data[types[i]].multi = true;
      data[types[i]].diaryDisplay = true;

      for (let j = 0; j < 7; j++) { //Each day of the week (0-6)
        data[types[i]][j] = values[i];
      }
    }

    data.weight = {"target":75, "weekly":0.25, "gain":false}; //Default weight goals

    //Save data in local storage
    window.localStorage.setItem("goals", JSON.stringify(data));
  },
};

//Page initialization
document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#goals')) {

    goals.populateList();

  }
});
