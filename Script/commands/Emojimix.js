const fs = require("fs");
const emojiUnicode = require("emoji-unicode");
const { createReadStream, unlinkSync, writeFileSync } = require('fs');
const axios = require('axios');

module.exports.config = {
    name: "emojimix",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Horizon",
    description: "Combine two emojis into one",
    commandCategory: "Fun",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "emoji-unicode": ""
    }
};

module.exports.run = async function ({ api, event, args }) {
    try {
        // Validate input
        if (args.length !== 2 || !args[0] || !args[1]) {
            return api.sendMessage("Usage: emojimix [emoji1] [emoji2]\nExample: emojimix 😢 🤣", event.threadID, event.messageID);
        }

        // Convert emojis to unicode format
        const emoji1 = "u" + emojiUnicode(args[0]);
        const emoji2 = "u" + emojiUnicode(args[1]);
        
        // Try different combination orders
        const urls = [
            `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/${emoji1}/${emoji1}_${emoji2}.png`,
            `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/${emoji2}/${emoji2}_${emoji1}.png`
        ];

        let success = false;
        let error;
        
        for (const url of urls) {
            try {
                const { data } = await axios.get(url, { 
                    method: 'GET',
                    responseType: 'arraybuffer'
                });
                
                const filePath = __dirname + "/cache/emojimix.png";
                writeFileSync(filePath, Buffer.from(data, 'utf-8'));
                
                await api.sendMessage({
                    body: "Here's your mixed emoji!",
                    attachment: createReadStream(filePath)
                }, event.threadID);
                
                // Clean up
                unlinkSync(filePath);
                success = true;
                break;
            } catch (err) {
                error = err;
                continue;
            }
        }

        if (!success) {
            throw new Error("Emoji combination not supported");
        }

    } catch (error) {
        console.error(error);
        return api.sendMessage("Failed to mix these emojis. Please try different emoji combinations!", event.threadID, event.messageID);
    }
};
