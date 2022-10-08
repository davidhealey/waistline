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
  item_image_url: undefined,
  index: undefined,
  scan: false,
  origin: undefined,
  linked: true,
  el: {},
  images: [],

  init: function(context) {

    app.FoodEditor.item = undefined;
    app.FoodEditor.item_image_url = undefined;
    app.FoodEditor.scan = false;
    app.FoodEditor.images = [];

    if (context) {

      if (context.item !== undefined)
        app.FoodEditor.item = context.item;

      if (context.index !== undefined)
        app.FoodEditor.index = context.index;

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
    this.setRequiredFieldErrorMessage();
    this.setLinkButtonIcon();

    const categoriesEditable = (app.FoodEditor.origin == "foodlist");
    app.FoodsMealsRecipes.populateCategoriesField(app.FoodEditor.el.categories, app.FoodEditor.item, false, categoriesEditable, true);

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
    app.FoodEditor.el.linkIcon = document.querySelector(".page[data-name='food-editor'] #link-icon");
    app.FoodEditor.el.download = document.querySelector(".page[data-name='food-editor'] #download");
    app.FoodEditor.el.upload = document.querySelector(".page[data-name='food-editor'] #upload");
    app.FoodEditor.el.submit = document.querySelector(".page[data-name='food-editor'] #submit");
    app.FoodEditor.el.barcodeContainer = document.querySelector(".page[data-name='food-editor'] #barcode-container");
    app.FoodEditor.el.barcode = document.querySelector(".page[data-name='food-editor'] #barcode");
    app.FoodEditor.el.categoriesContainer = document.querySelector(".page[data-name='food-editor'] #categories-container");
    app.FoodEditor.el.categories = document.querySelector(".page[data-name='food-editor'] #categories");
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
    app.FoodEditor.el.nutritionButton = document.querySelector(".page[data-name='food-editor'] #nutrition-button");
    app.FoodEditor.el.mainPhoto = document.querySelector(".page[data-name='food-editor'] #main-photo");
    app.FoodEditor.el.addPhoto = Array.from(document.getElementsByClassName("add-photo"));
    app.FoodEditor.el.addPhotoCamera = Array.from(document.getElementsByClassName("add-photo-camera"));
    app.FoodEditor.el.addPhotoLibrary = Array.from(document.getElementsByClassName("add-photo-library"));
    app.FoodEditor.el.photoHolder = Array.from(document.getElementsByClassName("photo-holder"));
  },

  bindUIActions: function() {

    // Submit
    app.FoodEditor.el.submit.addEventListener("click", (e) => {
      app.FoodEditor.returnItem(app.FoodEditor.item, app.FoodEditor.index, app.FoodEditor.origin);
    });

    // Portion
    app.FoodEditor.el.portion.addEventListener("input", (e) => {
      app.FoodEditor.changeServing(app.FoodEditor.item, "portion", e.target.value);
    });
    app.FoodEditor.el.portion.addEventListener("change", (e) => {
      if (e.target.oldValue == undefined && e.target.value != 0)
        e.target.oldValue = e.target.value;
    });

    // Quantity
    app.FoodEditor.el.quantity.addEventListener("input", (e) => {
      app.FoodEditor.changeServing(app.FoodEditor.item, "quantity", e.target.value);
    });

    // Link/Unlink
    app.FoodEditor.el.link.addEventListener("click", (e) => {
      app.FoodEditor.linked = 1 - app.FoodEditor.linked;
      app.FoodEditor.setLinkButtonIcon();
    });

    // Download
    if (!app.FoodEditor.el.download.hasClickEvent) {
      app.FoodEditor.el.download.addEventListener("click", async (e) => {
        app.FoodEditor.download();
      });
      app.FoodEditor.el.download.hasClickEvent = true;
    }

    // Upload
    if (!app.FoodEditor.el.upload.hasClickEvent) {
      app.FoodEditor.el.upload.addEventListener("click", async (e) => {
        await app.FoodEditor.upload();
        app.f7.views.main.router.navigate("/foods-meals-recipes/");
      });
      app.FoodEditor.el.upload.hasClickEvent = true;
    }

    // Nutrition fields visibility toggle button
    if (!app.FoodEditor.el.nutritionButton.hasClickEvent) {
      app.FoodEditor.el.nutritionButton.addEventListener("click", async (e) => {
        app.FoodsMealsRecipes.toggleNutritionFieldsVisibility(app.FoodEditor.el.nutrition, app.FoodEditor.el.nutritionButton);
      });
      app.FoodEditor.el.nutritionButton.hasClickEvent = true;
    }

    // Take photo
    app.FoodEditor.el.addPhotoCamera.forEach((x, i) => {
      if (!x.hasClickEvent) {
        x.addEventListener("click", (e) => {
          app.FoodEditor.takePicture(i, Camera.PictureSourceType.CAMERA);
        });
        x.hasClickEvent = true;
      }
    });

    // Add photo from library
    app.FoodEditor.el.addPhotoLibrary.forEach((x, i) => {
      if (!x.hasClickEvent) {
        x.addEventListener("click", (e) => {
          app.FoodEditor.takePicture(i, Camera.PictureSourceType.PHOTOLIBRARY);
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
      app.FoodEditor.el.link.style.display = "none";
      app.FoodEditor.linked = true;
      app.FoodEditor.el.quantityContainer.style.display = "block";

      app.FoodEditor.el.name.style.color = "grey";
      app.FoodEditor.el.brand.style.color = "grey";
      app.FoodEditor.el.unit.style.color = "grey";
      app.FoodEditor.el.notes.disabled = true;
      app.FoodEditor.el.notes.style.color = "grey";

      if (app.Settings.get("foodlist", "show-category-labels") !== true)
        app.FoodEditor.el.categoriesContainer.style.display = "none";

    } else {
      app.FoodEditor.el.quantityContainer.style.display = "none";

      if (app.FoodEditor.scan == true) {
        app.FoodEditor.el.link.style.display = "none";
      } else {
        app.FoodEditor.el.link.style.display = "block";

        if (app.FoodEditor.item !== undefined && app.FoodEditor.item.barcode !== undefined && !app.FoodEditor.item.barcode.startsWith("custom_"))
          app.FoodEditor.el.download.style.display = "block";
      }
    }

    app.FoodsMealsRecipes.setCategoriesVisibility(app.FoodEditor.el.categoriesContainer);

    if (app.Settings.get("foodlist", "show-notes") == true)
      app.FoodEditor.el.notesContainer.style.display = "block";
    else
      app.FoodEditor.el.notesContainer.style.display = "none";

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
      if (app.FoodEditor.scan != true) {
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
      }
    });
  },

  setRequiredFieldErrorMessage: function() {
    const error_message = app.strings["food-editor"]["required-field-message"] || "Please fill out this field.";
    let inputs = Array.from(document.getElementsByTagName("input"));
    inputs.forEach((x) => {
      if (x.hasAttribute("required") && x.hasAttribute("validate")) {
        x.setAttribute("data-error-message", error_message);
      }
    });
  },

  setLinkButtonIcon: function() {
    if (app.FoodEditor.linked)
      app.FoodEditor.el.linkIcon.innerText = "link";
    else
      app.FoodEditor.el.linkIcon.innerText = "link_off";
  },

  updateTitle: function() {
    if (!app.FoodEditor.item || app.FoodEditor.item.id == undefined) {
      app.FoodEditor.el.title.innerText = app.strings["food-editor"]["add-new-item"] || "Add New Item";
    } else if (app.FoodEditor.origin != undefined) {
      const origins = ["diary", "foodlist", "meals", "recipes"];
      const titles = [
        app.strings["diary"]["title"] || "Diary",
        app.strings["food-editor"]["edit-food"] || "Edit Food Item",
        app.strings["food-editor"]["edit-meal"] || "Edit Meal Item",
        app.strings["food-editor"]["edit-recipe"] || "Edit Recipe Item"
      ];

      let title = titles[origins.indexOf(app.FoodEditor.origin)];
      app.FoodEditor.el.title.innerText = title;
    }
  },

  /* Nutrition fields are dynamically created for the nutriments of the item */
  renderNutritionFields: function(item) {

    const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    const units = app.Nutriments.getNutrimentUnits(app.FoodEditor.scan == true);
    const energyUnit = app.Settings.get("units", "energy");

    if (item !== undefined && item.nutrition.kilojoules == undefined && energyUnit == units.kilojoules)
      item.nutrition.kilojoules = app.Utils.convertUnit(item.nutrition.calories, units.calories, units.kilojoules);

    let ul = app.FoodEditor.el.nutrition;
    ul.innerHTML = "";

    for (let k of nutriments) {

      if (app.FoodEditor.origin == "foodlist" || (item !== undefined && item.nutrition[k])) { // All nutriments or only items nutriments
        let li = document.createElement("li");
        li.className = "item-content item-input";

        let name = app.strings.nutriments[k] || k;
        let unit = app.strings["unit-symbols"][units[k]] || units[k];

        ul.appendChild(li);

        let innerDiv = document.createElement("div");
        innerDiv.className = "item-inner";
        li.appendChild(innerDiv);

        let titleDiv = document.createElement("div");
        titleDiv.className = "item-title item-label";
        let label = document.createElement("label");
        label.setAttribute("for", k);
        label.innerText = app.Utils.tidyText(name, 25);
        if (unit !== undefined)
          label.innerText += " (" + unit + ")";
        titleDiv.appendChild(label);
        innerDiv.appendChild(titleDiv);

        let inputWrapper = document.createElement("div");
        inputWrapper.className = "item-input-wrap";
        innerDiv.appendChild(inputWrapper);

        let input = document.createElement("input");
        input.id = k;
        input.className = "nutrition-field align-end auto-select";
        input.type = "number";
        input.step = "0.001";
        input.placeholder = "0";
        input.name = k;

        if (k != "calories" && k != "kilojoules")
          input.min = "0";

        const errorMessage = app.strings["food-editor"]["invalid-value-message"] || "Invalid Value.";
        input.setAttribute("validate", "");
        input.setAttribute("data-error-message", errorMessage);

        if (item) {
          if (item.nutrition[k] !== 0)
            input.value = Math.round(item.nutrition[k] * 1000) / 1000 || "";
          else
            input.value = 0;

          input.oldValue = input.value;
        } else {
          input.value = "";
          input.oldValue = "";
        }

        input.addEventListener("input", (e) => {
          app.FoodEditor.changeServing(item, k, e.target.value);
        });
        input.addEventListener("change", (e) => {
          if (e.target.oldValue == 0)
            e.target.oldValue = e.target.value / ((app.FoodEditor.el.portion.value / app.FoodEditor.el.portion.oldValue) || 1);
          if (e.target.value == 0)
            e.target.oldValue = 0;
        });
        inputWrapper.appendChild(input);
      }
    }

    app.FoodsMealsRecipes.setNutritionFieldsVisibility(app.FoodEditor.el.nutrition, app.FoodEditor.el.nutritionButton);
  },

  populateCategoryField: function(item) {
    const mealNames = app.Settings.get("diary", "meal-names");
    app.FoodEditor.el.category.innerHTML = "";

    mealNames.forEach((x, i) => {
      if (x != "") {
        let option = document.createElement("option");
        option.value = i;
        option.innerText = app.strings.diary["default-meals"][x.toLowerCase()] || x;
        if (i == item.category) option.setAttribute("selected", "");
        app.FoodEditor.el.category.append(option);
      }
    });

    if (app.FoodEditor.el.category.childElementCount == 0) {
      let option = document.createElement("option");
      option.value = 0;
      option.setAttribute("selected", "");
      app.FoodEditor.el.category.append(option);
    }

    if (app.FoodEditor.el.category.childElementCount == 1) {
      app.FoodEditor.el.categoryContainer.style.display = "none";
    }
  },

  populateFields: function(item) {
    app.FoodEditor.el.name.value = app.Utils.tidyText(item.name, 200);
    app.FoodEditor.el.brand.value = app.Utils.tidyText(item.brand, 200);
    app.FoodEditor.el.unit.value = item.unit || "";
    app.FoodEditor.el.notes.value = item.notes || "";

    if (item.barcode !== undefined && !item.barcode.startsWith("custom_")) {
      let code = item.barcode.replace("fdcId_", "");

      app.FoodEditor.el.barcodeContainer.style.display = "block";
      app.FoodEditor.el.barcode.value = code;

      if (navigator.connection.type !== "none") {
        let url;
        if (item.barcode.startsWith("fdcId_"))
          url = "https://fdc.nal.usda.gov/fdc-app.html#/food-details/" + code + "/nutrients";
        else
          url = "https://world.openfoodfacts.org/product/" + code;

        if (!app.FoodEditor.el.barcode.hasClickEvent) {
          app.FoodEditor.el.barcode.parentElement.addEventListener("click", (e) => {
            cordova.InAppBrowser.open(url, '_system');
            return false;
          });
          app.FoodEditor.el.barcode.hasClickEvent = true;
        }
      }
    }

    // Portion (serving size)
    if (item.portion != undefined) {
      app.FoodEditor.el.portion.value = parseFloat(item.portion);
      app.FoodEditor.el.portion.oldValue = parseFloat(item.portion);
    }

    // Quantity (number of servings)
    if (item.type == "recipe") {
      // number of servings field not needed for recipes
      app.FoodEditor.el.quantityContainer.style.display = "none";
      app.FoodEditor.el.quantity.value = 1;
    } else if (item.quantity != undefined) {
      app.FoodEditor.el.quantity.value = parseFloat(item.quantity);
    } else {
      app.FoodEditor.el.quantity.value = 1;
    }
    app.FoodEditor.el.quantity.oldValue = app.FoodEditor.el.quantity.value;
  },

  populateImage: function(item) {
    app.FoodEditor.item_image_url = item.image_url;

    app.FoodEditor.el.mainPhoto.style.display = "none";

    if (item.image_url !== undefined && item.image_url !== "" && item.image_url !== "undefined") {

      if (app.Settings.get("foodlist", "show-images")) {

        if (item.image_url.startsWith("http")) {
          let wifiOnly = app.Settings.get("foodlist", "wifi-images");
          if (app.mode == "development") wifiOnly = false;

          if (navigator.connection.type !== "none") {
            if ((wifiOnly && navigator.connection.type == "wifi") || !wifiOnly) {
              let src = unescape(item.image_url);
              app.FoodEditor.insertImageEl(0, src, false);
            }
          }
        } else {
          let removable = (app.FoodEditor.origin == "foodlist");
          app.FoodEditor.insertImageEl(0, item.image_url, removable);
        }
      }
    } else if (app.FoodEditor.origin == "foodlist") {
      app.FoodEditor.el.mainPhoto.style.display = "block";
      app.FoodEditor.el.addPhoto[0].style.display = "flex";
      app.FoodEditor.el.photoHolder[0].innerHTML = "";
    }
  },

  insertImageEl: function(index, src, removable) {
    const holder = app.FoodEditor.el.photoHolder[index];
    holder.innerHTML = "";

    app.FoodEditor.el.mainPhoto.style.display = "block";
    app.FoodEditor.el.addPhoto[index].style.display = "none";

    let img = document.createElement("img");
    img.src = src;
    img.style["max-width"] = "80vw";
    img.style["max-height"] = "40vh";

    if (removable == true) {
      holder.classList.add("ripple");
      img.addEventListener("taphold", function(e) {
        app.FoodEditor.removePicture(index);
      });
    } else {
      holder.classList.remove("ripple");
    }

    holder.appendChild(img);
  },

  changeServing: function(item, field, newValue) {

    if (app.FoodEditor.linked) {

      let multiplier;
      let oldValue;

      if (field == "portion" || field == "quantity")
        oldValue = app.FoodEditor.el[field].oldValue;
      else
        oldValue = document.querySelector("#food-edit-form #" + field).oldValue;

      if (oldValue > 0 && newValue > 0) {
        let oldQuantity = app.FoodEditor.el.quantity.oldValue || 1;
        let newQuantity = app.FoodEditor.el.quantity.value || 1;
        let oldPortion = app.FoodEditor.el.portion.oldValue;
        let newPortion = app.FoodEditor.el.portion.value;

        if (field == "portion" || field == "quantity") {
          multiplier = (newPortion / oldPortion) * (newQuantity / oldQuantity);
        } else {
          multiplier = (newValue / oldValue) / (newQuantity / oldQuantity);
          app.FoodEditor.el.portion.value = Math.round(oldPortion * multiplier * 100) / 100;
        }

        //Nutrition 
        const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
        for (let k of nutriments) {
          if (k != field) {
            try {
              let input = document.querySelector("#food-edit-form #" + k);
              if (input && input.value !== "") {
                input.value = Math.round(input.oldValue * multiplier * 100) / 100 || 0;
              }
            } catch (e) { }
          }
        }
      }
    }
  },

  takePicture: function(index, sourceType) {

    let destinationType = Camera.DestinationType.FILE_URI;

    // Pictures from the library must be retrieved as base64 data to avoid permission errors
    if (sourceType === Camera.PictureSourceType.PHOTOLIBRARY)
      destinationType = Camera.DestinationType.DATA_URL;

    let options = {
      "sourceType": sourceType,
      "destinationType": destinationType,
      "saveToPhotoAlbum": false,
      "quality": 25
    };

    navigator.camera.getPicture(onSuccess, onError, options);

    function onSuccess(image) {
      (async () => {

        let blob;
        if (sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
          let uri = "data:image/jpeg;base64," + image;
          let res = await fetch(uri);
          blob = await res.blob();
        } else {
          if (app.Settings.get("integration", "edit-images") == true) {
            let newPath = await app.Utils.cropImage(image);
            blob = await app.Utils.fileToBlob(newPath);
          } else {
            blob = await app.Utils.fileToBlob(image);
          }
        }

        if (app.FoodEditor.scan == true) {
          app.FoodEditor.images[index] = blob;
        } else {
          app.f7.preloader.show();
          let resizedBlob = await app.Utils.resizeImageBlob(blob, "jpeg");
          let sourceString = await app.Utils.blobToBase64(resizedBlob);
          app.f7.preloader.hide();
          app.FoodEditor.item_image_url = sourceString;
        }

        let blobUrl = URL.createObjectURL(blob);
        app.FoodEditor.insertImageEl(index, blobUrl, true);
      })();
    }

    function onError(err) {
      let msg = app.strings.dialogs["camera-problem"] || "There was a problem accessing your camera.";
      app.Utils.toast(msg, 2500);
      console.error(err);
    }
  },

  removePicture: function(index) {
    let title = app.strings.dialogs.delete || "Delete";
    let text = app.strings.dialogs["confirm-delete"] || "Are you sure you want to delete this?";

    let div = document.createElement("div");
    div.className = "dialog-text";
    div.innerText = text;

    let dialog = app.f7.dialog.create({
      title: title,
      content: div.outerHTML,
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: [27]
        },
        {
          text: app.strings.dialogs.delete || "Delete",
          keyCodes: [13],
          onClick: () => {
            app.FoodEditor.el.addPhoto[index].style.display = "flex";
            app.FoodEditor.el.photoHolder[index].innerHTML = "";

            if (app.FoodEditor.scan == true)
              app.FoodEditor.images[index] = undefined;
            else
              app.FoodEditor.item_image_url = undefined;
          }
        }
      ]
    }).open();
  },

  gatherFormData: function(data, origin) {
    if (app.f7.input.validateInputs("#food-edit-form") == true) {

      let item = {};
      item.portion = app.FoodEditor.el.portion.value;

      if (data !== undefined) {
        if (data.id !== undefined)
          item.id = data.id;

        if (data.type !== undefined)
          item.type = data.type;

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
        const nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
        const units = app.Nutriments.getNutrimentUnits();
        const energyUnit = app.Settings.get("units", "energy");
        const inputs = document.querySelectorAll("#food-edit-form input:not(#barcode):not(#unit):not(#quantity), #food-edit-form textarea, #food-edit-form radio");
        const caloriesEl = document.getElementById("calories");
        const kilojoulesEl = document.getElementById("kilojoules");

        if (data !== undefined && data.barcode !== undefined)
          item.barcode = data.barcode;

        if (app.FoodEditor.scan == true)
          item.unit = app.FoodEditor.el.uploadUnit.value;
        else
          item.unit = app.FoodEditor.el.unit.value;

        if (app.FoodEditor.item_image_url !== undefined)
          item.image_url = app.FoodEditor.item_image_url;

        item.nutrition = {};

        // Always store a calorie value
        if (energyUnit == units.kilojoules && kilojoulesEl.value)
          caloriesEl.value = app.Utils.convertUnit(kilojoulesEl.value, units.kilojoules, units.calories);

        for (let i = 0; i < inputs.length; i++) {
          let x = inputs[i];
          let id = x.id;
          let value = x.value;

          if (id !== "" && value) {
            if (nutriments.includes(id)) {
              item.nutrition[id] = parseFloat(value);
            } else if (x.type == "radio") {
              if (item[x.name] == undefined && x.checked)
                item[x.name] = value;
            } else {
              item[id] = value;
            }
          }
        }

        let categories = app.FoodsMealsRecipes.getSelectedCategories(app.FoodEditor.el.categories);
        if (categories !== undefined)
          item.categories = categories;
      }

      return item;
    }
    return undefined;
  },

  returnItem: function(data, index, origin) {
    let item = app.FoodEditor.gatherFormData(data, origin);

    if (item !== undefined) {
      // Delete unneeded fields
      if (item.nutrition_per !== undefined)
        delete item.nutrition_per;

      // If item was archived, keep it archived
      if (data !== undefined && data.archived === true) item.archived = true;
      else item.archived = false;

      // If item was hidden, unhide it
      if (item.hidden === true) item.hidden = false;

      app.data.context = {
        item: item,
        index: index
      };

      app.f7.views.main.router.back();
    }
  },

  download: function() {
    if (app.Utils.isInternetConnected()) {

      let title = app.strings.dialogs["download-title"] || "Retrieve latest information";
      let text = app.strings.dialogs["download-text"] || "Your local values will be replaced by the latest information available for this item";

      let div = document.createElement("div");
      div.className = "dialog-text";
      div.innerText = text;

      let dialog = app.f7.dialog.create({
        title: title,
        content: div.outerHTML,
        verticalButtons: true,
        buttons: [{
            text: app.strings["food-editor"]["per-serving"] || "Per Serving",
            keyCodes: [13],
            onClick: async () => {
              app.FoodEditor.downloadItemInfo(false);
            }
          },
          {
            text: app.strings["food-editor"]["per-100"] || "Per 100g/100ml",
            onClick: async () => {
              app.FoodEditor.downloadItemInfo(true);
            }
          },
          {
            text: app.strings.dialogs.cancel || "Cancel",
            keyCodes: [27]
          }
        ]
      }).open();
    }
  },

  downloadItemInfo: async function(preferDataPer100g) {
    let barcode = app.FoodEditor.item.barcode;
    let result;

    app.f7.preloader.show();

    if (barcode !== undefined) {
      if (barcode.startsWith("fdcId_"))
        result = await app.USDA.search(barcode.replace("fdcId_", ""), preferDataPer100g);
      else
        result = await app.OpenFoodFacts.search(barcode, preferDataPer100g);
    }

    app.f7.preloader.hide();

    if (result !== undefined && result.length > 0) {
      item = result[0];
      item.notes = app.FoodEditor.el.notes.value; // Keep local notes, do not overwrite
      app.FoodEditor.populateFields(item);
      if (!barcode.startsWith("fdcId_"))
        app.FoodEditor.populateImage(item);
      app.FoodEditor.renderNutritionFields(item);
    }
  },

  upload: function() {
    return new Promise(async function(resolve, reject) {
      if (app.Utils.isInternetConnected()) {
        let data = app.FoodEditor.gatherFormData(app.FoodEditor.item, app.FoodEditor.origin);

        if (data !== undefined) {
          if (app.FoodEditor.images[0] !== undefined) {
            data.images = app.FoodEditor.images;
            app.f7.preloader.show();

            let imgUrl = await app.OpenFoodFacts.upload(data).catch((e) => {
              let msg = app.strings.dialogs["upload-failed"] || "Upload Failed";
              app.Utils.toast(msg);
            });

            if (imgUrl !== undefined) {
              let msg = app.strings.dialogs["upload-success"] || "Product successfully added to Open Food Facts";
              app.Utils.toast(msg, 2500);
            }

            app.f7.preloader.hide();

            resolve();
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