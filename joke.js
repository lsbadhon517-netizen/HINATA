const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "joke",
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "একটি চমৎকার কৌতুক বা জোকস পড়ুন",
                        en: "Get a random funny joke"
                },
                category: "fun",
                guide: {
                        bn: '   {pn}: রেন্ডম জোকস পেতে ব্যবহার করুন',
                        en: '   {pn}: Use to get a random joke'
                }
        },

        langs: {
                bn: {
                        error: "× জোকস আনতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        error: "× Failed to fetch joke: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const baseUrl = await mahmud();
                        const apiUrl = `${baseUrl}/api/joke`;
                        
                        const res = await axios.get(apiUrl);
                        const { joke, message: jokeTitle } = res.data;

                        return message.reply(`${jokeTitle}\n\n😂 ${joke}`);

                } catch (err) {
                        console.error("Joke command error:", err);
                        return message.reply(getLang("error", err.message));
                }
        }
};
