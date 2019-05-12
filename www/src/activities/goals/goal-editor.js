/*
  Copyright 2018, 2019 David Healey

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

var goalEditor = {

  open: function(listItem) {
    nav.pushPage("src/activities/goals/views/goal-editor.html")
    .then(function() {

      //Get goal type - weight, calories, carbs, etc.
      goalEditor.type = listItem.srcElement.closest("ons-list-item").id;

      //Set editor title
      document.querySelector('#goal-editor #title').innerText = goalEditor.type.charAt(0).toUpperCase() + goalEditor.type.slice(1);

      //Show weight or nutrition goals depending on type - both are hidden by default
      if (goalEditor.type == "weight")
        document.querySelector('#goal-editor #weight-goals').style.display = "block";
      else
        document.querySelector('#goal-editor #nutrition-goals').style.display = "block";

      //Load up goal editor
      goalEditor.load();
    });
  },

  changeGoalMode: function(mode) {
    if (typeof mode != "string") mode = this.getAttribute("input-id");

    document.querySelector('#goal-editor #daily-goal').style.display = "none";
    document.querySelector('#goal-editor #weekly-goal').style.display = "none";
    document.querySelector("#goal-editor #" + mode + "-goal").style.display = "block";
    document.querySelector("#goal-editor #" + mode + "-mode").checked = true;
  },

  changeDailyGoal: function() {

    if (document.querySelector('#goal-editor #multi-goal').checked) {
      let inputs = document.querySelectorAll('#goal-editor .daily');
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = this.value;
      }
    }
  },

  toggleSameGoal: function() {

    let state = document.querySelector('#goal-editor #multi-goal').checked;

    let inputs = document.querySelectorAll('#goal-editor .daily');
    for (let i = 0; i < inputs.length; i++) {
      if (state) inputs[i].value = inputs[0].value;

      if (i > 0) {
        if (state)
          inputs[i].setAttribute("disabled", "disabled");
        else
          inputs[i].removeAttribute("disabled");
      }
    }
  },

  load: function() {
    let data = JSON.parse(window.localStorage.getItem("goals")); //Get existing goals from local storage
    let type = goalEditor.type; //Type of goal - weight, calories, etc.
    let mode = "daily"; if (data[type] && data[type].mode) mode = data[type].mode;

    if (type == "weight") {
      if (data && data.weight && data.weight.target) {
        document.querySelector('#goal-editor #weight').value = data.weight.target;
      }
    }
    else {
      //Show/Hide daily/weekly goal inputs
      goalEditor.changeGoalMode(mode);

      if (data && data[type]) {
        //Restore input values from data
        let inputs = document.querySelectorAll('#goal-editor ons-input');
        for (let i = 0; i < inputs.length; i++) {
          if (!data[type]) continue;
          inputs[i].value = data[type][inputs[i].id] || 0;
        }

        //Multi goal switch
        document.querySelector('#goal-editor #multi-goal').checked = data[type].multi;
        goalEditor.toggleSameGoal();

        //Show in diary switch
        document.querySelector('#goal-editor #diary-display').checked = data[type].diaryDisplay;
      }
    }
  },

  save: function() {

    let data = JSON.parse(window.localStorage.getItem("goals")); //Get existing goals from local storage
    let type = goalEditor.type; //Type of goal - weight, calories, etc.

    if (type == "weight") {
      data.weight = data.weight || {target:0, weekly:0, gain:false};
      data.weight.target = document.querySelector('#goal-editor #weight').value; //Only target is currently implemented
    }
    else {
      let inputs = document.querySelectorAll('#goal-editor ons-input');
      for (let i = 0; i < inputs.length; i++) {
        data[type] = data[type] || {};
        data[type][inputs[i].id] = Number(inputs[i].value);
      }

      //Multi goal switch
      data[type].multi = document.querySelector('#goal-editor #multi-goal').checked;

      //Show in diary switch
      data[type].diaryDisplay = document.querySelector('#goal-editor #diary-display').checked;

      //Daily/Weekly radio buttons
      if (document.querySelector('#goal-editor #daily-mode').checked)
        data[type].mode = "daily";
      else
        data[type].mode = "weekly";
    }

    //Save data to local storage
    window.localStorage.setItem("goals", JSON.stringify(data));

    //Go back to previous page
    nav.popPage();
  },

};

//Page initialization
document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#goal-editor')) {

    //Daily goal - Monday's input box
    let monday = document.querySelector('#goal-editor .daily');
    monday.addEventListener("keyup", goalEditor.changeDailyGoal);

    //Same daily goal checkbox
    document.querySelector('#goal-editor #multi-goal').addEventListener("change", goalEditor.toggleSameGoal);

    //Goal mode radio buttons
    let radios = document.querySelectorAll('#goal-editor ons-radio');
    for (let i = 0; i < radios.length; i++) {
      radios[i].addEventListener("change", goalEditor.changeGoalMode);
    }

    //Submit button
    document.querySelector('#goal-editor #submit').addEventListener("tap", goalEditor.save);
  }
});
