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
}

$(document).on("show", "ons-page#statistics", function(e){
  statistics.renderCharts();
});
