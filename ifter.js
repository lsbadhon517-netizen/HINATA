const axios = require("axios");

const baseApiUrl = async () => {
  const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return res.data.mahmud;
};

module.exports = {
  config: {
    name: "ifter",
    aliases: ["ramadan", "iftar", "sehri", "ramadan2026"],
    version: 1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "Islamic",
    guide: {
      en: "{pn} [city] [style]\nExample: {pn} dhaka 2"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, senderID } = event;
    
    let city = args[0] || "Dhaka";
      let style = "1"; if (args.includes("--style")) {
      const styleIndex = args.indexOf("--style"); style = args[styleIndex + 1] || "1";
      city = args.slice(0, styleIndex).join(" ") || "Dhaka";  } else if (args[1]) {
      style = args[1];
    }
    
      const cachePath = path.join(__dirname, "cache", `ramadan_${senderID}_${Date.now()}.png`);try {
      api.setMessageReaction("⌛", messageID, () => {}, true);
      const baseUrl = await baseApiUrl();
      const res = await axios.get(`${baseUrl}/api/ramadan`, { params: { city, style }  });
      const data = res.data; if (typeof data === "string") {
      api.setMessageReaction("🥺", messageID, () => {}, true);
      return message.reply(data);
     }

      const msg = 
   `🌙 ${data.today.ramadan} RAMADAN KAREEM 🌙
     • City: ${data.city} 
     • Hijri: ${data.today.hijri}
    

    ✨ Today's Schedule:
     • Sehri: ${data.today.sehri}
     • Iftar: ${data.today.iftar}

    ⏳ Remaining Time:
     • To Sehri: ${data.sahriRemain}
     • To Iftar: ${data.iftarRemain}

   📆 Tomorrow (${data.tomorrow.date}):
     • Sehri: ${data.tomorrow.sehri}
     • Iftar: ${data.tomorrow.iftar}
 
   ⏰ Current Time: ${data.currentTime}
     • Image Style: ${style}`;

      await fs.ensureDir(path.join(__dirname, "cache"));
      const imageBuffer = Buffer.from(data.image, "base64");
      await fs.writeFile(cachePath, imageBuffer);
      await api.sendMessage({ body: msg, attachment: fs.createReadStream(cachePath) }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); }, messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      api.setMessageReaction("🥺", messageID, () => {}, true);
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      const errorDetail = err.response?.data?.error || err.response?.data || err.message;
      return message.reply(`${errorDetail}`);
    }
  }
};
