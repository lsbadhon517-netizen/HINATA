const axios = require("axios");

const mahmud = async () => {
        const response = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return response.data.mahmud;
};

module.exports = {
        config: {
                name: "blur",
                aliases: ["blured"],
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "যেকোনো ছবিকে ব্লার বা ঝাপসা করুন",
                        en: "Make any image blurry with adjustable levels"
                },
                category: "image",
                guide: {
                        bn: '   {pn} <1-100>: ছবির রিপ্লাইয়ে লেভেল লিখে ব্লার করুন'
                                + '\n   {pn} <url> <1-100>: লিংকের মাধ্যমে ব্লার করুন',
                        en: '   {pn} <1-100>: Reply to an image with blur level'
                                + '\n   {pn} <url> <1-100>: Provide image URL and blur level'
                }
        },

        langs: {
                bn: {
                        invalidLevel: "× বেবি, ব্লার লেভেল ১ থেকে ১০০ এর মধ্যে দাও!",
                        noImage: "× বেবি, একটি ছবিতে রিপ্লাই দাও অথবা ছবির লিংক প্রদান করো!",
                        wait: "বেবি, একটু অপেক্ষা করো... <😘",
                        success: "এই নাও তোমার %1%% ব্লার করা ছবি বেবি। <😘",
                        error: "× ছবি ব্লার করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        invalidLevel: "× Baby, please enter a blur level between 1–100!",
                        noImage: "× Baby, please reply to an image or provide an image URL!",
                        wait: "Baby, Please wait a moment... <😘",
                        success: "Here's your %1% blurred image baby. <😘",
                        error: "× API error: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, args, message, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        let imageUrl;
                        let blurLevel = 50;

                        if (event.type === "message_reply" && event.messageReply.attachments?.length > 0) {
                                imageUrl = event.messageReply.attachments[0].url;
                                if (args[0] && !isNaN(args[0])) {
                                        const level = parseInt(args[0]);
                                        if (level >= 1 && level <= 100) blurLevel = level;
                                        else return message.reply(getLang("invalidLevel"));
                                }
                        } else if (args[0]?.startsWith("http")) {
                                imageUrl = args[0];
                                if (args[1] && !isNaN(args[1])) {
                                        const level = parseInt(args[1]);
                                        if (level >= 1 && level <= 100) blurLevel = level;
                                        else return message.reply(getLang("invalidLevel"));
                                }
                        } else if (!isNaN(args[0]) && event.type === "message_reply" && event.messageReply.attachments?.length > 0) {
                                const level = parseInt(args[0]);
                                if (level >= 1 && level <= 100) {
                                        blurLevel = level;
                                        imageUrl = event.messageReply.attachments[0].url;
                                } else return message.reply(getLang("invalidLevel"));
                        } else {
                                return message.reply(getLang("noImage"));
                        }

                        api.setMessageReaction("😘", event.messageID, () => {}, true);
                        const waitMsg = await message.reply(getLang("wait"));

                        const apiUrl = await mahmud();
                        const imgStream = `${apiUrl}/api/blur/mahmud?url=${encodeURIComponent(imageUrl)}&blurLevel=${blurLevel}`;

                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        if (waitMsg?.messageID) message.unsend(waitMsg.messageID);

                        return message.reply({
                                body: getLang("success", blurLevel),
                                attachment: await global.utils.getStreamFromURL(imgStream)
                        });

                } catch (err) {
                        console.error("Error in blur command:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
