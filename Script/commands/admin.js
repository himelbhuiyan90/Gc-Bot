const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
    name: "admin",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ULLASH", //don't change my credit 
    description: "Show Owner Info",
    commandCategory: "info",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    var time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

    var callback = () => api.sendMessage({
        body: `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃				🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🌟      
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 𝐍𝐚𝐦𝐞	: 𝐂𝐡𝐢𝐭𝐫𝐨𝐧 𝐁𝐡𝐚𝐭𝐭𝐚𝐜𝐡𝐚𝐫𝐣𝐞𝐞
┃ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫	: 𝐌𝐚𝐥𝐞
┃ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧	: 𝐂𝐨𝐦𝐩𝐥𝐢𝐜𝐚𝐭𝐞𝐝
┃ 🎂 𝐀𝐠𝐞	: 𝟐𝟎
┃ ⚠️ 𝐀𝐛𝐨𝐮𝐭	: 𝐒𝐞𝐚𝐫𝐜𝐡 𝐦𝐲 𝐧𝐚𝐦𝐞 𝐨𝐧 𝐆𝐨𝐨𝐠𝐥𝐞
┃ 🏫 𝐄𝐝𝐮	: 𝐈𝐧𝐭𝐞𝐫 𝟏𝐬𝐭 𝐘𝐞𝐚𝐫
┃ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬	: 𝐌𝐲𝐦𝐞𝐧𝐬𝐢𝐧𝐠𝐡, 𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🎭 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩	: https://wa.me/+8801316655254
┃ 📢 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦	: https://t.me/brandxhitron
┃ 🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤	: https://www.facebook.com/adirexcb
┃ 🌎 𝐖𝐞𝐛𝐬𝐢𝐭𝐞		: http://shipu.c0m.in/
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕒 𝐔𝐩𝐝𝐚𝐭𝐞𝐝 𝐓𝐢𝐦𝐞:  ${time}
┗━━━━━━━━━━━━━━━━━━━━━┛
        `,
        attachment: fs.createReadStream(__dirname + "/cache/1.png")
    }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"));
  
    return request(encodeURI(`https://graph.facebook.com/100000478146113/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`))
        .pipe(fs.createWriteStream(__dirname + '/cache/1.png'))
        .on('close', () => callback());
};
