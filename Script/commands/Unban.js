module.exports.config = {
  name: "unban",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "ManhG",
  description: "Unban groups and users in one click",
  commandCategory: "Admin bot system",
  usages: "unban",
  cooldowns: 2,
  denpendencies: {}
};

module.exports.run = async ({ event, api, Users, Threads, args }) => {
  var { threadID, messageID, senderID } = event;
  if (event.senderID != 100033478361032) return api.sendMessage(`[❗] Donate → Mbbank/Momo: 0396049649. JRT thanks you ❤️`, event.threadID, event.messageID)
  const { commands } = global.client;
  const command = commands.get(("unban").toLowerCase());
  const credit = command.config.credits;
  var mangG = "ManhG";
  if(credit != mangG) return api.sendMessage(`Wrong credits!`, event.threadID, event.messageID);
  
  const threadSetting = global.data.threadData.get(parseInt(event.threadID)) || {};
  const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

  switch (args[0]) {
    case 'admin':
    case 'ad':
      {
        const listAdmin = global.config.ADMINBOT;
        for (var idad of listAdmin) {
          const data = (await Users.getData(idad)).data || {};
          data.banned = 0;
          data.reason = null;
          data.dateAdded = null;
          await Users.setData(idad, { data });
          global.data.userBanned.delete(idad, 1);
        }
        api.sendMessage("[⚜️] Successfully unbanned all Bot Admins", threadID, messageID)
        break;
      }

    case 'ndh':
      {
        const listNDH = global.config.NDH;
        for (var idNDH of listNDH) {
          const data = (await Users.getData(idNDH)).data || {};
          data.banned = 0;
          data.reason = null;
          data.dateAdded = null;
          await Users.setData(idNDH, { data });
          global.data.userBanned.delete(idNDH, 1);
        }
        api.sendMessage("[⚜️] Successfully unbanned all Supporters", threadID, messageID)
        break;
      }


    case 'allbox':
    case 'allthread':
      {
        const threadBanned = global.data.threadBanned.keys();
        for (const singleThread of threadBanned) {
          const data = (await Threads.getData(singleThread)).data || {};
          data.banned = 0;
          data.reason = null;
          data.dateAdded = null;
          await Threads.setData(singleThread, { data });
          global.data.userBanned.delete(singleThread, 1);
        }
        api.sendMessage("[⚜️] Successfully unbanned all groups on server", threadID, messageID)
        break;
      }

    case 'box':
    case 'thread':
      {
        var idbox = event.threadID;
        var data = (await Threads.getData(idbox)).data || {};
        data.banned = 0;
        data.reason = null;
        data.dateAdded = null;
        await Threads.setData(idbox, { data });
        global.data.userBanned.delete(idbox, 1);
        api.sendMessage("[⚜️] Successfully unbanned this group", threadID, messageID)
        break;
      }

    case 'allmember':
    case 'alluser':
      {
        const userBanned = global.data.userBanned.keys();
        for (const singleUser of userBanned) {
          const data = (await Users.getData(singleUser)).data || {};
          data.banned = 0;
          data.reason = null;
          data.dateAdded = null;
          await Users.setData(singleUser, { data });
          global.data.userBanned.delete(singleUser, 1);
        }
        api.sendMessage("[⚜️] Successfully unbanned all users on server", threadID, messageID)
        break;
      }

    case 'qtvall':
    case 'Qtvall':
    case 'allqtv':
      {
        var data = [];
        data = await Threads.getAll();

        for (let i = 0; i < data.length; i++) {
          const idAdmins = (data[i].threadInfo).adminIDs;
          for (let i = 0; i < idAdmins.length; i++) {
            const idad = idAdmins[i].id;

            const data = (await Users.getData(idad)).data || {};
            data.banned = 0;
            data.reason = null;
            data.dateAdded = null;
            await Users.setData(idad, { data });
            global.data.userBanned.delete(idad, 1);
          }
        }
        api.sendMessage('[⚜️] Successfully unbanned all Group Admins on server', threadID, messageID);
        break;
      }

    case 'qtv':
    case 'Qtv':
      {
        var threadInfo = (await Threads.getData(event.threadID)).threadInfo;
        var listQTV = threadInfo.adminIDs;
        for (let i = 0; i < listQTV.length; i++) {
          const idQtv = listQTV[i].id;
          const data = (await Users.getData(idQtv)).data || {};
          data.banned = 0;
          data.reason = null;
          data.dateAdded = null;
          await Users.setData(idQtv, { data });
          global.data.userBanned.delete(idQtv, 1);
        }
        api.sendMessage("[⚜️] Successfully unbanned all Admins in this group", threadID, messageID)
        break;
      }

    case 'member':
    case 'mb':
    case 'user':
      {
        if (!args[1]) {
          var listMember = event.participantIDs;
          for (let i = 0; i < listMember.length; i++) {
            const idMember = listMember[i];
            const data = (await Users.getData(idMember)).data || {};
            data.banned = 0;
            data.reason = null;
            data.dateAdded = null;
            await Users.setData(idMember, { data });
            global.data.userBanned.delete(idMember, 1);
          }
          return api.sendMessage("[⚜️] Successfully unbanned all members in this group", threadID, messageID);
        }
        if (args.join().indexOf('@') !== -1) {
          var mentions = Object.keys(event.mentions)
          var userID = (await Users.getData(mentions)).userID;
          var nameUser = (await Users.getData(mentions)).name;
          const data = (await Users.getData(userID)).data || {};
          data.banned = 0;
          data.reason = null;
          data.dateAdded = null;
          await Users.setData(userID, { data });
          global.data.userBanned.delete(userID, 1);
          return api.sendMessage(`[⚜️] User ${nameUser} has been unbanned`, threadID, messageID)
        }
        break;
      }

    default:
      api.sendMessage(`[⚜️] 𝗨𝗡𝗕𝗔𝗡 𝗖𝗢𝗡𝗙𝗜𝗚 [⚜️]\n◆━━━━━━━━━━━━━━━◆\n\n[👉] - 𝘂𝘯𝘣𝘢𝘯 𝘢𝘥𝘮𝘪𝘯 => 𝘜𝘯𝘣𝘢𝘯 𝘢𝘭𝘭 𝘉𝘰𝘵 𝘈𝘥𝘮𝘪𝘯𝘴\n[👉] - 𝘂𝘯𝘣𝘢𝘯 𝘯𝘥𝘩 => 𝘜𝘯𝘣𝘢𝘯 𝘢𝘭𝘭 𝘚𝘶𝘱𝘱𝘰𝘳𝘵𝘦𝘳𝘴\n[👉] - 𝘂𝘯𝘣𝘢𝘯 𝘢𝘭𝘭𝘣𝘰𝘹 => 𝘜𝘯𝘣𝘢𝘯 𝘢𝘭𝘭 𝘨𝘳𝘰𝘶𝘱𝘴 𝘰𝘯 𝘴𝘦𝘳𝘷𝘦𝘳\n[👉] - 𝘂𝘯𝘣𝘢𝘯 𝘣𝘰𝘹 => 𝘜𝘯𝘣𝘢𝘯 𝘤𝘩𝘪𝘴 𝘨𝘳𝘰𝘶𝘱 (1 𝘨𝘳𝘰𝘶𝘱)\n[👉] - 𝘂𝘯𝘣𝘢𝘯 𝘢𝘭𝘭𝘶𝘴𝘦𝘳 => 𝘜𝘯𝘣𝘢𝘯 𝘢𝘭𝘭 𝘶𝘴𝘦𝘳𝘴 𝘰𝘯 𝘴𝘦𝘳𝘷𝘦𝘳\n[👉] - 𝘂𝘯𝘣𝘢𝘯 𝘢𝘭𝘭𝘲𝘵𝘷 => 𝘜𝘯𝘣𝘢𝘯 𝘢𝘭𝘭 𝘎𝘳𝘰𝘶𝘱 𝘈𝘥𝘮𝘪𝘯𝘴 𝘰𝘯 𝘴𝘦𝘳𝘷𝘦𝘳\n[👉] - 𝘂𝘯𝘣𝘢𝘯 𝘲𝘵𝘷 => 𝘜𝘯𝘣𝘢𝘯 𝘢𝘭𝘭 𝘈𝘥𝘮𝘪𝘯𝘴 (1 𝘨𝘳𝘰𝘶𝘱)\n[👉] - 𝘂𝘯𝘣𝘢𝘯 𝘮𝘦𝘮𝘣𝘦𝘳 => 𝘜𝘯𝘣𝘢𝘯 𝘢𝘭𝘭 𝘮𝘦𝘮𝘣𝘦𝘳𝘴 𝘪𝘯 𝘵𝘩𝘪𝘴 𝘨𝘳𝘰𝘶𝘱 (1 𝘨𝘳𝘰𝘶𝘱)\n[👉] - 𝘂𝘯𝘣𝘢𝘯 𝘮𝘦𝘮𝘣𝘦𝘳 𝘵𝘢𝘨 => 𝘜𝘯𝘣𝘢𝘯 𝘵𝘢𝘨𝘨𝘦𝘥 𝘶𝘴𝘦𝘳`, threadID, messageID);
      break;
  }
}
