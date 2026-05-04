const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "ocr",
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "ছবি থেকে টেক্সট এক্সট্রাক্ট করুন",
                        en: "Extract text from image",
                        vi: "Trích xuất văn bản từ hình ảnh"
                },
                category: "tools",
                guide: {
                        bn: '   {pn} [reply]: ছবির রিপ্লাই দিয়ে টেক্সট পান',
                        en: '   {pn} [reply]: Reply to an image to get text',
                        vi: '   {pn} [reply]: Trả lời một hình ảnh để lấy văn bản'
                }
        },

        langs: {
                bn: {
                        noImage: "❌ | দয়া করে একটি ছবির রিপ্লাই দিন।",
                        processing: "⏳ | ছবি থেকে টেক্সট খোঁজা হচ্ছে...",
                        failed: "❌ | টেক্সট বের করতে ব্যর্থ হয়েছে।",
                        success: "📝 | এক্সট্রাক্ট করা টেক্সট:\n\n%1",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noImage: "❌ | Please reply to an image.",
                        processing: "⏳ | Processing image...Please wait",
                        failed: "❌ | Failed to extract text.",
                        success: "📝 | Extracted Text:\n\n%1",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noImage: "❌ | Vui lòng trả lời một hình ảnh.",
                        processing: "⏳ | Đang xử lý hình ảnh...",
                        failed: "❌ | Không thể trích xuất văn bản.",
                        success: "📝 | Văn bản trích xuất:\n\n%1",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const reply = event.messageReply;

                        if (!reply || !reply.attachments || reply.attachments[0].type !== "photo") {
                                return message.reply(getLang("noImage"));
                        }

                        const imageUrl = reply.attachments[0].url;
                        const baseURL = await mahmud();

                        await message.reply(getLang("processing"));

                        const res = await axios.get(`${baseURL}/api/ocr?image=${encodeURIComponent(imageUrl)}`);
                        const text = res.data.extractedText;

                        if (!text || text === "No text found") {
                                return message.reply(getLang("failed"));
                        }

                        return message.reply(getLang("success", text));

                } catch (err) {
                        console.error("OCR Error:", err);
                        return message.reply(getLang("error", err.message));
                }
        }
};
