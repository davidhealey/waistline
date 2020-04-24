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

var diary = {

  initialize: function() {

    this.page = document.querySelector('ons-page#diary');
    this.data = {};
    this.currentCategory = 0;
    this.mealNames = settings.get("diary", "meal-names");
    let now = new Date();
    this.date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
    
    //Initialize date picker
    this.calendar = f7.calendar.create({
      inputEl: "#diary-date",
      openIn: "customModal",
      on: {
        "init": function(c) {
    
          let now = new Date();
          let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
          if (c.getValue() == undefined)
            c.setValue([today]);
        
          diary.initializeCalendarButtons(c);
        },
        "change": function(c) {
          diary.loadDiary();
          c.close();
        }
      }
    });

    console.log("Diary Initialized");
  },
  
  initializeCalendarButtons: function(calendar)
  {
    //Previous/Next date buttons
    const btnDate = document.getElementsByClassName("change-date");

    Array.from(btnDate).forEach(function(element) {
      element.addEventListener("click", function(event){
      
        let d = new Date(calendar.getValue()[0]);
      
        if (this == btnDate[0])       
          d.setDate(d.getDate() - 1); 
        else
          d.setDate(d.getDate() + 1);
        
        calendar.setValue([d]);
      
        //document.querySelector('#diary #log-weight').setAttribute("dateTime", diary.date);
      });
    });
  },

  getDate: function() {

    if (diary.calendar && diary.calendar.getValue() !== undefined)
      return diary.calendar.getValue()[0];
    else {
      let now = new Date();
      return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
    }
  },

  getCategory: function() {
    return diary.currentCategory;
  },

  getEntriesFromDB: function(date)
  {
    return new Promise(function(resolve, reject){

      let from = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); //Discard time

      let to = new Date(from);
      to.setUTCHours(to.getUTCHours()+24);

      var data = {"entries":{}, "nutrition":{}, "nutritionTotals":{}};

      //Diary entries and nutrition
      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.bound(from, to, false, true)).onsuccess = function(e)
      {
        let cursor = e.target.result;

        if (cursor) {
          let item = cursor.value;

          //Diary food entries
          data.entries[item.category] = data.entries[item.category] || []; //Organize by category ID
          data.entries[item.category].push(item);

          //Nutrition
          data.nutrition[item.category] = data.nutrition[item.category] || {}; //Nutrition per category

          for (let nutriment in item.nutrition) {

            data.nutrition[item.category][nutriment] = data.nutrition[item.category][nutriment] || 0;
            data.nutrition[item.category][nutriment] += item.nutrition[nutriment];

            //Nutrition totals
            data.nutritionTotals[nutriment] = data.nutritionTotals[nutriment] || 0;
            data.nutritionTotals[nutriment] += Number(item.nutrition[nutriment]);
          }

          cursor.continue();
        }
        else {
          resolve(data);
        }
      };
    });
  },

  render: function() {
    const entries = diary.data.entries; //Diary food entries
    const nutrition = diary.data.nutrition; //Nutrition by category
    const totals = diary.data.nutritionTotals; //Nutrition totals
    const lists = [];

    const container = document.getElementById("diary-day");
    container.innerHTML = "";

    //Setup lists for each category - one per meal
    for (let i = 0; i < diary.mealNames.length; i++) {

      if (diary.mealNames[i] == "") continue;
           
      let list = document.createElement("div");
      list.className = "list card card-outline"; 
      
      container.appendChild(list);
           
      let ul = document.createElement("ul")
      
      list.appendChild(ul);
      
      //Collapsable list item
      let li = document.createElement("li");
      li.className = "accordion-item";
      
      //Auto expand list if setting is true
      if (settings.get("diary", "expand-meals") == true && nutrition[i] != undefined)
        li.classList.add("accordion-item-opened"); 
      
      ul.appendChild(li);
            
      let a = document.createElement("a");
      a.className = "item-link item-content";
      a.innerHTML = "<div class='item-inner'><div class='item-title'>" + diary.mealNames[i] + "</div></div>"
      
      li.appendChild(a);
      
      let content = document.createElement("div");
      content.className = "accordion-item-content";
      
      lists[i] = content; //Expanded content list
      
      li.appendChild(content);      
            
      //List footer
      let ft = document.createElement("li");
      
      ul.appendChild(ft);

      let row = document.createElement("div");
      row.className = "row item-content";
      
      ft.appendChild(row);

      //Add food button
      let left = document.createElement("div");
      left.className = "col-10 add-button";
      left.setAttribute("category", i);
      left.innerHTML = "<button class='button button-md add-button disable-long-tap'><i class='fas fa-plus'></i></button>";
      left.addEventListener("taphold", function(e) {diary.quickAdd(this.getAttribute("category"));});
      
      row.appendChild(left);
      
      //Calorie count
      let right = document.createElement("div");
      right.className = "col-25 calorie-count";
      
      if (nutrition[i] != undefined)
        right.innerHTML = parseInt(nutrition[i].calories) + " Cal";
      else
        right.innerHTML = "0 Cal";
            
      row.appendChild(right);      
    }

    //Render entries
    for (let category in entries) {

      if (diary.mealNames[category] == "") continue;

      //List for each category card
      let div = document.createElement("div");
      div.className = "list";
      
      let ul = document.createElement("ul");
      
      div.appendChild(ul);

      for (let i = 0; i < entries[category].length; i++) {

        let entry = entries[category][i];
      
        let li = document.createElement("li");
        li.id = entry.id;
        if (entry.foodId) li.setAttribute("foodId", entry.foodId);
        if (entry.recipeId) li.setAttribute("recipeId", entry.recipeId);
        li.className = "item-content entry disable-long-tap ripple";
        li.setAttribute("data", JSON.stringify(entry));
        li.addEventListener("taphold", function(e) {diary.deleteItem(li);});
        li.addEventListener("click", function(e) {diary.itemEditor(li);});
      
        ul.appendChild(li);
      
        let content = document.createElement("div");
        content.className = "item-inner item-cell";
        
        li.appendChild(content);
      
        //Item name
        let nameRow = document.createElement("div");
        nameRow.className = "item-row";
      
        content.appendChild(nameRow);
      
        let name = document.createElement("div");
        name.className = "item-cell diary-entry-name";
        name.innerHTML = foodsMealsRecipes.formatItemText(entry.name, 30);
      
        nameRow.appendChild(name);
      
        //Item brand
        if (entry.brand && entry.brand != "") {
          let brandRow = document.createElement("div");
          brandRow.className = "item-row";
          
          content.appendChild(brandRow);
          
          let brand = document.createElement("div");
          brand.className = "item-cell diary-entry-brand";
          brand.innerHTML = foodsMealsRecipes.formatItemText(entry.brand, 20).italics();
          
          brandRow.appendChild(brand);
        }
      
        //Item calorie count
        let infoRow = document.createElement("div");
        infoRow.className = "item-row";
        
        content.appendChild(infoRow);
        
        let info = document.createElement("div");
        info.className = "item-cell diary-entry-info";
        
        if (entry.portion != undefined && entry.portion != "")
          info.innerText = entry.portion + ", " + parseInt(entry.nutrition.calories * entry.quantity) + " Calories";
        else
          info.innerText = parseInt(entry.nutrition.calories * entry.quantity) + " Calories";
        
        infoRow.appendChild(info);
        
        //Timestamp
        if (settings.get("diary", "show-timestamps") == true) {
          let timestampRow = document.createElement("div");
          timestampRow.className = "item-row";
          
          content.appendChild(timestampRow);
          
          let timestamp = document.createElement("div");
          timestamp.className = "item-cell diary-entry-info";       
          timestamp.innerHTML = entry.dateTime.toLocaleString();
          timestampRow.appendChild(timestamp);
        }        
      
        lists[category].appendChild(div);
      }
    }
  },

  renderNutrition: function() {

    //Gather data from DOM
    let entries = document.getElementsByClassName('entry'); //Get all entries
    let nutrition = diary.data.nutrition; //nutritionData.byCategory;
    let totals = diary.data.nutritionTotals; //nutritionData.totals;
    let goalData = goals.getGoalsByDate(diary.date);
    delete goalData.weight; //Not needed here

    //Render total nutrition / goals
    let count = 0;
    let rows = [];
    let swiper = f7.swiper.get('#diary-nutrition .swiper-container');
    let swiperWrapper = document.querySelector('#diary-nutrition .swiper-wrapper');
    swiperWrapper.innerHTML = "";    

    for (let n in goalData) {

      if (goals.shouldShowInDiary(n) == true) {
    
        //Show 3 nutrition stats at a time
        if (count % 3 == 0) {
        
          let slide = document.createElement("div");
          slide.className = "swiper-slide";
        
          swiper.appendSlide(slide);
        
          rows[0] = document.createElement("div");
          rows[0].className = "row nutrition-total-values";
        
          slide.appendChild(rows[0]);
        
          rows[1] = document.createElement("div");
          rows[1].className = "row nutrition-total-title";
        
          slide.appendChild(rows[1]);
        }
      
        let goal = goalData[n];
      
        if (goals.isGoalWeekly(n))
          goal = goals.getWeeklyGoal(n) / 7;
        
        let values = document.createElement("div")
        values.className = "col";
        values.id = n + "-value"; 
            
        //Value/goals text
        let t = document.createTextNode("");
      
        if (totals[n] != undefined) {
          if (n != "calories")
            t.nodeValue = parseFloat(totals[n].toFixed(2)) + "/" + parseFloat(goal.toFixed(2));
          else
            t.nodeValue = parseInt(totals[n]) + "/" + parseInt(goal);
        }
        else
          t.nodeValue = "0/" + parseFloat(goal.toFixed(2));
        
        values.appendChild(t);
        rows[0].appendChild(values);
      
        //Title
        let title = document.createElement("div");
        title.className = "col"
        title.id = n + "-title";
        let text = waistline.strings[n] || n; //Localize
        let tnode = document.createTextNode((text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " "));
        title.appendChild(tnode);
        rows[1].appendChild(title);

        count++;
      }
    }
  },

  itemEditor: function(item)
  {
    let data = JSON.parse(item.getAttribute("data"));

    f7.views.main.router.navigate("/diary/edit/");
    
    document.addEventListener("page:init", function(event) {
      if (event.target.matches(".page[data-name='diary-edit-item']")) {
        setupEditor(data);
      };
    });
    
    function setupEditor(data)
    {
      //Name
      let name = document.getElementById("item-name");
      name.innerHTML = "<h3>" + foodsMealsRecipes.formatItemText(data.name, 30) + "</h3>";
      
      //Brand
      let brand = document.getElementById("item-brand");
      brand.innerHTML = "";
      
      if (data.brand && data.brand != "") 
        brand.innerHTML = "<h4>" + foodsMealsRecipes.formatItemText(data.brand, 20).italics() + "</h4>";
    
      //Category
      let select = document.getElementById("category");

      for (let i = 0; i < diary.mealNames.length; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = diary.mealNames[i];
        if (option.text == "" || option.text == undefined) continue;
        if (i == data.category) option.setAttribute("selected", "");
        select.append(option);
      }
      
      //Serving
      let unit = data.portion.replace(/[^a-z]/gi, ''); //Extract unit from portion
      document.querySelector('#diary-edit-form #quantity').value = data.quantity;
      
      let portion = document.querySelector('#diary-edit-form #portion');

      if (typeof data.portion == "number")
        portion.value = parseFloat(data.portion);
      else
      {
        portion.setAttribute("placeholder", "N/A");
        portion.disabled = true;
      }      
      
      //document.querySelector('#diary-edit-form #unit').innerText = unit;
      
      //Nutrition
      let units = waistline.nutrimentUnits;
      let ul = document.getElementById("diary-edit-form").getElementsByTagName("ul")[0];
      let thead = document.getElementById("table-headings");
      let tbody = document.getElementById("table-data");
      thead.innerHTML = "";
      tbody.innerHTML = "";

      for (let n in data.nutrition) {

        if (data.nutrition[n] == null) continue;

        let th = document.createElement("th");
        th.className = "numeric-cell";
        
        let text = waistline.strings[n] || n; //Localize
        th.innerText = (text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " ") + " (" + (units[n] || "g") + ")";

        thead.appendChild(th);
        
        let td = document.createElement("td");
        td.className = "numeric-cell";;
        td.innerText = (parseFloat((data.nutrition[n] * data.quantity).toFixed(2)) || 0);        

        tbody.appendChild(td);
      }
    }

    function processEditor(data) {
      //Get values from form and push to DB
      let unit = document.getElementById('unit').innerText;
      data.category = parseInt(document.getElementById('category').value);
      data.category_name = diary.mealNames[data.category];
      data.quantity = parseFloat(document.getElementById('quantity').value);
      data.portion = document.getElementById('portion').value + unit;
      data.dateTime = new Date(data.dateTime); //dateTime must be a Date object

      for (let nutriment in data.nutrition) {
        if (data.nutrition[nutriment] == null) continue; //Skip empty values - sanity test
        let t = document.querySelector("#diary-edit-item #"+nutriment);
        data.nutrition[nutriment] = parseFloat(t.innerText / data.quantity);
      }

      //Update the DB and return to diary
      dbHandler.put(data, "diary").onsuccess = function() {
        nav.resetToPage('src/activities/diary/views/diary.html');
      };
    }

    function changeServing(data) {

      let oldP = parseFloat(data.portion); //Get original portion
      let newP = document.querySelector('#diary-edit-item #portion').value; //New portion
      let newQ = document.querySelector('#diary-edit-item #quantity').value; //New quantity

      if (oldP > 0 && newP > 0) {
        for (let nutriment in data.nutrition) {
          let v = (data.nutrition[nutriment] / oldP) * newP;
          let t = document.querySelector("#diary-edit-item #"+nutriment);
          t.innerText = parseFloat((v*newQ).toFixed(2));
        }
      }
    }
  },

  goToFoodList: function() {
    diary.currentCategory = this.getAttribute("category");
    nav.pushPage("src/activities/foods-meals-recipes/views/foods-meals-recipes.html"); //Go to the food list page
  },

  //Get diary entries for current date and render
  loadDiary: function() {
    return new Promise(function(resolve, reject) {
      diary.getEntriesFromDB(diary.getDate())
      .then(function(data) {
        diary.data = data;
        diary.render();
        diary.renderNutrition();
        resolve();
      });
    });
  },

  deleteItem: function(item) {

    let dialog = f7.dialog.confirm("Are you sure?", "Delete", callbackOk);

    function callbackOk()
    {    
      let request = dbHandler.deleteItem(parseInt(item.id), "diary");

      //If the request was successful remove the list item
      request.onsuccess = function(e) {
        diary.loadDiary()
        .then(function() {
          diary.updateLog();            
        });
      };
    }
  },

  //Bulk Insert/Update
  pushItemsToDB: function(items) {
    return new Promise(function(resolve, reject){

      //Meal category names
      for (let i = 0; i < items.length; i++) {
        let item = items[i];

        item.dateTime = diary.date;
        item.category = item.category || diary.currentCategory;
        item.category_name = diary.mealNames[item.category];
        item.quantity = 1;

        //If there is no food id set, use the item's ID as the food id
        if (item.foodId == undefined && item.id) {
          item.foodId = item.id;
          delete item.id;
        }
      }
      //Insert the items
      dbHandler.bulkInsert(items, "diary").then(resolve());
    });
  },

  quickAdd: function(category) {
       
    let dialog = f7.dialog.create({
      title: "Quick Add",
      text: "Calories",
      content: '<div id="quick-add" class="dialog-input-field item-input"><div class="item-input-wrap"><input type="number" class="dialog-input"></div></div>',
      buttons: [
        {
          text: "Cancel",
          keyCodes: [27],
          close: true
        },
        {
          text: "Ok",
          bold: true,
          keyCodes: [13]
        }
      ],
      onClick(dialog, index) {
        const inputValue = document.querySelector('#quick-add .dialog-input').value;
        if (index === 1 && callbackOk) callbackOk("Quick Add", inputValue);
      },
      destroyOnClose: true,
    }).open()
    
    function callbackOk(name, value) {

      let data = {"name":name, "category":category, "portion":"", "nutrition":{"calories":parseInt(value)}}; //Set up object to insert into diary

      //Add to diary
      diary.pushItemsToDB([data])
      .then (function() {
        diary.loadDiary() //Refresh display
        .then (function() {
          diary.updateLog();
        });
      }); 
    }
  },

  updateLog: function() {
    log.update(diary.date, {"nutrition":diary.data.nutritionTotals}); //Update the log
  },

  //Return all the items in a category from the specified date
  getEntries: function(dateTime, category) {
    return new Promise(function(resolve, reject) {
      let entries = [];

      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.only(dateTime)).onsuccess = function(e) { //Filter by date
        var cursor = e.target.result;
        if (cursor) {
          if (cursor.value.category == category) //Filter by category
            entries.push(cursor.value);
          cursor.continue();
        }
        else
          resolve(entries);
      };
    });
  },
};

//Page initialization
document.addEventListener("page:init", function(event){
  if (event.target.matches(".page[data-name='diary']")) {

    //Call constructor
    diary.initialize();

    diary.loadDiary();



    //Page show event
    /*diary.page.addEventListener("show", function(e){
      //If items have been passed to the page, add them to the diary
      if (this.data && this.data.items) {
        if (this.data.category != undefined)
          diary.currentCategory = this.data.category; //Update current category if passed with data

        let that = this;
        diary.pushItemsToDB(this.data.items)
        .then(function(){
          diary.loadDiary() //Refresh the display
          .then(function() {
            diary.updateLog();
            delete that.data.items; //Unset data
          });
        });
      }
      else {
        diary.loadDiary();
      }
    });

    //Previous & Next date buttons
    /*const btnDate = document.getElementsByClassName("adjacent-date");
    Array.from(btnDate).forEach(function(element) {
      element.addEventListener('tap', function(event){
        if (this == btnDate[0]) diary.date.setUTCHours(diary.date.getUTCHours()-24); //Previous day
        if (this == btnDate[1]) diary.date.setUTCHours(diary.date.getUTCHours()+24); //Next day
        document.querySelector('#diary #log-weight').setAttribute("dateTime", diary.date);
        diary.loadDiary();
      });
    });

    //Date picker
    const datePicker = document.querySelector('#diary-date #date-picker');
    datePicker.addEventListener("change", function(event){
      diary.date = new Date(this.value);
      diary.loadDiary();
    });

    //Fab button
    const fab = diary.page.querySelector('ons-fab');
    fab.addEventListener("tap", function(event){
      nav.resetToPage("src/activities/foods-meals-recipes/views/foods-meals-recipes.html"); //Go to the food list page
    });*/
 }
});
