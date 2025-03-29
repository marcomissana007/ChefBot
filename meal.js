export function generateMealInfo() {
    let meal;
    const RECIPE_NAME = "https://www.themealdb.com/api/json/v1/1/search.php?s="; 

    return {
        getInfos: async (recipeName) => {
            const response = await fetch(RECIPE_NAME + recipeName);
            const data = await response.json();

            if (!data.meals || !data.meals[0]) {
                return "No result found!";
            }

            meal = data.meals[0];

            let text = "*INFOS ABOUT THIS THIS MEAL*\n\n";
            text += "Name: " + "_" + meal.strMeal + "_" + "\n";
            text += "Category: " + "_" + meal.strCategory + "_" + "\n";
            text += "Area:  " + "_" + meal.strArea + "_" + "\n";

            return text;
        },
    }
}