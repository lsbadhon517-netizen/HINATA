const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
  const response = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return response.data.mahmud;
};

module.exports = {
        config: {
                name: "anime",
                aliases: ["anivid", "animevideo"],
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                category: "anime",
                guide: {
                        bn: '   {pn}: রেন্ডম এনিমে ভিডিও পেতে ব্যবহার করুন'
                                + '\n   {pn} list: মোট এনিমে লিস্ট দেখতে ব্যবহার করুন',
                        en: '   {pn}: Use to get a random anime video'
                                + '\n   {pn} list: Use to see total anime list'
                }
        },

        langs: {
                bn: {
                        noCategory: "❌ | কোনো এনিমে ক্যাটাগরি পাওয়া যায়নি।",
                        loading: "🐤 | 𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗿𝗮𝗻𝗱𝗼𝗺 𝗮𝗻𝗶𝗺𝗲 𝘃𝗶𝗱𝗲𝗼...𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..!!",
                        noVideo: "❌ | কোনো ভিডিও পাওয়া যায়নি।",
                        success: "✨ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨",
                        error: "× ভিডিও আনতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noCategory: "❌ | No anime categories found.",
                        loading: "🐤 | 𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗿𝗮𝗻𝗱𝗼𝗺 𝗮𝗻𝗶𝗺𝗲 𝘃𝗶𝗱𝗲𝗼...𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..!!",
                        noVideo: "❌ | No videos found.",
                        success: "✨ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨",
                        error: "× Failed to fetch video: %1. Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, event, message, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const apiBase = await mahmud();

                        if (args[0] === "list") {
                                const response = await axios.get(`${apiBase}/api/album/list`);
                                const lines = response.data.message.split("\n");
                                const animeCategories = lines.filter(line =>
                                        /anime/i.test(line) && !/hanime/i.test(line) && !/Total\s*anime/i.test(line)
                                );
                                if (!animeCategories.length) return message.reply(getLang("noCategory"));
                                return message.reply(animeCategories.join("\n"));
                        }

                        const waitMsg = await message.reply(getLang("loading"));
                        setTimeout(() => { api.unsendMessage(waitMsg.messageID); }, 5000);

                        const res = await axios.get(`${apiBase}/api/album/mahmud/videos/anime?userID=${event.senderID}`);
                        if (!res.data.success || !res.data.videos.length) return message.reply(getLang("noVideo"));

                        const url = res.data.videos[Math.floor(Math.random() * res.data.videos.length)];
                        const cachePath = path.join(__dirname, "cache", `anime_${Date.now()}.mp4`);
                        if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

                        const video = await axios({
                                url,
                                method: "GET",
                                responseType: "stream",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        const writer = fs.createWriteStream(cachePath);
                        video.data.pipe(writer);

                        writer.on("finish", async () => {
                                await message.reply({
                                        body: getLang("success"),
                                        attachment: fs.createReadStream(cachePath)
                                });
                                fs.unlinkSync(cachePath);
                        });

                        writer.on("error", (err) => { throw err; });

                } catch (err) {
                        console.error("ERROR:", err);
                        return message.reply(getLang("error", err.message));
                }
        }
};
