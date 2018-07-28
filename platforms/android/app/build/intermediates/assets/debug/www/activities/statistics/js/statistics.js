var statistics = {

  gatherData : function()
  {
    return new Promise(function(resolve, reject){

      var now = new Date()
      var fromDate = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + (now.getDate()-1));
      var toDate = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + (now.getDate()+1)); //Tomorrow at midnight

      var range = $("#statistics #range").val();
      range == 7 ? fromDate.setDate(fromDate.getDate()-7) : fromDate.setMonth(fromDate.getMonth()-range);

      var data = {"timestamps":[], "nutrition":{}, "weight":[]};
      dbHandler.getObjectStore("log").openCursor(IDBKeyRange.bound(fromDate, toDate)).onsuccess = function(e)
      {
        var cursor = e.target.result;

        if (cursor)
        {
          if (cursor.value.nutrition != undefined && cursor.value.nutrition.calories != undefined)
          {
            data.timestamps.push(cursor.value.dateTime); //Use date as labels for charts
            data.weight.push(cursor.value.weight);

            //Store nutition data by nutrition type (calories, fat, protein, etc.)
            for (k in cursor.value.nutrition)
            {
              data.nutrition[k] = data.nutrition[k] || [];
              data.nutrition[k].push(cursor.value.nutrition[k]);
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
    var dataset = {};

    for (k in data.nutrition)
    {
      dataset = {};
      dataset.label = app.strings[k];
      dataset.data = data.nutrition[k];
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
      console.log(data.timestamps[i]);
      html = "";
      html += "<ons-list-item tappable timestamp='"+data.timestamps[i].toISOString()+"'>";
      html += "<div>";
      html += "<h4>"+data.timestamps[i].toLocaleDateString()+"</h4>";
      html += "<p>"+data.weight[i]+" kg</p>";
      if (data.nutrition.calories[i] !== undefined) html += "<p>"+Math.round(data.nutrition.calories[i])+" " + app.strings["calories"]+"</p>";
      html += "</div>";
      html += "</ons-list-item>";
      $("#statistics #weightLog").prepend(html); //Add to list, reverse order
    }
  },

  renderDiaryStats : function()
  {
    var now = new Date();
    var dateTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate());

    //Get diary stats for today
    diary.getStats(dateTime)
    .then(function(data) {

      if (data.goals && data.nutrition && data.remaining) //Safety check
      {
        var colour = "";
        var html = "<ons-carousel swipeable auto-scroll auto-refresh>";

        //Sort goals alphabetically
        var goals = {};
        Object.keys(data.goals).sort().forEach(function(key) {
          goals[key] = data.goals[key];
        });

        for (g in goals)
        {
          if (g == "weight") continue; //Weight is handled separately

          //Set colour for remaining text
          data.nutrition[g] < data.goals[g] ? colour = "green" : colour = "red";

          //For calories the colour is flipped if the user checked the gain weight option
          if (g == "calories" && goals.weight.gain == true)
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
  statistics.renderDiaryStats();
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

$(document).on("tap", "#statistics #weightLog ons-list-item", function(e){
  var timestamp = new Date($(this).attr("timestamp"));
  diary.recordWeight(timestamp)
  .then(function(){
    statistics.gatherData()
    .then(data => statistics.renderWeightLog(data));
  });
});
