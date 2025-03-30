export function generateRandomMeal() {
    const RANDOM_RECIPE = "https://www.themealdb.com/api/json/v1/1/random.php"; 

    return {
        getRandomMealName: async () => {
            const response = await fetch(RANDOM_RECIPE);
            const data = await response.json();

            return data.meals[0].strMeal;
        },
    }
}