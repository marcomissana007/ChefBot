export function generateMealInfo() {
    let meal;
    const RECIPE_NAME = "https://www.themealdb.com/api/json/v1/1/search.php?s="; 

    return {
        build: async (recipeName) => {
            const response = await fetch(RECIPE_NAME + recipeName);
            const data = await response.json();

            if (!data.meals || !data.meals[0]) {
                meal = null;
                return;
            }

            meal = data.meals[0];
        },

        getInfos: () => {
            if (meal != null) {
                let text = "<b>INFOS ABOUT THIS THIS MEAL</b>\n\n";
                text += "Name: " + "<i>" + meal.strMeal + "</i>" + "\n";
                text += "Category: " + "<i>" + meal.strCategory + "</i>" + "\n";
                text += "Area:  " + "<i>" + meal.strArea + "</i>" + "\n\n\n";

                text += "<b>INGREDIENTS AND QUANTITY</b>\n\n"
                for (let i = 1; i <= 20; i++) {
                    if (meal["strIngredient" + i] != null && meal["strIngredient" + i].trim() != "") {
                        text += meal["strIngredient" + i] + " <i>" + meal["strMeasure" + i] + "</i>\n";
                    }
                }

                text += "\n";

                text += "<b>RECIPE INSTRUCTION</b>\n\n";
                text += "<i>Visual instructions: </i>" + '<a href="' + meal.strYoutube + '">' + "<b>click here</b>" + "</a>\n\n";
                text += "<i>" + meal.strInstructions + "</i>\n\n\n";

                return text;
            }

            return "No result found";
        },
        getArea: () => {
            return meal.strArea;
        },
        getIngredients: () => {
            let ingredients = [];

            for (let i = 1; i <= 20; i++) {
                if (meal["strIngredient" + i] != null && meal["strIngredient" + i].trim() != "") {
                    ingredients.push(meal["strIngredient" + i].toLowerCase());
                }
            }

            return ingredients;
        },
        getPhoto: () => {
            if (meal != null) {
                return meal.strMealThumb;
            } 
            
            return null;
        },
    }
}