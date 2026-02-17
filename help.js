const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
        config: {
                name: "help",
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                shortDescription: {
                        en: "View command usage and list all commands directly",
                        bn: "কমান্ড ব্যবহারের নিয়ম এবং তালিকা দেখুন",
                        vi: "Xem cách sử dụng và danh sách lệnh"
                },
                longDescription: {
                        en: "View command usage and list all commands directly",
                        bn: "কমান্ড ব্যবহারের নিয়ম এবং তালিকা দেখুন",
                        vi: "Xem cách sử dụng và danh sách lệnh"
                },
                category: "info",
                guide: {
                        en: "{pn} [command name]",
                        bn: "{pn} [কমান্ডের নাম]",
                        vi: "{pn} [tên lệnh]"
                },
                priority: 1,
        },

        onStart: async function ({ message, args, event, threadsData, role }) {
                const { threadID } = event;
                const threadData = await threadsData.get(threadID);
                const prefix = getPrefix(threadID);
                const langCode = threadData.data.lang || global.GoatBot.config.language || "en";

                if (args.length === 0) {
                        const categories = {};
                        let msg = "";

                        for (const [name, value] of commands) {
                                if (value.config.role > 1 && role < value.config.role) continue;
                                const category = value.config.category || "Uncategorized";
                                categories[category] = categories[category] || { commands: [] };
                                categories[category].commands.push(name);
                        }

                        Object.keys(categories).forEach((category) => {
                                if (category.toLowerCase() !== "info") {
                                        msg += `\n╭─────⭓ ${category.toUpperCase()}`;
                                        const names = categories[category].commands.sort();
                                        for (let i = 0; i < names.length; i += 3) {
                                                const cmds = names.slice(i, i + 3).map((item) => `✧${item}`);
                                                msg += `\n│ ${cmds.join("  ")}`;
                                        }
                                        msg += `\n╰────────────⭓\n`;
                                }
                        });

                        const totalCommands = commands.size;
                        let helpHint = `Type ${prefix}help <cmd> to see details.`;
                        if (langCode === "bn") helpHint = `বিস্তারিত দেখতে ${prefix}help <কমান্ড> লিখুন।`;
                        if (langCode === "vi") helpHint = `Nhập ${prefix}help <lệnh> để xem chi tiết.`;

                        msg += `\n\n⭔ Total Commands: ${totalCommands}\n⭔ ${helpHint}\n`;
                        msg += `\n╭─✦ ADMIN: MahMUD 彡\n├‣ WHATSAPP\n╰‣ 01836298139`;

                        try {
                                const hh = await message.reply({ body: msg });
                                setTimeout(() => message.unsend(hh.messageID), 80000);
                        } catch (error) {
                                console.error("Error sending help message:", error);
                        }

                } else {
                        const commandName = args[0].toLowerCase();
                        const command = commands.get(commandName) || commands.get(aliases.get(commandName));

                        if (!command) {
                                const notFound = langCode === "bn" ? `কমান্ড "${commandName}" খুঁজে পাওয়া যায়নি।` : 
                                                 langCode === "vi" ? `Không tìm thấy lệnh "${commandName}".` : 
                                                 `Command "${commandName}" not found.`;
                                return message.reply(notFound);
                        }

                        const config = command.config;
                        const roleText = roleTextToString(config.role, langCode);

                        const labels = {
                                bn: { name: "নাম", alias: "ডাকনাম", info: "তথ্য", desc: "বর্ণনা", author: "লেখক", guide: "নির্দেশনা", usage: "ভার্সন ও পারমিশন", ver: "ভার্সন", role: "অনুমতি", none: "নেই", unknown: "অজানা" },
                                vi: { name: "Tên", alias: "Tên khác", info: "Thông tin", desc: "Mô tả", author: "Tác giả", guide: "Hướng dẫn", usage: "Phiên bản & Quyền", ver: "Phiên bản", role: "Quyền hạn", none: "Không có", unknown: "Không xác định" },
                                en: { name: "NAME", alias: "Aliases", info: "INFO", desc: "Description", author: "Author", guide: "Guide", usage: "Details", ver: "Version", role: "Role", none: "None", unknown: "Unknown" }
                        };

                        const lb = labels[langCode] || labels.en;

                        const authorName = config.author || lb.unknown;
                        const desc = config.longDescription?.[langCode] || config.longDescription?.en || config.shortDescription?.[langCode] || config.shortDescription?.en || "No description";
                        const guideBody = config.guide?.[langCode] || config.guide?.en || "No guide available.";
                        
                        const usage = guideBody
                                .replace(/{pn}/g, prefix + config.name)
                                .replace(/{p}/g, prefix)
                                .replace(/{he}/g, prefix)
                                .replace(/{lp}/g, config.name);

                        const response = `╭─────────⭓\n` +
                                         `│ 🎀 ${lb.name}: ${config.name}\n` +
                                         `│ 📃 ${lb.alias}: ${config.aliases ? config.aliases.join(", ") : lb.none}\n` +
                                         `├──‣ ${lb.info}\n` +
                                         `│ 📝 ${lb.desc}: ${desc}\n` +
                                         `│ 👑 ${lb.author}: ${authorName}\n` +
                                         `│ 📚 ${lb.guide}: ${usage}\n` +
                                         `├──‣ ${lb.usage}\n` +
                                         `│ ⭐ ${lb.ver}: ${config.version || "1.0"}\n` +
                                         `│ ♻️ ${lb.role}: ${roleText}\n` +
                                         `╰────────────⭓`;

                        const helpMessage = await message.reply(response);
                        setTimeout(() => message.unsend(helpMessage.messageID), 80000);
                }
        }
};

function roleTextToString(roleText, lang) {
        if (lang === "bn") {
                switch (roleText) {
                        case 0: return "০ (সব ইউজার)";
                        case 1: return "১ (গ্রুপ অ্যাডমিন)";
                        case 2: return "২ (বোট অ্যাডমিন)";
                        default: return "অজানা";
                }
        } else if (lang === "vi") {
                switch (roleText) {
                        case 0: return "0 (Tất cả người dùng)";
                        case 1: return "1 (Quản trị viên nhóm)";
                        case 2: return "2 (Admin bot)";
                        default: return "Không xác định";
                }
        } else {
                switch (roleText) {
                        case 0: return "0 (All users)";
                        case 1: return "1 (Group administrators)";
                        case 2: return "2 (Admin bot)";
                        default: return "Unknown";
                }
        }
}
