/*
  Copyright 2018 David Healey

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

  //Private function. Returns date with time data discarded
  _getDate(date)
  {
    var newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); //Discard any time data
    newDate.setHours(-newDate.getTimezoneOffset()/60, 0, 0, 0);
    return newDate
  },

  //Prompt the user to input a weight to record in the log
  promptToSetWeight : function(date)
  {
    return new Promise(function(resolve, reject){

      var lastWeight = app.storage.getItem("weight") || ""; //Get last recorded weight, if any

      //Show prompt
      ons.notification.prompt(app.strings["diary"]["current-weight"]+" (kg)", {"title":app.strings["weight"], "inputType":"number", "defaultValue":lastWeight, "cancelable":true})
      .then(function(input)
      {
        if (!isNaN(parseFloat(input)))
        {
          app.storage.setItem("weight", input);
          log.update(date, "weight", input)
          .then(function(){resolve();});
        }
      });
    });
  },

  //Update the data in the log for the given day.
  //Key can be weight, nutrition, goals, and value should corrospond to this
  update : function(date, key, value)
  {
    var timestamp = log._getDate(date);

    return new Promise(function(resolve, reject){
      var request = dbHandler.getItem(timestamp, "log");

      request.onsuccess = function(e){

        var data = e.target.result || {}; //Get existing object or create new one

        data.dateTime = timestamp;
        data[key] = value;

        //Fill in default values if no values are set
        if (data.weight == undefined) data.weight = app.storage.getItem("weight");
        if (data.goals == undefined) data.goals = goals.getGoalsForDay(timestamp.getDay());

        var insertRequest = dbHandler.insert(data, "log");
        insertRequest.onsuccess = function(e) {resolve();}
      }
    });
  },

  //Returns log data for the given date
  getData : function(date)
  {
    var timestamp = log._getDate(date);

    return new Promise(function(resolve, reject){
      var request = dbHandler.getItem(timestamp, "log");

      request.onsuccess = function(e){
        if (e.target.result)
        {
          var data = e.target.result;

          data.remaining = {};

          for (g in data.goals) //Each goal
          {
            data.nutrition = data.nutrition || {};
            if (data.nutrition[g] == undefined) data.nutrition[g] = 0; //If there is no consumption data default to 0
            data.remaining[g] = data.goals[g] - data.nutrition[g]; //Subtract nutrition from goal to get remining
          }
          resolve(data);
        }
        else {
          reject();
        }
      }
    });
  }
}
