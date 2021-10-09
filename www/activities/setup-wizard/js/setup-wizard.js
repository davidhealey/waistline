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
  pageName: "",

  init: async function() {
    this.getComponents();
    this.bindUIActions();

    if (this.pageName == "setup-wizard-summary")
      this.generateSummary();
  },

  getComponents: function() {
    this.el.next = document.querySelector(".page[data-name='" + this.pageName + "'] #next-setup-page");
    this.el.heightUnit = document.querySelector(".page[data-name='setup-wizard-height'] #height-unit");
    this.el.heightCm = document.querySelector(".page[data-name='setup-wizard-height'] #height-cm");
    this.el.heightCmInput = document.querySelector(".page[data-name='setup-wizard-height'] #height-cm-input");
    this.el.heightFeet = document.querySelector(".page[data-name='setup-wizard-height'] #height-feet");
  },

  bindUIActions: function() {
    const inputs = Array.from(document.querySelectorAll("input:not(.manual-bind), select"));

    inputs.forEach((x, i) => {
      x.addEventListener("keypress", (e) => {
        this.onInputKeypress(e.target);
      });

      x.addEventListener("change", (e) => {
        app.Settings.saveInputs(inputs);
        this.onInputChange(e.target);
      });
    });

    // height-unit 
    if (this.el.heightUnit != undefined) {
      this.el.heightUnit.addEventListener("change", (e) => {
        this.onHeightUnitChange(e.target.value);
      });
    }
  },

  onInputKeypress: function(target) {
    if (target.value == "")
      this.el.next.style.visibility = "hidden";
    else
      this.el.next.style.visibility = "visible";
  },

  onInputChange: function(target) {
    if (target.type != "select")
      this.el.next.style.visibility = "visible";
  },

  onHeightUnitChange: function(value) {
    this.el.heightCm.style.display = "none";
    this.el.heightFeet.style.display = "none";

    if (value == "cm")
      this.el.heightCm.style.display = "block";
    else
      this.el.heightFeet.style.display = "block";

    if (value != "cm" || this.el.heightCmInput.value != "")
      this.el.next.style.visibility = "visible";
    else
      this.el.next.style.visibility = "hidden";
  },

  calculateTDEE: function(height, weight, dob, gender, activity) {
    let modifier;
    gender ? modifier = 5 : modifier = -161;

    let age = this.getAgeFromDOB(dob);
    let activityFactor = this.getActivityFactor(activity, gender);

    return ((height * 6.25) + (weight * 9.99) - (age * 4.92) + modifier) * activityFactor;
  },

  getAgeFromDOB: function(dob) {
    let birthdate = new Date(dob);
    let cur = new Date();
    let diff = cur - birthdate; // This is the difference in milliseconds
    return Math.floor(diff / 31557600000); // Divide by 1000*60*60*24*365.25
  },

  getActivityFactor: function(activity, gender) {
    let result;

    switch (parseInt(activity)) {
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
        gender ? result = 1.9 : result = 1.8;
        break;
    }

    return result;
  },

  generateSummary: function() {

    let data = app.Settings.getField("user");

    let currentWeight = app.Utils.convertUnit(data["current-weight"], data["current-weight-unit"], "kg", false);
    let targetWeight = app.Utils.convertUnit(data["target-weight"], data["target-weight-unit"], "kg", false);
    let height = data["height"][0];

    if (data["height-unit"] == "ft")
      height = data["height"][1];

    let tdee = this.calculateTDEE(height, currentWeight, data["dob"], data["gender"], data["activity-level"]);

    let calorieGoal;

    if (currentWeight > targetWeight)
      calorieGoal = Math.round(tdee - tdee * 0.2);
    else if (currentWeight < targetWeight)
      calorieGoal = Math.round(tdee + tdee * 0.2);
    else
      calorieGoal = Math.round(tdee);

    console.log(data, calorieGoal);
  }
};

document.addEventListener("page:init", function(e) {
  const pageName = e.target.attributes["data-name"].value;

  //All subpages
  if (pageName.indexOf("setup-wizard") != -1) {
    app.SetupWizard.pageName = pageName;
    app.SetupWizard.init();
  }
});