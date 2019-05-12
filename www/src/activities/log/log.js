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

var log = {

  putEntry(dateTime, data) {
    return new Promise(function(resolve, reject) {

      //Make sure all log entries are populated, if not add default values
      let lastWeight = window.localStorage.getItem("weight") || "";
      let dailyGoals = goals.getGoalsByDate(dateTime);

      data.dateTime = data.dateTime || dateTime;
      data.weight = data.weight || lastWeight;
      data.goals = data.goals || dailyGoals;
      data.nutrition = data.nutrition || {};

      dbHandler.put(data, "log")
      .then(resolve());
    });
  },

  getEntry: function(dateTime) {
    return new Promise(function(resolve, reject) {
      let request = dbHandler.getItem(dateTime, "log");

      request.onsuccess = function(e) {
        if (e.target && e.target.result) {
          return resolve(e.target.result);
        }
        resolve();
      };
    });
  },

  //Prompt the user to input a weight to record in the log
  promptToSetWeight : function(dateTime) {
    return new Promise(function(resolve, reject) {

      log.getEntry(dateTime) //Get log entry from db
      .then(function(entry) {

        let lastWeight = window.localStorage.getItem("weight") || 0;
        if (entry)
          lastWeight = entry.weight; //Get weight for entry
        else //No entry was found for given date
          entry = {}; //Create a new entry object

        //Show prompt
        ons.notification.prompt({message:"Record weight", title:"Weight", inputType:"number", defaultValue:lastWeight, "cancelable":true})
        .then(function(input) {
          if (!isNaN(parseFloat(input))) {

            //If the dateTime is set to "today" update the localStorage weight value
            let now = new Date();
            let today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

            if (dateTime.valueOf() == today.valueOf())
              window.localStorage.setItem("weight", input); //Update local storage weight

            //Set the weight value of entry and update the DB
            entry.weight = input;
            log.putEntry(dateTime, entry)
            .then(function() {return resolve();});
          }
          resolve(undefined);
        });
      });
    });
  },
};

document.addEventListener("init", function(event){

  //Tap event for any element with log-weight class
  let logElement = document.querySelector('.log-weight');

  if (logElement) {
    logElement.addEventListener("tap", function(e) {

      let dateTime = new Date(this.getAttribute("dateTime"));

      //If element doesn't have a dateTime attribute use today's date
      if (dateTime == null) {
        let now = new Date();
        dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      }
      log.promptToSetWeight(dateTime);
    });
  }
});

//Check there is a log entry for "today" when the app starts
window.addEventListener("appInitialized", function() {
  let now = new Date();
  let today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  log.getEntry(today)
  .then(function(entry) {
      if (entry == undefined) {
        log.putEntry(today, entry);
      }
  });
});
