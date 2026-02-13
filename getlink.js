const axios = require("axios");

const baseApiUrl = async () => {
        const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return res.data.mahmud;
};

module.exports = {
        config: {
                name: "getlink",
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "যেকোনো মিডিয়া ফাইল থেকে সরাসরি লিংক তৈরি করুন",
                        en: "Generate direct links from any media file"
                },
                category: "tools",
                guide: {
                        bn: '   {pn}: মিডিয়াতে রিপ্লাই দিয়ে সরাসরি লিংক পান'
                                + '\n   {pn} tinyurl: শর্ট লিংক তৈরি করুন'
                                + '\n   {pn} imgur: ইমগুর লিংক তৈরি করুন'
                                + '\n   {pn} catbox: ক্যাটবক্স লিংক তৈরি করুন',
                        en: '   {pn}: Reply to media for direct link'
                                + '\n   {pn} tinyurl: Create short link'
                                + '\n   {pn} imgur: Create Imgur link'
                                + '\n   {pn} catbox: Create Catbox link'
                }
        },

        langs: {
                bn: {
                        noMedia: "× বেবি, একটি ছবি, ভিডিও বা অডিও ফাইলে রিপ্লাই দাও!",
                        success: "✅ | এই নাও তোমার %1 লিংক বেবি <😘\n\n",
                        error: "× লিংক তৈরি করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noMedia: "× Baby, please reply to an image / video / audio first!",
                        success: "✅ | Here is your %1 link baby <😘\n\n",
                        error: "× Failed to get link: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const { messageReply, type } = event;
                        if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
                                return message.reply(getLang("noMedia"));
                        }

                        api.setMessageReaction("⌛", event.messageID, () => {}, true);
                        let num = 0;
                        const input = args[0]?.toLowerCase();
                        const baseUrl = await baseApiUrl();

                        if (["tinyurl", "t", "--t"].includes(input)) {
                                let msg = getLang("success", "TinyURL");
                                for (const att of messageReply.attachments) {
                                        num++;
                                        const res = await axios.get(`${baseUrl}/api/tinyurl?url=${encodeURIComponent(att.url)}`);
                                        msg += `${num}: ${res.data.link}\n`;
                                }
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                return message.reply(msg);
                        }

                        if (["imgbb", "i", "--i"].includes(input)) {
                                let msg = getLang("success", "ImgBB");
                                for (const att of messageReply.attachments) {
                                        num++;
                                        const res = await axios.get(`${baseUrl}/api/imgbb?url=${encodeURIComponent(att.url)}`);
                                        msg += `${num}: ${res.data.link}\n`;
                                }
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                return message.reply(msg);
                        }
 
                        if (["imgur", "imgururl"].includes(input)) {
                                let msg = getLang("success", "Imgur");
                                for (const att of messageReply.attachments) {
                                        num++;
                                        const res = await axios.get(`${baseUrl}/api/imgur?url=${encodeURIComponent(att.url)}`);
                                        msg += `${num}: ${res.data.link}\n`;
                                }
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                return message.reply(msg);
                        }
 
                        if (["catbox", "cb", "c", "--c"].includes(input)) {
                                let msg = getLang("success", "Catbox");
                                for (const att of messageReply.attachments) {
                                        num++;
                                        const res = await axios.get(`${baseUrl}/api/catbox?url=${encodeURIComponent(att.url)}`);
                                        msg += `${num}: ${res.data.link}\n`;
                                }
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                return message.reply(msg);
                        }

                        let msg = getLang("success", "Direct");
                        for (const att of messageReply.attachments) {
                                num++;
                                msg += `${num}: ${att.url}\n`;
                        }
                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        return message.reply(msg);

                } catch (err) {
                        console.error(err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
