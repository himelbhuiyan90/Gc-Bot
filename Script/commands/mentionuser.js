module.exports = {
  config: {
    name: "mentioned",
    aliases: ["mtn" , "mention" , " @"], // এখন 'mention' বা 'mtn' দুটোতেই কাজ করবে
    version: "1.0",
    author: "Chitron Bhattacharjee",
    description: "Mention users by name keyword",
    commandCategory: "utility",
    usages: "[prefix]mention [name]",
    cooldowns: 5,
    hasPermission: 0,
    usePrefix: true
  },

  onStart: async function({ api, event, args }) {
    const keyword = args.join(" ").toLowerCase();
    
    if (!keyword) {
      return api.sendMessage("⚠️ ব্যবহার: mention [নাম]", event.threadID);
    }

    try {
      // গ্রুপের সকল সদস্য তথ্য পাওয়া
      const threadInfo = await api.getThreadInfo(event.threadID);
      const participants = threadInfo.participants;
      
      // নাম ম্যাচ করা ইউজারদের খুঁজে বের করা
      const matchedUsers = participants.filter(participant => {
        const userName = participant.name || participant.firstName + " " + (participant.lastName || "");
        return userName.toLowerCase().includes(keyword);
      });

      if (matchedUsers.length === 0) {
        return api.sendMessage(`এই নামে (${keyword}) গ্রুপে কাউকে খুঁজে পাওয়া যায়নি।`, event.threadID);
      }

      // মেনশন স্ট্রিং তৈরি
      const mentions = matchedUsers.map(user => {
        return {
          tag: `@${user.name || user.firstName}`,
          id: user.id
        };
      });

      const mentionText = mentions.map(m => m.tag).join(", ");
      const mentionIds = mentions.map(m => m.id);

      // মেনশন সহ মেসেজ পাঠানো
      api.sendMessage({
        body: mentionText,
        mentions: mentionIds.map(id => ({
          tag: mentionText.split(", ")[mentionIds.indexOf(id)],
          id: id
        }))
      }, event.threadID);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("⚠️ একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন।", event.threadID);
    }
  }
};
