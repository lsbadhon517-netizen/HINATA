const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "animeinfo",
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "যেকোনো অ্যানিমের বিস্তারিত তথ্য দেখুন",
                        en: "Get detailed information about any anime"
                },
                category: "anime",
                guide: {
                        bn: '   {pn} <অ্যানিমের নাম>: অ্যানিমের তথ্য দেখতে নাম লিখুন'
                                + '\n   উদাহরণ: {pn} Naruto',
                        en: '   {pn} <anime name>: Type anime name to search'
                                + '\n   Example: {pn} Naruto'
                }
        },

        langs: {
                bn: {
                        noInput: "⚠️ বেবি, একটি অ্যানিমের নাম তো দাও!",
                        notFound: "❌ দুঃখিত, এই নামে কোনো অ্যানিমে খুঁজে পাওয়া যায়নি।",
                        error: "× তথ্য আনতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noInput: "⚠️ Baby, please enter an anime name!",
                        notFound: "❌ Sorry, no anime found with that name.",
                        error: "× API error: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const query = args.join(" ");
                if (!query) return message.reply(getLang("noInput"));

                try {
                        const baseUrl = await mahmud();
                        const url = `${baseUrl}/api/animeinfo?animeName=${encodeURIComponent(query)}`;
                        
                        const res = await axios.get(url);
                        if (!res.data || !res.data.data) return message.reply(getLang("notFound"));
                        const { formatted_message, data } = res.data;

                        return api.sendMessage({
                                body: formatted_message,
                                attachment: await global.utils.getStreamFromURL(data.image_url)
                        }, event.threadID, event.messageID);

                } catch (err) {
                        console.error("Anime Info Error:", err);
                        return message.reply(getLang("error", err.message));
                }
        }
};
