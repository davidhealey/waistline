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
  return new Promise(function(resolve, reject) {

    //Build search string
    let searchString = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" + query + "&search_simple=1&page_size=100&sort_by=last_modified_t&action=process&json=1";

    //Get country name
    let country = waistline.Settings.get("foodlist", "country") || undefined;

    if (country && country != "All")
      searchString += "&tagtype_0=countries&tag_contains_0=contains&tag_0=" + escape(country); //Limit search to selected country

    //Create request
    let request = new XMLHttpRequest();
    request.open("GET", searchString, true);
    request.send();

    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {

        let result = JSON.parse(request.responseText);
        let list = [];

        //Parse each product
        if (result && result.products && result.products.length != 0) {
          let products = result.products;
          products.forEach((x) => {
            let item = parseProduct(x);
            if (item)
              list.push(item);
          });
        }
        resolve(list);
      }
    };
  }).catch(err => {
    throw (err);
  });
}

function parseProduct(product) {

  const nutriments = waistline.nutriments; //Array of OFF nutriment names
  let result = {
    "nutrition": {}
  };

  let now = new Date();
  result.dateTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  //Search for all keys containing 'product_name' to include local product names
  for (let k in product) {
    if (k.includes("product_name")) {
      result.name = escape(product[k]);
      break;
    }
  }

  result.image_url = escape(product.image_url);
  result.barcode = product.code;

  //Get first brand if there is more than one
  let brands = product.brands || "";
  let n = brands.indexOf(",");
  result.brand = escape(brands.substring(0, n != -1 ? n : brands.length));

  //Nutrition
  let perTag = "";
  if (product.serving_size && (product.nutrition_data_per == "serving" || product.nutriments.energy_serving)) {
    result.portion = product.serving_size.replace(" ", "");
    result.nutrition.calories = parseInt(product.nutriments.energy_serving / 4.15);
    perTag = "_serving";
  } else if (product.nutrition_data_per == "100g" && product.nutriments.energy_100g) {
    result.portion = "100g";
    result.nutrition.calories = parseInt(product.nutriments.energy_100g / 4.15);
    perTag = "_100g";
  } else if (product.quantity) { //If all else fails
    result.portion = product.quantity;
    result.nutrition.calories = product.nutriments.energy_value;
  }

  //Each nutriment 
  nutriments.forEach((x, i) => {
    if (x != "calories") {
      result.nutrition[x] = product.nutriments[x + perTag];
    }
  });

  //Kilojules to kcalories
  if (product.nutriments.energy_unit == "kJ")
    result.nutrition.calories = parseInt(result.nutrition.calories / 4.15);

  if (result.name == "" || result.nutrition.calories == undefined || result.nutrition.calories == 0 || result.portion == undefined)
    return undefined;
  else
    return result;
}

function upload() {

}