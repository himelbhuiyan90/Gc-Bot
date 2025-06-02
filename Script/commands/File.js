module.exports.config = {
    name: "file",
    version: "1.0.1",
    hasPermssion: 3,
    credits: "JRT fix by Jukie~",
    description: "Delete files or folders in the commands directory",
    commandCategory: "Admin bot system",
    usages: "Use 'file help' to see usage",
    cooldowns: 5
};

module.exports.handleReply = ({ api, event, args, handleReply }) => {
    if(event.senderID != handleReply.author) return; 
    const fs = require("fs-extra");
    var arrnum = event.body.split(" ");
    var msg = "";
    var nums = arrnum.map(n => parseInt(n));

    for(let num of nums) {
        var target = handleReply.files[num-1];
        var fileOrdir = fs.statSync(__dirname+'/'+target);
        if(fileOrdir.isDirectory() == true) {
            var typef = "[Folder🗂️]";
            fs.rmdirSync(__dirname+'/'+target, {recursive: true});
        }
        else if(fileOrdir.isFile() == true) {
            var typef = "[File📄]";
            fs.unlinkSync(__dirname+"/"+target);
        }
        msg += typef+' '+handleReply.files[num-1]+"\n";
    }
    api.sendMessage("✅ Successfully deleted the following files in commands directory:\n\n"+msg, event.threadID, event.messageID);
}

module.exports.run = async function({ api, event, args, Threads }) {
    if (event.senderID != 100033478361032) return api.sendMessage(`[❗] Donate → Mbbank/Momo: 0396049649. JRT thanks you ❤️`, event.threadID, event.messageID)
    const fs = require("fs-extra");
    var files = fs.readdirSync(__dirname+"/") || [];
    var msg = "", i = 1;
    
    if(args[0] == 'help') {
        var msg = `
Command usage:
• Key: file <text> or <letter>
• Effect: Filter files to delete with specified starting characters
• Example: file help or file h
• Key: empty
• Effect: List all files in commands directory
• Example: file
• Key: help
• Effect: Show command usage
• Example: file help`;
        
        return api.sendMessage(msg, event.threadID, event.messageID);
    }
    else if(args[0] == "start" && args[1]) {
        var word = args.slice(1).join(" ");
        var files = files.filter(file => file.startsWith(word));
        
        if(files.length == 0) return api.sendMessage(`❌ No files found starting with: ${word}`, event.threadID, event.messageID);
        var key = `✅ Found ${files.length} files starting with: ${word}`;
    }
    // Filter by file extension
    else if(args[0] == "ext" && args[1]) {
        var ext = args[1];
        var files = files.filter(file => file.endsWith(ext));
        
        if(files.length == 0) return api.sendMessage(`❌ No files found with extension: ${ext}`, event.threadID, event.messageID);
        var key = `✅ Found ${files.length} files with extension: ${ext}`;
    }
    // List all files
    else if (!args[0]) {
        if(files.length == 0) return api.sendMessage("❌ Your commands directory is empty", event.threadID, event.messageID);
        var key = "✅ All files in commands directory:";
    }
    // Filter files containing text
    else {
        var word = args.slice(0).join(" ");
        var files = files.filter(file => file.includes(word));
        if(files.length == 0) return api.sendMessage(`❌ No files found containing: ${word}`, event.threadID, event.messageID);
        var key = `✅ Found ${files.length} files containing: ${word}`;
    }
    
    files.forEach(file => {
        var fileOrdir = fs.statSync(__dirname+'/'+file);
        if(fileOrdir.isDirectory() == true) var typef = "[Folder🗂️]";
        if(fileOrdir.isFile() == true) var typef = "[File📄]";
        msg += (i++)+'. '+typef+' '+file+'\n';
    });
    
    api.sendMessage(`✅ Reply with numbers to delete corresponding files (multiple numbers separated by spaces allowed).\n${key}\n\n`+msg, event.threadID, (e, info) => global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        files
    }))
}
