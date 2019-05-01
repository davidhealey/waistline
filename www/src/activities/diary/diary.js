var diary = {

  initialize: function() {
    var now = new Date("2018-12-27");
    this.date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    this.changeDate(0);
  },

  changeDay: function(date) {
    var previousDate = diary.date;
    diary.date = date;

  },

  getDailyGoals:function()
  {
    const goals = JSON.parse(window.localStorage.getItem("goals"));
    let data = {};

    for (let item in goals) {
      if (item == "weight") continue;
      data[item] = goals[item][diary.date.getDay()];
    }
    return data;
  },

  getEntriesFromDB: function(date)
  {
    return new Promise(function(resolve, reject){

      let to = new Date(date);
      to.setUTCHours(to.getUTCHours()+24);
      diary.getDailyGoals();
      var data = {"entries":{}, "nutrition":{}, "nutritionTotals":{}};

      //Diary entries and nutrition
      dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.bound(date, to, false, true)).onsuccess = function(e)
      {
        let cursor = e.target.result;

        if (cursor)
        {
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
            data.nutritionTotals[nutriment] += item.nutrition[nutriment];
          }

          cursor.continue();
        }
        else {
          resolve(data);
        }
      };
    });
  },

  render: function()
  {
    const entries = diary.data.entries; //Diary food entries
    const nutrition = diary.data.nutrition; //Nutritional nutrition by category
    const totals = diary.data.nutritionTotals; //Nutrition totals
    const goals = diary.data.goals;
    const cards = [];
    const lists = [];

    const container = document.getElementById("diary-day");
    container.innerHTML = "";

    //Setup meal cards for carousel item
    const mealNames = JSON.parse(window.localStorage.getItem("meal-names"));

    for (let i = 0; i < mealNames.length; i++) {
      //One card per meal - breakfast, lunch, dinner, etc.
      cards[i] = document.createElement("ons-card");

      //One expandable list per card
      let ul = document.createElement("ons-list");
      let li = document.createElement("ons-list-item");
      li.setAttribute("expandable");

      let calories = 0; //Per category calorie count
      if (nutrition[i]) calories = nutrition[i].calories;
      let text = document.createTextNode(mealNames[i] + " - " + calories);
      li.appendChild(text);

      ul.appendChild(li);
      cards[i].appendChild(ul); //Attach list to card

      //Expandable content holder
      let content = document.createElement("div");
      content.className = "expandable-content";
      li.appendChild(content);

      //The expanded list that will contain diary entries
      let innerUl = document.createElement("ons-list");
      content.appendChild(innerUl);
      lists[i] = innerUl; //Expanded content list

      container.appendChild(cards[i]); //Attach card to carousel item
      if (calories > 0) li.showExpansion(); //Expand lists that have entires
    }

    //Render entires
    for (let category in entries) {

      //List for each category card
      var ul = document.createElement("ons-list");
      cards[category].appendChild(ul);

      //Render entries
      for (let i = 0; i < entries[category].length; i++) {
        let entry = entries[category][i];

        let li = document.createElement("ons-list-item");
        let name = document.createElement("ons-row");
        name.className = "diary-entry-name";
        name.innerText = unescape(entry.name);
        li.appendChild(name);

        if (entry.brand != "")
        {
          let brand = document.createElement("ons-row");
          brand.className = "diary-entry-brand";
          brand.innerHTML = unescape(entry.brand).italics();
          li.appendChild(brand);
        }

        let info = document.createElement("ons-row");
        info.className = "diary-entry-info";
        info.innerText = entry.portion + ", " + entry.nutrition.calories + " Calories";
        li.appendChild(info);

        lists[category].appendChild(li);
      }
    }

    //Render total nutrition
    let count = 0;
    let carouselItem;
    let rows = [];
    let carousel = document.createElement("ons-carousel");
    carousel.id = "nutrition-carousel";
    carousel.setAttribute("swipeable", "");
    carousel.setAttribute("auto-scroll", "");

    let nutritionContainer = document.getElementById("diary-nutrition");
    nutritionContainer.firstChild.remove();
    nutritionContainer.appendChild(carousel);

    for (let nutriment in goals) {

      if (count % 3 == 0) { //Every third nutriment
        carouselItem = document.createElement("ons-carousel-item");
        rows[0] = document.createElement("ons-row");
        rows[0].className = "nutrition-total-values";
        rows[1] = document.createElement("ons-row");
        rows[1].className = "nutrition-total-title";
        carouselItem.appendChild(rows[0]);
        carouselItem.appendChild(rows[1]);
        carousel.appendChild(carouselItem);
      }

      let col = document.createElement("ons-col");
      col.id = nutriment + "-value";

      //Value/goals text
      let t = document.createTextNode("");
      if (totals[nutriment] != undefined)
        t.nodeValue = parseFloat(totals[nutriment].toFixed(2)) + "/" + goals[nutriment];
      else
        t.nodeValue = "0/" + goals[nutriment];

      col.appendChild(t);
      rows[0].appendChild(col);

      col = document.createElement("ons-col");
      col.id = nutriment + "-title";
      let tt = document.createTextNode(nutriment);
      col.appendChild(tt);
      rows[1].appendChild(col);

      count++;
    }

  },

  changeDate: function(hours) {

    //Update diary date
    diary.date.setUTCHours(diary.date.getUTCHours()+hours);
    document.querySelector('#diary-date #date-picker').value = diary.date; //Update displayed date

    //Get diary entries for date and render
    diary.getEntriesFromDB(diary.date)
    .then(function(data){
      data.goals = diary.getDailyGoals();
      diary.data = data;
      diary.render();
    });
  },
};

//Page initialization
document.addEventListener("init", function(event){
  if (event.target.matches('ons-page#diary')) {

    //Initialize module
    diary.initialize();

    //Previous & Next date buttons
    const btnDate = document.getElementsByClassName("adjacent-date");
    Array.from(btnDate).forEach(function(element) {
      element.addEventListener('tap', function(event){
        if (this == btnDate[0]) diary.changeDate(-24); //Previous day
        if (this == btnDate[1]) diary.changeDate(24); //Next day
      });
    });

    //Date picker
    const datePicker = document.querySelector('#diary-date #date-picker');
    datePicker.addEventListener("change", function(event){
      diary.date = new Date(this.value);
      diary.changeDate(0);
    });
 }
});
