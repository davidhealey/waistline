# User Guide - Frequently Asked Questions

## How do I use Waistline?

Use the Diary to keep a record of the food you eat every day. Waistline automatically adds up the calories and other nutriments of the food to calculate your total nutrition intake. You can also define goals for certain nutriments and have them displayed at the bottom of the Diary. On the Statstics page, you can see your nutrition intake over time.

Waistline also lets you to track additional body stats such as your weight. Tap on the scale button in the menu bar at the top of the Diary to log your stats for a particular day. Go to the Statistics page to see your stats over time.

Before you can add a food item to the Diary, you first have to create the item in your local database. To do this, navigate to `Foods, Meals, Recipes` and tap the `+` button. This will open the Food Editor that lets you add and edit food items. You can also download food product information from Open Food Facts or from the USDA database. More on this below.

## What is the purpose of the chain icon or link button in the menu bar at the top of the Food Editor?

When this button is active (i.e. the chain is not crossed out), any changes you make to the serving size or to individual nutriments of the food are also applied to all other fields. For example, if you double the serving size, all nutrition values will also double. If you cut the number of calories in half, all other nutriments and the serving size will also be cut in half.

The link button is disabled by default when adding/creating new items, but enabled by default when editing existing items.

## How can I search for foods online?

To perform an online search, type a search term into the search box on the Foods page and press Enter. Out of the box, Waistline supports searching the Open Food Facts database. Under `Settings > Integration`, you can change the preferred search language and country. Under `Settings > Integration > USDA API`, you can also set up the integration with the FoodData Central database maintained by the United States Department of Agriculture. It contains many generic and non-branded foods that cannot be found on Open Food Facts.

For products with a barcode, you can also use the barcode scanner to retrieve the product information from Open Food Facts. Tap on the barcode button in the menu bar at the top of the Foods page. If the scanned product is not in the Open Food Facts database yet, you will be prompted to add it. If you have an Open Food Facts account and want uploaded entries to be attributed to you, you can sign in under `Settings > Integration > Open Food Facts Account`.

## What are meals and recipes, and what is the difference between them?

A meal is a collection of food items that you often consume together in particular quantities. If you add a meal to the diary, each ingredient of the meal is added to the diary individually and shows up as a separate entry.

A recipe is a dish that consists of several foods/ingredients put together in particular quantities. If you add a recipe to the diary, it shows up as a single entry.

## How do I specify the quantity of an entry in the Diary or an ingredient of a meal or recipe?

There are two parameters you can use the specify the quantity of an item: the `serving size` and the `number of servings`.

- The `serving size` must be specified in the unit which the nutrition information is based on. For example, if the nutrition information is per 100g, but your serving was only 60g, then enter `60`.
- The `number of servings` functions as a multiplication factor. For example, if you ate two and a halve servings of the food, enter `2.5`.

## Specifying the quantities of diary entries requires too much switching back and forth. Isn't there a more convenient way?

Check out the `Prompt for quantity when adding items` option under `Settings > Diary`.

## Can I use Waistline to track exercises?

Waistline is primarily intended to be a calories tracker. However, it is also possible to track exercises in the Diary. If you add a diary entry with a negative calories amount (for calories burned in an exercise), Waistline automatically increases your calories goal for that day accordingly. For example, if your calories goal is 2000 kcal and you add an entry with -100 kcal of burned calories, your goal would increase to 2100 kcal since you now have to eat more to cover your energy needs.

## How can I quickly add consumed or burned calories to the Diary?

Waistline has a quick add feature for this. Press and hold the `+` button in the Diary and enter the number of calories into the text field. For burned calories from exercises, enter a negative number. You can also add an optional description for the entry.

## How do I delete entries from the food list or from the Diary.

Press and hold the item you want to delete and then confirm the desired action.

## Why can't I delete a food or recipe? It only gives me the option to "archive" it?

When you add a food or recipe to the diary, Waistline only stores a reference to it, including the serving size and the number of servings you entered. Any changes you make to the original food or recipe will also affect all diary entries that reference it. This is also the reason why you cannot fully delete a food or recipe, because there might still be old diary entries that reference it.

When the nutrition information for a food product has changed, or when you want to adapt a particular recipe, you should archive the original food/recipe and create a new one. This way, any old diary entries referencing the item remain unaffected. The easiest way to do this is to press and hold the food/recipe and select `Clone item and archive original`.

If you accidently archived an item, you can easily unarchive it: Select the 🗑 trash icon from the filter menu inside the search bar to see a list of archived items. Then press and hold the item you want to restore.

## I want to see a breakdown of my nutrition intake on a particular day, including the macro nutriment split (Fat : Carbs : Proteins).

Tap on the pie chart button in the menu bar at the top of the Diary. This will take you to an Overview page.

## I want to see a breakdown of the nutrition for a particular diary meal, e.g. to see how much sugar was in my breakfast.

Tap on the energy total at the bottom of the meal group in the Diary. This will open a dialog with more information.

## How can I customize the meal names "Breakfast", "Lunch" etc. in the Diary and/or define my own ones?

Go to `Settings > Diary > Categories`.

## I would like to change the sort order of my food list such that most recently used/modified products show up first.

Go to `Settings > Foods, Meals, Recipes > Sort Foods`.

## How can I organize my list of foods, meals and recipes more effectively?

You can assign custom categories to the foods, meals and recipes in your local database. You can then use the filter icon inside the search box to more easily find the items you are looking for.

To customize the food categories, go to `Settings > Foods, Meals, Recipes > Labels and Categories`. If you don't want to use the food categories, simply remove all of them.

It is recommended (but not required) to use emojis as labels for the categories, e.g. 🌳 for fruits and vegetables and 🏪 for convenience products. But feel free to come up with your own system that works best for you.

If you enable the `Show Category Labels` option under `Settings > Foods, Meals, Recipes`, the name of each food item in the food list will be preceded by the labels of the categories that are assigned to it.

## I want to customize the list of tracked nutriments and body stats. How can I do that?

The list of nutriments can be customized under `Settings > Nutriments`. You can rearrange the items in the list via press and hold, and you can add custom nutriments such as "water". By default, only nutriments that are enabled here will show up in the Food Editor and on the Overview page in the Diary. When you are in the Food Editor, you can tap on `Show more Nutriments` to temporarily see the hidden nutriments as well. And if you enable the `Show all nutriments on Overview page ` option under `Settings > Diary`, all nutriments will be shown on the Overview page in the Diary.

The body stats list can be customized under `Settings > Body Stats`. You can rearrange the items in the list via press and hold, and you can add custom stats such as "blood pressure". Only fields that are enabled here can be tracked in the diary, and only those show up on the Statistics page. If you don't want to track any body stats, simply disable all fields.

## How can I control which nutriments are displayed at the bottom of the Diary and on the Statistics page?

This can be done on the `Goals` page. Tap on the nutriment you want to show/hide and set the `Show in Diary` and `Show in Statistics` options accordingly. If you don't see the nutriment you are looking for, you may first need to switch over to `All Fields` at the bottom.

## Do you plan to add support for the [XXX] online food database or API available in my country?

It is unlikely that support for more online databases will be added anytime soon. However, you can use the `Import Foods` feature under `Settings > Import/Export` to add large quantities of food items to your local database without polluting your food list with hundreds of unused entries. Items imported through this interface are stored in your local database, but they are hidden by default and only show up if you set the filter inside the search bar to the food category used during the import.

The `Import Foods` interface expects a `utf-8` encoded text file in the following format. Each entry in the `foodList` array must have a `name`, a `portion`, and a `unit`. The `brand` and `uniqueId` are optional. The `uniqueId` can be used to avoid duplicate entries of the same item. If you later import another item with the same `uniqueId`, the old entry will be overwritten.

```json
{
    "version": 1,
    "foodList": [
        {
            "name": "Grilled Tri-color Carrots w/ Peruvian Salsa Verde",
            "brand": "DeNeve Flex Bar Dinner",
            "uniqueId": "177068",
            "portion": 2.0,
            "unit": "oz",
            "nutrition": {
                "calcium": 26.0,
                "calories": 57.0,
                "carbohydrates": "4.8",
                "cholesterol": "0.2",
                "fat": "4.2",
                "fiber": "1.8",
                "iron": 0.54,
                "proteins": "0.5",
                "saturated-fat": "0.4",
                "sodium": "256.8",
                "sugars": "2.6",
                "trans-fat": "0",
                "vitamin-a": 2196.0,
                "vitamin-c": 5.3999999999999995
            }
        },
        {
            "name": "Grilled Yellow Squash",
            "brand": "DeNeve Flex Bar Dinner",
            "uniqueId": "175110",
            "portion": 2.0,
            "unit": "oz",
            "nutrition": {
                "calcium": 39.0,
                "calories": 26.0,
                "carbohydrates": "3.6",
                "cholesterol": "1.5",
                "fat": "1",
                "fiber": "1.3",
                "iron": 0.72,
                "proteins": "1.7",
                "saturated-fat": "0.5",
                "sodium": "99.2",
                "sugars": "2",
                "trans-fat": "0",
                "vitamin-a": 207.0,
                "vitamin-c": 12.600000000000001
            }
        }
    ]
}
```
