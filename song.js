const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`);
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "song",
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "ইউটিউব থেকে গান ডাউনলোড করুন",
                        en: "Download songs/audio from YouTube",
                        vi: "Tải nhạc từ YouTube"
                },
                category: "media",
                guide: {
                        bn: '   {pn} [গানের নাম বা লিঙ্ক]\n   উদাহরণ: {pn} tui chinli na amay',
                        en: '   {pn} [song name or link]\n   Example: {pn} stay justin bieber',
                        vi: '   {pn} [tên bài hát hoặc link]\n   Ví dụ: {pn} see you again'
                }
        },

        langs: {
                bn: {
                        error: "❌ | সমস্যা হয়েছে: %1",
                        noResult: "⭕ | দুঃখিত বেবি, \"%1\" এর জন্য কিছু খুঁজে পাইনি।",
                        choose: "গানের তালিকা:\n\n%1\nগানের নাম্বার লিখে রিপ্লাই দিন।",
                        success: "✅ | ডাউনলোড সম্পন্ন: %1"
                },
                en: {
                        error: "❌ | An error occurred: %1",
                        noResult: "⭕ | No search results match the keyword %1",
                        choose: "Song Results:\n\n%1\nReply with a number to download.",
                        success: "✅ | Successfully Downloaded: %1"
                }
        },

        onStart: async function ({ api, args, message, event, commandName, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68); 
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID, senderID } = event;
                const input = args.join(" ");

                if (!input) return api.sendMessage("• বেবি, গানের নাম বা লিঙ্ক দিন! 🎶", threadID, messageID);

                const apiUrl = await baseApiUrl();
                const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

                if (checkurl.test(input)) {
                        const videoID = input.match(checkurl)[1];
                        api.setMessageReaction("⌛", messageID, () => {}, true);
                        return handleDownload(api, threadID, messageID, videoID, apiUrl, getLang);
                }

                try {
                        api.setMessageReaction("⏳", messageID, () => {}, true);
                        const res = await axios.get(`${apiUrl}/api/ytb/search?q=${encodeURIComponent(input)}`);
                        const results = res.data.results.slice(0, 6);
                        
                        if (!results || results.length === 0) return api.sendMessage(getLang("noResult", input), threadID, messageID);

                        let msg = "";
                        const attachments = [];
                        const cacheDir = path.join(__dirname, 'cache');
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

                        for (let i = 0; i < results.length; i++) {
                                msg += `${i + 1}. ${results[i].title}\nTime: ${results[i].time}\n\n`;
                                const thumbPath = path.join(cacheDir, `thumb_${senderID}_${Date.now()}_${i}.jpg`);
                                const thumbRes = await axios.get(results[i].thumbnail, { responseType: 'arraybuffer' });
                                fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
                                attachments.push(fs.createReadStream(thumbPath));
                        }

                        return api.sendMessage({
                                body: getLang("choose", msg),
                                attachment: attachments
                        }, threadID, (err, info) => {
                                attachments.forEach(stream => { if (fs.existsSync(stream.path)) fs.unlinkSync(stream.path); });
                                global.GoatBot.onReply.set(info.messageID, { 
                                        commandName, 
                                        author: senderID, 
                                        results, 
                                        apiUrl 
                                });
                        }, messageID);

                } catch (e) {
                        return api.sendMessage(getLang("error", e.message), threadID, messageID);
                }
        },

        onReply: async function ({ event, api, Reply, getLang }) {
                const { results, apiUrl, author } = Reply;
                if (event.senderID !== author) return;
                
                const choice = parseInt(event.body);
                if (isNaN(choice) || choice <= 0 || choice > results.length) return;
                
                const videoID = results[choice - 1].id;
                api.unsendMessage(Reply.messageID);
                api.setMessageReaction("⌛", event.messageID, () => {}, true);
               
                await handleDownload(api, event.threadID, event.messageID, videoID, apiUrl, getLang);
        }
};

async function handleDownload(api, threadID, messageID, videoID, apiUrl, getLang) {
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const filePath = path.join(cacheDir, `music_${Date.now()}.mp3`);

        try {
                const res = await axios.get(`${apiUrl}/api/ytb/get?id=${videoID}&type=audio`);
                const { title, downloadLink } = res.data.data;
                
                const response = await axios({ url: downloadLink, method: 'GET', responseType: 'stream' });
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on('finish', () => {
                        api.sendMessage({
                                body: getLang("success", title),
                                attachment: fs.createReadStream(filePath)
                        }, threadID, () => { 
                                api.setMessageReaction("✅", messageID, () => {}, true);
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath); 
                        }, messageID);
                });
        } catch (e) {
                api.sendMessage(getLang("error", "Download failed!"), threadID, messageID);
        }
}
