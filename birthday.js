const axios = require("axios");

const mahmhd = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "birthday",
                aliases: ["wish"],
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "কাউকে সুন্দরভাবে জন্মদিনের শুভেচ্ছা জানান",
                        en: "Wish someone a happy birthday with a cool font"
                },
                category: "love",
                guide: {
                        bn: '   {pn} <@tag>: কাউকে ট্যাগ করে উইশ করুন',
                        en: '   {pn} <@tag>: Tag someone to wish them'
                }
        },

        langs: {
                bn: {
                        noMention: "× বেবি, কাকে উইশ করবে তাকে ট্যাগ তো করো! 🎂",
                        success: "%1",
                        error: "× উইশ করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noMention: "× Baby, you need to tag someone to wish! 🎂",
                        success: "%1",
                        error: "× Something went wrong: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const mention = Object.keys(event.mentions);
                if (mention.length === 0) return message.reply(getLang("noMention"));

                const taggedUserName = event.mentions[mention[0]].replace('@', '');

                try {
                        const baseApi = await mahmhd();
                        const apiUrl = `${baseApi}/api/wish/font3?taggedUserName=${encodeURIComponent(taggedUserName)}`;
                        const response = await axios.get(apiUrl);
                        const data = response.data;

                        if (data.status === "success") {
                                return message.reply(data.response);
                        } else {
                                return message.reply(getLang("error", "API status failed"));
                        }

                } catch (err) {
                        console.error(err);
                        return message.reply(getLang("error", err.message));
                }
        }
};
