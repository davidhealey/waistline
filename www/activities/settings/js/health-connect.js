/*
  Copyright 2021 David Healey

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
  along with app.  If not, see <http://www.gnu.org/licenses/>.
*/

app.HealthConnect = {

    el: {},
  
    init: async function() {
      this.getComponents();
      this.bindUIActions();
      this.toggleVisibility();
    },
  
    getComponents: function() {
      this.el.disabledList = document.querySelector(".page[data-name='settings-health-connect'] #health-connect-settings-disabled");
      this.el.enabledList = document.querySelector(".page[data-name='settings-health-connect'] #health-connect-settings-enabled");
    },
  
    bindUIActions: function() {
    },

    toggleVisibility: function() {
        if (app.Settings.get("healthConnect", "enabled")) {
            this.el.enabledList.style.display = "block"
            this.el.disabledList.style.display = "none"
        } else {
            this.el.disabledList.style.display = "block"
            this.el.enabledList.style.display = "none"
        }
    },
  };
  
  document.addEventListener("page:init", function(e) {
    app.HealthConnect.init();
  });