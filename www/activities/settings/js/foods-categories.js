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
      after.appendChild(editHandler);

      let editIcon = document.createElement("i");
      editIcon.className = "icon material-icons";
      editIcon.innerHTML = "edit";
      editHandler.appendChild(editIcon);

      let deleteHandler = document.createElement("a");
      deleteHandler.className = "link icon-only";
      after.appendChild(deleteHandler);

      let deleteIcon = document.createElement("i");
      deleteIcon.className = "icon material-icons";
      deleteIcon.innerHTML = "delete";
      deleteHandler.appendChild(deleteIcon);

      let sortHandler = document.createElement("div");
      sortHandler.className = "sortable-handler";
      li.appendChild(sortHandler);
    });
  }
};