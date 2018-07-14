var goals = {

  fillNutritionForm : function(data)
  {
    //Capitalize ID and use as toolbar title
    $("#nutrition ons-toolbar .center").html(data.id.charAt(0).toUpperCase() + data.id.slice(1));
    $("#edit-nutrition-form #name").val(data.id);
  },

  updateNutrition : function()
  {
    var goals = $("#edit-nutrition-form ons-input");

    console.log($("#edit-nutrition-form #name").val());

    nav.popPage();
  },
};


$(document).on("tap", "#goals-list .nutrition", function(e) {

  var id = $(this).attr("id");
  var data = {"id":id};

  nav.pushPage("activities/goals/views/nutrition.html", {"data":data})
    .then(function() {goals.fillNutritionForm(data)});
});

$(document).on("tap", "#nutrition #submit", function(e) {
  $("#nutrition #edit-nutrition-form").submit();
});
