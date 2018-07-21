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

    dbHandler.getObjectStore("log").openCursor(IDBKeyRange.bound(fromDate, toDate)).onsuccess = function(e)
    {
      var cursor = e.target.result;

      if (cursor)
      {
        cursor.continue();
      }
      else
      {
      }
    };
  },

  renderDiaryStats : function()
  {
    var now = new Date();
    var dateTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate());

    //Get diary stats for today
    diary.getStats(dateTime, function(data) {

      var html = "<ons-carousel swipeable auto-scroll auto-refresh>";

      //Sort goals alphabetically
      var goals = {};
      Object.keys(data.goals).sort().forEach(function(key) {
        goals[key] = data.goals[key];
      });

      for (g in goals)
      {
        html += "<ons-carousel-item>";
        html += "<h2 style='text-align:center;'>"+g+"</h2>";
        html += "<ons-row>";
        html += "<ons-col width='33%' style='text-align:center;'>Goal</ons-col>"
        html += "<ons-col width='33%' style='text-align:center;'>Used</ons-col>"
        html += "<ons-col width='33%' style='text-align:center;'>Remaining</ons-col>"
        html += "</ons-row>";
        html += "<ons-row>";
        html += "<ons-col width='33%' style='text-align:center;'>"+data.goals[g]+"</ons-col>";
        html += "<ons-col width='33%' style='text-align:center;'>"+data.nutrition[g]+"</ons-col>";
        html += "<ons-col width='33%' style='text-align:center;'>"+data.remaining[g]+"</ons-col>";
        html += "</ons-row>";
        html += "</ons-carousel-item>";
      }

      html += "</ons-carousel>";

      $("#statistics #diaryStats").html(html);
    });
  }
}

$(document).on("show", "ons-page#statistics", function(e){
  statistics.renderCharts();
  statistics.renderDiaryStats();
});
