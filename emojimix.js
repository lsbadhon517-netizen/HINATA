const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "emojimix",
                aliases: ["mix"],
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "দুটি ইমোজি মিশিয়ে নতুন একটি ইমোজি তৈরি করুন",
                        en: "Mix two emojis to create a unique new one"
                },
                category: "fun",
                guide: {
                        bn: '   {pn} <ইমোজি১> <ইমোজি২>: দুটি ইমোজি দিন'
                                + '\n   উদাহরণ: {pn} 🙂 😘',
                        en: '   {pn} <emoji1> <emoji2>: Provide two emojis'
                                + '\n   Example: {pn} 🙂 😘'
                }
        },

        langs: {
                bn: {
                        invalid: "× বেবি, দুটি ইমোজি তো দাও! উদাহরণ: {pn} 🙂 😘",
                        mixFail: "× দুঃখিত, %1 এবং %2 ইমোজি দুটি মেশানো সম্ভব নয়।",
                        success: "এই নাও তোমার মিক্স ইমোজি বেবি! %1 + %2 <😘",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        invalid: "× Baby, please provide two emojis! Example: {pn} 🙂 😘",
                        mixFail: "× Sorry, emoji %1 and %2 can't be mixed.",
                        success: "Here's your mixed emoji baby! %1 + %2 <😘",
                        error: "× API error: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const [emoji1, emoji2] = args;
                if (!emoji1 || !emoji2) return message.reply(getLang("invalid"));

                try {
                        const baseUrl = await baseApiUrl();
                        const apiUrl = `${baseUrl}/api/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;

                        const response = await axios.get(apiUrl, {
                                headers: { "Author": authorName },
                                responseType: "stream"
                        });

                        if (response.data.error) {
                                return message.reply(getLang("mixFail", emoji1, emoji2));
                        }

                        return message.reply({
                                body: getLang("success", emoji1, emoji2),
                                attachment: response.data
                        });

                } catch (err) {
                        console.error("Emojimix Error:", err);
                        return message.reply(getLang("error", err.message));
                }
        }
};
