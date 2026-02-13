const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "countryinfo",
                aliases: ["country", "ci"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "যেকোনো দেশের বিস্তারিত তথ্য দেখুন",
                        en: "View detailed information about any country"
                },
                category: "info",
                guide: {
                        bn: '   {pn} <দেশের নাম>: দেশের নাম লিখে তথ্য দেখুন'
                                + '\n   উদাহরণ: {pn} Bangladesh',
                        en: '   {pn} <country name>: Search for country info'
                                + '\n   Example: {pn} Bangladesh'
                }
        },

        langs: {
                bn: {
                        noInput: "× বেবি, একটি দেশের নাম তো দাও!",
                        success: ">🎀 𝐁𝐚𝐛𝐲, 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 %1 𝐂𝐨𝐮𝐧𝐭𝐫𝐲 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧",
                        error: "× তথ্য খুঁজে পাওয়া যায়নি: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noInput: "× Baby, please provide a country name!",
                        success: ">🎀 𝐁𝐚𝐛𝐲, 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 %1 𝐂𝐨𝐮𝐧𝐭𝐫𝐲 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧",
                        error: "× Could not find info for \"%1\". Contact MahMUD for help."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const countryName = args.join(" ");
                if (!countryName) return message.reply(getLang("noInput"));

                try {
                        const apiUrl = await baseApiUrl();
                        const res = await axios.get(`${apiUrl}/api/country?name=${encodeURIComponent(countryName)}`);
                        const d = res.data.data;

                        const msg = `${getLang("success", d.name)}\n\n` +
                                    `🌍 𝐍𝐚𝐦𝐞: ${d.name} ${d.emoji}\n` +
                                    `🏛️ 𝐂𝐚𝐩𝐢𝐭𝐚𝐥: ${d.capital}\n` +
                                    `👥 𝐏𝐨𝐩𝐮𝐥𝐚𝐭𝐢𝐨𝐧: ${d.population.toLocaleString()}\n` +
                                    `📏 𝐀𝐫𝐞𝐚: ${d.area.toLocaleString()} Sq Km\n` +
                                    `📚 𝐋𝐚𝐧𝐠𝐮𝐚𝐠𝐞𝐬: ${Array.isArray(d.languages) ? d.languages.join(", ") : d.languages}\n` +
                                    `🚩 𝐑𝐞𝐠𝐢𝐨𝐧: ${d.region}\n` +
                                    `💰 𝐂𝐮𝐫𝐫𝐞𝐧𝐜𝐲: ${Array.isArray(d.currency) ? d.currency.join(", ") : d.currency}\n` +
                                    `⏰ 𝐓𝐢𝐦𝐞𝐳𝐨𝐧𝐞: ${d.timezone}\n` +
                                    `🚧 𝐁𝐨𝐫𝐝𝐞𝐫𝐬: ${d.borders && d.borders.length > 0 ? d.borders.join(", ") : "None"}\n` +
                                    `🌐 𝐃𝐨𝐦𝐚𝐢𝐧: ${d.tld}\n` +
                                    `📍 𝐌𝐚𝐩: ${d.map}`;

                        return api.sendMessage({
                                body: msg,
                                attachment: await global.utils.getStreamFromURL(d.flag)
                        }, event.threadID, event.messageID);

                } catch (err) {
                        console.error(err);
                        return message.reply(getLang("error", countryName));
                }
        }
};
