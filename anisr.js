const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "anisr",
    aliases: ["animesr", "anisearch"],
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "anime",
    guide: { en: "{pn} [anime name]" },
    coolDowns: 7
  },

  onStart: async function (p) { const { api, event, args, message } = p;
      const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
      if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
                               
     if (!args.length) return message.reply("• 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐞𝐚𝐫𝐜𝐡 𝐪𝐮𝐞𝐫𝐲!");
     const kw = args.join(" ");
     const videoPath = path.join(__dirname, "cache", `anisr_${Date.now()}.mp4`);
     fs.ensureDirSync(path.join(__dirname, "cache"));

     try { api.setMessageReaction("⏳", event.messageID, () => {}, true); } catch (e) {}

     try {
      const base = await baseApiUrl();
      const apiUrl = `${base}/api/anisr?search=${encodeURIComponent(kw)}`;
      const res = await axios({ method: "get", url: apiUrl, responseType: "stream",timeout: 60000 
    });

      const writer = fs.createWriteStream(videoPath);
      res.data.pipe(writer);

      await new Promise((resolve, reject) => { writer.on("finish", resolve);  writer.on("error", reject);});
      if (fs.statSync(videoPath).size < 100) { throw new Error("File empty");
     }

      await message.reply({ body: `• 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 <😘\n• 𝐒𝐞𝐚𝐫𝐜𝐡: ${kw}`,
        attachment: fs.createReadStream(videoPath)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("error, contact MahMUD");
    } finally {
      setTimeout(() => { 
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); 
      }, 5000);
    }
  }
};
