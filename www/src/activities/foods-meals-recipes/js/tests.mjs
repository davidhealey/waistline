async function getTotalNutrition() {

  console.log("Test: getTotalNutrition");

  let items = [{
      id: 7,
      portion: "200g",
      quantity: 2
    },
    {
      id: 8,
      portion: "100g",
      quantity: 1
    }
  ];

  let result = await waistline.FoodsMealsRecipes.getTotalNutrition(items);
  console.log(result);
}

export function runTests() {
  //getTotalNutrition();
}