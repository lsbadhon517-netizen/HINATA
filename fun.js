const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
    const base = await axios.get(
        "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
    );
    return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
    config: {
        name: "fun",
        aliases: ["dig", "funny"],
        version: "1.7",
        author: "MahMUD",
        role: 0,
        category: "fun",
        cooldown: 10,
        guide: "{pn} [type] [mention/reply/UID] | list",
    },

    onStart: async function ({ api, event, args }) {
        const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
        if (module.exports.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
        } 
      
        const { threadID, messageID, messageReply, mentions, senderID } = event;
        const type = args[0]?.toLowerCase();
        const baseUrl = await baseApiUrl();

        if (!type) return api.sendMessage("❌ Provide a DIG type! Use 'fun list' to see all.", threadID, messageID);
        if (type === "list") {
            try {
                const res = await axios.get(`${baseUrl}/api/dig/list`);
                const types = res.data.types || [];
                return api.sendMessage(`🎭 Available Effects:\n\n${types.join(", ")}`, threadID, messageID);
            } catch (err) {
                return api.sendMessage(`🥹 Failed to fetch list.`, threadID, messageID);
            }
        }

        let targetID;
        if (messageReply) {
            targetID = messageReply.senderID;
        } else if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else if (args[1]) {
            targetID = args[1];
        }

        if (!targetID) return api.sendMessage("❓ Mention someone or reply to a message to apply the effect.", threadID, messageID);

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            const isTwoUser = ["kiss", "fuse", "buttslap", "slap"].includes(type);
            let url = isTwoUser 
                ? `${baseUrl}/api/dig?type=${type}&user=${senderID}&user2=${targetID}`
                : `${baseUrl}/api/dig?type=${type}&user=${targetID}`;

            const response = await axios.get(url, { responseType: "arraybuffer" });
            const isGif = ["trigger", "triggered"].includes(type);
            const ext = isGif ? "gif" : "png";
            const filePath = path.join(__dirname, `cache/dig_${Date.now()}.${ext}`);
            if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

            fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

            return api.sendMessage({
                body: `✅ Effect: ${type.toUpperCase()}`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                api.setMessageReaction("🪽", messageID, () => {}, true);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, messageID);

        } catch (err) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            
            if (err.response && err.response.data) {
                try {
                    const errorData = JSON.parse(err.response.data.toString());
                    return api.sendMessage(`${errorData.error}`, threadID, messageID);
                } catch (e) {
                    return api.sendMessage(`❌ Server returned an error.`, threadID, messageID);
                }
            }
            
            console.error(err);
            return api.sendMessage(`🥹 Error: contact MahMUD.`, threadID, messageID);
        }
    }
};
