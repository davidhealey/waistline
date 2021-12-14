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

app.Nutriments = {

  storeNames: ["foodList", "recipes"],

  populateNutrimentList: function() {
    let nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    let ul = document.querySelector("#nutriment-list");

    for (let i in nutriments) {
      let n = nutriments[i];

      if (n == "calories" || n == "kilojoules") continue;

      let li = document.createElement("li");
      li.id = n;
      ul.appendChild(li);

      let content = document.createElement("div");
      content.className = "item-content";
      li.appendChild(content);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      content.appendChild(inner);

      let text = app.strings.nutriments[n] || n;
      let title = document.createElement("div");
      title.className = "item-title";
      title.innerHTML = app.Utils.tidyText(text, 50);
      inner.appendChild(title);

      let after = document.createElement("div");
      after.className = "item-after";
      inner.appendChild(after);

      if (!app.nutriments.includes(n)) {
        let editHandler = document.createElement("a");
        editHandler.className = "link icon-only";
        editHandler.addEventListener("click", function(e) {
          app.Nutriments.editNutrimentField(n);
        });
        after.appendChild(editHandler);

        let editIcon = document.createElement("i");
        editIcon.className = "icon material-icons";
        editIcon.innerHTML = "edit";
        editHandler.appendChild(editIcon);

        let deleteHandler = document.createElement("a");
        deleteHandler.className = "link icon-only margin-horizontal";
        deleteHandler.addEventListener("click", function(e) {
          app.Nutriments.deleteNutrimentField(n);
        });
        after.appendChild(deleteHandler);

        let deleteIcon = document.createElement("i");
        deleteIcon.className = "icon material-icons";
        deleteIcon.innerHTML = "delete";
        deleteHandler.appendChild(deleteIcon);
      }

      let label = document.createElement("label");
      label.className = "toggle toggle-init";
      after.appendChild(label);

      let input = document.createElement("input");
      input.type = "checkbox";
      input.name = n;
      input.setAttribute('field', 'nutrimentVisibility');
      label.appendChild(input);

      let span = document.createElement("span");
      span.className = "toggle-icon";
      label.appendChild(span);

      let sortHandler = document.createElement("div");
      sortHandler.className = "sortable-handler";
      li.appendChild(sortHandler);
    }

    let li = document.createElement("li");
    li.className = "no-sorting";
    ul.appendChild(li);

    let button = document.createElement("a");
    button.className = "list-button";
    button.innerHTML = app.strings.settings.nutriments["add"] || "Add Field";
    button.addEventListener("click", function(e) {
      app.Nutriments.addNutrimentField();
    });
    li.appendChild(button);
  },

  showNutrimentDialog: function(title, fieldName, fieldUnit, callback) {

    // Create dialog inputs
    let inputs = document.createElement("form");
    inputs.className = "list no-hairlines-md";

    let ul = document.createElement("ul");
    inputs.appendChild(ul);

    ["field", "unit"].forEach((field) => {
      let li = document.createElement("li");
      li.className = "item-content item-input";
      ul.appendChild(li);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      li.appendChild(inner);

      let fieldTitle = document.createElement("div");
      fieldTitle.className = "item-title item-label";
      fieldTitle.innerHTML = app.strings.settings.nutriments[field] || field;
      inner.appendChild(fieldTitle);

      let inputWrap = document.createElement("div");
      inputWrap.className = "item-input-wrap";
      inner.appendChild(inputWrap);

      let input = document.createElement("input");
      input.className = "dialog-input";
      input.type = "text";
      if (field == "field")
        input.setAttribute("value", fieldName || "");
      else
        input.setAttribute("value", fieldUnit || "");
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
            let field = inputs[0].value;
            let unit = inputs[1].value;
            callback(field, unit);
          }
        }
      ]
    }).open();
  },

  addNutrimentField: function() {
    let nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    let units = app.Settings.get("nutriments", "units") || {};
    let visibility = app.Settings.getField("nutrimentVisibility");

    let title = app.strings.settings.nutriments["add"] || "Add Field";

    app.Nutriments.showNutrimentDialog(title, "", "", (field, unit) => {
      if (field !== "" && !nutriments.includes(field)) {
        nutriments.push(field);
        if (unit !== "")
          units[field] = unit;
        visibility[field] = true;

        app.Settings.put("nutriments", "order", nutriments);
        app.Settings.put("nutriments", "units", units);
        app.Settings.putField("nutrimentVisibility", visibility);

        app.f7.views.main.router.refreshPage();
      }
    });
  },

  editNutrimentField: function(oldField) {
    let nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
    let units = app.Settings.get("nutriments", "units") || {};
    let visibility = app.Settings.getField("nutrimentVisibility");

    let oldUnit = units[oldField];
    let title = app.strings.settings.nutriments["edit"] || "Edit Field";

    app.Nutriments.showNutrimentDialog(title, oldField, oldUnit, async (newField, newUnit) => {
      if (newField !== "" && (newField == oldField || !nutriments.includes(newField))) {

        if (newField !== oldField) {
          app.f7.preloader.show();

          // Replace field in settings
          delete units[oldField];
          let index = nutriments.indexOf(oldField);
          if (index != -1)
            nutriments.splice(index, 1, newField);
          app.Settings.put("nutriments", "order", nutriments);

          // Migrate field visibility
          visibility[newField] = visibility[oldField];
          delete visibility[oldField];
          app.Settings.putField("nutrimentVisibility", visibility);

          // Update field name for all foods and recipes
          for (let store of app.Nutriments.storeNames) {
            await dbHandler.processItems(store, undefined, undefined, (cursor) => {
              let item = cursor.value;
              if (item.nutriments !== undefined) {
                let index = item.nutriments.indexOf(oldField);
                if (index != -1) {
                  item.nutriments.splice(index, 1, newField);
                  cursor.update(item);
                }
              }
            });
          }

          app.f7.preloader.hide();
        }

        if (newUnit !== "")
          units[newField] = newUnit;
        else
          delete units[newField];
        app.Settings.put("nutriments", "units", units);

        app.f7.views.main.router.refreshPage();
      }
    });
  },

  deleteNutrimentField: function(field) {
    let title = (app.strings.dialogs.delete || "Delete") + ": " + field;
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

            let nutriments = app.Settings.get("nutriments", "order") || app.nutriments;
            let units = app.Settings.get("nutriments", "units") || {};
            let visibility = app.Settings.getField("nutrimentVisibility");

            let index = nutriments.indexOf(field);
            if (index != -1)
              nutriments.splice(index, 1);
            delete units[field];
            delete visibility[field];

            app.Settings.put("nutriments", "order", nutriments);
            app.Settings.put("nutriments", "units", units);
            app.Settings.putField("nutrimentVisibility", visibility);

            // Delete this field from all foods and recipes
            for (let store of app.Nutriments.storeNames) {
              await dbHandler.processItems(store, undefined, undefined, (cursor) => {
                let item = cursor.value;
                if (item.nutriments !== undefined) {
                  let index = item.nutriments.indexOf(field);
                  if (index != -1) {
                    item.nutriments.splice(index, 1);
                    cursor.update(item);
                  }
                }
              });
            }

            app.f7.views.main.router.refreshPage();

            app.f7.preloader.hide();
          }
        }
      ]
    }).open();
  }
};