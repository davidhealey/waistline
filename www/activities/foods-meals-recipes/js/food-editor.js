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
  images: [undefined, undefined, undefined],

  init: function(context) {

    app.FoodEditor.item = undefined;
    app.FoodEditor.scan = false;

    if (context) {

      if (context.item !== undefined) {
        app.FoodEditor.item = context.item;
        app.FoodEditor.linked = true;
      } else
        app.FoodEditor.linked = false; //Unlinked by default for adding new items

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
  },

  getComponents: function() {
    app.FoodEditor.el.title = document.querySelector(".page[data-name='food-editor'] #title");
    app.FoodEditor.el.link = document.querySelector(".page[data-name='food-editor'] #link");
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
    app.FoodEditor.el.ingredients_text = document.querySelector(".page[data-name='food-editor'] #ingredients_text");
    app.FoodEditor.el.traces = document.querySelector(".page[data-name='food-editor'] #traces");
    app.FoodEditor.el.mainPhoto = document.querySelector(".page[data-name='food-editor'] #main-photo");
    app.FoodEditor.el.addPhoto = Array.from(document.getElementsByClassName("add-photo"));
    app.FoodEditor.el.photoHolder = Array.from(document.getElementsByClassName("photo-holder"));
  },

  bindUIActions: function() {
    app.FoodEditor.el.submit.addEventListener("click", (e) => {
      app.FoodEditor.returnItem(app.FoodEditor.item, app.FoodEditor.origin);
    });

    app.FoodEditor.el.portion.addEventListener("change", (e) => {
      app.FoodEditor.changeServing(app.FoodEditor.item, "portion", e.target.value);
    });

    app.FoodEditor.el.quantity.addEventListener("change", (e) => {
      app.FoodEditor.changeServing(app.FoodEditor.item, "quantity", e.target.value);
    });

    app.FoodEditor.el.link.addEventListener("click", (e) => {
      app.FoodEditor.linked = 1 - app.FoodEditor.linked;
      app.FoodEditor.setLinkButtonIcon();
    });

    if (!app.FoodEditor.el.upload.hasClickEvent) {
      app.FoodEditor.el.upload.addEventListener("click", async (e) => {
        let data = app.FoodEditor.gatherFormData(app.FoodEditor.item, app.FoodEditor.origin);

        if (data !== undefined) {
          if (app.FoodEditor.images.indexOf(undefined) == -1) {
            if (data.nutrition.calories !== 0 || data.nutrition.kilojoules !== 0) {
              data.images = app.FoodEditor.images;
              app.Utils.togglePreloader(true, "Uploading");
              await app.OpenFoodFacts.upload(data);
              app.Utils.togglePreloader(false);
              app.FoodEditor.returnItem(app.FoodEditor.item, "foodlist");
            } else {
              app.Utils.toast("Please provide the number of calories for this food.", 2500);
            }
          } else {
            app.Utils.toast("Please add all 3 images.", 2500);
          }
        }
      });
      app.FoodEditor.el.upload.hasClickEvent = true;
    }

    // add-photo buttons
    app.FoodEditor.el.addPhoto.forEach((x, i) => {
      if (!x.hasClickeEvent) {
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
    } else {
      app.FoodEditor.el.link.style.display = "block";
      app.FoodEditor.el.quantityContainer.style.display = "none";
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
      if (app.FoodEditor.scan == true)
        x.style.display = "block";
      else
        x.style.display = "none";
    });

    fields = Array.from(document.getElementsByClassName("hide-for-upload"));

    fields.forEach((x) => {
      if (app.FoodEditor.scan == true)
        x.style.display = "none";
      else
        x.style.display = "block";
    });

    if (app.FoodEditor.scan == true) {
      app.FoodEditor.linked = false;
      app.FoodEditor.el.link.style.display = "none";
    }
  },

  setLinkButtonIcon: function() {
    if (app.FoodEditor.linked)
      app.FoodEditor.el.link.innerHTML = "link";
    else
      app.FoodEditor.el.link.innerHTML = "link_off";
  },

  updateTitle: function() {
    if (!app.FoodEditor.item) app.FoodEditor.el.title.innerHTML = app.strings["add-new-item"] || "Add New Item";
  },

  /* Nutrition fields are dynamically created for the nutriments of the item */
  renderNutritionFields: function(item) {

    const nutriments = app.nutriments;
    const units = app.nutrimentUnits;

    if (item !== undefined && item.nutrition.kilojoules == undefined)
      item.nutrition.kilojoules = Math.round(item.nutrition.calories * 4.1868);

    let ul = document.getElementById("nutrition");
    ul.innerHTML = ""; //Clear old form 

    for (let k of nutriments) {

      if (app.FoodEditor.origin == "foodlist" || (item !== undefined && item.nutrition[k])) { // All nutriments or only items nutriments
        let li = document.createElement("li");
        li.className = "item-content item-input";
        ul.appendChild(li);

        let innerDiv = document.createElement("div");
        innerDiv.className = "item-inner";
        li.appendChild(innerDiv);

        let titleDiv = document.createElement("div");
        titleDiv.className = "item-title item-label";
        let text = app.strings[k] || k; //Localize
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
          input.value = Math.round(item.nutrition[k] * 100) / 100 || "";
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
    app.FoodEditor.el.ingredients_text.value = item.ingredients_text || "";
    app.FoodEditor.el.traces.value = item.traces || "";

    if (item.barcode !== undefined) {
      app.FoodEditor.el.barcodeContainer.style.display = "block";
      app.FoodEditor.el.barcode.value = item.barcode;
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

      if (navigator.connection.type !== navigator.connection.NONE) {
        if ((wifiOnly && navigator.connection.type == navigator.connection.WIFI) || !wifiOnly) {
          if (item.image_url !== undefined) {
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
      "allowEdit": true,
      "saveToPhotoAlbum": false
    };

    navigator.camera.getPicture((image_uri) => {

        // Add new image
        let img = document.createElement("img");
        img.src = image_uri;
        img.style["width"] = "50%";

        img.addEventListener("taphold", function(e) {
          removePicture(index);
        });

        app.FoodEditor.el.photoHolder[index].innerHTML = "";
        app.FoodEditor.el.photoHolder[index].appendChild(img);
        app.FoodEditor.el.addPhoto[index].style.display = "none";
        app.FoodEditor.images[index] = image_uri;
        console.log(app.FoodEditor.images);
      },
      (err) => {
        app.Utils.toast("There was a problem accessing your camera.", 2000);
        console.error(err);
      }, options);
  },

  removePicture: function(index) {
    let title = app.strings["confirm-delete-title"] || "Delete";
    let text = app.strings["confirm-delete"] || "Are you sure?";

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

        if (data.quantity !== undefined)
          item.quantity = app.FoodEditor.el.quantity.value;

        if (data.category !== undefined)
          item.category = app.FoodEditor.el.category.value;
      }

      if (origin == "foodlist") {

        let now = new Date();
        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        item.dateTime = today;

        const nutriments = app.nutriments;
        const inputs = document.querySelectorAll("#food-edit-form input:not(#quantity), #food-edit-form textarea, #food-edit-form radio");

        if (data !== undefined && data.barcode !== undefined)
          item.barcode = data.barcode;

        if (app.FoodEditor.scan == false)
          item.unit = app.FoodEditor.el.unit.value;
        else
          item.unit = app.FoodEditor.el.uploadUnit.value;

        if (data.image_url !== undefined)
          item.image_url = data.image_url;

        item.nutrition = {};

        inputs.forEach((x, i) => {
          let id = x.id;
          let value = x.value;

          if (value) {
            if (nutriments.indexOf(id) != -1) { //Nutriments
              item.nutrition[id] = parseFloat(value);
            } else if (x.type == "radio") {
              if (item[x.name] == undefined && x.checked)
                item[x.name] = value;
            } else {
              item[id] = value;
            }
          }
        });
      }
      return item;
    }
  },

  returnItem: function(data, origin) {
    let item = app.FoodEditor.gatherFormData(data, origin);

    // Delete unneeded fields
    if (item.nutrition_per !== undefined)
      delete item.nutrition_per;

    app.f7.data.context = {
      item: item
    };
    app.f7.views.main.router.back();
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='food-editor']")) {
    let context = app.f7.views.main.router.currentRoute.context;
    app.FoodEditor.init(context);
  }
});