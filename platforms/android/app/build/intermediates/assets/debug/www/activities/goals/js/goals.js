var goals = {

  data: {}, //Data object to be stored in local storage as JSON string

  setDefaults : function() //Set stored goals to default
  {
    var types = ["weight", "calories", "protein", "carbs", "fat", "sugar", "salt"];
    var values = [0, 2000, 45, 230, 70, 90, 6]; //Womens RDAs

    for (var i = 0; i < types.length; i++) //Each type
    {
      goals.data[types[i]] = goals.data[types[i]] || {};

      if (types[i] == "weight") continue; //Weight is handled separately

      goals.data[types[i]]["multi"] = true;

      for (j = 0; j < 7; j++) //Each day
      {
        goals.data[types[i]][j] = values[i];
      }
    }

    goals.data.weight = {"target":75, "weekly":0.25, "gain":false}; //Default weight goals

    //Save data in local storage
    app.storage.setItem("goals", JSON.stringify(goals.data));
  },

  fillWeightForm : function()
  {
    goals.data["weight"] = goals.data["weight"] || {"target":"", "weekly":"", "gain":""}; //Create object if it doesn't already exist

    $("#edit-weight-form #target-weight").val(goals.data.weight["target"]);
    $("#edit-weight-form #weekly-weight").val(goals.data.weight["weekly"]);
    $("#edit-weight-form #gain-weight").prop("checked", goals.data.weight["gain"]);
  },

  localizeNutritionForm : function()
  {
    var inputs = $("#nutrition ons-input");

    var placeholder = "";

    for (var i = 0; i < inputs.length; i++)
    {
      placeholder = app.strings["days"][$(inputs[i]).attr("id")];
      $(inputs[i]).attr("placeholder", placeholder);
    }
  },

  processWeightForm : function()
  {
    goals.data.weight["target"] = $("#edit-weight-form #target-weight").val();
    goals.data.weight["weekly"] = $("#edit-weight-form #weekly-weight").val();
    goals.data.weight["gain"] = $("#edit-weight-form #gain-weight").prop("checked");

    //Save data in local storage
    app.storage.setItem("goals", JSON.stringify(goals.data));

    goals.updateLog();

    nav.popPage();
  },

  fillNutritionForm : function(name)
  {
    //Capitalize ID and use as toolbar title
    $("#nutrition ons-toolbar .center").html(name.charAt(0).toUpperCase() + name.slice(1));

    //Set hidden form field for type of goal (calories, fat, sugar, etc.)
    $("#edit-nutrition-form #name").val(name);

    goals.data = JSON.parse(app.storage.getItem("goals")); //Get data from app storage

    var inputs = $("#edit-nutrition-form ons-input"); //User input boxes

    for (var i = 0; i < inputs.length; i++)
    {
      inputs[i].value = goals.data[name][inputs[i].id];
    }

    //Multi goal checkbox
    $("#nutrition #multi-goal").prop("checked", goals.data[name].multi);
  },

  processNutritionForm : function()
  {
    var inputs = $("#edit-nutrition-form ons-input"); //User input boxes
    var name = $("#nutrition #name").val(); //Get goal type (calories, fat, salt, etc)

    for (var i = 0; i < inputs.length; i++)
    {
      goals.data[name][inputs[i].id] = inputs[i].value;
    }

    //Multi goal checkbox
    goals.data[name].multi = $("#nutrition #multi-goal").prop("checked");

    //Save data in local storage
    app.storage.setItem("goals", JSON.stringify(goals.data));

    goals.updateLog();

    nav.popPage();
  },

  //Toggle extra goals based on checkbox value
  toggleExtraNutritionGoals : function()
  {
    $("#nutrition .extra-goal").prop("disabled", $("#nutrition #multi-goal").prop("checked"));
  },

  copyMondayToExtraGoals : function()
  {
    if ($("#nutrition #multi-goal").prop("checked")) { //If multi-goal checkbox is unchecked
      $("#nutrition .extra-goal").val($("#nutrition #1").val());
    }
  },

  updateLog : function(date)
  {
    return new Promise(function(resolve, reject){

      var dateTime = new Date();

      if (date)
      {
        dateTime = date
      }
      else {
        //Store goals (for current day only) in log
        var now = new Date();
        diary.date = app.getDateAtMidnight(now);
      }

      var data = {};

      goals.data = JSON.parse(app.storage.getItem("goals"));

      for (g in goals.data)
      {
        if (g == "weight") continue; //weight is handled separately
        data[g] = data[g] || 0;
        data[g] = goals.data[g][dateTime.getDay()];
      }

      data.weight = goals.data.weight;

      var request = dbHandler.update({"dateTime":dateTime, "goals":data}, "log", dateTime);

      if (request)
      {
        request.onsuccess = function(e){
          resolve();
        }
      }
      else {
        resolve();
      }
    });
  }
};

$(document).on("tap", "#goals-list .nutrition", function(e) {

  var id = $(this).attr("id"); //Id of control is name of goal type (calories, fat, sugar, etc.)

  nav.pushPage("activities/goals/views/nutrition.html")
    .then(function() {goals.fillNutritionForm(id)});
});

$(document).on("show", "ons-page#goals", function(e) {
  goals.data = JSON.parse(app.storage.getItem("goals")); //Pull data from local storage
});

$(document).on("show", "#nutrition", function(e) {
  goals.localizeNutritionForm();
  goals.toggleExtraNutritionGoals();
  goals.copyMondayToExtraGoals();
});

$(document).on("tap", "#nutrition #submit", function(e) {
  $("#nutrition #edit-nutrition-form").submit();
});

//Single/Multi goal checkbox
$(document).on("change", "#nutrition #multi-goal", function(e) {
  goals.toggleExtraNutritionGoals();
  goals.copyMondayToExtraGoals();
});

$(document).on("keyup", "#nutrition #1", function(e) {
  goals.copyMondayToExtraGoals();
});

//Weight form
$(document).on("show", "#weight", function(e) {
  goals.fillWeightForm();
});

$(document).on("tap", "#weight #submit", function(e) {
  $("#weight #edit-weight-form").submit();
});
