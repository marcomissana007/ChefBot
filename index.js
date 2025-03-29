import { generateMealInfo } from './meal.js';
import { readFileSync } from 'fs';
import TelegramBot from 'node-telegram-bot-api';

const conf = JSON.parse(readFileSync('conf.json'));
const token = conf.key;

const bot = new TelegramBot(token, { polling: true });

const mealComponent = generateMealInfo();

bot.setMyCommands([
    { command: "/start", description: "Start the bot" },
    { command: "/meal", description: "Get informations about a recipe(use: /meal recipe_name)" },
]);

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") {
        bot.sendMessage(chatId, "Hello! I will be your bot cook and help you cook your favorite recipes. In addition, I may also serve as your teacher by serving you with tasks to do to test your personal knowledge.\n\n\n\n*You can do the following commands:*\n/start - to see this message\n/meal _name_ - get informations about a meal", {parse_mode: "Markdown"});
    } else if (text.startsWith("/meal ")) {
        const mealName = text.split(" ").slice(1).join(" ");

        bot.sendMessage(chatId, await mealComponent.getInfos(mealName), {parse_mode: "Markdown"});
    }
   
});