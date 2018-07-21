var statistics = {

  renderCharts : function()
  {
    var range = $("#statistics #range").val();
    var now = new Date()
    var fromDate = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + (now.getDate()-1));
    var toDate = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + (now.getDate()+1)); //Tomorrow at midnight

    if (range == 7) //1 week
    {
      fromDate.setDate(fromDate.getDate()-7)
    }
    else
    {
      fromDate.setMonth(fromDate.getMonth()-range);
    }

    var dates = [];
    var weights = [];
    var calories = [];
    var html = "";

    var tableData = {"labels":[], "datasets":[]};
    var data = {};

    dbHandler.getObjectStore("log").openCursor(IDBKeyRange.bound(fromDate, toDate)).onsuccess = function(e)
    {
      var cursor = e.target.result;

      if (cursor)
      {
        tableData.labels.push(cursor.value.dateTime.toLocaleDateString()); //Use date as labels for charts

        //Store nutition data by nutrition type (calories, fat, protein, etc.)
        for (k in cursor.value.nutrition)
        {
          data[k] = data[k] || [];
          data[k].push(cursor.value.nutrition[k]);
        }

        cursor.continue();
      }
      else
      {
        //Organise datasets for charts
        var dataset = {};

        for (k in data)
        {
          dataset = {};
          dataset.label = k;
          dataset.data = data[k];
          dataset.backgrounColor = "rgba(255,13,0,0.4)";
          k == "calories" ? dataset.hidden = false : dataset.hidden = true; //Default display is calories
          tableData.datasets.push(dataset); //Add dataset to table data
        }
console.log(tableData);
        //Draw chart
        var ctx = $("#nutrition canvas");
        var weightChart = new Chart(ctx, {
          type:"line",
          data:tableData
        });
      }
    };
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
          html += "<ons-col width='33%' style='text-align:center;'>Goal</ons-col>"
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

        $("#statistics #diaryStats").html(html);
      }
    });
  }
}

$(document).on("show", "ons-page#statistics", function(e){
  statistics.renderCharts();
  statistics.renderDiaryStats();
});
