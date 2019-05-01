/*Copyright 2019 David Healey

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

class DiaryDay extends FoodCollection {

  constructor(dateTime){
    super();

    if (dateTime == null || dateTime == undefined)
      dateTime = this.today(); //Default date-time

    this.dateTime = dateTime;
    this.categorized = {};
  }

  today() {
    var now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  getDate() {
    return this.dateTime;
  }

  async populateFromDB()
  {
    let that = this;
    let fromDate = this.dateTime;
    let toDate = new Date(fromDate);
    toDate.setUTCHours(toDate.getUTCHours()+24);

    dbHandler.getIndex("dateTime", "diary").openCursor(IDBKeyRange.bound(fromDate, toDate, false, true)).onsuccess = function(e)
    {
      let cursor = e.target.result;

      if (cursor)
      {
        let item = cursor.value;

        //Get unit from portion
        let unit = item.portion.replace(/[0-9]/g, '');
        if (app.standardUnits.indexOf(unit) == -1) unit = " " + unit; //Add space if unit is not standard

        //Create new food object with item data
        let f = new Food(item.id, item.name, item.brand, item.portion, unit, item.nutrition, item.image_url, item.barcode);
        that.addFood(f); //Add food to collection

        //Categorize the food
        that.categorized[item.category] = that.categorized[item.category] || []; //Create array for category if it doesn't exist
        that.categorized[item.category].push(item.id);

        cursor.continue();
      }
      else {
      }
    };

    return await Promise;
  }
}
