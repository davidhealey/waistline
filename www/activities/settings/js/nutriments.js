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
  }
};