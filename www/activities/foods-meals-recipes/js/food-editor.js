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

app.FoodEditor = {

  item: undefined,
  scan: false,
  origin: undefined,
  linked: true,
  el: {},
  images: [],

  init: function(context) {

    app.FoodEditor.item = undefined;
    app.FoodEditor.scan = false;
    app.FoodEditor.images = [];

    if (context) {

      if (context.item !== undefined)
        app.FoodEditor.item = context.item;

      if (context.item == undefined || (context.item != undefined && context.item.id == undefined))
        app.FoodEditor.linked = false; //Unlinked by default for adding new items
      else
        app.FoodEditor.linked = true;

      app.FoodEditor.origin = context.origin;
      app.FoodEditor.scan = context.scan;
    }

    this.getComponents();
    this.bindUIActions();
    this.updateTitle();
    this.renderNutritionFields(app.FoodEditor.item);
    this.setComponentVisibility(app.FoodEditor.origin);
    this.setUploadFieldVisibility();
    this.setLinkButtonIcon();

    if (app.FoodEditor.item) {
      this.populateFields(app.FoodEditor.item);
      this.populateImage(app.FoodEditor.item);
    }

    if (app.FoodEditor.item && app.FoodEditor.item.category !== undefined)
      this.populateCategoryField(app.FoodEditor.item);

    if (context.barcode !== undefined)
      app.FoodEditor.el.barcode.value = context.barcode;
  },

  getComponents: function() {
    app.FoodEditor.el.title = document.querySelector(".page[data-name='food-editor'] #title");
    app.FoodEditor.el.link = document.querySelector(".page[data-name='food-editor'] #link");
    app.FoodEditor.el.linkIcon = document.querySelector(".page[data-name='food-editor'] #link-icon");
    app.FoodEditor.el.upload = document.querySelector(".page[data-name='food-editor'] #upload");
    app.FoodEditor.el.submit = document.querySelector(".page[data-name='food-editor'] #submit");
    app.FoodEditor.el.barcodeContainer = document.querySelector(".page[data-name='food-editor'] #barcode-container");
    app.FoodEditor.el.barcode = document.querySelector(".page[data-name='food-editor'] #barcode");
    app.FoodEditor.el.name = document.querySelector(".page[data-name='food-editor'] #name");
    app.FoodEditor.el.brand = document.querySelector(".page[data-name='food-editor'] #brand");
    app.FoodEditor.el.categoryContainer = document.querySelector(".page[data-name='food-editor'] #category-container");
    app.FoodEditor.el.category = document.querySelector(".page[data-name='food-editor'] #category");
    app.FoodEditor.el.portion = document.querySelector(".page[data-name='food-editor'] #portion");
    app.FoodEditor.el.uploadUnit = document.querySelector(".page[data-name='food-editor'] #upload-unit");
    app.FoodEditor.el.unit = document.querySelector(".page[data-name='food-editor'] #unit");
    app.FoodEditor.el.quantityContainer = document.querySelector(".page[data-name='food-editor'] #quantity-container");
    app.FoodEditor.el.quantity = document.querySelector(".page[data-name='food-editor'] #quantity");
    app.FoodEditor.el.notes = document.querySelector(".page[data-name='food-editor'] #notes");
    app.FoodEditor.el.notesContainer = document.querySelector(".page[data-name='food-editor'] #notes-container");
    app.FoodEditor.el.nutrition = document.querySelector(".page[data-name='food-editor'] #nutrition");
    app.FoodEditor.el.ingredients_text = document.querySelector(".page[data-name='food-editor'] #ingredients_text");
    app.FoodEditor.el.traces = document.querySelector(".page[data-name='food-editor'] #traces");
    app.FoodEditor.el.mainPhoto = document.querySelector(".page[data-name='food-editor'] #main-photo");
    app.FoodEditor.el.addPhoto = Array.from(document.getElementsByClassName("add-photo"));
    app.FoodEditor.el.photoHolder = Array.from(document.getElementsByClassName("photo-holder"));
  },

  bindUIActions: function() {

    // Submit
    app.FoodEditor.el.submit.addEventListener("click", (e) => {
      app.FoodEditor.returnItem(app.FoodEditor.item, app.FoodEditor.origin);
    });

    // Portion
    app.FoodEditor.el.portion.addEventListener("change", (e) => {
      app.FoodEditor.changeServing(app.FoodEditor.item, "portion", e.target.value);
    });

    // Quantity
    app.FoodEditor.el.quantity.addEventListener("change", (e) => {
      app.FoodEditor.changeServing(app.FoodEditor.item, "quantity", e.target.value);
    });

    // Link/Unlink
    app.FoodEditor.el.link.addEventListener("click", (e) => {
      app.FoodEditor.linked = 1 - app.FoodEditor.linked;
      app.FoodEditor.setLinkButtonIcon();
    });

    //Upload
    if (!app.FoodEditor.el.upload.hasClickEvent) {
      app.FoodEditor.el.upload.addEventListener("click", async (e) => {
        await app.FoodEditor.upload();
        app.f7.views.main.router.navigate("/foods-meals-recipes/");
      });
      app.FoodEditor.el.upload.hasClickEvent = true;
    }

    // Add-photo
    app.FoodEditor.el.addPhoto.forEach((x, i) => {
      if (!x.hasClickEvent) {
        x.addEventListener("click", (e) => {
          app.FoodEditor.takePicture(i);
        });
        x.hasClickEvent = true;
      }
    });
  },

  setComponentVisibility: function(origin) {
    if (origin !== "foodlist") {
      app.FoodEditor.el.name.disabled = true;
      app.FoodEditor.el.brand.disabled = true;
      app.FoodEditor.el.unit.disabled = true;
      app.FoodEditor.el.ingredients_text.disabled = true;
      app.FoodEditor.el.traces.disabled = true;
      app.FoodEditor.el.link.style.display = "none";
      app.FoodEditor.linked = true;
      app.FoodEditor.el.quantityContainer.style.display = "block";

      app.FoodEditor.el.name.style.color = "grey";
      app.FoodEditor.el.brand.style.color = "grey";
      app.FoodEditor.el.unit.style.color = "grey";
      app.FoodEditor.el.ingredients_text.style.color = "grey";
      app.FoodEditor.el.traces.style.color = "grey";
      app.FoodEditor.el.notes.disabled = true;
      app.FoodEditor.el.notes.style.color = "grey";
    } else {
      app.FoodEditor.el.quantityContainer.style.display = "none";

      if (app.FoodEditor.item !== undefined)
        app.FoodEditor.el.link.style.display = "block";

      if (app.Settings.get("foodlist", "show-notes") == true && app.FoodEditor.scan != true)
        app.FoodEditor.el.notesContainer.style.display = "block";
      else
        app.FoodEditor.el.notesContainer.style.display = "none";
    }

    if (app.FoodEditor.item && app.FoodEditor.item.category !== undefined)
      app.FoodEditor.el.categoryContainer.style.display = "block";
    else
      app.FoodEditor.el.categoryContainer.style.display = "none";

    if (app.FoodEditor.scan == true) {
      app.FoodEditor.el.upload.style.display = "block";
      app.FoodEditor.el.submit.style.display = "none";
    } else {
      app.FoodEditor.el.upload.style.display = "none";
      app.FoodEditor.el.submit.style.display = "block";
    }
  },

  setUploadFieldVisibility: function() {
    let fields = Array.from(document.getElementsByClassName("upload-field"));

    fields.forEach((x) => {
      if (app.FoodEditor.scan == true) {
        x.style.display = "block";
      } else {
        x.style.display = "none";
        x.required = false;
        x.validate = false;
      }
    });

    fields = Array.from(document.getElementsByClassName("hide-for-upload"));

    fields.forEach((x) => {
      if (app.FoodEditor.scan == true) {
        x.style.display = "none";
        x.required = false;
        x.validate = false;
      } else {
        x.style.display = "block";
      }
    });

    if (app.FoodEditor.scan == true) {
      app.FoodEditor.linked = false;
      app.FoodEditor.el.link.style.display = "none";
    }
  },

  setLinkButtonIcon: function() {
    if (app.FoodEditor.linked)
      app.FoodEditor.el.linkIcon.innerHTML = "link";
    else
      app.FoodEditor.el.linkIcon.innerHTML = "link_off";
  },

  updateTitle: function() {
    if (!app.FoodEditor.item || app.FoodEditor.item.id == undefined) {
      app.FoodEditor.el.title.innerHTML = app.strings["food-editor"]["add-new-item"] || "Add New Item";
    } else if (app.FoodEditor.origin != undefined) {
      const origins = ["diary", "foodlist", "meals", "recipes"];
      const titles = [
        app.strings["diary"]["title"] || "Diary",
        app.strings["food-editor"]["edit-food"] || "Edit Food Item",
        app.strings["food-editor"]["edit-meal"] || "Edit Meal Item",
        app.strings["food-editor"]["edit-recipe"] || "Edit Recipe Item"
      ];

      let title = titles[origins.indexOf(app.FoodEditor.origin)];
      app.FoodEditor.el.title.innerHTML = title;
    }
  },

  /* Nutrition fields are dynamically created for the nutriments of the item */
  renderNutritionFields: function(item) {

    let nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    const units = app.nutrimentUnits;
    const nutrimentVisibility = app.Settings.getField("nutrimentVisibility");

    let energy_unit = app.Settings.get("units", "energy");
    energy_unit == "kcal" ? energy_unit = "calories" : energy_unit = "kilojoules";

    if (item !== undefined && item.nutrition.kilojoules == undefined)
      item.nutrition.kilojoules = item.nutrition.calories * 4.1868;

    let ul = app.FoodEditor.el.nutrition;
    ul.innerHTML = ""; //Clear old form 

    for (let k of nutriments) {

      if (app.FoodEditor.origin == "foodlist" || (item !== undefined && item.nutrition[k])) { // All nutriments or only items nutriments
        let li = document.createElement("li");
        li.className = "item-content item-input";

        if (nutrimentVisibility !== undefined && nutrimentVisibility[k] !== true && k != energy_unit)
          li.style.display = "none";

        ul.appendChild(li);

        let innerDiv = document.createElement("div");
        innerDiv.className = "item-inner";
        li.appendChild(innerDiv);

        let titleDiv = document.createElement("div");
        titleDiv.className = "item-title item-label";
        let text = app.strings.nutriments[k] || k;
        titleDiv.innerText = (text.charAt(0).toUpperCase() + text.slice(1)).replace("-", " ") + " (" + (units[k] || "g") + ")";
        innerDiv.appendChild(titleDiv);

        let inputWrapper = document.createElement("div");
        inputWrapper.className = "item-input-wrap";
        innerDiv.appendChild(inputWrapper);

        let input = document.createElement("input");
        input.id = k;
        input.className = "align-right";
        input.type = "number";
        input.step = "0.01";
        input.min = "0";
        input.placeholder = "0";
        input.name = k;

        if (item) {
          if (item.nutrition[k] !== 0)
            input.value = Math.round(item.nutrition[k] * 100) / 100 || "";
          else
            input.value = 0;

          input.oldValue = input.value;
        } else {
          input.value = "";
        }

        input.addEventListener("change", function() {
          if (this.oldValue == 0) this.oldValue = this.value;
          if (this.value == 0) this.oldValue = 0;
          app.FoodEditor.changeServing(item, k, this.value);
        });
        inputWrapper.appendChild(input);
      }
    }
  },

  populateCategoryField: function(item) {
    const mealNames = app.Settings.get("diary", "meal-names");
    app.FoodEditor.el.category.innerHTML = "";

    mealNames.forEach((x, i) => {
      if (x != "" && x != undefined) {
        let option = document.createElement("option");
        option.value = i;
        option.text = x;
        if (i == item.category) option.setAttribute("selected", "");
        app.FoodEditor.el.category.append(option);
      }
    });
  },

  populateFields: function(item) {
    app.FoodEditor.el.name.value = app.Utils.tidyText(item.name, 200);
    app.FoodEditor.el.brand.value = app.Utils.tidyText(item.brand, 200);
    app.FoodEditor.el.unit.value = item.unit || "";
    app.FoodEditor.el.notes.value = item.notes || "";
    app.FoodEditor.el.ingredients_text.value = item.ingredients_text || "";
    app.FoodEditor.el.traces.value = item.traces || "";

    if (item.barcode !== undefined && !item.barcode.includes("fdcId_")) {
      app.FoodEditor.el.barcodeContainer.style.display = "block";
      app.FoodEditor.el.barcode.value = item.barcode;

      if (navigator.connection.type != "none") {
        let url = "https://world.openfoodfacts.org/product/" + item.barcode;
        if (!app.FoodEditor.el.barcode.hasClickEvent) {
          app.FoodEditor.el.barcode.parentElement.addEventListener("click", (e) => {
            window.open(url, '_system');
            return false;
          });
          app.FoodEditor.el.barcode.hasClickEvent = true;
        }
      }
    }

    // Portion (serving size)
    if (item.portion != +undefined) {
      app.FoodEditor.el.portion.value = parseFloat(item.portion);
      app.FoodEditor.el.portion.oldValue = parseFloat(item.portion);
    } else {
      app.FoodEditor.el.portion.setAttribute("placeholder", "N/A");
      app.FoodEditor.el.portion.disabled = true;
    }

    // Quantity (number of servings)
    app.FoodEditor.el.quantity.value = item.quantity || 1;
    app.FoodEditor.el.quantity.oldValue = app.FoodEditor.el.quantity.value;
  },

  populateImage: function(item) {
    if (app.Settings.get("foodlist", "show-images")) {

      let wifiOnly = app.Settings.get("foodlist", "wifi-images");

      if (app.mode == "development") wifiOnly = false;

      if (navigator.connection.type !== "none") {
        if ((wifiOnly && navigator.connection.type == "wifi") || !wifiOnly) {
          if (item.image_url !== undefined && item.image_url != "" && item.image_url !== "undefined") {
            let img = document.createElement("img");
            img.src = unescape(item.image_url);
            img.style["width"] = "50%";

            app.FoodEditor.el.mainPhoto.style.display = "block";
            app.FoodEditor.el.mainPhoto.appendChild(img);
          }
        }
      }
    }
  },

  changeServing: function(item, field, newValue) {

    if (app.FoodEditor.linked) {

      let multiplier;
      let oldValue;

      if (field == "portion" || field == "quantity")
        oldValue = item[field];
      else
        oldValue = document.querySelector("#food-edit-form #" + field).oldValue;

      if (oldValue > 0 && newValue > 0) {
        let newQuantity = app.FoodEditor.el.quantity.value;

        if (field == "portion" || field == "quantity") {
          let newPortion = app.FoodEditor.el.portion.value;
          multiplier = (newPortion / item.portion) * (newQuantity / (item.quantity || 1));
        } else {
          multiplier = (newValue / oldValue) / (newQuantity / (item.quantity || 1));
          app.FoodEditor.el.portion.value = Math.round(item.portion * multiplier * 100) / 100;
        }

        //Nutrition 
        const nutriments = app.nutriments;
        for (let k of nutriments) {
          if (k != field) {
            let input = document.querySelector("#food-edit-form #" + k);
            if (input) {
              input.value = Math.round(input.oldValue * multiplier * 100) / 100 || 0;
            }
          }
        }
      }
    }
  },

  takePicture: function(index) {

    let options = {
      "allowEdit": app.Settings.get("integration", "edit-images"),
      "saveToPhotoAlbum": false
    };

    navigator.camera.getPicture((image_uri) => {

        // Add new image
        let img = document.createElement("img");
        img.src = image_uri;
        img.style["width"] = "50%";

        img.addEventListener("taphold", function(e) {
          app.FoodEditor.removePicture(index);
        });

        app.FoodEditor.el.photoHolder[index].innerHTML = "";
        app.FoodEditor.el.photoHolder[index].appendChild(img);
        app.FoodEditor.el.addPhoto[index].style.display = "none";
        app.FoodEditor.images[index] = image_uri;
      },
      (err) => {
        if (err != "No Image Selected") {
          let msg = app.strings.dialogs["camera-problem"] || "There was a problem accessing your camera.";
          app.Utils.toast(msg, 2000);
          console.error(err);
        }
      }, options);
  },

  removePicture: function(index) {
    let title = app.strings.dialogs.delete || "Delete";
    let text = app.strings.dialogs["confirm-delete"] || "Are you sure?";

    let dialog = app.f7.dialog.confirm(text, title, () => {
      app.FoodEditor.el.photoHolder[index].innerHTML = "";
      app.FoodEditor.el.addPhoto[index].style.display = "block";
      app.FoodEditor.images[index] = undefined;
    });
  },

  gatherFormData: function(data, origin) {
    if (app.f7.input.validateInputs("#food-edit-form") == true) {

      let item = {};
      item.portion = app.FoodEditor.el.portion.value;

      if (data !== undefined) {
        if (data.id !== undefined) item.id = data.id;

        item.type = data.type || "food";

        if (data.index !== undefined)
          item.index = data.index;

        if (data.dateTime !== undefined)
          item.dateTime = data.dateTime;

        if (data.quantity !== undefined)
          item.quantity = app.FoodEditor.el.quantity.value;

        if (data.category !== undefined)
          item.category = app.FoodEditor.el.category.value;
      }

      if (origin == "foodlist") {
        const nutriments = app.nutriments;
        let energyUnit = app.Settings.get("units", "energy");
        const inputs = document.querySelectorAll("#food-edit-form input:not(#quantity), #food-edit-form textarea, #food-edit-form radio");
        const caloriesEl = document.getElementById("calories");
        const kilojoulesEl = document.getElementById("kilojoules");

        if (data !== undefined && data.barcode !== undefined)
          item.barcode = data.barcode;

        if (app.FoodEditor.scan == false)
          item.unit = app.FoodEditor.el.unit.value;
        else
          item.unit = app.FoodEditor.el.uploadUnit.value;

        if (data !== undefined && data.image_url !== undefined)
          item.image_url = data.image_url;

        item.nutrition = {};

        // Always store a calorie value
        if (energyUnit == "kJ")
          caloriesEl.value = kilojoulesEl.value / 4.1868;

        for (let i = 0; i < inputs.length; i++) {
          let x = inputs[i];
          let id = x.id;
          let value = x.value;

          if (id !== "" && value) {
            if (app.nutriments.includes(id)) {
              item.nutrition[id] = parseFloat(value);
            } else if (x.type == "radio") {
              if (item[x.name] == undefined && x.checked)
                item[x.name] = value;
            } else {
              item[id] = value;
            }
          }
        }
      }

      return item;
    }
    return undefined;
  },

  returnItem: function(data, origin) {
    let item = app.FoodEditor.gatherFormData(data, origin);

    if (item !== undefined) {
      // Delete unneeded fields
      if (item.nutrition_per !== undefined)
        delete item.nutrition_per;

      app.data.context = {
        item: item
      };

      app.f7.views.main.router.back();
    }
  },

  upload: function() {
    return new Promise(async function(resolve, reject) {
      if (app.Utils.isInternetConnected()) {
        let data = app.FoodEditor.gatherFormData(app.FoodEditor.item, app.FoodEditor.origin);

        if (data !== undefined) {
          if (app.FoodEditor.images[0] !== undefined) {
            if (data.nutrition.calories !== 0 || data.nutrition.kilojoules !== 0) {
              data.images = app.FoodEditor.images;
              app.f7.preloader.show();

              let imgUrl = await app.OpenFoodFacts.upload(data).catch((e) => {
                let msg = app.dialogs["upload-failed"] || "Upload Failed";
                app.Utils.toast(msg);
              });

              app.Utils.toast("Upload Complete. Please rescan the barcode", 3500);

              app.f7.preloader.hide();

              resolve();
            } else {
              let msg = app.string.dialogs["number-of-calories"] || "Please provide the number of calories for this food.";
              app.Utils.toast(msg, 2500);
            }
          } else {
            let msg = app.strings.dialogs["main-image"] || "Please add a main image";
            app.Utils.toast(msg, 2500);
          }
        }
      }
    });
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='food-editor']")) {
    let context = app.data.context;
    app.data.context = undefined;
    app.FoodEditor.init(context);
  }
});