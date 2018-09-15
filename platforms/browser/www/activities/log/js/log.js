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
    newDate.getTimezoneOffset() > 0 ? newDate.setMinutes(newDate.getTimezoneOffset()) : newDate.setMinutes(-newDate.getTimezoneOffset());
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
        if (data.goals == undefined) data.goals = JSON.parse(app.storage.getItem("goals"));

        var insertRequest = dbHandler.insert(data, "log");
        insertRequest.onsuccess = function(e) {resolve();}
      }
    });
  },
}
