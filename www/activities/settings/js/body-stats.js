/*
  Copyright 2022 David Healey

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

app.BodyStats = {

  getBodyStats: function() {
    return app.Settings.get("bodyStats", "order") || app.bodyStats;
  },

  getBodyStatsUnits: function() {
    let bodyStatsUnits = app.bodyStatsUnits;
    let customUnits = app.Settings.get("bodyStats", "units") || {};
    return app.Utils.concatObjects(bodyStatsUnits, customUnits);
  },

  populateBodyStatsList: function() {
    let bodyStats = app.BodyStats.getBodyStats();
    let ul = document.querySelector("#body-stats-list");

    for (let i in bodyStats) {
      let n = bodyStats[i];

      let li = document.createElement("li");
      li.id = n;
      ul.appendChild(li);

      let content = document.createElement("div");
      content.className = "item-content";
      li.appendChild(content);

      let inner = document.createElement("div");
      inner.className = "item-inner";
      content.appendChild(inner);

      let text = app.strings.statistics[n] || n;
      let title = document.createElement("div");
      title.className = "item-title";
      title.innerText = app.Utils.tidyText(text, 50);
      inner.appendChild(title);

      let after = document.createElement("div");
      after.className = "item-after";
      inner.appendChild(after);

      if (!app.bodyStats.includes(n)) {
        let editHandler = document.createElement("a");
        editHandler.className = "link icon-only";
        editHandler.addEventListener("click", function(e) {
          app.BodyStats.editBodyStatField(n);
        });
        after.appendChild(editHandler);

        let editIcon = document.createElement("i");
        editIcon.className = "icon material-icons";
        editIcon.innerText = "edit";
        editHandler.appendChild(editIcon);

        let deleteHandler = document.createElement("a");
        deleteHandler.className = "link icon-only margin-horizontal";
        deleteHandler.addEventListener("click", function(e) {
          app.BodyStats.deleteBodyStatField(n);
        });
        after.appendChild(deleteHandler);

        let deleteIcon = document.createElement("i");
        deleteIcon.className = "icon material-icons";
        deleteIcon.innerText = "delete";
        deleteHandler.appendChild(deleteIcon);
      }

      let label = document.createElement("label");
      label.className = "toggle toggle-init";
      after.appendChild(label);

      let input = document.createElement("input");
      input.type = "checkbox";
      input.name = n;
      input.setAttribute("field", "bodyStatsVisibility");
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
    button.innerText = app.strings.settings["body-stats"]["add"] || "Add Field";
    button.addEventListener("click", function(e) {
      app.BodyStats.addBodyStatField();
    });
    li.appendChild(button);
  },

  showBodyStatDialog: function(title, fieldName, fieldUnit, callback) {

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
      fieldTitle.innerText = app.strings.settings["body-stats"][field] || field;
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

  addBodyStatField: function() {
    let nutriments = app.Nutriments.getNutriments();
    let bodyStats = app.BodyStats.getBodyStats();
    let units = app.Settings.get("bodyStats", "units") || {};
    let visibility = app.Settings.getField("bodyStatsVisibility");

    let title = app.strings.settings["body-stats"]["add"] || "Add Field";

    app.BodyStats.showBodyStatDialog(title, "", "", (field, unit) => {
      if (field !== "" && !nutriments.includes(field) && !bodyStats.includes(field)) {
        bodyStats.push(field);
        if (unit !== "")
          units[field] = unit;
        visibility[field] = true;

        app.Settings.put("bodyStats", "order", bodyStats);
        app.Settings.put("bodyStats", "units", units);
        app.Settings.putField("bodyStatsVisibility", visibility);

        app.f7.views.main.router.refreshPage();
      }
    });
  },

  editBodyStatField: function(oldField) {
    let nutriments = app.Nutriments.getNutriments();
    let bodyStats = app.BodyStats.getBodyStats();
    let units = app.Settings.get("bodyStats", "units") || {};
    let visibility = app.Settings.getField("bodyStatsVisibility");

    let oldUnit = units[oldField];
    let title = app.strings.settings["body-stats"]["edit"] || "Edit Field";

    app.BodyStats.showBodyStatDialog(title, oldField, oldUnit, async (newField, newUnit) => {
      if (newField !== "" && (newField == oldField || (!nutriments.includes(newField) && !bodyStats.includes(newField)))) {

        if (newField !== oldField) {
          app.f7.preloader.show();

          // Replace field in settings
          delete units[oldField];
          let index = bodyStats.indexOf(oldField);
          if (index != -1)
            bodyStats.splice(index, 1, newField);
          app.Settings.put("bodyStats", "order", bodyStats);

          // Migrate field visibility
          visibility[newField] = visibility[oldField];
          delete visibility[oldField];
          app.Settings.putField("bodyStatsVisibility", visibility);

          // Migrate goals
          app.Goals.migrateStatGoalSettings(oldField, newField);

          // Update stat name in all diary entries
          await dbHandler.processItems("diary", undefined, undefined, (cursor) => {
            let entry = cursor.value;
            if (entry.stats !== undefined) {
              if (oldField in entry.stats) {
                entry.stats[newField] = entry.stats[oldField];
                delete entry.stats[oldField];
                cursor.update(entry);
              }
            }
          });

          app.f7.preloader.hide();
        }

        if (newUnit !== "")
          units[newField] = newUnit;
        else
          delete units[newField];
        app.Settings.put("bodyStats", "units", units);

        app.f7.views.main.router.refreshPage();
      }
    });
  },

  deleteBodyStatField: function(field) {
    let title = (app.strings.dialogs.delete || "Delete") + ": " + app.Utils.escapeHtml(field);
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

            let bodyStats = app.BodyStats.getBodyStats();
            let units = app.Settings.get("bodyStats", "units") || {};
            let visibility = app.Settings.getField("bodyStatsVisibility");

            let index = bodyStats.indexOf(field);
            if (index != -1)
              bodyStats.splice(index, 1);
            delete units[field];
            delete visibility[field];

            app.Settings.put("bodyStats", "order", bodyStats);
            app.Settings.put("bodyStats", "units", units);
            app.Settings.putField("bodyStatsVisibility", visibility);

            // Delete goals
            app.Goals.migrateStatGoalSettings(field);

            // Delete this stat from all diary entries
            await dbHandler.processItems("diary", undefined, undefined, (cursor) => {
              let entry = cursor.value;
              if (entry.stats !== undefined) {
                if (field in entry.stats) {
                  delete entry.stats[field];
                  cursor.update(entry);
                }
              }
            });

            app.f7.views.main.router.refreshPage();

            app.f7.preloader.hide();
          }
        }
      ]
    }).open();
  }
};