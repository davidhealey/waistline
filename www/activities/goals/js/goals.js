var goals = {

  data: {}, //Data object to be stored in local storage as JSON string

  fillNutritionForm : function(name)
  {
    //Capitalize ID and use as toolbar title
    $("#nutrition ons-toolbar .center").html(name.charAt(0).toUpperCase() + name.slice(1));
    $("#edit-nutrition-form #name").val(name); //Set hidden form field

    var inputs = $("#edit-nutrition-form ons-input"); //User input boxes

    for (var i = 0; i < inputs.length; i++)
    {
      inputs[i].value = goals.data[name][inputs[i].id];
    }

    $("#nutrition #multi-goal ons-checkbox").prop("checked", goals.data[name].multi);
  },

  updateNutrition : function()
  {
    var inputs = $("#edit-nutrition-form ons-input"); //User input boxes
    var name = $("#nutrition #name").val(); //Get goal type (calories, fat, salt, etc)

    //Create object if it doesn't already exist
    goals.data[name] = goals.data[name] || {"monday":"", "tuesday":"", "wednesday":"", "thursday":"", "friday":"", "saturday":"", "sunday":""};

    for (var i = 0; i < inputs.length; i++)
    {
      goals.data[name][inputs[i].id] = inputs[i].value;
    }

    //Store same goal checkbox value
    goals.data[name].multi = $("#nutrition #multi-goal ons-checkbox").prop("checked");

    //Save data in local storage
    window.localStorage.setItem("goals", JSON.stringify(goals.data)); //Save in local storage

    nav.popPage();
  },

  //Toggle extra goals based on checkbox value
  toggleExtraNutritionGoals : function()
  {
    $("#nutrition .extra-goal").prop("disabled", $("#nutrition #multi-goal ons-checkbox").prop("checked"));
  },

  copyMondayToExtraGoals : function()
  {
    if ($("#nutrition #multi-goal ons-checkbox").prop("checked")) { //If multi-goal checkbox is unchecked
      $("#nutrition .extra-goal").val($("#nutrition #monday").val());
    }
  }
};

$(document).on("tap", "#goals-list .nutrition", function(e) {

  var id = $(this).attr("id");

  nav.pushPage("activities/goals/views/nutrition.html")
    .then(function() {goals.fillNutritionForm(id)});
});

$(document).on("show", "ons-page#goals", function(e) {
  goals.data = JSON.parse(window.localStorage.getItem("goals")); //Pull data from local storage
});

$(document).on("show", "#nutrition", function(e) {
  goals.toggleExtraNutritionGoals();
  goals.copyMondayToExtraGoals();
});

$(document).on("tap", "#nutrition #submit", function(e) {
  $("#nutrition #edit-nutrition-form").submit();
});

//Single/Multi goal checkbox
$(document).on("change", "#nutrition #multi-goal ons-checkbox", function(e) {
  goals.toggleExtraNutritionGoals();
  goals.copyMondayToExtraGoals();
});

$(document).on("change, keyup", "#nutrition #monday", function(e) {
  goals.copyMondayToExtraGoals();
});
