const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
    const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`);
    return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
    config: {
        name: "ytb",
        version: "1.7",
        author: "MahMUD",
        countDown: 5,
        role: 0,
        description: {
            vi: "Tải video, audio hoặc xem thông tin video trên YouTube",
            en: "Download video, audio or view video information on YouTube"
        },
        category: "media",
        guide: {
            vi: "   {pn} [video|-v] [<tên video>|<link video>]: dùng để tải video từ youtube."
                + "\n   {pn} [audio|-a] [<tên video>|<link video>]: dùng để tải audio từ youtube"
                + "\n   {pn} [info|-i] [<tên video>|<link video>]: dùng để xem thông tin video từ youtube"
                + "\n   Ví dụ:"
                + "\n    {pn} -v Mood Lofi"
                + "\n    {pn} -a Mood Lofi"
                + "\n    {pn} -i Mood Lofi",
            en: "   {pn} [video|-v] [<video name>|<video link>]: use to download video from youtube."
                + "\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from youtube"
                + "\n   {pn} [info|-i] [<video name>|<video link>]: use to view video information from youtube"
                + "\n   Example:"
                + "\n    {pn} -v Mood Lofi"
                + "\n    {pn} -a Mood Lofi"
                + "\n    {pn} -i Mood Lofi"
        }
    },

    langs: {
        vi: {
            error: "❌ Đã xảy ra lỗi: %1",
            noResult: "⭕ Không có kết quả tìm kiếm nào phù hợp với từ khóa %1",
            choose: "%1Reply tin nhắn với số để chọn hoặc nội dung bất kì để gỡ",
            video: "video",
            audio: "âm thanh",
            downloading: "⬇️ Đang tải xuống %1 \"%2\"",
            info: "💠 Tiêu đề: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Thời gian video: %4\n👀 Lượt xem: %5\n👍 Lượt thích: %6\n🆙 Ngày tải lên: %7\n🔠 ID: %8\n🔗 Link: %9"
        },
        en: {
            error: "❌ An error occurred: %1",
            noResult: "⭕ No search results match the keyword %1",
            choose: "%1Reply to the message with a number to choose or any content to cancel",
            video: "video",
            audio: "audio",
            downloading: "⬇️ Downloading %1 \"%2\"",
            info: "💠 Title: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Video duration: %4\n👀 View count: %5\n👍 Like count: %6\n🆙 Upload date: %7\n🔠 ID: %8\n🔗 Link: %9"
        }
    },

    onStart: async function ({ api, args, message, event, commandName, getLang }) {
        const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
        if (module.exports.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
      }
        
        const { threadID, messageID, senderID } = event;
        let type;

        switch (args[0]) {
            case "-v":
            case "video":
                type = "video";
                break;
            case "-a":
            case "-s":
            case "audio":
            case "sing":
                type = "audio";
                break;
            case "-i":
            case "info":
                type = "info";
                break;
            default:
                return message.SyntaxError();
        }

        const input = args.slice(1).join(" ");
        if (!input) return message.reply("• Please provide a song name or link");

        const apiUrl = await baseApiUrl();
        const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
        if (checkurl.test(input)) {
            const videoID = input.match(checkurl)[1];
            if (type === 'info') return fetchInfo(api, threadID, messageID, videoID, apiUrl, getLang);
            return handleDownload(api, threadID, messageID, videoID, type, apiUrl, getLang);
        }

        try {
            const res = await axios.get(`${apiUrl}/api/ytb/search?q=${encodeURIComponent(input)}`);
            const results = res.data.results.slice(0, 6);
            if (!results || results.length === 0) return message.reply(getLang("noResult", input));

            let msg = "";
            const attachments = [];
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            for (let i = 0; i < results.length; i++) {
                msg += `${i + 1}. ${results[i].title}\nTime: ${results[i].time}\n\n`;
                const thumbPath = path.join(cacheDir, `thumb_${senderID}_${Date.now()}_${i}.jpg`);
                const thumbRes = await axios.get(results[i].thumbnail, { responseType: 'arraybuffer' });
                fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
                attachments.push(fs.createReadStream(thumbPath));
            }

            return message.reply({
                body: getLang("choose", msg),
                attachment: attachments
            }, (err, info) => {
                attachments.forEach(stream => { if (fs.existsSync(stream.path)) fs.unlinkSync(stream.path); });
                global.GoatBot.onReply.set(info.messageID, { commandName, author: senderID, results, type, apiUrl });
            });

        } catch (e) {
            return message.reply(getLang("error", e.message));
        }
    },

    onReply: async function ({ event, api, Reply, getLang }) {
        const { results, type, apiUrl, author } = Reply;
        if (event.senderID !== author) return;
        const choice = parseInt(event.body);
        if (isNaN(choice) || choice <= 0 || choice > results.length) return api.unsendMessage(Reply.messageID);
        const videoID = results[choice - 1].id;
        api.unsendMessage(Reply.messageID);
       
        if (type === 'info') return fetchInfo(api, event.threadID, event.messageID, videoID, apiUrl, getLang);
        await handleDownload(api, event.threadID, event.messageID, videoID, type, apiUrl, getLang);
    }
};

async function handleDownload(api, threadID, messageID, videoID, type, apiUrl, getLang) {
    const format = type === 'audio' ? 'mp3' : 'mp4';
    const filePath = path.join(__dirname, 'cache', `yt_${Date.now()}.${format}`);

    try {
        const res = await axios.get(`${apiUrl}/api/ytb/get?id=${videoID}&type=${type}`);
        const { title, downloadLink } = res.data.data;
        api.sendMessage(getLang("downloading", getLang(type), title), threadID, messageID);
        const writer = fs.createWriteStream(filePath);
        const response = await axios({ url: downloadLink, method: 'GET', responseType: 'stream' });
        response.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `✅ Downloaded: ${title}`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); }, messageID);
        });
    } catch (e) {
        api.sendMessage(getLang("error", "Download failed baby."), threadID, messageID);
    }
}

async function fetchInfo(api, threadID, messageID, videoID, apiUrl, getLang) {
    try {
        const res = await axios.get(`${apiUrl}/api/ytb/details?id=${videoID}`);
        const d = res.data.details;
        const msg = getLang("info", 
            d.title, d.channel, d.subCount || 'N/A', d.duration_raw || d.duration, 
            d.view_count, d.like_count || 'N/A', d.upload_date || 'N/A', videoID, d.webpage_url
        );

        const thumbPath = path.join(__dirname, 'cache', `info_${videoID}.jpg`);
        const thumbRes = await axios.get(d.thumbnail, { responseType: 'arraybuffer' });
        fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
        api.sendMessage({ body: msg, attachment: fs.createReadStream(thumbPath) }, 
            threadID, () => { if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath); }, messageID);
      } catch (e) {
       api.sendMessage(getLang("error", "Could not found details."), threadID, messageID);
    }
}
