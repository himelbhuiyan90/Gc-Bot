module.exports.config = {
    name: "settings",
    version: "1.0.3",
    hasPermssion: 3,
    credits: "Thiệu Trung Kiên",
    description: "Command Prompt",
    commandCategory: "Admin bot system",
    cooldowns: 5,
    dependencies: {
        axios: ""
    }
};

module.exports.languages = {
    vi: {
        returnResult: "Đây là kết quả phù hợp: \n",
        returnNull: "Không tìm thấy kết quả dựa vào tìm kiếm của bạn!"
    },
    en: {
        returnResult: "This is your result: \n",
        returnNull: "There is no result with your input!"
    }
};

module.exports.handleEvent = async function({
    api: e,
    event: n,
    args: a,
    Users: s,
    Threads: t
}) {
    const r = require("moment-timezone");
    var o = r.tz("Asia/Dhaka").format("HH:mm:ss"),
        h = global.config.ADMINBOT,
        i = r.tz("Asia/Dhaka").format("ss");
    if (o == `12:00:${i}` && i < 6)
        for (let n of h) setTimeout((() => e.sendMessage(`〉Current time: ${o}\n[❗] Bot will restart now!`, n, (() => process.exit(1)))), 1e3)
};

module.exports.run = async function({
    api: e,
    event: n,
    getText: a,
    args: s
}) {
    if (!s[0]) return e.sendMessage("🛠 | Bot Configuration Panel | 🛠\n=== Settings Management ===\n[1] Prefix\n[2] Bot name\n[3] Admin list\n[4] Language\n[5] Auto-restart\n=== Activity Management ===\n[6] Check updates\n[7] Banned users list\n[8] Banned groups list\n[9] Send announcement to all groups\n[10] Find UID by username\n[11] Find group ID by name\n[12] Change group emoji\n[13] Change group name\n[14] View group info\n-> To select, reply to this message with a number <-", n.threadID, ((e, a) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: a.messageID,
            author: n.senderID,
            type: "choose"
        })
    }), n.messageID)
};

module.exports.handleReply = async function({
    api: e,
    event: n,
    client: a,
    handleReply: s,
    Currencies: t,
    Users: r,
    Threads: o
}) {
    const {
        userName: h
    } = global.data, {
        writeFileSync: i,
        readFileSync: g
    } = global.nodemodule["fs-extra"], d = [];
    switch (l = 1, s.type) {
        case "choose":
            switch (n.body) {
                case "1":
                    return e.sendMessage("Bot prefix: " + global.config.PREFIX, n.threadID, n.messageID);
                case "2":
                    return e.sendMessage("Bot name: " + global.config.BOTNAME, n.threadID, n.messageID);
                case "3": {
                    const a = ADMINBOT || config.ADMINBOT || [];
                    var m = [];
                    for (const e of a)
                        if (parseInt(e)) {
                            const n = h.get(e) || await r.getNameUser(e);
                            m.push(`${n} - ${e}`)
                        } return e.sendMessage(`[⚜️] Admin List [⚜️] All bot administrators: \n\n${m.join("\n")}`, n.threadID, n.messageID)
                }
                case "4":
                    if ("vi" == global.config.language) return e.sendMessage("Language: Vietnamese", n.threadID, n.messageID);
                    "en" == global.config.language && e.sendMessage("Language: English", n.threadID, n.messageID);
                    break;
                case "5":
                    return e.sendMessage("[⚜️] Bot will auto-restart at 12:00 PM", n.threadID, n.messageID);
                case "6":
                    return e.sendMessage("[⚜️] Current bot version: " + global.config.version, n.threadID, n.messageID);
                case "7": {
                    const a = global.data.userBanned.keys();
                    for (const e of a) {
                        const n = global.data.userName.get(e) || await r.getNameUser(e);
                        d.push(`${l++}. ${n} \n[⚜️] UID: ${e}`)
                    }
                    return e.sendMessage(`[⚜️] Currently ${d.length} banned users\n\n${d.join("\n")}\n\n`, n.threadID)
                }
                case "8": {
                    const a = global.data.threadBanned.keys();
                    for (const s of a) return nameT = await global.data.threadInfo.get(s).threadName || "Name not found", d.push(`${l++}. ${nameT}\n[⚜️] TID: ${s}`), e.sendMessage(`[⚜️] Currently ${d.length} banned groups\n\n${d.join("\n")}\n\n`, n.threadID)
                }
                break;
            case "9":
                return e.sendMessage("[⚜️] Reply with the message you want to send to all groups", n.threadID, ((e, a) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: a.messageID,
                        author: n.senderID,
                        type: "sendnoti"
                    })
                }), n.messageID);
            case "10":
                return e.sendMessage("[⚜️] Reply with the username to find UID", n.threadID, ((e, a) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: a.messageID,
                        author: n.senderID,
                        type: "getuid"
                    })
                }), n.messageID);
            case "11":
                return e.sendMessage("[⚜️] Reply with the group name to find ID", n.threadID, ((e, a) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: a.messageID,
                        author: n.senderID,
                        type: "namebox"
                    })
                }), n.messageID);
            case "12":
                return e.sendMessage("[⚜️] Reply with the emoji to change", n.threadID, ((e, a) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: a.messageID,
                        author: n.senderID,
                        type: "emojibox"
                    })
                }), n.messageID);
            case "13":
                return e.sendMessage("[⚜️] Reply with the new group name", n.threadID, ((e, a) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: a.messageID,
                        author: n.senderID,
                        type: "namebox"
                    })
                }), n.messageID);
            case "14": {
                require("request");
                let a = await e.getThreadInfo(n.threadID);
                a.participantIDs.length;
                let s = a.participantIDs.length;
                var c = [],
                    u = [],
                    I = [];
                for (let e in a.userInfo) {
                    var D = a.userInfo[e].gender,
                        b = a.userInfo[e].name;
                    "MALE" == D ? c.push(e + D) : "FEMALE" == D ? u.push(D) : I.push(b)
                }
                var p = c.length,
                    y = u.length;
                let t = a.adminIDs.length,
                    r = a.messageCount,
                    o = (a.nicknames, a.emoji),
                    h = a.threadName,
                    i = a.threadID,
                    g = a.approvalMode;
                var f = 0 == g ? "off" : 1 == g ? "on" : "Unknown";
                e.sendMessage(`✨Name: ${h}\n🤖 Group ID: ${i}\n👀 Approval: ${f}\n🧠 Emoji: ${o}\n👉 Info: ${s} members\n👦Male: ${p} members\n👩‍🦰Female: ${y} members\nWith ${t} admins\n🕵️‍♀️ Total messages: ${r}\n`, n.threadID)
            }
            }
            break;
        case "sendnoti": {
            var $ = global.data.allThreadID || [];
            let a = await r.getNameUser(n.senderID);
            var M = 1,
                T = [];
            for (const s of $) isNaN(parseInt(s)) || s == n.threadID || (e.sendMessage(`[⚜️] Announcement from admin ${a} \n\n` + n.body, s, ((e, n) => {
                e && T.push(s)
            })), M++, await new Promise((e => setTimeout(e, 500)));
            return e.sendMessage(`[⚜️] Successfully sent to: ${M} groups\n\n[⚜️] Failed: ${T.length} groups`, n.threadID, n.messageID)
        }
        case "getuid":
            e.getUserID(`${n.body}`, ((a, s) => {
                for (var t in s) m += `Name: ${s[t].name}\nUID: ${s[t].userID}\n\n`;
                return e.sendMessage(m, n.threadID)
            }));
            break;
        case "gettidbox":
            try {
                const a = n.body || "",
                    s = (await o.getAll(["threadID", "threadInfo"])).filter((e => !!e.threadInfo));
                var x = [],
                    v = "",
                    N = 0;
                s.forEach((e => {
                    (e.threadInfo.threadName || "").toLowerCase().includes(a.toLowerCase()) && x.push({
                        name: e.threadInfo.threadName,
                        id: e.threadID
                    })
                })), x.forEach((e => v += `\n${N+=1}. ${e.name} - ${e.id}`)), x.length > 0 ? e.sendMessage(`[⚜️] Search results: ${v}`, n.threadID) : e.sendMessage("[⚜️] Not found", n.threadID, n.messageID)
            } catch (a) {
                return e.sendMessage(a, n.threadID)
            }
            break;
        case "namebox":
            try {
                return e.setTitle(`${n.body}`, n.threadID, n.messageID), e.sendMessage(`[⚜️] Changed group name to ${n.body}`, n.threadID)
            } catch (a) {
                return e.sendMessage("An error occurred", n.threadID)
            }
            break;
        case "emojibox":
            try {
                e.changeThreadEmoji(n.body, n.threadID, (() => e.sendMessage(`[⚜️] Successfully changed emoji to: ${n.body}`, n.threadID, n.messageID)))
            } catch (a) {
                e.sendMessage("[⚜️] An error occurred", n.threadID)
            }
    }
};
