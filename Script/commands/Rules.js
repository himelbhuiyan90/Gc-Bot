module.exports.config = {
    name: "rule",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "CatalizCS",
    description: "Custom group rules management | গ্রুপের জন্য কাস্টম নিয়ম ব্যবস্থাপনা",
    commandCategory: "Group | গ্রুপ",
    usages: "[add/remove/all] [content/ID]",
    cooldowns: 0,
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
}

module.exports.onLoad = () => {
    const { existsSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const pathData = join(__dirname, "cache", "rules.json");
    if (!existsSync(pathData)) return writeFileSync(pathData, "[]", "utf-8"); 
}

module.exports.run = ({ event, api, args, permssion }) => {
    const { threadID, messageID } = event;
    const { readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const pathData = join(__dirname, "cache", "rules.json");
    const content = (args.slice(1, args.length)).join(" ");
    var dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
    var thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, listRule: [] };

    switch (args[0]) {
        case "add": {
            if (permssion == 0) return api.sendMessage("🔹 You don't have permission to add rules!\n🔹 আপনি নিয়ম যোগ করার অনুমতি পাননি!", threadID, messageID);
            if (content.length == 0) return api.sendMessage("🔹 Input cannot be empty!\n🔹 ইনপুট খালি রাখা যাবে না!", threadID, messageID);
            if (content.indexOf("\n") != -1) {
                const contentSplit = content.split("\n");
                for (const item of contentSplit) thisThread.listRule.push(item);
            }
            else {
                thisThread.listRule.push(content);
            }
            writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
            api.sendMessage('🔹 Successfully added new rule!\n🔹 সফলভাবে নতুন নিয়ম যোগ করা হয়েছে!', threadID, messageID);
            break;
        }
        case "list":
        case "all": {
            var msg = "=== Group Rules | গ্রুপ নিয়ম ===\n\n", index = 0;
            for (const item of thisThread.listRule) msg += `${index+=1}/ ${item}\n`;
            if (msg.length == 0) return api.sendMessage("🔹 No rules found for this group!\n🔹 এই গ্রুপের জন্য কোন নিয়ম পাওয়া যায়নি!", threadID, messageID);
            api.sendMessage(msg, threadID, messageID);
            break;
        }
        case "rm":
        case "remove":
        case "delete": {
            if (!isNaN(content) && content > 0) {
                if (permssion == 0) return api.sendMessage("🔹 You don't have permission to remove rules!\n🔹 আপনি নিয়ম মুছার অনুমতি পাননি!", threadID, messageID);
                if (thisThread.listRule.length == 0) return api.sendMessage("🔹 No rules to delete!\n🔹 মুছার জন্য কোন নিয়ম নেই!", threadID, messageID);
                thisThread.listRule.splice(content - 1, 1);
                api.sendMessage(`🔹 Successfully deleted rule #${content}\n🔹 সফলভাবে #${content} নিয়ম মুছে ফেলা হয়েছে`, threadID, messageID);
                break;
            }
            else if (content == "all") {
                if (permssion == 0) return api.sendMessage("🔹 You don't have permission to clear all rules!\n🔹 আপনি সব নিয়ম মুছার অনুমতি পাননি!", threadID, messageID);
                if (thisThread.listRule.length == 0) return api.sendMessage("🔹 No rules to clear!\n🔹 মুছার জন্য কোন নিয়ম নেই!", threadID, messageID);
                thisThread.listRule = [];
                api.sendMessage(`🔹 All rules cleared successfully!\n🔹 সব নিয়ম সফলভাবে মুছে ফেলা হয়েছে!`, threadID, messageID);
                break;
            }
        }
        default: {
            if (thisThread.listRule.length != 0) {
                var msg = "=== Group Rules | গ্রুপ নিয়ম ===\n\n", index = 0;
                for (const item of thisThread.listRule) msg += `${index+=1}/ ${item}\n`;
                msg += "\n🔹 Following these rules helps maintain a positive community!\n🔹 এই নিয়মগুলো মেনে চললে একটি ভালো কমিউনিটি গড়ে উঠবে!";
                return api.sendMessage(msg, threadID, messageID);
            }
            else return api.sendMessage("🔹 No rules found for this group!\n🔹 এই গ্রুপের জন্য কোন নিয়ম পাওয়া যায়নি!", threadID, messageID);
        }
    }

    if (!dataJson.some(item => item.threadID == threadID)) dataJson.push(thisThread);
    return writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
}
