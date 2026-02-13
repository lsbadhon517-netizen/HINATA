const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "cdp",
                aliases: ["coupledp", "cp"],
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "রেন্ডম কাপল প্রোফাইল পিকচার (CDP) পান",
                        en: "Get random couple profile pictures (CDP)"
                },
                category: "love",
                guide: {
                        bn: '   {pn}: রেন্ডম কাপল ডিপি পেতে ব্যবহার করুন'
                                + '\n   {pn} list: মোট ডিপি সংখ্যা দেখতে ব্যবহার করুন',
                        en: '   {pn}: Get a random Couple DP'
                                + '\n   {pn} list: Show total number of Couple DPs'
                }
        },

        langs: {
                bn: {
                        total: "🎀 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏: %1",
                        notFound: "⚠ কোনো কাপল ডিপি খুঁজে পাওয়া যায়নি।",
                        success: "🎀 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐜𝐝𝐩 𝐛𝐚𝐛𝐲",
                        error: "× ডিপি আনতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        total: "🎀 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏: %1",
                        notFound: "⚠ No Couple DP found.",
                        success: "🎀 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐜𝐝𝐩 𝐛𝐚𝐛𝐲",
                        error: "× API error: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const baseURL = await mahmud();

                        if (args[0] === "list") {
                                const res = await axios.get(`${baseURL}/api/cdp/list`);
                                return message.reply(getLang("total", res.data.total));
                        }

                        const res = await axios.get(`${baseURL}/api/cdp`);
                        const { boy, girl } = res.data;
                        
                        if (!boy || !girl) return message.reply(getLang("notFound"));

                        const getStream = async (url) => {
                                const response = await axios({
                                        method: "GET",
                                        url,
                                        responseType: "stream",
                                        headers: { 'User-Agent': 'Mozilla/5.0' }
                                });
                                return response.data;
                        };

                        const attachments = [
                                await getStream(boy),
                                await getStream(girl)
                        ];

                        return message.reply({
                                body: getLang("success"),
                                attachment: attachments
                        });

                } catch (err) {
                        console.error("CDP command error:", err);
                        return message.reply(getLang("error", err.message));
                }
        }
};
