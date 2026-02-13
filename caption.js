const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "caption",
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                category: "love",
                guide: {
                        bn: '   {pn} <category>: নির্দিষ্ট ক্যাটাগরির ক্যাপশন পান'
                                + '\n   {pn} list: সব ক্যাটাগরির লিস্ট দেখুন'
                                + '\n   {pn} add <category> <bn/en> <text>: নতুন ক্যাপশন যোগ করুন',
                        en: '   {pn} <category>: Get caption by category'
                                + '\n   {pn} list: See all categories'
                                + '\n   {pn} add <cat> <lang> <text>: Add a new caption'
                }
        },

        langs: {
                bn: {
                        list: ">🎀 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬:\n\n%1",
                        noInput: "× বেবি, একটি ক্যাটাগরি দাও! উদাহরণ: {pn} love",
                        addGuide: "⚠ ক্যাটাগরি, ভাষা (bn/en) এবং ক্যাপশন টেক্সট সঠিকভাবে দাও।",
                        success: "✅| এই নাও তোমার %1 ক্যাপশন:\n\n%2",
                        error: "× ক্যাপশন পেতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        list: ">🎀 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬:\n\n%1",
                        noInput: "× Baby, please specify a category! Example: {pn} love",
                        addGuide: "⚠ Please specify a category, language (bn/en), and caption text.",
                        success: "✅| Here’s your %1 caption:\n\n%2",
                        error: "× Failed to fetch caption: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const baseUrl = await baseApiUrl();

                        if (args[0] === "list") {
                                const res = await axios.get(`${baseUrl}/api/caption/list`);
                                const categories = res.data.categories.map(cat => `• ${cat}`).join("\n");
                                return message.reply(getLang("list", categories));
                        }

                        if (args[0] === "add") {
                                if (args.length < 4) return message.reply(getLang("addGuide"));
                                const category = args[1];
                                const language = args[2];
                                const caption = args.slice(3).join(" ");
                                try {
                                        const res = await axios.post(`${baseUrl}/api/caption/add`, { category, language, caption });
                                        return message.reply(res.data.message);
                                } catch (e) {
                                        return message.reply(getLang("error", "Add failed"));
                                }
                        }

                        const category = args[0];
                        if (!category) return message.reply(getLang("noInput"));

                        const language = args[1] || "bn";

                        const res = await axios.get(`${baseUrl}/api/caption`, { params: { category, language } });
                        return message.reply(getLang("success", category, res.data.caption));

                } catch (err) {
                        console.error("Caption error:", err);
                        return message.reply(getLang("error", err.message));
                }
        }
};
