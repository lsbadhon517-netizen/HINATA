const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "flux",
                version: "1.7",
                author: "MahMUD",
                countDown: 15,
                role: 0,
                category: "Image gen",
                guide: {
                        bn: '   {pn} <প্রম্পট>: আপনার কল্পনার কথা লিখে ছবি বানান',
                        en: '   {pn} <prompt>: Type your imagination to generate image'
                }
        },

        langs: {
                bn: {
                        noPrompt: "× বেবি, কিছু তো লেখো কি ধরনের ছবি চাও!",
                        wait: "✅ ছবি তৈরি হচ্ছে, একটু অপেক্ষা করো বেবি...!!",
                        success: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐟𝐥𝐮𝐱 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲 <😘",
                        error: "× ছবি তৈরি করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noPrompt: "× Baby, please provide a prompt to generate image!",
                        wait: "✅ image Generating, please wait...!!",
                        success: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐟𝐥𝐮𝐱 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲 <😘",
                        error: "× API error: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!args.length) return message.reply(getLang("noPrompt"));

                const prompt = args.join(" ");
                const seed = Math.floor(Math.random() * 1000000);
                const cacheDir = path.join(__dirname, "cache");
                const filePath = path.join(cacheDir, `flux_${Date.now()}.png`);

                const waitMsg = await message.reply(getLang("wait"));

                try {
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

                        const baseUrl = await baseApiUrl();
                        const url = `${baseUrl}/api/gen?prompt=${encodeURIComponent(prompt)}&model=flux&seed=${seed}`;
                        
                        const response = await axios.get(url, { responseType: "arraybuffer" });
                        fs.writeFileSync(filePath, Buffer.from(response.data));

                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

                        await message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(filePath)
                        });

                        setTimeout(() => {
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        }, 5000);

                } catch (err) {
                        console.error("Error in flux command:", err);
                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                        return message.reply(getLang("error", err.message));
                }
        }
};
