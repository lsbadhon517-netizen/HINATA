const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
        config: {
                name: "4k",
                aliases: ["hd", "upscale"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "AI এর মাধ্যমে ছবির কোয়ালিটি 4K বা HD করুন",
                        en: "Enhance or restore image quality to 4K using AI"
                },
                category: "tools",
                guide: {
                        bn: '   {pn} [url]: ছবির লিংকের মাধ্যমে HD করুন'
                                + '\n   অথবা ছবির রিপ্লাইয়ে {pn} লিখুন',
                        en: '   {pn} [url]: Upscale image via URL'
                                + '\n   Or reply to an image with {pn}'
                }
        },

        langs: {
                bn: {
                        noImage: "× বেবি, একটি ছবিতে রিপ্লাই দাও অথবা ছবির লিংক প্রদান করো!",
                        wait: "𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× ছবি এইচডি করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noImage: "× Baby, please reply to an image or provide an image URL!",
                        wait: "𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× API error: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                let imgUrl;
                if (event.messageReply?.attachments?.[0]?.type === "photo") {
                        imgUrl = event.messageReply.attachments[0].url;
                } else if (args[0]) {
                        imgUrl = args.join(" ");
                }

                if (!imgUrl) return message.reply(getLang("noImage"));

                const waitMsg = await message.reply(getLang("wait"));
                message.reaction("😘", event.messageID);

                try {
                        const baseUrl = await mahmud();
                        const apiUrl = `${baseUrl}/api/hd/mahmud?imgUrl=${encodeURIComponent(imgUrl)}`;
                        
                        const res = await axios.get(apiUrl, { responseType: "stream" });

                        if (waitMsg?.messageID) message.unsend(waitMsg.messageID);
                        message.reaction("✅", event.messageID);

                        return message.reply({
                                body: getLang("success"),
                                attachment: res.data
                        });

                } catch (err) {
                        console.error("Error in 4k command:", err);
                        if (waitMsg?.messageID) message.unsend(waitMsg.messageID);
                        message.reaction("❎", event.messageID);
                        return message.reply(getLang("error", err.message));
                }
        }
};
