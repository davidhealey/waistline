//Testing data
var foodCollectionTest = {
  c: new FoodCollection(),
  nutrition: {"calories":50,"protein":10,"carbs":80,"fat":60,"saturated-fat":70,"sugar":90,"fiber":11,"salt":12},
};

app.tests.foodCollection = {

  'Add a food obj to a collection':function(){
    let c = foodCollectionTest.c;
    let f = new Food(0, "Test Food", "Test Brand", "100", "g", foodCollectionTest.nutrition, undefined, undefined);
    let l = Object.keys(c.items).length; //Number of items in collection
    c.addFood(f); //Add food to the collection
    eq(l+1, Object.keys(c.items).length); //Items in collection should have increased by 1
  },

  'Add several food objs to a collection':function(){

    let c = foodCollectionTest.c;

    for (let i = 0; i < 10; i++){
      let f = new Food(i, "Test Food" + i, "Test Brand", "100", "g", foodCollectionTest.nutrition, undefined, undefined);
      c.addFood(f);
    }

    let l = c.getLength();

    eq(l, 10); //10 objs should have been added
    eq(true, c.items[0].id != c.items[1].id); //The inserted food objs should have different IDs
  },

  'Removes a food from a collection':function(){
    let c = foodCollectionTest.c;
    let f = new Food(0, "Test Food", "Test Brand", "100", "g", foodCollectionTest.nutrition, undefined, undefined);
    let l = Object.keys(c.items).length; //Number of items in collection - should be > 0 if previous test was OK
    c.removeFood(f);
    eq(l-1, Object.keys(c.items).length); //Items in collection should have decreased by 1
  }
};
