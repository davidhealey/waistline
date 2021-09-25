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

app.SetupWizard = {

  el: {},

  init: async function() {},

  getComponents: function() {},

  bindUIActions: function() {},

  calculateTDEE: function(height, weight, dob, gender, activity) {
    let modifier;
    gender ? modifier = 5 : modifier = -161;

    let age = getAgeFromDOB(dob);

    let activityFactor = getActivityFactor(activity, gender);

    return ((height * 6.25) + (weight * 9.99) - (age * 4.92) + modifier) * activityFactor;
  },

  getAgeFromDOB: function(dob) {
    let birthdate = new Date(dob);
    let cur = new Date();
    let diff = cur - birthdate; // This is the difference in milliseconds
    let age = Math.floor(diff / 31557600000); // Divide by 1000*60*60*24*365.25
    return age;
  },

  getActivityFactor: function(activity, gender) {
    let result;

    switch (activity) {
      case 0:
        gender ? result = 1.2 : result = 1.1;
        break;
      case 1:
        gender ? result = 1.375 : result = 1.275;
        break;
      case 2:
        gender ? result = 1.55 : result = 1.35;
        break;
      case 3:
        gender ? result = 1.725 : result = 1.525;
        break;
      case 4:
        result = 1.9;
        break;
    }

    return result;
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='setup-wizard-0']")) {
    app.SetupWizard.init();
  }
});