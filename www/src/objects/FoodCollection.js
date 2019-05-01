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

class FoodCollection {

  constructor(){
    this.items = {};
  }

  addFood(food){
      this.items[food.id] = food;
  }

  removeFood(food){
    delete this.items[food.id];
  }

  getLength(){
    return Object.keys(this.items).length;
  }

  updateDB(){}

}
