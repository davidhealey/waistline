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

app.FoodsCategories = {

  storeNames: ["foodList", "meals", "recipes"],
  defaultLabels: ["🌳", "🏪"],
  defaultCategories: {"🌳": "", "🏪": ""},

  populateFoodCategoriesList: function() {
    let labels = app.Settings.get("foodlist", "labels") || [];
    let categories = app.Settings.get("foodlist", "categories") || {};
    let ul = document.querySelector("#food-categories-list");
    ul.innerHTML = "";

    labels.forEach((label) => {

      let li = document.createElement("li");
      li.id = label;
      ul.appendChild(li);

      let content = document.createElement("div");
      content.className = "item-content";
      li.appendChild(content);

      let media = document.createElement("div");
      media.className = "item-media";
      content.appendChild(media);

      let icon = document.createElement("span");
      icon.innerHTML = label;
      media.appendChild(icon);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      content.appendChild(inner);

      let text = categories[label] || "";
      let title = document.createElement("div");
      title.className = "item-title";
      title.innerHTML = app.Utils.tidyText(text, 50);
      inner.appendChild(title);

      let after = document.createElement("div");
      after.className = "item-after";
      inner.appendChild(after);

      let editHandler = document.createElement("a");
      editHandler.className = "link icon-only margin-horizontal";
      editHandler.addEventListener("click", function(e) {
        app.FoodsCategories.editFoodCategory(label);
      });
      after.appendChild(editHandler);

      let editIcon = document.createElement("i");
      editIcon.className = "icon material-icons";
      editIcon.innerHTML = "edit";
      editHandler.appendChild(editIcon);

      let deleteHandler = document.createElement("a");
      deleteHandler.className = "link icon-only";
      deleteHandler.addEventListener("click", function(e) {
        app.FoodsCategories.deleteFoodCategory(label);
      });
      after.appendChild(deleteHandler);

      let deleteIcon = document.createElement("i");
      deleteIcon.className = "icon material-icons";
      deleteIcon.innerHTML = "delete";
      deleteHandler.appendChild(deleteIcon);

      let sortHandler = document.createElement("div");
      sortHandler.className = "sortable-handler";
      li.appendChild(sortHandler);
    });

    let li = document.createElement("li");
    li.className = "no-sorting";
    ul.appendChild(li);

    let button = document.createElement("a");
    button.className = "list-button";
    button.innerHTML = app.strings.settings["foods-categories"]["add"] || "Add Category";
    button.addEventListener("click", function(e) {
      app.FoodsCategories.addFoodCategory();
    });
    li.appendChild(button);
  },

  showFoodCategoryDialog: function(title, label, description, callback) {

    // Create dialog inputs
    let inputs = document.createElement("form");
    inputs.className = "list no-hairlines-md";

    let ul = document.createElement("ul");
    inputs.appendChild(ul);

    ["label", "description"].forEach((field) => {
      let li = document.createElement("li");
      li.className = "item-content item-input";
      ul.appendChild(li);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      li.appendChild(inner);

      let fieldTitle = document.createElement("div");
      fieldTitle.className = "item-title item-label";
      fieldTitle.innerHTML = app.strings.settings["foods-categories"][field] || field;
      inner.appendChild(fieldTitle);

      let inputWrap = document.createElement("div");
      inputWrap.className = "item-input-wrap";
      inner.appendChild(inputWrap);

      let input = document.createElement("input");
      input.className = "dialog-input";
      input.type = "text";
      if (field == "label") {
        input.setAttribute("value", label || "");
        input.setAttribute("maxlength", "8");
      } else {
        input.setAttribute("value", description || "");
      }
      inputWrap.appendChild(input);
    });

    let dialog = app.f7.dialog.create({
      title: title,
      content: inputs.outerHTML,
      buttons: [{
          text: app.strings.dialogs.cancel || "Cancel",
          keyCodes: [27]
        },
        {
          text: app.strings.dialogs.ok || "OK",
          keyCodes: [13],
          onClick: function(dialog) {
            let inputs = Array.from(dialog.el.getElementsByTagName("input"));
            let label = inputs[0].value;
            let description = inputs[1].value;
            callback(label, description);
          }
        }
      ]
    }).open();
  },

  addFoodCategory: function() {
    let labels = app.Settings.get("foodlist", "labels") || [];
    let categories = app.Settings.get("foodlist", "categories") || {};

    let title = app.strings.settings["foods-categories"]["add"] || "Add Category";

    app.FoodsCategories.showFoodCategoryDialog(title, "", "", (label, description) => {
      if (label !== "" && !labels.includes(label)) {
        labels.push(label);
        categories[label] = description;

        app.Settings.put("foodlist", "labels", labels);
        app.Settings.put("foodlist", "categories", categories);

        app.FoodsCategories.populateFoodCategoriesList();
      }
    });
  },

  editFoodCategory: function(oldLabel) {
    let labels = app.Settings.get("foodlist", "labels") || [];
    let categories = app.Settings.get("foodlist", "categories") || {};

    let oldDescription = categories[oldLabel];
    let title = app.strings.settings["foods-categories"]["edit"] || "Edit Category";

    app.FoodsCategories.showFoodCategoryDialog(title, oldLabel, oldDescription, async (newLabel, newDescription) => {
      if (newLabel !== "" && (newLabel == oldLabel || !labels.includes(newLabel))) {

        if (newLabel !== oldLabel) {
          app.f7.preloader.show();

          // Replace category label in settings
          delete categories[oldLabel];
          let index = labels.indexOf(oldLabel);
          if (index != -1)
            labels.splice(index, 1, newLabel);
          app.Settings.put("foodlist", "labels", labels);

          // Update category label for all foods, meals and recipes
          const condition = IDBKeyRange.only(oldLabel);
          for (let store of app.FoodsCategories.storeNames) {
            await dbHandler.processItems(store, "categories", condition, (cursor) => {
              let item = cursor.value;
              if (item.categories !== undefined) {
                let index = item.categories.indexOf(oldLabel);
                if (index != -1) {
                  item.categories.splice(index, 1, newLabel);
                  cursor.update(item);
                }
              }
            });
          }

          app.f7.preloader.hide();
        }

        categories[newLabel] = newDescription;
        app.Settings.put("foodlist", "categories", categories);

        app.FoodsCategories.populateFoodCategoriesList();
      }
    });
  },

  deleteFoodCategory: function(label) {
    let title = (app.strings.dialogs.delete || "Delete") + ": " + label;
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
          onClick: async () => {
            app.f7.preloader.show();

            let labels = app.Settings.get("foodlist", "labels") || [];
            let categories = app.Settings.get("foodlist", "categories") || {};

            let index = labels.indexOf(label);
            if (index != -1)
              labels.splice(index, 1);
            delete categories[label];

            app.Settings.put("foodlist", "labels", labels);
            app.Settings.put("foodlist", "categories", categories);

            // Delete this category from all foods, meals and recipes
            const condition = IDBKeyRange.only(label);
            for (let store of app.FoodsCategories.storeNames) {
              await dbHandler.processItems(store, "categories", condition, (cursor) => {
                let item = cursor.value;
                if (item.categories !== undefined) {
                  let index = item.categories.indexOf(label);
                  if (index != -1) {
                    item.categories.splice(index, 1);
                    if (item.categories.length == 0)
                      delete item.categories;
                    cursor.update(item);
                  }
                }
              });
            }

            app.FoodsCategories.populateFoodCategoriesList();

            app.f7.preloader.hide();
          }
        }
      ]
    }).open();
  }
};