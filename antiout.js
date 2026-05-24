module.exports = {
        config: {
                name: "antiout",
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "অ্যান্টি-আউট চালু বা বন্ধ করুন",
                        en: "Enable or disable antiout",
                        vi: "Bật hoặc tắt tính năng chống rời nhóm"
                },
                category: "boxchat",
                guide: {
                        bn: '   {pn} [on | off]',
                        en: '   {pn} [on | off]',
                        vi: '   {pn} [on | off]'
                }
        },

        langs: {
                bn: {
                        invalidArg: "⚠️ দয়া করে আর্গুমেন্ট হিসেবে 'on' অথবা 'off' ব্যবহার করুন।",
                        enabled: "✅ অ্যান্টি-আউট সফলভাবে চালু (enabled) করা হয়েছে।",
                        disabled: "❌ অ্যান্টি-আউট বন্ধ (disabled) করা হয়েছে।"
                },
                en: {
                        invalidArg: "⚠️ Please use 'on' or 'off' as an argument.",
                        enabled: "✅ Antiout has been enabled.",
                        disabled: "❌ Antiout has been disabled."
                },
                vi: {
                        invalidArg: "⚠️ Vui lòng sử dụng 'on' hoặc 'off' làm đối số.",
                        enabled: "✅ Đã bật tính năng chống rời nhóm.",
                        disabled: "❌ Đã tắt tính năng chống rời nhóm."
                }
        },

        onStart: async function ({ api, event, message, threadsData, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                let antiout = await threadsData.get(event.threadID, "settings.antiout");
                if (antiout === undefined) {
                        await threadsData.set(event.threadID, true, "settings.antiout");
                        antiout = true;
                }

                if (!["on", "off"].includes(args[0])) {
                        return message.reply(getLang("invalidArg"));
                }

                const isEnable = args[0] === "on";
                await threadsData.set(event.threadID, isEnable, "settings.antiout");

                return message.reply(isEnable ? getLang("enabled") : getLang("disabled"));
        },

        onEvent: async function ({ api, event, threadsData }) {
                const antiout = await threadsData.get(event.threadID, "settings.antiout");
                if (antiout && event.logMessageData && event.logMessageData.leftParticipantFbId) {
                        const userId = event.logMessageData.leftParticipantFbId;

                        const threadInfo = await api.getThreadInfo(event.threadID);
                        const userIndex = threadInfo.participantIDs.indexOf(userId);
                        if (userIndex === -1) {
                                try {
                                        const addUser = await api.addUserToGroup(userId, event.threadID);
                                        if (addUser) {
                                                console.log(`User ${userId} was added back to the group chat you can't escape.`);
                                        }
                                } catch (err) {
                                        console.log(`Failed to add user ${userId} back to the group chat:`, err);
                                }
                        }
                }
        }
};
