//Testing data
var diaryDayTest = {
  now: new Date(),
  dateTime: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())), //Today at midnight
  diaryItem: {"dateTime":"2018-09-18T12:00:37.196Z","name":"Veggie%20Box","brand":"KFC","portion":"1box","quantity":1,"nutrition":{"calories":100,"protein":null,"carbs":null,"fat":null,"saturated-fat":null,"sugar":null,"fiber":null,"salt":null},"category":1,"category_name":"Lunch","foodId":19,"id":132},
  nutrition: {"calories":50,"protein":10,"carbs":80,"fat":60,"saturated-fat":70,"sugar":90,"fiber":11,"salt":12},
  foodItem: {"barcode":"","name":"Dtest","brand":"","image_url":"undefined","portion":"1 cup","nutrition":{"calories":50,"protein":10,"carbs":80,"fat":60,"saturated-fat":70,"sugar":90,"fiber":11,"salt":12},"dateTime":"2018-12-28T17:22:21.936Z","id":18}
};

app.tests.diaryDay = {

  /*'populates day object from DB': function() {
      var day = new DiaryDay(new Date("2018-09-16")); //diaryDay object
      eq("object", typeof day.populateFromDB());
    },*/
};
