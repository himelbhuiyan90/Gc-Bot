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
┃  🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🌟      
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 𝐍𝐚𝐦𝐞	: Himel Bhuiyan
┃ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫	: Male
┃ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧	: single
┃ 🎂 𝐀𝐠𝐞	: 24
┃ ⚠️ 𝐀𝐛𝐨𝐮𝐭	: search on my name Google 
┃ 🏫 𝐄𝐝𝐮	: Honors
┃ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬	: Dhaka Bangladesh 
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🎭 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩	: me/+8801972224417
┃ 📢 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦	: me/+8801972224417
┃ 🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤	: https://www.facebook.com/ntojkuangsyamrmyi.721185
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕒 𝐔𝐩𝐝𝐚𝐭𝐞𝐝 𝐓𝐢𝐦𝐞:  ${time}
┗━━━━━━━━━━━━━━━━━━━━━┛
        `,
        attachment: fs.createReadStream(__dirname + "/cache/1.png")
    }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"));
  
    return request(encodeURI(`https://graph.facebook.com/61576900541112/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`))
        .pipe(fs.createWriteStream(__dirname + '/cache/1.png'))
        .on('close', () => callback());
};
