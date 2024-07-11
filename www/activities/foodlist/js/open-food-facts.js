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

app.OpenFoodFacts = {
  search: function(query, preferDataPer100g) {
    return new Promise(async function(resolve, reject) {
      //Build search string
      let url;

      let barcodeOnlySearch = app.Settings.get("integration", "off-only-barcode") || false;

      // If query is a number, assume it's a barcode
      if (isNaN(query)){
        // If the user only wants to use OFF for barcode scans return empty list and hope the next provider has the data
        if (barcodeOnlySearch)
          return resolve(undefined);
        url = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" + encodeURIComponent(query) + "&search_simple=1&page_size=50&sort_by=unique_scans_n&action=process&json=1";
      } else
        url = "https://world.openfoodfacts.org/api/v0/product/" + encodeURIComponent(query) + ".json";

      //Get country name
      let country = app.Settings.get("integration", "search-country") || undefined;

      //Limit search to selected country
      if (country && country != "All")
        url += "&tagtype_0=countries&tag_contains_0=contains&tag_0=" + encodeURIComponent(country);

      //Get language
      let language = app.Settings.get("integration", "search-language") || undefined;

      if (language != undefined && language != "Default")
        url += "&lang=" + encodeURIComponent(language) + "&lc=" + encodeURIComponent(language);
      else
        language = app.getLanguage(app.Settings.get("appearance", "locale")).substring(0, 2);

      let response = await app.Utils.timeoutFetch(url, {
        headers: {
          "User-Agent": "Waistline - Android - Version " + app.version + " - https://github.com/davidhealey/waistline"
        }
      }).catch((err) => {
        resolve(undefined);
      });

      if (response && response.ok) {
        let data = await response.json();
        let result = [];

        // Multiple results (hide results where all nutrition values are undefined)
        if (data.products !== undefined) {
          data.products.forEach((x) => {
            let item = app.OpenFoodFacts.parseItem(x, preferDataPer100g, language);
            if (item != undefined) {
              let nutritionValues = Object.values(item.nutrition).filter((v) => v != undefined);
              if (nutritionValues.length != 0) result.push(item);
            }
          });
        }

        // Single result (presumably from a barcode)
        if (data.product !== undefined) {
          let item = app.OpenFoodFacts.parseItem(data.product, preferDataPer100g, language);
          if (item != undefined) result.push(item);
        }

        resolve(result);
      }
      resolve(undefined);
    });
  },

  parseItem: function(item, preferDataPer100g, preferredLanguage) {
    const nutriments = app.nutriments; // Array of OFF nutriment names
    const units = app.nutrimentUnits;

    let result = {
      "nutrition": {}
    };

    // Get item name, try the preferred language first
    let key = "product_name_" + preferredLanguage;
    if (item[key] !== undefined && item[key].length > 1) {
      result.name = he.decode(item[key]);
    } else {
      for (let k in item) {
        if (k.includes("product_name") && item[k].length > 1) {
          result.name = he.decode(item[k]);
          break;
        }
      }
    }

    if (result.name == undefined || result.name == "")
      result.name = item.code;

    result.image_url = escape(item.image_url);
    result.barcode = item.code;

    // Get first brand if there is more than one
    let brands = item.brands || "";
    let n = brands.indexOf(",");
    let brand = brands.substring(0, n != -1 ? n : brands.length);
    result.brand = he.decode(brand);

    let dataAvailablePerServing = false;
    let dataAvailablePer100g = false;

    if (item.serving_size && item.serving_size.match(app.Utils.decimalRegExp())) {
      for (let n in item.nutriments) {
        if (n.endsWith("_serving")) {
          dataAvailablePerServing = true;
          break;
        }
      }
    }
    for (let n in item.nutriments) {
      if (n.endsWith("_100g")) {
        dataAvailablePer100g = true;
        break;
      }
    }

    let perTag = "";
    if (dataAvailablePerServing === true && (preferDataPer100g !== true || dataAvailablePer100g === false)) {
      let fractionMatch = item.serving_size.match(app.Utils.fractionRegExp());
      let decimalMatch = item.serving_size.match(app.Utils.decimalRegExp());
      if (fractionMatch != undefined && fractionMatch.length >= 3)
        result.portion = Math.round(fractionMatch[1] / fractionMatch[2] * 1000) / 1000;
      else if (decimalMatch != undefined && decimalMatch.length >= 1)
        result.portion = parseFloat(decimalMatch[0].replace(",", "."));
      let unitMatch = item.serving_size.match(app.Utils.unitTextRegExp());
      if (unitMatch != undefined && unitMatch.length >= 2)
        result.unit = app.strings["unit-symbols"][unitMatch[1].trim().toLowerCase()] || unitMatch[1].trim();
      if (item.nutriments.energy_serving) {
        result.nutrition.calories = (item.nutriments["energy-kcal_serving"]) ?
          parseInt(item.nutriments["energy-kcal_serving"]) :
          app.Utils.convertUnit(item.nutriments.energy_serving, units.kilojoules, units.calories, 1);
        result.nutrition.kilojoules = item.nutriments.energy_serving;
        perTag = "_serving";
      } else if (item.nutriments.energy_prepared_serving) {
        result.nutrition.calories = (item.nutriments["energy-kcal_prepared_serving"]) ?
          parseInt(item.nutriments["energy-kcal_prepared_serving"]) :
          app.Utils.convertUnit(item.nutriments.energy_prepared_serving, units.kilojoules, units.calories, 1);
        result.nutrition.kilojoules = item.nutriments.energy_prepared_serving;
        perTag = "_prepared_serving";
      } else {
        perTag = "_serving";
      }
    } else if (dataAvailablePer100g === true) {
      result.portion = "100";
      result.unit = app.strings["unit-symbols"]["g"] || "g";
      if (item.serving_size && item.serving_size.match(/\d\s*(ml|cl|l)(\s|\)|\]|,|;|$)/i))
        result.unit = app.strings["unit-symbols"]["ml"] || "ml";
      if (item.nutriments.energy_100g) {
        result.nutrition.calories = (item.nutriments["energy-kcal_100g"]) ?
          item.nutriments["energy-kcal_100g"] :
          app.Utils.convertUnit(item.nutriments.energy_100g, units.kilojoules, units.calories, 1);
        result.nutrition.kilojoules = item.nutriments.energy_100g;
        perTag = "_100g";
      } else if (item.nutriments.energy_prepared_100g) {
        result.nutrition.calories = (item.nutriments["energy-kcal_prepared_100g"]) ?
          item.nutriments["energy-kcal_prepared_100g"] :
          app.Utils.convertUnit(item.nutriments.energy_prepared_100g, units.kilojoules, units.calories, 1);
        result.nutrition.kilojoules = item.nutriments.energy_prepared_100g;
        perTag = "_prepared_100g";
      } else {
        perTag = "_100g";
      }
    } else if (item.quantity) { // If all else fails
      let decimalMatch = item.quantity.match(app.Utils.decimalRegExp());
      if (decimalMatch != undefined && decimalMatch.length >= 1)
        result.portion = parseFloat(decimalMatch[0].replace(",", "."));
      let unitMatch = item.quantity.match(app.Utils.unitTextRegExp());
      if (unitMatch != undefined && unitMatch.length >= 2)
        result.unit = app.strings["unit-symbols"][unitMatch[1].trim().toLowerCase()] || unitMatch[1].trim();
      result.nutrition.calories = (item.nutriments["energy-kcal"]) ?
        item.nutriments["energy-kcal"] :
        item.nutriments.energy;
      result.nutrition.kilojoules = item.nutriments.energy;
    }

    // Each nutriment
    for (let i = 0; i < nutriments.length; i++) {
      let x = nutriments[i];
      if (x != "calories" && x != "kilojoules") {
        let value = item.nutriments[x + perTag];
        result.nutrition[x] = app.Utils.convertUnit(value, "g", units[x]);

        if (x == "alcohol")
          result.nutrition[x] = app.Utils.convertAlcoholVolPercentToGrams(result.nutrition[x], result.portion, result.unit);
      }
    }

    if (result.unit == undefined)
      result.unit = "?";

    if (result.portion == undefined || isNaN(result.portion))
      result = undefined;

    return result;
  },

  upload: function(data) {
    return new Promise(async function(resolve, reject) {
      let s = app.OpenFoodFacts.getUploadString(data);

      // Make request to OFF
      let endPoint;
      if (app.mode != "release")
        endPoint = "https://world.openfoodfacts.net/cgi/product_jqm2.pl?"; // Testing server
      else
        endPoint = "https://world.openfoodfacts.org/cgi/product_jqm2.pl?"; // Real server

      let headers = {
        'content-type': 'text/html; charset=UTF-8'
      };

      if (app.mode != "release")
        headers.Authorization = "Basic " + btoa("off:off");

      let response = await app.Utils.timeoutFetch(endPoint + s, {
        credentials: 'include',
        headers: headers
      }).catch((err) => {
        reject();
      });

      if (response && response.ok) {
        let result = await response.json();
        if (result.status == 1) {

          // Upload images
          if (data.images !== undefined) {
            await app.OpenFoodFacts.uploadImages(data.images, data.barcode).catch((err) => {
              reject();
            });
          }

          // Get result from OFF
          let result = await app.OpenFoodFacts.search(data.barcode);
          if (result !== undefined && result.length > 0)
            resolve(result[0]);
        }
      }
      reject();
    });
  },

  getUploadString: function(data) {
    const nutriments = app.nutriments; // Array of OFF nutriment names
    const units = app.Nutriments.getNutrimentUnits(true);
    const energyUnit = app.Settings.get("units", "energy");

    let string = "";

    // Gather additional data
    let username = app.Settings.get("integration", "off-username") || "waistline-app";
    let password = app.Settings.get("integration", "off-password") || "waistline";

    // Organise data for upload 
    string += "code=" + encodeURIComponent(data.barcode);
    string += "&user_id=" + encodeURIComponent(username);
    string += "&password=" + encodeURIComponent(password);

    // Product language
    let language = app.Settings.get("integration", "search-language") || undefined;
    let lang = "en";

    if (language != undefined && language != "Default")
      lang = language;
    else
      lang = app.getLanguage(app.Settings.get("appearance", "locale")).substring(0, 2);

    string += "&lang=" + encodeURIComponent(lang);

    // Product information
    string += "&product_name_" + encodeURIComponent(lang) + "=" + encodeURIComponent(data.name);
    if (data.brand !== undefined) string += "&brands=" + encodeURIComponent(data.brand);
    string += data.nutrition_per;

    if (data.portion != "100" || data.unit != "g" || data.nutrition_per == "&nutrition_data_per=serving")
      string += "&serving_size=" + encodeURIComponent(data.portion + " " + data.unit);

    // Energy
    if (data.nutrition.kilojoules !== undefined) {
      string += "&nutriment_energy=" + data.nutrition.kilojoules;
      string += "&nutriment_energy_unit=" + units.kilojoules;
      if (energyUnit == units.calories && data.nutrition.calories !== undefined)
        string += "&nutriment_energy-kcal=" + data.nutrition.calories;
    } else if (data.nutrition.calories !== undefined) {
      string += "&nutriment_energy=" + data.nutrition.calories;
      string += "&nutriment_energy_unit=" + units.calories;
    }

    // Nutrition
    for (let n in data.nutrition) {
      if (n == "calories" || n == "kilojoules") continue;
      if (!nutriments.includes(n)) continue;

      string += "&nutriment_" + n + "=" + data.nutrition[n];
      string += "&nutriment_" + n + "_unit=" + encodeURIComponent(units[n] || "g");
    }

    // Tags
    let countries = app.Settings.get("integration", "upload-country");

    if (countries != undefined && countries != "Auto")
      string += "&countries=" + countries;

    return string;
  },

  uploadImages: function(images, barcode) {
    let username = app.Settings.get("integration", "off-username") || "waistline-app";
    let password = app.Settings.get("integration", "off-password") || "waistline";
    let promises = [];

    for (let i = 0; i < images.length; i++) {
      let x = images[i];
      if (x != undefined) {
        let data = app.OpenFoodFacts.getImageData(x, i);
        data.append("code", barcode);
        data.append("user_id", username);
        data.append("password", password);
        promises.push(app.OpenFoodFacts.postImage(data));
      }
    }

    return Promise.all(promises);
  },

  getImageData: function(blob, index) {
    const imagefields = ["front", "nutrition", "ingredients", "packaging"];

    let data = new FormData();
    data.append("imgupload_" + imagefields[index], blob);
    data.append("imagefield", imagefields[index]);

    return data;
  },

  postImage: function(data) {
    let endPoint;
    if (app.mode == "development")
      endPoint = "https://world.openfoodfacts.net/cgi/product_image_upload.pl"; // Testing server
    else
      endPoint = "https://world.openfoodfacts.org/cgi/product_image_upload.pl"; // Real server

    let headers = {};
    if (app.mode == "development")
      headers.Authorization = "Basic " + btoa("off:off");

    headers["Content-Type"] = "multipart/form-data";

    let promise = app.Utils.timeoutFetch(endPoint, {
      method: 'POST',
      credentials: 'include',
      headers: headers,
      body: data
    }, 60000);

    return promise;
  },

  testCredentials: function(username, password) {
    return new Promise(async function(resolve, reject) {
      let url = "https://world.openfoodfacts.org/cgi/session.pl?user_id=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password);

      let response = await app.Utils.timeoutFetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Waistline - Android - Version " + app.version + " - https://github.com/davidhealey/waistline"
        },
      }).catch((err) => {
        resolve(false);
      });

      if (response && response.ok) {
        let html = await response.text();
        if (html == null || html.includes("Incorrect user name or password.") || html.includes("See you soon!"))
          resolve(false);
        else
          resolve(true);
      }

      resolve(false);
    });
  }
};