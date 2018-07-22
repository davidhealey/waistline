var statistics = {

  timestamps:[],
  weights:[],
  nutrition:{},

  gatherData : function()
  {
    return new Promise(function(resolve, reject){
      var now = new Date()
      var fromDate = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + (now.getDate()-1));
      var toDate = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + (now.getDate()+1)); //Tomorrow at midnight

      var range = $("#statistics #nutritionAndWeight #range").val();
      range == 7 ? fromDate.setDate(fromDate.getDate()-7) : fromDate.setMonth(fromDate.getMonth()-range);

      dbHandler.getObjectStore("log").openCursor(IDBKeyRange.bound(fromDate, toDate)).onsuccess = function(e)
      {
        var cursor = e.target.result;

        if (cursor)
        {
          statistics.timestamps.push(cursor.value.dateTime.toLocaleDateString()); //Use date as labels for charts
          statistics.weights.push(cursor.value.weight);

          //Store nutition data by nutrition type (calories, fat, protein, etc.)
          for (k in cursor.value.nutrition)
          {
            statistics.nutrition[k] = statistics.nutrition[k] || [];
            statistics.nutrition[k].push(cursor.value.nutrition[k]);
          }

          cursor.continue();
        }
        else
        {
          resolve();
        }
      };
    });
  },

  renderCharts : function()
  {
    var tableData = {"labels":statistics.timestamps, "datasets":[]};

    var chartType;
    $("#statistics #nutritionAndWeight #range").val() == 7 ? chartType = "bar" : chartType = "line";

    //Organise datasets for charts
    var dataset = {};
    var colours = ["rgba(171,115,131,0.6)", "rgba(198,159,168,0.6)", "rgba(144,72,96,0.6)"];
    var i = 0; //Used to pick colour for chart

    for (k in statistics.nutrition)
    {
      i = (i + 1) % 3; //Get colours array index
      dataset = {};
      dataset.label = k;
      dataset.data = statistics.nutrition[k];
      dataset.backgroundColor = colours[i];
      k == "calories" ? dataset.hidden = false : dataset.hidden = true; //Default display is calories
      tableData.datasets.push(dataset); //Add dataset to table data
    }

    //Draw chart
    Chart.defaults.global.defaultFontSize = 14; //Set font size
    var ctx = $("#nutritionAndWeight canvas");
    var chart = new Chart(ctx, {
      type:chartType,
      data:tableData
    });
  },

  renderWeightLog : function()
  {
    var html = "";

    for (var i = 0; i < statistics.timestamps.length; i++)
    {
      //Skip dates where no weight or calories was recorded
      if (isNaN(statistics.weights[i]) || isNaN(statistics.nutrition.calories[i])) continue;

      html += "<ons-list-item>";
      html += "<h4>"+statistics.timestamps[i]+"</h4>";
      html += "<p>"+statistics.weights[i]+" kg</p>";
      html += "<p>"+statistics.nutrition.calories[i]+" Calories</p>";
      html += "</ons-list-item>";
    }

    $("#statistics #nutritionAndWeight #weightLog ons-list").html(html);
  },

  renderDiaryStats : function()
  {
    var now = new Date();
    var dateTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate());

    //Get diary stats for today
    diary.getStats(dateTime, function(data) {

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
          html += "<h2 style='text-align:center;'>"+g.charAt(0).toUpperCase() + g.slice(1)+"</h2>";
          html += "<ons-row>";
          html += "<ons-col width='33%' style='text-align:center;'>Target</ons-col>"
          html += "<ons-col width='33%' style='text-align:center;'>Used</ons-col>"
          html += "<ons-col width='33%' style='text-align:center;'>Remaining</ons-col>"
          html += "</ons-row>";
          html += "<ons-row>";
          html += "<ons-col width='33%' style='text-align:center;'>"+data.goals[g]+"</ons-col>";
          html += "<ons-col width='33%' style='text-align:center;'>"+data.nutrition[g]+"</ons-col>";
          html += "<ons-col width='33%' style='text-align:center; color:"+colour+";'>"+data.remaining[g]+"</ons-col>";
          html += "</ons-row>";
          html += "</ons-carousel-item>";
        }

        html += "</ons-carousel>";

        $("#statistics #diaryStats div").html(html);
      }
    });
  }
}

$(document).on("show", "ons-page#statistics", function(e){
  statistics.renderDiaryStats();
  statistics.gatherData()
  .then(function(){
    statistics.renderCharts();
    statistics.renderWeightLog();
  });
});

$(document).on("change", "#statistics #nutritionAndWeight #range", function(e){
  statistics.gatherData();
  statistics.renderCharts();
  statistics.renderWeightLog();
})
