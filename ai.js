const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "ai",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ api, event, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("Please provide a question", event.threadID, event.messageID);
    }

    const apiUrl = `${await mahmud()}/api/ai`;
    try {
      const response = await axios.post(
        apiUrl,
        { question: query },
        { headers: { "Content-Type": "application/json" } }
      );

      const replyText = response.data.response || "Sorry, I couldn't generate a response.";

      api.sendMessage(replyText, event.threadID, (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            messageID: info.messageID
          });
        }
      }, event.messageID);

    } catch (error) {
      api.sendMessage("🥹 error, contact MahMUD", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    if (Reply.author !== event.senderID) return;
    const query = args.join(" ");
    if (!query) return;
    const apiUrl = `${await mahmud()}/api/ai`;

    try {
      const response = await axios.post(
        apiUrl,
        { question: query },
        { headers: { "Content-Type": "application/json" } }
      );

    const replyText = response.data.response || "Sorry, I couldn't generate a response.";
    api.sendMessage(replyText, event.threadID, (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            messageID: info.messageID
          });
        }
      }, event.messageID);

    } catch (error) {
      api.sendMessage("🥹 error janu, contact MahMUD", event.threadID, event.messageID);
    }
  }
};
