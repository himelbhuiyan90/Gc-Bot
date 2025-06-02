module.exports.config = {
    name: "code",
    version: "1.0.0",
    hasPermssion: 3,
    credits: "ManhG",
    description: "File management (read/write/create/edit/delete/rename)",
    commandCategory: "Admin System",
    usages: "[read/write/create/edit/delete/rename]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.run = async({ api, event, args }) => {
    const fs = global.nodemodule["fs-extra"];
    const path = require('path');
    
    if (event.senderID != 100033478361032) return api.sendMessage(`[❗] Donate → Mbbank/Momo: 0396049649. Thank you for your support ❤️`, event.threadID, event.messageID);
    
    if (args.length == 0) return api.sendMessage("Syntax error", event.threadID);

    const filePath = path.join(__dirname, args[1] ? `${args[1]}.js` : '');

    switch(args[0]) {
        case "edit":
            const newCode = event.body.slice(8 + args[1].length + args[0].length);
            fs.writeFile(filePath, newCode, "utf-8", (err) => {
                if (err) return api.sendMessage(`Error applying new code to "${args[1]}.js"`, event.threadID);
                api.sendMessage(`Successfully updated code for "${args[1]}.js"`, event.threadID);
            });
            break;

        case "read":
        case "-r":
            fs.readFile(filePath, "utf-8", (err, data) => {
                if (err) return api.sendMessage(`Error reading command "${args[1]}.js"`, event.threadID);
                api.sendMessage(data, event.threadID);
            });
            break;

        case "create":
            if (!args[1]) return api.sendMessage("Please specify a module name", event.threadID);
            if (fs.existsSync(filePath)) {
                return api.sendMessage(`"${args[1]}.js" already exists`, event.threadID);
            }
            fs.copySync(path.join(__dirname, "example.js"), filePath);
            api.sendMessage(`Successfully created "${args[1]}.js"`, event.threadID);
            break;

        case "delete":
            fs.unlink(filePath, (err) => {
                if (err) return api.sendMessage(`Error deleting "${args[1]}.js"`, event.threadID);
                api.sendMessage(`Successfully deleted "${args[1]}.js"`, event.threadID);
            });
            break;

        case "rename":
            const newFilePath = path.join(__dirname, `${args[2]}.js`);
            fs.rename(filePath, newFilePath, (err) => {
                if (err) return api.sendMessage(`Error renaming file`, event.threadID);
                api.sendMessage(`Successfully renamed "${args[1]}.js" to "${args[2]}.js"`, event.threadID);
            });
            break;

        default:
            api.sendMessage("Invalid command", event.threadID);
    }
};
