import { generateMealInfo } from './meal.js';
import { generateRandomMeal } from './randomMeal.js';
import { readFileSync } from 'fs';
import TelegramBot from 'node-telegram-bot-api';

const conf = JSON.parse(readFileSync('conf.json'));
const token = conf.key;

const bot = new TelegramBot(token, { polling: true });

const mealComponent = generateMealInfo();
const randomMealGenerator = generateRandomMeal();

const playingGame = {};
const secondPlayingGame = {};
const thirdPlayingGame = {};

bot.setMyCommands([
    { command: "/start", description: "Start the bot" },
    { command: "/meal", description: "Get informations about a recipe(use: /meal recipe_name)" },
    { command: "/guessbyphoto", description: "Guess a meal by photo" },
    { command: "/guessingredients", description: "Guess meal ingredients"},
    { command: "/guessnationality", description: "Guess meal origin"},
]);

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") {
        bot.sendMessage(chatId, "Hello! I will be your bot cook and help you cook your favorite recipes. In addition, I may also serve as your teacher by serving you with tasks to do to test your personal knowledge.\n\n\n\n*You can do the following commands:*\n/start - to see this message\n/meal _name_ - get informations about a meal\n/guessbyphoto - guess a meal by photo\n/guessingredients - guess ingredients by meal photo and name\n/guessnationality - guess meal origin", {parse_mode: "Markdown"});
    } else if (text.startsWith("/meal ")) {
        const mealName = text.split(" ").slice(1).join(" ");
        await mealComponent.build(mealName);

        if (mealComponent.getPhoto != null) {
            bot.sendPhoto(chatId, mealComponent.getPhoto(), {caption: mealComponent.getInfos(), parse_mode: "Html", disable_web_page_preview: true});
        } else {
            bot.sendMessage(chatId, mealComponent.getInfos());
        }
    } else if (text === "/guessbyphoto") {
      const randomMealName = await randomMealGenerator.getRandomMealName();
      await mealComponent.build(randomMealName);

      playingGame[chatId] = {
        answer: randomMealName,
        photoMessageId: null,
        guessTries: 3,
      };

      const photo = await bot.sendPhoto(chatId, mealComponent.getPhoto(), {caption: "<i>Guess the following meal, you just need to guess ONE word(<b>reply to this message</b>)</i>", parse_mode: "Html"});
      playingGame[chatId].photoMessageId = photo.message_id;
    } else if (msg.reply_to_message && msg.reply_to_message.message_id === playingGame[chatId]?.photoMessageId) {
        const userGuess = text.toLowerCase();

        if (playingGame[chatId].answer.toLowerCase().includes(userGuess)) {
            await bot.sendMessage(chatId, "Right! You have guessed the meal! The meal was <b>" + playingGame[chatId].answer + "</b>", {parse_mode: "Html"});
            delete playingGame[chatId];
        } else if (playingGame[chatId].guessTries > 0){
            await bot.sendMessage(chatId, "Wrong! Try a new guess! You have <b>" + playingGame[chatId].guessTries + "</b> more attempts", {parse_mode: "Html"});
            playingGame[chatId].guessTries--;
        } else {
            await bot.sendMessage(chatId, "Sorry you have lost, the meal was <b>" + playingGame[chatId].answer + "</b>", {parse_mode: "Html"});
            delete playingGame[chatId];
        }
    } else if (text === "/guessingredients") {
        const randomMealName = await randomMealGenerator.getRandomMealName();
        await mealComponent.build(randomMealName);
        const ingredients = mealComponent.getIngredients();

        secondPlayingGame[chatId] = {
            answer: ingredients,
            photoMessageId: null,
            totalIngredients: ingredients.length,
            ingredientsGuessed: 0,
        };

        const photo = await bot.sendPhoto(chatId, mealComponent.getPhoto(), {caption: "<i>Name:</i> <b>" + randomMealName + "</b>\n\n<i>Guess the following meal ingredients, (<b>reply to this message</b>)</i>", parse_mode: "Html"});
        secondPlayingGame[chatId].photoMessageId = photo.message_id;
    } else if (msg.reply_to_message && msg.reply_to_message.message_id === secondPlayingGame[chatId]?.photoMessageId) {
        const userGuess = text.toLowerCase();

        if (secondPlayingGame[chatId].answer.includes(userGuess)) {
            secondPlayingGame[chatId].ingredientsGuessed++;
            secondPlayingGame[chatId].answer.splice(
                secondPlayingGame[chatId].answer.indexOf(userGuess),
                1
            );
            await bot.sendMessage(chatId, "You have guessed one ingredient!\n\n<i>Score:</i> <b>" + secondPlayingGame[chatId].ingredientsGuessed + "/" + secondPlayingGame[chatId].totalIngredients + "</b>", {parse_mode: "Html"});
        } else {
            await bot.sendMessage(chatId, "Wrong ingredient or you have already guessed it! Try a new guess! You have \n\n<i>Score:</i> <b>" + secondPlayingGame[chatId].ingredientsGuessed + "/" + secondPlayingGame[chatId].totalIngredients + "</b>", {parse_mode: "Html"});
        }

        if (secondPlayingGame[chatId].ingredientsGuessed === secondPlayingGame[chatId].totalIngredients) {
            await bot.sendMessage(chatId, "<b>Well done!</b> You have guessed all ingredients!\n\n\n <i>that's not easy!You are ready to win Masterchef</i>", {parse_mode: "Html"});
            delete secondPlayingGame[chatId];
        }
    } else if (text === "/guessnationality") {
        const randomMealName = await randomMealGenerator.getRandomMealName();
        await mealComponent.build(randomMealName);
  
        thirdPlayingGame[chatId] = {
          answer: mealComponent.getArea(),
          photoMessageId: null,
          guessTries: 3,
        };
  
        const photo = await bot.sendPhoto(chatId, mealComponent.getPhoto(), {caption: "<i>Guess the origin of the following meal, ex. italian, spanish...(<b>reply to this message</b>)</i>", parse_mode: "Html"});
        thirdPlayingGame[chatId].photoMessageId = photo.message_id;
    } else if (msg.reply_to_message && msg.reply_to_message.message_id === thirdPlayingGame[chatId]?.photoMessageId) {
        const userGuess = text.toLowerCase();

        if (userGuess === thirdPlayingGame[chatId].answer.toLowerCase()) {
            await bot.sendMessage(chatId, "Right! You have guessed the origin! The meal was <b>" + thirdPlayingGame[chatId].answer + "</b>", {parse_mode: "Html"});
            delete playingGame[chatId];
        } else if (thirdPlayingGame[chatId].guessTries > 0){
            await bot.sendMessage(chatId, "Wrong! Try a new guess! You have <b>" + thirdPlayingGame[chatId].guessTries + "</b> more attempts", {parse_mode: "Html"});
            thirdPlayingGame[chatId].guessTries--;
        } else {
            await bot.sendMessage(chatId, "Sorry you have lost, the meal was <b>" + thirdPlayingGame[chatId].answer + "</b>", {parse_mode: "Html"});
            delete thirdPlayingGame[chatId];
        }
    } 
});


