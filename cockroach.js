const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "cockroach",
                aliases: ["cock"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                category: "fun",
                guide: {
                        bn: '   {pn} <@tag>: কাউকে ট্যাগ করে তেলাপোকা বানান'
                                + '\n   {pn} <uid>: UID এর মাধ্যমে ছবি তৈরি করুন'
                                + '\n   (অথবা কারো মেসেজে রিপ্লাই দিয়ে এটি ব্যবহার করুন)',
                        en: '   {pn} <@tag>: Make someone a cockroach'
                                + '\n   {pn} <uid>: Create using UID'
                                + '\n   (Or reply to someone\'s message)'
                }
        },

        langs: {
                bn: {
                        noTarget: "× বেবি, কাকে তেলাপোকা বানাবে তাকে মেনশন দাও বা রিপ্লাই করো!",
                        success: "এই নাও তোমার তেলাপোকা 🐸",
                        error: "× ছবি তৈরি করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noTarget: "× Baby, mention or reply to someone to make a cockroach!",
                        success: "Here's your cockroach image 🐸",
                        error: "× Failed to create image: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { mentions, messageReply } = event;
                let id;

                if (Object.keys(mentions).length > 0) {
                        id = Object.keys(mentions)[0];
                } else if (messageReply) {
                        id = messageReply.senderID;
                } else if (args[0] && !isNaN(args[0])) {
                        id = args[0];
                }

                if (!id) return message.reply(getLang("noTarget"));

                const cacheDir = path.join(__dirname, "cache");
                const filePath = path.join(cacheDir, `cockroach_${id}.png`);

                try {
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

                        const apiUrl = await baseApiUrl();
                        const url = `${apiUrl}/api/cockroach?user=${id}`;
                        const response = await axios.get(url, { responseType: "arraybuffer" });
                        fs.writeFileSync(filePath, Buffer.from(response.data));

                        await message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(filePath)
                        });

                        fs.unlinkSync(filePath);

                } catch (err) {
                        console.error("Error in cockroach command:", err);
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
