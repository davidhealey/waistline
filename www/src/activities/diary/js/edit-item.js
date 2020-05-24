diary.editItem = {

  init: function(data) {

    //Add event handler to edit form submit button
    document.querySelector("#diary-edit-item #submit").addEventListener("click", function() {diary.editItem.update(data);});

		//Get meal names
		const mealNames = settings.get("diary", "meal-names");

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
    select.innerHTML = "";

    for (let i = 0; i < mealNames.length; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.text = mealNames[i];
      if (option.text == "" || option.text == undefined) continue;
      if (i == data.category) option.setAttribute("selected", "");
      select.append(option);
    }

    //Number of servings
    let quantity = document.querySelector('#diary-edit-form #quantity');
    quantity.value = data.quantity;
    quantity.addEventListener("change", function(e) {diary.editItem.changeServing(data, "quantity", this.value);});

    //Serving size
    let unit = data.portion.replace(/[^a-z]/gi, ''); //Extract unit from portion
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
    let ul = document.getElementById("nutrition");
    ul.innerHTML = ""; //Clear out old data

    for (let n in data.nutrition) {

      if (data.nutrition[n] == null) continue;

      let li = document.createElement("li");
      li.className = "item-content item-input";

      ul.appendChild(li);

      let innerDiv = document.createElement("div");
      innerDiv.className = "item-inner";

      li.appendChild(innerDiv);

      let titleDiv = document.createElement("div");
      titleDiv.className = "item-input item-label";
      let text = waistline.strings[n] || n; //Localize
      titleDiv.innerText = (text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " ") + " (" + (units[n] || "g") + ")";

      innerDiv.appendChild(titleDiv);

      let inputWrapper = document.createElement("div");
      inputWrapper.className = "item-input-wrap";

      innerDiv.appendChild(inputWrapper);

      let input = document.createElement("input");
      input.id = n;
      input.type = "number";
      input.min = "0.0001";
      input.name = n;
      input.value = Math.round(((data.nutrition[n] * data.quantity) + Number.EPSILON) * 100) / 100 || 0;
      input.addEventListener("change", function(e) {diary.editItem.changeServing(data, n, this.value);});

      inputWrapper.appendChild(input);
    }
  },

  update: function(data) {

    //Get values from form and push to DB
    let unit = "g";// document.getElementById('unit').innerText;
    data.category = parseInt(document.getElementById("category").value);
    data.category_name = mealNames[data.category];
    data.quantity = parseFloat(document.getElementById("quantity").value);

    if (data.portion != undefined && data.portion.indexOf("NaN") == -1)
      data.portion = document.getElementById("portion").value + unit;

    data.dateTime = new Date(data.dateTime); //dateTime must be a Date object

    //Update the DB and return to diary
    dbHandler.put(data, "diary").onsuccess = function() {
      f7.views.main.router.navigate("/diary/");
    };
  },

  changeServing: function(data, field, newValue) {

    let qInput = document.querySelector("#diary-edit-form #quantity");
    let quantity = qInput.value;

    let oldValue = data[field] || data.nutrition[field] * quantity;

    if (oldValue > 0 && newValue > 0) {

      if (field != "quantity") {
        quantity = quantity * (newValue / oldValue);
        qInput.value = quantity;
      }

      //Nutrition
      for (let n in data.nutrition) {

        if (n == field) continue;

        let v = data.nutrition[n] * quantity;
        let input = document.querySelector("#diary-edit-form #" + n);
        input.value = Math.round((v + Number.EPSILON) * 100) / 100;
      }
    }
  }
};
