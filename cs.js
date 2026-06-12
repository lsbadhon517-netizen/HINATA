const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "cmdstore",
                aliases: ["cmds", "cs"],
                version: "1.7",
                author: "MahMUD",
                countDown: 0,
                role: 0,
                category: "utility",
                description: {
                        bn: "কমান্ড স্টোর ব্রাউজ করুন",
                        en: "Browse command store",
                        vi: "Duyệt qua cửa hàng lệnh"
                },
                guide: {
                        bn: "{pn} [পৃষ্ঠা / নাম]",
                        en: "{pn} [page / name]",
                        vi: "{pn} [trang / tên]"
                }
        },

        langs: {
                bn: {
                        notAuthorized: "আপনি লেখকের নাম পরিবর্তন করার জন্য অনুমোদিত নন।",
                        notFound: "❌ | কোনো কমান্ড পাওয়া যায়নি।",
                        notYourReply: "❌ | এটা তোমার রিপ্লাই না বেবি 🐸",
                        invalidSelection: "❌ | ভুল সিলেকশন! সঠিক সংখ্যা দিন।",
                        error: "❌ | সমস্যা হয়েছে: %1",
                        header: "╭─‣ 𝐇𝐈𝐍𝐀𝐓𝐀 𝐒𝐓𝐎𝐑𝐄 🎀\n├‣ 𝐀𝐃𝐌𝐈𝐍: 𝐌𝐚𝐡𝐌𝐔𝐃\n├‣ 𝐓𝐎𝐓𝐀𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒: %1\n╰────────────◊\n",
                        footer: "\n📄 | 𝐏𝐚𝐠𝐞 [%1/%2]\nℹ | 𝐓𝐲𝐩𝐞 !cmds %3 - পরবর্তী পৃষ্ঠা দেখতে।"
                },
                en: {
                        notAuthorized: "You are not authorized to change the author name.",
                        notFound: "❌ | No commands found.",
                        notYourReply: "❌ | not your reply baby 🐸",
                        invalidSelection: "❌ | Invalid selection! Please enter a valid number.",
                        error: "❌ | API Error: %1",
                        header: "╭─‣ 𝐇𝐈𝐍𝐀𝐓𝐀 𝐒𝐓𝐎𝐑𝐄 🎀\n├‣ 𝐀𝐃𝐌𝐈𝐍: 𝐌𝐚𝐡𝐌𝐔𝐃\n├‣ 𝐓𝐎𝐓𝐀𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒: %1\n╰────────────◊\n",
                        footer: "\n📄 | 𝐏𝐚𝐠𝐞 [%1/%2]\nℹ | 𝐓𝐲𝐩𝐞 !cmds %3 - 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞."
                },
                vi: {
                        notAuthorized: "Bạn không có quyền thay đổi tên tác giả.",
                        notFound: "❌ | Không tìm thấy lệnh.",
                        notYourReply: "❌ | Không phải phản hồi của bạn đâu cưng 🐸",
                        invalidSelection: "❌ | Lựa chọn không hợp lệ!",
                        error: "❌ | Lỗi: %1",
                        header: "╭─‣ 𝐇𝐈𝐍𝐀𝐓𝐀 𝐒𝐓𝐎𝐑𝐄 🎀\n├‣ 𝐀𝐃𝐌𝐈𝐍: 𝐌𝐚𝐡𝐌𝐔𝐃\n├‣ 𝐓𝐎𝐓𝐀𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒: %1\n╰────────────◊\n",
                        footer: "\n📄 | Trang [%1/%2]\nℹ | Nhập !cmds %3 - để xem trang tiếp theo."
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68); // "MahMUD"
                if (this.config.author !== authorName) return api.sendMessage(getLang("notAuthorized"), event.threadID, event.messageID);

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        const baseURL = await baseApiUrl();
                        const query = args.join(" ").trim();
                        let apiUrl = `${baseURL}/api/cmdstore`;

                        if (query) {
                                if (!isNaN(query)) apiUrl += `?page=${query}`;
                                else apiUrl += `?q=${encodeURIComponent(query)}`;
                        }

                        const { data } = await axios.get(apiUrl);

                        if (!data.success || !data.commands.length) {
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return api.sendMessage(getLang("notFound"), event.threadID, event.messageID);
                        }

                        let msg = getLang("header", data.total);

                        data.commands.forEach(cmd => {
                                msg += `╭─‣ ${cmd.serial}: ${cmd.name}\n├‣ Author: ${cmd.author}\n├‣ Update: ${cmd.update}\n╰────────────◊\n`;
                        });

                        msg += getLang("footer", data.page, data.totalPages, data.page + 1);

                        api.setMessageReaction("🪽", event.messageID, () => {}, true);
                        api.sendMessage(msg, event.threadID, (err, info) => {
                                if (!err) {
                                        global.GoatBot.onReply.set(info.messageID, {
                                                commandName: this.config.name,
                                                messageID: info.messageID,
                                                author: event.senderID,
                                                page: data.page,
                                                commands: data.commands
                                        });
                                }
                        }, event.messageID);

                } catch (err) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
                }
        },

        onReply: async function ({ api, event, Reply, getLang }) {
                if (Reply.author !== event.senderID) {
                        return api.sendMessage(getLang("notYourReply"), event.threadID, event.messageID);
                }

                const index = parseInt(event.body);
                const list = Reply.commands;

                if (isNaN(index) || index < 1 || index > list.length) {
                        return api.sendMessage(getLang("invalidSelection"), event.threadID, event.messageID);
                }

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        const baseURL = await baseApiUrl();
                        const selected = list[index - 1];

                        const { data } = await axios.get(`${baseURL}/api/cmdstore/info?name=${encodeURIComponent(selected.name)}`);

                        if (!data.success) {
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return api.sendMessage(getLang("notFound"), event.threadID, event.messageID);
                        }

                        api.unsendMessage(Reply.messageID);

                        const msg = `╭────────◊\n├‣ Command: ${data.command}\n├‣ URL: ${data.url}\n╰─────────────◊`;

                        api.setMessageReaction("🪽", event.messageID, () => {}, true);
                        return api.sendMessage(msg, event.threadID, event.messageID);

                } catch (err) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
                }
        }
};
