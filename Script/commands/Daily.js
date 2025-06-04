const coinsup = 500000;
const fs = require("fs");

module.exports.config = {
    name: "daily",
    version: "0.0.1",
    hasPermssion: 0,
    credits: "Chitron Bhattacharjee",
    description: "প্রতিদিন টাকা পান",
    commandCategory: "economy",
    cooldowns: 3,
    envConfig: {
        cooldownTime: 300000 // 5 মিনিট (আসল কোড অনুযায়ী)
    }
};

module.exports.run = async ({ event, api, Currencies }) => {
    const { threadID, messageID, senderID } = event;
    const cooldown = global.configModule[this.config.name].cooldownTime;
    let data = (await Currencies.getData(senderID)).data || {};

    if (typeof data !== "undefined" && cooldown - (Date.now() - (data.workTime || 0)) > 0) {
        const time = cooldown - (Date.now() - (data.workTime || 0));
        const hours = Math.floor((time/(1000*60*60)) % 24);
        const minutes = Math.floor((time % (1000*60*60)) / (1000*60));
        const seconds = Math.floor((time % (1000*60)) / 1000);

        return api.sendMessage(
            `[⚜️] আপনি ইতিমধ্যে টাকা নিয়েছেন!\n`
            + `[⚜️] আবার চেষ্টা করুন: ${hours} ঘন্টা ${minutes} মিনিট ${seconds} সেকেন্ড পর`,
            threadID,
            messageID
        );
    }
    else {
        await Currencies.increaseMoney(senderID, parseInt(coinsup));
        data.workTime = Date.now();
        await Currencies.setData(senderID, { data });

        return api.sendMessage(
            `[⚜️] আপনি পেয়েছেন + ${coinsup}$💸.\n`
            + `[⚜️] আপনার দিনটি শুভ হোক!`,
            threadID,
            messageID
        );
    }
};
