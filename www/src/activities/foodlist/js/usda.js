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
  along with Waistline.  If not, see <http://www.gnu.org/licenses/>.
*/

export function search(query) {
  return new Promise(async function(resolve, reject) {

    let apiKey;

    if (waistline.mode == "development")
      apiKey = "DEMO_KEY";
    else
      apiKey = waistline.Settings.get("integration", "usda-key");

    let url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + apiKey + "&query=" + encodeURI(query) + "&sort=r&max=50";

    let response = await fetch(url);

    if (response) {
      let data = await response.json();

      resolve(data.foods.map((x) => {
        return parseItem(x);
      }));
    }
    reject();
  }).catch(err => {
    throw (err);
  });
}

function parseItem(item) {

  const nutriments = waistline.nutriments; //Array of OFF nutriment names

  let result = {
    "nutrition": {}
  };

  let now = new Date();
  result.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  result.name = item.description;
  result.brand = item.brandOwner;
  result.barcode = "fdcId_" + item.fdcId; // Use fdcId as barcode
  result.portion = "100";
  result.unit = "g";

  //Energy 
  for (let n of item.foodNutrients) {

    if (n.nutrientName.toLowerCase() == "energy") {
      if (n.unitName.toLowerCase() == "kcal")
        result.nutrition.calories = parseInt(n.value);
      else
        result.nutrition.kilojoules = parseInt(n.value);
    }
  }

  if (result.nutrition.calories || result.nutrition.kilojoules) {

    if (result.nutrition.calories == undefined)
      result.nutrition.calories = parseInt(result.nutrition.kilojoules / 4.1868);

    if (result.nutrition.kilojoules == undefined)
      result.nutrition.kilojoules = parseInt(result.nutrition.calories * 4.1868);

    // Nutriments
    nutriments.forEach((x, i) => {
      if (x != "calories" && x != "kilojoules") {
        for (let n of item.foodNutrients) {
          if (n.nutrientName.toLowerCase().includes(x.toLowerCase())) {
            result.nutrition[x] = n.value;
            break;
          }
        }
      }
    });
  }

  return result;
}

export function testApiKey(key) {
  return new Promise(async function(resolve, reject) {

    let url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + key + "&query=cheese";

    let response = await fetch(url);

    if (response) {
      let data = await response.json();
      if (data.error && data.error.code == "API_KEY_INVALID")
        resolve(false);
    }

    resolve(true);
  }).catch(err => {
    throw (err);
  });
}