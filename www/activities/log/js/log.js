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
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()); //Discard any time data
  },

  //Returns request to log for the given date
  getRequest : function(date)
  {
    var dateTime = log._getDate(date);
    return dbHandler.getItem(dateTime, "log");
  },

  setWeight : function(date, weight)
  {
    return new Promise(function(resolve, reject){
      var request = log.getRequest(date);

      request.onsuccess = function(e){

        var data = e.target.result || {}; //Get existing object or create new one

        data.dateTime = log._getDate(date); //Get date without time
        data.weight = weight;

        dbHandler.update(data, "log", data.dateTime) //Add/update log entry
        .then(function(){
          console.log("Log updated");
          resolve();
        });
      }
    });
  },

}
