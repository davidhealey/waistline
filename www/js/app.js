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

var app = {

  mode: "development",
  tests:{}, //Object to hold test functions to be run by TinyTest
  strings: {},
  standardUnits: ["ug", "μg", "mg", "g", "kg", "ul", "μl", "ml", "dl", "dL", "cl", "cL", "l", "L"],
  nutriments: ["calories", "proteins", "carbohydrates","fat", "saturated-fat", "monounsaturated-fat", "polyunsaturated-fat", "trans-fat", "omega-3-fat", "cholesterol", "sugars", "fiber", "sodium", "salt", "potassium","vitamin-a", "vitamin-d", "vitamin-e", "vitamin-k", "vitamin-c", "vitamin-b1", "vitamin-b2", "vitamin-b6", "vitamin-b9", "vitamin-b12", "chloride", "calcium", "iron", "magnesium", "zinc", "caffeine", "alcohol", "sucrose", "glucose", "fructose", "lactose"],
  nutrimentUnits: {
    "calories":"kcal",
    "cholesterol":"mg",
    "sodium":"mg",
    "potassium":"mg",
    "calcium":"mg",
    "iron":"mg",
    "magnesium":"mg",
    "zinc":"mg",
    "caffeine":"g",
    "alcohol":"%",
    "vitamin-a":"µg",
    "vitamin-d":"µg",
    "vitamin-e":"mg",
    "vitamin-k":"µg",
    "vitamin-c":"mg",
    "vitamin-b1":"mg",
    "vitamin-b2":"mg",
    "vitamin-b6":"g",
    "vitamin-b9":"µg",
    "vitamin-b12":"µg"
  },

  // Application Constructor
  initialize: function() {

    //Set some default settings
    if (window.localStorage.getItem("goals") == undefined) goals.setDefaultGoals(); //Goals
    if (window.localStorage.getItem("weight") == undefined) window.localStorage.setItem("weight", 70); //Weight
    if (window.localStorage.getItem("meal-names") == undefined) window.localStorage.setItem("meal-names", JSON.stringify(["Breakfast", "Lunch", "Dinner", "Snacks"])); //Meal names

  return new Promise(function(resolve, reject){
      dbHandler.initializeDb() //db-handler initialization
      .then(function() {
        //Add appInitialized event
        let event = new CustomEvent("appInitialized");
        window.dispatchEvent(event);
        resolve();
      });
    });
  },

  getDateAtMidnight : function()
  {
    // use UTC midnight of the current day for the diary
    var now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  },

  validateInputs: function(inputs) {

    let messages = [];

    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      if (input.hasAttribute("required")) {
        if (input.value == null || input.value == ""){
          messages.push(input.getAttribute("name"));
        }
      }
    }

    if (messages.length > 0) return messages;
    return true;
  }
};

ons.ready(function() {
  app.initialize()
  .then(function(){
    console.log("App Initialized");
    nav.resetToPage("src/activities/goals/views/goals.html")
    .then(function(){
      if (app.mode == "development") {
        TinyTest.run(app.tests); //Run tests
      }
    });
  });
});
