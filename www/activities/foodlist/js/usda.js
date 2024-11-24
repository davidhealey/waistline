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
    "sodium": "Sodium",
    "cholesterol": "Cholesterol",
    "trans-fat": "Fatty acids, total trans",
    "vitamin-a": "Vitamin A",
    "vitamin-b1": "Thiamin",
    "vitamin-b2": "Riboflavin",
    "vitamin-pp": "Niacin",
    "pantothenic-acid": "Pantothenic acid",
    "vitamin-b6": "Vitamin B-6",
    "biotin": "Biotin",
    "vitamin-b9": "Folate, total",
    "vitamin-b12": "Vitamin B-12",
    "vitamin-c": "Vitamin C",
    "vitamin-d": "Vitamin D",
    "vitamin-e": "Vitamin E",
    "vitamin-k": "Vitamin K",
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

  search: function(query, preferDataPer100g) {
    return new Promise(async function(resolve, reject) {
      let apiKey;

      if (app.mode == "development")
        apiKey = "DEMO_KEY";
      else
        apiKey = app.Settings.get("integration", "usda-key");

      if (apiKey != undefined) {
        let url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + encodeURIComponent(apiKey) + "&query=" + encodeURIComponent(query) + "&pageSize=15";

        let response = await app.Utils.timeoutFetch(url).catch((err) => {
          resolve(undefined);
        });

        if (response && response.ok) {
          let data = await response.json();
          let result = [];

          data.foods.forEach((x) => {
            let item = app.USDA.parseItem(x, preferDataPer100g);
            if (item != undefined) {
              result.push(item);
            }
          });

          resolve(result);
        }
      }
      resolve(undefined);
    });
  },

  parseItem: function(item, preferDataPer100g) {
    const offNutriments = app.nutriments; // Array of OFF nutriment names
    const usdaNutriments = app.USDA.nutriments; // Mapping of USDA nutriment names
    const units = app.nutrimentUnits;

    let result = {
      "nutrition": {}
    };

    result.name = item.description;
    result.brand = item.brandOwner;
    result.barcode = "fdcId_" + item.fdcId; // Use fdcId as barcode
    result.originalBarcode = item.fdcId;
    result.portion = "100";
    result.unit = app.strings["unit-symbols"]["g"] || "g";

    if (item.servingSizeUnit === "ml")
      result.unit = app.strings["unit-symbols"]["ml"] || "ml";

    let multiplier = 1;
    if (preferDataPer100g !== true) {
      if (item.servingSize !== undefined && !isNaN(item.servingSize) && (item.servingSizeUnit === "g" || item.servingSizeUnit === "ml")) {
        multiplier = item.servingSize / 100;
        result.portion = item.servingSize.toString();
      } else if (item.foodMeasures !== undefined && item.foodMeasures.length >= 1) {
        let portion = item.foodMeasures[item.foodMeasures.length - 1]; // Use last portion in the list (is usually the best guess)
        let largestPortion = item.foodMeasures[0] // Keep track of largest portion found in the list

        // See if there is an entry in the portion list with the same gramWeight as the last entry and a proper description
        let foundProperDescription = false;
        for (let m of item.foodMeasures) {
          if (m.disseminationText != "Quantity not specified") {
            if (m.gramWeight == portion.gramWeight) {
              portion = m;
              foundProperDescription = true;
              break;
            }
            if (m.gramWeight > largestPortion.gramWeight) {
              largestPortion = m;
            }
          }
        }

        // If no proper description was found, use the entry with the largest gramWeight
        if (foundProperDescription === false)
          portion = largestPortion;

        multiplier = portion.gramWeight / 100;
        result.portion = portion.gramWeight.toString();

        let fractionMatch = portion.disseminationText.match(app.Utils.fractionRegExp());
        let decimalMatch = portion.disseminationText.match(app.Utils.decimalRegExp());
        let unitMatch = portion.disseminationText.match(app.Utils.unitTextRegExp());
        if ((fractionMatch != undefined || decimalMatch != undefined) && unitMatch != undefined) {
          if (fractionMatch != undefined && fractionMatch.length >= 3)
            result.portion = Math.round(fractionMatch[1] / fractionMatch[2] * 1000) / 1000;
          else if (decimalMatch != undefined && decimalMatch.length >= 1)
            result.portion = parseFloat(decimalMatch[0].replace(",", "."));
          if (unitMatch.length >= 2) {
            let unitText = unitMatch[1].trim();
            let unitSize = app.Utils.tidyNumber(portion.gramWeight, result.unit);
            result.unit = unitText + " (" + unitSize + ")";
          }
        }
      }
    }

    // Energy
    for (let n of item.foodNutrients) {
      if (n.nutrientName.startsWith("Energy") && n.unitName.toLowerCase() == units.calories) {
        result.nutrition.calories = Math.round(n.value * multiplier);
        result.nutrition.kilojoules = app.Utils.convertUnit(result.nutrition.calories, units.calories, units.kilojoules, 1);
        break;
      }
    }

    if (result.nutrition.calories == undefined) return undefined;

    // Nutriments
    offNutriments.forEach((x, i) => {
      if (x != "calories" && x != "kilojoules") {

        let nutriment = usdaNutriments[x];

        for (let n of item.foodNutrients) {

          if (n.nutrientName.includes(nutriment)) {

            let value = app.Utils.convertUnit(n.value, n.unitName, units[x]);
            result.nutrition[x] = Math.round(value * multiplier * 100) / 100;

            break;
          }
        }
      }
    });

    // The USDA db only contains values for sodium, but not for salt
    if (result.nutrition.sodium !== undefined) {
      result.nutrition.salt = result.nutrition.sodium * 0.0025;
    }

    // The carbs values in the USDA db include fiber, but we don't want that
    if (result.nutrition.carbohydrates && result.nutrition.fiber) {
      let correctedCarbs = result.nutrition.carbohydrates - result.nutrition.fiber;
      if (correctedCarbs < result.nutrition.sugars || 0)
        correctedCarbs = result.nutrition.sugars || 0;
      result.nutrition.carbohydrates = correctedCarbs;
    }

    return result;
  },

  testApiKey: function(key) {
    return new Promise(async function(resolve, reject) {
      let url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + encodeURIComponent(key) + "&query=cheese";

      let response = await app.Utils.timeoutFetch(url).catch((err) => {
        resolve(false);
      });

      if (response && response.ok) {
        let data = await response.json();
        if (data.error && data.error.code == "API_KEY_INVALID")
          resolve(false);
        else
          resolve(true);
      }

      resolve(false);
    });
  }
};