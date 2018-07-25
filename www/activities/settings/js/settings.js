var settings = {

  save : function(control)
  {
    app.storage.setItem(control.id, control.checked);
  },

  load : function()
  {
    var switches = $("#settings-page ons-switch");

    for (i = 0; i < switches.length; i++)
    {
      switches[i].checked = app.storage.getItem(switches[i].id);
    }
  }
}

$(document).on("show", "#settings-page", function(e){
  settings.load();
});
