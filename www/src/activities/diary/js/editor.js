/*jshint -W083 */

diary.editor = {

  init: function(item) {

    //Render editor
    this.renderEditorInputs(item);

    //Populate the editor
    this.populateEditor(item);

    //Add event handler to submit button
    document.querySelector('#diary-editor #submit').addEventListener("click", function() {
      diary.editor.update(item);
    });
  },

  populateEditor: function(item) {

    //Name
    document.querySelector('#diary-editor #name').value = foodsMealsRecipes.formatItemText(item.name, 200);

    //Brand
    document.querySelector('#diary-editor #brand').value = foodsMealsRecipes.formatItemText(item.brand, 200);

    //Category
    const mealNames = settings.get("diary", "meal-names");
    let select = document.getElementById("category");
    select.innerHTML = "";

    for (let i = 0; i < mealNames.length; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.text = mealNames[i];
      if (option.text == "" || option.text == undefined) continue;
      if (i == item.category) option.setAttribute("selected", "");
      select.append(option);
    }

    //Number of servings
    let quantity = document.querySelector('#diary-edit-form #quantity');
    quantity.value = item.quantity;
    quantity.addEventListener("change", function() {
      diary.editor.changeServing(item, "quantity", this.value);
    });

    //Serving size
    //Unit
    document.querySelector('#diary-editor #unit').value = item.portion.replace(/[^a-z]/gi, '');

    //Portion
    let portion = document.querySelector('#diary-editor #portion');
    portion.addEventListener("change", function() {
      diary.editor.changeServing(item, "portion", this.value);
    });

    if (item.portion != undefined)
      portion.value = parseFloat(item.portion);
    else {
      portion.setAttribute("placeholder", "N/A");
      portion.disabled = true;
    }

    //Nutrition
    if (item.nutrition) {
      const nutriments = waistline.nutriments;

      let inputs = document.querySelectorAll("form input");

      for (let i = 0; i < inputs.length; i++) {

        if (nutriments.indexOf(inputs[i].id) == -1) continue; //Skip non-nutriment inputs

        n = inputs[i].id;

        inputs[i].value = Math.round(item.nutrition[n] * quantity.value * 100) / 100;
      }
    }

  },

  renderEditorInputs: function(item) {

    //Nutrition
    let units = waistline.nutrimentUnits;
    let ul = document.getElementById("nutrition");
    ul.innerHTML = ""; //Clear out old data

    for (let n in item.nutrition) {

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
      input.step="0.01";
      input.min = "0";
      input.name = n;
      input.addEventListener("change", function() {
        diary.editor.changeServing(item, n, this.value);
      });

      inputWrapper.appendChild(input);
    }
  },

  update: function(item) {

    let data = item;
    let inputs = document.querySelectorAll('#diary-editor input');
    let unit = document.querySelector('#diary-editor #unit').value;

    //Get values from form and push to DB
    const nutriments = waistline.nutriments;
    const mealNames = settings.get("diary", "meal-names");

    if (f7.input.validateInputs("#diary-edit-form") == true) {

      //Category
      data.category = parseInt(document.getElementById("category").value);
      data.category_name = mealNames[data.category];

      //Quantity
      let quantity = parseInt(document.getElementById("quantity").value);

      for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        let name = input.getAttribute("name");
        let value = input.value;

        if (nutriments.indexOf(name) != -1) //Nutriments
          data.nutrition[name] = parseFloat(value) / quantity;
        else {
          if (name == "unit") continue;
          if (name == "portion" && value != "NaN") value = value + unit;
          data[name] = value;
        }
      }
      //Update the DB and return to diary
      dbHandler.put(data, "diary").onsuccess = function() {
        f7.views.main.router.navigate("/diary/");
      };
    }
  },

  changeServing: function(item, field, newValue) {

    //Portion
    let pInput = document.querySelector("#diary-edit-form #portion");
    let portion = pInput.value;

    //Quantity
    let qInput = document.querySelector("#diary-edit-form #quantity");
    let quantity = qInput.value;

    let oldValue = parseFloat(item[field]) || parseFloat(item.nutrition[field]) * quantity;

    if (oldValue > 0 && newValue > 0) {

      let multiplier = 1;
      if (field == "quantity") {
        multiplier = quantity * (portion / parseInt(item.portion));
      } else if (field == "portion") {
        multiplier = quantity * (newValue / oldValue);
      } else {
        multiplier = newValue / oldValue;
        pInput.value = Math.round(parseFloat(item.portion) * multiplier * 100) / 100;
      }

      //Nutrition
      for (let n in item.nutrition) {

        if (n == field) continue;

        let input = document.querySelector("#diary-edit-form #" + n);
        input.value = Math.round(item.nutrition[n] * multiplier * 100) / 100;
      }
    }
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='diary-editor']")) {
    //If item ID was passed, get item from DB
    if (f7.views.main.router.currentRoute.context) {
      let id = f7.views.main.router.currentRoute.context.itemId;

      if (id) {
        let request = dbHandler.getItem(id, "diary");

        request.onsuccess = function(e) {
          var item = e.target.result;
          diary.editor.init(item);
        };
      } else
        f7.views.main.router.back();
    } else
      f7.views.main.router.back();
  }
});
