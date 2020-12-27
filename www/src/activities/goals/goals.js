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
    let data = settings.getField("goals");

    let result = data.map(x => {
      if (x.name == "weight") return x;
      return {
        "name": x.name,
        "target": x.targets[day],
        "mutli": x.multi,
        "diaryDisplay": x.diaryDisplay
      };
    });

    return result;
  },

  shouldShowInDiary: function(type) {
    let data = settings.getField("goals");
    if (data && data[type]) return data[type].diaryDisplay;
    return false;
  },

  isGoalWeekly: function(type) {
    let data = settings.getField("goals");
    if (data && data[type]) return data[type].mode == "weekly";
    return false;
  },

  getWeeklyGoal: function(type) {
    let data = settings.getField("goals");
    if (data && data[type]) return data[type].weekly;
    return 0;
  },

  populateList: function() {

    let goalTypes = ["weight"].concat(app.nutriments);
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

  setDefaultGoals: function() //Set stored goals to default
  {
    let types = ["weight", "calories", "protein", "carbs", "fat", "saturated-fat", "sugar", "fiber", "sodium", "salt"];
    let values = [0, 2000, 45, 230, 70, 20, 90, 24, 6, 2200, 2.4]; //Womens RDAs
    let data = [];

    //Nutriment goals
    types.forEach(function(item, index) {

      if (item != "weight") {
        //Each day of week
        let targets = [];
        for (let i = 0; i < 7; i++) {
          targets[i] = values[index];
        }

        let entry = {
          "name": item,
          "targets": targets,
          "multi": true,
          "diaryDisplay": true
        };
        data.push(entry);
      }
    });

    //Weight
    let weight = {
      "name": "weight",
      "target": 75,
      "weekly": 0.25,
      "gain": false
    };
    data.push(weight);

    //Save data in local storage
    settings.putField("goals", JSON.stringify(data));
  },

  //First run initialization
  initializeSettings: function() {
    if (settings.get("goals", "weight") == undefined)
      settings.put("goals", "weight", 50);
  }

};

//Page initialization
document.addEventListener("init", function(event) {
  if (event.target.matches('ons-page#goals')) {
    goals.populateList();
  }
});

waistline.Goals = goals;