/*
  Copyright 2018 David Healey

  This file is part of Waistline.

  Waistline is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Waistline is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Waistline.  If not, see <http://www.gnu.org/licenses/>.
*/

var userguide = {

  localize : function()
  {
    var sections = $("#userguide ons-carousel-item");

    for (var s = 0; s < sections.length; s++) //Each section
    {
      $("#"+sections[s].id + " h3").html(app.strings["user-guide"][sections[s].id]["title"]);

      var para = $("#userguide ons-carousel-item#"+sections[s].id + " p");

      for (var p = 0; p < para.length; p++) //Each paragraph
      {
        $("#"+sections[s].id + " #p"+(p+1)).html(app.strings["user-guide"][sections[s].id][para[p].id]);
        //console.log(sections[s].id + " - " + p);
      }
    }
  }

}

$(document).on("init", "ons-page#userguide", function(e){
  userguide.localize();
});
