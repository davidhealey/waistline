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

var statistics = {

  gatherData : function()
  {
    return new Promise(function(resolve, reject){

      //Today at midnight
      var fromDate = new Date();
      fromDate.setHours(0, 0, 0, 0);

      var toDate = new Date(fromDate);
      toDate.setHours(toDate.getHours()+24, toDate.getMinutes()-1); //1 minute to next day

      var range = $("#statistics #range").val();
      range == 7 ? fromDate.setDate(fromDate.getDate()-6) : fromDate.setMonth(fromDate.getMonth()-range);

      var data = {"timestamps":[], "nutrition":{}, "weight":[]};
      dbHandler.getObjectStore("log").openCursor(IDBKeyRange.bound(fromDate, toDate)).onsuccess = function(e)
      {
        var cursor = e.target.result;

        if (cursor)
        {
          if (cursor.value.nutrition != undefined && cursor.value.nutrition.calories != undefined)
          {
            var date = new Date(cursor.value.dateTime.getUTCFullYear(), cursor.value.dateTime.getUTCMonth(), cursor.value.dateTime.getUTCDate()); //Get date, ignoring time

            if (data.timestamps.map(Number).indexOf(+date) == -1) //Ignore duplicate log entries (although there shouldn't be any)
            {
              data.timestamps.push(date); //Use date as labels for charts
              data.weight.push(cursor.value.weight);

              //Store nutition data by nutrition type (calories, fat, protein, etc.)
              for (k in cursor.value.nutrition)
              {
                data.nutrition[k] = data.nutrition[k] || [];
                data.nutrition[k].push(cursor.value.nutrition[k]);
              }
            }
          }
          cursor.continue();
        }
        else
        {
          resolve(data);
        }
      };
    });
  },

  renderChart : function(data)
  {
    var chartType;
    $("#statistics #range").val() == 7 ? chartType = "bar" : chartType = "line";

    var labels = [];
    for (var i = 0; i < data.timestamps.length; i++)
    {
      labels.push(data.timestamps[i].toLocaleDateString());
    }

    var chartData = {"labels":labels, "datasets":[]};
    var colours = ["rgba(255, 153, 51, 0.5)", "rgba(102, 102, 255, 0.5)", "rgba(255, 102, 0, 0.5)", "rgba(51, 153, 255, 0.5)", "rgba(255, 102, 102, 0.5)", "rgba(51, 204, 255, 0.5)", "rgba(255, 80, 80, 0.5)"];
    var dataset = {};
    var c = 0; //Counter to select label colour

    for (k in data.nutrition)
    {
      c = (c + 1) % colours.length;
      dataset = {};
      dataset.label = app.strings[k];
      dataset.data = data.nutrition[k];
      dataset.backgroundColor = colours[c];
      if (k !== "calories") dataset.hidden = true;
      chartData.datasets.push(dataset);
    }

    //Add weight dataset, but only if there is a calories dataset
    if (data.nutrition.calories) chartData.datasets.push({"label":app.strings["weight"], "data":data.weight, "hidden":true});

    Chart.defaults.global.defaultFontSize = 16; //Set font size
    var ctx = $("#statistics #chart canvas");
    var chart = new Chart(ctx, {
      type:chartType,
      data:chartData,
      options:{}
    });
  },

  renderWeightLog : function(data)
  {
    var html = "";
    $("#statistics #weightLog").html(html); //Clear list

    for (var i = 0; i < data.timestamps.length; i++)
    {
      html = "";
      html += "<ons-list-item tappable timestamp='"+data.timestamps[i].toISOString()+"'>";
      html += "<ons-row>"+ data.timestamps[i].toLocaleDateString() + " - " + data.weight[i] + " kg" +"</ons-row>";
      html += "<ons-row style='color:#636363;'><i>";
      if (data.nutrition.calories[i] != undefined) html += data.nutrition.calories[i].toFixed(0) + " " + app.strings["calories"];
      html += "</i></ons-row>";
      html += "</ons-list-item>";
      $("#statistics #weightLog").prepend(html); //Add to list, reverse order
    }
  },

  renderDailyLog : function()
  {
    var dateTime = new Date();
    dateTime.getTimezoneOffset() > 0 ? dateTime.setMinutes(dateTime.getTimezoneOffset()) : dateTime.setMinutes(-dateTime.getTimezoneOffset());

    //Get diary stats for today
    log._getData(dateTime)
    .then(function(data) {

      if (data.goals && data.nutrition && data.remaining) //Safety check
      {
        var colour = "";
        var html = "<ons-carousel swipeable auto-scroll auto-refresh>";

        for (g in data.goals)
        {
          if (g == "weight") continue; //Weight is handled separately

          //Set colour for remaining text
          data.nutrition[g] < data.goals[g] ? colour = "green" : colour = "red";

          //For calories the colour is flipped if the user checked the gain weight option
          if (g == "calories" && data.goals.weight.gain == true)
          {
            data.nutrition[g] > data.goals[g] ? colour = "green" : colour = "red";
          }

          html += "<ons-carousel-item>";
          html += "<h2 style='text-align:center;'>"+app.strings[g]+"</h2>";
          html += "<ons-row>";
          html += "<ons-col width='33%' style='text-align:center;'>"+app.strings["statistics"]["goal"]+"</ons-col>"
          html += "<ons-col width='33%' style='text-align:center;'>"+app.strings["statistics"]["used"]+"</ons-col>"
          html += "<ons-col width='33%' style='text-align:center;'>"+app.strings["statistics"]["remaining"]+"</ons-col>"
          html += "</ons-row>";
          html += "<ons-row>";
          html += "<ons-col width='33%' style='text-align:center;'>"+data.goals[g]+"</ons-col>";
          html += "<ons-col width='33%' style='text-align:center;'>"+Math.round(data.nutrition[g])+"</ons-col>";
          html += "<ons-col width='33%' style='text-align:center; color:"+colour+";'>"+Math.round(data.remaining[g])+"</ons-col>";
          html += "</ons-row>";
          html += "</ons-carousel-item>";
        }
        html += "</ons-carousel>";

        $("#statistics #diaryStats div").html(html);
      }
    });
  }
}

$(document).on("show", "#statistics", function(e){
  statistics.renderDailyLog();
  statistics.gatherData()
  .then(function(data){
    statistics.renderChart(data);
    statistics.renderWeightLog(data);
  });
});

$(document).on("change", "#statistics #range", function(e){
  statistics.gatherData()
  .then(function(data){
    statistics.renderChart(data);
    statistics.renderWeightLog(data);
  });
});

$(document).on("click", "#statistics #weightLog ons-list-item", function(e){
  var timestamp = new Date($(this).attr("timestamp"));

  log.promptToSetWeight(timestamp)
  .then(function(){
    statistics.gatherData()
    .then(data => statistics.renderWeightLog(data)); //Update stats display
  });
});
