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

var foodsMealsRecipes = {

  getFromDB: function(store, sort) {
    return new Promise(function(resolve, reject) {

      let list = [];

      if (sort == "alpha")
        dbHandler.getIndex("name", store).openCursor(null).onsuccess = processResult; //Sort foods alphabetically
      else
        dbHandler.getIndex("dateTime", store).openCursor(null, "prev").onsuccess = processResult; //Sort foods by date

      function processResult(e)
      {
        var cursor = e.target.result;

        if (cursor) {
          list.push(cursor.value);
          cursor.continue();
        }
        else {
          resolve(list);
        }
      }
    });
  },

  setFilter : function(term, listCopy) {

    let list = listCopy;

    if (term != "") {
      let exp = new RegExp(term, "i");

      //Filter by name and brand
      list = list.filter(function (el) {
        if (el.name && el.brand)
          return el.name.match(exp) || el.brand.match(exp);
        else if (el.name)
          return el.name.match(exp);
        else
          return false;
      });
    }
    return list; //Replace master copy with filtered list
  },

  returnItems: function(items) {
    if (nav.pages.length == 1) {//No previous page - default to diary
      //Ask the user to select the meal category
      ons.openActionSheet({
        title: 'What meal is this?',
        cancelable: true,
        buttons: JSON.parse(window.localStorage.getItem("meal-names"))
      })
      .then(function(input){
        if (input != -1)
          nav.resetToPage("src/activities/diary/views/diary.html", {"data":{"items":items, "category":input}}); //Switch to diary page and pass data
      });
    }
    else {
      nav.popPage({"data":{"items":items}}); //Go back to previous page and pass data along
    }
  },

  sortingOptions: function(caller) {

    return new Promise(function(resolve, reject) {
      let settings = JSON.parse(window.localStorage.getItem("settings")) || {}; //Get settings object

      ons.createElement('src/activities/foods-meals-recipes/views/sort-options.html', {append:true}) //Load dialog from file
      .then(function(dialog) {

        dialog.show();

        dialog.addEventListener("postshow", function() {
          let option = settings[caller].sort;
          document.querySelector("#sort-options #"+ option).checked = true;

          //If existing setting, set it in the dialog
          if (settings && settings[caller] && settings[caller].sort) {
            let option = settings[caller].sort;
            document.querySelector("#sort-options #"+ option).checked = true;
          }

          //Attach event handlers to dialog buttons
          dialog.querySelector('#sort-options #cancel').addEventListener("tap", function cancel() {dialog.hide();}); //Cancel button
          dialog.querySelector('#sort-options #ok').addEventListener("tap", saveSortSetting); //Ok button
        });

        //Remove from DOM on hide
        dialog.addEventListener("posthide", function() {
          dialog.querySelector('#sort-options #cancel').removeEventListener("tap", cancel);
          dialog.querySelector('#sort-options #ok').removeEventListener("tap", saveSortSetting);
          dialog.parentNode.removeChild(dialog);
          resolve();
        });

        //Save selected setting in localStorage
        function saveSortSetting() {
          let option = document.querySelector('#sort-options input[name="sorting"]:checked').id; //Get the selected radio button
          settings[caller] = settings[caller] || {};
          settings[caller].sort = option;
          window.localStorage.setItem("settings", JSON.stringify(settings));
          dialog.hide();
        }
      });
    });
  },

  formatItemText: function(text, maxLength) {

    let t = unescape(text);

    if (text.length > maxLength)
      t = t.substring(0, maxLength-2) + "..";

    //Format to title case
    return t.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },
};

document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#foods-meals-recipes')) {}
});
