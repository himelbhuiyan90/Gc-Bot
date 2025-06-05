const axios = require("axios");

module.exports.config = {
  name: "emojiReply",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Islamick Chat",
  description: "Auto reply to any emoji",
  commandCategory: "noprefix",
  usages: "[any emoji]",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.handleEvent = async ({ api, event }) => {
  const { body } = event;
  
  // ইমোজি ডিটেক্ট করার রেগুলার এক্সপ্রেশন
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  
  if (emojiRegex.test(body)) {
    const replies = [
      "😌", "🙂", "😚🥰", "🙃🤌", "☺️💝", "😎🔥", "😭💀", "😍💫", "😏🍷", "🥺👉👈",
      "🤯💥", "💃🕺", "😇🌸", "😤💪", "🫣👀", "🥶🧊", "😈👿", "🤡🎪", "🤑💰", "🤔💭",
      "😴💤", "🤧🤒", "🤓📚", "🤠🐎", "🤫🔐", "😵‍💫🌀", "😬😳", "😻😽", "👻🎃", "🫶💖",
      "🫂❤️", "🫨😱", "🧠💡", "🫥🫤", "👀➡️", "🤝✊", "🤞🍀", "🫡🇧🇩", "🍕🥤", "🍫☕",
      "🍉🍓", "🌈✨", "🌙🪐", "🌟🌌", "☁️🌧️", "🔥🧨", "💣💥", "🧸🎁", "🎈🎉", "📸📷",
      "💻🖥️", "📱📶", "🧃🥪", "🍟🍔", "🎮🕹️", "🎵🎧", "📖📝", "✈️🌍", "🛌🛏️", "🏞️🌄",
      "🏝️🌅", "🧘‍♂️🕊️", "🐶🐾", "🐱🐈", "🐼🐻", "🦄🐴", "🐸🌿", "🐧❄️", "🦋🌺", "🐝🌼",
      "🌻🌞", "🪴🌱", "🧿🔮", "💎👑", "💄👠", "🕶️🧥", "📦🚚", "🏡🏠", "🏫📚", "🛍️🛒",
      "🎁🎀", "💌📬", "📅🕓", "🧭🗺️", "⚽🏆", "🏀⛹️", "🎯🎳", "🏓🥇", "🥋🥊", "🏸⛳",
      "🛹🛼", "🚴🚵", "🚗🛣️", "🛶🗻", "⛺🔥", "🌋🗿", "🔋⚡", "🔑🚪", "🔒🔓", "🧲🛠️",
      "⚙️🔧", "💡🔦", "🧯🚒", "🚓🚨", "📡🛰️", "📺🎞️"
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    api.sendMessage({ body: randomReply }, event.threadID, event.messageID);
  }
};

module.exports.run = async ({ api, event, Threads, getText }) => {
  // অন/অফ সিস্টেম (যদি দরকার হয়)
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;
  if (typeof data["emojiReply"] === "undefined" || data["emojiReply"]) {
    data["emojiReply"] = false;
  } else {
    data["emojiReply"] = true;
  }
  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);
  api.sendMessage(`Emoji reply is now ${data["emojiReply"] ? "OFF" : "ON"}`, threadID, messageID);
};
