const axios = require("axios");

const baseUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
  return base.data.api;
};

module.exports = {
  config: {
    name: "gpt4",
    aliases: [],
    version: "1.0.0",
    role: 0,
    author: "dipto",
    description: "GPT-4 AI with multiple conversation",
    usePrefix: true,
    guide: "[message]",
    category: "ai",
    commandCategory: "ai",
    cooldowns: 5,
    countDown: 5,
    hasPermssion: 0
  },

  onReply: async function ({ api, event, Reply }) {
    const { author } = Reply;
    if (author != event.senderID) return;
    
    if (event.type == "message_reply") {
      const reply = event.body.toLowerCase();
      if (isNaN(reply)) {
        try {
          const response = await axios.get(`${await baseUrl()}/gpt4?text=${encodeURIComponent(reply)}&senderID=${author}`);
          const ok = response.data.data;
          
          await api.sendMessage(ok, event.threadID, (err, info) => {
            global.nodemodule.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: 'reply',
              messageID: info.messageID,
              author: event.senderID,
              link: ok
            });
          }, event.messageID);
        } catch (err) {
          console.error(err.message);
          api.sendMessage(`Error: ${err.message}`, event.threadID);
        }
      }
    }
  },

  onStart: async function ({ api, args, event }) {
    try {
      const author = event.senderID;
      const dipto = args.join(" ").toLowerCase();
      
      if (!args[0]) {
        return api.sendMessage(
          "Please provide a question to answer\n\nExample:\n!gpt4 hey",
          event.threadID,
          event.messageID
        );
      }

      if (dipto) {
        const response = await axios.get(`${await baseUrl()}/gpt4?text=${encodeURIComponent(dipto)}&senderID=${author}`);
        const mg = response.data.data;
        
        await api.sendMessage({ body: mg }, event.threadID, (error, info) => {
          global.nodemodule.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: 'reply',
            messageID: info.messageID,
            author,
            link: mg
          });
        }, event.messageID);
      }
    } catch (error) {
      console.error(`Failed to get an answer: ${error.message}`);
      api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  },

  run: async function ({ api, args, event }) {
    // For Mirai compatibility
    return this.onStart({ api, args, event });
  }
};
