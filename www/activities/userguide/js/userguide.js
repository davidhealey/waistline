var userguide = {

  localize : function()
  {
    var sections = $("#userguide ons-carousel-item");
    var para = $("#userguide ons-carousel-item p");

    for (var s = 0; s < sections.length; s++) //Each section
    {
      console.log(sections[s].id);
      $("#"+sections[s].id + " h3").html(app.strings["user-guide"][sections[s].id]["title"]);

      for (var p = 0; p < para.length; p++) //Each paragraph
      {
        $("#"+sections[s].id + " p").html(app.strings["user-guide"][sections[s].id][para[p].id]);
      }
    }
  }

}

$(document).on("init", "ons-page#userguide", function(e){
  userguide.localize();
});
