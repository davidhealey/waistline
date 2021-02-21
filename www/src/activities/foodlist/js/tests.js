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

import * as Off from "/www/src/activities/foodlist/js/open-food-facts.js";

async function searchByBarcode() {
  let code = "29056422";
  let result = await waistline.Foodlist.searchByBarcode(code);
  console.log(result);
}

function uploadToOff() {
  let data = {
    barcode: "00481514444623426",
    name: "waistline-test",
    nutrition: {
      kilojoules: 100
    },
    nutrition_per: "&nutrition_data_per=100g",
    portion: "200",
    unit: "g"
  };

  Off.upload(data);
}

export function run() {
  //searchByBarcode();
  //uploadToOff();
}