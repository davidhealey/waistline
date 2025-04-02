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



function evalInpEquation(strIn)
{
  let ret = 0;
  let strInTmp = strIn.trim();

  if (strInTmp.length == 0 || strInTmp == "+" || strInTmp == "-")
    return NaN;

  let cleanStr = strInTmp.replaceAll("+", " + ").replaceAll("-", " - ").replaceAll("  ", " ");
  let tokens = cleanStr.split(/\s+/);

  if (tokens[0] == "" && (tokens[1] == "+" || tokens[1] == "-"))
      tokens[0] = "0";

  ret = parseInt(tokens[0]);
  for (let i = 1; i < (tokens.length - 1); i+=2)
  {
    if (tokens[i] == "+")
        ret += (parseInt(tokens[i+1]) || 0);
    else if (tokens[i] == "-")
        ret -= (parseInt(tokens[i+1]) || 0);
  }

  return ret;
}


app.FoodEditor = {

  item: undefined,
  item_image_url: undefined,
  addingNewItem: undefined,
  index: undefined,
  scan: false,
  origin: undefined,
  linked: true,
  el: {},
  images: [],

  init: function(context) {

    app.FoodEditor.item = undefined;
    app.FoodEditor.item_image_url = undefined;
    app.FoodEditor.addingNewItem = true;
    app.FoodEditor.scan = false;
    app.FoodEditor.images = [];

    if (context) {

      app.FoodEditor.addingNewItem = (context.item == undefined || context.item.id == undefined);

      if (context.item !== undefined)
        app.FoodEditor.item = context.item;

      if (context.index !== undefined)
        app.FoodEditor.index = context.index;

      if (app.FoodEditor.addingNewItem)
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
    this.setupHardwareBackButtonExitHandling();
    this.setUploadFieldVisibility();
    this.setRequiredFieldErrorMessage();
    this.setLinkButtonIcon();

    const categoriesEditable = (app.FoodEditor.origin == "foodlist");
    app.FoodsMealsRecipes.populateCategoriesField(app.FoodEditor.el.categories, app.FoodEditor.item, false, false, categoriesEditable, true);

    if (app.FoodEditor.item) {
      this.populateFields(app.FoodEditor.item);
      this.populateMainImage(app.FoodEditor.item);
    }

    if (app.FoodEditor.item && app.FoodEditor.item.category !== undefined)
      this.populateCategoryField(app.FoodEditor.item);
  },

  getComponents: function() {
    app.FoodEditor.el.page = document.querySelector(".page[data-name='food-editor']");
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
    app.FoodEditor.el.ttsButton = document.querySelector(".page[data-name='food-editor'] #tts-button");
    app.FoodEditor.el.ttsIcon = document.querySelector(".page[data-name='food-editor'] #tts-icon");
    app.FoodEditor.el.nutritionButton = document.querySelector(".page[data-name='food-editor'] #nutrition-button");
    app.FoodEditor.el.mainPhoto = document.querySelector(".page[data-name='food-editor'] #main-photo");
    app.FoodEditor.el.addPhoto = Array.from(document.querySelectorAll(".page[data-name='food-editor'] .add-photo"));
    app.FoodEditor.el.addPhotoCamera = Array.from(document.querySelectorAll(".page[data-name='food-editor'] .add-photo-camera"));
    app.FoodEditor.el.addPhotoLibrary = Array.from(document.querySelectorAll(".page[data-name='food-editor'] .add-photo-library"));
    app.FoodEditor.el.photoHolder = Array.from(document.querySelectorAll(".page[data-name='food-editor'] .photo-holder"));
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

      // Force to only allow the given pattern as input
      if (!app.FoodEditor.el.portion.validity.valid)
      {
        e.target.value = e.target.oldValue;
        return;
      }

      if (!/^\d+$/.test(e.target.value))
      {
        let newValue = evalInpEquation(e.target.value)
        if (!isNaN(newValue))
        {
          e.target.value = newValue;
        }
      }
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
        app.FoodEditor.upload();
      });
      app.FoodEditor.el.upload.hasClickEvent = true;
    }

    // Read nutrition values loud TTS button
    if (!app.FoodEditor.el.ttsButton.hasClickEvent) {
      app.FoodEditor.el.ttsButton.addEventListener("click", async (e) => {
        if (app.FoodEditor.el.ttsIcon.innerText === "do_not_disturb_on") {
          app.TTS.stop();
          app.FoodEditor.el.ttsIcon.innerText = "play_circle";
          return;
        }
        app.FoodEditor.el.ttsIcon.innerText = "do_not_disturb_on";
        const text = app.FoodEditor.getNutrimentValuesTextToSpeechString();
        app.TTS.speak(text).then(() => {
          app.FoodEditor.el.ttsIcon.innerText = "play_circle";
        }).catch(() => {
          app.FoodEditor.el.ttsIcon.innerText = "play_circle";
        });
      });
      app.FoodEditor.el.ttsButton.hasClickEvent = true;
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

  setupHardwareBackButtonExitHandling: function() {
    if (app.FoodEditor.addingNewItem)
      app.FoodEditor.el.page.setAttribute("confirm-backbutton", "");
    else
      app.FoodEditor.el.page.removeAttribute("confirm-backbutton");
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

    const nutriments = app.Nutriments.getNutriments();
    const units = app.Nutriments.getNutrimentUnits(app.FoodEditor.scan == true);
    const energyUnit = app.Settings.get("units", "energy");

    if (item !== undefined && item.nutrition.kilojoules == undefined && energyUnit == units.kilojoules)
      item.nutrition.kilojoules = app.Utils.convertUnit(item.nutrition.calories, units.calories, units.kilojoules, 1);

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

  getNutrimentValuesTextToSpeechString: function() {
    const values = [];
    document.querySelectorAll("#food-edit-form #nutrition li:not(.item-hidden) input").forEach((input) => {
      const value = parseFloat(input.value);
      if (!isNaN(value))
        values.push(value);
    });
    return app.TTS.formatNumbersForTTS(values).join("\n");
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
      let code = item.originalBarcode || item.barcode; // prioritize originalBarcode if it exists, else show normal barcode

      app.FoodEditor.el.barcodeContainer.style.display = "block";
      app.FoodEditor.el.barcode.value = code;

      let url;
      if (item.barcode.startsWith("fdcId_"))
        url = "https://fdc.nal.usda.gov/food-details/" + code + "/nutrients";
      else
        url = "https://world.openfoodfacts.org/product/" + code;

      if (!app.FoodEditor.el.barcode.hasClickEvent) {
        app.FoodEditor.el.barcode.parentElement.addEventListener("click", (e) => {
          cordova.InAppBrowser.open(url, '_system');
        });
        app.FoodEditor.el.barcode.hasClickEvent = true;
      }
    }

    // Portion (serving size)
    if (item.portion != undefined) {
      app.FoodEditor.el.portion.value = parseFloat(item.portion);
      app.FoodEditor.el.portion.oldValue = parseFloat(item.portion);
    }

    // Quantity (number of servings)
    if (item.quantity != undefined) {
      app.FoodEditor.el.quantity.value = parseFloat(item.quantity);
    } else {
      app.FoodEditor.el.quantity.value = 1;
    }
    app.FoodEditor.el.quantity.oldValue = app.FoodEditor.el.quantity.value;
  },

  populateMainImage: function(item) {
    app.FoodEditor.item_image_url = item.image_url;

    let mainPhotoEl = app.FoodEditor.el.mainPhoto;
    let addPhotoEl = app.FoodEditor.el.addPhoto[0];
    let photoHolderEl = app.FoodEditor.el.photoHolder[0];
    let removable = (app.FoodEditor.origin == "foodlist");
    let removedCallback = () => app.FoodEditor.removePicture(0);

    app.FoodImages.populateMainImage(mainPhotoEl, addPhotoEl, photoHolderEl, item, removable, removedCallback);
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
        const nutriments = app.Nutriments.getNutriments();
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
    let addPhotoEl = app.FoodEditor.el.addPhoto[index];
    let photoHolderEl = app.FoodEditor.el.photoHolder[index];
    let addedCallback = (blob) => app.FoodEditor.addPicture(index, blob);
    let removedCallback = () => app.FoodEditor.removePicture(index);
    app.FoodImages.takePicture(sourceType, addPhotoEl, photoHolderEl, addedCallback, removedCallback);
  },

  addPicture: async function(index, blob) {
    if (app.FoodEditor.scan == true) {
      app.FoodEditor.images[index] = blob;
    } else {
      let sourceString = await app.FoodImages.imageBlobToBase64(blob);
      app.FoodEditor.item_image_url = sourceString;
    }
  },

  removePicture: function(index) {
    if (app.FoodEditor.scan == true) {
      app.FoodEditor.images[index] = undefined;
    } else {
      app.FoodEditor.item_image_url = undefined;
    }
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
        const nutriments = app.Nutriments.getNutriments();
        const units = app.Nutriments.getNutrimentUnits();
        const energyUnit = app.Settings.get("units", "energy");
        const inputs = document.querySelectorAll("#food-edit-form #nutrition input, #food-edit-form input[type='radio'], #food-edit-form textarea");
        const caloriesEl = document.getElementById("calories");
        const kilojoulesEl = document.getElementById("kilojoules");

        if (data !== undefined) {
          if (data.barcode !== undefined)
            item.barcode = data.barcode;

          if (data.originalBarcode !== undefined)
            item.originalBarcode = data.originalBarcode;
        }

        item.name = app.FoodEditor.el.name.value.trim();

        item.brand = app.FoodEditor.el.brand.value.trim();

        if (app.FoodEditor.scan == true)
          item.unit = app.FoodEditor.el.uploadUnit.value;
        else
          item.unit = app.FoodEditor.el.unit.value.trim();

        if (app.FoodEditor.item_image_url !== undefined)
          item.image_url = app.FoodEditor.item_image_url;

        item.nutrition = {};

        // Always store a calorie value
        if (!caloriesEl.value || energyUnit == units.kilojoules) {
          if (kilojoulesEl.value)
            caloriesEl.value = app.Utils.convertUnit(kilojoulesEl.value, units.kilojoules, units.calories, 1);
          else
            caloriesEl.value = "";
        }

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
    let title = app.strings.dialogs["download-title"] || "Retrieve latest information";
    let text = app.strings.dialogs["download-text"] || "Your local values will be replaced by the latest information available for this item";

    let div = document.createElement("div");
    div.className = "dialog-text";

    let p = document.createElement("p");
    p.innerText = text;
    div.appendChild(p);

    // Create dialog inputs
    let inputs = document.createElement("form");
    inputs.className = "list no-hairlines no-hairlines-between no-margin";
    div.appendChild(inputs);

    let ul = document.createElement("ul");
    inputs.appendChild(ul);

    ["image", "name-and-brand", "nutriments-per-serving", "nutriments-per-100"].forEach((field) => {
      let li = document.createElement("li");
      ul.appendChild(li);

      let label = document.createElement("label");
      label.className = "item-checkbox item-content";
      li.appendChild(label);

      let input = document.createElement("input");
      input.type = "checkbox";
      input.id = field;
      if (field === "image" && app.FoodEditor.item.barcode.startsWith("fdcId_")) {
        // USDA database has no images
        label.classList.add("disabled");
        input.setAttribute("disabled", "");
      } else if (field !== "nutriments-per-100") {
        // All fields are selected by default, except nutriments-per-100
        input.setAttribute("checked", "");
      }
      label.appendChild(input);

      let i = document.createElement("i");
      i.className = "icon icon-checkbox";
      label.appendChild(i);

      let div = document.createElement("div");
      div.className = "item-inner";
      div.innerText = app.strings["food-editor"][field] || field;
      label.appendChild(div);
    });

    let dialog = app.f7.dialog.create({
      title: title,
      content: div.outerHTML,
      on: {
        opened: () => {
          ["nutriments-per-serving", "nutriments-per-100"].forEach((field) => {
            // At most one nutriments field can be selected at a time
            let otherNutrimentFieldId = field === "nutriments-per-serving" ? "nutriments-per-100" : "nutriments-per-serving";
            document.getElementById(field).addEventListener("change", (e) => {
              if (e.target.checked) document.getElementById(otherNutrimentFieldId).checked = false;
            });
          });
        }
      },
      buttons: [{
          text: app.strings.dialogs.ok || "OK",
          onClick: async (dialog) => {
            let valuesToGet = Array.from(dialog.el.getElementsByTagName("input")).map((input) => input.checked);
            app.FoodEditor.downloadItemInfo(valuesToGet);
          }
        },
        {
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: app.Utils.escapeKeyCode
        }
      ]
    }).open();
  },

  downloadItemInfo: async function(valuesToGet) {
    let [getImage, getNameAndBrand, getNutrimentsServing, getNutriments100] = valuesToGet;
    let getNutriments = getNutrimentsServing || getNutriments100;

    if (app.Utils.isInternetConnected()) {
      let barcode = app.FoodEditor.item.barcode;
      let originalBarcode = app.FoodEditor.item.originalBarcode || app.FoodEditor.item.barcode;
      let result;

      app.f7.preloader.show();

      if (barcode !== undefined) {
        if (barcode.startsWith("fdcId_"))
          result = await app.USDA.search(originalBarcode, getNutriments100);
        else
          result = await app.OpenFoodFacts.search(originalBarcode, getNutriments100);
      }

      app.f7.preloader.hide();

      if (result !== undefined && result.length > 0) {
        item = result[0];
        item.notes = app.FoodEditor.el.notes.value; // Always keep local notes, do not overwrite
        if (!getNameAndBrand) {
          item.name = app.FoodEditor.el.name.value; // Keep local name
          item.brand = app.FoodEditor.el.brand.value; // Keep local brand
        }
        if (!getNutriments) {
          item.portion = app.FoodEditor.el.portion.value; // Keep local serving size
          item.unit = app.FoodEditor.el.unit.value; // Keep local unit
        }
        app.FoodEditor.populateFields(item);
        if (getImage) {
          app.FoodEditor.populateMainImage(item);
        }
        if (getNutriments) {
          app.FoodEditor.renderNutritionFields(item);
        }
      } else {
        let msg = (result === undefined) ?
          app.strings.dialogs["no-response"] || "No response from server" :
          app.strings.dialogs["no-results"] || "No matching results";
        app.Utils.toast(msg);
      }
    }
  },

  upload: async function() {
    if (app.Utils.isInternetConnected()) {
      let data = app.FoodEditor.gatherFormData(app.FoodEditor.item, app.FoodEditor.origin);

      if (data !== undefined) {
        if (app.FoodEditor.images[0] !== undefined) {
          data.images = app.FoodEditor.images;

          app.f7.preloader.show();

          let uploadedItem = await app.OpenFoodFacts.upload(data).catch((e) => {
            let msg = app.strings.dialogs["upload-failed"] || "Unfortunately the upload failed. Please try again or contact the developer.";
            app.Utils.toast(msg);
          });

          app.f7.preloader.hide();

          if (uploadedItem !== undefined) {
            app.FoodEditor.afterUploadPrompt(uploadedItem);
          }

        } else {
          let msg = app.strings.dialogs["main-image"] || "Please add a main image";
          app.Utils.toast(msg);
        }
      } else {
        let msg = app.strings.dialogs["required-fields"] || "Please complete all required fields.";
        app.Utils.toast(msg);
      }
    }
  },

  afterUploadPrompt: async function(uploadedItem) {
    let title = app.strings.dialogs["upload-success"] || "Product successfully added to Open Food Facts";
    let text = app.strings.dialogs["upload-add-to-foodlist"] || "Do you want to add the uploaded item to your list of foods?";

    let dialog = app.f7.dialog.create({
      title: title,
      content: app.Utils.getDialogTextDiv(text),
      buttons: [{
          text: app.strings.dialogs.no || "No",
          keyCodes: app.Utils.escapeKeyCode
        },
        {
          text: app.strings.dialogs.yes || "Yes",
          keyCodes: app.Utils.enterKeyCode,
          onClick: () => {
            app.data.context = {
              item: uploadedItem
            };
          }
        }
      ],
      on: {
        closed: () => {
          app.f7.views.main.router.back();
        }
      }
    }).open();
  }
};

document.addEventListener("page:init", function(event) {
  if (event.target.matches(".page[data-name='food-editor']")) {
    let context = app.data.context;
    app.data.context = undefined;
    app.FoodEditor.init(context);
  }
});

document.addEventListener("page:beforeout", function(event) {
  if (event.target.matches(".page[data-name='food-editor']")) {
    app.TTS.stop();
  }
});