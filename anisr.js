const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
        config: {
                name: "anisr",
                aliases: ["animesr", "anisearch"],
                version: "1.7",
                author: "MahMUD",
                countDown: 7,
                role: 0,
                description: {
                        bn: "অ্যানিমে ভিডিও সার্চ এবং ডাউনলোড করুন",
                        en: "Search and download anime videos"
                },
                category: "anime",
                guide: {
                        bn: '   {pn} <অ্যানিমের নাম>: অ্যানিমে ভিডিও খুঁজতে নাম লিখুন'
                                + '\n   উদাহরণ: {pn} naruto',
                        en: '   {pn} <anime name>: Type anime name to search'
                                + '\n   Example: {pn} naruto'
                }
        },

        langs: {
                bn: {
                        noQuery: "• বেবি, একটি অ্যানিমের নাম তো দাও! 😘",
                        success: "• 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 <😘\n• 𝐒𝐞𝐚𝐫𝐜𝐡: %1",
                        error: "× অ্যানিমে ভিডিও আনতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noQuery: "• Baby, please provide a search query! 😘",
                        success: "• 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 <😘\n• 𝐒𝐞𝐚𝐫𝐜𝐡: %1",
                        error: "× Error fetching anime video: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!args.length) return message.reply(getLang("noQuery"));

                const kw = args.join(" ");
                const cacheDir = path.join(__dirname, "cache");
                const videoPath = path.join(cacheDir, `anisr_${Date.now()}.mp4`);
                
                await fs.ensureDir(cacheDir);

                try { 
                        api.setMessageReaction("⏳", event.messageID, () => {}, true); 
                } catch (e) {}

                try {
                        const base = await baseApiUrl();
                        const apiUrl = `${base}/api/anisr?search=${encodeURIComponent(kw)}`;
                        
                        const res = await axios({ 
                                method: "get", 
                                url: apiUrl, 
                                responseType: "stream",
                                timeout: 60000 
                        });

                        const writer = fs.createWriteStream(videoPath);
                        res.data.pipe(writer);

                        await new Promise((resolve, reject) => { 
                                writer.on("finish", resolve);  
                                writer.on("error", reject);
                        });

                        if (fs.statSync(videoPath).size < 100) { 
                                throw new Error("File empty or invalid.");
                        }

                        await message.reply({ 
                                body: getLang("success", kw),
                                attachment: fs.createReadStream(videoPath)
                        });

                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                } catch (err) {
                        console.error(err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                } finally {
                        setTimeout(() => { 
                                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); 
                        }, 5000);
                }
        }
};
