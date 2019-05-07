var mealEditor = {

};


if (event.target.matches('ons-page#meal-editor')) {

  //Page show event
  document.querySelector('ons-page#meal-editor').addEventListener("show", function(e) {
    //If items have been passed to the page, add them to the meal
    if (this.data && this.data.items) {

      addItems(this.data.item);
      delete this.data.items; //Unset data
    }
  });
}
