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

app.USDA = {

  nutriments: {
    "fat": "Total lipid (fat)",
    "saturated-fat": "Fatty acids, total saturated",
    "carbohydrates": "Carbohydrate, by difference",
    "sugars": "Sugars, total including NLEA",
    "fiber": "Fiber, total dietary",
    "proteins": "Protein",
    "monounsaturated-fat": "Fatty acids, total monounsaturated",
    "polyunsaturated-fat": "Fatty acids, total polyunsaturated",
    "trans-fat": "Fatty acids, total trans",
    "cholesterol": "Cholesterol",
    "sodium": "Sodium",
    "vitamin-a": "Vitamin A",
    "vitamin-d": "Vitamin D",
    "vitamin-e": "Vitamin E",
    "vitamin-k": "Vitamin K",
    "vitamin-c": "Vitamin C",
    "vitamin-b1": "Thiamin",
    "vitamin-b2": "Riboflavin",
    "vitamin-pp": "Niacin",
    "pantothenic-acid": "Pantothenic acid",
    "vitamin-b6": "Vitamin B-6",
    "biotin": "Biotin",
    "vitamin-b9": "Folate, total",
    "vitamin-b12": "Vitamin B-12",
    "potassium": "Potassium",
    "calcium": "Calcium",
    "phosphorus": "Phosphorus",
    "iron": "Iron",
    "magnesium": "Magnesium",
    "zinc": "Zinc",
    "copper": "Copper",
    "manganese": "Manganese",
    "fluoride": "Fluoride",
    "selenium": "Selenium",
    "iodine": "Iodine",
    "caffeine": "Caffeine",
    "alcohol": "Alcohol",
    "sucrose": "Sucrose"
  },

  search: function(query) {
    return new Promise(async function(resolve, reject) {

      let apiKey;

      if (app.mode == "development")
        apiKey = "DEMO_KEY";
      else
        apiKey = app.Settings.get("integration", "usda-key");

      if (apiKey != undefined) {
        let url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + apiKey + "&query=" + encodeURI(query) + "&pageSize=15";

        let response = await fetch(url);

        if (response) {
          let data = await response.json();

          resolve(data.foods.map((x) => {
            return app.USDA.parseItem(x);
          }));
        }
      } else {
        return resolve(false);
      }
      reject();
    }).catch(err => {
      throw (err);
    });
  },

  parseItem: function(item) {

    const offNutriments = app.nutriments; //Array of OFF nutriment names
    const usdaNutriments = app.USDA.nutriments; //Array of USDA nutriment names
    const units = app.nutrimentUnits;

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
      if (n.nutrientName == "Energy") {
        if (n.unitName.toLowerCase() == "kcal")
          result.nutrition.calories = Math.round(n.value);
        else
          result.nutrition.kilojoules = Math.round(n.value);
      }
    }

    if (result.nutrition.calories || result.nutrition.kilojoules) {

      if (result.nutrition.calories == undefined)
        result.nutrition.calories = Math.round(result.nutrition.kilojoules / 4.1868);

      if (result.nutrition.kilojoules == undefined)
        result.nutrition.kilojoules = Math.round(result.nutrition.calories * 4.1868);

      // Nutriments
      offNutriments.forEach((x, i) => {
        if (x != "calories" && x != "kilojoules") {

          let nutriment = usdaNutriments[x];

          for (let n of item.foodNutrients) {

            if (n.nutrientName.includes(nutriment)) {

              result.nutrition[x] = app.Utils.convertUnit(n.value, n.unitName, units[x]);

              if (x == "sodium")
                result.nutrition.salt = result.nutrition.sodium * 0.0025;

              break;
            }
          }
        }
      });
    }

    return result;
  },

  testApiKey: function(key) {
    return new Promise(async function(resolve, reject) {
      let url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + key + "&query=cheese";

      let response = await fetch(url);

      if (response) {
        let data = await response.json();
        if (data.error && data.error.code == "API_KEY_INVALID")
          return resolve(false);
      }

      resolve(true);
    }).catch(err => {
      throw (err);
    });
  }
};