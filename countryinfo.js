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
    category: "info",
    guide: { en: "{pn} [country name]" }
  },

  onStart: async function ({ api, event, args }) {
     const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
     if (module.exports.config.author !== obfuscatedAuthor) {
     return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
     const { threadID, messageID } = event;
     const countryName = args.join(" ");
     if (!countryName) return api.sendMessage("❌ Please provide a country name!", threadID, messageID);

     try {
      const apiUrl = await baseApiUrl();
      const res = await axios.get(`${apiUrl}/api/country?name=${encodeURIComponent(countryName)}`);
      const d = res.data.data;
      const msg = `>🎀 𝐁𝐚𝐛𝐲, 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 ${d.name} 𝐂𝐨𝐮𝐧𝐭𝐫𝐲 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧\n\n` +
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
      }, threadID, messageID);

    } catch (e) {
      console.error(e);
      return api.sendMessage(`Could not find info for "${countryName}". Please contact MahMUD.`, threadID, messageID);
    }
  }
};
