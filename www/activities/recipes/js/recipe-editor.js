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

app.RecipeEditor = {

  addingNewRecipe: undefined,
  editingEnabled: undefined,
  recipe_image_url: undefined,
  recipe: {},
  el: {},

  init: async function(context) {
    app.RecipeEditor.getComponents();

    if (context) {

      // From recipe list
      if (context.recipe) {
        app.RecipeEditor.recipe = context.recipe;
        app.RecipeEditor.populateInputs(context.recipe);
        app.RecipeEditor.populateMainImage(context.recipe);
      }

      app.FoodsMealsRecipes.populateCategoriesField(app.RecipeEditor.el.categories, app.RecipeEditor.recipe, false, false, true, true);

      // From food list
      if (context.items)
        app.RecipeEditor.addItems(context.items);

      // Returned from food editor
      if (context.item && context.index != undefined)
        app.RecipeEditor.replaceListItem(context.item, context.index);

      app.RecipeEditor.renderNutrition();
      await app.RecipeEditor.renderItems();
    }

    app.RecipeEditor.setupHardwareBackButtonExitHandling();
    app.RecipeEditor.setRequiredFieldErrorMessage();
    app.RecipeEditor.bindUIActions();
    app.RecipeEditor.setComponentVisibility();
  },

  getComponents: function() {
    app.RecipeEditor.el.page = document.querySelector(".page[data-name='recipe-editor']");
    app.RecipeEditor.el.submit = document.querySelector(".page[data-name='recipe-editor'] #submit");
    app.RecipeEditor.el.sort = document.querySelector(".page[data-name='recipe-editor'] #sort");
    app.RecipeEditor.el.categoriesContainer = document.querySelector(".page[data-name='recipe-editor'] #categories-container");
    app.RecipeEditor.el.categories = document.querySelector(".page[data-name='recipe-editor'] #categories");
    app.RecipeEditor.el.foodlist = document.querySelector(".page[data-name='recipe-editor'] #recipe-food-list");
    app.RecipeEditor.el.add = document.querySelector(".page[data-name='recipe-editor'] #add-food");
    app.RecipeEditor.el.nutrition = document.querySelector(".page[data-name='recipe-editor'] #nutrition");
    app.RecipeEditor.el.nutritionButton = document.querySelector(".page[data-name='recipe-editor'] #nutrition-button");
    app.RecipeEditor.el.mainPhoto = document.querySelector(".page[data-name='recipe-editor'] #main-photo");
    app.RecipeEditor.el.addPhoto = document.querySelector(".page[data-name='recipe-editor'] .add-photo");
    app.RecipeEditor.el.addPhotoCamera = document.querySelector(".page[data-name='recipe-editor'] .add-photo-camera");
    app.RecipeEditor.el.addPhotoLibrary = document.querySelector(".page[data-name='recipe-editor'] .add-photo-library");
    app.RecipeEditor.el.photoHolder = document.querySelector(".page[data-name='recipe-editor'] .photo-holder");
  },

  setComponentVisibility: function() {
    app.FoodsMealsRecipes.setCategoriesVisibility(app.RecipeEditor.el.categoriesContainer);

    if (app.RecipeEditor.editingEnabled == false) {
      app.RecipeEditor.el.sort.style.display = "none";
      app.RecipeEditor.el.add.style.display = "none";
    }
  },

  bindUIActions: function() {

    // Submit
    if (!app.RecipeEditor.el.submit.hasClickEvent) {
      app.RecipeEditor.el.submit.addEventListener("click", (e) => {
        app.RecipeEditor.save();
      });
      app.RecipeEditor.el.submit.hasClickEvent = true;
    }

    // Take photo
    if (!app.RecipeEditor.el.addPhotoCamera.hasClickEvent) {
      app.RecipeEditor.el.addPhotoCamera.addEventListener("click", (e) => {
        app.RecipeEditor.takePicture(Camera.PictureSourceType.CAMERA);
      });
      app.RecipeEditor.el.addPhotoCamera.hasClickEvent = true;
    }

    // Add photo from library
    if (!app.RecipeEditor.el.addPhotoLibrary.hasClickEvent) {
      app.RecipeEditor.el.addPhotoLibrary.addEventListener("click", (e) => {
        app.RecipeEditor.takePicture(Camera.PictureSourceType.PHOTOLIBRARY);
      });
      app.RecipeEditor.el.addPhotoLibrary.hasClickEvent = true;
    }

    // Add food button
    if (!app.RecipeEditor.el.add.hasClickEvent) {
      app.RecipeEditor.el.add.addEventListener("click", (e) => {
        app.data.context = {
          origin: "./recipe-editor/",
          recipe: app.RecipeEditor.recipe
        };

        app.f7.views.main.router.navigate("/foods-meals-recipes/", {
          context: app.data.context
        });
      });
      app.RecipeEditor.el.add.hasClickEvent = true;
    }

    // Nutrition fields visibility toggle button
    if (!app.RecipeEditor.el.nutritionButton.hasClickEvent) {
      app.RecipeEditor.el.nutritionButton.addEventListener("click", async (e) => {
        app.FoodsMealsRecipes.toggleNutritionFieldsVisibility(app.RecipeEditor.el.nutrition, app.RecipeEditor.el.nutritionButton);
      });
      app.RecipeEditor.el.nutritionButton.hasClickEvent = true;
    }

    // Item list sort
    if (!app.RecipeEditor.el.foodlist.hasSortableEvent) {
      app.RecipeEditor.el.foodlist.addEventListener("sortable:sort", (li) => {
        let items = app.RecipeEditor.el.foodlist.getElementsByTagName("li");
        app.RecipeEditor.recipe.items = [];
        for (let i = 0; i < items.length; i++) {
          let item = app.FoodsMealsRecipes.flattenItem(JSON.parse(items[i].data));
          app.RecipeEditor.recipe.items.push(item);
        }
      });
      app.RecipeEditor.el.foodlist.hasSortableEvent = true;
    }
  },

  setupHardwareBackButtonExitHandling: function() {
    if (app.RecipeEditor.addingNewRecipe)
      app.RecipeEditor.el.page.setAttribute("confirm-backbutton", "");
    else
      app.RecipeEditor.el.page.removeAttribute("confirm-backbutton");
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

  populateInputs: function(recipe) {
    let inputs = document.querySelectorAll(".page[data-name='recipe-editor'] input, .page[data-name='recipe-editor'] textarea");

    inputs.forEach((x) => {
      if (recipe[x.name] !== undefined)
        x.value = recipe[x.name];
    });
  },

  populateMainImage: function(recipe) {
    app.RecipeEditor.recipe_image_url = recipe.image_url;

    let mainPhotoEl = app.RecipeEditor.el.mainPhoto;
    let addPhotoEl = app.RecipeEditor.el.addPhoto;
    let photoHolderEl = app.RecipeEditor.el.photoHolder;
    let removedCallback = () => app.RecipeEditor.removePicture();
    app.FoodImages.populateMainImage(mainPhotoEl, addPhotoEl, photoHolderEl, recipe, true, removedCallback);
  },

  takePicture: function(sourceType) {
    let addPhotoEl = app.RecipeEditor.el.addPhoto;
    let photoHolderEl = app.RecipeEditor.el.photoHolder;
    let addedCallback = (blob) => app.RecipeEditor.addPicture(blob);
    let removedCallback = () => app.RecipeEditor.removePicture();
    app.FoodImages.takePicture(sourceType, addPhotoEl, photoHolderEl, addedCallback, removedCallback);
  },

  addPicture: async function(blob) {
    let sourceString = await app.FoodImages.imageBlobToBase64(blob);
    app.RecipeEditor.recipe_image_url = sourceString;
  },

  removePicture: function() {
    app.RecipeEditor.recipe_image_url = undefined;
  },

// New AddItems function to utilize promptAddItems
addItems: function(items) {
  return new Promise(async function(resolve, reject) {
    try{
      if (app.Settings.get("diary", "prompt-add-items") == true) {
        app.RecipeEditor.promptAddItems(items, 0, false);
      } else {
        items.forEach((x) => {
          app.RecipeEditor.addItemToEntry(x);
        });
      }
      resolve();
    } catch(err){
      reject(err);
    }
  });
},


promptAddItems: async function(items, index, renderAfterwards) {
  let item = items[index];

  if (item !== undefined) {
    if (item.name !== undefined && item.unit !== undefined) {

      // Re-render diary when prompts are done
      renderAfterwards = true;

      // Create dialog content
      let title = app.Utils.escapeHtml(app.Utils.tidyText(item.name, 50));

      let div = document.createElement("div");
      div.className = "dialog-text";

      if (item.notes && app.Settings.get("foodlist", "show-notes") == true)
        div.innerText = app.Utils.tidyText(item.notes, 50);

      // Input fields
      let inputs = document.createElement("form");
      inputs.className = "list no-hairlines scroll-dialog";
      let ul = document.createElement("ul");
      inputs.appendChild(ul);

      ["serving-size", "number-of-servings"].forEach((field) => {
        let li = document.createElement("li");
        li.className = "item-content item-input";
        ul.appendChild(li);

        let inner = document.createElement("div");
        inner.className = "item-inner";
        li.appendChild(inner);

        let fieldTitle = document.createElement("div");
        fieldTitle.className = "item-title item-label";
        fieldTitle.innerText = app.strings["food-editor"][field] || field;
        if (field == "serving-size")
          fieldTitle.innerText += " (" + item.unit + ")";
        inner.appendChild(fieldTitle);

        let inputWrap = document.createElement("div");
        inputWrap.className = "item-input-wrap";
        inner.appendChild(inputWrap);

        let input = document.createElement("input");
        input.className = "dialog-input auto-select";
        input.type = "number";
        if (field == "serving-size")
          input.setAttribute("value", item.portion || "");
        else
          input.setAttribute("value", "1");
        inputWrap.appendChild(input);
      });

      // Open dialog
      let dialog = app.f7.dialog.create({
        title: title,
        content: div.outerHTML + inputs.outerHTML,
        buttons: [{
          text: app.strings.dialogs.skip || "Skip",
          keyCodes: app.Utils.escapeKeyCode,
          onClick: async function(dialog) {
            app.RecipeEditor.promptAddItems(items, index + 1, renderAfterwards);
          }
        },
        {
          text: app.strings.dialogs.add || "Add",
          keyCodes: app.Utils.enterKeyCode,
          onClick: async function(dialog) {
            let inputs = Array.from(dialog.el.getElementsByTagName("input"));
            let portion = inputs[0].value;
            let quantity = inputs[1].value;

            if (portion !== "" && portion >= 0 && !isNaN(portion))
              item.portion = portion;
            if (quantity !== "" && quantity >= 0 && !isNaN(quantity))
              item.quantity = quantity;

            app.RecipeEditor.addItemToEntry(item);
            app.RecipeEditor.promptAddItems(items, index + 1, renderAfterwards);
          }
        }
        ]
      }).open();

    } else {
      // Item has no name (is a meal item) -> add it as is without prompt
      app.RecipeEditor.addItemToEntry(item);
      app.RecipeEditor.promptAddItems(items, index + 1, renderAfterwards);
    }
  } else {
    // No more items to process -> write entry to DB and render
    if (renderAfterwards) {
      app.RecipeEditor.renderItems();
    }
  }
},

addItemToEntry: function(item) {
  let result = app.RecipeEditor.recipe.items;
  item = app.FoodsMealsRecipes.flattenItem(item);  
  result.push(item);
  app.RecipeEditor.recipe.items = result;
},

  removeItem: function(item, li) {
    let title = app.strings.dialogs["delete-title"] || "Delete Entry";
    let text = app.strings.dialogs["confirm-delete"] || "Are you sure you want to delete this?";

    let dialog = app.f7.dialog.create({
      title: title,
      content: app.Utils.getDialogTextDiv(text),
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: app.Utils.escapeKeyCode
        },
        {
          text: app.strings.dialogs.delete || "Delete",
          keyCodes: app.Utils.enterKeyCode,
          onClick: () => {
            let index = $(li).index();
            app.RecipeEditor.recipe.items.splice(index, 1);
            app.RecipeEditor.renderNutrition();
            li.remove();
          }
        }
      ]
    }).open();
  },

  save: async function() {
    if (app.f7.input.validateInputs("#recipe-edit-form") == true) {

      let data = {};

      if (app.RecipeEditor.recipe.id !== undefined) data.id = app.RecipeEditor.recipe.id;
      if (app.RecipeEditor.recipe.items !== undefined) data.items = app.RecipeEditor.recipe.items;

      if (app.RecipeEditor.recipe_image_url !== undefined) data.image_url = app.RecipeEditor.recipe_image_url;

      // If recipe was archived, keep it archived
      if (app.RecipeEditor.recipe.archived === true) data.archived = true;
      else data.archived = false;

      data.dateTime = new Date();

      let inputs = document.querySelectorAll(".page[data-name='recipe-editor'] input, .page[data-name='recipe-editor'] textarea");

      inputs.forEach((x) => {
        if (x.value !== undefined && x.value != "")
          data[x.name] = x.hasAttribute("trim") ? x.value.trim() : x.value;
      });

      let categories = app.FoodsMealsRecipes.getSelectedCategories(app.RecipeEditor.el.categories);
      if (categories !== undefined)
        data.categories = categories;

      if (app.RecipeEditor.recipe.items !== undefined)
        data.nutrition = await app.FoodsMealsRecipes.getTotalNutrition(app.RecipeEditor.recipe.items, "subtract");

      app.data.context = {
        recipe: data
      };

      dbHandler.put(data, "recipes").onsuccess = () => {
        app.f7.views.main.router.back();
      };
    }
  },

  recipeItemClickHandler: function(item, li) {
    let index = $(li).index();
    app.FoodsMealsRecipes.gotoEditor(item, index);
  },

  replaceListItem: function(item, index) {
    let updatedItem = app.FoodsMealsRecipes.flattenItem(item);
    app.RecipeEditor.recipe.items.splice(index, 1, updatedItem);
  },

  renderNutrition: async function() {
    const nutrition = await app.FoodsMealsRecipes.getTotalNutrition(app.RecipeEditor.recipe.items, "subtract");

    const nutriments = app.Nutriments.getNutriments();
    const units = app.Nutriments.getNutrimentUnits();

    const ul = app.RecipeEditor.el.nutrition;
    ul.innerHTML = "";

    nutriments.forEach((x) => {

      if (nutrition[x] == undefined || nutrition[x] == 0) return;

      let unit = app.strings["unit-symbols"][units[x]] || units[x];

      let li = document.createElement("li");
      li.className = "item-content item-input";
      ul.appendChild(li);

      let innerDiv = document.createElement("div");
      innerDiv.className = "item-inner";
      li.appendChild(innerDiv);

      let title = document.createElement("div");
      title.className = "item-title item-label";
      let text = app.strings.nutriments[x] || x;
      title.innerText = app.Utils.tidyText(text, 25);
      if (unit !== undefined)
        title.innerText += " (" + unit + ")";
      innerDiv.appendChild(title);

      let after = document.createElement("div");
      after.className = "item-after nutrition-field";
      after.id = x;
      after.innerText = app.Utils.tidyNumber(Math.round(nutrition[x] * 100) / 100);
      innerDiv.appendChild(after);
    });

    app.FoodsMealsRecipes.setNutritionFieldsVisibility(ul, app.RecipeEditor.el.nutritionButton);
  },

  renderItems: function() {
    return new Promise(async function(resolve, reject) {
      app.RecipeEditor.el.foodlist.innerHTML = "";

      let clickable = (app.RecipeEditor.editingEnabled == true);

      app.RecipeEditor.recipe.items.forEach(async (x, i) => {
        app.FoodsMealsRecipes.renderItem(x, app.RecipeEditor.el.foodlist, false, true, clickable, app.RecipeEditor.recipeItemClickHandler, app.RecipeEditor.removeItem, undefined, false, true, "foodlist");
      });
      app.f7.sortable.disable(app.RecipeEditor.el.foodlist);

      resolve();
    });
  }
};

document.addEventListener("page:init", function(event) {
  if (event.detail.name == "recipe-editor") {
    let context = app.data.context;
    app.data.context = undefined;

    app.RecipeEditor.addingNewRecipe = (context == undefined || context.recipe == undefined);
    app.RecipeEditor.editingEnabled = (app.FoodsMealsRecipes.editItems == "enabled");

    // Clear old recipe
    app.RecipeEditor.recipe = {
      items: []
    };
    app.RecipeEditor.recipe_image_url = undefined;

    app.RecipeEditor.init(context);
  }
});

document.addEventListener("page:reinit", function(event) {
  if (event.detail.name == "recipe-editor") {
    let context = app.data.context;
    app.data.context = undefined;
    app.RecipeEditor.init(context);
  }
});