/*
  Copyright 2020 David Healey

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

    //Build search string
    let url;

    // If query is a number, assume it's a barcode
    if (isNaN(query) == true)
      url = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" + encodeURI(query) + "&search_simple=1&page_size=50&sort_by=last_modified_t&action=process&json=1";
    else
      url = "https://world.openfoodfacts.org/api/v0/product/" + query + ".json";

    //Get country name
    let country = waistline.Settings.get("foodlist", "country") || undefined;

    if (country && country != "All")
      url += "&tagtype_0=countries&tag_contains_0=contains&tag_0=" + escape(country); //Limit search to selected country

    let response = await fetch(url, {
      headers: {
        "User-Agent": "Waistline - Android - Version " + waistline.version + " - https://github.com/davidhealey/waistline"
      }
    });

    if (response) {
      let data = await response.json();
      let result = [];

      // Multiple results
      if (data.products !== undefined) {
        data.products.forEach((x) => {
          let item = parseItem(x);
          if (item)
            result.push(item);
        });
      }

      // Single result (presumably from a barcode)
      if (data.product !== undefined) {
        let item = parseItem(data.product);
        result.push(item);
      }

      resolve(result);
    }
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

  //Search for all keys containing 'item_name' to include local item names
  for (let k in item) {
    if (k.includes("product_name") && item[k].length > 1) {
      result.name = escape(item[k]);
      break;
    }
  }

  result.image_url = escape(item.image_url);
  result.barcode = item.code;

  //Get first brand if there is more than one
  let brands = item.brands || "";
  let n = brands.indexOf(",");
  result.brand = escape(brands.substring(0, n != -1 ? n : brands.length));

  //Nutrition
  let perTag = "";
  if (item.serving_size && (item.nutrition_data_per == "serving" || item.nutriments.energy_serving)) {
    result.portion = parseInt(item.serving_size);
    result.unit = item.serving_size.replace(/[^a-z]/g, "");
    result.nutrition.calories = parseInt(item.nutriments.energy_serving / 4.1868);
    perTag = "_serving";
  } else if (item.nutrition_data_per == "100g" && item.nutriments.energy_100g) {
    result.portion = "100";
    result.unit = "g";
    result.nutrition.calories = parseInt(item.nutriments.energy_100g / 4.1868);
    perTag = "_100g";
  } else if (item.quantity) { //If all else fails
    result.portion = parseInt(item.quantity);
    result.nutrition.calories = item.nutriments.energy_value;
  }

  //Each nutriment 
  for (let i = 0; i < nutriments.length; i++) {
    let x = nutriments[i];
    if (x != "calories" && x != "kilojoules") {
      result.nutrition[x] = item.nutriments[x + perTag];
    }
  }

  //Kilojules to kcal
  if (item.nutriments.energy_unit == "kJ") {
    result.nutrition.kilojoules = result.nutrition.calories;
    result.nutrition.calories = parseInt(result.nutrition.kilojoules / 4.1868);
  } else {
    result.nutrition.kilojoules = result.nutrition.calories * 4.1868;
  }

  if (result.name == "" || result.nutrition.calories == undefined || result.portion === undefined)
    result = undefined;

  return result;
}

export function upload(data) {
  console.log(data);

  // Gather additional data
  let username = waistline.Settings.get("integrations", "off-username") || "waistline-app";
  let password = waistline.Settings.get("integrations", "off-password") || "waistline";

  if (app.mode == "development") {
    username = "";
    password = "";
  }

  let lang = /*app.getLocale() || */ "en";

  // Organise data for upload 
  let s = "user_id=" + username + "&password=" + password;

  s += "&lang=" + lang;
  s += "&code=" + data.barcode;
  s += "&product_name=" + escape(data.name);
  if (data.brand !== undefined) s += "&brands=" + escape(data.brand);
  s += "&product_quantity=" + escape(data.portion);
  s += data.nutrition_per + "&serving_size=" + escape(data.portion) + data.unit;
  s += "&nutriment_energy_unit=kcal"; //MAKE SURE THIS IS CORRECT!!!!
  if (data.ingredients !== undefined) s += "&ingredients_text=" + escape(data.ingredients);
  if (data.traces !== undefined) s += "&traces_text=" + escape(data.traces);

  console.log(s);

  //Make request to OFF
  let endPoint;
  if (app.mode == "development")
    endPoint = "https://off:off@world.openfoodfacts.net/cgi/product_jqm2.pl?"; //Testing server
  else
    endPoint = "https://world.openfoodfacts.org/cgi/product_jqm2.pl?"; //Real server

}

export function testCredentials(username, password) {
  return new Promise(async function(resolve, reject) {

    let url = "https://world.openfoodfacts.org/cgi/session.pl?user_id=" + username + "&password=" + password;

    let response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Waistline - Android - Version " + waistline.version + " - https://github.com/davidhealey/waistline",
      },
    });

    if (response) {
      let html = await response.text();
      if (html == null || html.includes("Incorrect user name or password.") || html.includes("See you soon!")) {
        resolve(false);
      }
    }
    resolve(true);
  }).catch(err => {
    throw (err);
  });
}